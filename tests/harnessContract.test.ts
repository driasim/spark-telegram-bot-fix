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

test('keeps publication approval-list boundaries answer-only', () => {
  const envelope = envelopeFor('I might ask you to publish later, but right now just list what would need approval.');

  assert.equal(validateTurnIntentEnvelopeV1(envelope), true);
  assert.equal(envelope.selectedIntent.kind, 'plain_conversation');
  assert.equal(envelope.selectedIntent.ownerSystem, 'spark-telegram-bot');
  assert.equal(envelope.selectedIntent.action, 'plain_chat.qa_boundary');
  assert.equal(envelope.directive.mode, 'answer');
  assert.equal(envelope.directive.noExecution, true);
  assert.equal(envelope.directive.noPublish, true);
  assert.equal(envelope.directive.localOnly, true);
  assert.equal(envelope.executionPolicy.canPublish, false);
  assert.equal(envelope.executionPolicy.canUseExternalNetwork, false);
  assert.equal(envelope.executionPolicy.canLaunchMission, false);
  assert.deepEqual(envelope.toolPolicy.mutationClassesAllowed, ['none', 'read_only']);
  assert.deepEqual(envelope.toolPolicy.allowedTools, ['answer.compose']);
  assert.ok(envelope.toolPolicy.deniedTools.includes('publish.run'));
  assert.ok(envelope.toolPolicy.deniedTools.includes('external.fetch'));

  const publishAuthorization = authorizeToolCallFromEnvelope(envelope, {
    toolName: 'publish.run',
    ownerSystem: 'spark-telegram-bot',
    mutationClass: 'publishes',
    publishes: true
  });
  assert.equal(publishAuthorization.verdict, 'blocked');
  assert.ok(publishAuthorization.reasonCodes.includes('no_execution_boundary'));
  assert.ok(publishAuthorization.reasonCodes.includes('no_publish_boundary'));
  assert.ok(publishAuthorization.reasonCodes.includes('tool_denied_by_policy'));
  assert.ok(publishAuthorization.reasonCodes.includes('mutation_class_not_authorized'));

  const networkAuthorization = authorizeToolCallFromEnvelope(envelope, {
    toolName: 'external.fetch',
    ownerSystem: 'spark-telegram-bot',
    mutationClass: 'external_network',
    externalNetwork: true
  });
  assert.equal(networkAuthorization.verdict, 'blocked');
  assert.ok(networkAuthorization.reasonCodes.includes('external_network_not_authorized'));
  assert.ok(networkAuthorization.reasonCodes.includes('tool_denied_by_policy'));
});

test('keeps browser/computer-use authorization boundaries answer-only', () => {
  const envelope = envelopeFor('Do not use computer use. Tell me when computer use would be allowed.');

  assert.equal(validateTurnIntentEnvelopeV1(envelope), true);
  assert.equal(envelope.selectedIntent.kind, 'plain_conversation');
  assert.equal(envelope.selectedIntent.ownerSystem, 'spark-telegram-bot');
  assert.equal(envelope.selectedIntent.action, 'plain_chat.qa_boundary');
  assert.equal(envelope.directive.mode, 'answer');
  assert.equal(envelope.directive.noExecution, true);
  assert.equal(envelope.directive.localOnly, true);
  assert.equal(envelope.executionPolicy.canLaunchMission, false);
  assert.equal(envelope.executionPolicy.canUseExternalNetwork, false);
  assert.deepEqual(envelope.toolPolicy.allowedTools, ['answer.compose']);
  assert.ok(envelope.toolPolicy.deniedTools.includes('browser.use'));
  assert.ok(envelope.toolPolicy.deniedTools.includes('computer.use'));

  const computerUseAuthorization = authorizeToolCallFromEnvelope(envelope, {
    toolName: 'computer.use',
    ownerSystem: 'spark-telegram-bot',
    mutationClass: 'external_network',
    externalNetwork: true
  });
  assert.equal(computerUseAuthorization.verdict, 'blocked');
  assert.ok(computerUseAuthorization.reasonCodes.includes('no_execution_boundary'));
  assert.ok(computerUseAuthorization.reasonCodes.includes('external_network_not_authorized'));
  assert.ok(computerUseAuthorization.reasonCodes.includes('tool_denied_by_policy'));
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

test('authorizes explicit Memory Doctor as read-only diagnostics', () => {
  const envelope = envelopeFor('run memory doctor for last request');

  assert.equal(envelope.selectedIntent.ownerSystem, 'spark-intelligence-builder');
  assert.equal(envelope.selectedIntent.action, 'memory.doctor');
  assert.equal(envelope.directive.mode, 'inspect');
  assert.ok(envelope.toolPolicy.allowedTools.includes('memory.diagnose'));

  const authorization = authorizeToolCallFromEnvelope(envelope, {
    toolName: 'memory.diagnose',
    ownerSystem: 'spark-intelligence-builder',
    mutationClass: 'read_only'
  });

  assert.deepEqual(authorization, { verdict: 'allowed', reasonCodes: [] });
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
