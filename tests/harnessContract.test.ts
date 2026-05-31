import assert from 'node:assert/strict';
import {
  authorizeToolCallFromEnvelope,
  buildTelegramTurnIntentEnvelope,
  validateTurnIntentEnvelopeV1
} from '../src/harnessContract';
import { classifyTelegramIntentV2 } from '../src/telegramIntentGate';

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function envelopeFor(text: string) {
  return buildTelegramTurnIntentEnvelope({
    text,
    decision: classifyTelegramIntentV2(text),
    userRef: 'user:qa',
    chatRef: 'chat:qa',
    accessProfile: 'admin',
    conversationKind: 'dm',
    turnId: 'turn:test',
    traceId: 'trace:test'
  });
}

test('creates a valid answer-only envelope for meta action words', () => {
  const envelope = envelopeFor('I am mentioning build and mission, but do not start anything. Just explain the current risk.');

  assert.equal(validateTurnIntentEnvelopeV1(envelope), true);
  assert.equal(envelope.schema, 'spark.turn_intent.v1');
  assert.equal(envelope.directive.mode, 'answer');
  assert.equal(envelope.directive.noExecution, true);
  assert.equal(envelope.directive.explanationOnly, true);
  assert.equal(envelope.directive.quotedOrMetaLanguage, true);
  assert.equal(envelope.executionPolicy.canLaunchMission, false);
  assert.equal(envelope.executionPolicy.canMutateFiles, false);
  assert.ok(envelope.threatDefense.reasonCodes.includes('fresh_user_turn_is_authority'));
  assert.ok(envelope.threatDefense.reasonCodes.includes('no_execution_boundary'));
});

test('authorizes explicit startup canary through the startup lane contract', () => {
  const envelope = envelopeFor('Run a startup self-improvement canary comparing improved and non-improved answers.');

  assert.equal(validateTurnIntentEnvelopeV1(envelope), true);
  assert.equal(envelope.directive.mode, 'execute');
  assert.equal(envelope.selectedIntent.ownerSystem, 'spark-intelligence-builder');
  assert.equal(envelope.executionPolicy.canLaunchMission, true);
  assert.ok(envelope.laneContract);
  assert.equal(envelope.laneContract?.laneId, 'startup-operator');

  const authorization = authorizeToolCallFromEnvelope(envelope, {
    toolName: 'spawner.run',
    ownerSystem: 'spark-intelligence-builder',
    mutationClass: 'launches_mission'
  });

  assert.deepEqual(authorization, { verdict: 'allowed', reasonCodes: [] });
});

test('blocks tool execution when the envelope does not authorize mutation', () => {
  const envelope = envelopeFor('Do not run or build anything; just explain whether build routes are risky.');

  const authorization = authorizeToolCallFromEnvelope(envelope, {
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.equal(authorization.verdict, 'blocked');
  assert.ok(authorization.reasonCodes.includes('no_execution_boundary'));
  assert.ok(authorization.reasonCodes.includes('tool_denied_by_policy'));
  assert.ok(authorization.reasonCodes.includes('mutation_class_not_authorized'));
});

test('blocks tool execution without a valid envelope', () => {
  const authorization = authorizeToolCallFromEnvelope(null, {
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.deepEqual(authorization, {
    verdict: 'blocked',
    reasonCodes: ['missing_or_invalid_envelope']
  });
});

test('keeps memory authority evidence-only in the envelope', () => {
  const envelope = envelopeFor('What do you remember about how I like mission updates? Keep it short and do not run anything.');

  assert.equal(envelope.directive.mode, 'answer');
  assert.equal(envelope.directive.noExecution, true);
  assert.equal(envelope.threatDefense.recalledMemory, 'evidence_only');
  assert.equal(envelope.sessionScope.memoryLoadPolicy, 'evidence_only');
  assert.equal(envelope.executionPolicy.canLaunchMission, false);
});

test('authorizes explicit schedule delete for Builder bridge confirmation flow', () => {
  const envelope = envelopeFor('delete the nightly schedule');

  assert.equal(envelope.selectedIntent.ownerSystem, 'spark-intelligence-builder');
  assert.equal(envelope.selectedIntent.action, 'schedule.delete');
  assert.equal(envelope.executionPolicy.canDeleteSchedule, true);
  assert.ok(envelope.toolPolicy.allowedTools.includes('schedule.delete'));

  const authorization = authorizeToolCallFromEnvelope(envelope, {
    toolName: 'schedule.delete',
    ownerSystem: 'spark-intelligence-builder',
    mutationClass: 'deletes_schedule'
  });

  assert.deepEqual(authorization, { verdict: 'allowed', reasonCodes: [] });
});

test('blocks schedule delete when the turn says not to execute it', () => {
  const envelope = envelopeFor('do not delete the schedule, just explain how deletes work');

  assert.equal(envelope.directive.noExecution, true);
  assert.equal(envelope.executionPolicy.canDeleteSchedule, false);

  const authorization = authorizeToolCallFromEnvelope(envelope, {
    toolName: 'schedule.delete',
    ownerSystem: 'spark-intelligence-builder',
    mutationClass: 'deletes_schedule'
  });

  assert.equal(authorization.verdict, 'blocked');
  assert.ok(authorization.reasonCodes.includes('no_execution_boundary'));
});
