import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type Role = 'admin' | 'allowed' | 'stranger';
type SparkAccessProfile = 'chat' | 'builder' | 'agent' | 'developer' | 'operator';

interface EdgeCase {
  id: string;
  category: string;
  condition: string;
  text: string;
  role: Role;
  accessProfile?: SparkAccessProfile;
  expected: string;
  expectedPattern?: RegExp;
}

interface Delivery {
  method: string;
  text: string;
  hasKeyboard: boolean;
}

interface EdgeResult extends EdgeCase {
  deliveries: Delivery[];
  durationMs: number;
  error?: string;
  timedOut: boolean;
  score: number;
  label: string;
  notes: string[];
  recommendation: string;
}

const AUDIT_DATE = '2026-05-13';
const ADMIN_BASE = 930_000_000;
const ALLOWED_BASE = 940_000_000;
const STRANGER_BASE = 950_000_000;

const EDGE_CASES: EdgeCase[] = [
  {
    id: 'private-gate-stranger-status',
    category: 'Permission',
    condition: 'User is not in the private allowlist.',
    text: '/status',
    role: 'stranger',
    expected: 'Private-bot denial with /myid next step.',
    expectedPattern: /private right now|\/myid/i
  },
  {
    id: 'allowed-not-admin-diagnose',
    category: 'Permission',
    condition: 'Allowed user tries an admin-only diagnostic command.',
    text: '/diagnose',
    role: 'allowed',
    expected: 'Admin-only denial.',
    expectedPattern: /admin only/i
  },
  {
    id: 'allowed-not-admin-board',
    category: 'Permission',
    condition: 'Allowed user tries an admin-only mission surface.',
    text: '/board',
    role: 'allowed',
    expected: 'Admin-only denial.',
    expectedPattern: /admin only/i
  },
  {
    id: 'unknown-slash-command',
    category: 'Unknown command',
    condition: 'Admin sends a slash command that is not registered.',
    text: '/does_not_exist',
    role: 'admin',
    expected: 'A helpful unknown-command reply.',
    expectedPattern: /unknown|not a command|try \/status|\/help/i
  },

  {
    id: 'board-access-level-1',
    category: 'Access gate',
    condition: 'Mission board requested while chat is at Access level 1.',
    text: '/board',
    role: 'admin',
    accessProfile: 'chat',
    expected: 'Builder access denial with /access 2 next step.',
    expectedPattern: /builder access is blocked|\/access 2|Access level 2/i
  },
  {
    id: 'run-access-level-1',
    category: 'Access gate',
    condition: 'Mission start requested while chat is at Access level 1.',
    text: '/run audit Telegram command copy',
    role: 'admin',
    accessProfile: 'chat',
    expected: 'Builder access denial with /access 2 next step.',
    expectedPattern: /builder access is blocked|\/access 2|Access level 2/i
  },
  {
    id: 'workspace-access-level-3',
    category: 'Access gate',
    condition: 'Local workspace inventory requested without local workspace access.',
    text: '/workspaces',
    role: 'admin',
    accessProfile: 'agent',
    expected: 'Local workspace denial with /access 4 next step.',
    expectedPattern: /local workspace access is blocked|\/access 4|Access level 4/i
  },
  {
    id: 'workspace-alias-access-level-3',
    category: 'Access gate',
    condition: 'Compatibility alias hits the same local workspace access gate.',
    text: '/workspace',
    role: 'admin',
    accessProfile: 'agent',
    expected: 'Alias banner plus local workspace denial.',
    expectedPattern: /\/workspace maps to \/workspaces[\s\S]*local workspace access is blocked/i
  },
  {
    id: 'access-invalid-level',
    category: 'Access command',
    condition: 'Admin asks for an invalid access level.',
    text: '/access banana',
    role: 'admin',
    expected: 'Access-level chooser guidance.',
    expectedPattern: /choose an access level/i
  },
  {
    id: 'access-level-4-hosted-lock',
    category: 'Access command',
    condition: 'Hosted Spark Live blocks local workspace access.',
    text: '/access 4',
    role: 'admin',
    expected: 'Hosted-runtime lock explanation.',
    expectedPattern: /Access level 4 is locked|\/access 3|SPARK_ALLOW_HOSTED_FULL_ACCESS/i
  },
  {
    id: 'access-level-5-confirmation',
    category: 'Access command',
    condition: 'Level 5 request requires explicit confirmation.',
    text: '/access 5',
    role: 'admin',
    expected: 'Level 5 confirmation prompt with keyboard.',
    expectedPattern: /Access level 5|Confirm|whole-computer/i
  },

  {
    id: 'remember-missing-text',
    category: 'Missing argument',
    condition: 'Memory save command has no body.',
    text: '/remember',
    role: 'allowed',
    expected: 'Usage card for saving memory.',
    expectedPattern: /Save a memory|\/remember <something/i
  },
  {
    id: 'recall-missing-topic',
    category: 'Missing argument',
    condition: 'Memory recall command has no topic.',
    text: '/recall',
    role: 'allowed',
    expected: 'Usage card for recalling memory.',
    expectedPattern: /Recall memory|\/recall <topic/i
  },
  {
    id: 'forget-missing-target',
    category: 'Missing argument',
    condition: 'Forget command has no target.',
    text: '/forget',
    role: 'allowed',
    expected: 'Usage card for forgetting memory.',
    expectedPattern: /Forget memory|\/forget <thing/i
  },
  {
    id: 'mission-missing-args',
    category: 'Missing argument',
    condition: 'Mission command has no action or mission id.',
    text: '/mission',
    role: 'admin',
    expected: 'Mission usage card.',
    expectedPattern: /Mission control|\/mission status/i
  },
  {
    id: 'mission-placeholder-id',
    category: 'Malformed argument',
    condition: 'Mission command uses placeholder text instead of a real id.',
    text: '/mission status <mission-id>',
    role: 'admin',
    expected: 'Real mission id guidance.',
    expectedPattern: /real mission ID/i
  },
  {
    id: 'mission-invalid-id',
    category: 'Malformed argument',
    condition: 'Mission command uses an id that does not match Spark mission formats.',
    text: '/mission status nonsense',
    role: 'admin',
    expected: 'Real mission id guidance with examples.',
    expectedPattern: /real mission ID|\/board/i
  },
  {
    id: 'model-invalid-provider',
    category: 'Malformed argument',
    condition: 'Model command has unrecognized role/provider tokens.',
    text: '/model banana',
    role: 'admin',
    expected: 'Model usage examples.',
    expectedPattern: /Use \/model like this|\/model agent/i
  },
  {
    id: 'updates-invalid-verbosity',
    category: 'Malformed argument',
    condition: 'Mission update verbosity is not recognized.',
    text: '/updates loud',
    role: 'admin',
    expected: 'Updates usage guidance.',
    expectedPattern: /Usage|\/updates minimal|unknown/i
  },
  {
    id: 'updates-invalid-link-mode',
    category: 'Malformed argument',
    condition: 'Mission link preference is not recognized.',
    text: '/updates links maybe',
    role: 'admin',
    expected: 'Link preference usage guidance.',
    expectedPattern: /links none|kanban|canvas|both|Usage/i
  },
  {
    id: 'schedule-missing-quotes',
    category: 'Missing argument',
    condition: 'Schedule command omits the required quoted cron.',
    text: '/schedule */5 * * * * mission check launch health',
    role: 'admin',
    expected: 'Schedule usage card.',
    expectedPattern: /Schedule recurring work|\/schedule/i
  },
  {
    id: 'schedule-missing-goal',
    category: 'Missing argument',
    condition: 'Schedule command has a mission action but no goal.',
    text: '/schedule "*/5 * * * *" mission',
    role: 'admin',
    expected: 'Missing mission goal message.',
    expectedPattern: /Missing mission goal/i
  },
  {
    id: 'schedules-delete-missing-id',
    category: 'Missing argument',
    condition: 'Schedule deletion is missing the schedule id.',
    text: '/schedules delete',
    role: 'admin',
    expected: 'Delete usage guidance.',
    expectedPattern: /\/schedules delete <id>/i
  },
  {
    id: 'creator-plan-missing-brief',
    category: 'Missing argument',
    condition: 'Creator mission plan does not include a usable brief.',
    text: '/creator plan public',
    role: 'admin',
    expected: 'Creator usage guidance.',
    expectedPattern: /Usage: \/creator|creator plan/i
  },
  {
    id: 'chip-create-missing-brief',
    category: 'Missing argument',
    condition: 'Chip create command omits the chip description.',
    text: '/chip create',
    role: 'admin',
    expected: 'Chip usage card.',
    expectedPattern: /Create a domain chip|\/chip create/i
  },
  {
    id: 'loop-missing-chip',
    category: 'Missing argument',
    condition: 'Loop command omits chip key.',
    text: '/loop',
    role: 'admin',
    expected: 'Loop usage card.',
    expectedPattern: /Run a chip autoloop|\/loop/i
  },
  {
    id: 'recursive-unknown-shape',
    category: 'Malformed argument',
    condition: 'Recursive command has an incomplete action.',
    text: '/recursive start',
    role: 'admin',
    expected: 'Recursive help or start usage.',
    expectedPattern: /recursive|\/recursive/i
  },

  {
    id: 'probe-unknown-route',
    category: 'Route diagnostics',
    condition: 'Route probe receives an unknown route key.',
    text: '/probe nonsense',
    role: 'admin',
    expected: 'Route probe help instead of an exception.',
    expectedPattern: /Route probe|\/probe <route>/i
  },
  {
    id: 'probe-core-builder-offline',
    category: 'Route diagnostics',
    condition: 'Batch route probe runs while Builder bridge is unavailable.',
    text: '/probe core',
    role: 'admin',
    expected: 'Progress message plus compact route-probe result.',
    expectedPattern: /Running 5 route probes|Route probes/i
  },
  {
    id: 'route-probe-alias-unknown-route',
    category: 'Route diagnostics',
    condition: 'Alias receives an unknown route key.',
    text: '/route_probe nonsense',
    role: 'admin',
    expected: 'Alias banner plus route probe help.',
    expectedPattern: /\/route_probe maps to \/probe[\s\S]*Route probe/i
  },
  {
    id: 'natural-route-help',
    category: 'Route diagnostics',
    condition: 'Natural route probe has no message.',
    text: '/nl_route',
    role: 'admin',
    expected: 'Natural route usage card.',
    expectedPattern: /Natural route probe|\/nl_route <message>/i
  },
  {
    id: 'natural-route-build-message',
    category: 'Route diagnostics',
    condition: 'Natural route probe inspects a mission-looking message without executing it.',
    text: '/nl_route build a tiny launch dashboard',
    role: 'admin',
    expected: 'Diagnostic route decision only.',
    expectedPattern: /route|decision|does not execute/i
  },
  {
    id: 'natural-route-alias-help',
    category: 'Route diagnostics',
    condition: 'Natural route alias has no message.',
    text: '/natural_route',
    role: 'admin',
    expected: 'Alias banner plus natural route usage card.',
    expectedPattern: /\/natural_route maps to \/nl_route[\s\S]*Natural route probe/i
  },
  {
    id: 'blackbox-builder-offline',
    category: 'Builder offline',
    condition: 'Black-box command asks for a request id while Builder is unavailable.',
    text: '/blackbox request-123',
    role: 'admin',
    expected: 'Alias banner plus Builder failure card.',
    expectedPattern: /\/blackbox maps to \/black_box[\s\S]*(Builder|Spark could not reach)/i
  },
  {
    id: 'context-with-memory-query-offline',
    category: 'Builder offline',
    condition: 'Operating context asks for memory-in-play while Builder is unavailable.',
    text: '/context launch docs',
    role: 'admin',
    expected: 'Builder failure card with next diagnostic move.',
    expectedPattern: /Spark could not reach|\/diagnose/i
  },
  {
    id: 'remember-builder-offline',
    category: 'Builder offline',
    condition: 'Memory save has content but Builder cannot confirm durable memory.',
    text: '/remember I prefer concise launch updates',
    role: 'allowed',
    expected: 'Honest memory failure or local-buffer notice.',
    expectedPattern: /could not|offline|try again|local Telegram conversation buffer|diagnose/i
  },
  {
    id: 'voice-builder-offline',
    category: 'Builder offline',
    condition: 'Voice status command runs while Builder voice route is unavailable.',
    text: '/voice',
    role: 'admin',
    expected: 'Voice setup/status fallback.',
    expectedPattern: /Voice setup|voice route|\/voice/i
  },
  {
    id: 'run-spawner-stubbed-failure',
    category: 'Spawner offline',
    condition: 'Mission start reaches Spawner route but local service is stubbed as unavailable.',
    text: '/run audit Telegram command copy',
    role: 'admin',
    accessProfile: 'builder',
    expected: 'Mission start failure or blocked service message.',
    expectedPattern: /mission|blocked|failed|unavailable|offline/i
  }
];

function setAuditEnv(stateDir: string, tempBin: string): void {
  const adminIds = Array.from({ length: EDGE_CASES.length + 20 }, (_, index) => String(ADMIN_BASE + index));
  const allowedIds = Array.from({ length: EDGE_CASES.length + 20 }, (_, index) => String(ALLOWED_BASE + index));
  process.env.SPARK_BOT_TEST_MODE = '1';
  process.env.SPARK_SKIP_ENV_OVERRIDE = '1';
  process.env.BOT_TOKEN = '0:telegram-edge-case-audit';
  process.env.ADMIN_TELEGRAM_IDS = adminIds.join(',');
  process.env.ALLOWED_TELEGRAM_IDS = allowedIds.join(',');
  process.env.TELEGRAM_RELAY_SECRET = 'telegram-edge-case-audit-secret-1234567890';
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
          requestId: body?.requestId || 'edge-case-request',
          error: 'edge-case harness blocked mission start'
        }
      };
    }
    if (url.includes('/api/mission-control/command')) {
      return {
        data: {
          ok: true,
          message: `Edge-case stub accepted ${body?.action || 'command'} for ${body?.missionId || 'mission'}`
        }
      };
    }
    if (url.includes('/api/scheduled')) {
      return {
        data: {
          ok: true,
          schedule: {
            id: 'edge-case-schedule',
            cron: body?.cron || '* * * * *',
            action: body?.action || 'mission',
            payload: body?.payload || {},
            createdAt: '2026-05-13T00:00:00.000Z',
            lastFiredAt: null,
            nextFireAt: '2026-05-13T00:01:00.000Z',
            fireCount: 0,
            lastStatus: null,
            enabled: true
          }
        }
      };
    }
    if (url.includes('/api/creator/mission')) {
      return { data: { ok: false, error: 'edge-case harness blocked creator mission mutation' } };
    }
    return { data: { ok: true } };
  };
  axios.delete = async () => ({ data: { ok: true } });
}

function roleUserId(role: Role, index: number): number {
  if (role === 'admin') return ADMIN_BASE + index;
  if (role === 'allowed') return ALLOWED_BASE + index;
  return STRANGER_BASE + index;
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
      chat: { id: userId, type: 'private', first_name: 'Edge' },
      from: { id: userId, is_bot: false, first_name: 'Edge' },
      text,
      entities: text.startsWith('/')
        ? [{ type: 'bot_command', offset: 0, length: commandEntityLength(text) }]
        : []
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

function redactForDoc(text: string): string {
  return text
    .replace(/C:\\Users\\USER\\AppData\\Local\\Temp\\spark-telegram-edge-case-[^\s]*/g, '<edge-temp>')
    .replace(/C:\\Users\\USER\\[^\s<>"']+/g, '<local-path>')
    .replace(/requestId=[A-Za-z0-9_-]+/g, 'requestId=<request-id>');
}

function snippet(text: string, max = 280): string {
  const clean = redactForDoc(compactWhitespace(text));
  if (clean.length <= max) return clean;
  return `${clean.slice(0, Math.max(0, max - 15)).trim()} [truncated]`;
}

function escapePipe(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
}

function scoreLabel(score: number): string {
  if (score >= 5) return 'excellent';
  if (score >= 4) return 'good';
  if (score >= 3) return 'okay';
  if (score >= 2) return 'rough';
  return 'poor';
}

function recommendationFor(result: Pick<EdgeResult, 'id' | 'category' | 'text' | 'score' | 'notes'>): string {
  if (result.score <= 1 && result.notes.some((note) => /No Telegram reply/.test(note))) {
    return 'Add an unknown-command fallback or an explicit no-op explanation for this condition.';
  }
  if (result.notes.some((note) => /raw|internal|path|ENOENT|ECONNREFUSED|timeout/i.test(note))) {
    return 'Wrap the condition in a human status card and move raw details to logs.';
  }
  if (result.notes.some((note) => /terse/i.test(note))) {
    return 'Turn the one-line usage into a compact Telegram card with one example.';
  }
  if (result.notes.some((note) => /Expected signal missing/i.test(note))) {
    return 'Tighten the branch copy so the expected next action is explicit.';
  }
  if (result.score >= 4) {
    return 'Keep this edge response; it is understandable in the safe harness.';
  }
  return 'Polish this edge response before broadening user exposure.';
}

function scoreResult(testCase: EdgeCase, deliveries: Delivery[], timedOut: boolean, errorText?: string): Pick<EdgeResult, 'score' | 'label' | 'notes' | 'recommendation'> {
  const texts = deliveries.map((delivery) => delivery.text).filter(Boolean);
  const joined = texts.join('\n\n');
  const notes: string[] = [];
  let score = 5;

  if (timedOut) {
    notes.push('Timed out in the safe harness.');
    score = Math.min(score, 1);
  }
  if (errorText) {
    notes.push(`Handler threw: ${errorText}`);
    score = Math.min(score, 2);
  }
  if (texts.length === 0) {
    notes.push('No Telegram reply was emitted.');
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
  if (/^Usage:\s*\/\w+/i.test(headline) && lineCount <= 3) {
    notes.push('Clear but terse; no extra reassurance or example beyond syntax.');
    score = Math.min(score, 3);
  }
  if (/^-\s+/m.test(joined) && !/^Usage:/i.test(headline)) {
    notes.push('Uses CLI-style hyphen bullets where Telegram cards would scan better.');
    score -= 1;
  }
  if (/\b(?:repo=|home=|spawn spark ENOENT|ENOENT|ECONNREFUSED|ETIMEDOUT|statusPath|best_verdict|activation_state|service_enabled)\b/i.test(joined)) {
    notes.push('Leaks raw/internal implementation detail.');
    score -= 1;
    score = Math.min(score, 3);
  }
  if (/[A-Za-z]:\\|\/Users\/|\.spark[\\/]/.test(joined)) {
    notes.push('Shows local paths or state locations in chat.');
    score -= 1;
    score = Math.min(score, 2);
  }
  if (deliveries.some((delivery) => delivery.hasKeyboard)) {
    notes.push('Includes a Telegram keyboard for confirmation or choice.');
  }
  if (testCase.expectedPattern && !testCase.expectedPattern.test(joined)) {
    notes.push(`Expected signal missing: ${testCase.expected}`);
    score = Math.min(score, 3);
  }
  if (/^\/(?:workspace|route_probe|natural_route|blackbox|black-box)\b/i.test(testCase.text) && !/maps to \//.test(joined)) {
    notes.push('Compatibility alias did not point to its canonical command.');
    score = Math.min(score, 3);
  }

  score = Math.max(1, Math.min(5, score));
  if (notes.length === 0) {
    notes.push('Readable and condition-appropriate in the safe harness.');
  }
  const partial = { id: testCase.id, category: testCase.category, text: testCase.text, score, notes };
  return {
    score,
    label: scoreLabel(score),
    notes,
    recommendation: recommendationFor(partial)
  };
}

async function runEdgeCase(
  bot: any,
  accessPolicy: { setSparkAccessProfile(chatId: string | number, profile: SparkAccessProfile): Promise<void> },
  testCase: EdgeCase,
  index: number
): Promise<EdgeResult> {
  const deliveries: Delivery[] = [];
  const userId = roleUserId(testCase.role, index);
  if (testCase.accessProfile) {
    await accessPolicy.setSparkAccessProfile(userId, testCase.accessProfile);
  }

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
      return { id: 123456, is_bot: true, first_name: 'Spark Edge Audit', username: 'spark_edge_audit_bot' };
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
    const update = makeUpdate(testCase.text, userId, 80_000 + index);
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

  const scored = scoreResult(testCase, deliveries, timedOut, errorText);
  return {
    ...testCase,
    deliveries,
    durationMs: Date.now() - start,
    error: errorText,
    timedOut,
    ...scored
  };
}

function roleAccessLabel(result: EdgeResult): string {
  return [result.role, result.accessProfile ? `L${({ chat: 1, builder: 2, agent: 3, developer: 4, operator: 5 } as const)[result.accessProfile]}` : 'default'].join(' / ');
}

function renderMarkdown(results: EdgeResult[]): string {
  const average = results.reduce((sum, item) => sum + item.score, 0) / Math.max(1, results.length);
  const byScore = (score: number) => results.filter((item) => item.score === score);
  const low = results.filter((item) => item.score <= 3);
  const silent = results.filter((item) => item.deliveries.length === 0);
  const categories = Array.from(new Set(results.map((item) => item.category))).sort();

  const lines: string[] = [
    `# Telegram Command Edge-Case Audit - ${AUDIT_DATE}`,
    '',
    'This audit drives edge conditions through the real Telegram gateway middleware in `SPARK_BOT_TEST_MODE=1`. It uses synthetic private-chat updates, isolated state, fake Telegram delivery, stubbed Spawner HTTP calls, missing Builder/Spark CLI paths, and explicit access profiles. The goal is to see what Telegram says when users hit awkward states, not to validate live service health.',
    '',
    'Composition lens from `spark-telegram-composition`: a good edge reply should say what happened, whether it is blocked/bad/neutral, what matters now, and one useful next move.',
    '',
    '## Summary',
    '',
    `- Edge cases exercised: ${results.length}`,
    `- Average edge-case usability score: ${average.toFixed(2)} / 5`,
    `- Score spread: ${byScore(5).length} excellent, ${byScore(4).length} good, ${byScore(3).length} okay, ${byScore(2).length} rough, ${byScore(1).length} poor`,
    `- Silent/no-reply cases: ${silent.length ? silent.map((item) => `\`${item.text}\``).join(', ') : 'none'}`,
    `- Needs polish: ${low.length ? low.map((item) => `\`${item.text}\``).join(', ') : 'none'}`,
    '',
    '## Findings',
    '',
    silent.length
      ? `1. Unknown slash commands can still go silent: ${silent.map((item) => `\`${item.text}\``).join(', ')}.`
      : '1. No edge case went silent.',
    low.length
      ? `2. ${low.length} edge replies need copy polish or clearer fallback behavior.`
      : '2. All edge replies are at least good in the safe harness.',
    '3. Permission and access gates are generally understandable; they preserve private-by-default posture and point to `/access` or `/myid`.',
    '4. Missing-argument commands are mostly readable, but older one-line usage replies are still the main rough edge.',
    '5. Builder/Spawner-offline paths are honest about blocked service state, which is better than pretending work started.',
    '',
    '## Edge-Case Matrix',
    '',
    '| Category | Condition | Input | Role / access | Score | First reply | Notes | Recommendation |',
    '| --- | --- | --- | --- | ---: | --- | --- | --- |'
  ];

  for (const result of results) {
    const firstReply = result.deliveries[0]?.text || result.error || '(no reply)';
    lines.push([
      result.category,
      escapePipe(result.condition),
      `\`${result.text}\``,
      `\`${roleAccessLabel(result)}\``,
      `${result.score} (${result.label})`,
      escapePipe(snippet(firstReply, 220)),
      escapePipe(result.notes.join('; ')),
      escapePipe(result.recommendation)
    ].join(' | '));
  }

  lines.push('', '## Category Notes', '');
  for (const category of categories) {
    const categoryResults = results.filter((item) => item.category === category);
    const categoryAverage = categoryResults.reduce((sum, item) => sum + item.score, 0) / categoryResults.length;
    const categoryLow = categoryResults.filter((item) => item.score <= 3);
    lines.push(`### ${category}`);
    lines.push('');
    lines.push(`Average: ${categoryAverage.toFixed(2)} / 5.`);
    lines.push('');
    lines.push(categoryLow.length
      ? `Needs attention: ${categoryLow.map((item) => `\`${item.text}\``).join(', ')}.`
      : 'No cases in this category scored below good.');
    lines.push('');
  }

  lines.push('## Captured Responses', '');
  for (const result of results) {
    lines.push(`### ${result.id}`);
    lines.push('');
    lines.push(`Input: \`${result.text}\``);
    lines.push(`Condition: ${result.condition}`);
    lines.push(`Expected: ${result.expected}`);
    lines.push(`Score: ${result.score} (${result.label}).`);
    lines.push('');
    if (result.deliveries.length === 0) {
      lines.push('_No Telegram reply captured._');
      lines.push('');
      continue;
    }
    result.deliveries.forEach((delivery, index) => {
      lines.push(`Reply ${index + 1}${delivery.hasKeyboard ? ' (with keyboard)' : ''}:`);
      lines.push('');
      lines.push('```text');
      lines.push(snippet(delivery.text, 1000));
      lines.push('```');
      lines.push('');
    });
  }

  lines.push('## Next Checks', '');
  lines.push('- Add any chosen fixes, then rerun `npm run audit:telegram-edge-cases`.');
  lines.push('- Follow with `npm run audit:telegram-composition` to make sure broad command composition did not regress.');
  lines.push('- Run a live private-chat smoke for success paths that the safe harness intentionally stubs, especially `/run`, `/board`, `/creator`, `/chip create`, `/schedule`, and Builder-backed memory commands.');
  lines.push('');
  return lines.join('\n');
}

async function main(): Promise<void> {
  const stateDir = mkdtempSync(path.join(os.tmpdir(), 'spark-telegram-edge-case-state-'));
  const tempBin = mkdtempSync(path.join(os.tmpdir(), 'spark-telegram-edge-case-bin-'));
  setAuditEnv(stateDir, tempBin);
  await installAxiosStubs();

  const indexModule: any = await import('../src/index');
  const accessPolicy: any = await import('../src/accessPolicy');
  setAuditEnv(stateDir, tempBin);
  const bot = indexModule.bot;
  if (!bot) {
    throw new Error('src/index.ts did not export bot');
  }
  bot.botInfo = { id: 123456, is_bot: true, first_name: 'Spark Edge Audit', username: 'spark_edge_audit_bot' };

  const results: EdgeResult[] = [];
  for (let index = 0; index < EDGE_CASES.length; index += 1) {
    const result = await runEdgeCase(bot, accessPolicy, EDGE_CASES[index], index);
    results.push(result);
    console.log(`${result.score}/5 ${result.text} - ${result.label}`);
  }

  const outPath = path.join(process.cwd(), 'docs', `TELEGRAM_COMMAND_EDGE_CASE_AUDIT_${AUDIT_DATE}.md`);
  mkdirSync(path.dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderMarkdown(results), 'utf-8');
  console.log(`\nWrote ${outPath}`);

  const jsonOut = process.env.SPARK_TELEGRAM_EDGE_CASE_JSON_OUT?.trim();
  if (jsonOut) {
    const jsonPath = path.resolve(process.cwd(), jsonOut);
    mkdirSync(path.dirname(jsonPath), { recursive: true });
    writeFileSync(jsonPath, JSON.stringify({ auditDate: AUDIT_DATE, generatedAt: new Date().toISOString(), results }, null, 2), 'utf-8');
    console.log(`Wrote ${jsonPath}`);
  }

  const jsonStateModule: any = await import('../src/jsonState');
  jsonStateModule.resetJsonStateForTests?.();
  try {
    rmSync(stateDir, { recursive: true, force: true });
    rmSync(tempBin, { recursive: true, force: true });
  } catch (error) {
    console.warn(`Could not remove temporary edge-case state: ${error instanceof Error ? error.message : String(error)}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
