import { queueRouteArbiterShadow } from './routeArbiter';
import { evaluateDeterministicRoute, type DeterministicRouteId } from './routeFirewall';

export function routeEvidenceAllowed(input: {
  route: DeterministicRouteId;
  text: string;
  profile?: string | null;
}): boolean {
  const verdict = evaluateDeterministicRoute(input.route, input.text);
  queueRouteArbiterShadow({
    route: input.route,
    text: input.text,
    verdict,
    profile: input.profile
  });
  if (!verdict.allow) {
    console.log(`[RouteEvidence] blocked route=${input.route} reason=${verdict.reason} textLen=${input.text.length}`);
  }
  return verdict.allow;
}
