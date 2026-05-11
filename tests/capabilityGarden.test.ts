import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  readCapabilityGardenSummary,
  renderCapabilityGardenSummary,
  summarizeCapabilityCatalog
} from '../src/capabilityGarden';

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

const catalog = {
  capability_cards: [
    {
      id: 'creator-system:spark-domain-chip-labs',
      owner_repo: 'spark-domain-chip-labs',
      surface_type: 'creator-system',
      status: 'local-artifacts',
      trust_status: 'untrusted',
      proof_state: 'proof_incomplete',
      missing_proofs: ['normalized gate verdict', 'rollback ref'],
      blockers: [
        'Gate verdicts are not normalized into the card yet.',
        'Network publication approval is not compiled into the card yet.'
      ],
      next_action: 'Normalize review verdicts.',
      primary_command: 'secret command should stay out'
    },
    {
      id: 'specialization-path:spark-swarm',
      owner_repo: 'spark-swarm',
      surface_type: 'specialization-path',
      status: 'schema-shaped',
      trust_status: 'untrusted',
      proof_state: 'schema_only',
      missing_proofs: ['publication proof'],
      blockers: ['Publication approval verdict is not compiled into the card yet.']
    }
  ]
};

async function main(): Promise<void> {
  await test('renders compact capability garden summary without command bodies', () => {
    const summary = summarizeCapabilityCatalog(catalog);
    const reply = renderCapabilityGardenSummary(summary);

    assert.equal(summary.cardCount, 2);
    assert.equal(summary.statusCounts['local-artifacts'], 1);
    assert.equal(summary.trustCounts.untrusted, 2);
    assert.equal(summary.proofStateCounts.proof_incomplete, 1);
    assert.equal(summary.topMissingProof, 'normalized gate verdict');
    assert.match(reply, /Capability garden needs review/);
    assert.match(reply, /2 cards/);
    assert.match(reply, /Trust: untrusted=2/);
    assert.match(reply, /Top proof gap: normalized gate verdict/);
    assert.match(reply, /creator-system:spark-domain-chip-labs: local-artifacts; trust=untrusted; proof=proof_incomplete \(2 blockers, 2 proof gaps\)/);
    assert.match(reply, /Full evidence: `spark os capabilities --json`/);
    assert.doesNotMatch(reply, /secret command/);
    assert.doesNotMatch(reply, /primary_command/);
  });

  await test('reads capability catalog from compiled system map directory', async () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'spark-capability-garden-'));
    const catalogPath = path.join(root, 'capability-catalog.json');
    writeFileSync(catalogPath, JSON.stringify(catalog), 'utf-8');

    const summary = await readCapabilityGardenSummary(catalogPath);

    assert.equal(summary.present, true);
    assert.equal(summary.cardCount, 2);
    assert.equal(summary.surfaceCounts['specialization-path'], 1);
  });

  await test('missing capability catalog gives compile prompt', async () => {
    const summary = await readCapabilityGardenSummary(path.join(os.tmpdir(), 'missing-capability-catalog.json'));
    const reply = renderCapabilityGardenSummary(summary);

    assert.equal(summary.present, false);
    assert.match(reply, /not compiled yet/);
    assert.match(reply, /spark os compile/);
  });
}

void main();
