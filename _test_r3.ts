import { redactText } from "./src/redaction";
import * as fs from "fs";

const cases = [
  'DATABASE_URL=postgres://user:pass@localhost:5432/mydb',
  'export DATABASE_URL=postgres://user:pass@localhost/mydb',
  '"database_url": "postgres://user:pass@localhost/db"',
];

const lines: string[] = [];
for (const input of cases) {
  const out = redactText(input);
  lines.push("IN:  " + repr(input));
  lines.push("OUT: " + repr(out));
  lines.push("---");
}

function repr(s: string): string {
  return JSON.stringify(s);
}

fs.writeFileSync("/tmp/r3.txt", lines.join("\n"), "utf-8");
