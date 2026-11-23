import { withStorageLock } from "./storageLock";
import { learningStampKey, type Platform } from "@lingyi-classroom/shared";

const storagePrefix = `app:${import.meta.env.VITE_APP_IDENTIFIER}`;

function readStoredValue(key: string) {
  const value = localStorage.getItem(`${storagePrefix}:${key}`);
  if (value === null && storagePrefix === "app:com.lingyi.classroom") {
    return localStorage.getItem(`app:com.sensen.workbook:${key}`);
  }
  return value;
}

export const webPlatform: Platform = {
  name: "web",
  openResourceDownload: import.meta.env.PROD && import.meta.env.MODE === "production"
    ? () => document.dispatchEvent(new Event("classroom-open-download")) : undefined,
  householdStoryUrl: import.meta.env.VITE_HOUSEHOLD_AUDIO === "true" ? "./stories/index.html?audio=local" : undefined,
  store: {
    get: async <T>(key: string) => {
      const raw = readStoredValue(key);
      if (raw === null) return undefined;
      const parsed: unknown = JSON.parse(raw);
      if (parsed === null) throw new Error("Stored settings value must not be null");
      return parsed as T;
    },
    set: async <T>(key: string, value: T) => {
      localStorage.setItem(`${storagePrefix}:${key}`, JSON.stringify(value));
    },
    update: (key, change) => withStorageLock(`${storagePrefix}:${key}`, () => {
      const raw = readStoredValue(key);
      const next = change(raw === null ? undefined : JSON.parse(raw));
      localStorage.setItem(`${storagePrefix}:${key}`, JSON.stringify(next));
      return next;
    }),
    resetVersion: (key) => Number(localStorage.getItem(`${storagePrefix}:${key}:reset-version`)) || 0,
    subscribe: (key, changed) => {
      const fullKey = `${storagePrefix}:${key}`;
      const notify = (event: StorageEvent) => {
        if (event.storageArea !== localStorage) return;
        if (event.key === null || event.key === fullKey || event.key === fullKey + ":reset-version") changed();
      };
      window.addEventListener("storage", notify);
      return () => window.removeEventListener("storage", notify);
    },
    reset: async <T>(key: string, value: T) => {
      const fullKey = `${storagePrefix}:${key}`;
      const reset = () => {
        const previous = readStoredValue(key);
        if (previous !== null) {
          let timestamp = Date.now();
          while (localStorage.getItem(`${fullKey}:backup-${timestamp}`) !== null) timestamp++;
          try { localStorage.setItem(`${fullKey}:backup-${timestamp}`, previous); }
          catch (error) { if (key === learningStampKey) throw error; }
        }
        if (key !== learningStampKey) {
          localStorage.setItem(fullKey, JSON.stringify(value));
          return;
        }
        // Keep legacy stamp arrays readable. Publish the new reset version under
        // the stamp lock and roll it back if the actual clear cannot be committed.
        const versionKey = fullKey + ":reset-version";
        const previousVersion = localStorage.getItem(versionKey);
        localStorage.setItem(versionKey, String((Number(previousVersion) || 0) + 1));
        try { localStorage.setItem(fullKey, JSON.stringify(value)); }
        catch (error) {
          if (previousVersion === null) localStorage.removeItem(versionKey);
          else localStorage.setItem(versionKey, previousVersion);
          throw error;
        }
      };
      await withStorageLock(fullKey, reset);
    },
  },
  getAppVersion: async () => import.meta.env.VITE_APP_VERSION,
};
