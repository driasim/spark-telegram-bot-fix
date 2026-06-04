import assert from 'node:assert/strict';
import axios from 'axios';
import {
  createHarnessCoreActionEnvelopeVNext,
  createHarnessCoreAuthorizedGovernorDecision
} from '@spark/harness-core';
import { createSchedule, deleteSchedule } from '../src/schedule';
import type { SparkHarnessMutationClass } from '../src/harnessContract';

type AsyncTest = () => Promise<void> | void;

async function test(name: string, fn: AsyncTest): Promise<void> {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

const originalPost = axios.post;
const originalDelete = axios.delete;

function restoreAxios(): void {
  (axios as any).post = originalPost;
  (axios as any).delete = originalDelete;
}

function fakeExecutionAuthority(
  toolName: string,
  mutationClass: SparkHarnessMutationClass
): unknown {
  const envelope = createHarnessCoreActionEnvelopeVNext({
    surface: 'telegram',
    ownerSystem: 'spark-intelligence-builder',
    toolName,
    mutationClass,
    source: 'schedule.test',
    reason: `Test Harness Core authority for ${toolName}.`,
    requestId: `turn:${toolName}:${mutationClass}`,
    actorIdRef: 'telegram-human'
  });
  return createHarnessCoreAuthorizedGovernorDecision({ envelope, tool_name: toolName });
}

async function run(): Promise<void> {
  await test('createSchedule forwards Governor authority to Spawner', async () => {
    restoreAxios();
    const executionAuthority = fakeExecutionAuthority('schedule.create', 'creates_schedule');
    let capturedBody: any = null;
    (axios as any).post = async (_url: string, body: unknown) => {
      capturedBody = body;
      return {
        data: {
          ok: true,
          schedule: {
            id: 'sched-1',
            cron: '*/5 * * * *',
            action: 'mission',
            payload: { goal: 'status' },
            chatId: '123',
            createdAt: '2026-06-04T00:00:00.000Z',
            lastFiredAt: null,
            nextFireAt: null,
            fireCount: 0,
            lastStatus: null,
            enabled: true
          }
        }
      };
    };

    const result = await createSchedule({
      cron: '*/5 * * * *',
      action: 'mission',
      payload: { goal: 'status' },
      chatId: '123',
      executionAuthority
    });

    assert.equal(result.ok, true);
    assert.equal(capturedBody.executionAuthority, executionAuthority);
  });

  await test('createSchedule fails closed before network when authority is missing', async () => {
    restoreAxios();
    let postCalled = false;
    (axios as any).post = async () => {
      postCalled = true;
      return { data: { ok: true } };
    };

    const result = await createSchedule({
      cron: '*/5 * * * *',
      action: 'mission',
      payload: { goal: 'status' },
      chatId: '123'
    });

    assert.equal(result.ok, false);
    assert.match(result.error || '', /Harness Core execution authority is required/);
    assert.equal(postCalled, false);
  });

  await test('createSchedule rejects delete authority before network', async () => {
    restoreAxios();
    let postCalled = false;
    (axios as any).post = async () => {
      postCalled = true;
      return { data: { ok: true } };
    };

    const result = await createSchedule({
      cron: '*/5 * * * *',
      action: 'mission',
      payload: { goal: 'status' },
      chatId: '123',
      executionAuthority: fakeExecutionAuthority('schedule.delete', 'deletes_schedule')
    });

    assert.equal(result.ok, false);
    assert.match(result.error || '', /governor_missing_matching_authorization/);
    assert.equal(postCalled, false);
  });

  await test('createSchedule rejects read-only Governor authority before network', async () => {
    restoreAxios();
    let postCalled = false;
    (axios as any).post = async () => {
      postCalled = true;
      return { data: { ok: true } };
    };

    const result = await createSchedule({
      cron: '*/5 * * * *',
      action: 'mission',
      payload: { goal: 'status' },
      chatId: '123',
      executionAuthority: fakeExecutionAuthority('schedule.create', 'read_only')
    });

    assert.equal(result.ok, false);
    assert.match(result.error || '', /governor_outcome_read_only/);
    assert.equal(postCalled, false);
  });

  await test('deleteSchedule forwards Governor authority in DELETE config data', async () => {
    restoreAxios();
    const executionAuthority = fakeExecutionAuthority('schedule.delete', 'deletes_schedule');
    let capturedOptions: any = null;
    (axios as any).delete = async (_url: string, options: unknown) => {
      capturedOptions = options;
      return { data: { ok: true } };
    };

    const result = await deleteSchedule('sched-1', { executionAuthority });

    assert.equal(result.ok, true);
    assert.equal(capturedOptions.data.executionAuthority, executionAuthority);
  });

  await test('deleteSchedule fails closed before network when authority is missing', async () => {
    restoreAxios();
    let deleteCalled = false;
    (axios as any).delete = async () => {
      deleteCalled = true;
      return { data: { ok: true } };
    };

    const result = await deleteSchedule('sched-1');

    assert.equal(result.ok, false);
    assert.match(result.error || '', /Harness Core execution authority is required/);
    assert.equal(deleteCalled, false);
  });

  restoreAxios();
}

run().catch((error) => {
  console.error(error);
  restoreAxios();
  process.exit(1);
});
