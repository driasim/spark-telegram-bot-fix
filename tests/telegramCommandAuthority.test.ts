import assert from 'node:assert/strict';
import {
  authorizeTelegramCommandAction,
  buildTelegramCommandActionEnvelope,
  commandRouteForRunVariant
} from '../src/telegramCommandAuthority';

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function commandAuth(input: {
  text: string;
  commandName: string;
  route: Parameters<typeof authorizeTelegramCommandAction>[0]['route'];
  toolName: string;
  ownerSystem: string;
  mutationClass: Parameters<typeof authorizeTelegramCommandAction>[0]['mutationClass'];
  action?: string;
  kind?: Parameters<typeof authorizeTelegramCommandAction>[0]['kind'];
}) {
  return authorizeTelegramCommandAction({
    ...input,
    userRef: 'user:qa',
    chatRef: 'chat:qa',
    accessProfile: 'admin',
    conversationKind: 'command'
  });
}

test('slash run build commands authorize through command envelope', () => {
  const text = '/run Build a tiny static landing page for a cafe with a menu section.';
  const result = commandAuth({
    text,
    commandName: 'run',
    route: commandRouteForRunVariant({ commandName: 'run', isBuild: true }),
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission',
    action: 'spawner.build',
    kind: 'build_or_spawner'
  });

  assert.equal(result.allow, true);
  assert.equal(result.harnessCore?.envelope.surface, 'telegram');
  assert.equal(result.harnessCore?.envelope.selected_move, 'execute_action');
  assert.equal(result.harnessCore?.authorization.verdict, 'allow');
});

test('slash provider run keeps no-file wording as a launch constraint, not a no-run boundary', () => {
  const text = '/runcodex Reply exactly TESTER_REALPATH_OK and do not create files.';
  const envelope = buildTelegramCommandActionEnvelope({
    text,
    commandName: 'runcodex',
    route: 'natural_run',
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission',
    userRef: 'user:qa',
    chatRef: 'chat:qa',
    accessProfile: 'admin',
    conversationKind: 'command'
  });
  const result = commandAuth({
    text,
    commandName: 'runcodex',
    route: 'natural_run',
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.equal(envelope.directive.noExecution, false);
  assert.equal(result.allow, true);
  assert.equal(result.harnessCore?.authorization.verdict, 'allow');
});

test('slash run commands still block explicit no-run boundaries', () => {
  const text = '/run do not run, launch, or execute anything; just explain mission routing.';
  const result = commandAuth({
    text,
    commandName: 'run',
    route: 'natural_run',
    toolName: 'spawner.run',
    ownerSystem: 'spawner-ui',
    mutationClass: 'launches_mission'
  });

  assert.equal(result.allow, false);
  assert.ok(result.reasonCodes.includes('no_execution_boundary'));
  assert.ok(result.reasonCodes.includes('harness_core:authority_state_chat_only'));
});

test('slash schedule create and delete commands authorize distinct schedule tools', () => {
  const create = commandAuth({
    text: '/schedule "*/5 * * * *" mission summarize deployment health',
    commandName: 'schedule',
    route: 'schedule.create',
    toolName: 'schedule.create',
    ownerSystem: 'spark-intelligence-builder',
    mutationClass: 'creates_schedule',
    action: 'schedule.create',
    kind: 'schedule_mutation'
  });
  const remove = commandAuth({
    text: '/schedules delete sched-abc123',
    commandName: 'schedules',
    route: 'schedule.delete',
    toolName: 'schedule.delete',
    ownerSystem: 'spark-intelligence-builder',
    mutationClass: 'deletes_schedule',
    action: 'schedule.delete',
    kind: 'schedule_mutation'
  });

  assert.equal(create.allow, true);
  assert.equal(create.toolAuthorization.verdict, 'allowed');
  assert.equal(remove.allow, true);
  assert.equal(remove.toolAuthorization.verdict, 'allowed');
});

test('slash schedule command blocks contradictory no-schedule text', () => {
  const result = commandAuth({
    text: '/schedule "*/5 * * * *" mission summarize deployment health but do not schedule anything',
    commandName: 'schedule',
    route: 'schedule.create',
    toolName: 'schedule.create',
    ownerSystem: 'spark-intelligence-builder',
    mutationClass: 'creates_schedule',
    action: 'schedule.create',
    kind: 'schedule_mutation'
  });

  assert.equal(result.allow, false);
  assert.ok(result.reasonCodes.includes('no_execution_boundary'));
});
