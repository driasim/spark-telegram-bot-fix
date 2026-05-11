import path from 'node:path';
import {
  formatConversationSmokeSummary,
  readConversationSmokeScenarios,
  runConversationSmokeScenarios
} from '../src/conversationSmoke';

function argValue(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index >= 0 && process.argv[index + 1] ? process.argv[index + 1] : null;
}

async function main(): Promise<void> {
  const fixturePath = path.resolve(
    argValue('--fixture') || path.join(__dirname, 'realtime-conversation-smoke.json')
  );
  const scenarios = readConversationSmokeScenarios(fixturePath);
  const summary = runConversationSmokeScenarios(scenarios);
  console.log(formatConversationSmokeSummary(summary));
  if (summary.failed > 0) {
    process.exitCode = 1;
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
