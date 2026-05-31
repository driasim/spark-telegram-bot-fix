import assert from 'node:assert/strict';
import { evaluateDeterministicRoute, normalizeRouteFirewallText } from '../src/routeFirewall';

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

test('normalizeRouteFirewallText maps Cyrillic homoglyphs to ASCII', () => {
  const homoglyph = 'd\u043E n\u043Et run build';
  const normalized = normalizeRouteFirewallText(homoglyph);
  assert.equal(normalized, 'do not run build');
});

test('normalizeRouteFirewallText strips combining marks after NFKC', () => {
  const composed = 'caf\u00e9 build';
  const normalized = normalizeRouteFirewallText(composed);
  assert.equal(normalized, 'cafe build');
});

test('homoglyph do-not-run boundary blocks build route', () => {
  const prompt = 'd\u043E n\u043Et run build anything new for now';
  const verdict = evaluateDeterministicRoute('spawner.build', prompt);
  assert.equal(verdict.allow, false);
  assert.equal(verdict.reason, 'no_execution_boundary');
});

test('plain ASCII no-execution boundary still blocks build route', () => {
  const verdict = evaluateDeterministicRoute('spawner.build', 'No build or mission for now, just help me think through the QA plan.');
  assert.equal(verdict.allow, false);
  assert.equal(verdict.reason, 'no_execution_boundary');
});
