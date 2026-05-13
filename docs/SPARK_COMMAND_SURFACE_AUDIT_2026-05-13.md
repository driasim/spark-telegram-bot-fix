# Spark Command Surface Audit - 2026-05-13

This document maps the active Spark command surfaces across the local stack. It is meant for humans deciding what should stay user-facing, what should be hidden as expert tooling, and what needs a better shape.

Sources checked on 2026-05-13:

- `spark-telegram-bot`: `src/index.ts`, `README.md`
- `spark-intelligence-builder`: `python -m spark_intelligence.cli --help`, `src/spark_intelligence/cli.py`, `src/spark_intelligence/adapters/telegram/runtime.py`
- `spark-cli`: `python -m spark_cli.cli --help`, `README.md`
- `spawner-ui`: `README.md`, `src/lib/services/spark-agent-bridge.ts`

## Current Ownership

| Surface | Current role | User-facing posture |
| --- | --- | --- |
| Spark CLI | Installer, runtime supervisor, secrets/config, repair, verification | Primary operator control plane |
| Telegram Gateway | Private chat ingress, concise mission control, Spawner relay, Builder bridge | Primary conversational control plane |
| Builder CLI | Memory, self-awareness, wiki, route confidence, pairing, harnesses, adapters | Expert/runtime core; not a casual user surface |
| Spawner UI | Mission execution, Kanban, Canvas, Trace, project workspace | Visual execution plane |
| Builder Telegram runtime adapter | Builder-owned command interpretation for `/self`, `/wiki`, `/voice`, `/memory`, `/swarm`, `/style`, `/think` | Useful behind the gateway; too broad as a separate user surface |
| Ops harnesses | Live/semi-live validation matrices | Developer/operator validation only |

The healthiest mental model is:

```text
User
  -> Spark CLI for install/start/status/fix
  -> Telegram for concise chat and mission control
  -> Spawner UI for rich execution views
  -> Builder behind the scenes for memory, wiki, self-awareness, route confidence, and expert diagnostics
```

## Spark CLI

Spark CLI is the cleanest current operator surface. It owns install, start/stop, status, verification, secrets, providers, access lanes, and logs.

Current top-level commands:

| Command family | Used now? | Notes |
| --- | --- | --- |
| `spark setup`, `spark onboard` | Yes | Main first-run and configuration flow. |
| `spark status`, `spark doctor`, `spark verify`, `spark smoke` | Yes | Main health and readiness path. |
| `spark start`, `spark stop`, `spark restart`, `spark live`, `spark autostart` | Yes | Runtime lifecycle controls. |
| `spark providers`, `spark recommend` | Yes | LLM provider selection and testing. |
| `spark fix`, `spark logs`, `spark support bundle` | Yes | Repair and support path. |
| `spark telegram connect` | Yes | Preferred token/profile rotation flow. |
| `spark access`, `spark sandbox`, `spark approval` | Yes, but advanced | Local access/sandbox readiness and approval classification. |
| `spark update`, `spark uninstall`, `spark install`, `spark list`, `spark search`, `spark init` | Yes, mostly maintainer | Registry/module lifecycle. |
| `spark config`, `spark secrets` | Yes, advanced | Should stay CLI-only; do not duplicate in Telegram. |
| `spark os compile` | Advanced | Useful for system-map/debug reports; not first-run UI. |

Redundancy/shape notes:

- Spark CLI should remain the only place for setup, secrets, provider wiring, local access setup, sandbox setup, autostart, update, uninstall, and logs.
- Telegram commands that wrap CLI actions should read as shortcuts, not a second setup system.
- `spark live` is a separate friendly surface. It should not blur with `spark-telegram-bot` unless the product deliberately merges them.

## Telegram Gateway

Telegram Gateway owns the real BotFather token and long-polling ingress. It should stay compact: status, diagnosis, memory/chat, mission control, and short expert drilldowns.

Current command families registered in `src/index.ts`:

| Family | Commands | Used now? | Shape |
| --- | --- | --- | --- |
| Onboarding/access | `/start`, `/myid`, `/access`, `/access_setup`, `/level5_setup`, `/level5_disable`, `/docker_doctor`, `/docker_smoke` | Yes | `/access` is good; the setup/level/docker shortcuts feel like CLI actions and could become `/access setup`, `/access doctor`, `/access level5`. |
| Status/health | `/status`, `/diagnose`, `/spark`, `/about` | Yes | Keep. `/spark` overlaps with `/status` but is harmless as a soft product status. |
| Conversation/memory | `/remember`, `/recall`, `/forget`, `/context`, `/conversation_context` | Yes | Keep `/context`; consider hiding `/conversation_context` as an alias or moving it under `/context debug`. |
| Builder self/wiki/voice | `/self`, `/wiki`, `/voice` | Yes | Good high-level gateway commands. |
| Mission start | `/run`, `/runminimax`, `/runglm`, `/runzai`, `/runclaude`, `/runcodex`, `/run2`, `/runall` | Yes, admin | `/run` is canonical. Provider-specific run commands are power shortcuts; consider moving provider choice into `/model` plus `/run`. |
| Mission control | `/board`, `/mission`, `/updates` | Yes | Keep; this is Telegram's best current product lane. |
| Model/provider | `/model`, `/models` | Yes | Keep, but make relationship to `spark providers` obvious in docs. |
| Workspace/build context | `/workspaces`, `/workspace`, natural-language build requests | Yes, admin | Keep `/workspaces`; plural is canonical. `/workspace` is a compatibility alias that now points back to `/workspaces`. |
| Creator/chip/loop | `/creator`, `/chip`, `/loop` | Yes, advanced | Useful, but the boundary between Telegram, Builder, and Spawner is crowded. |
| Recursive Workspace | `/recursive` | Yes, advanced | Powerful but heavy. Best candidate for a later simplification pass: Telegram should summarize and deep-link, not become the full recursive Workspace UI. |
| Scheduling | `/schedule`, `/schedules` | Yes | Keep if schedules are actively used; otherwise this is easy to move behind Spawner/CLI. |
| Route/authority diagnostics | `/probe`, `/route_probe`, `/nl_route`, `/natural_route`, `/ledger`, `/capabilities`, `/authority`, `/trace`, `/trace_repair`, `/memory_movement`, `/memory_flow`, `/black_box`, `/blackbox`, `/operating_context`, `/agent_context`, `/aoc` | Advanced | Too many aliases, but duplicate aliases now show a canonical-command banner. Keep canonical `/probe`, `/nl_route`, `/ledger`, `/capabilities`, `/authority`, `/trace`, `/memory_movement`, `/aoc`; hide or retire duplicate aliases over time. |
| Clarification | `/clarify` | Maybe | Useful only if operators know the pending-state model. Could be folded into natural replies. |
| Deferred dashboard placeholders | `/resonance`, `/insights`, `/lessons`, `/process`, `/reflect` | Not really | These currently point at deferred dashboard/resonance behavior. They are safe but stale-looking; hide or remove in a cleanup pass. |

Most redundant Telegram aliases, now kept as compatibility paths with canonical-command banners:

- `/context`, `/operating_context`, `/agent_context`, `/aoc`, `/conversation_context`
- `/probe`, `/route_probe`, `/nl_route`, `/natural_route`
- `/trace`, `/trace_repair`
- `/memory_movement`, `/memory_flow`
- `/workspace`, `/workspaces`
- `/black_box`, `/blackbox`

Recommended Telegram shape:

- Keep user-facing: `/start`, `/myid`, `/status`, `/diagnose`, `/access`, `/context`, `/remember`, `/recall`, `/self`, `/wiki`, `/voice`, `/run`, `/board`, `/mission`, `/updates`, `/model`, `/workspaces`.
- Keep admin/advanced but document separately: `/recursive`, `/creator`, `/chip`, `/loop`, `/schedule`, `/schedules`, `/probe`, `/nl_route`, `/ledger`, `/capabilities`, `/authority`, `/trace`, `/memory_movement`, `/aoc`.
- Retire or hide later: `/resonance`, `/insights`, `/lessons`, `/process`, `/reflect`, duplicate aliases after one compatibility period, and direct CLI-like setup shortcuts if `/access` can absorb them.

## Builder CLI

Builder CLI is the runtime core and expert toolbox. It exposes many families through `spark-intelligence`. This is useful for agents and maintainers, but too broad to become user-facing command help.

Current top-level command families:

| Family | Used now? | Notes |
| --- | --- | --- |
| `setup`, `bootstrap`, `status`, `doctor`, `diagnostics` | Yes | Runtime setup/health/dev diagnostics. Spark CLI should own user setup, Builder owns internal readiness. |
| `self` | Yes | Self-awareness, route confidence, source ledger, operating context, stale sweep, live Telegram cadence, capability ledger. |
| `wiki` | Yes | Builder-owned LLM wiki bootstrap/status/query/answer/promote path. |
| `memory` | Yes | Memory status, doctor, current-state lookup, capsules, Telegram KB/regression/acceptance, architecture benchmarks. |
| `mission` | Yes | Mission status and task-specific operator plans. |
| `connect`, `operator`, `identity`, `pairings`, `sessions` | Yes, advanced | Pairing/auth/channel governance; keep expert-only. |
| `gateway`, `channel` | Mixed | Useful for adapter simulations and traces; overlaps conceptually with Telegram Gateway and Spark CLI runtime ownership. Keep as dev harness, not launch docs. |
| `drafts`, `instructions` | Yes, niche | User/channel prompt state. |
| `chips`, `loops`, `creator`, `attachments`, `swarm` | Yes, advanced | Domain chip and recursive ecosystem controls. |
| `browser` | Mostly not active | The help says legacy browser commands are disabled/reporting. Do not advertise as a working user command unless the current route probe passes. |
| `auth`, `researcher`, `config`, `jobs`, `harness`, `agent` | Yes, advanced | Operational internals. |
| `install-autostart`, `uninstall-autostart` | Redundant-looking | Spark CLI owns user autostart. Builder autostart should be legacy/internal unless still needed for an installed Builder-only mode. |

High-value Builder command groups to keep visible to agents:

- `self status|context|panel|black-box|source-used|route-probe|improve`
- `wiki status|inventory|query|answer|candidates|scan-candidates|promote-*`
- `memory status|doctor|lookup-current-state|inspect-capsule|run-telegram-*`
- `harness status|plan|execute`
- `attachments status|list|snapshot|run-hook|probe-hook`
- `swarm status|doctor|sync|evaluate`

Builder command groups that need clearer product boundaries:

- `gateway` and `channel`: useful test/adapter harnesses, but they can make it sound like Builder owns live Telegram ingress. Launch docs should say it does not.
- `operator`: powerful but sprawling; should probably become a small set of operator views plus rare action commands.
- `browser`: currently reads as disabled legacy reporting. Keep it out of user-facing command guides.
- `install-autostart` and `uninstall-autostart`: likely redundant with Spark CLI.

## Builder Telegram Runtime Adapter

Builder also has a Telegram-message runtime adapter with its own command vocabulary. The gateway can route into it, but it should not become a competing Telegram bot surface.

Observed command families in `src/spark_intelligence/adapters/telegram/runtime.py`:

| Family | Commands | Status |
| --- | --- | --- |
| Self/AOC | `/self`, `/context`, `/aoc`, `/probe`, `/ledger` | Active behind gateway-style commands. |
| Wiki | `/wiki`, `/wiki pages`, `/wiki candidates`, `/wiki scan-candidates` | Active Builder-owned wiki lane. |
| Voice | `/voice`, `/voice reply`, `/voice plan`, `/voice install`, `/voice onboard`, `/voice ask`, `/voice speak` | Active but broad; Telegram Gateway currently exposes only `/voice`. |
| Memory | `/memory doctor` | Active expert diagnostic. |
| Think | `/think`, `/think on`, `/think off` | Usability question: unclear whether this belongs in Telegram or a style/preferences surface. |
| Style | `/style`, `/style status`, `/style history`, `/style presets`, `/style diff`, `/style undo`, `/style score`, `/style examples`, `/style compare`, `/style train`, `/style feedback`, `/style good`, `/style bad` | Powerful, but feels like a separate product. Should be grouped under one clear "voice/style tuning" surface. |
| Swarm | `/swarm ...` many subcommands | Very powerful, but too much for normal Telegram help. Better as summary/deep-link from Telegram and detailed work in Workspace/Builder. |
| Chip | `/chip`, `/chip status`, `/chip autoloop`, `/chip <hook>` | Advanced. Gateway already exposes `/chip` and `/loop`. |

Shape recommendation:

- Telegram Gateway should expose only a small curated subset.
- Builder adapter commands should be treated as implementation vocabulary unless deliberately promoted.
- `/style`, `/swarm`, `/voice`, and `/chip` need a product grouping pass so users do not have to memorize several parallel mini-CLIs.

## Spawner UI

Spawner UI is not primarily a slash-command surface. It is a browser UI plus local/private APIs.

Current user surfaces:

| Surface | Used now? | Notes |
| --- | --- | --- |
| Kanban / Mission board | Yes | Visual mission status and actions. |
| Canvas | Yes | PRD/project graph and task layout. |
| Mission detail / Trace | Yes | Best place for rich execution evidence. |
| Memory quality dashboard | Yes, specialized | Useful for Spark memory diagnostics. |
| Hosted/private preview lock | Yes | Good security posture for public deployment. |

Current API surfaces from README:

| API | Used now? | Notes |
| --- | --- | --- |
| `/api/spark/run` | Yes | Telegram `/run` starts here. |
| `/api/mission-control/status` | Yes | Mission status. |
| `/api/mission-control/command` | Yes | `pause`, `resume`, `kill`, `status`. |
| `/api/mission-control/board` | Yes | Telegram `/board` summary source. |
| `/api/mission-control/trace` | Yes | Stitched mission evidence. |
| `/api/prd-bridge/write` | Yes | PRD workspace write. |
| `/api/prd-bridge/load-to-canvas` | Yes | Canvas load path. |
| `/api/spark-agent/*` | Advanced | Canvas/mission/MCP/event stream bridge. |

Spark Agent bridge commands:

- `canvas.create_pipeline`
- `canvas.add_skill`
- `canvas.add_connection`
- `canvas.get_state`
- `mission.build`
- `mission.start`
- `mission.pause`
- `mission.resume`
- `mission.stop`
- `mission.status`
- `mcp.list`
- `mcp.connect`
- `mcp.call_tool`
- `mcp.disconnect`
- `events.subscribe`
- `worker.run`
- `worker.cancel`
- `worker.status`

Shape recommendation:

- Spawner should own rich mission state, task graphs, Canvas, Kanban, and trace.
- Telegram should link to Spawner and summarize the latest action, not duplicate the whole UI.
- Spark CLI should own service lifecycle and repair.

## What Is Being Used Right Now

High-confidence current surfaces:

- Spark CLI: `setup`, `status`, `verify`, `start`, `stop`, `restart`, `providers`, `fix`, `logs`, `telegram connect`, `update`, `autostart`, `access`, `sandbox`.
- Telegram Gateway: long-polling private bot, `/status`, `/diagnose`, `/access`, `/context`, `/remember`, `/recall`, `/self`, `/wiki`, `/voice`, `/run`, `/board`, `/mission`, `/updates`, `/model`, `/recursive`.
- Builder: `self`, `wiki`, `memory`, `mission`, `harness`, `attachments`, `swarm`, `auth`, `researcher`, `config`.
- Spawner UI: `/api/spark/run`, Mission Control APIs, Kanban, Canvas, Trace, Spark Agent bridge.

## What Is Not Really Being Used

These are safe-looking candidates for later hiding/removal, not immediate deletions:

- Telegram deferred dashboard placeholders: `/resonance`, `/insights`, `/lessons`, `/process`, `/reflect`.
- Builder `browser` as a user-facing promise, because it currently reports disabled legacy browser commands.
- Builder `install-autostart` and `uninstall-autostart` as user-facing commands, because Spark CLI owns autostart.
- Builder `gateway start` as a launch instruction, because `spark-telegram-bot` owns Telegram ingress and Spark CLI owns runtime start.

## Redundant Or Crowded Areas

| Area | Current issue | Better shape |
| --- | --- | --- |
| Telegram route diagnostics | `/probe`, `/route_probe`, `/nl_route`, `/natural_route`, Builder `/probe` | One `/probe` command with submodes, plus `/nl_route` only if operators actively use it. Compatibility aliases now point to the canonical commands. |
| Operating context | `/context`, `/operating_context`, `/agent_context`, `/aoc`, `/conversation_context`, Builder `/aoc` | Keep `/context` for users and `/aoc` for expert short form. Compatibility aliases now point to `/context`. |
| Trace/memory diagnostics | `/trace`, `/trace_repair`, `/memory_movement`, `/memory_flow` | Keep `/trace` and `/memory_movement`; fold repair under subcommands. Compatibility aliases now point to the canonical commands. |
| Provider-specific run commands | `/runminimax`, `/runglm`, `/runzai`, `/runclaude`, `/runcodex`, `/run2`, `/runall` | Prefer `/model` or `/run --provider <name>` eventually. |
| Access setup from Telegram | `/access_setup`, `/docker_doctor`, `/docker_smoke`, `/level5_setup`, `/level5_disable` | Prefer Spark CLI for setup; Telegram can show status and link/print next command. |
| Builder Telegram adapter vs Gateway | Both understand `/self`, `/wiki`, `/voice`, `/probe`, `/ledger`, `/chip` | Gateway should be the curated front door; Builder should remain the implementation owner. |
| Recursive/Swarm controls | Gateway `/recursive`, Builder `/swarm ...`, Builder `/loops`, Spawner Canvas/Trace | Telegram should summarize/deep-link; Workspace/Spawner should carry detail. |
| Style/voice tuning | Builder `/style ...`, Builder `/voice ...`, Gateway `/voice`, agent knowledge voice docs | Needs one product name and one user workflow. |

## Next Usability Work

Recommended order:

1. Keep current behavior stable and document the three main surfaces: Spark CLI, Telegram, Spawner UI.
2. Hide or de-emphasize Telegram deferred dashboard commands.
3. Keep canonical-command banners on compatibility aliases and leave those aliases undocumented for one release.
4. Move provider-specific run shortcuts toward `/model` + `/run` or `/run --provider`.
5. Turn `/recursive` into a concise status/deep-link control and let Spawner/Workspace own the detailed UI.
6. Make Builder's expert command families discoverable through one "Builder expert tools" doc, not Telegram user help.

## Do Not Do Yet

- Do not remove Builder CLI command families just because they are broad. Many are internal contracts used by tests, bridges, or agents.
- Do not remove Telegram webhook guardrails; they protect long polling.
- Do not move setup/secrets into Telegram. Spark CLI should own that boundary.
- Do not make Spawner UI own Telegram ingress.
