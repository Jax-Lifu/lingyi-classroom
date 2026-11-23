import type { KeyValueStore } from "./platform";

export const learningStampKey = "learning.practice.v1";

function stampIds(value: unknown): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("Invalid learning stamp record");
  return value.filter((id): id is string => typeof id === "string");
}

export async function readLearningStamps(store: KeyValueStore) {
  return ordered(store, async () => stampIds(await store.get(learningStampKey)));
}

// Keep pending desktop writes ordered across navigation, including a subsequent reset.
const pending = new WeakMap<KeyValueStore, Promise<unknown>>();
function ordered<T>(store: KeyValueStore, task: () => Promise<T>): Promise<T> {
  const next = (pending.get(store) ?? Promise.resolve()).then(task, task);
  pending.set(store, next.then(() => {}, () => {}));
  return next;
}

const localResetVersions = new WeakMap<KeyValueStore, number>();
export function learningStampVersion(store: KeyValueStore) {
  return store.resetVersion?.(learningStampKey) ?? localResetVersions.get(store) ?? 0;
}
export class LearningStampsWereReset extends Error {}

export function changeLearningStamps(store: KeyValueStore, ids: readonly string[], learned: boolean, version?: number) {
  const change = (previous: unknown) => {
    // This check runs inside the same storage lock as the edit, even for a delayed retry.
    if (version !== undefined && version !== learningStampVersion(store)) throw new LearningStampsWereReset();
    const stamps = new Set(stampIds(previous));
    for (const id of ids) {
      if (learned) stamps.add(id);
      else stamps.delete(id);
    }
    return [...stamps];
  };
  return ordered(store, async () => {
    if (store.update) return store.update(learningStampKey, change);
    const next = change(await store.get(learningStampKey));
    await store.set(learningStampKey, next);
    return next;
  });
}

export function resetLearningStamps(store: KeyValueStore) {
  return ordered(store, async () => {
    if (!store.reset) throw new Error("Learning stamp backup unavailable");
    await store.reset(learningStampKey, []);
    if (!store.resetVersion) localResetVersions.set(store, learningStampVersion(store) + 1);
  });
}
