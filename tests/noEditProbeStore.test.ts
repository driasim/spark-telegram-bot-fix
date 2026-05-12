import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { resetJsonStateForTests } from '../src/jsonState';
import { readNoEditProbeMission, storeNoEditProbeMission } from '../src/noEditProbeStore';

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

async function withFreshState(fn: () => Promise<void>): Promise<void> {
  resetJsonStateForTests();
  process.env.SPARK_GATEWAY_STATE_DIR = await mkdtemp(path.join(os.tmpdir(), 'spark-no-edit-probe-test-'));
  await fn();
  resetJsonStateForTests();
}

async function main(): Promise<void> {
  await test('persists latest no-edit probe mission by chat/user key', async () => {
    await withFreshState(async () => {
      await storeNoEditProbeMission('chat-1-user-2', {
        missionId: 'spark-1778533553528',
        requestedPhrase: 'SPARK_QA_NO_EDIT_OK',
        startedAt: '2026-05-11T21:05:53.714Z',
      });

      assert.deepEqual(await readNoEditProbeMission('chat-1-user-2'), {
        missionId: 'spark-1778533553528',
        requestedPhrase: 'SPARK_QA_NO_EDIT_OK',
        startedAt: '2026-05-11T21:05:53.714Z',
      });
    });
  });

  await test('ignores malformed mission records', async () => {
    await withFreshState(async () => {
      await storeNoEditProbeMission('chat-1-user-2', {
        missionId: '',
        requestedPhrase: 'SPARK_QA_NO_EDIT_OK',
        startedAt: '2026-05-11T21:05:53.714Z',
      });

      assert.equal(await readNoEditProbeMission('chat-1-user-2'), null);
      assert.equal(await readNoEditProbeMission('missing'), null);
    });
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
