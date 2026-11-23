import { useCallback, useEffect, useRef, useState } from "react";
import { AudioChannel, type AudioSegment } from "./audioChannel";

export function useNarration(onInterrupt?: () => void) {
  const interrupted = useRef(onInterrupt);
  interrupted.current = onInterrupt;
  const ref = useRef<AudioChannel | null>(null);
  const [playing, setPlaying] = useState(false),
    [error, setError] = useState("");
  const stop = useCallback(() => {
    ref.current?.stop();
    setPlaying(false);
  }, []);
  useEffect(() => {
    const background = () => {
      if (document.hidden) { stop(); interrupted.current?.(); }
    };
    document.addEventListener("visibilitychange", background);
    return () => {
      document.removeEventListener("visibilitychange", background);
      ref.current?.stop();
    };
  }, [stop]);
  const playSequence = useCallback(
    (
      clips: AudioSegment[],
      onStart?: (index: number) => void,
      onTime?: (t: number) => void,
      onEnd?: () => void,
    ) => {
      stop();
      setError("");
      if (!clips.length) return;
      setPlaying(true);
      const channel = ref.current ?? (ref.current = new AudioChannel());
      channel.play(clips, {
        start: (index) => {
          onStart?.(index);
          setPlaying(true);
          setError("");
        },
        time: onTime,
        interrupt: () => { setPlaying(false); interrupted.current?.(); },
        end: () => {
          setPlaying(false);
          onEnd?.();
        },
        error: () => {
          setPlaying(false);
          interrupted.current?.();
          setError("暂时播不出声音，可以再点一次。");
        },
      });
    },
    [stop],
  );
  const play = useCallback(
    (
      path?: string,
      start = 0,
      end?: number,
      onTime?: (t: number) => void,
      onEnd?: () => void,
    ) =>
      playSequence(
        path ? [{ path, start, end }] : [],
        undefined,
        onTime,
        onEnd,
      ),
    [playSequence],
  );
  return { play, playSequence, stop, playing, error };
}
