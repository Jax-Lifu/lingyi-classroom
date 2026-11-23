import { useEffect, useRef } from "react";
import type { AnimationItem } from "lottie-web";
import { cueFilm, handArt, starArt, type CueName } from "./motionFilm";

type Film = ReturnType<typeof cueFilm>;
type Build = (host: HTMLElement) => Film | Promise<Film>;

// Load the expression-free SVG renderer only for an active illustration. The painted poster stays visible until ready.
export function LottieLayer({
  build,
  responsive = false,
}: {
  build: Build;
  responsive?: boolean;
}) {
  const holder = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = holder.current;
    if (!host || typeof window.matchMedia !== "function") return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const isReduced = () =>
      motion.matches ||
      document.documentElement?.dataset.reduceMotion === "true";
    let animation: AnimationItem | undefined,
      generation = 0,
      ratio = 0,
      disposed = false;
    function clear() {
      generation++;
      if (host) delete host.dataset.ready;
      animation?.destroy();
      animation = undefined;
    }
    async function draw() {
      if (!host || disposed) return;
      const frame = animation?.currentFrame ?? 0;
      clear();
      if (isReduced() || !host.clientHeight || !host.clientWidth) return;
      ratio = host.clientWidth / host.clientHeight;
      const version = generation;
      try {
        const [{ default: player }, data] = await Promise.all([
          import("lottie-web/build/player/lottie_light"),
          build(host),
        ]);
        if (disposed || version !== generation) return;
        const run = player.loadAnimation({
          container: host,
          renderer: "svg",
          loop: false,
          autoplay: false,
          animationData: data,
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            focusable: false,
          },
        });
        animation = run;
        function ready() {
          if (!host || version !== generation) return;
          host.dataset.ready = "true";
          run.goToAndStop(Math.min(frame, run.totalFrames - 1), true);
          if (!document.hidden) run.play();
        }
        run.addEventListener("DOMLoaded", ready);
        run.addEventListener("data_failed", () => {
          if (generation === version) clear();
        });
      } catch {
        if (version === generation) clear();
      }
    }
    function visibility() {
      if (document.hidden) animation?.pause();
      else if (animation && animation.currentFrame < animation.totalFrames - 1)
        animation.play();
    }
    const observer =
      responsive && typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (
              host.clientHeight &&
              Math.abs(host.clientWidth / host.clientHeight - ratio) > 0.015
            )
              void draw();
          })
        : undefined;
    observer?.observe(host);
    const attrObserver =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(draw)
        : undefined;
    attrObserver?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-reduce-motion"],
    });
    motion.addEventListener?.("change", draw);
    document.addEventListener("visibilitychange", visibility);
    void draw();
    return () => {
      disposed = true;
      observer?.disconnect();
      attrObserver?.disconnect();
      motion.removeEventListener?.("change", draw);
      document.removeEventListener("visibilitychange", visibility);
      clear();
    };
  }, [build, responsive]);
  return <span className="lottie-layer" ref={holder} aria-hidden="true" />;
}

const cueBuilders: Record<CueName, Build> = {
  tap: () => cueFilm("tap"),
  scroll: () => cueFilm("scroll"),
  swipe: () => cueFilm("swipe"),
  drag: () => cueFilm("drag"),
  stamp: () => cueFilm("stamp"),
  retry: () => cueFilm("retry"),
};
export function PictureCue({ kind }: { kind: CueName }) {
  return (
    <span className={"picture-cue cue-" + kind} aria-hidden="true">
      {(kind === "swipe" || kind === "scroll" || kind === "drag") && (
        <svg
          className="cue-route"
          viewBox="0 0 100 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {kind !== "scroll" && (
            <path d="M9 40h23m-15-8-8 8 8 8m74-8H68m15-8 8 8-8 8" />
          )}
          {kind !== "drag" && (
            <path d="M50 4v16m-7-9 7-7 7 7m-7 64V59m-7 9 7 7 7-7" />
          )}
        </svg>
      )}
      <LottieLayer build={cueBuilders[kind]} />
      <img
        className="cue-poster"
        src={"./" + (kind === "stamp" ? starArt : handArt)}
        alt=""
        draggable={false}
      />
    </span>
  );
}
