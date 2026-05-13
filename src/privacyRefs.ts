import { createHash } from 'node:crypto';

function safeKind(kind: string): string {
  return kind.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '_') || 'entity';
}

export function redactedEntityRef(
  kind: string,
  value: string | number | null | undefined,
  fallback = 'unknown'
): string {
  const text = String(value ?? '').trim();
  if (!text) return fallback;
  const hash = createHash('sha256').update(text).digest('hex').slice(0, 12);
  return `${safeKind(kind)}:sha256:${hash}`;
}
