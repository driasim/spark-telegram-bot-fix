import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  buildSparkQaAutoloopRoundArgs,
  buildSparkQaBenchmarkCreatorArgs,
  buildSparkQaEvidenceAttestArgs,
  buildSparkQaEvidenceCapturePlanArgs,
  buildSparkQaEvidenceCaptureRunArgs,
  buildSparkQaEvidenceReviewQueueArgs,
  isSparkQaOperatorKey,
  parseSparkQaCommand,
  readActiveSparkQaBenchmarkJob,
  readLatestStartupBenchDossier,
  readLatestSparkQaAutoloopRound,
  readLatestSparkQaProofWorkflow,
  readSparkQaStartupBenchLoopStatus,
  readSparkQaStartupBenchReadiness,
  readSparkQaStartupBenchStability,
  renderSparkQaAutoloopRound,
  renderSparkQaBenchmarkGuide,
  renderSparkQaBenchmarkQualityAuto,
  renderSparkQaBenchmarkQualityAudit,
  renderSparkQaBenchmarkQualityRepair,
  renderSparkQaBenchmarkQualityRepairRun,
  renderSparkQaBenchmarkWorkboard,
  renderSparkQaBenchmarkCreator,
  renderSparkQaOperatorEvolutionWorker,
  renderSparkQaImprovementBoundary,
  renderSparkQaStartupBenchProofGates,
  renderSparkQaStartupBenchEvolutionPlan,
  renderSparkQaStartupBenchEvolutionWorker,
  renderSparkQaStartupBenchImprovementOrchestrator,
  renderSparkQaStartupIntelligenceControlPanel,
  renderSparkQaStartupIntelligenceLoop,
  renderSparkQaStartupIntelligenceAbsorption,
  renderSparkQaStartupIntelligenceSwarmBridge,
  renderSparkQaStartupBenchSparkOneExport,
  renderSparkQaStartupBenchSparkSwarmExport,
  renderSparkQaStartupBenchSuitePreflight,
  renderSparkQaStartupBenchSuiteRun,
  renderSparkQaStartupBenchReasoningEval,
  renderSparkQaStartupBenchReasoningTrials,
  renderSparkQaStartupBenchLoopStatus,
  renderSparkQaStartupBenchReadiness,
  renderSparkQaStartupBenchReviewerHandoff,
  renderSparkQaStartupBenchReviewerInvite,
  renderSparkQaStartupBenchReviewPolicy,
  renderSparkQaStartupBenchAdvisoryReviewPacket,
  renderSparkQaStartupBenchAdvisoryReviewRecord,
  renderSparkQaStartupBenchAdvisoryAgentDispatch,
  renderSparkQaStartupBenchAdvisoryAgentPersonaProfile,
  renderSparkQaStartupBenchAdvisoryAgentStatus,
  renderSparkQaStartupBenchAdvisoryAgentRun,
  renderSparkQaStartupBenchAdvisoryAgentIngest,
  renderSparkQaStartupBenchScoreReconciliation,
  renderSparkQaStartupBenchShowcase,
  renderSparkQaStartupBenchSwarmBridgeAudit,
  renderSparkQaStartupBenchMutationHandoff,
  renderSparkQaStartupBenchMutationPlan,
  renderSparkQaStartupBenchMutationProposal,
  renderSparkQaStartupBenchMutationCandidate,
  renderSparkQaStartupBenchMutationApply,
  renderSparkQaStartupBenchMutationRevert,
  renderSparkQaStartupBenchKeepRevertDecision,
  renderSparkQaStartupBenchSidecarAttestation,
  renderSparkQaStartupBenchSidecarReview,
  renderSparkQaStartupBenchStability,
  renderSparkQaStartupBenchStabilityQueue,
  renderStartupBenchDossier,
  renderSparkQaEvidenceAttestation,
  renderSparkQaEvidenceVerifiedBatchAttestation,
  renderSparkQaEvidenceCapture,
  renderSparkQaEvidenceCapturePlan,
  renderSparkQaEvidenceReviewQueue,
  renderSparkQaProofAuto,
  renderSparkQaProofWorkflow,
  renderSparkQaProofWorkflowStatus,
  renderSparkQaSpecializationAdapterReadiness,
  renderSparkQaSpecializationPaths,
  resolveSparkQaOperatorRepo,
  runSparkQaAutoloopRound,
  runSparkQaBenchmarkGuide,
  runSparkQaBenchmarkCreator,
  runSparkQaStartupBenchProofGates,
  runSparkQaStartupBenchSidecarAttestation,
  runSparkQaStartupBenchSidecarReview,
  runSparkQaEvidenceAttestation,
  runSparkQaEvidenceVerifiedBatchAttestation,
  runSparkQaEvidenceCapture,
  runSparkQaEvidenceCapturePlan,
  runSparkQaEvidenceReviewQueue,
  runSparkQaProofAuto,
  runSparkQaProofAutoTick,
  runSparkQaProofWorkflow,
  runSparkQaSpecializationAdapterReadiness,
  runSparkQaSpecializationPaths,
  runSparkQaBenchmarkQualityAuto,
  runSparkQaBenchmarkQualityRepair,
  syncSparkQaStartupBenchScoreReconciliation,
  syncSparkQaStartupBenchShowcase,
  syncSparkQaStartupBenchSwarmBridgeAudit,
  syncSparkQaStartupBenchMutationHandoff,
  syncSparkQaStartupBenchMutationPlan,
  syncSparkQaStartupBenchMutationProposal,
  syncSparkQaStartupBenchMutationCandidate,
  syncSparkQaStartupBenchMutationApply,
  syncSparkQaStartupBenchMutationRevert,
  syncSparkQaStartupBenchKeepRevertDecision,
  syncSparkQaStartupBenchReviewerHandoff,
  syncSparkQaStartupBenchReviewerInvite,
  syncSparkQaStartupBenchReviewPolicy,
  syncSparkQaStartupBenchAdvisoryReviewPacket,
  recordSparkQaStartupBenchAdvisoryReview,
  syncSparkQaStartupBenchAdvisoryAgentDispatch,
  syncSparkQaStartupBenchAdvisoryAgentPersonaProfile,
  readSparkQaStartupBenchAdvisoryAgentStatus,
  runSparkQaStartupBenchAdvisoryAgents,
  localSparkQaStartupBenchAdvisoryProvider,
  SPARK_QA_LOCAL_STARTUP_BENCH_ADVISORY_PROVIDER_LABEL,
  ingestSparkQaStartupBenchAdvisoryAgentResult,
  syncSparkQaStartupBenchStabilityQueue,
  syncSparkQaStartupBenchEvolutionPlan,
  syncSparkQaStartupBenchEvolutionWorker,
  syncSparkQaStartupBenchImprovementOrchestrator,
  syncSparkQaStartupIntelligenceControlPanel,
  syncSparkQaStartupIntelligenceLoop,
  syncSparkQaStartupIntelligenceAbsorption,
  syncSparkQaStartupIntelligenceSwarmBridge,
  syncSparkQaStartupBenchSparkOneExport,
  syncSparkQaStartupBenchSparkSwarmExport,
  syncSparkQaStartupBenchSuitePreflight,
  runSparkQaStartupBenchSuiteRun,
  syncSparkQaStartupBenchReasoningEval,
  syncSparkQaStartupBenchReasoningTrials,
  readSparkQaOperatorAdvisoryStatus,
  runSparkQaOperatorAdvisoryAgents,
  SPARK_QA_LOCAL_OPERATOR_ADVISORY_PROVIDER_LABEL,
  syncSparkQaOperatorAdvisoryDispatch,
  syncSparkQaOperatorMutationProposal,
  syncSparkQaOperatorReasoningTrials,
  syncSparkQaOperatorSwarmExport,
  syncSparkQaOperatorEvolutionWorker,
  syncSparkQaBenchmarkQualityAudit,
  syncSparkQaBenchmarkQualityRepair,
  syncSparkQaBenchmarkWorkboard,
} from '../src/sparkQaOperator';

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    throw error;
  }
}

function makeFakeSparkQaRepo(root = mkdtempSync(path.join(tmpdir(), 'spark-qa-operator-repo-'))): string {
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
    'parser.add_argument("--timeout-seconds", default="180")',
    'parser.add_argument("--cases", default="")',
    'parser.add_argument("--specialization-path", default="Spark QA Operator")',
    'parser.add_argument("--level", default="10")',
    'parser.add_argument("--prompt", default="")',
    'parser.add_argument("--output-dir", default="")',
    'parser.add_argument("--benchmark-pack", default="")',
    'parser.add_argument("--evidence-root", default="")',
    'parser.add_argument("--evidence-result", default="")',
    'parser.add_argument("--job-id", default="")',
    'parser.add_argument("--limit", default="")',
    'parser.add_argument("--include-existing", action="store_true")',
    'parser.add_argument("--case-id", default="")',
    'parser.add_argument("--decision", default="")',
    'parser.add_argument("--reviewer-id", default="")',
    'parser.add_argument("--reviewer-kind", default="telegram_admin")',
    'parser.add_argument("--notes", default="")',
    'parser.add_argument("--startup-bench-repo", default="")',
    'parser.add_argument("--startup-operator-repo", default="")',
    'parser.add_argument("--baseline-id", default="heuristic_resilient_operator")',
    'parser.add_argument("--seed", default="1")',
    'parser.add_argument("--seeds", default="")',
    'parser.add_argument("--max-turns", default="6")',
    'parser.add_argument("--scenario", default="")',
    'parser.add_argument("--tool-calls", default="")',
    'parser.add_argument("--python", default="")',
    'parser.add_argument("--stability-ledger", default="")',
    'parser.add_argument("--stability-minimum-elapsed-hours", default="24")',
    'parser.add_argument("--stability-max-delta-drift", default="0.001")',
    'parser.add_argument("--hidden-heldout-report", default="")',
    'parser.add_argument("--wrapper-raw-report", default="")',
    'parser.add_argument("--sidecar-review-report", default="")',
    'parser.add_argument("--score-reconciliation-report", default="")',
    'parser.add_argument("--proof-report", default="")',
    'parser.add_argument("--hidden-heldout-manifest", default="")',
    'parser.add_argument("--reviewer", action="append", default=[])',
    'parser.add_argument("--min-sealed-refs", default="12")',
    'parser.add_argument("--sidecar-required-reviewers", default="2")',
    'args = parser.parse_args()',
    'if args.hook == "autoloop-round":',
    '    if os.environ.get("SPARK_QA_FAKE_BAD_SUCCESS") == "1":',
    '        print(json.dumps({"promotionDossier": {"scoreClaimAllowed": True}}))',
    '        sys.exit(0)',
    '    out = pathlib.Path(args.output_root)',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    cases_path = pathlib.Path(args.cases) if args.cases else None',
    '    pack = json.loads(cases_path.read_text(encoding="utf-8")) if cases_path and cases_path.exists() else {}',
    '    cases_digest = hashlib.sha256(cases_path.read_bytes()).hexdigest() if cases_path and cases_path.exists() else ""',
    '    report = {',
    '        "schemaVersion": "spark-qa-autoloop-round-report.v1",',
    '        "run": {"status": "blocked", "endedAt": "2026-05-25T12:00:00Z"},',
    '        "inputs": {"casesPath": str(cases_path) if cases_path else "", "benchmarkPack": {"path": str(cases_path) if cases_path else "", "sha256": cases_digest, "id": pack.get("id")}},',
    '        "baselineCandidateDelta": {"baselineScore": 0.0, "candidateScore": 1.0, "delta": 1.0, "scoreClaimAllowed": False},',
    '        "captureReplay": {"passedCount": 4, "caseCount": 4},',
    '        "evidenceBenchmark": {"overallScore": 1.0},',
    '        "failureQueue": {"ticketCount": 8},',
    '        "promotionDossier": {"scoreClaimAllowed": False, "public_ready": False, "network_absorbable": False, "blockers": ["sidecar_review_not_clean"]},',
    '        "latestRunManifestPath": str(out.parent.parent / "latest_run.json")',
    '    }',
    '    text = json.dumps(report, indent=2, sort_keys=True) + "\\n"',
    '    report_path = out / "autoloop_round_report.json"',
    '    report_path.write_text(text, encoding="utf-8")',
    '    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()',
    '    (out.parent.parent / "latest_run.json").write_text(json.dumps({"reportPath": str(report_path), "outputRoot": str(out), "generatedAt": "2026-05-25T12:00:00Z", "reportSha256": digest}), encoding="utf-8")',
    '    print(json.dumps(report))',
    '    sys.exit(1)',
    'if args.hook == "startup-bench-proof-adapter":',
    '    out = pathlib.Path(args.output_dir)',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    report_path = out / "startup_bench_proof_report.json"',
    '    generated_at = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")',
    '    raw_seeds = [part.strip() for part in args.seeds.split(",") if part.strip()] if args.seeds else [args.seed]',
    '    seeds = []',
    '    for part in raw_seeds:',
    '        seed = int(part)',
    '        if seed not in seeds:',
    '            seeds.append(seed)',
    '    commands = []',
    '    artifacts = []',
    '    runs = []',
    '    run_roots = []',
    '    for seed in seeds:',
    '        seed_root = out / "runs" if len(seeds) == 1 else out / "runs" / ("seed-%d" % seed)',
    '        baseline_dir = seed_root / "baseline"',
    '        candidate_dir = seed_root / "candidate"',
    '        baseline_dir.mkdir(parents=True, exist_ok=True)',
    '        candidate_dir.mkdir(parents=True, exist_ok=True)',
    '        run_roots.append(str(seed_root))',
    '        baseline_id = "baseline-%d" % seed',
    '        candidate_id = "candidate-%d" % seed',
    '        (baseline_dir / "trace.json").write_text(json.dumps({"run_id": baseline_id}), encoding="utf-8")',
    '        (candidate_dir / "trace.json").write_text(json.dumps({"run_id": candidate_id}), encoding="utf-8")',
    '        (baseline_dir / "score_report.json").write_text(json.dumps({"run_id": baseline_id, "scenario_score": 0.64, "outcome_score": 0.64, "constraint_score": 1.0, "pass": True, "violations": []}), encoding="utf-8")',
    '        (candidate_dir / "score_report.json").write_text(json.dumps({"run_id": candidate_id, "scenario_score": 0.67, "outcome_score": 0.67, "constraint_score": 1.0, "pass": True, "violations": []}), encoding="utf-8")',
    '        prefix = "" if len(seeds) == 1 else "seed_%d_" % seed',
    '        commands.extend([{"name": prefix + "baseline", "exitCode": 0}, {"name": prefix + "candidate", "exitCode": 0}])',
    '        artifacts.extend([{"artifactType": prefix + "baseline_score_report"}, {"artifactType": prefix + "candidate_score_report"}])',
    '        runs.append({"seed": seed, "baseline": {"scenarioScore": 0.64}, "candidate": {"scenarioScore": 0.67}, "comparison": {"metric": "scenario_score", "candidateMinusBaseline": 0.03, "candidateBeatsBaseline": True}})',
    '    repeated = {"status": "seed_repeated" if len(runs) >= 2 else "single_seed_only", "requestedSeeds": seeds, "completedSeeds": len(runs), "minimumSeedsForStability": 2, "pass": len(runs) >= 2, "scoreClaimAllowed": False}',
    '    tool_calls_path = pathlib.Path(args.tool_calls) if args.tool_calls else pathlib.Path(args.startup_operator_repo) / "benchmarks" / "startup-operator.tool_calls.json"',
    '    tool_calls_sha = hashlib.sha256(tool_calls_path.read_bytes()).hexdigest() if tool_calls_path.exists() else ""',
    '    signature_payload = {"startupBenchRepo": args.startup_bench_repo, "startupOperatorRepo": args.startup_operator_repo, "toolCallsPath": str(tool_calls_path), "toolCallsSha256": tool_calls_sha, "seeds": seeds, "baselineId": args.baseline_id, "maxTurns": int(args.max_turns)}',
    '    signature_digest = hashlib.sha256(json.dumps(signature_payload, sort_keys=True).encode("utf-8")).hexdigest()',
    '    matching_previous = 0',
    '    if args.stability_ledger:',
    '        ledger_path = pathlib.Path(args.stability_ledger)',
    '        ledger_path.parent.mkdir(parents=True, exist_ok=True)',
    '        ledger = json.loads(ledger_path.read_text(encoding="utf-8")) if ledger_path.exists() else {"schemaVersion": "spark-startup-bench-wall-clock-stability-ledger.v1", "entries": []}',
    '        entries = ledger.get("entries", []) if isinstance(ledger.get("entries"), list) else []',
    '        matching_previous = len([entry for entry in entries if isinstance(entry, dict) and entry.get("signatureDigest") == signature_digest])',
    '        entries.append({"generatedAt": generated_at, "signatureDigest": signature_digest, "scenarioScoreDelta": 0.03, "scoreClaimAllowed": False})',
    '        ledger["entries"] = entries',
    '        ledger["updatedAt"] = generated_at',
    '        ledger["latestSignatureDigest"] = signature_digest',
    '        ledger_path.write_text(json.dumps(ledger), encoding="utf-8")',
    '    wall_clock = {"schemaVersion": "spark-startup-bench-wall-clock-stability.v1", "status": "waiting", "pass": False, "scoreClaimAllowed": False, "ledgerPath": args.stability_ledger, "minimumElapsedHours": float(args.stability_minimum_elapsed_hours), "maximumDeltaDrift": float(args.stability_max_delta_drift), "signatureDigest": signature_digest, "matchingPreviousRuns": matching_previous, "qualifyingPreviousRuns": 0, "entryCountAfterWrite": matching_previous + 1, "latestElapsedHours": None, "blockers": ["wall_clock_second_window_missing" if matching_previous == 0 else "wall_clock_minimum_elapsed_window_missing"]}',
    '    report = {',
    '        "schemaVersion": "spark-startup-bench-proof-adapter.v1",',
    '        "generatedAt": generated_at,',
    '        "status": "runner_proof_ready",',
    '        "adapterImplemented": True,',
    '        "proofAdapterReady": True,',
    '        "runnerProofReady": True,',
    '        "scoreClaimAllowed": False,',
    '        "improvementClaimAllowed": False,',
    '        "commands": commands,',
    '        "artifacts": artifacts,',
    '        "startupBench": {"seeds": seeds, "runSignature": {"schemaVersion": "spark-startup-bench-run-signature.v1", "digest": signature_digest, "payload": signature_payload}},',
    '        "startupOperator": {"repo": args.startup_operator_repo, "toolCallsPath": str(tool_calls_path), "toolCallsSha256": tool_calls_sha},',
    '        "repeatedStability": repeated,',
    '        "wallClockStability": wall_clock,',
    '        "privateScoreSummary": {"baseline": {"scenarioScore": 0.64, "runCount": len(runs)}, "candidate": {"scenarioScore": 0.67, "runCount": len(runs)}, "comparison": {"metric": "scenario_score", "candidateMinusBaseline": 0.03, "candidateBeatsBaseline": True}, "runs": runs, "scoreClaimAllowed": False},',
    '        "promotionDossier": {"status": "blocked", "scoreClaimAllowed": False, "public_ready": False, "network_absorbable": False, "blockers": ["hidden_heldout_not_revealed_to_candidate", "wrapper_raw_not_reconciled", "sidecar_review_pending", "wall_clock_stability_window_missing"]},',
    '        "blockers": ["hidden_heldout_not_revealed_to_candidate", "wrapper_raw_not_reconciled", "sidecar_review_pending", "wall_clock_stability_window_missing"],',
    '        "paths": {"report": str(report_path), "runRoots": run_roots}',
    '    }',
    '    report_path.write_text(json.dumps(report, indent=2, sort_keys=True), encoding="utf-8")',
    '    print(json.dumps(report))',
    '    sys.exit(0)',
    'if args.hook == "startup-bench-proof-gates":',
    '    out = pathlib.Path(args.output_dir)',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    proof = json.loads(pathlib.Path(args.proof_report).read_text(encoding="utf-8")) if args.proof_report and pathlib.Path(args.proof_report).exists() else {}',
    '    hidden_clean = bool(args.hidden_heldout_manifest and pathlib.Path(args.hidden_heldout_manifest).exists())',
    '    sidecar_required = max(1, int(args.sidecar_required_reviewers))',
    '    sidecar_clean = len(args.reviewer) >= sidecar_required',
    '    wall_clock_clean = proof.get("wallClockStability", {}).get("pass") is True',
    '    manifest_path = out / "startup_bench_proof_gates.json"',
    '    kanban_path = out / "kanban.json"',
    '    hidden_path = out / "hidden_heldout_report.json"',
    '    wrapper_path = out / "wrapper_raw_report.json"',
    '    sidecar_path = out / "sidecar_review_report.json"',
    '    score_path = out / "score_reconciliation_report.json"',
    '    raw_score_path = out / "raw_score_summary.json"',
    '    wrapper_score_path = out / "wrapper_score_summary.json"',
    '    private = proof.get("privateScoreSummary", {}) if isinstance(proof.get("privateScoreSummary"), dict) else {}',
    '    baseline = private.get("baseline", {}) if isinstance(private.get("baseline"), dict) else {}',
    '    candidate = private.get("candidate", {}) if isinstance(private.get("candidate"), dict) else {}',
    '    comparison = private.get("comparison", {}) if isinstance(private.get("comparison"), dict) else {}',
    '    baseline_score = baseline.get("scenarioScore", 0.64)',
    '    candidate_score = candidate.get("scenarioScore", 0.67)',
    '    delta = comparison.get("candidateMinusBaseline", round(candidate_score - baseline_score, 6))',
    '    raw_summary = {"schemaVersion": "spark-startup-bench-proof-score-summary.v1", "overallScore": candidate_score, "splitScores": {"baseline": baseline_score, "candidate": candidate_score, "seed_stability": 1.0, "wall_clock": 1.0 if wall_clock_clean else 0.0}, "startupBenchPrivateMovement": {"baselineScenarioScore": baseline_score, "candidateScenarioScore": candidate_score, "candidateMinusBaseline": delta, "candidateBeatsBaseline": candidate_score > baseline_score}, "scoreClaimAllowed": False, "promotionGate": {"scoreClaimAllowed": False, "public_ready": False, "network_absorbable": False, "status": "blocked"}, "claimBoundary": "test score summary only"}',
    '    wrapper_summary = json.loads(json.dumps(raw_summary))',
    '    if os.environ.get("SPARK_QA_FAKE_SCORE_MISMATCH") == "1":',
    '        wrapper_summary["startupBenchPrivateMovement"]["candidateScenarioScore"] = 0.99',
    '        wrapper_summary["startupBenchPrivateMovement"]["candidateMinusBaseline"] = round(0.99 - baseline_score, 6)',
    '        wrapper_summary["splitScores"]["candidate"] = 0.99',
    '        wrapper_summary["overallScore"] = 0.99',
    '    raw_text = json.dumps(raw_summary, sort_keys=True)',
    '    wrapper_text = json.dumps(wrapper_summary, sort_keys=True)',
    '    raw_score_path.write_text(raw_text, encoding="utf-8")',
    '    wrapper_score_path.write_text(wrapper_text, encoding="utf-8")',
    '    raw_hash = hashlib.sha256(raw_text.encode("utf-8")).hexdigest()',
    '    wrapper_hash = hashlib.sha256(wrapper_text.encode("utf-8")).hexdigest()',
    '    wrapper_clean = raw_hash == wrapper_hash',
    '    hidden_path.write_text(json.dumps({"schemaVersion": "spark-startup-bench-hidden-heldout-report.v1", "status": "passed" if hidden_clean else "blocked", "pass": hidden_clean, "blockers": [] if hidden_clean else ["hidden_heldout_manifest_missing"]}), encoding="utf-8")',
    '    wrapper_path.write_text(json.dumps({"schemaVersion": "spark-qa-wrapper-raw-reconciliation-report.v1", "status": "clean" if wrapper_clean else "blocked", "pass": wrapper_clean, "blockers": [] if wrapper_clean else ["wrapper_raw_score_mismatch"], "comparisons": {"dimensionScoresMatch": wrapper_clean, "splitScoresMatch": wrapper_clean, "promotionStatusMatches": wrapper_clean}, "rawReport": {"path": str(raw_score_path), "sha256": raw_hash, "schemaVersion": raw_summary["schemaVersion"]}, "wrapperReport": {"path": str(wrapper_score_path), "sha256": wrapper_hash, "schemaVersion": wrapper_summary["schemaVersion"]}, "scoreClaimAllowed": False}), encoding="utf-8")',
    '    sidecar_path.write_text(json.dumps({"schemaVersion": "spark-qa-sidecar-review-report.v1", "status": "clean" if sidecar_clean else "blocked", "pass": sidecar_clean, "reviewerCountRequired": sidecar_required, "reviewerCount": len(args.reviewer), "blockers": [] if sidecar_clean else ["sidecar_clean_quorum:%d/%d" % (len(args.reviewer), sidecar_required)]}), encoding="utf-8")',
    '    score_blockers = []',
    '    if not hidden_clean: score_blockers.append("hidden_heldout_not_revealed_to_candidate")',
    '    if not wrapper_clean: score_blockers.append("wrapper_raw_not_reconciled")',
    '    if not sidecar_clean: score_blockers.append("sidecar_review_pending")',
    '    if not wall_clock_clean: score_blockers.append("wall_clock_stability_window_missing")',
    '    score_clean = len(score_blockers) == 0',
    '    score_path.write_text(json.dumps({"schemaVersion": "spark-startup-bench-score-reconciliation-report.v1", "status": "score_reconciled" if score_clean else "blocked", "pass": score_clean, "scoreClaimAllowed": score_clean, "blockers": score_blockers, "privateMovement": {"candidateMinusBaseline": delta}}), encoding="utf-8")',
    '    gate_passes = [hidden_clean, wrapper_clean, sidecar_clean, score_clean]',
    '    kanban = {"schemaVersion": "spark-startup-bench-proof-gate-kanban.v1", "ticketCount": len([item for item in gate_passes if not item]), "columns": []}',
    '    kanban_path.write_text(json.dumps(kanban), encoding="utf-8")',
    '    proof_sha = hashlib.sha256(pathlib.Path(args.proof_report).read_bytes()).hexdigest() if args.proof_report and pathlib.Path(args.proof_report).exists() else ""',
    '    payload = {"schemaVersion": "spark-startup-bench-proof-gate-bundle.v1", "status": "ready" if all(gate_passes) else "blocked", "pass": all(gate_passes), "scoreClaimAllowed": score_clean, "improvementClaimAllowed": score_clean, "public_ready": False, "network_absorbable": False, "proofReport": {"path": args.proof_report, "sha256": proof_sha, "schemaVersion": proof.get("schemaVersion")}, "proofBinding": {"schemaVersion": "spark-startup-bench-proof-binding.v1", "proofReportPath": args.proof_report, "proofReportSha256": proof_sha}, "paths": {"manifest": str(manifest_path), "hiddenHeldoutReport": str(hidden_path), "wrapperRawReport": str(wrapper_path), "sidecarReviewReport": str(sidecar_path), "scoreReconciliationReport": str(score_path), "kanban": str(kanban_path)}, "gates": {"hiddenHeldout": {"status": "passed" if hidden_clean else "blocked", "pass": hidden_clean, "blockers": [] if hidden_clean else ["hidden_heldout_manifest_missing"]}, "wrapperRaw": {"status": "clean" if wrapper_clean else "blocked", "pass": wrapper_clean, "blockers": [] if wrapper_clean else ["wrapper_raw_score_mismatch"]}, "sidecarReview": {"status": "clean" if sidecar_clean else "blocked", "pass": sidecar_clean, "reviewerCountRequired": sidecar_required, "reviewerCount": len(args.reviewer), "blockers": [] if sidecar_clean else ["sidecar_clean_quorum:%d/%d" % (len(args.reviewer), sidecar_required)]}, "scoreReconciliation": {"status": "score_reconciled" if score_clean else "blocked", "pass": score_clean, "blockers": score_blockers}}, "kanban": {"ticketCount": kanban["ticketCount"], "path": str(kanban_path)}}',
    '    manifest_path.write_text(json.dumps(payload, indent=2, sort_keys=True), encoding="utf-8")',
    '    print(json.dumps(payload))',
    '    sys.exit(0 if all(gate_passes) else 1)',
    'if args.hook == "benchmark-creator-prd":',
    '    out = pathlib.Path(args.output_dir)',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    generated_at = "2026-05-25T12:00:00Z"',
    '    level = int(args.level)',
    '    weak = os.environ.get("SPARK_QA_FAKE_WEAK_BENCHMARK") == "1"',
    '    splits = ["visible", "heldout", "trap", "system", "audit", "longrun", "fresh"] if level >= 10 else ["visible", "trap", "system"]',
    '    case_count = 1 if weak else (84 if level >= 10 else 16)',
    '    failure_classes = ["route_hijack", "stale_truth", "schema_drift", "tool_misuse", "score_hallucination", "cached_number", "hash_mismatch", "heldout_leak", "wrapper_raw_gap", "sidecar_gap", "swarm_bridge_gap", "longrun_flake"]',
    '    families = ["telegram", "autoloop", "benchmark", "evidence", "capture", "review", "heldout", "tool_use", "swarm", "promotion"]',
    '    cases = []',
    '    for i in range(case_count):',
    '        cases.append({',
    '            "id": "case-%d" % (i + 1),',
    '            "split": splits[i % len(splits)],',
    '            "caseFamily": families[i % len(families)],',
    '            "failureClass": failure_classes[i % len(failure_classes)],',
    '            "toolSurfaces": ["telegram", "filesystem", "autoloop"],',
    '            "requiredSourceLanes": ["benchmark_pack", "evidence_ladder", "promotion_dossier"],',
    '            "requiredArtifactKinds": ["case_envelope", "source_hash", "runner_trace"],',
    '            "artifactAssertions": {"requiresSha256": True, "requiresByteSize": True},',
    '            "promotionBlocking": i < max(1, case_count // 2),',
    '            "forbiddenContains": {"observedAnswer": ["score:"]} if i == 0 else {},',
    '        })',
    '    pack = {"schemaVersion": "spark-benchmark-pack-executable.v1", "id": "spark-qa-operator-level-%d-benchmark-pack" % level, "caseCount": case_count, "splits": splits, "cases": cases, "executionContract": {"runner": "fake"}, "scoringContract": {"scoreSource": "fresh_autoloop_report"}}',
    '    quality = {"schemaVersion": "spark-benchmark-quality-report.v1", "generatedAt": generated_at, "benchmarkPackId": pack["id"], "qualityScore": 1.0, "status": "ready", "pass": True, "scoreClaimAllowed": False, "improvementClaimAllowed": False, "nextGate": "run_fresh_benchmark_autoloop", "benchmarkLevel": {"level": level, "autoLoop": True, "swarmAudited": True}}',
    '    artifacts = ["benchmark_pack", "benchmark_quality_report", "validation_ledger", "runner_contract", "evidence_ladder", "source_lane_map", "hidden_heldout_manifest", "trap_case_manifest", "longrun_stability_plan", "spark_swarm_bridge_packet", "sidecar_review_packet", "promotion_bridge", "local_private_boundary", "autoloop_policy", "ticket_driven_mutation_handoff"]',
    '    manifest = {"schemaVersion": "spark-benchmark-creator-artifact-manifest.v1", "artifacts": [{"artifactType": item} for item in artifacts], "scoreStatus": "not_scored"}',
    '    pack_path = out / "benchmark_pack.json"',
    '    quality_path = out / "benchmark_quality_report.json"',
    '    manifest_path = out / "artifact_manifest.json"',
    '    prd_path = out / "benchmark_creator_prd.json"',
    '    hidden_path = out / "hidden_heldout_manifest.json"',
    '    sidecar_template_path = out / "sidecar_review.template.json"',
    '    pack_path.write_text(json.dumps(pack), encoding="utf-8")',
    '    quality_path.write_text(json.dumps(quality), encoding="utf-8")',
    '    manifest_path.write_text(json.dumps(manifest), encoding="utf-8")',
    '    hidden_path.write_text(json.dumps({"schemaVersion": "spark-qa-hidden-heldout-manifest.v1", "heldoutSetId": "fake-startup-heldout", "candidateVisible": False, "answerKeysIncluded": False, "rawAnswersIncluded": False, "sealedCaseRefs": [{"caseRef": "hidden-%02d" % i, "sealedHash": "sha256:" + ("a" * 64)} for i in range(12)]}), encoding="utf-8")',
    '    sidecar_template_path.write_text(json.dumps({"schemaVersion": "spark-swarm-sidecar-review.v1", "reviewRequired": True, "reviewStatus": "pending", "reviewerCountRequired": 2, "noSelfApproval": True, "signedVerdictsRequired": True}), encoding="utf-8")',
    '    prd = {"generatedAt": generated_at, "specializationPath": {"label": args.specialization_path, "pathKey": "spark-qa-operator"}, "benchmarkLevel": {"level": level, "name": "lab_swarm_research", "timeBudget": "hours to days", "canvasKanban": True}}',
    '    prd_path.write_text(json.dumps(prd), encoding="utf-8")',
    '    payload = {"success": True, "paths": {"benchmarkPack": str(pack_path), "benchmarkQualityReport": str(quality_path), "artifactManifest": str(manifest_path), "json": str(prd_path), "hidden_heldout_manifest": str(hidden_path), "sidecar_review_template": str(sidecar_template_path)}, "quality": quality, "prd": prd, "benchmarkLevel": prd["benchmarkLevel"]}',
    '    print(json.dumps(payload))',
    '    sys.exit(0)',
    'if args.hook == "evidence-capture-plan":',
    '    out = pathlib.Path(args.output_dir)',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    pack = json.loads(pathlib.Path(args.benchmark_pack).read_text(encoding="utf-8"))',
    '    cases = pack.get("cases", [])',
    '    plan = {"schemaVersion": "spark-qa-evidence-capture-plan.v1", "jobId": args.job_id, "benchmarkPack": {"id": pack.get("id"), "caseCount": len(cases)}, "evidenceRoot": args.evidence_root, "summary": {"caseCount": len(cases), "byStatus": {"needs_capture": len(cases)}, "scoreClaimAllowed": False, "improvementClaimAllowed": False}, "workItems": [{"id": "capture-001", "caseId": cases[0]["id"], "status": "needs_capture"}] if cases else [], "claimBoundary": "queue only"}',
    '    plan_path = out / "evidence_capture_plan.json"',
    '    kanban_path = out / "evidence_capture_kanban.json"',
    '    plan_path.write_text(json.dumps(plan), encoding="utf-8")',
    '    kanban_path.write_text(json.dumps({"columns": []}), encoding="utf-8")',
    '    print(json.dumps({"success": True, "paths": {"plan": str(plan_path), "kanban": str(kanban_path)}, "plan": plan}))',
    '    sys.exit(0)',
    'if args.hook == "evidence-capture-run":',
    '    out = pathlib.Path(args.output_dir)',
    '    evidence_root = pathlib.Path(args.evidence_root)',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    evidence_root.mkdir(parents=True, exist_ok=True)',
    '    pack = json.loads(pathlib.Path(args.benchmark_pack).read_text(encoding="utf-8"))',
    '    cases = pack.get("cases", [])',
    '    limit = int(args.limit or "1")',
    '    captured = []',
    '    for case in cases[:limit]:',
    '        case_id = case["id"]',
    '        evidence_path = evidence_root / (case_id + ".json")',
    '        boundary = {"scoreClaimAllowed": False, "improvementClaimAllowed": False, "public_ready": False, "network_absorbable": False}',
    '        artifact_dir = evidence_root / "artifacts" / case_id',
    '        artifact_dir.mkdir(parents=True, exist_ok=True)',
    '        artifact_path = artifact_dir / "001-case-envelope.json"',
    '        artifact_payload = {"schemaVersion": "spark-qa-evidence-artifact.v1", "caseId": case_id, "kind": "case_envelope", "captureAttestation": {"status": "provisional"}, "source": {"kind": "generated_probe_record"}, "claimBoundary": boundary}',
    '        artifact_text = json.dumps(artifact_payload)',
    '        artifact_path.write_text(artifact_text, encoding="utf-8")',
    '        artifact_rel = str(artifact_path.relative_to(evidence_root))',
    '        evidence = {"schemaVersion": "spark-qa-evidence-case.v1", "caseId": case_id, "publicationState": "private_review", "captureAttestation": {"status": "provisional"}, "claimBoundary": boundary, "artifacts": [{"path": artifact_rel, "kind": "case_envelope", "byteSize": len(artifact_text.encode("utf-8")), "sha256": hashlib.sha256(artifact_text.encode("utf-8")).hexdigest()}]}',
    '        evidence_path.write_text(json.dumps(evidence), encoding="utf-8")',
    '        captured.append({"caseId": case_id, "evidencePath": str(evidence_path), "captureAttestation": "provisional"})',
    '    plan_path = out / "evidence_capture_plan.json"',
    '    kanban_path = out / "evidence_capture_kanban.json"',
    '    result_path = out / "post_capture_evidence_result.json"',
    '    run_path = out / "evidence_capture_run.json"',
    '    by_status = {"needs_repair": len(captured), "needs_capture": max(0, len(cases) - len(captured))}',
    '    plan = {"schemaVersion": "spark-qa-evidence-capture-plan.v1", "summary": {"caseCount": len(cases), "byStatus": by_status, "scoreClaimAllowed": False, "improvementClaimAllowed": False}}',
    '    capture = {"schemaVersion": "spark-qa-evidence-capture-run.v1", "capturedCount": len(captured), "captured": captured, "postCapture": {"planSummary": plan["summary"], "missingEvidenceCount": len(cases), "violationCount": 0}, "scoreClaimAllowed": False, "improvementClaimAllowed": False}',
    '    plan_path.write_text(json.dumps(plan), encoding="utf-8")',
    '    kanban_path.write_text(json.dumps({"columns": []}), encoding="utf-8")',
    '    result_path.write_text(json.dumps({"missingEvidenceCount": len(cases)}), encoding="utf-8")',
    '    payload = {"success": True, "capture": capture, "paths": {"run": str(run_path), "postCaptureEvidenceResult": str(result_path), "plan": str(plan_path), "kanban": str(kanban_path)}}',
    '    run_path.write_text(json.dumps(payload), encoding="utf-8")',
    '    print(json.dumps(payload))',
    '    sys.exit(0)',
    'if args.hook == "evidence-review-queue":',
    '    out = pathlib.Path(args.output_dir)',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    pack = json.loads(pathlib.Path(args.benchmark_pack).read_text(encoding="utf-8"))',
    '    cases = pack.get("cases", [])',
    '    observed = 0',
    '    needs_attestation = 0',
    '    missing_capture = 0',
    '    items = []',
    '    for case in cases:',
    '        evidence_path = pathlib.Path(args.evidence_root) / (case["id"] + ".json")',
    '        status = "missing_capture"',
    '        if evidence_path.exists():',
    '            evidence = json.loads(evidence_path.read_text(encoding="utf-8"))',
    '            status = evidence.get("captureAttestation", {}).get("status") or "needs_attestation"',
    '            if status == "provisional": status = "needs_attestation"',
    '        if status == "observed": observed += 1',
    '        elif status == "needs_attestation": needs_attestation += 1',
    '        else: missing_capture += 1',
    '        items.append({"caseId": case["id"], "status": status})',
    '    queue = {"schemaVersion": "spark-qa-evidence-review-queue.v1", "summary": {"caseCount": len(cases), "byStatus": {"missing_capture": missing_capture, "needs_attestation": needs_attestation, "observed": observed}, "scoreClaimAllowed": False}, "items": items}',
    '    queue_path = out / "evidence_review_queue.json"',
    '    kanban_path = out / "evidence_review_kanban.json"',
    '    queue_path.write_text(json.dumps(queue), encoding="utf-8")',
    '    kanban_path.write_text(json.dumps({"columns": []}), encoding="utf-8")',
    '    print(json.dumps({"success": True, "paths": {"queue": str(queue_path), "kanban": str(kanban_path)}, "queue": queue}))',
    '    sys.exit(0)',
    'if args.hook == "evidence-attest":',
    '    out = pathlib.Path(args.output_dir)',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    evidence_path = pathlib.Path(args.evidence_root) / (args.case_id + ".json")',
    '    evidence = json.loads(evidence_path.read_text(encoding="utf-8"))',
    '    evidence["captureAttestation"] = {"status": args.decision, "reviewer": {"kind": args.reviewer_kind, "idSha256": hashlib.sha256(args.reviewer_id.encode()).hexdigest()}}',
    '    evidence_path.write_text(json.dumps(evidence), encoding="utf-8")',
    '    record_path = out / ("evidence_review_record_" + args.case_id + ".json")',
    '    result_path = out / ("evidence_attestation_result_" + args.case_id + ".json")',
    '    queue_path = out / "evidence_review_queue.json"',
    '    kanban_path = out / "evidence_review_kanban.json"',
    '    record = {"schemaVersion": "spark-qa-evidence-review-record.v1", "caseId": args.case_id, "decision": args.decision, "reviewer": evidence["captureAttestation"]["reviewer"], "scoreClaimAllowed": False}',
    '    attestation = {"schemaVersion": "spark-qa-evidence-attestation-result.v1", "caseId": args.case_id, "decision": args.decision, "reviewRecord": record, "reviewSummary": {"byStatus": {"observed": 1, "needs_attestation": 0, "missing_capture": 0}}, "scoreClaimAllowed": False}',
    '    record_path.write_text(json.dumps(record), encoding="utf-8")',
    '    queue_path.write_text(json.dumps({"summary": attestation["reviewSummary"]}), encoding="utf-8")',
    '    kanban_path.write_text(json.dumps({"columns": []}), encoding="utf-8")',
    '    payload = {"success": True, "attestation": attestation, "paths": {"record": str(record_path), "result": str(result_path), "review_queue": str(queue_path), "review_kanban": str(kanban_path)}}',
    '    result_path.write_text(json.dumps(payload), encoding="utf-8")',
    '    print(json.dumps(payload))',
    '    sys.exit(0)',
    'raise SystemExit(2)',
    '',
  ].join('\n'), 'utf-8');
  return root;
}

function makeFakeStartupBenchRepo(root = mkdtempSync(path.join(tmpdir(), 'startup-bench-repo-'))): string {
  const moduleDir = path.join(root, 'src', 'thestartupbench');
  mkdirSync(moduleDir, { recursive: true });
  writeFileSync(path.join(moduleDir, '__main__.py'), [
    'import json, pathlib, sys',
    'if len(sys.argv) > 1 and sys.argv[1] == "run-suite":',
    '    suite_path = pathlib.Path(sys.argv[2])',
    '    suite = json.loads(suite_path.read_text(encoding="utf-8"))',
    '    scenarios = suite.get("scenarios", [])',
    '    scenario_count = len(scenarios)',
    '    out = pathlib.Path(sys.argv[sys.argv.index("--output-dir") + 1]) if "--output-dir" in sys.argv else pathlib.Path("tmp-suite")',
    '    out.mkdir(parents=True, exist_ok=True)',
    '    suite_report = {"overall": {"scenario_count": scenario_count, "scenario_score_mean": 0.5, "outcome_score_mean": 0.5, "constraint_score_mean": 1.0, "pass_rate_mean": 1.0}, "track_summaries": []}',
    '    (out / "suite_report.json").write_text(json.dumps(suite_report), encoding="utf-8")',
    '    print(json.dumps({"suite_report": suite_report, "validation": {"ok": True}}))',
    '    sys.exit(0)',
    'print("fake startup bench")',
    '',
  ].join('\n'), 'utf-8');
  writeFileSync(path.join(moduleDir, 'cli.py'), '', 'utf-8');
  const examplesDir = path.join(root, 'examples');
  mkdirSync(examplesDir, { recursive: true });
  const suites = [
    ['dev_scenario_suite.json', 'dev', 'dev-pack-0.5.0', [['zero_to_one_design_partner_001', '0to1'], ['gtm_motion_001', 'gtm']]],
    ['private_operator_test_scenario_suite.json', 'test', 'operator-test-pack-0.7.0', [['operator_gtm_001', 'gtm'], ['operator_finance_001', 'finance']]],
    ['private_operator_fresh_scenario_suite.json', 'fresh', 'operator-fresh-pack-0.7.0', [['operator_people_001', 'people'], ['operator_gtm_fresh_001', 'gtm']]],
    ['private_canary_test_scenario_suite.json', 'test', 'canary-test-pack-0.4.0', [['canary_gtm_001', 'gtm']]],
    ['private_canary_fresh_scenario_suite.json', 'fresh', 'canary-fresh-pack-0.4.0', [['canary_finance_001', 'finance']]],
    ['private_strategy_test_scenario_suite.json', 'test', 'strategy-test-pack-0.9.0', [['strategy_board_001', 'board']]],
    ['private_strategy_fresh_scenario_suite.json', 'fresh', 'strategy-fresh-pack-0.9.0', [['strategy_product_001', 'product']]],
    ['private_real_world_test_scenario_suite.json', 'test', 'real-world-test-pack-0.5.0', [['real_world_crisis_001', 'crisis']]],
    ['private_real_world_fresh_scenario_suite.json', 'fresh', 'real-world-fresh-pack-0.5.0', [['real_world_scale_001', 'scale']]],
    ['private_coverage_test_scenario_suite.json', 'test', 'coverage-test-pack-0.11.0', [['coverage_0to1_001', '0to1']]],
    ['private_coverage_fresh_scenario_suite.json', 'fresh', 'coverage-fresh-pack-0.11.0', [['coverage_people_001', 'people']]],
  ] as const;
  for (const [fileName, split, pack, scenarios] of suites) {
    writeFileSync(path.join(examplesDir, fileName), JSON.stringify({
      suite_version: '0.1.0',
      benchmark_version: '0.1.0',
      scenario_pack_version: pack,
      split,
      scenarios: scenarios.map(([scenarioId, track]) => ({
        scenario_id: scenarioId,
        path: `${scenarioId}.json`,
        track,
        mode: split,
      })),
    }), 'utf-8');
  }
  return root;
}

function makeFakeStartupOperatorRepo(root = mkdtempSync(path.join(tmpdir(), 'startup-operator-repo-'))): string {
  mkdirSync(path.join(root, 'benchmarks', 'scenarios'), { recursive: true });
  writeFileSync(path.join(root, 'specialization-path.json'), JSON.stringify({ pathKey: 'startup-operator' }), 'utf-8');
  writeFileSync(path.join(root, 'benchmarks', 'startup-operator.tool_calls.json'), [
    '[',
    '  {',
    '    "tool_name": "metrics.report",',
    '    "request_id": "startup_operator_req_001",',
    '    "arguments": {}',
    '  },',
    '  {',
    '    "tool_name": "finance.plan.write",',
    '    "request_id": "startup_operator_req_002",',
    '    "arguments": {',
    '      "forecast": {',
    '        "liquid_cash_usd": 460000.0,',
    '        "treasury_concentration": 0.0',
    '      }',
    '    }',
    '  },',
    '  {',
    '    "tool_name": "sales.pipeline.update",',
    '    "request_id": "startup_operator_req_003",',
    '    "arguments": {}',
    '  }',
    ']',
    '',
  ].join('\n'), 'utf-8');
  writeFileSync(path.join(root, 'benchmarks', 'scenarios', 'minimal_0to1_scenario.json'), JSON.stringify({ metadata: { scenario_id: 'fake' } }), 'utf-8');
  return root;
}

function makeFakeStartupYcRepo(root = mkdtempSync(path.join(tmpdir(), 'startup-yc-repo-'))): string {
  const moduleDir = path.join(root, 'src', 'specialization_path_startup_yc');
  mkdirSync(moduleDir, { recursive: true });
  mkdirSync(path.join(root, 'data', 'absorption'), { recursive: true });
  writeFileSync(path.join(moduleDir, '__init__.py'), '', 'utf-8');
  writeFileSync(path.join(root, 'data', 'absorption', 'startup_yc_absorption_v1.json'), JSON.stringify({
    suite_id: 'startup_yc_absorption_v1',
    cases: [
      { case_id: 'yc_absorb_basic_001', band: 'basic', trap: false },
      { case_id: 'yc_absorb_trap_001', band: 'trap', trap: true },
    ],
  }), 'utf-8');
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
    'def write(obj):',
    '    out.write_text(json.dumps(obj, indent=2, sort_keys=True) + "\\n", encoding="utf-8")',
    'case_limit = int(payload.get("case_limit") or 2)',
    'if args.hook == "absorption_bundle":',
    '    bundle_count = case_limit * 3',
    '    output_dir = pathlib.Path(str(payload.get("output_dir") or (out.parent / "bundles")))',
    '    modes = ["no_pack", "pack", "validated_pack"]',
    '    bundles = []',
    '    for i in range(bundle_count):',
    '        bundle_id = "b%d" % i',
    '        case_id = "case_%d" % (i // 3)',
    '        mode = modes[i % 3]',
    '        prompt_path = output_dir / bundle_id / "prompt.md"',
    '        prompt_path.parent.mkdir(parents=True, exist_ok=True)',
    '        prompt_path.write_text("Return tool calls for %s %s\\n" % (case_id, mode), encoding="utf-8")',
    '        bundles.append({"bundle_id": bundle_id, "case_id": case_id, "mode": mode, "prompt_path": str(prompt_path), "expected_submission_path": str(out.parent / "submissions" / case_id / mode / "tool_calls.json")})',
    '    write({"schema_version": "1.0.0", "kind": "startup_yc_absorption_agent_bundle_export", "status": "ready", "suite_id": "startup_yc_absorption_v1", "case_count": case_limit, "bundle_count": bundle_count, "run_modes": modes, "bundles": bundles})',
    'elif args.hook == "absorption_generate":',
    '    manifest = json.loads(pathlib.Path(payload["bundle_manifest_path"]).read_text(encoding="utf-8"))',
    '    submissions_dir = pathlib.Path(str(payload.get("output_dir") or (out.parent / "submissions")))',
    '    submissions_dir.mkdir(parents=True, exist_ok=True)',
    '    (submissions_dir / "heuristic_submission_manifest.json").write_text(json.dumps({"evidence_tier": "heuristic_agent_smoke"}, indent=2) + "\\n", encoding="utf-8")',
    '    write({"schema_version": "1.0.0", "kind": "startup_yc_absorption_agent_submission_generation", "status": "ready", "evidence_tier": "heuristic_agent_smoke", "bundle_count": manifest.get("bundle_count", 0), "generated_submission_count": manifest.get("bundle_count", 0)})',
    'elif args.hook == "absorption_evaluate":',
    '    manifest = json.loads(pathlib.Path(payload["bundle_manifest_path"]).read_text(encoding="utf-8"))',
    '    submissions_dir = pathlib.Path(str(payload.get("submissions_dir") or ""))',
    '    evidence_tier = "heuristic_agent_smoke" if (submissions_dir / "heuristic_submission_manifest.json").exists() else "fresh_agent_absorption_candidate"',
    '    case_count = int(manifest.get("case_count") or 2)',
    '    cases = []',
    '    for i in range(case_count):',
    '        cases.append({"case_id": "case_%d" % i, "mode_results": {"no_pack": {"status": "ok", "score": {"scenario_score": 0.6, "pass": True}}, "pack": {"status": "ok", "score": {"scenario_score": 0.62, "pass": True}}, "validated_pack": {"status": "ok", "score": {"scenario_score": 0.64, "pass": True}}}, "deltas": {"pack_vs_no_pack": 0.02, "validated_pack_vs_no_pack": 0.04}})',
    '    write({"schema_version": "1.0.0", "kind": "startup_yc_absorption_agent_submission_report", "status": "ready", "summary": {"suite_id": "startup_yc_absorption_v1", "mode": "fresh_agent_submission_eval", "evidence_tier": evidence_tier, "case_count": case_count, "bundle_count": manifest.get("bundle_count", 0), "mean_pack_delta": 0.02, "mean_validated_pack_delta": 0.04, "positive_pack_cases": case_count, "positive_validated_pack_cases": case_count}, "cases": cases})',
    'elif args.hook == "absorption_summarize":',
    '    report = json.loads(pathlib.Path(payload["report_path"]).read_text(encoding="utf-8"))',
    '    case_count = int(report.get("summary", {}).get("case_count") or 0)',
    '    evidence_tier = str(report.get("summary", {}).get("evidence_tier") or "heuristic_agent_smoke")',
    '    blockers = []',
    '    if evidence_tier == "heuristic_agent_smoke": blockers.append("heuristic smoke evidence is not fresh-agent learning")',
    '    if case_count < 20: blockers.append("full 20-case absorption suite has not been scored")',
    '    write({"schema_version": "1.0.0", "kind": "startup_yc_absorption_summary", "status": "ready", "evidence_tier": evidence_tier, "case_count": case_count, "score_summary": {"mean_no_pack_score": 0.6, "mean_pack_score": 0.62, "mean_validated_pack_score": 0.64, "mean_validated_pack_delta": 0.04}, "trap_integrity": {"trap_case_count": 1, "validated_regression_count": 0}, "mastery_readiness": {"status": "candidate_review" if evidence_tier == "fresh_agent_absorption_candidate" else "not_ready", "blockers": blockers}})',
    'elif args.hook == "loop_status":',
    '    summary = json.loads(pathlib.Path(payload["summary_path"]).read_text(encoding="utf-8"))',
    '    write({"schemaVersion": "spark-specialization-loop-status.v1", "path": {"key": "startup-yc"}, "claim": {"decision": "unproven"}, "source": {"kind": summary.get("kind")}})',
    'else:',
    '    raise SystemExit("unsupported hook")',
    '',
  ].join('\n'), 'utf-8');
  return root;
}

function writeLatestProof(repo: string, report: Record<string, any>, hashOverride?: string): void {
  const runRoot = path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'latest-test');
  mkdirSync(runRoot, { recursive: true });
  const reportPath = path.join(runRoot, 'autoloop_round_report.json');
  const text = JSON.stringify(report, null, 2) + '\n';
  writeFileSync(reportPath, text, 'utf-8');
  const reportSha256 = hashOverride || createHash('sha256').update(text).digest('hex');
  writeFileSync(path.join(repo, '.spark-swarm', 'autoloop', 'latest_run.json'), JSON.stringify({
    schemaVersion: 'spark-qa-autoloop-latest-run.v1',
    generatedAt: report.run?.endedAt || new Date().toISOString(),
    outputRoot: runRoot,
    reportPath,
    reportSha256,
    status: report.run?.status || 'blocked',
  }), 'utf-8');
}

function writeBoundStartupBenchDossier(repo: string, runId = 'clean-target-fe9718-seeds12-window2'): string {
  const runRoot = path.join(repo, '.spark-swarm', 'autoloop', 'runs', runId);
  mkdirSync(runRoot, { recursive: true });
  const dossierPath = path.join(runRoot, 'startup_bench_proof_report.bound.json');
  writeFileSync(dossierPath, JSON.stringify({
    schemaVersion: 'spark-startup-bench-proof-adapter.v1',
    status: 'score_claim_ready',
    scoreClaimAllowed: true,
    improvementClaimAllowed: true,
    privateScoreSummary: {
      baseline: { scenarioScore: 0.6408 },
      candidate: { scenarioScore: 0.8657 },
      comparison: {
        metric: 'scenario_score',
        candidateMinusBaseline: 0.2249,
        candidateBeatsBaseline: true,
      },
    },
    promotionDossier: {
      status: 'score_claim_ready',
      scoreClaimAllowed: true,
      improvementClaimAllowed: true,
      public_ready: false,
      network_absorbable: false,
      blockers: [],
      nextGate: 'ready_for_publication_review',
    },
    proofGateBundle: {
      bundleId: 'startup-bench-proof-c110f7a53c05-a898c828a760',
      status: 'ready',
      gates: { passed: 6, total: 6 },
    },
  }), 'utf-8');
  return dossierPath;
}

function blockedReport(endedAt = new Date().toISOString()): Record<string, any> {
  return {
    schemaVersion: 'spark-qa-autoloop-round-report.v1',
    run: { status: 'blocked', endedAt },
    baselineCandidateDelta: { baselineScore: 0.0, candidateScore: 1.0, delta: 1.0 },
    captureReplay: { passedCount: 4, caseCount: 4 },
    evidenceBenchmark: { overallScore: 1.0 },
    failureQueue: { ticketCount: 2 },
    promotionDossier: { scoreClaimAllowed: false, blockers: ['wrapper_raw_not_reconciled'] },
  };
}

async function main(): Promise<void> {
  await test('parses Spark QA commands and keeps level selection explicit', () => {
    assert.deepEqual(parseSparkQaCommand('run'), { action: 'run' });
    assert.deepEqual(parseSparkQaCommand('score'), { action: 'status' });
    assert.deepEqual(parseSparkQaCommand('paths'), { action: 'paths' });
    assert.deepEqual(parseSparkQaCommand('adapter registry'), { action: 'paths' });
    assert.deepEqual(parseSparkQaCommand('benchmark Spark QA Operator level 10'), {
      action: 'benchmark',
      level: 10,
      specializationPath: 'Spark QA Operator',
      prompt: 'benchmark Spark QA Operator level 10',
    });
    assert.deepEqual(parseSparkQaCommand('benchmark create Spark QA Operator level 10'), {
      action: 'benchmark',
      level: 10,
      specializationPath: 'Spark QA Operator',
      prompt: 'benchmark create Spark QA Operator level 10',
    });
    assert.deepEqual(parseSparkQaCommand('create level 10 benchmarks for Spark QA Operator'), {
      action: 'benchmark',
      level: 10,
      specializationPath: 'Spark QA Operator',
      prompt: 'create level 10 benchmarks for Spark QA Operator',
    });
    assert.deepEqual(parseSparkQaCommand('benchmark QA level 10'), {
      action: 'benchmark',
      level: 10,
      specializationPath: 'Spark QA Operator',
      prompt: 'benchmark QA level 10',
    });
    assert.deepEqual(parseSparkQaCommand('benchmark startupbench level 8'), {
      action: 'benchmark',
      level: 8,
      specializationPath: 'Startup Bench',
      prompt: 'benchmark startupbench level 8',
    });
    assert.deepEqual(parseSparkQaCommand('benchmark create startup-bench level 10'), {
      action: 'benchmark',
      level: 10,
      specializationPath: 'Startup Bench',
      prompt: 'benchmark create startup-bench level 10',
    });
    assert.deepEqual(parseSparkQaCommand('evidence'), { action: 'evidence' });
    assert.deepEqual(parseSparkQaCommand('capture evidence'), { action: 'capture', captureLimit: undefined });
    assert.deepEqual(parseSparkQaCommand('capture 7'), { action: 'capture', captureLimit: 7 });
    assert.deepEqual(parseSparkQaCommand('review'), { action: 'review' });
    assert.deepEqual(parseSparkQaCommand('attest case-1 observed reviewed hashes'), {
      action: 'attest',
      caseId: 'case-1',
      decision: 'observed',
      notes: 'reviewed hashes',
    });
    assert.deepEqual(parseSparkQaCommand('attest verified 12'), {
      action: 'attestVerified',
      attestLimit: 12,
    });
    assert.deepEqual(parseSparkQaCommand('prove 18'), {
      action: 'prove',
      proveLimit: 18,
    });
    assert.deepEqual(parseSparkQaCommand('prove auto start 3'), {
      action: 'proofAuto',
      proofAutoAction: 'start',
      proveLimit: 3,
    });
    assert.deepEqual(parseSparkQaCommand('prove auto status'), {
      action: 'proofAuto',
      proofAutoAction: 'status',
      proveLimit: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('auto proof stop'), {
      action: 'proofAuto',
      proofAutoAction: 'stop',
      proveLimit: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('resume'), {
      action: 'prove',
      proveLimit: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('proof status'), {
      action: 'proofStatus',
    });
    assert.deepEqual(parseSparkQaCommand('workflow'), {
      action: 'proofStatus',
    });
    assert.deepEqual(parseSparkQaCommand('workboard'), {
      action: 'workboard',
    });
    assert.deepEqual(parseSparkQaCommand('canvas'), {
      action: 'workboard',
    });
    assert.deepEqual(parseSparkQaCommand('adapter readiness'), {
      action: 'adapterReadiness',
    });
    assert.deepEqual(parseSparkQaCommand('proof adapter contract'), {
      action: 'adapterReadiness',
    });
    assert.deepEqual(parseSparkQaCommand('startup'), {
      action: 'startupReadiness',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench status'), {
      action: 'startupReadiness',
    });
    assert.deepEqual(parseSparkQaCommand('proof readiness'), {
      action: 'startupReadiness',
    });
    assert.deepEqual(parseSparkQaCommand('gates'), {
      action: 'startupGates',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench proof gates'), {
      action: 'startupGates',
    });
    assert.deepEqual(parseSparkQaCommand('gates reviewers reviewer-a, reviewer-b'), {
      action: 'startupGates',
      reviewers: ['reviewer-a', 'reviewer-b'],
    });
    assert.deepEqual(parseSparkQaCommand('gates attest'), {
      action: 'startupGateAttest',
    });
    assert.deepEqual(parseSparkQaCommand('gates review'), {
      action: 'startupGateReview',
    });
    assert.deepEqual(parseSparkQaCommand('sidecar'), {
      action: 'startupGateReview',
    });
    assert.deepEqual(parseSparkQaCommand('reviewers'), {
      action: 'startupAdvisoryAgentStatus',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench reviewers overview'), {
      action: 'startupAdvisoryAgentStatus',
    });
    assert.deepEqual(parseSparkQaCommand('sidecar handoff'), {
      action: 'startupReviewerHandoff',
    });
    assert.deepEqual(parseSparkQaCommand('reviewers handoff'), {
      action: 'startupReviewerHandoff',
    });
    assert.deepEqual(parseSparkQaCommand('reviewers invite'), {
      action: 'startupReviewerInvite',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench reviewer share'), {
      action: 'startupReviewerInvite',
    });
    assert.deepEqual(parseSparkQaCommand('reviewers policy'), {
      action: 'startupReviewPolicy',
      reviewMode: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers policy mode advisory'), {
      action: 'startupReviewPolicy',
      reviewMode: 'agent_advisory',
    });
    assert.deepEqual(parseSparkQaCommand('reviewers policy mode fast-lab'), {
      action: 'startupReviewPolicy',
      reviewMode: 'fast_lab',
    });
    assert.deepEqual(parseSparkQaCommand('reviewers agents 5'), {
      action: 'startupReviewPolicy',
      agentReviewers: 5,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory'), {
      action: 'startupAdvisoryReview',
      agentReviewers: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory agents 5'), {
      action: 'startupAdvisoryReview',
      agentReviewers: 5,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory dispatch agents 5'), {
      action: 'startupAdvisoryAgentDispatch',
      agentReviewers: 5,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory dispatch'), {
      action: 'startupAdvisoryAgentDispatch',
      agentReviewers: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory dispatch agents 1'), {
      action: 'startupAdvisoryAgentDispatch',
      agentReviewers: 1,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers personas proof-heavy agents 5'), {
      action: 'startupAdvisoryAgentPersonas',
      advisoryPersonaPreset: 'proof_heavy',
      agentReviewers: 5,
    });
    assert.deepEqual(parseSparkQaCommand('advisory agents persona board swarm-heavy reviewers 3'), {
      action: 'startupAdvisoryAgentPersonas',
      advisoryPersonaPreset: 'swarm_heavy',
      agentReviewers: 3,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory status'), {
      action: 'startupAdvisoryAgentStatus',
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory run agents 5'), {
      action: 'startupAdvisoryAgentRun',
      agentReviewers: 5,
      advisorySlot: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory run agents 1'), {
      action: 'startupAdvisoryAgentRun',
      agentReviewers: 1,
      advisorySlot: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory execute 1 slot 1'), {
      action: 'startupAdvisoryAgentRun',
      agentReviewers: 1,
      advisorySlot: 1,
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory ingest /tmp/advisory-result.json'), {
      action: 'startupAdvisoryAgentIngest',
      advisoryResultPath: '/tmp/advisory-result.json',
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory record 1 useful'), {
      action: 'startupAdvisoryReviewRecord',
      advisorySlot: 1,
      advisoryVerdict: 'useful',
    });
    assert.deepEqual(parseSparkQaCommand('reviewers advisory return slot 2 not-useful'), {
      action: 'startupAdvisoryReviewRecord',
      advisorySlot: 2,
      advisoryVerdict: 'not_useful',
    });
    assert.deepEqual(parseSparkQaCommand('reconcile'), {
      action: 'startupReconcile',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench score reconciliation'), {
      action: 'startupReconcile',
    });
    assert.deepEqual(parseSparkQaCommand('showcase'), {
      action: 'startupShowcase',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench demo summary'), {
      action: 'startupShowcase',
    });
    assert.deepEqual(parseSparkQaCommand('loop'), {
      action: 'startupLoopStatus',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench loop status'), {
      action: 'startupLoopStatus',
    });
    assert.deepEqual(parseSparkQaCommand('startup control'), {
      action: 'startupControlPanel',
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence control panel'), {
      action: 'startupControlPanel',
    });
    assert.deepEqual(parseSparkQaCommand('startup control run cycles 100 level 10 agents 5 apply auto'), {
      action: 'startupControlRun',
      level: 10,
      cycles: 100,
      agentReviewers: 5,
      applyPolicy: 'auto_hash_gated',
    });
    assert.deepEqual(parseSparkQaCommand('startup control run cycles 100 level 10 agents 5 proof-heavy apply auto'), {
      action: 'startupControlRun',
      level: 10,
      cycles: 100,
      agentReviewers: 5,
      advisoryPersonaPreset: 'proof_heavy',
      applyPolicy: 'auto_hash_gated',
    });
    assert.deepEqual(parseSparkQaCommand('startup control tick'), {
      action: 'startupControlTick',
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence control next'), {
      action: 'startupControlTick',
    });
    assert.deepEqual(parseSparkQaCommand('startup suite'), {
      action: 'startupSuitePreflight',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench whole bench preflight'), {
      action: 'startupSuitePreflight',
    });
    assert.deepEqual(parseSparkQaCommand('startup suite run'), {
      action: 'startupSuiteRun',
    });
    assert.deepEqual(parseSparkQaCommand('startup reasoning'), {
      action: 'startupReasoningEval',
    });
    assert.deepEqual(parseSparkQaCommand('startup reasoning trials'), {
      action: 'startupReasoningTrials',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench reasoning improvement status'), {
      action: 'startupReasoningEval',
    });
    assert.deepEqual(parseSparkQaCommand('evolve startup-bench cycles 100'), {
      action: 'startupEvolutionPlan',
      cycles: 100,
    });
    assert.deepEqual(parseSparkQaCommand('startup bench evolve 100'), {
      action: 'startupEvolutionPlan',
      cycles: 100,
    });
    assert.deepEqual(parseSparkQaCommand('improve startup-bench level 10 cycles 100 agents 5'), {
      action: 'startupImprovementOrchestrator',
      improvementAction: 'start',
      level: 10,
      cycles: 100,
      agentReviewers: 5,
    });
    assert.deepEqual(parseSparkQaCommand('improve startup-bench level 10 cycles 100 agents 1'), {
      action: 'startupImprovementOrchestrator',
      improvementAction: 'start',
      level: 10,
      cycles: 100,
      agentReviewers: 1,
    });
    assert.deepEqual(parseSparkQaCommand('improve startup-bench resume'), {
      action: 'startupImprovementOrchestrator',
      improvementAction: 'start',
      level: undefined,
      cycles: undefined,
      agentReviewers: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('improve Spark QA Operator level 10 cycles 100 agents 5'), {
      action: 'benchmark',
      specializationPath: 'Spark QA Operator',
      level: 10,
      prompt: 'improve Spark QA Operator level 10 cycles 100 agents 5',
      cycles: 100,
      agentReviewers: 5,
    });
    assert.deepEqual(parseSparkQaCommand('improve Spark QA Operator continue level 10 cycles 100 agents 5'), {
      action: 'benchmark',
      specializationPath: 'Spark QA Operator',
      level: 10,
      prompt: 'improve Spark QA Operator continue level 10 cycles 100 agents 5',
      cycles: 100,
      agentReviewers: 5,
    });
    assert.deepEqual(parseSparkQaCommand('improve Spark QA Operator status'), {
      action: 'qaEvolutionWorker',
      evolutionAction: 'status',
      specializationPath: 'Spark QA Operator',
      level: undefined,
      cycles: undefined,
      agentReviewers: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('improve Spark QA Operator tick'), {
      action: 'qaEvolutionWorker',
      evolutionAction: 'tick',
      specializationPath: 'Spark QA Operator',
      level: undefined,
      cycles: undefined,
      agentReviewers: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('qa cycle run agents 2 cycles 3'), {
      action: 'qaCycleRun',
      cycles: 3,
      proveLimit: undefined,
      agentReviewers: 2,
    });
    assert.deepEqual(parseSparkQaCommand('qa cycle run agents 2 cycles 100 runs 5'), {
      action: 'qaCycleRun',
      cycles: 100,
      proveLimit: 5,
      agentReviewers: 2,
    });
    assert.deepEqual(parseSparkQaCommand('qa cycle status'), {
      action: 'qaCycleStatus',
    });
    assert.deepEqual(parseSparkQaCommand('qa reasoning trials'), {
      action: 'qaReasoningTrials',
    });
    assert.deepEqual(parseSparkQaCommand('qa mutation proposal'), {
      action: 'qaMutationProposal',
    });
    assert.deepEqual(parseSparkQaCommand('qa advisory agents 5'), {
      action: 'qaAdvisoryDispatch',
      agentReviewers: 5,
    });
    assert.deepEqual(parseSparkQaCommand('qa advisory run agents 2'), {
      action: 'qaAdvisoryRun',
      agentReviewers: 2,
    });
    assert.deepEqual(parseSparkQaCommand('qa advisory status'), {
      action: 'qaAdvisoryStatus',
    });
    assert.deepEqual(parseSparkQaCommand('Spark QA Operator swarm packet qa-cycle-1'), {
      action: 'qaSwarmExport',
      runId: 'qa-cycle-1',
    });
    assert.deepEqual(parseSparkQaCommand('improve Custom Sales Agent status level 5 cycles 7 agents 2'), {
      action: 'improvementBoundary',
      improvementAction: 'status',
      specializationPath: 'Custom Sales Agent',
      level: 5,
      cycles: 7,
      agentReviewers: 2,
    });
    assert.match(
      renderSparkQaImprovementBoundary(parseSparkQaCommand('improve Custom Sales Agent status level 5 cycles 7 agents 2')!),
      /does not have a proof\/autoloop mutation adapter yet/,
    );
    assert.deepEqual(parseSparkQaCommand('startup bench improvement tick agents 4'), {
      action: 'startupImprovementOrchestrator',
      improvementAction: 'tick',
      level: undefined,
      cycles: undefined,
      agentReviewers: 4,
    });
    assert.deepEqual(parseSparkQaCommand('startup bench improvement continue agents 4'), {
      action: 'startupImprovementOrchestrator',
      improvementAction: 'start',
      level: undefined,
      cycles: undefined,
      agentReviewers: 4,
    });
    assert.deepEqual(parseSparkQaCommand('improve startup bench status'), {
      action: 'startupImprovementOrchestrator',
      improvementAction: 'status',
      level: undefined,
      cycles: undefined,
      agentReviewers: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence start level 10 cycles 100 agents 5 proof-heavy'), {
      action: 'startupIntelligenceLoop',
      improvementAction: 'start',
      level: 10,
      cycles: 100,
      agentReviewers: 5,
      advisoryPersonaPreset: 'proof_heavy',
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence start level 10 cycles 100 agents 5 apply review-required'), {
      action: 'startupIntelligenceLoop',
      improvementAction: 'start',
      level: 10,
      cycles: 100,
      agentReviewers: 5,
      applyPolicy: 'review_required',
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence smoke level 9 agents 1 dry-run apply'), {
      action: 'startupIntelligenceLoop',
      improvementAction: 'start',
      level: 9,
      cycles: 1,
      agentReviewers: 1,
      applyPolicy: 'dry_run',
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence run 1'), {
      action: 'startupIntelligenceLoop',
      improvementAction: 'start',
      level: undefined,
      cycles: 1,
      agentReviewers: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence 10-cycle run agents 2'), {
      action: 'startupIntelligenceLoop',
      improvementAction: 'start',
      level: undefined,
      cycles: 10,
      agentReviewers: 2,
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence hundred cycle run'), {
      action: 'startupIntelligenceLoop',
      improvementAction: 'start',
      level: undefined,
      cycles: 100,
      agentReviewers: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('improve startup bench start cycles 100 agents 5 auto apply'), {
      action: 'startupImprovementOrchestrator',
      improvementAction: 'start',
      level: undefined,
      cycles: 100,
      agentReviewers: 5,
      applyPolicy: 'auto_hash_gated',
    });
    assert.deepEqual(parseSparkQaCommand('improve startup bench start cycles 100 agents 5 operator-heavy'), {
      action: 'startupImprovementOrchestrator',
      improvementAction: 'start',
      level: undefined,
      cycles: 100,
      agentReviewers: 5,
      advisoryPersonaPreset: 'operator_heavy',
    });
    assert.deepEqual(parseSparkQaCommand('startup superintelligence status'), {
      action: 'startupIntelligenceLoop',
      improvementAction: 'status',
      level: undefined,
      cycles: undefined,
      agentReviewers: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('bring startup superintelligence level 10 cycles 100 agents 5'), {
      action: 'startupIntelligenceLoop',
      improvementAction: 'start',
      level: 10,
      cycles: 100,
      agentReviewers: 5,
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence absorption bundle cases 20'), {
      action: 'startupIntelligenceAbsorption',
      absorptionAction: 'bundle',
      caseLimit: 20,
      execute: false,
    });
    assert.deepEqual(parseSparkQaCommand('startup yc absorption smoke cases 3'), {
      action: 'startupIntelligenceAbsorption',
      absorptionAction: 'smoke',
      caseLimit: 3,
      execute: true,
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence absorption agents cases 2'), {
      action: 'startupIntelligenceAbsorption',
      absorptionAction: 'agents',
      caseLimit: 2,
      execute: true,
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence absorption agents cases 2 reviewers 5'), {
      action: 'startupIntelligenceAbsorption',
      absorptionAction: 'agents',
      caseLimit: 2,
      agentReviewers: 5,
      execute: true,
    });
    assert.deepEqual(parseSparkQaCommand('startup yc absorption fresh agents cases 20'), {
      action: 'startupIntelligenceAbsorption',
      absorptionAction: 'agents',
      caseLimit: 20,
      execute: true,
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence swarm bridge'), {
      action: 'startupIntelligenceBridge',
      runId: undefined,
      cycles: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('startup intelligence bridge nightly-1 cycles 100'), {
      action: 'startupIntelligenceBridge',
      runId: 'nightly-1',
      cycles: 100,
    });
    assert.deepEqual(parseSparkQaCommand('evolution status'), {
      action: 'startupEvolutionWorker',
      evolutionAction: 'status',
      cycles: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('evolve start cycles 100'), {
      action: 'startupEvolutionWorker',
      evolutionAction: 'start',
      cycles: 100,
    });
    assert.deepEqual(parseSparkQaCommand('startup bench evolve tick'), {
      action: 'startupEvolutionWorker',
      evolutionAction: 'tick',
      cycles: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('evolve stop'), {
      action: 'startupEvolutionWorker',
      evolutionAction: 'stop',
      cycles: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('evolve export'), {
      action: 'startupEvolutionExport',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench evolve workspace packet'), {
      action: 'startupEvolutionExport',
    });
    assert.deepEqual(parseSparkQaCommand('export swarm-packet startup-proof-1'), {
      action: 'startupSwarmExport',
      runId: 'startup-proof-1',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench swarm packet'), {
      action: 'startupSwarmExport',
      runId: undefined,
    });
    assert.deepEqual(parseSparkQaCommand('swarm audit'), {
      action: 'startupSwarmAudit',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench swarm bridge'), {
      action: 'startupSwarmAudit',
    });
    assert.deepEqual(parseSparkQaCommand('learning gaps'), {
      action: 'startupSwarmAudit',
    });
    assert.deepEqual(parseSparkQaCommand('mutation handoff'), {
      action: 'startupMutationHandoff',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench mutation bridge'), {
      action: 'startupMutationHandoff',
    });
    assert.deepEqual(parseSparkQaCommand('improve startup'), {
      action: 'startupMutationHandoff',
    });
    assert.deepEqual(parseSparkQaCommand('mutation plan'), {
      action: 'startupMutationPlan',
    });
    assert.deepEqual(parseSparkQaCommand('mutation propose'), {
      action: 'startupMutationProposal',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench mutation llm proposal'), {
      action: 'startupMutationProposal',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench mutation plan'), {
      action: 'startupMutationPlan',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench plan-only'), {
      action: 'startupMutationPlan',
    });
    assert.deepEqual(parseSparkQaCommand('mutation candidate'), {
      action: 'startupMutationCandidate',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench candidate patch'), {
      action: 'startupMutationCandidate',
    });
    assert.deepEqual(parseSparkQaCommand('mutation apply'), {
      action: 'startupMutationApply',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench apply candidate'), {
      action: 'startupMutationApply',
    });
    assert.deepEqual(parseSparkQaCommand('keep-revert'), {
      action: 'startupKeepRevert',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench mutation decision'), {
      action: 'startupKeepRevert',
    });
    assert.deepEqual(parseSparkQaCommand('stability'), {
      action: 'startupStability',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench wall clock status'), {
      action: 'startupStability',
    });
    assert.deepEqual(parseSparkQaCommand('stability queue'), {
      action: 'startupStabilityQueue',
    });
    assert.deepEqual(parseSparkQaCommand('startup bench wall clock resume'), {
      action: 'startupStabilityQueue',
    });
    assert.deepEqual(parseSparkQaCommand('quality'), {
      action: 'quality',
    });
    assert.deepEqual(parseSparkQaCommand('benchmark quality audit'), {
      action: 'quality',
    });
    assert.deepEqual(parseSparkQaCommand('quality repair'), {
      action: 'qualityRepair',
    });
    assert.deepEqual(parseSparkQaCommand('repair benchmark quality'), {
      action: 'qualityRepair',
    });
    assert.deepEqual(parseSparkQaCommand('quality repair run'), {
      action: 'qualityRepairRun',
    });
    assert.deepEqual(parseSparkQaCommand('quality auto 2'), {
      action: 'qualityAuto',
      qualityAutoLimit: 2,
    });
    assert.deepEqual(parseSparkQaCommand('evidence kanban'), {
      action: 'evidence',
    });
    assert.deepEqual(parseSparkQaCommand('guide'), {
      action: 'benchmarkGuide',
      guideAction: 'start',
    });
    assert.deepEqual(parseSparkQaCommand('guide path Spark QA Operator'), {
      action: 'benchmarkGuide',
      guideAction: 'path',
      specializationPath: 'Spark QA Operator',
    });
    assert.deepEqual(parseSparkQaCommand('guide path @SparkQA_bot'), {
      action: 'benchmarkGuide',
      guideAction: 'path',
      specializationPath: 'Spark QA Operator',
    });
    assert.deepEqual(parseSparkQaCommand('guide path YC startup bench'), {
      action: 'benchmarkGuide',
      guideAction: 'path',
      specializationPath: 'Startup Bench',
    });
    assert.deepEqual(parseSparkQaCommand('guide level 10'), {
      action: 'benchmarkGuide',
      guideAction: 'level',
      level: 10,
    });
    assert.deepEqual(parseSparkQaCommand('guide confirm'), {
      action: 'benchmarkGuide',
      guideAction: 'confirm',
    });
    assert.equal(parseSparkQaCommand('benchmark Spark QA Operator level 11'), null);
    assert.equal(isSparkQaOperatorKey('path:spark-qa-operator'), true);
    assert.equal(isSparkQaOperatorKey('QA'), true);
    assert.equal(isSparkQaOperatorKey('@SparkQA_bot'), true);
    assert.equal(isSparkQaOperatorKey('Startup Bench'), false);
  });

  await test('renders the latest bound Startup Bench dossier instead of stale readiness blockers', async () => {
    const repo = makeFakeSparkQaRepo();
    const dossierPath = writeBoundStartupBenchDossier(repo);
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      const result = await readLatestStartupBenchDossier();
      assert.equal(result.ok, true);
      assert.equal(result.dossierPath, dossierPath);
      const reply = renderStartupBenchDossier(result);
      assert.match(reply, /baseline 0\.641, candidate 0\.866 \(\+0\.225\)/);
      assert.match(reply, /allows the improvement claim/);
      assert.match(reply, /Public-ready and network-absorbable are still separate release decisions/);
      assert.match(reply, /Inspect:/);
      assert.doesNotMatch(reply, /sidecar 0\/1|wall-clock waiting|Score claim is still blocked/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('builds conductor and benchmark creator argv without shell strings', () => {
    assert.deepEqual(buildSparkQaAutoloopRoundArgs({ outputRoot: '/tmp/run', timeoutSeconds: 5 }), [
      '-m',
      'specialization_path_spark_qa_operator.cli',
      'autoloop-round',
      '--output-root',
      '/tmp/run',
      '--timeout-seconds',
      '5',
    ]);
    assert.deepEqual(buildSparkQaAutoloopRoundArgs({ outputRoot: '/tmp/run', timeoutSeconds: 5, casesPath: '/tmp/pack.json' }), [
      '-m',
      'specialization_path_spark_qa_operator.cli',
      'autoloop-round',
      '--output-root',
      '/tmp/run',
      '--timeout-seconds',
      '5',
      '--cases',
      '/tmp/pack.json',
    ]);
    assert.deepEqual(buildSparkQaBenchmarkCreatorArgs({
      specializationPath: 'Spark QA Operator',
      level: 10,
      outputDir: '/tmp/creator',
      prompt: 'level 10',
    }), [
      '-m',
      'specialization_path_spark_qa_operator.cli',
      'benchmark-creator-prd',
      '--specialization-path',
      'Spark QA Operator',
      '--level',
      '10',
      '--prompt',
      'level 10',
      '--output-dir',
      '/tmp/creator',
    ]);
    assert.deepEqual(buildSparkQaEvidenceCapturePlanArgs({
      benchmarkPack: '/tmp/pack.json',
      evidenceRoot: '/tmp/evidence',
      outputDir: '/tmp/capture',
      jobId: 'job-1',
      evidenceResult: '/tmp/result.json',
    }), [
      '-m',
      'specialization_path_spark_qa_operator.cli',
      'evidence-capture-plan',
      '--benchmark-pack',
      '/tmp/pack.json',
      '--evidence-root',
      '/tmp/evidence',
      '--output-dir',
      '/tmp/capture',
      '--job-id',
      'job-1',
      '--evidence-result',
      '/tmp/result.json',
    ]);
    assert.deepEqual(buildSparkQaEvidenceCaptureRunArgs({
      benchmarkPack: '/tmp/pack.json',
      evidenceRoot: '/tmp/evidence',
      outputDir: '/tmp/capture-run',
      jobId: 'job-1',
      limit: 7,
    }), [
      '-m',
      'specialization_path_spark_qa_operator.cli',
      'evidence-capture-run',
      '--benchmark-pack',
      '/tmp/pack.json',
      '--evidence-root',
      '/tmp/evidence',
      '--output-dir',
      '/tmp/capture-run',
      '--job-id',
      'job-1',
      '--limit',
      '7',
    ]);
    assert.deepEqual(buildSparkQaEvidenceReviewQueueArgs({
      benchmarkPack: '/tmp/pack.json',
      evidenceRoot: '/tmp/evidence',
      outputDir: '/tmp/review',
      jobId: 'job-1',
    }), [
      '-m',
      'specialization_path_spark_qa_operator.cli',
      'evidence-review-queue',
      '--benchmark-pack',
      '/tmp/pack.json',
      '--evidence-root',
      '/tmp/evidence',
      '--output-dir',
      '/tmp/review',
      '--job-id',
      'job-1',
    ]);
    assert.deepEqual(buildSparkQaEvidenceAttestArgs({
      benchmarkPack: '/tmp/pack.json',
      evidenceRoot: '/tmp/evidence',
      outputDir: '/tmp/review',
      jobId: 'job-1',
      caseId: 'case-1',
      decision: 'observed',
      reviewerId: 'telegram:1',
      notes: 'reviewed',
    }), [
      '-m',
      'specialization_path_spark_qa_operator.cli',
      'evidence-attest',
      '--benchmark-pack',
      '/tmp/pack.json',
      '--evidence-root',
      '/tmp/evidence',
      '--output-dir',
      '/tmp/review',
      '--case-id',
      'case-1',
      '--decision',
      'observed',
      '--reviewer-id',
      'telegram:1',
      '--reviewer-kind',
      'telegram_admin',
      '--job-id',
      'job-1',
      '--notes',
      'reviewed',
    ]);
  });

  await test('lists specialization adapter capabilities without implying generic proof support', () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      const result = runSparkQaSpecializationPaths({ repoRoot: repo });
      assert.equal(result.ok, true);
      assert.equal(result.registry.schemaVersion, 'spark-qa-specialization-adapter-registry.v1');
      assert.equal(result.registry.adapters[0]?.key, 'spark-qa-operator');
      assert.equal(result.registry.adapters[0]?.ready, true);
      assert.equal(result.registry.adapters[0]?.capabilities.proof_autoloop, true);
      const startup = result.registry.adapters.find((adapter) => adapter.key === 'startup-bench');
      assert.equal(startup?.label, 'Startup Bench');
      assert.equal(startup?.ready, true);
      assert.equal(startup?.capabilities.benchmark_create, true);
      assert.equal(startup?.capabilities.spark_swarm_packet, true);
      assert.equal(startup?.capabilities.evidence_capture, true);
      assert.equal(startup?.capabilities.proof_autoloop, true);
      assert.equal(startup?.capabilities.score_claim, false);
      assert.equal(result.registry.unknownPathPolicy.proofAutoloopAllowed, false);
      assert.equal(result.registry.unknownPathPolicy.scoreClaimAllowed, false);
      const reply = renderSparkQaSpecializationPaths(result);
      assert.match(reply, /Spark QA Operator: repo connected/);
      assert.match(reply, /Startup Bench: repo connected/);
      assert.match(reply, /Custom paths can still stage benchmark packs/);
      assert.match(reply, /proof\/autoloop scoring stays blocked/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldStartupBench === undefined) delete process.env.SPARK_STARTUP_BENCH_REPO;
      else process.env.SPARK_STARTUP_BENCH_REPO = oldStartupBench;
      if (oldStartupOperator === undefined) delete process.env.SPARK_STARTUP_OPERATOR_REPO;
      else process.env.SPARK_STARTUP_OPERATOR_REPO = oldStartupOperator;
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('persists Telegram-selected Startup Bench advisory persona boards', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const proofEndedAt = new Date().toISOString();
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      writeLatestProof(repo, {
        schemaVersion: 'spark-startup-bench-proof-adapter.v1',
        generatedAt: proofEndedAt,
        run: { status: 'blocked', endedAt: proofEndedAt },
        runnerProofReady: true,
        startupBench: { seeds: [1, 2, 3] },
        commands: [],
        artifacts: [],
        privateScoreSummary: {
          baseline: { scenarioScore: 0.62, runCount: 3 },
          candidate: { scenarioScore: 0.64, runCount: 3 },
          comparison: { metric: 'scenario_score', candidateMinusBaseline: 0.02, candidateBeatsBaseline: true },
        },
        promotionDossier: {
          status: 'blocked',
          scoreClaimAllowed: false,
          public_ready: false,
          network_absorbable: false,
          blockers: ['sidecar_review_pending'],
        },
      });

      const proofHeavyLabels = [
        'Proof Integrity Auditor',
        'Benchmark Anti-Gaming Reviewer',
        'Tool Trace Analyst',
        'Proof Integrity Auditor',
        'Startup Operator Strategist',
      ];
      const profile = await syncSparkQaStartupBenchAdvisoryAgentPersonaProfile({
        repoRoot: repo,
        personaPreset: 'proof_heavy',
        agentReviewers: 5,
      });
      assert.equal(profile.ok, true);
      assert.equal(profile.profile?.personaPreset, 'proof_heavy');
      assert.deepEqual(profile.profile?.personaDeck.map((persona) => persona.label), proofHeavyLabels);
      assert.match(renderSparkQaStartupBenchAdvisoryAgentPersonaProfile(profile), /proof heavy/);
      assert.match(renderSparkQaStartupBenchAdvisoryAgentPersonaProfile(profile), /mutation guidance only/);

      const dispatch = await syncSparkQaStartupBenchAdvisoryAgentDispatch({ repoRoot: repo });
      assert.equal(dispatch.ok, true);
      assert.equal(dispatch.roster?.targetReviewers, 5);
      assert.deepEqual(dispatch.roster?.personaDeck.map((persona) => persona.label), proofHeavyLabels);
      assert.equal(dispatch.roster?.scoreClaimAllowed, false);
      assert.equal(dispatch.roster?.network_absorbable, false);

      const resizedProfile = await syncSparkQaStartupBenchAdvisoryAgentPersonaProfile({
        repoRoot: repo,
        agentReviewers: 3,
      });
      assert.equal(resizedProfile.profile?.personaPreset, 'proof_heavy');
      assert.deepEqual(resizedProfile.profile?.personaDeck.map((persona) => persona.label), proofHeavyLabels.slice(0, 3));
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('discovers Startup Bench sibling repos from configured Spark QA workspace', async () => {
    const workspace = mkdtempSync(path.join(tmpdir(), 'spark-qa-startup-workspace-'));
    const repo = makeFakeSparkQaRepo(path.join(workspace, 'specialization-path-spark-qa-operator'));
    makeFakeStartupBenchRepo(path.join(workspace, 'startup-bench'));
    makeFakeStartupOperatorRepo(path.join(workspace, 'specialization-path-startup-operator'));
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      delete process.env.SPARK_STARTUP_BENCH_REPO;
      delete process.env.SPARK_STARTUP_OPERATOR_REPO;
      const paths = runSparkQaSpecializationPaths();
      const startup = paths.registry.adapters.find((adapter) => adapter.key === 'startup-bench');
      assert.equal(paths.repoRoot, repo);
      assert.equal(startup?.ready, true);
      assert.match(String(startup?.repoRoot), /startup-bench$/);
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
        prompt: 'create level 10 benchmarks for Startup Bench',
      });
      assert.equal(creator.ok, true);
      assert.equal(creator.benchmarkJob?.proofAdapterReady, true);
      assert.equal(creator.benchmarkJob?.nextGate, 'run_fresh_benchmark_autoloop');
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldStartupBench === undefined) delete process.env.SPARK_STARTUP_BENCH_REPO;
      else process.env.SPARK_STARTUP_BENCH_REPO = oldStartupBench;
      if (oldStartupOperator === undefined) delete process.env.SPARK_STARTUP_OPERATOR_REPO;
      else process.env.SPARK_STARTUP_OPERATOR_REPO = oldStartupOperator;
      rmSync(workspace, { recursive: true, force: true });
    }
  });

  await test('treats blocked autoloop proof exit as real evidence without claiming a score', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldMaxAge = process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS = String(3650 * 24 * 60 * 60 * 1000);
      assert.equal(resolveSparkQaOperatorRepo(), repo);
      const result = await runSparkQaAutoloopRound({ outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'test') });
      assert.equal(result.ok, true);
      assert.equal(result.commandExitCode, 1);
      assert.equal(result.report?.promotionDossier?.scoreClaimAllowed, false);
      const reply = renderSparkQaAutoloopRound(result);
      assert.match(reply, /ran the benchmark\/autoloop proof/);
      assert.match(reply, /would not claim an upgrade yet/);
      assert.match(reply, /Candidate replay moved 0 -> 1/);
      assert.doesNotMatch(reply, /cleared the benchmark-backed score claim/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldMaxAge === undefined) delete process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS;
      else process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS = oldMaxAge;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('selects a generated benchmark job and binds autoloop runs to its pack hash', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldMaxAge = process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS = String(3650 * 24 * 60 * 60 * 1000);
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'QA',
        level: 10,
        prompt: 'create level 10 benchmarks for QA',
        requestedCycles: 100,
        advisoryAgents: 5,
      });
      assert.equal(creator.ok, true);
      assert.equal(creator.specializationPath, 'Spark QA Operator');
      assert.equal(creator.benchmarkJob?.level, 10);
      assert.equal(creator.benchmarkJob?.specializationPath, 'Spark QA Operator');
      assert.equal(creator.benchmarkJob?.specializationAdapterKey, 'spark-qa-operator');
      assert.equal(creator.benchmarkJob?.runnerModule, 'specialization_path_spark_qa_operator.cli');
      assert.equal(creator.benchmarkJob?.requestedCycles, 100);
      assert.equal(creator.benchmarkJob?.advisoryAgents, 5);
      assert.equal(creator.benchmarkJob?.qualityPass, true);
      assert.equal(creator.benchmarkJob?.standardization?.system, 'Spark Domain Chip Labs');
      assert.equal(creator.benchmarkJob?.standardization?.contracts.benchmark, 'spark-domain-chip-labs.benchmark-contract.v1');
      assert.equal(creator.workboard?.ok, true);
      assert.equal(creator.workboard?.workboard?.benchmarkLevel, 10);
      assert.equal(creator.workboard?.workboard?.requestedLoop.cycles, 100);
      assert.equal(creator.workboard?.workboard?.requestedLoop.advisoryAgents, 5);
      assert.equal(creator.workboard?.workboard?.requestedLoop.status, 'preserved_for_future_adapter');
      assert.equal(creator.workboard?.workboard?.standardization.contracts.swarmAdapter, 'spark-domain-chip-labs.swarm-adapter-contract.v1');
      assert.ok(creator.workboard?.workboardPath && existsSync(creator.workboard.workboardPath));
      assert.ok(creator.workboard?.kanbanPath && existsSync(creator.workboard.kanbanPath));

      const active = readActiveSparkQaBenchmarkJob(repo);
      assert.equal(active.ok, true);
      assert.equal(active.job?.artifactHashes.benchmarkPackSha256, creator.benchmarkJob?.artifactHashes.benchmarkPackSha256);
      const paths = runSparkQaSpecializationPaths({ repoRoot: repo });
      assert.equal(paths.activeJob?.jobId, active.job?.jobId);
      assert.equal(paths.activeAdapter?.key, 'spark-qa-operator');
      assert.match(renderSparkQaSpecializationPaths(paths), /using the Spark QA Operator adapter/);

      const result = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'job-bound'),
      });
      assert.equal(result.ok, true);

      const qaAdvisoryDispatch = syncSparkQaOperatorAdvisoryDispatch({ repoRoot: repo, agentReviewers: 5 });
      assert.equal(qaAdvisoryDispatch.ok, true, qaAdvisoryDispatch.error);
      assert.equal(qaAdvisoryDispatch.roster?.schemaVersion, 'spark-qa-operator-advisory-roster.v1');
      assert.equal(qaAdvisoryDispatch.roster?.targetReviewers, 5);
      assert.equal(qaAdvisoryDispatch.roster?.returnedReviewers, 0);
      assert.equal(qaAdvisoryDispatch.roster?.scoreClaimAllowed, false);
      assert.ok(qaAdvisoryDispatch.rosterPath && existsSync(qaAdvisoryDispatch.rosterPath));

      const qaProviderPrompts: string[] = [];
      const qaProviderRun = await runSparkQaOperatorAdvisoryAgents({
        repoRoot: repo,
        agentReviewers: 2,
        providerLabel: 'test-qa-operator-provider',
        provider: async (prompt, context) => {
          qaProviderPrompts.push(prompt);
          return JSON.stringify({
            schemaVersion: 'spark-qa-operator-advisory-result.v1',
            generatedAt: new Date().toISOString(),
            slot: context.slot,
            reviewerKind: 'llm_adapter',
            verdict: 'useful',
            proofReportSha256: context.roster.proofReport?.sha256 || null,
            focusId: context.agent.focus?.id,
            hypothesis: 'Add a provider-suggested guard to the QA runtime policy profile.',
            failureFamilies: ['provider_claim_boundary_gap'],
            mutationRecommendations: ['Require advisory-backed proof review before mutation proposal closure.'],
            reasoningFocus: ['distinguish proven benchmark state from aspirational improvement language'],
            toolUseExpectations: ['read latest proof manifest before writing any score-facing reply'],
            recommendedGuards: ['provider_guard'],
            riskNotes: ['provider output must still pass deterministic ingest'],
            scoreClaimAllowed: context.slot === 2,
            improvementClaimAllowed: false,
            public_ready: false,
            network_absorbable: false,
          }, null, 2);
        },
      });
      assert.equal(qaProviderRun.ok, true, qaProviderRun.error);
      assert.equal(qaProviderRun.run?.providerLabel, 'test-qa-operator-provider');
      assert.deepEqual(qaProviderRun.run?.acceptedSlots, [1]);
      assert.equal(qaProviderRun.run?.failedSlots.length, 1);
      assert.match(qaProviderRun.run?.failedSlots[0]?.blocker || '', /scoreClaimAllowed_must_be_false/);
      assert.equal(qaProviderRun.roster?.returnedReviewers, 1);
      assert.equal(qaProviderPrompts.length, 2);

      const qaAdvisoryRun = await runSparkQaOperatorAdvisoryAgents({ repoRoot: repo, agentReviewers: 5 });
      assert.equal(qaAdvisoryRun.ok, true, qaAdvisoryRun.error);
      assert.equal(qaAdvisoryRun.roster?.returnedReviewers, 5);
      assert.equal(qaAdvisoryRun.roster?.useful, 5);
      assert.equal(qaAdvisoryRun.run?.providerLabel, SPARK_QA_LOCAL_OPERATOR_ADVISORY_PROVIDER_LABEL);
      assert.equal(qaAdvisoryRun.run?.scoreClaimAllowed, false);
      assert.ok(qaAdvisoryRun.runPath && existsSync(qaAdvisoryRun.runPath));

      const qaAdvisoryStatus = readSparkQaOperatorAdvisoryStatus({ repoRoot: repo });
      assert.equal(qaAdvisoryStatus.ok, true, qaAdvisoryStatus.error);
      assert.equal(qaAdvisoryStatus.roster?.status, 'ready_for_mutation_proposal');

      const qaProposal = syncSparkQaOperatorMutationProposal({ repoRoot: repo });
      assert.equal(qaProposal.ok, true, qaProposal.error);
      assert.equal(qaProposal.proposal?.schemaVersion, 'spark-qa-operator-mutation-proposal.v1');
      assert.equal(qaProposal.proposal?.status, 'proposal_ready');
      assert.equal(qaProposal.proposal?.selectedTicketId, 'qa-operator-claim-boundary-mutation');
      assert.equal(qaProposal.proposal?.advisoryRationale?.advisoryConsensus?.returnedReviewers, 5);
      assert.ok(qaProposal.proposal?.advisoryRationale?.recommendedGuards.includes('provider_guard'));
      assert.ok(qaProposal.proposal?.advisoryRationale?.failureFamilies.includes('provider_claim_boundary_gap'));
      assert.ok(qaProposal.proposal?.advisoryRationale?.mutationRecommendations.includes('Require advisory-backed proof review before mutation proposal closure.'));
      assert.ok(qaProposal.proposal?.advisoryRationale?.reasoningFocus.includes('distinguish proven benchmark state from aspirational improvement language'));
      assert.ok(qaProposal.proposal?.advisoryRationale?.toolUseExpectations.includes('read latest proof manifest before writing any score-facing reply'));
      assert.ok(qaProposal.proposal?.advisoryRationale?.recommendedGuards.includes('score_claim_fresh_proof_guard'));
      assert.ok(qaProposal.proposal?.advisoryRationale?.recommendedGuards.includes('private_swarm_export_boundary_guard'));
      assert.equal(qaProposal.proposal?.scoreClaimAllowed, false);
      assert.equal(qaProposal.proposal?.public_ready, false);
      assert.ok(qaProposal.proposalPath && existsSync(qaProposal.proposalPath));
      assert.ok(qaProposal.promptPath && existsSync(qaProposal.promptPath));
      assert.ok(qaProposal.kanbanPath && existsSync(qaProposal.kanbanPath));

      const qaEvolution = syncSparkQaOperatorEvolutionWorker({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
        advisoryAgents: 5,
      });
      assert.equal(qaEvolution.state?.schemaVersion, 'spark-qa-operator-evolution-worker-state.v1');
      assert.equal(qaEvolution.state?.requestedCycles, 100);
      assert.equal(qaEvolution.state?.advisoryAgents, 5);
      assert.equal(qaEvolution.state?.tickCount, 1);
      assert.equal(qaEvolution.state?.mutationAdapterReady, true);
      assert.equal(qaEvolution.state?.mutationApplicationReady, true);
      assert.equal(qaEvolution.state?.mutation.status, 'applied');
      assert.equal(qaEvolution.state?.mutation.selectedTicketId, 'qa-operator-claim-boundary-mutation');
      assert.equal(qaEvolution.state?.mutation.mutationApplied, true);
      assert.equal(qaEvolution.state?.scoreClaimAllowed, false);
      assert.equal(qaEvolution.state?.improvementClaimAllowed, false);
      assert.ok(qaEvolution.state?.blockers.includes('qa_operator_keep_revert_not_closed'));
      assert.equal(qaEvolution.state?.keepRevert.status, 'hold_pending_fresh_proof');
      assert.equal(qaEvolution.state?.keepRevert.cycleClosureAllowed, false);
      assert.equal(qaEvolution.state?.cycleLedger.completedCycles, 0);
      assert.ok(qaEvolution.statePath && existsSync(qaEvolution.statePath));
      assert.ok(qaEvolution.state?.mutation.handoffPath && existsSync(qaEvolution.state.mutation.handoffPath));
      assert.ok(qaEvolution.state?.mutation.planPath && existsSync(qaEvolution.state.mutation.planPath));
      assert.ok(qaEvolution.state?.mutation.proposalPath && existsSync(qaEvolution.state.mutation.proposalPath));
      assert.ok(qaEvolution.state?.mutation.candidatePath && existsSync(qaEvolution.state.mutation.candidatePath));
      assert.ok(qaEvolution.state?.mutation.applyPath && existsSync(qaEvolution.state.mutation.applyPath));
      assert.ok(qaEvolution.state?.mutation.policyLedgerPath && existsSync(qaEvolution.state.mutation.policyLedgerPath));
      assert.ok(qaEvolution.state?.mutation.runtimePolicyProfilePath && existsSync(qaEvolution.state.mutation.runtimePolicyProfilePath));
      assert.ok(qaEvolution.state?.mutation.sourcePatchReadinessPath && existsSync(qaEvolution.state.mutation.sourcePatchReadinessPath));
      assert.ok(qaEvolution.state?.mutation.sourcePatchCandidatePath && existsSync(qaEvolution.state.mutation.sourcePatchCandidatePath));
      assert.ok(qaEvolution.state?.mutation.sourcePatchValidationPath && existsSync(qaEvolution.state.mutation.sourcePatchValidationPath));
      assert.equal(qaEvolution.state?.mutation.sourcePatchAdapterReady, false);
      assert.ok(qaEvolution.state?.keepRevert.decisionPath && existsSync(qaEvolution.state.keepRevert.decisionPath));
      assert.ok(qaEvolution.state?.cycleLedger.path && existsSync(qaEvolution.state.cycleLedger.path));
      const mutationPlan = JSON.parse(readFileSync(qaEvolution.state.mutation.planPath, 'utf-8'));
      assert.equal(mutationPlan.planOnlyDispatch.adapterKey, 'spark-qa-operator-runtime-policy-adapter');
      assert.equal(mutationPlan.planOnlyDispatch.mode, 'adapter_backed_runtime_policy_plan');
      assert.equal(mutationPlan.blockers.includes('qa_operator_candidate_apply_not_implemented'), false);
      const mutationCandidate = JSON.parse(readFileSync(qaEvolution.state.mutation.candidatePath, 'utf-8'));
      assert.equal(mutationCandidate.mutation.kind, 'adapter_backed_runtime_policy_profile_patch');
      assert.equal(mutationCandidate.mutation.adapterKey, 'spark-qa-operator-runtime-policy-adapter');
      assert.ok(mutationCandidate.mutation.adapterContract.targetSurfaces.includes('telegram_score_claim_boundary'));
      assert.ok(mutationCandidate.mutation.adapterContract.validationChecks.includes('fresh_proof_after_apply_required'));
      assert.ok(mutationCandidate.mutation.adapterContract.forbiddenWrites.includes('source_code_until_source_patch_adapter_exists'));
      assert.equal(mutationCandidate.mutation.sourcePatchAdapter.futureSourcePatchAdapterReady, false);
      assert.match(mutationCandidate.mutation.sourcePatchAdapter.readinessPath, /source_patch_adapter_readiness\.json$/);
      const sourcePatchReadiness = JSON.parse(readFileSync(qaEvolution.state.mutation.sourcePatchReadinessPath, 'utf-8'));
      assert.equal(sourcePatchReadiness.schemaVersion, 'spark-qa-operator-source-patch-adapter-readiness.v1');
      assert.equal(sourcePatchReadiness.status, 'not_ready');
      assert.equal(sourcePatchReadiness.sourcePatchAdapter.futureSourcePatchAdapterReady, false);
      assert.ok(sourcePatchReadiness.sourcePatchAdapter.requiredValidators.includes('bounded_reverse_patch'));
      assert.ok(sourcePatchReadiness.blockers.includes('source_patch_adapter_not_implemented'));
      const sourcePatchCandidate = JSON.parse(readFileSync(qaEvolution.state.mutation.sourcePatchCandidatePath, 'utf-8'));
      assert.equal(sourcePatchCandidate.schemaVersion, 'spark-qa-operator-source-patch-candidate.v1');
      assert.equal(sourcePatchCandidate.status, 'blocked_not_applied');
      assert.equal(sourcePatchCandidate.patch.applyAllowed, false);
      assert.equal(sourcePatchCandidate.target.file, 'src/sparkQaOperator.ts');
      assert.ok(sourcePatchCandidate.target.before.sha256);
      assert.ok(sourcePatchCandidate.validatorPlan.missingValidators.includes('bounded_reverse_patch'));
      assert.ok(sourcePatchCandidate.blockers.includes('source_patch_candidate_forward_patch_missing'));
      const sourcePatchValidation = JSON.parse(readFileSync(qaEvolution.state.mutation.sourcePatchValidationPath, 'utf-8'));
      assert.equal(sourcePatchValidation.schemaVersion, 'spark-qa-operator-source-patch-validation.v1');
      assert.equal(sourcePatchValidation.status, 'blocked');
      assert.equal(sourcePatchValidation.applyAllowed, false);
      assert.equal(sourcePatchValidation.validatorPasses.target_file_hash_before_after, true);
      assert.equal(sourcePatchValidation.validatorPasses.candidate_non_applying, true);
      assert.ok(sourcePatchValidation.extraPassedChecks.includes('target_allowlist'));
      assert.ok(sourcePatchValidation.missingValidators.includes('bounded_forward_patch'));
      assert.ok(sourcePatchValidation.blockers.includes('source_patch_apply_not_enabled'));
      const runtimeProfile = JSON.parse(readFileSync(qaEvolution.state.mutation.runtimePolicyProfilePath, 'utf-8'));
      assert.equal(runtimeProfile.schemaVersion, 'spark-qa-operator-runtime-policy-profile.v1');
      assert.equal(runtimeProfile.selectedTicketId, 'qa-operator-claim-boundary-mutation');
      assert.equal(runtimeProfile.sourceProposal.path, qaProposal.proposalPath);
      assert.equal(runtimeProfile.mutationAdapter.adapterKey, 'spark-qa-operator-runtime-policy-adapter');
      assert.equal(runtimeProfile.mutationAdapter.futureSourcePatchAdapterReady, false);
      assert.ok(runtimeProfile.activeGuards.includes('score_claim_fresh_proof_guard'));
      assert.ok(runtimeProfile.selfImprovementHypothesis.failureFamilies.includes('provider_claim_boundary_gap'));
      assert.ok(runtimeProfile.selfImprovementHypothesis.mutationRecommendations.includes('Require advisory-backed proof review before mutation proposal closure.'));
      assert.ok(runtimeProfile.selfImprovementHypothesis.reasoningFocus.includes('distinguish proven benchmark state from aspirational improvement language'));
      assert.ok(runtimeProfile.selfImprovementHypothesis.toolUseExpectations.includes('read latest proof manifest before writing any score-facing reply'));
      assert.equal(runtimeProfile.scoreClaimAllowed, false);
      assert.equal(runtimeProfile.public_ready, false);
      const mutationApply = JSON.parse(readFileSync(qaEvolution.state.mutation.applyPath, 'utf-8'));
      assert.equal(mutationApply.mutationAdapter.adapterKey, 'spark-qa-operator-runtime-policy-adapter');
      assert.equal(mutationApply.validation.allowedWritesRespected, true);
      assert.deepEqual(mutationApply.validation.forbiddenWritesTouched, []);
      const qaEvolutionReply = renderSparkQaOperatorEvolutionWorker(qaEvolution);
      assert.match(qaEvolutionReply, /Spark QA Operator evolution is waiting for fresh proof/);
      assert.match(qaEvolutionReply, /QA mutation is applied through the local runtime-policy adapter/);
      assert.match(qaEvolutionReply, /source-code mutation remains blocked until the source-patch adapter is ready/);
      assert.match(qaEvolutionReply, /Keep\/revert is waiting for a fresh proof after the QA runtime-policy adapter apply/);
      assert.match(qaEvolutionReply, /5 advisory agents/);
      assert.match(qaEvolutionReply, /Upgrade claims stay blocked/);
      assert.doesNotMatch(qaEvolutionReply, /scoreClaimAllowed=true|improvement claim is allowed|public_ready=true|network_absorbable=true/);

      const latestManifestPath = path.join(repo, '.spark-swarm', 'autoloop', 'latest_run.json');
      const latestManifest = JSON.parse(readFileSync(latestManifestPath, 'utf-8'));
      const proofReportPath = latestManifest.reportPath;
      const proofReport = JSON.parse(readFileSync(proofReportPath, 'utf-8'));
      const applyPacket = JSON.parse(readFileSync(qaEvolution.state.mutation.applyPath, 'utf-8'));
      const postApplyGeneratedAt = new Date(new Date(applyPacket.generatedAt).getTime() + 1000).toISOString();
      proofReport.generatedAt = postApplyGeneratedAt;
      proofReport.run.endedAt = postApplyGeneratedAt;
      const proofText = JSON.stringify(proofReport, null, 2) + '\n';
      writeFileSync(proofReportPath, proofText, 'utf-8');
      latestManifest.generatedAt = postApplyGeneratedAt;
      latestManifest.reportSha256 = createHash('sha256').update(proofText).digest('hex');
      writeFileSync(latestManifestPath, JSON.stringify(latestManifest), 'utf-8');

      const closedQaEvolution = syncSparkQaOperatorEvolutionWorker({
        repoRoot: repo,
        action: 'status',
      });
      assert.equal(closedQaEvolution.state?.keepRevert.status, 'keep_private');
      assert.equal(closedQaEvolution.state?.keepRevert.cycleClosureAllowed, true);
      assert.equal(closedQaEvolution.state?.completedCycles, 1);
      assert.equal(closedQaEvolution.state?.cycleLedger.completedCycles, 1);
      assert.equal(closedQaEvolution.state?.scoreClaimAllowed, false);
      assert.equal(closedQaEvolution.state?.improvementClaimAllowed, false);
      assert.doesNotMatch(renderSparkQaOperatorEvolutionWorker(closedQaEvolution), /scoreClaimAllowed=true|public_ready=true|network_absorbable=true/);
      const qaReasoning = syncSparkQaOperatorReasoningTrials({ repoRoot: repo });
      assert.equal(qaReasoning.ok, true, qaReasoning.error);
      assert.equal(qaReasoning.baselineTrials?.schemaVersion, 'spark-qa-operator-reasoning-trials.v1');
      assert.equal(qaReasoning.candidateTrials?.schemaVersion, 'spark-qa-operator-reasoning-trials.v1');
      assert.equal(qaReasoning.judgeReport?.schemaVersion, 'spark-qa-operator-reasoning-judge.v1');
      assert.equal(qaReasoning.judgeReport?.trialCount, 3);
      assert.ok(Number(qaReasoning.judgeReport?.delta) > 0);
      assert.equal(qaReasoning.judgeReport?.reasoningImprovementClaimAllowed, false);
      assert.equal(qaReasoning.judgeReport?.claimableReasoningImprovementObserved, false);
      assert.equal(qaReasoning.judgeReport?.scoreClaimAllowed, false);
      assert.equal(qaReasoning.judgeReport?.public_ready, false);
      assert.equal(qaReasoning.judgeReport?.network_absorbable, false);
      assert.equal(qaReasoning.candidateTrials?.trials?.[0]?.observableSignals?.runtimePolicyProfileApplied, true);
      assert.ok(qaReasoning.candidateTrials?.trials?.[0]?.observableSignals?.runtimePolicyActiveGuards?.includes('score_claim_fresh_proof_guard'));
      assert.ok(qaReasoning.baselinePath && existsSync(qaReasoning.baselinePath));
      assert.ok(qaReasoning.candidatePath && existsSync(qaReasoning.candidatePath));
      assert.ok(qaReasoning.judgePath && existsSync(qaReasoning.judgePath));
      assert.ok(qaReasoning.kanbanPath && existsSync(qaReasoning.kanbanPath));

      const qaSwarm = syncSparkQaOperatorSwarmExport({ repoRoot: repo, runId: 'qa-private-cycle-1' });
      assert.equal(qaSwarm.ok, true);
      assert.equal(qaSwarm.packet?.schemaVersion, 'spark-qa-operator-spark-swarm-export.v1');
      assert.equal(qaSwarm.packet?.packetId, 'qa-private-cycle-1');
      assert.equal(qaSwarm.packet?.loopStatusPacket?.cycleLedger?.completedCycles, 1);
      assert.equal(qaSwarm.packet?.loopStatusPacket?.mutationAdapter?.runtimePolicyAdapterReady, true);
      assert.equal(qaSwarm.packet?.loopStatusPacket?.mutationAdapter?.runtimePolicyApplied, true);
      assert.equal(qaSwarm.packet?.loopStatusPacket?.mutationAdapter?.sourcePatchAdapterReady, false);
      assert.equal(qaSwarm.packet?.loopStatusPacket?.mutationAdapter?.sourcePatchCandidateStatus, 'blocked_not_applied');
      assert.equal(qaSwarm.packet?.loopStatusPacket?.mutationAdapter?.sourcePatchValidationStatus, 'blocked');
      assert.ok(qaSwarm.packet?.loopStatusPacket?.mutationAdapter?.sourcePatchMissingValidators.includes('bounded_forward_patch'));
      assert.ok(qaSwarm.packet?.loopStatusPacket?.mutationAdapter?.sourcePatchRequiredValidators.includes('bounded_reverse_patch'));
      assert.ok(qaSwarm.packet?.artifacts.some((artifact: { role?: string }) => artifact.role === 'source_patch_readiness'));
      assert.ok(qaSwarm.packet?.artifacts.some((artifact: { role?: string }) => artifact.role === 'source_patch_candidate'));
      assert.ok(qaSwarm.packet?.artifacts.some((artifact: { role?: string }) => artifact.role === 'source_patch_validation'));
      assert.equal(qaSwarm.packet?.loopStatusPacket?.reasoning?.trialCount, 3);
      assert.equal(qaSwarm.packet?.loopStatusPacket?.reasoning?.reasoningImprovementClaimAllowed, false);
      assert.ok(qaSwarm.packet?.loopStatusPacket?.selfImprovementHypothesis?.failureFamilies.includes('provider_claim_boundary_gap'));
      assert.ok(qaSwarm.packet?.loopStatusPacket?.selfImprovementHypothesis?.mutationRecommendations.includes('Require advisory-backed proof review before mutation proposal closure.'));
      assert.ok(qaSwarm.packet?.loopStatusPacket?.selfImprovementHypothesis?.reasoningFocus.includes('distinguish proven benchmark state from aspirational improvement language'));
      assert.ok(qaSwarm.packet?.loopStatusPacket?.selfImprovementHypothesis?.toolUseExpectations.includes('read latest proof manifest before writing any score-facing reply'));
      assert.equal(qaSwarm.packet?.scoreClaimAllowed, false);
      assert.equal(qaSwarm.packet?.improvementClaimAllowed, false);
      assert.equal(qaSwarm.packet?.public_ready, false);
      assert.equal(qaSwarm.packet?.network_absorbable, false);
      assert.ok(qaSwarm.packet?.artifacts.some((ref: any) => ref.role === 'cycle_ledger'));
      assert.ok(qaSwarm.packet?.artifacts.some((ref: any) => ref.role === 'runtime_policy_profile'));
      assert.ok(qaSwarm.packet?.artifacts.some((ref: any) => ref.role === 'reasoning_trials_judge'));
      assert.ok(qaSwarm.packetPath && existsSync(qaSwarm.packetPath));
      assert.ok(qaSwarm.kanbanPath && existsSync(qaSwarm.kanbanPath));
      assert.equal(result.benchmarkJob?.jobId, active.job?.jobId);
      assert.equal(result.report?.inputs?.benchmarkPack?.sha256, active.job?.artifactHashes.benchmarkPackSha256);
      assert.equal(result.report?.inputs?.benchmarkPack?.id, active.job?.benchmarkPackId);
      const reply = renderSparkQaAutoloopRound(result);
      assert.match(reply, /selected level 10 benchmark pack/);

      const capture = await runSparkQaEvidenceCapturePlan({ repoRoot: repo });
      assert.equal(capture.ok, true);
      assert.equal(capture.benchmarkJob?.jobId, active.job?.jobId);
      assert.equal(capture.payload?.plan?.summary?.caseCount, 84);
      assert.equal(capture.payload?.plan?.summary?.scoreClaimAllowed, false);
      assert.match(renderSparkQaEvidenceCapturePlan(capture), /Evidence capture queue is ready/);
      assert.match(renderSparkQaEvidenceCapturePlan(capture), /does not create a score/);

      const captureRun = await runSparkQaEvidenceCapture({ repoRoot: repo, limit: 1 });
      assert.equal(captureRun.ok, true);
      assert.equal(captureRun.benchmarkJob?.jobId, active.job?.jobId);
      assert.equal(captureRun.payload?.capture?.capturedCount, 1);
      assert.equal(captureRun.payload?.capture?.scoreClaimAllowed, false);
      assert.match(renderSparkQaEvidenceCapture(captureRun), /Captured 1 provisional evidence envelope/);
      assert.match(renderSparkQaEvidenceCapture(captureRun), /no score is created/);

      const review = await runSparkQaEvidenceReviewQueue({ repoRoot: repo });
      assert.equal(review.ok, true);
      assert.equal(review.payload?.queue?.summary?.byStatus?.needs_attestation, 1);
      assert.match(renderSparkQaEvidenceReviewQueue(review), /need attestation/);
      assert.match(renderSparkQaEvidenceReviewQueue(review), /still decides scoring/);

      const attestation = await runSparkQaEvidenceAttestation({
        repoRoot: repo,
        caseId: 'case-1',
        decision: 'observed',
        reviewerId: 'telegram:test-reviewer',
        notes: 'unit review',
      });
      assert.equal(attestation.ok, true);
      assert.equal(attestation.payload?.attestation?.caseId, 'case-1');
      assert.equal(attestation.payload?.attestation?.scoreClaimAllowed, false);
      assert.match(renderSparkQaEvidenceAttestation(attestation), /Recorded observed attestation/);
      assert.match(renderSparkQaEvidenceAttestation(attestation), /does not create a score/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldMaxAge === undefined) delete process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS;
      else process.env.SPARK_QA_OPERATOR_LATEST_MAX_AGE_MS = oldMaxAge;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('does not trust custom benchmark packs to self-certify proof adapters', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Custom Sales Agent',
        level: 10,
        prompt: 'improve Custom Sales Agent level 10 cycles 7 agents 2',
        requestedCycles: 7,
        advisoryAgents: 2,
      });
      assert.equal(creator.ok, true, creator.error);
      assert.equal(creator.benchmarkJob?.specializationPath, 'Custom Sales Agent');
      assert.equal(creator.benchmarkJob?.specializationAdapterKey, undefined);
      assert.equal(creator.benchmarkJob?.proofAdapterReady, false);
      assert.equal(creator.benchmarkJob?.proofAdapterStatus, 'explicit_adapter_required');
      assert.equal(creator.benchmarkJob?.runnerModule, undefined);
      assert.equal(creator.benchmarkJob?.nextGate, 'implement_specialization_proof_adapter');
      assert.equal(creator.workboard?.workboard?.boardStatus, 'blocked');
      assert.equal(creator.workboard?.workboard?.requestedLoop.status, 'preserved_for_future_adapter');
      assert.equal(creator.workboard?.workboard?.commands.prove, 'implement_specialization_proof_adapter');
      assert.equal(creator.workboard?.workboard?.adapterReadiness?.schemaVersion, 'spark-qa-specialization-adapter-readiness.v1');
      assert.equal(creator.workboard?.workboard?.adapterReadiness?.status, 'blocked');
      assert.equal(creator.workboard?.workboard?.adapterReadiness?.proofAdapterStatus, 'explicit_adapter_required');
      assert.equal(creator.workboard?.workboard?.adapterReadiness?.requestedLoop.cycles, 7);
      assert.equal(creator.workboard?.workboard?.adapterReadiness?.requestedLoop.advisoryAgents, 2);
      assert.equal(creator.workboard?.workboard?.adapterReadiness?.commands.prove, 'implement_specialization_proof_adapter');
      assert.ok(creator.workboard?.workboard?.blockers.some((blocker) => /Custom Sales Agent proof adapter is pending/.test(blocker)));
      assert.ok(creator.workboard?.workboard?.tickets.some((ticket) => ticket.id === 'specialization_adapter_readiness' && ticket.status === 'blocked'));
      const readinessArtifact = creator.workboard?.workboard?.artifacts.find((artifact) => artifact.id === 'adapter_readiness');
      assert.equal(readinessArtifact?.status, 'present');
      assert.ok(readinessArtifact?.path && existsSync(String(readinessArtifact.path)));
      const readinessFromDisk = JSON.parse(readFileSync(String(readinessArtifact?.path), 'utf8'));
      assert.equal(readinessFromDisk.schemaVersion, 'spark-qa-specialization-adapter-readiness.v1');
      assert.equal(readinessFromDisk.status, 'blocked');
      assert.equal(readinessFromDisk.scoreClaimAllowed, false);
      assert.equal(readinessFromDisk.public_ready, false);
      assert.equal(readinessFromDisk.network_absorbable, false);
      assert.ok(Array.isArray(readinessFromDisk.acceptance));
      assert.match(renderSparkQaBenchmarkCreator(creator), /proof scoring waits for the specialization proof adapter/i);
      assert.match(renderSparkQaBenchmarkCreator(creator), /adapter-readiness packet and Kanban/i);
      assert.match(renderSparkQaBenchmarkWorkboard(creator.workboard!), /adapter-readiness packet and Kanban/i);
      assert.match(renderSparkQaBenchmarkWorkboard(creator.workboard!), /No score is created until the specialization proof adapter exists/i);

      const readiness = runSparkQaSpecializationAdapterReadiness({ repoRoot: repo });
      assert.equal(readiness.ok, true, readiness.error);
      assert.equal(readiness.packet?.schemaVersion, 'spark-qa-specialization-adapter-readiness.v1');
      assert.equal(readiness.packet?.status, 'blocked');
      assert.equal(readiness.packetPath, readinessArtifact?.path);
      assert.match(renderSparkQaSpecializationAdapterReadiness(readiness), /Adapter-readiness is written/i);
      assert.match(renderSparkQaSpecializationAdapterReadiness(readiness), /7 cycles with 2 advisory agents/i);
      assert.match(renderSparkQaSpecializationAdapterReadiness(readiness), /No score, improvement claim, public readiness, or network absorption/i);

      const paths = runSparkQaSpecializationPaths({ repoRoot: repo });
      assert.equal(paths.activeAdapter, null);
      assert.match(renderSparkQaSpecializationPaths(paths), /benchmark\/quality-only until it has a proof adapter/i);

      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'custom-agent-should-block'),
      });
      assert.equal(proof.ok, false);
      assert.equal(proof.proofRan, false);
      assert.match(proof.error || '', /proof\/autoloop is not enabled|proof-capable benchmark/i);
      assert.doesNotMatch(renderSparkQaAutoloopRound(proof), /cleared the benchmark-backed score claim/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('runs Startup Bench proof through its adapter without claiming a score', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldStartupSeeds = process.env.SPARK_STARTUP_BENCH_SEEDS;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';
      delete process.env.SPARK_STARTUP_BENCH_SEEDS;
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
        prompt: 'create level 10 benchmarks for Startup Bench',
      });
      assert.equal(creator.ok, true);
      assert.equal(creator.benchmarkJob?.specializationPath, 'Startup Bench');
      assert.equal(creator.benchmarkJob?.specializationAdapterKey, 'startup-bench');
      assert.equal(creator.benchmarkJob?.runnerModule, 'specialization_path_spark_qa_operator.cli');
      assert.equal(creator.benchmarkJob?.proofAdapterReady, true);
      assert.equal(creator.benchmarkJob?.nextGate, 'run_fresh_benchmark_autoloop');
      assert.ok(creator.benchmarkJob?.paths.hiddenHeldoutManifest);
      assert.equal(existsSync(String(creator.benchmarkJob?.paths.hiddenHeldoutManifest)), true);
      assert.equal(creator.workboard?.ok, true);
      assert.ok(creator.workboard?.kanbanPath && existsSync(creator.workboard.kanbanPath));
      const creatorReply = renderSparkQaBenchmarkCreator(creator);
      assert.match(creatorReply, /selected this pack for the next \/sparkqa run/);
      assert.match(creatorReply, /workboard and Kanban tickets/);
      assert.doesNotMatch(creatorReply, /implementing the Startup Bench proof adapter/);
      const paths = runSparkQaSpecializationPaths({ repoRoot: repo });
      assert.equal(paths.activeJob?.specializationPath, 'Startup Bench');
      assert.equal(paths.activeAdapter?.key, 'startup-bench');
      assert.match(renderSparkQaSpecializationPaths(paths), /using the Startup Bench adapter/);

      const suitePreflight = syncSparkQaStartupBenchSuitePreflight({ repoRoot: repo });
      assert.equal(suitePreflight.ok, true);
      assert.equal(suitePreflight.preflight?.schemaVersion, 'spark-startup-bench-suite-preflight.v1');
      assert.equal(suitePreflight.preflight?.suiteCount, 11);
      assert.equal(suitePreflight.preflight?.scenarioCount, 14);
      assert.equal(suitePreflight.preflight?.trackCoverage.gtm, 4);
      assert.equal(suitePreflight.preflight?.runnerPlan.suiteCommands.length, 11);
      assert.equal(suitePreflight.preflight?.scoreClaimAllowed, false);
      assert.equal(suitePreflight.preflight?.public_ready, false);
      assert.equal(existsSync(String(suitePreflight.preflightPath)), true);
      assert.equal(existsSync(String(suitePreflight.kanbanPath)), true);
      const suitePreflightReply = renderSparkQaStartupBenchSuitePreflight(suitePreflight);
      assert.match(suitePreflightReply, /suite-first preflight is staged/);
      assert.match(suitePreflightReply, /11 suites/);
      assert.match(suitePreflightReply, /no score or improvement claim/i);

      const suiteRun = await runSparkQaStartupBenchSuiteRun({ repoRoot: repo });
      assert.equal(suiteRun.ok, true);
      assert.equal(suiteRun.run?.schemaVersion, 'spark-startup-bench-suite-run.v1');
      assert.equal(suiteRun.run?.status, 'completed');
      assert.equal(suiteRun.run?.completedSuites, 11);
      assert.equal(suiteRun.run?.scenarioCount, 14);
      assert.equal(suiteRun.run?.aggregate.scenarioScoreMean, 0.5);
      assert.equal(suiteRun.run?.scoreClaimAllowed, false);
      assert.equal(existsSync(String(suiteRun.runPath)), true);
      assert.equal(existsSync(String(suiteRun.kanbanPath)), true);
      const suiteRunKanban = JSON.parse(readFileSync(String(suiteRun.kanbanPath), 'utf-8'));
      assert.equal(suiteRunKanban.suiteCount, 11);
      assert.equal(suiteRunKanban.scenarioCount, 14);
      const suiteRunReply = renderSparkQaStartupBenchSuiteRun(suiteRun);
      assert.match(suiteRunReply, /suite-first run completed/);
      assert.match(suiteRunReply, /private learning-map mean 0\.5/);
      assert.match(suiteRunReply, /not a Startup Operator score claim/);

      const audit = syncSparkQaBenchmarkQualityAudit({ repoRoot: repo });
      assert.equal(audit.ok, true);
      assert.equal(audit.audit?.pass, true);
      assert.equal(audit.audit?.proofAdapterReady, true);
      assert.equal(audit.audit?.nextGate, 'run_fresh_benchmark_autoloop');
      const auditReply = renderSparkQaBenchmarkQualityAudit(audit);
      assert.match(auditReply, /next gate is \/sparkqa prove/);

      const qualityAuto = runSparkQaBenchmarkQualityAuto({ repoRoot: repo, maxCycles: 1 });
      assert.equal(qualityAuto.ok, true);
      assert.equal(qualityAuto.run?.status, 'ready');
      assert.equal(qualityAuto.run?.proofAdapterReady, true);
      assert.equal(qualityAuto.run?.nextGate, 'run_fresh_benchmark_autoloop');
      assert.match(renderSparkQaBenchmarkQualityAuto(qualityAuto), /next gate is \/sparkqa prove/);

      const workboard = syncSparkQaBenchmarkWorkboard({ repoRoot: repo });
      assert.equal(workboard.ok, true);
      assert.notEqual(workboard.workboard?.boardStatus, 'blocked');
      assert.ok(!workboard.workboard?.blockers.some((blocker) => /proof adapter/.test(String(blocker))));

      const result = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench'),
      });
      assert.equal(result.ok, true);
      assert.equal(result.proofRan, true);
      assert.equal(result.report?.schemaVersion, 'spark-startup-bench-proof-adapter.v1');
      assert.equal(result.report?.promotionDossier?.scoreClaimAllowed, false);
      assert.equal(result.report?.privateScoreSummary?.comparison?.candidateMinusBaseline, 0.03);
      assert.deepEqual(result.report?.startupBench?.seeds, [1, 2, 3]);
      assert.equal(result.report?.commands?.length, 6);
      assert.equal(result.report?.repeatedStability?.pass, true);
      assert.equal(result.report?.repeatedStability?.completedSeeds, 3);
      assert.equal(result.report?.wallClockStability?.pass, false);
      const proofReply = renderSparkQaAutoloopRound(result);
      assert.match(proofReply, /Startup Bench ran the real TheStartupBench baseline and tool-script proof/);
      assert.match(proofReply, /would not claim an upgrade yet/);
      assert.match(proofReply, /Seed stability covered 3\/3 requested seeds/);
      assert.match(proofReply, /Wall-clock stability is still waiting on another elapsed fresh run/);
      assert.match(proofReply, /next eligible fresh run is after/);
      assert.doesNotMatch(proofReply, /cleared the benchmark-backed score claim/);

      const reasoningEval = await syncSparkQaStartupBenchReasoningEval({ repoRoot: repo });
      assert.equal(reasoningEval.ok, true);
      assert.equal(reasoningEval.eval?.schemaVersion, 'spark-startup-bench-reasoning-improvement-eval.v1');
      assert.equal(reasoningEval.eval?.status, 'needs_reasoning_trials');
      assert.equal(reasoningEval.eval?.observedNow.behaviorToolUseImprovementObserved, true);
      assert.equal(reasoningEval.eval?.observedNow.reasoningImprovementObserved, false);
      assert.equal(reasoningEval.eval?.observedNow.observableReasoningDeltaPositive, false);
      assert.equal(reasoningEval.eval?.observedNow.reasoningImprovementClaimAllowed, false);
      assert.equal(reasoningEval.eval?.observedNow.claimableReasoningImprovementObserved, false);
      assert.equal(reasoningEval.eval?.reasoningTrialArtifacts.baselinePresent, false);
      assert.ok(reasoningEval.eval?.blockers.includes('baseline_reasoning_trials_missing'));
      assert.equal(reasoningEval.eval?.scoreClaimAllowed, false);
      assert.equal(reasoningEval.eval?.public_ready, false);
      assert.equal(existsSync(String(reasoningEval.evalPath)), true);
      assert.equal(existsSync(String(reasoningEval.kanbanPath)), true);
      const reasoningEvalReply = renderSparkQaStartupBenchReasoningEval(reasoningEval);
      assert.match(reasoningEvalReply, /Not yet as startup reasoning/);
      assert.match(reasoningEvalReply, /behavior\/tool-use improvement/);
      assert.match(reasoningEvalReply, /paired baseline\/candidate reasoning trials/);

      const reasoningTrials = await syncSparkQaStartupBenchReasoningTrials({ repoRoot: repo });
      assert.equal(reasoningTrials.ok, true);
      assert.equal(reasoningTrials.baselineTrials?.schemaVersion, 'spark-startup-bench-reasoning-trials.v1');
      assert.equal(reasoningTrials.candidateTrials?.schemaVersion, 'spark-startup-bench-reasoning-trials.v1');
      assert.equal(reasoningTrials.judgeReport?.schemaVersion, 'spark-startup-bench-reasoning-judge-report.v1');
      assert.equal(reasoningTrials.judgeReport?.method, 'deterministic_observable_trace_proxy_rubric');
      assert.equal(reasoningTrials.judgeReport?.trialCount, 3);
      assert.equal(reasoningTrials.judgeReport?.scoreClaimAllowed, false);
      assert.equal(reasoningTrials.judgeReport?.improvementClaimAllowed, false);
      assert.equal(reasoningTrials.judgeReport?.public_ready, false);
      assert.equal(reasoningTrials.judgeReport?.network_absorbable, false);
      assert.ok(Number(reasoningTrials.judgeReport?.delta) > 0);
      assert.equal(existsSync(String(reasoningTrials.baselinePath)), true);
      assert.equal(existsSync(String(reasoningTrials.candidatePath)), true);
      assert.equal(existsSync(String(reasoningTrials.judgePath)), true);
      assert.equal(existsSync(String(reasoningTrials.kanbanPath)), true);
      const reasoningTrialsReply = renderSparkQaStartupBenchReasoningTrials(reasoningTrials);
      assert.match(reasoningTrialsReply, /reasoning trials are written/);
      assert.match(reasoningTrialsReply, /observable trace-proxy/);
      assert.match(reasoningTrialsReply, /Score and improvement claims remain blocked/);

      const reasoningEvalAfterTrials = await syncSparkQaStartupBenchReasoningEval({ repoRoot: repo });
      assert.equal(reasoningEvalAfterTrials.eval?.reasoningTrialArtifacts.baselinePresent, true);
      assert.equal(reasoningEvalAfterTrials.eval?.reasoningTrialArtifacts.candidatePresent, true);
      assert.equal(reasoningEvalAfterTrials.eval?.reasoningTrialArtifacts.judgePresent, true);
      assert.equal(reasoningEvalAfterTrials.eval?.reasoningTrialArtifacts.trialCount, 3);
      assert.equal(reasoningEvalAfterTrials.eval?.observedNow.reasoningImprovementObserved, true);
      assert.equal(reasoningEvalAfterTrials.eval?.observedNow.observableReasoningDeltaPositive, true);
      assert.equal(reasoningEvalAfterTrials.eval?.observedNow.reasoningImprovementClaimAllowed, false);
      assert.equal(reasoningEvalAfterTrials.eval?.observedNow.claimableReasoningImprovementObserved, false);
      assert.equal(reasoningEvalAfterTrials.eval?.scoreClaimAllowed, false);
      assert.equal(reasoningEvalAfterTrials.eval?.improvementClaimAllowed, false);

      const stability = await readSparkQaStartupBenchStability({ repoRoot: repo });
      assert.equal(stability.ok, true);
      assert.equal(stability.pass, false);
      assert.equal(stability.minimumElapsedHours, 24);
      assert.equal(stability.matchingLedgerEntries, 1);
      assert.match(String(stability.nextEligibleAt), /T/);
      const stabilityReply = renderSparkQaStartupBenchStability(stability);
      assert.match(stabilityReply, /Startup Bench wall-clock stability is waiting/);
      assert.match(stabilityReply, /Next eligible fresh run/);
      assert.match(stabilityReply, /No score is created/);

      const stabilityQueue = await syncSparkQaStartupBenchStabilityQueue({ repoRoot: repo });
      assert.equal(stabilityQueue.ok, true);
      assert.equal(stabilityQueue.ticket?.schemaVersion, 'spark-startup-bench-stability-resume-ticket.v1');
      assert.equal(stabilityQueue.ticket?.status, 'waiting');
      assert.equal(stabilityQueue.ticket?.scoreClaimAllowed, false);
      assert.match(String(stabilityQueue.ticket?.nextEligibleAt), /T/);
      assert.equal(existsSync(String(stabilityQueue.ticketPath)), true);
      assert.equal(existsSync(String(stabilityQueue.kanbanPath)), true);
      const stabilityQueueReply = renderSparkQaStartupBenchStabilityQueue(stabilityQueue);
      assert.match(stabilityQueueReply, /wall-clock stability is queued/);
      assert.match(stabilityQueueReply, /local ticket and Kanban/);
      assert.match(stabilityQueueReply, /No score is created/);

      const readiness = await readSparkQaStartupBenchReadiness({ repoRoot: repo });
      assert.equal(readiness.ok, true);
      assert.equal(readiness.sidecar.recorded, 0);
      assert.equal(readiness.sidecar.required, 1);
      assert.equal(readiness.sidecar.remaining, 1);
      assert.equal(readiness.scoreClaimAllowed, false);
      assert.equal(readiness.nextCommand, '/sparkqa sidecar');
      assert.ok(readiness.gateBlockers.includes('sidecar review'));
      const readinessReply = renderSparkQaStartupBenchReadiness(readiness);
      assert.match(readinessReply, /Startup Bench readiness/);
      assert.match(readinessReply, /sidecar 0\/1/);
      assert.match(readinessReply, /Next command: \/sparkqa sidecar/);
      assert.match(readinessReply, /Score claim is still blocked/);

      const gates = await runSparkQaStartupBenchProofGates({ repoRoot: repo });
      assert.equal(gates.ok, true);
      assert.equal(gates.payload?.schemaVersion, 'spark-startup-bench-proof-gate-bundle.v1');
      assert.equal(gates.payload?.gates?.wrapperRaw?.pass, true);
      assert.equal(gates.hiddenHeldoutManifestPath, creator.benchmarkJob?.paths.hiddenHeldoutManifest);
      assert.equal(gates.payload?.gates?.hiddenHeldout?.pass, true);
      assert.equal(gates.payload?.gates?.sidecarReview?.pass, false);
      assert.equal(gates.payload?.scoreClaimAllowed, false);
      assert.equal(gates.payload?.kanban?.ticketCount, 2);
      const gateReply = renderSparkQaStartupBenchProofGates(gates);
      assert.match(gateReply, /Startup Bench proof-gate bundle is staged/);
      assert.match(gateReply, /wrapper raw/);
      assert.match(gateReply, /selected sealed hidden-heldout manifest/);
      assert.match(gateReply, /\/sparkqa stability/);
      assert.match(gateReply, /2 local review tickets/);
      assert.match(gateReply, /No score is created/);

      const earlyReconciliation = await syncSparkQaStartupBenchScoreReconciliation({ repoRoot: repo });
      assert.equal(earlyReconciliation.ok, true);
      assert.equal(earlyReconciliation.workbench?.schemaVersion, 'spark-startup-bench-score-reconciliation-workbench.v1');
      assert.equal(earlyReconciliation.workbench?.scoreClaimAllowed, false);
      assert.equal(earlyReconciliation.workbench?.status, 'blocked');
      assert.equal(earlyReconciliation.workbench?.checks.find((check) => check.id === 'wrapper_raw')?.status, 'clean');
      assert.ok(earlyReconciliation.workbench?.blockers.includes('sidecar_review_pending'));
      assert.ok(earlyReconciliation.workbench?.blockers.includes('wall_clock_stability_window_missing'));
      assert.equal(earlyReconciliation.workbench?.nextCommand, '/sparkqa reviewers');
      assert.equal(existsSync(String(earlyReconciliation.workbenchPath)), true);
      assert.equal(existsSync(String(earlyReconciliation.kanbanPath)), true);
      const earlyReconciliationReply = renderSparkQaStartupBenchScoreReconciliation(earlyReconciliation);
      assert.match(earlyReconciliationReply, /score reconciliation is blocked/);
      assert.match(earlyReconciliationReply, /Wrapper\/raw summaries match/);
      assert.match(earlyReconciliationReply, /score claims stay refused/);

      const earlyShowcase = await syncSparkQaStartupBenchShowcase({ repoRoot: repo });
      assert.equal(earlyShowcase.ok, true);
      assert.equal(earlyShowcase.packet?.schemaVersion, 'spark-startup-bench-showcase-packet.v1');
      assert.equal(earlyShowcase.packet?.status, 'score_blocked');
      assert.equal(earlyShowcase.packet?.scoreClaimAllowed, false);
      assert.equal(earlyShowcase.packet?.snapshot.sidecar.recorded, 0);
      assert.equal(earlyShowcase.packet?.snapshot.wrapperRaw.clean, true);
      assert.equal(earlyShowcase.packet?.demoCommands[0]?.command, '/sparkqa startup');
      assert.ok(earlyShowcase.packet?.demoCommands.some((item) => item.command === '/sparkqa reconcile'));
      assert.ok(earlyShowcase.packet?.demoCommands.some((item) => item.command === '/sparkqa reviewers'));
      assert.equal(existsSync(String(earlyShowcase.packetPath)), true);
      assert.equal(existsSync(String(earlyShowcase.kanbanPath)), true);
      const earlyShowcaseReply = renderSparkQaStartupBenchShowcase(earlyShowcase);
      assert.match(earlyShowcaseReply, /Showcase snapshot/);
      assert.match(earlyShowcaseReply, /demo-ready, but not score-ready/);
      assert.match(earlyShowcaseReply, /Score claims stay refused/);

      const swarmAudit = await syncSparkQaStartupBenchSwarmBridgeAudit({ repoRoot: repo });
      assert.equal(swarmAudit.ok, true);
      assert.equal(swarmAudit.audit?.schemaVersion, 'spark-startup-bench-swarm-bridge-audit.v1');
      assert.equal(swarmAudit.audit?.status, 'ready_for_mutation_bridge');
      assert.equal(swarmAudit.audit?.scoreClaimAllowed, false);
      assert.ok(swarmAudit.audit?.reusableSystems.some((item) => item.id === 'specialization_path_autoloop'));
      assert.ok(swarmAudit.audit?.integrationBridges.some((item) => item.id === 'proof_to_mutation_handoff' && item.status === 'missing'));
      assert.ok(swarmAudit.audit?.learningGaps.some((gap) => gap.id === 'trace_failure_taxonomy' && gap.severity === 'critical'));
      assert.ok(swarmAudit.audit?.workItems.some((item) => item.id === 'mutation-handoff'));
      assert.equal(existsSync(String(swarmAudit.auditPath)), true);
      assert.equal(existsSync(String(swarmAudit.kanbanPath)), true);
      const swarmAuditReply = renderSparkQaStartupBenchSwarmBridgeAudit(swarmAudit);
      assert.match(swarmAuditReply, /Swarm bridge audit is ready/);
      assert.match(swarmAuditReply, /reusable Swarm workbench systems/);
      assert.match(swarmAuditReply, /Next build: build startup bench mutation handoff/);
      assert.match(swarmAuditReply, /No score or improvement claim/);

      const mutationHandoff = await syncSparkQaStartupBenchMutationHandoff({ repoRoot: repo });
      assert.equal(mutationHandoff.ok, true);
      assert.equal(mutationHandoff.handoff?.schemaVersion, 'spark-startup-bench-mutation-handoff.v1');
      assert.equal(mutationHandoff.handoff?.status, 'ready_for_plan');
      assert.equal(mutationHandoff.handoff?.scoreClaimAllowed, false);
      assert.equal(mutationHandoff.handoff?.improvementClaimAllowed, false);
      assert.equal(mutationHandoff.handoff?.public_ready, false);
      assert.equal(mutationHandoff.handoff?.network_absorbable, false);
      assert.equal(mutationHandoff.handoff?.sparkSwarmBridge.pathKey, 'startup-operator');
      assert.ok(mutationHandoff.handoff?.failureTaxonomy.some((family) => family.id === 'trace_failure_taxonomy' && family.severity === 'critical'));
      assert.ok(mutationHandoff.handoff?.failureTaxonomy.some((family) => family.id === 'startup_trace_delta'));
      assert.equal(mutationHandoff.handoff?.advisoryGuidance.suiteLearningMap.status, 'available');
      assert.equal(mutationHandoff.handoff?.advisoryGuidance.suiteLearningMap.latestRun.scenarioCount, 14);
      assert.ok(mutationHandoff.handoff?.failureTaxonomy.some((family) => family.source === 'suite_first'));
      assert.ok(mutationHandoff.handoff?.tickets.some((ticket) => ticket.id === 'startup-operator-tool-script-candidate' && ticket.target.path?.endsWith('startup-operator.tool_calls.json')));
      assert.ok(mutationHandoff.handoff?.tickets.some((ticket) => ticket.id === 'private-collective-packet' && ticket.status === 'blocked'));
      assert.equal(existsSync(String(mutationHandoff.handoffPath)), true);
      assert.equal(existsSync(String(mutationHandoff.kanbanPath)), true);
      const mutationHandoffReply = renderSparkQaStartupBenchMutationHandoff(mutationHandoff);
      assert.match(mutationHandoffReply, /mutation handoff is ready/);
      assert.match(mutationHandoffReply, /bounded mutation tickets/);
      assert.match(mutationHandoffReply, /No score or improvement claim/);

      const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
      const startupToolScriptBefore = readFileSync(startupToolScriptPath, 'utf-8');
      const mutationPlan = await syncSparkQaStartupBenchMutationPlan({ repoRoot: repo });
      assert.equal(mutationPlan.ok, true);
      assert.equal(mutationPlan.plan?.schemaVersion, 'spark-startup-bench-mutation-plan.v1');
      assert.equal(mutationPlan.plan?.status, 'planned');
      assert.equal(mutationPlan.plan?.selectedTicket?.id, 'startup-operator-tool-script-candidate');
      assert.equal(mutationPlan.plan?.planOnlyDispatch.mode, 'plan_only_no_write');
      assert.equal(mutationPlan.plan?.planOnlyDispatch.mutationApplied, false);
      assert.equal(mutationPlan.plan?.target.path, startupToolScriptPath);
      assert.equal(mutationPlan.plan?.target.unchanged, true);
      assert.equal(mutationPlan.plan?.target.before?.sha256, mutationPlan.plan?.target.after?.sha256);
      assert.equal(mutationPlan.plan?.mutationRecommendation.schemaVersion, 'spark-startup-bench-mutation-recommendation.v1');
      assert.equal(mutationPlan.plan?.mutationRecommendation.status, 'waiting_for_advisory');
      assert.equal(mutationPlan.plan?.mutationRecommendation.recommendedMutationStrategy, 'insert_checkpoint_before_sales_pipeline_update');
      assert.equal(mutationPlan.plan?.mutationRecommendation.advisoryConsensus.readyForPrivateMutation, false);
      assert.equal(mutationPlan.plan?.mutationRecommendation.benchmarkSignals.scenarioCount, 14);
      assert.ok(mutationPlan.plan?.mutationRecommendation.candidateRequirements.some((item) => /paired reasoning trials/i.test(item)));
      assert.ok(mutationPlan.plan?.mutationRecommendation.selectionBasis.some((item) => item.includes('selected_ticket:startup-operator-tool-script-candidate')));
      assert.equal(mutationPlan.plan?.scoreClaimAllowed, false);
      assert.equal(mutationPlan.plan?.improvementClaimAllowed, false);
      assert.equal(mutationPlan.plan?.public_ready, false);
      assert.equal(mutationPlan.plan?.network_absorbable, false);
      assert.ok(mutationPlan.plan?.planOnlyDispatch.forbiddenPathGlobs.some((item) => item.includes('hidden_heldout_manifest')));
      assert.ok(mutationPlan.plan?.planOnlyDispatch.requiredFreshProof.includes('/sparkqa run'));
      assert.ok(mutationPlan.plan?.planOnlyDispatch.selectedFamilies.some((family) => family.startsWith('suite_first_')));
      assert.ok(mutationPlan.plan?.artifactRefs.some((item) => item.role === 'mutation_recommendation'));
      assert.ok(mutationPlan.plan?.artifactRefs.some((item) => item.role === 'startup_operator_target_before'));
      assert.ok(mutationPlan.plan?.artifactRefs.some((item) => item.role === 'startup_bench_suite_run'));
      assert.equal(readFileSync(startupToolScriptPath, 'utf-8'), startupToolScriptBefore);
      assert.equal(existsSync(String(mutationPlan.planPath)), true);
      assert.equal(existsSync(String(mutationPlan.kanbanPath)), true);
      const recommendationRef = mutationPlan.plan?.artifactRefs.find((item) => item.role === 'mutation_recommendation');
      assert.ok(recommendationRef);
      assert.equal(existsSync(String(recommendationRef.path)), true);
      const mutationPlanReply = renderSparkQaStartupBenchMutationPlan(mutationPlan);
      assert.match(mutationPlanReply, /plan-only dispatch is ready/);
      assert.match(mutationPlanReply, /locked the Startup Operator target without changing it/);
      assert.match(mutationPlanReply, /Recommendation is waiting_for_advisory/i);
      assert.match(mutationPlanReply, /No score or improvement claim/);

      const proofHeavyMutationProfile = await syncSparkQaStartupBenchAdvisoryAgentPersonaProfile({
        repoRoot: repo,
        personaPreset: 'proof_heavy',
        agentReviewers: 5,
      });
      assert.equal(proofHeavyMutationProfile.ok, true);
      assert.equal(proofHeavyMutationProfile.profile?.personaPreset, 'proof_heavy');

      const deterministicMutationProposal = await syncSparkQaStartupBenchMutationProposal({ repoRoot: repo });
      assert.equal(deterministicMutationProposal.ok, true);
      assert.equal(deterministicMutationProposal.proposal?.proposer.kind, 'deterministic_seed');
      assert.equal(deterministicMutationProposal.proposal?.advisoryPersonaBoard.personaPreset, 'proof_heavy');
      assert.ok(deterministicMutationProposal.proposal?.proposal.focus.includes('proof_integrity_artifact_freshness'));
      assert.ok(deterministicMutationProposal.proposal?.proposal.focus.includes('benchmark_gaming_resistance'));
      assert.ok(deterministicMutationProposal.proposal?.proposal.risks.some((risk) => /Proof-heavy review/i.test(risk)));
      assert.equal(deterministicMutationProposal.proposal?.scoreClaimAllowed, false);

      const mutationProposal = await syncSparkQaStartupBenchMutationProposal({
        repoRoot: repo,
        proposerLabel: 'test-llm',
        proposer: async () => JSON.stringify({
          hypothesis: 'The operator needs a runway checkpoint before sales pressure changes the plan.',
          targetBehavior: 'Before the sales pipeline update, re-check runway, concentration, and constraint evidence.',
          mutationStrategy: 'insert_checkpoint_before_sales_pipeline_update',
          insertBeforeToolName: 'sales.pipeline.update',
          toolName: 'metrics.report',
          focus: ['runway_after_candidate_action', 'constraint_check_before_growth_push'],
          expectedBenchmarkEffect: 'Fewer premature growth actions in Startup Bench traces.',
          risks: ['May be redundant when runway evidence is already fresh.'],
          keepCriteria: ['Fresh proof improves private movement without new blockers.'],
          revertCriteria: ['Fresh proof regresses or adds reconciliation blockers.'],
        }),
      });
      assert.equal(mutationProposal.ok, true);
      assert.equal(mutationProposal.proposal?.schemaVersion, 'spark-startup-bench-mutation-proposal.v1');
      assert.equal(mutationProposal.proposal?.status, 'proposal_ready');
      assert.equal(mutationProposal.proposal?.proposer.kind, 'llm');
      assert.equal(mutationProposal.proposal?.proposer.rawResponseAccepted, true);
      assert.equal(mutationProposal.proposal?.proposal.toolName, 'metrics.report');
      assert.equal(mutationProposal.proposal?.proposal.insertBeforeToolName, 'sales.pipeline.update');
      assert.equal(mutationProposal.proposal?.sourceRecommendation?.path, recommendationRef.path);
      assert.match(String(mutationProposal.proposal?.sourceRecommendation?.sha256), /^[a-f0-9]{64}$/);
      assert.equal(mutationProposal.proposal?.advisoryPersonaBoard.personaPreset, 'proof_heavy');
      assert.equal(mutationProposal.proposal?.advisoryPersonaBoard.personaLabels[1], 'Benchmark Anti-Gaming Reviewer');
      assert.equal(mutationProposal.proposal?.advisoryPersonaBoard.scoreClaimAllowed, false);
      assert.equal(mutationProposal.proposal?.sourceAdvisoryAgentProfile?.path, proofHeavyMutationProfile.profilePath);
      assert.match(String(mutationProposal.proposal?.sourceAdvisoryAgentProfile?.sha256), /^[a-f0-9]{64}$/);
      assert.equal(mutationProposal.proposal?.validation.accepted, true);
      assert.equal(mutationProposal.proposal?.scoreClaimAllowed, false);
      assert.equal(mutationProposal.proposal?.improvementClaimAllowed, false);
      assert.equal(mutationProposal.proposal?.public_ready, false);
      assert.equal(mutationProposal.proposal?.network_absorbable, false);
      assert.equal(existsSync(String(mutationProposal.proposalPath)), true);
      assert.equal(existsSync(String(mutationProposal.promptPath)), true);
      assert.equal(existsSync(String(mutationProposal.kanbanPath)), true);
      const mutationProposalPrompt = readFileSync(String(mutationProposal.promptPath), 'utf-8');
      assert.match(mutationProposalPrompt, /Suite-first learning map/);
      assert.match(mutationProposalPrompt, /Mutation recommendation/);
      assert.match(mutationProposalPrompt, /Configured advisory persona board: preset=proof_heavy/);
      assert.match(mutationProposalPrompt, /Proof Integrity Auditor/);
      assert.match(mutationProposalPrompt, /benchmark-gaming resistance/);
      assert.match(mutationProposalPrompt, /Never weaken fresh proof/);
      const mutationProposalReply = renderSparkQaStartupBenchMutationProposal(mutationProposal);
      assert.match(mutationProposalReply, /mutation proposal is ready/);
      assert.match(mutationProposalReply, /Spark LLM proposal accepted/);
      assert.match(mutationProposalReply, /bound to recommendation/);
      assert.match(mutationProposalReply, /Advisory board: proof heavy/);
      assert.match(mutationProposalReply, /No score or improvement claim/);
      rmSync(String(proofHeavyMutationProfile.profilePath), { force: true });

      const mutationCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(mutationCandidate.ok, true);
      const readyCandidate = mutationCandidate.candidate;
      assert.ok(readyCandidate);
      assert.equal(readyCandidate.schemaVersion, 'spark-startup-bench-mutation-candidate.v1');
      assert.equal(readyCandidate.status, 'candidate_ready');
      assert.equal(readyCandidate.selectedTicket?.id, 'startup-operator-tool-script-candidate');
      assert.equal(readyCandidate.sourceProposal?.sha256, mutationProposal.proposalPath ? createHash('sha256').update(readFileSync(mutationProposal.proposalPath)).digest('hex') : undefined);
      assert.equal(readyCandidate.sourceRecommendation?.path, recommendationRef.path);
      assert.match(String(readyCandidate.sourceRecommendation?.sha256), /^[a-f0-9]{64}$/);
      assert.equal(readyCandidate.mutationApplied, false);
      assert.equal(readyCandidate.target.path, startupToolScriptPath);
      assert.equal(readyCandidate.target.unchanged, true);
      assert.equal(readyCandidate.target.before?.sha256, readyCandidate.target.after?.sha256);
      assert.equal(readyCandidate.patch.reversible, true);
      assert.equal(readyCandidate.patch.forward[0]?.op, 'add');
      assert.equal(readyCandidate.patch.reverse[0]?.op, 'remove');
      assert.equal(readyCandidate.candidate.insertedToolName, 'metrics.report');
      assert.equal(readyCandidate.candidate.summary, 'Before the sales pipeline update, re-check runway, concentration, and constraint evidence.');
      assert.equal(readyCandidate.scoreClaimAllowed, false);
      assert.equal(readyCandidate.improvementClaimAllowed, false);
      assert.equal(readyCandidate.public_ready, false);
      assert.equal(readyCandidate.network_absorbable, false);
      assert.equal(readFileSync(startupToolScriptPath, 'utf-8'), startupToolScriptBefore);
      assert.equal(existsSync(String(mutationCandidate.candidatePath)), true);
      assert.equal(existsSync(String(mutationCandidate.candidateToolScriptPath)), true);
      assert.equal(existsSync(String(mutationCandidate.kanbanPath)), true);
      const mutationCandidateToolScriptText = readFileSync(String(mutationCandidate.candidateToolScriptPath), 'utf-8');
      assert.match(mutationCandidateToolScriptText, /"liquid_cash_usd": 460000\.0/);
      assert.match(mutationCandidateToolScriptText, /"treasury_concentration": 0\.0/);
      assert.match(mutationCandidateToolScriptText, /sparkqa_llm_mutation_proposal/);
      assert.match(mutationCandidateToolScriptText, /runway_after_candidate_action/);
      const mutationCandidateReply = renderSparkQaStartupBenchMutationCandidate(mutationCandidate);
      assert.match(mutationCandidateReply, /mutation candidate is ready/);
      assert.match(mutationCandidateReply, /live Startup Operator target was not changed/);
      assert.match(mutationCandidateReply, /Recommendation hash/);
      assert.match(mutationCandidateReply, /No score or improvement claim/);

      const mutationApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(mutationApply.ok, true);
      assert.equal(mutationApply.apply?.schemaVersion, 'spark-startup-bench-mutation-apply.v1');
      assert.equal(mutationApply.apply?.status, 'applied');
      assert.equal(mutationApply.apply?.selectedTicket?.id, 'startup-operator-tool-script-candidate');
      assert.equal(mutationApply.apply?.mutationApplied, true);
      assert.equal(mutationApply.apply?.target.path, startupToolScriptPath);
      assert.equal(mutationApply.apply?.target.before?.sha256, readyCandidate.patch.originalSha256);
      assert.equal(mutationApply.apply?.target.after?.sha256, readyCandidate.patch.candidateSha256);
      assert.equal(mutationApply.apply?.target.changed, true);
      assert.equal(mutationApply.apply?.scoreClaimAllowed, false);
      assert.equal(mutationApply.apply?.improvementClaimAllowed, false);
      assert.equal(mutationApply.apply?.public_ready, false);
      assert.equal(mutationApply.apply?.network_absorbable, false);
      assert.equal(existsSync(String(mutationApply.applyPath)), true);
      assert.equal(existsSync(String(mutationApply.kanbanPath)), true);
      const appliedToolScript = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      assert.equal(Array.isArray(appliedToolScript), true);
      assert.equal(appliedToolScript.length, readyCandidate.candidate.itemCount);
      assert.equal(appliedToolScript[Number(readyCandidate.candidate.insertedIndex)]?.tool_name, 'metrics.report');
      assert.equal(createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex'), readyCandidate.patch.candidateSha256);
      const appliedToolScriptText = readFileSync(startupToolScriptPath, 'utf-8');
      assert.match(appliedToolScriptText, /"liquid_cash_usd": 460000\.0/);
      assert.match(appliedToolScriptText, /"treasury_concentration": 0\.0/);
      const mutationApplyReply = renderSparkQaStartupBenchMutationApply(mutationApply);
      assert.match(mutationApplyReply, /mutation candidate is applied/);
      assert.match(mutationApplyReply, /Fresh proof is required/);
      assert.match(mutationApplyReply, /No score or improvement claim/);

      const stalePostApplyDecision = await syncSparkQaStartupBenchKeepRevertDecision({ repoRoot: repo });
      assert.equal(stalePostApplyDecision.ok, true);
      assert.equal(stalePostApplyDecision.decision?.status, 'blocked');
      assert.equal(stalePostApplyDecision.decision?.decision, 'blocked');
      assert.equal(stalePostApplyDecision.decision?.scoreClaimAllowed, false);
      assert.ok(stalePostApplyDecision.decision?.blockers.some((blocker) => /fresh_proof_after_mutation_missing|fresh_proof_target_hash_missing/.test(blocker)));
      assert.match(renderSparkQaStartupBenchKeepRevertDecision(stalePostApplyDecision), /fresh proof is incomplete|Run \/sparkqa run/i);

      const duplicateCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(duplicateCandidate.ok, true);
      const resumedCandidate = duplicateCandidate.candidate;
      assert.ok(resumedCandidate);
      const appliedResume = resumedCandidate.appliedCandidate;
      assert.ok(appliedResume);
      assert.equal(resumedCandidate.status, 'applied_ready_for_proof');
      assert.equal(resumedCandidate.blockers.length, 0);
      assert.equal(resumedCandidate.nextCommand, '/sparkqa run');
      assert.equal(resumedCandidate.mutationApplied, true);
      assert.equal(resumedCandidate.patch.applyMode, 'already_applied_resume');
      assert.equal(resumedCandidate.patch.candidateSha256, readyCandidate.patch.candidateSha256);
      assert.equal(appliedResume.checkpointIndex, readyCandidate.candidate.insertedIndex);
      assert.equal(appliedResume.checkpointToolName, 'metrics.report');
      assert.equal(appliedResume.checkpointRequestId, readyCandidate.candidate.requestId);
      assert.equal(appliedResume.checkpointSource, 'sparkqa_llm_mutation_proposal');
      assert.equal(appliedResume.targetSha256, readyCandidate.patch.candidateSha256);
      assert.equal(appliedResume.sourceProposalSha256, readyCandidate.sourceProposal?.sha256);
      assert.equal(resumedCandidate.blockers.includes('candidate_tool_script_not_written'), false);
      const duplicateCandidateToolScript = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      assert.equal(duplicateCandidateToolScript.length, readyCandidate.candidate.itemCount);
      const duplicateCandidateReply = renderSparkQaStartupBenchMutationCandidate(duplicateCandidate);
      assert.match(duplicateCandidateReply, /already applied and ready for fresh proof/);
      assert.match(duplicateCandidateReply, /Next: \/sparkqa run/);
      assert.match(duplicateCandidateReply, /No score or improvement claim/);

      const postApplyProof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-post-apply'),
      });
      assert.equal(postApplyProof.ok, true);
      assert.equal(postApplyProof.report?.schemaVersion, 'spark-startup-bench-proof-adapter.v1');
      assert.equal(postApplyProof.report?.wallClockStability?.pass, false);

      const nextCycleCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(nextCycleCandidate.ok, true);
      assert.equal(nextCycleCandidate.candidate?.status, 'candidate_ready');
      assert.equal(nextCycleCandidate.candidate?.mutationApplied, false);
      assert.equal(nextCycleCandidate.candidate?.patch.applyMode, 'manual_review_required');
      assert.equal(nextCycleCandidate.candidate?.patch.reversible, true);
      assert.equal(nextCycleCandidate.candidate?.patch.forward.every((op) => op.op === 'replace'), true);
      assert.equal(nextCycleCandidate.candidate?.patch.reverse.every((op) => op.op === 'replace'), true);
      assert.notEqual(nextCycleCandidate.candidate?.patch.candidateSha256, nextCycleCandidate.candidate?.patch.originalSha256);
      assert.equal(readFileSync(startupToolScriptPath, 'utf-8'), appliedToolScriptText);
      const nextCycleCandidateText = readFileSync(String(nextCycleCandidate.candidateToolScriptPath), 'utf-8');
      assert.match(nextCycleCandidateText, /sparkqa_advisory_iteration/);
      assert.match(nextCycleCandidateText, /bounded_design_partner_conversion/);
      rmSync(String(nextCycleCandidate.candidatePath), { force: true });
      rmSync(String(nextCycleCandidate.candidateToolScriptPath), { force: true });
      rmSync(String(nextCycleCandidate.kanbanPath), { force: true });

      const keepRevert = await syncSparkQaStartupBenchKeepRevertDecision({ repoRoot: repo });
      assert.equal(keepRevert.ok, true);
      assert.equal(keepRevert.decision?.schemaVersion, 'spark-startup-bench-keep-revert-decision.v1');
      assert.equal(keepRevert.decision?.status, 'hold_pending_gates');
      assert.equal(keepRevert.decision?.decision, 'hold');
      assert.equal(keepRevert.decision?.privateMovement.candidateMinusBaseline, 0.03);
      assert.equal(keepRevert.decision?.mutation.checkpointApplied, true);
      assert.equal(keepRevert.decision?.scoreClaimAllowed, false);
      assert.equal(keepRevert.decision?.improvementClaimAllowed, false);
      assert.equal(keepRevert.decision?.public_ready, false);
      assert.equal(keepRevert.decision?.network_absorbable, false);
      assert.ok(keepRevert.decision?.proofClosure.blockers.some((blocker) => blocker.includes('sidecar_review_pending')));
      assert.ok(keepRevert.decision?.proofClosure.blockers.some((blocker) => blocker.includes('wall_clock_stability_window_missing')));
      assert.ok(keepRevert.decision?.evidenceChecks.some((check) => check.id === 'wrapper_raw' && check.status === 'clean'));
      assert.equal(existsSync(String(keepRevert.decisionPath)), true);
      assert.equal(existsSync(String(keepRevert.kanbanPath)), true);
      const keepRevertReply = renderSparkQaStartupBenchKeepRevertDecision(keepRevert);
      assert.match(keepRevertReply, /hold pending gates/);
      assert.match(keepRevertReply, /Private movement is 0\.64 -> 0\.67 \(\+0\.03\)/);
      assert.match(keepRevertReply, /No score or improvement claim/);

      const loopStatus = await readSparkQaStartupBenchLoopStatus({ repoRoot: repo });
      assert.equal(loopStatus.ok, true);
      assert.equal(loopStatus.mutation.checkpointApplied, true);
      assert.equal(loopStatus.mutation.checkpointIndex, readyCandidate.candidate.insertedIndex);
      assert.equal(loopStatus.sidecar.recorded, 0);
      assert.equal(loopStatus.sidecar.required, 1);
      assert.equal(loopStatus.sidecar.remaining, 1);
      assert.equal(loopStatus.wallClock.pass, false);
      assert.equal(loopStatus.reconciliation.status, 'blocked');
      assert.equal(loopStatus.scoreClaimAllowed, false);
      assert.equal(loopStatus.nextCommand, '/sparkqa reviewers');
      const loopStatusReply = renderSparkQaStartupBenchLoopStatus(loopStatus);
      assert.match(loopStatusReply, /proof-closure mode/);
      assert.match(loopStatusReply, /candidate checkpoint applied/);
      assert.match(loopStatusReply, /sidecar 0\/1/);
      assert.match(loopStatusReply, /Next command: \/sparkqa reviewers/);
      assert.match(loopStatusReply, /Score claim is still blocked/);

      const evolutionPlan = await syncSparkQaStartupBenchEvolutionPlan({
        repoRoot: repo,
        requestedCycles: 100,
      });
      assert.equal(evolutionPlan.ok, true);
      assert.equal(evolutionPlan.plan?.schemaVersion, 'spark-startup-bench-evolution-plan.v1');
      assert.equal(evolutionPlan.plan?.requestedCycles, 100);
      assert.equal(evolutionPlan.plan?.completedCycles, 0);
      assert.equal(evolutionPlan.plan?.status, 'waiting_on_proof_closure');
      assert.equal(evolutionPlan.plan?.workerReady, false);
      assert.equal(evolutionPlan.plan?.canStartHundredLoopNow, false);
      assert.equal(evolutionPlan.plan?.currentLoop.nextCommand, '/sparkqa reviewers');
      assert.equal(evolutionPlan.plan?.suiteFirst.status, 'ready');
      assert.equal(evolutionPlan.plan?.suiteFirst.suiteCount, 11);
      assert.equal(evolutionPlan.plan?.suiteFirst.scenarioCount, 14);
      assert.ok(evolutionPlan.plan?.suiteFirst.weakTrackFamilies.length);
      assert.equal(evolutionPlan.plan?.sparkSwarmBridge.benchmarkPathKey, 'startup-bench');
      assert.equal(evolutionPlan.plan?.sparkSwarmBridge.targetPathKey, 'startup-operator');
      assert.equal(evolutionPlan.plan?.sparkOneBridge.adapterContract, 'spark-one-workspace-result-adapter.startup-bench-evolution.v1');
      assert.equal(evolutionPlan.plan?.sparkOneBridge.workspaceDisplay.kanbanBoard, true);
      assert.equal(evolutionPlan.plan?.suiteFirst.latestRun.status, 'completed');
      assert.equal(evolutionPlan.plan?.suiteFirst.latestRun.scenarioCount, 14);
      assert.equal(evolutionPlan.plan?.suiteFirst.latestRun.scenarioScoreMean, 0.5);
      assert.equal(evolutionPlan.plan?.scoreClaimAllowed, false);
      assert.equal(evolutionPlan.plan?.improvementClaimAllowed, false);
      assert.equal(evolutionPlan.plan?.public_ready, false);
      assert.equal(evolutionPlan.plan?.network_absorbable, false);
      assert.ok(evolutionPlan.plan?.blockers.some((blocker) => blocker.includes('sidecar_review_pending')));
      assert.equal(existsSync(String(evolutionPlan.planPath)), true);
      assert.equal(existsSync(String(evolutionPlan.kanbanPath)), true);
      const evolutionPlanReply = renderSparkQaStartupBenchEvolutionPlan(evolutionPlan);
      assert.match(evolutionPlanReply, /evolution plan is staged/);
      assert.match(evolutionPlanReply, /100 cycles/);
      assert.match(evolutionPlanReply, /Latest suite run/);
      assert.match(evolutionPlanReply, /waiting on/);
      assert.match(evolutionPlanReply, /Spark One and Spark Swarm/);
      assert.match(evolutionPlanReply, /No score or improvement claim/);

      const evolutionWorker = await syncSparkQaStartupBenchEvolutionWorker({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
      });
      assert.equal(evolutionWorker.ok, true);
      assert.equal(evolutionWorker.state?.schemaVersion, 'spark-startup-bench-evolution-worker-state.v1');
      assert.equal(evolutionWorker.state?.status, 'waiting_on_proof_closure');
      assert.equal(evolutionWorker.state?.currentPhase, 'proof_closure');
      assert.equal(evolutionWorker.state?.requestedCycles, 100);
      assert.equal(evolutionWorker.state?.completedCycles, 0);
      assert.equal(evolutionWorker.state?.tickCount, 1);
      assert.equal(evolutionWorker.state?.nextCommand, '/sparkqa reviewers');
      assert.equal(evolutionWorker.state?.workerCapabilities.proofClosureGate, true);
      assert.equal(evolutionWorker.state?.workerCapabilities.sparkOneExportPrepared, true);
      assert.equal(evolutionWorker.state?.scoreClaimAllowed, false);
      assert.equal(evolutionWorker.state?.improvementClaimAllowed, false);
      assert.equal(evolutionWorker.state?.public_ready, false);
      assert.equal(evolutionWorker.state?.network_absorbable, false);
      assert.equal(existsSync(String(evolutionWorker.statePath)), true);
      assert.equal(existsSync(String(evolutionWorker.kanbanPath)), true);
      assert.equal(readFileSync(startupToolScriptPath, 'utf-8'), appliedToolScriptText);
      const evolutionWorkerReply = renderSparkQaStartupBenchEvolutionWorker(evolutionWorker);
      assert.match(evolutionWorkerReply, /worker is waiting/);
      assert.match(evolutionWorkerReply, /0\/100 cycles complete/);
      assert.match(evolutionWorkerReply, /Next: \/sparkqa reviewers/);
      assert.match(evolutionWorkerReply, /No score or improvement claim/);

      const sparkOneExport = await syncSparkQaStartupBenchSparkOneExport({ repoRoot: repo });
      assert.equal(sparkOneExport.ok, true);
      assert.equal(sparkOneExport.packet?.schemaVersion, 'spark-startup-bench-spark-one-export-packet.v1');
      assert.equal(sparkOneExport.packet?.status, 'waiting_on_proof_closure');
      assert.equal(sparkOneExport.packet?.workspaceDisplay.title, 'Startup Bench Evolution');
      assert.equal(sparkOneExport.packet?.workspaceDisplay.nextCommand, '/sparkqa reviewers');
      assert.equal(sparkOneExport.packet?.workspaceDisplay.suiteFirstRun?.scenarioCount, 14);
      assert.equal(sparkOneExport.packet?.adapters.sparkOne.adapterContract, 'spark-one-workspace-result-adapter.startup-bench-evolution.v1');
      assert.equal(sparkOneExport.packet?.adapters.sparkSwarm.targetPathKey, 'startup-operator');
      assert.equal(sparkOneExport.packet?.localOnly, true);
      assert.equal(sparkOneExport.packet?.scoreClaimAllowed, false);
      assert.equal(sparkOneExport.packet?.improvementClaimAllowed, false);
      assert.equal(sparkOneExport.packet?.public_ready, false);
      assert.equal(sparkOneExport.packet?.network_absorbable, false);
      assert.ok(sparkOneExport.packet?.artifacts.some((item) => item.role === 'evolution_worker_state'));
      assert.ok(sparkOneExport.packet?.artifacts.some((item) => item.role === 'startup_bench_suite_preflight'));
      assert.ok(sparkOneExport.packet?.artifacts.some((item) => item.role === 'startup_bench_suite_run'));
      assert.ok(sparkOneExport.packet?.blockers.some((blocker) => blocker.includes('sidecar_review_pending')));
      assert.equal(existsSync(String(sparkOneExport.packetPath)), true);
      assert.equal(existsSync(String(sparkOneExport.kanbanPath)), true);
      const sparkOneReply = renderSparkQaStartupBenchSparkOneExport(sparkOneExport);
      assert.match(sparkOneReply, /Spark One export packet is staged/);
      assert.match(sparkOneReply, /Full-suite map/);
      assert.match(sparkOneReply, /private artifact ref/);
      assert.match(sparkOneReply, /public_ready=false/);
      assert.match(sparkOneReply, /No score or improvement claim/);

      const proofHeavyProfile = await syncSparkQaStartupBenchAdvisoryAgentPersonaProfile({
        repoRoot: repo,
        personaPreset: 'proof_heavy',
        agentReviewers: 5,
      });
      assert.equal(proofHeavyProfile.ok, true);
      assert.equal(proofHeavyProfile.profile?.personaPreset, 'proof_heavy');
      const orchestratorStatusWithBoard = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
      });
      assert.equal(orchestratorStatusWithBoard.state?.advisoryPersonaBoard?.personaPreset, 'proof_heavy');
      assert.equal(orchestratorStatusWithBoard.state?.advisoryPersonaBoard?.personaLabels[1], 'Benchmark Anti-Gaming Reviewer');
      assert.equal(orchestratorStatusWithBoard.state?.advisoryPersonaBoard?.scoreClaimAllowed, false);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(orchestratorStatusWithBoard), /Advisory board is proof heavy/);
      const startupIntelligenceWithBoard = await syncSparkQaStartupIntelligenceLoop({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
      });
      assert.equal(startupIntelligenceWithBoard.state?.startupBenchmark.advisoryPersonaBoard?.personaPreset, 'proof_heavy');
      assert.equal(startupIntelligenceWithBoard.state?.startupBenchmark.advisoryPersonaBoard?.network_absorbable, false);
      assert.match(renderSparkQaStartupIntelligenceLoop(startupIntelligenceWithBoard), /Advisory board is proof heavy/);

      const telegramBackgroundPath = path.join(repo, '.spark-swarm', 'startup-bench-evolution', 'telegram-background-runs.json');
      mkdirSync(path.dirname(telegramBackgroundPath), { recursive: true });
      writeFileSync(telegramBackgroundPath, JSON.stringify({
        schemaVersion: 'spark-qa-startup-improvement-background-runs.v1',
        generatedAt: '2026-05-29T00:00:00Z',
        updatedAt: '2026-05-29T00:01:00Z',
        jobs: {
          'telegram:8319079055': {
            chatKey: 'telegram:8319079055',
            chatId: 8319079055,
            status: 'active',
            requestedCycles: 100,
            benchmarkLevel: 10,
            agentReviewers: 5,
            updatedAt: '2026-05-29T00:01:00Z',
            nextTickAt: '2026-05-29T00:03:00Z',
            lastStateStatus: 'ready_for_next_tick',
            lastNextCommand: '/sparkqa improve startup-bench tick',
            scoreClaimAllowed: false,
            improvementClaimAllowed: false,
            public_ready: false,
            network_absorbable: false,
          },
        },
        localOnly: true,
        scoreClaimAllowed: false,
        improvementClaimAllowed: false,
        public_ready: false,
        network_absorbable: false,
        claimBoundary: 'local private background run registry only',
      }, null, 2), 'utf-8');

      const sparkSwarmExport = await syncSparkQaStartupBenchSparkSwarmExport({
        repoRoot: repo,
        runId: 'startup-proof-1',
      });
      assert.equal(sparkSwarmExport.ok, true);
      assert.equal(sparkSwarmExport.packet?.schemaVersion, 'spark-startup-bench-spark-swarm-export-packet.v1');
      assert.equal(sparkSwarmExport.packet?.packetId, 'startup-proof-1');
      assert.equal(sparkSwarmExport.packet?.status, 'waiting_on_proof_closure');
      assert.equal(sparkSwarmExport.packet?.source.specializationPath, 'startup-bench');
      assert.equal(sparkSwarmExport.packet?.source.targetPath, 'startup-operator');
      assert.equal(sparkSwarmExport.packet?.loopStatusPacket.schemaId, 'https://sparkswarm.ai/schemas/spark-specialization-loop-status.schema.json');
      assert.equal(sparkSwarmExport.packet?.loopStatusPacket.pathKey, 'startup-operator');
      assert.equal(sparkSwarmExport.packet?.loopStatusPacket.decision, 'unproven');
      assert.equal(sparkSwarmExport.packet?.insightPacket.schemaId, 'https://sparkswarm.ai/schemas/spark-specialization-loop-insight-packet.schema.json');
      assert.equal(sparkSwarmExport.packet?.swarmContracts.domainChipLabs.system, 'Spark Domain Chip Labs');
      assert.equal(sparkSwarmExport.packet?.swarmContracts.domainChipLabs.localPrivateDefault, true);
      assert.equal(sparkSwarmExport.packet?.swarmContracts.domainChipLabs.contracts.absorption, 'spark-domain-chip-labs.absorption-contract.v1');
      assert.equal(sparkSwarmExport.packet?.benchmarkRunSummary.schemaVersion, 'spark-specialization-path-benchmark-run.v1');
      assert.equal(sparkSwarmExport.packet?.benchmarkRunSummary.specializationPathKey, 'startup-operator');
      assert.equal(sparkSwarmExport.packet?.benchmarkRunSummary.comparison.deltaFromBaseline, 0.03);
      assert.equal(sparkSwarmExport.packet?.loopStatusPacket.suiteFirst.latestRun.scenarioCount, 14);
      assert.equal(sparkSwarmExport.packet?.insightPacket.benchmark.suiteFirst.latestRun.scenarioCount, 14);
      assert.equal(sparkSwarmExport.packet?.benchmarkRunSummary.learningMap.scenarioCount, 14);
      assert.equal(sparkSwarmExport.packet?.reasoning.schemaVersion, 'spark-startup-bench-swarm-reasoning-summary.v1');
      assert.equal(sparkSwarmExport.packet?.reasoning.trialCount, 3);
      assert.equal(sparkSwarmExport.packet?.reasoning.observedReasoningImprovement, true);
      assert.equal(sparkSwarmExport.packet?.reasoning.observableReasoningDeltaPositive, true);
      assert.equal(sparkSwarmExport.packet?.reasoning.reasoningImprovementClaimAllowed, false);
      assert.equal(sparkSwarmExport.packet?.reasoning.claimableReasoningImprovementObserved, false);
      assert.equal(sparkSwarmExport.packet?.reasoning.scoreClaimAllowed, false);
      assert.equal(sparkSwarmExport.packet?.loopStatusPacket.reasoning.trialCount, 3);
      assert.equal(sparkSwarmExport.packet?.insightPacket.benchmark.reasoning.trialCount, 3);
      assert.equal(sparkSwarmExport.packet?.benchmarkRunSummary.reasoning.trialCount, 3);
      assert.equal(sparkSwarmExport.packet?.telegramBackground.status, 'attached');
      assert.equal(sparkSwarmExport.packet?.telegramBackground.activeJobCount, 1);
      assert.equal(sparkSwarmExport.packet?.telegramBackground.latestJob.status, 'active');
      assert.equal(sparkSwarmExport.packet?.telegramBackground.latestJob.requestedCycles, 100);
      assert.equal(sparkSwarmExport.packet?.loopStatusPacket.telegramBackground.activeJobCount, 1);
      assert.equal(sparkSwarmExport.packet?.insightPacket.benchmark.telegramBackground.latestJob.status, 'active');
      assert.equal(sparkSwarmExport.packet?.benchmarkRunSummary.telegramBackground.activeJobCount, 1);
      assert.equal(sparkSwarmExport.packet?.advisoryPersonaBoard.personaPreset, 'proof_heavy');
      assert.equal(sparkSwarmExport.packet?.advisoryPersonaBoard.personaLabels[1], 'Benchmark Anti-Gaming Reviewer');
      assert.equal(sparkSwarmExport.packet?.loopStatusPacket.advisoryPersonaBoard.personaPreset, 'proof_heavy');
      assert.equal(sparkSwarmExport.packet?.insightPacket.benchmark.advisoryPersonaBoard.targetReviewers, 5);
      assert.equal(sparkSwarmExport.packet?.benchmarkRunSummary.advisoryPersonaBoard.countsAsHumanApproval, false);
      assert.equal(sparkSwarmExport.packet?.mutationRecommendation.status, 'waiting_for_advisory');
      assert.equal(sparkSwarmExport.packet?.mutationRecommendation.strategy, 'insert_checkpoint_before_sales_pipeline_update');
      assert.equal(sparkSwarmExport.packet?.mutationRecommendation.advisoryReturned, 0);
      assert.equal(sparkSwarmExport.packet?.loopStatusPacket.mutationRecommendation.strategy, 'insert_checkpoint_before_sales_pipeline_update');
      assert.equal(typeof sparkSwarmExport.packet?.insightPacket.benchmark.mutationRecommendation.weakTrackCount, 'number');
      assert.equal(sparkSwarmExport.packet?.benchmarkRunSummary.mutationRecommendation.selectedTicketId, 'startup-operator-tool-script-candidate');
      assert.equal(sparkSwarmExport.packet?.benchmarkRoundSummary?.schemaVersion, 'spark-specialization-path-benchmark-round.v1');
      assert.equal(sparkSwarmExport.packet?.benchmarkRoundSummary?.round.decision, 'kept_private');
      assert.match(sparkSwarmExport.packet?.benchmarkRoundBoundary || '', /private cycle closed/);
      assert.equal(sparkSwarmExport.packet?.localOnly, true);
      assert.equal(sparkSwarmExport.packet?.scoreClaimAllowed, false);
      assert.equal(sparkSwarmExport.packet?.improvementClaimAllowed, false);
      assert.equal(sparkSwarmExport.packet?.public_ready, false);
      assert.equal(sparkSwarmExport.packet?.network_absorbable, false);
      assert.ok(sparkSwarmExport.packet?.artifacts.some((item) => item.role === 'spark_one_export_packet'));
      assert.ok(sparkSwarmExport.packet?.artifacts.some((item) => item.role === 'startup_bench_suite_run'));
      assert.ok(sparkSwarmExport.packet?.artifacts.some((item) => item.role === 'telegram_background_runs'));
      assert.ok(sparkSwarmExport.packet?.artifacts.some((item) => item.role === 'advisory_agent_profile'));
      assert.ok(sparkSwarmExport.packet?.artifacts.some((item) => item.role === 'mutation_recommendation'));
      assert.ok(sparkSwarmExport.packet?.artifacts.some((item) => item.role === 'reasoning_trials_judge'));
      assert.equal(sparkSwarmExport.reasoningTrials?.judgeReport?.trialCount, 3);
      assert.ok(!sparkSwarmExport.packet?.blockers.includes('reasoning_improvement_unproven'));
      assert.ok(!sparkSwarmExport.packet?.blockers.includes('benchmark_round_not_closed'));
      assert.doesNotMatch(JSON.stringify(sparkSwarmExport.packet?.telegramBackground), /8319079055|telegram:/);
      assert.equal(existsSync(String(sparkSwarmExport.packetPath)), true);
      assert.equal(existsSync(String(sparkSwarmExport.kanbanPath)), true);
      const sparkSwarmReply = renderSparkQaStartupBenchSparkSwarmExport(sparkSwarmExport);
      assert.match(sparkSwarmReply, /Spark Swarm private packet is staged/);
      assert.match(sparkSwarmReply, /startup-proof-1/);
      assert.match(sparkSwarmReply, /loop status, insight, benchmark-run, and benchmark-round/);
      assert.match(sparkSwarmReply, /Full-suite map attached/);
      assert.match(sparkSwarmReply, /Telegram background worker: active/);
      assert.match(sparkSwarmReply, /Mutation recommendation: insert checkpoint before sales pipeline update/);
      assert.match(sparkSwarmReply, /Reasoning evidence: 3 paired observable trace-proxy trials attached; claim blocked/);
      assert.match(sparkSwarmReply, /public_ready=false/);
      assert.match(sparkSwarmReply, /No score or improvement claim/);
      writeFileSync(startupToolScriptPath, startupToolScriptBefore, 'utf-8');

      const prematureSidecar = await runSparkQaStartupBenchSidecarAttestation({
        repoRoot: repo,
        reviewerId: 'telegram:reviewer-a',
      });
      assert.equal(prematureSidecar.ok, false);
      assert.equal(prematureSidecar.reviewerCount, 0);
      assert.match(renderSparkQaStartupBenchSidecarAttestation(prematureSidecar), /Run \/sparkqa sidecar first/);

      const sidecarReview = await runSparkQaStartupBenchSidecarReview({ repoRoot: repo });
      assert.equal(sidecarReview.ok, true);
      assert.equal(sidecarReview.packet?.schemaVersion, 'spark-startup-bench-sidecar-review-packet.v1');
      assert.equal(sidecarReview.packet?.reviewerQuorum.recorded, 0);
      assert.equal(sidecarReview.packet?.reviewerQuorum.required, 1);
      assert.equal(sidecarReview.packet?.reviewerQuorum.remaining, 1);
      assert.equal(sidecarReview.packet?.scoreClaimAllowed, false);
      assert.equal(existsSync(String(sidecarReview.packetPath)), true);
      assert.equal(existsSync(String(sidecarReview.kanbanPath)), true);
      const sidecarReviewReply = renderSparkQaStartupBenchSidecarReview(sidecarReview);
      assert.match(sidecarReviewReply, /sidecar review packet is ready/);
      assert.match(sidecarReviewReply, /\/sparkqa gates attest/);
      assert.match(sidecarReviewReply, /No score is created from review/);

      const handoff = await syncSparkQaStartupBenchReviewerHandoff({ repoRoot: repo });
      assert.equal(handoff.ok, true);
      assert.equal(handoff.handoff?.schemaVersion, 'spark-startup-bench-reviewer-handoff.v1');
      assert.equal(handoff.handoff?.reviewerQuorum.recorded, 0);
      assert.equal(handoff.handoff?.reviewerQuorum.required, 1);
      assert.equal(handoff.handoff?.reviewerQuorum.remaining, 1);
      assert.equal(handoff.handoff?.scoreClaimAllowed, false);
      assert.equal(existsSync(String(handoff.handoffPath)), true);
      assert.equal(existsSync(String(handoff.kanbanPath)), true);
      const handoffReply = renderSparkQaStartupBenchReviewerHandoff(handoff);
      assert.match(handoffReply, /reviewer handoff is ready/);
      assert.match(handoffReply, /0\/1 independent sidecar approvals/);
      assert.match(handoffReply, /run \/sparkqa sidecar/);
      assert.match(handoffReply, /run \/sparkqa gates attest/);
      assert.match(handoffReply, /no score is created/i);

      const reviewerInvite = await syncSparkQaStartupBenchReviewerInvite({ repoRoot: repo });
      assert.equal(reviewerInvite.ok, true);
      assert.equal(reviewerInvite.packet?.schemaVersion, 'spark-startup-bench-reviewer-invite-packet.v1');
      assert.equal(reviewerInvite.packet?.status, 'needs_reviewers');
      assert.equal(reviewerInvite.packet?.reviewerQuorum.required, 1);
      assert.equal(reviewerInvite.packet?.reviewerQuorum.remaining, 1);
      assert.equal(reviewerInvite.packet?.inviteMessages.filter((invite) => invite.status === 'needs_reviewer').length, 1);
      assert.match(String(reviewerInvite.packet?.inviteMessages[0]?.shareText), /run \/sparkqa sidecar/);
      assert.match(String(reviewerInvite.packet?.inviteMessages[0]?.shareText), /run \/sparkqa gates attest/);
      assert.equal(reviewerInvite.packet?.scoreClaimAllowed, false);
      assert.equal(reviewerInvite.packet?.improvementClaimAllowed, false);
      assert.equal(reviewerInvite.packet?.public_ready, false);
      assert.equal(reviewerInvite.packet?.network_absorbable, false);
      assert.equal(existsSync(String(reviewerInvite.packetPath)), true);
      assert.equal(existsSync(String(reviewerInvite.kanbanPath)), true);
      const reviewerInviteReply = renderSparkQaStartupBenchReviewerInvite(reviewerInvite);
      assert.match(reviewerInviteReply, /reviewer invite packet is ready/);
      assert.match(reviewerInviteReply, /1 reviewer/);
      assert.match(reviewerInviteReply, /No approval is recorded/);
      assert.match(reviewerInviteReply, /no score is created/);

      const reviewPolicy = await syncSparkQaStartupBenchReviewPolicy({
        repoRoot: repo,
        mode: 'fast_lab',
        agentReviewers: 0,
      });
      assert.equal(reviewPolicy.ok, true);
      assert.equal(reviewPolicy.policy?.schemaVersion, 'spark-startup-bench-review-policy.v1');
      assert.equal(reviewPolicy.policy?.mode, 'fast_lab');
      assert.equal(reviewPolicy.policy?.privateEvolution.sidecarOptional, true);
      assert.equal(reviewPolicy.policy?.agentReview.targetReviewers, 0);
      assert.equal(reviewPolicy.policy?.agentReview.countsAsApproval, false);
      assert.equal(reviewPolicy.policy?.scoreClaimPolicy.requiresHumanQuorum, true);
      assert.equal(reviewPolicy.policy?.scoreClaimAllowed, false);
      assert.equal(reviewPolicy.policy?.improvementClaimAllowed, false);
      assert.equal(existsSync(String(reviewPolicy.policyPath)), true);
      assert.equal(existsSync(String(reviewPolicy.kanbanPath)), true);
      const reviewPolicyReply = renderSparkQaStartupBenchReviewPolicy(reviewPolicy);
      assert.match(reviewPolicyReply, /review policy is fast lab/);
      assert.match(reviewPolicyReply, /Human sidecar is optional for private lab evolution/);
      assert.match(reviewPolicyReply, /Score claims still require human quorum/);

      const advisoryPacket = await syncSparkQaStartupBenchAdvisoryReviewPacket({
        repoRoot: repo,
        agentReviewers: 5,
      });
      assert.equal(advisoryPacket.ok, true);
      assert.equal(advisoryPacket.packet?.schemaVersion, 'spark-startup-bench-advisory-review-packet.v1');
      assert.equal(advisoryPacket.packet?.reviewPolicy.mode, 'fast_lab');
      assert.equal(advisoryPacket.packet?.reviewPolicy.sidecarOptionalForPrivateEvolution, true);
      assert.equal(advisoryPacket.packet?.advisoryReview.targetReviewers, 5);
      assert.equal(advisoryPacket.packet?.advisoryReview.connectedReviewers, 0);
      assert.equal(advisoryPacket.packet?.advisoryReview.remainingReviewers, 5);
      assert.equal(advisoryPacket.packet?.advisoryReview.countsAsHumanApproval, false);
      assert.equal(advisoryPacket.packet?.advisoryReview.requiredForScoreClaim, false);
      assert.equal(advisoryPacket.packet?.reviewSlots.length, 5);
      assert.equal(advisoryPacket.packet?.reviewSlots[0]?.outputContract.mustInclude.includes('scoreClaimAllowed:false'), true);
      assert.equal(advisoryPacket.packet?.scoreClaimAllowed, false);
      assert.equal(advisoryPacket.packet?.improvementClaimAllowed, false);
      assert.equal(advisoryPacket.packet?.public_ready, false);
      assert.equal(advisoryPacket.packet?.network_absorbable, false);
      assert.equal(existsSync(String(advisoryPacket.packetPath)), true);
      assert.equal(existsSync(String(advisoryPacket.kanbanPath)), true);
      const advisoryReply = renderSparkQaStartupBenchAdvisoryReviewPacket(advisoryPacket);
      assert.match(advisoryReply, /advisory packet is staged/);
      assert.match(advisoryReply, /0\/5 advisory reviewers connected/);
      assert.match(advisoryReply, /do not count as human approval/);
      assert.match(advisoryReply, /score claims/);

      const advisoryRecord = await recordSparkQaStartupBenchAdvisoryReview({
        repoRoot: repo,
        slot: 1,
        verdict: 'useful',
        reviewerId: 'telegram:advisory-a',
        reviewerKind: 'telegram_advisory',
      });
      assert.equal(advisoryRecord.ok, true);
      assert.equal(advisoryRecord.ledger?.schemaVersion, 'spark-startup-bench-advisory-review-ledger.v1');
      assert.equal(advisoryRecord.record?.slot, 1);
      assert.equal(advisoryRecord.record?.verdict, 'useful');
      assert.equal(advisoryRecord.record?.countsAsHumanApproval, false);
      assert.equal(advisoryRecord.record?.scoreClaimAllowed, false);
      assert.equal(advisoryRecord.ledger?.summary.recordedSlots, 1);
      assert.equal(advisoryRecord.ledger?.summary.openSlots, 4);
      assert.equal(advisoryRecord.ledger?.scoreClaimAllowed, false);
      assert.equal(advisoryRecord.ledger?.improvementClaimAllowed, false);
      assert.equal(advisoryRecord.ledger?.public_ready, false);
      assert.equal(advisoryRecord.ledger?.network_absorbable, false);
      assert.equal(existsSync(String(advisoryRecord.ledgerPath)), true);
      assert.equal(existsSync(String(advisoryRecord.packetPath)), true);
      const advisoryRecordReply = renderSparkQaStartupBenchAdvisoryReviewRecord(advisoryRecord);
      assert.match(advisoryRecordReply, /advisory review recorded for slot 1/);
      assert.match(advisoryRecordReply, /1\/5 slots recorded/);
      assert.match(advisoryRecordReply, /does not count as human approval/);
      assert.match(advisoryRecordReply, /score claim/);

      const fastLabEvolutionPlan = await syncSparkQaStartupBenchEvolutionPlan({
        repoRoot: repo,
        requestedCycles: 100,
      });
      assert.equal(fastLabEvolutionPlan.ok, true);
      assert.equal(fastLabEvolutionPlan.plan?.reviewPolicy.mode, 'fast_lab');
      assert.equal(fastLabEvolutionPlan.plan?.reviewPolicy.sidecarOptionalForPrivateEvolution, true);
      assert.equal(fastLabEvolutionPlan.plan?.reviewPolicy.humanQuorumRequiredForScoreClaim, true);
      assert.equal(fastLabEvolutionPlan.plan?.reviewPolicy.agentReviewers.target, 5);
      assert.equal(fastLabEvolutionPlan.plan?.status, 'ready_for_worker');
      assert.equal(fastLabEvolutionPlan.plan?.workerReady, true);
      assert.equal(fastLabEvolutionPlan.plan?.canStartHundredLoopNow, true);
      assert.ok(!fastLabEvolutionPlan.plan?.blockers.some((blocker) => blocker.includes('sidecar_review_pending')));
      assert.ok(!fastLabEvolutionPlan.plan?.blockers.some((blocker) => blocker.includes('wall_clock')));
      assert.ok(!fastLabEvolutionPlan.plan?.blockers.some((blocker) => blocker.includes('score_reconciliation')));
      assert.equal(fastLabEvolutionPlan.plan?.scoreClaimAllowed, false);

      const advisoryAgentDispatch = await syncSparkQaStartupBenchAdvisoryAgentDispatch({
        repoRoot: repo,
        agentReviewers: 5,
      });
      assert.equal(advisoryAgentDispatch.ok, true);
      const advisoryRoster = advisoryAgentDispatch.roster as any;
      assert.ok(advisoryRoster);
      assert.equal(advisoryRoster.schemaVersion, 'spark-startup-bench-advisory-agent-roster.v1');
      assert.equal(advisoryRoster.reviewPolicy.mode, 'agent_advisory');
      assert.equal(advisoryRoster.reviewPolicy.sidecarOptionalForPrivateEvolution, true);
      assert.equal(advisoryRoster.targetReviewers, 5);
      assert.equal(advisoryRoster.returnedReviewers, 0);
      assert.equal(advisoryRoster.agents.length, 5);
      assert.equal(advisoryRoster.personaDeck.length, 5);
      assert.deepEqual(advisoryRoster.personaDeck.map((persona: any) => persona.label), [
        'Proof Integrity Auditor',
        'Benchmark Anti-Gaming Reviewer',
        'Tool Trace Analyst',
        'Proof Integrity Auditor',
        'Startup Operator Strategist',
      ]);
      assert.equal(advisoryRoster.agents[0]?.persona?.label, 'Proof Integrity Auditor');
      assert.equal(advisoryRoster.privateMutationGuidance.personaSummary.length, 5);
      assert.equal(advisoryRoster.agents.every((agent: any) => agent.status === 'requested'), true);
      assert.equal(advisoryRoster.artifactRefs.some((ref: any) => ref.role === 'proof_report'), true);
      assert.equal(advisoryRoster.countsAsHumanApproval, false);
      assert.equal(advisoryRoster.requiredForScoreClaim, false);
      assert.equal(advisoryRoster.scoreClaimAllowed, false);
      assert.equal(advisoryRoster.improvementClaimAllowed, false);
      assert.equal(advisoryRoster.public_ready, false);
      assert.equal(advisoryRoster.network_absorbable, false);
      assert.equal(existsSync(String(advisoryAgentDispatch.rosterPath)), true);
      assert.equal(existsSync(String(advisoryAgentDispatch.kanbanPath)), true);
      for (const promptPath of advisoryAgentDispatch.promptPaths || []) {
        assert.equal(existsSync(promptPath), true);
      }
      const firstAdvisoryPrompt = JSON.parse(readFileSync(String(advisoryAgentDispatch.promptPaths?.[0]), 'utf-8'));
      assert.equal(firstAdvisoryPrompt.persona.label, 'Proof Integrity Auditor');
      assert.ok(firstAdvisoryPrompt.focus.includes('stale proof'));
      assert.ok(firstAdvisoryPrompt.toolUseExpectations.includes('verify artifact hashes'));
      const advisoryDispatchReply = renderSparkQaStartupBenchAdvisoryAgentDispatch(advisoryAgentDispatch);
      assert.match(advisoryDispatchReply, /Advisory-agent review is staged/);
      assert.match(advisoryDispatchReply, /review board covers Proof Integrity Auditor/i);
      assert.match(advisoryDispatchReply, /0\/5 results are back/);
      assert.match(advisoryDispatchReply, /do not count as human sidecar approval/);
      assert.match(advisoryDispatchReply, /cannot create a score claim/);

      const advisoryAgentStatusBefore = await readSparkQaStartupBenchAdvisoryAgentStatus({ repoRoot: repo });
      assert.equal(advisoryAgentStatusBefore.ok, true);
      assert.equal(advisoryAgentStatusBefore.roster?.returnedReviewers, 0);
      assert.match(renderSparkQaStartupBenchAdvisoryAgentStatus(advisoryAgentStatusBefore), /0\/5 returned/);

      const advisoryRosterPath = String(advisoryAgentDispatch.rosterPath);
      const advisoryRosterSha = createHash('sha256').update(readFileSync(advisoryRosterPath)).digest('hex');
      const advisoryPolicyRef = advisoryRoster.artifactRefs.find((ref: any) => ref.role === 'review_policy');
      const advisoryPacketRef = advisoryRoster.artifactRefs.find((ref: any) => ref.role === 'advisory_review_packet');
      const advisoryPolicyShaBeforeIngest = advisoryPolicyRef?.path
        ? createHash('sha256').update(readFileSync(advisoryPolicyRef.path)).digest('hex')
        : null;
      const advisoryPacketShaBeforeIngest = advisoryPacketRef?.path
        ? createHash('sha256').update(readFileSync(advisoryPacketRef.path)).digest('hex')
        : null;
      const advisoryTmpDir = path.join(repo, '.spark-swarm', 'tmp-advisory-results');
      mkdirSync(advisoryTmpDir, { recursive: true });
      const validAgentResultPath = path.join(advisoryTmpDir, 'slot-01.valid.json');
      writeFileSync(validAgentResultPath, JSON.stringify({
        schemaVersion: 'spark-startup-bench-agent-advisory-review-result.v1',
        generatedAt: new Date().toISOString(),
        slot: 1,
        agentId: 'sparkqa-startup-bench-advisory-agent-1',
        reviewerKind: 'spark_agent',
        rosterSha256: advisoryRosterSha,
        proofReportSha256: advisoryRoster.proofReport.sha256,
        inputArtifactRefs: advisoryRoster.artifactRefs,
        verdict: 'useful',
        evidenceRefs: [
          `proof:${advisoryRoster.proofReport.sha256}`,
          'artifact:score_reconciliation_workbench',
        ],
        failureFamilies: ['startup_trace_delta', 'tool_sequence_checkpoint'],
        recommendedMutationTickets: ['advisory-agent-slot-1-runway-checkpoint'],
        concerns: ['wall-clock stability still needs a fresh elapsed run'],
        countsAsHumanApproval: false,
        requiredForScoreClaim: false,
        scoreClaimAllowed: false,
        improvementClaimAllowed: false,
        public_ready: false,
        network_absorbable: false,
      }, null, 2), 'utf-8');
      const advisoryAgentIngest = await ingestSparkQaStartupBenchAdvisoryAgentResult({
        repoRoot: repo,
        resultPath: validAgentResultPath,
      });
      assert.equal(advisoryAgentIngest.ok, true);
      assert.equal(advisoryAgentIngest.result?.schemaVersion, 'spark-startup-bench-agent-advisory-review-result.v1');
      assert.equal(advisoryAgentIngest.result?.reviewerKind, 'spark_agent');
      assert.equal(advisoryAgentIngest.result?.persona.label, 'Proof Integrity Auditor');
      assert.equal(advisoryAgentIngest.result?.countsAsHumanApproval, false);
      assert.equal(advisoryAgentIngest.result?.requiredForScoreClaim, false);
      assert.equal(advisoryAgentIngest.result?.scoreClaimAllowed, false);
      assert.equal(advisoryAgentIngest.result?.public_ready, false);
      assert.equal(advisoryAgentIngest.result?.network_absorbable, false);
      assert.equal(advisoryAgentIngest.roster?.returnedReviewers, 1);
      assert.equal(advisoryAgentIngest.roster?.useful, 1);
      assert.equal(advisoryAgentIngest.ledger?.records[0]?.reviewerKind, 'spark_agent');
      assert.equal(advisoryAgentIngest.ledger?.records[0]?.countsAsHumanApproval, false);
      assert.equal(advisoryAgentIngest.ledger?.scoreClaimAllowed, false);
      assert.equal(existsSync(String(advisoryAgentIngest.resultPath)), true);
      if (advisoryPolicyRef?.path && advisoryPolicyShaBeforeIngest) {
        assert.equal(createHash('sha256').update(readFileSync(advisoryPolicyRef.path)).digest('hex'), advisoryPolicyShaBeforeIngest);
      }
      if (advisoryPacketRef?.path && advisoryPacketShaBeforeIngest) {
        assert.equal(createHash('sha256').update(readFileSync(advisoryPacketRef.path)).digest('hex'), advisoryPacketShaBeforeIngest);
      }
      const advisoryIngestReply = renderSparkQaStartupBenchAdvisoryAgentIngest(advisoryAgentIngest);
      assert.match(advisoryIngestReply, /Ingested advisory-agent slot 1/);
      assert.match(advisoryIngestReply, /1\/5 returned/);
      assert.match(advisoryIngestReply, /private mutation triage only/);
      assert.match(advisoryIngestReply, /cannot clear a score claim/);

      const advisoryAgentStatusAfter = await readSparkQaStartupBenchAdvisoryAgentStatus({ repoRoot: repo });
      assert.equal(advisoryAgentStatusAfter.roster?.returnedReviewers, 1);
      assert.equal(advisoryAgentStatusAfter.roster?.privateMutationGuidance.allowed, true);
      assert.match(renderSparkQaStartupBenchAdvisoryAgentStatus(advisoryAgentStatusAfter), /1\/5 returned/);
      assert.match(renderSparkQaStartupBenchAdvisoryAgentStatus(advisoryAgentStatusAfter), /No human approval, score claim/);

      const rejectedAgentResults: Array<{ name: string; patch: Record<string, any>; error: RegExp }> = [
        {
          name: 'score-claim',
          patch: { slot: 2, scoreClaimAllowed: true },
          error: /scoreClaimAllowed_must_be_false/,
        },
        {
          name: 'human-approval',
          patch: { slot: 2, countsAsHumanApproval: true },
          error: /countsAsHumanApproval_must_be_false/,
        },
        {
          name: 'proof-mismatch',
          patch: { slot: 2, proofReportSha256: 'bad-proof-hash' },
          error: /proof_hash_mismatch/,
        },
        {
          name: 'network-absorption',
          patch: { slot: 2, network_absorbable: true },
          error: /network_absorbable_must_be_false/,
        },
        {
          name: 'input-artifact-hash-mismatch',
          patch: {
            slot: 2,
            inputArtifactRefs: advisoryRoster.artifactRefs.map((ref: any, index: number) => index === 0
              ? { ...ref, sha256: '0'.repeat(64) }
              : ref),
          },
          error: /input_artifact_hash_mismatch/,
        },
        {
          name: 'unverified-artifact-claim',
          patch: {
            slot: 2,
            failureFamilies: ['artifact_hash_mismatch'],
          },
          error: /unverified_deterministic_failure_family/,
        },
      ];
      for (const rejectedCase of rejectedAgentResults) {
        const rejectedPath = path.join(advisoryTmpDir, `slot-02.${rejectedCase.name}.json`);
        writeFileSync(rejectedPath, JSON.stringify({
          schemaVersion: 'spark-startup-bench-agent-advisory-review-result.v1',
          generatedAt: new Date().toISOString(),
          slot: 2,
          agentId: 'sparkqa-startup-bench-advisory-agent-2',
          reviewerKind: 'spark_agent',
          proofReportSha256: advisoryRoster.proofReport.sha256,
          inputArtifactRefs: advisoryRoster.artifactRefs,
          verdict: 'useful',
          evidenceRefs: [`proof:${advisoryRoster.proofReport.sha256}`],
          failureFamilies: ['startup_trace_delta'],
          recommendedMutationTickets: ['advisory-agent-slot-2-triage'],
          concerns: [],
          countsAsHumanApproval: false,
          requiredForScoreClaim: false,
          scoreClaimAllowed: false,
          improvementClaimAllowed: false,
          public_ready: false,
          network_absorbable: false,
          ...rejectedCase.patch,
        }, null, 2), 'utf-8');
        const rejected = await ingestSparkQaStartupBenchAdvisoryAgentResult({
          repoRoot: repo,
          resultPath: rejectedPath,
        });
        assert.equal(rejected.ok, false);
        assert.match(String(rejected.error), rejectedCase.error);
        const rejectedReply = renderSparkQaStartupBenchAdvisoryAgentIngest(rejected);
        assert.match(rejectedReply, /rejected/i);
        assert.doesNotMatch(rejectedReply, /score cleared|score-ready|human approval recorded/i);
      }
      const advisoryAgentStatusAfterRejects = await readSparkQaStartupBenchAdvisoryAgentStatus({ repoRoot: repo });
      assert.equal(advisoryAgentStatusAfterRejects.roster?.returnedReviewers, 1);

      for (const slot of [2, 3, 4, 5]) {
        const validPath = path.join(advisoryTmpDir, `slot-${String(slot).padStart(2, '0')}.valid.json`);
        writeFileSync(validPath, JSON.stringify({
          schemaVersion: 'spark-startup-bench-agent-advisory-review-result.v1',
          generatedAt: new Date().toISOString(),
          slot,
          agentId: `sparkqa-startup-bench-advisory-agent-${slot}`,
          reviewerKind: 'spark_agent',
          proofReportSha256: advisoryRoster.proofReport.sha256,
          inputArtifactRefs: advisoryRoster.artifactRefs,
          verdict: 'useful',
          evidenceRefs: [`proof:${advisoryRoster.proofReport.sha256}`, `advisory-slot:${slot}`],
          failureFamilies: ['startup_trace_delta', `advisory_slot_${slot}_reasoning_gap`],
          recommendedMutationTickets: [`advisory-agent-slot-${slot}-checkpoint`],
          concerns: [`slot ${slot} wants the mutation to stay private until fresh proof closes`],
          countsAsHumanApproval: false,
          requiredForScoreClaim: false,
          scoreClaimAllowed: false,
          improvementClaimAllowed: false,
          public_ready: false,
          network_absorbable: false,
        }, null, 2), 'utf-8');
        const validIngest = await ingestSparkQaStartupBenchAdvisoryAgentResult({
          repoRoot: repo,
          resultPath: validPath,
        });
        assert.equal(validIngest.ok, true);
      }

      const advisoryAgentStatusReady = await readSparkQaStartupBenchAdvisoryAgentStatus({ repoRoot: repo });
      assert.equal(advisoryAgentStatusReady.roster?.returnedReviewers, 5);
      assert.equal(advisoryAgentStatusReady.roster?.status, 'ready_for_private_mutation');

      const advisoryGuidedPlan = await syncSparkQaStartupBenchMutationPlan({ repoRoot: repo });
      assert.equal(advisoryGuidedPlan.ok, true);
      assert.equal(advisoryGuidedPlan.plan?.advisoryGuidance.status, 'ready_for_private_mutation');
      assert.equal(advisoryGuidedPlan.plan?.advisoryGuidance.returnedReviewers, 5);
      assert.ok(advisoryGuidedPlan.plan?.advisoryGuidance.personaSummary.some((item) => item.includes('Proof Integrity Auditor')));
      assert.ok(advisoryGuidedPlan.plan?.planOnlyDispatch.selectedFamilies.some((family) => family.includes('startup_trace_delta')));
      assert.ok(advisoryGuidedPlan.plan?.artifactRefs.some((ref) => ref.role === 'advisory_agent_roster'));
      assert.equal(advisoryGuidedPlan.plan?.scoreClaimAllowed, false);

      const advisoryGuidedWorker = await syncSparkQaStartupBenchEvolutionWorker({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
      });
      assert.equal(advisoryGuidedWorker.ok, true);
      assert.equal(advisoryGuidedWorker.state?.status, 'ready_for_cycle');
      assert.equal(advisoryGuidedWorker.state?.workerCapabilities.privateMutationPrepFromAdvisory, true);
      assert.equal(advisoryGuidedWorker.state?.lastTickResult?.mode, 'advisory_private_candidate_prepared');
      assert.ok(advisoryGuidedWorker.state?.lastTickResult?.artifactRefs.some((ref) => ref.role === 'mutation_candidate'));
      assert.equal(advisoryGuidedWorker.state?.lastTickResult?.scoreClaimAllowed, false);
      assert.equal(advisoryGuidedWorker.state?.scoreClaimAllowed, false);
      const advisoryGuidedWorkerReply = renderSparkQaStartupBenchEvolutionWorker(advisoryGuidedWorker);
      assert.match(advisoryGuidedWorkerReply, /prepared the advisory-guided private candidate/);
      assert.match(advisoryGuidedWorkerReply, /No score, improvement claim/);

      const advisoryCandidateRef = advisoryGuidedWorker.state?.lastTickResult?.artifactRefs.find((ref) => ref.role === 'mutation_candidate');
      assert.ok(advisoryCandidateRef);
      const advisoryCandidate = JSON.parse(readFileSync(String(advisoryCandidateRef.path), 'utf-8'));
      assert.equal(advisoryCandidate.status, 'candidate_ready');
      assert.equal(advisoryCandidate.mutationApplied, false);
      assert.equal(readFileSync(startupToolScriptPath, 'utf-8'), startupToolScriptBefore);

      const advisoryApplyWorker = await syncSparkQaStartupBenchEvolutionWorker({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
      });
      assert.equal(advisoryApplyWorker.ok, true);
      assert.equal(advisoryApplyWorker.state?.tickCount, Number(advisoryGuidedWorker.state?.tickCount || 0) + 1);
      assert.equal(advisoryApplyWorker.state?.lastTickResult?.mode, 'advisory_private_candidate_applied');
      assert.ok(advisoryApplyWorker.state?.lastTickResult?.artifactRefs.some((ref) => ref.role === 'mutation_apply'));
      assert.equal(advisoryApplyWorker.state?.lastTickResult?.nextCommand, '/sparkqa run');
      assert.equal(advisoryApplyWorker.state?.lastTickResult?.scoreClaimAllowed, false);
      assert.equal(advisoryApplyWorker.state?.scoreClaimAllowed, false);
      const advisoryAppliedText = readFileSync(startupToolScriptPath, 'utf-8');
      assert.notEqual(advisoryAppliedText, startupToolScriptBefore);
      assert.equal(createHash('sha256').update(advisoryAppliedText).digest('hex'), advisoryCandidate.patch.candidateSha256);
      const advisoryApplyWorkerReply = renderSparkQaStartupBenchEvolutionWorker(advisoryApplyWorker);
      assert.match(advisoryApplyWorkerReply, /applied the advisory-guided candidate through hash checks/);
      assert.match(advisoryApplyWorkerReply, /Next: \/sparkqa run/);
      assert.match(advisoryApplyWorkerReply, /No score, improvement claim/);

      const waitingForFreshProofOrchestrator = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
      });
      assert.equal(waitingForFreshProofOrchestrator.state?.status, 'waiting_for_fresh_proof');
      assert.equal(waitingForFreshProofOrchestrator.state?.completedCycles, 0);
      assert.equal(waitingForFreshProofOrchestrator.state?.scoreClaimAllowed, false);

      const prematureAdvisoryDecision = await syncSparkQaStartupBenchKeepRevertDecision({ repoRoot: repo });
      assert.equal(prematureAdvisoryDecision.ok, true);
      assert.equal(prematureAdvisoryDecision.decision?.status, 'blocked');
      assert.equal(prematureAdvisoryDecision.decision?.decision, 'blocked');
      assert.equal(prematureAdvisoryDecision.decision?.scoreClaimAllowed, false);
      assert.ok(prematureAdvisoryDecision.decision?.blockers.some((blocker) => /fresh_proof_after_mutation_missing|fresh_proof_target_hash_missing/.test(blocker)));

      const advisoryFreshProofWorker = await syncSparkQaStartupBenchEvolutionWorker({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
      });
      assert.equal(advisoryFreshProofWorker.state?.lastTickResult?.mode, 'fresh_proof_required');
      assert.equal(advisoryFreshProofWorker.state?.lastTickResult?.nextCommand, '/sparkqa run');
      assert.match(renderSparkQaStartupBenchEvolutionWorker(advisoryFreshProofWorker), /candidate already applied/);

      const advisoryPostApplyProof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-advisory-post-apply'),
      });
      assert.equal(advisoryPostApplyProof.ok, true);
      assert.equal(advisoryPostApplyProof.report?.schemaVersion, 'spark-startup-bench-proof-adapter.v1');
      const advisoryPostApplyDecision = await syncSparkQaStartupBenchKeepRevertDecision({ repoRoot: repo });
      assert.equal(advisoryPostApplyDecision.ok, true);
      assert.equal(advisoryPostApplyDecision.decision?.proofReport.sha256, createHash('sha256').update(readFileSync(String(advisoryPostApplyProof.reportPath))).digest('hex'));
      assert.equal(advisoryPostApplyDecision.decision?.mutation.checkpointApplied, true);
      assert.equal(advisoryPostApplyDecision.decision?.privateEvolution.cycleClosureAllowed, true);
      assert.equal(advisoryPostApplyDecision.decision?.privateEvolution.decision, 'keep_private');
      assert.equal(advisoryPostApplyDecision.decision?.scoreClaimAllowed, false);
      assert.ok(!advisoryPostApplyDecision.decision?.blockers.some((blocker) => /fresh_proof_after_mutation_missing|fresh_proof_target_hash_missing/.test(blocker)));

      const privateCycleClosureOrchestrator = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
      });
      assert.equal(privateCycleClosureOrchestrator.state?.completedCycles, 1);
      assert.equal(privateCycleClosureOrchestrator.state?.privateCycleClosure?.cycleClosureAllowed, true);
      assert.equal(privateCycleClosureOrchestrator.state?.privateCycleClosure?.countedThisTurn, true);
      assert.equal(privateCycleClosureOrchestrator.state?.privateCycleClosure?.currentCandidateMinusBaseline, 0.03);
      assert.equal(privateCycleClosureOrchestrator.state?.privateCycleClosure?.previousCandidateMinusBaseline, 0.03);
      assert.equal(privateCycleClosureOrchestrator.state?.privateCycleClosure?.deltaVsPreviousCycle, 0);
      assert.equal(privateCycleClosureOrchestrator.state?.privateCycleClosure?.novelMovementObserved, false);
      assert.equal(privateCycleClosureOrchestrator.state?.privateCycleClosure?.privateMovementObserved, false);
      assert.equal(privateCycleClosureOrchestrator.state?.privateCycleClosure?.plateauedVsPreviousCycle, true);
      assert.equal(privateCycleClosureOrchestrator.state?.nextCommand, '/sparkqa improve startup-bench tick');
      assert.match(String(privateCycleClosureOrchestrator.state?.nextReason), /plateaued/);
      assert.equal(privateCycleClosureOrchestrator.state?.cycleLedger?.entryCount, 1);
      assert.equal(privateCycleClosureOrchestrator.state?.cycleLedger?.completedCycles, 1);
      assert.equal(privateCycleClosureOrchestrator.state?.cycleLedger?.movementCycleCount, 0);
      assert.equal(privateCycleClosureOrchestrator.state?.cycleLedger?.plateauCycleCount, 1);
      assert.ok(privateCycleClosureOrchestrator.state?.cycleLedger?.path && existsSync(privateCycleClosureOrchestrator.state.cycleLedger.path));
      const cycleLedger = JSON.parse(readFileSync(String(privateCycleClosureOrchestrator.state?.cycleLedger?.path), 'utf-8'));
      assert.equal(cycleLedger.schemaVersion, 'spark-startup-bench-improvement-cycle-ledger.v1');
      assert.equal(cycleLedger.entries.length, 1);
      assert.equal(cycleLedger.movementCycleCount, 0);
      assert.equal(cycleLedger.plateauCycleCount, 1);
      assert.equal(cycleLedger.entries[0]?.currentProofSha256, privateCycleClosureOrchestrator.state?.currentProofSha256);
      assert.equal(cycleLedger.entries[0]?.privateMovementObserved, false);
      assert.equal(cycleLedger.entries[0]?.plateauedVsPreviousCycle, true);
      assert.equal(cycleLedger.entries[0]?.scoreClaimAllowed, false);
      assert.equal(cycleLedger.entries[0]?.public_ready, false);
      assert.ok(privateCycleClosureOrchestrator.state?.artifactRefs.some((ref) => ref.role === 'improvement_cycle_ledger'));
      assert.equal(privateCycleClosureOrchestrator.state?.scoreClaimAllowed, false);
      assert.equal(privateCycleClosureOrchestrator.state?.improvementClaimAllowed, false);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(privateCycleClosureOrchestrator), /private movement plateaued/);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(privateCycleClosureOrchestrator), /Cycle ledger tracks 1\/100 closures with 1 record/);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(privateCycleClosureOrchestrator), /0 movement-observed, 1 plateau\/non-improvement/);
      const legacyGapReply = renderSparkQaStartupBenchImprovementOrchestrator({
        ...privateCycleClosureOrchestrator,
        state: {
          ...privateCycleClosureOrchestrator.state!,
          requestedCycles: 10,
          cycleLedger: {
            ...privateCycleClosureOrchestrator.state!.cycleLedger!,
            completedCycles: 5,
            entryCount: 4,
          },
        },
      });
      assert.match(legacyGapReply, /Cycle ledger tracks 5\/10 closures with 4 records/);

      const repeatedCycleClosureStatus = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
      });
      assert.equal(repeatedCycleClosureStatus.state?.completedCycles, 1);
      assert.equal(repeatedCycleClosureStatus.state?.privateCycleClosure?.countedThisTurn, false);
      assert.equal(repeatedCycleClosureStatus.state?.cycleLedger?.entryCount, 1);

      const cycleLedgerSwarmExport = await syncSparkQaStartupBenchSparkSwarmExport({
        repoRoot: repo,
        requestedCycles: 100,
        runId: 'cycle-ledger-smoke',
      });
      assert.equal(cycleLedgerSwarmExport.packet?.cycleLedger?.status, 'attached');
      assert.equal(cycleLedgerSwarmExport.packet?.cycleLedger?.completedCycles, 1);
      assert.equal(cycleLedgerSwarmExport.packet?.cycleLedger?.movementCycleCount, 0);
      assert.equal(cycleLedgerSwarmExport.packet?.cycleLedger?.plateauCycleCount, 1);
      assert.equal(cycleLedgerSwarmExport.packet?.cycleLedger?.entryCount, 1);
      assert.equal(cycleLedgerSwarmExport.packet?.cycleLedger?.scoreClaimAllowed, false);
      assert.equal(cycleLedgerSwarmExport.packet?.cycleLedger?.public_ready, false);
      assert.equal(cycleLedgerSwarmExport.packet?.loopStatusPacket?.rounds?.completed, 1);
      assert.equal(cycleLedgerSwarmExport.packet?.loopStatusPacket?.cycleLedger?.completedCycles, 1);
      assert.equal(cycleLedgerSwarmExport.packet?.insightPacket?.benchmark?.cycleLedger?.completedCycles, 1);
      assert.equal(cycleLedgerSwarmExport.packet?.benchmarkRunSummary?.cycleLedger?.completedCycles, 1);
      assert.ok(cycleLedgerSwarmExport.packet?.artifacts.some((ref) => ref.role === 'improvement_cycle_ledger'));
      assert.match(renderSparkQaStartupBenchSparkSwarmExport(cycleLedgerSwarmExport), /Cycle ledger: 1 proof-backed closure record/);
      assert.match(renderSparkQaStartupBenchSparkSwarmExport(cycleLedgerSwarmExport), /0 movement-observed, 1 plateau\/non-improvement/);

      const advisoryRedispatchWorker = await syncSparkQaStartupBenchEvolutionWorker({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
      });
      assert.equal(advisoryRedispatchWorker.state?.lastTickResult?.mode, 'advisory_agents_dispatched');
      assert.equal(advisoryRedispatchWorker.state?.lastTickResult?.nextCommand, '/sparkqa reviewers advisory status');
      assert.match(renderSparkQaStartupBenchEvolutionWorker(advisoryRedispatchWorker), /carried the advisory-agent lane onto this fresh proof/);
      const freshAdvisoryStatus = await readSparkQaStartupBenchAdvisoryAgentStatus({ repoRoot: repo });
      assert.equal(freshAdvisoryStatus.roster?.targetReviewers, 5);
      assert.equal(freshAdvisoryStatus.roster?.returnedReviewers, 0);
      assert.equal(freshAdvisoryStatus.roster?.proofReport.sha256, createHash('sha256').update(readFileSync(String(advisoryPostApplyProof.reportPath))).digest('hex'));
      const freshAdvisoryPlan = await syncSparkQaStartupBenchEvolutionPlan({ repoRoot: repo, requestedCycles: 100 });
      assert.equal(freshAdvisoryPlan.plan?.reviewPolicy.mode, 'agent_advisory');
      assert.equal(freshAdvisoryPlan.plan?.reviewPolicy.agentReviewers.target, 5);
      assert.ok(freshAdvisoryPlan.plan?.blockers.some((blocker) => blocker.includes('agent_advisory_reviewers_not_connected')));
      assert.ok(!freshAdvisoryPlan.plan?.blockers.some((blocker) => blocker.includes('sidecar_review_pending')));
      const waitingAdvisoryOrchestrator = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
      });
      assert.equal(waitingAdvisoryOrchestrator.state?.status, 'waiting_for_advisory');
      assert.equal(waitingAdvisoryOrchestrator.state?.nextCommand, '/sparkqa reviewers advisory run agents 5');
      assert.match(String(waitingAdvisoryOrchestrator.state?.nextReason), /advisory slots are staged/);

      const providerPrompts: string[] = [];
      let observedRunningRunArtifact = false;
      const advisoryProviderRun = await runSparkQaStartupBenchAdvisoryAgents({
        repoRoot: repo,
        limit: 5,
        providerLabel: SPARK_QA_LOCAL_STARTUP_BENCH_ADVISORY_PROVIDER_LABEL,
        provider: async (prompt, context) => {
          providerPrompts.push(prompt);
          if (context.slot === 1) {
            const runningPath = path.join(
              repo,
              '.spark-swarm',
              'startup-bench-gates',
              'reviewer-handoff',
              context.roster.proofReport.sha256.slice(0, 24),
              'advisory-agents',
              'execution_run.json',
            );
            const runningRun = JSON.parse(readFileSync(runningPath, 'utf-8'));
            observedRunningRunArtifact = runningRun.status === 'running' && runningRun.inProgressSlot === 1;
          }
          return localSparkQaStartupBenchAdvisoryProvider(prompt, context);
        },
      });
      assert.equal(advisoryProviderRun.ok, true);
      assert.equal(advisoryProviderRun.run?.schemaVersion, 'spark-startup-bench-advisory-agent-run.v1');
      assert.equal(advisoryProviderRun.run?.status, 'completed');
      assert.equal(advisoryProviderRun.run?.inProgressSlot, null);
      assert.ok(advisoryProviderRun.run?.updatedAt);
      assert.equal(advisoryProviderRun.run?.acceptedSlots.length, 5);
      assert.equal(advisoryProviderRun.run?.failedSlots.length, 0);
      assert.equal(advisoryProviderRun.run?.providerLabel, SPARK_QA_LOCAL_STARTUP_BENCH_ADVISORY_PROVIDER_LABEL);
      assert.equal(advisoryProviderRun.roster?.status, 'ready_for_private_mutation');
      assert.equal(advisoryProviderRun.roster?.returnedReviewers, 5);
      assert.equal(advisoryProviderRun.roster?.agents[0]?.verdict, 'useful');
      assert.equal(advisoryProviderRun.roster?.agents[0]?.persona.label, 'Proof Integrity Auditor');
      assert.ok(advisoryProviderRun.roster?.agents[0]?.failureFamilies?.some((family) => family.includes('persona_proof_integrity_auditor')));
      assert.ok(advisoryProviderRun.roster?.agents[0]?.recommendedMutationTickets?.some((ticket) => ticket.includes('local-advisory')));
      assert.equal(advisoryProviderRun.run?.scoreClaimAllowed, false);
      assert.equal(advisoryProviderRun.run?.public_ready, false);
      assert.equal(existsSync(String(advisoryProviderRun.runPath)), true);
      assert.equal(existsSync(String(advisoryProviderRun.kanbanPath)), true);
      const advisoryProviderRunFile = JSON.parse(readFileSync(String(advisoryProviderRun.runPath), 'utf-8'));
      assert.equal(advisoryProviderRunFile.status, 'completed');
      assert.equal(advisoryProviderRunFile.inProgressSlot, null);
      assert.equal(observedRunningRunArtifact, true);
      assert.equal(providerPrompts.length, 5);
      assert.match(providerPrompts[0], /Proof Integrity Auditor/);
      assert.match(renderSparkQaStartupBenchAdvisoryAgentRun(advisoryProviderRun), /provider bridge/);
      assert.match(renderSparkQaStartupBenchAdvisoryAgentRun(advisoryProviderRun), /No human approval, score claim/);
      const providerReadyPlan = await syncSparkQaStartupBenchEvolutionPlan({ repoRoot: repo, requestedCycles: 100 });
      assert.equal(providerReadyPlan.plan?.reviewPolicy.agentReviewers.connected, 5);
      assert.ok(!providerReadyPlan.plan?.blockers.some((blocker) => blocker.includes('agent_advisory_reviewers_not_connected')));

      const improvementOrchestrator = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'start',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
      });
      assert.equal(improvementOrchestrator.ok, true);
      assert.equal(improvementOrchestrator.state?.schemaVersion, 'spark-startup-bench-improvement-orchestrator.v1');
      assert.equal(improvementOrchestrator.state?.reviewMode, 'fast_lab');
      assert.equal(improvementOrchestrator.state?.runConfig?.applyPolicy, 'auto_hash_gated');
      assert.equal(improvementOrchestrator.state?.runConfig?.autoApplyHashGated, true);
      assert.equal(improvementOrchestrator.state?.requestedCycles, 100);
      assert.equal(improvementOrchestrator.state?.advisoryAgents, 5);
      assert.equal(improvementOrchestrator.state?.scoreClaimAllowed, false);
      assert.equal(improvementOrchestrator.state?.improvementClaimAllowed, false);
      assert.equal(improvementOrchestrator.state?.public_ready, false);
      assert.equal(improvementOrchestrator.state?.network_absorbable, false);
      assert.equal(improvementOrchestrator.state?.mutationRecommendation?.strategy, 'insert_checkpoint_before_sales_pipeline_update');
      assert.equal(improvementOrchestrator.state?.mutationRecommendation?.selectedTicketId, 'startup-operator-tool-script-candidate');
      assert.equal(typeof improvementOrchestrator.state?.mutationRecommendation?.advisoryReturned, 'number');
      assert.equal(typeof improvementOrchestrator.state?.mutationRecommendation?.weakTrackCount, 'number');
      assert.ok(improvementOrchestrator.state?.artifactRefs.some((ref) => ref.role === 'evolution_worker_state'));
      assert.ok(improvementOrchestrator.state?.artifactRefs.some((ref) => ref.role === 'spark_one_export'));
      assert.ok(improvementOrchestrator.state?.artifactRefs.some((ref) => ref.role === 'spark_swarm_export'));
      assert.ok(improvementOrchestrator.state?.artifactRefs.some((ref) => ref.role === 'mutation_recommendation'));
      assert.ok(improvementOrchestrator.state?.artifactRefs.some((ref) => ref.role === 'reasoning_trials_judge'));
      assert.ok(improvementOrchestrator.state?.steps.some((step) => step.id === 'mutation_recommendation'));
      assert.equal(improvementOrchestrator.reasoningTrials?.judgeReport?.trialCount, 3);
      assert.equal(improvementOrchestrator.reasoningEval?.eval?.observedNow.reasoningImprovementObserved, true);
      assert.equal(improvementOrchestrator.swarmExportPacket?.reasoningTrials?.judgeReport?.trialCount, 3);
      assert.equal(improvementOrchestrator.swarmExportPacket?.packet?.reasoning.trialCount, 3);
      assert.equal(improvementOrchestrator.swarmExportPacket?.packet?.loopStatusPacket.reasoning.observedReasoningImprovement, true);
      assert.equal(improvementOrchestrator.swarmExportPacket?.packet?.loopStatusPacket.reasoning.reasoningImprovementClaimAllowed, false);
      assert.equal(improvementOrchestrator.swarmExportPacket?.packet?.loopStatusPacket.reasoning.claimableReasoningImprovementObserved, false);
      assert.ok(improvementOrchestrator.swarmExportPacket?.packet?.artifacts.some((ref) => ref.role === 'reasoning_trials_judge'));
      assert.ok(!improvementOrchestrator.swarmExportPacket?.packet?.blockers.includes('reasoning_improvement_unproven'));
      assert.equal(improvementOrchestrator.swarmExportPacket?.packet?.loopStatusPacket.pathKey, 'startup-operator');
      assert.match(String(improvementOrchestrator.state?.commands.exportSwarm), /^\/sparkqa export swarm-packet improvement-/);
      assert.equal(existsSync(String(improvementOrchestrator.statePath)), true);
      assert.equal(existsSync(String(improvementOrchestrator.kanbanPath)), true);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(improvementOrchestrator), /Startup Bench improvement/);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(improvementOrchestrator), /Full-suite learning map is attached/);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(improvementOrchestrator), /Mutation recommendation is (waiting for advisory|ready): insert checkpoint before sales pipeline update/);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(improvementOrchestrator), /No score|score and improvement claims/i);

      const advisorySidecarPacket = await runSparkQaStartupBenchSidecarReview({ repoRoot: repo });
      assert.equal(advisorySidecarPacket.ok, true);
      assert.equal(advisorySidecarPacket.packet?.reviewerQuorum.remaining, 1);

      const firstSidecar = await runSparkQaStartupBenchSidecarAttestation({
        repoRoot: repo,
        reviewerId: 'telegram:reviewer-a',
      });
      assert.equal(firstSidecar.ok, true);
      assert.equal(firstSidecar.reviewerCount, 1);
      assert.equal(firstSidecar.attestation?.scoreClaimAllowed, false);
      assert.match(renderSparkQaStartupBenchSidecarAttestation(firstSidecar), /sidecar quorum is recorded/);

      const oneReviewerPacket = await runSparkQaStartupBenchSidecarReview({ repoRoot: repo });
      assert.equal(oneReviewerPacket.packet?.reviewerQuorum.recorded, 1);
      assert.equal(oneReviewerPacket.packet?.reviewerQuorum.required, 1);
      assert.equal(oneReviewerPacket.packet?.reviewerQuorum.remaining, 0);

      const quorumPacket = await runSparkQaStartupBenchSidecarReview({ repoRoot: repo });
      assert.equal(quorumPacket.packet?.status, 'quorum_recorded');
      assert.equal(quorumPacket.packet?.reviewerQuorum.recorded, 1);
      assert.match(renderSparkQaStartupBenchSidecarReview(quorumPacket), /sidecar review quorum is recorded/);

      const completedHandoff = await syncSparkQaStartupBenchReviewerHandoff({ repoRoot: repo });
      assert.equal(completedHandoff.handoff?.status, 'quorum_recorded');
      assert.equal(completedHandoff.handoff?.reviewerQuorum.remaining, 0);
      assert.match(renderSparkQaStartupBenchReviewerHandoff(completedHandoff), /reviewer handoff is complete/);

      const postSidecarReadiness = await readSparkQaStartupBenchReadiness({ repoRoot: repo });
      assert.equal(postSidecarReadiness.sidecar.recorded, 1);
      assert.equal(postSidecarReadiness.sidecar.required, 1);
      assert.equal(postSidecarReadiness.nextCommand, '/sparkqa stability queue');
      assert.match(renderSparkQaStartupBenchReadiness(postSidecarReadiness), /sidecar 1\/1/);
      assert.match(renderSparkQaStartupBenchReadiness(postSidecarReadiness), /Next command: \/sparkqa stability queue/);

      const reviewedGates = await runSparkQaStartupBenchProofGates({ repoRoot: repo });
      assert.equal(reviewedGates.ok, true);
      assert.equal(reviewedGates.reviewerIds?.length, 1);
      assert.equal(reviewedGates.payload?.gates?.sidecarReview?.pass, true);
      assert.equal(reviewedGates.payload?.gates?.scoreReconciliation?.pass, false);
      assert.equal(reviewedGates.payload?.scoreClaimAllowed, false);
      assert.equal(reviewedGates.payload?.kanban?.ticketCount, 1);
      assert.match(renderSparkQaStartupBenchProofGates(reviewedGates), /Sidecar reviewer evidence available: 1/);
      assert.match(renderSparkQaStartupBenchProofGates(reviewedGates), /Still blocked: score reconciliation/);
      assert.match(renderSparkQaStartupBenchProofGates(reviewedGates), /\/sparkqa stability/);

      const reviewedReconciliation = await syncSparkQaStartupBenchScoreReconciliation({ repoRoot: repo });
      assert.equal(reviewedReconciliation.workbench?.scoreClaimAllowed, false);
      assert.equal(reviewedReconciliation.workbench?.nextCommand, '/sparkqa stability queue');
      assert.ok(!reviewedReconciliation.workbench?.blockers.includes('sidecar_review_pending'));
      assert.ok(reviewedReconciliation.workbench?.blockers.includes('wall_clock_stability_window_missing'));
      assert.match(renderSparkQaStartupBenchScoreReconciliation(reviewedReconciliation), /Next command: \/sparkqa stability queue/);

      const waitingOrchestratorStatus = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
      });
      assert.equal(waitingOrchestratorStatus.ok, true);
      assert.equal(waitingOrchestratorStatus.state?.stabilityResume?.status, 'waiting');
      assert.equal(waitingOrchestratorStatus.state?.stabilityResume?.ticketRef?.path.endsWith('stability_resume_ticket.json'), true);
      assert.ok(waitingOrchestratorStatus.state?.artifactRefs.some((ref) => ref.role === 'stability_resume_ticket'));
      assert.ok(waitingOrchestratorStatus.state?.steps.some((step) => step.id === 'stability_resume' && step.status === 'waiting'));
      const waitingOrchestratorReply = renderSparkQaStartupBenchImprovementOrchestrator(waitingOrchestratorStatus);
      assert.match(waitingOrchestratorReply, /next: \/sparkqa/);
      assert.match(waitingOrchestratorReply, /Wall-clock stability is queued/);
      assert.match(waitingOrchestratorReply, /no score or improvement claim/i);

      const latestProof = await readLatestSparkQaAutoloopRound(repo);
      const wallClockCleanReport = JSON.parse(JSON.stringify(latestProof.report || {}));
      wallClockCleanReport.generatedAt = new Date().toISOString();
      wallClockCleanReport.wallClockStability = {
        ...(wallClockCleanReport.wallClockStability || {}),
        status: 'passed',
        pass: true,
        blockers: [],
      };
      wallClockCleanReport.promotionDossier = {
        status: 'blocked',
        scoreClaimAllowed: false,
        public_ready: false,
        network_absorbable: false,
        blockers: ['score_reconciliation_missing'],
      };
      wallClockCleanReport.blockers = ['score_reconciliation_missing'];
      writeLatestProof(repo, wallClockCleanReport);
      const cleanWindowReview = await runSparkQaStartupBenchSidecarReview({ repoRoot: repo });
      assert.equal(cleanWindowReview.ok, true);
      assert.equal((await runSparkQaStartupBenchSidecarAttestation({ repoRoot: repo, reviewerId: 'telegram:reviewer-a' })).ok, true);
      assert.equal((await runSparkQaStartupBenchSidecarAttestation({ repoRoot: repo, reviewerId: 'telegram:reviewer-b' })).ok, true);
      const gateCleanDossierBlocked = await syncSparkQaStartupBenchScoreReconciliation({ repoRoot: repo });
      assert.equal(gateCleanDossierBlocked.gates?.payload?.scoreClaimAllowed, true);
      assert.equal(gateCleanDossierBlocked.workbench?.sources.scoreReconciliationReport.scoreClaimAllowed, true);
      assert.equal(gateCleanDossierBlocked.workbench?.scoreClaimAllowed, false);
      assert.ok(gateCleanDossierBlocked.workbench?.blockers.includes('promotion_dossier_score_claim_blocked'));
      assert.ok(gateCleanDossierBlocked.workbench?.blockers.includes('score_claim_requires_promotion_dossier'));
      assert.equal(gateCleanDossierBlocked.workbench?.nextCommand, '/sparkqa run');
      assert.match(renderSparkQaStartupBenchScoreReconciliation(gateCleanDossierBlocked), /score claims stay refused/);
      const gateCleanShowcase = await syncSparkQaStartupBenchShowcase({ repoRoot: repo });
      assert.equal(gateCleanShowcase.packet?.status, 'score_blocked');
      assert.equal(gateCleanShowcase.packet?.snapshot.sidecar.recorded, 1);
      assert.equal(gateCleanShowcase.packet?.snapshot.wallClock.pass, true);
      assert.ok(gateCleanShowcase.packet?.demoCommands.some((item) => item.command === '/sparkqa run'));
      assert.doesNotMatch(renderSparkQaStartupBenchShowcase(gateCleanShowcase), /score-claim ready/);

      const capture = await runSparkQaEvidenceCapturePlan({ repoRoot: repo });
      assert.equal(capture.ok, true);
      assert.equal(capture.payload?.plan?.summary?.scoreClaimAllowed, false);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldStartupBench === undefined) delete process.env.SPARK_STARTUP_BENCH_REPO;
      else process.env.SPARK_STARTUP_BENCH_REPO = oldStartupBench;
      if (oldStartupOperator === undefined) delete process.env.SPARK_STARTUP_OPERATOR_REPO;
      else process.env.SPARK_STARTUP_OPERATOR_REPO = oldStartupOperator;
      if (oldStartupSeeds === undefined) delete process.env.SPARK_STARTUP_BENCH_SEEDS;
      else process.env.SPARK_STARTUP_BENCH_SEEDS = oldStartupSeeds;
      if (oldSidecarRequired === undefined) delete process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
      else process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = oldSidecarRequired;
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('improvement orchestrator bootstraps Startup Bench benchmark and proof on cold start', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupYcRepo = makeFakeStartupYcRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldStartupYc = process.env.SPARK_STARTUP_YC_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_YC_REPO = startupYcRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const coldStatus = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 3,
        benchmarkLevel: 5,
        agentReviewers: 1,
      });
      assert.equal(coldStatus.ok, false);
      assert.equal(coldStatus.bootstrap, undefined);
      assert.equal((await readLatestSparkQaAutoloopRound(repo)).ok, false);

      const started = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'start',
        requestedCycles: 3,
        benchmarkLevel: 5,
        agentReviewers: 1,
      });
      assert.equal(started.bootstrap?.ok, true, started.bootstrap?.error);
      assert.equal(started.bootstrap?.usedExistingBenchmark, false);
      assert.equal(started.bootstrap?.benchmarkLevel, 5);
      assert.equal(started.bootstrap?.benchmarkJob?.level, 5);
      assert.equal(started.bootstrap?.qualityAudit?.audit?.pass, true);
      assert.equal(started.bootstrap?.qualityAudit?.audit?.scoreClaimAllowed, false);
      assert.equal(started.bootstrap?.proof?.report?.schemaVersion, 'spark-startup-bench-proof-adapter.v1');
      assert.equal(started.suiteRun?.ok, true, started.suiteRun?.error);
      assert.equal(started.suiteRun?.run?.status, 'completed');
      assert.equal(started.suiteRun?.run?.benchmarkLevel, 5);
      assert.equal(started.suiteRun?.run?.requestedCycles, 3);
      assert.equal(started.suiteRun?.run?.advisoryAgents, 1);
      assert.equal(started.suiteRun?.run?.commands.evolve, '/sparkqa evolve startup-bench cycles 3');
      assert.equal(started.suiteRun?.run?.commands.advisory, '/sparkqa reviewers advisory dispatch agents 1');
      assert.equal(started.suiteRun?.preflight?.preflight?.requestedCycles, 3);
      assert.equal(started.suiteRun?.preflight?.preflight?.benchmarkLevel, 5);
      assert.equal(started.suiteRun?.preflight?.preflight?.advisoryAgents, 1);
      assert.equal(started.suiteRun?.preflight?.preflight?.evolutionBridge.nextCommand, '/sparkqa evolve startup-bench cycles 3');
      assert.equal(started.suiteRun?.preflight?.preflight?.commands.evolve, '/sparkqa evolve startup-bench cycles 3');
      assert.equal(started.suiteRun?.preflight?.preflight?.commands.advisory, '/sparkqa reviewers advisory dispatch agents 1');
      assert.ok(started.suiteRun?.run?.scenarioCount);
      assert.equal(started.ok, true, started.error);
      assert.equal(started.state?.schemaVersion, 'spark-startup-bench-improvement-orchestrator.v1');
      assert.equal(started.state?.benchmarkLevel, 5);
      assert.equal(started.state?.requestedCycles, 3);
      assert.equal(started.state?.advisoryAgents, 1);
      assert.equal(started.state?.runConfig?.applyPolicy, 'auto_hash_gated');
      assert.notEqual(started.state?.status, 'blocked');
      assert.equal(started.state?.status, 'waiting_for_advisory');
      assert.equal(started.state?.nextCommand, '/sparkqa reviewers advisory run agents 1');
      assert.equal(started.state?.commands.start, '/sparkqa improve startup-bench level 5 cycles 3 agents 1');
      assert.equal(started.state?.commands.runAdvisory, '/sparkqa reviewers advisory run agents 1');
      assert.equal(started.state?.scoreClaimAllowed, false);
      assert.equal(started.state?.improvementClaimAllowed, false);
      assert.equal(started.state?.public_ready, false);
      assert.equal(started.state?.network_absorbable, false);
      assert.equal(started.state?.mutationRecommendation?.status, 'waiting_for_advisory');
      assert.equal(started.state?.mutationRecommendation?.strategy, 'insert_checkpoint_before_sales_pipeline_update');
      assert.equal(started.state?.mutationRecommendation?.advisoryReturned, 0);
      assert.equal(started.state?.mutationRecommendation?.advisoryTarget, 1);
      assert.ok(started.state?.currentProofSha256);
      assert.ok(started.state?.steps.some((step) => step.id === 'startup_bench_bootstrap' && step.status === 'done'));
      assert.ok(started.state?.steps.some((step) => step.id === 'suite_first_run' && step.status === 'done'));
      assert.ok(started.state?.steps.some((step) => step.id === 'mutation_recommendation' && step.status === 'waiting'));
      assert.ok(started.state?.artifactRefs.some((ref) => ref.role === 'bootstrap_benchmark_pack'));
      assert.ok(started.state?.artifactRefs.some((ref) => ref.role === 'bootstrap_benchmark_quality_audit'));
      assert.ok(started.state?.artifactRefs.some((ref) => ref.role === 'bootstrap_proof'));
      assert.ok(started.state?.artifactRefs.some((ref) => ref.role === 'startup_bench_suite_run'));
      assert.ok(started.state?.artifactRefs.some((ref) => ref.role === 'mutation_plan'));
      assert.ok(started.state?.artifactRefs.some((ref) => ref.role === 'mutation_recommendation'));
      assert.ok(!started.state?.artifactRefs.some((ref) => ref.role === 'mutation_candidate'));
      assert.ok(!started.state?.artifactRefs.some((ref) => ref.role === 'mutation_apply'));
      assert.equal(existsSync(String(started.statePath)), true);
      assert.equal(existsSync(String(started.kanbanPath)), true);

      const activeJob = readActiveSparkQaBenchmarkJob(repo);
      assert.equal(activeJob.ok, true);
      assert.equal(activeJob.job?.specializationAdapterKey, 'startup-bench');
      assert.equal(activeJob.job?.level, 5);
      const latestProof = await readLatestSparkQaAutoloopRound(repo);
      assert.equal(latestProof.ok, true);
      assert.equal(latestProof.report?.schemaVersion, 'spark-startup-bench-proof-adapter.v1');
      assert.deepEqual((latestProof.report as any)?.startupBench?.seeds, [1]);
      assert.equal((latestProof.report as any)?.wallClockStability?.minimumElapsedHours, 0);
      assert.equal(started.swarmExportPacket?.packet?.source.benchmarkLevel, 5);
      assert.equal(started.swarmExportPacket?.packet?.loopStatusPacket.rounds.requested, 3);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(started), /created the level 5 Startup Bench benchmark pack and ran the first fresh proof/i);
      assert.match(renderSparkQaStartupBenchImprovementOrchestrator(started), /Mutation recommendation is waiting for advisory: insert checkpoint before sales pipeline update/);
      const privateMovementOrchestratorReply = renderSparkQaStartupBenchImprovementOrchestrator({
        ...started,
        state: {
          ...started.state!,
          privateCycleClosure: {
            proofReportSha256: started.state!.currentProofSha256 || null,
            decision: 'keep_private',
            cycleClosureAllowed: true,
            countedThisTurn: false,
            currentCandidateMinusBaseline: 0.1491,
            previousCandidateMinusBaseline: null,
            deltaVsPreviousCycle: null,
            privateMovementObserved: true,
            plateauedVsPreviousCycle: false,
            sourcePreviousProofSha256: null,
            claimBoundary: 'Private movement only; not a score claim.',
          },
        },
      });
      assert.match(privateMovementOrchestratorReply, /private movement is observed/i);
      assert.match(privateMovementOrchestratorReply, /not a score or improvement claim/i);

      const startupIntelligence = await syncSparkQaStartupIntelligenceLoop({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 3,
        benchmarkLevel: 5,
        agentReviewers: 1,
      });
      assert.equal(startupIntelligence.ok, true, startupIntelligence.error);
      assert.equal(existsSync(String(startupIntelligence.statePath)), true);
      assert.equal(existsSync(String(startupIntelligence.kanbanPath)), true);
      const startupIntelligencePacket = JSON.parse(readFileSync(String(startupIntelligence.statePath), 'utf-8'));
      assert.equal(startupIntelligencePacket.schemaVersion, 'spark-startup-intelligence-loop.v1');
      assert.equal(startupIntelligencePacket.mission, 'startup_intelligence_lab');
      assert.equal(startupIntelligencePacket.startupBenchmark.primaryExam, 'startup-bench');
      assert.equal(startupIntelligencePacket.startupBenchmark.doctrineLane, 'startup-yc');
      assert.equal(startupIntelligencePacket.startupBenchmark.operatorPath, 'startup-operator');
      assert.equal(startupIntelligencePacket.absorptionStandard.protocol, 'no_pack_vs_pack_vs_validated_pack');
      assert.equal(startupIntelligencePacket.absorptionStandard.firstSuiteCaseCount, 20);
      assert.equal(startupIntelligencePacket.absorptionStandard.coreMetric, 'validated_pack_delta_on_fresh_agent_startup_decisions');
      assert.ok(startupIntelligencePacket.absorptionStandard.blockers.includes('fresh_agent_absorption_proof_not_started'));
      assert.match(startupIntelligencePacket.absorptionStandard.nextBuild, /absorption agents cases 20/i);
      assert.equal(startupIntelligencePacket.masteryClaimGate.status, 'blocked');
      assert.equal(startupIntelligencePacket.masteryClaimGate.startupMasteryClaimAllowed, false);
      assert.equal(startupIntelligencePacket.masteryClaimGate.startupBenchProofFresh, true);
      assert.equal(startupIntelligencePacket.masteryClaimGate.startupYcAbsorptionReady, false);
      assert.ok(startupIntelligencePacket.masteryClaimGate.blockers.includes('startup_bench_promotion_dossier_not_score_claim_ready'));
      assert.ok(startupIntelligencePacket.masteryClaimGate.blockers.includes('fresh_agent_startup_yc_absorption_not_ready'));
      assert.ok(startupIntelligencePacket.masteryClaimGate.requiredGates.some((gate: any) => gate.id === 'startup_bench_promotion_dossier'));
      assert.ok(startupIntelligencePacket.masteryClaimGate.requiredGates.some((gate: any) => gate.id === 'startup_yc_fresh_agent_absorption'));
      assert.ok(startupIntelligencePacket.doctrinePacketPlan.allowedMutationSurfaces.includes('startup doctrine packet wording'));
      assert.ok(startupIntelligencePacket.doctrinePacketPlan.forbiddenMutationSurfaces.includes('Startup Bench scoring weights'));
      assert.equal(startupIntelligencePacket.scoreClaimAllowed, false);
      assert.equal(startupIntelligencePacket.improvementClaimAllowed, false);
      assert.equal(startupIntelligencePacket.public_ready, false);
      assert.equal(startupIntelligencePacket.network_absorbable, false);
      assert.match(renderSparkQaStartupIntelligenceLoop(startupIntelligence), /Startup Intelligence lab/);
      assert.match(renderSparkQaStartupIntelligenceLoop(startupIntelligence), /Startup YC absorption standard|validated-pack/i);
      assert.match(renderSparkQaStartupIntelligenceLoop(startupIntelligence), /Absorption standard is defined/i);
      assert.doesNotMatch(renderSparkQaStartupIntelligenceLoop(startupIntelligence), /Absorption proof is staged/i);
      assert.match(renderSparkQaStartupIntelligenceLoop(startupIntelligence), /Startup mastery gate stays locked/i);
      assert.match(renderSparkQaStartupIntelligenceLoop(startupIntelligence), /not a score claim|No score/i);
      const controlPanel = await syncSparkQaStartupIntelligenceControlPanel({
        repoRoot: repo,
        requestedCycles: 3,
        benchmarkLevel: 5,
        agentReviewers: 1,
      });
      assert.equal(controlPanel.ok, true, controlPanel.error);
      assert.equal(controlPanel.state?.mission, 'startup_intelligence_lab');
      assert.equal(controlPanel.orchestratorState?.requestedCycles, 3);
      assert.equal(controlPanel.loop?.scoreClaimAllowed, false);
      assert.equal(controlPanel.packet?.schemaVersion, 'spark-startup-intelligence-control-panel.v1');
      assert.equal(existsSync(String(controlPanel.packetPath)), true);
      assert.equal(existsSync(String(controlPanel.kanbanPath)), true);
      assert.ok(controlPanel.packet?.safeActions.some((action) => action.id === 'next' && action.status === 'recommended'));
      assert.ok(controlPanel.packet?.safeActions.some((action) => action.id === 'managed-loop' && /startup control run/i.test(action.command)));
      assert.ok(controlPanel.packet?.safeActions.some((action) => action.id === 'absorption' && /startup intelligence absorption/i.test(action.command)));
      assert.equal(controlPanel.packet?.scoreClaimAllowed, false);
      assert.equal(controlPanel.packet?.network_absorbable, false);
      const controlPanelReply = renderSparkQaStartupIntelligenceControlPanel(controlPanel);
      assert.match(controlPanelReply, /Startup Intelligence control panel/i);
      assert.match(controlPanelReply, /0\/3 Startup Bench cycles/i);
      assert.match(controlPanelReply, /Mutation\/advisory:/i);
      assert.match(controlPanelReply, /Startup YC absorption:/i);
      assert.match(controlPanelReply, /Mastery gate: locked/i);
      assert.match(controlPanelReply, /Actions: /i);
      assert.match(controlPanelReply, /Next safe step -> \/sparkqa /i);
      assert.match(controlPanelReply, /Run managed loop -> \/sparkqa startup control run/i);
      assert.match(controlPanelReply, /Run absorption proof -> \/sparkqa startup intelligence absorption/i);
      assert.match(controlPanelReply, /No score, improvement, startup-mastery, public, or network claim/i);
      assert.doesNotMatch(controlPanelReply, /scoreClaimAllowed=true|public_ready=true|network_absorbable=true|startup-mastery claim is allowed/i);
      const privateMovementIntelligenceReply = renderSparkQaStartupIntelligenceLoop({
        ...startupIntelligence,
        state: {
          ...startupIntelligence.state!,
          startupBenchmark: {
            ...startupIntelligence.state!.startupBenchmark,
            privateCycleClosure: {
              decision: 'keep_private',
              cycleClosureAllowed: true,
              countedThisTurn: false,
              currentCandidateMinusBaseline: 0.1491,
              previousCandidateMinusBaseline: null,
              deltaVsPreviousCycle: null,
              privateMovementObserved: true,
              plateauedVsPreviousCycle: false,
              claimBoundary: 'Private movement only; not a score claim.',
            },
          },
        },
      });
      assert.match(privateMovementIntelligenceReply, /Private Startup Bench movement is observed/i);
      assert.match(privateMovementIntelligenceReply, /not a score claim/i);

      const absorptionBundle = await syncSparkQaStartupIntelligenceAbsorption({
        repoRoot: repo,
        startupYcRepo,
        startupBenchRepo,
        action: 'bundle',
        caseLimit: 20,
      });
      assert.equal(absorptionBundle.ok, true, absorptionBundle.error);
      assert.equal(absorptionBundle.proof?.schemaVersion, 'spark-startup-intelligence-absorption-proof.v1');
      assert.equal(absorptionBundle.proof?.evidenceTier, 'bundle_export');
      assert.equal(absorptionBundle.proof?.caseLimit, 20);
      assert.equal(absorptionBundle.proof?.scoreClaimAllowed, false);
      assert.equal(absorptionBundle.proof?.network_absorbable, false);
      assert.equal(existsSync(String(absorptionBundle.proofPath)), true);
      assert.match(renderSparkQaStartupIntelligenceAbsorption(absorptionBundle), /absorption bundles are ready/i);
      assert.match(renderSparkQaStartupIntelligenceAbsorption(absorptionBundle), /not a score/i);

      const absorptionSmoke = await syncSparkQaStartupIntelligenceAbsorption({
        repoRoot: repo,
        startupYcRepo,
        startupBenchRepo,
        action: 'smoke',
        caseLimit: 2,
        execute: true,
      });
      assert.equal(absorptionSmoke.ok, true, absorptionSmoke.error);
      assert.equal(absorptionSmoke.proof?.evidenceTier, 'heuristic_agent_smoke');
      assert.equal(absorptionSmoke.proof?.evaluationReport?.summary?.case_count, 2);
      assert.ok(absorptionSmoke.proof?.masteryReadiness.blockers.includes('heuristic smoke evidence is not fresh-agent learning'));
      assert.ok(absorptionSmoke.proof?.masteryReadiness.blockers.includes('full 20-case absorption suite has not been scored'));
      assert.equal(absorptionSmoke.proof?.scoreClaimAllowed, false);
      assert.match(renderSparkQaStartupIntelligenceAbsorption(absorptionSmoke), /proves the pipeline wiring, not fresh model absorption/i);
      assert.match(renderSparkQaStartupIntelligenceAbsorption(absorptionSmoke), /scoreClaimAllowed=false and network_absorbable=false/i);

      const absorptionAgents = await syncSparkQaStartupIntelligenceAbsorption({
        repoRoot: repo,
        startupYcRepo,
        startupBenchRepo,
        action: 'agents',
        caseLimit: 2,
        agentReviewers: 2,
        execute: true,
        providerLabel: 'test-spark-chat-llm',
        provider: async (_prompt, context) => JSON.stringify({
          tool_calls: [
            {
              tool_name: 'metrics.report',
              request_id: `${context.bundleId}_agent_${context.agentSlot}_metrics`,
              arguments: {},
            },
            {
              tool_name: 'sim.advance',
              request_id: `${context.bundleId}_agent_${context.agentSlot}_advance`,
              arguments: { amount: 1, unit: 'week' },
            },
          ],
        }),
      });
      assert.equal(absorptionAgents.ok, true, absorptionAgents.error);
      assert.equal(absorptionAgents.proof?.action, 'agents');
      assert.equal(absorptionAgents.proof?.evidenceTier, 'fresh_agent_absorption_candidate');
      assert.equal(absorptionAgents.proof?.agentSubmissions?.providerLabel, 'test-spark-chat-llm');
      assert.equal(absorptionAgents.proof?.agentSubmissions?.status, 'ready');
      assert.equal(absorptionAgents.proof?.agentSubmissions?.agentReviewers, 2);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.processedBundles, 6);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.acceptedBundles, 6);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.requestedBundles, 6);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.processedAgentRuns, 12);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.acceptedAgentRuns, 12);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.requestedAgentRuns, 12);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.agentSubmissionPaths.length, 12);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.agentQuorum.requestedPerBundle, 2);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.currentBundle, null);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.runId, absorptionAgents.proof?.runId);
      assert.equal(absorptionAgents.proof?.agentSubmissions?.failedBundles.length, 0);
      assert.equal(absorptionAgents.proof?.evaluationReport?.summary?.case_count, 2);
      assert.equal(absorptionAgents.proof?.scoreClaimAllowed, false);
      assert.equal(absorptionAgents.proof?.network_absorbable, false);
      assert.ok(!absorptionAgents.proof?.masteryReadiness.blockers.includes('heuristic smoke evidence is not fresh-agent learning'));
      assert.ok(absorptionAgents.proof?.masteryReadiness.blockers.includes('full 20-case absorption suite has not been scored'));
      assert.match(renderSparkQaStartupIntelligenceAbsorption(absorptionAgents), /Fresh-agent Startup YC absorption submissions were collected/i);
      assert.match(renderSparkQaStartupIntelligenceAbsorption(absorptionAgents), /12\/12 fresh-agent passes/i);
      assert.match(renderSparkQaStartupIntelligenceAbsorption(absorptionAgents), /candidate absorption evidence only/i);
      assert.doesNotMatch(renderSparkQaStartupIntelligenceAbsorption(absorptionAgents), /scoreClaimAllowed=true|network_absorbable=true/i);

      const bridge = await syncSparkQaStartupIntelligenceSwarmBridge({
        repoRoot: repo,
        runId: 'test-startup-intelligence-bridge',
        requestedCycles: 3,
      });
      assert.equal(bridge.ok, true, bridge.error);
      assert.equal(bridge.packet?.schemaVersion, 'spark-startup-intelligence-swarm-bridge.v1');
      assert.equal(bridge.packet?.source.specializationPath, 'startup-intelligence');
      assert.deepEqual(bridge.packet?.source.composedOf, ['startup-bench', 'startup-yc', 'startup-operator']);
      assert.equal(bridge.packet?.domainChipLabs.system, 'Spark Domain Chip Labs');
      assert.equal(bridge.packet?.creatorRun.layout, 'spark_domain_chip_labs_private_bridge');
      assert.equal(bridge.packet?.absorption.evidenceTier, 'fresh_agent_absorption_candidate');
      assert.equal(bridge.packet?.startupBench.status, 'waiting_on_proof_closure');
      assert.equal(bridge.packet?.publication.public_ready, false);
      assert.equal(bridge.packet?.publication.network_absorbable, false);
      assert.equal(bridge.packet?.scoreClaimAllowed, false);
      assert.equal(bridge.packet?.improvementClaimAllowed, false);
      assert.equal(bridge.packet?.network_absorbable, false);
      assert.equal(bridge.packet?.masteryClaimGate?.startupMasteryClaimAllowed, false);
      assert.equal(bridge.packet?.masteryClaimGate?.startupYcAbsorptionProofFresh, true);
      assert.equal(bridge.packet?.masteryClaimGate?.startupYcAbsorptionReady, true);
      assert.equal(bridge.packet?.masteryClaimGate?.startupYcFullSuiteReady, false);
      assert.ok(bridge.packet?.masteryClaimGate?.blockers.includes('full_20_case_absorption_required_before_mastery'));
      assert.equal((bridge.packet?.absorption as any)?.freshness?.fresh, true);
      assert.equal((bridge.packet?.loopStatusPacket as any)?.absorption?.freshness?.fresh, true);
      assert.equal((bridge.packet?.loopStatusPacket as any)?.masteryClaimGate?.startupMasteryClaimAllowed, false);
      assert.equal((bridge.packet?.contributionPacket as any)?.masteryClaimGate?.startupMasteryClaimAllowed, false);
      assert.ok(bridge.packet?.blockers.includes('full_20_case_absorption_required_before_mastery'));
      assert.ok(bridge.packet?.artifacts.some((ref) => ref.role === 'creator_intent'));
      assert.ok(bridge.packet?.artifacts.some((ref) => ref.role === 'adapter_map'));
      assert.ok(bridge.packet?.artifacts.some((ref) => ref.role === 'autoloop_policy'));
      assert.ok(bridge.packet?.artifacts.some((ref) => ref.role === 'spark_swarm_contribution_packet'));
      assert.equal(existsSync(String(bridge.packetPath)), true);
      assert.equal(existsSync(String(bridge.latestPacketPath)), true);
      assert.equal(existsSync(String(bridge.kanbanPath)), true);
      assert.equal(existsSync(String(bridge.packet?.creatorRun.creatorIntentPath)), true);
      assert.equal(existsSync(String(bridge.packet?.creatorRun.adapterMapPath)), true);
      assert.equal(existsSync(String(bridge.packet?.creatorRun.autoloopPolicyPath)), true);
      assert.equal(existsSync(String(bridge.packet?.creatorRun.contributionPacketPath)), true);
      assert.match(renderSparkQaStartupIntelligenceSwarmBridge(bridge), /Startup Intelligence bridge packet is staged locally/i);
      assert.match(renderSparkQaStartupIntelligenceSwarmBridge(bridge), /Labs-shaped creator intent, adapter map, autoloop policy/i);
      assert.match(renderSparkQaStartupIntelligenceSwarmBridge(bridge), /public_ready=false and network_absorbable=false/i);
      assert.doesNotMatch(renderSparkQaStartupIntelligenceSwarmBridge(bridge), /scoreClaimAllowed=true|network_absorbable=true|startup-mastery claim is allowed/i);

      const latestAbsorptionProofPath = path.join(repo, '.spark-swarm', 'startup-intelligence', 'absorption', 'latest_absorption_proof.json');
      const staleAbsorptionProof = JSON.parse(readFileSync(latestAbsorptionProofPath, 'utf-8'));
      staleAbsorptionProof.generatedAt = '2020-01-01T00:00:00.000Z';
      writeFileSync(latestAbsorptionProofPath, JSON.stringify(staleAbsorptionProof, null, 2), 'utf-8');
      const staleStartupIntelligence = await syncSparkQaStartupIntelligenceLoop({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 3,
        benchmarkLevel: 5,
        agentReviewers: 1,
      });
      assert.equal(staleStartupIntelligence.state?.absorptionStandard.freshness.fresh, false);
      assert.ok(staleStartupIntelligence.state?.absorptionStandard.blockers.includes('startup_yc_absorption_proof_stale'));
      assert.equal(staleStartupIntelligence.state?.masteryClaimGate.startupYcAbsorptionProofFresh, false);
      assert.equal(staleStartupIntelligence.state?.masteryClaimGate.startupYcAbsorptionReady, false);
      assert.ok(staleStartupIntelligence.state?.masteryClaimGate.blockers.includes('startup_yc_absorption_proof_stale'));
      assert.match(renderSparkQaStartupIntelligenceLoop(staleStartupIntelligence), /not fresh enough for claims/i);

      const staleBridge = await syncSparkQaStartupIntelligenceSwarmBridge({
        repoRoot: repo,
        runId: 'test-stale-startup-intelligence-bridge',
        requestedCycles: 3,
      });
      assert.equal(staleBridge.packet?.masteryClaimGate?.startupYcAbsorptionProofFresh, false);
      assert.equal(staleBridge.packet?.masteryClaimGate?.startupYcAbsorptionReady, false);
      assert.equal((staleBridge.packet?.absorption as any)?.freshness?.fresh, false);
      assert.equal((staleBridge.packet?.loopStatusPacket as any)?.absorption?.freshness?.fresh, false);
      assert.ok(staleBridge.packet?.blockers.includes('startup_yc_absorption_proof_stale'));
      assert.match(renderSparkQaStartupIntelligenceSwarmBridge(staleBridge), /stale or timestamp-blocked/i);
      assert.doesNotMatch(renderSparkQaStartupIntelligenceSwarmBridge(staleBridge), /scoreClaimAllowed=true|network_absorbable=true|startup-mastery claim is allowed/i);

      const reused = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 3,
        benchmarkLevel: 5,
        agentReviewers: 1,
      });
      assert.equal(reused.bootstrap, undefined);
      assert.equal(reused.state?.scoreClaimAllowed, false);

      const changedBudget = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'start',
        requestedCycles: 4,
        benchmarkLevel: 5,
        agentReviewers: 1,
      });
      assert.equal(changedBudget.bootstrap, undefined);
      assert.equal(changedBudget.suiteRun?.ok, true, changedBudget.suiteRun?.error);
      assert.equal(changedBudget.suiteRun?.run?.benchmarkLevel, 5);
      assert.equal(changedBudget.suiteRun?.run?.requestedCycles, 4);
      assert.equal(changedBudget.suiteRun?.run?.advisoryAgents, 1);
      assert.equal(changedBudget.suiteRun?.run?.commands.evolve, '/sparkqa evolve startup-bench cycles 4');
      assert.notEqual(changedBudget.suiteRun?.runPath, started.suiteRun?.runPath);

      const changedLevel = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'start',
        requestedCycles: 6,
        benchmarkLevel: 10,
        agentReviewers: 2,
      });
      assert.equal(changedLevel.bootstrap?.ok, true, changedLevel.bootstrap?.error);
      assert.equal(changedLevel.bootstrap?.benchmarkLevel, 10);
      assert.equal(changedLevel.bootstrap?.benchmarkJob?.level, 10);
      assert.equal(changedLevel.state?.benchmarkLevel, 10);
      assert.equal(changedLevel.state?.requestedCycles, 6);
      assert.equal(changedLevel.state?.advisoryAgents, 2);
      assert.equal(changedLevel.suiteRun?.run?.benchmarkLevel, 10);
      assert.equal(changedLevel.suiteRun?.run?.requestedCycles, 6);
      assert.equal(changedLevel.suiteRun?.run?.advisoryAgents, 2);
      assert.equal(changedLevel.suiteRun?.run?.commands.evolve, '/sparkqa evolve startup-bench cycles 6');
      assert.equal(changedLevel.suiteRun?.run?.commands.advisory, '/sparkqa reviewers advisory dispatch agents 2');
      const activeLevel10Job = readActiveSparkQaBenchmarkJob(repo);
      assert.equal(activeLevel10Job.job?.level, 10);
      const latestLevel10Proof = await readLatestSparkQaAutoloopRound(repo);
      assert.equal(latestLevel10Proof.ok, true);
      assert.notEqual(latestLevel10Proof.reportPath, latestProof.reportPath);
      assert.deepEqual((latestLevel10Proof.report as any)?.startupBench?.seeds, [1, 2, 3]);
      assert.equal((latestLevel10Proof.report as any)?.wallClockStability?.minimumElapsedHours, 24);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
      rmSync(startupYcRepo, { recursive: true, force: true });
    }
  });

  await test('improvement orchestrator lets mutation proposer shape background tick candidates', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const started = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'start',
        requestedCycles: 2,
        benchmarkLevel: 5,
        agentReviewers: 1,
      });
      assert.equal(started.ok, true, started.error);
      assert.equal(started.state?.status, 'waiting_for_advisory');

      const advisoryRun = await runSparkQaStartupBenchAdvisoryAgents({
        repoRoot: repo,
        limit: 1,
        provider: localSparkQaStartupBenchAdvisoryProvider,
        providerLabel: SPARK_QA_LOCAL_STARTUP_BENCH_ADVISORY_PROVIDER_LABEL,
      });
      assert.equal(advisoryRun.ok, true, advisoryRun.error);
      assert.equal(advisoryRun.roster?.status, 'ready_for_private_mutation');

      let mutationPrompt = '';
      const tick = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 2,
        benchmarkLevel: 5,
        agentReviewers: 1,
        applyPolicy: 'review_required',
        mutationProposerLabel: 'test-startup-mutation-llm',
        mutationProposer: async (prompt) => {
          mutationPrompt = prompt;
          return JSON.stringify({
            hypothesis: 'Use an LLM-proposed runway checkpoint before sales-pressure execution.',
            targetBehavior: 'Before the sales pipeline update, re-check runway, constraint evidence, and anti-gaming risk.',
            mutationStrategy: 'insert_checkpoint_before_sales_pipeline_update',
            insertBeforeToolName: 'sales.pipeline.update',
            toolName: 'metrics.report',
            focus: ['llm_mutation_proposer_path', 'runway_after_candidate_action'],
            expectedBenchmarkEffect: 'Better private Startup Bench traces without scoring or heldout edits.',
            risks: ['The proposal must still be compiled and kept only by fresh proof.'],
            keepCriteria: ['Fresh proof improves private movement without new blockers.'],
            revertCriteria: ['Fresh proof regresses or adds reconciliation blockers.'],
          });
        },
      });
      assert.equal(tick.ok, true, tick.error);
      assert.equal(tick.state?.runConfig?.mutationProposerLabel, 'test-startup-mutation-llm');
      assert.equal(tick.worker?.state?.lastTickResult?.mode, 'advisory_private_candidate_prepared');
      assert.match(tick.worker?.state?.lastTickResult?.summary || '', /test-startup-mutation-llm/);
      assert.match(mutationPrompt, /You are proposing one private Startup Bench mutation/);
      assert.match(mutationPrompt, /Configured advisory persona board/);
      assert.equal(tick.state?.scoreClaimAllowed, false);
      assert.equal(tick.state?.public_ready, false);
      const proposalRef = tick.worker?.state?.lastTickResult?.artifactRefs.find((ref) => ref.role === 'mutation_proposal');
      assert.ok(proposalRef?.path);
      const proposal = JSON.parse(readFileSync(String(proposalRef.path), 'utf-8'));
      assert.equal(proposal.proposer.kind, 'llm');
      assert.equal(proposal.proposer.label, 'test-startup-mutation-llm');
      assert.equal(proposal.scoreClaimAllowed, false);
      assert.equal(proposal.public_ready, false);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('evolution worker refuses advisory carry-forward on blocked Startup Bench runner proof', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-ready-before-block'),
      });
      assert.equal(proof.ok, true);
      assert.equal(proof.report?.runnerProofReady, true);
      const dispatch = await syncSparkQaStartupBenchAdvisoryAgentDispatch({
        repoRoot: repo,
        agentReviewers: 5,
      });
      assert.equal(dispatch.ok, true);

      const blockedStartupProof = JSON.parse(JSON.stringify(proof.report || {}));
      blockedStartupProof.generatedAt = new Date().toISOString();
      blockedStartupProof.status = 'blocked';
      blockedStartupProof.runnerProofReady = false;
      blockedStartupProof.scoreClaimAllowed = false;
      blockedStartupProof.improvementClaimAllowed = false;
      blockedStartupProof.blockers = [
        'baseline_candidate_horizon_mismatch',
        'baseline_candidate_delta_not_complete',
        'sidecar_review_pending',
      ];
      blockedStartupProof.horizonParity = {
        schemaVersion: 'spark-startup-bench-horizon-parity.v1',
        status: 'blocked',
        pass: false,
        blockers: ['horizon_parity_mismatch:finalCurrentTurn'],
      };
      blockedStartupProof.promotionDossier = {
        status: 'blocked',
        scoreClaimAllowed: false,
        public_ready: false,
        network_absorbable: false,
        blockers: blockedStartupProof.blockers,
      };
      writeLatestProof(repo, blockedStartupProof);
      const latestManifest = JSON.parse(readFileSync(path.join(repo, '.spark-swarm', 'autoloop', 'latest_run.json'), 'utf-8'));
      const blockedProofSha = createHash('sha256').update(readFileSync(String(latestManifest.reportPath))).digest('hex');
      const blockedRosterPath = path.join(
        repo,
        '.spark-swarm',
        'startup-bench-gates',
        'reviewer-handoff',
        blockedProofSha.slice(0, 24),
        'advisory-agents',
        'roster.json',
      );
      assert.equal(existsSync(blockedRosterPath), false);

      const blockedWorker = await syncSparkQaStartupBenchEvolutionWorker({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
      });
      assert.equal(blockedWorker.ok, true);
      assert.equal(blockedWorker.state?.lastTickResult?.mode, 'blocked');
      assert.equal(blockedWorker.state?.lastTickResult?.nextCommand, '/sparkqa run');
      assert.equal(blockedWorker.state?.nextCommand, '/sparkqa run');
      assert.equal(blockedWorker.state?.lastTickResult?.scoreClaimAllowed, false);
      assert.equal(blockedWorker.state?.scoreClaimAllowed, false);
      assert.match(String(blockedWorker.state?.lastTickResult?.summary), /baseline\/candidate horizon mismatch/);
      assert.equal(existsSync(blockedRosterPath), false);
      const reply = renderSparkQaStartupBenchEvolutionWorker(blockedWorker);
      assert.match(reply, /advisory mutation prep is blocked/);
      assert.match(reply, /baseline\/candidate horizon mismatch/);
      assert.match(reply, /Next: \/sparkqa run/);
      assert.doesNotMatch(reply, /carried the advisory-agent lane|prepared the advisory-guided private candidate/);
      assert.match(reply, /No score or improvement claim/);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('mutation candidate can repair Startup Bench horizon parity with bounded sim advances', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-horizon-repair-base'),
      });
      assert.equal(proof.ok, true);

      const checkpointCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(checkpointCandidate.ok, true);
      assert.equal(checkpointCandidate.candidate?.status, 'candidate_ready');
      assert.equal(checkpointCandidate.candidate?.candidate.insertedToolName, 'metrics.report');
      const checkpointApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(checkpointApply.ok, true);
      assert.equal(checkpointApply.apply?.mutationApplied, true);
      const scriptAfterCheckpoint = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      assert.equal(scriptAfterCheckpoint.filter((item: any) => item.tool_name === 'sim.advance').length, 0);

      const blockedHorizonProof = JSON.parse(JSON.stringify(proof.report || {}));
      blockedHorizonProof.generatedAt = new Date().toISOString();
      blockedHorizonProof.status = 'blocked';
      blockedHorizonProof.runnerProofReady = false;
      blockedHorizonProof.scoreClaimAllowed = false;
      blockedHorizonProof.improvementClaimAllowed = false;
      blockedHorizonProof.blockers = ['baseline_candidate_horizon_mismatch'];
      blockedHorizonProof.horizonParity = {
        schemaVersion: 'spark-startup-bench-horizon-parity.v1',
        status: 'blocked',
        pass: false,
        blockers: ['horizon_parity_mismatch:finalCurrentTurn'],
        rows: [{
          seed: 1,
          pass: false,
          blockers: ['horizon_parity_mismatch:finalCurrentTurn'],
          baseline: {
            finalCurrentTurn: 2,
            simAdvanceCount: 2,
          },
          candidate: {
            finalCurrentTurn: 0,
            simAdvanceCount: 0,
          },
        }],
      };
      blockedHorizonProof.privateScoreSummary = {
        runs: [{
          seed: 1,
          horizonParity: blockedHorizonProof.horizonParity.rows[0],
        }],
      };
      blockedHorizonProof.promotionDossier = {
        status: 'blocked',
        scoreClaimAllowed: false,
        public_ready: false,
        network_absorbable: false,
        blockers: blockedHorizonProof.blockers,
      };
      writeLatestProof(repo, blockedHorizonProof);

      const horizonCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(horizonCandidate.ok, true);
      assert.equal(horizonCandidate.candidate?.status, 'candidate_ready');
      assert.equal(horizonCandidate.candidate?.candidate.insertedToolName, 'sim.advance');
      assert.equal(horizonCandidate.candidate?.patch.forward.length, 2);
      assert.equal(horizonCandidate.candidate?.patch.reverse.length, 2);
      assert.equal(horizonCandidate.candidate?.patch.forward.every((op) => (op.value as any)?.tool_name === 'sim.advance'), true);
      assert.match(String(horizonCandidate.candidate?.candidate.summary), /same runner horizon/);

      const horizonApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(horizonApply.ok, true);
      assert.equal(horizonApply.apply?.status, 'applied');
      assert.equal(horizonApply.apply?.mutationApplied, true);
      const scriptAfterHorizonRepair = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      assert.equal(scriptAfterHorizonRepair.filter((item: any) => item.tool_name === 'sim.advance').length, 2);
      assert.deepEqual(scriptAfterHorizonRepair.slice(-2).map((item: any) => item.tool_name), ['sim.advance', 'sim.advance']);
      assert.equal(horizonApply.apply?.scoreClaimAllowed, false);
      assert.equal(horizonApply.apply?.improvementClaimAllowed, false);
      assert.equal(horizonApply.apply?.public_ready, false);
      assert.equal(horizonApply.apply?.network_absorbable, false);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('mutation candidate switches plateaued Startup Bench refinement to board discipline after scalar budget exhaustion', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-plateau-tactic-base'),
      });
      assert.equal(proof.ok, true);

      const checkpointCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(checkpointCandidate.ok, true);
      assert.equal(checkpointCandidate.candidate?.status, 'candidate_ready');
      assert.equal(checkpointCandidate.candidate?.candidate.insertedToolName, 'metrics.report');
      const checkpointApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(checkpointApply.ok, true);
      assert.equal(checkpointApply.apply?.mutationApplied, true);

      const checkpointedScript = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      const salesIndex = checkpointedScript.findIndex((item: any) => item.tool_name === 'sales.pipeline.update');
      assert.ok(salesIndex >= 0);
      checkpointedScript[salesIndex] = {
        ...checkpointedScript[salesIndex],
        arguments: {
          ...(checkpointedScript[salesIndex].arguments || {}),
          weighted_pipeline_usd_delta: 50000,
          closed_won_revenue_delta_usd: 24000,
        },
      };
      checkpointedScript.splice(salesIndex + 1, 0, {
        tool_name: 'board.update',
        request_id: 'startup_operator_req_board_plateau',
        arguments: {
          topic: 'growth pressure review',
          decision: 'hold until customer and runway evidence is refreshed',
        },
      });
      writeFileSync(startupToolScriptPath, `${JSON.stringify(checkpointedScript, null, 2)}\n`, 'utf-8');
      const toolScriptSha = createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex');

      const plateauProof = JSON.parse(JSON.stringify(proof.report || {}));
      plateauProof.generatedAt = new Date().toISOString();
      plateauProof.startupBench = {
        ...(plateauProof.startupBench || {}),
        runSignature: {
          ...((plateauProof.startupBench || {}).runSignature || {}),
          payload: {
            ...(((plateauProof.startupBench || {}).runSignature || {}).payload || {}),
            toolCallsPath: startupToolScriptPath,
            toolCallsSha256: toolScriptSha,
          },
        },
      };
      plateauProof.startupOperator = {
        ...(plateauProof.startupOperator || {}),
        toolCallsPath: startupToolScriptPath,
        toolCallsSha256: toolScriptSha,
      };
      writeLatestProof(repo, plateauProof);

      const plateauCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(plateauCandidate.ok, true);
      assert.equal(plateauCandidate.candidate?.status, 'candidate_ready');
      assert.equal(plateauCandidate.candidate?.candidate.insertedToolName, 'board.update');
      assert.equal(plateauCandidate.candidate?.patch.forward.length, 1);
      assert.equal(plateauCandidate.candidate?.patch.reverse.length, 1);
      assert.equal(plateauCandidate.candidate?.patch.forward[0]?.op, 'replace');
      const forwardBoard = plateauCandidate.candidate?.patch.forward[0]?.value as any;
      assert.equal(forwardBoard?.tool_name, 'board.update');
      assert.equal(forwardBoard?.arguments?.source, 'sparkqa_plateau_tactic_switch');
      assert.equal(forwardBoard?.arguments?.plateau_response, true);
      assert.match(String(forwardBoard?.arguments?.anti_gaming_note), /without inflating growth metrics/);
      assert.equal(plateauCandidate.candidate?.patch.forward.some((op) => (op.value as any)?.tool_name === 'sales.pipeline.update'), false);
      assert.equal(plateauCandidate.candidate?.scoreClaimAllowed, false);
      assert.equal(plateauCandidate.candidate?.improvementClaimAllowed, false);
      assert.equal(plateauCandidate.candidate?.public_ready, false);
      assert.equal(plateauCandidate.candidate?.network_absorbable, false);
      assert.match(renderSparkQaStartupBenchMutationCandidate(plateauCandidate), /board\.update candidate change/);

      const plateauApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(plateauApply.ok, true);
      assert.equal(plateauApply.apply?.status, 'applied');
      assert.equal(plateauApply.apply?.mutationApplied, true);
      assert.equal(plateauApply.apply?.scoreClaimAllowed, false);
      assert.equal(plateauApply.apply?.improvementClaimAllowed, false);
      const scriptAfterPlateau = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      const appliedSales = scriptAfterPlateau.find((item: any) => item.tool_name === 'sales.pipeline.update');
      const appliedBoard = scriptAfterPlateau.find((item: any) => item.tool_name === 'board.update');
      assert.equal(appliedSales?.arguments?.weighted_pipeline_usd_delta, 50000);
      assert.equal(appliedSales?.arguments?.closed_won_revenue_delta_usd, 24000);
      assert.equal(appliedBoard?.arguments?.source, 'sparkqa_plateau_tactic_switch');
      assert.equal(appliedBoard?.arguments?.plateau_response, true);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('mutation candidate rotates repeated Startup Bench plateau from board to finance runway discipline', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-plateau-finance-base'),
      });
      assert.equal(proof.ok, true);

      const checkpointCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(checkpointCandidate.ok, true);
      const checkpointApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(checkpointApply.ok, true);
      assert.equal(checkpointApply.apply?.mutationApplied, true);

      const checkpointedScript = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      const salesIndex = checkpointedScript.findIndex((item: any) => item.tool_name === 'sales.pipeline.update');
      assert.ok(salesIndex >= 0);
      checkpointedScript[salesIndex] = {
        ...checkpointedScript[salesIndex],
        arguments: {
          ...(checkpointedScript[salesIndex].arguments || {}),
          weighted_pipeline_usd_delta: 50000,
          closed_won_revenue_delta_usd: 24000,
        },
      };
      checkpointedScript.splice(salesIndex + 1, 0, {
        tool_name: 'board.update',
        request_id: 'startup_operator_req_board_plateau',
        arguments: {
          topic: 'growth pressure review',
          decision: 'hold until customer and runway evidence is refreshed',
          source: 'sparkqa_plateau_tactic_switch',
          iteration: 'plateau_tactic_previous',
          plateau_response: true,
          focus: ['board_decision_discipline_after_plateau'],
          guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
          anti_gaming_note: 'Scalar pipeline deltas are exhausted; board update must improve decision discipline without inflating growth metrics.',
        },
      });
      writeFileSync(startupToolScriptPath, `${JSON.stringify(checkpointedScript, null, 2)}\n`, 'utf-8');
      const toolScriptSha = createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex');

      const plateauProof = JSON.parse(JSON.stringify(proof.report || {}));
      plateauProof.generatedAt = new Date().toISOString();
      plateauProof.startupBench = {
        ...(plateauProof.startupBench || {}),
        runSignature: {
          ...((plateauProof.startupBench || {}).runSignature || {}),
          payload: {
            ...(((plateauProof.startupBench || {}).runSignature || {}).payload || {}),
            toolCallsPath: startupToolScriptPath,
            toolCallsSha256: toolScriptSha,
          },
        },
      };
      plateauProof.startupOperator = {
        ...(plateauProof.startupOperator || {}),
        toolCallsPath: startupToolScriptPath,
        toolCallsSha256: toolScriptSha,
      };
      writeLatestProof(repo, plateauProof);

      const financeCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(financeCandidate.ok, true);
      assert.equal(financeCandidate.candidate?.status, 'candidate_ready');
      assert.equal(financeCandidate.candidate?.candidate.insertedToolName, 'finance.plan.write');
      assert.equal(financeCandidate.candidate?.patch.forward.length, 1);
      assert.equal(financeCandidate.candidate?.patch.reverse.length, 1);
      assert.equal(financeCandidate.candidate?.patch.forward[0]?.op, 'replace');
      const forwardFinance = financeCandidate.candidate?.patch.forward[0]?.value as any;
      assert.equal(forwardFinance?.tool_name, 'finance.plan.write');
      assert.equal(forwardFinance?.arguments?.source, 'sparkqa_plateau_finance_runway');
      assert.equal(forwardFinance?.arguments?.plateau_response, true);
      assert.match(String(forwardFinance?.arguments?.anti_gaming_note), /without inflating growth metrics/);
      assert.equal(financeCandidate.candidate?.patch.forward.some((op) => (op.value as any)?.tool_name === 'board.update'), false);
      assert.equal(financeCandidate.candidate?.patch.forward.some((op) => (op.value as any)?.tool_name === 'sales.pipeline.update'), false);
      assert.match(String(financeCandidate.candidate?.candidate.summary), /finance\/runway discipline/);
      assert.equal(financeCandidate.candidate?.scoreClaimAllowed, false);
      assert.equal(financeCandidate.candidate?.improvementClaimAllowed, false);
      assert.equal(financeCandidate.candidate?.public_ready, false);
      assert.equal(financeCandidate.candidate?.network_absorbable, false);

      const financeApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(financeApply.ok, true);
      assert.equal(financeApply.apply?.status, 'applied');
      assert.equal(financeApply.apply?.mutationApplied, true);
      const scriptAfterFinance = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      const appliedSales = scriptAfterFinance.find((item: any) => item.tool_name === 'sales.pipeline.update');
      const appliedBoard = scriptAfterFinance.find((item: any) => item.tool_name === 'board.update');
      const appliedFinance = scriptAfterFinance.find((item: any) => item.tool_name === 'finance.plan.write');
      assert.equal(appliedSales?.arguments?.weighted_pipeline_usd_delta, 50000);
      assert.equal(appliedSales?.arguments?.closed_won_revenue_delta_usd, 24000);
      assert.equal(appliedBoard?.arguments?.source, 'sparkqa_plateau_tactic_switch');
      assert.equal(appliedFinance?.arguments?.source, 'sparkqa_plateau_finance_runway');
      assert.equal(appliedFinance?.arguments?.plateau_response, true);
      assert.equal(financeApply.apply?.scoreClaimAllowed, false);
      assert.equal(financeApply.apply?.improvementClaimAllowed, false);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('mutation candidate escalates exhausted Startup Bench plateau lanes to a structural checkpoint', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-plateau-escape-base'),
      });
      assert.equal(proof.ok, true);

      const checkpointCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(checkpointCandidate.ok, true);
      const checkpointApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(checkpointApply.ok, true);
      assert.equal(checkpointApply.apply?.mutationApplied, true);

      const exhaustedScript = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      const salesIndex = exhaustedScript.findIndex((item: any) => item.tool_name === 'sales.pipeline.update');
      const financeIndex = exhaustedScript.findIndex((item: any) => item.tool_name === 'finance.plan.write');
      assert.ok(salesIndex >= 0);
      assert.ok(financeIndex >= 0);
      exhaustedScript[financeIndex] = {
        ...exhaustedScript[financeIndex],
        arguments: {
          ...(exhaustedScript[financeIndex].arguments || {}),
          budget_changes: { monthly_burn_usd: -30000 },
          source: 'sparkqa_plateau_finance_runway_deepening',
          iteration: 'plateau_finance_deepening_previous',
          plateau_response: true,
          deepened_response: true,
          guardrail: 'private_candidate_no_score_or_publication_claim_runway_deepening',
          anti_gaming_note: 'Prior growth-precondition mutation regressed; deepen runway discipline within a bounded operating floor and without changing sales metrics.',
        },
      };
      exhaustedScript[salesIndex] = {
        ...exhaustedScript[salesIndex],
        arguments: {
          ...(exhaustedScript[salesIndex].arguments || {}),
          weighted_pipeline_usd_delta: 50000,
          closed_won_revenue_delta_usd: 24000,
        },
      };
      exhaustedScript.splice(
        salesIndex + 1,
        0,
        {
          tool_name: 'board.update',
          request_id: 'startup_operator_req_board_plateau',
          arguments: {
            source: 'sparkqa_plateau_tactic_switch',
            iteration: 'plateau_tactic_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
            anti_gaming_note: 'Scalar pipeline deltas are exhausted; board update must improve decision discipline without inflating growth metrics.',
          },
        },
        {
          tool_name: 'sim.advance',
          request_id: 'startup_operator_req_sim_after_plateau',
          arguments: { advance_by: 1, unit: 'week' },
        },
        {
          tool_name: 'metrics.report',
          request_id: 'startup_operator_req_customer_plateau',
          arguments: {
            source: 'sparkqa_plateau_customer_signal',
            iteration: 'plateau_customer_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
            anti_gaming_note: 'Scalar pipeline deltas are exhausted; metrics report must improve customer-signal discipline without inflating growth metrics.',
          },
        },
        {
          tool_name: 'sales.pipeline.update',
          request_id: 'startup_operator_req_growth_after_plateau',
          arguments: {
            pipeline_count_delta: 0,
            weighted_pipeline_usd_delta: 0,
          },
        },
      );
      writeFileSync(startupToolScriptPath, `${JSON.stringify(exhaustedScript, null, 2)}\n`, 'utf-8');
      const toolScriptSha = createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex');

      const plateauProof = JSON.parse(JSON.stringify(proof.report || {}));
      plateauProof.generatedAt = new Date().toISOString();
      plateauProof.startupBench = {
        ...(plateauProof.startupBench || {}),
        runSignature: {
          ...((plateauProof.startupBench || {}).runSignature || {}),
          payload: {
            ...(((plateauProof.startupBench || {}).runSignature || {}).payload || {}),
            toolCallsPath: startupToolScriptPath,
            toolCallsSha256: toolScriptSha,
          },
        },
      };
      plateauProof.startupOperator = {
        ...(plateauProof.startupOperator || {}),
        toolCallsPath: startupToolScriptPath,
        toolCallsSha256: toolScriptSha,
      };
      writeLatestProof(repo, plateauProof);

      const escapeCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(escapeCandidate.ok, true);
      assert.equal(escapeCandidate.candidate?.status, 'candidate_ready');
      assert.equal(escapeCandidate.candidate?.candidate.insertedToolName, 'metrics.report');
      assert.equal(escapeCandidate.candidate?.patch.forward.length, 1);
      assert.equal(escapeCandidate.candidate?.patch.reverse.length, 1);
      assert.equal(escapeCandidate.candidate?.patch.forward[0]?.op, 'add');
      assert.equal(escapeCandidate.candidate?.patch.reverse[0]?.op, 'remove');
      const forwardEscape = escapeCandidate.candidate?.patch.forward[0]?.value as any;
      assert.equal(forwardEscape?.tool_name, 'metrics.report');
      assert.equal(forwardEscape?.arguments?.source, 'sparkqa_plateau_structural_escape');
      assert.equal(forwardEscape?.arguments?.plateau_response, true);
      assert.match(String(forwardEscape?.arguments?.anti_gaming_note), /without inflating growth metrics/);
      assert.match(String(escapeCandidate.candidate?.candidate.summary), /structural tool-sequence checkpoint/);
      const insertedIndex = Number(escapeCandidate.candidate?.candidate.insertedIndex);
      assert.equal(exhaustedScript[insertedIndex]?.tool_name, 'sales.pipeline.update');
      assert.equal(escapeCandidate.candidate?.scoreClaimAllowed, false);
      assert.equal(escapeCandidate.candidate?.improvementClaimAllowed, false);
      assert.equal(escapeCandidate.candidate?.public_ready, false);
      assert.equal(escapeCandidate.candidate?.network_absorbable, false);

      const escapeApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(escapeApply.ok, true);
      assert.equal(escapeApply.apply?.status, 'applied');
      assert.equal(escapeApply.apply?.mutationApplied, true);
      const scriptAfterEscape = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      assert.equal(scriptAfterEscape[insertedIndex]?.tool_name, 'metrics.report');
      assert.equal(scriptAfterEscape[insertedIndex]?.arguments?.source, 'sparkqa_plateau_structural_escape');
      assert.equal(scriptAfterEscape[insertedIndex + 1]?.tool_name, 'sales.pipeline.update');
      assert.equal(escapeApply.apply?.scoreClaimAllowed, false);
      assert.equal(escapeApply.apply?.improvementClaimAllowed, false);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('mutation candidate deepens Startup Bench runway plan instead of repeating a regressed growth precondition', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-finance-deepening-base'),
      });
      assert.equal(proof.ok, true);

      const checkpointCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(checkpointCandidate.ok, true);
      const checkpointApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(checkpointApply.ok, true);
      assert.equal(checkpointApply.apply?.mutationApplied, true);

      const plateauScript = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      const salesIndex = plateauScript.findIndex((item: any) => item.tool_name === 'sales.pipeline.update');
      const financeIndex = plateauScript.findIndex((item: any) => item.tool_name === 'finance.plan.write');
      assert.ok(salesIndex >= 0);
      assert.ok(financeIndex >= 0);
      plateauScript[financeIndex] = {
        ...plateauScript[financeIndex],
        arguments: {
          ...(plateauScript[financeIndex].arguments || {}),
          budget_changes: { monthly_burn_usd: -22000 },
          source: 'sparkqa_plateau_finance_runway',
          iteration: 'plateau_finance_previous',
          plateau_response: true,
          guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
          anti_gaming_note: 'Scalar pipeline deltas are exhausted; finance plan must improve runway discipline without inflating growth metrics.',
        },
      };
      plateauScript[salesIndex] = {
        ...plateauScript[salesIndex],
        arguments: {
          ...(plateauScript[salesIndex].arguments || {}),
          weighted_pipeline_usd_delta: 50000,
          closed_won_revenue_delta_usd: 24000,
        },
      };
      plateauScript.splice(
        salesIndex + 1,
        0,
        {
          tool_name: 'board.update',
          request_id: 'startup_operator_req_board_plateau',
          arguments: {
            source: 'sparkqa_plateau_tactic_switch',
            iteration: 'plateau_tactic_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
            anti_gaming_note: 'Scalar pipeline deltas are exhausted; board update must improve decision discipline without inflating growth metrics.',
          },
        },
        {
          tool_name: 'metrics.report',
          request_id: 'startup_operator_req_customer_plateau',
          arguments: {
            source: 'sparkqa_plateau_customer_signal',
            iteration: 'plateau_customer_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
            anti_gaming_note: 'Scalar pipeline deltas are exhausted; metrics report must improve customer-signal discipline without inflating growth metrics.',
          },
        },
        {
          tool_name: 'metrics.report',
          request_id: 'startup_operator_req_structural_plateau',
          arguments: {
            source: 'sparkqa_plateau_structural_escape',
            iteration: 'plateau_escape_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_structural_plateau_escape',
            anti_gaming_note: 'All scalar and plateau lane mutations are exhausted; structural checkpoint must improve tool sequencing without inflating growth metrics.',
          },
        },
        {
          tool_name: 'sales.pipeline.update',
          request_id: 'startup_operator_req_growth_precondition_regressed',
          arguments: {
            pipeline_count_delta: 0,
            weighted_pipeline_usd_delta: 0,
            source: 'sparkqa_plateau_growth_precondition',
            iteration: 'plateau_growth_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_growth_precondition',
            anti_gaming_note: 'All prior plateau lanes are exhausted; the next growth action must become evidence-gated without inflating pipeline or revenue metrics.',
          },
        },
        {
          tool_name: 'sales.pipeline.update',
          request_id: 'startup_operator_req_follow_on_growth_after_regression',
          arguments: {
            pipeline_count_delta: 1,
            weighted_pipeline_usd_delta: 45000,
          },
        },
      );
      writeFileSync(startupToolScriptPath, `${JSON.stringify(plateauScript, null, 2)}\n`, 'utf-8');
      const toolScriptSha = createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex');

      const plateauProof = JSON.parse(JSON.stringify(proof.report || {}));
      plateauProof.generatedAt = new Date().toISOString();
      plateauProof.startupBench = {
        ...(plateauProof.startupBench || {}),
        runSignature: {
          ...((plateauProof.startupBench || {}).runSignature || {}),
          payload: {
            ...(((plateauProof.startupBench || {}).runSignature || {}).payload || {}),
            toolCallsPath: startupToolScriptPath,
            toolCallsSha256: toolScriptSha,
          },
        },
      };
      plateauProof.startupOperator = {
        ...(plateauProof.startupOperator || {}),
        toolCallsPath: startupToolScriptPath,
        toolCallsSha256: toolScriptSha,
      };
      writeLatestProof(repo, plateauProof);

      const deepeningCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(deepeningCandidate.ok, true);
      assert.equal(deepeningCandidate.candidate?.status, 'candidate_ready');
      assert.equal(deepeningCandidate.candidate?.candidate.insertedToolName, 'finance.plan.write');
      assert.equal(deepeningCandidate.candidate?.patch.forward.length, 1);
      assert.equal(deepeningCandidate.candidate?.patch.reverse.length, 1);
      assert.equal(deepeningCandidate.candidate?.patch.forward[0]?.op, 'replace');
      const forwardFinance = deepeningCandidate.candidate?.patch.forward[0]?.value as any;
      assert.equal(forwardFinance?.tool_name, 'finance.plan.write');
      assert.equal(forwardFinance?.arguments?.source, 'sparkqa_plateau_finance_runway_deepening');
      assert.equal(forwardFinance?.arguments?.plateau_response, true);
      assert.equal(forwardFinance?.arguments?.deepened_response, true);
      assert.equal(forwardFinance?.arguments?.budget_changes?.monthly_burn_usd, -30000);
      assert.equal(forwardFinance?.arguments?.runway_deepening?.candidateMonthlyBurnDelta, -30000);
      assert.equal(forwardFinance?.arguments?.runway_deepening?.maxMonthlyBurnReductionUsd, 30000);
      assert.match(String(forwardFinance?.arguments?.anti_gaming_note), /without changing sales metrics/);
      assert.equal(deepeningCandidate.candidate?.patch.forward.some((op) => (op.value as any)?.tool_name === 'sales.pipeline.update'), false);
      assert.match(String(deepeningCandidate.candidate?.candidate.summary), /bounded finance\/runway reset/);
      assert.equal(deepeningCandidate.candidate?.scoreClaimAllowed, false);
      assert.equal(deepeningCandidate.candidate?.improvementClaimAllowed, false);
      assert.equal(deepeningCandidate.candidate?.public_ready, false);
      assert.equal(deepeningCandidate.candidate?.network_absorbable, false);

      const deepeningApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(deepeningApply.ok, true, JSON.stringify(deepeningApply.apply?.blockers || deepeningApply.error));
      assert.equal(deepeningApply.apply?.status, 'applied');
      assert.equal(deepeningApply.apply?.mutationApplied, true);
      const scriptAfterDeepening = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      const appliedFinance = scriptAfterDeepening.find((item: any) => item.tool_name === 'finance.plan.write');
      assert.equal(appliedFinance?.arguments?.source, 'sparkqa_plateau_finance_runway_deepening');
      assert.equal(appliedFinance?.arguments?.budget_changes?.monthly_burn_usd, -30000);
      assert.equal(deepeningApply.apply?.scoreClaimAllowed, false);
      assert.equal(deepeningApply.apply?.improvementClaimAllowed, false);

      const deepenedToolScriptSha = createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex');
      const deepenedProof = JSON.parse(JSON.stringify(plateauProof));
      deepenedProof.generatedAt = new Date().toISOString();
      deepenedProof.startupBench = {
        ...(deepenedProof.startupBench || {}),
        runSignature: {
          ...((deepenedProof.startupBench || {}).runSignature || {}),
          payload: {
            ...(((deepenedProof.startupBench || {}).runSignature || {}).payload || {}),
            toolCallsPath: startupToolScriptPath,
            toolCallsSha256: deepenedToolScriptSha,
          },
        },
      };
      deepenedProof.startupOperator = {
        ...(deepenedProof.startupOperator || {}),
        toolCallsPath: startupToolScriptPath,
        toolCallsSha256: deepenedToolScriptSha,
      };
      writeLatestProof(repo, deepenedProof);

      const pipelineCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(pipelineCandidate.ok, true);
      assert.equal(pipelineCandidate.candidate?.status, 'candidate_ready');
      assert.equal(pipelineCandidate.candidate?.candidate.insertedToolName, 'sales.pipeline.update');
      const pipelineForward = pipelineCandidate.candidate?.patch.forward[0]?.value as any;
      assert.equal(pipelineForward?.tool_name, 'sales.pipeline.update');
      assert.equal(pipelineForward?.request_id, 'startup_operator_req_follow_on_growth_after_regression');
      assert.equal(pipelineForward?.arguments?.source, 'sparkqa_plateau_pipeline_quality');
      assert.equal(pipelineForward?.arguments?.plateau_response, true);
      assert.equal(pipelineForward?.arguments?.pipeline_count_delta, 1);
      assert.equal(pipelineForward?.arguments?.weighted_pipeline_usd_delta, 50000);
      assert.equal(pipelineForward?.arguments?.pipeline_quality?.candidateWeightedPipelineDelta, 50000);
      assert.equal(pipelineForward?.arguments?.pipeline_quality?.maxWeightedPipelineDelta, 50000);
      assert.match(String(pipelineForward?.arguments?.anti_gaming_note), /requires fresh proof plus keep\/revert/);
      assert.match(String(pipelineCandidate.candidate?.candidate.summary), /private cap/);
      assert.equal(pipelineCandidate.candidate?.scoreClaimAllowed, false);
      assert.equal(pipelineCandidate.candidate?.improvementClaimAllowed, false);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('mutation candidate converts post-structural Startup Bench growth action into an evidence precondition', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-growth-precondition-base'),
      });
      assert.equal(proof.ok, true);

      const checkpointCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(checkpointCandidate.ok, true);
      const checkpointApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(checkpointApply.ok, true);
      assert.equal(checkpointApply.apply?.mutationApplied, true);

      const exhaustedScript = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      const salesIndex = exhaustedScript.findIndex((item: any) => item.tool_name === 'sales.pipeline.update');
      const financeIndex = exhaustedScript.findIndex((item: any) => item.tool_name === 'finance.plan.write');
      assert.ok(salesIndex >= 0);
      assert.ok(financeIndex >= 0);
      exhaustedScript[financeIndex] = {
        ...exhaustedScript[financeIndex],
        arguments: {
          ...(exhaustedScript[financeIndex].arguments || {}),
          budget_changes: { monthly_burn_usd: -30000 },
          source: 'sparkqa_plateau_finance_runway_deepening',
          iteration: 'plateau_finance_deepening_previous',
          plateau_response: true,
          deepened_response: true,
          guardrail: 'private_candidate_no_score_or_publication_claim_runway_deepening',
          anti_gaming_note: 'Prior growth-precondition mutation regressed; deepen runway discipline within a bounded operating floor and without changing sales metrics.',
        },
      };
      exhaustedScript[salesIndex] = {
        ...exhaustedScript[salesIndex],
        arguments: {
          ...(exhaustedScript[salesIndex].arguments || {}),
          weighted_pipeline_usd_delta: 50000,
          closed_won_revenue_delta_usd: 24000,
        },
      };
      exhaustedScript.splice(
        salesIndex + 1,
        0,
        {
          tool_name: 'board.update',
          request_id: 'startup_operator_req_board_plateau',
          arguments: {
            source: 'sparkqa_plateau_tactic_switch',
            iteration: 'plateau_tactic_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
            anti_gaming_note: 'Scalar pipeline deltas are exhausted; board update must improve decision discipline without inflating growth metrics.',
          },
        },
        {
          tool_name: 'sim.advance',
          request_id: 'startup_operator_req_sim_after_plateau',
          arguments: { advance_by: 1, unit: 'week' },
        },
        {
          tool_name: 'metrics.report',
          request_id: 'startup_operator_req_customer_plateau',
          arguments: {
            source: 'sparkqa_plateau_customer_signal',
            iteration: 'plateau_customer_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
            anti_gaming_note: 'Scalar pipeline deltas are exhausted; metrics report must improve customer-signal discipline without inflating growth metrics.',
          },
        },
        {
          tool_name: 'metrics.report',
          request_id: 'startup_operator_req_structural_plateau',
          arguments: {
            source: 'sparkqa_plateau_structural_escape',
            iteration: 'plateau_escape_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_structural_plateau_escape',
            anti_gaming_note: 'All scalar and plateau lane mutations are exhausted; structural checkpoint must improve tool sequencing without inflating growth metrics.',
          },
        },
        {
          tool_name: 'sales.pipeline.update',
          request_id: 'startup_operator_req_growth_after_structural_plateau',
          arguments: {
            pipeline_count_delta: 3,
            weighted_pipeline_usd_delta: 50000,
            closed_won_revenue_delta_usd: 12000,
            focus: ['pipeline_push_after_structural_plateau'],
          },
        },
        {
          tool_name: 'sales.pipeline.update',
          request_id: 'startup_operator_req_follow_on_growth_after_precondition',
          arguments: {
            pipeline_count_delta: 2,
            weighted_pipeline_usd_delta: 50000,
            focus: ['follow_on_pipeline_push_after_precondition'],
          },
        },
      );
      writeFileSync(startupToolScriptPath, `${JSON.stringify(exhaustedScript, null, 2)}\n`, 'utf-8');
      const toolScriptSha = createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex');

      const plateauProof = JSON.parse(JSON.stringify(proof.report || {}));
      plateauProof.generatedAt = new Date().toISOString();
      plateauProof.startupBench = {
        ...(plateauProof.startupBench || {}),
        runSignature: {
          ...((plateauProof.startupBench || {}).runSignature || {}),
          payload: {
            ...(((plateauProof.startupBench || {}).runSignature || {}).payload || {}),
            toolCallsPath: startupToolScriptPath,
            toolCallsSha256: toolScriptSha,
          },
        },
      };
      plateauProof.startupOperator = {
        ...(plateauProof.startupOperator || {}),
        toolCallsPath: startupToolScriptPath,
        toolCallsSha256: toolScriptSha,
      };
      writeLatestProof(repo, plateauProof);

      const growthCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(growthCandidate.ok, true);
      assert.equal(growthCandidate.candidate?.status, 'candidate_ready');
      assert.equal(growthCandidate.candidate?.candidate.insertedToolName, 'sales.pipeline.update');
      assert.equal(growthCandidate.candidate?.patch.forward.length, 1);
      assert.equal(growthCandidate.candidate?.patch.reverse.length, 1);
      assert.equal(growthCandidate.candidate?.patch.forward[0]?.op, 'replace');
      const growthIndex = Number(growthCandidate.candidate?.candidate.insertedIndex);
      assert.equal(exhaustedScript[growthIndex]?.request_id, 'startup_operator_req_growth_after_structural_plateau');
      const forwardGrowth = growthCandidate.candidate?.patch.forward[0]?.value as any;
      assert.equal(forwardGrowth?.tool_name, 'sales.pipeline.update');
      assert.equal(forwardGrowth?.arguments?.source, 'sparkqa_plateau_growth_precondition');
      assert.equal(forwardGrowth?.arguments?.plateau_response, true);
      assert.equal(forwardGrowth?.arguments?.pipeline_count_delta, 0);
      assert.equal(forwardGrowth?.arguments?.weighted_pipeline_usd_delta, 0);
      assert.equal(forwardGrowth?.arguments?.closed_won_revenue_delta_usd, 0);
      assert.equal(forwardGrowth?.arguments?.growth_precondition?.action, 'convert_growth_action_to_evidence_gate');
      assert.match(String(forwardGrowth?.arguments?.anti_gaming_note), /without inflating pipeline or revenue metrics/);
      assert.match(String(growthCandidate.candidate?.candidate.summary), /evidence precondition/);
      assert.equal(growthCandidate.candidate?.scoreClaimAllowed, false);
      assert.equal(growthCandidate.candidate?.improvementClaimAllowed, false);
      assert.equal(growthCandidate.candidate?.public_ready, false);
      assert.equal(growthCandidate.candidate?.network_absorbable, false);

      const growthApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(growthApply.ok, true);
      assert.equal(growthApply.apply?.status, 'applied');
      assert.equal(growthApply.apply?.mutationApplied, true);
      assert.equal(growthApply.apply?.scoreClaimAllowed, false);
      assert.equal(growthApply.apply?.improvementClaimAllowed, false);
      const scriptAfterGrowth = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      assert.equal(scriptAfterGrowth[growthIndex]?.arguments?.source, 'sparkqa_plateau_growth_precondition');
      assert.equal(scriptAfterGrowth[growthIndex]?.arguments?.pipeline_count_delta, 0);
      assert.equal(scriptAfterGrowth[growthIndex]?.arguments?.weighted_pipeline_usd_delta, 0);
      assert.equal(scriptAfterGrowth[growthIndex]?.arguments?.closed_won_revenue_delta_usd, 0);

      const nextToolScriptSha = createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex');
      const nextProof = JSON.parse(JSON.stringify(plateauProof));
      nextProof.generatedAt = new Date().toISOString();
      nextProof.startupBench = {
        ...(nextProof.startupBench || {}),
        runSignature: {
          ...((nextProof.startupBench || {}).runSignature || {}),
          payload: {
            ...(((nextProof.startupBench || {}).runSignature || {}).payload || {}),
            toolCallsPath: startupToolScriptPath,
            toolCallsSha256: nextToolScriptSha,
          },
        },
      };
      nextProof.startupOperator = {
        ...(nextProof.startupOperator || {}),
        toolCallsPath: startupToolScriptPath,
        toolCallsSha256: nextToolScriptSha,
      };
      writeLatestProof(repo, nextProof);

      const nextGrowthCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(nextGrowthCandidate.ok, true);
      assert.equal(nextGrowthCandidate.candidate?.status, 'candidate_ready');
      assert.equal(nextGrowthCandidate.candidate?.candidate.insertedToolName, 'sales.pipeline.update');
      const nextGrowthIndex = Number(nextGrowthCandidate.candidate?.candidate.insertedIndex);
      assert.equal(scriptAfterGrowth[nextGrowthIndex]?.request_id, 'startup_operator_req_follow_on_growth_after_precondition');
      const nextForwardGrowth = nextGrowthCandidate.candidate?.patch.forward[0]?.value as any;
      assert.equal(nextForwardGrowth?.arguments?.source, 'sparkqa_plateau_growth_precondition');
      assert.equal(nextForwardGrowth?.arguments?.pipeline_count_delta, 0);
      assert.equal(nextForwardGrowth?.arguments?.weighted_pipeline_usd_delta, 0);
      assert.equal(nextForwardGrowth?.arguments?.plateau_response, true);
      assert.equal(nextGrowthCandidate.candidate?.scoreClaimAllowed, false);
      assert.equal(nextGrowthCandidate.candidate?.improvementClaimAllowed, false);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('mutation candidate hands exhausted Startup Bench lanes to advisory research without fake score', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-exhausted-lanes-base'),
      });
      assert.equal(proof.ok, true);

      const checkpointCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(checkpointCandidate.ok, true);
      const checkpointApply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(checkpointApply.ok, true);
      assert.equal(checkpointApply.apply?.mutationApplied, true);

      const exhaustedScript = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      const salesIndex = exhaustedScript.findIndex((item: any) => item.tool_name === 'sales.pipeline.update');
      const financeIndex = exhaustedScript.findIndex((item: any) => item.tool_name === 'finance.plan.write');
      assert.ok(salesIndex >= 0);
      assert.ok(financeIndex >= 0);
      exhaustedScript[financeIndex] = {
        ...exhaustedScript[financeIndex],
        arguments: {
          ...(exhaustedScript[financeIndex].arguments || {}),
          budget_changes: { monthly_burn_usd: -30000 },
          source: 'sparkqa_plateau_finance_runway_deepening',
          iteration: 'plateau_finance_deepening_previous',
          plateau_response: true,
          deepened_response: true,
          guardrail: 'private_candidate_no_score_or_publication_claim_runway_deepening',
          anti_gaming_note: 'Prior growth-precondition mutation regressed; deepen runway discipline within a bounded operating floor and without changing sales metrics.',
        },
      };
      exhaustedScript[salesIndex] = {
        ...exhaustedScript[salesIndex],
        arguments: {
          ...(exhaustedScript[salesIndex].arguments || {}),
          weighted_pipeline_usd_delta: 50000,
          closed_won_revenue_delta_usd: 24000,
        },
      };
      exhaustedScript.splice(
        salesIndex + 1,
        0,
        {
          tool_name: 'board.update',
          request_id: 'startup_operator_req_board_plateau',
          arguments: {
            source: 'sparkqa_plateau_tactic_switch',
            iteration: 'plateau_tactic_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
            anti_gaming_note: 'Scalar pipeline deltas are exhausted; board update must improve decision discipline without inflating growth metrics.',
          },
        },
        {
          tool_name: 'metrics.report',
          request_id: 'startup_operator_req_customer_plateau',
          arguments: {
            source: 'sparkqa_plateau_customer_signal',
            iteration: 'plateau_customer_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_scalar_budget_exhausted',
            anti_gaming_note: 'Scalar pipeline deltas are exhausted; metrics report must improve customer-signal discipline without inflating growth metrics.',
          },
        },
        {
          tool_name: 'metrics.report',
          request_id: 'startup_operator_req_structural_plateau',
          arguments: {
            source: 'sparkqa_plateau_structural_escape',
            iteration: 'plateau_escape_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_structural_plateau_escape',
            anti_gaming_note: 'All scalar and plateau lane mutations are exhausted; structural checkpoint must improve tool sequencing without inflating growth metrics.',
          },
        },
        {
          tool_name: 'sales.pipeline.update',
          request_id: 'startup_operator_req_pipeline_quality_used',
          arguments: {
            pipeline_count_delta: 1,
            weighted_pipeline_usd_delta: 50000,
            source: 'sparkqa_plateau_pipeline_quality',
            iteration: 'plateau_pipeline_quality_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_pipeline_quality',
            anti_gaming_note: 'This bounded pipeline calibration stays within the private lab cap and still requires fresh proof plus keep/revert.',
          },
        },
        {
          tool_name: 'sales.pipeline.update',
          request_id: 'startup_operator_req_growth_precondition_used',
          arguments: {
            pipeline_count_delta: 0,
            weighted_pipeline_usd_delta: 0,
            closed_won_revenue_delta_usd: 0,
            source: 'sparkqa_plateau_growth_precondition',
            iteration: 'plateau_growth_previous',
            plateau_response: true,
            guardrail: 'private_candidate_no_score_or_publication_claim_growth_precondition',
            anti_gaming_note: 'All prior plateau lanes are exhausted; the next growth action must become evidence-gated without inflating pipeline or revenue metrics.',
          },
        },
      );
      writeFileSync(startupToolScriptPath, `${JSON.stringify(exhaustedScript, null, 2)}\n`, 'utf-8');
      const toolScriptSha = createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex');

      const exhaustedProof = JSON.parse(JSON.stringify(proof.report || {}));
      exhaustedProof.generatedAt = new Date().toISOString();
      exhaustedProof.startupBench = {
        ...(exhaustedProof.startupBench || {}),
        runSignature: {
          ...((exhaustedProof.startupBench || {}).runSignature || {}),
          payload: {
            ...(((exhaustedProof.startupBench || {}).runSignature || {}).payload || {}),
            toolCallsPath: startupToolScriptPath,
            toolCallsSha256: toolScriptSha,
          },
        },
      };
      exhaustedProof.startupOperator = {
        ...(exhaustedProof.startupOperator || {}),
        toolCallsPath: startupToolScriptPath,
        toolCallsSha256: toolScriptSha,
      };
      writeLatestProof(repo, exhaustedProof);

      const oneAgentProfile = await syncSparkQaStartupBenchAdvisoryAgentDispatch({
        repoRoot: repo,
        agentReviewers: 1,
      });
      assert.equal(oneAgentProfile.ok, true);
      assert.equal(oneAgentProfile.roster?.targetReviewers, 1);
      assert.equal(oneAgentProfile.roster?.agents.length, 1);
      assert.equal(oneAgentProfile.roster?.agents[0]?.persona.label, 'Proof Integrity Auditor');
      const oneAgentDefaultDispatch = await syncSparkQaStartupBenchAdvisoryAgentDispatch({ repoRoot: repo });
      assert.equal(oneAgentDefaultDispatch.ok, true);
      assert.equal(oneAgentDefaultDispatch.roster?.targetReviewers, 1);
      assert.equal(oneAgentDefaultDispatch.roster?.agents.length, 1);
      assert.equal(oneAgentDefaultDispatch.roster?.personaDeck.length, 1);

      const exhaustedCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(exhaustedCandidate.ok, false);
      assert.equal(exhaustedCandidate.candidate?.status, 'blocked');
      assert.ok(exhaustedCandidate.candidate?.blockers.includes('startup_operator_plateau_tactic_lanes_exhausted'));
      assert.ok(exhaustedCandidate.candidate?.blockers.includes('candidate_tool_script_not_written'));
      assert.equal(exhaustedCandidate.candidate?.continuation?.mode, 'advisory_mutation_research');
      assert.equal(exhaustedCandidate.candidate?.continuation?.advisoryAgents, 1);
      assert.equal(exhaustedCandidate.candidate?.nextCommand, '/sparkqa reviewers advisory dispatch agents 1');
      assert.equal(exhaustedCandidate.candidate?.scoreClaimAllowed, false);
      assert.equal(exhaustedCandidate.candidate?.improvementClaimAllowed, false);
      assert.match(renderSparkQaStartupBenchMutationCandidate(exhaustedCandidate), /end of the deterministic lanes/);
      assert.match(renderSparkQaStartupBenchMutationCandidate(exhaustedCandidate), /No score or improvement claim/);

      const dispatch = await syncSparkQaStartupBenchAdvisoryAgentDispatch({
        repoRoot: repo,
        agentReviewers: 1,
      });
      assert.equal(dispatch.ok, true);
      assert.equal(dispatch.roster?.targetReviewers, 1);
      const advisoryRun = await runSparkQaStartupBenchAdvisoryAgents({
        repoRoot: repo,
        limit: 1,
        providerLabel: SPARK_QA_LOCAL_STARTUP_BENCH_ADVISORY_PROVIDER_LABEL,
      });
      assert.equal(advisoryRun.ok, true);
      assert.equal(advisoryRun.run?.acceptedSlots.length, 1);

      const exhaustedReadyPlan = await syncSparkQaStartupBenchMutationPlan({ repoRoot: repo });
      assert.equal(exhaustedReadyPlan.plan?.mutationRecommendation.status, 'ready');
      assert.equal(exhaustedReadyPlan.plan?.mutationRecommendation.recommendedMutationStrategy, 'append_advisory_research_checkpoint');
      assert.ok(exhaustedReadyPlan.plan?.mutationRecommendation.selectionBasis.includes('target_plateau_tactic_lanes_exhausted'));

      const worker = await syncSparkQaStartupBenchEvolutionWorker({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
      });
      assert.equal(worker.ok, true);
      assert.equal(worker.state?.lastTickResult?.mode, 'advisory_private_candidate_prepared');
      assert.equal(worker.state?.lastTickResult?.nextCommand, '/sparkqa evolve tick');
      assert.equal(worker.state?.lastTickResult?.scoreClaimAllowed, false);
      assert.equal(worker.state?.scoreClaimAllowed, false);
      assert.match(renderSparkQaStartupBenchEvolutionWorker(worker), /prepared the advisory-guided private candidate/);
      assert.match(renderSparkQaStartupBenchEvolutionWorker(worker), /No score, improvement claim/);

      const advisoryResearchAutoApply = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'tick',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 1,
        applyPolicy: 'auto_hash_gated',
      });
      assert.equal(advisoryResearchAutoApply.state?.status, 'waiting_for_fresh_proof');
      assert.equal(advisoryResearchAutoApply.state?.lastWorkerMode, 'advisory_private_candidate_applied');
      assert.equal(advisoryResearchAutoApply.state?.nextCommand, '/sparkqa run');
      assert.equal(advisoryResearchAutoApply.state?.scoreClaimAllowed, false);
      assert.equal(advisoryResearchAutoApply.state?.improvementClaimAllowed, false);
      assert.ok(advisoryResearchAutoApply.state?.steps.some((step) => step.id === 'worker_tick' && step.status === 'done'));
      const scriptAfterResearch = JSON.parse(readFileSync(startupToolScriptPath, 'utf-8'));
      assert.equal(scriptAfterResearch[scriptAfterResearch.length - 1]?.arguments?.source, 'sparkqa_advisory_research_mutation');
      assert.equal(scriptAfterResearch[scriptAfterResearch.length - 1]?.arguments?.advisory_research_checkpoint, true);
      assert.match(String(scriptAfterResearch[scriptAfterResearch.length - 1]?.arguments?.anti_gaming_note), /fresh proof, keep\/revert, and reasoning trials/);

      const advisoryResearchProof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-advisory-research-post-apply'),
      });
      assert.equal(advisoryResearchProof.ok, true);
      assert.equal(advisoryResearchProof.report?.schemaVersion, 'spark-startup-bench-proof-adapter.v1');
      const advisoryResearchDecision = await syncSparkQaStartupBenchKeepRevertDecision({ repoRoot: repo });
      assert.equal(advisoryResearchDecision.ok, true);
      assert.equal(advisoryResearchDecision.decision?.mutation.checkpointApplied, true);
      assert.equal(advisoryResearchDecision.decision?.mutation.checkpointRequestId, scriptAfterResearch[scriptAfterResearch.length - 1]?.request_id);
      assert.equal(advisoryResearchDecision.decision?.privateEvolution.cycleClosureAllowed, true);
      assert.equal(advisoryResearchDecision.decision?.privateEvolution.decision, 'keep_private');
      assert.equal(advisoryResearchDecision.decision?.scoreClaimAllowed, false);
      assert.ok(!advisoryResearchDecision.decision?.blockers.some((blocker) => /mutation_candidate_not_applied|fresh_proof_after_mutation_missing/.test(blocker)));

      const closedResearchCycle = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 1,
      });
      assert.equal(closedResearchCycle.state?.completedCycles, 1);
      assert.equal(closedResearchCycle.state?.privateCycleClosure?.cycleClosureAllowed, true);
      assert.equal(closedResearchCycle.state?.privateCycleClosure?.countedThisTurn, true);
      assert.equal(closedResearchCycle.state?.nextCommand, '/sparkqa improve startup-bench tick');
      assert.ok(closedResearchCycle.state?.steps.some((step) => step.id === 'reasoning_trials' && step.status === 'done'));
      assert.ok(closedResearchCycle.state?.steps.some((step) => step.id === 'swarm_export' && step.status === 'done'));
      assert.equal(closedResearchCycle.state?.scoreClaimAllowed, false);
      assert.equal(closedResearchCycle.state?.improvementClaimAllowed, false);

      const secondResearchDispatch = await syncSparkQaStartupBenchAdvisoryAgentDispatch({
        repoRoot: repo,
        agentReviewers: 1,
        forceFreshRound: true,
        dispatchContext: {
          mode: 'exhausted_lane_mutation_research',
          forceFreshRound: true,
          reason: 'continue advisory research after the first proof-bound research checkpoint',
          blockers: ['startup_operator_advisory_research_checkpoint_already_present'],
          focus: ['next_reversible_startup_operator_mutation_strategy'],
          scoreClaimAllowed: false,
          improvementClaimAllowed: false,
          public_ready: false,
          network_absorbable: false,
          claimBoundary: 'This continuation requests private mutation research only and cannot create score authority.',
        },
      });
      assert.equal(secondResearchDispatch.ok, true);
      assert.equal(secondResearchDispatch.roster?.returnedReviewers, 0);
      const secondResearchRun = await runSparkQaStartupBenchAdvisoryAgents({
        repoRoot: repo,
        limit: 1,
        providerLabel: SPARK_QA_LOCAL_STARTUP_BENCH_ADVISORY_PROVIDER_LABEL,
      });
      assert.equal(secondResearchRun.ok, true);
      assert.equal(secondResearchRun.run?.acceptedSlots.length, 1);

      const secondResearchCandidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(secondResearchCandidate.ok, true, secondResearchCandidate.error);
      assert.equal(secondResearchCandidate.candidate?.status, 'candidate_ready');
      assert.equal(secondResearchCandidate.candidate?.patch.forward.length, 2);
      assert.equal(secondResearchCandidate.candidate?.patch.forward[0]?.op, 'add');
      assert.equal(secondResearchCandidate.candidate?.patch.forward[1]?.op, 'add');
      assert.ok(!secondResearchCandidate.candidate?.blockers.includes('startup_operator_advisory_research_checkpoint_already_present'));
      const secondResearchForward = secondResearchCandidate.candidate?.patch.forward[0]?.value as any;
      assert.equal(secondResearchForward?.arguments?.source, 'sparkqa_advisory_research_mutation');
      assert.equal(secondResearchForward?.arguments?.advisory_research_checkpoint, true);
      assert.equal(secondResearchForward?.arguments?.advisory_research?.sequence, 2);
      assert.equal(secondResearchForward?.arguments?.advisory_research?.previousCheckpointCount, 1);
      const secondOutcomeEscape = secondResearchCandidate.candidate?.patch.forward[1]?.value as any;
      assert.equal(secondOutcomeEscape?.tool_name, 'sales.pipeline.update');
      assert.equal(secondOutcomeEscape?.arguments?.source, 'sparkqa_advisory_outcome_escape');
      assert.equal(secondOutcomeEscape?.arguments?.plateau_response, true);
      assert.equal(secondOutcomeEscape?.arguments?.weighted_pipeline_usd_delta, 50000);
      assert.equal(secondOutcomeEscape?.arguments?.closed_won_revenue_delta_usd, 9000);
      assert.match(String(secondOutcomeEscape?.arguments?.anti_gaming_note), /fresh proof, keep\/revert, and promotion gates/);
      const secondResearchScript = JSON.parse(readFileSync(String(secondResearchCandidate.candidateToolScriptPath), 'utf-8'));
      const finalSimAdvanceIndex = secondResearchScript.findIndex((item: any, index: number) => (
        index > Number(secondResearchCandidate.candidate?.candidate.insertedIndex) &&
        item.tool_name === 'sim.advance'
      ));
      assert.equal(secondResearchScript[Number(secondResearchCandidate.candidate?.candidate.insertedIndex)]?.tool_name, 'metrics.report');
      assert.equal(secondResearchScript[Number(secondResearchCandidate.candidate?.candidate.insertedIndex) + 1]?.tool_name, 'sales.pipeline.update');
      if (secondResearchScript.some((item: any) => item.tool_name === 'sim.advance')) {
        assert.ok(finalSimAdvanceIndex > Number(secondResearchCandidate.candidate?.candidate.insertedIndex));
      }
      assert.equal(secondResearchCandidate.candidate?.scoreClaimAllowed, false);
      assert.equal(secondResearchCandidate.candidate?.improvementClaimAllowed, false);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('keep/revert blocks private cycle closure when fresh Startup Bench movement regresses', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const startupToolScriptPath = path.join(startupOperatorRepo, 'benchmarks', 'startup-operator.tool_calls.json');
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';

      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const baseProof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-regression-base'),
      });
      assert.equal(baseProof.ok, true);

      const candidate = await syncSparkQaStartupBenchMutationCandidate({ repoRoot: repo });
      assert.equal(candidate.ok, true);
      const apply = await syncSparkQaStartupBenchMutationApply({ repoRoot: repo });
      assert.equal(apply.ok, true);
      assert.equal(apply.apply?.mutationApplied, true);

      const baseProofSha = createHash('sha256').update(readFileSync(String(baseProof.reportPath))).digest('hex');
      const waitingStatePath = path.join(
        repo,
        '.spark-swarm',
        'startup-bench-evolution',
        'orchestrator',
        baseProofSha.slice(0, 24),
        'improvement_orchestrator_state.json',
      );
      mkdirSync(path.dirname(waitingStatePath), { recursive: true });
      writeFileSync(waitingStatePath, `${JSON.stringify({
        schemaVersion: 'spark-startup-bench-improvement-orchestrator.v1',
        generatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'waiting_for_fresh_proof',
        action: 'tick',
        benchmarkLevel: 10,
        requestedCycles: 100,
        completedCycles: 0,
        advisoryAgents: 5,
        reviewMode: 'fast_lab',
        currentProofSha256: baseProofSha,
        currentProofPath: baseProof.reportPath,
        nextCommand: '/sparkqa run',
        nextReason: 'test candidate is waiting for fresh proof',
        steps: [],
        artifactRefs: [],
        blockers: [],
        commands: {},
        scoreClaimAllowed: false,
        improvementClaimAllowed: false,
        public_ready: false,
        network_absorbable: false,
        claimBoundary: 'test state only',
      }, null, 2)}\n`, 'utf-8');

      const regressedProof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-regressed-after-apply'),
      });
      assert.equal(regressedProof.ok, true);
      const regressedReport = JSON.parse(JSON.stringify(regressedProof.report || {}));
      regressedReport.privateScoreSummary = {
        ...(regressedReport.privateScoreSummary || {}),
        baseline: { scenarioScore: 0.64, runCount: 3 },
        candidate: { scenarioScore: 0.655, runCount: 3 },
        comparison: {
          metric: 'scenario_score',
          candidateMinusBaseline: 0.015,
          candidateBeatsBaseline: true,
        },
      };
      writeLatestProof(repo, regressedReport);

      const decision = await syncSparkQaStartupBenchKeepRevertDecision({ repoRoot: repo });
      assert.equal(decision.ok, true);
      assert.equal(decision.decision?.status, 'revert_recommended');
      assert.equal(decision.decision?.decision, 'revert');
      assert.equal(decision.decision?.privateEvolution.cycleClosureAllowed, false);
      assert.equal(decision.decision?.privateEvolution.decision, 'revert_required');
      assert.equal(decision.decision?.privateCycleComparison?.previousCandidateMinusBaseline, 0.03);
      assert.equal(decision.decision?.privateCycleComparison?.currentCandidateMinusBaseline, 0.015);
      assert.equal(decision.decision?.privateCycleComparison?.deltaVsPreviousCycle, -0.015);
      assert.equal(decision.decision?.privateCycleComparison?.regressedVsPreviousCycle, true);
      assert.ok(decision.decision?.blockers.some((blocker) => blocker.includes('private_movement_regressed_vs_previous_cycle')));
      assert.match(renderSparkQaStartupBenchKeepRevertDecision(decision), /recommends revert/);
      assert.equal(decision.decision?.scoreClaimAllowed, false);
      assert.equal(decision.decision?.improvementClaimAllowed, false);

      const orchestrator = await syncSparkQaStartupBenchImprovementOrchestrator({
        repoRoot: repo,
        action: 'status',
        requestedCycles: 100,
        benchmarkLevel: 10,
        agentReviewers: 5,
      });
      assert.equal(orchestrator.state?.status, 'blocked');
      assert.equal(orchestrator.state?.completedCycles, 0);
      assert.equal(orchestrator.state?.privateCycleClosure?.cycleClosureAllowed, false);
      assert.equal(orchestrator.state?.privateCycleClosure?.decision, 'revert_required');
      assert.equal(orchestrator.state?.privateCycleClosure?.deltaVsPreviousCycle, -0.015);
      assert.equal(orchestrator.state?.nextCommand, '/sparkqa mutation plan');
      assert.match(String(orchestrator.state?.nextReason), /regressed/i);
      assert.equal(orchestrator.state?.scoreClaimAllowed, false);
      assert.equal(orchestrator.state?.improvementClaimAllowed, false);

      const revert = await syncSparkQaStartupBenchMutationRevert({ repoRoot: repo });
      assert.equal(revert.ok, true, JSON.stringify(revert.revert?.blockers || revert.error));
      assert.equal(revert.revert?.status, 'reverted');
      assert.equal(revert.revert?.mutationReverted, true);
      assert.equal(revert.revert?.target.before?.sha256, apply.apply?.target.after?.sha256);
      assert.notEqual(revert.revert?.target.after?.sha256, apply.apply?.target.after?.sha256);
      assert.equal(createHash('sha256').update(readFileSync(startupToolScriptPath)).digest('hex'), revert.revert?.patch.revertedSha256);
      assert.equal(revert.revert?.scoreClaimAllowed, false);
      assert.equal(revert.revert?.improvementClaimAllowed, false);
      assert.match(renderSparkQaStartupBenchMutationRevert(revert), /mutation is reverted/);

      const alreadyReverted = await syncSparkQaStartupBenchMutationRevert({ repoRoot: repo });
      assert.equal(alreadyReverted.ok, true);
      assert.equal(alreadyReverted.revert?.status, 'already_reverted');
      assert.equal(alreadyReverted.revert?.mutationReverted, true);
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
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('blocks Startup Bench reconciliation when wrapper and raw score sources diverge', async () => {
    const repo = makeFakeSparkQaRepo();
    const startupBenchRepo = makeFakeStartupBenchRepo();
    const startupOperatorRepo = makeFakeStartupOperatorRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldStartupBench = process.env.SPARK_STARTUP_BENCH_REPO;
    const oldStartupOperator = process.env.SPARK_STARTUP_OPERATOR_REPO;
    const oldMismatch = process.env.SPARK_QA_FAKE_SCORE_MISMATCH;
    const oldSidecarRequired = process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_STARTUP_BENCH_REPO = startupBenchRepo;
      process.env.SPARK_STARTUP_OPERATOR_REPO = startupOperatorRepo;
      process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = '1';
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Startup Bench',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const proof = await runSparkQaAutoloopRound({
        repoRoot: repo,
        outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'startup-bench-mismatch'),
      });
      assert.equal(proof.ok, true);
      process.env.SPARK_QA_FAKE_SCORE_MISMATCH = '1';
      const reconciliation = await syncSparkQaStartupBenchScoreReconciliation({ repoRoot: repo });
      assert.equal(reconciliation.ok, true);
      assert.equal(reconciliation.workbench?.scoreClaimAllowed, false);
      assert.equal(reconciliation.workbench?.checks.find((check) => check.id === 'wrapper_raw')?.status, 'blocked');
      assert.ok(reconciliation.workbench?.blockers.includes('wrapper_raw_not_reconciled'));
      assert.ok(reconciliation.workbench?.blockers.includes('wrapper_raw_hash_mismatch'));
      assert.ok(reconciliation.workbench?.blockers.includes('raw_wrapper_score_candidateScenarioScore_mismatch'));
      assert.match(renderSparkQaStartupBenchScoreReconciliation(reconciliation), /score reconciliation is blocked/);
      assert.doesNotMatch(renderSparkQaStartupBenchScoreReconciliation(reconciliation), /score reconciliation is clean/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldStartupBench === undefined) delete process.env.SPARK_STARTUP_BENCH_REPO;
      else process.env.SPARK_STARTUP_BENCH_REPO = oldStartupBench;
      if (oldStartupOperator === undefined) delete process.env.SPARK_STARTUP_OPERATOR_REPO;
      else process.env.SPARK_STARTUP_OPERATOR_REPO = oldStartupOperator;
      if (oldMismatch === undefined) delete process.env.SPARK_QA_FAKE_SCORE_MISMATCH;
      else process.env.SPARK_QA_FAKE_SCORE_MISMATCH = oldMismatch;
      if (oldSidecarRequired === undefined) delete process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS;
      else process.env.SPARK_STARTUP_BENCH_SIDECAR_REQUIRED_REVIEWERS = oldSidecarRequired;
      rmSync(repo, { recursive: true, force: true });
      rmSync(startupBenchRepo, { recursive: true, force: true });
      rmSync(startupOperatorRepo, { recursive: true, force: true });
    }
  });

  await test('guided benchmark draft collects path and level before confirm creates a packet', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      const chatKey = 'telegram:test-guide';
      const start = await runSparkQaBenchmarkGuide({ repoRoot: repo, chatKey, guideAction: 'start' });
      assert.equal(start.ok, true);
      assert.equal(start.draft?.specializationPath, undefined);
      assert.equal(start.draft?.level, undefined);
      assert.match(renderSparkQaBenchmarkGuide(start), /Set the path/);

      const pathDraft = await runSparkQaBenchmarkGuide({
        repoRoot: repo,
        chatKey,
        guideAction: 'path',
        specializationPath: 'Spark QA Operator',
      });
      assert.equal(pathDraft.ok, true);
      assert.equal(pathDraft.draft?.specializationPath, 'Spark QA Operator');
      assert.match(renderSparkQaBenchmarkGuide(pathDraft), /Choose depth/);

      const level = await runSparkQaBenchmarkGuide({ repoRoot: repo, chatKey, guideAction: 'level', level: 10 });
      assert.equal(level.ok, true);
      assert.equal(level.draft?.levelProfile?.timeBudget, 'hours to days');
      assert.match(renderSparkQaBenchmarkGuide(level), /Confirm with \/sparkqa guide confirm/);

      const confirmed = await runSparkQaBenchmarkGuide({ repoRoot: repo, chatKey, guideAction: 'confirm' });
      assert.equal(confirmed.ok, true);
      assert.equal(confirmed.draft?.status, 'created');
      assert.equal(confirmed.benchmarkCreator?.benchmarkJob?.level, 10);
      assert.equal(confirmed.benchmarkCreator?.benchmarkJob?.specializationPath, 'Spark QA Operator');
      assert.equal(readActiveSparkQaBenchmarkJob(repo).job?.jobId, confirmed.benchmarkCreator?.benchmarkJob?.jobId);
      assert.equal(confirmed.workboard?.ok, true);
      assert.equal(confirmed.workboard?.workboard?.boardStatus, 'in_progress');
      assert.ok(confirmed.workboard?.workboardPath && existsSync(confirmed.workboard.workboardPath));
      const reply = renderSparkQaBenchmarkGuide(confirmed);
      assert.match(reply, /Benchmark creator packet is staged/);
      assert.match(reply, /workboard/);
      assert.match(reply, /Next, run \/sparkqa prove/);
      assert.doesNotMatch(reply, /score [0-9]/i);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('verified batch attestation checks local evidence before marking cases observed', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Spark QA Operator',
        level: 10,
      });
      assert.equal(creator.ok, true);
      assert.ok(creator.benchmarkJob?.paths.evidenceRoot);
      const captureRun = await runSparkQaEvidenceCapture({ repoRoot: repo, limit: 1 });
      assert.equal(captureRun.ok, true);

      const evidenceRoot = creator.benchmarkJob.paths.evidenceRoot;
      const evidencePath = path.join(evidenceRoot, 'case-1.json');
      const boundary = {
        scoreClaimAllowed: false,
        improvementClaimAllowed: false,
        public_ready: false,
        network_absorbable: false,
      };
      const artifactRelativePath = path.join('artifacts', 'case-1', '001-case-envelope.json');
      const artifactPath = path.join(evidenceRoot, artifactRelativePath);
      mkdirSync(path.dirname(artifactPath), { recursive: true });
      const artifact = {
        schemaVersion: 'spark-qa-evidence-artifact.v1',
        caseId: 'case-1',
        kind: 'case_envelope',
        captureAttestation: { status: 'provisional' },
        source: { kind: 'generated_probe_record' },
        claimBoundary: boundary,
      };
      writeFileSync(artifactPath, JSON.stringify(artifact, null, 2) + '\n', 'utf-8');
      const artifactBytes = readFileSync(artifactPath);
      const evidence = JSON.parse(readFileSync(evidencePath, 'utf-8'));
      evidence.publicationState = 'private_review';
      evidence.claimBoundary = boundary;
      evidence.artifacts = [{
        path: artifactRelativePath,
        kind: 'case_envelope',
        byteSize: artifactBytes.byteLength,
        sha256: createHash('sha256').update(artifactBytes).digest('hex'),
      }];
      writeFileSync(evidencePath, JSON.stringify(evidence, null, 2) + '\n', 'utf-8');

      const batch = await runSparkQaEvidenceVerifiedBatchAttestation({
        repoRoot: repo,
        limit: 1,
        reviewerId: 'telegram:test-batch',
      });
      assert.equal(batch.ok, true);
      assert.equal(batch.payload?.batch.attestedCount, 1);
      assert.equal(batch.payload?.batch.failedCount, 0);
      assert.equal(batch.payload?.batch.scoreClaimAllowed, false);
      assert.equal(batch.payload?.batch.reviewSummary?.byStatus?.observed, 1);
      const reply = renderSparkQaEvidenceVerifiedBatchAttestation(batch);
      assert.match(reply, /Verified batch attestation recorded 1 observed case/);
      assert.match(reply, /does not create a score/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('proof workflow resumes capture, verified attestation, and dossier-gated autoloop', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Spark QA Operator',
        level: 10,
      });
      assert.equal(creator.ok, true);

      const workflow = await runSparkQaProofWorkflow({
        repoRoot: repo,
        limit: 100,
        reviewerId: 'telegram:test-proof-workflow',
      });
      assert.equal(workflow.ok, true);
      assert.equal(workflow.payload?.workflow.phase, 'proof_blocked');
      assert.equal(workflow.payload?.workflow.scoreClaimAllowed, false);
      assert.equal(workflow.payload?.workflow.public_ready, false);
      assert.equal(workflow.payload?.workflow.network_absorbable, false);
      assert.equal(workflow.payload?.workflow.reviewSummary?.byStatus?.observed, 84);
      assert.equal(workflow.captureRun?.payload?.capture?.capturedCount, 84);
      assert.equal(workflow.verifiedBatch?.payload?.batch.attestedCount, 84);
      assert.equal(workflow.autoloop?.proofRan, true);
      assert.equal(workflow.autoloop?.report?.promotionDossier?.scoreClaimAllowed, false);
      assert.ok(workflow.statePath && existsSync(workflow.statePath));
      assert.ok(workflow.kanbanPath && existsSync(workflow.kanbanPath));
      const reply = renderSparkQaProofWorkflow(workflow);
      assert.match(reply, /Proof workflow advanced/);
      assert.match(reply, /would not claim an upgrade yet/);
      assert.doesNotMatch(reply, /cleared the benchmark-backed score claim/);

      const status = readLatestSparkQaProofWorkflow(repo);
      assert.equal(status.ok, true);
      assert.equal(status.workflow?.phase, 'proof_blocked');
      assert.equal(status.workflow?.scoreClaimAllowed, false);
      const statusReply = renderSparkQaProofWorkflowStatus(status);
      assert.match(statusReply, /evidence queue is sealed/);
      assert.match(statusReply, /has not cleared yet/);
      assert.doesNotMatch(statusReply, /capture, verify/);

      const staleWorkflow = JSON.parse(readFileSync(workflow.statePath!, 'utf-8'));
      staleWorkflow.updatedAt = '2020-01-01T00:00:00.000Z';
      staleWorkflow.scoreClaimAllowed = true;
      writeFileSync(workflow.statePath!, JSON.stringify(staleWorkflow, null, 2) + '\n', 'utf-8');
      const staleStatus = readLatestSparkQaProofWorkflow(repo);
      assert.equal(staleStatus.ok, true);
      assert.equal(staleStatus.stale, true);
      const staleReply = renderSparkQaProofWorkflowStatus(staleStatus);
      assert.match(staleReply, /stale/);
      assert.doesNotMatch(staleReply, /cleared the benchmark-backed score claim/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('runs auto proof worker ticks against the selected benchmark job only', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Spark QA Operator',
        level: 10,
      });
      assert.equal(creator.ok, true);

      const start = await runSparkQaProofAuto({
        repoRoot: repo,
        chatKey: 'telegram:test-auto-proof',
        action: 'start',
        limit: 100,
      });
      assert.equal(start.ok, true);
      assert.equal(start.state?.status, 'active');
      assert.equal(start.state?.batchLimit, 100);
      assert.equal(start.state?.scoreClaimAllowed, false);
      assert.equal(start.state?.public_ready, false);
      assert.equal(start.state?.network_absorbable, false);
      assert.match(renderSparkQaProofAuto(start), /Auto proof is active/);
      assert.doesNotMatch(renderSparkQaProofAuto(start), /cleared the benchmark-backed score claim/);

      const tick = await runSparkQaProofAutoTick({
        repoRoot: repo,
        chatKey: 'telegram:test-auto-proof',
        reviewerId: 'telegram:test-auto-proof',
      });
      assert.equal(tick.ok, true);
      assert.equal(tick.state?.status, 'blocked');
      assert.equal(tick.state?.tickCount, 1);
      assert.equal(tick.state?.scoreClaimAllowed, false);
      assert.equal(tick.state?.public_ready, false);
      assert.equal(tick.state?.network_absorbable, false);
      assert.equal(tick.state?.lastCounts?.observed, 84);
      assert.equal(tick.workflowResult?.autoloop?.proofRan, true);
      const tickReply = renderSparkQaProofAuto(tick);
      assert.match(tickReply, /did not clear scoring/);
      assert.doesNotMatch(tickReply, /cleared the benchmark-backed score claim/);

      const stopped = await runSparkQaProofAuto({
        repoRoot: repo,
        chatKey: 'telegram:test-auto-proof',
        action: 'stop',
      });
      assert.equal(stopped.ok, true);
      assert.equal(stopped.state?.status, 'paused');
      assert.match(renderSparkQaProofAuto(stopped), /paused/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('refreshes a benchmark workboard from real job, proof, and auto state', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Spark QA Operator',
        level: 10,
      });
      assert.equal(creator.ok, true);
      const chatKey = 'telegram:test-workboard';
      const start = await runSparkQaProofAuto({
        repoRoot: repo,
        chatKey,
        action: 'start',
        limit: 100,
      });
      assert.equal(start.ok, true);
      const tick = await runSparkQaProofAutoTick({
        repoRoot: repo,
        chatKey,
        reviewerId: 'telegram:test-workboard',
      });
      assert.equal(tick.ok, true);

      const board = syncSparkQaBenchmarkWorkboard({ repoRoot: repo, chatKey });
      assert.equal(board.ok, true);
      assert.equal(board.workboard?.schemaVersion, 'spark-qa-benchmark-workboard.v1');
      assert.equal(board.workboard?.boardStatus, 'blocked');
      assert.equal(board.workboard?.counts.observed, 84);
      assert.equal(board.workboard?.auto?.status, 'blocked');
      assert.equal(board.workboard?.proof.scoreClaimAllowed, false);
      assert.equal(board.workboard?.proof.public_ready, false);
      assert.equal(board.workboard?.proof.network_absorbable, false);
      assert.equal(board.workboard?.standardization.contracts.autoloop, 'spark-domain-chip-labs.autoloop-contract.v1');
      assert.equal(board.workboard?.standardization.network_absorbable, false);
      assert.ok(board.workboardPath && existsSync(board.workboardPath));
      assert.ok(board.kanbanPath && existsSync(board.kanbanPath));
      const reply = renderSparkQaBenchmarkWorkboard(board);
      assert.match(reply, /Benchmark workboard is blocked/);
      assert.match(reply, /84 observed/);
      assert.match(reply, /No score is created/);
      assert.doesNotMatch(reply, /cleared the benchmark-backed score claim/);
      assert.doesNotMatch(reply, /spark-qa-operator-repo-|\/tmp\//);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('audits benchmark quality independently from a claimed source score', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldWeak = process.env.SPARK_QA_FAKE_WEAK_BENCHMARK;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_QA_FAKE_WEAK_BENCHMARK = '1';
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Spark QA Operator',
        level: 10,
      });
      assert.equal(creator.ok, true);
      assert.equal(creator.benchmarkJob?.qualityScore, 1);

      const audit = syncSparkQaBenchmarkQualityAudit({ repoRoot: repo });
      assert.equal(audit.ok, true);
      assert.equal(audit.audit?.schemaVersion, 'spark-qa-benchmark-quality-audit.v1');
      assert.equal(audit.audit?.sourceQualityScore, 1);
      assert.equal(audit.audit?.pass, false);
      assert.equal(audit.audit?.scoreClaimAllowed, false);
      assert.equal(audit.audit?.public_ready, false);
      assert.equal(audit.audit?.network_absorbable, false);
      assert.equal(audit.audit?.dimensions.coverage.pass, false);
      assert.ok((audit.audit?.benchmarkQualityScore ?? 1) < 1);
      assert.ok(audit.auditPath && existsSync(audit.auditPath));
      const reply = renderSparkQaBenchmarkQualityAudit(audit);
      assert.match(reply, /Benchmark quality audit is blocked/);
      assert.match(reply, /not an agent score/);
      assert.match(reply, /no improvement claim is allowed/);
      assert.doesNotMatch(reply, /cleared the benchmark-backed score claim/);

      const blockedRun = await runSparkQaAutoloopRound({ repoRoot: repo });
      assert.equal(blockedRun.ok, false);
      assert.equal(blockedRun.proofRan, false);
      assert.match(blockedRun.error || '', /independent benchmark-quality audit/);
      assert.match(renderSparkQaAutoloopRound(blockedRun), /benchmark-quality audit/);

      const blockedAuto = await runSparkQaProofAuto({
        repoRoot: repo,
        chatKey: 'telegram:test-quality-preflight',
        action: 'start',
      });
      assert.equal(blockedAuto.ok, false);
      assert.equal(blockedAuto.state, undefined);
      assert.match(blockedAuto.error || '', /independent benchmark-quality audit/);
      assert.match(renderSparkQaProofAuto(blockedAuto), /benchmark-quality audit/);

      const repair = syncSparkQaBenchmarkQualityRepair({ repoRoot: repo });
      assert.equal(repair.ok, true);
      assert.equal(repair.plan?.schemaVersion, 'spark-qa-benchmark-quality-repair-plan.v1');
      assert.equal(repair.plan?.status, 'opened');
      assert.ok((repair.plan?.ticketCount ?? 0) > 0);
      assert.equal(repair.plan?.scoreClaimAllowed, false);
      assert.equal(repair.plan?.public_ready, false);
      assert.equal(repair.plan?.network_absorbable, false);
      assert.ok(repair.planPath && existsSync(repair.planPath));
      assert.ok(repair.kanbanPath && existsSync(repair.kanbanPath));
      const repairReply = renderSparkQaBenchmarkQualityRepair(repair);
      assert.match(repairReply, /Opened \d+ local benchmark-quality repair ticket/);
      assert.match(repairReply, /repair Kanban/);
      assert.match(repairReply, /scoring and improvement claims stay blocked/);
      assert.doesNotMatch(repairReply, /cleared the benchmark-backed score claim/);

      const board = syncSparkQaBenchmarkWorkboard({ repoRoot: repo });
      assert.equal(board.ok, true);
      assert.equal(board.workboard?.boardStatus, 'blocked');
      assert.ok(board.workboard?.tickets.some((ticket) => ticket.id === 'benchmark_quality_audit' && ticket.status === 'blocked'));
      assert.ok(board.workboard?.tickets.some((ticket) => String(ticket.id).startsWith('repair-quality-')));
      assert.ok(board.workboard?.artifacts.some((artifact) => artifact.id === 'benchmark_quality_repair_plan' && artifact.status === 'present'));
      assert.match(renderSparkQaBenchmarkWorkboard(board), /benchmark-quality audit is blocked/);

      const auto = runSparkQaBenchmarkQualityAuto({ repoRoot: repo, maxCycles: 2 });
      assert.equal(auto.ok, true);
      assert.equal(auto.run?.schemaVersion, 'spark-qa-benchmark-quality-auto-run.v1');
      assert.equal(auto.run?.status, 'repaired');
      assert.equal(auto.run?.cycles.length, 1);
      assert.equal(auto.run?.cycles[0]?.runStatus, 'repaired');
      assert.equal(auto.finalAudit?.pass, true);
      assert.equal(auto.run?.scoreClaimAllowed, false);
      assert.equal(auto.run?.public_ready, false);
      assert.ok(auto.runPath && existsSync(auto.runPath));
      assert.ok((auto.run?.cycles[0]?.changedArtifactIds || []).includes('benchmark_pack'));
      const autoReply = renderSparkQaBenchmarkQualityAuto(auto);
      assert.match(autoReply, /auto cycle finished/);
      assert.match(autoReply, /not an agent score/);
      assert.match(autoReply, /next gate is \/sparkqa prove/);

      const finalAudit = syncSparkQaBenchmarkQualityAudit({ repoRoot: repo });
      assert.equal(finalAudit.audit?.pass, true);
      assert.equal(finalAudit.audit?.scoreClaimAllowed, false);

      const repairRun = runSparkQaBenchmarkQualityRepair({ repoRoot: repo });
      assert.equal(repairRun.ok, true);
      assert.equal(repairRun.run?.status, 'not_needed');
      assert.match(renderSparkQaBenchmarkQualityRepairRun(repairRun), /did not need to change/);

      const repairedProof = await runSparkQaAutoloopRound({ repoRoot: repo });
      assert.equal(repairedProof.ok, true);
      assert.equal(repairedProof.proofRan, true);
      assert.equal(repairedProof.benchmarkJob?.artifactHashes.benchmarkPackSha256, readActiveSparkQaBenchmarkJob(repo).job?.artifactHashes.benchmarkPackSha256);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldWeak === undefined) delete process.env.SPARK_QA_FAKE_WEAK_BENCHMARK;
      else process.env.SPARK_QA_FAKE_WEAK_BENCHMARK = oldWeak;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('refuses to run a selected benchmark job after its pack changes', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Spark QA Operator',
        level: 10,
      });
      assert.equal(creator.ok, true);
      assert.ok(creator.benchmarkJob?.paths.benchmarkPack);
      writeFileSync(creator.benchmarkJob.paths.benchmarkPack, JSON.stringify({ id: 'tampered', cases: [] }), 'utf-8');

      const result = await runSparkQaAutoloopRound({ repoRoot: repo });
      assert.equal(result.ok, false);
      assert.equal(result.proofRan, false);
      assert.match(result.error || '', /changed after quality scoring/);
      assert.match(renderSparkQaAutoloopRound(result), /changed after quality scoring/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('rejects successful conductor output that is not a valid proof schema', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    const oldBadSuccess = process.env.SPARK_QA_FAKE_BAD_SUCCESS;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      process.env.SPARK_QA_FAKE_BAD_SUCCESS = '1';
      const result = await runSparkQaAutoloopRound({ outputRoot: path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'bad-success') });
      assert.equal(result.ok, false);
      assert.equal(result.proofRan, false);
      assert.equal(result.commandExitCode, 0);
      assert.match(renderSparkQaAutoloopRound(result), /valid proof report schema/);
      assert.doesNotMatch(renderSparkQaAutoloopRound(result), /cleared the benchmark-backed score claim/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      if (oldBadSuccess === undefined) delete process.env.SPARK_QA_FAKE_BAD_SUCCESS;
      else process.env.SPARK_QA_FAKE_BAD_SUCCESS = oldBadSuccess;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('reads only fresh latest proof with a matching manifest hash', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      writeLatestProof(repo, blockedReport());
      const result = await readLatestSparkQaAutoloopRound();
      assert.equal(result.ok, true);
      assert.equal(result.proofRan, true);
      assert.match(renderSparkQaAutoloopRound(result), /would not claim an upgrade yet/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('renders level-10 gate closures instead of stale raw promotion blockers', () => {
    const repo = makeFakeSparkQaRepo();
    try {
      const runRoot = path.join(repo, '.spark-swarm', 'autoloop', 'runs', 'level10-proofed');
      mkdirSync(runRoot, { recursive: true });
      const mutationHandoffPath = path.join(runRoot, 'mutation_handoff.json');
      writeFileSync(mutationHandoffPath, JSON.stringify({
        schemaVersion: 'spark-qa-ticket-mutation-handoff.v1',
        status: 'ready',
        ticketCount: 8,
        openTicketCount: 2,
      }), 'utf-8');
      const report = {
        ...blockedReport(),
        failureQueue: { ticketCount: 8 },
        mutationHandoff: { path: mutationHandoffPath, status: 'ready', ticketCount: 8 },
        artifacts: { mutationHandoff: mutationHandoffPath },
        promotionDossier: {
          scoreClaimAllowed: false,
          blockers: [
            'failure_ticket_open:sqafq-promotion-gate-score-claim-blocker',
            'spark_swarm_bridge_required_before_network_absorption',
            'candidate_promotion_not_eligible',
            'delta_score_claim_not_allowed',
          ],
        },
        level10GateClosures: {
          remainingBlockers: ['spark_swarm_bridge_required_before_network_absorption'],
          resolvedBlockers: [
            { blocker: 'wrapper_raw_reconciliation_required_before_score_claim', source: 'wrapper_raw_reconciliation' },
            { blocker: 'score_reconciliation_required_before_score_claim', source: 'wrapper_raw_reconciliation' },
            { blocker: 'sidecar_review_required_before_promotion', source: 'sidecar_review' },
            { blocker: 'hidden_heldout_required_before_public_promotion', source: 'hidden_heldout' },
            { blocker: 'repeated_run_stability_required_before_promotion', source: 'repeated_stability' },
          ],
        },
        hiddenHeldout: { pass: true, status: 'passed', blockers: [] },
        wrapperRaw: { pass: true, status: 'clean', blockers: [] },
        sidecarReview: { pass: true, status: 'clean', blockers: [] },
        repeatedStability: { pass: true, status: 'passed', blockers: [] },
      };
      const reply = renderSparkQaAutoloopRound({ ok: true, proofRan: true, repoRoot: repo, report });
      assert.match(reply, /Replay passed 4\/4/);
      assert.match(reply, /Local proof gates are clean: hidden-heldout, wrapper\/raw, sidecar, and stability/);
      assert.match(reply, /Spark Swarm\/network bridge review is still pending/);
      assert.match(reply, /2 open repair tickets/);
      assert.doesNotMatch(reply, /failure_ticket_open|sqafq-/);
      assert.doesNotMatch(reply, /sidecar review is still pending/);
      assert.doesNotMatch(reply, /8 improvement tickets/);
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('renders cleared score claim without public or network overclaim', () => {
    const report = {
      ...blockedReport(),
      run: { status: 'passed', endedAt: new Date().toISOString() },
      failureQueue: { ticketCount: 1, openTicketCount: 0 },
      mutationHandoff: { status: 'no_open_tickets', ticketCount: 1 },
      promotionDossier: {
        eligibilityStatus: 'eligible',
        scoreClaimAllowed: true,
        public_ready: false,
        network_absorbable: false,
        blockers: [],
      },
      level10GateClosures: { remainingBlockers: [], resolvedBlockers: [] },
      hiddenHeldout: { pass: true, status: 'passed', blockers: [] },
      wrapperRaw: { pass: true, status: 'clean', blockers: [] },
      sidecarReview: { pass: true, status: 'clean', blockers: [] },
      repeatedStability: { pass: true, status: 'passed', blockers: [] },
      sparkSwarmBridge: { pass: true, status: 'clean', blockers: [] },
    };

    const reply = renderSparkQaAutoloopRound({ ok: true, proofRan: true, report });

    assert.match(reply, /cleared the benchmark-backed score claim/);
    assert.match(reply, /Candidate replay moved 0 -> 1/);
    assert.match(reply, /Replay passed 4\/4/);
    assert.match(reply, /Evidence benchmark coverage is 1/);
    assert.match(reply, /Local proof gates are clean: hidden-heldout, wrapper\/raw, sidecar, stability, and Spark Swarm bridge compatibility/);
    assert.match(reply, /Public\/network promotion is still separate/);
    assert.match(reply, /did not publish or absorb anything/);
    assert.doesNotMatch(reply, /would not claim an upgrade yet/);
    assert.doesNotMatch(reply, /not a promotion score/);
    assert.doesNotMatch(reply, /public ready|network approved|network_absorbable=true/);
  });

  await test('renders cleared Startup Bench score claim only from promotion dossier', () => {
    const report = {
      schemaVersion: 'spark-startup-bench-proof-adapter.v1',
      status: 'score_claim_ready',
      runnerProofReady: true,
      proofAdapterReady: true,
      privateScoreSummary: {
        baseline: { scenarioScore: 0.6408 },
        candidate: { scenarioScore: 0.67 },
        comparison: { candidateMinusBaseline: 0.0292, candidateBeatsBaseline: true },
        scoreClaimAllowed: true,
      },
      repeatedStability: { pass: true, completedSeeds: 3, requestedSeeds: [1, 2, 3] },
      wallClockStability: { pass: true, status: 'passed' },
      commands: [{ name: 'baseline' }, { name: 'candidate' }],
      artifacts: [{ artifactType: 'score_report' }],
      promotionDossier: {
        status: 'score_claim_ready',
        scoreClaimAllowed: true,
        public_ready: false,
        network_absorbable: false,
        blockers: [],
      },
    };

    const reply = renderSparkQaAutoloopRound({ ok: true, proofRan: true, report });

    assert.match(reply, /Startup Bench cleared the local benchmark-backed score claim/);
    assert.match(reply, /Private runner movement was 0.641 -> 0.67/);
    assert.match(reply, /Wall-clock stability has a matching elapsed fresh-run window/);
    assert.match(reply, /Public\/network promotion is still separate/);
    assert.doesNotMatch(reply, /would not claim an upgrade yet/);
    assert.doesNotMatch(reply, /public ready|network approved|network_absorbable=true/);
  });

  await test('blocks nested autoloop runs inside replay probes', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldNested = process.env.SPARK_QA_OPERATOR_IN_AUTOLOOP;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_IN_AUTOLOOP = '1';
      const result = await runSparkQaAutoloopRound();
      assert.equal(result.ok, false);
      assert.equal(result.proofRan, false);
      assert.match(renderSparkQaAutoloopRound(result), /nested proof/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldNested === undefined) delete process.env.SPARK_QA_OPERATOR_IN_AUTOLOOP;
      else process.env.SPARK_QA_OPERATOR_IN_AUTOLOOP = oldNested;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('refuses stale or hash-mismatched latest proof instead of reusing cached numbers', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      writeLatestProof(repo, blockedReport('2020-01-01T00:00:00Z'));
      const stale = await readLatestSparkQaAutoloopRound();
      assert.equal(stale.ok, false);
      assert.match(renderSparkQaAutoloopRound(stale), /stale/);

      writeLatestProof(repo, blockedReport(), 'not-the-real-hash');
      const mismatch = await readLatestSparkQaAutoloopRound();
      assert.equal(mismatch.ok, false);
      assert.match(renderSparkQaAutoloopRound(mismatch), /hash does not match/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('refuses latest proof that predates the selected benchmark job binding', async () => {
    const repo = makeFakeSparkQaRepo();
    const oldRepo = process.env.SPARK_QA_OPERATOR_REPO;
    const oldPython = process.env.SPARK_QA_OPERATOR_PYTHON;
    try {
      process.env.SPARK_QA_OPERATOR_REPO = repo;
      process.env.SPARK_QA_OPERATOR_PYTHON = 'python3';
      const creator = await runSparkQaBenchmarkCreator({
        repoRoot: repo,
        specializationPath: 'Spark QA Operator',
        level: 10,
      });
      assert.equal(creator.ok, true);
      writeLatestProof(repo, {
        ...blockedReport(),
        inputs: {
          casesPath: '/tmp/old-pack.json',
          benchmarkPack: {
            path: '/tmp/old-pack.json',
            sha256: '0'.repeat(64),
            id: 'old-pack',
          },
        },
      });

      const latest = await readLatestSparkQaAutoloopRound(repo);
      assert.equal(latest.ok, false);
      assert.match(renderSparkQaAutoloopRound(latest), /different benchmark pack/);
    } finally {
      if (oldRepo === undefined) delete process.env.SPARK_QA_OPERATOR_REPO;
      else process.env.SPARK_QA_OPERATOR_REPO = oldRepo;
      if (oldPython === undefined) delete process.env.SPARK_QA_OPERATOR_PYTHON;
      else process.env.SPARK_QA_OPERATOR_PYTHON = oldPython;
      rmSync(repo, { recursive: true, force: true });
    }
  });

  await test('renders benchmark creator levels as private gated packets', () => {
    const reply = renderSparkQaBenchmarkCreator({
      ok: true,
      level: 10,
      specializationPath: 'Spark QA Operator',
      payload: {
        prd: {
          benchmarkLevel: {
            name: 'lab_swarm_research',
            timeBudget: 'hours to days',
            canvasKanban: true,
          },
        },
        quality: {
          qualityScore: 1.0,
        },
        paths: {
          artifactManifest: '/tmp/artifact_manifest.json',
        },
      },
    });
    assert.match(reply, /level 10/);
    assert.match(reply, /lab swarm research/);
    assert.match(reply, /Benchmark quality is 1/);
    assert.match(reply, /Canvas\/Kanban tracking is included/);
    assert.match(reply, /quality report/);
    assert.match(reply, /local\/private/);
    assert.match(reply, /promotion gates/);
    assert.match(reply, /not an agent score/);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
