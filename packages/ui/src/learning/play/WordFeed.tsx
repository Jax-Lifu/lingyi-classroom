import { useReducedMotion } from "./useReducedMotion";
import { ChildIcon } from "../ChildIcon";
import { PictureCue } from "../LottieLayer";
import { handArt } from "../motionFilm";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import type { Lesson } from "@lingyi-classroom/shared";
import { WordCard } from "./WordBook";

type Axis = "x" | "y";
type Step = -1 | 0 | 1;
interface Drag {
  id: number;
  x: number;
  y: number;
  axis?: Axis;
  offset: number;
  started: number;
}
function shift(axis: Axis, px: number) {
  return axis === "x" ? `translateX(${px}px)` : `translateY(${px}px)`;
}
export function WordFeed({
  items,
  index,
  onSelect,
  toolbar,
  children,
}: {
  items: Lesson[];
  index: number;
  onSelect: (item: Lesson) => void;
  toolbar: ReactNode;
  children: ReactNode;
}) {
  const reduced = useReducedMotion();
  const [demo, setDemo] = useState(0);
  const [showGuide, setShowGuide] = useState(true);
  useEffect(() => {
    setShowGuide(true);
    const timer = window.setTimeout(() => setShowGuide(false), 3200);
    return () => window.clearTimeout(timer);
  }, [demo]);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);
  const animation = useRef<Animation | null>(null);
  const blockClick = useRef(false);
  const wheelBurst = useRef({ time: -Infinity, total: 0, used: false });
  const previous = items[index - 1],
    following = items[index + 1];
  const id = items[index].id;

  // Keep the destination on screen until React installs the new active lesson.
  // Only the active lesson owns narration, answers and progress.
  const settle = useCallback(
    (axis: Axis, step: Step, offset = 0) => {
      const panel = viewport.current,
        strip = track.current;
      if (!panel || !strip || animation.current) return;
      const destination =
        step < 0 ? previous : step > 0 ? following : undefined;
      if (step && !destination) return;
      const extent = axis === "x" ? panel.clientWidth : panel.clientHeight;
      panel.dataset.axis = axis;
      const end = -step * extent;
      if (reduced || typeof strip.animate !== "function") {
        strip.style.transform = "";
        if (destination) onSelect(destination);
        return;
      }
      const slide = strip.animate(
        [{ transform: shift(axis, offset) }, { transform: shift(axis, end) }],
        {
          duration: step ? 220 : 150,
          easing: "cubic-bezier(.2,.78,.24,1)",
          fill: "forwards",
        },
      );
      animation.current = slide;
      slide.onfinish = () => {
        if (destination) onSelect(destination);
        else {
          strip.style.transform = "";
          slide.cancel();
          animation.current = null;
        }
      };
    },
    [previous, following, onSelect, reduced],
  );

  useLayoutEffect(() => {
    if (reduced) animation.current?.finish();
  }, [reduced]);

  useLayoutEffect(() => {
    const strip = track.current;
    return () => {
      if (animation.current) {
        animation.current.onfinish = null;
        animation.current.cancel();
        animation.current = null;
      }
      if (strip) strip.style.transform = "";
      drag.current = null;
    };
  }, [id]);

  function start(e: PointerEvent<HTMLDivElement>) {
    if (!e.isPrimary) {
      cancel();
      return;
    }
    if (e.button !== 0) return;
    if (animation.current) {
      blockClick.current = true;
      return;
    }
    setShowGuide(false);
    blockClick.current = false;
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      offset: 0,
      started: e.timeStamp,
    };
  }
  function move(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current,
      strip = track.current;
    if (!d || d.id !== e.pointerId || !strip) return;
    const dx = e.clientX - d.x,
      dy = e.clientY - d.y;
    if (!d.axis) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 10) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      blockClick.current = true;
      e.currentTarget.dataset.axis = d.axis;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    const delta = d.axis === "x" ? dx : dy;
    const extent =
      d.axis === "x"
        ? e.currentTarget.clientWidth
        : e.currentTarget.clientHeight;
    d.offset = Math.max(-extent, Math.min(extent, delta));
    if ((delta < 0 && !following) || (delta > 0 && !previous))
      d.offset = Math.max(-14, Math.min(14, delta * 0.12));
    if (!reduced) strip.style.transform = shift(d.axis, d.offset);
  }
  function release(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.axis) return;
    const extent =
      d.axis === "x"
        ? e.currentTarget.clientWidth
        : e.currentTarget.clientHeight;
    const threshold = Math.max(32, Math.min(64, extent * 0.13));
    const distance = Math.abs(d.offset);
    const flick = distance >= 30 && e.timeStamp - d.started < 230;
    const step = distance >= threshold || flick ? (d.offset < 0 ? 1 : -1) : 0;
    settle(d.axis, step, d.offset);
  }
  function cancel() {
    const d = drag.current;
    drag.current = null;
    if (d?.axis) settle(d.axis, 0, d.offset);
  }

  useEffect(() => {
    const panel = viewport.current;
    if (!panel) return;
    function wheel(e: WheelEvent) {
      if (e.ctrlKey || e.metaKey) return;
      const axis = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? "x" : "y";
      const unit =
        e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? panel!.clientHeight : 1;
      const delta = (axis === "x" ? e.deltaX : e.deltaY) * unit;
      if (!delta) return;
      const burst = wheelBurst.current;
      if (e.timeStamp - burst.time > 200) {
        burst.total = 0;
        burst.used = false;
      }
      burst.time = e.timeStamp;
      if (
        !burst.used &&
        ((delta < 0 && !previous) || (delta > 0 && !following))
      )
        return;
      e.preventDefault();
      if (burst.used || animation.current || drag.current) return;
      burst.total =
        Math.sign(burst.total) === Math.sign(delta)
          ? burst.total + delta
          : delta;
      if (Math.abs(burst.total) >= 36) {
        burst.used = true;
        settle(axis, delta > 0 ? 1 : -1);
      }
    }
    panel.addEventListener("wheel", wheel, { passive: false });
    return () => panel.removeEventListener("wheel", wheel);
  }, [previous, following, settle]);

  function keys(e: KeyboardEvent) {
    if (
      e.altKey ||
      e.ctrlKey ||
      e.metaKey ||
      e.shiftKey ||
      (e.target as HTMLElement).closest(
        "a,button,input,textarea,select,[contenteditable=true]",
      )
    )
      return;
    const directions = {
      ArrowLeft: ["x", -1],
      ArrowRight: ["x", 1],
      ArrowUp: ["y", -1],
      ArrowDown: ["y", 1],
    } as const;
    const turn = directions[e.key as keyof typeof directions];
    if (!turn) return;
    e.preventDefault();
    if (!e.repeat) settle(turn[0], turn[1]);
  }
  return (
    <div className="reader-shell" onKeyDown={keys}>
      {toolbar}
      <div
        className="reader-deck"
        ref={viewport}
        data-axis="y"
        onPointerDown={start}
        onPointerMove={move}
        onPointerLeave={() => {
          if (!drag.current?.axis) drag.current = null;
        }}
        onPointerUp={release}
        onPointerCancel={cancel}
        onLostPointerCapture={(e) => {
          if (e.target === e.currentTarget && drag.current?.id === e.pointerId)
            cancel();
        }}
        onClickCapture={(e) => {
          if (blockClick.current && e.detail !== 0) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {showGuide && (
          <span className="deck-guide" aria-hidden="true">
            <PictureCue kind="swipe" key={demo} />
          </span>
        )}
        <div className="reader-track" ref={track}>
          <div className="reader-current">{children}</div>
          {previous && (
            <div className="reader-neighbor before" aria-hidden="true" inert>
              <WordCard item={previous} />
            </div>
          )}
          {following && (
            <div className="reader-neighbor after" aria-hidden="true" inert>
              <WordCard item={following} />
            </div>
          )}
        </div>
      </div>
      <nav className="reader-steps" aria-label="切换汉字">
        <button
          disabled={!previous}
          onClick={() => settle("x", -1)}
          aria-label="上一个字"
        >
          <ChildIcon name="back" />
        </button>
        <div className="reader-position">
          <button
            className="gesture-demo"
            aria-label="再看一次滑动换字示范"
            onClick={() => setDemo((v) => v + 1)}
          >
            <img src={"./" + handArt} alt="" />
            <span aria-hidden="true" className="gesture-arrows">
              <ChildIcon name="back" />
              <ChildIcon name="next" />
            </span>
          </button>
          <span aria-live="polite" aria-atomic="true">
            <span className="child-sr">第</span>
            {index + 1} / {items.length}
            <span className="child-sr">个字</span>
          </span>
        </div>
        <button
          disabled={!following}
          onClick={() => settle("x", 1)}
          aria-label="切换到下一个字"
        >
          <ChildIcon name="next" />
        </button>
      </nav>
    </div>
  );
}
