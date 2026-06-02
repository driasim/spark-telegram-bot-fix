import assert from 'node:assert/strict';
import { buildTelegramTurnIntentEnvelope, type ToolAuthorizationResult } from '../src/harnessContract';
import {
  authorizeHarnessCoreTelegramAction,
  buildTurnIntentEnvelopeVNextFromTelegram,
  recordHarnessCoreToolLedger,
  type HarnessCoreActionInput
} from '../src/harnessCoreVNext';
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
    turnId: 'turn:harness-core-vnext',
    traceId: 'trace:harness-core-vnext'
  });
}

const allowedLegacy: ToolAuthorizationResult = { verdict: 'allowed', reasonCodes: [] };

test('converts meta action-word turns into chat-only Harness Core envelopes', () => {
  const text = 'I am mentioning build, publish, deploy, schedule, chip, and memory as trigger examples. Do not run anything.';
  const legacyEnvelope = envelopeFor(text);
  const vnext = buildTurnIntentEnvelopeVNextFromTelegram(legacyEnvelope);

  assert.equal(vnext.schema_version, 'turn-intent-envelope-vnext');
  assert.equal(vnext.selected_move, 'chat_explain');
  assert.equal(vnext.action_authority.state, 'chat_only');
  assert.equal(vnext.proposed_actions.length, 0);
  assert.equal(vnext.freshness.stale_state_used_as_authority, false);
  assert.equal(vnext.freshness.memory_used_as_instruction, false);
  assert.ok(vnext.evidence.some((item) => item.kind === 'fresh_user_intent'));
  assert.ok(vnext.evidence.some((item) => item.kind === 'negative_intent'));
});

test('Telegram action authority now requires Harness Core allow verdict', () => {
  const text = 'Build a private local-first dashboard for memory reports with stale context labels.';
  const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
    route: 'spawner.build',
    text,
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.equal(result.allow, true);
  assert.ok(result.harnessCore);
  assert.equal(result.harnessCore?.envelope.schema_version, 'turn-intent-envelope-vnext');
  assert.equal(result.harnessCore?.envelope.selected_move, 'execute_action');
  assert.equal(result.harnessCore?.envelope.action_authority.state, 'executable');
  assert.equal(result.harnessCore?.action.action_type, 'launch_mission');
  assert.equal(result.harnessCore?.authorization.schema_version, 'authorization-decision-v1');
  assert.equal(result.harnessCore?.authorization.verdict, 'allow');
  assert.equal(result.governorDecision?.schema_version, 'governor-decision-v1');
  assert.equal(result.governorDecision?.outcome, 'execute');
  assert.equal(result.governorDecision?.execution_boundary.action_authorized, true);
  assert.equal(result.governorDecision?.execution_boundary.legacy_authority_demoted, true);
});

test('Harness Core interrupts high-risk publish even when legacy evidence would allow', () => {
  const legacyEnvelope = envelopeFor('Publish the reviewed local package after approval.');
  const action: HarnessCoreActionInput = {
    route: 'release.publish',
    text: legacyEnvelope.text.raw,
    toolName: 'publish.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'publishes',
    publishes: true
  };

  const bundle = authorizeHarnessCoreTelegramAction(legacyEnvelope, action, allowedLegacy, true);

  assert.equal(bundle.envelope.selected_move, 'confirm_action');
  assert.equal(bundle.envelope.action_authority.state, 'confirmation_required');
  assert.equal(bundle.action.risk_tier, 'high');
  assert.equal(bundle.authorization.verdict, 'interrupt');
  assert.equal(bundle.authorization.approval.required, true);
  assert.ok(bundle.authorization.reasons.includes('authority_state_confirmation_required'));

  assert.throws(
    () => recordHarnessCoreToolLedger({
      envelope: bundle.envelope,
      action: bundle.action,
      authorization: bundle.authorization,
      toolName: 'publish.run',
      status: 'success',
      summary: 'This must not be representable before explicit approval.'
    }),
    /allow authorization/
  );

  const ledger = recordHarnessCoreToolLedger({
    envelope: bundle.envelope,
    action: bundle.action,
    authorization: bundle.authorization,
    toolName: 'publish.run',
    status: 'not_started',
    summary: 'Publish was interrupted before execution.'
  });
  assert.equal(ledger.result.status, 'not_started');
  assert.ok(ledger.lifecycle.some((stage) => stage.stage === 'authorize' && stage.verdict === 'pending'));
  assert.ok(ledger.lifecycle.some((stage) => stage.stage === 'execute' && stage.verdict === 'skipped'));
});

test('Telegram action authority returns non-executing Governor outcome for meta action words', () => {
  const text = 'I am mentioning build and mission as examples only; do not run anything.';
  const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
    route: 'spawner.build',
    text,
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.equal(result.allow, false);
  assert.equal(result.governorDecision?.schema_version, 'governor-decision-v1');
  assert.notEqual(result.governorDecision?.outcome, 'execute');
  assert.equal(result.governorDecision?.execution_boundary.action_authorized, false);
  assert.equal(result.governorDecision?.reply_contract.should_interrupt, false);
});

test('records Harness Core tool ledger for authorized execution', () => {
  const text = 'Build a tiny static launch checklist app with one save button and responsive layout.';
  const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
    route: 'spawner.build',
    text,
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.equal(result.allow, true);
  assert.ok(result.harnessCore);
  const ledger = recordHarnessCoreToolLedger({
    envelope: result.harnessCore!.envelope,
    action: result.harnessCore!.action,
    authorization: result.harnessCore!.authorization,
    toolName: 'spawner.run',
    status: 'success',
    summary: 'Spawner accepted the authorized mission dispatch.'
  });

  assert.equal(ledger.schema_version, 'tool-call-ledger-v1');
  assert.equal(ledger.turn_id, result.harnessCore?.envelope.turn_id);
  assert.equal(ledger.authorization.verdict, 'allow');
  assert.equal(ledger.result.status, 'success');
  assert.ok(ledger.lifecycle.some((stage) => stage.stage === 'authorize' && stage.verdict === 'passed'));
  assert.equal(result.governorDecision?.tool_ledgers[0].schema_version, 'tool-call-ledger-v1');
});
