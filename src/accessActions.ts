import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { withHiddenWindows } from './hiddenProcess';
import { redactText } from './redaction';

const execFileAsync = promisify(execFile);

export type SparkAccessActionId =
  | 'workspace_setup'
  | 'docker_doctor'
  | 'docker_smoke'
  | 'level5_enable'
  | 'level5_disable';

export type SparkAccessActionRunPolicy =
  | 'auto_safe'
  | 'auto_read_only'
  | 'confirm_once'
  | 'explicit_opt_in';

export interface SparkAccessAction {
  id: SparkAccessActionId;
  command: string[];
  runPolicy: SparkAccessActionRunPolicy;
  confirmation?: string;
  timeoutMs: number;
}

export type SparkCommandRunner = (
  args: string[],
  timeoutMs: number
) => Promise<{ stdout: string; stderr: string }>;

export const SPARK_ACCESS_ACTIONS: Record<SparkAccessActionId, SparkAccessAction> = {
  workspace_setup: {
    id: 'workspace_setup',
    command: ['access', 'setup', '--json'],
    runPolicy: 'auto_safe',
    timeoutMs: 60_000,
  },
  docker_doctor: {
    id: 'docker_doctor',
    command: ['sandbox', 'docker', 'doctor', '--json'],
    runPolicy: 'auto_read_only',
    timeoutMs: 30_000,
  },
  docker_smoke: {
    id: 'docker_smoke',
    command: ['sandbox', 'docker', 'smoke', '--json'],
    runPolicy: 'confirm_once',
    confirmation: 'Run Docker sandbox test',
    timeoutMs: 180_000,
  },
  level5_enable: {
    id: 'level5_enable',
    command: ['access', 'setup', '--level', '5', '--enable-high-agency', '--json'],
    runPolicy: 'explicit_opt_in',
    confirmation: 'Enable whole-computer operator mode',
    timeoutMs: 60_000,
  },
  level5_disable: {
    id: 'level5_disable',
    command: ['access', 'disable-level5', '--json'],
    runPolicy: 'confirm_once',
    confirmation: 'Return to workspace sandbox',
    timeoutMs: 60_000,
  },
};

export function accessActionNeedsConfirmation(actionId: SparkAccessActionId): boolean {
  const policy = SPARK_ACCESS_ACTIONS[actionId].runPolicy;
  return policy === 'confirm_once' || policy === 'explicit_opt_in';
}

export async function runSparkAccessAction(
  actionId: SparkAccessActionId,
  runner: SparkCommandRunner = defaultSparkCommandRunner
): Promise<string> {
  const action = SPARK_ACCESS_ACTIONS[actionId];
  const result = await runner(action.command, action.timeoutMs);
  const payload = parseSparkJson(result.stdout);
  if (!payload) {
    const output = redactText([result.stdout, result.stderr].filter(Boolean).join('\n').trim());
    return [`Spark action ran, but did not return JSON: ${action.id}`, output || 'No output.'].join('\n');
  }
  return formatSparkAccessActionReply(actionId, payload);
}

async function defaultSparkCommandRunner(args: string[], timeoutMs: number): Promise<{ stdout: string; stderr: string }> {
  const { stdout, stderr } = await execFileAsync(
    'spark',
    args,
    withHiddenWindows({
      timeout: timeoutMs,
      maxBuffer: 1024 * 1024,
    })
  );
  return {
    stdout: Buffer.isBuffer(stdout) ? stdout.toString('utf8') : String(stdout || ''),
    stderr: Buffer.isBuffer(stderr) ? stderr.toString('utf8') : String(stderr || ''),
  };
}

function parseSparkJson(stdout: string): Record<string, unknown> | null {
  const trimmed = stdout.trim();
  if (!trimmed) return null;
  try {
    const parsed = JSON.parse(trimmed);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

export function formatSparkAccessActionReply(actionId: SparkAccessActionId, payload: Record<string, unknown>): string {
  const ok = payload.ok !== false;
  if (actionId === 'workspace_setup') {
    return [
      ok ? 'Safe workspace setup is ready.' : 'Safe workspace setup needs attention.',
      accessSummary(payload),
      nextLine(payload),
    ].filter(Boolean).join('\n');
  }
  if (actionId === 'docker_doctor') {
    return [
      ok ? 'Docker sandbox check passed.' : 'Docker sandbox is not ready yet.',
      String(payload.next || ''),
    ].filter(Boolean).join('\n');
  }
  if (actionId === 'docker_smoke') {
    return [
      ok ? 'Docker sandbox smoke passed.' : 'Docker sandbox smoke failed.',
      'This smoke is designed to run without Spark secrets, home-folder mounts, or Docker socket access.',
      String(payload.next || ''),
    ].filter(Boolean).join('\n');
  }
  if (actionId === 'level5_enable') {
    const state = objectValue(payload.level5);
    const activation = String(state.activation_state || '');
    return [
      ok ? 'Level 5 guardrails were configured.' : 'Level 5 setup did not complete.',
      activation ? `Activation state: ${activation}.` : '',
      'Restart Spark, then send /access 5 again so Telegram and Spawner load whole-computer operator mode.',
      nextLine(payload),
    ].filter(Boolean).join('\n');
  }
  if (actionId === 'level5_disable') {
    return [
      'Level 5 guardrails were disabled.',
      'Restart Spark to return this runtime to workspace-sandbox mode.',
      nextLine(payload),
    ].filter(Boolean).join('\n');
  }
  return ok ? 'Spark access action finished.' : 'Spark access action failed.';
}

function accessSummary(payload: Record<string, unknown>): string {
  const effective = payload.effective_access_level;
  const recommended = objectValue(payload.recommended);
  const lane = String(recommended.id || '');
  return [
    effective ? `Effective access level: ${effective}.` : '',
    lane ? `Recommended lane: ${lane}.` : '',
  ].filter(Boolean).join(' ');
}

function nextLine(payload: Record<string, unknown>): string {
  const next = String(payload.next || '').trim();
  return next ? `Next: ${next}` : '';
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}
