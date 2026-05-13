# Telegram Command Composition Audit - 2026-05-13

This audit ran the Telegram gateway command surface through the real Telegraf command middleware in `SPARK_BOT_TEST_MODE=1`. It used synthetic private-chat updates, a fake Telegram API transport, isolated state, disabled live Spark CLI execution by removing `spark` from PATH, and stubbed Spawner HTTP calls. The goal is composition QA, not live service validation.

Composition lens from `spark-telegram-composition`:

- What happened?
- Is it good, neutral, blocked, or bad?
- What matters now?
- Where can the operator inspect full evidence?

## Harness Scope

- Registered Telegram commands found in source: 64
- Command cases exercised: 64
- Average usability score: 4.16 / 5
- Score spread: 32 excellent, 10 good, 22 okay, 0 rough, 0 poor
- Missing registered commands in harness: none
- Harness-only aliases/extras: none

Side-effect posture:

- `read_only`: command path should only read local state or render static text.
- `usage_only`: the harness chose a usage/help path to avoid starting work.
- `stubbed`: live service calls were intercepted and answered with local fixtures.
- `blocked`: live CLI/Builder actions were intentionally made unavailable to test the failure shape safely.

## Main Findings

1. The safe harness now has 0 rough/poor replies.
2. The clearest replies are compact command/status surfaces: `/myid`, `/access`, `/diagnose`, `/updates`, `/schedules`, `/clarify`, `/recursive`, `/model`, and the Builder-offline cards.
3. `/start` is now a first-move surface instead of a full command inventory, while keeping important operator shortcuts visible.
4. Compatibility aliases still inflate the perceived surface. They should stay functional, but primary docs should keep teaching the canonical commands.
5. Legacy dashboard commands now explain that the surface is paused for launch v1 and point users toward supported commands.

## Priority Improvements

| Priority | Commands | Improvement |
| --- | --- | --- |
| P1 | `/voice` | Bring the Builder voice-unavailable reply into the same compact card shape as memory/wiki/context failures. |
| P2 | `/run*`, `/mission`, `/chip`, `/loop`, `/schedule` usage replies | Add one-line examples and clearer canonical-command pointers without making help verbose. |
| P2 | route/AOC aliases | Keep aliases working, but document `/context`, `/probe`, `/nl_route`, `/trace`, and `/memory_movement` as the canonical forms. |
| P2 | `/workspace`, `/memory_flow`, `/blackbox`, `/black-box`, `/route_probe`, `/natural_route` | Consider hiding aliases from primary help while preserving backward compatibility. |
| P3 | live Telegram smoke | Re-run this list against a real private chat with Builder, Spawner, Spark CLI, and providers online to score success-path composition. |

## Scorecard

| Command | Family | Score | Posture | Observed first reply | Notes | Recommendation |
| --- | --- | ---: | --- | --- | --- | --- |
`/start` | Onboarding | 4 (good) | `stubbed` | 👋 Hey Audit, I'm Spark.<br>⚠️ Builder memory is offline right now, so I will avoid claiming saved memory.<br>✅ Mission relay is reachable.<br><br>Good first moves:<br>• /status - health and access<br>• /diagnose - deeper h [truncated] | Long for Telegram; should probably deep-link to Workspace or docs. | Keep the current shape; only minor polish needed.
`/myid` | Onboarding | 5 (excellent) | `read_only` | Your Telegram ID: 910000001<br>Username: @none<br>You are an admin | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/access` | Access | 5 (excellent) | `read_only` | Spark access: Access level 3<br>Current<br>• Public links, docs, GitHub research, and requested builds are on.<br>• Local files are off.<br><br>Levels:<br>• 1 - Chat, memory, recall, diagnostics. No builds.<br>• 2 - Requested [truncated] | Includes a Telegram keyboard, which helps choice-heavy flows. | Keep the current shape; only minor polish needed.
`/access_setup` | Access | 5 (excellent) | `blocked` | ⚠️ Set up safe workspace could not run.<br><br>Why: Spark CLI is not available to this Telegram runtime.<br><br>Next move: run /diagnose, or run the same access action from the Spark CLI. | Readable and compact in the safe harness. | Prefer /access as the Telegram front door and keep detailed setup in Spark CLI.
`/docker_doctor` | Access | 5 (excellent) | `blocked` | ⚠️ Check runner could not run.<br><br>Why: Spark CLI is not available to this Telegram runtime.<br><br>Next move: run /diagnose, or run the same access action from the Spark CLI. | Readable and compact in the safe harness. | Prefer /access as the Telegram front door and keep detailed setup in Spark CLI.
`/docker_smoke` | Access | 4 (good) | `usage_only` | This runs a no-secret Docker sandbox smoke. It may build or use a local image, but should not mount your home folder, Spark secrets, or the Docker socket.<br><br>To continue, send /docker_smoke confirm or tap Confirm. | First line is too dense to scan as a headline.; Includes a Telegram keyboard, which helps choice-heavy flows. | Prefer /access as the Telegram front door and keep detailed setup in Spark CLI.
`/level5_setup` | Access | 4 (good) | `usage_only` | Level 5 is whole-computer operator mode. Spark will write local guardrail env files and require a restart before it becomes active.<br><br>To continue, send /level5_setup confirm or tap Confirm. | First line is too dense to scan as a headline.; Includes a Telegram keyboard, which helps choice-heavy flows. | Prefer /access as the Telegram front door and keep detailed setup in Spark CLI.
`/level5_disable` | Access | 5 (excellent) | `usage_only` | This changes Spark access guardrail state and requires confirmation.<br><br>To continue, send /level5_disable confirm or tap Confirm. | Includes a Telegram keyboard, which helps choice-heavy flows. | Prefer /access as the Telegram front door and keep detailed setup in Spark CLI.
`/status` | Status | 4 (good) | `blocked` | ✅ System status<br><br>Builder memory: ⚠️ offline (auto)<br><br>⚠️ Spark Live health is unverified.<br><br>What happened<br>• Spark CLI is not available to this Telegram runtime.<br><br>What this means<br>• Telegram could not prove liv [truncated] | Long for Telegram; should probably deep-link to Workspace or docs. | Keep the current shape; only minor polish needed.
`/diagnose` | Status | 5 (excellent) | `stubbed` | 🔎 Running diagnostics...<br><br>Checks chat, access, relay, Spawner, and provider ping. Takes ~30s. | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/spark` | Status | 5 (excellent) | `read_only` | Spark Intelligence<br><br>✅ Spark Telegram launch core is online.<br><br>Ready now<br>• Chat and command routing through Telegram<br>• Builder memory when the local bridge is healthy<br>• Spawner mission relay when local servi [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/about` | Memory | 5 (excellent) | `blocked` | ⚠️ Memory is degraded/offline right now.<br><br>I should answer from the current thread instead of treating old memory as authority.<br><br>Next move: run /diagnose if you want to check Builder memory. | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/remember` | Memory | 5 (excellent) | `usage_only` | 🧠 Save a memory<br><br>Use: /remember <something important><br>Example: /remember I prefer concise mission updates. | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/recall` | Memory | 5 (excellent) | `usage_only` | 🔎 Recall memory<br><br>Use: /recall <topic><br>Example: /recall mission update preferences | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/forget` | Memory | 5 (excellent) | `usage_only` | 🧹 Forget memory<br><br>Use: /forget <thing to forget><br>Example: /forget my old project nickname<br><br>If Builder memory is offline, try again after /diagnose shows memory is healthy. | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/context` | Builder/AOC | 5 (excellent) | `blocked` | ⚠️ Spark could not reach the Builder memory path right now.<br><br>Why: Builder bridge command did not finish cleanly.<br><br>Next move<br>• Check now: Run /diagnose so Spark can check Builder, memory, and the selected m [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/operating_context` | Builder/AOC | 3 (okay) | `blocked` | ⚠️ Spark could not reach the Builder memory path right now.<br><br>Why: Builder bridge command did not finish cleanly.<br><br>Next move<br>• Check now: Run /diagnose so Spark can check Builder, memory, and the selected m [truncated] | Redundant alias; useful for compatibility, noisy in command help. | Keep as compatibility, but stop advertising it as a primary command.
`/agent_context` | Builder/AOC | 3 (okay) | `blocked` | ⚠️ Spark could not reach the Builder memory path right now.<br><br>Why: Builder bridge command did not finish cleanly.<br><br>Next move<br>• Check now: Run /diagnose so Spark can check Builder, memory, and the selected m [truncated] | Redundant alias; useful for compatibility, noisy in command help. | Keep as compatibility, but stop advertising it as a primary command.
`/aoc` | Builder/AOC | 5 (excellent) | `blocked` | ⚠️ Spark could not reach the Builder memory path right now.<br><br>Why: Builder bridge command did not finish cleanly.<br><br>Next move<br>• Check now: Run /diagnose so Spark can check Builder, memory, and the selected m [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/conversation_context` | Builder/AOC | 4 (good) | `read_only` | Conversation context harness<br>- Hot turns: 0<br>- Warm summary tokens: 0<br>- Artifacts: 0<br>- Compaction events: 0<br>- Safe input budget: unknown<br>- Requires larger model for full target: unknown | Uses CLI-style hyphen bullets where Telegram cards would scan better. | Keep the current shape; only minor polish needed.
`/black_box` | Builder/AOC | 5 (excellent) | `usage_only` | Agent black box<br>Usage: /black_box [request_id]<br><br>This shows compact event evidence only. It does not promote memory or grant authority. | Usage is explicit. | Keep the current shape; only minor polish needed.
`/blackbox` | Builder/AOC | 3 (okay) | `usage_only` | Agent black box<br>Usage: /black_box [request_id]<br><br>This shows compact event evidence only. It does not promote memory or grant authority. | Usage is explicit.; Redundant alias; useful for compatibility, noisy in command help. | Keep as compatibility, but stop advertising it as a primary command.
`/black-box` | Builder/AOC | 3 (okay) | `usage_only` | Agent black box<br>Usage: /black_box [request_id]<br><br>This shows compact event evidence only. It does not promote memory or grant authority. | Usage is explicit.; Redundant alias; useful for compatibility, noisy in command help. | Keep as compatibility, but stop advertising it as a primary command.
`/self` | Builder | 5 (excellent) | `blocked` | ⚠️ Spark could not reach the Builder memory path right now.<br><br>Why: Builder bridge command did not finish cleanly.<br><br>Next move<br>• Check now: Run /diagnose so Spark can check Builder, memory, and the selected m [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/wiki` | Builder | 5 (excellent) | `blocked` | ⚠️ Spark could not reach the Builder memory path right now.<br><br>Why: Builder bridge command did not finish cleanly.<br><br>Next move<br>• Check now: Run /diagnose so Spark can check Builder, memory, and the selected m [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/voice` | Builder | 3 (okay) | `blocked` | Voice is routed through Builder now, but the Builder voice route did not answer this turn. Run `/diagnose`, then try `/voice` again. | First line is too dense to scan as a headline.; Bridge failure is understandable but repeats system ownership language. | Tighten the first line and add one clearer next action.
`/ledger` | Builder Diagnostics | 5 (excellent) | `blocked` | Capability ledger review is unavailable right now. Run /diagnose to check the Builder bridge. | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/capabilities` | Builder Diagnostics | 5 (excellent) | `read_only` | Capability garden needs review.<br><br>State<br>• 7 cards<br>• Status: local-artifacts=2, schema-shaped=3, seen=2<br>• Surfaces: creator-system=1, specialization-path=6<br><br>Review<br>• Cards are evidence, not trust.<br>• Gate ver [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/authority` | Builder Diagnostics | 4 (good) | `read_only` | Authority view has gated actions.<br><br>State<br>- Access L4; lane spark_workspace<br>- 5 Telegram access profiles; 5 Spawner lanes<br>- 5 browser approvals from 20 hooks<br>- 5 toxic capability pairs; 3 publication checks [truncated] | Uses CLI-style hyphen bullets where Telegram cards would scan better. | Keep the current shape; only minor polish needed.
`/trace` | Builder Diagnostics | 4 (good) | `read_only` | Trace repair needs attention.<br><br>State<br>• 38898 Builder events; 2378 trace groups<br>• 32808 missing trace refs; 3241 open high-severity events<br>• 0 orphan parent links<br><br>Recent<br>• 1h: 0/0 missing (0%)<br>• 24h: 0/3 m [truncated] | Long for Telegram; should probably deep-link to Workspace or docs. | Keep the current shape; only minor polish needed.
`/trace_repair` | Builder Diagnostics | 3 (okay) | `read_only` | Trace repair needs attention.<br><br>State<br>• 38898 Builder events; 2378 trace groups<br>• 32808 missing trace refs; 3241 open high-severity events<br>• 0 orphan parent links<br><br>Recent<br>• 1h: 0/0 missing (0%)<br>• 24h: 0/3 m [truncated] | Long for Telegram; should probably deep-link to Workspace or docs.; Redundant alias; useful for compatibility, noisy in command help. | Keep as compatibility, but stop advertising it as a primary command.
`/memory_movement` | Builder Diagnostics | 5 (excellent) | `read_only` | Memory movement is visible.<br><br>State<br>• supported; 5654 movement rows<br>• Movement: captured=81, saved=81, promoted=381, retrieved=2613, summarized=48<br>• Authority: authoritative_current=1970, authoritative_hist [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/memory_flow` | Builder Diagnostics | 3 (okay) | `read_only` | Memory movement is visible.<br><br>State<br>• supported; 5654 movement rows<br>• Movement: captured=81, saved=81, promoted=381, retrieved=2613, summarized=48<br>• Authority: authoritative_current=1970, authoritative_hist [truncated] | Redundant alias; useful for compatibility, noisy in command help. | Keep as compatibility, but stop advertising it as a primary command.
`/probe` | Route Diagnostics | 4 (good) | `usage_only` | Route probe<br>Usage: /probe <route><br>Batch: /probe core or /probe all<br><br>Routes:<br>- core<br>- all<br>- builder<br>- spawner<br>- memory<br>- researcher<br>- swarm<br>- browser<br>- local_work | Usage is explicit.; Uses CLI-style hyphen bullets where Telegram cards would scan better. | Keep the current shape; only minor polish needed.
`/route_probe` | Route Diagnostics | 3 (okay) | `usage_only` | Route probe<br>Usage: /probe <route><br>Batch: /probe core or /probe all<br><br>Routes:<br>- core<br>- all<br>- builder<br>- spawner<br>- memory<br>- researcher<br>- swarm<br>- browser<br>- local_work | Usage is explicit.; Uses CLI-style hyphen bullets where Telegram cards would scan better.; Redundant alias; useful for compatibility, noisy in command help. | Keep as compatibility, but stop advertising it as a primary command.
`/nl_route` | Route Diagnostics | 5 (excellent) | `usage_only` | Natural route probe<br>Usage: /nl_route <message><br><br>This shows the diagnostic route decision only. It does not execute the route. | Usage is explicit. | Keep the current shape; only minor polish needed.
`/natural_route` | Route Diagnostics | 3 (okay) | `usage_only` | Natural route probe<br>Usage: /nl_route <message><br><br>This shows the diagnostic route decision only. It does not execute the route. | Usage is explicit.; Redundant alias; useful for compatibility, noisy in command help. | Keep as compatibility, but stop advertising it as a primary command.
`/run` | Mission Start | 3 (okay) | `usage_only` | Usage: /run <goal> (default: current mission provider) | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Tighten the first line and add one clearer next action.
`/runminimax` | Mission Start | 3 (okay) | `usage_only` | Usage: /runminimax <goal> | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Consider moving provider choice into /model plus /run, leaving this as an expert shortcut.
`/runglm` | Mission Start | 3 (okay) | `usage_only` | Usage: /runglm <goal> (Z.AI GLM) | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Consider moving provider choice into /model plus /run, leaving this as an expert shortcut.
`/runzai` | Mission Start | 3 (okay) | `usage_only` | Usage: /runzai <goal> | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Consider moving provider choice into /model plus /run, leaving this as an expert shortcut.
`/runclaude` | Mission Start | 3 (okay) | `usage_only` | Usage: /runclaude <goal> | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Consider moving provider choice into /model plus /run, leaving this as an expert shortcut.
`/runcodex` | Mission Start | 3 (okay) | `usage_only` | Usage: /runcodex <goal> | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Consider moving provider choice into /model plus /run, leaving this as an expert shortcut.
`/run2` | Mission Start | 3 (okay) | `usage_only` | Usage: /run2 <goal> (consensus: minimax + zai) | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Consider moving provider choice into /model plus /run, leaving this as an expert shortcut.
`/runall` | Mission Start | 3 (okay) | `usage_only` | Usage: /runall <goal> (all 4 providers) | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Consider moving provider choice into /model plus /run, leaving this as an expert shortcut.
`/board` | Mission Control | 4 (good) | `stubbed` | Spawner Board<br><br>Running: 0<br>- none<br><br>Paused: 0<br>- none<br><br>Completed: 0<br>- none<br><br>Failed: 0<br>- none<br><br>Created: 0<br>- none | Uses CLI-style hyphen bullets where Telegram cards would scan better. | Keep the current shape; only minor polish needed.
`/mission` | Mission Control | 3 (okay) | `usage_only` | Usage: /mission <status\|pause\|resume\|kill> <missionId> | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Tighten the first line and add one clearer next action.
`/updates` | Mission Control | 5 (excellent) | `read_only` | Live mission updates are set to normal.<br>Normal sends pickup, canvas-ready, final handoff, and failures.<br>Mission links are set to board.<br>Mission updates include the Mission board/Kanban link.<br><br>Usage:<br>/updat [truncated] | Usage is explicit. | Keep the current shape; only minor polish needed.
`/model` | Models | 5 (excellent) | `read_only` | 🧠 Spark model routing<br><br>Current<br>• Agent chat: audit_unsupported (glm-5.1)<br>• Missions: codex (gpt-5.5)<br><br>Common switches<br>• /model agent codex<br>• /model agent claude claude-sonnet-4-6<br>• /model mission codex<br>• [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/models` | Models | 5 (excellent) | `read_only` | 🧭 Recommended Spark provider paths<br><br>Choose one provider first. Spark uses it for agent chat, runtime, memory, retrieval, and missions. You can split agent vs mission later.<br><br>Fast picks<br>• Have ChatGPT/Code [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/workspaces` | Workspace | 4 (good) | `read_only` | This operating system request needs Access level 4 for sandboxed local work, or Access level 5 for whole-computer work, but this chat is at Access level 3.<br>You can say "change my access level to 4" or send [truncated] | First line is too dense to scan as a headline. | Keep the current shape; only minor polish needed.
`/workspace` | Workspace | 3 (okay) | `read_only` | This operating system request needs Access level 4 for sandboxed local work, or Access level 5 for whole-computer work, but this chat is at Access level 3.<br>You can say "change my access level to 4" or send [truncated] | First line is too dense to scan as a headline.; Redundant alias; useful for compatibility, noisy in command help. | Keep as compatibility, but stop advertising it as a primary command.
`/creator` | Creator/Chip | 5 (excellent) | `usage_only` | Usage: /creator plan [private\|github\|swarm] [risk low\|medium\|high] <brief><br> /creator run <mission-creator-id><br> /creator status <mission-creator-id><br> /creator validate <mission-creator-id> [maxCommands]<br>Exa [truncated] | Usage is explicit. | Keep the current shape; only minor polish needed.
`/chip` | Creator/Chip | 3 (okay) | `usage_only` | Usage: /chip create <natural language description> | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Tighten the first line and add one clearer next action.
`/loop` | Creator/Chip | 3 (okay) | `usage_only` | Usage: /loop <chip_key> [rounds]<br>Runs a recursive self-improving loop: each round calls the chip's suggest hook for candidates, then evaluates them.<br>Example: /loop startup-yc 3 | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Tighten the first line and add one clearer next action.
`/recursive` | Recursive | 5 (excellent) | `usage_only` | Spark Recursive Loops<br><br>Start here:<br>/recursive sessions - recent loops and next action<br>/recursive report <id> - readable result summary<br>/recursive start <targetKey> rounds <n> - run a local Builder chip loo [truncated] | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/schedule` | Scheduling | 3 (okay) | `usage_only` | Usage: /schedule "<cron>" mission <goal><br> /schedule "<cron>" loop <chipKey> [rounds]<br>Example: /schedule "*/5 * * * *" loop startup-yc 2 | Usage is explicit.; Clear but terse; no extra reassurance or examples beyond syntax. | Tighten the first line and add one clearer next action.
`/schedules` | Scheduling | 5 (excellent) | `stubbed` | No schedules. | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/clarify` | Clarification | 5 (excellent) | `read_only` | No pending clarification for you. Send a /build message first. | Readable and compact in the safe harness. | Keep the current shape; only minor polish needed.
`/resonance` | Deferred Dashboard | 5 (excellent) | `read_only` | Resonance<br><br>⚠️ Legacy dashboard commands are paused for launch v1.<br><br>Ready now<br>• Telegram chat and command routing<br>• Builder memory when the local bridge is healthy<br>• Spawner mission relay when local service [truncated] | Readable and compact in the safe harness. | Hide or retire this from Telegram help until the dashboard surface is real.
`/insights` | Deferred Dashboard | 5 (excellent) | `read_only` | ⚠️ Legacy dashboard commands are paused for launch v1.<br><br>Ready now<br>• Telegram chat and command routing<br>• Builder memory when the local bridge is healthy<br>• Spawner mission relay when local services are runni [truncated] | Readable and compact in the safe harness. | Hide or retire this from Telegram help until the dashboard surface is real.
`/lessons` | Deferred Dashboard | 5 (excellent) | `read_only` | ⚠️ Legacy dashboard commands are paused for launch v1.<br><br>Ready now<br>• Telegram chat and command routing<br>• Builder memory when the local bridge is healthy<br>• Spawner mission relay when local services are runni [truncated] | Readable and compact in the safe harness. | Hide or retire this from Telegram help until the dashboard surface is real.
`/process` | Deferred Dashboard | 5 (excellent) | `read_only` | Processing queue... | Readable and compact in the safe harness. | Hide or retire this from Telegram help until the dashboard surface is real.
`/reflect` | Deferred Dashboard | 5 (excellent) | `read_only` | Starting deep reflection... | Readable and compact in the safe harness. | Hide or retire this from Telegram help until the dashboard surface is real.

## Family Notes

### Access

Average: 4.67 / 5.

No commands in this family scored below okay in the safe harness.

### Builder

Average: 4.33 / 5.

No commands in this family scored below okay in the safe harness.

### Builder Diagnostics

Average: 4.14 / 5.

No commands in this family scored below okay in the safe harness.

### Builder/AOC

Average: 3.88 / 5.

No commands in this family scored below okay in the safe harness.

### Clarification

Average: 5.00 / 5.

No commands in this family scored below okay in the safe harness.

### Creator/Chip

Average: 3.67 / 5.

No commands in this family scored below okay in the safe harness.

### Deferred Dashboard

Average: 5.00 / 5.

No commands in this family scored below okay in the safe harness.

### Memory

Average: 5.00 / 5.

No commands in this family scored below okay in the safe harness.

### Mission Control

Average: 4.00 / 5.

No commands in this family scored below okay in the safe harness.

### Mission Start

Average: 3.00 / 5.

No commands in this family scored below okay in the safe harness.

### Models

Average: 5.00 / 5.

No commands in this family scored below okay in the safe harness.

### Onboarding

Average: 4.50 / 5.

No commands in this family scored below okay in the safe harness.

### Recursive

Average: 5.00 / 5.

No commands in this family scored below okay in the safe harness.

### Route Diagnostics

Average: 3.75 / 5.

No commands in this family scored below okay in the safe harness.

### Scheduling

Average: 4.00 / 5.

No commands in this family scored below okay in the safe harness.

### Status

Average: 4.67 / 5.

No commands in this family scored below okay in the safe harness.

### Workspace

Average: 3.50 / 5.

No commands in this family scored below okay in the safe harness.

## Captured Reply Snippets

### /start

Score: 4 (good). Intent: Show first-run help and current launch posture.

Reply 1:

```text
👋 Hey Audit, I'm Spark.
⚠️ Builder memory is offline right now, so I will avoid claiming saved memory.
✅ Mission relay is reachable.

Good first moves:
• /status - health and access
• /diagnose - deeper health check
• /remember <text> - save an important detail
• /recall <topic> - ask what I remember

You can also just chat with me here.

Admin shortcuts:
• /run <goal> - start a Spawner mission
• /board - mission board
• /access <1|2|3|4|5> - choose chat permissions
• /access 5 - Approve Level 5 setup from Telegram
• /model - model routing
• /workspaces - local project folders

Advanced:
• /creator, /recursive, /context, /probe, /trace, /memory_movement, /wiki
```

Reply 2:

```text
Choose how much access this Telegram chat has.

Levels:
• 1 - Chat, memory, recall, diagnostics. No builds.
• 2 - Requested builds and missions.
• 3 - Public research plus requested builds. No local files.
• 4 - Workspace files and local debugging (`/access 4`). Recommended; setup: `/access_setup`.
• 5 - Whole-computer operator mode (`/access 5`). Confirm once.

Safety stays on: Spark still asks before secrets, destructive actions, publishing, or deploying.

Default right now: Access level 3.
Change it anytime with `/access 1` through `/access 5`.
```

### /myid

Score: 5 (excellent). Intent: Return the Telegram ID needed for allow/admin setup.

Reply 1:

```text
Your Telegram ID: 910000001
Username: @none
You are an admin
```

### /access

Score: 5 (excellent). Intent: Show current chat access and capability status.

Reply 1 (with keyboard):

```text
Spark access: Access level 3
Current
• Public links, docs, GitHub research, and requested builds are on.
• Local files are off.

Levels:
• 1 - Chat, memory, recall, diagnostics. No builds.
• 2 - Requested builds and missions.
• 3 - Public research plus requested builds. No local files.
• 4 - Workspace files and local debugging (`/access 4`). Recommended; setup: `/access_setup`.
• 5 - Whole-computer operator mode (`/access 5`). Confirm once.

Safety stays on: Spark still asks before secrets, destructive actions, publishing, or deploying.

Change anytime: `/access 1` through `/access 5`.

Access: Access level 3.
Runner: writable here.
Verdict: local filesystem work is off at this level.
```

### /access_setup

Score: 5 (excellent). Intent: Run safe workspace setup from Telegram.

Reply 1:

```text
⚠️ Set up safe workspace could not run.

Why: Spark CLI is not available to this Telegram runtime.

Next move: run /diagnose, or run the same access action from the Spark CLI.
```

### /docker_doctor

Score: 5 (excellent). Intent: Check Docker sandbox readiness.

Reply 1:

```text
⚠️ Check runner could not run.

Why: Spark CLI is not available to this Telegram runtime.

Next move: run /diagnose, or run the same access action from the Spark CLI.
```

### /docker_smoke

Score: 4 (good). Intent: Prompt before running Docker sandbox smoke.

Reply 1 (with keyboard):

```text
This runs a no-secret Docker sandbox smoke. It may build or use a local image, but should not mount your home folder, Spark secrets, or the Docker socket.

To continue, send /docker_smoke confirm or tap Confirm.
```

### /level5_setup

Score: 4 (good). Intent: Prompt before Level 5 setup.

Reply 1 (with keyboard):

```text
Level 5 is whole-computer operator mode. Spark will write local guardrail env files and require a restart before it becomes active.

To continue, send /level5_setup confirm or tap Confirm.
```

### /level5_disable

Score: 5 (excellent). Intent: Prompt before returning to safer sandbox.

Reply 1 (with keyboard):

```text
This changes Spark access guardrail state and requires confirmation.

To continue, send /level5_disable confirm or tap Confirm.
```

### /status

Score: 4 (good). Intent: Summarize launch health and access state.

Reply 1:

```text
✅ System status

Builder memory: ⚠️ offline (auto)

⚠️ Spark Live health is unverified.

What happened
• Spark CLI is not available to this Telegram runtime.

What this means
• Telegram could not prove live Spark health from here.
• This is not proof that Spawner or Telegram are offline.

Next move
• Run /diagnose, or check `spark live status` from the Spark CLI.

⚠️ Spark Access status is partly unverified.

Chat setting: Access level 3.
CLI effective access: unavailable.
Why: Spark CLI is not available to this Telegram runtime.

Runner: writable here.

Verdict: this runner could not read the authoritative access state, so I will not claim Level 5 is active.
```

### /diagnose

Score: 5 (excellent). Intent: Run full stack health diagnostics.

Reply 1:

```text
🔎 Running diagnostics...

Checks chat, access, relay, Spawner, and provider ping. Takes ~30s.
```

Reply 2:

```text
🔴 Spark diagnostics found an issue.
Health
🟢 Relay ready
🔴 Chat degraded
🟡 Builds degraded
🟢 Access Access level 3 / admin
Issue
plain chat provider is unhealthy. Check the selected chat model key/base URL, then restart the Telegram gateway.
Routes
Chat: zai
Builds: codex
Providers: 1/2 ready
Ping: codex failed
Workspace
Board: 0 running / 0 completed / 0 failed
Spawner UI: http://localhost:3333
Checked in 0.0s.
```

### /spark

Score: 5 (excellent). Intent: Show quick Spark launch-core status.

Reply 1:

```text
Spark Intelligence

✅ Spark Telegram launch core is online.

Ready now
• Chat and command routing through Telegram
• Builder memory when the local bridge is healthy
• Spawner mission relay when local services are running

Paused
• Legacy resonance/dashboard commands

Next move: use /status for live health or /run <goal> for missions.
```

### /about

Score: 5 (excellent). Intent: Ask Builder what it knows about the user.

Reply 1:

```text
⚠️ Memory is degraded/offline right now.

I should answer from the current thread instead of treating old memory as authority.

Next move: run /diagnose if you want to check Builder memory.
```

### /remember

Score: 5 (excellent). Intent: Validate remember usage without writing memory.

Reply 1:

```text
🧠 Save a memory

Use: /remember <something important>
Example: /remember I prefer concise mission updates.
```

### /recall

Score: 5 (excellent). Intent: Validate recall usage without querying memory.

Reply 1:

```text
🔎 Recall memory

Use: /recall <topic>
Example: /recall mission update preferences
```

### /forget

Score: 5 (excellent). Intent: Validate forget usage without changing memory.

Reply 1:

```text
🧹 Forget memory

Use: /forget <thing to forget>
Example: /forget my old project nickname

If Builder memory is offline, try again after /diagnose shows memory is healthy.
```

### /context

Score: 5 (excellent). Intent: Show Agent Operating Context.

Reply 1:

```text
⚠️ Spark could not reach the Builder memory path right now.

Why: Builder bridge command did not finish cleanly.

Next move
• Check now: Run /diagnose so Spark can check Builder, memory, and the selected memory model.
• Operator fix: spark fix telegram, then spark verify --onboarding.

Still stuck: spark doctor llm "Spark builder failure: builder_or_memory" --save-report --upstream-report
```

### /operating_context

Score: 3 (okay). Intent: Alias for Agent Operating Context.

Reply 1:

```text
⚠️ Spark could not reach the Builder memory path right now.

Why: Builder bridge command did not finish cleanly.

Next move
• Check now: Run /diagnose so Spark can check Builder, memory, and the selected memory model.
• Operator fix: spark fix telegram, then spark verify --onboarding.

Still stuck: spark doctor llm "Spark builder failure: builder_or_memory" --save-report --upstream-report
```

### /agent_context

Score: 3 (okay). Intent: Alias for Agent Operating Context.

Reply 1:

```text
⚠️ Spark could not reach the Builder memory path right now.

Why: Builder bridge command did not finish cleanly.

Next move
• Check now: Run /diagnose so Spark can check Builder, memory, and the selected memory model.
• Operator fix: spark fix telegram, then spark verify --onboarding.

Still stuck: spark doctor llm "Spark builder failure: builder_or_memory" --save-report --upstream-report
```

### /aoc

Score: 5 (excellent). Intent: Short alias for Agent Operating Context.

Reply 1:

```text
⚠️ Spark could not reach the Builder memory path right now.

Why: Builder bridge command did not finish cleanly.

Next move
• Check now: Run /diagnose so Spark can check Builder, memory, and the selected memory model.
• Operator fix: spark fix telegram, then spark verify --onboarding.

Still stuck: spark doctor llm "Spark builder failure: builder_or_memory" --save-report --upstream-report
```

### /conversation_context

Score: 4 (good). Intent: Show conversation-frame diagnostics.

Reply 1:

```text
Conversation context harness
- Hot turns: 0
- Warm summary tokens: 0
- Artifacts: 0
- Compaction events: 0
- Safe input budget: unknown
- Requires larger model for full target: unknown
```

### /black_box

Score: 5 (excellent). Intent: Show black-box trace usage.

Reply 1:

```text
Agent black box
Usage: /black_box [request_id]

This shows compact event evidence only. It does not promote memory or grant authority.
```

### /blackbox

Score: 3 (okay). Intent: Alias for black-box trace usage.

Reply 1:

```text
Agent black box
Usage: /black_box [request_id]

This shows compact event evidence only. It does not promote memory or grant authority.
```

### /black-box

Score: 3 (okay). Intent: Hyphen alias for black-box trace usage.

Reply 1:

```text
Agent black box
Usage: /black_box [request_id]

This shows compact event evidence only. It does not promote memory or grant authority.
```

### /self

Score: 5 (excellent). Intent: Show Spark self-awareness status.

Reply 1:

```text
⚠️ Spark could not reach the Builder memory path right now.

Why: Builder bridge command did not finish cleanly.

Next move
• Check now: Run /diagnose so Spark can check Builder, memory, and the selected memory model.
• Operator fix: spark fix telegram, then spark verify --onboarding.

Still stuck: spark doctor llm "Spark builder failure: builder_or_memory" --save-report --upstream-report
```

### /wiki

Score: 5 (excellent). Intent: Show wiki health/status.

Reply 1:

```text
⚠️ Spark could not reach the Builder memory path right now.

Why: Builder bridge command did not finish cleanly.

Next move
• Check now: Run /diagnose so Spark can check Builder, memory, and the selected memory model.
• Operator fix: spark fix telegram, then spark verify --onboarding.

Still stuck: spark doctor llm "Spark builder failure: builder_or_memory" --save-report --upstream-report
```

### /voice

Score: 3 (okay). Intent: Show voice route/onboarding status.

Reply 1:

```text
Voice is routed through Builder now, but the Builder voice route did not answer this turn. Run `/diagnose`, then try `/voice` again.
```

### /ledger

Score: 5 (excellent). Intent: Review capability ledger.

Reply 1:

```text
Capability ledger review is unavailable right now. Run /diagnose to check the Builder bridge.
```

### /capabilities

Score: 5 (excellent). Intent: Show capability garden summary.

Reply 1:

```text
Capability garden needs review.

State
• 7 cards
• Status: local-artifacts=2, schema-shaped=3, seen=2
• Surfaces: creator-system=1, specialization-path=6

Review
• Cards are evidence, not trust.
• Gate verdicts, privacy review, rollback refs, and publication proof still decide promotion.

Top cards
• creator-system:spark-domain-chip-labs: local-artifacts (3 blockers)
• specialization-path:spark-researcher-specialization-path: schema-shaped (3 blockers)
• specialization-path:spark-swarm: local-artifacts (3 blockers)

Workspace
• Full evidence: `spark os capabilities --json`
```

### /authority

Score: 4 (good). Intent: Show authority status summary.

Reply 1:

```text
Authority view has gated actions.

State
- Access L4; lane spark_workspace
- 5 Telegram access profiles; 5 Spawner lanes
- 5 browser approvals from 20 hooks
- 5 toxic capability pairs; 3 publication checks tracked
- Trace verdicts: 26; verdicts allowed, blocked; actions mission_execution

Review
- This is evidence, not permission.
- High-agency actions still need source policy, runner state, confirmation, and trace.

Workspace
- Full evidence: `spark os authority --json` and `spark os trace --json`
```

### /trace

Score: 4 (good). Intent: Show trace repair summary.

Reply 1:

```text
Trace repair needs attention.

State
• 38898 Builder events; 2378 trace groups
• 32808 missing trace refs; 3241 open high-severity events
• 0 orphan parent links

Recent
• 1h: 0/0 missing (0%)
• 24h: 0/3 missing (0%)
• 7d: 10317/12726 missing (81.1%)

Top gaps
• memory_orchestrator/memory_read_requested: 8612 recorded/medium
• memory_orchestrator/memory_read_succeeded: 4307 recorded/medium
• attachment_snapshot/plugin_or_chip_influence_recorded: 2326 recorded/medium

Joins
• Spawner derived refs 119; Builder request overlaps 23/192
• Builder trace overlaps 23; Telegram final-answer join join_key_present

Review
• Trace health is observability evidence, not task success or memory truth.

Workspace
• Full evidence: `spark os trace --json`
```

### /trace_repair

Score: 3 (okay). Intent: Alias for trace repair summary.

Reply 1:

```text
Trace repair needs attention.

State
• 38898 Builder events; 2378 trace groups
• 32808 missing trace refs; 3241 open high-severity events
• 0 orphan parent links

Recent
• 1h: 0/0 missing (0%)
• 24h: 0/3 missing (0%)
• 7d: 10317/12726 missing (81.1%)

Top gaps
• memory_orchestrator/memory_read_requested: 8612 recorded/medium
• memory_orchestrator/memory_read_succeeded: 4307 recorded/medium
• attachment_snapshot/plugin_or_chip_influence_recorded: 2326 recorded/medium

Joins
• Spawner derived refs 119; Builder request overlaps 23/192
• Builder trace overlaps 23; Telegram final-answer join join_key_present

Review
• Trace health is observability evidence, not task success or memory truth.

Workspace
• Full evidence: `spark os trace --json`
```

### /memory_movement

Score: 5 (excellent). Intent: Show memory movement summary.

Reply 1:

```text
Memory movement is visible.

State
• supported; 5654 movement rows
• Movement: captured=81, saved=81, promoted=381, retrieved=2613, summarized=48
• Authority: authoritative_current=1970, authoritative_historical=1344, supporting_not_authoritative=2338, structured_support=2
• Records: current_state=327, events=503, observations=821
• KB files 362; current-state files 23

Review
• Movement rows are evidence, not instructions.
• Blocked or dropped rows still need a separate promotion gate.

Next
• Have Builder write artifacts/memory-movement-index/memory-movement-status.json from inspect_memory_movement_status().
• Have domain-chip-memory expose movement counts by lane, authority, source family, and record type without record text.

Workspace
• Full evidence: `spark os memory --json`
```

### /memory_flow

Score: 3 (okay). Intent: Alias for memory movement summary.

Reply 1:

```text
Memory movement is visible.

State
• supported; 5654 movement rows
• Movement: captured=81, saved=81, promoted=381, retrieved=2613, summarized=48
• Authority: authoritative_current=1970, authoritative_historical=1344, supporting_not_authoritative=2338, structured_support=2
• Records: current_state=327, events=503, observations=821
• KB files 362; current-state files 23

Review
• Movement rows are evidence, not instructions.
• Blocked or dropped rows still need a separate promotion gate.

Next
• Have Builder write artifacts/memory-movement-index/memory-movement-status.json from inspect_memory_movement_status().
• Have domain-chip-memory expose movement counts by lane, authority, source family, and record type without record text.

Workspace
• Full evidence: `spark os memory --json`
```

### /probe

Score: 4 (good). Intent: Show route probe help.

Reply 1:

```text
Route probe
Usage: /probe <route>
Batch: /probe core or /probe all

Routes:
- core
- all
- builder
- spawner
- memory
- researcher
- swarm
- browser
- local_work
```

### /route_probe

Score: 3 (okay). Intent: Alias for route probe help.

Reply 1:

```text
Route probe
Usage: /probe <route>
Batch: /probe core or /probe all

Routes:
- core
- all
- builder
- spawner
- memory
- researcher
- swarm
- browser
- local_work
```

### /nl_route

Score: 5 (excellent). Intent: Show natural-route probe help.

Reply 1:

```text
Natural route probe
Usage: /nl_route <message>

This shows the diagnostic route decision only. It does not execute the route.
```

### /natural_route

Score: 3 (okay). Intent: Alias for natural-route probe help.

Reply 1:

```text
Natural route probe
Usage: /nl_route <message>

This shows the diagnostic route decision only. It does not execute the route.
```

### /run

Score: 3 (okay). Intent: Show mission-start usage.

Reply 1:

```text
Usage: /run <goal> (default: current mission provider)
```

### /runminimax

Score: 3 (okay). Intent: Show MiniMax run shortcut usage.

Reply 1:

```text
Usage: /runminimax <goal>
```

### /runglm

Score: 3 (okay). Intent: Show Z.AI/GLM run shortcut usage.

Reply 1:

```text
Usage: /runglm <goal> (Z.AI GLM)
```

### /runzai

Score: 3 (okay). Intent: Show Z.AI run shortcut usage.

Reply 1:

```text
Usage: /runzai <goal>
```

### /runclaude

Score: 3 (okay). Intent: Show Claude run shortcut usage.

Reply 1:

```text
Usage: /runclaude <goal>
```

### /runcodex

Score: 3 (okay). Intent: Show Codex run shortcut usage.

Reply 1:

```text
Usage: /runcodex <goal>
```

### /run2

Score: 3 (okay). Intent: Show two-provider consensus usage.

Reply 1:

```text
Usage: /run2 <goal> (consensus: minimax + zai)
```

### /runall

Score: 3 (okay). Intent: Show all-provider run usage.

Reply 1:

```text
Usage: /runall <goal> (all 4 providers)
```

### /board

Score: 4 (good). Intent: Show mission board summary.

Reply 1:

```text
Spawner Board

Running: 0
- none

Paused: 0
- none

Completed: 0
- none

Failed: 0
- none

Created: 0
- none
```

### /mission

Score: 3 (okay). Intent: Show mission control usage.

Reply 1:

```text
Usage: /mission <status|pause|resume|kill> <missionId>
```

### /updates

Score: 5 (excellent). Intent: Show mission update preferences.

Reply 1:

```text
Live mission updates are set to normal.
Normal sends pickup, canvas-ready, final handoff, and failures.
Mission links are set to board.
Mission updates include the Mission board/Kanban link.

Usage:
/updates minimal | /updates normal | /updates verbose
/updates links none | kanban | canvas | both
```

### /model

Score: 5 (excellent). Intent: Show current model routing.

Reply 1:

```text
🧠 Spark model routing

Current
• Agent chat: audit_unsupported (glm-5.1)
• Missions: codex (gpt-5.5)

Common switches
• /model agent codex
• /model agent claude claude-sonnet-4-6
• /model mission codex
• /model mission claude claude-opus-4-7

More options
• /models - curated provider defaults
• /models claude - provider-specific details
• /model agent lmstudio <loaded-model-id>

You can pass an exact model id as the third value. Run /diagnose after changing to verify the route.
```

### /models

Score: 5 (excellent). Intent: Show model recommendations.

Reply 1:

```text
🧭 Recommended Spark provider paths

Choose one provider first. Spark uses it for agent chat, runtime, memory, retrieval, and missions. You can split agent vs mission later.

Fast picks
• Have ChatGPT/Codex: codex with gpt-5.5
• Have Claude: claude with Sonnet for agent, Opus for hard missions
• Have API keys: OpenAI, OpenRouter, Z.AI, MiniMax, or Hugging Face
• Want local/private: LM Studio for desktop, Ollama for terminal

Provider defaults
• zai: API key; agent glm-5.1; mission glm-5.1
• codex: ChatGPT/Codex sign-in; agent gpt-5.5; mission gpt-5.5
• claude: Claude sign-in or API key; agent Claude Sonnet 4.6 (claude-sonnet-4-6); mission Claude Opus 4.7 (claude-opus-4-7)
• openai: OpenAI API key; agent gpt-5.5; mission gpt-5.5
• openrouter: API gateway; agent openai/gpt-5.5; mission openai/gpt-5.5
• lmstudio: Local/private desktop; agent local-model; mission local-model
• [truncated]
```

### /workspaces

Score: 4 (good). Intent: Show local workspace inventory or access denial.

Reply 1:

```text
This operating system request needs Access level 4 for sandboxed local work, or Access level 5 for whole-computer work, but this chat is at Access level 3.
You can say "change my access level to 4" or send `/access 4` for Spark sandbox workspaces, or `/access 5` only when you really want whole-computer operator mode.
```

### /workspace

Score: 3 (okay). Intent: Alias for local workspace inventory.

Reply 1:

```text
This operating system request needs Access level 4 for sandboxed local work, or Access level 5 for whole-computer work, but this chat is at Access level 3.
You can say "change my access level to 4" or send `/access 4` for Spark sandbox workspaces, or `/access 5` only when you really want whole-computer operator mode.
```

### /creator

Score: 5 (excellent). Intent: Show creator mission usage.

Reply 1:

```text
Usage: /creator plan [private|github|swarm] [risk low|medium|high] <brief>
 /creator run <mission-creator-id>
 /creator status <mission-creator-id>
 /creator validate <mission-creator-id> [maxCommands]
Example: /creator plan private risk medium create a Startup YC benchmarked specialization path
Example: /creator run mission-creator-1776768300668
Example: /creator validate mission-creator-1776768300668 6
```

### /chip

Score: 3 (okay). Intent: Show chip creation usage.

Reply 1:

```text
Usage: /chip create <natural language description>
```

### /loop

Score: 3 (okay). Intent: Show chip autoloop usage.

Reply 1:

```text
Usage: /loop <chip_key> [rounds]
Runs a recursive self-improving loop: each round calls the chip's suggest hook for candidates, then evaluates them.
Example: /loop startup-yc 3
```

### /recursive

Score: 5 (excellent). Intent: Show recursive Workspace help.

Reply 1:

```text
Spark Recursive Loops

Start here:
/recursive sessions - recent loops and next action
/recursive report <id> - readable result summary
/recursive start <targetKey> rounds <n> - run a local Builder chip loop

When something needs you:
/recursive review [id] - decisions waiting
/recursive approve <id> [rationale]
/recursive defer <id> <rationale>
/recursive reject <id> <rationale>
/recursive more-eval <id> <rationale>

Deep cuts:
/recursive paths - specialization lanes
/recursive trace <id> - detailed timeline
/recursive propose <chip-or-path-name> [submit]
/recursive sync prompt-benchmark <runJson> [report <reportPath>]
/recursive sync domain-chip-lab <telemetryJson> <chipKey> [chip-path <path>] [packet <path>]
/recursive sync domain-autoloop <manifestJson> <stateJson> [policy <path>] [journal <path>] [lane-report <path>]

Local mode: reports come from status files on this [truncated]
```

### /schedule

Score: 3 (okay). Intent: Show schedule creation usage.

Reply 1:

```text
Usage: /schedule "<cron>" mission <goal>
 /schedule "<cron>" loop <chipKey> [rounds]
Example: /schedule "*/5 * * * *" loop startup-yc 2
```

### /schedules

Score: 5 (excellent). Intent: List schedules.

Reply 1:

```text
No schedules.
```

### /clarify

Score: 5 (excellent). Intent: Handle a pending clarification answer.

Reply 1:

```text
No pending clarification for you. Send a /build message first.
```

### /resonance

Score: 5 (excellent). Intent: Show deferred resonance status.

Reply 1:

```text
Resonance

⚠️ Legacy dashboard commands are paused for launch v1.

Ready now
• Telegram chat and command routing
• Builder memory when the local bridge is healthy
• Spawner mission relay when local services are running

Next move: use /status, /diagnose, /run, or /board.
```

### /insights

Score: 5 (excellent). Intent: Show deferred insights status.

Reply 1:

```text
⚠️ Legacy dashboard commands are paused for launch v1.

Ready now
• Telegram chat and command routing
• Builder memory when the local bridge is healthy
• Spawner mission relay when local services are running

Next move: use /status, /diagnose, /run, or /board.
```

### /lessons

Score: 5 (excellent). Intent: Show deferred lessons status.

Reply 1:

```text
⚠️ Legacy dashboard commands are paused for launch v1.

Ready now
• Telegram chat and command routing
• Builder memory when the local bridge is healthy
• Spawner mission relay when local services are running

Next move: use /status, /diagnose, /run, or /board.
```

### /process

Score: 5 (excellent). Intent: Show deferred queue processing status.

Reply 1:

```text
Processing queue...
```

Reply 2:

```text
⚠️ Legacy dashboard commands are paused for launch v1.

Ready now
• Telegram chat and command routing
• Builder memory when the local bridge is healthy
• Spawner mission relay when local services are running

Next move: use /status, /diagnose, /run, or /board.
```

### /reflect

Score: 5 (excellent). Intent: Show deferred reflection status.

Reply 1:

```text
Starting deep reflection...
```

Reply 2:

```text
⚠️ Legacy dashboard commands are paused for launch v1.

Ready now
• Telegram chat and command routing
• Builder memory when the local bridge is healthy
• Spawner mission relay when local services are running

Next move: use /status, /diagnose, /run, or /board.
```

## Interpretation

This is not a substitute for a live Telegram smoke with real Builder, Spawner, Spark CLI, and provider services online. It is valuable because it forces every registered command through Telegram composition and catches the failure/help/default states that users often see first.

Recommended next live pass: run the same command list against a private test chat with Builder and Spawner online, then compare success-path replies against this safe-harness baseline.
