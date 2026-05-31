import type {
  SparkHarnessMutationClass,
  ToolAuthorizationInput,
  ToolAuthorizationResult,
  TurnIntentEnvelopeV1
} from './harnessContract';

export type HarnessCoreSchemaVersion = 'turn-intent-envelope-vnext';
export type HarnessCoreAuthorizationSchemaVersion = 'authorization-decision-v1';
export type HarnessCoreToolLedgerSchemaVersion = 'tool-call-ledger-v1';

export type HarnessCoreSurface =
  | 'telegram'
  | 'cli'
  | 'builder'
  | 'spawner'
  | 'memory'
  | 'startup_operator'
  | 'recursive_swarm'
  | 'voice'
  | 'domain_chip'
  | 'browser'
  | 'computer_use'
  | 'api'
  | 'test_harness'
  | 'future_surface';

export type HarnessCoreMoveType =
  | 'chat_explain'
  | 'chat_plan'
  | 'chat_compare'
  | 'chat_score'
  | 'chat_draft_text'
  | 'read_current_state'
  | 'prepare_action'
  | 'confirm_action'
  | 'execute_action';

export type HarnessCoreRiskTier = 'none' | 'read' | 'low' | 'medium' | 'high' | 'critical';
export type HarnessCoreAuthorityState =
  | 'none'
  | 'chat_only'
  | 'read_only'
  | 'prepare_allowed'
  | 'confirmation_required'
  | 'executable'
  | 'blocked';
export type HarnessCoreRedactionClass = 'public' | 'internal' | 'private' | 'secret' | 'metadata_only' | 'redacted';
export type HarnessCoreActionType =
  | 'read'
  | 'write_memory'
  | 'edit_file'
  | 'run_command'
  | 'launch_mission'
  | 'open_pr'
  | 'publish'
  | 'deploy'
  | 'schedule'
  | 'create_domain_chip'
  | 'send_message'
  | 'external_api_call'
  | 'browser_action'
  | 'computer_action';

export interface HarnessCoreTraceRef {
  id: string;
  href?: string;
  redaction_class: HarnessCoreRedactionClass;
  summary: string;
}

export interface HarnessCoreArtifactRef {
  id: string;
  kind: string;
  path_or_uri: string;
  sha256?: string;
  redaction_class: HarnessCoreRedactionClass;
  summary: string;
}

export interface HarnessCoreEvidenceRef {
  id: string;
  kind:
    | 'fresh_user_intent'
    | 'quoted_language'
    | 'meta_language'
    | 'negative_intent'
    | 'positive_command'
    | 'memory'
    | 'pending_state'
    | 'route_candidate'
    | 'tool_result'
    | 'runtime_state'
    | 'test_result'
    | 'human_confirmation'
    | 'surface_signal'
    | 'policy';
  source: string;
  summary: string;
  confidence: number;
  trace_refs: HarnessCoreTraceRef[];
}

export interface HarnessCoreProposedAction {
  action_id: string;
  capability_id: string;
  action_type: HarnessCoreActionType;
  risk_tier: HarnessCoreRiskTier;
  summary: string;
  args_ref: HarnessCoreArtifactRef;
  requires_confirmation: boolean;
}

export interface TurnIntentEnvelopeVNext {
  schema_version: HarnessCoreSchemaVersion;
  turn_id: string;
  created_at: string;
  surface: HarnessCoreSurface;
  actor: {
    kind: 'human' | 'agent' | 'system';
    id_ref: string;
    redaction_class: HarnessCoreRedactionClass;
  };
  raw_turn_ref: HarnessCoreTraceRef;
  selected_move: HarnessCoreMoveType;
  intent_summary: string;
  freshness: {
    fresh_user_intent_present: boolean;
    stale_state_used_as_authority: false;
    memory_used_as_instruction: false;
    pending_state_used_as_authority: false;
  };
  evidence: HarnessCoreEvidenceRef[];
  action_authority: {
    state: HarnessCoreAuthorityState;
    risk_tier: HarnessCoreRiskTier;
    confidence: number;
    requires_human_confirmation: boolean;
    confirmation_ref?: HarnessCoreEvidenceRef;
    reason: string;
  };
  proposed_actions: HarnessCoreProposedAction[];
  blocked_routes: Array<{
    route_id: string;
    reason: string;
    evidence?: HarnessCoreEvidenceRef;
  }>;
  context_policy: {
    raw_private_text_in_context: boolean;
    store_raw_turn: boolean;
    summary_required: boolean;
    offload_artifacts: HarnessCoreArtifactRef[];
  };
  trace: HarnessCoreTraceRef;
}

export interface AuthorizationDecisionV1 {
  schema_version: HarnessCoreAuthorizationSchemaVersion;
  decision_id: string;
  created_at: string;
  turn_id: string;
  action_id: string;
  capability_id: string;
  verdict: 'allow' | 'deny' | 'interrupt' | 'degrade';
  risk_tier: HarnessCoreRiskTier;
  reasons: string[];
  evidence: HarnessCoreEvidenceRef[];
  approval: {
    required: boolean;
    status: 'not_required' | 'requested' | 'approved' | 'denied' | 'expired';
    approval_ref?: HarnessCoreEvidenceRef;
  };
  restrictions: {
    max_runtime_seconds?: number;
    allowed_paths?: string[];
    denied_paths?: string[];
    network_allowed?: boolean;
    write_allowed?: boolean;
    publish_allowed?: boolean;
  };
  expires_at?: string;
  trace: HarnessCoreTraceRef;
}

export interface ToolCallLedgerV1 {
  schema_version: HarnessCoreToolLedgerSchemaVersion;
  ledger_id: string;
  created_at: string;
  turn_id: string;
  action_id: string;
  capability_id: string;
  tool_name: string;
  lifecycle: Array<{
    stage: 'propose' | 'validate' | 'authorize' | 'approve' | 'interrupt' | 'execute' | 'sanitize' | 'store' | 'summarize' | 'continue' | 'rollback' | 'fail';
    at: string;
    verdict: 'pending' | 'passed' | 'failed' | 'skipped';
    summary?: string;
  }>;
  authorization: AuthorizationDecisionV1;
  arguments: {
    schema_valid: boolean;
    raw_ref: HarnessCoreArtifactRef;
    sanitized_ref: HarnessCoreArtifactRef;
  };
  result: {
    status: 'not_started' | 'success' | 'failure' | 'partial' | 'rolled_back';
    summary: string;
    sanitized_output_ref: HarnessCoreArtifactRef;
    error_ref?: HarnessCoreArtifactRef;
    rollback_ref?: HarnessCoreArtifactRef;
  };
  trace: HarnessCoreTraceRef;
}

export interface HarnessCoreActionInput extends ToolAuthorizationInput {
  route: string;
  text: string;
}

export interface HarnessCoreAuthorizationBundle {
  envelope: TurnIntentEnvelopeVNext;
  action: HarnessCoreProposedAction;
  authorization: AuthorizationDecisionV1;
}

const RISK_ORDER: Record<HarnessCoreRiskTier, number> = {
  none: 0,
  read: 1,
  low: 2,
  medium: 3,
  high: 4,
  critical: 5
};

function nowIso(): string {
  return new Date().toISOString();
}

function safeId(prefix: string, raw: string): string {
  const normalized = raw.toLowerCase().replace(/[^a-z0-9_.:-]+/g, '-').replace(/^-+|-+$/g, '');
  const suffix = normalized || Math.random().toString(16).slice(2, 14);
  const id = suffix.startsWith(`${prefix}:`) || suffix.startsWith(`${prefix}_`) ? suffix : `${prefix}:${suffix}`;
  return id.slice(0, 128);
}

function confidenceValue(envelope: TurnIntentEnvelopeV1): number {
  switch (envelope.selectedIntent.confidence) {
    case 'explicit':
      return 0.95;
    case 'contextual':
      return 0.72;
    case 'ambiguous':
      return 0.42;
    case 'blocked':
      return 0;
    default:
      return 0.5;
  }
}

function traceRef(id: string, summary: string, redaction_class: HarnessCoreRedactionClass = 'metadata_only'): HarnessCoreTraceRef {
  return {
    id: safeId('trace', id),
    redaction_class,
    summary
  };
}

function artifactRef(id: string, kind: string, path_or_uri: string, summary: string): HarnessCoreArtifactRef {
  return {
    id: safeId('artifact', id),
    kind,
    path_or_uri,
    redaction_class: 'metadata_only',
    summary
  };
}

function evidenceRef(
  id: string,
  kind: HarnessCoreEvidenceRef['kind'],
  source: string,
  summary: string,
  confidence: number,
  trace_refs: HarnessCoreTraceRef[] = []
): HarnessCoreEvidenceRef {
  return {
    id: safeId('evidence', id),
    kind,
    source,
    summary,
    confidence,
    trace_refs
  };
}

function capabilityIdForAction(action: HarnessCoreActionInput): string {
  const owner = String(action.ownerSystem || 'unknown').replace(/[^a-zA-Z0-9_.:-]+/g, '-').toLowerCase();
  const tool = action.toolName.replace(/[^a-zA-Z0-9_.:-]+/g, '-').toLowerCase();
  return safeId('capability', `${owner}:${tool}`);
}

function actionTypeForMutation(action: HarnessCoreActionInput): HarnessCoreActionType {
  if (action.publishes) return 'publish';
  switch (action.mutationClass) {
    case 'none':
    case 'read_only':
      return 'read';
    case 'writes_memory':
      return 'write_memory';
    case 'writes_files':
      return 'edit_file';
    case 'launches_mission':
      return 'launch_mission';
    case 'creates_schedule':
    case 'deletes_schedule':
      return 'schedule';
    case 'creates_chip':
      return 'create_domain_chip';
    case 'publishes':
      return 'publish';
    case 'external_network':
      return 'external_api_call';
    default:
      return 'run_command';
  }
}

function riskTierForAction(action: HarnessCoreActionInput): HarnessCoreRiskTier {
  if (action.publishes || action.mutationClass === 'publishes') return 'high';
  if (action.externalNetwork || action.mutationClass === 'external_network') return 'medium';
  switch (action.mutationClass) {
    case 'none':
      return 'none';
    case 'read_only':
      return 'read';
    case 'writes_memory':
      return 'low';
    case 'writes_files':
    case 'launches_mission':
    case 'creates_schedule':
    case 'deletes_schedule':
    case 'creates_chip':
      return 'medium';
    default:
      return 'medium';
  }
}

function moveForEnvelope(
  envelope: TurnIntentEnvelopeV1,
  action: HarnessCoreActionInput | null,
  legacyAllowed: boolean,
  riskTier: HarnessCoreRiskTier
): HarnessCoreMoveType {
  if (!action || envelope.directive.noExecution || !legacyAllowed) {
    if (envelope.directive.mode === 'plan') return 'chat_plan';
    if (envelope.directive.mode === 'inspect') return 'read_current_state';
    return 'chat_explain';
  }
  if (RISK_ORDER[riskTier] >= RISK_ORDER.high) return 'confirm_action';
  if (action.mutationClass === 'none' || action.mutationClass === 'read_only') return 'read_current_state';
  return 'execute_action';
}

function authorityStateForMove(move: HarnessCoreMoveType): HarnessCoreAuthorityState {
  if (move.startsWith('chat_')) return 'chat_only';
  if (move === 'read_current_state') return 'read_only';
  if (move === 'prepare_action') return 'prepare_allowed';
  if (move === 'confirm_action') return 'confirmation_required';
  if (move === 'execute_action') return 'executable';
  return 'none';
}

function routeEvidence(envelope: TurnIntentEnvelopeV1): HarnessCoreEvidenceRef[] {
  const confidence = confidenceValue(envelope);
  const trace = traceRef(envelope.traceId, 'Telegram TurnIntent V1 trace evidence.');
  const evidence: HarnessCoreEvidenceRef[] = [
    evidenceRef(
      `${envelope.turnId}:fresh`,
      'fresh_user_intent',
      'spark-telegram-bot',
      `Fresh Telegram turn selected ${envelope.selectedIntent.kind}/${envelope.selectedIntent.action || envelope.directive.mode}.`,
      confidence,
      [trace]
    ),
    evidenceRef(
      `${envelope.turnId}:route`,
      'route_candidate',
      String(envelope.selectedIntent.ownerSystem || 'spark-telegram-bot'),
      `Route candidate ${envelope.selectedIntent.kind} from ${envelope.selectedIntent.source}.`,
      confidence,
      [trace]
    )
  ];
  if (envelope.directive.quotedOrMetaLanguage) {
    evidence.push(evidenceRef(`${envelope.turnId}:meta`, 'meta_language', 'spark-telegram-bot', 'Turn contains quoted or meta-language action words.', 0.95, [trace]));
  }
  if (envelope.directive.noExecution) {
    evidence.push(evidenceRef(`${envelope.turnId}:negative`, 'negative_intent', 'spark-telegram-bot', 'Fresh turn blocks execution authority.', 0.98, [trace]));
  }
  if (envelope.contextRefs.memoryRefs.length) {
    evidence.push(evidenceRef(`${envelope.turnId}:memory`, 'memory', 'domain-chip-memory', 'Memory refs are evidence only.', 0.7, [trace]));
  }
  if (envelope.contextRefs.pendingState) {
    evidence.push(evidenceRef(`${envelope.turnId}:pending`, 'pending_state', 'spark-telegram-bot', 'Pending state is scoped as evidence only.', 0.7, [trace]));
  }
  return evidence;
}

export function buildHarnessCoreAction(input: HarnessCoreActionInput, turnId: string): HarnessCoreProposedAction {
  const actionType = actionTypeForMutation(input);
  const riskTier = riskTierForAction(input);
  return {
    action_id: safeId('action', `${turnId}:${input.route}:${input.toolName}`),
    capability_id: capabilityIdForAction(input),
    action_type: actionType,
    risk_tier: riskTier,
    summary: `Telegram proposed ${actionType} via ${input.toolName} for route ${input.route}.`,
    args_ref: artifactRef(`${turnId}:args:${input.toolName}`, 'tool_args', `telegram://turns/${encodeURIComponent(turnId)}/actions/${encodeURIComponent(input.toolName)}`, 'Telegram action arguments are retained by the surface adapter.'),
    requires_confirmation: RISK_ORDER[riskTier] >= RISK_ORDER.high
  };
}

export function buildTurnIntentEnvelopeVNextFromTelegram(
  envelope: TurnIntentEnvelopeV1,
  action: HarnessCoreActionInput | null = null,
  legacyAllowed = false
): TurnIntentEnvelopeVNext {
  const riskTier = action ? riskTierForAction(action) : envelope.executionPolicy.canLaunchMission ? 'medium' : 'none';
  const move = moveForEnvelope(envelope, action, legacyAllowed, riskTier);
  const proposedAction = action && !move.startsWith('chat_')
    ? buildHarnessCoreAction(action, envelope.turnId)
    : null;
  const evidence = routeEvidence(envelope);
  const authorityState = authorityStateForMove(move);

  return {
    schema_version: 'turn-intent-envelope-vnext',
    turn_id: safeId('turn', envelope.turnId),
    created_at: nowIso(),
    surface: 'telegram',
    actor: {
      kind: 'human',
      id_ref: envelope.user.userRef,
      redaction_class: 'metadata_only'
    },
    raw_turn_ref: traceRef(envelope.traceId, `Telegram turn summary: ${envelope.selectedIntent.kind}/${envelope.selectedIntent.action || envelope.directive.mode}.`, 'private'),
    selected_move: move,
    intent_summary: `Telegram selected ${move} for ${envelope.selectedIntent.kind}; route evidence remains subordinate to fresh user intent.`,
    freshness: {
      fresh_user_intent_present: true,
      stale_state_used_as_authority: false,
      memory_used_as_instruction: false,
      pending_state_used_as_authority: false
    },
    evidence,
    action_authority: {
      state: authorityState,
      risk_tier: riskTier,
      confidence: confidenceValue(envelope),
      requires_human_confirmation: authorityState === 'confirmation_required',
      reason: authorityState === 'executable'
        ? 'Fresh Telegram intent and legacy route evidence authorize execution through Harness Core.'
        : 'Telegram route evidence does not grant direct execution authority.'
    },
    proposed_actions: proposedAction ? [proposedAction] : [],
    blocked_routes: envelope.blockedCandidates.map((blocked, index) => ({
      route_id: safeId('route', `${blocked.route}:${index}`),
      reason: blocked.reason,
      evidence: evidenceRef(`${envelope.turnId}:blocked:${index}`, 'route_candidate', String(blocked.ownerSystem), blocked.reason, 0.85)
    })),
    context_policy: {
      raw_private_text_in_context: false,
      store_raw_turn: false,
      summary_required: true,
      offload_artifacts: []
    },
    trace: traceRef(envelope.traceId, 'Harness Core VNext envelope derived from Telegram evidence.')
  };
}

export function authorizeHarnessCoreAction(
  envelope: TurnIntentEnvelopeVNext,
  action: HarnessCoreProposedAction,
  input: HarnessCoreActionInput,
  legacyAuthorization: ToolAuthorizationResult,
  routeAllowed: boolean
): AuthorizationDecisionV1 {
  const highRisk = RISK_ORDER[action.risk_tier] >= RISK_ORDER.high;
  let verdict: AuthorizationDecisionV1['verdict'] = 'allow';
  const reasons: string[] = [];
  if (!routeAllowed) {
    verdict = 'deny';
    reasons.push('route_evidence_rejected');
  }
  if (legacyAuthorization.verdict !== 'allowed') {
    verdict = 'deny';
    reasons.push(...legacyAuthorization.reasonCodes);
  }
  if (envelope.action_authority.state !== 'executable') {
    verdict = envelope.action_authority.state === 'confirmation_required' ? 'interrupt' : 'deny';
    reasons.push(`authority_state_${envelope.action_authority.state}`);
  }
  if (highRisk && verdict === 'allow') {
    verdict = 'interrupt';
    reasons.push('explicit_approval_required_for_high_risk_action');
  }

  const approvalRequired = verdict === 'interrupt' || highRisk;
  return {
    schema_version: 'authorization-decision-v1',
    decision_id: safeId('decision', `${envelope.turn_id}:${action.action_id}`),
    created_at: nowIso(),
    turn_id: envelope.turn_id,
    action_id: action.action_id,
    capability_id: action.capability_id,
    verdict,
    risk_tier: action.risk_tier,
    reasons: reasons.length ? reasons : ['harness_core_authorized'],
    evidence: envelope.evidence,
    approval: {
      required: approvalRequired,
      status: approvalRequired ? 'requested' : 'not_required'
    },
    restrictions: {
      network_allowed: Boolean(input.externalNetwork) && verdict === 'allow',
      write_allowed: ['writes_files', 'writes_memory', 'creates_chip', 'creates_schedule', 'deletes_schedule'].includes(input.mutationClass) && verdict === 'allow',
      publish_allowed: Boolean(input.publishes) && verdict === 'allow'
    },
    trace: traceRef(envelope.trace.id, 'Harness Core authorization decision for Telegram action.')
  };
}

export function authorizeHarnessCoreTelegramAction(
  legacyEnvelope: TurnIntentEnvelopeV1,
  input: HarnessCoreActionInput,
  legacyAuthorization: ToolAuthorizationResult,
  routeAllowed: boolean
): HarnessCoreAuthorizationBundle {
  const legacyAllowed = routeAllowed && legacyAuthorization.verdict === 'allowed';
  const envelope = buildTurnIntentEnvelopeVNextFromTelegram(legacyEnvelope, input, legacyAllowed);
  const action = envelope.proposed_actions[0] || buildHarnessCoreAction(input, legacyEnvelope.turnId);
  const authorization = authorizeHarnessCoreAction(envelope, action, input, legacyAuthorization, routeAllowed);
  return { envelope, action, authorization };
}

export function recordHarnessCoreToolLedger(input: {
  envelope: TurnIntentEnvelopeVNext;
  action: HarnessCoreProposedAction;
  authorization: AuthorizationDecisionV1;
  toolName: string;
  status: ToolCallLedgerV1['result']['status'];
  summary: string;
}): ToolCallLedgerV1 {
  const createdAt = nowIso();
  const executeVerdict = input.status === 'success' ? 'passed' : input.status === 'not_started' ? 'skipped' : 'failed';
  return {
    schema_version: 'tool-call-ledger-v1',
    ledger_id: safeId('ledger', `${input.envelope.turn_id}:${input.action.action_id}:${input.toolName}`),
    created_at: createdAt,
    turn_id: input.envelope.turn_id,
    action_id: input.action.action_id,
    capability_id: input.action.capability_id,
    tool_name: input.toolName,
    lifecycle: [
      { stage: 'propose', at: input.envelope.created_at, verdict: 'passed', summary: 'Action was proposed through Harness Core evidence.' },
      { stage: 'authorize', at: input.authorization.created_at, verdict: input.authorization.verdict === 'allow' ? 'passed' : 'failed', summary: input.authorization.reasons.join(', ') },
      { stage: 'execute', at: createdAt, verdict: executeVerdict, summary: input.summary }
    ],
    authorization: input.authorization,
    arguments: {
      schema_valid: true,
      raw_ref: input.action.args_ref,
      sanitized_ref: input.action.args_ref
    },
    result: {
      status: input.status,
      summary: input.summary,
      sanitized_output_ref: artifactRef(`${input.envelope.turn_id}:result:${input.toolName}`, 'tool_output', `telegram://turns/${encodeURIComponent(input.envelope.turn_id)}/tool-output/${encodeURIComponent(input.toolName)}`, input.summary)
    },
    trace: traceRef(input.envelope.trace.id, 'Harness Core tool ledger for Telegram action.')
  };
}

