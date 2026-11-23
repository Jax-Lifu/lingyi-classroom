import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { AudioChannel } from "../audioChannel";
import type { Clip } from "./types";

type Job = {
  left: number;
  start: number;
  timer: ReturnType<typeof setTimeout> | null;
  run: () => void;
};
const effects = {
  touch: [0, 180],
  sizzle: [300, 560],
  splash: [1000, 240],
  chime: [1400, 510],
  shutter: [2050, 110],
  flap: [2300, 220],
} satisfies Record<string, [number, number]>;

export function usePlayRuntime(muted: boolean, onUnmute?: () => void) {
  const [voiceFailed, setVoiceFailed] = useState(false);
  const jobs = useRef(new Set<Job>());
  const voice = useRef<AudioChannel | null>(null),
    fx = useRef<Howl | null>(null),
    silent = useRef(muted),
    unmuteRef = useRef(onUnmute);
  silent.current = muted;
  unmuteRef.current = onUnmute;
  const stop = useCallback(() => voice.current?.stop(), []);
  const arm = useCallback((job: Job) => {
    job.start = performance.now();
    job.timer = setTimeout(
      () => {
        jobs.current.delete(job);
        job.run();
      },
      Math.max(0, job.left),
    );
  }, []);
  const later = useCallback(
    (ms: number, run: () => void) => {
      const job: Job = { left: ms, start: 0, timer: null, run };
      jobs.current.add(job);
      if (!document.hidden) arm(job);
    },
    [arm],
  );
  const clear = useCallback(() => {
    stop();
    fx.current?.stop();
    for (const j of jobs.current) if (j.timer !== null) clearTimeout(j.timer);
    jobs.current.clear();
  }, [stop]);
  const speak = useCallback((...items: (Clip | undefined)[]) => {
    if (document.hidden || silent.current) return;
    const player = voice.current ?? (voice.current = new AudioChannel());
    player.play(items.filter((x): x is Clip => !!x), {
      start: () => setVoiceFailed(false),
      error: () => setVoiceFailed(true),
    });
  }, []);
  const enableSound = useCallback(() => {
    if (document.hidden) return false;
    if (silent.current) {
      if (!unmuteRef.current) return false;
      silent.current = false;
      unmuteRef.current();
    }
    return true;
  }, []);
  const listen = useCallback((...items: (Clip | undefined)[]) => {
    if (enableSound()) speak(...items);
  }, [enableSound, speak]);
  const sound = useCallback((kind: keyof typeof effects) => {
    if (silent.current || document.hidden) return;
    const bank =
      fx.current ??
      (fx.current = new Howl({
        src: ["./media/play/forest-effects.wav"],
        sprite: effects,
        volume: 0.64,
      }));
    bank.play(kind);
  }, []);
  useEffect(() => {
    if (muted) {
      stop();
      fx.current?.stop();
    }
  }, [muted, stop]);
  useEffect(() => {
    const visibility = () => {
      if (document.hidden) {
        stop();
        fx.current?.stop();
        for (const job of jobs.current) {
          if (job.timer !== null) {
            clearTimeout(job.timer);
            job.left -= performance.now() - job.start;
            job.timer = null;
          }
        }
      } else for (const job of jobs.current) if (job.timer === null) arm(job);
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      document.removeEventListener("visibilitychange", visibility);
      clear();
      fx.current?.unload();
      fx.current = null;
    };
  }, [arm, clear, stop]);
  return { later, speak, listen, enableSound, sound, clear, stop, voiceFailed };
}
