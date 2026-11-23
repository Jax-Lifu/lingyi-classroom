import { ForestPond } from "./ForestPond";
import { pinyinCueLabel } from "./pinyinCueLabel";
import { ChildIcon } from "./ChildIcon";
import { PictureCue } from "./LottieLayer";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  subjectIds,
  type Lesson,
  type Platform,
  type Subject,
} from "@lingyi-classroom/shared";
import {
  cardsHref,
  countSubjectStamps,
  countTotalStamps,
  groupTitle,
  groupVoice,
  hanziCovers,
  homeHref,
  lessonGroups,
  lessonHref,
  subjectHref,
  type ChildRoute,
  type LessonGroup,
} from "./childCatalog";
import { useNarration } from "./useNarration";
import { destinations } from "./play/types";
import { WordIllustration } from "./play/WordBook";
import { PoemCardBackdrop } from "./play/PoemDramas";
import { PinyinCardBackdrop } from "./play/PinyinCardBackdrop";
import { EnglishCardBackdrop } from "./play/EnglishCardBackdrop";
import { NumberCardBackdrop } from "./NumberCardBackdrop";
import { blockSpec } from "./play/numberBlocksModel";
import { explorations } from "./play/explorations";
import {
  numberPictographFor,
  type NumberPictograph,
} from "@lingyi-classroom/content/number-pictographs";
import {
  poemGroupMap,
  poemScenes,
  type PoemGroupId,
} from "@lingyi-classroom/content/poem-scenes";
import {
  pinyinGroupMap,
  pinyinScenes,
  type PinyinGroupId,
} from "@lingyi-classroom/content/pinyin-scenes";
import {
  englishGroupMap,
  englishScenes,
  type EnglishGroupId,
} from "@lingyi-classroom/content/english-scenes";
import "./play/explorations.css";
import "./catalog.css";

type BrowseRoute = Exclude<ChildRoute, { screen: "round" }>;
type Card = {
  href: string;
  name: string;
  caption: string;
  audio: string;
  art?: string;
  scene?: Lesson;
  poemId?: string;
  poemGroupCover?: string;
  scenicGroupCover?: string;
  pinyinId?: string;
  pinyinGroupCover?: string;
  pinyinMeta?: { rhyme: string };
  englishId?: string;
  englishGroupCover?: string;
  englishMeta?: {
    phrase?: string;
    swatchColor?: string;
    swatchBorder?: string;
  };
  numberArt?: NumberPictograph;
  mathEq?: Lesson["equation"];
  learned?: boolean;
  subject?: Subject;
};

const painted = "art/wordbook/painted/";
const extraGroupArt: Record<string, string> = {
  "0–10": "art/berry.webp",
  "11–20": "art/play/basket.webp",
  加法: painted + "block-tower.webp",
  减法: painted + "red-block.webp",
  声母: "art/play/bird.webp",
  韵母: "art/play/egg.webp",
  整体认读音节: "art/play/nest.webp",
  家人和身体: painted + "ear.webp",
  日常用品: painted + "chair.webp",
  颜色: painted + "palette.webp",
  动作和问候: painted + "runner.webp",
};
const scenicGroupCovers: Record<string, string> = {
  动物: "art/play/canopy.webp",
  家人: "art/play/orchard.webp",
  身体: "art/poems/bg-spring-garden.webp",
  食物: "art/wordbook/meadow.webp",
  天气四季: "art/wordbook/storm.webp",
  山水草木: "art/poems/bg-lushan-waterfall.webp",
  家里: "art/wordbook/dawn.webp",
  幼儿园: "art/clearing.webp",
  出门: "art/wordbook/meadow.webp",
  动作: "art/poems/bg-goose-pond.webp",
  位置大小: "art/wordbook/night.webp",
  数字: "art/play/orchard.webp",
  一起生活: "art/poems/bg-spring-garden.webp",
  "0–10": "art/play/orchard.webp",
  "11–20": "art/wordbook/meadow.webp",
  加法: "art/wordbook/meadow.webp",
  减法: "art/play/orchard.webp",
};
function unit(subject: Subject) {
  return subject === "hanzi"
    ? "个字"
    : subject === "poems"
      ? "篇"
      : subject === "math"
        ? "题"
        : "项";
}
function groupCard(
  subject: Subject,
  group: LessonGroup,
  done?: ReadonlySet<string>,
): Card {
  const learnedCount = done
    ? group.items.filter((item) => done.has(item.id)).length
    : 0;
  const progressText =
    learnedCount > 0 ? ` · 已学 ${learnedCount}/${group.items.length}` : "";
  const allLearned =
    group.items.length > 0 && learnedCount === group.items.length;
  if (subject === "poems") {
    const meta = poemGroupMap[group.name as PoemGroupId];
    return {
      href: cardsHref(subject, group.name),
      name: group.name,
      caption:
        (meta ? meta.subtitle + " · " : "") +
        group.items.length +
        " 篇" +
        progressText,
      audio: groupVoice(group.name),
      art: meta?.badgeArt ?? destinations.poems.image,
      poemGroupCover: meta?.cover,
      learned: allLearned,
    };
  }
  if (subject === "pinyin") {
    const meta = pinyinGroupMap[group.name as PinyinGroupId];
    return {
      href: cardsHref(subject, group.name),
      name: group.name,
      caption:
        (meta ? meta.subtitle + " · " : "") +
        group.items.length +
        " 项" +
        progressText,
      audio: groupVoice(group.name),
      art: meta?.badgeArt ?? "art/play/bird.webp",
      pinyinGroupCover: meta?.cover,
      learned: allLearned,
    };
  }
  if (subject === "english") {
    const meta = englishGroupMap[group.name as EnglishGroupId];
    return {
      href: cardsHref(subject, group.name),
      name: groupTitle(subject, group.name),
      caption:
        (meta ? meta.subtitle + " · " : "") +
        group.items.length +
        " 个词" +
        progressText,
      audio: groupVoice(group.name),
      art: meta?.badgeArt ?? "art/wordbook/painted/ginger-cat.webp",
      englishGroupCover: meta?.cover,
      learned: allLearned,
    };
  }
  const cover = hanziCovers[group.name];
  const sample = group.items
    .slice(0, 3)
    .map((x) => x.label)
    .join(" · ");
  return {
    href: cardsHref(subject, group.name),
    name: groupTitle(subject, group.name),
    caption:
      (sample ? sample + " · " : "") +
      group.items.length +
      " " +
      unit(subject) +
      progressText,
    audio: groupVoice(group.name),
    art: cover
      ? "art/wordbook/" + cover.picture + ".webp"
      : (extraGroupArt[group.name] ?? destinations[subject].image),
    scenicGroupCover: scenicGroupCovers[group.name],
    learned: allLearned,
  };
}
function itemCard(subject: Subject, item: Lesson, done: Set<string>): Card {
  const poemScene = subject === "poems" ? poemScenes[item.id] : undefined;
  const pinyinScene = subject === "pinyin" ? pinyinScenes[item.id] : undefined;
  const englishScene =
    subject === "english" ? englishScenes[item.id] : undefined;
  const numberArt =
    subject === "numbers" && item.amount !== undefined
      ? numberPictographFor(item.amount)
      : undefined;
  return {
    href: lessonHref(subject, item),
    name: item.label,
    learned: done.has(item.id),
    caption:
      subject === "hanzi"
        ? (item.reading ?? "")
        : subject === "pinyin"
          ? pinyinCueLabel(item)
          : poemScene?.shortHint
            ? item.caption + " · " + poemScene.shortHint
            : item.caption,
    audio:
      subject === "poems"
        ? "media/catalog/title-" + item.id + ".mp3"
        : item.audio!,
    scene: subject === "hanzi" ? item : undefined,
    poemId: subject === "poems" ? item.id : undefined,
    pinyinId: subject === "pinyin" ? item.id : undefined,
    pinyinMeta: pinyinScene ? { rhyme: pinyinScene.rhyme } : undefined,
    englishId: subject === "english" ? item.id : undefined,
    englishMeta: englishScene
      ? {
          phrase: englishScene.phrase,
          swatchColor: englishScene.swatchColor,
          swatchBorder: englishScene.swatchBorder,
        }
      : undefined,
    numberArt,
    mathEq: subject === "math" ? item.equation : undefined,
  };
}

function MiniBlockStack({ count }: { count: number }) {
  const spec = blockSpec(count);
  if (count === 0) return <span className="mini-zero" />;
  const cols = spec.shapes[0]?.[0] ?? 1;
  return (
    <span
      className={"mini-stack" + (count === 10 ? " is-ten-mini" : "")}
      style={
        {
          "--mini-cols": cols,
          "--mini-c": spec.accent,
        } as CSSProperties
      }
    >
      {Array.from({ length: count }, (_, idx) => (
        <i key={idx} />
      ))}
    </span>
  );
}

function MathBlockPreview({
  eq,
}: {
  eq: NonNullable<Lesson["equation"]>;
}) {
  return (
    <span className="math-blocks-preview" aria-hidden="true">
      <MiniBlockStack count={eq.left} />
      <span className="math-mini-op">{eq.sign}</span>
      <MiniBlockStack count={eq.right} />
    </span>
  );
}

function SubjectArt({ subject, src }: { subject: Subject; src: string }) {
  const framed =
    subject === "poems" || subject === "pinyin" || subject === "english";
  return (
    <span
      className={"choice-art subject-art subject-art-" + subject}
      aria-hidden="true"
    >
      <img
        className={"subject-prop" + (framed ? " poem-scenic-frame" : "")}
        src={"./" + src}
        alt=""
      />
      {subject === "numbers" && (
        <>
          <img className="second-berry" src="./art/berry.webp" alt="" />
          <img className="third-berry" src="./art/berry.webp" alt="" />
        </>
      )}
      {subject === "poems" && (
        <img className="poem-goose" src="./art/play/goose.webp" alt="" />
      )}
      {subject === "pinyin" && (
        <img className="poem-goose" src="./art/play/bird.webp" alt="" />
      )}
      {subject === "english" && (
        <span className="subject-photo">
          <img src="./art/wordbook/painted/ginger-cat.webp" alt="" />
          <b lang="en">cat</b>
        </span>
      )}
      {subject === "hanzi" && <b className="subject-letter">木</b>}
      {subject === "pinyin" && <b className="subject-letter">ā</b>}
      {subject === "numbers" && <b className="subject-letter">3</b>}
      {subject === "math" && <b className="subject-letter">＋1</b>}
    </span>
  );
}

export function ForestCatalog({
  route,
  done,
  onChoose,
  store,
}: {
  store: Platform["store"];
  route: BrowseRoute;
  done: Set<string>;
  onChoose: (href: string) => void;
}) {
  const voice = useNarration();
  const [spoken, setSpoken] = useState<string>();
  const choices = useRef<HTMLElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!voice.playing) return;
    window.addEventListener("scroll", voice.stop, {
      passive: true,
      once: true,
    });
    return () => window.removeEventListener("scroll", voice.stop);
  }, [voice.playing, voice.stop]);
  let title: string,
    prompt: string,
    headingClip: string,
    cards: Card[],
    navLabel: string;
  let back: { href: string; title: string } | undefined;
  let count = "";
  let headerArt: string | undefined;
  if (route.screen === "home") {
    title = "森森森林";
    const totalStamps = countTotalStamps(done);
    if (totalStamps > 0) count = totalStamps + " 枚学习印章";
    prompt = "";
    headingClip = "choose-subject";
    navLabel = "选择科目";
    cards = subjectIds.map((subject) => ({
      name: destinations[subject].subjectName,
      subject,
      href: subjectHref(subject),
      caption: destinations[subject].name,
      art: destinations[subject].image,
      audio: "media/catalog/" + subject + ".mp3",
    }));
  } else {
    const { subject } = route;
    if (route.screen === "groups") {
      const groups = lessonGroups(subject);
      title = subject === "hanzi" ? "汉字绘本" : destinations[subject].name;
      prompt =
        groups.length > 6
          ? "往下滑，找一组喜欢的图。"
          : "点一幅图，选你喜欢的一组。";
      headingClip = groups.length > 6 ? "browse-groups" : "choose-group";
      navLabel = "选择" + destinations[subject].subjectName + "分组";
      const { learned: learnedInSubject, total: totalItems } =
        countSubjectStamps(subject, done);
      count =
        groups.length +
        " 组 · " +
        totalItems +
        " " +
        unit(subject) +
        (learnedInSubject > 0 ? ` · 已学 ${learnedInSubject}` : "");
      back = { href: homeHref, title: "回森林" };
      headerArt =
        subject === "poems"
          ? "art/play/goose.webp"
          : subject === "pinyin"
            ? "art/play/bird.webp"
            : subject === "english"
              ? "art/wordbook/painted/ginger-cat.webp"
              : destinations[subject].image;
      cards = groups.map((g) => groupCard(subject, g, done));
    } else {
      const group = route.group;
      title = groupTitle(subject, group.name);
      navLabel = title + "选卡";
      prompt =
        subject === "hanzi" ? "滑一滑，点想学的字。" : "点想学的内容，开始玩吧。";
      headingClip = subject === "hanzi" ? "choose-word" : "choose-lesson";
      count = "共 " + group.items.length + " " + unit(subject);
      back = {
        href: subjectHref(subject),
        title: "换一组",
      };
      headerArt = groupCard(subject, group).art!;
      cards = group.items.map((w) => itemCard(subject, w, done));
    }
  }
  function listen() {
    if (voice.playing) {
      voice.stop();
      return;
    }
    // Read the cards the child can see, excluding the area covered by the sticky controls.
    const top = toolbar.current?.getBoundingClientRect().bottom ?? 0;
    const visible = cards.filter((_, i) => {
      const rect = choices.current!.children[i].getBoundingClientRect();
      return (
        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, top) >=
        Math.min(48, rect.height / 2)
      );
    });
    setSpoken(undefined);
    const intro =
      !visible.length || visible[0] === cards[0]
        ? [{ path: "media/catalog/" + headingClip + ".mp3" }]
        : [];
    voice.playSequence(
      [...intro, ...visible.map((card) => ({ path: card.audio }))],
      (index) => setSpoken(visible[index - intro.length]?.href),
    );
  }
  const listeningLabel = voice.playing ? "停一下" : "听小熊念";
  const listenButton = (
    <button
      type="button"
      className="catalog-listen"
      aria-label={listeningLabel}
      onClick={listen}
    >
      <img className="bear-listener" src="./art/bear.webp" alt="" />
      <ChildIcon name={voice.playing ? "stop" : "sound"} />
    </button>
  );
  return (
    <main className={"learning-width forest-catalog catalog-" + route.screen}>
      {back && (
        <div ref={toolbar} className="catalog-tools">
          <a className="catalog-back" href={back.href}>
            <ChildIcon name="back" />
            <ChildIcon name={route.screen === "groups" ? "home" : "shelf"} />
            {back.title}
          </a>
          <span className="catalog-gesture">
            <PictureCue kind={cards.length > 6 ? "scroll" : "tap"} />
          </span>
          {listenButton}
        </div>
      )}
      {route.screen === "home" ? (
        <>
          <ForestPond store={store} count={count} />
          <nav className="forest-experiments" aria-label="森林实验室">
            <h2>森林实验室</h2>
            <div>
              {Object.values(explorations).map(
                ({ title, subject, lessonId, image, invitation }) => {
                  const href = subjectHref(subject) + "/" + lessonId + "/explore";
                  const labDone = done.has(lessonId);
                  return (
                    <a key={href} href={href} onClick={() => onChoose(href)}>
                      <img src={"./" + image} alt="" />
                      <span className="lab-invitation"><strong>{invitation}</strong><small>{title}</small></span>
                      {labDone && (
                        <i className="lab-done-mark" aria-label="已学过">
                          ✓
                        </i>
                      )}
                      <ChildIcon name="next" />
                    </a>
                  );
                },
              )}
            </div>
          </nav>
          <div className="forest-shelves-heading">
            <h2>选一门喜欢的课</h2>
            {listenButton}
          </div>
        </>
      ) : (
        <header className="catalog-cover">
          <div className="cover-copy">
            <h1 tabIndex={-1}>{title}</h1>
            <p className="child-sr">{prompt}</p>
            {count && <span className="catalog-count">{count}</span>}
          </div>
          <img className="cover-friend" src={"./" + headerArt} alt="" />
        </header>
      )}
      {voice.error && (
        <p role="status" className="catalog-error">
          {voice.error}
        </p>
      )}
      <nav
        ref={choices}
        className={
          "catalog-choices" +
          (route.screen === "groups" ||
          (route.screen === "cards" &&
            (route.subject === "poems" ||
              route.subject === "pinyin" ||
              route.subject === "english"))
            ? " choices-scenic-" +
              route.screen +
              " choices-" +
              route.subject +
              "-" +
              route.screen
            : "")
        }
        aria-label={navLabel}
      >
        {cards.map((card, i) => {
          const scenicCover =
            card.poemGroupCover ??
            card.pinyinGroupCover ??
            card.englishGroupCover ??
            card.scenicGroupCover;
          return (
            <a
              key={card.href}
              href={card.href}
              onClick={() => onChoose(card.href)}
              style={
                card.numberArt
                  ? ({ "--number-tint": card.numberArt.tint } as CSSProperties)
                  : undefined
              }
              className={[
                "catalog-choice",
                card.poemGroupCover
                  ? "with-poem-group with-scenic-group"
                  : card.pinyinGroupCover
                    ? "with-pinyin-group with-scenic-group"
                    : card.englishGroupCover
                      ? "with-english-group with-scenic-group"
                      : card.scenicGroupCover
                        ? "with-scenic-group"
                        : card.poemId
                        ? "with-poem-cover with-scenic-cover"
                        : card.pinyinId
                          ? "with-pinyin-cover with-scenic-cover"
                          : card.englishId
                            ? "with-english-cover with-scenic-cover"
                            : card.numberArt
                              ? "with-number-art"
                              : card.mathEq
                                ? "with-math-blocks"
                                : card.scene
                                  ? "with-scene"
                                  : card.art
                                    ? "with-art"
                                    : "with-text",
                card.subject ? "choice-" + card.subject : "",
                voice.playing && spoken === card.href ? "speaking" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {card.subject && card.art ? (
                <SubjectArt subject={card.subject} src={card.art} />
              ) : scenicCover ? (
                <>
                  <span className="poem-group-scenic" aria-hidden="true">
                    <img
                      className="poem-group-bg"
                      src={"./" + scenicCover}
                      loading="lazy"
                      decoding="async"
                      alt=""
                    />
                    <span className="poem-group-scrim" />
                    {card.art && (
                      <img
                        className="poem-group-badge"
                        src={"./" + card.art}
                        loading="lazy"
                        decoding="async"
                        alt=""
                      />
                    )}
                  </span>
                </>
              ) : card.poemId ? (
                <>
                  <PoemCardBackdrop poemId={card.poemId} />
                  <span className="poem-card-scrim" aria-hidden="true" />
                </>
              ) : card.pinyinId ? (
                <>
                  <PinyinCardBackdrop itemId={card.pinyinId} eager={i < 6} />
                  <span className="poem-card-scrim" aria-hidden="true" />
                </>
              ) : card.englishId ? (
                <>
                  <EnglishCardBackdrop itemId={card.englishId} eager={i < 6} />
                  <span className="poem-card-scrim" aria-hidden="true" />
                </>
              ) : card.numberArt ? (
                <>
                  <NumberCardBackdrop art={card.numberArt} eager={i < 6} />
                  <span className="number-card-scrim" aria-hidden="true" />
                </>
              ) : card.mathEq ? (
                <MathBlockPreview eq={card.mathEq} />
              ) : card.scene ? (
                <WordIllustration item={card.scene} />
              ) : (
                card.art && (
                  <span className="choice-art">
                    <img
                      src={"./" + card.art}
                      loading="lazy"
                      decoding="async"
                      alt=""
                    />
                  </span>
                )
              )}
              {voice.playing && spoken === card.href && (
                <span className="speaking-badge">
                  <ChildIcon name="sound" />
                </span>
              )}
              <span className="choice-label">
                {card.englishId ? (
                  <span className="english-card-title">
                    {card.englishMeta?.swatchColor && (
                      <span
                        className="color-swatch-dot"
                        style={{
                          background: card.englishMeta.swatchColor,
                          borderColor:
                            card.englishMeta.swatchBorder ??
                            "rgba(255, 255, 255, 0.85)",
                        }}
                        aria-hidden="true"
                      />
                    )}
                    <strong lang="en">{card.name}</strong>
                  </span>
                ) : (
                  <strong>{card.name}</strong>
                )}
                <small className={card.subject ? "child-sr" : undefined}>
                  {card.caption}
                </small>
                {card.pinyinMeta?.rhyme && (
                  <span className="scenic-card-note">
                    {card.pinyinMeta.rhyme}
                  </span>
                )}
                {card.englishMeta?.phrase && (
                  <span className="scenic-card-note" lang="en">
                    {card.englishMeta.phrase}
                  </span>
                )}
                {card.numberArt?.mnemonic && (
                  <span className="number-mnemonic">
                    {card.numberArt.mnemonic}
                  </span>
                )}
              </span>
              {card.learned && (
                <span className="learned-stamp" aria-label="已学过">
                  <svg aria-hidden="true" viewBox="0 0 16 16">
                    <path
                      d="m3 8 3 3 7-7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </a>
          );
        })}
      </nav>
    </main>
  );
}
