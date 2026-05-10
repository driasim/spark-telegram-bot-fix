import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  describeSparkAccessProfile,
  getConfiguredSparkAccessProfile,
  getSparkAccessProfile,
  normalizeSparkAccessProfile,
  renderSparkAccessBriefStatus,
  renderSparkAccessCapabilityStatus,
  renderSparkAccessChangeConfirmation,
  renderSparkAccessConversationHelp,
  renderSparkAccessDenial,
  renderSparkAccessLevelGuide,
  renderSparkAccessOnboarding,
  renderSparkAccessRuntimeHint,
  renderSparkAccessStatus,
  setSparkAccessProfile,
  sparkAccessAllows,
  sparkAccessLabel,
  sparkAccessLevel,
  sparkAccessAllowsExternalResearch,
  sparkAccessAllowsOperatingSystemWork,
  sparkAccessAllowsSpawnerBuilds,
  sparkMissionNeedsOperatingSystemAccess,
  sparkAccessAllowsWorkspaceBuilds,
  sparkHostedFullAccessAllowed,
  sparkHighAgencyWorkersAllowed,
  sparkLevel5RuntimeGuardrailsActive,
  sparkIsHostedRuntime,
  validateSparkAccessProfileForRuntime
} from '../src/accessPolicy';
import { resetJsonStateForTests } from '../src/jsonState';

async function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

async function main(): Promise<void> {
  await test('normalizes Spark access aliases', () => {
    assert.equal(normalizeSparkAccessProfile('1'), 'chat');
    assert.equal(normalizeSparkAccessProfile('access 1'), 'chat');
    assert.equal(normalizeSparkAccessProfile('level 2'), 'builder');
    assert.equal(normalizeSparkAccessProfile('access level 2'), 'builder');
    assert.equal(normalizeSparkAccessProfile('L3'), 'agent');
    assert.equal(normalizeSparkAccessProfile('access 3'), 'agent');
    assert.equal(normalizeSparkAccessProfile('level-4'), 'developer');
    assert.equal(normalizeSparkAccessProfile('access 4'), 'developer');
    assert.equal(normalizeSparkAccessProfile('chat'), 'chat');
    assert.equal(normalizeSparkAccessProfile('chat only'), 'chat');
    assert.equal(normalizeSparkAccessProfile('mission'), 'builder');
    assert.equal(normalizeSparkAccessProfile('build'), null);
    assert.equal(normalizeSparkAccessProfile('build when asked'), 'builder');
    assert.equal(normalizeSparkAccessProfile('github'), 'agent');
    assert.equal(normalizeSparkAccessProfile('research + build'), 'agent');
    assert.equal(normalizeSparkAccessProfile('research & build'), 'agent');
    assert.equal(normalizeSparkAccessProfile('workspace'), null);
    assert.equal(normalizeSparkAccessProfile('workspace access'), 'developer');
    assert.equal(normalizeSparkAccessProfile('local workspace access'), 'developer');
    assert.equal(normalizeSparkAccessProfile('sandbox'), 'developer');
    assert.equal(normalizeSparkAccessProfile('sandboxed local access'), 'developer');
    assert.equal(normalizeSparkAccessProfile('full'), null);
    assert.equal(normalizeSparkAccessProfile('full access'), 'operator');
    assert.equal(normalizeSparkAccessProfile('operating system'), 'operator');
    assert.equal(normalizeSparkAccessProfile('OS'), 'operator');
    assert.equal(normalizeSparkAccessProfile('level 5'), 'operator');
    assert.equal(normalizeSparkAccessProfile('operator'), 'operator');
    assert.equal(normalizeSparkAccessProfile('whole computer'), 'operator');
    assert.equal(normalizeSparkAccessProfile('local project'), 'developer');
    assert.equal(normalizeSparkAccessProfile('local repo'), 'developer');
    assert.equal(normalizeSparkAccessProfile('unknown'), null);
  });

  await test('stores access profile per chat', async () => {
    resetJsonStateForTests();
    process.env.SPARK_GATEWAY_STATE_DIR = await mkdtemp(path.join(os.tmpdir(), 'spark-access-test-'));

    assert.equal(await getConfiguredSparkAccessProfile(123), null);
    assert.equal(await getSparkAccessProfile(123), 'developer');
    await setSparkAccessProfile(123, 'agent');

    assert.equal(await getConfiguredSparkAccessProfile(123), 'agent');
    assert.equal(await getSparkAccessProfile(123), 'agent');
    assert.equal(await getSparkAccessProfile(456), 'developer');
  });

  await test('allows environment override of default access profile', async () => {
    resetJsonStateForTests();
    process.env.SPARK_GATEWAY_STATE_DIR = await mkdtemp(path.join(os.tmpdir(), 'spark-access-env-test-'));
    const originalDefault = process.env.SPARK_AGENT_ACCESS_PROFILE;
    process.env.SPARK_AGENT_ACCESS_PROFILE = 'chat only';
    try {
      assert.equal(await getSparkAccessProfile(789), 'chat');
    } finally {
      if (originalDefault === undefined) {
        delete process.env.SPARK_AGENT_ACCESS_PROFILE;
      } else {
        process.env.SPARK_AGENT_ACCESS_PROFILE = originalDefault;
      }
    }
  });

  await test('describes tool boundaries by access profile', () => {
    const matrix = [
      { profile: 'chat', spawnerBuild: false, externalResearch: false, operatingSystem: false },
      { profile: 'builder', spawnerBuild: true, externalResearch: false, operatingSystem: false },
      { profile: 'agent', spawnerBuild: true, externalResearch: true, operatingSystem: false },
      { profile: 'developer', spawnerBuild: true, externalResearch: true, operatingSystem: true },
      { profile: 'operator', spawnerBuild: true, externalResearch: true, operatingSystem: true }
    ] as const;

    for (const row of matrix) {
      assert.equal(sparkAccessAllowsSpawnerBuilds(row.profile), row.spawnerBuild, `${row.profile} spawner`);
      assert.equal(sparkAccessAllowsExternalResearch(row.profile), row.externalResearch, `${row.profile} research`);
      assert.equal(sparkAccessAllowsOperatingSystemWork(row.profile), row.operatingSystem, `${row.profile} os`);
      assert.equal(sparkAccessAllows(row.profile, 'spawner_build'), row.spawnerBuild, `${row.profile} generic spawner`);
      assert.equal(sparkAccessAllows(row.profile, 'external_research'), row.externalResearch, `${row.profile} generic research`);
      assert.equal(sparkAccessAllows(row.profile, 'operating_system'), row.operatingSystem, `${row.profile} generic os`);
    }

    assert.equal(sparkAccessAllowsWorkspaceBuilds('agent'), false);
    assert.equal(sparkAccessAllowsWorkspaceBuilds('developer'), true);
    assert.equal(sparkAccessAllowsWorkspaceBuilds('operator'), true);
    assert.equal(sparkAccessLevel('developer'), 4);
    assert.equal(sparkAccessLevel('operator'), 5);
    assert.equal(sparkAccessLabel('agent'), 'Access level 3');
    assert.equal(sparkAccessLabel('developer'), 'Access level 4');
    assert.equal(sparkAccessLabel('operator'), 'Access level 5');
    assert.match(describeSparkAccessProfile('developer'), /sandboxed local work/);
    assert.match(describeSparkAccessProfile('developer'), /spark access setup/);
    assert.match(describeSparkAccessProfile('developer'), /prove it is writable/);
    assert.match(describeSparkAccessProfile('operator'), /whole-computer operator work/);
    assert.match(describeSparkAccessProfile('agent'), /not local folders/);
    assert.match(renderSparkAccessStatus('agent'), /Spark access: Access level 3/);
    assert.match(renderSparkAccessStatus('agent'), /What each access level allows/);
    assert.match(renderSparkAccessStatus('agent'), /\/access 4  Sandboxed local projects and files \(recommended for local builds\)/);
    assert.match(renderSparkAccessStatus('agent'), /\/access 5  Whole-computer operator mode/);
    assert.match(renderSparkAccessStatus('builder'), /Requested builds and missions/);
    assert.match(renderSparkAccessStatus('agent'), /\/access 4/);
    assert.match(renderSparkAccessLevelGuide(), /Talk with Spark, save memories, recall notes/);
    assert.match(renderSparkAccessLevelGuide(), /start a Spawner build only after you clearly ask/);
    assert.match(renderSparkAccessLevelGuide(), /research public links, docs, and GitHub repos/);
    assert.match(renderSparkAccessLevelGuide(), /recommended for local builders/);
    assert.match(renderSparkAccessLevelGuide(), /inside approved Spark workspaces/);
    assert.match(renderSparkAccessLevelGuide(), /spark access setup/);
    assert.match(renderSparkAccessLevelGuide(), /Whole-computer operator mode/);
    assert.match(renderSparkAccessLevelGuide(), /must not reveal secrets or run destructive actions/);
    assert.match(renderSparkAccessOnboarding(), /Default right now: Access level 4/);
    assert.match(renderSparkAccessOnboarding('agent'), /Choose how much access this Telegram chat has/);
    assert.match(renderSparkAccessOnboarding('agent'), /What each access level allows/);
    assert.match(renderSparkAccessOnboarding('agent'), /\/access 4  Sandboxed local projects and files \(recommended for local builds\)/);
    assert.match(renderSparkAccessOnboarding('agent'), /\/access 5  Whole-computer operator mode/);
    assert.match(renderSparkAccessOnboarding('agent'), /Default right now: Access level 3/);
    assert.match(renderSparkAccessOnboarding('developer'), /Default right now: Access level 4/);
    assert.match(renderSparkAccessOnboarding('agent'), /change this later anytime by sending \/access 1/);
  });

  await test('renders compact conversational access replies', () => {
    const status = renderSparkAccessBriefStatus('developer');
    assert.match(status, /You are on Access level 4/);
    assert.match(status, /approved Spark sandboxes/);
    assert.match(status, /spark access setup/);
    assert.match(status, /change my access level to 3/);
    assert.doesNotMatch(status, /What each access level allows/);

    const writableStatus = renderSparkAccessBriefStatus('developer', {
      runnerWritable: 'yes',
      runnerLabel: 'test runner writable'
    });
    assert.match(writableStatus, /Current runner: writable preflight passed/);

    const mismatchStatus = renderSparkAccessCapabilityStatus('developer', {
      runnerWritable: 'no',
      runnerLabel: 'test runner read-only',
      failureReason: 'EROFS'
    });
    assert.match(mismatchStatus, /Configured access: Access level 4/);
    assert.match(mismatchStatus, /Current runner: read-only \(EROFS\)/);
    assert.match(mismatchStatus, /access level is permission; runner capability/);

    const operatorStatus = renderSparkAccessBriefStatus('operator', { runnerWritable: 'yes' });
    assert.match(operatorStatus, /You are on Access level 5/);
    assert.match(operatorStatus, /whole-computer operator work/);

    const confirmations = [
      ['chat', 'Done - I changed this chat to Access level 1.'],
      ['builder', 'Done - I changed this chat to Access level 2.'],
      ['agent', 'Done - I changed this chat to Access level 3.'],
      ['developer', 'Done - I changed this chat to Access level 4.'],
      ['operator', 'Done - I changed this chat to Access level 5.']
    ] as const;
    for (const [profile, expected] of confirmations) {
      const changed = renderSparkAccessChangeConfirmation(profile);
      assert.equal(changed, expected);
      assert.doesNotMatch(changed, /What each level means/);
      assert.doesNotMatch(changed, /Change it with/);
      assert.doesNotMatch(changed, /Default/);
    }

    const help = renderSparkAccessConversationHelp('builder');
    assert.match(help, /currently Access level 2/);
    assert.match(help, /Level 4: sandboxed local projects/);
    assert.match(help, /Level 5: whole-computer operator mode/);
    assert.match(help, /runner is read-only/);
    assert.doesNotMatch(help, /\/access 1/);
  });

  await test('slash access setter uses compact confirmation instead of full help', async () => {
    const indexSource = await readFile(path.join(__dirname, '..', 'src', 'index.ts'), 'utf8');
    const accessCommand = indexSource.match(/bot\.command\('access', async \(ctx\) => \{[\s\S]*?\n\}\);/);
    assert.ok(accessCommand, 'expected /access command handler to exist');
    assert.match(accessCommand[0], /renderSparkAccessStatus\(current\)/);
    assert.match(accessCommand[0], /renderSparkAccessChangeReply\(next\)/);
    assert.doesNotMatch(accessCommand[0], /ctx\.reply\(renderSparkAccessStatus\(next\)\)/);
    assert.match(indexSource, /renderSparkAccessChangeConfirmation\(profile\)/);
    assert.match(indexSource, /renderSparkAccessCapabilityStatus\(profile, runnerPreflight\)/);
  });

  await test('gates Spawner command side doors by access level', async () => {
    const indexSource = await readFile(path.join(__dirname, '..', 'src', 'index.ts'), 'utf8');

    const pendingCreatorControl = indexSource.match(/async function handlePendingCreatorMissionControl[\s\S]*?\nfunction isPendingClarificationFollowup/);
    assert.ok(pendingCreatorControl, 'expected pending creator mission control handler to exist');
    assert.match(pendingCreatorControl[0], /sparkAccessAllows\(accessProfile, 'spawner_build'\)/);
    assert.match(pendingCreatorControl[0], /renderSparkAccessDenial\(accessProfile, 'spawner_build'\)/);

    const boardCommand = indexSource.match(/bot\.command\('board', async \(ctx\) => \{[\s\S]*?\n\}\);/);
    assert.ok(boardCommand, 'expected /board command handler to exist');
    assert.match(boardCommand[0], /sparkAccessAllows\(accessProfile, 'spawner_build'\)/);

    const missionCommand = indexSource.match(/bot\.command\('mission', async \(ctx\) => \{[\s\S]*?\n\}\);/);
    assert.ok(missionCommand, 'expected /mission command handler to exist');
    assert.match(missionCommand[0], /sparkAccessAllows\(accessProfile, 'spawner_build'\)/);

    const naturalBoardRoute = indexSource.match(/const spawnerBoardIntent = parseSpawnerBoardNaturalIntent\(text\);[\s\S]*?\n    if \(isLocalSparkServiceRequest/);
    assert.ok(naturalBoardRoute, 'expected natural Spawner board route to exist');
    assert.match(naturalBoardRoute[0], /sparkAccessAllows\(accessProfile, 'spawner_build'\)/);
    assert.match(naturalBoardRoute[0], /renderSparkAccessDenial\(accessProfile, 'spawner_build'\)/);
  });

  await test('validates mixed access change and build intents before mutating access', async () => {
    const indexSource = await readFile(path.join(__dirname, '..', 'src', 'index.ts'), 'utf8');
    const buildIntentRoute = indexSource.match(/if \(buildIntent\) \{\s*console\.log\(`\[BuildIntent\][\s\S]*?await handleBuildIntent\(/);
    assert.ok(buildIntentRoute, 'expected main build intent route to exist');
    assert.match(buildIntentRoute[0], /validateSparkAccessProfileForRuntime\(normalizedAccessPreference\)/);
    assert.match(buildIntentRoute[0], /await ctx\.reply\(runtimeGate\.message\)/);
    assert.match(buildIntentRoute[0], /await setSparkAccessProfile\(ctx\.chat\.id, normalizedAccessPreference\)/);
  });

  await test('agent operating context uses Telegram-safe command aliases', async () => {
    const indexSource = await readFile(path.join(__dirname, '..', 'src', 'index.ts'), 'utf8');
    const distIndexSource = await readFile(path.join(__dirname, '..', 'dist', 'index.js'), 'utf8');
    assert.match(indexSource, /bot\.command\('context', handleAgentOperatingContextCommand\)/);
    assert.match(indexSource, /bot\.command\('operating_context', handleAgentOperatingContextCommand\)/);
    assert.match(indexSource, /bot\.command\('agent_context', handleAgentOperatingContextCommand\)/);
    assert.match(indexSource, /bot\.command\('probe', handleAgentRouteProbeCommand\)/);
    assert.match(indexSource, /bot\.command\('route_probe', handleAgentRouteProbeCommand\)/);
    assert.match(indexSource, /bot\.command\('nl_route', handleNaturalRouteProbeCommand\)/);
    assert.match(indexSource, /bot\.command\('natural_route', handleNaturalRouteProbeCommand\)/);
    assert.match(indexSource, /bot\.command\('ledger', handleCapabilityLedgerReviewCommand\)/);
    assert.match(indexSource, /bot\.command\('capabilities', handleCapabilityLedgerReviewCommand\)/);
    assert.match(indexSource, /bot\.command\('voice', async \(ctx\) => \{/);
    assert.match(indexSource, /replyViaBuilder\(ctx, ctx\.message\?\.text \|\| '\/voice'\)/);
    assert.doesNotMatch(indexSource, /spark\.getVoice\(\)/);
    const sparkSource = await readFile(path.join(__dirname, '..', 'src', 'spark.ts'), 'utf8');
    const distSparkSource = await readFile(path.join(__dirname, '..', 'dist', 'spark.js'), 'utf8');
    assert.doesNotMatch(sparkSource, /getVoice/);
    assert.doesNotMatch(distSparkSource, /getVoice/);
    assert.match(distIndexSource, /bot\.command\('voice', async \(ctx\) => \{/);
    assert.match(distIndexSource, /replyViaBuilder\(ctx, .*'\/voice'/);
    assert.doesNotMatch(distIndexSource, /spark_1\.spark\.getVoice\(\)/);
    assert.match(indexSource, /AOC_CORE_ROUTE_KEYS/);
    assert.match(indexSource, /firstArg === 'core'/);
    assert.match(indexSource, /firstArg === 'all'/);
    assert.match(indexSource, /bot\.command\('conversation_context'/);
    assert.doesNotMatch(indexSource, /bot\.command\('operating-context'/);
    assert.doesNotMatch(indexSource, /bot\.command\('agent-context'/);
    assert.doesNotMatch(indexSource, /bot\.command\('route-probe'/);
  });

  await test('renders runtime access hints that prevent filesystem access contradictions', () => {
    assert.match(renderSparkAccessRuntimeHint('developer'), /Current Spark access: Access level 4/);
    assert.match(renderSparkAccessRuntimeHint('developer'), /check runner writability/);
    assert.match(renderSparkAccessRuntimeHint('developer'), /spark access setup/);
    assert.match(renderSparkAccessRuntimeHint('developer'), /Spawner\/Codex/);
    assert.match(renderSparkAccessRuntimeHint('operator'), /Current Spark access: Access level 5/);
    assert.match(renderSparkAccessRuntimeHint('operator'), /Whole-computer operator mode/);
    assert.match(renderSparkAccessRuntimeHint('agent'), /Current Spark access: Access level 3/);
    assert.match(renderSparkAccessRuntimeHint('agent'), /Use \/access 4/);
    assert.match(renderSparkAccessRuntimeHint('chat'), /Do not claim local filesystem access/);
  });

  await test('classifies operating-system work and renders denial copy', () => {
    assert.equal(sparkMissionNeedsOperatingSystemAccess('say exactly OK'), false);
    assert.equal(sparkMissionNeedsOperatingSystemAccess('build this at C:\\Users\\USER\\Desktop\\probe'), true);
    assert.equal(sparkMissionNeedsOperatingSystemAccess('debug my local project'), true);
    assert.equal(sparkMissionNeedsOperatingSystemAccess('create a small browser app', '/Users/me/app'), true);

    assert.match(renderSparkAccessDenial('chat', 'spawner_build'), /Access level 2/);
    assert.match(renderSparkAccessDenial('chat', 'spawner_build'), /change my access level to 2/);
    assert.match(renderSparkAccessDenial('chat', 'spawner_build'), /\/access 2/);
    assert.match(renderSparkAccessDenial('builder', 'external_research'), /Access level 3/);
    assert.match(renderSparkAccessDenial('builder', 'external_research'), /change my access level to 3/);
    assert.match(renderSparkAccessDenial('builder', 'external_research'), /change my access level to 4/);
    assert.match(renderSparkAccessDenial('agent', 'operating_system'), /operating system/);
    assert.match(renderSparkAccessDenial('agent', 'operating_system'), /change my access level to 4/);
    assert.match(renderSparkAccessDenial('agent', 'operating_system'), /\/access 5/);
    assert.match(renderSparkAccessDenial('agent', 'operating_system'), /\/access 4/);
  });

  await test('gates access level 4 on hosted Spark Live unless explicitly enabled', () => {
    assert.equal(sparkIsHostedRuntime({}), false);
    assert.equal(sparkIsHostedRuntime({ SPARK_LIVE_CONTAINER: '1' }), true);
    assert.equal(sparkIsHostedRuntime({ SPARK_SPAWNER_HOST: '0.0.0.0' }), true);
    assert.equal(sparkIsHostedRuntime({ SPARK_SPAWNER_HOST: '::' }), true);
    assert.equal(sparkIsHostedRuntime({ SPARK_ALLOWED_HOSTS: 'agent.example.com' }), true);

    assert.equal(sparkHostedFullAccessAllowed({}), false);
    assert.equal(sparkHostedFullAccessAllowed({ SPARK_ALLOW_HOSTED_FULL_ACCESS: 'true' }), true);
    assert.equal(sparkHighAgencyWorkersAllowed({}), false);
    assert.equal(sparkHighAgencyWorkersAllowed({ SPARK_ALLOW_HIGH_AGENCY_WORKERS: '1' }), true);
    assert.equal(sparkLevel5RuntimeGuardrailsActive({}), false);
    assert.equal(sparkLevel5RuntimeGuardrailsActive({ SPARK_ALLOW_HIGH_AGENCY_WORKERS: '1' }), false);
    assert.equal(sparkLevel5RuntimeGuardrailsActive({
      SPARK_ALLOW_HIGH_AGENCY_WORKERS: '1',
      SPARK_ALLOW_EXTERNAL_PROJECT_PATHS: '1',
      SPARK_CODEX_SANDBOX: 'danger-full-access'
    }), true);

    assert.deepEqual(validateSparkAccessProfileForRuntime('developer', {}), { ok: true });
    assert.deepEqual(validateSparkAccessProfileForRuntime('agent', { SPARK_LIVE_CONTAINER: '1' }), { ok: true });
    assert.deepEqual(
      validateSparkAccessProfileForRuntime('developer', {
        SPARK_LIVE_CONTAINER: '1',
        SPARK_ALLOW_HOSTED_FULL_ACCESS: '1'
      }),
      { ok: true }
    );
    assert.deepEqual(
      validateSparkAccessProfileForRuntime('operator', {
        SPARK_ALLOW_HIGH_AGENCY_WORKERS: '1',
        SPARK_ALLOW_EXTERNAL_PROJECT_PATHS: '1',
        SPARK_CODEX_SANDBOX: 'danger-full-access'
      }),
      { ok: true }
    );

    const partialOperatorDenied = validateSparkAccessProfileForRuntime('operator', {
      SPARK_ALLOW_HIGH_AGENCY_WORKERS: '1'
    });
    assert.equal(partialOperatorDenied.ok, false);
    if (!partialOperatorDenied.ok) {
      assert.match(partialOperatorDenied.message, /spark access setup --level 5 --enable-high-agency/);
      assert.match(partialOperatorDenied.message, /spark restart/);
    }

    const operatorDenied = validateSparkAccessProfileForRuntime('operator', {});
    assert.equal(operatorDenied.ok, false);
    if (!operatorDenied.ok) {
      assert.match(operatorDenied.message, /Access level 5 is whole-computer operator mode/);
      assert.match(operatorDenied.message, /spark access setup --level 5 --enable-high-agency/);
    }

    const denied = validateSparkAccessProfileForRuntime('developer', { SPARK_SPAWNER_HOST: '0.0.0.0' });
    assert.equal(denied.ok, false);
    if (!denied.ok) {
      assert.match(denied.message, /Access level 4 is locked/);
      assert.match(denied.message, /\/access 3/);
      assert.match(denied.message, /SPARK_ALLOW_HOSTED_FULL_ACCESS=1/);
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
