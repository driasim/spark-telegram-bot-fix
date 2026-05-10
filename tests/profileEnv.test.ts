import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { sparkConfigModulesDir, sparkSecretPythonBridgeCommand } from '../src/profileEnv';

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('loads profile secrets through Spark internal keychain fetch', () => {
  const command = sparkSecretPythonBridgeCommand('telegram.profiles.spark-agi.bot_token', {
    SPARK_CLI_SRC: 'C:\\spark-cli\\src',
    SPARK_BUILDER_PYTHON: 'C:\\Python313\\python.exe'
  } as NodeJS.ProcessEnv);

  assert.equal(command.python, 'C:\\Python313\\python.exe');
  assert.equal(command.args[0], '-c');
  assert.equal(command.args[2], 'telegram.profiles.spark-agi.bot_token');
  assert.match(command.args[1], /from spark_cli\.cli import fetch_secret/);
  assert.doesNotMatch(command.args[1], /secrets get|--reveal/);
});

test('prefers explicit Spark CLI Python over Builder Python', () => {
  const command = sparkSecretPythonBridgeCommand('telegram.profiles.testerthebester.bot_token', {
    SPARK_CLI_PYTHON: 'C:\\SparkPython\\python.exe',
    SPARK_BUILDER_PYTHON: 'C:\\Python313\\python.exe'
  } as NodeJS.ProcessEnv);

  assert.equal(command.python, 'C:\\SparkPython\\python.exe');
});

test('uses SPARK_HOME for generated module env files', () => {
  const configDir = sparkConfigModulesDir({ SPARK_HOME: 'C:\\SparkHome' } as NodeJS.ProcessEnv);

  assert.equal(configDir, path.join('C:\\SparkHome', 'config', 'modules'));
});

test('runtime health wrapper forwards profile arguments', () => {
  const wrapper = readFileSync('scripts/run-health-runtime.cjs', 'utf-8');

  assert.match(wrapper, /process\.argv\.slice\(2\)/);
  assert.match(wrapper, /\.\.\.forwardedArgs/);
});
