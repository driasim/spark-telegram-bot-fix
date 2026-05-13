# Telegram Live Test Runbook: Mac + Peekaboo

Date: 2026-05-13

This runbook is for true inbound Telegram testing of `spark-telegram-bot` using a Mac as the human Telegram sender. The Windows Spark runtime can keep owning the tester bot process; the Mac only drives Telegram Desktop or Telegram Web through Peekaboo.

## Current Prep State

- Tester profile verified on Windows: `testerthebester`
- Telegram bot identity: `@testerthebester_bot`
- Runtime relay verified: `testerthebester@8788`
- Ingress mode: polling
- Webhook ingress: disabled for this launch build
- Runtime freshness after sync: in sync with `C:\Users\USER\Desktop\spark-telegram-bot`

## What Codex Can And Cannot Do Directly

Codex can:

- Health-check the tester bot token without printing secrets.
- Build and sync this checkout into the local Spark runtime.
- Restart only `spark-telegram-bot --profile testerthebester`.
- Send outbound prompt cards from the bot to a known chat.
- Run safe handler harnesses that use Telegram-shaped updates without touching live polling.
- Inspect local relay health and generated audit docs.

Codex cannot safely create a real inbound Telegram user message through the Bot API while the live bot owns polling. Calling `getUpdates` from a side script would compete with the active bot receiver. For true inbound coverage, use Telegram Desktop/Web from a real user session on the Mac and let the active bot receive the messages normally.

## Mac Setup

Install Peekaboo on the Mac:

```bash
brew install steipete/tap/peekaboo
peekaboo --version
peekaboo permissions status
```

Grant Screen Recording and Accessibility if prompted:

```bash
peekaboo permissions grant
```

Open Telegram Desktop if it is already logged in. If not, use a browser session at `https://web.telegram.org/` and log in manually before running automation.

Quick UI smoke:

```bash
peekaboo list apps
peekaboo see --app Telegram --json
```

If using a browser instead of Telegram Desktop, replace `Telegram` with the browser app name in the Peekaboo commands.

## Repo Sync Options

If the Mac only drives Telegram UI, it does not need to run the bot repo. The bot can stay running on Windows because Telegram delivery is cloud-mediated.

If the Mac should also have the latest repo docs and prompt files:

```bash
git clone <repo-url> spark-telegram-bot
cd spark-telegram-bot
git checkout release/pr55-curation-20260512
git pull --ff-only
npm ci
npm run build
npm test
```

If the Mac is using an existing checkout:

```bash
cd spark-telegram-bot
git fetch
git checkout release/pr55-curation-20260512
git pull --ff-only
npm ci
npm run build
npm test
```

## Windows Runtime Prep Before Mac Sends Messages

Run these from `C:\Users\USER\Desktop\spark-telegram-bot`:

```powershell
npm run build:sync
spark restart spark-telegram-bot --profile testerthebester
npx ts-node ops/runtimeFreshnessCheck.ts
npm run health:runtime -- --profile testerthebester
```

Expected:

- Runtime freshness: in sync
- Telegram health: OK
- Bot token: accepted `(@testerthebester_bot)`
- Relay runtime: OK `testerthebester@8788`

## Focused Live Inbound Suite

Send these messages to `@testerthebester_bot` one at a time from Telegram on the Mac. Capture the full visible bot reply after each message.

### Smoke

```text
/status
```

Expected: compact system status, admin/access marker, no raw JSON.

```text
/diagnose
```

Expected: Telegram relay, Spawner/Builder/provider health, timing, readable next action if degraded.

```text
/board
```

Expected: board buckets and mission state without stale running missions or internal relay noise.

### Guardrails And Context

```text
/access status
```

Expected: current access level and allowed capabilities.

```text
can you help me think through whether we should build a mission control dashboard before we touch the canvas?
```

Expected: planning conversation only. Must not create a mission.

```text
that sounds good
```

Expected: acknowledges context without launching a mission from low-information agreement.

```text
what were we going to build again?
```

Expected: recalls the recent planning thread, not an older stale project.

### Access Follow-Up

```text
Change my access level to three please
```

Expected: sets this chat to Level 3 without dumping the full access help blob.

```text
Change it to 4
```

Expected: uses the immediate access context and sets this chat to Level 4.

### Numbered-List Follow-Up

```text
Give me three build ideas for a memory dashboard
```

Expected: gives three ideas and does not start a build.

```text
Let's do the second one
```

Expected: continues with the second memory-dashboard idea. Must not change access level to 2.

### Route Firewall

```text
how can we make sure access level 4 creates the right setup for access level to be really 4?
```

Expected: explains the permission-versus-runner-capability model. Must not change access level or show a generic command menu.

## Peekaboo Agent Path

Use the companion prompt:

```bash
peekaboo agent "$(cat docs/TELEGRAM_LIVE_PEEKABOO_AGENT_PROMPT_2026-05-13.md)"
```

If the agent struggles with Telegram targeting, use lower-level Peekaboo primitives:

```bash
peekaboo see --app Telegram --json
peekaboo click --app Telegram --label "@testerthebester_bot"
peekaboo type --app Telegram "/status"
peekaboo press --app Telegram enter
```

Prefer element IDs from `peekaboo see` when available.

## Verdict Template

Paste results back into Codex with this shape:

```text
PROFILE testerthebester
RUN_DATE 2026-05-13

CASE smoke-001
PROMPT /status
REPLY:
<paste visible Spark reply>
COMPOSITION_SCORE 1-5:
ISSUE:

CASE smoke-002
PROMPT /diagnose
REPLY:
<paste visible Spark reply>
COMPOSITION_SCORE 1-5:
ISSUE:
```

Scoring:

- 5: readable, correctly routed, compact, useful next action.
- 4: correct and readable with minor composition polish needed.
- 3: understandable but too long, awkward, or missing the most useful next action.
- 2: routed or worded poorly enough to confuse an operator.
- 1: wrong behavior, silent/no reply, raw plumbing, or unsafe action.

Do not paste secrets, full raw logs, private user text, or BotFather tokens into the verdict.
