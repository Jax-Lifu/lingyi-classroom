import { lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { subjectIds, type Platform } from "@lingyi-classroom/shared";
import { cardsHref, homeHref, lessonHref, libraryHref, readLearningRoute, subjectHref } from "./childCatalog";
import { ForestCatalog } from "./ForestCatalog";
import type { LibraryView } from "./ParentLibrary";
import { topics } from "./libraryTopics";
import { usePracticeRecord } from "./usePracticeRecord";
import "./learning.css";

const PlayWorld = lazy(() => import("./play/PlayWorld").then((m) => ({ default: m.PlayWorld })));
const ParentLibrary = lazy(() => import("./ParentLibrary").then((m) => ({ default: m.ParentLibrary })));

export function LearningApp({
  platform,
  onOpenSettings,
}: {
  platform: Platform;
  onOpenSettings: () => void;
}) {
  const [hash, setHash] = useState(() => window.location.hash);
  const route = useMemo(() => readLearningRoute(hash), [hash]);
  const subject = route.screen === "home" ? "hanzi" : route.subject;
  const savedLibrary: LibraryView | undefined = route.screen === "library" && history.state?.parentLibrary?.href === hash
    ? history.state.parentLibrary : undefined;
  const record = usePracticeRecord(platform);
  const shell = useRef<HTMLDivElement>(null);
  const previous = useRef(route);
  const choicePositions = useRef(new Map<string, number>());
  useEffect(() => {
    const update = () => setHash(window.location.hash);
    window.addEventListener("hashchange", update);
    return () => window.removeEventListener("hashchange", update);
  }, []);
  // Hash routes render after the shell loads, too late for the browser's native reload restoration.
  useEffect(() => {
    if (route.screen !== "cards" && route.screen !== "groups") return;
    let timer: number | undefined;
    const save = () => {
      const previousShelf = history.state?.forestShelf;
      if (
        window.location.hash === hash &&
        !(previousShelf?.hash === hash && previousShelf.y === window.scrollY)
      ) {
        history.replaceState(
          { ...history.state, forestShelf: { hash, y: window.scrollY } },
          "",
        );
      }
    };
    const schedule = () => {
      if (timer === undefined)
        timer = window.setTimeout(() => {
          timer = undefined;
          save();
        }, 400);
    };
    save();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scrollend", save);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("scrollend", save);
    };
  }, [hash, route.screen]);
  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = route;
    if (savedLibrary) {
      window.scrollTo({ top: savedLibrary.pageTop });
      if (from.screen === "round") shell.current?.querySelector<HTMLButtonElement>(".launch-game")?.focus({ preventScroll: true });
      return;
    }
    const savedShelf = history.state?.forestShelf;
    if (
      from === route &&
      (route.screen === "cards" || route.screen === "groups") &&
      savedShelf?.hash === window.location.hash &&
      Number.isFinite(savedShelf.y)
    ) {
      window.scrollTo({ top: savedShelf.y });
      return;
    }
    const linkedChoice =
      "initialChoice" in route ? route.initialChoice : undefined;
    if (from === route && !linkedChoice) return;
    let previousChoice: string | undefined;
    if (from.screen === "round" && route.screen === "cards")
      previousChoice = lessonHref(from.subject, from.item);
    if (
      (from.screen === "cards" || from.screen === "round") &&
      route.screen === "groups"
    )
      previousChoice = cardsHref(from.subject, from.group.name);
    if (from.screen === "groups" && route.screen === "home")
      previousChoice = subjectHref(from.subject);
    const target = linkedChoice ?? previousChoice;
    const card =
      target &&
      Array.from(
        shell.current?.querySelectorAll<HTMLAnchorElement>(".catalog-choice") ??
          [],
      ).find((link) => link.getAttribute("href") === target);
    if (card) {
      const savedY = choicePositions.current.get(card.getAttribute("href")!);
      if (savedY !== undefined) window.scrollTo({ top: savedY });
      card.scrollIntoView({
        block: savedY === undefined ? "center" : "nearest",
      });
      card.focus({ preventScroll: true });
    } else {
      window.scrollTo({ top: 0 });
      shell.current
        ?.querySelector<HTMLElement>("main h1")
        ?.focus({ preventScroll: true });
    }
  }, [route]);
  function navigate(href: string, replace = false) {
    if (replace) {
      history.replaceState(null, "", href);
      setHash(window.location.hash);
    } else window.location.hash = href.slice(1);
  }
  return (
    <div className="learning" lang="zh-CN" ref={shell}>
      <header className="learning-bar">
        <div className="learning-width bar-inner">
          <button
            className="learning-brand"
            onClick={() => navigate(homeHref)}
            aria-label="01课堂，返回森森森林"
          >
            <img src="./art/logo.webp" alt="" />
            01课堂
          </button>
          <nav aria-label="家长工具">
            {route.screen === "library" && platform.householdStoryUrl && (
              <a href={platform.householdStoryUrl}>历史野餐</a>
            )}
            <button
              className="settings-link"
              onClick={() =>
                navigate(
                  route.screen === "library"
                    ? homeHref
                    : libraryHref(
                        subject,
                        route.screen === "round" ? route.item.id : undefined,
                      ),
                )
              }
            >
              {route.screen === "library" ? "回森森森林" : "家长选课"}
            </button>
            {route.screen === "library" && (
              <button className="settings-link" onClick={onOpenSettings}>
                设置
              </button>
            )}
          </nav>
        </div>
      </header>
      {route.screen === "library" ? (
        <main className="learning-width learning-main">
          <nav className="parent-topics" aria-label="选择学科">
            {subjectIds.map((s) => (
              <button
                key={s}
                aria-current={route.subject === s ? "page" : undefined}
                onClick={() => navigate(libraryHref(s))}
              >
                {topics[s].name}
              </button>
            ))}
          </nav>
          <ParentLibrary
            key={libraryHref(route.subject, route.id)}
            subject={route.subject}
            initialId={route.id}
            initialView={savedLibrary}
            entryHash={hash}
            home={() => navigate(homeHref)}
            done={record.done}
            mark={record.mark}
            unmark={record.unmark}
            startGame={(id, view) => {
              // Back should return to the lesson shown, including the first match of a filter.
              const href = libraryHref(route.subject, id);
              history.replaceState({ ...history.state, parentLibrary: { href, ...view } }, "", href);
              navigate(subjectHref(route.subject) + "/" + id);
            }}
          />
        </main>
      ) : route.screen === "round" ? (
        <PlayWorld
          explore={route.explore}
          subject={route.subject}
          item={route.item}
          group={route.group}
          platform={platform}
          resetVersion={record.resetVersion}
          mark={record.mark}
          navigate={navigate}
        />
      ) : (
        <ForestCatalog
          store={platform.store}
          key={hash}
          route={route}
          done={record.done}
          onChoose={(href) => choicePositions.current.set(href, window.scrollY)}
        />
      )}
      {record.notice && (
        <p className="storage-notice" role="status">
          {record.notice}
        </p>
      )}
    </div>
  );
}
