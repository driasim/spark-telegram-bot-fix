import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';

process.env.SPARK_BOT_TEST_MODE = '1';
process.env.BOT_TOKEN = process.env.BOT_TOKEN || '0:telegram-recursive-command-test';
process.env.ADMIN_TELEGRAM_IDS = '8319079055';
process.env.TELEGRAM_RELAY_SECRET = process.env.TELEGRAM_RELAY_SECRET || 'recursive-command-test-relay-secret-1234567890';

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function fakeCtx(text: string, options: { telegram?: boolean } = {}): any {
  const replies: string[] = [];
  const ctx: any = {
    replies,
    from: { id: 8319079055 },
    chat: { id: 8319079055 },
    message: { text },
    reply: async (message: string) => {
      replies.push(message);
    },
    sendChatAction: async () => {},
  };
  if (options.telegram !== false) {
    ctx.telegram = {
      sendChatAction: async () => {},
      sendMessage: async (_chatId: number, message: string) => {
        replies.push(message);
      }
    };
  }
  return ctx;
}

async function waitForReplies(ctx: any, minimumCount: number, timeoutMs = 15000): Promise<void> {
  const startedAt = Date.now();
  while ((ctx.replies?.length || 0) < minimumCount) {
    if (Date.now() - startedAt > timeoutMs) {
      assert.fail(`Timed out waiting for ${minimumCount} replies; saw ${ctx.replies?.length || 0}: ${(ctx.replies || []).join('\n---\n')}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

function makeFakeStartupSparkQaCommandRepo(root = mkdtempSync(path.join(tmpdir(), 'spark-qa-startup-command-repo-'))): string {
  const moduleDir = path.join(root, 'src', 'specialization_path_spark_qa_operator');
  mkdirSync(moduleDir, { recursive: true });
  writeFileSync(path.join(root, 'specialization-path.json'), JSON.stringify({ key: 'spark-qa-operator' }), 'utf-8');
  writeFileSync(path.join(moduleDir, '__init__.py'), '', 'utf-8');
  writeFileSync(path.join(moduleDir, 'cli.py'), [
    'from __future__ import annotations',
    'import argparse, datetime, hashlib, json, os, pathlib, sys',
    'parser = argparse.ArgumentParser()',
    'parser.add_argument("hook")',
    'parser.add_argument("--output-root", default="")',
    'parser.add_argument("--output-dir", default="")',
    'parser.add_argument("--timeout-seconds", default="180")',
    'parser.add_argument("--specialization-path", default="Spark QA Operator")',
    'parser.add_argument("--level", default="10")',
    'parser.add_argument("--startup-bench-repo", default="")',
    'parser.add_argument("--startup-operator-repo", default="")',
    'parser.add_argument("--seed", default="1")',
    'parser.add_argument("--seeds", default="")',
    'parser.add_argument("--baseline-id", default="heuristic_resilient_operator")',
    'parser.add_argument("--max-turns", default="6")',
    'parser.add_argument("--tool-calls", default="")',
    'parser.add_argument("--stability-ledger", default="")',
    'parser.add_argument("--stability-minimum-elapsed-hours", default="24")',
    'parser.add_argument("--stability-max-delta-drift", default="0.001")',
    'parser.add_argument("--proof-report", default="")',
    'parser.add_argument("--hidden-heldout-manifest", default="")',
    'parser.add_argument("--sidecar-required-reviewers", default="1")',
    'parser.add_argument("--reviewer", action="append", default=[])',
    'args, _ = parser.parse_known_args()',
    'out = pathlib.Path(args.output_dir or args.output_root or "tmp-sparkqa")',
    'out.mkdir(parents=True, exist_ok=True)',
    'if args.hook == "benchmark-creator-prd":',
    '    level = int(args.level)',
    '    splits = ["visible", "heldout", "trap", "system", "audit", "longrun", "fresh"]',
    '    families = ["telegram", "autoloop", "benchmark", "evidence", "review", "heldout", "tool_use", "swarm", "promotion", "startup_reasoning"]',
    '    failures = ["route_hijack", "stale_truth", "schema_drift", "tool_misuse", "score_hallucination", "cached_number", "hash_mismatch", "heldout_leak", "wrapper_raw_gap", "sidecar_gap", "swarm_bridge_gap", "longrun_flake"]',
    '    cases = []',
    '    for i in range(84):',
    '        cases.append({"id": "startup-case-%03d" % i, "split": splits[i % len(splits)], "caseFamily": families[i % len(families)], "failureClass": failures[i % len(failures)], "toolSurfaces": ["telegram", "filesystem", "autoloop"], "requiredSourceLanes": ["benchmark_pack", "evidence_ladder", "promotion_dossier"], "promotionBlocking": i < 42, "requiredArtifactKinds": ["case_envelope", "source_hash", "runner_trace"], "artifactAssertions": {"requiresSha256": True, "requiresByteSize": True}, "forbiddenContains": {"observedAnswer": ["fake score"]} if i == 0 else {}})',
    '    pack = {"schemaVersion": "spark-benchmark-pack-executable.v1", "id": "startup-bench-level-%d-command-pack" % level, "caseCount": len(cases), "splits": splits, "cases": cases, "executionContract": {"runner": "startup-bench-proof-adapter"}, "scoringContract": {"scoreSource": "fresh_autoloop_report"}, "specializationAdapter": {"key": "startup-bench", "capabilities": {"proof_autoloop": True}}}',
    '    quality = {"schemaVersion": "spark-benchmark-quality-report.v1", "benchmarkPackId": pack["id"], "status": "ready", "pass": True, "qualityScore": 1.0, "scoreClaimAllowed": False, "improvementClaimAllowed": False, "nextGate": "run_fresh_benchmark_autoloop", "benchmarkLevel": {"level": level, "autoLoop": True, "swarmAudited": True}, "specializationAdapter": {"key": "startup-bench", "capabilities": {"proof_autoloop": True}}}',
    '    artifacts = ["benchmark_pack", "benchmark_quality_report", "validation_ledger", "runner_contract", "evidence_ladder", "source_lane_map", "hidden_heldout_manifest", "trap_case_manifest", "longrun_stability_plan", "spark_swarm_bridge_packet", "sidecar_review_packet", "promotion_bridge", "local_private_boundary", "autoloop_policy", "ticket_driven_mutation_handoff"]',
    '    manifest = {"schemaVersion": "spark-benchmark-creator-artifact-manifest.v1", "artifacts": [{"artifactType": item} for item in artifacts], "scoreStatus": "not_scored"}',
    '    prd = {"generatedAt": "2026-05-29T00:00:00Z", "specializationPath": {"label": args.specialization_path, "pathKey": "startup-bench"}, "benchmarkLevel": {"level": level, "name": "lab_swarm_research", "timeBudget": "hours to days", "canvasKanban": True}}',
    '    paths = {"benchmarkPack": str(out / "benchmark_pack.json"), "benchmarkQualityReport": str(out / "benchmark_quality_report.json"), "artifactManifest": str(out / "artifact_manifest.json"), "json": str(out / "benchmark_creator_prd.json"), "hidden_heldout_manifest": str(out / "hidden_heldout_manifest.json"), "sidecar_review_template": str(out / "sidecar_review.template.json")}',
    '    pathlib.Path(paths["benchmarkPack"]).write_text(json.dumps(pack), encoding="utf-8")',
    '    pathlib.Path(paths["benchmarkQualityReport"]).write_text(json.dumps(quality), encoding="utf-8")',
    '    pathlib.Path(paths["artifactManifest"]).write_text(json.dumps(manifest), encoding="utf-8")',
    '    pathlib.Path(paths["json"]).write_text(json.dumps(prd), encoding="utf-8")',
    '    pathlib.Path(paths["hidden_heldout_manifest"]).write_text(json.dumps({"schemaVersion": "spark-qa-hidden-heldout-manifest.v1", "sealedCaseRefs": [{"caseRef": "hidden-%02d" % i, "sealedHash": "sha256:" + ("a" * 64)} for i in range(12)], "candidateVisible": False}), encoding="utf-8")',
    '    pathlib.Path(paths["sidecar_review_template"]).write_text(json.dumps({"schemaVersion": "spark-swarm-sidecar-review.v1", "reviewRequired": True, "reviewStatus": "pending"}), encoding="utf-8")',
    '    print(json.dumps({"schemaVersion": "spark-benchmark-creator-prd.v1", "paths": paths, "prd": prd, "quality": quality}))',
    '    sys.exit(0)',
    'if args.hook == "autoloop-round":',
    '    active_job = pathlib.Path(".spark-swarm/benchmark-creator/active_job.json")',
    '    job = json.loads(active_job.read_text(encoding="utf-8")) if active_job.exists() else {}',
    '    pack_hash = (((job.get("artifactHashes") or {}).get("benchmarkPackSha256")) or "")',
    '    pack_id = job.get("benchmarkPackId") or ""',
    '    generated_at = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")',
    '    report_path = out / "autoloop_round_report.json"',
    '    latest_path = pathlib.Path(".spark-swarm/autoloop/latest_run.json")',
    '    latest_path.parent.mkdir(parents=True, exist_ok=True)',
    '    report = {"schemaVersion": "spark-qa-autoloop-round-report.v1", "generatedAt": generated_at, "run": {"endedAt": generated_at}, "inputs": {"benchmarkPack": {"sha256": pack_hash, "id": pack_id}}, "baselineCandidateDelta": {"baselineScore": 0.0, "candidateScore": 1.0, "delta": 1.0}, "captureReplay": {"passedCount": 4, "caseCount": 4}, "evidenceBenchmark": {"overallScore": 1.0}, "failureQueue": {"ticketCount": 2}, "promotionDossier": {"scoreClaimAllowed": False, "public_ready": False, "network_absorbable": False, "blockers": ["wrapper_raw_not_reconciled"]}}',
    '    report_text = json.dumps(report, indent=2, sort_keys=True)',
    '    report_path.write_text(report_text, encoding="utf-8")',
    '    report_sha = hashlib.sha256(report_text.encode("utf-8")).hexdigest()',
    '    manifest = {"reportPath": str(report_path), "outputRoot": str(out), "generatedAt": generated_at, "reportSha256": report_sha, "schemaVersion": report["schemaVersion"]}',
    '    latest_path.write_text(json.dumps(manifest, indent=2, sort_keys=True), encoding="utf-8")',
    '    report["latestRunManifestPath"] = str(latest_path)',
    '    print(json.dumps(report))',
    '    sys.exit(1)',
    'if args.hook == "startup-bench-proof-adapter":',
    '    generated_at = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")',
    '    report_path = out / "startup_bench_proof_report.json"',
    '    run_root = out / "runs"',
    '    baseline_dir = run_root / "baseline"',
    '    candidate_dir = run_root / "candidate"',
    '    baseline_dir.mkdir(parents=True, exist_ok=True)',
    '    candidate_dir.mkdir(parents=True, exist_ok=True)',
    '    (baseline_dir / "trace.json").write_text(json.dumps({"run_id": "baseline-command"}), encoding="utf-8")',
    '    (candidate_dir / "trace.json").write_text(json.dumps({"run_id": "candidate-command"}), encoding="utf-8")',
    '    (baseline_dir / "score_report.json").write_text(json.dumps({"run_id": "baseline-command", "scenario_score": 0.64, "pass": True, "violations": []}), encoding="utf-8")',
    '    (candidate_dir / "score_report.json").write_text(json.dumps({"run_id": "candidate-command", "scenario_score": 0.67, "pass": True, "violations": []}), encoding="utf-8")',
    '    tool_calls_path = pathlib.Path(args.tool_calls) if args.tool_calls else pathlib.Path(args.startup_operator_repo) / "benchmarks" / "startup-operator.tool_calls.json"',
    '    tool_calls_sha = hashlib.sha256(tool_calls_path.read_bytes()).hexdigest() if tool_calls_path.exists() else ""',
    '    signature_payload = {"startupBenchRepo": args.startup_bench_repo, "startupOperatorRepo": args.startup_operator_repo, "toolCallsPath": str(tool_calls_path), "toolCallsSha256": tool_calls_sha, "seed": int(args.seed), "baselineId": args.baseline_id, "maxTurns": int(args.max_turns)}',
    '    signature_digest = hashlib.sha256(json.dumps(signature_payload, sort_keys=True).encode("utf-8")).hexdigest()',
    '    report = {"schemaVersion": "spark-startup-bench-proof-adapter.v1", "generatedAt": generated_at, "status": "runner_proof_ready", "adapterImplemented": True, "proofAdapterReady": True, "runnerProofReady": True, "scoreClaimAllowed": False, "improvementClaimAllowed": False, "commands": [{"name": "baseline", "exitCode": 0}, {"name": "candidate", "exitCode": 0}], "artifacts": [{"artifactType": "baseline_score_report"}, {"artifactType": "candidate_score_report"}], "startupBench": {"seeds": [int(args.seed)], "runSignature": {"schemaVersion": "spark-startup-bench-run-signature.v1", "digest": signature_digest, "payload": signature_payload}}, "startupOperator": {"repo": args.startup_operator_repo, "toolCallsPath": str(tool_calls_path), "toolCallsSha256": tool_calls_sha}, "repeatedStability": {"status": "single_seed_only", "pass": False, "scoreClaimAllowed": False}, "wallClockStability": {"schemaVersion": "spark-startup-bench-wall-clock-stability.v1", "status": "waiting", "pass": False, "scoreClaimAllowed": False, "blockers": ["wall_clock_second_window_missing"]}, "privateScoreSummary": {"baseline": {"scenarioScore": 0.64, "runCount": 1}, "candidate": {"scenarioScore": 0.67, "runCount": 1}, "comparison": {"metric": "scenario_score", "candidateMinusBaseline": 0.03, "candidateBeatsBaseline": True}, "runs": [{"seed": int(args.seed), "baseline": {"scenarioScore": 0.64}, "candidate": {"scenarioScore": 0.67}, "comparison": {"candidateMinusBaseline": 0.03}}], "scoreClaimAllowed": False}, "promotionDossier": {"status": "blocked", "scoreClaimAllowed": False, "public_ready": False, "network_absorbable": False, "blockers": ["hidden_heldout_not_revealed_to_candidate", "wrapper_raw_not_reconciled", "sidecar_review_pending", "wall_clock_stability_window_missing"]}, "blockers": ["hidden_heldout_not_revealed_to_candidate", "wrapper_raw_not_reconciled", "sidecar_review_pending", "wall_clock_stability_window_missing"], "paths": {"report": str(report_path), "runRoots": [str(run_root)]}}',
    '    report_path.write_text(json.dumps(report, indent=2, sort_keys=True), encoding="utf-8")',
    '    print(json.dumps(report))',
    '    sys.exit(0)',
    'if args.hook == "startup-bench-proof-gates":',
    '    proof_path = pathlib.Path(args.proof_report)',
    '    proof = json.loads(proof_path.read_text(encoding="utf-8")) if proof_path.exists() else {}',
    '    proof_sha = hashlib.sha256(proof_path.read_bytes()).hexdigest() if proof_path.exists() else ""',
    '    manifest_path = out / "startup_bench_proof_gates.json"',
    '    hidden_path = out / "hidden_heldout_report.json"',
    '    wrapper_path = out / "wrapper_raw_report.json"',
    '    raw_score_path = out / "raw_score_summary.json"',
    '    wrapper_score_path = out / "wrapper_score_summary.json"',
    '    sidecar_path = out / "sidecar_review_report.json"',
    '    score_path = out / "score_reconciliation_report.json"',
    '    kanban_path = out / "kanban.json"',
    '    hidden_clean = bool(args.hidden_heldout_manifest and pathlib.Path(args.hidden_heldout_manifest).exists())',
    '    sidecar_required = max(1, int(args.sidecar_required_reviewers))',
    '    sidecar_clean = len(args.reviewer) >= sidecar_required',
    '    wall_clock_clean = proof.get("wallClockStability", {}).get("pass") is True',
    '    raw_summary = {"schemaVersion": "spark-startup-bench-proof-score-summary.v1", "overallScore": 0.67, "splitScores": {"baseline": 0.64, "candidate": 0.67}, "startupBenchPrivateMovement": {"baselineScenarioScore": 0.64, "candidateScenarioScore": 0.67, "candidateMinusBaseline": 0.03, "candidateBeatsBaseline": True}, "scoreClaimAllowed": False}',
    '    raw_text = json.dumps(raw_summary, sort_keys=True)',
    '    wrapper_text = json.dumps(raw_summary, sort_keys=True)',
    '    raw_score_path.write_text(raw_text, encoding="utf-8")',
    '    wrapper_score_path.write_text(wrapper_text, encoding="utf-8")',
    '    raw_hash = hashlib.sha256(raw_text.encode("utf-8")).hexdigest()',
    '    wrapper_hash = hashlib.sha256(wrapper_text.encode("utf-8")).hexdigest()',
    '    hidden_path.write_text(json.dumps({"schemaVersion": "spark-startup-bench-hidden-heldout-report.v1", "status": "passed" if hidden_clean else "blocked", "pass": hidden_clean, "blockers": [] if hidden_clean else ["hidden_heldout_manifest_missing"]}), encoding="utf-8")',
    '    wrapper_path.write_text(json.dumps({"schemaVersion": "spark-qa-wrapper-raw-reconciliation-report.v1", "status": "clean", "pass": True, "blockers": [], "comparisons": {"dimensionScoresMatch": True, "splitScoresMatch": True, "promotionStatusMatches": True}, "rawReport": {"path": str(raw_score_path), "sha256": raw_hash, "schemaVersion": raw_summary["schemaVersion"]}, "wrapperReport": {"path": str(wrapper_score_path), "sha256": wrapper_hash, "schemaVersion": raw_summary["schemaVersion"]}, "scoreClaimAllowed": False}), encoding="utf-8")',
    '    sidecar_path.write_text(json.dumps({"schemaVersion": "spark-qa-sidecar-review-report.v1", "status": "clean" if sidecar_clean else "blocked", "pass": sidecar_clean, "reviewerCountRequired": sidecar_required, "reviewerCount": len(args.reviewer), "blockers": [] if sidecar_clean else ["sidecar_clean_quorum:%d/%d" % (len(args.reviewer), sidecar_required)]}), encoding="utf-8")',
    '    score_blockers = []',
    '    if not hidden_clean: score_blockers.append("hidden_heldout_not_revealed_to_candidate")',
    '    if not sidecar_clean: score_blockers.append("sidecar_review_pending")',
    '    if not wall_clock_clean: score_blockers.append("wall_clock_stability_window_missing")',
    '    score_path.write_text(json.dumps({"schemaVersion": "spark-startup-bench-score-reconciliation-report.v1", "status": "blocked", "pass": False, "scoreClaimAllowed": False, "blockers": score_blockers, "privateMovement": {"baselineScenarioScore": 0.64, "candidateScenarioScore": 0.67, "candidateMinusBaseline": 0.03, "candidateBeatsBaseline": True}}), encoding="utf-8")',
    '    pass_all = hidden_clean and sidecar_clean and wall_clock_clean',
    '    kanban_path.write_text(json.dumps({"schemaVersion": "spark-startup-bench-proof-gate-kanban.v1", "ticketCount": 0 if pass_all else 1, "columns": []}), encoding="utf-8")',
    '    payload = {"schemaVersion": "spark-startup-bench-proof-gate-bundle.v1", "status": "ready" if pass_all else "blocked", "pass": pass_all, "scoreClaimAllowed": False, "improvementClaimAllowed": False, "public_ready": False, "network_absorbable": False, "proofReport": {"path": str(proof_path), "sha256": proof_sha, "schemaVersion": proof.get("schemaVersion")}, "proofBinding": {"schemaVersion": "spark-startup-bench-proof-binding.v1", "proofReportPath": str(proof_path), "proofReportSha256": proof_sha}, "paths": {"manifest": str(manifest_path), "hiddenHeldoutReport": str(hidden_path), "wrapperRawReport": str(wrapper_path), "sidecarReviewReport": str(sidecar_path), "scoreReconciliationReport": str(score_path), "kanban": str(kanban_path)}, "gates": {"hiddenHeldout": {"status": "passed" if hidden_clean else "blocked", "pass": hidden_clean, "blockers": [] if hidden_clean else ["hidden_heldout_manifest_missing"]}, "wrapperRaw": {"status": "clean", "pass": True, "blockers": []}, "sidecarReview": {"status": "clean" if sidecar_clean else "blocked", "pass": sidecar_clean, "reviewerCountRequired": sidecar_required, "reviewerCount": len(args.reviewer), "blockers": [] if sidecar_clean else ["sidecar_clean_quorum:%d/%d" % (len(args.reviewer), sidecar_required)]}, "scoreReconciliation": {"status": "blocked", "pass": False, "blockers": score_blockers}}, "kanban": {"ticketCount": 0 if pass_all else 1, "path": str(kanban_path)}}',
    '    manifest_path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")',
    '    print(json.dumps(payload))',
    '    sys.exit(0 if pass_all else 1)',
    'print(json.dumps({"error": "unsupported hook", "hook": args.hook}))',
    'sys.exit(2)',
    '',
  ].join('\n'), 'utf-8');
  return root;
}

function makeFakeStartupBenchRepo(root = mkdtempSync(path.join(tmpdir(), 'startup-bench-command-repo-'))): string {
  const moduleDir = path.join(root, 'src', 'thestartupbench');
  mkdirSync(moduleDir, { recursive: true });
  writeFileSync(path.join(moduleDir, '__main__.py'), [
    'import json, pathlib, sys',
    'if len(sys.argv) > 1 and sys.argv[1] == "run-suite":',
    '    suite_path = pathlib.Path(sys.argv[2])',
    '    suite = json.loads(suite_path.read_text(encoding="utf-8"))',
    '    scenarios = suite.get("scenarios", [])',
    '    out = pathlib.Path(sys.argv[sys.argv.index("--output-dir") + 1]) if "--output-dir" in sys.argv else pathlib.Path("tmp-suite")',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    suite_report = {"overall": {"scenario_count": len(scenarios), "scenario_score_mean": 0.5, "outcome_score_mean": 0.5, "constraint_score_mean": 1.0, "pass_rate_mean": 1.0}, "track_summaries": []}',
    '    (out / "suite_report.json").write_text(json.dumps(suite_report), encoding="utf-8")',
    '    print(json.dumps({"suite_report": suite_report, "validation": {"ok": True}}))',
    '    sys.exit(0)',
    'print("fake startup bench")',
    '',
  ].join('\n'), 'utf-8');
  writeFileSync(path.join(moduleDir, 'cli.py'), '', 'utf-8');
  mkdirSync(path.join(root, 'examples'), { recursive: true });
  const suites = [
    ['dev_scenario_suite.json', 'dev', 'command_gtm_001', 'gtm'],
    ['private_operator_test_scenario_suite.json', 'test', 'command_operator_001', 'gtm'],
    ['private_operator_fresh_scenario_suite.json', 'fresh', 'command_operator_fresh_001', 'people'],
    ['private_canary_test_scenario_suite.json', 'test', 'command_canary_001', 'gtm'],
    ['private_canary_fresh_scenario_suite.json', 'fresh', 'command_canary_fresh_001', 'finance'],
    ['private_strategy_test_scenario_suite.json', 'test', 'command_strategy_001', 'board'],
    ['private_strategy_fresh_scenario_suite.json', 'fresh', 'command_strategy_fresh_001', 'product'],
    ['private_real_world_test_scenario_suite.json', 'test', 'command_real_world_001', 'crisis'],
    ['private_real_world_fresh_scenario_suite.json', 'fresh', 'command_real_world_fresh_001', 'scale'],
    ['private_coverage_test_scenario_suite.json', 'test', 'command_coverage_001', '0to1'],
    ['private_coverage_fresh_scenario_suite.json', 'fresh', 'command_coverage_fresh_001', 'people'],
  ] as const;
  for (const [fileName, split, scenarioId, track] of suites) {
    writeFileSync(path.join(root, 'examples', fileName), JSON.stringify({
      suite_version: '0.1.0',
      benchmark_version: '0.1.0',
      scenario_pack_version: `${scenarioId}-pack`,
      split,
      scenarios: [{ scenario_id: scenarioId, path: `${scenarioId}.json`, track, mode: split }],
    }), 'utf-8');
  }
  return root;
}

function makeFakeStartupOperatorRepo(root = mkdtempSync(path.join(tmpdir(), 'startup-operator-command-repo-'))): string {
  mkdirSync(path.join(root, 'benchmarks', 'scenarios'), { recursive: true });
  writeFileSync(path.join(root, 'specialization-path.json'), JSON.stringify({ pathKey: 'startup-operator' }), 'utf-8');
  writeFileSync(path.join(root, 'benchmarks', 'startup-operator.tool_calls.json'), JSON.stringify([
    { tool_name: 'metrics.report', request_id: 'startup_operator_req_001', arguments: {} },
    { tool_name: 'finance.plan.write', request_id: 'startup_operator_req_002', arguments: { forecast: { liquid_cash_usd: 460000.0 } } },
    { tool_name: 'sales.pipeline.update', request_id: 'startup_operator_req_003', arguments: {} },
  ], null, 2), 'utf-8');
  writeFileSync(path.join(root, 'benchmarks', 'scenarios', 'minimal_0to1_scenario.json'), JSON.stringify({ metadata: { scenario_id: 'minimal_0to1_scenario' } }), 'utf-8');
  writeFileSync(path.join(root, 'benchmarks', 'scenarios', 'command_gtm_001.json'), JSON.stringify({ metadata: { scenario_id: 'command_gtm_001' } }), 'utf-8');
  return root;
}

function makeFakeStartupYcRepo(root = mkdtempSync(path.join(tmpdir(), 'startup-yc-command-repo-'))): string {
  const moduleDir = path.join(root, 'src', 'specialization_path_startup_yc');
  mkdirSync(moduleDir, { recursive: true });
  mkdirSync(path.join(root, 'data', 'absorption'), { recursive: true });
  writeFileSync(path.join(moduleDir, '__init__.py'), '', 'utf-8');
  writeFileSync(path.join(root, 'data', 'absorption', 'startup_yc_absorption_v1.json'), JSON.stringify({ suite_id: 'startup_yc_absorption_v1', cases: [] }), 'utf-8');
  writeFileSync(path.join(moduleDir, 'cli.py'), [
    'from __future__ import annotations',
    'import argparse, json, pathlib',
    'parser = argparse.ArgumentParser()',
    'parser.add_argument("hook")',
    'parser.add_argument("--input", required=True)',
    'parser.add_argument("--output", required=True)',
    'args = parser.parse_args()',
    'payload = json.loads(pathlib.Path(args.input).read_text(encoding="utf-8"))',
    'out = pathlib.Path(args.output)',
    'out.parent.mkdir(parents=True, exist_ok=True)',
    'case_limit = int(payload.get("case_limit") or 20)',
    'if args.hook == "absorption_bundle":',
    '    out.write_text(json.dumps({"schema_version": "1.0.0", "kind": "startup_yc_absorption_agent_bundle_export", "status": "ready", "suite_id": "startup_yc_absorption_v1", "case_count": case_limit, "bundle_count": case_limit * 3, "run_modes": ["no_pack", "pack", "validated_pack"], "bundles": []}), encoding="utf-8")',
    'else:',
    '    out.write_text(json.dumps({"schema_version": "1.0.0", "status": "ready"}), encoding="utf-8")',
    '',
  ].join('\n'), 'utf-8');
  return root;
}

async function main(): Promise<void> {
  const {
    handleRecursiveCommand,
    handleSparkQaCommand,
    parseNaturalRecursiveProposalIntent,
    readSparkQaStartupIntelligenceAbsorptionBackgroundRegistry,
    readSparkQaStartupImprovementBackgroundRegistry,
    recordSparkQaStartupIntelligenceAbsorptionBackgroundJob,
    recordSparkQaStartupImprovementBackgroundJob,
    renderSparkQaStartupIntelligenceAbsorptionBackgroundStatus,
    resumeSparkQaStartupImprovementBackgroundJobs,
    sendSparkQaProofAutoMessage,
    shouldRefreshSparkQaStartupImprovementBackgroundJob,
    shouldStopSparkQaStartupImprovementBackground,
    sparkQaStartupImprovementBackgroundLeaseHealth,
    sparkQaStartupImprovementBackgroundStopDecision,
    sparkQaStartupIntelligenceAbsorptionBackgroundRegistryPath,
    sparkQaStartupImprovementBackgroundRegistryPath,
  } = await import('../src/index');

  await test('natural recursive proposal intent keeps command language human', async () => {
    assert.deepEqual(
      parseNaturalRecursiveProposalIntent('prepare crypto trading for review in Spark Swarm'),
      { target: 'crypto-trading', submit: false }
    );
    assert.deepEqual(
      parseNaturalRecursiveProposalIntent('can we share Startup YC with the network review lane?'),
      { target: 'startup-yc', submit: true }
    );
    assert.equal(parseNaturalRecursiveProposalIntent('what happened with crypto trading?'), null);
  });

  await test('Spark QA background messages skip unavailable Telegram chats', async () => {
    let calls = 0;
    await sendSparkQaProofAutoMessage({
      sendMessage: async () => {
        calls += 1;
        throw new Error('400: Bad Request: chat not found');
      }
    }, 'missing-chat', 'Startup Bench improvement was restored after restart.');
    assert.equal(calls, 1);
  });

  await test('recursive command export renders help through command path', async () => {
    const ctx = fakeCtx('/recursive help');
    await handleRecursiveCommand(ctx);
    assert.match(ctx.replies.join('\n'), /\/recursive start <targetKey> rounds <n> - run an attached specialization path, with Builder chip fallback/);
  });

  await test('recursive command export validates start usage through command path', async () => {
    const ctx = fakeCtx('/recursive start');
    await handleRecursiveCommand(ctx);
    assert.equal(ctx.replies[0], 'Usage: /recursive start <targetKey> [rounds <n>]');
  });

  await test('sparkqa command uses autoloop proof and blocks score claims', async () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'spark-qa-command-repo-'));
    const moduleDir = path.join(repo, 'src', 'specialization_path_spark_qa_operator');
    mkdirSync(moduleDir, { recursive: true });
    writeFileSync(path.join(repo, 'specialization-path.json'), JSON.stringify({ key: 'spark-qa-operator' }), 'utf-8');
    writeFileSync(path.join(moduleDir, '__init__.py'), '', 'utf-8');
    writeFileSync(path.join(moduleDir, 'cli.py'), [
      'from __future__ import annotations',
      'import argparse, json, pathlib, sys',
      'parser = argparse.ArgumentParser()',
      'parser.add_argument("hook")',
      'parser.add_argument("--output-root", default="")',
      'parser.add_argument("--timeout-seconds", default="180")',
      'args, rest = parser.parse_known_args()',
      'def option_value(name, default=""):',
      '    if name in rest:',
      '        idx = rest.index(name)',
      '        if idx + 1 < len(rest):',
      '            return rest[idx + 1]',
      '    return default',
      'out = pathlib.Path(option_value("--output-dir", args.output_root))',
      'out.mkdir(parents=True, exist_ok=True)',
      'if args.hook == "benchmark-creator-prd":',
      '    splits = ["visible", "heldout", "trap", "system", "audit", "longrun", "fresh"]',
      '    cases = []',
      '    for i in range(84):',
      '        cases.append({"id": f"case-{i}", "split": splits[i % len(splits)], "caseFamily": f"family-{i % 10}", "failureClass": f"failure-{i % 12}", "toolSurfaces": ["telegram", "filesystem", "python"], "requiredSourceLanes": ["visible", "hidden", "replay"], "promotionBlocking": i < 42, "requiredArtifactKinds": ["trace", "score", "dossier"], "artifactAssertions": {"requiresSha256": True, "requiresByteSize": True}, "forbiddenContains": {"observedAnswer": ["fake score"]}})',
      '    pack = {"schemaVersion": "spark-benchmark-pack.v1", "id": "test-pack", "caseCount": len(cases), "cases": cases, "executionContract": {"runner": "fake"}, "scoringContract": {"metric": "score"}, "specializationAdapter": {"capabilities": {"proof_autoloop": True}}}',
      '    quality = {"schemaVersion": "spark-benchmark-quality-report.v1", "benchmarkPackId": "test-pack", "status": "ready", "pass": True, "qualityScore": 1.0, "scoreClaimAllowed": False, "improvementClaimAllowed": False, "nextGate": "run_fresh_benchmark_autoloop", "benchmarkLevel": {"level": 10, "autoLoop": True, "swarmAudited": True}, "specializationAdapter": {"capabilities": {"proof_autoloop": True}}}',
      '    artifact_types = ["benchmark_pack", "benchmark_quality_report", "validation_ledger", "runner_contract", "evidence_ladder", "source_lane_map", "hidden_heldout_manifest", "trap_case_manifest", "longrun_stability_plan", "spark_swarm_bridge_packet", "sidecar_review_packet", "promotion_bridge", "local_private_boundary", "autoloop_policy", "ticket_driven_mutation_handoff"]',
      '    manifest = {"schemaVersion": "spark-artifact-manifest.v1", "artifacts": [{"artifactType": item} for item in artifact_types]}',
      '    prd = {"generatedAt": "2026-05-29T00:00:00Z", "specializationPath": {"label": "Spark QA Operator", "pathKey": "spark-qa-operator"}, "benchmarkLevel": {"level": 10}}',
      '    paths = {"benchmarkPack": str(out / "benchmark_pack.json"), "benchmarkQualityReport": str(out / "benchmark_quality_report.json"), "artifactManifest": str(out / "artifact_manifest.json"), "json": str(out / "benchmark_creator_prd.json")}',
      '    pathlib.Path(paths["benchmarkPack"]).write_text(json.dumps(pack), encoding="utf-8")',
      '    pathlib.Path(paths["benchmarkQualityReport"]).write_text(json.dumps(quality), encoding="utf-8")',
      '    pathlib.Path(paths["artifactManifest"]).write_text(json.dumps(manifest), encoding="utf-8")',
      '    pathlib.Path(paths["json"]).write_text(json.dumps(prd), encoding="utf-8")',
      '    print(json.dumps({"schemaVersion": "spark-benchmark-creator-prd.v1", "generatedAt": "2026-05-29T00:00:00Z", "paths": paths, "prd": prd}))',
      '    sys.exit(0)',
      'active_job = pathlib.Path(".spark-swarm/benchmark-creator/active_job.json")',
      'job = json.loads(active_job.read_text(encoding="utf-8")) if active_job.exists() else {}',
      'pack_hash = (((job.get("artifactHashes") or {}).get("benchmarkPackSha256")) or "")',
      'pack_id = job.get("benchmarkPackId") or ""',
      'report = {"schemaVersion": "spark-qa-autoloop-round-report.v1", "inputs": {"benchmarkPack": {"sha256": pack_hash, "id": pack_id}}, "baselineCandidateDelta": {"baselineScore": 0.0, "candidateScore": 1.0, "delta": 1.0}, "captureReplay": {"passedCount": 4, "caseCount": 4}, "evidenceBenchmark": {"overallScore": 1.0}, "failureQueue": {"ticketCount": 2}, "promotionDossier": {"scoreClaimAllowed": False, "blockers": ["wrapper_raw_not_reconciled"]}}',
      'print(json.dumps(report))',
      'sys.exit(1)',
      '',
    ].join('\n'), 'utf-8');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      const createCtx = fakeCtx('/sparkqa benchmark Spark QA Operator level 10');
      await handleSparkQaCommand(createCtx);
      assert.match(createCtx.replies.join('\n'), /selected this pack for the next \/sparkqa run/);
      const ctx = fakeCtx('/sparkqa run');
      await handleSparkQaCommand(ctx);
      const reply = ctx.replies.join('\n');
      assert.match(reply, /Starting the fresh Spark QA benchmark\/autoloop proof/);
      assert.match(reply, /would not claim an upgrade yet/);
      assert.match(reply, /wrapper\/raw reconciliation is still pending/);
      assert.doesNotMatch(reply, /cleared the benchmark\/autoloop score gate/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('sparkqa generic improve command starts benchmark creation without fake improvement claims', async () => {
    const { readActiveSparkQaBenchmarkJob } = await import('../src/sparkQaOperator');
    const repo = makeFakeStartupSparkQaCommandRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';

      const ctx = fakeCtx('/sparkqa improve Spark QA Operator level 10 cycles 100 agents 5', { telegram: false });
      await handleSparkQaCommand(ctx);
      const reply = ctx.replies.join('\n');
      assert.match(reply, /Benchmark creator packet is staged/i);
      assert.match(reply, /level 10/i);
      assert.match(reply, /workboard and Kanban tickets/i);
      assert.match(reply, /100 cycles with 5 advisory agents/i);
      assert.match(reply, /not an agent score/i);
      assert.match(reply, /local\/private/i);
      assert.doesNotMatch(reply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const activeJob = readActiveSparkQaBenchmarkJob(repo);
      assert.equal(activeJob.ok, true);
      assert.equal(activeJob.job?.level, 10);
      assert.equal(activeJob.job?.specializationAdapterKey, 'spark-qa-operator');
      assert.equal(activeJob.job?.requestedCycles, 100);
      assert.equal(activeJob.job?.advisoryAgents, 5);

      const statusCtx = fakeCtx('/sparkqa improve Spark QA Operator status', { telegram: false });
      await handleSparkQaCommand(statusCtx);
      const statusReply = statusCtx.replies.join('\n');
      assert.match(statusReply, /Spark QA Operator evolution/i);
      assert.match(statusReply, /0\/100 cycles/i);
      assert.match(statusReply, /5 advisory agents/i);
      assert.match(statusReply, /Mutation plan is not ready yet/i);
      assert.match(statusReply, /without pretending the QA agent improved/i);
      assert.doesNotMatch(statusReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);

      const reasoningCtx = fakeCtx('/sparkqa qa reasoning trials', { telegram: false });
      await handleSparkQaCommand(reasoningCtx);
      const reasoningReply = reasoningCtx.replies.join('\n');
      assert.match(reasoningReply, /Spark QA Operator reasoning trials/i);
      assert.match(reasoningReply, /No reasoning improvement, score, public readiness, or network absorption claim/i);
      assert.doesNotMatch(reasoningReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);

      const swarmCtx = fakeCtx('/sparkqa qa swarm-packet qa-command-smoke', { telegram: false });
      await handleSparkQaCommand(swarmCtx);
      const swarmReply = swarmCtx.replies.join('\n');
      assert.match(swarmReply, /Spark QA Operator private Spark Swarm packet is staged/i);
      assert.match(swarmReply, /qa-command-smoke/i);
      assert.match(swarmReply, /public_ready=false and network_absorbable=false/i);
      assert.match(swarmReply, /No score or improvement claim/i);

      const customCtx = fakeCtx('/sparkqa improve Custom Sales Agent level 10 cycles 7 agents 2', { telegram: false });
      await handleSparkQaCommand(customCtx);
      const customReply = customCtx.replies.join('\n');
      assert.match(customReply, /Benchmark creator packet is staged/i);
      assert.match(customReply, /Custom Sales Agent/i);
      assert.match(customReply, /7 cycles with 2 advisory agents/i);
      assert.match(customReply, /proof scoring waits for the specialization proof adapter|implementing the Custom Sales Agent proof adapter/i);
      assert.doesNotMatch(customReply, /selected this pack for the next \/sparkqa run/i);
      assert.doesNotMatch(customReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const customReadinessCtx = fakeCtx('/sparkqa adapter readiness', { telegram: false });
      await handleSparkQaCommand(customReadinessCtx);
      const customReadinessReply = customReadinessCtx.replies.join('\n');
      assert.match(customReadinessReply, /Adapter-readiness is written/i);
      assert.match(customReadinessReply, /7 cycles with 2 advisory agents/i);
      assert.match(customReadinessReply, /No score, improvement claim, public readiness, or network absorption/i);
      assert.doesNotMatch(customReadinessReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const customProofCtx = fakeCtx('/sparkqa prove', { telegram: false });
      await handleSparkQaCommand(customProofCtx);
      const customProofReply = customProofCtx.replies.join('\n');
      assert.match(customProofReply, /proof adapter is not implemented|prove stays blocked|proof\/autoloop is not enabled/i);
      assert.doesNotMatch(customProofReply, /Starting the fresh Spark QA benchmark\/autoloop proof|cleared the benchmark-backed score claim|scoreClaimAllowed=true/i);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('sparkqa QA Operator Telegram loop closes a private cycle and exports its packet', async () => {
    const { readActiveSparkQaBenchmarkJob } = await import('../src/sparkQaOperator');
    const { llm } = await import('../src/llm');
    const repo = makeFakeStartupSparkQaCommandRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldMaxAge = process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS;
    const oldIsAvailable = llm.isAvailable;
    const oldChat = llm.chat;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS = String(3650 * 24 * 60 * 60 * 1000);
      llm.isAvailable = async () => true;
      llm.chat = async (prompt: string) => {
        const slot = Number(prompt.match(/"slot":\s*(\d+)/)?.[1] || 1);
        const proofReportSha256 = prompt.match(/"proofReportSha256":\s*"([^"]+)"/)?.[1] || '';
        return JSON.stringify({
          schemaVersion: 'spark-qa-operator-advisory-result.v1',
          generatedAt: new Date().toISOString(),
          slot,
          reviewerKind: 'llm_adapter',
          verdict: 'useful',
          proofReportSha256,
          focusId: `telegram-llm-slot-${slot}`,
          hypothesis: 'Use the Telegram-connected advisory provider to harden QA mutation policy.',
          failureFamilies: [`telegram_llm_failure_family_${slot}`],
          mutationRecommendations: [`Let advisory slot ${slot} recommend a proof-bound runtime policy change.`],
          reasoningFocus: ['keep Telegram self-improvement language tied to inspected proof'],
          toolUseExpectations: ['read proof manifest and mutation ledger before closure language'],
          recommendedGuards: [`telegram_llm_bridge_guard_${slot}`],
          riskNotes: ['provider output remains proof-bound and authority flags stay false'],
          scoreClaimAllowed: false,
          improvementClaimAllowed: false,
          public_ready: false,
          network_absorbable: false,
        }, null, 2);
      };

      const createCtx = fakeCtx('/sparkqa improve Spark QA Operator level 10 cycles 3 agents 2', { telegram: false });
      await handleSparkQaCommand(createCtx);
      const createReply = createCtx.replies.join('\n');
      assert.match(createReply, /Benchmark creator packet is staged/i);
      assert.match(createReply, /3 cycles with 2 advisory agents/i);
      assert.doesNotMatch(createReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const firstProofCtx = fakeCtx('/sparkqa run', { telegram: false });
      await handleSparkQaCommand(firstProofCtx);
      const firstProofReply = firstProofCtx.replies.join('\n');
      assert.match(firstProofReply, /Starting the fresh Spark QA benchmark\/autoloop proof/i);
      assert.match(firstProofReply, /would not claim an upgrade yet/i);
      assert.doesNotMatch(firstProofReply, /cleared the benchmark\/autoloop score gate|scoreClaimAllowed=true/i);

      const advisoryCtx = fakeCtx('/sparkqa qa advisory run agents 2', { telegram: false });
      await handleSparkQaCommand(advisoryCtx);
      const advisoryReply = advisoryCtx.replies.join('\n');
      assert.match(advisoryReply, /Spark QA Operator advisory agents ran through the advisory provider bridge/i);
      assert.match(advisoryReply, /2\/2 proof-bound results? accepted/i);
      assert.doesNotMatch(advisoryReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const proposalCtx = fakeCtx('/sparkqa qa mutation proposal', { telegram: false });
      await handleSparkQaCommand(proposalCtx);
      const proposalReply = proposalCtx.replies.join('\n');
      assert.match(proposalReply, /Spark QA Operator advisory mutation proposal is ready/i);
      assert.match(proposalReply, /runtime-policy adapter/i);
      assert.doesNotMatch(proposalReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const tickCtx = fakeCtx('/sparkqa improve Spark QA Operator tick', { telegram: false });
      await handleSparkQaCommand(tickCtx);
      const tickReply = tickCtx.replies.join('\n');
      assert.match(tickReply, /QA mutation is applied through the local runtime-policy adapter/i);
      assert.match(tickReply, /source-code mutation remains blocked until the source-patch adapter is ready/i);
      assert.match(tickReply, /Keep\/revert is waiting for a fresh proof after the QA runtime-policy adapter apply/i);
      assert.doesNotMatch(tickReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const activeJob = readActiveSparkQaBenchmarkJob(repo);
      assert.equal(activeJob.ok, true);
      assert.equal(activeJob.job?.requestedCycles, 3);
      assert.equal(activeJob.job?.advisoryAgents, 2);
      const applyPath = path.join(repo, '.spark-swarm', 'spark-qa-operator-evolution', 'mutation', activeJob.job?.jobId || '', 'mutation_apply.json');
      const applyPacket = JSON.parse(readFileSync(applyPath, 'utf-8'));
      assert.equal(applyPacket.mutationApplied, true);
      assert.equal(applyPacket.mutationAdapter.adapterKey, 'spark-qa-operator-runtime-policy-adapter');
      assert.match(String(applyPacket.sourcePatchReadiness?.path), /source_patch_adapter_readiness\.json$/);
      assert.match(String(applyPacket.sourcePatchCandidate?.path), /source_patch_candidate\.json$/);
      assert.match(String(applyPacket.sourcePatchValidation?.path), /source_patch_validation\.json$/);
      assert.equal(applyPacket.validation.allowedWritesRespected, true);
      assert.deepEqual(applyPacket.validation.forbiddenWritesTouched, []);
      assert.match(String(applyPacket.sourceCandidate?.path), /mutation_candidate\.json$/);
      assert.match(String(applyPacket.runtimePolicyProfile?.path), /runtime_policy_profile\.json$/);
      assert.match(String(applyPacket.target?.path), /runtime_policy_profile\.json$/);
      assert.equal(existsSync(String(applyPacket.runtimePolicyProfile?.path)), true);

      const secondProofCtx = fakeCtx('/sparkqa run', { telegram: false });
      await handleSparkQaCommand(secondProofCtx);
      const latestManifestPath = path.join(repo, '.spark-swarm', 'autoloop', 'latest_run.json');
      const manifest = JSON.parse(readFileSync(latestManifestPath, 'utf-8'));
      const report = JSON.parse(readFileSync(manifest.reportPath, 'utf-8'));
      const proofTime = Date.parse(report.generatedAt || report.run?.endedAt || '');
      const applyTime = Date.parse(applyPacket.generatedAt || '');
      if (!(proofTime > applyTime)) {
        const postApplyGeneratedAt = new Date(applyTime + 1000).toISOString();
        report.generatedAt = postApplyGeneratedAt;
        report.run = { ...(report.run || {}), endedAt: postApplyGeneratedAt };
        const proofText = `${JSON.stringify(report, null, 2)}\n`;
        writeFileSync(manifest.reportPath, proofText, 'utf-8');
        manifest.generatedAt = postApplyGeneratedAt;
        manifest.reportSha256 = createHash('sha256').update(proofText).digest('hex');
        writeFileSync(latestManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
      }

      const statusCtx = fakeCtx('/sparkqa improve Spark QA Operator status', { telegram: false });
      await handleSparkQaCommand(statusCtx);
      const statusReply = statusCtx.replies.join('\n');
      assert.match(statusReply, /Private QA cycle closure is recorded at 1\/3/i);
      assert.match(statusReply, /Score and improvement claims remain locked|Upgrade claims stay blocked/i);
      assert.doesNotMatch(statusReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const reasoningCtx = fakeCtx('/sparkqa qa reasoning trials', { telegram: false });
      await handleSparkQaCommand(reasoningCtx);
      const reasoningReply = reasoningCtx.replies.join('\n');
      assert.match(reasoningReply, /Spark QA Operator reasoning trials are written/i);
      assert.match(reasoningReply, /mutation guidance only/i);
      assert.doesNotMatch(reasoningReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const swarmCtx = fakeCtx('/sparkqa qa swarm-packet qa-e2e-smoke', { telegram: false });
      await handleSparkQaCommand(swarmCtx);
      const swarmReply = swarmCtx.replies.join('\n');
      assert.match(swarmReply, /Spark QA Operator private Spark Swarm packet is staged as qa-e2e-smoke/i);
      assert.match(swarmReply, /public_ready=false and network_absorbable=false/i);
      assert.match(swarmReply, /No score or improvement claim/i);
      assert.doesNotMatch(swarmReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);
    } finally {
      llm.isAvailable = oldIsAvailable;
      llm.chat = oldChat;
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldMaxAge === undefined) delete process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS;
      else process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS = oldMaxAge;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('sparkqa QA Operator cycle command runs one private self-improvement pass', async () => {
    const { readActiveSparkQaBenchmarkJob } = await import('../src/sparkQaOperator');
    const { llm } = await import('../src/llm');
    const repo = makeFakeStartupSparkQaCommandRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldMaxAge = process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS;
    const oldIsAvailable = llm.isAvailable;
    const oldChat = llm.chat;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS = String(3650 * 24 * 60 * 60 * 1000);
      llm.isAvailable = async () => true;
      llm.chat = async (prompt: string) => {
        const slot = Number(prompt.match(/"slot":\s*(\d+)/)?.[1] || 1);
        const proofReportSha256 = prompt.match(/"proofReportSha256":\s*"([^"]+)"/)?.[1] || '';
        return JSON.stringify({
          schemaVersion: 'spark-qa-operator-advisory-result.v1',
          generatedAt: new Date().toISOString(),
          slot,
          reviewerKind: 'llm_adapter',
          verdict: 'useful',
          proofReportSha256,
          focusId: `cycle-llm-slot-${slot}`,
          hypothesis: 'Run one Telegram-managed QA private cycle with proof-bound mutation advice.',
          failureFamilies: [`cycle_llm_failure_family_${slot}`],
          mutationRecommendations: [`Cycle slot ${slot} recommends one runtime policy hardening.`],
          reasoningFocus: ['keep cycle status separate from improvement claims'],
          toolUseExpectations: ['run fresh proof after applying the runtime policy profile'],
          recommendedGuards: [`cycle_llm_bridge_guard_${slot}`],
          riskNotes: ['cycle command cannot unlock score authority'],
          scoreClaimAllowed: false,
          improvementClaimAllowed: false,
          public_ready: false,
          network_absorbable: false,
        }, null, 2);
      };

      const createCtx = fakeCtx('/sparkqa improve Spark QA Operator level 10 cycles 2 agents 2', { telegram: false });
      await handleSparkQaCommand(createCtx);
      assert.match(createCtx.replies.join('\n'), /Benchmark creator packet is staged/i);

      const cycleCtx = fakeCtx('/sparkqa qa cycle run agents 2 cycles 2 runs 2', { telegram: false });
      await handleSparkQaCommand(cycleCtx);
      const cycleReply = cycleCtx.replies.join('\n');
      assert.match(cycleReply, /Telegram-managed private cycle/i);
      assert.match(cycleReply, /ran 2 Telegram-managed private cycle passes/i);
      assert.match(cycleReply, /advisory 2\/2 accepted/i);
      assert.match(cycleReply, /mutation applied/i);
      assert.match(cycleReply, /Private cycle closure is recorded at 2\/2/i);
      assert.match(cycleReply, /Passes advanced: 1\/2, 2\/2/i);
      assert.match(cycleReply, /Reasoning trials: 3/i);
      assert.match(cycleReply, /private Swarm packet: (?:ready for private swarm review|waiting on proof closure)/i);
      assert.match(cycleReply, /Telegram cycle registry is completed: 2\/2/i);
      assert.match(cycleReply, /No score, reasoning-improvement, public readiness, or network absorption claim/i);
      assert.doesNotMatch(cycleReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|improvement claim is allowed/i);

      const cycleStatusCtx = fakeCtx('/sparkqa qa cycle status', { telegram: false });
      await handleSparkQaCommand(cycleStatusCtx);
      const cycleStatusReply = cycleStatusCtx.replies.join('\n');
      assert.match(cycleStatusReply, /Telegram cycle registry is completed: 2\/2/i);
      assert.match(cycleStatusReply, /No score, reasoning-improvement, public readiness, or network absorption claim/i);

      const activeJob = readActiveSparkQaBenchmarkJob(repo);
      assert.equal(activeJob.job?.requestedCycles, 2);
      assert.equal(activeJob.job?.advisoryAgents, 2);
    } finally {
      llm.isAvailable = oldIsAvailable;
      llm.chat = oldChat;
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldMaxAge === undefined) delete process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS;
      else process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS = oldMaxAge;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('sparkqa benchmark create command stages resumable workboard from Telegram', async () => {
    const { readActiveSparkQaBenchmarkJob } = await import('../src/sparkQaOperator');
    const repo = makeFakeStartupSparkQaCommandRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';

      const ctx = fakeCtx('/sparkqa benchmark create Spark QA Operator level 10', { telegram: false });
      await handleSparkQaCommand(ctx);
      const reply = ctx.replies.join('\n');
      assert.match(reply, /Benchmark creator packet is staged/i);
      assert.match(reply, /level 10/i);
      assert.match(reply, /workboard and Kanban tickets/i);
      assert.match(reply, /not an agent score/i);
      assert.match(reply, /local\/private/i);
      assert.doesNotMatch(reply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);

      const activeJob = readActiveSparkQaBenchmarkJob(repo);
      assert.equal(activeJob.ok, true);
      assert.equal(activeJob.job?.level, 10);
      assert.equal(activeJob.job?.specializationAdapterKey, 'spark-qa-operator');
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('sparkqa Startup Bench improve command cold-starts proof-backed Telegram loop', async () => {
    const { readActiveSparkQaBenchmarkJob, readLatestSparkQaAutoloopRound } = await import('../src/sparkQaOperator');
    const { llm } = await import('../src/llm');
    const repo = makeFakeStartupSparkQaCommandRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupYcRepo = makeFakeStartupYcRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldStartupYc = process.env.SPARK_STARTUP_YC_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    const oldChatProvider = process.env.SPARK_CHAT_LLM_PROVIDER;
    const oldProvider = process.env.LLM_PROVIDER;
    const oldSparkProvider = process.env.SPARK_LLM_PROVIDER;
    const oldImplicitProvider = process.env.SPARK_ALLOW_IMPLICIT_LLM_PROVIDER;
    const oldChat = llm.chat;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_YC_REPO = startupYcRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';
      process.env.SPARK_CHAT_LLM_PROVIDER = 'disabled-for-test';
      process.env.LLM_PROVIDER = 'disabled-for-test';
      process.env.SPARK_LLM_PROVIDER = 'disabled-for-test';
      process.env.SPARK_ALLOW_IMPLICIT_LLM_PROVIDER = '0';

      const presetCtx = fakeCtx('/sparkqa startup intelligence smoke level 9 agents 1 dry-run apply', { telegram: false });
      await handleSparkQaCommand(presetCtx);
      const presetReply = presetCtx.replies.join('\n');
      assert.match(presetReply, /Startup Intelligence lab/i);
      assert.match(presetReply, /0\/1|1\/1/);
      assert.match(presetReply, /Apply policy: dry run/i);
      assert.match(presetReply, /Startup YC absorption background run is blocked/i);
      assert.match(presetReply, /No score|not a score claim/i);
      assert.doesNotMatch(presetReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);
      const presetRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      const presetJob = presetRegistry.jobs['telegram:8319079055'];
      assert.equal(presetJob?.requestedCycles, 1);
      assert.equal(presetJob?.benchmarkLevel, 9);
      assert.equal(presetJob?.agentReviewers, 1);
      assert.equal(presetJob?.runConfig?.applyPolicy, 'dry_run');
      assert.equal(presetJob?.runConfig?.startupIntelligenceUpdates, true);
      assert.equal(presetJob?.runConfig?.absorptionPolicy.command, '/sparkqa startup intelligence absorption agents cases 20');
      assert.equal(presetJob?.runConfig?.stopCriteria.stopOnCandidateReviewRequired, true);
      assert.equal(presetJob?.scoreClaimAllowed, false);
      assert.equal(presetJob?.network_absorbable, false);
      const presetAbsorptionRegistry = await readSparkQaStartupIntelligenceAbsorptionBackgroundRegistry(repo);
      const presetAbsorptionJob = presetAbsorptionRegistry.jobs['telegram:8319079055'];
      assert.equal(presetAbsorptionJob?.status, 'blocked');
      assert.equal(presetAbsorptionJob?.caseLimit, 20);
      assert.equal(presetAbsorptionJob?.agentReviewers, 1);
      assert.equal(presetAbsorptionJob?.scoreClaimAllowed, false);
      assert.equal(presetAbsorptionJob?.network_absorbable, false);

      const ctx = fakeCtx('/sparkqa improve startup-bench level 10 cycles 100 agents 5');
      await handleSparkQaCommand(ctx);
      await waitForReplies(ctx, 4);
      const reply = ctx.replies.join('\n');
      assert.match(reply, /Startup Bench improvement/i);
      assert.match(reply, /created the level 10 Startup Bench benchmark pack and ran the first fresh proof/i);
      assert.match(reply, /Full-suite learning map is attached|Suite-first learning map is attached/i);
      assert.match(reply, /5 advisory agents/i);
      assert.match(reply, /Background worker is active/i);
      assert.match(reply, /Progress: 0\/100 cycles/i);
      assert.match(reply, /Lab shape: level 10, 5 advisory agents/i);
      assert.match(reply, /Stage: (keep\/revert|fresh proof|ready for next tick|candidate ready|advisory review)/i);
      assert.match(reply, /Next: \/sparkqa improve startup-bench tick/i);
      assert.match(reply, /I will keep this running in the background and post proof-backed progress here/);
      assert.match(reply, /Startup Bench ran the real TheStartupBench baseline and tool-script proof/i);
      assert.match(reply, /private cycle closed from fresh proof|Private cycle closure is clean/i);
      assert.match(reply, /Spark One\/Spark Swarm private export artifacts are attached/i);
      assert.match(reply, /no score or improvement claim|scoring still depend/i);
      assert.doesNotMatch(reply, /score-claim ready|cleared the benchmark\/autoloop score gate|scoreClaimAllowed=true/i);
      const backgroundRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      const backgroundJob = backgroundRegistry.jobs['telegram:8319079055'];
      assert.ok(backgroundJob);
      assert.equal(backgroundJob.requestedCycles, 100);
      assert.equal(backgroundJob.benchmarkLevel, 10);
      assert.equal(backgroundJob.agentReviewers, 5);
      assert.equal(backgroundJob.runConfig?.startupIntelligenceUpdates, false);
      assert.match(String(backgroundJob.progress?.cycleStage || ''), /keep_revert|fresh_proof|ready_next_tick|candidate_ready|advisory_review/);
      assert.equal(backgroundJob.scoreClaimAllowed, false);
      assert.equal(backgroundJob.public_ready, false);

      const activeJob = readActiveSparkQaBenchmarkJob(repo);
      assert.equal(activeJob.ok, true);
      assert.equal(activeJob.job?.specializationAdapterKey, 'startup-bench');
      assert.equal(activeJob.job?.level, 10);
      const latestProof = await readLatestSparkQaAutoloopRound(repo);
      assert.equal(latestProof.ok, true);
      assert.equal(latestProof.report?.schemaVersion, 'spark-startup-bench-proof-adapter.v1');
      assert.equal(latestProof.report?.promotionDossier?.scoreClaimAllowed, false);

      const statusCtx = fakeCtx('/sparkqa improve startup-bench status', { telegram: false });
      await handleSparkQaCommand(statusCtx);
      const statusReply = statusCtx.replies.join('\n');
      assert.match(statusReply, /1\/100 cycles complete/i);
      assert.match(statusReply, /next: \/sparkqa improve startup-bench tick/i);
      assert.match(statusReply, /private cycle closed from fresh proof|Private cycle closure is clean/i);
      assert.match(statusReply, /Spark One\/Spark Swarm private export artifacts are attached/i);
      assert.match(statusReply, /no score or improvement claim/i);
      assert.match(statusReply, /Background worker/i);
      assert.match(statusReply, /Progress: 1\/100 cycles/i);
      assert.match(statusReply, /Stage: (keep\/revert|fresh proof|ready for next tick|candidate ready|advisory review)/i);
      assert.match(statusReply, /Next: \/sparkqa improve startup-bench tick/i);
      assert.doesNotMatch(statusReply, /sha256|\/var\/folders|scoreClaimAllowed=true/i);

      const loopCtx = fakeCtx('/sparkqa loop', { telegram: false });
      await handleSparkQaCommand(loopCtx);
      const loopReply = loopCtx.replies.join('\n');
      assert.match(loopReply, /Startup Bench loop/i);
      assert.match(loopReply, /Background worker/i);
      assert.match(loopReply, /Stage: (keep\/revert|fresh proof|ready for next tick|candidate ready|advisory review)/i);
      assert.doesNotMatch(loopReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);

      const intelligenceCtx = fakeCtx('/sparkqa startup intelligence status', { telegram: false });
      await handleSparkQaCommand(intelligenceCtx);
      const intelligenceReply = intelligenceCtx.replies.join('\n');
      assert.match(intelligenceReply, /Startup Intelligence lab/i);
      assert.match(intelligenceReply, /Startup YC absorption standard|validated-pack/i);
      assert.match(intelligenceReply, /private state packet and kanban/i);
      assert.match(intelligenceReply, /not a score claim|No score/i);
      assert.doesNotMatch(intelligenceReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);
      const startupIntelligencePacketPath = path.join(repo, '.spark-swarm', 'startup-intelligence', 'startup_intelligence_state.json');
      assert.equal(existsSync(startupIntelligencePacketPath), true);
      const startupIntelligencePacket = JSON.parse(readFileSync(startupIntelligencePacketPath, 'utf-8'));
      assert.equal(startupIntelligencePacket.schemaVersion, 'spark-startup-intelligence-loop.v1');
      assert.equal(startupIntelligencePacket.startupBenchmark.primaryExam, 'startup-bench');
      assert.equal(startupIntelligencePacket.startupBenchmark.doctrineLane, 'startup-yc');
      assert.equal(startupIntelligencePacket.absorptionStandard.protocol, 'no_pack_vs_pack_vs_validated_pack');
      assert.equal(startupIntelligencePacket.scoreClaimAllowed, false);
      assert.equal(startupIntelligencePacket.network_absorbable, false);

      const absorptionCtx = fakeCtx('/sparkqa startup intelligence absorption bundle cases 20', { telegram: false });
      await handleSparkQaCommand(absorptionCtx);
      const absorptionReply = absorptionCtx.replies.join('\n');
      assert.match(absorptionReply, /Startup YC absorption bundles are ready/i);
      assert.match(absorptionReply, /no-pack, pack, and validated-pack/i);
      assert.match(absorptionReply, /not a score/i);
      assert.doesNotMatch(absorptionReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);
      const absorptionProofPath = path.join(repo, '.spark-swarm', 'startup-intelligence', 'absorption', 'latest_absorption_proof.json');
      assert.equal(existsSync(absorptionProofPath), true);
      const absorptionProof = JSON.parse(readFileSync(absorptionProofPath, 'utf-8'));
      assert.equal(absorptionProof.schemaVersion, 'spark-startup-intelligence-absorption-proof.v1');
      assert.equal(absorptionProof.evidenceTier, 'bundle_export');
      assert.equal(absorptionProof.caseLimit, 20);
      assert.equal(absorptionProof.scoreClaimAllowed, false);
      assert.equal(absorptionProof.network_absorbable, false);

      const absorptionAgentsCtx = fakeCtx('/sparkqa startup intelligence absorption agents cases 20 reviewers 5', { telegram: false });
      await handleSparkQaCommand(absorptionAgentsCtx);
      const absorptionAgentsReply = absorptionAgentsCtx.replies.join('\n');
      assert.match(absorptionAgentsReply, /fresh-agent run did not start|provider was available/i);
      assert.match(absorptionAgentsReply, /Startup YC absorption background run is blocked/i);
      assert.match(absorptionAgentsReply, /5 passes per bundle requested/i);
      assert.doesNotMatch(absorptionAgentsReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|startup-mastery claim is allowed/i);
      const absorptionBackgroundPath = sparkQaStartupIntelligenceAbsorptionBackgroundRegistryPath(repo);
      assert.ok(absorptionBackgroundPath && existsSync(absorptionBackgroundPath));
      const absorptionBackground = await readSparkQaStartupIntelligenceAbsorptionBackgroundRegistry(repo);
      const absorptionJob = absorptionBackground.jobs['telegram:8319079055'];
      assert.equal(absorptionJob?.status, 'blocked');
      assert.equal(absorptionJob?.stage, 'provider_blocked');
      assert.equal(absorptionJob?.caseLimit, 20);
      assert.equal(absorptionJob?.agentReviewers, 5);
      assert.equal(absorptionJob?.scoreClaimAllowed, false);
      assert.equal(absorptionJob?.network_absorbable, false);

      const combinedIntelligenceCtx = fakeCtx('/sparkqa startup intelligence status', { telegram: false });
      await handleSparkQaCommand(combinedIntelligenceCtx);
      const combinedIntelligenceReply = combinedIntelligenceCtx.replies.join('\n');
      assert.match(combinedIntelligenceReply, /Startup Intelligence lab/i);
      assert.match(combinedIntelligenceReply, /Startup YC absorption background run is blocked/i);
      assert.match(combinedIntelligenceReply, /5 passes per bundle requested/i);
      assert.match(combinedIntelligenceReply, /absorption agents cases 20 reviewers 5/i);
      assert.doesNotMatch(combinedIntelligenceReply, /scoreClaimAllowed=true|startup-mastery claim is allowed|network_absorbable=true/i);

      const controlCtx = fakeCtx('/sparkqa startup control', { telegram: false });
      await handleSparkQaCommand(controlCtx);
      const controlReply = controlCtx.replies.join('\n');
      assert.match(controlReply, /Startup Intelligence control panel/i);
      assert.match(controlReply, /Startup Bench:/i);
      assert.match(controlReply, /Mutation\/advisory:/i);
      assert.match(controlReply, /Startup YC absorption:/i);
      assert.match(controlReply, /Mastery gate: locked/i);
      assert.match(controlReply, /Actions: /i);
      assert.match(controlReply, /Next safe step -> \/sparkqa /i);
      assert.match(controlReply, /Background worker/i);
      assert.match(controlReply, /Startup YC absorption background run is blocked/i);
      assert.doesNotMatch(controlReply, /scoreClaimAllowed=true|startup-mastery claim is allowed|network_absorbable=true/i);

      const controlRunCtx = fakeCtx('/sparkqa startup control run cycles 100 level 10 agents 5 proof-heavy', { telegram: false });
      await handleSparkQaCommand(controlRunCtx);
      const controlRunReply = controlRunCtx.replies.join('\n');
      assert.match(controlRunReply, /Startup Intelligence control run accepted/i);
      assert.match(controlRunReply, /level 10, 100 cycles, 5 advisory agents/i);
      assert.match(controlRunReply, /Advisory board: proof heavy/i);
      assert.match(controlRunReply, /Startup Intelligence lab/i);
      assert.match(controlRunReply, /Advisory board is proof heavy/i);
      assert.match(controlRunReply, /Background worker is active/i);
      assert.match(controlRunReply, /Advisory provider: sparkqa-local-advisory/i);
      assert.doesNotMatch(controlRunReply, /scoreClaimAllowed=true|startup-mastery claim is allowed|network_absorbable=true|public_ready=true/i);
      const controlRunRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      const controlRunJob = controlRunRegistry.jobs['telegram:8319079055'];
      assert.equal(controlRunJob?.requestedCycles, 100);
      assert.equal(controlRunJob?.benchmarkLevel, 10);
      assert.equal(controlRunJob?.agentReviewers, 5);
      assert.equal(controlRunJob?.runConfig?.startupIntelligenceUpdates, true);
      assert.equal(controlRunJob?.runConfig?.providerLabel, 'sparkqa-local-advisory');
      assert.equal(controlRunJob?.progress?.advisoryPersonaPreset, 'proof_heavy');

      const controlTickCtx = fakeCtx('/sparkqa startup control tick', { telegram: false });
      await handleSparkQaCommand(controlTickCtx);
      const controlTickReply = controlTickCtx.replies.join('\n');
      assert.match(controlTickReply, /Startup Intelligence control tick accepted/i);
      assert.match(controlTickReply, /running \/sparkqa /i);
      assert.match(controlTickReply, /Startup Bench improvement|Startup Intelligence lab|Startup YC absorption|Startup Bench advisory|Startup Bench mutation candidate|Benchmark-quality preflight/i);
      assert.doesNotMatch(controlTickReply, /scoreClaimAllowed=true|startup-mastery claim is allowed|network_absorbable=true|public_ready=true/i);

      const bridgeCtx = fakeCtx('/sparkqa startup intelligence bridge command-bridge', { telegram: false });
      await handleSparkQaCommand(bridgeCtx);
      const bridgeReply = bridgeCtx.replies.join('\n');
      assert.match(bridgeReply, /Startup Intelligence bridge packet is staged locally/i);
      assert.match(bridgeReply, /Labs-shaped creator intent, adapter map, autoloop policy/i);
      assert.match(bridgeReply, /public_ready=false and network_absorbable=false/i);
      assert.match(bridgeReply, /Absorption background worker: blocked, stage provider blocked/i);
      assert.match(bridgeReply, /no score, improvement, or startup-mastery claim/i);
      assert.doesNotMatch(bridgeReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);
      const bridgePacketPath = path.join(repo, '.spark-swarm', 'startup-intelligence', 'bridge', 'runs', 'command-bridge', 'startup_intelligence_bridge_packet.json');
      assert.equal(existsSync(bridgePacketPath), true);
      const bridgePacket = JSON.parse(readFileSync(bridgePacketPath, 'utf-8'));
      assert.equal(bridgePacket.schemaVersion, 'spark-startup-intelligence-swarm-bridge.v1');
      assert.equal(bridgePacket.public_ready, false);
      assert.equal(bridgePacket.network_absorbable, false);
      assert.equal(bridgePacket.publication.network_absorbable, false);
      assert.equal(bridgePacket.absorptionBackground.latestJob.stage, 'provider_blocked');
      assert.equal(bridgePacket.loopStatusPacket.absorptionBackground.latestJob.stage, 'provider_blocked');
      assert.equal(bridgePacket.commands.absorptionAgents, '/sparkqa startup intelligence absorption agents cases 20 reviewers 5');
      assert.equal(bridgePacket.commands.next, '/sparkqa startup intelligence absorption agents cases 20 reviewers 5');
      assert.equal(existsSync(bridgePacket.creatorRun.contributionPacketPath), true);

      const reviewersCtx = fakeCtx('/sparkqa reviewers', { telegram: false });
      await handleSparkQaCommand(reviewersCtx);
      const reviewersReply = reviewersCtx.replies.join('\n');
      assert.match(reviewersReply, /Startup Bench advisory agents/i);
      assert.match(reviewersReply, /\/sparkqa reviewers advisory run agents|\/sparkqa improve startup-bench tick|\/sparkqa reviewers advisory dispatch agents/i);
      assert.match(reviewersReply, /No human approval|Human sidecar handoff is still separate/i);
      assert.doesNotMatch(reviewersReply, /sha256|\/var\/folders|scoreClaimAllowed=true/i);

      const personaCtx = fakeCtx('/sparkqa reviewers personas proof heavy agents 5', { telegram: false });
      await handleSparkQaCommand(personaCtx);
      const personaReply = personaCtx.replies.join('\n');
      assert.match(personaReply, /advisory personas are set to proof heavy/i);
      assert.match(personaReply, /Proof Integrity Auditor/);
      assert.doesNotMatch(personaReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);

      let startupMutationPrompt = '';
      llm.chat = async (prompt: string) => {
        startupMutationPrompt = prompt;
        return JSON.stringify({
          hypothesis: 'The Startup Operator should add a proof-heavy runway checkpoint before sales-pressure execution.',
          targetBehavior: 'Before the sales pipeline update, re-check runway, proof freshness, and benchmark-gaming risk.',
          mutationStrategy: 'insert_checkpoint_before_sales_pipeline_update',
          insertBeforeToolName: 'sales.pipeline.update',
          toolName: 'metrics.report',
          focus: ['proof_integrity_artifact_freshness', 'benchmark_gaming_resistance'],
          expectedBenchmarkEffect: 'Better Startup Bench traces without scoring or heldout edits.',
          risks: ['Could over-focus on proof closure unless startup operating behavior also improves.'],
          keepCriteria: ['Fresh proof improves private movement without new blockers.'],
          revertCriteria: ['Fresh proof regresses or adds reconciliation blockers.'],
        });
      };
      const mutationProposalCtx = fakeCtx('/sparkqa mutation propose', { telegram: false });
      await handleSparkQaCommand(mutationProposalCtx);
      const mutationProposalReply = mutationProposalCtx.replies.join('\n');
      assert.match(mutationProposalReply, /Startup Bench mutation proposal is ready/i);
      assert.match(mutationProposalReply, /Spark LLM proposal accepted from spark-chat-llm/i);
      assert.match(mutationProposalReply, /Advisory board: proof heavy/i);
      assert.match(mutationProposalReply, /No score or improvement claim/i);
      assert.match(startupMutationPrompt, /Configured advisory persona board: preset=proof_heavy/);
      assert.match(startupMutationPrompt, /Board mutation instruction: Weight proof integrity/);
      assert.match(startupMutationPrompt, /Never weaken fresh proof/);
      assert.doesNotMatch(mutationProposalReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);

      const exportCtx = fakeCtx('/sparkqa export swarm-packet command-smoke', { telegram: false });
      await handleSparkQaCommand(exportCtx);
      const exportReply = exportCtx.replies.join('\n');
      assert.match(exportReply, /Spark Swarm private packet is staged/i);
      assert.match(exportReply, /command-smoke/i);
      assert.match(exportReply, /benchmark-round summar/i);
      assert.match(exportReply, /Telegram background worker: active, stage/i);
      assert.match(exportReply, /public_ready=false and network_absorbable=false/i);
      assert.match(exportReply, /No score or improvement claim/i);

      const stopCtx = fakeCtx('/sparkqa improve startup-bench stop', { telegram: false });
      await handleSparkQaCommand(stopCtx);
      const stopReply = stopCtx.replies.join('\n');
      assert.match(stopReply, /Startup Bench improvement is paused|score and improvement claims stay locked/i);
      assert.match(stopReply, /\/sparkqa improve startup-bench resume/i);
      assert.match(stopReply, /Background worker is paused\..*Resume with \/sparkqa improve startup-bench resume/i);
      const stoppedRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      assert.equal(stoppedRegistry.jobs['telegram:8319079055']?.status, 'paused');

      const resumeCtx = fakeCtx('/sparkqa improve startup-bench resume', { telegram: false });
      await handleSparkQaCommand(resumeCtx);
      const resumeReply = resumeCtx.replies.join('\n');
      assert.match(resumeReply, /Startup Bench improvement/i);
      assert.match(resumeReply, /5 advisory agents/i);
      assert.match(resumeReply, /1\/100 cycles complete/i);
      assert.match(resumeReply, /Background worker is active/i);
      assert.doesNotMatch(resumeReply, /scoreClaimAllowed=true/i);
      const resumedRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      const resumedJob = resumedRegistry.jobs['telegram:8319079055'];
      assert.equal(resumedJob?.status, 'active');
      assert.equal(resumedJob?.requestedCycles, 100);
      assert.equal(resumedJob?.benchmarkLevel, 10);
      assert.equal(resumedJob?.agentReviewers, 5);
      const resumedTickCount = resumedJob?.progress?.tickCount || 0;

      const manualTickCtx = fakeCtx('/sparkqa improve startup-bench tick', { telegram: false });
      await handleSparkQaCommand(manualTickCtx);
      const manualTickReply = manualTickCtx.replies.join('\n');
      assert.match(manualTickReply, /Background worker is active|Background worker is stopped|Background worker has completed/i);
      const tickedRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      const tickedJob = tickedRegistry.jobs['telegram:8319079055'];
      assert.ok((tickedJob?.progress?.tickCount || 0) > resumedTickCount);
      assert.equal(tickedJob?.progress?.lastStateStatus, tickedJob?.lastStateStatus);
      assert.equal(tickedJob?.progress?.lastNextCommand, tickedJob?.lastNextCommand);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldStartupBench === undefined) delete process.env.SPARK_STARTUP_BENCH_REPO;
      else process.env.SPARK_STARTUP_BENCH_REPO = oldStartupBench;
      if (oldStartupOperator === undefined) delete process.env.SPARK_STARTUP_OPERATOR_REPO;
      else process.env.SPARK_STARTUP_OPERATOR_REPO = oldStartupOperator;
      if (oldStartupYc === undefined) delete process.env.SPARK_STARTUP_YC_REPO;
      else process.env.SPARK_STARTUP_YC_REPO = oldStartupYc;
      if (oldSidecarRequired === undefined) delete process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
      else process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = oldSidecarRequired;
      if (oldChatProvider === undefined) delete process.env.SPARK_CHAT_LLM_PROVIDER;
      else process.env.SPARK_CHAT_LLM_PROVIDER = oldChatProvider;
      if (oldProvider === undefined) delete process.env.LLM_PROVIDER;
      else process.env.LLM_PROVIDER = oldProvider;
      if (oldSparkProvider === undefined) delete process.env.SPARK_LLM_PROVIDER;
      else process.env.SPARK_LLM_PROVIDER = oldSparkProvider;
      if (oldImplicitProvider === undefined) delete process.env.SPARK_ALLOW_IMPLICIT_LLM_PROVIDER;
      else process.env.SPARK_ALLOW_IMPLICIT_LLM_PROVIDER = oldImplicitProvider;
      llm.chat = oldChat;
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
      rmSync(startupYcRepo, { recursive: true, force: true });
    }
  });

  await test('startup absorption background status reads live agent progress', async () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'spark-qa-absorption-background-'));
    try {
      const chatKey = 'telegram:8319079055';
      const chatId = 8319079055;
      await recordSparkQaStartupIntelligenceAbsorptionBackgroundJob({
        repoRoot: repo,
        chatKey,
        chatId,
        status: 'active',
        caseLimit: 2,
        providerLabel: 'test-provider',
      });
      const progressPath = path.join(
        repo,
        '.spark-swarm',
        'startup-intelligence',
        'absorption',
        'runs',
        'run-progress',
        'fresh_agent_submission_generation.json',
      );
      mkdirSync(path.dirname(progressPath), { recursive: true });
      writeFileSync(progressPath, JSON.stringify({
        schemaVersion: 'spark-startup-intelligence-absorption-agent-submissions.v1',
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'running',
        runId: 'run-progress',
        providerLabel: 'test-provider',
        agentReviewers: 2,
        requestedBundles: 6,
        processedBundles: 3,
        acceptedBundles: 2,
        requestedAgentRuns: 12,
        processedAgentRuns: 7,
        acceptedAgentRuns: 5,
        currentBundle: {
          index: 4,
          bundleId: 'yc_absorb_002_validated_pack',
          caseId: 'yc_absorb_002',
          mode: 'validated_pack',
          agentSlot: 2,
        },
        failedBundles: [],
        submissionPaths: [],
        rawOutputPaths: [],
        reportPath: progressPath,
        countsAsHumanApproval: false,
        scoreClaimAllowed: false,
        improvementClaimAllowed: false,
        public_ready: false,
        network_absorbable: false,
      }, null, 2), 'utf-8');

      const registry = await readSparkQaStartupIntelligenceAbsorptionBackgroundRegistry(repo);
      const job = registry.jobs[chatKey];
      assert.equal(job?.processedBundles, 3);
      assert.equal(job?.acceptedBundles, 2);
      assert.equal(job?.requestedBundles, 6);
      assert.equal(job?.agentReviewers, 2);
      assert.equal(job?.processedAgentRuns, 7);
      assert.equal(job?.acceptedAgentRuns, 5);
      assert.equal(job?.requestedAgentRuns, 12);
      assert.equal(job?.currentBundle?.mode, 'validated_pack');
      assert.equal(job?.currentBundle?.agentSlot, 2);
      assert.equal(job?.stage, 'fresh_agent_running');
      const reply = renderSparkQaStartupIntelligenceAbsorptionBackgroundStatus(registry, chatKey) || '';
      assert.match(reply, /Stage: fresh-agent running/i);
      assert.match(reply, /3\/6 processed/i);
      assert.match(reply, /2\/6 accepted/i);
      assert.match(reply, /7\/12 processed/i);
      assert.match(reply, /5\/12 accepted/i);
      assert.match(reply, /yc_absorb_002_validated_pack/i);
      assert.match(reply, /agent 2/i);
      assert.match(reply, /local\/private: no score/i);
      assert.doesNotMatch(reply, /scoreClaimAllowed=true|startup-mastery claim is allowed|network_absorbable=true/i);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('sparkqa Startup Bench improve preserves one advisory agent selection', async () => {
    const { readActiveSparkQaBenchmarkJob } = await import('../src/sparkQaOperator');
    const repo = makeFakeStartupSparkQaCommandRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    const oldChatProvider = process.env.SPARK_CHAT_LLM_PROVIDER;
    const oldProvider = process.env.LLM_PROVIDER;
    const oldSparkProvider = process.env.SPARK_LLM_PROVIDER;
    const oldImplicitProvider = process.env.SPARK_ALLOW_IMPLICIT_LLM_PROVIDER;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';
      process.env.SPARK_CHAT_LLM_PROVIDER = 'disabled-for-test';
      process.env.LLM_PROVIDER = 'disabled-for-test';
      process.env.SPARK_LLM_PROVIDER = 'disabled-for-test';
      process.env.SPARK_ALLOW_IMPLICIT_LLM_PROVIDER = '0';

      const ctx = fakeCtx('/sparkqa improve startup-bench level 5 cycles 7 agents 1', { telegram: false });
      await handleSparkQaCommand(ctx);
      const reply = ctx.replies.join('\n');
      assert.match(reply, /Startup Bench improvement/i);
      assert.match(reply, /level 5 Startup Bench benchmark pack/i);
      assert.match(reply, /1 advisory agent\b/i);
      assert.doesNotMatch(reply, /5 advisory agents|run agents 5/i);
      assert.doesNotMatch(reply, /level 10/i);
      assert.doesNotMatch(reply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);

      const registry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      const job = registry.jobs['telegram:8319079055'];
      assert.equal(job?.requestedCycles, 7);
      assert.equal(job?.benchmarkLevel, 5);
      assert.equal(job?.agentReviewers, 1);
      assert.equal(job?.scoreClaimAllowed, false);

      const dispatchCtx = fakeCtx('/sparkqa reviewers advisory dispatch', { telegram: false });
      await handleSparkQaCommand(dispatchCtx);
      const dispatchReply = dispatchCtx.replies.join('\n');
      assert.match(dispatchReply, /0\/1 results are back/i);
      assert.doesNotMatch(dispatchReply, /0\/5|run agents 5/i);

      const statusCtx = fakeCtx('/sparkqa improve startup-bench status', { telegram: false });
      await handleSparkQaCommand(statusCtx);
      const statusReply = statusCtx.replies.join('\n');
      assert.match(statusReply, /1 advisory agent\b/i);
      assert.doesNotMatch(statusReply, /5 advisory agents|run agents 5/i);
      assert.doesNotMatch(statusReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/i);

      const relevelCtx = fakeCtx('/sparkqa improve startup-bench level 10 cycles 8 agents 1', { telegram: false });
      await handleSparkQaCommand(relevelCtx);
      const relevelReply = relevelCtx.replies.join('\n');
      assert.match(relevelReply, /Startup Bench improvement/i);
      assert.match(relevelReply, /level 10 Startup Bench benchmark pack/i);
      assert.match(relevelReply, /1 advisory agent\b/i);
      assert.doesNotMatch(relevelReply, /level 5 Startup Bench benchmark pack/i);
      assert.doesNotMatch(relevelReply, /5 advisory agents|run agents 5|scoreClaimAllowed=true/i);
      const relevelRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      const relevelJob = relevelRegistry.jobs['telegram:8319079055'];
      assert.equal(relevelJob?.requestedCycles, 8);
      assert.equal(relevelJob?.benchmarkLevel, 10);
      assert.equal(relevelJob?.agentReviewers, 1);
      assert.equal(readActiveSparkQaBenchmarkJob(repo).job?.level, 10);

      const stopCtx = fakeCtx('/sparkqa improve startup-bench stop', { telegram: false });
      await handleSparkQaCommand(stopCtx);
      const resumeCtx = fakeCtx('/sparkqa improve startup-bench resume', { telegram: false });
      await handleSparkQaCommand(resumeCtx);
      const resumeReply = resumeCtx.replies.join('\n');
      assert.match(resumeReply, /1 advisory agent\b/i);
      assert.doesNotMatch(resumeReply, /5 advisory agents|run agents 5/i);
      const resumedRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      assert.equal(resumedRegistry.jobs['telegram:8319079055']?.agentReviewers, 1);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldStartupBench === undefined) delete process.env.SPARK_STARTUP_BENCH_REPO;
      else process.env.SPARK_STARTUP_BENCH_REPO = oldStartupBench;
      if (oldStartupOperator === undefined) delete process.env.SPARK_STARTUP_OPERATOR_REPO;
      else process.env.SPARK_STARTUP_OPERATOR_REPO = oldStartupOperator;
      if (oldSidecarRequired === undefined) delete process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
      else process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = oldSidecarRequired;
      if (oldChatProvider === undefined) delete process.env.SPARK_CHAT_LLM_PROVIDER;
      else process.env.SPARK_CHAT_LLM_PROVIDER = oldChatProvider;
      if (oldProvider === undefined) delete process.env.LLM_PROVIDER;
      else process.env.LLM_PROVIDER = oldProvider;
      if (oldSparkProvider === undefined) delete process.env.SPARK_LLM_PROVIDER;
      else process.env.SPARK_LLM_PROVIDER = oldSparkProvider;
      if (oldImplicitProvider === undefined) delete process.env.SPARK_ALLOW_IMPLICIT_LLM_PROVIDER;
      else process.env.SPARK_ALLOW_IMPLICIT_LLM_PROVIDER = oldImplicitProvider;
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('startup improvement background parks during long stability wait', async () => {
    const nowMs = Date.now();
    const nextEligibleAt = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();
    assert.equal(shouldStopSparkQaStartupImprovementBackground({
      status: 'ready_for_next_tick',
      nextCommand: '/sparkqa stability queue',
      stabilityResume: {
        status: 'waiting',
        nextEligibleAt,
        timeRemainingMs: 24 * 60 * 60 * 1000,
      },
    }), true);
    const parkedDecision = sparkQaStartupImprovementBackgroundStopDecision({
      status: 'ready_for_next_tick',
      nextCommand: '/sparkqa stability queue',
      stabilityResume: {
        status: 'waiting',
        nextEligibleAt,
        timeRemainingMs: 24 * 60 * 60 * 1000,
      },
    }, nowMs);
    assert.equal(parkedDecision.stop, true);
    assert.equal(parkedDecision.reason, 'waiting_stability');
    assert.ok(parkedDecision.wakeDelayMs && parkedDecision.wakeDelayMs > 0);
    assert.equal(shouldStopSparkQaStartupImprovementBackground({
      status: 'ready_for_next_tick',
      nextCommand: '/sparkqa run',
      stabilityResume: {
        status: 'eligible',
        timeRemainingMs: 0,
      },
    }), false);
    assert.equal(shouldStopSparkQaStartupImprovementBackground({ status: 'completed' }), true);
  });

  await test('startup improvement status refreshes stale background truth', async () => {
    assert.equal(shouldRefreshSparkQaStartupImprovementBackgroundJob({
      action: 'status',
      existingStatus: 'active',
      state: { status: 'completed' } as any,
    }), true);
    assert.equal(shouldRefreshSparkQaStartupImprovementBackgroundJob({
      action: 'status',
      existingStatus: 'completed',
      state: { status: 'completed' } as any,
    }), false);
    assert.equal(shouldRefreshSparkQaStartupImprovementBackgroundJob({
      action: 'status',
      existingStatus: 'active',
      state: {
        status: 'ready_for_next_tick',
        nextCommand: '/sparkqa run',
      } as any,
    }), false);
    assert.equal(shouldRefreshSparkQaStartupImprovementBackgroundJob({
      action: 'tick',
      existingStatus: 'active',
      state: {
        status: 'ready_for_next_tick',
        nextCommand: '/sparkqa run',
      } as any,
    }), true);
    assert.equal(shouldRefreshSparkQaStartupImprovementBackgroundJob({
      action: 'status',
      existingStatus: 'active',
      state: {
        status: 'ready_for_next_tick',
        nextCommand: '/sparkqa stability queue',
        stabilityResume: {
          status: 'waiting',
          nextEligibleAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          timeRemainingMs: 60 * 60 * 1000,
        },
      } as any,
    }), true);
  });

  await test('startup improvement background registry survives restart planning', async () => {
    const repo = mkdtempSync(path.join(tmpdir(), 'spark-qa-background-registry-'));
    try {
      const chatKey = 'telegram:8319079055';
      const chatId = 8319079055;
      const nextEligibleAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await recordSparkQaStartupImprovementBackgroundJob({
        repoRoot: repo,
        chatKey,
        chatId,
        status: 'waiting_stability',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
        state: {
          status: 'ready_for_next_tick',
          completedCycles: 2,
          nextReason: 'continue the private Startup Bench improvement loop',
          blockers: [],
          cycleLedger: {
            movementCycleCount: 1,
            plateauCycleCount: 1,
          },
          nextCommand: '/sparkqa stability queue',
          stabilityResume: {
            status: 'waiting',
            nextEligibleAt,
            timeRemainingMs: 60 * 60 * 1000,
          },
        } as any,
      });

      const registryPath = sparkQaStartupImprovementBackgroundRegistryPath(repo);
      assert.ok(registryPath && existsSync(registryPath));
      const registry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      assert.equal(registry.jobs[chatKey]?.status, 'waiting_stability');
      assert.equal(registry.jobs[chatKey]?.requestedCycles, 100);
      assert.equal(registry.jobs[chatKey]?.benchmarkLevel, 10);
      assert.equal(registry.jobs[chatKey]?.agentReviewers, 5);
      assert.equal(registry.jobs[chatKey]?.scoreClaimAllowed, false);
      assert.equal(registry.jobs[chatKey]?.public_ready, false);
      assert.equal(registry.jobs[chatKey]?.nextTickAt, nextEligibleAt);
      assert.equal(registry.jobs[chatKey]?.lease, null);
      assert.equal(registry.jobs[chatKey]?.progress?.phase, 'parked_stability');
      assert.equal(registry.jobs[chatKey]?.progress?.cycleStage, 'waiting_stability');
      assert.equal(registry.jobs[chatKey]?.completedCycles, 2);
      assert.equal(registry.jobs[chatKey]?.lastNextCommand, '/sparkqa stability queue');
      assert.equal(registry.jobs[chatKey]?.lastNextReason, 'continue the private Startup Bench improvement loop');
      assert.equal(registry.jobs[chatKey]?.movementCycleCount, 1);
      assert.equal(registry.jobs[chatKey]?.plateauCycleCount, 1);

      const parkedResume = await resumeSparkQaStartupImprovementBackgroundJobs({ sendMessage: async () => {} }, {
        repoRoot: repo,
        nowMs: Date.now(),
        scheduleTimers: false,
      });
      assert.equal(parkedResume.parked, 1);
      assert.equal(parkedResume.resumed, 0);
      assert.equal(parkedResume.scheduled, 0);

      await recordSparkQaStartupImprovementBackgroundJob({
        repoRoot: repo,
        chatKey,
        chatId,
        status: 'active',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
        startupIntelligenceUpdates: true,
      });
      let activeRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      assert.equal(activeRegistry.jobs[chatKey]?.lease?.state, 'held');
      assert.equal(activeRegistry.jobs[chatKey]?.progress?.phase, 'scheduled');
      assert.equal(activeRegistry.jobs[chatKey]?.progress?.cycleStage, 'scheduled');
      assert.equal(activeRegistry.jobs[chatKey]?.progress?.tickCount, 0);
      assert.equal(activeRegistry.jobs[chatKey]?.runConfig?.startupIntelligenceUpdates, true);
      assert.equal(sparkQaStartupImprovementBackgroundLeaseHealth(activeRegistry.jobs[chatKey]).stale, false);

      await recordSparkQaStartupImprovementBackgroundJob({
        repoRoot: repo,
        chatKey,
        chatId,
        status: 'active',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
        progressPhase: 'tick_start',
        tickStarted: true,
      });
      activeRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      assert.equal(activeRegistry.jobs[chatKey]?.lease?.state, 'held');
      assert.equal(activeRegistry.jobs[chatKey]?.progress?.phase, 'tick_start');
      assert.equal(activeRegistry.jobs[chatKey]?.progress?.cycleStage, 'starting_tick');
      assert.equal(activeRegistry.jobs[chatKey]?.progress?.tickCount, 1);
      assert.equal(activeRegistry.jobs[chatKey]?.runConfig?.applyPolicy, 'review_required');
      assert.equal(activeRegistry.jobs[chatKey]?.runConfig?.absorptionPolicy.command, '/sparkqa startup intelligence absorption agents cases 20 reviewers 5');
      assert.equal(activeRegistry.jobs[chatKey]?.runConfig?.stopCriteria.stopOnCandidateReviewRequired, true);

      await recordSparkQaStartupImprovementBackgroundJob({
        repoRoot: repo,
        chatKey,
        chatId,
        status: 'active',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
        state: {
          status: 'waiting_for_advisory',
          completedCycles: 2,
          nextCommand: '/sparkqa mutation candidate',
          nextReason: 'candidate is ready for review before guarded apply',
          blockers: [],
          lastWorkerMode: 'advisory_private_candidate_prepared',
          runConfig: {
            applyPolicy: 'review_required',
            mutationProposerLabel: 'test-startup-mutation-llm',
          },
        } as any,
      });
      activeRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      assert.equal(activeRegistry.jobs[chatKey]?.progress?.cycleStage, 'candidate_ready');
      assert.equal(activeRegistry.jobs[chatKey]?.progress?.lastWorkerMode, 'advisory_private_candidate_prepared');
      assert.equal(activeRegistry.jobs[chatKey]?.progress?.mutationProposerLabel, 'test-startup-mutation-llm');

      const rawRegistry = JSON.parse(readFileSync(String(registryPath), 'utf-8'));
      rawRegistry.jobs[chatKey].lease.expiresAt = new Date(Date.now() - 1000).toISOString();
      rawRegistry.jobs[chatKey].lease.heartbeatAt = new Date(Date.now() - 5000).toISOString();
      writeFileSync(String(registryPath), JSON.stringify(rawRegistry, null, 2), 'utf-8');
      const staleRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      assert.equal(sparkQaStartupImprovementBackgroundLeaseHealth(staleRegistry.jobs[chatKey]).stale, true);

      const futureResume = await resumeSparkQaStartupImprovementBackgroundJobs({ sendMessage: async () => {} }, {
        repoRoot: repo,
        scheduleTimers: false,
      });
      assert.equal(futureResume.resumed, 0);
      assert.equal(futureResume.scheduled, 1);
      assert.equal(futureResume.parked, 0);
      assert.equal(futureResume.stale, 1);

      rawRegistry.jobs[chatKey].nextTickAt = new Date(Date.now() - 1000).toISOString();
      writeFileSync(String(registryPath), JSON.stringify(rawRegistry, null, 2), 'utf-8');
      const activeResume = await resumeSparkQaStartupImprovementBackgroundJobs({ sendMessage: async () => {} }, {
        repoRoot: repo,
        scheduleTimers: false,
      });
      assert.equal(activeResume.resumed, 1);
      assert.equal(activeResume.parked, 0);
      assert.equal(activeResume.scheduled, 0);
      assert.equal(activeResume.stale, 1);

      await recordSparkQaStartupImprovementBackgroundJob({
        repoRoot: repo,
        chatKey,
        chatId,
        status: 'paused',
      });
      const pausedRegistry = await readSparkQaStartupImprovementBackgroundRegistry(repo);
      assert.equal(pausedRegistry.jobs[chatKey]?.lease?.state, 'released');
      assert.equal(pausedRegistry.jobs[chatKey]?.progress?.phase, 'paused');
      assert.equal(pausedRegistry.jobs[chatKey]?.progress?.cycleStage, 'paused');
      const pausedResume = await resumeSparkQaStartupImprovementBackgroundJobs({ sendMessage: async () => {} }, {
        repoRoot: repo,
        scheduleTimers: false,
      });
      assert.equal(pausedResume.skipped, 1);
      assert.equal(pausedResume.resumed, 0);
      assert.equal(pausedResume.scheduled, 0);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('recursive sessions report local Builder loops without Workspace credentials', async () => {
    const temp = mkdtempSync(path.join(tmpdir(), 'spark-recursive-local-'));
    const loopRoot = path.join(temp, 'loops');
    mkdirSync(loopRoot, { recursive: true });
    writeFileSync(path.join(loopRoot, 'domain-chip-creator.status.json'), JSON.stringify({
      chip_key: 'domain-chip-creator',
      rounds_completed: 1,
      total_rounds: 1,
      updated_at: '2026-05-08T13:53:36Z',
      history: [{
        round_index: 1,
        suggestions_count: 3,
        best_verdict: null,
        best_metric: 0
      }]
    }));

    const previousRoots = process.env.SPARK_RECURSIVE_LOCAL_STATUS_ROOTS;
    const previousWorkspaceId = process.env.SPARK_SWARM_WORKSPACE_ID;
    const previousAccessToken = process.env.SPARK_SWARM_ACCESS_TOKEN;
    const previousBuilderHome = process.env.SPARK_BUILDER_HOME;
    const previousBuilderRepo = process.env.SPARK_BUILDER_REPO;
    const previousDeployedWorkspaceId = process.env.SPARK_SWARM_DEPLOYED_WORKSPACE_ID;
    const previousDeployedAccessToken = process.env.SPARK_SWARM_DEPLOYED_ACCESS_TOKEN;
    const previousBearerToken = process.env.SPARK_SWARM_BEARER_TOKEN;
    process.env.SPARK_RECURSIVE_LOCAL_STATUS_ROOTS = loopRoot;
    process.env.SPARK_BUILDER_HOME = temp;
    process.env.SPARK_BUILDER_REPO = temp;
    delete process.env.SPARK_SWARM_WORKSPACE_ID;
    delete process.env.SPARK_SWARM_ACCESS_TOKEN;
    delete process.env.SPARK_SWARM_DEPLOYED_WORKSPACE_ID;
    delete process.env.SPARK_SWARM_DEPLOYED_ACCESS_TOKEN;
    delete process.env.SPARK_SWARM_BEARER_TOKEN;

    try {
      const sessionsCtx = fakeCtx('/recursive sessions');
      await handleRecursiveCommand(sessionsCtx);
      assert.match(sessionsCtx.replies.join('\n'), /Domain Chip Creator/);
      assert.match(sessionsCtx.replies.join('\n'), /Local\nstatus files on this machine/);
      assert.doesNotMatch(sessionsCtx.replies.join('\n'), /127\.0\.0\.1:4178/);

      const reportCtx = fakeCtx('/recursive report 1');
      await handleRecursiveCommand(reportCtx);
      assert.match(reportCtx.replies.join('\n'), /Latest Domain Chip Creator local run held steady\./);
      assert.match(reportCtx.replies.join('\n'), /Score\n• 1\/1 rounds\n• best score 0\n• 3 suggestions reviewed/);
      assert.match(reportCtx.replies.join('\n'), /Workspace\n• local-only mode/);

      const traceCtx = fakeCtx('/recursive trace 1');
      await handleRecursiveCommand(traceCtx);
      assert.match(traceCtx.replies.join('\n'), /Domain Chip Creator local trace/);
      assert.match(traceCtx.replies.join('\n'), /round 1: held steady, best score 0, 3 suggestions/);
    } finally {
      if (previousRoots === undefined) delete process.env.SPARK_RECURSIVE_LOCAL_STATUS_ROOTS;
      else process.env.SPARK_RECURSIVE_LOCAL_STATUS_ROOTS = previousRoots;
      if (previousWorkspaceId === undefined) delete process.env.SPARK_SWARM_WORKSPACE_ID;
      else process.env.SPARK_SWARM_WORKSPACE_ID = previousWorkspaceId;
      if (previousAccessToken === undefined) delete process.env.SPARK_SWARM_ACCESS_TOKEN;
      else process.env.SPARK_SWARM_ACCESS_TOKEN = previousAccessToken;
      if (previousBuilderHome === undefined) delete process.env.SPARK_BUILDER_HOME;
      else process.env.SPARK_BUILDER_HOME = previousBuilderHome;
      if (previousBuilderRepo === undefined) delete process.env.SPARK_BUILDER_REPO;
      else process.env.SPARK_BUILDER_REPO = previousBuilderRepo;
      if (previousDeployedWorkspaceId === undefined) delete process.env.SPARK_SWARM_DEPLOYED_WORKSPACE_ID;
      else process.env.SPARK_SWARM_DEPLOYED_WORKSPACE_ID = previousDeployedWorkspaceId;
      if (previousDeployedAccessToken === undefined) delete process.env.SPARK_SWARM_DEPLOYED_ACCESS_TOKEN;
      else process.env.SPARK_SWARM_DEPLOYED_ACCESS_TOKEN = previousDeployedAccessToken;
      if (previousBearerToken === undefined) delete process.env.SPARK_SWARM_BEARER_TOKEN;
      else process.env.SPARK_SWARM_BEARER_TOKEN = previousBearerToken;
      rmSync(temp, { recursive: true, force: true });
    }
  });

  await test('recursive command explains hosted workspace CLI-token read rejection', async () => {
    const server = createServer((req, res) => {
      if (req.url?.includes('/collective-snapshot')) {
        res.writeHead(401, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'authentication_required', message: 'authenticated session required' }));
        return;
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'not_found' }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');

    const previousApiUrl = process.env.SPARK_SWARM_API_URL;
    const previousWorkspaceId = process.env.SPARK_SWARM_WORKSPACE_ID;
    const previousAccessToken = process.env.SPARK_SWARM_ACCESS_TOKEN;
    process.env.SPARK_SWARM_API_URL = `http://127.0.0.1:${address.port}`;
    process.env.SPARK_SWARM_WORKSPACE_ID = 'ws_test_recursive';
    process.env.SPARK_SWARM_ACCESS_TOKEN = 'sscli_v1_test';

    try {
      const ctx = fakeCtx('/recursive report path_builder_chip_startup_yc');
      await handleRecursiveCommand(ctx);
      assert.match(ctx.replies.join('\n'), /Workspace rejected this agent token/);
      assert.match(ctx.replies.join('\n'), /CLI-token collective-snapshot support/);
    } finally {
      if (previousApiUrl === undefined) delete process.env.SPARK_SWARM_API_URL;
      else process.env.SPARK_SWARM_API_URL = previousApiUrl;
      if (previousWorkspaceId === undefined) delete process.env.SPARK_SWARM_WORKSPACE_ID;
      else process.env.SPARK_SWARM_WORKSPACE_ID = previousWorkspaceId;
      if (previousAccessToken === undefined) delete process.env.SPARK_SWARM_ACCESS_TOKEN;
      else process.env.SPARK_SWARM_ACCESS_TOKEN = previousAccessToken;
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  await test('recursive report accepts the numbered sessions picker', async () => {
    const server = createServer((req, res) => {
      if (req.url?.includes('/collective-snapshot')) {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          evolutionPaths: [
            {
              id: 'path-clear',
              scope: 'spark-intelligence-builder',
              specializationId: null,
              repoLabel: 'spark-intelligence-builder',
              summary: 'Clear builder loop',
              status: 'open',
              updatedAt: '2026-05-08T13:53:00Z'
            },
            {
              id: 'path-review',
              scope: 'startup-yc',
              specializationId: 'spec-yc',
              repoLabel: 'startup-yc',
              summary: 'Improve Startup YC on Startup Bench.',
              status: 'open',
              updatedAt: '2026-04-08T13:26:00Z'
            }
          ],
          specializations: [{ id: 'spec-yc', key: 'startup-yc', label: 'Startup YC' }],
          outcomes: [
            {
              id: 'out-review',
              targetType: 'evolution_path',
              targetId: 'path-review',
              verdict: 'flat',
              summary: 'Startup YC held steady.',
              metricName: 'scenario score',
              metricValue: 0.5,
              createdAt: '2026-05-08T13:46:00Z'
            }
          ],
          insights: [],
          masteries: [],
          artifactRefs: [],
          inbox: {
            items: [
              {
                id: 'decision-1',
                kind: 'rewrite_insight',
                title: 'Rewrite blocked insight',
                summary: 'Needs a rewrite.',
                targetType: 'evolution_path',
                targetId: 'path-review',
                specializationId: 'spec-yc',
                priority: 'high',
                recommendedAction: 'Rewrite in plain English.'
              }
            ]
          }
        }));
        return;
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'not_found' }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');

    const previousApiUrl = process.env.SPARK_SWARM_API_URL;
    const previousWorkspaceId = process.env.SPARK_SWARM_WORKSPACE_ID;
    const previousAccessToken = process.env.SPARK_SWARM_ACCESS_TOKEN;
    process.env.SPARK_SWARM_API_URL = `http://127.0.0.1:${address.port}`;
    process.env.SPARK_SWARM_WORKSPACE_ID = 'ws_test_recursive';
    process.env.SPARK_SWARM_ACCESS_TOKEN = 'sscli_v1_test';

    try {
      const ctx = fakeCtx('/recursive report 1');
      await handleRecursiveCommand(ctx);
      const reply = ctx.replies.join('\n');
      assert.match(reply, /Startup YC/);
      assert.match(reply, /Review\n• 1 decision waiting/);
      assert.doesNotMatch(reply, /Clear builder loop/);
    } finally {
      if (previousApiUrl === undefined) delete process.env.SPARK_SWARM_API_URL;
      else process.env.SPARK_SWARM_API_URL = previousApiUrl;
      if (previousWorkspaceId === undefined) delete process.env.SPARK_SWARM_WORKSPACE_ID;
      else process.env.SPARK_SWARM_WORKSPACE_ID = previousWorkspaceId;
      if (previousAccessToken === undefined) delete process.env.SPARK_SWARM_ACCESS_TOKEN;
      else process.env.SPARK_SWARM_ACCESS_TOKEN = previousAccessToken;
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  await test('recursive approve does not mutate unsupported Workspace decision targets', async () => {
    let mutationPosts = 0;
    const server = createServer((req, res) => {
      if (req.method === 'GET' && req.url?.includes('/collective-snapshot')) {
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({
          evolutionPaths: [
            {
              id: 'path_domain_autoloop_crypto_trading',
              scope: 'workspace',
              specializationId: null,
              repoLabel: 'domain-autoloop',
              summary: 'Crypto trading autoloop state synced.',
              status: 'open',
              bestOutcomeId: null,
              updatedAt: '2026-05-08T02:50:00.000Z'
            }
          ],
          insights: [],
          masteries: [],
          outcomes: [],
          artifactRefs: [],
          specializations: [],
          inbox: {
            items: [
              {
                id: 'inbox_domain_autoloop_review',
                kind: 'review_outcome',
                title: 'Review domain autoloop lane evidence',
                summary: 'Needs Workspace review before any promotion.',
                targetType: 'evolution_path',
                targetId: 'path_domain_autoloop_crypto_trading',
                specializationId: null,
                repoId: null,
                priority: 'medium',
                recommendedAction: 'Open Workspace Decisions and inspect lane artifacts.'
              }
            ]
          }
        }));
        return;
      }
      if (req.method === 'POST') {
        mutationPosts += 1;
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ error: 'unexpected_mutation' }));
        return;
      }
      res.writeHead(404, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ error: 'not_found' }));
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address === 'object');

    const previousApiUrl = process.env.SPARK_SWARM_API_URL;
    const previousWorkspaceId = process.env.SPARK_SWARM_WORKSPACE_ID;
    const previousAccessToken = process.env.SPARK_SWARM_ACCESS_TOKEN;
    const previousWebUrl = process.env.SPARK_SWARM_WEB_URL;
    process.env.SPARK_SWARM_API_URL = `http://127.0.0.1:${address.port}`;
    process.env.SPARK_SWARM_WORKSPACE_ID = 'ws_test_recursive';
    process.env.SPARK_SWARM_ACCESS_TOKEN = 'sscli_v1_test';
    process.env.SPARK_SWARM_WEB_URL = 'http://workspace.example.test';

    try {
      const ctx = fakeCtx('/recursive approve path_domain_autoloop_crypto_trading looks safe');
      await handleRecursiveCommand(ctx);
      const reply = ctx.replies.join('\n');
      assert.equal(mutationPosts, 0);
      assert.match(reply, /🟢 Recursive review approved\./);
      assert.match(reply, /Telegram recorded the decision route\./);
      assert.match(reply, /This item has to be handled in Workspace Decisions\./);
      assert.doesNotMatch(reply, /\/recursive report path_domain_autoloop_crypto_trading/);
      assert.match(reply, /http:\/\/workspace\.example\.test\/runs\?tab=decisions/);
      assert.doesNotMatch(reply, /Next:/);
      assert.doesNotMatch(reply, /workspace_route_only/);
    } finally {
      if (previousApiUrl === undefined) delete process.env.SPARK_SWARM_API_URL;
      else process.env.SPARK_SWARM_API_URL = previousApiUrl;
      if (previousWorkspaceId === undefined) delete process.env.SPARK_SWARM_WORKSPACE_ID;
      else process.env.SPARK_SWARM_WORKSPACE_ID = previousWorkspaceId;
      if (previousAccessToken === undefined) delete process.env.SPARK_SWARM_ACCESS_TOKEN;
      else process.env.SPARK_SWARM_ACCESS_TOKEN = previousAccessToken;
      if (previousWebUrl === undefined) delete process.env.SPARK_SWARM_WEB_URL;
      else process.env.SPARK_SWARM_WEB_URL = previousWebUrl;
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
