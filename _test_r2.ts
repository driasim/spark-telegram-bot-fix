import { redactText } from "./src/redaction";
import * as fs from "fs";

const cases = [
  'postgres://user:pass@localhost/db',
  // Double redaction
  'postgres://***@localhost/db',
  // URL in assignment
  'DATABASE_URL=postgres://user:pass@localhost/db',
  // Double redaction of different pattern
  'postgres://user:***@localhost/db',
];

const lines: string[] = [];
for (const input of cases) {
  const once = redactText(input);
  const twice = redactText(once);
  lines.push("IN:  " + input);
  lines.push("1x:  " + once);
  lines.push("2x:  " + twice);
  lines.push("---");
}
fs.writeFileSync("/tmp/r2.txt", lines.join("\n"), "utf-8");
