import assert from 'node:assert/strict';

type AsyncTest = () => Promise<void> | void;
const tests: Array<{ name: string; fn: AsyncTest }> = [];

function test(name: string, fn: AsyncTest): void {
  tests.push({ name, fn });
}

process.nextTick(() => {
  void (async () => {
    for (const { name, fn } of tests) {
      try {
        await fn();
        console.log(`ok - ${name}`);
      } catch (error) {
        console.error(`not ok - ${name}`);
        throw error;
      }
    }
  })().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
});

function fakeCtx(
  text: string,
  replies: string[],
  mediaReplies: { voice: unknown[]; audio: unknown[] } = { voice: [], audio: [] }
) {
  const message = { message_id: 9101, text };
  return {
    chat: { id: 8319079055, type: 'private' },
    from: { id: 8319079055, username: 'qa' },
    message,
    update: { update_id: 9101, message },
    sendChatAction: async (_action: string) => {},
    reply: async (reply: string) => {
      replies.push(reply);
    },
    replyWithVoice: async (inputFile: unknown, options?: unknown) => {
      mediaReplies.voice.push({ inputFile, options });
    },
    replyWithAudio: async (inputFile: unknown, options?: unknown) => {
      mediaReplies.audio.push({ inputFile, options });
    }
  };
}

test('no-execution meta action words bypass Builder bridge detours', async () => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '123:test';
  process.env.ADMIN_TELEGRAM_IDS = '8319079055';
  process.env.SPARK_BOT_TEST_MODE = '1';
  process.env.SPARK_AGENT_ACCESS_PROFILE = 'developer';
  process.env.SPARK_BUILDER_BRIDGE_MODE = 'auto';

  const indexModule: any = await import('../src/index');
  const llmModule = await import('../src/llm');
  const originalChat = llmModule.llm.chat;
  let bridgeCalls = 0;

  indexModule.__setBuilderBridgeRunnerForTest(async () => {
    bridgeCalls += 1;
    return {
      used: true,
      responseText: "I can't search the web right now.\nMy live browser session dropped.",
      decision: 'blocked',
      bridgeMode: 'blocked',
      routingDecision: 'browser_unavailable'
    };
  });
  llmModule.llm.chat = async () => (
    "Those are example words, not commands. I will keep this in chat and won't launch, save, schedule, or run anything."
  );

  try {
    const text = 'TurnIntent live QA: The words build, memory, schedule, provider, run, and Codex are examples only. Do not start, save, schedule, or run anything; answer conversationally in one short reply.';
    const replies: string[] = [];
    await indexModule.handleTextMessage(fakeCtx(text, replies));

    assert.equal(bridgeCalls, 0);
    assert.equal(replies.length, 1);
    assert.match(replies[0], /examples or context|example words, not commands|action words as language evidence/i);
    assert.doesNotMatch(replies[0], /search the web|browser session/i);
  } finally {
    llmModule.llm.chat = originalChat;
    indexModule.__setBuilderBridgeRunnerForTest(null);
  }
});

test('quoted drafted high-agency examples compose answers without Builder bridge detours', async () => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '123:test';
  process.env.ADMIN_TELEGRAM_IDS = '8319079055';
  process.env.SPARK_BOT_TEST_MODE = '1';
  process.env.SPARK_AGENT_ACCESS_PROFILE = 'developer';
  process.env.SPARK_BUILDER_BRIDGE_MODE = 'auto';

  const indexModule: any = await import('../src/index');
  const llmModule = await import('../src/llm');
  const originalChat = llmModule.llm.chat;
  let bridgeCalls = 0;
  let capturedPrompt = '';

  indexModule.__setBuilderBridgeRunnerForTest(async () => {
    bridgeCalls += 1;
    return {
      used: true,
      responseText: 'I will create the chip now.',
      decision: 'domain_chip.create',
      bridgeMode: 'test',
      routingDecision: 'domain_chip.create'
    };
  });
  llmModule.llm.chat = async (prompt: string) => {
    capturedPrompt = prompt;
    return 'That belongs in the documentation example. I would discuss the wording in chat and would not create a chip or write memory from this turn.';
  };

  try {
    const text = 'In documentation, should we include "create a memory chip" as an example?';
    const replies: string[] = [];
    await indexModule.handleTextMessage(fakeCtx(text, replies));

    assert.equal(bridgeCalls, 0);
    assert.equal(replies.length, 1);
    assert.match(replies[0], /documentation example|wording in chat/i);
    assert.match(replies[0], /not create a chip|would not create/i);
    assert.doesNotMatch(replies[0], /I will create the chip now/i);
    assert.match(capturedPrompt, /conversation\.quoted_drafted_example_boundary/);
    assert.match(capturedPrompt, /Allowed tool: answer\.compose only/);
    assert.match(capturedPrompt, /domain_chip\.create/);
    assert.match(capturedPrompt, /User message: In documentation/);
  } finally {
    llmModule.llm.chat = originalChat;
    indexModule.__setBuilderBridgeRunnerForTest(null);
  }
});

test('publication approval-list boundary bypasses Builder bridge detours', async () => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '123:test';
  process.env.ADMIN_TELEGRAM_IDS = '8319079055';
  process.env.SPARK_BOT_TEST_MODE = '1';
  process.env.SPARK_AGENT_ACCESS_PROFILE = 'developer';
  process.env.SPARK_BUILDER_BRIDGE_MODE = 'auto';

  const indexModule: any = await import('../src/index');
  let bridgeCalls = 0;

  indexModule.__setBuilderBridgeRunnerForTest(async () => {
    bridgeCalls += 1;
    return {
      used: true,
      responseText: 'I can help publish it now.',
      decision: 'plain_chat',
      bridgeMode: 'test',
      routingDecision: 'plain_chat'
    };
  });

  try {
    const text = 'I might ask you to publish later, but right now just list what would need approval.';
    const replies: string[] = [];
    await indexModule.handleTextMessage(fakeCtx(text, replies));

    assert.equal(bridgeCalls, 0);
    assert.equal(replies.length, 1);
    assert.match(replies[0], /approval-list question only/i);
    assert.match(replies[0], /No publish, deploy, PR, merge, registry, or production action/i);
    assert.doesNotMatch(replies[0], /publish it now/i);
  } finally {
    indexModule.__setBuilderBridgeRunnerForTest(null);
  }
});

test('browser/computer-use authorization boundary bypasses Builder bridge detours', async () => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '123:test';
  process.env.ADMIN_TELEGRAM_IDS = '8319079055';
  process.env.SPARK_BOT_TEST_MODE = '1';
  process.env.SPARK_AGENT_ACCESS_PROFILE = 'developer';
  process.env.SPARK_BUILDER_BRIDGE_MODE = 'auto';

  const indexModule: any = await import('../src/index');
  let bridgeCalls = 0;

  indexModule.__setBuilderBridgeRunnerForTest(async () => {
    bridgeCalls += 1;
    return {
      used: true,
      responseText: 'I will use computer-use now.',
      decision: 'plain_chat',
      bridgeMode: 'test',
      routingDecision: 'plain_chat'
    };
  });

  try {
    const text = 'Do not use computer use. Tell me when computer use would be allowed.';
    const replies: string[] = [];
    await indexModule.handleTextMessage(fakeCtx(text, replies));

    assert.equal(bridgeCalls, 0);
    assert.equal(replies.length, 1);
    assert.match(replies[0], /Browser and computer-use should be authorized as tools/i);
    assert.match(replies[0], /stays chat-only/i);
    assert.match(replies[0], /No browser or computer-use tool is invoked/i);
    assert.doesNotMatch(replies[0], /use computer-use now/i);
  } finally {
    indexModule.__setBuilderBridgeRunnerForTest(null);
  }
});

test('old mission route bug boundary bypasses Builder bridge detours', async () => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '123:test';
  process.env.ADMIN_TELEGRAM_IDS = '8319079055';
  process.env.SPARK_BOT_TEST_MODE = '1';
  process.env.SPARK_AGENT_ACCESS_PROFILE = 'developer';
  process.env.SPARK_BUILDER_BRIDGE_MODE = 'auto';

  const indexModule: any = await import('../src/index');
  let bridgeCalls = 0;

  indexModule.__setBuilderBridgeRunnerForTest(async () => {
    bridgeCalls += 1;
    return {
      used: true,
      responseText: 'I will launch a mission now.',
      decision: 'plain_chat',
      bridgeMode: 'test',
      routingDecision: 'plain_chat'
    };
  });

  try {
    const text = 'I am describing the old bug: Spark saw "mission" and launched. Do not reproduce it.';
    const replies: string[] = [];
    await indexModule.handleTextMessage(fakeCtx(text, replies));

    assert.equal(bridgeCalls, 0);
    assert.equal(replies.length, 1);
    assert.match(replies[0], /route hijack/i);
    assert.match(replies[0], /Governor decision/i);
    assert.doesNotMatch(replies[0], /launch a mission now/i);
  } finally {
    indexModule.__setBuilderBridgeRunnerForTest(null);
  }
});

test('plain Builder replies drop voice media without delivery authorization', async () => {
  process.env.BOT_TOKEN = process.env.BOT_TOKEN || '123:test';
  process.env.ADMIN_TELEGRAM_IDS = '8319079055';
  process.env.SPARK_BOT_TEST_MODE = '1';
  process.env.SPARK_AGENT_ACCESS_PROFILE = 'developer';
  process.env.SPARK_BUILDER_BRIDGE_MODE = 'auto';

  const indexModule: any = await import('../src/index');

  try {
    const replies: string[] = [];
    const mediaReplies = { voice: [] as unknown[], audio: [] as unknown[] };
    await indexModule.deliverBuilderReply(
      fakeCtx('Give me one short thought.', replies, mediaReplies),
      {
        used: true,
        responseText: 'Here is the text answer.',
        decision: 'plain_chat',
        bridgeMode: 'test',
        routingDecision: 'plain_chat',
        voiceMedia: {
          audioBase64: Buffer.from('synthetic-audio').toString('base64'),
          mimeType: 'audio/ogg',
          filename: 'reply.ogg',
          voiceCompatible: true,
          spokenText: 'Here is the text answer.'
        }
      }
    );

    assert.deepEqual(mediaReplies.voice, []);
    assert.deepEqual(mediaReplies.audio, []);
    assert.equal(replies.length, 1);
    assert.equal(replies[0], 'Here is the text answer.');
  } finally {
    indexModule.__setBuilderBridgeRunnerForTest(null);
  }
});
