import { vi } from "vitest";

// In newer Node versions globalThis.localStorage can shadow jsdom's origin-specific store.
const dom = (globalThis as { jsdom?: { window: Window } }).jsdom;
if (dom) vi.stubGlobal("localStorage", dom.window.localStorage);
