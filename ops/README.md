# Ops Harnesses

`ops/` contains live and semi-live validation harnesses. These are operator tools, not launch instructions.

Use these when validating behavior:

- `NATURAL_LANGUAGE_LIVE_TEST_PLAN.md` - natural-language routing and mission behavior plan.
- `CONTEXT_WINDOW_LIVE_TEST_PLAN.md` - conversation frame, stale-memory, and follow-up tests.
- `liveNlCommandSuite.ts` - sends prompt cards for human-in-the-loop live Telegram testing.
- `telegramCommandCompositionAudit.ts` - drives registered Telegram commands through test-mode middleware and writes the command composition scorecard.
- `routeBoundaryHandlerHarness.ts` - exercises no-execution and route-boundary cases.
- `runtimeFreshnessCheck.ts` - checks source/runtime drift.
- `naturalRouteSmoke.ts` and `naturalRouteReplay.ts` - replay route fixtures.

Do not use `ops/` to configure Telegram ingress. Launch v1 is long polling only, and local tunnel/webhook helpers were removed in the 2026-05-13 audit.

`ops/reports/` is ignored on purpose. Keep raw run reports there while investigating, then promote only durable lessons into `docs/` or `README.md`.
