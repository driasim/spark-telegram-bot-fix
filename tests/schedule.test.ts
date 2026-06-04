import assert from 'node:assert/strict';
import axios from 'axios';
import { createSchedule, deleteSchedule } from '../src/schedule';

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

function fakeExecutionAuthority(): Record<string, unknown> {
  return {
    schema_version: 'governor-decision-v1',
    outcome: 'execute',
    execution_boundary: { action_authorized: true },
    tool_ledgers: [
      {
        schema_version: 'tool-call-ledger-v1',
        tool_name: 'schedule.create'
      }
    ]
  };
}

async function run(): Promise<void> {
  await test('createSchedule forwards Governor authority to Spawner', async () => {
    restoreAxios();
    const executionAuthority = fakeExecutionAuthority();
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

  await test('deleteSchedule forwards Governor authority in DELETE config data', async () => {
    restoreAxios();
    const executionAuthority = fakeExecutionAuthority();
    let capturedOptions: any = null;
    (axios as any).delete = async (_url: string, options: unknown) => {
      capturedOptions = options;
      return { data: { ok: true } };
    };

    const result = await deleteSchedule('sched-1', { executionAuthority });

    assert.equal(result.ok, true);
    assert.equal(capturedOptions.data.executionAuthority, executionAuthority);
  });

  restoreAxios();
}

run().catch((error) => {
  console.error(error);
  restoreAxios();
  process.exit(1);
});
