import { redactText } from "./src/redaction";

const cases = [
  "postgres://***user@host",
  "postgres://user@host",
  "postgres://user:pass@host",
  "postgres://***@host",
];

for (const input of cases) {
  const out = redactText(input);
  console.log("IN:  " + input.replace(/@/g, "(AT)"));
  console.log("OUT: " + out.replace(/@/g, "(AT)"));
  console.log("---");
}
