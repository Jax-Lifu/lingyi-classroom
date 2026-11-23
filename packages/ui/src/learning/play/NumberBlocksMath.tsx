import { useReducedMotion } from "./useReducedMotion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { practiceChoices } from "@lingyi-classroom/shared";
import { curriculum } from "@lingyi-classroom/content";
import { ChildIcon } from "../ChildIcon";
import { PictureCue } from "../LottieLayer";
import { SpeakerIcon } from "./Stage";
import { countVoice, playVoice, type RoundProps } from "./types";
import { blockSpec, playBlockSfx } from "./numberBlocksModel";
import { NumberBlockFigure } from "./NumberBlockFigure";
import "./number-blocks.css";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function NumberBlocksMath(game: RoundProps) {
  const reduced = useReducedMotion();
  const { item, runtime: rt } = game;
  const eq = item.equation!;
  const add = eq.sign === "+";

  const choices = useMemo(
    () => practiceChoices("math", item, curriculum.math),
    [item],
  );

  const [phase, setPhase] = useState<"ready" | "animating" | "choose" | "won">(
    "ready",
  );
  const [shapeIdx, setShapeIdx] = useState(0);
  const [counted, setCounted] = useState(0);
  const [typingTen, setTypingTen] = useState(false);
  const [wrongChoice, setWrongChoice] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dropReady, setDropReady] = useState(false);
  const [bounceSeq, setBounceSeq] = useState(0);

  const leftBlockRef = useRef<HTMLDivElement>(null);
  const pointer = useRef<{
    id: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);
  const swallowClick = useRef(false);

  const clips = useMemo(
    () =>
      phase === "ready" || phase === "animating"
        ? [
            item.audio,
            playVoice(
              eq.right === 0 ? "math-zero" : add ? "math-add" : "math-sub",
            ),
          ]
        : [
            item.audio,
            playVoice(phase === "won" ? "all-done" : "math-choose"),
          ],
    [add, eq.right, item.audio, phase],
  );

  const introClips = useRef(clips);
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.userActivation?.hasBeenActive
    ) {
      rt.speak(...introClips.current);
    }
  }, [rt.speak]);

  const leftSpec = blockSpec(eq.left);
  const rightSpec = blockSpec(eq.right);
  const answerSpec = blockSpec(eq.answer);

  const canMorph =
    (phase === "choose" || phase === "won") && answerSpec.shapes.length > 1;
  const answerShape =
    answerSpec.shapes.length > 0
      ? answerSpec.shapes[shapeIdx % answerSpec.shapes.length]
      : ([1, 1] as const);

  // Scale block cube size dynamically based on tallest visible stack so 1x7 and 2x5 never clip.
  const maxRows = useMemo(() => {
    if (phase === "ready" || phase === "animating") {
      if (add) {
        const rL = leftSpec.shapes[0]?.[1] ?? 1;
        const rR = rightSpec.shapes[0]?.[1] ?? 1;
        return Math.max(rL, rR);
      }
      return leftSpec.shapes[0]?.[1] ?? 1;
    }
    const rAns = answerShape[1];
    const rDet = !add ? (rightSpec.shapes[0]?.[1] ?? 1) : 1;
    return Math.max(rAns, rDet);
  }, [add, answerShape, leftSpec.shapes, phase, rightSpec.shapes]);

  useEffect(() => {
    if (phase === "animating" && reduced) {
      rt.clear();
      setPhase("choose");
      rt.speak(item.audio, playVoice("math-choose"));
    }
  }, [phase, reduced, rt, item.audio]);

  function commitAction() {
    if (phase !== "ready") return;
    setDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setDropReady(false);
    playBlockSfx(add ? "snap" : "split", game.muted);
    rt.sound("touch");
    rt.stop();
    if (reduced) {
      setPhase("choose");
      rt.speak(item.audio, playVoice("math-choose"));
      return;
    }
    setPhase("animating");
    rt.later(420, () => {
      setPhase("choose");
      rt.speak(item.audio, playVoice("math-choose"));
    });
  }

  function startDrag(e: PointerEvent<HTMLButtonElement>) {
    if (phase !== "ready") return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pointer.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function moveDrag(e: PointerEvent<HTMLButtonElement>) {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    const rawX = e.clientX - p.startX;
    const rawY = e.clientY - p.startY;
    if (!p.moved && Math.hypot(rawX, rawY) > 4) {
      p.moved = true;
      setDragging(true);
      playBlockSfx("grab", game.muted);
    }
    if (!p.moved) return;
    const x = add ? clamp(rawX, -220, 44) : clamp(rawX, -36, 220);
    const y = clamp(rawY, -56, 56);
    setDragOffset({ x, y });
    let nearTarget = add ? x <= -56 : x >= 56;
    if (add && !nearTarget && leftBlockRef.current) {
      const box = leftBlockRef.current.getBoundingClientRect();
      if (
        e.clientX <= box.right + 42 &&
        e.clientY >= box.top - 36 &&
        e.clientY <= box.bottom + 36
      ) {
        nearTarget = true;
      }
    }
    setDropReady(nearTarget);
  }

  function endDrag(e: PointerEvent<HTMLButtonElement>, cancelled = false) {
    const p = pointer.current;
    if (!p || p.id !== e.pointerId) return;
    const wasMoved = p.moved;
    const rawX = e.clientX - p.startX;
    let landed = add ? rawX <= -56 : rawX >= 56;
    if (!cancelled && add && wasMoved && !landed && leftBlockRef.current) {
      const box = leftBlockRef.current.getBoundingClientRect();
      if (
        e.clientX <= box.right + 42 &&
        e.clientY >= box.top - 36 &&
        e.clientY <= box.bottom + 36
      ) {
        landed = true;
      }
    }
    pointer.current = null;
    setDragging(false);
    setDragOffset({ x: 0, y: 0 });
    setDropReady(false);
    if (wasMoved) {
      swallowClick.current = true;
      setTimeout(() => {
        swallowClick.current = false;
      }, 0);
      if (!cancelled && landed) commitAction();
    }
  }

  function onHandleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (phase !== "ready") return;
    if ((add && e.key === "ArrowLeft") || (!add && e.key === "ArrowRight")) {
      e.preventDefault();
      commitAction();
    }
  }

  function countNext() {
    if (phase !== "choose" && phase !== "won") return;
    setBounceSeq((s) => s + 1);
    if (eq.answer === 0) {
      playBlockSfx("count", game.muted, 0);
      rt.speak(countVoice(0));
      return;
    }
    const nextCount = counted >= eq.answer ? 1 : counted + 1;
    setCounted(nextCount);
    playBlockSfx("count", game.muted, nextCount - 1);
    rt.speak(countVoice(nextCount));
  }

  function cycleShape() {
    if (!canMorph) return;
    setShapeIdx((i) => i + 1);
    setBounceSeq((s) => s + 1);
    playBlockSfx("morph", game.muted);
  }

  function pickAnswer(choice: string) {
    if (phase !== "choose") return;
    setTypingTen(false);
    if (choice === String(eq.answer)) {
      setPhase("won");
      setWrongChoice(null);
      setCounted(0);
      setBounceSeq((s) => s + 1);
      game.onWin();
      playBlockSfx("win", game.muted);
      rt.sound("chime");
      rt.speak(countVoice(eq.answer), playVoice("all-done"));
    } else {
      setWrongChoice(choice);
      setBounceSeq((s) => s + 1);
      playBlockSfx("oops", game.muted);
      rt.speak(playVoice("gentle"), item.audio);
    }
  }

  useEffect(() => {
    function onWindowKey(e: globalThis.KeyboardEvent) {
      if (e.repeat || e.isComposing) return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) { setTypingTen(false); return; }
      const target = e.target instanceof HTMLElement ? e.target : null;
      if (target?.closest("input,textarea,select,[contenteditable=true]")) return;
      if (phase === "ready" && (e.key === "Enter" || e.key === " ")) {
        if (target?.closest("button,a")) return;
        e.preventDefault();
        commitAction();
      } else if (phase === "choose" && /^[0-9]$/.test(e.key)) {
        if (e.key === "1" && choices.includes("10") && !choices.includes("1")) {
          e.preventDefault();
          setTypingTen(true);
        } else {
          const choice = typingTen && e.key === "0" ? "10" : e.key;
          setTypingTen(false);
          if (choices.includes(choice)) {
            e.preventDefault();
            pickAnswer(choice);
          }
        }
      } else {
        setTypingTen(false);
      }
    }
    const cancelNumber = () => setTypingTen(false);
    window.addEventListener("blur", cancelNumber);
    window.addEventListener("keydown", onWindowKey);
    return () => {
      window.removeEventListener("keydown", onWindowKey);
      window.removeEventListener("blur", cancelNumber);
    };
  });

  const cue =
    phase === "won"
      ? `答对啦！${item.label} = ${eq.answer}，变身${answerSpec.name}！`
      : phase === "animating"
        ? add
          ? "咔哒！积木正在合体…"
          : `咔嚓！分出 ${eq.right} 块…`
        : phase === "choose"
          ? wrongChoice
            ? `不是 ${wrongChoice} 哦，可以点积木数一数，再换一顶数字帽。`
            : counted > 0
              ? eq.answer === 0
                ? "0 块，空空的泡泡！快选 0 号数字帽。"
                : counted === eq.answer
                  ? `数好啦！一共 ${eq.answer} 块，快选 ${eq.answer} 号数字帽！`
                  : `数到 ${counted} 了，继续点积木往下数。`
              : add
                ? "合体成功！快给这位新朋友戴上正确的数字帽。"
                : "拆好啦！还剩几块？选出正确的数字帽。"
          : add
            ? eq.right === 0
              ? `把 ${eq.left} 和 0 推到一起，看看变不变！`
              : `把 ${eq.right} 推到 ${eq.left} 身上合体，看看变成几！`
            : eq.right === 0
              ? "1 块都不用拿走，点积木看看还剩几。"
              : `从 ${eq.left} 里向右拆出 ${eq.right} 块，看看还剩几！`;

  const stepTag =
    phase === "won"
      ? "合体完成"
      : phase === "choose"
        ? "戴数字帽"
        : add
          ? "推到一起"
          : "向右拆开";

  const readyActionText = add
    ? "把它们合体！"
    : eq.right === 0
      ? "看看还剩几块"
      : `咔嚓分出 ${eq.right} 块`;

  return (
    <section
      className="play-book nb-theater"
      aria-label="数字积木加减法"
      data-phase={phase}
      data-op={add ? "add" : "sub"}
    >
      <div
        className={"nb-stage" + (phase === "won" ? " is-won" : "")}
        data-max-rows={maxRows}
      >
        <img
          className="nb-stage-bg"
          src="./art/wordbook/meadow.webp"
          alt=""
          draggable={false}
        />
        <div className="nb-meadow-sky" aria-hidden="true" />
        <div className="nb-meadow-hills" aria-hidden="true" />
        <div className="nb-stage-floor" aria-hidden="true" />

        <div className="world-token long-token">
          <small>{add ? "积木合体" : "积木拆一拆"}</small>
          <b>
            {item.label} = {phase === "won" ? eq.answer : "?"}
          </b>
        </div>
        <div className="stage-chapter">{stepTag}</div>

        {counted > 0 && (phase === "choose" || phase === "won") && (
          <div className="nb-count-pill" aria-live="polite">
            数到 <b>{counted}</b> 块
          </div>
        )}

        <div
          className={[
            "nb-arena",
            phase === "animating" ? "is-animating" : "",
            dropReady ? "is-drop-ready" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {(phase === "ready" || phase === "animating") && add && (
            <>
              <div
                ref={leftBlockRef}
                className="nb-actor-slot nb-left-target"
              >
                <NumberBlockFigure
                  value={eq.left}
                  badge={eq.left}
                  mood={dropReady || phase === "animating" ? "excited" : "idle"}
                  dropReady={dropReady}
                />
              </div>

              <span className="nb-op-symbol" aria-hidden="true">
                ＋
              </span>

              <button
                type="button"
                className={[
                  "nb-actor-btn",
                  "nb-draggable",
                  dragging ? "is-dragging" : "",
                  phase === "animating" ? "is-merging-left" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`把 ${eq.right} 推到 ${eq.left} 身上合体`}
                style={
                  dragging
                    ? ({
                        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale(1.04)`,
                      } as CSSProperties)
                    : undefined
                }
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={(e) => endDrag(e, false)}
                onPointerCancel={(e) => endDrag(e, true)}
                onLostPointerCapture={() => {
                  pointer.current = null;
                  setDragging(false);
                  setDragOffset({ x: 0, y: 0 });
                  setDropReady(false);
                }}
                onKeyDown={onHandleKeyDown}
                onClick={() => {
                  if (!swallowClick.current) commitAction();
                }}
              >
                <NumberBlockFigure
                  value={eq.right}
                  badge={eq.right}
                  mood={dragging || phase === "animating" ? "excited" : "idle"}
                  dragging={dragging}
                />
                {!dragging && phase === "ready" && (
                  <span className="nb-drag-cue" aria-hidden="true">
                    <PictureCue kind="drag" />
                  </span>
                )}
              </button>
            </>
          )}

          {(phase === "ready" || phase === "animating") && !add && (
            <>
              <button
                type="button"
                className={[
                  "nb-actor-btn",
                  "nb-draggable",
                  dragging ? "is-dragging" : "",
                  phase === "animating" ? "is-splitting" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={
                  eq.right === 0
                    ? `看看 ${eq.left} 减 0 还剩几`
                    : `从 ${eq.left} 向右拆出 ${eq.right} 块`
                }
                style={
                  dragging
                    ? ({
                        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
                      } as CSSProperties)
                    : undefined
                }
                onPointerDown={startDrag}
                onPointerMove={moveDrag}
                onPointerUp={(e) => endDrag(e, false)}
                onPointerCancel={(e) => endDrag(e, true)}
                onLostPointerCapture={() => {
                  pointer.current = null;
                  setDragging(false);
                  setDragOffset({ x: 0, y: 0 });
                  setDropReady(false);
                }}
                onKeyDown={onHandleKeyDown}
                onClick={() => {
                  if (!swallowClick.current) commitAction();
                }}
              >
                <NumberBlockFigure
                  value={eq.left}
                  badge={eq.left}
                  detachCount={eq.right}
                  mood={dragging || phase === "animating" ? "excited" : "idle"}
                  dragging={dragging}
                />
              </button>

              <span
                className={
                  "nb-exit-pad" +
                  (dropReady || phase === "animating" ? " is-active" : "")
                }
                aria-hidden="true"
              >
                <span className="nb-exit-dashed">− {eq.right}</span>
              </span>
            </>
          )}

          {(phase === "choose" || phase === "won") && (
            <>
              <button
                type="button"
                className={[
                  "nb-actor-btn",
                  "nb-result-actor",
                  phase === "won" ? "is-crowned" : "is-mystery",
                  bounceSeq > 0 ? "is-nudged" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={
                  phase === "won"
                    ? `${answerSpec.name}，点积木数一数`
                    : "未知数字积木，点积木数一数"
                }
                onClick={countNext}
              >
                <NumberBlockFigure
                  value={eq.answer}
                  badge={phase === "won" ? eq.answer : "?"}
                  shapeIndex={shapeIdx}
                  mood={phase === "won" ? "happy" : "puzzled"}
                  countedUpTo={counted}
                />
              </button>

              {!add && (
                <div className="nb-detached-group" aria-hidden="true">
                  <span className="nb-op-symbol">−</span>
                  <NumberBlockFigure
                    value={eq.right}
                    badge={eq.right}
                    mood="bye"
                    splitAway
                  />
                </div>
              )}
            </>
          )}
        </div>

        {(phase === "animating" || phase === "won") && (
          <div className="nb-sparkles" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
        )}
      </div>

      <div className="nb-tray">
        {phase === "ready" && (
          <button
            type="button"
            className="nb-primary-btn"
            onClick={commitAction}
          >
            <span>{readyActionText}</span>
            <ChildIcon name="next" />
          </button>
        )}

        {phase === "animating" && (
          <div className="nb-tray-note">积木正在变身…</div>
        )}

        {phase === "choose" && (
          <div className="nb-choose-wrap">
            <div className="nb-toy-bar">
              <button
                type="button"
                className="nb-toy-btn"
                onClick={countNext}
              >
                <ChildIcon name="choose" />
                <span>
                  {eq.answer === 0
                    ? "点泡泡看一看"
                    : counted > 0
                      ? `继续数 (${counted}/${eq.answer})`
                      : "点积木数一数"}
                </span>
              </button>
              {canMorph && (
                <button
                  type="button"
                  className="nb-toy-btn"
                  onClick={cycleShape}
                >
                  <ChildIcon name="replay" />
                  <span>换个队形</span>
                </button>
              )}
            </div>

            <div className="nb-choices" role="group" aria-label="选择数字帽">
              {choices.map((choice) => {
                const n = Number(choice);
                const spec = blockSpec(n);
                const isWrong = wrongChoice === choice;
                return (
                  <button
                    key={choice}
                    type="button"
                    className={
                      "nb-choice-btn" + (isWrong ? " is-wrong" : "")
                    }
                    style={{ "--nb-accent": spec.accent } as CSSProperties}
                    aria-label={"戴上数字" + choice}
                    onClick={() => pickAnswer(choice)}
                  >
                    <span className="nb-choice-hat" aria-hidden="true">
                      {choice}
                    </span>
                    <span className="nb-choice-dots" aria-hidden="true">
                      {n === 0 ? (
                        <i className="is-zero-dot" />
                      ) : (
                        Array.from({ length: n }, (_, k) => (
                          <i key={k} />
                        ))
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {game.stampFeedback}
        {phase === "won" && (
          <div className="nb-won-bar">
            <div className="nb-won-stamp">
              {game.stampSaved ? <PictureCue kind="stamp" /> : <ChildIcon name="check" />}
              <strong>
                {item.label} = {eq.answer}
              </strong>
              <span>{answerSpec.name}</span>
            </div>

            <div className="nb-won-actions">
              {eq.answer > 0 && (
                <button
                  type="button"
                  className="nb-toy-btn"
                  onClick={countNext}
                >
                  <span>数一数</span>
                </button>
              )}
              {canMorph && (
                <button
                  type="button"
                  className="nb-toy-btn"
                  onClick={cycleShape}
                >
                  <span>换个队形</span>
                </button>
              )}
              <button
                type="button"
                className="game-primary nb-next-btn"
                onClick={game.next}
              >
                {game.nextLabel ?? "接着玩"} <ChildIcon name="next" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="story-dialogue">
        <button
          type="button"
          className="voice-disc"
          aria-label="再听一次提示"
          onClick={() => rt.listen(...clips)}
        >
          <SpeakerIcon />
        </button>
        <div>
          <div aria-live="polite">
            <div className="game-cue">
              <p>{typingTen ? "已输入 1，再按 0 选 10。" : cue}</p>
            </div>
          </div>
        </div>
        <button
          type="button"
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
