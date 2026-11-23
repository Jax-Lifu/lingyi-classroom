import { expect, it } from "vitest";
import type { KeyValueStore } from "./platform";
import { changeLearningStamps, LearningStampsWereReset, learningStampVersion, readLearningStamps, resetLearningStamps } from "./learningStamps";

it("orders desktop reset and retry across views without replacing the legacy stamp array", async () => {
  let value: unknown = ["old"];
  const store: KeyValueStore = {
    get: async <T>() => value as T,
    set: async (_key, next) => { value = next; },
    reset: async (_key, next) => { value = next; },
  };
  const oldVersion = learningStampVersion(store);
  const reset = resetLearningStamps(store);
  const staleRetry = changeLearningStamps(store, ["old"], true, oldVersion);
  await reset;
  await expect(staleRetry).rejects.toBeInstanceOf(LearningStampsWereReset);
  expect(await readLearningStamps(store)).toEqual([]);
  await changeLearningStamps(store, ["new"], true, learningStampVersion(store));
  expect(value).toEqual(["new"]);
});
