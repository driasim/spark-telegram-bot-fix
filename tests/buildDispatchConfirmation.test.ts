import assert from 'node:assert/strict';

process.env.BOT_TOKEN = process.env.BOT_TOKEN || '123:test';

async function main(): Promise<void> {
  const {
    buildDispatchRouteConfidenceAllows,
    shouldUsePendingBuildDispatchConfirmationForMessage
  } = await import('../src/index');

  await test('route-confidence ask stores a resumable build confirmation before replying', async () => {
    const replies: string[] = [];
    let storedNextAction = '';
    const allowed = await buildDispatchRouteConfidenceAllows({
      ctx: {
        from: { id: 8319079055 },
        chat: { id: 8319079055 },
        reply: async (text: string) => {
          replies.push(text);
        }
      },
      accessRequirement: 'spawner_build',
      prd: 'Build a browser-playable voxel game for Spark.',
      requestId: 'tg-build-confirmation-test',
      traceRef: 'trace:spawner-prd:mission-confirmation-test',
      runnerPreflight: null,
      spawnerAvailableProbe: async () => true,
      gateRunner: async () => ({
        replyText: '',
        payload: {
          decision: 'ask',
          human_next_action: 'Reply go to confirm this exact build route.'
        }
      }),
      onConfirmationRequired: async ({ humanNextAction }) => {
        storedNextAction = humanNextAction;
      }
    });

    assert.equal(allowed, false);
    assert.equal(storedNextAction, 'Reply go to confirm this exact build route.');
    assert.equal(replies.length, 1);
    assert.match(replies[0], /I can prepare this build/);
    assert.match(replies[0], /Reply go to confirm this exact build route/);
  });

  await test('confirmed route-confidence rerun carries confirmed state into the Builder gate', async () => {
    let confirmationState = '';
    const allowed = await buildDispatchRouteConfidenceAllows({
      ctx: {
        from: { id: 8319079055 },
        chat: { id: 8319079055 },
        reply: async () => {}
      },
      accessRequirement: 'spawner_build',
      prd: 'Build a browser-playable voxel game for Spark.',
      requestId: 'tg-build-confirmation-test',
      traceRef: 'trace:spawner-prd:mission-confirmation-test',
      runnerPreflight: null,
      confirmationState: 'confirmed',
      spawnerAvailableProbe: async () => true,
      gateRunner: async (input = {}) => {
        confirmationState = String(input.routeContext?.confirmation_state || '');
        return {
          replyText: '',
          payload: { decision: 'act' }
        };
      }
    });

    assert.equal(allowed, true);
    assert.equal(confirmationState, 'confirmed');
  });

  test('pending build confirmation expires except for explicit confirmation words', () => {
    assert.equal(
      shouldUsePendingBuildDispatchConfirmationForMessage({ timestamp: Date.now() }, 'go'),
      true
    );
    assert.equal(
      shouldUsePendingBuildDispatchConfirmationForMessage({ timestamp: Date.now() }, 'what is Spark health right now'),
      true
    );
    assert.equal(
      shouldUsePendingBuildDispatchConfirmationForMessage({ timestamp: Date.now() - 31 * 60 * 1000 }, 'what is Spark health right now'),
      false
    );
    assert.equal(
      shouldUsePendingBuildDispatchConfirmationForMessage({ timestamp: Date.now() - 31 * 60 * 1000 }, 'go'),
      true
    );
  });
}

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
