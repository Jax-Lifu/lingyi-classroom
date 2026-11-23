import { ChildIcon } from "../ChildIcon";
import { LottieLayer, PictureCue } from "../LottieLayer";
import { wordFilm } from "../motionFilm";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  wordScenes,
  type SceneSetting,
} from "@lingyi-classroom/content/word-scenes";
import type { Lesson } from "@lingyi-classroom/shared";
import { GlyphTrace } from "./GlyphTrace";
import { SpeakerIcon } from "./Stage";
import type { RoundProps } from "./types";
import "./wordbook.css";

const scenery: Record<SceneSetting, string | null> = {
  night: "art/wordbook/night.webp",
  dawn: "art/wordbook/dawn.webp",
  "dawn-sky": "art/wordbook/dawn.webp",
  "night-sky": "art/wordbook/night.webp",
  "storm-sky": "art/wordbook/storm.webp",
  storm: "art/wordbook/storm.webp",
  meadow: "art/wordbook/meadow.webp",
  pond: "art/play/pond.webp",
  clearing: "art/clearing.webp",
  paper: "art/poems/bg-spring-garden.webp",
  warm: "art/play/orchard.webp",
};

export function WordIllustration({
  item,
  replay = false,
}: {
  item: Lesson;
  replay?: boolean;
}) {
  const scene = wordScenes[item.label];
  const background = scenery[scene.setting];
  const buildFilm = useCallback(
    (host: HTMLElement) => wordFilm(host, scene),
    [scene],
  );
  const loading = replay ? "eager" : "lazy";
  return (
    <span
      className={"picture-window setting-" + scene.setting}
      aria-hidden="true"
    >
      {background && (
        <img
          className="picture-land"
          src={"./" + background}
          loading={loading}
          alt=""
        />
      )}
      <span className="picture-cast">
        {replay && <LottieLayer build={buildFilm} responsive />}
        {scene.layers.map(
          ([picture, x, y, height, motion, dx = 0, dy = 0], index) => (
            <span
              key={index}
              className="picture-track"
              style={
                {
                  "--dx": dx + "%",
                  "--dy": dy + "%",
                  "--delay": Math.min(8, index) * 110 + "ms",
                } as CSSProperties
              }
            >
              <span
                className="picture-position"
                style={{ left: x + "%", top: y + "%", height: height + "%" }}
              >
                <img
                  className="picture-actor"
                  loading={loading}
                  data-motion={motion}
                  alt=""
                  draggable={false}
                  src={"./" + picture}
                />
                {motion === "rumble" && (
                  <img
                    className="picture-bolt"
                    loading={loading}
                    alt=""
                    src={"./" + picture}
                  />
                )}
              </span>
            </span>
          ),
        )}
        {item.label === "火" && (
          <span className="embers">
            <i />
            <i />
            <i />
            <i />
          </span>
        )}
      </span>
      {replay && (
        <span className="picture-replay">
          <ChildIcon name="replay" />
        </span>
      )}
    </span>
  );
}

function ReplayPicture({
  item,
  onPlay,
  describedBy,
  children,
}: {
  item: Lesson;
  onPlay: () => void;
  describedBy: string;
  children?: React.ReactNode;
}) {
  const [edition, setEdition] = useState(0);
  return (
    <button
      type="button"
      className="word-picture"
      aria-label="重播字义动画"
      aria-describedby={describedBy}
      onClick={() => {
        setEdition((n) => n + 1);
        onPlay();
      }}
    >
      <WordIllustration key={edition} item={item} replay />
      {children}
    </button>
  );
}

export function WordPicture({
  item,
  quiz = false,
  onPlay,
}: {
  item: Lesson;
  quiz?: boolean;
  onPlay: () => void;
}) {
  const captionId = useId();
  return (
    <ReplayPicture item={item} onPlay={onPlay} describedBy={captionId}>
      <span className="picture-legend" id={captionId}>
        {quiz ? "再看一遍，找找画里的字。" : wordScenes[item.label].sentence}
      </span>
    </ReplayPicture>
  );
}

export function WordCard({
  item,
  phase = "read",
  muted,
  onPlay,
  onListen,
  onQuiz,
  children,
}: {
  item: Lesson;
  phase?: "read" | "quiz" | "won";
  muted?: boolean;
  onPlay?: () => void;
  onListen?: () => void;
  onQuiz?: () => void;
  children?: React.ReactNode;
}) {
  const captionId = useId();
  const [showStrokes, setShowStrokes] = useState(false);
  return (
    <section
      className={"word-spread phase-" + phase}
      aria-label="汉字绘本"
      data-phase={phase}
    >
      {onPlay ? (
        <ReplayPicture item={item} describedBy={captionId} onPlay={onPlay} />
      ) : (
        <div className="word-picture">
          <WordIllustration item={item} />
        </div>
      )}
      <div className="word-page">
        {phase === "read" ? (
          <>
            {showStrokes && onQuiz ? (
              <GlyphTrace
                word={item.label}
                caption={item.reading ?? item.caption}
                repeat={() => onListen?.()}
              />
            ) : (
              <button
                className="word-sample"
                aria-label={"听读“" + item.label + "”"}
                onClick={onListen}
              >
                <span className="character-grid">{item.label}</span>
                <span className="word-reading">{item.reading}</span>
                <span className="word-example">
                  <SpeakerIcon quiet={muted} />
                  {item.caption}
                </span>
              </button>
            )}
            <p className="reader-line" id={captionId}>
              {wordScenes[item.label].sentence}
            </p>
            <div className="word-read-actions">
              {onQuiz && (
                <button
                  type="button"
                  className="word-stroke-toggle"
                  aria-label={showStrokes ? "收起笔顺" : "看笔顺"}
                  onClick={() => setShowStrokes((v) => !v)}
                >
                  <small>{showStrokes ? "收起笔顺" : "看笔顺"}</small>
                </button>
              )}
              <button
                className="word-action choose-word"
                aria-label="看图选字"
                onClick={onQuiz}
              >
                <ChildIcon name="choose" />
                <small>找字</small>
              </button>
            </div>
          </>
        ) : (
          <div className="reader-result" id={captionId}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function WordBook(game: RoundProps) {
  const { item, runtime } = game;
  const [phase, setPhase] = useState<"read" | "quiz" | "won">("read");
  const [wrong, setWrong] = useState("");
  const firstAnswer = useRef<HTMLButtonElement>(null);
  const nextButton = useRef<HTMLButtonElement>(null);
  function quiz() {
    setPhase("quiz");
    runtime.speak(item.audio);
    requestAnimationFrame(() =>
      firstAnswer.current?.focus({ preventScroll: true }),
    );
  }
  function answer(label: string) {
    if (phase !== "quiz") return;
    if (label !== item.label) {
      setWrong(label);
      runtime.speak("media/math/retry.mp3", item.audio);
      return;
    }
    setPhase("won");
    runtime.sound("chime");
    runtime.speak(item.audio);
    game.onWin();
    requestAnimationFrame(() =>
      nextButton.current?.focus({ preventScroll: true }),
    );
  }
  return (
    <WordCard
      item={item}
      muted={game.muted}
      phase={phase}
      onQuiz={quiz}
      onListen={() => runtime.listen(item.audio)}
      onPlay={() =>
        runtime.speak(
          item.label === "雷" ? "media/wordbook/thunder.mp3" : undefined,
          "media/wordbook/" + item.id + ".mp3",
        )
      }
    >
      {phase === "quiz" ? (
        <div className="word-question">
          <h2>
            <ChildIcon name="choose" />
            找一找
          </h2>
          <button
            className="word-listen"
            onClick={() => runtime.listen(item.audio)}
          >
            <SpeakerIcon />
            听读音
          </button>
          <div className="word-answers">
            {game.alternatives.map((option, i) => (
              <button
                key={option.id}
                ref={i === 0 ? firstAnswer : undefined}
                className={wrong === option.label ? "try-again" : undefined}
                onClick={() => answer(option.label)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="word-response" role="status">
            {wrong && <PictureCue kind="retry" key={wrong} />}
            {wrong ? "再看一眼图，试试别的字。" : ""}
          </p>
        </div>
      ) : phase === "won" ? (
        <>
          <GlyphTrace
            word={item.label}
            caption={item.reading ?? item.caption}
            repeat={() => runtime.listen(item.audio)}
          />
          {game.stampFeedback}
          <p className="word-success" role="status">
            {game.stampSaved ? <PictureCue kind="stamp" /> : <ChildIcon name="check" />}
            <span>
              <strong>答对啦！</strong>
              <small>认出了「{item.label}」</small>
            </span>
          </p>
          <button
            className="word-action continue-word"
            ref={nextButton}
            aria-label={game.nextLabel ?? "下一个字"}
            onClick={game.next}
          >
            <ChildIcon name={game.nextLabel ? "shelf" : "next"} />
            <small>{game.nextLabel ?? "继续"}</small>
          </button>
        </>
      ) : null}
    </WordCard>
  );
}
