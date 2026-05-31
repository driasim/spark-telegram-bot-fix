import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { buildTelegramTurnIntentEnvelope } from '../src/harnessContract';
import {
  harnessCoreToolLedgerPath,
  readHarnessCoreToolLedger,
  shouldWriteHarnessCoreLedger
} from '../src/harnessCoreLedger';
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
    turnId: `turn:ledger:${Math.abs(hashCode(text))}`,
    traceId: `trace:ledger:${Math.abs(hashCode(`${text}:trace`))}`
  });
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function withLedgerPath<T>(fn: (filePath: string) => T): T {
  const previousPath = process.env.SPARK_HARNESS_CORE_LEDGER_PATH;
  const previousEnabled = process.env.SPARK_HARNESS_CORE_LEDGER;
  const dir = mkdtempSync(path.join(os.tmpdir(), 'spark-harness-core-ledger-test-'));
  const filePath = path.join(dir, 'ledger.jsonl');
  process.env.SPARK_HARNESS_CORE_LEDGER_PATH = filePath;
  delete process.env.SPARK_HARNESS_CORE_LEDGER;
  try {
    return fn(filePath);
  } finally {
    if (previousPath === undefined) delete process.env.SPARK_HARNESS_CORE_LEDGER_PATH;
    else process.env.SPARK_HARNESS_CORE_LEDGER_PATH = previousPath;
    if (previousEnabled === undefined) delete process.env.SPARK_HARNESS_CORE_LEDGER;
    else process.env.SPARK_HARNESS_CORE_LEDGER = previousEnabled;
  }
}

test('records allowed Telegram Harness Core authorization ledgers', () => {
  withLedgerPath((filePath) => {
    const text = 'Build a private local-first dashboard for memory reports with stale context labels.';
    const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
      route: 'spawner.build',
      text,
      toolName: 'spawner.run',
      ownerSystem: 'spawner-ui',
      mutationClass: 'launches_mission'
    });

    assert.equal(result.allow, true);
    assert.ok(result.harnessCoreLedger);
    assert.equal(harnessCoreToolLedgerPath(), filePath);
    const records = readHarnessCoreToolLedger(filePath);
    assert.equal(records.length, 1);
    assert.equal(records[0].schema_version, 'tool-call-ledger-v1');
    assert.equal(records[0].authorization.verdict, 'allow');
    assert.equal(records[0].result.status, 'not_started');
    assert.ok(records[0].lifecycle.some((stage) => stage.stage === 'authorize' && stage.verdict === 'passed'));
  });
});

test('records blocked Telegram Harness Core authorization ledgers', () => {
  withLedgerPath((filePath) => {
    const text = 'I am mentioning build and mission, but do not start anything. Just explain the risk.';
    const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
      route: 'spawner.build',
      text,
      toolName: 'spawner.run',
      ownerSystem: 'spawner-ui',
      mutationClass: 'launches_mission'
    });

    assert.equal(result.allow, false);
    assert.ok(result.harnessCoreLedger);
    const records = readHarnessCoreToolLedger(filePath);
    assert.equal(records.length, 1);
    assert.equal(records[0].authorization.verdict, 'deny');
    assert.equal(records[0].result.status, 'not_started');
    assert.ok(records[0].authorization.reasons.includes('route_evidence_rejected'));
    assert.ok(records[0].lifecycle.some((stage) => stage.stage === 'authorize' && stage.verdict === 'failed'));
  });
});

test('allows ledger writes to be disabled explicitly', () => {
  withLedgerPath((filePath) => {
    process.env.SPARK_HARNESS_CORE_LEDGER = '0';
    const text = 'Build a tiny timer app with start and reset buttons.';
    const result = authorizeTelegramActionFromEnvelope(envelopeFor(text), {
      route: 'spawner.build',
      text,
      toolName: 'spawner.run',
      ownerSystem: 'spawner-ui',
      mutationClass: 'launches_mission'
    });

    assert.equal(shouldWriteHarnessCoreLedger(), false);
    assert.ok(result.harnessCoreLedger);
    assert.equal(readHarnessCoreToolLedger(filePath).length, 0);
  });
});

