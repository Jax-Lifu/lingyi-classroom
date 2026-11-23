import { pinyinCueLabel } from "../pinyinCueLabel";
import { QuizAudioRetry } from "./QuizAudioRetry";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";
import {
  pinyinBackdropUrls,
  pinyinScenes,
  type PinyinScene,
} from "@lingyi-classroom/content/pinyin-scenes";
import { claimNarration } from "../audioChannel";
import { ChildIcon } from "../ChildIcon";
import { PoemAtmosphereLayer } from "./PoemDramas";
import { playVoice, type RoundProps } from "./types";
import { useReducedMotion } from "./useReducedMotion";
import "./scenic-theater.css";
import "./pinyin-theater.css";

const PinyinStage3D = lazy(() =>
  import("./PinyinStage3D")
    .then((m) => ({ default: m.PinyinStage3D }))
    .catch(() => ({ default: () => null })),
);

const fallbackScene: PinyinScene = {
  group: "声母",
  backdrop: "phonics-grove",
  time: "day",
  atmosphere: "clouds",
  rhyme: "听一听拼音读音",
  mouthTip: "仔细听清发音和例字。",
  story: "听一听拼音故事吧。",
  toneForms: ["ā", "á", "ǎ", "à"],
  exampleTone: 1,
  layers: [],
};

const TONE_NAMES: Readonly<Record<1 | 2 | 3 | 4, string>> = {
  1: "一声平 ˉ",
  2: "二声扬 ˊ",
  3: "三声拐弯 ˇ",
  4: "四声降 ˋ",
};

const TONE_POLYLINE: Readonly<Record<1 | 2 | 3 | 4, string>> = {
  1: "20,30 40,30 60,30 80,30",
  2: "20,60 40,48 60,36 80,24",
  3: "20,44 40,65 60,58 80,28",
  4: "20,24 40,38 60,54 80,68",
};

const TONE_END: Readonly<Record<1 | 2 | 3 | 4, readonly [number, number]>> = {
  1: [80, 30],
  2: [80, 24],
  3: [80, 28],
  4: [80, 68],
};

let toneContext: AudioContext | undefined;

function playToneContour(tone: 1 | 2 | 3 | 4) {
  const Ctx =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return;
  try {
    const ctx = toneContext ??= new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = "sine";
    if (tone === 1) {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.linearRampToValueAtTime(440, now + 0.45);
    } else if (tone === 2) {
      osc.frequency.setValueAtTime(310, now);
      osc.frequency.exponentialRampToValueAtTime(450, now + 0.45);
    } else if (tone === 3) {
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.exponentialRampToValueAtTime(215, now + 0.22);
      osc.frequency.exponentialRampToValueAtTime(370, now + 0.5);
    } else {
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(230, now + 0.45);
    }
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.55);
    const stop = () => { gain.disconnect(); osc.disconnect(); };
    const release = claimNarration(stop);
    osc.onended = () => { release(); stop(); };
    if (ctx.state !== "running") void ctx.resume().catch(stop);
    return () => { release(); stop(); };
  } catch {
    // Ignore blocked Web Audio contexts without failing interaction.
  }
}

function FourLineGrid({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) {
  return (
    <span className={"pinyin-grid" + (compact ? " is-compact" : "")}>
      <span className="pg-lines" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <svg className="pg-glyph" role="img" aria-label={text}>
        <text x="50%" y="50%" dy=".5ex" textAnchor="middle">{text}</text>
      </svg>
    </span>
  );
}

export function PinyinTheater(game: RoundProps) {
  const { item, muted, onWin, next, nextLabel, replay, runtime: rt } = game;
  const scene = pinyinScenes[item.id] ?? fallbackScene;
  const bgUrl = pinyinBackdropUrls[scene.backdrop];
  const reduced = useReducedMotion();

  const stopTone = useRef<(() => void) | undefined>(undefined);
  useEffect(() => {
    const stop = () => { stopTone.current?.(); stopTone.current = undefined; };
    const background = () => { if (document.hidden) stop(); };
    document.addEventListener("visibilitychange", background);
    return () => { stop(); document.removeEventListener("visibilitychange", background); };
  }, []);
  useEffect(() => {
    if (muted) stopTone.current?.();
  }, [muted]);
  const [mode, setMode] = useState<"explore" | "tone" | "quiz">("explore");
  const [activeTone, setActiveTone] = useState<1 | 2 | 3 | 4>(item.initialReading ? 1 : scene.exampleTone);
  const [toneFlightSeq, setToneFlightSeq] = useState(0);
  const [blended, setBlended] = useState(false);
  const [wrongId, setWrongId] = useState("");
  const [askedForHint, setAskedForHint] = useState(false);
  const [misses, setMisses] = useState(0);
  const [won, setWon] = useState(false);
  const showHint = askedForHint || misses >= 2;
  const conceal = mode === "quiz" && !won && !showHint;
  const [paused, setPaused] = useState(false);
  const [glReady, setGlReady] = useState(false);
  useEffect(() => { if (reduced) setGlReady(false); }, [reduced]);
  const [celebrateSeq, setCelebrateSeq] = useState(0);
  const [tapSignal, setTapSignal] = useState<{
    x: number;
    y: number;
    seq: number;
  } | null>(null);

  const wonRef = useRef(false);
  const { speak } = rt;

  useEffect(() => {
    if (navigator.userActivation?.hasBeenActive) speak(item.audio);
  }, [item.audio, speak]);

  const listen = useCallback(() => {
    rt.listen(item.audio);
  }, [item.audio, rt]);

  function switchMode(nextMode: "explore" | "tone" | "quiz") {
    setMode(nextMode);
    if (nextMode === "tone") {
      triggerTone(activeTone);
    } else if (nextMode === "quiz") {
      rt.speak(item.audio, playVoice("pinyin-nest"));
    } else {
      rt.speak(item.audio);
    }
  }

  function triggerTone(tone: 1 | 2 | 3 | 4, replaySound = false) {
    setActiveTone(tone);
    setToneFlightSeq((s) => s + 1);
    const audible = replaySound ? rt.enableSound() : !muted;
    if (!audible) return;
    if (tone === scene.exampleTone) {
      rt.speak(item.exampleAudio ?? item.audio);
    } else if (tone === 1 && item.initialReading) {
      rt.speak(item.audio);
    } else {
      stopTone.current = playToneContour(tone);
    }
  }

  function triggerBlend() {
    setBlended(true);
    rt.sound("touch");
    rt.speak(item.exampleAudio ?? item.audio);
  }

  function pickQuiz(optionId: string, optionLabel: string) {
    if (won) return;
    if (optionId === item.id) {
      setWon(true);
      setWrongId("");
      setCelebrateSeq((s) => s + 1);
      rt.sound("chime");
      rt.speak(item.audio);
      if (!wonRef.current) {
        wonRef.current = true;
        onWin();
      }
    } else {
      setWrongId(optionLabel);
      setMisses((n) => n + 1);
      rt.speak(playVoice("gentle"), item.audio);
    }
  }

  function interactStage(e: MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest("button")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width && rect.height) {
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      setTapSignal((prev) => ({ x, y, seq: (prev?.seq ?? 0) + 1 }));
    }
    if (paused) setPaused(false);
    if (mode === "tone") {
      triggerTone(activeTone);
    } else {
      listen();
    }
  }

  const caption =
    mode === "tone"
      ? `${TONE_NAMES[activeTone]} · ${scene.toneForms[activeTone - 1]}${
          activeTone === scene.exampleTone ? `（${item.caption}）` : ""
        }`
      : mode === "quiz"
        ? won
          ? `答对啦！${item.label}，${item.caption}（${item.reading}）！`
          : wrongId
            ? `不是「${wrongId}」哦，再听一次读音。`
            : "听读音，找出对应的拼音。"
        : `${pinyinCueLabel(item)} — ${scene.rhyme}`;

  const phaseLabel =
    won
      ? "学会啦"
      : mode === "tone"
        ? "声调飞行"
        : mode === "quiz"
          ? "听音找拼音"
          : item.group;

  const [birdX, birdY] = TONE_END[activeTone];

  return (
    <article
      className="scenic-theater pinyin-theater"
      aria-label={mode === "quiz" && !won ? "拼音百灵谷听辨练习" : item.label + " · 拼音百灵谷"}
      data-mode={mode}
      data-quiz-concealed={conceal}
      data-phase={won ? "won" : mode}
    >
      <div
        className={[
          "scenic-stage",
          "time-" + scene.time,
          glReady ? "with-gl3d" : "fallback-2d",
          paused ? "is-paused" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-scene="pinyin"
        data-renderer={glReady ? "three-2.5d" : "illustration-2d"}
        onClick={interactStage}
      >
        {!reduced && (
          <Suspense fallback={null}>
            <PinyinStage3D
              itemId={item.id}
              scene={scene}
              mode={mode}
              activeTone={activeTone}
              toneFlightSeq={toneFlightSeq}
              celebrateSeq={celebrateSeq}
              conceal={conceal}
              paused={paused}
              reduced={reduced}
              tapSignal={tapSignal}
              onAvailable={setGlReady}
            />
          </Suspense>
        )}

        <div className="scenic-2d-fallback" aria-hidden={glReady || undefined}>
          <img
            className="scenic-stage-bg"
            src={"./" + bgUrl}
            alt=""
            draggable={false}
          />
          <div className="scenic-stage-lighting" aria-hidden="true" />
          <div className={"scenic-storyboard" + (mode === "tone" ? " is-soft" : "")} hidden={conceal}>
            {scene.layers.map(([pic, x, y, height, motion = "float"], i) => (
              <div
                key={i}
                className="scenic-slot"
                style={{ left: x + "%", top: y + "%", height: height + "%" }}
              >
                <img
                  className={"scenic-art sb-motion-" + motion}
                  src={"./" + pic}
                  alt=""
                  draggable={false}
                />
              </div>
            ))}
          </div>

          {mode === "tone" && (
            <div className="pinyin-2d-tone-layer" aria-hidden="true">
              <svg
                className="pinyin-tone-svg"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polyline points={TONE_POLYLINE[activeTone]} />
              </svg>
              <img
                key={toneFlightSeq}
                className="pinyin-tone-bird"
                src="./art/play/bird.webp"
                alt=""
                style={{ left: birdX + "%", top: birdY + "%" }}
              />
            </div>
          )}

          <PoemAtmosphereLayer
            atmosphere={scene.atmosphere === "clouds" ? "clouds" : scene.atmosphere}
            paused={paused || reduced}
          />
        </div>

        <div className="scenic-seal pinyin-seal" aria-hidden="true">
          <small>{item.group}</small>
          <FourLineGrid
            text={mode === "quiz" && !won ? "?" : mode === "tone" ? scene.toneForms[activeTone - 1] : item.label}
            compact
          />
        </div>

        <div className="scenic-stage-hud">
          <span className="scenic-phase-pill">{phaseLabel}</span>
          <button
            type="button"
            className="scenic-motion-btn"
            aria-label={paused ? "播放画面动效" : "暂停画面动效"}
            onClick={() => setPaused((p) => !p)}
          >
            <ChildIcon name={paused ? "play" : "pause"} />
          </button>
        </div>

        <div className="scenic-stage-caption" aria-live="polite">
          <span>{caption}</span>
        </div>
      </div>

      <div className="scenic-controls-bar">
        <button
          type="button"
          className="scenic-primary-btn"
          onClick={listen}
        >
          <ChildIcon name="sound" />
          <span>{item.voiceLabel ?? "听读音"}</span>
        </button>

        <div
          className="scenic-mode-group"
          role="group"
          aria-label="拼音学习模式"
        >
          <button
            type="button"
            className="scenic-tool-btn"
            aria-pressed={mode === "explore"}
            onClick={() => switchMode("explore")}
          >
            <span>看画认形</span>
          </button>
          <button
            type="button"
            className="scenic-tool-btn"
            aria-pressed={mode === "tone"}
            onClick={() => switchMode("tone")}
          >
            <span>声调拼读</span>
          </button>
          <button
            type="button"
            className="scenic-tool-btn"
            aria-pressed={mode === "quiz"}
            onClick={() => switchMode("quiz")}
          >
            <span>找一找</span>
          </button>
        </div>

        <button
          type="button"
          className="scenic-tool-btn icon-only"
          aria-label="重播声音与动画"
          onClick={() => {
            setTapSignal((prev) => ({ x: 0.5, y: 0.48, seq: (prev?.seq ?? 0) + 1 }));
            if (mode === "tone") triggerTone(activeTone, true);
            else listen();
          }}
        >
          <ChildIcon name="replay" />
        </button>
      </div>

      <div className="scenic-deck pinyin-deck">
        {mode === "explore" && (
          <div className="pinyin-explore-grid">
            <button
              type="button"
              className="pinyin-card-hero"
              aria-label={item.exampleAudio ? `听声母 ${item.label}` : `听读拼音 ${item.label}，例字 ${item.caption}`}
              onClick={listen}
            >
              <FourLineGrid text={item.label} />
              <span className="pinyin-hero-meta">
                <strong>
                  {pinyinCueLabel(item)}
                </strong>
                <small>{item.exampleAudio ? "点字母听声母" : "点拼音听录音"}</small>
              </span>
            </button>

            {scene.blend && (
              <button
                type="button"
                className={"pinyin-blend-card" + (blended ? " is-blended" : "")}
                aria-label={scene.blend.whole
                  ? `整体认读 ${scene.blend.syllable} ${scene.blend.word}`
                  : `拼一拼 ${scene.blend.initial} 和 ${scene.blend.final} 读作 ${scene.blend.syllable}`}
                onClick={triggerBlend}
              >
                <span className="blend-title">{scene.blend.whole ? "整体认读音节" : "声母韵母碰一碰"}</span>
                <span className="blend-tiles">
                  {!scene.blend.whole && (
                    <>
                      <span className="blend-part is-initial">
                        {scene.blend.initial}
                      </span>
                      <span className="blend-op" aria-hidden="true">
                        +
                      </span>
                      <span className="blend-part is-final">
                        {scene.blend.final}
                      </span>
                      <span className="blend-op" aria-hidden="true">
                        →
                      </span>
                    </>
                  )}
                  <span className="blend-result">
                    {scene.blend.syllable} {scene.blend.word}
                  </span>
                </span>
              </button>
            )}

            <div className="pinyin-explore-actions">
              {item.exampleAudio && item.exampleAudio !== item.audio && (
                <button type="button" className="scenic-tool-btn" onClick={() => rt.listen(item.exampleAudio)}>
                  听字音「{item.caption}」
                </button>
              )}
              <button
                type="button"
                className="scenic-tool-btn"
                onClick={() => switchMode("tone")}
              >
                <span>练四声调</span>
                <ChildIcon name="next" />
              </button>
              <button
                type="button"
                className="scenic-primary-btn"
                onClick={() => switchMode("quiz")}
              >
                <ChildIcon name="choose" />
                <span>去听音找拼音</span>
              </button>
            </div>
          </div>
        )}

        {mode === "tone" && (
          <div className="pinyin-tone-panel">
            <div className="pinyin-tone-grid" role="group" aria-label="选择四个声调">
              {([1, 2, 3, 4] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={
                    "pinyin-tone-btn" +
                    (activeTone === t ? " is-active" : "") +
                    (scene.exampleTone === t ? " is-example" : "")
                  }
                  onClick={() => triggerTone(t)}
                >
                  <span className="tone-syllable">{scene.toneForms[t - 1]}</span>
                  <small>{TONE_NAMES[t]}</small>
                  {scene.exampleTone === t && (
                    <span className="tone-example-tag">字音：{item.caption}</span>
                  )}
                </button>
              ))}
            </div>
            <div className="pinyin-explore-actions">
              <button
                type="button"
                className="scenic-tool-btn"
                onClick={() => triggerTone(activeTone)}
              >
                <ChildIcon name="play" />
                <span>声调飞一圈</span>
              </button>
              <button
                type="button"
                className="scenic-primary-btn"
                onClick={() => switchMode("quiz")}
              >
                <ChildIcon name="choose" />
                <span>去听音找拼音</span>
              </button>
            </div>
          </div>
        )}

        {mode === "quiz" && (
          <div className="pinyin-quiz-panel">
            {rt.voiceFailed && !won && <QuizAudioRetry retry={listen} />}
            <p className="pinyin-quiz-prompt" role="status">
              {won
                ? `答对啦！就是「${item.label}」（${item.caption} · ${item.reading}）！`
                : wrongId
                  ? `不是「${wrongId}」哦，再听一次，看看画面里的提示。`
                  : "听读音，选择对应的拼音。"}
            </p>
            {!won && !showHint && (
              <button className="scenic-tool-btn quiz-hint-button" type="button" onClick={() => setAskedForHint(true)}>给我提示</button>
            )}
            {!won && showHint && (
              <p role="status">提示：{item.caption}，选「{item.label}」。</p>
            )}
            <div className="pinyin-quiz-options" role="group" aria-label="选择正确的拼音">
              {game.alternatives.map((alt) => {
                const isRight = won && alt.id === item.id;
                const isWrong = wrongId === alt.label;
                const isHinted = !won && showHint && alt.id === item.id;
                return (
                  <button
                    key={alt.id}
                    type="button"
                    className={[
                      "pinyin-option-card",
                      isRight ? "is-right" : "",
                      isWrong ? "is-wrong" : "",
                      isHinted ? "is-hinted" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-label={"选择拼音 " + alt.label}
                    disabled={won || rt.voiceFailed}
                    onClick={() => pickQuiz(alt.id, alt.label)}
                  >
                    <FourLineGrid text={alt.label} />
                    {won && alt.id === item.id && (
                      <small className="pinyin-option-word">
                        {alt.caption} · {alt.reading}
                      </small>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {!conceal && (
        <footer className="scenic-story-foot">
          <p className="scenic-story-whisper">
            <strong>拼音小口诀：</strong>
            {scene.rhyme} · {scene.mouthTip}
          </p>

          {game.stampFeedback}
          {won && (
            <div className="scenic-finish-banner" role="status">
              <span className="scenic-finish-badge">
                <ChildIcon name="check" />
                学会「{item.label}」啦！
              </span>
              <button
                type="button"
                className="scenic-replay-btn"
                onClick={replay}
              >
                <ChildIcon name="replay" />
                <span>再练一次</span>
              </button>
              <button
                type="button"
                className="scenic-next-btn"
                onClick={next}
              >
                <span>{nextLabel ?? "下一张"}</span>
                <ChildIcon name="next" />
              </button>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}
