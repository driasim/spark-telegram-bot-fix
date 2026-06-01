export type LiveNlRisk = 'safe' | 'mission' | 'writes_files' | 'external';

export interface LiveNlCommandCase {
  id: string;
  suite: string;
  risk: LiveNlRisk;
  prompt: string;
  turns?: string[];
  expectedRoute: string;
  expectedOutcome: string;
}

export interface LiveNlSelection {
  caseId?: string | null;
  caseIds?: string[];
  suite?: string | null;
  includeRisky?: boolean;
}

export interface LiveNlVerdictReportOptions {
  generatedAt?: Date;
  title?: string;
  suite?: string | null;
}

export interface LiveNlEvidencePacketOptions {
  generatedAt?: Date;
  title?: string;
  catalog?: string;
  suite?: string | null;
  includeRisky?: boolean;
  runId?: string;
}

export interface LiveNlCopyPasteOptions {
  title?: string;
}

export const LIVE_NL_SUITE_ALIASES: Record<string, string[]> = {
  memory_architecture: ['memory', 'self_awareness', 'wiki', 'anti_drift'],
  routing_architecture: ['route_firewall', 'operator', 'access', 'diagnostics', 'spawner_flow', 'research']
};

function objectValue(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null;
}

function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  return typeof value === 'string' ? value.trim() : '';
}

function stringArrayField(record: Record<string, unknown>, key: string): string[] {
  const value = record[key];
  if (!Array.isArray(value)) return [];
  return value.map((entry) => typeof entry === 'string' ? entry.trim() : '').filter(Boolean);
}

function parseLiveNlCommandCase(value: unknown, index: number): LiveNlCommandCase {
  const record = objectValue(value);
  if (!record) {
    throw new Error(`Live NL case ${index + 1} is not an object.`);
  }

  const turns = stringArrayField(record, 'turns');
  const parsed = {
    id: stringField(record, 'id'),
    suite: stringField(record, 'suite'),
    risk: stringField(record, 'risk') as LiveNlRisk,
    prompt: stringField(record, 'prompt') || turns[0] || '',
    turns: turns.length > 0 ? turns : undefined,
    expectedRoute: stringField(record, 'expectedRoute'),
    expectedOutcome: stringField(record, 'expectedOutcome')
  };

  if (!parsed.id || !parsed.suite || !parsed.prompt || !parsed.expectedRoute || !parsed.expectedOutcome) {
    throw new Error(`Live NL case ${index + 1} needs id, suite, prompt or turns, expectedRoute, and expectedOutcome.`);
  }
  if (!['safe', 'mission', 'writes_files', 'external'].includes(parsed.risk)) {
    throw new Error(`Live NL case ${parsed.id} has unsupported risk ${parsed.risk || 'unknown'}.`);
  }

  return parsed;
}

export function parseLiveNlCommandCases(value: unknown): LiveNlCommandCase[] {
  if (!Array.isArray(value)) {
    throw new Error('Live NL command cases must be a JSON array.');
  }
  return value.map(parseLiveNlCommandCase);
}

export function liveNlCaseTurns(entry: LiveNlCommandCase): string[] {
  const turns = entry.turns?.map((turn) => turn.trim()).filter(Boolean) || [];
  return turns.length > 0 ? turns : [entry.prompt];
}

export function selectLiveNlCommandCases(
  cases: LiveNlCommandCase[],
  selection: LiveNlSelection = {}
): LiveNlCommandCase[] {
  const caseId = selection.caseId?.trim();
  const caseIds = (selection.caseIds || []).map((id) => id.trim()).filter(Boolean);
  const orderedCaseIds = [...(caseId ? [caseId] : []), ...caseIds];
  const selectedCaseIds = new Set(orderedCaseIds);
  const suite = selection.suite?.trim();
  const suiteNames = suite ? new Set(LIVE_NL_SUITE_ALIASES[suite] ?? [suite]) : null;

  let selected = cases;
  if (selectedCaseIds.size > 0) {
    const byId = new Map(cases.map((entry) => [entry.id, entry]));
    selected = orderedCaseIds.map((id) => byId.get(id)).filter((entry): entry is LiveNlCommandCase => Boolean(entry));
  }
  if (suiteNames) selected = selected.filter((entry) => suiteNames.has(entry.suite));
  if (!selection.includeRisky && selectedCaseIds.size === 0) selected = selected.filter((entry) => entry.risk === 'safe');
  return selected;
}

function riskCounts(cases: LiveNlCommandCase[]): string {
  const counts = new Map<LiveNlRisk, number>();
  for (const entry of cases) {
    counts.set(entry.risk, (counts.get(entry.risk) || 0) + 1);
  }
  return ['safe', 'mission', 'writes_files', 'external']
    .map((risk) => `${risk}: ${counts.get(risk as LiveNlRisk) || 0}`)
    .join(', ');
}

function riskCountRecord(cases: LiveNlCommandCase[]): Record<LiveNlRisk, number> {
  return cases.reduce<Record<LiveNlRisk, number>>(
    (counts, entry) => {
      counts[entry.risk] += 1;
      return counts;
    },
    { safe: 0, mission: 0, writes_files: 0, external: 0 }
  );
}

function indentedBlock(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => `    ${line}`)
    .join('\n');
}

export function buildLiveNlEvidencePacket(
  cases: LiveNlCommandCase[],
  options: LiveNlEvidencePacketOptions = {}
): Record<string, unknown> {
  const generatedAt = (options.generatedAt || new Date()).toISOString();
  const catalog = options.catalog || 'natural-language-live-commands';
  const suite = options.suite?.trim() || null;
  const includeRisky = Boolean(options.includeRisky);

  return {
    schema_version: 'spark.telegram_live_qa_evidence_packet.v1',
    generated_at: generatedAt,
    run_id: options.runId || `telegram-live-qa-${generatedAt.replace(/[:.]/g, '-')}`,
    title: options.title || 'Spark Telegram Live QA Evidence Packet',
    catalog,
    selection: {
      suite,
      include_risky: includeRisky,
      case_count: cases.length,
      risk_counts: riskCountRecord(cases)
    },
    authority_claim_boundary: [
      'This packet is a live QA evidence container.',
      'It does not prove release readiness until each case has observed replies, side-effect checks, ledger or trace evidence where required, and a human verdict.',
      'It must not be treated as authority to execute high-agency actions.'
    ].join(' '),
    required_session_evidence: {
      profile: null,
      tester: null,
      bot_runtime_commit: null,
      harness_core_commit: null,
      spark_os_compile_ref: null,
      spark_live_status_ref: null,
      spark_verify_provenance_ref: null,
      telegram_chat_evidence_ref: null,
      overall_verdict: 'untested',
      follow_up_commits: [],
      pr_links: [],
      remaining_risks: []
    },
    verdict_values: ['pass', 'fail', 'blocked', 'needs-retest', 'untested'],
    cases: cases.map((entry, index) => {
      const turns = liveNlCaseTurns(entry);
      return {
        ordinal: index + 1,
        id: entry.id,
        suite: entry.suite,
        risk: entry.risk,
        expected_route: entry.expectedRoute,
        expected_outcome: entry.expectedOutcome,
        verdict: 'untested',
        actual_route: null,
        actual_outcome: null,
        observed_turns: turns.map((turn, turnIndex) => ({
          turn_index: turnIndex + 1,
          prompt: turn,
          reply: null,
          reply_timestamp: null
        })),
        side_effects: {
          files_changed: null,
          memory_written: null,
          mission_started: null,
          external_network_called: null,
          pr_opened: null,
          publish_or_deploy_started: null,
          schedule_changed: null,
          tool_or_browser_used: null
        },
        evidence_refs: {
          authorization_ledgers: [],
          tool_ledgers: [],
          traces: [],
          runtime_status: [],
          screenshots: [],
          commits: [],
          prs: []
        },
        issue: null,
        fix_commit: null,
        retest_required: false
      };
    }),
    summary: {
      pass: 0,
      fail: 0,
      blocked: 0,
      needs_retest: 0,
      untested: cases.length
    }
  };
}

export function formatLiveNlVerdictReport(
  cases: LiveNlCommandCase[],
  options: LiveNlVerdictReportOptions = {}
): string {
  const generatedAt = (options.generatedAt || new Date()).toISOString();
  const title = options.title || 'Natural Language Live Verdict Report';
  const suiteLine = options.suite ? `Suite filter: ${options.suite}` : 'Suite filter: all selected safe cases';
  const lines = [
    `# ${title}`,
    '',
    `Generated: ${generatedAt}`,
    suiteLine,
    `Cases: ${cases.length} (${riskCounts(cases)})`,
    '',
    'Use this report after copy-pasting plain prompts from `ops/liveNlCommandSuite.ts --copy-paste`.',
    'Do not paste secrets, full raw logs, or private user text into verdict notes.',
    '',
    'Verdict values: pass, fail, blocked, needs-retest, untested.',
    '',
    '## Session Summary',
    '',
    '- Profile:',
    '- Tester:',
    '- Bot/runtime commit:',
    '- Ledger path, if enabled:',
    '- Overall verdict:',
    '- Follow-up commits/tests:',
    ''
  ];

  for (const entry of cases) {
    const turns = liveNlCaseTurns(entry);
    lines.push(
      `## ${entry.id}`,
      '',
      `- Suite: ${entry.suite}`,
      `- Risk: ${entry.risk}`,
      `- Expected route: ${entry.expectedRoute}`,
      `- Expected outcome: ${entry.expectedOutcome}`,
      '- Verdict: untested',
      '- Actual route:',
      '- Actual outcome:',
      '- Evidence:',
      '- Issue:',
      '- Fix/Test added:',
      '',
      turns.length === 1 ? 'Prompt:' : 'Prompts:',
      '',
      indentedBlock(turns.length === 1
        ? turns[0]
        : turns.map((turn, index) => `Turn ${index + 1}:\n${turn}`).join('\n\n')),
      ''
    );
  }

  return lines.join('\n').trimEnd() + '\n';
}

export function formatLiveNlCopyPastePrompts(
  cases: LiveNlCommandCase[],
  options: LiveNlCopyPasteOptions = {}
): string {
  const title = options.title || 'Natural Language Copy/Paste Prompts';
  const lines = [
    `# ${title}`,
    '',
    'Copy only each Telegram message into Telegram, one at a time.',
    'Do not paste case ids, expected routes, or expected outcomes into Telegram.',
    'After Spark replies, paste the matching reply-capture block back into Codex.',
    ''
  ];

  cases.forEach((entry, index) => {
    const turns = liveNlCaseTurns(entry);
    lines.push(
      `## ${index + 1}. ${entry.id}`,
      ''
    );

    turns.forEach((turn, turnIndex) => {
      const suffix = turns.length > 1 ? ` ${turnIndex + 1} of ${turns.length}` : '';
      const captureCase = turns.length > 1 ? `CASE ${entry.id} TURN ${turnIndex + 1}` : `CASE ${entry.id}`;
      lines.push(
        `Telegram message${suffix}:`,
        '',
        '```text',
        turn,
        '```',
        '',
        `Reply capture${suffix}:`,
        '',
        '```text',
        captureCase,
        'REPLY:',
        '<paste Spark reply here>',
        '```',
        ''
      );
    });
  });

  return lines.join('\n').trimEnd() + '\n';
}
