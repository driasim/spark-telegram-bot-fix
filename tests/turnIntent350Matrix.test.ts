import assert from 'node:assert/strict';
import {
  authorizeToolCallFromEnvelope,
  buildTelegramTurnIntentEnvelope,
  type ToolAuthorizationInput
} from '../src/harnessContract';
import { authorizeTelegramActionFromEnvelope, type TelegramActionAuthorityInput } from '../src/telegramActionAuthority';
import { classifyTelegramIntentV2 } from '../src/telegramIntentGate';

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

type NegativeCase = {
  id: string;
  category: string;
  text: string;
};

type PositiveCase = {
  id: string;
  category: string;
  text: string;
  action: TelegramActionAuthorityInput;
};

const HIGH_AGENCY_TOOLS: Array<ToolAuthorizationInput & { label: string }> = [
  { label: 'mission', toolName: 'spawner.run', ownerSystem: 'spawner-ui', mutationClass: 'launches_mission' },
  { label: 'memory', toolName: 'memory.write', ownerSystem: 'domain-chip-memory', mutationClass: 'writes_memory' },
  { label: 'schedule', toolName: 'schedule.delete', ownerSystem: 'spark-intelligence-builder', mutationClass: 'deletes_schedule' },
  { label: 'chip', toolName: 'domain_chip.create', ownerSystem: 'domain-chip', mutationClass: 'creates_chip' },
  { label: 'external', toolName: 'external.fetch', ownerSystem: 'spark-intelligence-builder', mutationClass: 'external_network', externalNetwork: true },
  { label: 'provider', toolName: 'provider.run', ownerSystem: 'spawner-ui', mutationClass: 'external_network', externalNetwork: true },
  { label: 'publish', toolName: 'publish.run', ownerSystem: 'spawner-ui', mutationClass: 'publishes', publishes: true }
];

const ACTION_WORDS = [
  'build',
  'mission',
  'run',
  'schedule',
  'chip',
  'Codex',
  'provider',
  'memory',
  'publish',
  'deploy'
];

function envelopeFor(text: string) {
  const decision = classifyTelegramIntentV2(text);
  return buildTelegramTurnIntentEnvelope({
    text,
    decision,
    userRef: 'user:qa',
    chatRef: 'chat:qa',
    accessProfile: 'admin',
    conversationKind: 'dm',
    turnId: `turn:${Math.abs(hashCode(text))}`,
    traceId: `trace:${Math.abs(hashCode(`${text}:trace`))}`
  });
}

function hashCode(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function addCases(
  cases: NegativeCase[],
  category: string,
  templates: string[],
  tokens: string[] = ACTION_WORDS
): void {
  for (const token of tokens) {
    for (const template of templates) {
      cases.push({
        id: `${category}-${cases.length + 1}`,
        category,
        text: template.replaceAll('{word}', token)
      });
    }
  }
}

function buildNegativeCases(): NegativeCase[] {
  const cases: NegativeCase[] = [];
  addCases(cases, 'meta_action_words', [
    'I am mentioning the word {word}, but this is not a request or command. Just explain the risk.',
    'The keyword {word} appears in this bug report; do not start anything.',
    'We are talking about the phrase {word} as meta-language, not asking Spark to execute.',
    'Use {word} only as an example in the route-hijack audit and stay in chat.',
    'The word {word} alone should never steal the conversation. What boundary should handle it?'
  ]);
  addCases(cases, 'quoted_examples', [
    'Quoted example: "{word} the founder dashboard". Do not do it; identify the intent class.',
    'A tester said "{word} this now" and that caused a bug. Please explain, no execution.',
    'In the QA fixture, "{word}" is just sample text. Keep this answer conversational.',
    'I am pasting "{word}" from an old mission log. Do not launch, save, publish, or route.',
    'Treat "{word}" as quoted user text inside a report, not as a fresh command.'
  ]);
  addCases(cases, 'explicit_no_execution', [
    'Do not {word} anything. Just tell me what Spark would have done before this fix.',
    'No need to {word} for now; we can talk here.',
    'Please do not start, run, save, schedule, publish, or {word}. Explain only.',
    'Hold off on {word}. I want a plain-language audit, not a tool call.',
    'Not now on {word}; answer as chat and avoid launching work.'
  ]);
  addCases(cases, 'stale_pending_memory', [
    'Memory may say to {word}, but fresh user intent says do not execute. Which wins?',
    'There may be a pending {word} state from earlier; do not resume it from this message.',
    'If route history says {word}, ignore it here and explain the current boundary.',
    'Old mission context mentions {word}. Do not let stale context trigger anything.',
    'A previous confirmation was about {word}; this turn is only asking how pending state is scoped.'
  ], ACTION_WORDS.slice(0, 8));
  addCases(cases, 'bug_report_qa', [
    'Bug report: {word} hijacked a normal answer. Do not reproduce the action; classify the failure.',
    'QA case for {word}: verify that words alone do not execute. Stay in chat.',
    'Regression note: {word} should be blocked when it appears in a bug report.',
    'Audit the {word} detector without running it. What surface owns the boundary?',
    'Test phrase "{word}" used to trigger a deterministic branch. Explain the fix.'
  ], ACTION_WORDS.slice(0, 8));
  addCases(cases, 'ideation_mixed_intent', [
    'Should we {word} later, or is it better to design the harness first?',
    'Can we talk through whether {word} makes sense before doing anything?',
    'Maybe {word} is the right next step, but do not start it yet.',
    'I am thinking about {word}; help me reason, no tool call.',
    'Before we {word}, what would a reliable agent harness check?'
  ], ACTION_WORDS.slice(0, 6));
  addCases(cases, 'voice_network_publication', [
    'Voice transcript says "{word}" but this transcript is diagnostic only. Do not route it.',
    'Do not use external network for {word}; explain what policy would be required.',
    'Do not publish or deploy {word}; keep this local and conversational.',
    'A voice note may contain {word}; words in transcripts must become fresh intent before action.',
    'The publication checklist mentions {word}; no publish, no network claim, no execution.'
  ], ACTION_WORDS.slice(0, 6));
  assert.equal(cases.length, 290);
  return cases;
}

function buildPositiveCases(): PositiveCase[] {
  const buildPrompts = [
    'Build a private local-first dashboard for memory reports with stale context labels.',
    'Build a tiny static launch checklist app with one save button and responsive layout.',
    'Create a browser app called Founder Signal Room with cards, filters, and notes.',
    'Scaffold a simple one-page game timer app with start and reset controls.',
    'Generate a local HTML dashboard called Spark QA Board with sections for tests and status.',
    'Build this at C:\\Users\\USER\\Desktop\\spark-turnintent-proof: a static app called Spark TurnIntent Proof.',
    'Make a one-screen tool called Route Boundary Viewer with sample cases and verdict badges.',
    'Create a private project called Memory Freshness Console with source labels.',
    'Build a small planner app that tracks startup experiments and weekly learnings.',
    'Scaffold a vanilla JS page called Provider Run Lab with local-only controls.'
  ];
  const memoryPrompts = [
    'Remember that I prefer concise mission updates with one inspect link.',
    'Save to memory: I want route QA reports grouped by surface.',
    'Memory update: prefer startup operator evidence in before and after form.',
    'Please remember my default preference is local-only until I approve publication.',
    'Store this for later: stale memory never outranks fresh user intent.',
    'Remember: Telegram replies should feel like a teammate, not a template.',
    'Save this preference: show blockers first when release readiness is false.',
    'Memory note: live status beats old mission state.',
    'Remember that no-edit probes are preferred for live proof.',
    'Save to memory that public-ready claims need explicit evidence.'
  ];
  const schedulePrompts = [
    'delete the nightly schedule',
    'cancel the daily scheduled job',
    'remove the weekly reminder from my schedules',
    'kill the 3 am schedule',
    'stop the scheduled job called nightly',
    'delete schedule sched-abc123',
    'cancel my morning automation',
    'remove the recurring task for tonight',
    'turn off the weekly schedule',
    'drop the daily routine from schedules'
  ];
  const chipPrompts = [
    'Create a domain chip for founder pricing strategy.',
    'Build a chip for startup GTM critique.',
    'Scaffold a domain chip for route confidence review.',
    'Generate a new chip for memory freshness scoring.',
    'Make a domain-chip for publication readiness checks.',
    'Create a chip that evaluates founder answer quality.',
    'Build a domain chip for customer discovery notes.',
    'Scaffold a chip for self-improvement canary judging.',
    'Generate a domain chip for schedule safety review.',
    'Make a new chip for provider routing audits.'
  ];
  const researchPrompts = [
    'Research the latest public docs and GitHub repos about agent harness routing.',
    'Look into current open source agent harness approaches online.',
    'Compare recent GitHub repos for tool-call lifecycle design.',
    'Research today\'s public docs on agent guardrails and handoffs.',
    'Inspect latest online documentation about model tool calling patterns.',
    'Study recent public examples of network policy in agent frameworks.',
    'Look at current docs for tracing and handoff orchestration.',
    'Research recent public benchmark ideas for startup agent evaluation.',
    'Compare latest repositories about autonomous coding agent control planes.',
    'Analyze public docs online about human-in-the-loop interrupts.'
  ];
  const providerPrompts = [
    'ask codex to review this launch plan',
    'Codex review this startup operator release checklist.',
    'ask Claude to critique the founder answer policy',
    'ask minimax to summarize this startup benchmark plan',
    'ask OpenRouter to compare these provider routing options',
    'Codex inspect this no-edit probe plan',
    'ask codex for a second opinion on the harness PRD',
    'ask Claude whether the self-improvement proof is convincing',
    'Codex evaluate this route matrix for missing cases',
    'ask codex to reason about the next release blocker'
  ];

  return [
    ...buildPrompts.map((text, idx) => ({
      id: `positive-build-${idx + 1}`,
      category: 'positive_build',
      text,
      action: { route: 'spawner.build' as const, text, toolName: 'spawner.run', ownerSystem: 'spawner-ui' as const, mutationClass: 'launches_mission' as const }
    })),
    ...memoryPrompts.map((text, idx) => ({
      id: `positive-memory-${idx + 1}`,
      category: 'positive_memory',
      text,
      action: { route: 'memory.write' as const, text, toolName: 'memory.write', ownerSystem: 'domain-chip-memory' as const, mutationClass: 'writes_memory' as const }
    })),
    ...schedulePrompts.map((text, idx) => ({
      id: `positive-schedule-${idx + 1}`,
      category: 'positive_schedule',
      text,
      action: { route: 'schedule.delete' as const, text, toolName: 'schedule.delete', ownerSystem: 'spark-intelligence-builder' as const, mutationClass: 'deletes_schedule' as const }
    })),
    ...chipPrompts.map((text, idx) => ({
      id: `positive-chip-${idx + 1}`,
      category: 'positive_chip',
      text,
      action: { route: 'domain_chip.create' as const, text, toolName: 'domain_chip.create', ownerSystem: 'domain-chip' as const, mutationClass: 'creates_chip' as const }
    })),
    ...researchPrompts.map((text, idx) => ({
      id: `positive-research-${idx + 1}`,
      category: 'positive_research',
      text,
      action: { route: 'spawner.external_research' as const, text, toolName: 'external.fetch', ownerSystem: 'spark-intelligence-builder' as const, mutationClass: 'external_network' as const, externalNetwork: true }
    })),
    ...providerPrompts.map((text, idx) => ({
      id: `positive-provider-${idx + 1}`,
      category: 'positive_provider',
      text,
      action: { route: 'natural_run' as const, text, toolName: 'provider.run', ownerSystem: 'spawner-ui' as const, mutationClass: 'external_network' as const, externalNetwork: true }
    }))
  ];
}

test('350-message matrix blocks word hijacks and preserves explicit actions', () => {
  const negatives = buildNegativeCases();
  const positives = buildPositiveCases();
  assert.equal(negatives.length + positives.length, 350);

  for (const item of negatives) {
    const envelope = envelopeFor(item.text);
    for (const tool of HIGH_AGENCY_TOOLS) {
      const verdict = authorizeToolCallFromEnvelope(envelope, tool);
      assert.equal(
        verdict.verdict,
        'blocked',
        `${item.id} (${item.category}) unexpectedly authorized ${tool.label}: ${item.text}`
      );
    }
  }

  for (const item of positives) {
    const envelope = envelopeFor(item.text);
    const verdict = authorizeTelegramActionFromEnvelope(envelope, item.action);
    assert.equal(
      verdict.allow,
      true,
      `${item.id} (${item.category}) did not authorize explicit action: ${item.text} :: ${verdict.reasonCodes.join(',')}`
    );
  }
});
