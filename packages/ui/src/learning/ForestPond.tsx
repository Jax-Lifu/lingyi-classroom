import { Howl } from "howler";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type { Platform } from "@lingyi-classroom/shared";
import { ChildIcon } from "./ChildIcon";
import { claimNarration } from "./audioChannel";
import { lessonHref, playable } from "./childCatalog";
import { usePlaySound } from "./usePlaySound";

const pads = [
  { name: "哆", digit: "1", x: 11, y: 77 },
  { name: "来", digit: "2", x: 30, y: 63 },
  { name: "咪", digit: "3", x: 50, y: 81 },
  { name: "发", digit: "4", x: 70, y: 64 },
  { name: "嗦", digit: "5", x: 89, y: 78 },
];
const songLength = 6;
const frogLesson = playable.hanzi.find((item) => item.label === "蛙")!;
type Beat = { pad: number; time: number };
const position = (index: number): CSSProperties => ({
  left: pads[index].x + "%",
  top: pads[index].y + "%",
});

export function ForestPond({
  store,
  count,
}: {
  store: Platform["store"];
  count: string;
}) {
  const { muted, changeMuted } = usePlaySound(store);
  const [song, setSong] = useState<Beat[]>([]);
  const [frog, setFrog] = useState({ pad: 0, hop: 0, left: false });
  const [playing, setPlaying] = useState<number | null>(null);
  const [soundError, setSoundError] = useState(false);
  const notes = useRef<Howl | null>(null);
  const timers = useRef<number[]>([]);
  const release = useRef<(() => void) | undefined>(undefined);
  const stop = useCallback(() => {
    for (const timer of timers.current) window.clearTimeout(timer);
    timers.current = [];
    release.current?.();
    release.current = undefined;
    notes.current?.stop();
    setPlaying(null);
  }, []);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      stop();
      notes.current?.unload();
      notes.current = null;
    };
  }, [stop]);

  function hop(pad: number) {
    setFrog((prev) => ({
      pad,
      hop: prev.hop + 1,
      left: pad === prev.pad ? prev.left : pad < prev.pad,
    }));
    if (muted !== false) return;
    if (!notes.current) {
      notes.current = new Howl({
        src: ["./media/play/lily-notes.wav"],
        sprite: {
          "1": [0, 500],
          "2": [600, 500],
          "3": [1200, 500],
          "4": [1800, 500],
          "5": [2400, 500],
        },
        volume: 0.74,
        onplay: () => setSoundError(false),
        onloaderror: () => {
          notes.current?.unload();
          notes.current = null;
          setSoundError(true);
        },
        onplayerror: () => setSoundError(true),
      });
    }
    notes.current.stop();
    notes.current.play(pads[pad].digit);
  }
  function tap(pad: number) {
    stop();
    release.current = claimNarration(stop);
    const beat = { pad, time: performance.now() };
    setSong((previous) =>
      previous.length === songLength ? [beat] : [...previous, beat],
    );
    hop(pad);
  }
  function replay() {
    stop();
    if (playing !== null || !song.length) return;
    release.current = claimNarration(stop);
    let delay = 0;
    function perform(index: number) {
      setPlaying(index);
      hop(song[index].pad);
    }
    perform(0);
    for (let i = 1; i < song.length; i++) {
      // Keep long thinking pauses out of the frog's performance.
      delay += Math.min(song[i].time - song[i - 1].time, 1400);
      timers.current.push(window.setTimeout(() => perform(i), delay));
    }
    timers.current.push(window.setTimeout(stop, delay + 550));
  }
  function clear() {
    stop();
    setSong([]);
    setFrog({ pad: 0, hop: 0, left: false });
  }
  const replayLabel =
    playing !== null ? "停一下" : muted ? "看青蛙跳" : "听我的歌";
  const full = song.length === songLength;
  const hint =
    playing !== null
      ? "看，小青蛙在跳你编的歌！"
      : full
        ? "一首歌编好啦！再点荷叶，编下一首。"
        : "点点荷叶，和青蛙编首歌。";
  return (
    <header className="forest-pond">
      <div className="pond-water">
        <img
          className="pond-painting"
          fetchPriority="high"
          src="./art/poems/bg-goose-pond.webp"
          alt=""
        />
        <div className="pond-heading">
          <h1 tabIndex={-1}>森森森林</h1>
          <p role="status">{hint}</p>
        </div>
        <button
          type="button"
          className="pond-mute"
          aria-label={muted ? "开启荷塘声音" : "关闭荷塘声音"}
          aria-pressed={muted === false}
          disabled={muted === undefined}
          onClick={() => {
            stop();
            changeMuted(!muted);
          }}
        >
          <ChildIcon name={muted ? "quiet" : "sound"} />
        </button>
        {pads.map((pad, i) => (
          <button
            key={pad.digit}
            type="button"
            className="pond-pad"
            data-frog={frog.pad === i || undefined}
            style={position(i)}
            aria-label={pad.digit + "号荷叶，" + pad.name}
            onClick={() => tap(i)}
          >
            <img src="./art/play/lily.webp" alt="" draggable={false} />
            <span>{pad.digit}</span>
          </button>
        ))}
        <div
          aria-hidden="true"
          className="pond-frog"
          style={{
            transform: `translate(${pads[frog.pad].x}%, ${pads[frog.pad].y}%)`,
          }}
        >
          <div className="frog-body">
            {frog.hop > 0 && (
              <span className="frog-syllable">{pads[frog.pad].name}</span>
            )}
            <div className={frog.left ? "frog-facing-left" : undefined}>
              <img
                key={frog.hop}
                className={frog.hop ? "frog-hopping" : "frog-waiting"}
                src="./art/wordbook/painted/frog.webp"
                alt=""
                draggable={false}
              />
            </div>
          </div>
        </div>
        {full && (
          <img
            className="pond-butterfly"
            src="./art/wordbook/painted/butterfly.webp"
            alt=""
          />
        )}
      </div>
      <div className="pond-score">
        <div
          className="pond-phrase"
          role="img"
          aria-label={
            "我的曲子：" +
            (song.map((beat) => pads[beat.pad].name).join("、") || "还没开始")
          }
        >
          {Array.from({ length: songLength }, (_, i) => (
            <span
              key={i}
              className={i === playing ? "beat-playing" : undefined}
            >
              {song[i] && pads[song[i].pad].digit}
            </span>
          ))}
        </div>
        <button
          type="button"
          className="pond-replay"
          onClick={replay}
          disabled={!song.length}
        >
          <ChildIcon name={playing !== null ? "stop" : "play"} />
          {replayLabel}
        </button>
        <button
          type="button"
          className="pond-clear"
          onClick={clear}
          disabled={!song.length}
          aria-label="重新编歌"
        >
          <ChildIcon name="replay" />
        </button>
      </div>
      <div className="pond-book">
        <a href={lessonHref("hanzi", frogLesson)}>
          翻开「蛙」的绘本 <ChildIcon name="next" />
        </a>
        {count && <span className="catalog-count">{count}</span>}
      </div>
      {soundError && !muted && (
        <p role="status" className="catalog-error">
          暂时播不出声音，再点荷叶试试。
        </p>
      )}
    </header>
  );
}
