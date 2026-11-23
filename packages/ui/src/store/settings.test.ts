import { beforeEach, describe, expect, it, vi } from "vitest";
import { defaultSettings, type Platform } from "@lingyi-classroom/shared";
import { createSettingsStore } from "./settings";
import { THEME_CACHE_KEY } from "../theme";

function platformWith(data: unknown = undefined): Platform {
  let saved = data;
  const platform: Platform = {
    name: "desktop",
    getAppVersion: async () => "0.1.0",
    store: {
      get: async <T>() => saved as T | undefined,
      set: vi.fn(async <T>(_key: string, value: T) => { saved = value; }),
    },
    setNativeTheme: vi.fn(async () => {}),
    setNativeLocale: vi.fn(async () => {}),
    setAutostart: vi.fn(async () => {}),
    setCloseToTray: vi.fn(async () => {}),
  };
  vi.spyOn(platform.store, "get");
  return platform;
}

beforeEach(() => {
  vi.stubGlobal("matchMedia", vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
  localStorage.clear();
});

describe("settings store", () => {
  it("shares initialization and does not rewrite preferences just by reading them", async () => {
    const platform = platformWith({ theme: "dark" });
    const store = createSettingsStore();
    await Promise.all([store.getState().hydrate(platform), store.getState().hydrate(platform)]);
    expect(platform.store.get).toHaveBeenCalledTimes(1);
    expect(platform.store.set).not.toHaveBeenCalled();
    expect(store.getState().settings.theme).toBe("dark");
    expect(store.getState().ready).toBe(true);
  });

  it("serializes rapid updates without dropping previous fields", async () => {
    const platform = platformWith();
    const store = createSettingsStore();
    await store.getState().hydrate(platform);
    await Promise.all([store.getState().update({ theme: "dark" }), store.getState().update({ accent: "rose" })]);
    expect(store.getState().settings).toMatchObject({ theme: "dark", accent: "rose" });
    expect(platform.store.set).toHaveBeenLastCalledWith("settings", expect.objectContaining({ theme: "dark", accent: "rose" }));
    expect(store.getState().saving).toBe(false);
  });

  it("merges Web changes against the latest stored preferences and applies changes from other tabs", async () => {
    let raw = { ...defaultSettings };
    let changed: (() => void) | undefined;
    const platform: Platform = {
      name: "web", getAppVersion: async () => "test",
      store: {
        get: async <T>() => raw as T, set: vi.fn(),
        update: async (_key, edit) => {
          const latest = edit(raw);
          raw = latest as typeof raw;
          return latest;
        },
        subscribe: (_key, listener) => { changed = listener; return () => { changed = undefined; }; },
      },
    };
    const first = createSettingsStore(), second = createSettingsStore();
    await Promise.all([first.getState().hydrate(platform), second.getState().hydrate(platform)]);
    const unsubscribe = first.getState().watch(platform);
    await first.getState().update({ reduceMotion: true });
    await second.getState().update({ fontSize: "lg" });
    expect(raw).toMatchObject({ reduceMotion: true, fontSize: "lg" });
    changed?.();
    await vi.waitFor(() => expect(first.getState().settings).toMatchObject({ reduceMotion: true, fontSize: "lg" }));
    expect(document.documentElement.dataset.fontSize).toBe("lg");
    unsubscribe();
    expect(changed).toBeUndefined();
  });

  it("restores native preferences and retains visible settings when persistence fails", async () => {
    const platform = platformWith();
    const store = createSettingsStore();
    await store.getState().hydrate(platform);
    vi.mocked(platform.store.set).mockRejectedValueOnce(new Error("Disk full"));
    await expect(store.getState().update({ theme: "dark", launchAtLogin: true })).rejects.toThrow("Disk full");
    expect(store.getState().settings).toEqual(defaultSettings);
    expect(platform.setNativeTheme).toHaveBeenLastCalledWith("system");
    expect(platform.setAutostart).toHaveBeenLastCalledWith(false);
    expect(store.getState().error?.message).toBe("Disk full");
    await store.getState().update({ accent: "green" });
    expect(store.getState().settings.accent).toBe("green");
    expect(store.getState().error).toBeNull();
  });

  it("does not persist a preference rejected by the native platform", async () => {
    const platform = platformWith();
    const store = createSettingsStore();
    await store.getState().hydrate(platform);
    vi.mocked(platform.setAutostart!).mockRejectedValueOnce(new Error("Permission denied"));
    await expect(store.getState().update({ launchAtLogin: true })).rejects.toThrow("Permission denied");
    expect(platform.store.set).not.toHaveBeenCalled();
    expect(store.getState().settings.launchAtLogin).toBe(false);
  });

  it("keeps corrupt data untouched until an explicit reset", async () => {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify({ theme: "dark" }));
    const platform = {
      ...platformWith({ theme: "invalid" }),
      getAutostart: async () => { throw new Error("Autostart query failed"); },
    };
    const store = createSettingsStore();
    await store.getState().hydrate(platform);
    expect(store.getState().ready).toBe(true);
    expect(store.getState().readFailed).toBe(true);
    expect(store.getState().error?.message).toContain("theme");
    expect(JSON.parse(localStorage.getItem(THEME_CACHE_KEY)!)).toEqual({ theme: "dark" });
    expect(platform.setCloseToTray).toHaveBeenLastCalledWith(false);
    expect(platform.store.set).not.toHaveBeenCalled();
    await expect(store.getState().update({ accent: "rose" })).rejects.toThrow("Reload or reset");
    expect(platform.store.set).not.toHaveBeenCalled();
    await store.getState().reset();
    expect(platform.store.set).toHaveBeenCalledWith("settings", defaultSettings);
    expect(platform.setCloseToTray).toHaveBeenLastCalledWith(defaultSettings.closeToTray);
    expect(store.getState().readFailed).toBe(false);
  });

  it("uses the real autostart state and does not enable it on hydration", async () => {
    const platform = { ...platformWith(), getAutostart: async () => true };
    const store = createSettingsStore();
    await store.getState().hydrate(platform);
    expect(store.getState().settings.launchAtLogin).toBe(true);
    expect(platform.setAutostart).not.toHaveBeenCalled();
  });

  it("uses explicit native reset only when the user restores defaults", async () => {
    const platform = platformWith();
    platform.store.reset = vi.fn(async () => {});
    const store = createSettingsStore();
    await store.getState().hydrate(platform);
    await store.getState().update({ theme: "dark" });
    expect(platform.store.reset).not.toHaveBeenCalled();
    expect(platform.store.set).toHaveBeenCalledTimes(1);
    await store.getState().reset();
    expect(platform.store.reset).toHaveBeenCalledWith("settings", defaultSettings);
    expect(platform.store.set).toHaveBeenCalledTimes(1);
  });

  it("preserves system theme in the cache and tolerates an unavailable cache", async () => {
    const store = createSettingsStore();
    await store.getState().hydrate(platformWith());
    expect(JSON.parse(localStorage.getItem(THEME_CACHE_KEY)!)).toMatchObject({ theme: "system" });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("Blocked"); });
    const blocked = createSettingsStore();
    await blocked.getState().hydrate(platformWith());
    expect(blocked.getState().ready).toBe(true);
    expect(blocked.getState().error).toBeNull();
  });
});
