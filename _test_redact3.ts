import { redactText } from "./src/redaction";
import * as fs from "fs";

const cases = [
  'DATABASE_URL=postgres://user:pass@localhost:5432/mydb',
  'DATABASE_URL=postgres://user@localhost/mydb',
  'postgres://user%40example.com:pass@localhost/db',
  '{"url":"postgres://user:pass@host/db"}',
  'postgres://user:pass\n@localhost/db',
  'postgres://user:pass@',
  'postgres://***user@host',
];

const lines: string[] = [];
for (const input of cases) {
  const out = redactText(input);
  const hasAt = out.indexOf("@") >= 0;
  lines.push("IN:  " + input);
  lines.push("OUT: " + out);
  lines.push("AT:  " + (hasAt ? "YES" : "NO"));
  lines.push("---");
}
fs.writeFileSync("/tmp/redact_results.txt", lines.join("\n"));
console.log("Results written to /tmp/redact_results.txt");
