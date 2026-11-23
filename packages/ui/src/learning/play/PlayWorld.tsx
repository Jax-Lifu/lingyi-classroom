import { usePlaySound } from "../usePlaySound";
import type { StampResult } from "../usePracticeRecord";
import { ChildIcon } from "../ChildIcon";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  cardsHref,
  lessonHref,
  playable,
  subjectHref,
  groupTitle,
  type LessonGroup,
} from "../childCatalog";
import {
  lessonChoices,
  learningStampVersion,
  type Lesson,
  type Platform,
  type Subject,
} from "@lingyi-classroom/shared";
import { NatureLetters, natureWords } from "./NatureLetters";
import { Fishing, Orchard, PicnicShop } from "./FoodGames";
import { destinations, type RoundProps } from "./types";
import { SpeakerIcon } from "./Stage";
import { usePlayRuntime } from "./usePlayRuntime";
import "./play.css";
import { WordBook } from "./WordBook";
import { WordFeed } from "./WordFeed";
import { explorations, explorationFor, type Exploration } from "./explorations";
import { WindLesson, BoatLesson, PencilLesson } from "./ExplorationLessons";

const PinyinTheater = lazy(() =>
  import("./PinyinTheater").then((m) => ({ default: m.PinyinTheater })),
);
const EnglishTheater = lazy(() =>
  import("./EnglishTheater").then((m) => ({ default: m.EnglishTheater })),
);
const PoemTheater = lazy(() =>
  import("./PoemTheater").then((m) => ({ default: m.PoemTheater })),
);
const NumberBlocksMath = lazy(() =>
  import("./NumberBlocksMath").then((m) => ({ default: m.NumberBlocksMath })),
);

const natureTitles: Record<string, string> = {
  木: "种出一个木",
  林: "两棵树成林",
  山: "三峰变成山",
  日: "太阳升起来",
  月: "月亮升起来",
};
interface Props {
  explore?: boolean;
  subject: Subject;
  item: Lesson;
  group: LessonGroup;
  platform: Platform;
  navigate: (href: string, replace?: boolean) => void;
  resetVersion: number;
  mark: (id: string, version: number) => Promise<StampResult>;
}
const stampMessages = {
  saving: "正在保存学习印章…",
  saved: "已收下学习印章。",
  failed: "回合已完成，学习印章尚未保存。",
  reset: "本回合已结束，学习印章已重置。",
};

function GameRound(
  props: Omit<RoundProps, "runtime" | "onWin" | "stampFeedback" | "stampSaved"> & {
    readResetVersion: () => number;
    saveStamp: (version: number) => Promise<StampResult>;
    resetVersion: number;
    picnic: boolean;
    outing: boolean;
    announce: boolean;
    experiment?: Exploration;
    onUnmute?: () => void;
  },
) {
  const runtime = usePlayRuntime(props.muted, props.onUnmute);
  useEffect(() => {
    if (props.announce && !props.muted) runtime.speak(props.item.audio);
  }, [props.announce, props.muted, props.item.audio, runtime.speak]);
  const completedAt = useRef<number | null>(null);
  const saving = useRef(false);
  const [result, setResult] = useState<StampResult | "saving" | null>(null);
  const message = useRef<HTMLDivElement>(null);
  const status = completedAt.current !== null && props.resetVersion > completedAt.current ? "reset" : result;
  useEffect(() => {
    if (status === "failed") message.current?.scrollIntoView?.({ block: "nearest" });
  }, [status]);
  async function save() {
    if (saving.current) return;
    saving.current = true;
    setResult("saving");
    try {
      // A fresh completion can follow a reset before the other tab's storage
      // event reaches React. Retries must keep the original completion version.
      completedAt.current ??= props.readResetVersion();
      setResult(await props.saveStamp(completedAt.current));
    } catch {
      completedAt.current ??= props.resetVersion;
      setResult("failed");
    } finally {
      saving.current = false;
    }
  }
  function onWin() {
    if (completedAt.current === null) void save();
  }
  const stampFeedback = status && (
    <div className="round-stamp-feedback" ref={message}>
      <span role="status">{stampMessages[status]}</span>
      {status === "failed" && <button className="plain-button" onClick={() => void save()}>重试保存</button>}
    </div>
  );
  const game = { ...props, runtime, onWin, stampFeedback, stampSaved: status === "saved" };
  if (props.experiment === "wind") return <WindLesson {...game} />;
  if (props.experiment === "boat") return <BoatLesson {...game} />;
  if (props.experiment === "pencil") return <PencilLesson {...game} />;
  switch (game.subject) {
    case "hanzi":
      if (!props.outing) return <WordBook {...game} />;
      return natureWords.has(game.item.label) ? (
        <NatureLetters {...game} />
      ) : (
        <Fishing {...game} />
      );
    case "numbers":
      return <Orchard {...game} />;
    case "math":
      if (props.picnic) return <PicnicShop {...game} />;
      return (
        <Suspense fallback={null}>
          <NumberBlocksMath {...game} />
        </Suspense>
      );
    case "pinyin":
      return (
        <Suspense fallback={null}>
          <PinyinTheater {...game} />
        </Suspense>
      );
    case "poems":
      return (
        <Suspense fallback={null}>
          <PoemTheater {...game} />
        </Suspense>
      );
    case "english":
      return (
        <Suspense fallback={null}>
          <EnglishTheater {...game} />
        </Suspense>
      );
  }
}
export function PlayWorld({
  explore,
  subject,
  item,
  group,
  platform,
  navigate,
  mark,
  resetVersion,
}: Props) {
  const matchedIndex = group.items.findIndex((lesson) => lesson.id === item.id);
  const index =
    matchedIndex >= 0
      ? matchedIndex
      : Math.max(
          0,
          group.items.findIndex(
            (lesson) => item.poem?.url && lesson.poem?.url === item.poem.url,
          ),
        );
  const last = index === group.items.length - 1;
  const [outingId, setOutingId] = useState<string>();
  const outing = subject === "hanzi" && outingId === item.id;
  const availableExperiment = explorationFor(subject, item);
  const experiment = explore ? availableExperiment : undefined;
  const reading = subject === "hanzi" && !outing && !experiment;
  const [picnic, setPicnic] = useState(false);
  const [take, setTake] = useState(0);
  const { muted: soundSetting, changeMuted } = usePlaySound(platform.store);
  const muted = soundSetting === true;
  const [spokenItem, setSpokenItem] = useState<string>();
  const options = useMemo(
    () => subject === "hanzi" || subject === "english" || subject === "pinyin"
      ? lessonChoices(item, playable[subject]) : [],
    [item, subject, take],
  );
  const title = destinations[subject];
  const titleText = experiment
    ? explorations[experiment].title
    : outing
      ? (natureTitles[item.label] ?? "湖边烤鱼")
      : subject === "poems"
        ? item.label
        : subject === "pinyin" || subject === "english" || subject === "numbers"
          ? `${item.label} · ${item.caption}`
          : subject === "math"
            ? (picnic ? "野餐小铺" : `${item.label} = ?`)
            : title.name;
  function selectWord(lesson: Lesson) {
    setSpokenItem(lesson.id);
    navigate(lessonHref(subject, lesson), true);
  }
  function next() {
    if (last) navigate(subjectHref(subject));
    else if (reading) selectWord(group.items[index + 1]);
    else navigate(lessonHref(subject, group.items[index + 1]));
  }
  const backLink = (
    <a
      className="catalog-back lesson-back"
      href={cardsHref(subject, group.name)}
      aria-label={"回到" + groupTitle(subject, group.name)}
    >
      <ChildIcon name="back" />
      <ChildIcon name="shelf" />
      {groupTitle(subject, group.name)}
    </a>
  );
  const soundToggle = (
    <button
      className="sound-toggle"
      onClick={() => changeMuted(!muted)}
      aria-label={muted ? "开启故事声音" : "关闭故事声音"}
      aria-pressed={!muted}
    >
      <SpeakerIcon quiet={muted} />
      <span className="child-sr">声音{muted ? "关" : "开"}</span>
    </button>
  );
  const round = soundSetting !== undefined && (
    <GameRound
      key={item.id + ":" + take + ":" + outing + ":" + (experiment ?? "") + ":" + picnic}
      picnic={picnic}
      experiment={experiment}
      outing={outing}
      announce={reading && soundSetting !== undefined && spokenItem === item.id}
      subject={subject}
      item={item}
      alternatives={options}
      muted={muted}
      onUnmute={() => changeMuted(false)}
      resetVersion={resetVersion}
      readResetVersion={() => learningStampVersion(platform.store)}
      saveStamp={(version) => mark(experiment ? explorations[experiment].lessonId : item.id, version)}
      next={next}
      nextLabel={last ? "换一组" : undefined}
      replay={() => setTake((v) => v + 1)}
    />
  );
  return (
    <main
      className={
        "play-ground learning-width" + (reading ? " reading-room" : "")
      }
    >
      {reading ? (
        <WordFeed
          items={group.items}
          index={index}
          onSelect={selectWord}
          toolbar={
            <header className="reader-toolbar">
              {backLink}
              <h1 tabIndex={-1}>森林识字绘本</h1>
              {soundToggle}
            </header>
          }
        >
          {round}
        </WordFeed>
      ) : (
        <>
          {backLink}

          <div className="play-heading">
            <div className="adventure-title">
              {subject !== "hanzi" && (
                <span className="subject-ribbon">{title.subjectName}</span>
              )}
              <h1 tabIndex={-1}>
                <span className="round-lesson-name">{titleText}</span>
                {(subject === "english" || subject === "pinyin") && <span className="round-quiz-name">{title.name}</span>}
              </h1>
            </div>
            <div className="play-tools">
              {subject === "math" && (
                <button className="plain-button math-mode-switch"
                  aria-label={picnic ? "切换到数字积木" : "切换到野餐小铺"}
                  onClick={() => setPicnic(!picnic)}>
                  {picnic ? "玩数字积木" : "玩野餐小铺"}
                </button>
              )}
              <button
                className="switch-round"
                onClick={next}
                aria-label={last ? "换一组" : "换玩下一关"}
              >
                <ChildIcon name={last ? "shelf" : "next"} />
              </button>
              {soundToggle}
            </div>
          </div>
          {round}
        </>
      )}
      {subject === "english" && (
        <a
          className="art-credit"
          href="./art/wordbook/ATTRIBUTION.txt"
          target="_blank"
          rel="noreferrer"
        >
          绘本插画出处
        </a>
      )}
      {subject === "pinyin" && (
        <a
          className="art-credit"
          href="./media/pinyin/ATTRIBUTION.txt"
          target="_blank"
          rel="noreferrer"
        >
          拼音录音署名
        </a>
      )}
      {availableExperiment && (
        <a
          className="lab-entry"
          href={lessonHref(subject, item) + (experiment ? "" : "/explore")}
        >
          <img src={"./" + explorations[availableExperiment].image} alt="" />
          {experiment
            ? subject === "poems"
              ? "去听原文"
              : "回到字义绘本"
            : "动手玩 · " + explorations[availableExperiment].title}
          <ChildIcon name="next" />
        </a>
      )}
      {subject === "hanzi" && !experiment && (
        <div className="book-foot">
          <button
            className="other-story"
            onClick={() => {
              setOutingId(outing ? undefined : item.id);
              window.scrollTo({ top: 0 });
            }}
          >
            <img
              alt=""
              src={
                outing
                  ? "./art/wordbook/painted/book.webp"
                  : natureWords.has(item.label)
                    ? "./art/play/seed.webp"
                    : "./art/fish.webp"
              }
            />
            {outing
              ? "回到字义绘本"
              : "玩一玩 · " + (natureTitles[item.label] ?? "湖边烤鱼")}
          </button>
          <a
            className="art-credit"
            href="./art/wordbook/ATTRIBUTION.txt"
            target="_blank"
            rel="noreferrer"
          >
            字义插画出处
          </a>
          <a
            className="art-credit"
            href="./art/play/STROKES-LICENSE.txt"
            target="_blank"
            rel="noreferrer"
          >
            笔顺数据出处
          </a>
        </div>
      )}
    </main>
  );
}
