import { readJsonFile, resolveStatePath, writeJsonAtomic } from './jsonState';

export interface NoEditProbeMission {
  missionId: string;
  requestedPhrase: string;
  startedAt: string;
}

interface NoEditProbeStoreSnapshot {
  latestByKey?: Record<string, NoEditProbeMission>;
}

const STATE_PATH = resolveStatePath('.spark-no-edit-probe-missions.json');

function normalizeMission(value: unknown): NoEditProbeMission | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const missionId = String(record.missionId || '').trim();
  const requestedPhrase = String(record.requestedPhrase || '').trim();
  const startedAt = String(record.startedAt || '').trim();
  if (!missionId || !requestedPhrase || !startedAt) {
    return null;
  }
  return { missionId, requestedPhrase, startedAt };
}

async function readSnapshot(): Promise<NoEditProbeStoreSnapshot> {
  const snapshot = await readJsonFile<NoEditProbeStoreSnapshot>(STATE_PATH);
  const latestByKey: Record<string, NoEditProbeMission> = {};
  for (const [key, value] of Object.entries(snapshot?.latestByKey || {})) {
    const normalized = normalizeMission(value);
    if (key && normalized) {
      latestByKey[key] = normalized;
    }
  }
  return { latestByKey };
}

export async function storeNoEditProbeMission(key: string, mission: NoEditProbeMission): Promise<void> {
  const normalizedKey = String(key || '').trim();
  const normalizedMission = normalizeMission(mission);
  if (!normalizedKey || !normalizedMission) {
    return;
  }
  const snapshot = await readSnapshot();
  await writeJsonAtomic(STATE_PATH, {
    ...snapshot,
    latestByKey: {
      ...(snapshot.latestByKey || {}),
      [normalizedKey]: normalizedMission,
    },
  });
}

export async function readNoEditProbeMission(key: string): Promise<NoEditProbeMission | null> {
  const normalizedKey = String(key || '').trim();
  if (!normalizedKey) {
    return null;
  }
  const snapshot = await readSnapshot();
  return snapshot.latestByKey?.[normalizedKey] || null;
}
