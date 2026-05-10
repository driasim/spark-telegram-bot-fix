import assert from 'node:assert/strict';
import {
  accessActionNeedsConfirmation,
  buildSparkAccessActionKeyboard,
  buildSparkAccessConfirmationKeyboard,
  formatSparkAccessActionConfirmationPrompt,
  formatSparkAccessActionReply,
  runSparkAccessAction,
} from '../src/accessActions';

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

void (async () => {
  await test('runs workspace setup through the Spark CLI JSON action', async () => {
    const reply = await runSparkAccessAction('workspace_setup', async (args, timeoutMs) => {
      assert.deepEqual(args, ['access', 'setup', '--json']);
      assert.equal(timeoutMs, 60_000);
      return {
        stdout: JSON.stringify({
          ok: true,
          effective_access_level: 4,
          recommended: { id: 'spark_workspace' },
          next: 'spark access status',
        }),
        stderr: '',
      };
    });

    assert.match(reply, /Safe workspace setup is ready/);
    assert.match(reply, /Effective access level: 4/);
    assert.match(reply, /Recommended lane: spark_workspace/);
  });

  await test('keeps Docker smoke and Level 5 behind confirmation', () => {
    assert.equal(accessActionNeedsConfirmation('workspace_setup'), false);
    assert.equal(accessActionNeedsConfirmation('docker_doctor'), false);
    assert.equal(accessActionNeedsConfirmation('docker_smoke'), true);
    assert.equal(accessActionNeedsConfirmation('level5_enable'), true);
    assert.equal(accessActionNeedsConfirmation('level5_disable'), true);
  });

  await test('formats Level 5 setup as restart-required operator guidance', () => {
    const reply = formatSparkAccessActionReply('level5_enable', {
      ok: true,
      level5: { activation_state: 'restart_required' },
      next: 'spark restart',
    });

    assert.match(reply, /Level 5 guardrails were configured/);
    assert.match(reply, /Activation state: restart_required/);
    assert.match(reply, /Restart Spark/);
    assert.match(reply, /\/access 5/);
  });

  await test('formats Docker smoke as no-secret sandbox evidence', () => {
    const reply = formatSparkAccessActionReply('docker_smoke', {
      ok: true,
      next: 'Docker no-secret sandbox smoke passed.',
    });

    assert.match(reply, /Docker sandbox smoke passed/);
    assert.match(reply, /without Spark secrets/);
    assert.match(reply, /Docker socket/);
  });

  await test('renders access action buttons without exposing Level 5 to Level 4 users', () => {
    const developerKeyboard = buildSparkAccessActionKeyboard('developer').reply_markup.inline_keyboard;
    const developerCallbacks = developerKeyboard.flat().map((button) => button.callback_data);

    assert.deepEqual(developerCallbacks, [
      'spark_access:workspace_setup',
      'spark_access:docker_doctor',
      'spark_access:docker_smoke',
    ]);

    const operatorKeyboard = buildSparkAccessActionKeyboard('operator').reply_markup.inline_keyboard;
    const operatorCallbacks = operatorKeyboard.flat().map((button) => button.callback_data);

    assert.ok(operatorCallbacks.includes('spark_access:level5_enable'));
    assert.ok(operatorCallbacks.includes('spark_access:level5_disable'));
  });

  await test('renders confirm button for guarded access actions', () => {
    const prompt = formatSparkAccessActionConfirmationPrompt('level5_enable');
    const keyboard = buildSparkAccessConfirmationKeyboard('level5_enable').reply_markup.inline_keyboard;

    assert.match(prompt, /whole-computer operator mode/);
    assert.match(prompt, /tap Confirm/);
    assert.equal(keyboard[0][0].callback_data, 'spark_access:level5_enable:confirm');
  });
})();
