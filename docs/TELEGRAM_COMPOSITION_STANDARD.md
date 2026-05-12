# Spark Telegram Composition Standard

This is the product standard for dense Spark Telegram replies: recursive loop reports, diagnostics, creator/build status, Workspace sync, review queues, and natural-language command replies.

The original working rules lived in the local Codex skill:

```text
C:\Users\USER\.codex\skills\spark-telegram-composition\SKILL.md
```

This repo copy is the mergeable source for Telegram gateway behavior.

## Goal

Telegram should answer only four things:

1. What happened?
2. Is it good, neutral, blocked, or bad?
3. What matters now?
4. Where can I inspect the full evidence?

Everything else belongs in Workspace, Canvas, Kanban, logs, traces, dashboards, or linked reports.

## Core Rules

- Prefer one clear headline over a paragraph.
- Let the user's moment choose the shape: prose for reassurance, a compact card for status, and a picker when the user must choose a lane or item.
- Use one status icon at the start of major outcome rows.
- Do not combine icons with bullets, numbering, or extra markers on the same row.
- Use dotted bullets (`•`) for grouped facts under section headings such as Score, Review, Workspace, Sharing, Why, and Move.
- Prefer dotted bullets over hyphen bullets in polished Telegram replies.
- Keep each section to one job: score, review, workspace, movement, or next action.
- Avoid repeated facts. If the score appears once, do not restate it in another line.
- Deduplicate direct and indirect repeats before sending. If two rows mean the same thing to a human, merge them or keep only the clearer row.
- Collapse repeated run movement into one count-aware row, such as `2 previous rounds held steady`.
- Treat saved trace, score, baseline, manifest, and candidate artifact rows as evidence metadata when the outcome already explains the movement. Keep those rows in Workspace.
- Avoid raw IDs, hashes, opaque tokens, stack traces, timestamps, file paths, or provider details unless the user explicitly asked for raw details.
- Put raw evidence behind Workspace, Decisions, Canvas, Board, logs, or trace links.
- Local Workspace links should be real and clickable in Telegram. Prefer `127.0.0.1` over `localhost`.
- If Workspace is intentionally private or gated, say that plainly only when the user may hit the gate. Do not present it as a recursive-loop failure.
- Verify link text matches the actual served preview port before calling a Workspace link ready.
- Prefer one useful next move. Avoid command menus unless the user asked for options.
- When a row already starts with a symbol or icon, do not prefix it with `-`, `1.`, or any other decoration.
- Avoid database voice. Convert system nouns into human nouns unless the technical noun is the useful thing.
- Prefer `ready`, `needs review`, `blocked`, `running`, `held steady`, `improved`, and `regressed` over internal lifecycle names.
- Do not show normal internal state like `open`, `review clear`, `ready canvas`, or evidence counts unless they change what the user should think or do.
- Let the absence of a warning mean clear.
- Preserve Spark's voice through small, plain sentences. Do not make every reply a rigid report card.

## Default Layouts

### Outcome Report

```text
<status icon> Latest <thing> <result>.

Score
• <current metric>
• <comparison if useful>

Review
• <only if review is needed>

Workspace
• <link>
```

Example:

```text
⚪ Latest Spark QA Operator run held steady.

Score
• current run 0.8655
• unchanged from previous run

Workspace
• http://127.0.0.1:4178/runs?tab=recursions
```

### Recent Movement

```text
<Title>

🟢 latest run improved
⚪ previous run held steady
🟢 2 runs back improved

Workspace
http://127.0.0.1:4178/runs?tab=recursions
```

### Review Queue

```text
<Thing> review

Review
• <count> decisions waiting
• blocker: <main blocker>

Why
• <human reason>

Move
• <one useful move>

Workspace
• <link>
```

### Picker

```text
<Title>

🟡 <Human name>
<count> need review

⚪ <Human name>
clear

Use <one next command>.

Workspace
<link>
```

## Keep In Telegram

- Verdict.
- Metric that changed.
- Review count or blocker count.
- One next action when useful.
- One Workspace or surface link.

## Move Out Of Telegram

- Artifact inventories.
- Raw trace IDs.
- Exact timestamps unless timing is the point.
- Long local paths.
- Replay commands.
- Provider/router internals.
- Repeated summaries.
- Anything that reads like machine telemetry.

Only bring moved-out details back when the user asks for raw details, exact debug output, or the command that failed.

## Review Checklist

Before shipping a Telegram message:

- Can a non-technical user understand it in five seconds?
- Is there exactly one main thing to notice?
- Is each line carrying new information?
- Did we avoid double markers like `- <icon>` or `<icon> 1.`?
- Did we collapse repeated movement and artifact rows?
- Is raw evidence still accessible somewhere else?
- Is the next action obvious without being noisy?
- Does it sound like Spark helping a person, or like a service dumping JSON in nicer clothes?
