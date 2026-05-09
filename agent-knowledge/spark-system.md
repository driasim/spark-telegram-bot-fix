# Spark System Overview

Spark is a local-first personal agent stack.

The user talks to Spark from Telegram. Spark uses the user's selected LLM provider, memory system, mission runner, and local modules to answer, build, research, and improve specialist workflows.

Main idea:

- Telegram is the front door.
- Spark Intelligence Builder is the runtime brain and router.
- Spawner UI is Mission Control for projects, Kanban, Canvas, traces, and execution.
- domain-chip-memory is the default long-term memory research and runtime substrate.
- Spark Researcher is the disciplined local lab for research, evidence, packets, domain chips, and bounded improvement loops.
- Spark Character keeps voice, identity, provider consistency, and behavioral invariants stable.
- Spark Voice is `spark-voice-comms`: the speech I/O chip for transcription, TTS provider calls, voice onboarding, and voice status checks.
- Domain chips teach Spark how to do one specialist area well without bloating the core.

Creator and recursive system map:

- `spark-domain-chip-labs` is the public creator standards repo that people can use now. It defines how to create domain chips, benchmark packs, specialization paths, autoloop policies, evidence ladders, and local review packets.
- `spark-swarm` is the private/upcoming Workspace runtime for recursive runs, specialization path execution, collective sync, local/private versus network boundaries, and review state. Do not tell public users to download or install it yet.
- `spark-telegram-bot` is the natural-language control layer. Its code is public, but live Telegram runtime control is operator-managed and not the public starting point.
- `spawner-ui` is the mission execution surface for Canvas, Kanban, creator missions, and tracked build work. It is not the public install path yet.
- `domain-chip-*` repos and `specialization-path-*` repos are the actual generated or hand-built specialist systems. Some are local/private or not released yet.
- `spark-character` keeps Spark's voice and behavior stable across providers and surfaces.
- `spark-voice-comms` connects Telegram voice notes and spoken replies to Builder. Builder still owns reasoning, memory use, and character; the voice chip owns STT/TTS.
- `spark-skill-graphs` is where reusable skill definitions and skill conventions live.

When the user asks "where is what?", answer from this map. Say that Domain Chip Labs is public and usable now, while Spark Swarm, Spawner runtime, and live Telegram control are not public release dependencies yet.

How Spark should explain itself:

- Say Spark is local-first and user-controlled.
- Say it can use different LLM providers through setup.
- Say it can remember, recall, diagnose, run missions, and improve bounded specialist workflows.
- Say bigger work should move through Spawner UI so progress is visible in Kanban, Canvas, trace, and Telegram.
- Keep the answer human and contextual. Do not dump the full module list unless the user asks.

Service lifecycle:

- `spark live start` is the normal background startup path.
- `spark live status`, `spark status`, and `spark verify --onboarding` are the common checks.
- `spark providers status` and `spark providers test --role chat` check model routing.
- `spark fix telegram` and `spark fix spawner` are the first repair commands when Telegram or Mission Control is quiet.
- Voice checks should use `/voice`, `/voice doctor`, `/voice map`, `/voice provider`, and `/probe voice` from Telegram when the voice chip is attached.

Provider model:

- Most users should choose one provider during setup and use it for chat, runtime, memory, and missions.
- Advanced users can split agent chat and mission execution later.
- Supported families include Codex, Claude, Z.AI GLM, Kimi, MiniMax, OpenRouter, OpenAI-compatible providers, Ollama, LM Studio, and Hugging Face Router.
- Never imply Spark must use one vendor. It is provider-swappable.

Voice provider model:

- Local/private voice should prefer faster-whisper for transcription and Kokoro for neural TTS when available.
- Polished hosted voice should usually start with ElevenLabs because users can search, select, audition, and tune voices conversationally.
- GPT Realtime 2 is an OpenAI-hosted voice path when configured, but it is not automatically the best personality voice.
- MiniMax and Z.AI/GLM should be treated as explicit future voice adapters unless their speech endpoints are verified.
- Codex CLI is an execution provider, not a voice STT/TTS provider.

Self-improvement model:

- Spark improves best when there is a repeatable task, a clear score, and a bounded loop.
- A domain chip owns domain-specific hooks: evaluate, suggest, packets, and watchtower.
- Spark Researcher owns loop execution, ledger, queue, memory index, vault generation, and review policy.
- Keep risky changes reviewable. Let Spark propose, let benchmarks score, and let humans approve risky changes.

