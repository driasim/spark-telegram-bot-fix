import assert from 'node:assert/strict';
import { parseBuildIntent } from '../src/buildIntent';
import {
  formatProviderCompletionForTelegram,
  formatMissionRelayStateMessageForTelegram
} from '../src/missionRelay';
import {
  isSparkWorkflowBugHuntRequest,
  isNoExecutionBoundary,
  parseMissionUpdatePreferenceIntent,
  parseSpawnerBoardNaturalIntent,
  renderSparkWorkflowBugHuntReply
} from '../src/conversationIntent';
import {
  formatBuildClarificationReplyWithMicrocopy,
  formatCanvasReadySummary,
  formatCanvasShapingHeartbeatSummary,
  formatCanvasStillRunningSummary,
  formatLatestCanvasPlanReply,
  isDomainChipPendingDirection
} from '../src/index';

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function assertNoBuild(prompt: string): void {
  assert.equal(parseBuildIntent(prompt), null, `Unexpected build route for:\n${prompt}`);
}

function assertBuild(prompt: string, expectedProjectName: string): void {
  const intent = parseBuildIntent(prompt);
  assert.ok(intent, `Expected build route for:\n${prompt}`);
  assert.equal(intent.projectName, expectedProjectName);
}

test('bug hunt: strategy, QA, and route-meta conversations do not hijack into builds', () => {
  [
    'yeah buybacks not for now actually, maybe later, i think we can earn it back from NFTs, if we do sell the NFTs via token, and create a nice structure for it to get hype right after the launch.',
    'what else would you actually test next as edge cases so that we can make the spawner loop a lot better?',
    'are we making these way too deterministic btw, because the messages came very fast like a chatbot',
    'what would you actually be making better here? I would say the Telegram messages, each time sharing the mission number is obsolete.',
    'look into the whole Spark systems and repos so we really find all the messages that can be improved',
    'can you give more examples and intelligence on this route confidence system',
    'were h70 skills mandatory here, and can we make sure normal prompts still operate?',
    'what else should Mission Control and Spawner workflow improve before we ship?',
    'right this has been actually really good, so should we send those PRs or what edge cases should we test next?',
    'prepare a huge unit test and let us become bug hunters for Mission Control and Spawner workflow',
    'are there any PR things we forgot before the publishing machine merges?',
    'should we focus and ship these or keep auditing Telegram composition first?'
  ].forEach(assertNoBuild);
});

test('bug hunt: explicit builds still route, with human project titles', () => {
  assertBuild(
    'Build a browser game called Recursive Sage: Proof Orchard. Make it a reasoning game Recursive would want to play.',
    'Recursive Sage: Proof Orchard'
  );
  assertBuild(
    'Build a token launch dashboard for NFT sale strategy.',
    'Token Launch Dashboard'
  );
  assertBuild(
    'Build another game that Spark Recursive would actually want to play. It should test its own reasoning skills too.',
    'Recursive Sage Reasoning Game'
  );
  assert.doesNotMatch(
    parseBuildIntent('Build another game that Spark Recursive would actually want to play. It should test its own reasoning skills too.')?.projectName || '',
    /\bNother\b/i
  );
  const reasoningGame = parseBuildIntent('Build another game that Spark Recursive would actually want to play. It should test its own reasoning skills too.');
  assert.ok(reasoningGame);
  assert.match(reasoningGame.prd, /reasoning game/i);
  assert.match(reasoningGame.prd, /trust, verify, quarantine, or revise/i);
  assert.doesNotMatch(reasoningGame.prd, /\bmaze\b/i);
});

test('bug hunt: clarification microcopy preserves reasoning-game intent', () => {
  const reply = formatBuildClarificationReplyWithMicrocopy(
    'Recursive Sage Reasoning Game',
    ['Should it be atmospheric and strange, or fast with score pressure?'],
    ['Assume it should test reasoning, trust, memory drift, contradiction handling, and action confidence.'],
    {
      recommendation: 'Build Recursive Sage as a browser maze puzzler with shifting walls and a win.',
      steeringQuestion: 'Should it feel atmospheric or fast?'
    }
  );

  assert.match(reply, /I can turn this into Recursive Sage Reasoning Game\./);
  assert.match(reply, /trust\/verify\/quarantine choices/);
  assert.doesNotMatch(reply, /\bmaze\b/i);
});

test('bug hunt: no-execution boundaries outrank build and mission words', () => {
  const prompts = [
    'I am mentioning build and mission, but do not start anything. What is the current Spark risk profile?',
    'I am asking about a bug in mission routing. Do not launch a mission; just explain the likely failure class.',
    'please help me design a project called Relay Workshop with kanban and canvas, but do not build yet',
    'do not build yet, help me think through a domain chip for route confidence',
    'No need, we can talk here.',
    'Do not run another mission; just tell me what edge cases remain.',
    'Don\'t launch anything yet, but explain how the Spawner loop should recover after restart.',
    'No build for now, I only want to compare the Mission board and Canvas language.'
  ];

  prompts.forEach((prompt) => {
    assert.equal(isNoExecutionBoundary(prompt), true, `Expected no-execution boundary for:\n${prompt}`);
    assertNoBuild(prompt);
  });
});

test('bug hunt: pending domain-chip drafts only accept explicit confirmation or chip-shaping direction', () => {
  assert.equal(isDomainChipPendingDirection('go'), true);
  assert.equal(isDomainChipPendingDirection('names with rationale and usage angle, make the vibe surreal'), true);
  assert.equal(isDomainChipPendingDirection('luxury sci-fi but still developer-friendly'), true);
  assert.equal(
    isDomainChipPendingDirection('prepare a huge unit test and let us become bug hunters for Mission Control and Spawner workflow'),
    false
  );
  assert.equal(isDomainChipPendingDirection('what else should we test in the Spawner loop?'), false);
});

test('bug hunt: Spark workflow QA prompts get a local plan, not invented execution claims', () => {
  const prompt = 'prepare a huge unit test and let us become bug hunters for Mission Control and Spawner workflow';
  assert.equal(isSparkWorkflowBugHuntRequest(prompt), true);
  const reply = renderSparkWorkflowBugHuntReply(prompt);

  assert.match(reply, /QA pass first, not a mission launch/);
  assert.match(reply, /route hijacks/);
  assert.match(reply, /no-edit Spawner probes/);
  assert.match(reply, /I will not start a mission from this wording\./);
  assert.doesNotMatch(reply, /read-only/i);
  assert.doesNotMatch(reply, /Prepared, but/i);
  assert.doesNotMatch(reply, /tests\/missionControlSpawnerWorkflow/i);
});

test('bug hunt: mission utility requests do not become project builds', () => {
  assert.equal(parseMissionUpdatePreferenceIntent('include board and canvas links for missions')?.links, 'both');
  assert.equal(parseMissionUpdatePreferenceIntent('for missions only send start and end updates')?.verbosity, 'minimal');
  assert.equal(parseSpawnerBoardNaturalIntent('which LLM took the latest Spawner job?'), 'latest_provider');
  assert.equal(parseSpawnerBoardNaturalIntent('what was the mission?'), 'latest_mission');
  assert.equal(parseSpawnerBoardNaturalIntent('why did the latest mission fail?'), 'latest_failure');

  [
    'include board and canvas links for missions',
    'for missions only send start and end updates',
    'which LLM took the latest Spawner job?',
    'why did the latest mission fail?',
    'show me the current Spawner/Kanban board'
  ].forEach(assertNoBuild);
});

test('bug hunt: Telegram composition keeps mission ids and telemetry mostly behind links', () => {
  const canvasReady = formatCanvasReadySummary({
    projectName: 'Proof Orchard',
    taskCount: 4,
    elapsed: 145,
    readyCanvasUrl: 'http://127.0.0.1:3333/canvas?pipeline=p1&mission=mission-123',
    kanbanUrl: 'http://127.0.0.1:3333/kanban?mission=mission-123',
    analysis: {
      tasks: [
        { title: 'Create the app shell', skills: ['frontend-engineer', 'ui-design'] },
        { title: 'Implement reasoning rounds', skills: ['frontend-engineer'] },
        { title: 'Polish the visual system', skills: ['ui-design', 'accessibility'] },
        { title: 'Write smoke notes', skills: ['technical-writer'] }
      ]
    }
  });
  assert.match(canvasReady, /Canvas is ready for Proof Orchard\./);
  assert.doesNotMatch(canvasReady, /Spawned tasks/);
  assert.match(canvasReady, /Canvas\n• http:\/\/127\.0\.0\.1:3333\/canvas/);
  assert.doesNotMatch(canvasReady, /Mission board/);
  assert.match(canvasReady, /Ask for tasks or skills if you want the full plan\./);
  assert.doesNotMatch(canvasReady, /^Mission:\s*mission-123/im);
  assert.doesNotMatch(canvasReady, /elapsed|trace|request/i);

  const heartbeat = formatCanvasShapingHeartbeatSummary({ projectName: 'Proof Orchard', elapsedSeconds: 120 });
  assert.match(heartbeat, /still shaping Proof Orchard\./);
  assert.match(heartbeat, /I will send the canvas when it is ready\./);
  assert.doesNotMatch(heartbeat, /🛠️/);
  assert.doesNotMatch(heartbeat, /Canvas prep has been running/);
  assert.doesNotMatch(heartbeat, /^Status$/m);
  assert.doesNotMatch(heartbeat, /^Move$/m);
  assert.doesNotMatch(heartbeat, /Mission:/);

  const stillRunning = formatCanvasStillRunningSummary({
    projectName: 'Proof Orchard',
    elapsedSeconds: 240,
    kanbanUrl: 'http://127.0.0.1:3333/kanban?mission=mission-123'
  });
  assert.match(stillRunning, /still preparing Proof Orchard\./);
  assert.match(stillRunning, /I will send the canvas when it is ready\./);
  assert.doesNotMatch(stillRunning, /🛠️/);
  assert.doesNotMatch(stillRunning, /It has been shaping/);
  assert.doesNotMatch(stillRunning, /^Status$/m);
  assert.doesNotMatch(stillRunning, /^Move$/m);
  assert.doesNotMatch(stillRunning, /^Mission:\s*mission-123/im);
});

test('bug hunt: canvas task details stay available as an explicit follow-up', () => {
  const reply = formatLatestCanvasPlanReply({
    projectName: 'Proof Orchard',
    taskCount: 4,
    readyCanvasUrl: 'http://127.0.0.1:3333/canvas?pipeline=p1&mission=mission-123',
    recordedAt: '2026-05-12T09:00:00.000Z',
    tasks: [
      { title: 'Create the app shell', skills: ['frontend-engineer', 'ui-design'] },
      { title: 'Implement reasoning rounds', skills: ['frontend-engineer'] },
      { title: 'Polish the visual system', skills: ['ui-design', 'accessibility'] },
      { title: 'Write smoke notes', skills: ['technical-writer'] }
    ]
  });

  assert.match(reply, /The latest canvas is for Proof Orchard\./);
  assert.match(reply, /4 build steps are queued\./);
  assert.match(reply, /Tasks\n• Create the app shell - frontend-engineer, ui-design/);
  assert.match(reply, /• Write smoke notes - technical-writer/);
  assert.match(reply, /Canvas\n• http:\/\/127\.0\.0\.1:3333\/canvas/);
  assert.doesNotMatch(reply, /^Mission:/im);
  assert.doesNotMatch(reply, /Mission board/);
});

test('bug hunt: provider completion does not make failures look shipped', () => {
  const unknownError = formatProviderCompletionForTelegram({
    providerLabel: 'codex',
    missionId: 'mission-unknown-error',
    verbosity: 'normal',
    response: 'unknown error'
  });
  assert.match(unknownError, /(?:needs attention|blocked|problem|could not finish)/i);
  assert.match(unknownError, /unknown error/i);
  assert.match(unknownError, /The Mission board has the full trace if you want to inspect it\./);
  assert.doesNotMatch(unknownError, /^Move$/m);
  assert.doesNotMatch(unknownError, /✨ Spark (?:shipped|finished|wrapped|has the result)/i);
  assert.doesNotMatch(unknownError, /Mission: mission-unknown-error/);

  const noText = formatProviderCompletionForTelegram({
    providerLabel: 'codex',
    missionId: 'mission-empty',
    verbosity: 'normal',
    response: 'completed without a text response'
  });
  assert.match(noText, /Spark finished, but no final notes came back\./);
  assert.doesNotMatch(noText, /Codex:\s*completed without a text response/i);
  assert.doesNotMatch(noText, /Mission: mission-empty/);
});

test('bug hunt: pause, resume, and cancel relay state messages stay compact', () => {
  for (const state of ['paused', 'resumed', 'cancelled'] as const) {
    const message = formatMissionRelayStateMessageForTelegram({
      state,
      missionId: 'mission-state-noise',
      links: ['Mission board: http://127.0.0.1:3333/kanban?mission=mission-state-noise']
    });
    assert.doesNotMatch(message, /^Move$/m);
    assert.match(message, /(?:I will hold Telegram handoffs until it resumes|Telegram handoffs are back on|I will keep any late handoff messages quiet)/);
    assert.match(message, /Mission board: http:\/\/127\.0\.0\.1:3333\/kanban/);
    assert.doesNotMatch(message, /^Mission:\s*mission-state-noise/im);
    assert.ok(message.split('\n').length <= 6, `State message too tall:\n${message}`);
  }
});
