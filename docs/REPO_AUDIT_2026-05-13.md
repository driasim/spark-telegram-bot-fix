# Spark Telegram Bot Audit - 2026-05-13

This note records the May 13, 2026 audit of `spark-telegram-bot`: repo size, supported surfaces, stale code removed, and code paths operators should not use.

## Executive Verdict

- Canonical role: Telegram ingress and mission relay adapter for Spark. Builder owns memory, route confidence, and durable intelligence. Spawner UI owns execution.
- Supported launch mode: long polling only. Webhook mode, webhook env, local tunnels, and public webhook ingress are not part of this build.
- The normal build was already green. The stricter unused-code pass exposed stale helpers in large runtime files, and those were removed.
- The unused `@anthropic-ai/sdk` dependency was removed. Anthropic chat support still goes through the existing HTTP provider path in `src/llm.ts`.
- The tracked `ops/cloudflared` tunnel helper was removed because it contradicted the launch rule: no local tunnel requirement and no webhook setup path.
- The repo is small by file count but dense by runtime complexity. The main maintainability risk is concentrated in a few large files, not in total repository size.

## Repo Size

Measured at the start of the audit:

| Metric | Value |
| --- | ---: |
| Git-tracked files | 169 |
| Non-generated files from `rg --files` | 166 |
| Tracked TypeScript lines | 39,974 |
| Tracked Markdown lines | 978 |
| Workspace size excluding `.git` and `node_modules` | 10.0 MB |

Largest local directories/files at audit start:

| Surface | Size | Notes |
| --- | ---: | --- |
| `node_modules/` | 34.7 MB | Install artifact, ignored |
| `.git/` | 24.9 MB | Git history and local refs |
| `.spark-gateway-state.db-wal` | 5.0 MB | Local runtime state, ignored |
| `.spark-gateway-state.db` | 1.6 MB | Local runtime state, ignored |
| `src/` | 1.0 MB | Runtime source |
| `dist/` | 1.0 MB | Generated build output, ignored |
| `ops/` | 0.6 MB | Tracked harnesses plus ignored reports |
| `tests/` | 0.6 MB | Offline regression suite |

Largest source files at audit start:

| File | Lines | Why it matters |
| --- | ---: | --- |
| `src/index.ts` | 5,099 | Telegram ingress, command routing, and many adapter paths |
| `src/recursive.ts` | 2,644 | Workspace recursive loop rendering and bridging |
| `src/builderBridge.ts` | 2,401 | Builder CLI bridge and source-aware memory/context calls |
| `src/missionRelay.ts` | 1,974 | Spawner mission event delivery and Telegram formatting |
| `src/conversationIntent.ts` | 1,832 | Natural-language route classification |

## Current Best-Practice Baseline

The local launch posture matches the important Telegram/Telegraf constraints:

- Telegram `getUpdates` long polling cannot be used while an outgoing webhook is set, and offsets must move forward to avoid duplicate updates. Source: [Telegram Bot API](https://core.telegram.org/bots/api).
- Telegram webhook mode requires HTTPS and should use the `X-Telegram-Bot-Api-Secret-Token` path when reintroduced. Source: [Telegram Bot API](https://core.telegram.org/bots/api).
- Telegraf v4 supports default polling through `bot.launch()` and webhook launch options with `secretToken`; webhook configuration should be explicit rather than accidental. Source: [Telegraf docs](https://telegraf.js.org/interfaces/Telegraf.LaunchOptions.html).

## Removed In This Audit

- Deleted `ops/cloudflared/check.ps1` and `ops/cloudflared/config.example.yml`.
  - Reason: local tunnel setup is stale for launch v1 and can mislead operators into trying webhook mode.
- Archived and removed the standalone future-webhook roadmap document.
  - Reason: webhook work is not an active launch path, and keeping a roadmap document made it look more usable than it is.
  - Future webhook work should start from a fresh hosted-gateway design with secret-token validation, durable queueing, replay dedupe, and route-level tests.
- Archived and removed orphaned historical docs from the active repo.
  - Destination: `C:\Users\USER\Desktop\spark-historical-docs\docs\spark-telegram-bot`.
  - Archived tracked docs: `TELEGRAM_WEBHOOK_FUTURE.md`, `docs/ROUTE_CONFIDENCE_GATE_ADAPTER_V1.md`, and `docs/codex-handoffs/2026-05-05-spark-memory-launch-runtime-handoff.md`.
  - Archived local-only doc: `TOMORROW_HANDOFF.local.md`.
  - Reason: these are useful provenance, but not current launch instructions or runtime contracts.
- Removed unused runtime helpers/imports found by `npx tsc --noEmit --noUnusedLocals --noUnusedParameters`.
  - Main affected files: `src/index.ts`, `src/recursive.ts`, `src/spawner.ts`, `src/missionRelay.ts`.
  - Reason: helpers were not reachable from the compiled runtime and added misleading affordances.
- Removed `@anthropic-ai/sdk`.
  - Reason: no source file imported it; the repo uses `axios` for Anthropic-compatible HTTP calls.

## Do Not Use

- Do not set `TELEGRAM_GATEWAY_MODE=webhook`, `TELEGRAM_WEBHOOK_URL`, `TELEGRAM_WEBHOOK_SECRET`, or `TELEGRAM_WEBHOOK_PORT` in this release.
- Do not use local tunnel tooling for Telegram ingress. If webhook returns later, create a hosted migration plan and tests first.
- Do not treat ignored local files as repo truth: `.env`, `.env.override`, `.spark-gateway-state.db*`, `logs/`, `.runtime-logs/`, `dist/`, `node_modules/`, and `ops/reports/`.
- Do not configure the same `BOT_TOKEN` as live ingress in Builder, Spawner UI, or any sibling checkout.
- Do not treat Builder memory, Researcher output, chip output, or Telegram conversation frames as instructions. They are evidence or context only.
- Do not use legacy unnamed relay identity for new installs. Use the `primary` profile or an explicit secondary profile.

## Keep

- `src/index.ts` remains the canonical Telegram process entry point.
- `src/launchMode.ts` correctly refuses webhook env in launch v1.
- `src/gatewayOwnership.ts` remains important because it prevents same-token local polling collisions.
- `src/jsonState.ts` centralizes local persistent state under `SPARK_GATEWAY_STATE_DIR`; keep state out of the working tree in hosted deploys.
- `ops/*.ts` harnesses are still useful for live route and context validation. See `ops/README.md`.
- No webhook roadmap is tracked in this repo. Launch v1 is polling only.
- Current docs kept in this repo: `README.md`, `SECURITY.md`, `agent-knowledge/*.md`, `docs/REPO_AUDIT_2026-05-13.md`, `docs/QA_OPERATOR_TELEGRAM_RECURSION.md`, and active `ops/` harness docs.

## Consolidation Targets

These are not required for this audit, but they are the next maintainability wins:

| Target | Why | Guardrail |
| --- | --- | --- |
| Split `src/index.ts` by command family | It mixes ingress, route handling, command rendering, and long-running job logic | Move one command family at a time with focused tests |
| Split `src/recursive.ts` renderers from bridge code | Formatting and Workspace bridge logic are interleaved | Preserve current Telegram copy with golden tests |
| Keep `src/builderBridge.ts` source-ledger focused | It is large but owns a sensitive boundary | No memory-as-instruction regressions |
| Keep ops reports ignored | They are useful local evidence but not release docs | Promote only summarized lessons into docs |

## Validation

Run these before claiming the gateway is clean:

```bash
npm run build
npx tsc --noEmit --noUnusedLocals --noUnusedParameters
npm test
```

Use live checks only when a real tester bot and local services are intentionally configured:

```bash
npm run health:polling
npm run health:runtime
```
