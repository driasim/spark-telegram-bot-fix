import assert from 'node:assert/strict';
import { describeTelegramTokenError } from '../src/healthPolling';
import { describeRuntimeHealthError, relayHealthUrl, validateRelayRuntime } from '../src/healthRuntime';

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

async function run(): Promise<void> {
await test('explains rejected Telegram tokens without echoing token material', () => {
  const message = describeTelegramTokenError(new Error('404: Not Found'));

  assert.match(message, /Telegram rejected BOT_TOKEN/);
  assert.match(message, /BotFather/);
  assert.doesNotMatch(message, /\d+:[A-Za-z0-9_-]+/);
});

await test('keeps unknown Telegram health failures actionable', () => {
  const message = describeTelegramTokenError(new Error('network timeout'));

  assert.equal(message, 'Telegram token check failed: network timeout');
});

await test('builds relay health URL from configured relay port', () => {
  assert.equal(relayHealthUrl({ TELEGRAM_RELAY_PORT: '8789' } as NodeJS.ProcessEnv), 'http://127.0.0.1:8789/health');
  assert.equal(relayHealthUrl({ TELEGRAM_RELAY_PORT: 'not-a-port' } as NodeJS.ProcessEnv), 'http://127.0.0.1:8788/health');
});

await test('builds relay health URL from hosted relay callback URL', () => {
  assert.equal(
    relayHealthUrl({ TELEGRAM_RELAY_URL: 'http://spark-telegram-bot.railway.internal:8788/spawner-events' } as NodeJS.ProcessEnv),
    'http://spark-telegram-bot.railway.internal:8788/health'
  );
});

await test('validates relay runtime without exposing secrets', async () => {
  const fetchImpl = async () => new Response(
    JSON.stringify({
      ok: true,
      relay: { profile: 'spark-agi', port: 8789 },
      pid: 123,
      runtime: { telegramPolling: 'active', pollingActive: true }
    }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );

  const detail = await validateRelayRuntime(fetchImpl as typeof fetch, { TELEGRAM_RELAY_PORT: '8789' } as NodeJS.ProcessEnv);

  assert.equal(detail, 'spark-agi@8789 pid=123 polling=active');
});

await test('explains unreachable relay runtime', async () => {
  const fetchImpl = async () => new Response('missing', { status: 503 });

  await assert.rejects(
    () => validateRelayRuntime(fetchImpl as typeof fetch, { TELEGRAM_RELAY_PORT: '8789' } as NodeJS.ProcessEnv),
    /Telegram relay runtime is not reachable at http:\/\/127\.0\.0\.1:8789\/health: HTTP 503/
  );
});

await test('explains direct runtime health without leaking Spark internals', () => {
  const message = describeRuntimeHealthError(new Error('TELEGRAM_RELAY_SECRET is required'));

  assert.match(message, /Spark-generated runtime env/);
  assert.match(message, /spark status/);
  assert.match(message, /spark logs spark-telegram-bot --profile primary --lines 80/);
  assert.doesNotMatch(message, /EADDRINUSE|python3\.11|keychain/);
});
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
