# Telegram Command Edge-Case Audit - 2026-05-13

This audit drives edge conditions through the real Telegram gateway middleware in `SPARK_BOT_TEST_MODE=1`. It uses synthetic private-chat updates, isolated state, fake Telegram delivery, stubbed Spawner HTTP calls, missing Builder/Spark CLI paths, and explicit access profiles. The goal is to see what Telegram says when users hit awkward states, not to validate live service health.

Composition lens from `spark-telegram-composition`: a good edge reply should say what happened, whether it is blocked/bad/neutral, what matters now, and one useful next move.

## Summary

- Edge cases exercised: 38
- Average edge-case usability score: 4.87 / 5
- Score spread: 33 excellent, 5 good, 0 okay, 0 rough, 0 poor
- Silent/no-reply cases: none
- Needs polish: none

## Findings

1. No edge case went silent.
2. All edge replies are at least good in the safe harness.
3. Permission and access gates are generally understandable; they preserve private-by-default posture and point to `/access` or `/myid`.
4. Missing-argument commands are mostly readable, but older one-line usage replies are still the main rough edge.
5. Builder/Spawner-offline paths are honest about blocked service state, which is better than pretending work started.

## Edge-Case Matrix

| Category | Condition | Input | Role / access | Score | First reply | Notes | Recommendation |
| --- | --- | --- | --- | ---: | --- | --- | --- |
Permission | User is not in the private allowlist. | `/status` | `stranger / default` | 4 (good) | This Spark bot is private right now. Send /myid to the operator so they can add you to ALLOWED_TELEGRAM_IDS. | First line is too dense to scan as a headline. | Keep this edge response; it is understandable in the safe harness.
Permission | Allowed user tries an admin-only diagnostic command. | `/diagnose` | `allowed / default` | 5 (excellent) | Admin only. Add your Telegram ID to ADMIN_TELEGRAM_IDS first. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Permission | Allowed user tries an admin-only mission surface. | `/board` | `allowed / default` | 5 (excellent) | Admin only. Add your Telegram ID to ADMIN_TELEGRAM_IDS first. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Unknown command | Admin sends a slash command that is not registered. | `/does_not_exist` | `admin / default` | 5 (excellent) | ❔ Unknown command: /does_not_exist.<br><br>Try<br>• /status<br>• /diagnose<br>• /run <goal><br><br>For the current command list, send /start. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Access gate | Mission board requested while chat is at Access level 1. | `/board` | `admin / L1` | 5 (excellent) | ⚠️ Builder access is blocked.<br><br>Why<br>• This needs Access level 2 or higher.<br>• This chat is at Access level 1.<br><br>Next move<br>• Say "change my access level to 2" or send `/access 2` when you want Spark to build t [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Access gate | Mission start requested while chat is at Access level 1. | `/run audit Telegram command copy` | `admin / L1` | 5 (excellent) | ⚠️ Builder access is blocked.<br><br>Why<br>• This needs Access level 2 or higher.<br>• This chat is at Access level 1.<br><br>Next move<br>• Say "change my access level to 2" or send `/access 2` when you want Spark to build t [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Access gate | Local workspace inventory requested without local workspace access. | `/workspaces` | `admin / L3` | 5 (excellent) | ⚠️ Local workspace access is blocked.<br><br>Why<br>• This operating system request needs Access level 4 for sandboxed local work, or Access level 5 for whole-computer work.<br>• This chat is at Access level 3.<br><br>Next [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Access gate | Compatibility alias hits the same local workspace access gate. | `/workspace` | `admin / L3` | 5 (excellent) | ↪️ /workspace maps to /workspaces.<br><br>⚠️ Local workspace access is blocked.<br><br>Why<br>• This operating system request needs Access level 4 for sandboxed local work, or Access level 5 for whole-computer work.<br>• Th [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Access command | Admin asks for an invalid access level. | `/access banana` | `admin / default` | 4 (good) | Choose an access level: /access 1 chat/memory/diagnostics, /access 2 requested builds, /access 3 public research plus builds, /access 4 sandboxed local projects, or /access 5 whole-computer operator mode. | First line is too dense to scan as a headline. | Keep this edge response; it is understandable in the safe harness.
Access command | Hosted Spark Live blocks local workspace access. | `/access 4` | `admin / default` | 5 (excellent) | Access level 4 is locked for hosted Spark Live right now.<br><br>Use /access 3 for the default hosted experience: chat, memory, public research, and requested Spawner builds.<br>Only enable local or whole-computer [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Access command | Level 5 request requires explicit confirmation. | `/access 5` | `admin / default` | 5 (excellent) | Access level 5 lets Spark use this trusted local machine for operator work.<br><br>I will still ask before deleting important files, exposing secrets, publishing, or deploying.<br>Tap Confirm only if you want whole [truncated] | Includes a Telegram keyboard for confirmation or choice. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Memory save command has no body. | `/remember` | `allowed / default` | 5 (excellent) | 🧠 Save a memory<br><br>Use: /remember <something important><br>Example: /remember I prefer concise mission updates. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Memory recall command has no topic. | `/recall` | `allowed / default` | 5 (excellent) | 🔎 Recall memory<br><br>Use: /recall <topic><br>Example: /recall mission update preferences | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Forget command has no target. | `/forget` | `allowed / default` | 5 (excellent) | 🧹 Forget memory<br><br>Use: /forget <thing to forget><br>Example: /forget my old project nickname<br><br>If Builder memory is offline, try again after /diagnose shows memory is healthy. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Mission command has no action or mission id. | `/mission` | `admin / default` | 5 (excellent) | 🧭 Control a mission<br><br>Use<br>• /mission status <missionId><br>• /mission pause <missionId><br>• /mission resume <missionId><br>• /mission kill <missionId><br><br>Example<br>• /mission status spark-1776768300668<br><br>Tip<br>• /board s [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Malformed argument | Mission command uses placeholder text instead of a real id. | `/mission status <mission-id>` | `admin / default` | 5 (excellent) | Use the real mission ID from /run or /creator, for example: /mission status spark-1776768300668 | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Malformed argument | Mission command uses an id that does not match Spark mission formats. | `/mission status nonsense` | `admin / default` | 4 (good) | Use a real mission ID from /board, for example: /mission status spark-1776768300668 or /mission status mission-creator-1776768300668 | First line is too dense to scan as a headline. | Keep this edge response; it is understandable in the safe harness.
Malformed argument | Model command has unrecognized role/provider tokens. | `/model banana` | `admin / default` | 5 (excellent) | Use /model like this:<br>/model agent zai<br>/model agent codex<br>/model agent claude<br>/model mission codex<br>/model mission claude<br><br>Agent means chat + runtime + memory. Mission means Spawner builds. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Malformed argument | Mission update verbosity is not recognized. | `/updates loud` | `admin / default` | 4 (good) | Choose one of: /updates minimal, /updates normal, /updates verbose, or /updates links kanban\|canvas\|both\|none. | First line is too dense to scan as a headline. | Keep this edge response; it is understandable in the safe harness.
Malformed argument | Mission link preference is not recognized. | `/updates links maybe` | `admin / default` | 4 (good) | Choose one of: /updates links none, /updates links kanban, /updates links canvas, or /updates links both. | First line is too dense to scan as a headline. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Schedule command omits the required quoted cron. | `/schedule */5 * * * * mission check launch health` | `admin / default` | 5 (excellent) | 🗓️ Schedule recurring work<br><br>Use<br>• /schedule "<cron>" mission <goal><br>• /schedule "<cron>" loop <chipKey> [rounds]<br><br>Example<br>• /schedule "*/5 * * * *" loop startup-yc 2<br><br>Manage<br>• /schedules lists or deletes scheduled work. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Schedule command has a mission action but no goal. | `/schedule "*/5 * * * *" mission` | `admin / default` | 5 (excellent) | ⚠️ Missing mission goal.<br><br>Example<br>• /schedule "*/5 * * * *" mission check launch health | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Schedule deletion is missing the schedule id. | `/schedules delete` | `admin / default` | 5 (excellent) | 🗓️ Delete a schedule<br><br>Use<br>• /schedules delete <id><br><br>Find IDs<br>• /schedules | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Creator mission plan does not include a usable brief. | `/creator plan public` | `admin / default` | 5 (excellent) | ⚠️ Add a creator mission brief after the mode.<br><br>Use<br>• /creator plan [private\|github\|swarm] [risk low\|medium\|high] <brief><br>• /creator run <mission-creator-id><br>• /creator status <mission-creator-id><br>• /creat [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Chip create command omits the chip description. | `/chip create` | `admin / default` | 5 (excellent) | 🌱 Create a domain chip<br><br>Use<br>• /chip create <natural language description><br><br>Example<br>• /chip create a QA operator that catches launch-blocking UI regressions<br><br>Next move<br>• Use /creator for planned creator mi [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Missing argument | Loop command omits chip key. | `/loop` | `admin / default` | 5 (excellent) | 🌀 Run a chip autoloop<br><br>Use<br>• /loop <chip_key> [rounds]<br><br>Example<br>• /loop startup-yc 3<br><br>What happens<br>• Spark asks the chip for candidates, evaluates them, and posts a summary. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Malformed argument | Recursive command has an incomplete action. | `/recursive start` | `admin / default` | 5 (excellent) | 🌀 Start a recursive loop<br><br>Use<br>• /recursive start <targetKey> [rounds <n>]<br><br>Example<br>• /recursive start startup-yc rounds 3<br><br>Find targets<br>• /recursive sessions<br>• /recursive paths | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Route diagnostics | Route probe receives an unknown route key. | `/probe nonsense` | `admin / default` | 5 (excellent) | 🧪 Route probe<br><br>Use<br>• /probe <route><br>• /probe core<br>• /probe all<br><br>Routes<br>• builder<br>• spawner<br>• memory<br>• researcher<br>• swarm<br>• browser<br>• local_work | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Route diagnostics | Batch route probe runs while Builder bridge is unavailable. | `/probe core` | `admin / default` | 5 (excellent) | 🧪 Running 5 route probes. This can take a little while... | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Route diagnostics | Alias receives an unknown route key. | `/route_probe nonsense` | `admin / default` | 5 (excellent) | ↪️ /route_probe maps to /probe.<br><br>🧪 Route probe<br><br>Use<br>• /probe <route><br>• /probe core<br>• /probe all<br><br>Routes<br>• builder<br>• spawner<br>• memory<br>• researcher<br>• swarm<br>• browser<br>• local_work | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Route diagnostics | Natural route probe has no message. | `/nl_route` | `admin / default` | 5 (excellent) | 🧭 Natural route probe<br><br>Use<br>• /nl_route <message><br><br>What it does<br>• Shows the diagnostic route decision only.<br>• Does not execute the route. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Route diagnostics | Natural route probe inspects a mission-looking message without executing it. | `/nl_route build a tiny launch dashboard` | `admin / default` | 5 (excellent) | Natural route probe<br>Route: spawner.build<br>Owner: spawner-ui<br>Confidence: explicit<br>Context: latest_message<br>Needs confirmation: no<br>Signals: build_intent<br>No command was executed. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Route diagnostics | Natural route alias has no message. | `/natural_route` | `admin / default` | 5 (excellent) | ↪️ /natural_route maps to /nl_route.<br><br>🧭 Natural route probe<br><br>Use<br>• /nl_route <message><br><br>What it does<br>• Shows the diagnostic route decision only.<br>• Does not execute the route. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Builder offline | Black-box command asks for a request id while Builder is unavailable. | `/blackbox request-123` | `admin / default` | 5 (excellent) | ↪️ /blackbox maps to /black_box.<br><br>⚠️ Spark could not reach the Builder memory path right now.<br><br>Why: Builder bridge command did not finish cleanly.<br><br>Next move<br>• Check now: Run /diagnose so Spark can check B [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Builder offline | Operating context asks for memory-in-play while Builder is unavailable. | `/context launch docs` | `admin / default` | 5 (excellent) | ⚠️ Spark could not reach the Builder memory path right now.<br><br>Why: Builder bridge command did not finish cleanly.<br><br>Next move<br>• Check now: Run /diagnose so Spark can check Builder, memory, and the selected m [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Builder offline | Memory save has content but Builder cannot confirm durable memory. | `/remember I prefer concise launch updates` | `allowed / default` | 5 (excellent) | ⚠️ Memory is degraded/offline right now.<br><br>I could not confirm the save, so I will not claim it was remembered.<br><br>Next move: try again later, or run /diagnose only if you want a health check. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Builder offline | Voice status command runs while Builder voice route is unavailable. | `/voice` | `admin / default` | 5 (excellent) | 🎙️ Voice setup is not ready yet.<br><br>What happened<br>• Telegram is running, but Builder did not return voice status.<br><br>Next move<br>• Run /diagnose, then try /voice again. | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.
Spawner offline | Mission start reaches Spawner route but local service is stubbed as unavailable. | `/run audit Telegram command copy` | `admin / L2` | 5 (excellent) | ⚠️ Spark hit an internal error before it could answer cleanly.<br><br>Reason: Spawner mission start failed<br><br>Check now: Run /diagnose so Spark can narrow this down from the live stack.<br><br>Operator fix: spark logs s [truncated] | Readable and condition-appropriate in the safe harness. | Keep this edge response; it is understandable in the safe harness.

## Category Notes

### Access command

Average: 4.67 / 5.

No cases in this category scored below good.

### Access gate

Average: 5.00 / 5.

No cases in this category scored below good.

### Builder offline

Average: 5.00 / 5.

No cases in this category scored below good.

### Malformed argument

Average: 4.50 / 5.

No cases in this category scored below good.

### Missing argument

Average: 5.00 / 5.

No cases in this category scored below good.

### Permission

Average: 4.67 / 5.

No cases in this category scored below good.

### Route diagnostics

Average: 5.00 / 5.

No cases in this category scored below good.

### Spawner offline

Average: 5.00 / 5.

No cases in this category scored below good.

### Unknown command

Average: 5.00 / 5.

No cases in this category scored below good.

## Captured Responses

### private-gate-stranger-status

Input: `/status`
Condition: User is not in the private allowlist.
Expected: Private-bot denial with /myid next step.
Score: 4 (good).

Reply 1:

```text
This Spark bot is private right now. Send /myid to the operator so they can add you to ALLOWED_TELEGRAM_IDS.
```

### allowed-not-admin-diagnose

Input: `/diagnose`
Condition: Allowed user tries an admin-only diagnostic command.
Expected: Admin-only denial.
Score: 5 (excellent).

Reply 1:

```text
Admin only. Add your Telegram ID to ADMIN_TELEGRAM_IDS first.
```

### allowed-not-admin-board

Input: `/board`
Condition: Allowed user tries an admin-only mission surface.
Expected: Admin-only denial.
Score: 5 (excellent).

Reply 1:

```text
Admin only. Add your Telegram ID to ADMIN_TELEGRAM_IDS first.
```

### unknown-slash-command

Input: `/does_not_exist`
Condition: Admin sends a slash command that is not registered.
Expected: A helpful unknown-command reply.
Score: 5 (excellent).

Reply 1:

```text
❔ Unknown command: /does_not_exist.

Try
• /status
• /diagnose
• /run <goal>

For the current command list, send /start.
```

### board-access-level-1

Input: `/board`
Condition: Mission board requested while chat is at Access level 1.
Expected: Builder access denial with /access 2 next step.
Score: 5 (excellent).

Reply 1:

```text
⚠️ Builder access is blocked.

Why
• This needs Access level 2 or higher.
• This chat is at Access level 1.

Next move
• Say "change my access level to 2" or send `/access 2` when you want Spark to build through Spawner after you ask.
```

### run-access-level-1

Input: `/run audit Telegram command copy`
Condition: Mission start requested while chat is at Access level 1.
Expected: Builder access denial with /access 2 next step.
Score: 5 (excellent).

Reply 1:

```text
⚠️ Builder access is blocked.

Why
• This needs Access level 2 or higher.
• This chat is at Access level 1.

Next move
• Say "change my access level to 2" or send `/access 2` when you want Spark to build through Spawner after you ask.
```

### workspace-access-level-3

Input: `/workspaces`
Condition: Local workspace inventory requested without local workspace access.
Expected: Local workspace denial with /access 4 next step.
Score: 5 (excellent).

Reply 1:

```text
⚠️ Local workspace access is blocked.

Why
• This operating system request needs Access level 4 for sandboxed local work, or Access level 5 for whole-computer work.
• This chat is at Access level 3.

Next move
• Say "change my access level to 4" or send `/access 4` for Spark sandbox workspaces.
• Use `/access 5` only when you really want whole-computer operator mode.
```

### workspace-alias-access-level-3

Input: `/workspace`
Condition: Compatibility alias hits the same local workspace access gate.
Expected: Alias banner plus local workspace denial.
Score: 5 (excellent).

Reply 1:

```text
↪️ /workspace maps to /workspaces.

⚠️ Local workspace access is blocked.

Why
• This operating system request needs Access level 4 for sandboxed local work, or Access level 5 for whole-computer work.
• This chat is at Access level 3.

Next move
• Say "change my access level to 4" or send `/access 4` for Spark sandbox workspaces.
• Use `/access 5` only when you really want whole-computer operator mode.
```

### access-invalid-level

Input: `/access banana`
Condition: Admin asks for an invalid access level.
Expected: Access-level chooser guidance.
Score: 4 (good).

Reply 1:

```text
Choose an access level: /access 1 chat/memory/diagnostics, /access 2 requested builds, /access 3 public research plus builds, /access 4 sandboxed local projects, or /access 5 whole-computer operator mode.
```

### access-level-4-hosted-lock

Input: `/access 4`
Condition: Hosted Spark Live blocks local workspace access.
Expected: Hosted-runtime lock explanation.
Score: 5 (excellent).

Reply 1:

```text
Access level 4 is locked for hosted Spark Live right now.

Use /access 3 for the default hosted experience: chat, memory, public research, and requested Spawner builds.
Only enable local or whole-computer access on a hosted/VPS install after operator approval guardrails are ready.

Operator override: set SPARK_ALLOW_HOSTED_FULL_ACCESS=1 and restart Spark Live.
```

### access-level-5-confirmation

Input: `/access 5`
Condition: Level 5 request requires explicit confirmation.
Expected: Level 5 confirmation prompt with keyboard.
Score: 5 (excellent).

Reply 1 (with keyboard):

```text
Access level 5 lets Spark use this trusted local machine for operator work.

I will still ask before deleting important files, exposing secrets, publishing, or deploying.
Tap Confirm only if you want whole-computer operator mode for this chat.
```

### remember-missing-text

Input: `/remember`
Condition: Memory save command has no body.
Expected: Usage card for saving memory.
Score: 5 (excellent).

Reply 1:

```text
🧠 Save a memory

Use: /remember <something important>
Example: /remember I prefer concise mission updates.
```

### recall-missing-topic

Input: `/recall`
Condition: Memory recall command has no topic.
Expected: Usage card for recalling memory.
Score: 5 (excellent).

Reply 1:

```text
🔎 Recall memory

Use: /recall <topic>
Example: /recall mission update preferences
```

### forget-missing-target

Input: `/forget`
Condition: Forget command has no target.
Expected: Usage card for forgetting memory.
Score: 5 (excellent).

Reply 1:

```text
🧹 Forget memory

Use: /forget <thing to forget>
Example: /forget my old project nickname

If Builder memory is offline, try again after /diagnose shows memory is healthy.
```

### mission-missing-args

Input: `/mission`
Condition: Mission command has no action or mission id.
Expected: Mission usage card.
Score: 5 (excellent).

Reply 1:

```text
🧭 Control a mission

Use
• /mission status <missionId>
• /mission pause <missionId>
• /mission resume <missionId>
• /mission kill <missionId>

Example
• /mission status spark-1776768300668

Tip
• /board shows recent mission IDs.
```

### mission-placeholder-id

Input: `/mission status <mission-id>`
Condition: Mission command uses placeholder text instead of a real id.
Expected: Real mission id guidance.
Score: 5 (excellent).

Reply 1:

```text
Use the real mission ID from /run or /creator, for example: /mission status spark-1776768300668
```

### mission-invalid-id

Input: `/mission status nonsense`
Condition: Mission command uses an id that does not match Spark mission formats.
Expected: Real mission id guidance with examples.
Score: 4 (good).

Reply 1:

```text
Use a real mission ID from /board, for example: /mission status spark-1776768300668 or /mission status mission-creator-1776768300668
```

### model-invalid-provider

Input: `/model banana`
Condition: Model command has unrecognized role/provider tokens.
Expected: Model usage examples.
Score: 5 (excellent).

Reply 1:

```text
Use /model like this:
/model agent zai
/model agent codex
/model agent claude
/model mission codex
/model mission claude

Agent means chat + runtime + memory. Mission means Spawner builds.
```

### updates-invalid-verbosity

Input: `/updates loud`
Condition: Mission update verbosity is not recognized.
Expected: Updates usage guidance.
Score: 4 (good).

Reply 1:

```text
Choose one of: /updates minimal, /updates normal, /updates verbose, or /updates links kanban|canvas|both|none.
```

### updates-invalid-link-mode

Input: `/updates links maybe`
Condition: Mission link preference is not recognized.
Expected: Link preference usage guidance.
Score: 4 (good).

Reply 1:

```text
Choose one of: /updates links none, /updates links kanban, /updates links canvas, or /updates links both.
```

### schedule-missing-quotes

Input: `/schedule */5 * * * * mission check launch health`
Condition: Schedule command omits the required quoted cron.
Expected: Schedule usage card.
Score: 5 (excellent).

Reply 1:

```text
🗓️ Schedule recurring work

Use
• /schedule "<cron>" mission <goal>
• /schedule "<cron>" loop <chipKey> [rounds]

Example
• /schedule "*/5 * * * *" loop startup-yc 2

Manage
• /schedules lists or deletes scheduled work.
```

### schedule-missing-goal

Input: `/schedule "*/5 * * * *" mission`
Condition: Schedule command has a mission action but no goal.
Expected: Missing mission goal message.
Score: 5 (excellent).

Reply 1:

```text
⚠️ Missing mission goal.

Example
• /schedule "*/5 * * * *" mission check launch health
```

### schedules-delete-missing-id

Input: `/schedules delete`
Condition: Schedule deletion is missing the schedule id.
Expected: Delete usage guidance.
Score: 5 (excellent).

Reply 1:

```text
🗓️ Delete a schedule

Use
• /schedules delete <id>

Find IDs
• /schedules
```

### creator-plan-missing-brief

Input: `/creator plan public`
Condition: Creator mission plan does not include a usable brief.
Expected: Creator usage guidance.
Score: 5 (excellent).

Reply 1:

```text
⚠️ Add a creator mission brief after the mode.

Use
• /creator plan [private|github|swarm] [risk low|medium|high] <brief>
• /creator run <mission-creator-id>
• /creator status <mission-creator-id>
• /creator validate <mission-creator-id> [maxCommands]

Example
• /creator plan private risk medium create a Startup YC benchmarked specialization path
```

### chip-create-missing-brief

Input: `/chip create`
Condition: Chip create command omits the chip description.
Expected: Chip usage card.
Score: 5 (excellent).

Reply 1:

```text
🌱 Create a domain chip

Use
• /chip create <natural language description>

Example
• /chip create a QA operator that catches launch-blocking UI regressions

Next move
• Use /creator for planned creator missions, or /recursive for recursive loops.
```

### loop-missing-chip

Input: `/loop`
Condition: Loop command omits chip key.
Expected: Loop usage card.
Score: 5 (excellent).

Reply 1:

```text
🌀 Run a chip autoloop

Use
• /loop <chip_key> [rounds]

Example
• /loop startup-yc 3

What happens
• Spark asks the chip for candidates, evaluates them, and posts a summary.
```

### recursive-unknown-shape

Input: `/recursive start`
Condition: Recursive command has an incomplete action.
Expected: Recursive help or start usage.
Score: 5 (excellent).

Reply 1:

```text
🌀 Start a recursive loop

Use
• /recursive start <targetKey> [rounds <n>]

Example
• /recursive start startup-yc rounds 3

Find targets
• /recursive sessions
• /recursive paths
```

### probe-unknown-route

Input: `/probe nonsense`
Condition: Route probe receives an unknown route key.
Expected: Route probe help instead of an exception.
Score: 5 (excellent).

Reply 1:

```text
🧪 Route probe

Use
• /probe <route>
• /probe core
• /probe all

Routes
• builder
• spawner
• memory
• researcher
• swarm
• browser
• local_work
```

### probe-core-builder-offline

Input: `/probe core`
Condition: Batch route probe runs while Builder bridge is unavailable.
Expected: Progress message plus compact route-probe result.
Score: 5 (excellent).

Reply 1:

```text
🧪 Running 5 route probes. This can take a little while...
```

Reply 2:

```text
Route probes
• Memory: failed - Builder bridge unavailable
• Researcher: failed - Builder bridge unavailable
• Swarm: failed - Builder bridge unavailable
• Spawner: failed - Builder bridge unavailable
• Builder: failed - Builder bridge unavailable

Run /aoc to see the refreshed Agent Operating Context.
```

### route-probe-alias-unknown-route

Input: `/route_probe nonsense`
Condition: Alias receives an unknown route key.
Expected: Alias banner plus route probe help.
Score: 5 (excellent).

Reply 1:

```text
↪️ /route_probe maps to /probe.

🧪 Route probe

Use
• /probe <route>
• /probe core
• /probe all

Routes
• builder
• spawner
• memory
• researcher
• swarm
• browser
• local_work
```

### natural-route-help

Input: `/nl_route`
Condition: Natural route probe has no message.
Expected: Natural route usage card.
Score: 5 (excellent).

Reply 1:

```text
🧭 Natural route probe

Use
• /nl_route <message>

What it does
• Shows the diagnostic route decision only.
• Does not execute the route.
```

### natural-route-build-message

Input: `/nl_route build a tiny launch dashboard`
Condition: Natural route probe inspects a mission-looking message without executing it.
Expected: Diagnostic route decision only.
Score: 5 (excellent).

Reply 1:

```text
Natural route probe
Route: spawner.build
Owner: spawner-ui
Confidence: explicit
Context: latest_message
Needs confirmation: no
Signals: build_intent
No command was executed.
```

### natural-route-alias-help

Input: `/natural_route`
Condition: Natural route alias has no message.
Expected: Alias banner plus natural route usage card.
Score: 5 (excellent).

Reply 1:

```text
↪️ /natural_route maps to /nl_route.

🧭 Natural route probe

Use
• /nl_route <message>

What it does
• Shows the diagnostic route decision only.
• Does not execute the route.
```

### blackbox-builder-offline

Input: `/blackbox request-123`
Condition: Black-box command asks for a request id while Builder is unavailable.
Expected: Alias banner plus Builder failure card.
Score: 5 (excellent).

Reply 1:

```text
↪️ /blackbox maps to /black_box.

⚠️ Spark could not reach the Builder memory path right now.

Why: Builder bridge command did not finish cleanly.

Next move
• Check now: Run /diagnose so Spark can check Builder, memory, and the selected memory model.
• Operator fix: spark fix telegram, then spark verify --onboarding.

Still stuck: spark doctor llm "Spark builder failure: builder_or_memory" --save-report --upstream-report
```

### context-with-memory-query-offline

Input: `/context launch docs`
Condition: Operating context asks for memory-in-play while Builder is unavailable.
Expected: Builder failure card with next diagnostic move.
Score: 5 (excellent).

Reply 1:

```text
⚠️ Spark could not reach the Builder memory path right now.

Why: Builder bridge command did not finish cleanly.

Next move
• Check now: Run /diagnose so Spark can check Builder, memory, and the selected memory model.
• Operator fix: spark fix telegram, then spark verify --onboarding.

Still stuck: spark doctor llm "Spark builder failure: builder_or_memory" --save-report --upstream-report
```

### remember-builder-offline

Input: `/remember I prefer concise launch updates`
Condition: Memory save has content but Builder cannot confirm durable memory.
Expected: Honest memory failure or local-buffer notice.
Score: 5 (excellent).

Reply 1:

```text
⚠️ Memory is degraded/offline right now.

I could not confirm the save, so I will not claim it was remembered.

Next move: try again later, or run /diagnose only if you want a health check.
```

### voice-builder-offline

Input: `/voice`
Condition: Voice status command runs while Builder voice route is unavailable.
Expected: Voice setup/status fallback.
Score: 5 (excellent).

Reply 1:

```text
🎙️ Voice setup is not ready yet.

What happened
• Telegram is running, but Builder did not return voice status.

Next move
• Run /diagnose, then try /voice again.
```

### run-spawner-stubbed-failure

Input: `/run audit Telegram command copy`
Condition: Mission start reaches Spawner route but local service is stubbed as unavailable.
Expected: Mission start failure or blocked service message.
Score: 5 (excellent).

Reply 1:

```text
⚠️ Spark hit an internal error before it could answer cleanly.

Reason: Spawner mission start failed

Check now: Run /diagnose so Spark can narrow this down from the live stack.

Operator fix: spark logs spark-telegram-bot --lines 80.

Still stuck: spark doctor llm "Spark spawner failure: unknown" --save-report --upstream-report

That uses your configured LLM, redacts sensitive data, and creates a local upstream PR draft only if you review/share it.
```

## Next Checks

- Add any chosen fixes, then rerun `npm run audit:telegram-edge-cases`.
- Follow with `npm run audit:telegram-composition` to make sure broad command composition did not regress.
- Run a live private-chat smoke for success paths that the safe harness intentionally stubs, especially `/run`, `/board`, `/creator`, `/chip create`, `/schedule`, and Builder-backed memory commands.
