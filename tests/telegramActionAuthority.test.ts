import assert from 'node:assert/strict';
import { buildTelegramTurnIntentEnvelope } from '../src/harnessContract';
import { authorizeTelegramActionFromEnvelope } from '../src/telegramActionAuthority';
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

test('blocks action words when the fresh turn is meta or no-execution', () => {
  const text = 'I am mentioning build and mission, but do not start anything. Just explain the risk.';
  const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
    route: 'spawner.build',
    text,
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.equal(result.allow, false);
  assert.equal(result.routeVerdict.allow, false);
  assert.equal(result.toolAuthorization.verdict, 'blocked');
  assert.ok(result.reasonCodes.includes('route_firewall:no_execution_boundary'));
  assert.ok(result.reasonCodes.includes('no_execution_boundary'));
});

test('allows explicit project build only when route and envelope both authorize it', () => {
  const text = 'Build a private local-first dashboard for memory reports with stale context and source labels.';
  const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
    route: 'spawner.build',
    text,
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.equal(result.allow, true);
  assert.equal(result.routeVerdict.allow, true);
  assert.equal(result.toolAuthorization.verdict, 'allowed');
});

test('allows explicit no-edit Spawner missions while preserving the file-edit constraint', () => {
  const text = 'Run a tiny mission through Spawner that only replies: SPARK_TURNINTENT_QA_OK_6. Do not edit files.';
  const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
    route: 'spawner.build',
    text,
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.equal(result.allow, true);
  assert.equal(result.routeVerdict.reason, 'explicit_spawner_no_edit_mission');
  assert.equal(result.toolAuthorization.verdict, 'allowed');
});

test('allows explicit external research with network policy', () => {
  const text = 'Research the latest public docs and GitHub repos about agent harness routing.';
  const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
    route: 'spawner.external_research',
    text,
    toolName: 'external.fetch',
    ownerSystem: 'spark-intelligence-builder',
    mutationClass: 'external_network',
    externalNetwork: true
  });

  assert.equal(result.allow, true);
  assert.equal(result.toolAuthorization.verdict, 'allowed');
});

test('allows explicit provider runs through provider policy', () => {
  const text = 'ask codex to review this launch plan';
  const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
    route: 'natural_run',
    text,
    toolName: 'provider.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'external_network',
    externalNetwork: true
  });

  assert.equal(result.allow, true);
  assert.equal(result.toolAuthorization.verdict, 'allowed');
});

test('blocks provider runs without an explicit provider-run envelope policy', () => {
  const text = 'I am talking about the word Codex here, not asking a provider to run.';
  const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
    route: 'natural_run',
    text,
    toolName: 'provider.run',
    ownerSystem: 'spark-telegram-bot',
    mutationClass: 'external_network',
    externalNetwork: true
  });

  assert.equal(result.allow, false);
  assert.ok(
    result.reasonCodes.includes('no_execution_boundary') ||
    result.reasonCodes.includes('tool_denied_by_policy') ||
    result.reasonCodes.includes('mutation_class_not_authorized')
  );
});
