import { QuizAudioRetry } from "./QuizAudioRetry";
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
  englishBackdropUrls,
  englishScenes,
  type EnglishScene,
} from "@lingyi-classroom/content/english-scenes";
import { ChildIcon } from "../ChildIcon";
import { PoemAtmosphereLayer } from "./PoemDramas";
import { playVoice, type RoundProps } from "./types";
import { useReducedMotion } from "./useReducedMotion";
import "./scenic-theater.css";
import "./english-theater.css";

const EnglishStage3D = lazy(() =>
  import("./EnglishStage3D")
    .then((m) => ({ default: m.EnglishStage3D }))
    .catch(() => ({ default: () => null })),
);

const fallbackScene: EnglishScene = {
  group: "动物",
  backdrop: "canopy",
  time: "day",
  atmosphere: "clouds",
  phonics: "w · o · r · d",
  phrase: "Let's learn English!",
  phraseZh: "一起来学英语吧！",
  story: "看画听英语，记住身边的英语词。",
  heroArt: "art/wordbook/painted/book.webp",
  layers: [],
};

export function EnglishTheater(game: RoundProps) {
  const { item, onWin, next, nextLabel, replay, runtime: rt } = game;
  const scene = englishScenes[item.id] ?? fallbackScene;
  const bgUrl = englishBackdropUrls[scene.backdrop];
  const reduced = useReducedMotion();

  const [mode, setMode] = useState<"story" | "spell" | "quiz">("story");
  const [usedTiles, setUsedTiles] = useState<number[]>([]);
  const [wrongTileIdx, setWrongTileIdx] = useState<number | null>(null);
  const [spellHint, setSpellHint] = useState("");
  const [wrongChoiceId, setWrongChoiceId] = useState("");
  const [askedForHint, setAskedForHint] = useState(false);
  const [misses, setMisses] = useState(0);
  const [won, setWon] = useState(false);
  const [flash, setFlash] = useState(false);
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

  const letters = useMemo(() => Array.from(item.label.toLowerCase()), [item.label]);
  const tiles = useMemo(() => {
    const arr = letters.map((ch, idx) => ({ ch, idx }));
    let seed = Array.from(item.id).reduce(
      (acc, c) => (acc * 31 + c.charCodeAt(0)) >>> 0,
      7,
    );
    for (let i = arr.length - 1; i > 0; i--) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const j = seed % (i + 1);
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    if (arr.length > 1 && arr.every((t, i) => t.ch === letters[i])) {
      [arr[0], arr[arr.length - 1]] = [arr[arr.length - 1], arr[0]];
    }
    return arr;
  }, [item.id, letters]);

  const placedCount = usedTiles.length;
  const spelled = placedCount >= letters.length;

  useEffect(() => {
    if (navigator.userActivation?.hasBeenActive) speak(item.audio);
  }, [item.audio, speak]);

  const listen = useCallback(() => {
    rt.listen(item.audio);
  }, [item.audio, rt]);

  const pickTile = useCallback(
    (tile: { ch: string; idx: number }) => {
      if (spelled || usedTiles.includes(tile.idx)) return;
      const expected = letters[placedCount];
      if (tile.ch === expected) {
        const nextUsed = [...usedTiles, tile.idx];
        setUsedTiles(nextUsed);
        setWrongTileIdx(null);
        setSpellHint("");
        if (nextUsed.length >= letters.length) {
          rt.sound("chime");
          rt.speak(item.audio);
          setCelebrateSeq((s) => s + 1);
        } else {
          rt.sound("touch");
        }
      } else {
        setWrongTileIdx(tile.idx);
        setSpellHint("再想想下一个字母是哪一个哦！");
        rt.speak(playVoice("gentle"));
      }
    },
    [item.audio, letters, placedCount, rt, spelled, usedTiles],
  );

  useEffect(() => {
    if (mode !== "spell" || spelled) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const key = e.key.toLowerCase();
      if (!/^[a-z]$/.test(key)) return;
      const match = tiles.find(
        (t) => !usedTiles.includes(t.idx) && t.ch === key,
      );
      if (match) {
        e.preventDefault();
        pickTile(match);
      } else {
        setSpellHint(`这个单词里没有字母「${key}」哦！`);
        rt.speak(playVoice("gentle"));
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode, pickTile, rt, spelled, tiles, usedTiles]);

  function switchMode(nextMode: "story" | "spell" | "quiz") {
    setMode(nextMode);
    if (nextMode === "quiz") {
      rt.speak(item.audio, playVoice("english-shot"));
    } else {
      rt.speak(item.audio);
    }
  }

  function resetSpell() {
    setUsedTiles([]);
    setWrongTileIdx(null);
    setSpellHint("");
    listen();
  }

  function hintNextLetter() {
    if (spelled) return;
    const expected = letters[placedCount];
    const match = tiles.find(
      (t) => !usedTiles.includes(t.idx) && t.ch === expected,
    );
    if (match) pickTile(match);
  }

  function pickQuiz(optionId: string) {
    if (won) return;
    if (optionId === item.id) {
      setWon(true);
      setWrongChoiceId("");
      setFlash(!reduced);
      setCelebrateSeq((s) => s + 1);
      rt.sound("shutter");
      rt.speak(playVoice("photo-good"), item.audio);
      if (!wonRef.current) {
        wonRef.current = true;
        onWin();
      }
      if (!reduced) {
        rt.later(420, () => setFlash(false));
      }
    } else {
      setWrongChoiceId(optionId);
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
    listen();
  }

  const phaseLabel = won
    ? "拍到啦"
    : mode === "spell"
      ? spelled
        ? "拼对啦"
        : "拼一拼"
      : mode === "quiz"
        ? "听词找图"
        : item.group;


  return (
    <article
      className="scenic-theater english-theater"
      aria-label={mode === "quiz" && !won ? "英语绘本馆听辨练习" : item.label + " · 英语绘本馆"}
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
          flash ? "en-shutter-flash" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-scene="english"
        data-renderer={glReady ? "three-2.5d" : "illustration-2d"}
        onClick={interactStage}
      >
        {!reduced && (
          <Suspense fallback={null}>
            <EnglishStage3D
              itemId={item.id}
              scene={scene}
              celebrateSeq={celebrateSeq}
              won={won}
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
          {scene.swatchColor && !conceal && (
            <div
              className="english-color-aura"
              style={{ "--swatch-color": scene.swatchColor } as CSSProperties}
              aria-hidden="true"
            />
          )}
          <div className="scenic-storyboard" hidden={conceal}>
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

          <PoemAtmosphereLayer
            atmosphere={scene.atmosphere === "clouds" ? "clouds" : scene.atmosphere}
            paused={paused || reduced}
          />
        </div>

        <div className="scenic-seal english-seal" aria-hidden="true">
          <small>{item.group}</small>
          <span className="english-seal-row">
            {scene.swatchColor && !(mode === "quiz" && !won) && (
              <span
                className="english-seal-swatch"
                style={{
                  background: scene.swatchColor,
                  borderColor: scene.swatchBorder ?? "rgba(60, 74, 52, 0.35)",
                }}
              />
            )}
            <strong lang="en">
              {mode === "quiz" && !won ? "???" : item.label}
            </strong>
          </span>
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
          {mode === "story" ? (
            <span>
              <span lang="en">{scene.phrase}</span> · {scene.phraseZh}
            </span>
          ) : mode === "spell" ? (
            <span>
              {spelled
                ? `拼出 ${item.label}（${item.caption}）啦！`
                : spellHint || "点字母，拼出这个英语词！"}
            </span>
          ) : won ? (
            <span>
              拍到啦！<span lang="en">{item.label}</span> — {item.caption}！
            </span>
          ) : wrongChoiceId ? (
            <span>再听一次英语，换一张画拍拍看！</span>
          ) : (
            <span>听英语，点出对应的水彩图画！</span>
          )}
        </div>
      </div>

      <div className="scenic-controls-bar">
        <button
          type="button"
          className="scenic-primary-btn"
          onClick={listen}
        >
          <ChildIcon name="sound" />
          <span>听英语</span>
        </button>

        <div
          className="scenic-mode-group"
          role="group"
          aria-label="英语学习模式"
        >
          <button
            type="button"
            className="scenic-tool-btn"
            aria-pressed={mode === "story"}
            onClick={() => switchMode("story")}
          >
            <span>看画听词</span>
          </button>
          <button
            type="button"
            className="scenic-tool-btn"
            aria-pressed={mode === "spell"}
            onClick={() => switchMode("spell")}
          >
            <span>拼一拼</span>
          </button>
          <button
            type="button"
            className="scenic-tool-btn"
            aria-pressed={mode === "quiz"}
            onClick={() => switchMode("quiz")}
          >
            <span>听词找图</span>
          </button>
        </div>

        <button
          type="button"
          className="scenic-tool-btn icon-only"
          aria-label="重播单词和画面"
          onClick={() => {
            setTapSignal((prev) => ({ x: 0.5, y: 0.48, seq: (prev?.seq ?? 0) + 1 }));
            listen();
          }}
        >
          <ChildIcon name="replay" />
        </button>
      </div>

      <div className="scenic-deck english-deck">
        {mode === "story" && (
          <div className="english-story-panel">
            <button
              type="button"
              className="english-word-hero"
              aria-label={`听英语单词 ${item.label}，意思是 ${item.caption}`}
              onClick={listen}
            >
              <img
                className="english-hero-art"
                src={"./" + scene.heroArt}
                alt=""
              />
              <span className="english-hero-copy">
                <span className="english-hero-top">
                  {scene.swatchColor && (
                    <span
                      className="english-hero-swatch"
                      style={{
                        background: scene.swatchColor,
                        borderColor:
                          scene.swatchBorder ?? "rgba(56, 72, 48, 0.35)",
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <strong lang="en">{item.label}</strong>
                </span>
                <span className="en-phonics" lang="en">
                  {scene.phonics}
                </span>
                <span className="en-meaning">{item.caption}</span>
              </span>
            </button>

            <div className="english-phrase-box">
              <p className="english-phrase-en" lang="en">
                {scene.phrase}
              </p>
              <p className="english-phrase-zh">{scene.phraseZh}</p>
              <div className="english-story-actions">
                <button
                  type="button"
                  className="scenic-tool-btn"
                  onClick={() => switchMode("spell")}
                >
                  <span>去拼单词</span>
                  <ChildIcon name="next" />
                </button>
                <button
                  type="button"
                  className="scenic-primary-btn"
                  onClick={() => switchMode("quiz")}
                >
                  <ChildIcon name="choose" />
                  <span>听词找图拿印章</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === "spell" && (
          <div className="english-spell-panel">
            <div className="english-spell-target">
              <img src={"./" + scene.heroArt} alt="" />
              <span>{item.caption}</span>
              <span className="en-phonics" lang="en">
                {scene.phonics}
              </span>
            </div>

            <div
              className="english-letter-slots"
              aria-label="拼写进度"
              lang="en"
            >
              {letters.map((ch, i) => {
                const filled = i < placedCount;
                const active = !spelled && i === placedCount;
                return (
                  <span
                    key={i}
                    className={[
                      "en-slot",
                      filled ? "is-filled" : "",
                      active ? "is-active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {filled ? ch : ""}
                  </span>
                );
              })}
            </div>

            <div
              className="english-tile-row"
              role="group"
              aria-label="点击字母拼单词"
            >
              {tiles.map((tile) => {
                const used = usedTiles.includes(tile.idx);
                const wrong = wrongTileIdx === tile.idx;
                return (
                  <button
                    key={tile.idx}
                    type="button"
                    lang="en"
                    className={[
                      "en-tile-btn",
                      used ? "is-used" : "",
                      wrong ? "is-wrong" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={used || spelled}
                    aria-label={"字母 " + tile.ch}
                    onClick={() => pickTile(tile)}
                  >
                    {tile.ch}
                  </button>
                );
              })}
            </div>

            <p className="english-spell-status" role="status">
              {spelled
                ? `拼对啦！${item.label} · ${item.caption}`
                : spellHint || "按顺序点选或敲键盘字母拼出单词。"}
            </p>

            <div className="english-story-actions">
              {!spelled ? (
                <button
                  type="button"
                  className="scenic-tool-btn"
                  onClick={hintNextLetter}
                >
                  <span>提示一个字母</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="scenic-tool-btn"
                  onClick={resetSpell}
                >
                  <ChildIcon name="replay" />
                  <span>再拼一次</span>
                </button>
              )}
              <button
                type="button"
                className="scenic-primary-btn"
                onClick={() => switchMode("quiz")}
              >
                <ChildIcon name="choose" />
                <span>去听词找图拿印章</span>
              </button>
            </div>
          </div>
        )}

        {mode === "quiz" && (
          <div className="english-quiz-panel">
            {rt.voiceFailed && !won && <QuizAudioRetry retry={listen} />}
            <p className="english-quiz-prompt" role="status">
              {won ? (
                <>
                  拍到啦！<span lang="en">{item.label}</span> 就是「
                  {item.caption}」！
                </>
              ) : wrongChoiceId ? (
                "再听一次英语，换一张画拍拍看！"
              ) : (
                "听到哪个英语词？点一点对应的绘本图画："
              )}
            </p>

            {!won && !showHint && (
              <button className="scenic-tool-btn quiz-hint-button" type="button" onClick={() => setAskedForHint(true)}>给我提示</button>
            )}
            {!won && showHint && (
              <p role="status">提示：{item.caption}，选「{item.label}」。</p>
            )}
            <div
              className="english-quiz-options"
              role="group"
              aria-label="选择匹配的英语图画"
            >
              {game.alternatives.map((alt) => {
                const altScene = englishScenes[alt.id];
                const isRight = won && alt.id === item.id;
                const isWrong = wrongChoiceId === alt.id;
                const isHinted = !won && showHint && alt.id === item.id;
                return (
                  <button
                    key={alt.id}
                    type="button"
                    className={[
                      "english-photo-card",
                      isRight ? "is-right" : "",
                      isWrong ? "is-wrong" : "",
                      isHinted ? "is-hinted" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    aria-label={"给" + alt.caption + "拍照"}
                    disabled={won || rt.voiceFailed}
                    onClick={() => pickQuiz(alt.id)}
                  >
                    <span className="photo-frame">
                      {altScene?.swatchColor && (
                        <span
                          className="photo-swatch-badge"
                          style={{
                            background: altScene.swatchColor,
                            borderColor:
                              altScene.swatchBorder ??
                              "rgba(56, 72, 48, 0.35)",
                          }}
                          aria-hidden="true"
                        />
                      )}
                      <img
                        src={
                          "./" +
                          altScene.heroArt
                        }
                        alt=""
                      />
                    </span>
                    {won && (
                      <span className="photo-reveal">
                        <strong lang="en">{alt.label}</strong>
                        <small>{alt.caption}</small>
                      </span>
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
            <strong>画面小故事：</strong>
            {scene.story}
          </p>

          {game.stampFeedback}
          {won && (
            <div className="scenic-finish-banner" role="status">
              <span className="scenic-finish-badge">
                <ChildIcon name="check" />
                学会「<span lang="en">{item.label}</span>」啦！
              </span>
              <button
                type="button"
                className="scenic-replay-btn"
                onClick={replay}
              >
                <ChildIcon name="replay" />
                <span>再玩一次</span>
              </button>
              <button
                type="button"
                className="scenic-next-btn"
                onClick={next}
              >
                <span>{nextLabel ?? "下一个"}</span>
                <ChildIcon name="next" />
              </button>
            </div>
          )}
        </footer>
      )}
    </article>
  );
}
