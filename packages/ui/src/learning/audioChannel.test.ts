import { describe, expect, it, vi, afterEach } from "vitest";
import { AudioChannel } from "./audioChannel";
import type { HowlOptions } from "howler";

const calls = vi.hoisted(() => ({
  groups: [] as {
    options: HowlOptions;
    play: ReturnType<typeof vi.fn>;
    unload: ReturnType<typeof vi.fn>;
  }[],
}));
vi.mock("howler", () => ({
  Howl: class {
    play = vi.fn();
    unload = vi.fn();
    load = vi.fn();
    seek = vi.fn();
    once = vi.fn();
    constructor(public options: HowlOptions) {
      calls.groups.push(this);
    }
  },
}));
afterEach(() => {
  calls.groups.length = 0;
});
describe("Howler narration cues", () => {
  it("uses a timed sprite for a single line and advances once to the next clip", () => {
    const chan = new AudioChannel(),
      done = vi.fn();
    chan.play([{ path: "poem.mp3", start: 1, end: 3 }, "next.mp3"], {
      end: done,
    });
    const first = calls.groups[0];
    expect(first.options.sprite).toEqual({ line: [1000, 2000] });
    expect(first.play).toHaveBeenCalledWith("line");
    first.options.onend?.(1);
    expect(first.unload).toHaveBeenCalled();
    expect(calls.groups[1].options.src).toEqual(["./next.mp3"]);
    first.options.onend?.(1);
    expect(calls.groups.length).toBe(2);
    calls.groups[1].options.onend?.(2);
    expect(done).toHaveBeenCalledOnce();
  });
  it("requests the recording for the current downloaded resource version", () => {
    const chan = new AudioChannel();
    document.documentElement.dataset.resourceVersion = "edition04";
    try {
      chan.play(["media/poems/goose.mp3"]);
      expect(calls.groups.at(-1)?.options.src).toEqual(["./media/poems/goose.mp3?v=edition04"]);
    } finally {
      chan.stop();
      delete document.documentElement.dataset.resourceVersion;
    }
  });
  it("interrupts a previous narrator without completing its queue", () => {
    const first = new AudioChannel(), second = new AudioChannel(), end = vi.fn();
    first.play(["first.mp3", "queued.mp3"], { end });
    const old = calls.groups[0];
    second.play(["second.mp3"]);
    expect(old.unload).toHaveBeenCalledOnce();
    old.options.onend?.(1);
    first.stop();
    expect(calls.groups).toHaveLength(2);
    expect(calls.groups[1].unload).not.toHaveBeenCalled();
    expect(end).not.toHaveBeenCalled();
    second.stop();
  });
  it("does not restart a stale cue after a navigation or replay", () => {
    const chan = new AudioChannel();
    chan.play(["old.mp3", "stale.mp3"]);
    const first = calls.groups[0];
    chan.play(["new.mp3"]);
    first.options.onend?.(1);
    first.options.onloaderror?.(1, "canceled");
    expect(calls.groups).toHaveLength(2);
    expect(calls.groups[1].unload).not.toHaveBeenCalled();
    chan.stop();
    expect(calls.groups[1].unload).toHaveBeenCalledOnce();
  });
});
