import assert from 'node:assert/strict';
import axios from 'axios';
import {
  fetchRecursiveSessions,
  formatRecursiveApiError,
  formatRecursiveLoopResultForTelegram,
  formatRecursiveLoopStartAck,
  formatRecursiveSessionForTelegram,
  formatRecursiveSessionsForTelegram,
  parseRecursiveTelegramCommand,
  recursiveApiBaseCandidates
} from '../src/recursive';

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

const originalGet = axios.get;
const originalRecursiveUrl = process.env.SPARK_RECURSIVE_URL;
const originalRecursiveApiUrl = process.env.SPARK_RECURSIVE_API_URL;

function restoreAxios(): void {
  (axios as any).get = originalGet;
}

function restoreEnv(): void {
  if (originalRecursiveUrl === undefined) delete process.env.SPARK_RECURSIVE_URL;
  else process.env.SPARK_RECURSIVE_URL = originalRecursiveUrl;
  if (originalRecursiveApiUrl === undefined) delete process.env.SPARK_RECURSIVE_API_URL;
  else process.env.SPARK_RECURSIVE_API_URL = originalRecursiveApiUrl;
}

async function run(): Promise<void> {
  await test('recursive API candidates prefer configured URL and keep local fallbacks', () => {
    const candidates = recursiveApiBaseCandidates({
      SPARK_RECURSIVE_URL: 'http://recursive.test/',
      SPARK_RECURSIVE_API_URL: 'http://recursive.test'
    } as NodeJS.ProcessEnv);

    assert.deepEqual(candidates, [
      'http://recursive.test',
      'http://127.0.0.1:3344',
      'http://127.0.0.1:3345'
    ]);
  });

  await test('parseRecursiveTelegramCommand accepts report and session commands', () => {
    assert.deepEqual(parseRecursiveTelegramCommand('sessions'), { action: 'sessions' });
    assert.deepEqual(parseRecursiveTelegramCommand('start startup-yc rounds 4'), { action: 'start', chipKey: 'startup-yc', rounds: 4 });
    assert.deepEqual(parseRecursiveTelegramCommand('run domain-chip:voice 99'), { action: 'start', chipKey: 'domain-chip:voice', rounds: 10 });
    assert.deepEqual(parseRecursiveTelegramCommand('report spark-1'), { action: 'report', sessionId: 'spark-1' });
    assert.deepEqual(parseRecursiveTelegramCommand('session spark-2'), { action: 'session', sessionId: 'spark-2' });
    assert.deepEqual(parseRecursiveTelegramCommand('review spark-3'), { action: 'review', sessionId: 'spark-3' });
    assert.deepEqual(parseRecursiveTelegramCommand('report'), { action: 'help' });
    assert.deepEqual(parseRecursiveTelegramCommand('start <chip>'), { action: 'help' });
  });

  await test('fetchRecursiveSessions prefers the non-fixture local dashboard', async () => {
    restoreAxios();
    delete process.env.SPARK_RECURSIVE_URL;
    delete process.env.SPARK_RECURSIVE_API_URL;

    const urls: string[] = [];
    (axios as any).get = async (url: string) => {
      urls.push(url);
      if (url === 'http://127.0.0.1:3344/api/recursive/health') {
        return {
          data: {
            ok: true,
            service: 'spark-recursive',
            roots: { traceFiles: ['tests/fixtures/swarm-session-summary.json'] }
          }
        };
      }
      if (url === 'http://127.0.0.1:3345/api/recursive/health') {
        return {
          data: {
            ok: true,
            service: 'spark-recursive',
            roots: {}
          }
        };
      }
      return {
        data: {
          sessions: [
            {
              trace_id: 'spawner:spark-1',
              session_id: 'spark-1',
              source_kind: 'spawner_mission_control',
              title: 'Spark Run: benchmark loop',
              status: 'completed',
              domain: 'spawner_mission',
              updated_at: '2026-05-07T01:00:00.000Z',
              kanban_bucket: 'completed',
              review_required: false,
              source_path: 'mission-control.json'
            }
          ]
        }
      };
    };

    const result = await fetchRecursiveSessions();

    assert.equal(result.baseUrl, 'http://127.0.0.1:3345');
    assert.equal(result.sessions.length, 1);
    assert.deepEqual(urls, [
      'http://127.0.0.1:3344/api/recursive/health',
      'http://127.0.0.1:3345/api/recursive/health',
      'http://127.0.0.1:3345/api/recursive/sessions'
    ]);
  });

  await test('formatRecursiveSessionsForTelegram renders compact progress lines', () => {
    const message = formatRecursiveSessionsForTelegram({
      baseUrl: 'http://recursive.test',
      sessions: [
        {
          trace_id: 'spawner:spark-1',
          session_id: 'spark-1',
          source_kind: 'spawner_mission_control',
          title: 'Spark Run: benchmark loop',
          status: 'review_needed',
          domain: 'spawner_mission',
          updated_at: '2026-05-07T01:00:00.000Z',
          kanban_bucket: 'needs_review',
          review_required: true,
          source_path: 'mission-control.json'
        }
      ]
    });

    assert.match(message, /Spark Recursive Sessions/);
    assert.match(message, /Total: 1/);
    assert.match(message, /Session: spark-1/);
    assert.match(message, /Status: review needed \| needs_review \| review/);
  });

  await test('formatRecursiveSessionForTelegram prefers dashboard status text', () => {
    const message = formatRecursiveSessionForTelegram({
      baseUrl: 'http://recursive.test',
      status: 'Spark Recursive\n\nSession: spark-1\nStatus: completed'
    });

    assert.equal(message, 'Spark Recursive\n\nSession: spark-1\nStatus: completed');
  });

  await test('recursive loop start and result formatters stay governance-aware', () => {
    const ack = formatRecursiveLoopStartAck('startup-yc', 3);
    assert.match(ack, /Starting Spark Recursive loop/);
    assert.match(ack, /Promotion: blocked until review gates pass/);

    const result = formatRecursiveLoopResultForTelegram({
      ok: true,
      chipKey: 'startup-yc',
      roundsCompleted: 2,
      totalRounds: 2,
      statusPath: 'C:\\Users\\USER\\.spark-intelligence\\loops\\startup-yc.status.json',
      history: [
        { round_index: 1, suggestions_count: 3, best_verdict: 'kept', best_metric: 0.61 },
        { round_index: 2, suggestions_count: 3, best_verdict: 'kept', best_metric: 0.69 }
      ]
    });

    assert.match(result, /Spark Recursive loop complete/);
    assert.match(result, /Evidence tier: local Builder chip loop/);
    assert.match(result, /Promotion: review required/);
    assert.match(result, /round 2: suggestions=3 verdict=kept metric=0\.690/);
    assert.match(result, /\/recursive sessions/);
  });

  await test('formatRecursiveApiError explains local service failure', () => {
    const error: any = new Error('connect ECONNREFUSED 127.0.0.1:3344');
    const message = formatRecursiveApiError(error);

    assert.match(message, /Spark Recursive is not reachable yet/);
    assert.match(message, /ECONNREFUSED/);
    assert.match(message, /\/recursive sessions/);
  });

  restoreAxios();
  restoreEnv();
}

run().catch((error) => {
  restoreAxios();
  restoreEnv();
  console.error(error);
  process.exit(1);
});
