import {
  authorizeToolCallFromEnvelope,
  type ToolAuthorizationInput,
  type ToolAuthorizationResult,
  type TurnIntentEnvelopeV1
} from './harnessContract';
import {
  authorizeHarnessCoreTelegramAction,
  type AuthorizationDecisionV1,
  type GovernorDecisionV1,
  type HarnessCoreProposedAction,
  type ToolCallLedgerV1,
  type TurnIntentEnvelopeVNext
} from './harnessCoreVNext';
import { createHarnessCoreGovernorDecision } from '@spark/harness-core';
import { recordHarnessCoreAuthorizationLedger } from './harnessCoreLedger';
import { evaluateDeterministicRoute, type DeterministicRouteId, type RouteFirewallVerdict } from './routeFirewall';

export interface TelegramActionAuthorityInput extends ToolAuthorizationInput {
  route: DeterministicRouteId;
  text: string;
}

export interface TelegramActionAuthorityResult {
  allow: boolean;
  routeVerdict: RouteFirewallVerdict;
  toolAuthorization: ToolAuthorizationResult;
  harnessCore?: {
    envelope: TurnIntentEnvelopeVNext;
    action: HarnessCoreProposedAction;
    authorization: AuthorizationDecisionV1;
  };
  harnessCoreLedger?: ToolCallLedgerV1;
  governorDecision?: GovernorDecisionV1;
  reasonCodes: string[];
}

export function authorizeTelegramActionFromEnvelope(
  envelope: TurnIntentEnvelopeV1 | null | undefined,
  input: TelegramActionAuthorityInput
): TelegramActionAuthorityResult {
  const routeVerdict = evaluateDeterministicRoute(input.route, input.text);
  const toolAuthorization = authorizeToolCallFromEnvelope(envelope, {
    toolName: input.toolName,
    ownerSystem: input.ownerSystem,
    mutationClass: input.mutationClass,
    publishes: input.publishes,
    externalNetwork: input.externalNetwork
  });
  const harnessCore = envelope
    ? authorizeHarnessCoreTelegramAction(
        envelope,
        input,
        toolAuthorization,
        routeVerdict.allow
      )
    : null;
  const preliminaryAllow = routeVerdict.allow && toolAuthorization.verdict === 'allowed' && harnessCore?.authorization.verdict === 'allow';
  const harnessCoreLedger = harnessCore
    ? recordHarnessCoreAuthorizationLedger({
        bundle: harnessCore,
        toolName: input.toolName,
        allowed: preliminaryAllow
      })
    : null;
  const governorDecision = harnessCore
    ? createHarnessCoreGovernorDecision({
        envelope: harnessCore.envelope,
        authorizations: [harnessCore.authorization],
        tool_ledgers: harnessCoreLedger ? [harnessCoreLedger] : []
      })
    : null;
  const allow = Boolean(
    governorDecision &&
    ['execute', 'read_only', 'prepare'].includes(governorDecision.outcome)
  );
  const reasonCodes = [
    ...(routeVerdict.allow ? [] : [`route_firewall:${routeVerdict.reason}`]),
    ...toolAuthorization.reasonCodes,
    ...(harnessCore && harnessCore.authorization.verdict !== 'allow'
      ? harnessCore.authorization.reasons.map((reason) => `harness_core:${reason}`)
      : []),
    ...(harnessCore ? [] : ['harness_core:missing_or_invalid_envelope'])
  ];

  return {
    allow,
    routeVerdict,
    toolAuthorization,
    ...(harnessCore ? { harnessCore } : {}),
    ...(harnessCoreLedger ? { harnessCoreLedger } : {}),
    ...(governorDecision ? { governorDecision } : {}),
    reasonCodes
  };
}
