import { useReducedMotion } from "./useReducedMotion";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
} from "react";
import {
  poemBackdropUrls,
  poemScenes,
  type PoemLayer,
  type PoemScene,
} from "@lingyi-classroom/content/poem-scenes";
import { ChildIcon } from "../ChildIcon";
import { useNarration } from "../useNarration";
import { PoemAtmosphereLayer, PoemDramaStage } from "./PoemDramas";
import type { RoundProps } from "./types";
import "./poem-theater.css";

const Stage3D = lazy(() =>
  import("./PoemStage3D")
    .then((m) => ({ default: m.PoemStage3D }))
    .catch(() => ({ default: () => null })),
);

function PoemStoryboardStage({
  layers,
  activeLine,
  paused,
  pulse,
  onInteract,
}: {
  layers: readonly PoemLayer[];
  activeLine: number;
  paused: boolean;
  pulse: number;
  onInteract: () => void;
}) {
  return (
    <div
      className={"poem-storyboard" + (paused ? " is-paused" : "")}
      data-pulse={pulse % 2}
      onClick={onInteract}
      role="presentation"
    >
      {layers.map(([pic, x, y, height, motion = "idle", beat, dx = 0, dy = 0], i) => {
        const arrived = beat === undefined || activeLine >= beat;
        const activeBeat = beat !== undefined && activeLine === beat;
        return (
          <div
            key={i}
            className={[
              "sb-slot",
              arrived ? "is-arrived" : "is-upcoming",
              activeBeat ? "is-active-beat" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              {
                left: x + "%",
                top: y + "%",
                height: height + "%",
                "--sb-dx": (arrived ? dx : 0) + "cqw",
                "--sb-dy": (arrived ? dy : 0) + "cqw",
                "--sb-delay": i * 0.14 + "s",
              } as CSSProperties
            }
          >
            <img
              className={"sb-art sb-motion-" + motion}
              src={"./" + pic}
              alt=""
              draggable={false}
            />
          </div>
        );
      })}
    </div>
  );
}

const fallbackScene: PoemScene = {
  group: "看山水",
  backdrop: "clearing-lake",
  time: "day",
  atmosphere: "clouds",
  story: "听一听诗里的画面。",
  layers: [],
};

export function PoemTheater(game: RoundProps) {
  const { item, muted, onWin, next, nextLabel } = game;
  const poem = item.poem!;
  const lines = poem.lines;
  const starts = poem.lineStarts ?? [];
  const timed = !!poem.audio && starts.length === lines.length && lines.length > 0;
  const scene = poemScenes[item.id] ?? fallbackScene;
  const bgUrl = poemBackdropUrls[scene.backdrop];

  const [activeLine, setActiveLine] = useState(0);
  const [playing, setPlaying] = useState(false);
  const { play, stop, playing: speaking, error } = useNarration(() => setPlaying(false));
  const [paused, setPaused] = useState(false);
  const [cover, setCover] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());
  const [visited, setVisited] = useState<Set<number>>(() => new Set());
  const completed = lines.length > 0 && visited.size === lines.length;
  const [pulse, setPulse] = useState(0);
  const reduced = useReducedMotion();
  const [glReady, setGlReady] = useState(false);
  useEffect(() => { if (reduced) setGlReady(false); }, [reduced]);
  const [tapSignal, setTapSignal] = useState<{
    x: number;
    y: number;
    seq: number;
  } | null>(null);

  const wonRef = useRef(false);
  const silentTimerRef = useRef<number | undefined>(undefined);

  const stopSilentPlayback = useCallback(() => {
    if (silentTimerRef.current !== undefined) {
      window.clearTimeout(silentTimerRef.current);
      silentTimerRef.current = undefined;
    }
  }, []);

  const stopAll = useCallback(() => {
    stopSilentPlayback();
    stop();
    setPlaying(false);
  }, [stopSilentPlayback, stop]);

  useEffect(() => {
    const onVisibility = () => { if (document.hidden) stopAll(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stopSilentPlayback();
      stop();
    };
  }, [stopSilentPlayback, stop, stopAll]);

  useEffect(() => {
    if (muted && speaking) {
      stopAll();
    }
  }, [muted, speaking, stopAll]);

  useEffect(() => {
    if (completed && !wonRef.current) {
      wonRef.current = true;
      onWin();
    }
  }, [completed, onWin]);

  const visitLines = useCallback((first: number, end: number) => {
    setVisited((previous) => {
      const next = new Set(previous);
      for (let index = first; index < end; index++) next.add(index);
      return next.size === previous.size ? previous : next;
    });
  }, []);

  const lineDurationsMs = useMemo(() => {
    return lines.map((_, i) => {
      if (starts.length === lines.length && i + 1 < starts.length) {
        return Math.max(900, Math.round((starts[i + 1] - starts[i]) * 1000));
      }
      return 1900;
    });
  }, [lines, starts]);

  const runSilentSequence = useCallback(
    (fromIndex: number) => {
      stopSilentPlayback();
      const step = (idx: number) => {
        setActiveLine(idx);
        setPulse((p) => p + 1);
        const wait = lineDurationsMs[idx] ?? 1800;
        silentTimerRef.current = window.setTimeout(() => {
          if (!cover || revealed.has(idx)) visitLines(idx, idx + 1);
          if (idx + 1 < lines.length) {
            step(idx + 1);
          } else {
            setPlaying(false);
            silentTimerRef.current = undefined;
          }
        }, wait);
      };
      step(fromIndex);
    },
    [cover, revealed, lineDurationsMs, lines.length, stopSilentPlayback, visitLines],
  );

  const startFullPlayback = useCallback(
    (fromIndex = 0) => {
      stopSilentPlayback();
      setPaused(false);
      setPlaying(true);
      setActiveLine(fromIndex);
      setPulse((p) => p + 1);

      if (muted || !poem.audio || !timed) {
        runSilentSequence(fromIndex);
        return;
      }

      let current = fromIndex;
      play(
        poem.audio,
        starts[fromIndex] ?? 0,
        undefined,
        (seconds) => {
          let next = current;
          while (next + 1 < starts.length && seconds >= starts[next + 1]) next++;
          if (next !== current) {
            visitLines(current, next);
            current = next;
            setActiveLine(next);
            setPulse((p) => p + 1);
          }
        },
        () => {
          visitLines(current, lines.length);
          setActiveLine(lines.length - 1);
          setPlaying(false);
        },
      );
    },
    [
      muted,
      poem.audio,
      runSilentSequence,
      starts,
      stopSilentPlayback,
      timed,
      visitLines,
      lines.length,
      play,
    ],
  );

  const speakSingleLine = useCallback(
    (index: number, uncover = false) => {
      stopSilentPlayback();
      setPaused(false);
      setPlaying(false);
      setActiveLine(index);
      const visible = uncover || !cover || revealed.has(index);
      if (visible) visitLines(index, index + 1);
      setPulse((p) => p + 1);
      if (!muted && poem.audio && timed) {
        play(poem.audio, starts[index] ?? 0, starts[index + 1], undefined,
          visible ? undefined : () => visitLines(index, index + 1));
      }
    },
    [cover, revealed, muted, poem.audio, starts, stopSilentPlayback, timed, visitLines, play],
  );

  const togglePlay = () => {
    if (playing) {
      stopAll();
      setPaused(true);
      return;
    }
    const startAt = activeLine >= lines.length - 1 ? 0 : activeLine;
    startFullPlayback(startAt);
  };

  const toggleMotion = () => {
    if (!paused) {
      if (playing) stopAll();
      setPaused(true);
    } else {
      setPaused(false);
    }
  };

  const stepLine = (delta: number) => {
    const nextIdx = Math.max(0, Math.min(lines.length - 1, activeLine + delta));
    speakSingleLine(nextIdx);
  };

  const replayPoem = () => {
    startFullPlayback(0);
  };

  const interactStage = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width && rect.height) {
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      setTapSignal((prev) => ({ x, y, seq: (prev?.seq ?? 0) + 1 }));
    }
    if (paused) setPaused(false);
    setPulse((p) => p + 1);
    if (!playing) {
      speakSingleLine(activeLine);
    }
  };

  const activeCaption =
    scene.verseNotes?.[activeLine] ?? scene.story;
  const activeVerseText = lines[activeLine] ?? "";

  return (
    <article className="poem-theater" aria-label={poem.title + " · 古诗画卷"}>
      <div
        className={[
          "poem-stage",
          "time-" + scene.time,
          "line-focus-" + (activeLine % 4),
          glReady ? "with-gl3d" : "fallback-2d",
          paused ? "is-paused" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-scene="poems"
        data-renderer={glReady ? "three-2.5d" : "illustration-2d"}
        data-phase={playing ? "playing" : "line-" + activeLine}
        data-line={activeLine}
        onClick={interactStage}
      >
        {!reduced && (
          <Suspense fallback={null}>
            <Stage3D
              poemId={item.id}
              scene={scene}
              activeLine={activeLine}
              lineCount={lines.length}
              paused={paused}
              reduced={reduced}
              tapSignal={tapSignal}
              onAvailable={setGlReady}
            />
          </Suspense>
        )}

        <div className="poem-2d-fallback" aria-hidden={glReady || undefined}>
          <img
            className="poem-stage-bg"
            src={"./" + bgUrl}
            alt=""
            draggable={false}
          />
          <div className="poem-stage-lighting" aria-hidden="true" />

          {scene.drama ? (
            <PoemDramaStage
              drama={scene.drama}
              activeLine={activeLine}
              playing={playing}
              paused={paused}
              pulse={pulse}
              onInteract={() => {}}
            />
          ) : (
            <PoemStoryboardStage
              layers={scene.layers}
              activeLine={activeLine}
              paused={paused}
              pulse={pulse}
              onInteract={() => {}}
            />
          )}

          <PoemAtmosphereLayer atmosphere={scene.atmosphere} paused={paused} />
        </div>

        <div className="poem-seal" aria-hidden="true">
          <small>{poem.author || "古诗"}</small>
          <strong>{poem.title}</strong>
        </div>

        <div className="poem-stage-hud">
          <span className="poem-verse-meter">
            第 {activeLine + 1} / {lines.length} 句
          </span>
          <button
            type="button"
            className="poem-motion-btn"
            aria-label={paused ? "播放画面动效" : "暂停画面动效"}
            onClick={toggleMotion}
          >
            <ChildIcon name={paused ? "play" : "pause"} />
          </button>
        </div>

        <div className="poem-stage-caption" aria-live="polite">
          {cover && !revealed.has(activeLine) ? (
            <span className="caption-hint">看画面，想想这一句怎么背？</span>
          ) : (
            <span>{activeVerseText}</span>
          )}
        </div>
      </div>

      <div className="poem-controls-bar">
        <button
          type="button"
          className="poem-primary-btn"
          onClick={togglePlay}
        >
          <ChildIcon name={playing ? "pause" : "play"} />
          <span>{playing ? "暂停" : "看动画听诗"}</span>
        </button>

        <div className="poem-step-group">
          <button
            type="button"
            className="poem-tool-btn"
            disabled={activeLine <= 0}
            aria-label="上一句"
            onClick={() => stepLine(-1)}
          >
            <ChildIcon name="back" />
            <span>上一句</span>
          </button>
          <button
            type="button"
            className="poem-tool-btn"
            disabled={activeLine >= lines.length - 1}
            aria-label="下一句"
            onClick={() => stepLine(1)}
          >
            <span>下一句</span>
            <ChildIcon name="next" />
          </button>
        </div>

        <div className="poem-extra-group">
          <button
            type="button"
            className="poem-tool-btn"
            aria-pressed={cover}
            onClick={() => {
              stopAll();
              setCover((c) => !c);
              setRevealed(new Set());
            }}
          >
            <span>{cover ? "显示全文" : "遮句背一背"}</span>
          </button>
          {cover && !revealed.has(activeLine) && (
            <button
              type="button"
              className="poem-tool-btn"
              disabled={visited.has(activeLine)}
              onClick={() => {
                stopAll();
                visitLines(activeLine, activeLine + 1);
              }}
            >
              {visited.has(activeLine) ? "本句已学过" : "这句背出来了"}
            </button>
          )}
          <button
            type="button"
            className="poem-tool-btn icon-only"
            aria-label="重播整首诗"
            title="重播"
            onClick={replayPoem}
          >
            <ChildIcon name="replay" />
          </button>
        </div>
      </div>

      <div
        className={
          "poem-verses" + (lines.length > 6 ? " multi-column" : "")
        }
        role="group"
        aria-label="逐句看画面听诗"
      >
        {lines.map((lineText, i) => {
          const isHidden = cover && !revealed.has(i);
          const isCurrent = activeLine === i;
          const isSeen = visited.has(i);
          return (
            <button
              key={i}
              type="button"
              className={[
                "poem-verse-btn",
                isCurrent ? "is-current" : "",
                isSeen ? "is-seen" : "",
                isHidden ? "is-concealed" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={isCurrent ? "step" : undefined}
              aria-label={
                isHidden
                  ? `看第${i + 1}句画面提示并揭开`
                  : `第${i + 1}句：${lineText}`
              }
              onClick={() => {
                if (isHidden) {
                  setRevealed((old) => new Set([...old, i]));
                }
                speakSingleLine(i, isHidden);
              }}
            >
              <span className="verse-index" aria-hidden="true">
                {i + 1}
              </span>
              <span className="verse-copy">
                {isHidden ? `第 ${i + 1} 句 · 看图想一想` : lineText}
              </span>
              <ChildIcon name="sound" className="verse-sound-icon" />
            </button>
          );
        })}
      </div>

      <footer className="poem-story-foot">
        <p className="poem-story-whisper">
          <strong>画里讲什么：</strong>
          {activeCaption}
        </p>

        {game.stampFeedback}
        {completed && (
          <div className="poem-finish-banner" role="status">
            <span className="finish-badge">
              <ChildIcon name="check" />
              赏完这首诗啦！
            </span>
            <button type="button" className="poem-next-btn" onClick={next}>
              <span>{nextLabel ?? "下一首"}</span>
              <ChildIcon name="next" />
            </button>
          </div>
        )}
      </footer>

      {error && (
        <p className="poem-audio-error" role="status">
          {error}
        </p>
      )}
    </article>
  );
}
