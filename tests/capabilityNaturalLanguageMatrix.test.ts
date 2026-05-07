import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseBuildIntent } from '../src/buildIntent';
import { extractSparkSelfImprovementGoal } from '../src/conversationIntent';

type MatrixCase = {
  id: string;
  prompt: string;
  expected_telegram_build_intent: boolean;
  expected_telegram_self_improvement_goal_contains: string[];
};

type Matrix = {
  matrix_id: string;
  guardrails: string[];
  cases: MatrixCase[];
};

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function loadMatrix(): Matrix {
  const path = join(__dirname, '..', 'ops', 'capability-natural-language-matrix.json');
  return JSON.parse(readFileSync(path, 'utf8')) as Matrix;
}

test('capability natural-language matrix separates app builds from Spark capability proposals', () => {
  const matrix = loadMatrix();
  assert.equal(matrix.matrix_id, 'spark_capability_natural_language_routes_v1');
  assert.ok(matrix.guardrails.includes('capability proposals are not normal Spawner app builds'));
  assert.ok(matrix.guardrails.includes('normal dashboards and user tools still build'));

  for (const row of matrix.cases) {
    const buildIntent = parseBuildIntent(row.prompt);
    const improvementGoal = extractSparkSelfImprovementGoal(row.prompt);

    if (row.expected_telegram_build_intent) {
      assert.ok(buildIntent, `${row.id} should route to build intent`);
      assert.equal(improvementGoal, null, `${row.id} should not route to Spark self-improvement`);
      continue;
    }

    assert.equal(buildIntent, null, `${row.id} should not route to app build`);
    const needles = row.expected_telegram_self_improvement_goal_contains || [];
    if (needles.length > 0) {
      assert.ok(improvementGoal, `${row.id} should produce a Spark self-improvement goal`);
      const loweredGoal = improvementGoal.toLowerCase();
      for (const needle of needles) {
        assert.ok(
          loweredGoal.includes(needle.toLowerCase()),
          `${row.id} self-improvement goal should contain ${JSON.stringify(needle)}; got ${JSON.stringify(improvementGoal)}`
        );
      }
    } else {
      assert.equal(improvementGoal, null, `${row.id} should not produce a self-improvement goal`);
    }
  }
});
