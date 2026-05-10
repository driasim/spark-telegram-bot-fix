import assert from 'node:assert/strict';
import { evaluateDeterministicRoute } from '../src/routeFirewall';

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('blocks interruptive routes for plain Spark system questions', () => {
  const verdict = evaluateDeterministicRoute(
    'spawner.build',
    'what build updates are missing in Spark routing?'
  );

  assert.equal(verdict.allow, false);
  assert.equal(verdict.reason, 'plain_chat_protected');
  assert.equal(verdict.confidence, 'blocked');
});

test('allows explicit project builds through the firewall', () => {
  const verdict = evaluateDeterministicRoute(
    'spawner.build',
    'Build this at C:\\Users\\USER\\Desktop\\spark-timer: a tiny timer app'
  );

  assert.equal(verdict.allow, true);
  assert.equal(verdict.reason, 'concrete_project_build');
  assert.equal(verdict.confidence, 'explicit');
});

test('allows explicit memory updates even when they mention plans', () => {
  const verdict = evaluateDeterministicRoute(
    'memory.write',
    'Memory update: my current plan is Neon Harbor Telegram memory test. Please save this as my current plan.'
  );

  assert.equal(verdict.allow, true);
  assert.equal(verdict.reason, 'explicit_memory_write');
  assert.equal(verdict.confidence, 'explicit');
});
