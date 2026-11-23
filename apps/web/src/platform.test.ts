import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { changeLearningStamps, LearningStampsWereReset, learningStampVersion, learningStampKey, resetLearningStamps } from "@lingyi-classroom/shared";
import { webPlatform } from "./platform";

beforeEach(() => localStorage.clear());
afterEach(() => vi.unstubAllEnvs());

describe("web platform", () => {
  it("keeps old learning progress until the renamed app saves its own record", async () => {
    const key = "learning.practice.v1";
    const oldKey = `app:com.sensen.workbook:${key}`;
    localStorage.setItem(oldKey, JSON.stringify(["one"]));
    vi.stubEnv("VITE_APP_IDENTIFIER", "com.lingyi.classroom");
    vi.resetModules();
    const { store } = (await import("./platform")).webPlatform;
    expect(await store.get(key)).toEqual(["one"]);
    await store.set(key, ["one", "two"]);
    expect(await store.get(key)).toEqual(["one", "two"]);
    expect(JSON.parse(localStorage.getItem(oldKey)!)).toEqual(["one"]);
  });

  it("isolates applications on the same origin and preserves legacy settings", async () => {
    localStorage.setItem("app:settings", JSON.stringify({ theme: "light" }));
    vi.stubEnv("VITE_APP_IDENTIFIER", "com.team.first");
    vi.resetModules();
    const first = (await import("./platform")).webPlatform;
    expect(await first.store.get("settings")).toBeUndefined();
    await first.store.set("settings", { theme: "dark" });
    vi.stubEnv("VITE_APP_IDENTIFIER", "com.team.second");
    vi.resetModules();
    const second = (await import("./platform")).webPlatform;
    expect(await second.store.get("settings")).toBeUndefined();
    await second.store.set("settings", { theme: "system" });
    expect(await first.store.get("settings")).toEqual({ theme: "dark" });
    expect(await second.store.get("settings")).toEqual({ theme: "system" });
    expect(localStorage.getItem("app:settings")).toBe('{"theme":"light"}');
  });

  it("persists settings and reports malformed storage without overwriting it", async () => {
    expect(await webPlatform.store.get("settings")).toBeUndefined();
    await webPlatform.store.set("settings", { theme: "dark" });
    expect(await webPlatform.store.get("settings")).toEqual({ theme: "dark" });
    const key = `app:${import.meta.env.VITE_APP_IDENTIFIER}:settings`;
    for (const invalid of ["broken", "null"]) {
      localStorage.setItem(key, invalid);
      await expect(webPlatform.store.get("settings")).rejects.toThrow();
      expect(localStorage.getItem(key)).toBe(invalid);
    }
    Object.defineProperty(navigator, "locks", { configurable: true, value: {
      request: (_key: string, edit: () => unknown) => Promise.resolve().then(edit),
    } });
    try {
      await webPlatform.store.reset?.("settings", { theme: "system" });
    } finally { Reflect.deleteProperty(navigator, "locks"); }
    expect(await webPlatform.store.get("settings")).toEqual({ theme: "system" });
    const backupKey = Object.keys(localStorage).find((entry) => entry.startsWith(`${key}:backup-`));
    expect(backupKey).toBeDefined();
    expect(localStorage.getItem(backupKey!)).toBe("null");
  });

  it("applies individual stamp edits after a reset and preserves data if the backup fails", async () => {
    const request = vi.fn((_key: string, edit: () => unknown) => Promise.resolve().then(edit));
    Object.defineProperty(navigator, "locks", { configurable: true, value: { request } });
    const store = webPlatform.store;
    try {
      await changeLearningStamps(store, ["old"], true);
      await resetLearningStamps(store);
      await Promise.all([changeLearningStamps(store, ["a"], true), changeLearningStamps(store, ["b"], true)]);
      expect(await store.get(learningStampKey)).toEqual(["a", "b"]);
      const backup = Object.keys(localStorage).find((key) => key.includes(learningStampKey + ":backup-"));
      expect(JSON.parse(localStorage.getItem(backup!)!)).toEqual(["old"]);
      const write = Storage.prototype.setItem;
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
        if (key.includes(":backup-")) throw new Error("Quota");
        write.call(this, key, value);
      });
      await expect(resetLearningStamps(store)).rejects.toThrow("Quota");
      expect(await store.get(learningStampKey)).toEqual(["a", "b"]);
      expect(new Set(request.mock.calls.map(([key]) => key)).size).toBe(1);
    } finally {
      vi.restoreAllMocks();
      Reflect.deleteProperty(navigator, "locks");
    }
  });

  it("invalidates an old retry even if the pre-reset record was empty", async () => {
    Object.defineProperty(navigator, "locks", { configurable: true,
      value: { request: (_key: string, run: () => unknown) => Promise.resolve().then(run) } });
    const store = webPlatform.store;
    try {
      const previous = learningStampVersion(store);
      await store.set(learningStampKey, []);
      await resetLearningStamps(store);
      const current = learningStampVersion(store);
      expect(current).not.toBe(previous);
      await expect(changeLearningStamps(store, ["old"], true, previous)).rejects.toBeInstanceOf(LearningStampsWereReset);
      await changeLearningStamps(store, ["new"], true, current);
      expect(await store.get(learningStampKey)).toEqual(["new"]);

      const write = Storage.prototype.setItem;
      vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
        if (key.endsWith(":" + learningStampKey)) throw new Error("Could not clear");
        write.call(this, key, value);
      });
      await expect(resetLearningStamps(store)).rejects.toThrow("Could not clear");
      expect(learningStampVersion(store)).toBe(current);
      expect(await store.get(learningStampKey)).toEqual(["new"]);
    } finally {
      vi.restoreAllMocks();
      Reflect.deleteProperty(navigator, "locks");
    }
  });

  it("does not expose desktop capabilities", () => {
    expect(webPlatform.setAutostart).toBeUndefined();
    expect(webPlatform.setCloseToTray).toBeUndefined();
    expect(webPlatform.checkUpdate).toBeUndefined();
  });
});
