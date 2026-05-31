import {
  authorizeToolCallFromEnvelope,
  type ToolAuthorizationInput,
  type ToolAuthorizationResult,
  type TurnIntentEnvelopeV1
} from './harnessContract';
import { evaluateDeterministicRoute, type DeterministicRouteId, type RouteFirewallVerdict } from './routeFirewall';

export interface TelegramActionAuthorityInput extends ToolAuthorizationInput {
  route: DeterministicRouteId;
  text: string;
}

export interface TelegramActionAuthorityResult {
  allow: boolean;
  routeVerdict: RouteFirewallVerdict;
  toolAuthorization: ToolAuthorizationResult;
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
  const reasonCodes = [
    ...(routeVerdict.allow ? [] : [`route_firewall:${routeVerdict.reason}`]),
    ...toolAuthorization.reasonCodes
  ];

  return {
    allow: routeVerdict.allow && toolAuthorization.verdict === 'allowed',
    routeVerdict,
    toolAuthorization,
    reasonCodes
  };
}
