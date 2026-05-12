import assert from 'node:assert/strict';
import { evaluateDeterministicRoute } from '../src/routeFirewall';
import type { DeterministicRouteId } from '../src/routeFirewall';

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('blocks interruptive routes for plain Spark system questions', () => {
  const verdict = evaluateDeterministicRoute(
    'spawner.build',
    'what build updates are missing in Spark routing?'
  );

  assert.equal(verdict.allow, false);
  assert.equal(verdict.reason, 'plain_chat_protected');
  assert.equal(verdict.confidence, 'blocked');
});

test('allows explicit project builds through the firewall', () => {
  const verdict = evaluateDeterministicRoute(
    'spawner.build',
    'Build this at C:\\Users\\USER\\Desktop\\spark-timer: a tiny timer app'
  );

  assert.equal(verdict.allow, true);
  assert.equal(verdict.reason, 'concrete_project_build');
  assert.equal(verdict.confidence, 'explicit');
});

test('explicit no-execution boundaries beat build and mission keywords', () => {
  const cases = [
    'Build the app. Actually, do not build yet, help me think.',
    'I am mentioning build and mission, but do not start anything.',
    'no need we can talk here'
  ];
  const routes: DeterministicRouteId[] = [
    'spawner.build',
    'spawner.contextual_mission',
    'spawner.pending_clarification',
    'natural_run'
  ];

  for (const prompt of cases) {
    for (const route of routes) {
      const verdict = evaluateDeterministicRoute(route, prompt);
      assert.equal(verdict.allow, false, `${route}: ${prompt}`);
      assert.equal(verdict.reason, 'explicit_no_execution_boundary', `${route}: ${prompt}`);
      assert.equal(verdict.confidence, 'blocked', `${route}: ${prompt}`);
    }
  }
});

test('bounded no-edit mission wording is not treated as no-execution', () => {
  const prompt = 'Can you start a mission that only replies TEST_OK and does not edit files?';
  const verdict = evaluateDeterministicRoute('spawner.contextual_mission', prompt);

  assert.notEqual(verdict.reason, 'explicit_no_execution_boundary');
});

test('allows explicit memory updates even when they mention plans', () => {
  const verdict = evaluateDeterministicRoute(
    'memory.write',
    'Memory update: my current plan is Neon Harbor Telegram memory test. Please save this as my current plan.'
  );

  assert.equal(verdict.allow, true);
  assert.equal(verdict.reason, 'explicit_memory_write');
  assert.equal(verdict.confidence, 'explicit');
});

test('blocks build and mission routes from stealing bounded operator probes', () => {
  const prompt = 'Run a safe Level 5 smoke test: create a tiny file at C:\\Users\\USER\\AppData\\Local\\Temp\\spark-telegram-level5-smoke.txt, write "level5 ok", read it back, then delete it. Do not touch anything else. Tell me each step.';
  const competingRoutes: DeterministicRouteId[] = [
    'spawner.build',
    'spawner.default_build',
    'spawner.contextual_mission',
    'domain_chip.create',
    'spark.self_improvement'
  ];

  for (const route of competingRoutes) {
    const verdict = evaluateDeterministicRoute(route, prompt);
    assert.equal(verdict.allow, false, route);
    assert.equal(verdict.reason, 'operator_probe_competing_route', route);
    assert.equal(verdict.confidence, 'blocked', route);
  }

  const operatorVerdict = evaluateDeterministicRoute('operator.safe_action', prompt);
  assert.equal(operatorVerdict.allow, true);
  assert.equal(operatorVerdict.reason, 'bounded_operator_probe');
  assert.equal(operatorVerdict.confidence, 'explicit');
});

test('allows explicit repo and docs research even when the topic is routing architecture', () => {
  const verdict = evaluateDeterministicRoute(
    'spawner.external_research',
    'Look at OpenClaw and Hermes GitHub repos and docs to compare how their natural language routing works.'
  );

  assert.equal(verdict.allow, true);
  assert.equal(verdict.reason, 'explicit_external_research');
  assert.equal(verdict.confidence, 'explicit');
});

test('uses the firewall as a broad route-arbitration smoke matrix', () => {
  const cases: Array<{
    name: string;
    route: DeterministicRouteId;
    prompt: string;
    allow: boolean;
    reason?: string;
  }> = [
    {
      name: 'access design talk is chat, not access mutation',
      route: 'access.change',
      prompt: 'how can we make sure access level 4 creates the right setup for access level to be really 4?',
      allow: false,
      reason: 'plain_chat_protected'
    },
    {
      name: 'deterministic bug audit is chat, not build',
      route: 'spawner.build',
      prompt: 'also words like build access and setup hijack the chat instantly, can you check whether we fixed that?',
      allow: false,
      reason: 'plain_chat_protected'
    },
    {
      name: 'restart UX question is chat, not diagnostics',
      route: 'diagnostics.scan',
      prompt: 'what does restart Spark mean for users after access 5 confirmation?',
      allow: false,
      reason: 'plain_chat_protected'
    },
    {
      name: 'upgrade strategy is chat, not mission',
      route: 'spawner.contextual_mission',
      prompt: 'what else would be healthy to build for updates/upgrades besides the ledger?',
      allow: false,
      reason: 'plain_chat_protected'
    },
    {
      name: 'explicit project still builds',
      route: 'spawner.build',
      prompt: 'Build a private local-first dashboard for memory reports. It should show stale context, source labels, and review queues.',
      allow: true
    },
    {
      name: 'explicit diagnostics still runs',
      route: 'diagnostics.scan',
      prompt: 'Run diagnostics now.',
      allow: true,
      reason: 'explicit_diagnostics_run'
    },
    {
      name: 'short pending confirmation still works',
      route: 'spawner.pending_clarification',
      prompt: 'go',
      allow: true,
      reason: 'short_pending_confirmation'
    },
    {
      name: 'explicit provider run still works',
      route: 'natural_run',
      prompt: 'ask claude to review this plan',
      allow: true,
      reason: 'explicit_provider_run'
    }
  ];

  for (const entry of cases) {
    const verdict = evaluateDeterministicRoute(entry.route, entry.prompt);
    assert.equal(verdict.allow, entry.allow, entry.name);
    if (entry.reason) assert.equal(verdict.reason, entry.reason, entry.name);
  }
});
