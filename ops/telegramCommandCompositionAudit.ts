import { mkdtempSync, mkdirSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type Role = 'admin' | 'allowed';

interface CommandCase {
  command: string;
  text: string;
  family: string;
  role?: Role;
  intent: string;
  sideEffectPosture: 'read_only' | 'usage_only' | 'stubbed' | 'blocked';
}

interface Delivery {
  method: string;
  text: string;
  hasKeyboard: boolean;
}

interface AuditResult {
  command: string;
  text: string;
  family: string;
  intent: string;
  sideEffectPosture: CommandCase['sideEffectPosture'];
  deliveries: Delivery[];
  durationMs: number;
  error?: string;
  timedOut: boolean;
  score: number;
  label: string;
  notes: string[];
  recommendation: string;
}

interface AuditPayload {
  auditDate: string;
  generatedAt: string;
  label: string;
  results: AuditResult[];
}

const AUDIT_DATE = '2026-05-13';
const ADMIN_BASE = 910_000_000;
const ALLOWED_USER = 920_000_001;

const COMMAND_CASES: CommandCase[] = [
  { command: '/start', text: '/start', family: 'Onboarding', intent: 'Show first-run help and current launch posture.', sideEffectPosture: 'stubbed' },
  { command: '/myid', text: '/myid', family: 'Onboarding', intent: 'Return the Telegram ID needed for allow/admin setup.', sideEffectPosture: 'read_only' },
  { command: '/access', text: '/access', family: 'Access', intent: 'Show current chat access and capability status.', sideEffectPosture: 'read_only' },
  { command: '/access_setup', text: '/access_setup', family: 'Access', intent: 'Run safe workspace setup from Telegram.', sideEffectPosture: 'blocked' },
  { command: '/docker_doctor', text: '/docker_doctor', family: 'Access', intent: 'Check Docker sandbox readiness.', sideEffectPosture: 'blocked' },
  { command: '/docker_smoke', text: '/docker_smoke', family: 'Access', intent: 'Prompt before running Docker sandbox smoke.', sideEffectPosture: 'usage_only' },
  { command: '/level5_setup', text: '/level5_setup', family: 'Access', intent: 'Prompt before Level 5 setup.', sideEffectPosture: 'usage_only' },
  { command: '/level5_disable', text: '/level5_disable', family: 'Access', intent: 'Prompt before returning to safer sandbox.', sideEffectPosture: 'usage_only' },

  { command: '/status', text: '/status', family: 'Status', intent: 'Summarize launch health and access state.', sideEffectPosture: 'blocked' },
  { command: '/diagnose', text: '/diagnose', family: 'Status', intent: 'Run full stack health diagnostics.', sideEffectPosture: 'stubbed' },
  { command: '/spark', text: '/spark', family: 'Status', intent: 'Show quick Spark launch-core status.', sideEffectPosture: 'read_only' },
  { command: '/about', text: '/about', family: 'Memory', intent: 'Ask Builder what it knows about the user.', sideEffectPosture: 'blocked' },

  { command: '/remember', text: '/remember', family: 'Memory', intent: 'Validate remember usage without writing memory.', sideEffectPosture: 'usage_only' },
  { command: '/recall', text: '/recall', family: 'Memory', intent: 'Validate recall usage without querying memory.', sideEffectPosture: 'usage_only' },
  { command: '/forget', text: '/forget', family: 'Memory', intent: 'Validate forget usage without changing memory.', sideEffectPosture: 'usage_only' },
  { command: '/context', text: '/context', family: 'Builder/AOC', intent: 'Show Agent Operating Context.', sideEffectPosture: 'blocked' },
  { command: '/operating_context', text: '/operating_context', family: 'Builder/AOC', intent: 'Alias for Agent Operating Context.', sideEffectPosture: 'blocked' },
  { command: '/agent_context', text: '/agent_context', family: 'Builder/AOC', intent: 'Alias for Agent Operating Context.', sideEffectPosture: 'blocked' },
  { command: '/aoc', text: '/aoc', family: 'Builder/AOC', intent: 'Short alias for Agent Operating Context.', sideEffectPosture: 'blocked' },
  { command: '/conversation_context', text: '/conversation_context', family: 'Builder/AOC', intent: 'Show conversation-frame diagnostics.', sideEffectPosture: 'read_only' },
  { command: '/black_box', text: '/black_box help', family: 'Builder/AOC', intent: 'Show black-box trace usage.', sideEffectPosture: 'usage_only' },
  { command: '/blackbox', text: '/blackbox help', family: 'Builder/AOC', intent: 'Alias for black-box trace usage.', sideEffectPosture: 'usage_only' },
  { command: '/black-box', text: '/black-box help', family: 'Builder/AOC', intent: 'Hyphen alias for black-box trace usage.', sideEffectPosture: 'usage_only' },

  { command: '/self', text: '/self', family: 'Builder', intent: 'Show Spark self-awareness status.', sideEffectPosture: 'blocked' },
  { command: '/wiki', text: '/wiki', family: 'Builder', intent: 'Show wiki health/status.', sideEffectPosture: 'blocked' },
  { command: '/voice', text: '/voice', family: 'Builder', intent: 'Show voice route/onboarding status.', sideEffectPosture: 'blocked' },
  { command: '/ledger', text: '/ledger', family: 'Builder Diagnostics', intent: 'Review capability ledger.', sideEffectPosture: 'blocked' },
  { command: '/capabilities', text: '/capabilities', family: 'Builder Diagnostics', intent: 'Show capability garden summary.', sideEffectPosture: 'read_only' },
  { command: '/authority', text: '/authority', family: 'Builder Diagnostics', intent: 'Show authority status summary.', sideEffectPosture: 'read_only' },
  { command: '/trace', text: '/trace', family: 'Builder Diagnostics', intent: 'Show trace repair summary.', sideEffectPosture: 'read_only' },
  { command: '/trace_repair', text: '/trace_repair', family: 'Builder Diagnostics', intent: 'Alias for trace repair summary.', sideEffectPosture: 'read_only' },
  { command: '/memory_movement', text: '/memory_movement', family: 'Builder Diagnostics', intent: 'Show memory movement summary.', sideEffectPosture: 'read_only' },
  { command: '/memory_flow', text: '/memory_flow', family: 'Builder Diagnostics', intent: 'Alias for memory movement summary.', sideEffectPosture: 'read_only' },
  { command: '/probe', text: '/probe', family: 'Route Diagnostics', intent: 'Show route probe help.', sideEffectPosture: 'usage_only' },
  { command: '/route_probe', text: '/route_probe', family: 'Route Diagnostics', intent: 'Alias for route probe help.', sideEffectPosture: 'usage_only' },
  { command: '/nl_route', text: '/nl_route', family: 'Route Diagnostics', intent: 'Show natural-route probe help.', sideEffectPosture: 'usage_only' },
  { command: '/natural_route', text: '/natural_route', family: 'Route Diagnostics', intent: 'Alias for natural-route probe help.', sideEffectPosture: 'usage_only' },

  { command: '/run', text: '/run', family: 'Mission Start', intent: 'Show mission-start usage.', sideEffectPosture: 'usage_only' },
  { command: '/runminimax', text: '/runminimax', family: 'Mission Start', intent: 'Show MiniMax run shortcut usage.', sideEffectPosture: 'usage_only' },
  { command: '/runglm', text: '/runglm', family: 'Mission Start', intent: 'Show Z.AI/GLM run shortcut usage.', sideEffectPosture: 'usage_only' },
  { command: '/runzai', text: '/runzai', family: 'Mission Start', intent: 'Show Z.AI run shortcut usage.', sideEffectPosture: 'usage_only' },
  { command: '/runclaude', text: '/runclaude', family: 'Mission Start', intent: 'Show Claude run shortcut usage.', sideEffectPosture: 'usage_only' },
  { command: '/runcodex', text: '/runcodex', family: 'Mission Start', intent: 'Show Codex run shortcut usage.', sideEffectPosture: 'usage_only' },
  { command: '/run2', text: '/run2', family: 'Mission Start', intent: 'Show two-provider consensus usage.', sideEffectPosture: 'usage_only' },
  { command: '/runall', text: '/runall', family: 'Mission Start', intent: 'Show all-provider run usage.', sideEffectPosture: 'usage_only' },

  { command: '/board', text: '/board', family: 'Mission Control', intent: 'Show mission board summary.', sideEffectPosture: 'stubbed' },
  { command: '/mission', text: '/mission', family: 'Mission Control', intent: 'Show mission control usage.', sideEffectPosture: 'usage_only' },
  { command: '/updates', text: '/updates', family: 'Mission Control', intent: 'Show mission update preferences.', sideEffectPosture: 'read_only' },
  { command: '/model', text: '/model', family: 'Models', intent: 'Show current model routing.', sideEffectPosture: 'read_only' },
  { command: '/models', text: '/models', family: 'Models', intent: 'Show model recommendations.', sideEffectPosture: 'read_only' },
  { command: '/workspaces', text: '/workspaces', family: 'Workspace', intent: 'Show local workspace inventory or access denial.', sideEffectPosture: 'read_only' },
  { command: '/workspace', text: '/workspace', family: 'Workspace', intent: 'Alias for local workspace inventory.', sideEffectPosture: 'read_only' },

  { command: '/creator', text: '/creator', family: 'Creator/Chip', intent: 'Show creator mission usage.', sideEffectPosture: 'usage_only' },
  { command: '/chip', text: '/chip', family: 'Creator/Chip', intent: 'Show chip creation usage.', sideEffectPosture: 'usage_only' },
  { command: '/loop', text: '/loop', family: 'Creator/Chip', intent: 'Show chip autoloop usage.', sideEffectPosture: 'usage_only' },
  { command: '/recursive', text: '/recursive', family: 'Recursive', intent: 'Show recursive Workspace help.', sideEffectPosture: 'usage_only' },
  { command: '/schedule', text: '/schedule', family: 'Scheduling', intent: 'Show schedule creation usage.', sideEffectPosture: 'usage_only' },
  { command: '/schedules', text: '/schedules', family: 'Scheduling', intent: 'List schedules.', sideEffectPosture: 'stubbed' },
  { command: '/clarify', text: '/clarify', family: 'Clarification', intent: 'Handle a pending clarification answer.', sideEffectPosture: 'read_only' },

  { command: '/resonance', text: '/resonance', family: 'Deferred Dashboard', intent: 'Show deferred resonance status.', sideEffectPosture: 'read_only' },
  { command: '/insights', text: '/insights', family: 'Deferred Dashboard', intent: 'Show deferred insights status.', sideEffectPosture: 'read_only' },
  { command: '/lessons', text: '/lessons', family: 'Deferred Dashboard', intent: 'Show deferred lessons status.', sideEffectPosture: 'read_only' },
  { command: '/process', text: '/process', family: 'Deferred Dashboard', intent: 'Show deferred queue processing status.', sideEffectPosture: 'read_only' },
  { command: '/reflect', text: '/reflect', family: 'Deferred Dashboard', intent: 'Show deferred reflection status.', sideEffectPosture: 'read_only' }
];

function setAuditEnv(stateDir: string, tempBin: string): void {
  const adminIds = Array.from({ length: COMMAND_CASES.length + 20 }, (_, index) => String(ADMIN_BASE + index));
  process.env.SPARK_BOT_TEST_MODE = '1';
  process.env.SPARK_SKIP_ENV_OVERRIDE = '1';
  process.env.BOT_TOKEN = '0:telegram-command-composition-audit';
  process.env.ADMIN_TELEGRAM_IDS = adminIds.join(',');
  process.env.ALLOWED_TELEGRAM_IDS = String(ALLOWED_USER);
  process.env.TELEGRAM_RELAY_SECRET = 'telegram-command-composition-audit-secret-1234567890';
  process.env.SPARK_GATEWAY_STATE_DIR = stateDir;
  process.env.SPARK_BUILDER_REPO = path.join(stateDir, 'missing-builder-repo');
  process.env.SPARK_BUILDER_HOME = path.join(stateDir, 'missing-builder-home');
  process.env.SPARK_DIAGNOSTICS_BUILDER_REPO = path.join(stateDir, 'missing-diagnostics-builder-repo');
  process.env.SPARK_BUILDER_BRIDGE_MODE = 'auto';
  process.env.SPARK_CHAT_LLM_PROVIDER = 'audit_unsupported';
  process.env.SPARK_ALLOW_IMPLICIT_LLM_PROVIDER = '0';
  process.env.SPARK_LIVE_CONTAINER = '1';
  process.env.SPARK_ALLOW_HOSTED_FULL_ACCESS = '0';
  process.env.SPAWNER_UI_URL = 'http://127.0.0.1:65535';
  process.env.SPAWNER_UI_PUBLIC_URL = 'http://127.0.0.1:65535';
  process.env.SPARK_TELEGRAM_HANDLER_TIMEOUT_MS = '8000';
  process.env.SPARK_LOCAL_SERVICE_TIMEOUT_MS = '250';
  process.env.SPARK_SPAWNER_RUN_TIMEOUT_MS = '250';
  process.env.SPARK_CREATOR_MISSION_TIMEOUT_MS = '250';
  process.env.SPARK_CREATOR_MISSION_STATUS_TIMEOUT_MS = '250';
  process.env.SPARK_CREATOR_MISSION_VALIDATE_TIMEOUT_MS = '250';
  process.env.SPARK_CREATOR_MISSION_EXECUTE_TIMEOUT_MS = '250';
  process.env.SPARK_CONTEXT_BRIDGE_TIMEOUT_MS = '250';
  process.env.SPARK_SELF_BRIDGE_TIMEOUT_MS = '250';
  process.env.SPARK_WIKI_BRIDGE_TIMEOUT_MS = '250';
  process.env.SPARK_BUILDER_TIMEOUT_MS = '250';
  process.env.PATH = tempBin;
  process.env.Path = tempBin;
}

async function installAxiosStubs(): Promise<void> {
  const axiosModule: any = await import('axios');
  const axios = axiosModule.default || axiosModule;
  axios.get = async (url: string) => {
    if (url.includes('/api/providers')) {
      return {
        data: {
          providers: [
            { id: 'codex', ready: true, status: 'ready', configured: true },
            { id: 'zai', ready: false, status: 'missing_key', configured: false }
          ],
          sparkDefaultProvider: 'codex'
        }
      };
    }
    if (url.includes('/api/mission-control/board')) {
      return {
        data: {
          board: {
            running: [],
            paused: [],
            completed: [],
            failed: [],
            created: []
          }
        }
      };
    }
    if (url.includes('/api/scheduled')) {
      return { data: { ok: true, schedules: [] } };
    }
    if (url.includes('/api/creator/mission')) {
      return { data: { ok: false, error: 'audit harness blocked creator mission lookup' } };
    }
    if (url.includes('/models')) {
      return { data: { data: [] } };
    }
    return { data: { ok: true } };
  };
  axios.post = async (url: string, body: any) => {
    if (url.includes('/api/spark/run')) {
      return {
        data: {
          success: false,
          requestId: body?.requestId || 'audit-request',
          error: 'audit harness blocked mission start'
        }
      };
    }
    if (url.includes('/api/mission-control/command')) {
      return {
        data: {
          ok: true,
          message: `Audit stub accepted ${body?.action || 'command'} for ${body?.missionId || 'mission'}`
        }
      };
    }
    if (url.includes('/api/scheduled')) {
      return {
        data: {
          ok: true,
          schedule: {
            id: 'audit-schedule',
            cron: body?.cron || '* * * * *',
            action: body?.action || 'mission',
            payload: body?.payload || {},
            createdAt: new Date().toISOString(),
            lastFiredAt: null,
            nextFireAt: new Date(Date.now() + 60_000).toISOString(),
            fireCount: 0,
            lastStatus: null,
            enabled: true
          }
        }
      };
    }
    if (url.includes('/api/creator/mission')) {
      return { data: { ok: false, error: 'audit harness blocked creator mission mutation' } };
    }
    return { data: { ok: true } };
  };
  axios.delete = async () => ({ data: { ok: true } });
}

function commandEntityLength(text: string): number {
  return text.split(/\s+/, 1)[0].length;
}

function makeUpdate(text: string, userId: number, messageId: number): Record<string, unknown> {
  return {
    update_id: messageId,
    message: {
      message_id: messageId,
      date: Math.floor(Date.now() / 1000),
      chat: { id: userId, type: 'private', first_name: 'Audit' },
      from: { id: userId, is_bot: false, first_name: 'Audit' },
      text,
      entities: [{ type: 'bot_command', offset: 0, length: commandEntityLength(text) }]
    }
  };
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<{ timedOut: boolean; value?: T; error?: unknown }> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve({ timedOut: true }), timeoutMs);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve({ timedOut: false, value });
      },
      (error) => {
        clearTimeout(timer);
        resolve({ timedOut: false, error });
      }
    );
  });
}

function compactWhitespace(text: string): string {
  return text.replace(/\r/g, '').replace(/[ \t]+$/gm, '').trim();
}

function firstLine(text: string): string {
  return compactWhitespace(text).split('\n').find((line) => line.trim())?.trim() || '';
}

function escapePipe(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function snippet(text: string, max = 280): string {
  const clean = redactForDoc(compactWhitespace(text));
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(0, max - 15)).trim()} [truncated]`;
}

function redactForDoc(text: string): string {
  return text
    .replace(/C:\\Users\\USER\\AppData\\Local\\Temp\\spark-telegram-command-audit-state-[^\s]*/g, '<audit-temp-state>')
    .replace(/C:\\Users\\USER\\AppData\\Local\\Temp\\spark-telegram-command-audit-bin-[^\s]*/g, '<audit-temp-bin>');
}

function commandName(command: string): string {
  return command.replace(/^\//, '');
}

function registeredCommandsFromSource(): string[] {
  const source = readFileSync(path.join(process.cwd(), 'src', 'index.ts'), 'utf-8');
  const names = new Set<string>();
  names.add('start');
  for (const match of source.matchAll(/bot\.command\('([^']+)'/g)) {
    names.add(match[1]);
  }
  for (const match of source.matchAll(/\{\s*name:\s*'([^']+)'/g)) {
    names.add(match[1]);
  }
  if (/\/black-box/.test(source)) names.add('black-box');
  return Array.from(names).sort();
}

function scoreLabel(score: number): string {
  if (score >= 5) return 'excellent';
  if (score >= 4) return 'good';
  if (score >= 3) return 'okay';
  if (score >= 2) return 'rough';
  return 'poor';
}

function recommendationFor(command: string, score: number, notes: string[]): string {
  const name = commandName(command);
  const aliasCommands = new Set([
    'operating_context',
    'agent_context',
    'route_probe',
    'natural_route',
    'trace_repair',
    'memory_flow',
    'workspace',
    'blackbox',
    'black-box'
  ]);
  const deferred = new Set(['resonance', 'insights', 'lessons', 'process', 'reflect']);
  const setup = new Set(['access_setup', 'docker_doctor', 'docker_smoke', 'level5_setup', 'level5_disable']);
  const providerRuns = new Set(['runminimax', 'runglm', 'runzai', 'runclaude', 'runcodex', 'run2', 'runall']);

  if (deferred.has(name)) return 'Hide or retire this from Telegram help until the dashboard surface is real.';
  if (setup.has(name)) return 'Prefer /access as the Telegram front door and keep detailed setup in Spark CLI.';
  if (aliasCommands.has(name)) return 'Keep as compatibility, but stop advertising it as a primary command.';
  if (providerRuns.has(name)) return 'Consider moving provider choice into /model plus /run, leaving this as an expert shortcut.';
  if (notes.some((note) => /raw|internal|path|ENOENT|repo=|home=/.test(note))) {
    return 'Wrap the failure in a human status card with one next action and move raw detail to logs.';
  }
  if (score >= 4) return 'Keep the current shape; only minor polish needed.';
  if (score === 3) return 'Tighten the first line and add one clearer next action.';
  return 'Redesign the Telegram reply before broadening user exposure.';
}

function scoreResult(input: {
  command: string;
  deliveries: Delivery[];
  timedOut: boolean;
  error?: string;
}): Pick<AuditResult, 'score' | 'label' | 'notes' | 'recommendation'> {
  const name = commandName(input.command);
  const texts = input.deliveries.map((delivery) => delivery.text).filter(Boolean);
  const joined = texts.join('\n\n');
  const notes: string[] = [];
  let score = 5;

  if (input.timedOut) {
    notes.push('Timed out in the safe harness.');
    score = Math.min(score, 1);
  }
  if (input.error) {
    notes.push(`Handler threw: ${input.error}`);
    score = Math.min(score, 2);
  }
  if (texts.length === 0) {
    notes.push('No Telegram message was emitted.');
    score = Math.min(score, 1);
  }
  if (texts.length > 2) {
    notes.push('More than two Telegram messages; this can feel chatty.');
    score -= 1;
  }

  const charCount = joined.length;
  const lineCount = joined.split(/\n/).length;
  if (charCount > 3000 || lineCount > 45) {
    notes.push('Very long for Telegram scanning.');
    score -= 2;
  } else if (charCount > 1400 || lineCount > 24) {
    notes.push('Long for Telegram; should probably deep-link to Workspace or docs.');
    score -= 1;
  }

  const headline = firstLine(joined);
  if (headline.length > 96) {
    notes.push('First line is too dense to scan as a headline.');
    score -= 1;
  }
  if (/Usage:/i.test(joined)) {
    notes.push('Usage is explicit.');
  }
  if (input.deliveries.some((delivery) => delivery.hasKeyboard)) {
    notes.push('Includes a Telegram keyboard, which helps choice-heavy flows.');
  }
  const hasRawInternalDetail = /\b(?:repo=|home=|spawn spark ENOENT|ENOENT|ECONNREFUSED|ETIMEDOUT|timeout|statusPath|best_verdict|best_metric|Router invokable|activation_state|service_enabled)\b/i.test(joined);
  if (hasRawInternalDetail) {
    notes.push('Leaks raw/internal implementation detail.');
    score -= 1;
    score = Math.min(score, 3);
  }
  if (/[A-Za-z]:\\|\/Users\/|\.spark[\\/]/.test(joined)) {
    notes.push('Shows local paths or state locations in chat.');
    score -= 1;
    score = Math.min(score, 2);
  }
  if (/spawn spark ENOENT/i.test(joined)) {
    score = Math.min(score, 2);
  }
  if (/Builder bridge unavailable|Builder memory bridge unavailable|did not answer this turn/i.test(joined)) {
    notes.push('Bridge failure is understandable but repeats system ownership language.');
    score -= 1;
  }
  if (/Dashboard\/resonance|deferred dashboard|dashboard .* deferred|deferred for this launch/i.test(joined)) {
    notes.push('Deferred dashboard copy reads stale as a user-facing command.');
    score = Math.min(score, 2);
  }
  if (/^-\s+/m.test(joined) && !/^Usage:/i.test(headline)) {
    notes.push('Uses CLI-style hyphen bullets where Telegram cards would scan better.');
    score -= 1;
  }

  const aliasCommands = new Set([
    'operating_context',
    'agent_context',
    'route_probe',
    'natural_route',
    'trace_repair',
    'memory_flow',
    'workspace',
    'blackbox',
    'black-box'
  ]);
  if (aliasCommands.has(name)) {
    notes.push('Redundant alias; useful for compatibility, noisy in command help.');
    score = Math.min(score, 3);
  }

  const terseUsage = /^Usage:\s*\/\w+/.test(headline) && lineCount <= 3;
  if (terseUsage) {
    notes.push('Clear but terse; no extra reassurance or examples beyond syntax.');
    score = Math.min(score, 3);
  }

  score = Math.max(1, Math.min(5, score));
  if (notes.length === 0) {
    notes.push('Readable and compact in the safe harness.');
  }
  return {
    score,
    label: scoreLabel(score),
    notes,
    recommendation: recommendationFor(input.command, score, notes)
  };
}

async function runCommandCase(bot: any, testCase: CommandCase, index: number): Promise<AuditResult> {
  const deliveries: Delivery[] = [];
  const userId = testCase.role === 'allowed' ? ALLOWED_USER : ADMIN_BASE + index;
  const telegramProto = Object.getPrototypeOf(bot.telegram);
  const originalProtoCallApi = telegramProto.callApi;
  const originalCallApi = bot.telegram.callApi.bind(bot.telegram);
  const originalSendMessage = bot.telegram.sendMessage.bind(bot.telegram);
  const originalSendChatAction = bot.telegram.sendChatAction?.bind(bot.telegram);
  const fakeCallApi = async (method: string, payload: Record<string, unknown> = {}) => {
    if (method === 'sendMessage') {
      deliveries.push({
        method,
        text: String(payload.text || ''),
        hasKeyboard: Boolean(payload.reply_markup)
      });
      return {
        message_id: 100_000 + deliveries.length,
        date: Math.floor(Date.now() / 1000),
        chat: { id: payload.chat_id || userId, type: 'private' },
        text: payload.text
      };
    }
    if (method === 'sendChatAction') return true;
    if (method === 'getMe') {
      return { id: 123456, is_bot: true, first_name: 'Spark Audit', username: 'spark_audit_bot' };
    }
    if (method === 'answerCallbackQuery') return true;
    return { ok: true };
  };
  telegramProto.callApi = fakeCallApi;
  bot.telegram.sendMessage = async (_chatId: unknown, text: unknown, extra?: Record<string, unknown>) => {
    deliveries.push({
      method: 'sendMessage',
      text: String(text || ''),
      hasKeyboard: Boolean(extra?.reply_markup)
    });
    return {
      message_id: 100_000 + deliveries.length,
      date: Math.floor(Date.now() / 1000),
      chat: { id: userId, type: 'private' },
      text
    };
  };
  bot.telegram.sendChatAction = async () => true;
  bot.telegram.callApi = fakeCallApi;

  const start = Date.now();
  let timedOut = false;
  let errorText: string | undefined;
  try {
    const update = makeUpdate(testCase.text, userId, 50_000 + index);
    const outcome = await withTimeout(bot.handleUpdate(update), 8000);
    timedOut = outcome.timedOut;
    if (outcome.error) {
      errorText = outcome.error instanceof Error ? outcome.error.message : String(outcome.error);
    }
  } catch (error) {
    errorText = error instanceof Error ? error.message : String(error);
  } finally {
    telegramProto.callApi = originalProtoCallApi;
    bot.telegram.callApi = originalCallApi;
    bot.telegram.sendMessage = originalSendMessage;
    if (originalSendChatAction) {
      bot.telegram.sendChatAction = originalSendChatAction;
    }
  }

  const scored = scoreResult({
    command: testCase.command,
    deliveries,
    timedOut,
    error: errorText
  });
  return {
    command: testCase.command,
    text: testCase.text,
    family: testCase.family,
    intent: testCase.intent,
    sideEffectPosture: testCase.sideEffectPosture,
    deliveries,
    durationMs: Date.now() - start,
    error: errorText,
    timedOut,
    ...scored
  };
}

function renderMarkdown(results: AuditResult[]): string {
  const registered = registeredCommandsFromSource();
  const audited = new Set(COMMAND_CASES.map((item) => commandName(item.command)));
  const missing = registered.filter((name) => !audited.has(name));
  const extras = Array.from(audited).filter((name) => !registered.includes(name)).sort();
  const average = results.reduce((sum, item) => sum + item.score, 0) / Math.max(1, results.length);
  const byScore = (score: number) => results.filter((item) => item.score === score);
  const roughOrPoor = results.filter((item) => item.score <= 2);
  const families = Array.from(new Set(results.map((item) => item.family))).sort();

  const lines: string[] = [
    `# Telegram Command Composition Audit - ${AUDIT_DATE}`,
    '',
    'This audit ran the Telegram gateway command surface through the real Telegraf command middleware in `SPARK_BOT_TEST_MODE=1`. It used synthetic private-chat updates, a fake Telegram API transport, isolated state, disabled live Spark CLI execution by removing `spark` from PATH, and stubbed Spawner HTTP calls. The goal is composition QA, not live service validation.',
    '',
    'Composition lens from `spark-telegram-composition`:',
    '',
    '- What happened?',
    '- Is it good, neutral, blocked, or bad?',
    '- What matters now?',
    '- Where can the operator inspect full evidence?',
    '',
    '## Harness Scope',
    '',
    `- Registered Telegram commands found in source: ${registered.length}`,
    `- Command cases exercised: ${results.length}`,
    `- Average usability score: ${average.toFixed(2)} / 5`,
    `- Score spread: ${byScore(5).length} excellent, ${byScore(4).length} good, ${byScore(3).length} okay, ${byScore(2).length} rough, ${byScore(1).length} poor`,
    `- Missing registered commands in harness: ${missing.length ? missing.map((name) => `/${name}`).join(', ') : 'none'}`,
    `- Harness-only aliases/extras: ${extras.length ? extras.map((name) => `/${name}`).join(', ') : 'none'}`,
    '',
    'Side-effect posture:',
    '',
    '- `read_only`: command path should only read local state or render static text.',
    '- `usage_only`: the harness chose a usage/help path to avoid starting work.',
    '- `stubbed`: live service calls were intercepted and answered with local fixtures.',
    '- `blocked`: live CLI/Builder actions were intentionally made unavailable to test the failure shape safely.',
    '',
    '## Main Findings',
    '',
    `1. The safe harness now has ${roughOrPoor.length} rough/poor replies${roughOrPoor.length ? `: ${roughOrPoor.map((item) => `\`${item.command}\``).join(', ')}` : '.'}`,
    '2. The clearest replies are compact command/status surfaces: `/myid`, `/access`, `/diagnose`, `/updates`, `/schedules`, `/clarify`, `/recursive`, `/model`, and the Builder-offline cards.',
    '3. `/start` is now a first-move surface instead of a full command inventory, while keeping important operator shortcuts visible.',
    '4. Compatibility aliases still inflate the perceived surface. They should stay functional, but primary docs should keep teaching the canonical commands.',
    '5. Legacy dashboard commands now explain that the surface is paused for launch v1 and point users toward supported commands.',
    '',
    '## Priority Improvements',
    '',
    '| Priority | Commands | Improvement |',
    '| --- | --- | --- |',
    '| P1 | `/voice` | Bring the Builder voice-unavailable reply into the same compact card shape as memory/wiki/context failures. |',
    '| P2 | `/run*`, `/mission`, `/chip`, `/loop`, `/schedule` usage replies | Add one-line examples and clearer canonical-command pointers without making help verbose. |',
    '| P2 | route/AOC aliases | Keep aliases working, but document `/context`, `/probe`, `/nl_route`, `/trace`, and `/memory_movement` as the canonical forms. |',
    '| P2 | `/workspace`, `/memory_flow`, `/blackbox`, `/black-box`, `/route_probe`, `/natural_route` | Consider hiding aliases from primary help while preserving backward compatibility. |',
    '| P3 | live Telegram smoke | Re-run this list against a real private chat with Builder, Spawner, Spark CLI, and providers online to score success-path composition. |',
    '',
    '## Scorecard',
    '',
    '| Command | Family | Score | Posture | Observed first reply | Notes | Recommendation |',
    '| --- | --- | ---: | --- | --- | --- | --- |'
  ];

  for (const result of results) {
    const firstReply = result.deliveries[0]?.text || result.error || '(no reply)';
    lines.push([
      `\`${result.command}\``,
      result.family,
      `${result.score} (${result.label})`,
      `\`${result.sideEffectPosture}\``,
      escapePipe(snippet(firstReply, 220)),
      escapePipe(result.notes.join('; ')),
      escapePipe(result.recommendation)
    ].join(' | '));
  }

  lines.push('', '## Family Notes', '');
  for (const family of families) {
    const familyResults = results.filter((item) => item.family === family);
    const familyAverage = familyResults.reduce((sum, item) => sum + item.score, 0) / familyResults.length;
    const low = familyResults.filter((item) => item.score <= 2).map((item) => item.command);
    lines.push(`### ${family}`);
    lines.push('');
    lines.push(`Average: ${familyAverage.toFixed(2)} / 5.`);
    lines.push('');
    if (low.length) {
      lines.push(`Needs attention: ${low.map((item) => `\`${item}\``).join(', ')}.`);
    } else {
      lines.push('No commands in this family scored below okay in the safe harness.');
    }
    lines.push('');
  }

  lines.push('## Captured Reply Snippets', '');
  for (const result of results) {
    lines.push(`### ${result.command}`);
    lines.push('');
    lines.push(`Score: ${result.score} (${result.label}). Intent: ${result.intent}`);
    lines.push('');
    if (result.error) {
      lines.push(`Handler error: \`${result.error}\``);
      lines.push('');
    }
    if (result.deliveries.length === 0) {
      lines.push('_No Telegram reply captured._');
      lines.push('');
      continue;
    }
    result.deliveries.forEach((delivery, index) => {
      lines.push(`Reply ${index + 1}${delivery.hasKeyboard ? ' (with keyboard)' : ''}:`);
      lines.push('');
      lines.push('```text');
      lines.push(snippet(delivery.text, 900));
      lines.push('```');
      lines.push('');
    });
  }

  lines.push('## Interpretation', '');
  lines.push('This is not a substitute for a live Telegram smoke with real Builder, Spawner, Spark CLI, and provider services online. It is valuable because it forces every registered command through Telegram composition and catches the failure/help/default states that users often see first.');
  lines.push('');
  lines.push('Recommended next live pass: run the same command list against a private test chat with Builder and Spawner online, then compare success-path replies against this safe-harness baseline.');
  lines.push('');
  return lines.join('\n');
}

function buildAuditPayload(results: AuditResult[]): AuditPayload {
  return {
    auditDate: AUDIT_DATE,
    generatedAt: new Date().toISOString(),
    label: process.env.SPARK_TELEGRAM_COMPOSITION_RUN_LABEL?.trim() || 'Telegram command composition audit',
    results
  };
}

async function main(): Promise<void> {
  const stateDir = mkdtempSync(path.join(os.tmpdir(), 'spark-telegram-command-audit-state-'));
  const tempBin = mkdtempSync(path.join(os.tmpdir(), 'spark-telegram-command-audit-bin-'));
  setAuditEnv(stateDir, tempBin);
  await installAxiosStubs();

  const indexModule: any = await import('../src/index');
  setAuditEnv(stateDir, tempBin);
  const bot = indexModule.bot;
  if (!bot) {
    throw new Error('src/index.ts did not export bot');
  }
  bot.botInfo = { id: 123456, is_bot: true, first_name: 'Spark Audit', username: 'spark_audit_bot' };

  const results: AuditResult[] = [];
  for (let index = 0; index < COMMAND_CASES.length; index += 1) {
    const result = await runCommandCase(bot, COMMAND_CASES[index], index);
    results.push(result);
    console.log(`${result.score}/5 ${result.command} - ${result.label}`);
  }

  const outPath = path.join(process.cwd(), 'docs', `TELEGRAM_COMMAND_COMPOSITION_AUDIT_${AUDIT_DATE}.md`);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderMarkdown(results), 'utf-8');
  console.log(`\nWrote ${outPath}`);

  const jsonOut = process.env.SPARK_TELEGRAM_COMPOSITION_JSON_OUT?.trim();
  if (jsonOut) {
    const jsonPath = path.resolve(process.cwd(), jsonOut);
    mkdirSync(path.dirname(jsonPath), { recursive: true });
    writeFileSync(jsonPath, JSON.stringify(buildAuditPayload(results), null, 2), 'utf-8');
    console.log(`Wrote ${jsonPath}`);
  }

  const jsonStateModule: any = await import('../src/jsonState');
  jsonStateModule.resetJsonStateForTests?.();
  try {
    rmSync(stateDir, { recursive: true, force: true });
    rmSync(tempBin, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Could not remove temporary audit state: ${error instanceof Error ? error.message : String(error)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
