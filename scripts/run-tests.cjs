#!/usr/bin/env node

const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const testsDir = path.join(__dirname, '..', 'tests');
const tests = fs.readdirSync(testsDir)
  .filter((file) => file.endsWith('.test.ts'))
  .sort()
  .map((file) => path.join('tests', file));

const requireRealToken = process.argv.includes('--require-real-token');
const token = process.env.BOT_TOKEN || '';

if (requireRealToken && (!token || token === '123:test' || token === '0:telegram-smoke-token')) {
  console.error('BOT_TOKEN must be set to a real tester bot token for this test mode.');
  process.exit(1);
}

const env = {
  ...process.env,
  BOT_TOKEN: token || '123:test'
};

const tsNodeBin = path.join(__dirname, '..', 'node_modules', 'ts-node', 'dist', 'bin.js');

for (const testFile of tests) {
  const result = spawnSync(process.execPath, [tsNodeBin, testFile], {
    env,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}
