import { redactText } from "./src/redaction";
import * as fs from "fs";

const cases = [
  'DATABASE_URL=postgres://user:pass@localhost:5432/mydb',
  'postgres://user:pass@localhost/db',
  'postgres://***user@host',
];

const lines: string[] = [];
for (const input of cases) {
  const out = redactText(input);
  // Use pipe as separator to avoid @ issues in console
  lines.push("IN| " + input.replace(/@/g, "{ATSIGN}"));
  lines.push("OUT| " + out.replace(/@/g, "{ATSIGN}"));
  lines.push("---");
}
fs.writeFileSync("/tmp/redact_out.txt", lines.join("\n"), "utf-8");
console.log("done");
