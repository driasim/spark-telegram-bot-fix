import { redactText } from "./src/redaction";

const cases = [
  // standard DATABASE_URL with credentials
  'DATABASE_URL=postgres://user:pass@localhost:5432/mydb',
  'DATABASE_URL=postgres://user@localhost/mydb',
  // what about the @ being URL-encoded?
  'postgres://user%40example.com:pass@localhost/db',
  // nested in connection object
  '{"url":"postgres://user:pass@host/db"}',
  // multi-line
  'postgres://user:pass\n@localhost/db',
  // trailing @
  'postgres://user:pass@',
  // The exact example from the bug
  'postgres://***user@host',
];

for (const input of cases) {
  const out = redactText(input);
  const hasAt = out.includes('@');
  const pos = out.indexOf('@');
  process.stdout.write(JSON.stringify(input) + '\n');
  process.stdout.write('  -> ' + JSON.stringify(out) + '\n');
  process.stdout.write('  @ found: ' + hasAt + ' at pos ' + pos + '\n');
  process.stdout.write('\n');
}
