import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

interface Delivery {
  method: string;
  text: string;
  hasKeyboard: boolean;
}

interface AuditResult {
  command: string;
  family: string;
  intent: string;
  sideEffectPosture: string;
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

function readAudit(filePath: string): AuditPayload {
  return JSON.parse(readFileSync(path.resolve(process.cwd(), filePath), 'utf-8')) as AuditPayload;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function average(results: AuditResult[]): number {
  return results.reduce((sum, item) => sum + item.score, 0) / Math.max(1, results.length);
}

function distribution(results: AuditResult[]): string {
  const count = (score: number) => results.filter((item) => item.score === score).length;
  return `${count(5)} excellent, ${count(4)} good, ${count(3)} okay, ${count(2)} rough, ${count(1)} poor`;
}

function replyText(result?: AuditResult): string {
  if (!result) return '(not captured)';
  if (result.error && result.deliveries.length === 0) return `Handler error: ${result.error}`;
  if (result.deliveries.length === 0) return '(no Telegram reply captured)';
  return result.deliveries
    .map((delivery, index) => [
      `Reply ${index + 1}${delivery.hasKeyboard ? ' (with keyboard)' : ''}:`,
      delivery.text
    ].join('\n'))
    .join('\n\n');
}

function scoreClass(score?: number): string {
  if (!score) return 'score-missing';
  if (score >= 5) return 'score-5';
  if (score >= 4) return 'score-4';
  if (score >= 3) return 'score-3';
  if (score >= 2) return 'score-2';
  return 'score-1';
}

function scoreBadge(result?: AuditResult): string {
  if (!result) return '<span class="badge score-missing">missing</span>';
  return `<span class="badge ${scoreClass(result.score)}">${result.score}/5 ${escapeHtml(result.label)}</span>`;
}

function deltaText(before?: AuditResult, after?: AuditResult): string {
  if (!before || !after) return 'n/a';
  const delta = after.score - before.score;
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

function renderCommandCard(command: string, before?: AuditResult, after?: AuditResult): string {
  const family = after?.family || before?.family || 'Unknown';
  const intent = after?.intent || before?.intent || '';
  const recommendation = after?.recommendation || before?.recommendation || '';
  const notes = after?.notes?.length ? after.notes.join('; ') : before?.notes?.join('; ') || '';
  return `
    <section class="command-card" id="${escapeHtml(command.replace(/^\//, 'cmd-'))}">
      <div class="command-head">
        <div>
          <h2>${escapeHtml(command)}</h2>
          <p>${escapeHtml(family)} · ${escapeHtml(intent)}</p>
        </div>
        <div class="score-row">
          ${scoreBadge(before)}
          <span class="delta">Δ ${escapeHtml(deltaText(before, after))}</span>
          ${scoreBadge(after)}
        </div>
      </div>
      <div class="comparison-grid">
        <article>
          <h3>Before</h3>
          <pre>${escapeHtml(replyText(before))}</pre>
        </article>
        <article>
          <h3>After</h3>
          <pre>${escapeHtml(replyText(after))}</pre>
        </article>
      </div>
      <footer>
        <strong>Latest audit note:</strong> ${escapeHtml(notes || 'No note.')}
        <br>
        <strong>Recommendation:</strong> ${escapeHtml(recommendation || 'No recommendation.')}
      </footer>
    </section>
  `;
}

function renderHtml(before: AuditPayload, after: AuditPayload): string {
  const beforeByCommand = new Map(before.results.map((item) => [item.command, item]));
  const afterByCommand = new Map(after.results.map((item) => [item.command, item]));
  const commands = Array.from(new Set([
    ...after.results.map((item) => item.command),
    ...before.results.map((item) => item.command)
  ]));
  const improved = commands.filter((command) => (afterByCommand.get(command)?.score || 0) > (beforeByCommand.get(command)?.score || 0)).length;
  const declined = commands.filter((command) => (afterByCommand.get(command)?.score || 0) < (beforeByCommand.get(command)?.score || 0)).length;
  const unchanged = commands.length - improved - declined;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Telegram Command Composition Before/After - ${escapeHtml(after.auditDate)}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #15171a;
      --muted: #5d6673;
      --line: #d9dee7;
      --panel: #ffffff;
      --page: #f6f7f9;
      --good: #146c43;
      --ok: #8a5a00;
      --bad: #b42318;
      --blue: #1f5fbf;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      background: var(--page);
      font: 14px/1.45 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    header {
      padding: 28px 32px 18px;
      border-bottom: 1px solid var(--line);
      background: #fff;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 28px; line-height: 1.15; letter-spacing: 0; }
    header p { margin-top: 8px; color: var(--muted); max-width: 980px; }
    main { padding: 24px 32px 40px; }
    .summary {
      display: grid;
      grid-template-columns: repeat(4, minmax(180px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .metric {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 14px;
    }
    .metric span {
      display: block;
      color: var(--muted);
      font-size: 12px;
      text-transform: uppercase;
    }
    .metric strong {
      display: block;
      margin-top: 4px;
      font-size: 20px;
    }
    .command-card {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      margin: 0 0 16px;
      overflow: hidden;
    }
    .command-head {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 16px;
      border-bottom: 1px solid var(--line);
    }
    .command-head h2 { font-size: 18px; }
    .command-head p { color: var(--muted); margin-top: 4px; }
    .score-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    .badge {
      border-radius: 999px;
      padding: 4px 9px;
      font-size: 12px;
      font-weight: 700;
      white-space: nowrap;
    }
    .score-5, .score-4 { color: var(--good); background: #e8f5ee; }
    .score-3 { color: var(--ok); background: #fff5dc; }
    .score-2, .score-1 { color: var(--bad); background: #ffebe8; }
    .score-missing { color: var(--muted); background: #eceff3; }
    .delta {
      color: var(--blue);
      font-weight: 700;
      white-space: nowrap;
    }
    .comparison-grid {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
      gap: 0;
    }
    article {
      min-width: 0;
      padding: 16px;
    }
    article + article {
      border-left: 1px solid var(--line);
    }
    h3 {
      font-size: 13px;
      text-transform: uppercase;
      color: var(--muted);
      margin-bottom: 8px;
    }
    pre {
      margin: 0;
      padding: 12px;
      border: 1px solid #e3e6eb;
      border-radius: 8px;
      background: #fbfcfd;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      font: 13px/1.45 ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
    }
    footer {
      padding: 12px 16px 14px;
      border-top: 1px solid var(--line);
      color: var(--muted);
      background: #fbfcfd;
    }
    @media (max-width: 900px) {
      header, main { padding-left: 16px; padding-right: 16px; }
      .summary, .comparison-grid { grid-template-columns: 1fr; }
      article + article { border-left: 0; border-top: 1px solid var(--line); }
      .command-head { display: block; }
      .score-row { justify-content: flex-start; margin-top: 12px; }
    }
  </style>
</head>
<body>
  <header>
    <h1>Telegram Command Composition Before/After</h1>
    <p>Generated from the safe Telegram composition harness. This compares all captured command replies before and after the readability pass; it is composition QA, not live service validation.</p>
  </header>
  <main>
    <section class="summary" aria-label="Audit summary">
      <div class="metric"><span>Commands</span><strong>${commands.length}</strong></div>
      <div class="metric"><span>Average score</span><strong>${average(before.results).toFixed(2)} → ${average(after.results).toFixed(2)}</strong></div>
      <div class="metric"><span>Movement</span><strong>${improved} up · ${unchanged} same · ${declined} down</strong></div>
      <div class="metric"><span>After spread</span><strong>${escapeHtml(distribution(after.results))}</strong></div>
    </section>
    ${commands.map((command) => renderCommandCard(command, beforeByCommand.get(command), afterByCommand.get(command))).join('\n')}
  </main>
</body>
</html>`;
}

function main(): void {
  const [beforePath, afterPath, outPath = 'docs/TELEGRAM_COMMAND_COMPOSITION_BEFORE_AFTER_2026-05-13.html'] = process.argv.slice(2);
  if (!beforePath || !afterPath) {
    throw new Error('Usage: ts-node ops/renderTelegramCompositionComparison.ts <before.json> <after.json> [out.html]');
  }
  const before = readAudit(beforePath);
  const after = readAudit(afterPath);
  const resolvedOut = path.resolve(process.cwd(), outPath);
  mkdirSync(path.dirname(resolvedOut), { recursive: true });
  writeFileSync(resolvedOut, renderHtml(before, after), 'utf-8');
  console.log(`Wrote ${resolvedOut}`);
}

main();
