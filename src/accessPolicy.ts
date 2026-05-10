import { readJsonFile, resolveStatePath, writeJsonAtomic } from './jsonState';

export type SparkAccessProfile = 'chat' | 'builder' | 'agent' | 'developer' | 'operator';
export type SparkAccessRequirement = 'spawner_build' | 'external_research' | 'operating_system';
export type SparkRunnerWritableState = 'yes' | 'no' | 'unknown';

export interface SparkAccessRunnerCapability {
  runnerWritable: SparkRunnerWritableState;
  runnerLabel?: string;
  failureReason?: string;
}

interface SparkAccessPreferences {
  accessByChatId?: Record<string, SparkAccessProfile>;
}

const ACCESS_PATH = resolveStatePath('.spark-access-policy.json');

export function normalizeSparkAccessProfile(value: unknown): SparkAccessProfile | null {
  if (typeof value !== 'string') return null;
  const normalized = value.trim().toLowerCase().replace(/[\s_+\-&]+/g, '');
  if (['1', 'access1', 'level1', 'accesslevel1', 'l1', 'chat', 'chatonly', 'private', 'conversation'].includes(normalized)) return 'chat';
  if (['2', 'access2', 'level2', 'accesslevel2', 'l2', 'builder', 'mission', 'missions', 'buildwhenasked', 'buildpermission'].includes(normalized)) return 'builder';
  if (['3', 'access3', 'level3', 'accesslevel3', 'l3', 'agent', 'tools', 'research', 'researchbuild', 'researchandbuild', 'web', 'github'].includes(normalized)) return 'agent';
  if (
    [
      '4',
      'access4',
      'level4',
      'accesslevel4',
      'l4',
      'developer',
      'dev',
      'workspaceaccess',
      'localworkspace',
      'localworkspaceaccess',
      'localproject',
      'localprojectaccess',
      'localrepo',
      'localrepoaccess',
      'sandbox',
      'sandboxed',
      'sandboxedlocal',
      'sandboxedlocalaccess'
    ].includes(normalized)
  ) return 'developer';
  if (
    [
      '5',
      'access5',
      'level5',
      'accesslevel5',
      'l5',
      'operator',
      'admin',
      'root',
      'wholecomputer',
      'wholemachine',
      'operatingsystem',
      'os',
      'fullaccess',
      'computeraccess'
    ].includes(normalized)
  ) return 'operator';
  return null;
}

function defaultSparkAccessProfile(): SparkAccessProfile {
  const configured = normalizeSparkAccessProfile(process.env.SPARK_AGENT_ACCESS_PROFILE);
  if (configured) return configured;
  if (sparkIsHostedRuntime() && !sparkHostedFullAccessAllowed()) return 'agent';
  return 'developer';
}

async function readPreferences(): Promise<SparkAccessPreferences> {
  return (await readJsonFile<SparkAccessPreferences>(ACCESS_PATH)) || {};
}

export async function getSparkAccessProfile(chatId: string | number): Promise<SparkAccessProfile> {
  const preferences = await readPreferences();
  const configured = preferences.accessByChatId?.[String(chatId)];
  return normalizeSparkAccessProfile(configured) || defaultSparkAccessProfile();
}

export async function getConfiguredSparkAccessProfile(chatId: string | number): Promise<SparkAccessProfile | null> {
  const preferences = await readPreferences();
  const configured = preferences.accessByChatId?.[String(chatId)];
  return normalizeSparkAccessProfile(configured);
}

export async function setSparkAccessProfile(
  chatId: string | number,
  profile: SparkAccessProfile
): Promise<void> {
  const preferences = await readPreferences();
  await writeJsonAtomic(ACCESS_PATH, {
    ...preferences,
    accessByChatId: {
      ...(preferences.accessByChatId || {}),
      [String(chatId)]: profile
    }
  });
}

export function sparkAccessAllowsExternalResearch(profile: SparkAccessProfile): boolean {
  return profile === 'agent' || profile === 'developer' || profile === 'operator';
}

export function sparkAccessAllowsWorkspaceBuilds(profile: SparkAccessProfile): boolean {
  return profile === 'developer' || profile === 'operator';
}

export function sparkAccessAllowsSpawnerBuilds(profile: SparkAccessProfile): boolean {
  return profile !== 'chat';
}

export function sparkAccessAllowsOperatingSystemWork(profile: SparkAccessProfile): boolean {
  return profile === 'developer' || profile === 'operator';
}

export function sparkAccessAllows(profile: SparkAccessProfile, requirement: SparkAccessRequirement): boolean {
  switch (requirement) {
    case 'spawner_build':
      return sparkAccessAllowsSpawnerBuilds(profile);
    case 'external_research':
      return sparkAccessAllowsExternalResearch(profile);
    case 'operating_system':
      return sparkAccessAllowsOperatingSystemWork(profile);
  }
}

export function sparkIsHostedRuntime(env: NodeJS.ProcessEnv = process.env): boolean {
  const spawnerHost = (env.SPARK_SPAWNER_HOST || '').trim();
  const allowedHosts = (env.SPARK_ALLOWED_HOSTS || '').trim();
  return (
    env.SPARK_LIVE_CONTAINER === '1' ||
    spawnerHost === '0.0.0.0' ||
    spawnerHost === '::' ||
    allowedHosts.length > 0
  );
}

export function sparkHostedFullAccessAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  return ['1', 'true', 'yes', 'on'].includes(String(env.SPARK_ALLOW_HOSTED_FULL_ACCESS || '').trim().toLowerCase());
}

function envFlagEnabled(value: unknown): boolean {
  return ['1', 'true', 'yes', 'on'].includes(String(value || '').trim().toLowerCase());
}

export function sparkHighAgencyWorkersAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  return envFlagEnabled(env.SPARK_ALLOW_HIGH_AGENCY_WORKERS);
}

export function sparkLevel5RuntimeGuardrailsActive(env: NodeJS.ProcessEnv = process.env): boolean {
  return (
    envFlagEnabled(env.SPARK_ALLOW_HIGH_AGENCY_WORKERS) &&
    envFlagEnabled(env.SPARK_ALLOW_EXTERNAL_PROJECT_PATHS) &&
    String(env.SPARK_CODEX_SANDBOX || '').trim() === 'danger-full-access'
  );
}

export function validateSparkAccessProfileForRuntime(
  profile: SparkAccessProfile,
  env: NodeJS.ProcessEnv = process.env
): { ok: true } | { ok: false; message: string } {
  if (profile === 'operator' && !sparkLevel5RuntimeGuardrailsActive(env)) {
    return {
      ok: false,
      message: [
        'Access level 5 is whole-computer operator mode, but this runtime is not running with Level 5 guardrails yet.',
        '',
        'Safe path:',
        '1. Send `/level5_setup confirm` from this trusted local Telegram admin chat.',
        '2. Restart Spark so Telegram and Spawner load the new guardrails.',
        '3. Send `/access 5` again.',
        '',
        'Until then, use `/access 4` for sandboxed local work inside the Spark workspace.'
      ].join('\n')
    };
  }

  if ((profile !== 'developer' && profile !== 'operator') || !sparkIsHostedRuntime(env) || sparkHostedFullAccessAllowed(env)) {
    return { ok: true };
  }

  return {
    ok: false,
    message: [
      `${sparkAccessLabel(profile)} is locked for hosted Spark Live right now.`,
      '',
      'Use /access 3 for the default hosted experience: chat, memory, public research, and requested Spawner builds.',
      'Only enable local or whole-computer access on a hosted/VPS install after operator approval guardrails are ready.',
      '',
      'Operator override: set SPARK_ALLOW_HOSTED_FULL_ACCESS=1 and restart Spark Live.'
    ].join('\n')
  };
}

export function sparkMissionNeedsOperatingSystemAccess(goal: string, projectPath?: string | null): boolean {
  if (projectPath) return true;
  const normalized = goal.toLowerCase();
  return (
    /\b(?:local\s+workspace|local\s+project|local\s+repo|local\s+files?|operating\s+system|my\s+machine|this\s+machine|filesystem|file\s+system)\b/.test(normalized) ||
    /\b(?:c:\\|\/users\/|\/home\/|~\/|\.spark\\|\.spark\/)\b/i.test(goal)
  );
}

export function renderSparkAccessDenial(profile: SparkAccessProfile, requirement: SparkAccessRequirement): string {
  if (requirement === 'operating_system') {
    return [
      `This operating system request needs ${sparkAccessLabel('developer')} for sandboxed local work, or ${sparkAccessLabel('operator')} for whole-computer work, but this chat is at ${sparkAccessLabel(profile)}.`,
      'You can say "change my access level to 4" or send `/access 4` for Spark sandbox workspaces, or `/access 5` only when you really want whole-computer operator mode.'
    ].join('\n');
  }
  if (requirement === 'external_research') {
    return [
      `This needs ${sparkAccessLabel('agent')} or higher, but this chat is at ${sparkAccessLabel(profile)}.`,
      'You can say "change my access level to 3" for public links/docs/GitHub research, or "change my access level to 4" when you also want sandboxed local project access. Level 5 is only for rare whole-computer operator work.'
    ].join('\n');
  }
  return [
    `This needs ${sparkAccessLabel('builder')} or higher, but this chat is at ${sparkAccessLabel(profile)}.`,
    'You can say "change my access level to 2" or send `/access 2` when you want Spark to build through Spawner after you ask.'
  ].join('\n');
}

export function describeSparkAccessProfile(profile: SparkAccessProfile): string {
  switch (profile) {
    case 'chat':
      return 'Access level 1: Spark can talk, remember, recall, diagnose, and answer from configured memory. It cannot start builds or missions.';
    case 'agent':
      return 'Access level 3: Spark can inspect public links, docs, and GitHub repos when you ask. It can also use Spawner for explicit build requests, but not local folders.';
    case 'developer':
      return 'Access level 4: Spark is authorized for sandboxed local work inside approved Spark workspaces. `/access_setup` prepares that workspace from Telegram; the current runner still has to prove it is writable before Spark claims it can edit or attach files here.';
    case 'operator':
      return 'Access level 5: Spark is authorized for whole-computer operator work on a trusted local install. This requires high-agency worker guardrails, runner writability, and extra care around secrets, destructive actions, and files outside Spark sandboxes.';
    case 'builder':
    default:
      return 'Access level 2: Spark can use Spawner only when you clearly ask it to build something or run a mission. Public web/GitHub inspection stays off until level 3 or higher.';
  }
}

export function sparkAccessLevel(profile: SparkAccessProfile): number {
  switch (profile) {
    case 'chat':
      return 1;
    case 'agent':
      return 3;
    case 'developer':
      return 4;
    case 'operator':
      return 5;
    case 'builder':
    default:
      return 2;
  }
}

export function sparkAccessLabel(profile: SparkAccessProfile): string {
  switch (profile) {
    case 'chat':
      return 'Access level 1';
    case 'agent':
      return 'Access level 3';
    case 'developer':
      return 'Access level 4';
    case 'operator':
      return 'Access level 5';
    case 'builder':
    default:
      return 'Access level 2';
  }
}

export function renderSparkAccessStatus(profile: SparkAccessProfile): string {
  return [
    `Spark access: ${sparkAccessLabel(profile)}`,
    describeSparkAccessProfile(profile),
    '',
    renderSparkAccessLevelGuide(),
    '',
    'Change it with:',
    '/access 1  Chat, memory, recall, diagnostics',
    '/access 2  Requested builds and missions',
    '/access 3  Public research plus requested builds',
    '/access 4  Sandboxed local projects and files (recommended for local builds)',
    '/access 5  Whole-computer operator mode (trusted local installs only)'
  ].join('\n');
}

function renderRunnerCapabilitySummary(runner?: SparkAccessRunnerCapability): string | null {
  if (!runner) return null;
  if (runner.runnerWritable === 'yes') {
    return 'Current runner: writable preflight passed, so local-agent actions can run here when the access level allows them.';
  }
  if (runner.runnerWritable === 'no') {
    const reason = runner.failureReason ? ` (${runner.failureReason})` : '';
    return `Current runner: read-only${reason}. Access may allow local work, but this route cannot write from here.`;
  }
  return 'Current runner: writability unknown. Spark should check runner capability before promising file or OS actions.';
}

export function renderSparkAccessCapabilityStatus(profile: SparkAccessProfile, runner?: SparkAccessRunnerCapability): string {
  const runnerSummary = renderRunnerCapabilitySummary(runner) || 'Current runner: not checked in this reply.';
  const canDoLocalHere = (profile === 'developer' || profile === 'operator') && runner?.runnerWritable === 'yes';
  const localVerdict = canDoLocalHere
    ? `Verdict: ${sparkAccessLabel(profile)} authorizes local work and this runner is writable.`
    : profile === 'developer'
      ? 'Verdict: Level 4 authorizes sandboxed local work, but actual edits/attachments need a writable runner or a routed Spawner/Codex mission.'
      : profile === 'operator'
        ? 'Verdict: Level 5 authorizes whole-computer work, but actual edits/attachments still need a writable runner and high-agency guardrails.'
        : `Verdict: ${sparkAccessLabel(profile)} does not authorize local operating-system work yet.`;

  return [
    `Configured access: ${sparkAccessLabel(profile)}.`,
    runnerSummary,
    localVerdict,
    '',
    'Important distinction: access level is permission; runner capability is what this exact process can do right now. AOC should show both before Spark claims an action is possible.'
  ].join('\n');
}

export function renderSparkAccessBriefStatus(profile: SparkAccessProfile, runner?: SparkAccessRunnerCapability): string {
  const runnerSummary = renderRunnerCapabilitySummary(runner);
  if (profile === 'developer') {
    const lines = [
      `You are on ${sparkAccessLabel(profile)}.`,
      'That means Spark is authorized to work inside approved Spark sandboxes and local workspaces, plus repo inspection, debugging, public research, and requested missions.',
      'If the workspace is not ready yet, send `/access_setup` and Spark will prepare it from Telegram.',
      runnerSummary,
      'You can say "change my access level to 3" if you want to remove sandboxed local filesystem/project access, or `/access 5` for rare whole-computer operator mode.'
    ].filter(Boolean);
    return lines.join('\n\n');
  }

  if (profile === 'operator') {
    const lines = [
      `You are on ${sparkAccessLabel(profile)}.`,
      'That means Spark is authorized for whole-computer operator work on a trusted local install.',
      runnerSummary,
      'Use this rarely. Level 4 is safer for normal local builds because it stays inside approved Spark sandboxes.'
    ].filter(Boolean);
    return lines.join('\n\n');
  }

  if (profile === 'agent') {
    return [
      `You are on ${sparkAccessLabel(profile)}.`,
      'That means I can research public links/docs/GitHub and run requested Spawner missions, but I will not inspect local files or repos.',
      'Say "change my access level to 4" when you want local project access.'
    ].join('\n\n');
  }

  if (profile === 'builder') {
    return [
      `You are on ${sparkAccessLabel(profile)}.`,
      'That means I can run builds or missions only when you clearly ask, but public research and local project access are off.',
      'Say "change my access level to 3" for public research, or "change my access level to 4" for local project access.'
    ].join('\n\n');
  }

  return [
    `You are on ${sparkAccessLabel(profile)}.`,
    'That means I can chat, remember, recall, and diagnose, but I will not start builds or missions.',
    'Say "change my access level to 2" if you want me to run requested Spawner builds.'
  ].join('\n\n');
}

export function renderSparkAccessChangeSummary(profile: SparkAccessProfile, runner?: SparkAccessRunnerCapability): string {
  const confirmation = renderSparkAccessChangeConfirmation(profile);
  if (profile === 'operator') {
    const runnerLine = runner?.runnerWritable === 'no'
      ? 'One note: this runner still looks read-only, so Spark may route some local work through Mission Control.'
      : 'Spark can use this trusted local machine for operator work.';
    return [
      confirmation,
      '',
      runnerLine,
      'I will still ask before deleting important files, exposing secrets, publishing, or deploying.',
      'Use /access 4 when you want the safer workspace sandbox again.',
    ].join('\n');
  }
  if (profile === 'developer') {
    const runnerLine = runner?.runnerWritable === 'no'
      ? 'This runner looks read-only, so I may route write work through Mission Control.'
      : 'I can work inside the safe Spark workspace on this machine.';
    return [
      confirmation,
      '',
      runnerLine,
      'Use /access 5 only when you want whole-computer operator mode.',
    ].join('\n');
  }
  return confirmation;
}

export function renderSparkAccessLevel5ConfirmationPrompt(): string {
  return [
    'Access level 5 lets Spark use this trusted local machine for operator work.',
    '',
    'I will still ask before deleting important files, exposing secrets, publishing, or deploying.',
    'Tap Confirm only if you want whole-computer operator mode for this chat.',
  ].join('\n');
}

export function renderSparkAccessChangeConfirmation(profile: SparkAccessProfile): string {
  return `Done - I changed this chat to ${sparkAccessLabel(profile)}.`;
}

export function renderSparkAccessConversationHelp(profile: SparkAccessProfile): string {
  return [
    `Yes. Spark has chat access levels, and this chat is currently ${sparkAccessLabel(profile)}.`,
    'Level 1: chat only - conversation, memory, recall, diagnostics.',
    'Level 2: build when asked - requested Spawner builds and missions.',
    'Level 3: research agent - public links/docs/GitHub research plus builds.',
    'Level 4: sandboxed local projects - workspace sandbox for files, debugging, and deeper missions inside approved Spark workspaces.',
    'Level 5: whole-computer operator mode - trusted local installs only.',
    '',
    'Separate from that, the current runner must be writable. If Level 4 or 5 says allowed but the runner is read-only, Spark should say "allowed, blocked here" and route through a writable Spawner/Codex mission or a writable chat runner.',
    '',
    'You can say things like "change my access level to 3" or "what can level 4 do?"'
  ].join('\n');
}

export function renderSparkAccessRuntimeHint(profile: SparkAccessProfile): string {
  if (profile === 'developer') {
    return [
      `Current Spark access: ${sparkAccessLabel(profile)}.`,
      'For sandboxed local workspace, repo, debugging, or project-inspection requests, check runner writability before claiming the work is possible here.',
      'Access level 4 means authorized inside approved Spark sandboxes, not automatically writable in every runner.',
      'If the Level 4 workspace is missing, use `/access_setup` instead of dumping Docker, SSH, or filesystem commands into chat.',
      'If this runner is read-only, say "allowed, blocked here" and route through a writable Spawner/Codex mission or a writable chat runner.'
    ].join('\n');
  }

  if (profile === 'operator') {
    return [
      `Current Spark access: ${sparkAccessLabel(profile)}.`,
      'Whole-computer operator mode is authorized only for trusted local installs with high-agency guardrails.',
      'Still check runner writability before promising edits, and prefer sandboxed Level 4 unless the user explicitly needs files outside Spark workspaces.'
    ].join('\n');
  }

  if (profile === 'agent') {
    return [
      `Current Spark access: ${sparkAccessLabel(profile)}.`,
      'Spark can research public links, docs, GitHub repos, and run requested Spawner missions.',
      'Do not claim local filesystem access at this level. Use /access 4 for sandboxed Spark workspaces, or /access 5 for whole-computer operator mode on trusted local installs.'
    ].join('\n');
  }

  if (profile === 'builder') {
    return [
      `Current Spark access: ${sparkAccessLabel(profile)}.`,
      'Spark can run explicit Spawner builds when the user clearly asks.',
      'Do not claim public web research or local filesystem access unless the user raises access.'
    ].join('\n');
  }

  return [
    `Current Spark access: ${sparkAccessLabel(profile)}.`,
    'Do not claim local filesystem access or mission execution access at this level.',
    'Spark can chat, remember, recall, and diagnose configured local state.'
  ].join('\n');
}

export function renderSparkAccessLevelGuide(): string {
  return [
    'What each access level allows:',
    '',
    '1. Chat only',
    '- Talk with Spark, save memories, recall notes, and run diagnostics.',
    '- Spark will not start builds or missions.',
    '',
    '2. Build when asked',
    '- Spark can start a Spawner build only after you clearly ask.',
    '- Good when you want control before anything gets built.',
    '',
    '3. Research agent',
    '- Spark can research public links, docs, and GitHub repos when you ask.',
    '- Spark can also start builds and missions you request.',
    '- Spark will not work across your computer or local project files.',
    '',
    '4. Workspace sandbox (recommended for local builders)',
    '- Spark can help with projects, debugging, files, and deeper build missions inside approved Spark workspaces.',
    '- Safe setup from Telegram: `/access_setup`.',
    '- Good when you want Spark to feel like a real local agent without handing it the whole computer.',
    '- Spark still must not reveal secrets or run destructive actions without clear approval.',
    '',
    '5. Whole-computer operator mode',
    '- Spark can work outside Spark sandboxes on trusted local installs when high-agency guardrails are enabled.',
    '- Guardrail setup from Telegram: `/level5_setup confirm`, then restart Spark.',
    '- Use this rarely, for explicit operator tasks that truly need broader filesystem access.',
    '- Spark still must not reveal secrets or run destructive actions without clear approval.'
  ].join('\n');
}

export function renderSparkAccessOnboarding(defaultProfile: SparkAccessProfile = defaultSparkAccessProfile()): string {
  return [
    'Choose how much access this Telegram chat has.',
    '',
    renderSparkAccessLevelGuide(),
    '',
    '/access 1  Chat, memory, recall, diagnostics',
    '/access 2  Requested builds and missions',
    '/access 3  Public research plus requested builds',
    '/access 4  Sandboxed local projects and files (recommended for local builds)',
    '/access 5  Whole-computer operator mode (trusted local installs only)',
    '',
    `Default right now: ${sparkAccessLabel(defaultProfile)}.`,
    'You can change this later anytime by sending /access 1, /access 2, /access 3, /access 4, or /access 5.'
  ].join('\n');
}
