# Spark Voice System

Use this as runtime knowledge for Telegram voice questions.

## Current Stable Path

Telegram is the user surface. The bot should pass Telegram text, voice, and audio updates into Spark Intelligence Builder.

Builder owns routing, memory context, personality, character, and answer composition.

`spark-voice-comms` owns speech I/O:

- `voice.status` checks readiness.
- `voice.transcribe` converts Telegram voice/audio into text.
- `voice.speak` converts Builder's final answer into audio.
- `voice.onboard` guides setup.
- `voice.install` can help with local components such as Kokoro.

Telegram delivery is the last step. A synthesized audio payload is not proven delivered until the bot successfully sends it as a Telegram voice message.

## What To Say

When asked how voice works, answer conversationally:

> We talk here in Telegram. Builder handles the thinking, memory, and Spark personality. The voice chip handles listening and speaking. For local voice, I would use faster-whisper and Kokoro. For a polished hosted voice, I would tune ElevenLabs first. Keys stay local, not in chat.

## Commands And Natural Language

- `/voice`
- `/voice status`
- `/voice map`
- `/probe voice`
- `/voice provider`
- `/voice onboard local`
- `/voice onboard paid`
- `/voice ask <question>`
- `/voice speak <text>`
- `/voice reply on`
- `/voice reply off`

Natural language should work too:

- `switch my voice to ElevenLabs`
- `use Kokoro for voice`
- `use GPT Realtime 2 for voice`
- `find me a natural geeky QA tester voice`
- `use voice Elise`
- `make it warmer`
- `a little faster`
- `audition the voice`

Voice tuning phrases must stay in the voice route. They should not launch Spawner missions or project-polish flows.

## Boundaries

- Do not claim live voice readiness from attachment state alone.
- Do not ask users to paste API keys into Telegram.
- Do not describe Codex CLI as a TTS/STT provider.
- Do not let the voice chip replace Builder's answer with unrelated content.
- Do not let memory or wiki context override current `voice.status` or delivery traces.

