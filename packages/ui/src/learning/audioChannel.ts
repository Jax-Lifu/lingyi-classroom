import { Howl } from "howler";

export interface AudioSegment {
  path: string;
  start?: number;
  end?: number;
}
type Source = string | AudioSegment;
interface Listeners {
  interrupt?: () => void;
  start?: (index: number) => void;
  time?: (seconds: number) => void;
  end?: () => void;
  error?: () => void;
}

let interruptActive: (() => void) | undefined;

export function claimNarration(interrupt: () => void) {
  interruptActive?.();
  interruptActive = interrupt;
  return () => {
    if (interruptActive === interrupt) interruptActive = undefined;
  };
}

/** One narrator at a time. Howler owns decoding, mobile unlock and the exact end of each audio sprite. */
export class AudioChannel {
  private current?: Howl;
  private timer?: ReturnType<typeof setInterval>;
  private release?: () => void;
  private generation = 0;
  stop() {
    this.release?.();
    this.release = undefined;
    this.generation++;
    clearInterval(this.timer);
    this.current?.unload();
    this.current = undefined;
  }
  play(sources: readonly Source[], listeners: Listeners = {}) {
    this.stop();
    if (sources.length) {
      this.release = claimNarration(() => {
        this.stop();
        listeners.interrupt?.();
      });
    }
    const generation = this.generation;
    let index = 0;
    const next = () => {
      if (this.generation !== generation) return;
      clearInterval(this.timer);
      this.current?.unload();
      this.current = undefined;
      const input = sources[index++];
      if (input === undefined) {
        this.release?.();
        this.release = undefined;
        listeners.end?.();
        return;
      }
      const clip = typeof input === "string" ? { path: input } : input;
      const sprite =
        clip.end === undefined
          ? undefined
          : {
              line: [
                (clip.start ?? 0) * 1000,
                Math.max(1, (clip.end - (clip.start ?? 0)) * 1000),
              ] as [number, number],
            };
      // A cached recording must use the same edition as the poem's line offsets.
      const revision = document.documentElement.dataset.resourceVersion;
      const suffix = revision && clip.path.startsWith("media/") && clip.path.endsWith(".mp3") ? "?v=" + revision : "";
      const howl = new Howl({
        src: ["./" + clip.path + suffix],
        preload: false,
        sprite,
        onplay: (id) => {
          if (generation !== this.generation || this.current !== howl) return;
          if (!sprite && clip.start) howl.seek(clip.start, id);
          listeners.start?.(index - 1);
          if (listeners.time) {
            const notify = () => listeners.time?.(Number(howl.seek(id)));
            notify();
            this.timer = setInterval(notify, 65);
          }
        },
        onend: () => {
          if (this.current === howl) next();
        },
        onloaderror: () => {
          if (this.current === howl) {
            this.stop();
            listeners.error?.();
          }
        },
        onplayerror: () => {
          if (this.current !== howl) return;
          listeners.error?.();
          howl.once("unlock", () => {
            if (this.current === howl) howl.play(sprite ? "line" : undefined);
          });
        },
      });
      this.current = howl;
      howl.load();
      howl.play(sprite ? "line" : undefined);
    };
    next();
  }
}
