import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import '../src/earlyConsoleRedaction';
import { isConsoleRedactionInstalled, redactText } from '../src/redaction';

const telegramTokenFixture = ['1234567890', 'AA' + 'B'.repeat(34)].join(':');

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('index.ts loads earlyConsoleRedaction immediately after dotenv/config', () => {
  const indexSource = fs.readFileSync(path.join(__dirname, '../src/index.ts'), 'utf8');
  assert.match(indexSource, /import 'dotenv\/config';\r?\nimport '\.\/earlyConsoleRedaction';/);
});

test('earlyConsoleRedaction installs console redaction side effect', () => {
  assert.equal(isConsoleRedactionInstalled(), true, 'expected bootstrap import from test runner preload');
});

test('early bootstrap path keeps telegram tokens out of redactText parity checks', () => {
  const sample = `startup BOT_TOKEN=${telegramTokenFixture}`;
  const redacted = redactText(sample);
  assert.ok(!redacted.includes(telegramTokenFixture));
  assert.match(redacted, /BOT_TOKEN=\*\*\*/);
});

test('installConsoleRedaction remains idempotent after bootstrap', () => {
  const { installConsoleRedaction } = require('../src/redaction') as typeof import('../src/redaction');
  assert.doesNotThrow(() => {
    installConsoleRedaction();
    installConsoleRedaction();
  });
  assert.equal(isConsoleRedactionInstalled(), true);
});
