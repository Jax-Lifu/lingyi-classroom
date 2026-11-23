import { useReducedMotion } from "./useReducedMotion";
import { ChildIcon } from "../ChildIcon";
import { PictureCue } from "../LottieLayer";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { CSSProperties, PointerEvent } from "react";
import {
  type Backdrop,
  type Clip,
  type Focus,
  type PlayActor,
  type RoundProps,
} from "./types";

const Canvas = lazy(() =>
  import("./StageCanvas")
    .then((module) => ({ default: module.StageCanvas }))
    .catch(() => ({ default: () => null })),
);
const art: Record<PlayActor["kind"], string> = {
  flame: "art/wordbook/fire.webp",
  bear: "art/bear.webp",
  dock: "art/play/dock.webp",
  seed: "art/play/seed.webp",
  tree: "art/play/tree.webp",
  mountain: "art/play/mountain.webp",
  sun: "art/play/sun.webp",
  moon: "art/play/moon.webp",
  goose: "art/play/goose.webp",
  fish: "art/fish.webp",
  berry: "art/berry.webp",
  nut: "art/nut.webp",
  grill: "art/play/grill.webp",
  plate: "art/play/plate.webp",
  basket: "art/play/basket.webp",
  bird: "art/play/bird.webp",
  nest: "art/play/nest.webp",
  egg: "art/play/egg.webp",
  boat: "art/play/boat.webp",
  lily: "art/play/lily.webp",
  camera: "art/play/camera.webp",
  sign: "art/play/sign.webp",
  photo: "art/play/camera.webp",
};
interface Props {
  game: RoundProps;
  actors: PlayActor[];
  backdrop: Backdrop;
  focus?: Focus;
  phase: string;
  target: string;
  targetCaption: string;
  beat: string;
  cue: string;
  clips: (Clip | undefined)[];
  pick: (id: string) => void;
  success?: boolean;
  flash?: boolean;
  dragFrom?: string;
  extra?: React.ReactNode;
  controls?: React.ReactNode;
}
export function Stage({
  game,
  actors,
  backdrop,
  focus = "wide",
  phase,
  target,
  targetCaption,
  beat,
  cue,
  clips,
  pick,
  success,
  flash,
  dragFrom,
  extra,
  controls,
}: Props) {
  const [available, setAvailable] = useState(false);
  const [seen, setSeen] = useState<Backdrop[]>([backdrop]);
  useEffect(() => {
    setSeen((prev) => (prev.includes(backdrop) ? prev : [...prev, backdrop]));
  }, [backdrop]);
  const reduced = useReducedMotion();
  useEffect(() => { if (reduced) setAvailable(false); }, [reduced]);
  const pieces = useRef(new Map<string, HTMLElement>());
  const ghost = useRef<HTMLImageElement>(null);
  const pointer = useRef<{
    id: number;
    x: number;
    y: number;
    moved: boolean;
  } | null>(null);
  const swallowClick = useRef(false);
  const onProject = useCallback((id: string, x: number, y: number, signHeight?: number) => {
    const el = pieces.current.get(id);
    if (el) {
      el.style.setProperty("--sx", x.toFixed(2) + "%");
      el.style.setProperty("--sy", y.toFixed(2) + "%");
      if (signHeight !== undefined) el.style.setProperty("--sign-face-height", signHeight.toFixed(2) + "px");
    }
  }, []);
  const guided = actors.find((a) => a.hint && a.action);
  const intro = useRef(clips);
  useEffect(() => {
    if (navigator.userActivation?.hasBeenActive)
      game.runtime.speak(...intro.current);
  }, [game.runtime.speak]);

  function startDrag(e: PointerEvent<HTMLElement>, id: string) {
    if (id !== dragFrom || !e.isPrimary) return;
    pointer.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function moveDrag(e: PointerEvent<HTMLElement>) {
    const p = pointer.current,
      g = ghost.current;
    if (!p || p.id !== e.pointerId || !g) return;
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) > 9)
      p.moved = true;
    if (p.moved) {
      g.hidden = false;
      g.style.left = e.clientX + "px";
      g.style.top = e.clientY + "px";
    }
  }
  function endDrag(e: PointerEvent<HTMLElement>) {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    pointer.current = null;
    if (ghost.current) ghost.current.hidden = true;
    if (p.moved) {
      swallowClick.current = true;
      const hit = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest<HTMLElement>("[data-actor]");
      if (hit && hit.dataset.actor !== dragFrom && hit.tagName === "BUTTON")
        pick(hit.dataset.actor!);
      setTimeout(() => {
        swallowClick.current = false;
      }, 0);
    }
  }
  return (
    <section className="play-book" aria-label="互动故事">
      <div
        className={
          "world-stage bg-" +
          backdrop +
          (available ? " with-gl" : " flat-world") +
          (flash ? " camera-flash" : "")
        }
        data-scene={game.subject}
        data-phase={phase}
        data-renderer={available ? "three" : "illustration"}
      >
        {seen.map((bg) => (
          <img
            key={bg}
            className={"world-land" + (bg === backdrop ? " current" : "")}
            alt=""
            src={
              "./" +
              (bg === "clearing"
                ? "art/clearing.webp"
                : "art/play/" + bg + ".webp")
            }
          />
        ))}
        {!reduced && actors.length > 0 && (
          <Suspense fallback={null}>
            <Canvas
              actors={actors}
              subject={game.subject}
              focus={focus}
              reduced={reduced}
              onAvailable={setAvailable}
              onProject={onProject}
            />
          </Suspense>
        )}
        <div
          className={
            "world-token" +
            (target.length > 3 ||
            (game.subject === "poems" && target.length > 1)
              ? " long-token"
              : "")
          }
        >
          <small>{targetCaption}</small>
          <b>{target}</b>
        </div>
        <div className="stage-chapter">{beat}</div>
        <div className="world-pieces">
          {actors.map((a) => {
            const Tag = a.action ? "button" : "div";
            return (
              <Tag
                key={a.id}
                ref={(el: HTMLElement | null) => {
                  if (el) pieces.current.set(a.id, el);
                  else pieces.current.delete(a.id);
                }}
                data-actor={a.id}
                aria-label={a.action}
                aria-hidden={!a.action || undefined}
                className={
                  "scene-piece kind-" +
                  a.kind +
                  " movement-" +
                  (a.motion || "idle") +
                  (a.hint ? " beckon" : "") +
                  (a.faded ? " dimmed" : "") +
                  (dragFrom === a.id ? " draggable" : "")
                }
                style={
                  {
                    "--x": a.x + "%",
                    "--y": a.y + "%",
                    "--size": a.size + "%",
                    "--wind-angle": (a.wind ?? 0) * 24 + "deg",
                    "--wind-stretch":
                      a.kind === "flame" ? 1 + Math.abs(a.wind ?? 0) * 0.2 : 1,
                  } as CSSProperties
                }
                onPointerDown={(e) => startDrag(e, a.id)}
                onPointerMove={moveDrag}
                onPointerUp={endDrag}
                onPointerCancel={() => {
                  pointer.current = null;
                  if (ghost.current) ghost.current.hidden = true;
                }}
                onClick={
                  a.action
                    ? () => {
                        if (!swallowClick.current) pick(a.id);
                      }
                    : undefined
                }
              >
                <img
                  className="piece-art"
                  alt=""
                  draggable="false"
                  src={"./" + (a.picture || art[a.kind])}
                />
                {a.label && (
                  <span
                    className={
                      "piece-tag" + (a.label.length > 4 ? " long-tag" : "")
                    }
                  >
                    {a.label}
                  </span>
                )}
                {a.hint && a.action && (
                  <span className="tap-ripple" aria-hidden="true">
                    <PictureCue kind="tap" />
                  </span>
                )}
              </Tag>
            );
          })}
        </div>
        {extra}
        {success && (
          <div className="prize">
            {game.stampSaved ? <PictureCue kind="stamp" /> : <ChildIcon name="check" />}
            <b>
              {game.item.equation
                ? game.item.label + " = " + game.item.equation.answer
                : game.item.label}
            </b>
            <button className="game-primary" onClick={game.next}>
              {game.nextLabel ?? "接着玩"} <ChildIcon name="next" />
            </button>
          </div>
        )}
        {dragFrom && (
          <img
            ref={ghost}
            hidden
            className="drag-ghost"
            alt=""
            src="./art/play/bird.webp"
          />
        )}
      </div>
      {controls}
      {game.stampFeedback}
      <div className="story-dialogue">
        <button
          className="voice-disc"
          aria-label="再听一次提示"
          onClick={() => game.runtime.listen(...clips)}
        >
          <SpeakerIcon />
        </button>
        <div>
          <div aria-live="polite">
            {guided ? (
              <button className="follow-cue" onClick={() => pick(guided.id)}>
                <span className="guided-object" aria-hidden="true">
                  <img
                    src={"./" + (guided.picture || art[guided.kind])}
                    alt=""
                  />
                  <ChildIcon name="next" />
                </span>
                <span className="guided-words">{cue}</span>
              </button>
            ) : (
              <div className="game-cue">
                {dragFrom && (
                  <span className="nest-demo" aria-hidden="true">
                    <img src="./art/play/bird.webp" alt="" />
                    <PictureCue kind="drag" />
                    <img src="./art/play/nest.webp" alt="" />
                  </span>
                )}
                {!dragFrom &&
                  !success &&
                  actors.filter((actor) => actor.action).length > 1 && (
                    <span className="choice-sequence" aria-hidden="true">
                      <ChildIcon name="sound" />
                      <ChildIcon name="next" />
                      <ChildIcon name="choose" />
                    </span>
                  )}
                <p>{cue}</p>
              </div>
            )}
          </div>
        </div>
        <button
          className="restart-round"
          aria-label="重玩这个故事"
          title="重玩这个故事"
          onClick={game.replay}
        >
          <ChildIcon name="replay" />
        </button>
      </div>
    </section>
  );
}
export function SpeakerIcon({ quiet = false }: { quiet?: boolean }) {
  return (
    <ChildIcon name={quiet ? "quiet" : "sound"} className="speaker-mark" />
  );
}
