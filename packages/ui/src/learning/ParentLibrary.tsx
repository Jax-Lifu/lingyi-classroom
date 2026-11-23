import { topics } from "./libraryTopics";
import { pinyinCueLabel } from "./pinyinCueLabel";
import { ChildIcon } from "./ChildIcon";
import { PictureCue } from "./LottieLayer";
import { countSubjectStamps, groupTitle } from "./childCatalog";
import { WordPicture } from "./play/WordBook";
import { GlyphTrace } from "./play/GlyphTrace";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  answerFor,
  practiceChoices,
  type Lesson,
  type Subject,
} from "@lingyi-classroom/shared";
import { curriculum } from "@lingyi-classroom/content";
import { numberPictographFor } from "@lingyi-classroom/content/number-pictographs";
import { poemGroupOrder, poemScenes } from "@lingyi-classroom/content/poem-scenes";
import { pinyinScenes } from "@lingyi-classroom/content/pinyin-scenes";
import { englishScenes } from "@lingyi-classroom/content/english-scenes";
import { PinyinCardBackdrop } from "./play/PinyinCardBackdrop";
import { EnglishCardBackdrop } from "./play/EnglishCardBackdrop";
import { PoemCard } from "./PoemCard";
import { useNarration } from "./useNarration";

function DotBoard({ item }: { item: Lesson }) {
  const eq = item.equation;
  const total = eq
    ? eq.sign === "+"
      ? eq.answer
      : eq.left
    : (item.amount ?? 0);
  const length = total > 10 ? 20 : 10;
  const label = eq
    ? `${eq.left} ${eq.sign} ${eq.right} 的点阵`
    : `${total} 个圆点`;
  return (
    <div className="dot-groups" role="img" aria-label={label}>
      {Array.from({ length: length / 10 }, (_, g) => (
        <div className="ten-frame" key={g}>
          {Array.from({ length: 10 }, (_, j) => {
            const i = g * 10 + j;
            const color =
              i >= total
                ? "blank"
                : eq?.sign === "−" && i >= eq.answer
                  ? "taken"
                  : eq?.sign === "+" && i >= eq.left
                    ? "added"
                    : "filled";
            return <i key={i} className={color} />;
          })}
        </div>
      ))}
    </div>
  );
}

function PracticeCard({
  subject,
  item,
  mark,
  unmark,
  next,
  done,
  only,
  finishedGroup,
}: {
  subject: Subject;
  item: Lesson;
  mark: () => void;
  unmark?: () => void;
  next: () => void;
  done: boolean;
  only: boolean;
  finishedGroup: boolean;
}) {
  const [quiz, setQuiz] = useState(subject === "math");
  const [showStrokes, setShowStrokes] = useState(false);
  const [status, setStatus] = useState<"ready" | "wrong" | "correct">("ready");
  const [wrong, setWrong] = useState("");
  const continueButton = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    if (status === "correct") continueButton.current?.focus({ preventScroll: true });
  }, [status]);
  const voice = useNarration();
  const choices = useMemo(
    () => practiceChoices(subject, item, curriculum[subject]),
    [subject, item],
  );
  const counter = subject === "numbers" || subject === "math";
  function listen() {
    if (voice.playing) voice.stop();
    else voice.play(item.audio);
  }
  function check(label: string) {
    if (status === "correct") return;
    const match = label === answerFor(item);
    setStatus(match ? "correct" : "wrong");
    setWrong(match ? "" : label);
    if (match) mark();
    voice.play("media/math/" + (match ? "correct" : "retry") + ".mp3");
  }
  const pinyin = subject === "pinyin";
  const english = subject === "english";
  const pinyinScene = pinyin ? pinyinScenes[item.id] : undefined;
  const englishScene = english ? englishScenes[item.id] : undefined;
  const numberArt =
    subject === "numbers" && item.amount !== undefined
      ? numberPictographFor(item.amount)
      : undefined;
  const help =
    subject === "math"
      ? "数一数，选出答案。"
      : counter
        ? "这些圆点表示哪个数字？"
        : pinyin
          ? (item.exampleAudio ? "听声母，选出对应的拼音。" : "听读音或例字，选出对应的拼音。")
          : english
            ? "选出这个意思对应的英语词。"
            : "看动画，选出对应的字。";
  return (
    <article className={"practice-pad topic-" + subject} aria-label="练习题">
      <div className="pad-meta">
        <span>{item.group}</span>
        {done && unmark ? (
          <button
            type="button"
            className="stamp-toggle-btn"
            onClick={unmark}
            title="点击取消已练过标记"
          >
            ✓ 已练过
          </button>
        ) : (
          <span>{done ? "✓ 已练过" : quiz ? "找一找" : "认一认"}</span>
        )}
      </div>
      <div className="card-center">
        {quiz ? (
          <>
            {subject === "math" && (
              <div className="large-equation">
                {item.label} <span>= ?</span>
              </div>
            )}
            {counter ? (
              <DotBoard item={item} />
            ) : (
              <>
                {subject === "hanzi" && (
                  <div className="library-quiz-picture">
                    <WordPicture
                      item={item}
                      quiz
                      onPlay={() =>
                        voice.play("media/wordbook/" + item.id + ".mp3")
                      }
                    />
                  </div>
                )}
                {englishScene && (
                  <img
                    className="practice-meaning"
                    alt=""
                    src={"./" + englishScene.heroArt}
                  />
                )}
                <h2 className="quiz-clue">
                  {english
                    ? item.caption
                    : pinyin
                      ? (item.exampleAudio ? "听音找声母" : item.caption)
                      : item.reading}
                </h2>
              </>
            )}
            <p className="practice-guide">
              <ChildIcon name="choose" />
              {help}
            </p>
            <div className="answer-row">
              {choices.map((label) => (
                <button
                  key={label}
                  lang={english ? "en" : undefined}
                  className={
                    "option" +
                    (wrong === label ? " unsure" : "") +
                    (status === "correct" && label === answerFor(item)
                      ? " right"
                      : "")
                  }
                  disabled={status === "correct"}
                  onClick={() => check(label)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="response" aria-live="polite">
              {status !== "ready" && (
                <PictureCue kind={status === "correct" ? "stamp" : "retry"} />
              )}
              {status === "correct"
                ? "答对啦！"
                : status === "wrong"
                  ? "再试一次。"
                  : " "}
            </p>
          </>
        ) : subject === "hanzi" ? (
          <div className="library-word">
            <div>
              <span className="transcription">{item.reading}</span>
              <h2 className="big-label">{item.label}</h2>
              <p>{item.caption}</p>
              <button
                type="button"
                className="plain-button practice-stroke-btn"
                onClick={() => setShowStrokes((v) => !v)}
              >
                {showStrokes ? "收起笔顺" : "看笔顺"}
              </button>
            </div>
            {showStrokes ? (
              <GlyphTrace
                word={item.label}
                caption={item.caption}
                repeat={listen}
              />
            ) : (
              <WordPicture
                item={item}
                onPlay={() => voice.play("media/wordbook/" + item.id + ".mp3")}
              />
            )}
          </div>
        ) : (
          <>
            {pinyin && pinyinScene && (
              <div className="practice-scenic-frame" aria-hidden="true">
                <PinyinCardBackdrop itemId={item.id} eager />
              </div>
            )}
            {english && englishScene && (
              <div className="practice-scenic-frame" aria-hidden="true">
                <EnglishCardBackdrop itemId={item.id} eager />
              </div>
            )}
            {item.reading && !pinyin && (
              <span className="transcription">{item.reading}</span>
            )}
            {english && englishScene?.phonics && (
              <span className="transcription" lang="en">
                {englishScene.phonics}
              </span>
            )}
            <h2
              lang={english ? "en" : undefined}
              className={"big-label" + (english ? " english-word" : "")}
            >
              {english && englishScene?.swatchColor && (
                <span
                  className="color-swatch-dot"
                  style={{
                    background: englishScene.swatchColor,
                    borderColor:
                      englishScene.swatchBorder ?? "rgba(62, 82, 65, 0.35)",
                  }}
                  aria-hidden="true"
                />
              )}
              {item.label}
            </h2>
            {counter ? (
              <>
                {numberArt && (
                  <div className="practice-number-art">
                    <img src={"./" + numberArt.image} alt="" />
                    <span>{numberArt.mnemonic}</span>
                  </div>
                )}
                <DotBoard item={item} />
              </>
            ) : (
              <div className="example">
                {!english && item.icon && (
                  <span aria-hidden="true">{item.icon} </span>
                )}
                {pinyin ? pinyinCueLabel(item) : item.caption}
              </div>
            )}
            {pinyin && pinyinScene && (
              <p className="practice-helper-note">
                {pinyinScene.rhyme} · {pinyinScene.mouthTip}
              </p>
            )}
            {english && englishScene && (
              <p className="practice-helper-note">
                <span lang="en">{englishScene.phrase}</span> ·{" "}
                {englishScene.phraseZh}
              </p>
            )}
            {counter && <p className="example">{item.caption}</p>}
          </>
        )}
      </div>
      {finishedGroup && <p role="status" className="response">这组练完了</p>}
      <div className="card-actions">
        <button className="plain-button" onClick={listen}>
          <ChildIcon name={voice.playing ? "stop" : "sound"} />
          {voice.playing
            ? "停止"
            : subject === "math"
              ? "听题"
              : (item.voiceLabel ?? "听一听")}
        </button>
        {!quiz && item.exampleAudio && item.exampleAudio !== item.audio && (
          <button className="plain-button" onClick={() => voice.play(item.exampleAudio)}>听字音「{item.caption}」</button>
        )}
        <button
          className="leaf-button"
          ref={continueButton}
          onClick={() => {
            if (finishedGroup) next();
            else if (!quiz) {
              setQuiz(true);
              voice.play(item.audio);
            } else next();
          }}
        >
          <ChildIcon name={quiz ? (only ? "replay" : "next") : "choose"} />
          {finishedGroup ? "回到选课目录" : quiz ? (only ? "再练一次" : "下一题") : "试试看"}
        </button>
      </div>
      {voice.error && (
        <p className="response" role="status">
          {voice.error}
        </p>
      )}
    </article>
  );
}

type MasteryFilter = "all" | "todo" | "done";

export interface LibraryView {
  lessonId?: string;
  group: string;
  query: string;
  statusFilter: MasteryFilter;
  limit: number;
  directoryTop: number;
  pageTop: number;
}

function libraryGroup(item: Lesson) {
  if (!item.poem) return item.group;
  const { grade, volume } = item.poem;
  return "一二三四五六"[grade - 1] + "年级" + volume + "册";
}

export function ParentLibrary({
  subject,
  home,
  done,
  mark,
  unmark,
  startGame,
  initialId,
  initialView,
  entryHash,
}: {
  subject: Subject;
  home: () => void;
  startGame: (id: string, view: LibraryView) => void;
  initialView?: LibraryView;
  entryHash?: string;
  initialId?: string;
  done: Set<string>;
  mark: (id: string) => void;
  unmark: (id: string) => void;
}) {
  const all = curriculum[subject];
  const topic = topics[subject];
  const [group, setGroup] = useState(initialView?.group ?? "");
  const [query, setQuery] = useState(initialView?.query ?? "");
  const [statusFilter, setStatusFilter] = useState<MasteryFilter>(initialView?.statusFilter ?? "all");
  const restoredId = initialView?.lessonId ?? initialId;
  const [retainedId, retain] = useState(initialView ? restoredId : undefined);
  const directory = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);
  const focusNext = useRef<"stage" | "directory" | null>(null);
  const restoreScroll = useRef(initialView?.directoryTop);
  const [id, setId] = useState(
    restoredId ||
    topic.first ||
      all.find((x) => x.label === "咏鹅")?.id ||
      all[0].id,
  );
  const [limit, setLimit] = useState(initialView?.limit ?? 24);
  const [round, setRound] = useState(0);
  const groups = useMemo(
    () => Array.from(new Set(all.map(libraryGroup))),
    [all],
  );
  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter(
      (x) =>
        (!group ||
          libraryGroup(x) === group ||
          (subject === "poems" && poemScenes[x.id]?.group === group)) &&
        (statusFilter === "all" ||
          ((!x.poem || x.poem.lines.length > 0) &&
            (x.id === retainedId || (statusFilter === "done" ? done.has(x.id) : !done.has(x.id))))) &&
        (!q ||
          [x.label, x.caption, x.reading, x.initialReading, x.poem?.author].some((t) =>
            t?.toLowerCase().includes(q),
          )),
    );
  }, [all, done, group, query, retainedId, statusFilter, subject]);
  const { learned: learnedInSubject, total: totalInSubject } = useMemo(
    () => countSubjectStamps(subject, done),
    [subject, done],
  );
  const at = Math.max(
    0,
    list.findIndex((v) => v.id === id),
  );
  const item = list[at];
  const captureView = useCallback((): LibraryView => ({
    group, query, statusFilter, lessonId: item?.id ?? id,
    limit: Math.max(limit, at + 1),
    directoryTop: directory.current?.scrollTop ?? 0, pageTop: window.scrollY,
  }), [group, query, statusFilter, item?.id, id, limit, at]);

  useEffect(() => {
    if (!entryHash) return;
    const entries = directory.current;
    let timer: number | undefined;
    const remember = () => {
      if (window.location.hash === entryHash) {
        history.replaceState({ ...history.state, parentLibrary: { ...captureView(), href: entryHash } }, "");
      }
    };
    const afterScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(remember, 150);
    };
    remember();
    entries?.addEventListener("scroll", afterScroll);
    window.addEventListener("scroll", afterScroll);
    window.addEventListener("pagehide", remember);
    return () => {
      window.clearTimeout(timer);
      entries?.removeEventListener("scroll", afterScroll);
      window.removeEventListener("scroll", afterScroll);
      window.removeEventListener("pagehide", remember);
    };
  }, [entryHash, captureView]);
  const finishedGroup = !!item && retainedId === item.id && statusFilter === "todo" && done.has(item.id) && list.length === 1;
  useLayoutEffect(() => {
    if (directory.current && list.length && restoreScroll.current !== undefined) {
      directory.current.scrollTop = restoreScroll.current;
      restoreScroll.current = undefined;
    }
    if (focusNext.current === "stage") stage.current?.focus({ preventScroll: true });
    if (focusNext.current === "directory") directory.current?.querySelector<HTMLButtonElement>('[aria-current="true"]')?.focus();
    focusNext.current = null;
  }, [item?.id, list, round]);
  function select(id: string) {
    retain(undefined);
    setId(id);
  }
  function step(dir: number) {
    if (list.length) select(list[(at + dir + list.length) % list.length].id);
  }
  function backToDirectory() {
    focusNext.current = "directory";
    setStatusFilter("all");
    if (item) {
      setLimit(Math.max(limit, all.indexOf(item) + 1));
      select(item.id);
    }
  }
  function markCurrent(lesson: Lesson) {
    if (statusFilter === "todo") {
      retain(lesson.id);
      setId(lesson.id);
    }
    mark(lesson.id);
  }
  return (
    <>
      <div className="room-heading">
        <button className="back-link" onClick={home}>
          ‹ 回森森森林
        </button>
        {item && (!item.poem || item.poem.lines.length > 0) && (
          <button
            className="leaf-button launch-game"
            onClick={() => startGame(item.id, captureView())}
          >
            用这项玩游戏
          </button>
        )}
        <div>
          <h1 tabIndex={-1}>{topic.name}</h1>
          <span>
            {all.length} {topic.unit}
            {learnedInSubject > 0
              ? ` · 已掌握 ${learnedInSubject}/${totalInSubject}`
              : ""}
          </span>
        </div>
      </div>
      <div className="workbench">
        <section ref={stage} tabIndex={-1} className="lesson-stage" aria-label="当前学习内容">
          {item ? (
            <>
              {item.poem ? (
                <PoemCard
                  key={item.id}
                  poem={item.poem}
                  done={done.has(item.id)}
                  mark={() =>
                    done.has(item.id) ? unmark(item.id) : markCurrent(item)
                  }
                />
              ) : (
                <PracticeCard
                  key={item.id + ":" + round}
                  only={list.length === 1 && !finishedGroup}
                  finishedGroup={finishedGroup}
                  subject={subject}
                  item={item}
                  done={done.has(item.id)}
                  mark={() => markCurrent(item)}
                  unmark={() => unmark(item.id)}
                  next={() => {
                    if (finishedGroup) return backToDirectory();
                    focusNext.current = "stage";
                    if (list.length === 1) setRound((r) => r + 1);
                    else step(1);
                  }}
                />
              )}
              {finishedGroup && item.poem && (
                <div><p role="status">这组练完了</p><button className="plain-button" onClick={backToDirectory}>回到选课目录</button></div>
              )}
              <div className="pagination">
                <button
                  className="plain-button"
                  disabled={list.length < 2}
                  onClick={() => step(-1)}
                >
                  ‹ 上一个
                </button>
                <span>
                  {at + 1} / {list.length}
                </span>
                <button
                  className="plain-button"
                  disabled={list.length < 2}
                  onClick={() => step(1)}
                >
                  下一个 ›
                </button>
              </div>
            </>
          ) : (
            <div className="practice-pad no-result">
              <h2>没有找到符合条件的课目</h2>
              <button
                className="plain-button"
                onClick={() => {
                  retain(undefined);
                  setGroup("");
                  setQuery("");
                  setStatusFilter("all");
                }}
              >
                查看全部
              </button>
            </div>
          )}
        </section>
        <aside className="directory" aria-label="选课目录">
          <h2>{subject === "poems" ? "选一篇" : "选练习"}</h2>
          <label>
            分组
            <select
              value={group}
              onChange={(e) => {
                retain(undefined);
                setGroup(e.target.value);
                setLimit(24);
              }}
            >
              <option value="">全部分组</option>
              {subject === "poems" ? (
                <>
                  <optgroup label="森森森林主题">
                    {poemGroupOrder.map((g) => (
                      <option key={"theme-" + g} value={g}>
                        {g}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="教材年级">
                    {groups.map((g) => (
                      <option key={"grade-" + g} value={g}>
                        {g}
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : (
                groups.map((g) => {
                  const childName = groupTitle(subject, g);
                  return (
                    <option key={g} value={g}>
                      {childName !== g ? `${g}（${childName}）` : g}
                    </option>
                  );
                })
              )}
            </select>
          </label>
          <label>
            查找
            <input
              type="search"
              value={query}
              placeholder={
                subject === "poems" ? "篇名或作者" : "输入字、词或读音"
              }
              onChange={(e) => {
                retain(undefined);
                setQuery(e.target.value);
                setLimit(24);
              }}
            />
          </label>
          <div className="status-filter" role="group" aria-label="掌握状态筛选">
            {(
              [
                ["all", "全部"],
                ["todo", "未掌握"],
                ["done", "已掌握"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                className={
                  "filter-chip" + (statusFilter === key ? " active" : "")
                }
                aria-pressed={statusFilter === key}
                onClick={() => {
                  retain(undefined);
                  setStatusFilter(key);
                  setLimit(24);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="entry-list" ref={directory}>
            {list.slice(0, limit).map((v) => (
              <button
                className={"entry" + (v.id === item?.id ? " selected" : "")}
                key={v.id}
                aria-current={v.id === item?.id ? "true" : undefined}
                onClick={() => select(v.id)}
              >
                <span>{v.label}</span>
                {v.initialReading && <small>{pinyinCueLabel(v)}</small>}
                {v.poem && (
                  <small>
                    {v.poem.author} · {v.group.match(/[（(](.+)[）)]$/)?.[1] ?? "正文"}
                    {!v.poem.lines.length ? " · 仅索引" : ""}
                  </small>
                )}
                {done.has(v.id) && <i aria-label="已练过">✓</i>}
              </button>
            ))}
          </div>
          {limit < list.length && (
            <button className="more" onClick={() => setLimit((v) => v + 24)}>
              再看一些（余 {list.length - limit}）
            </button>
          )}
          {subject === "pinyin" && (
            <p className="source-note">
              声母栏也收录 y、w。点「听声母」跟读。提示字与呼读音声调不同时，点「听字音」可听到这个字的读音。
              <a
                href="./media/pinyin/ATTRIBUTION.txt"
                target="_blank"
                rel="noreferrer"
              >
                真人录音署名与许可
              </a>
            </p>
          )}
          {subject === "poems" && (
            <p className="source-note">
              同一作品可在多个教材年级收录，学习印章按作品互通。
              <a
                href="https://www.guwendao.net/gushi/xiaoxue.aspx"
                target="_blank"
                rel="noreferrer"
              >
                古文岛目录 ↗
              </a>
            </p>
          )}
        </aside>
      </div>
    </>
  );
}
