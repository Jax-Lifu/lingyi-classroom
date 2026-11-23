import { useRef, useState, type PointerEvent } from "react";
import {
  cargoArrangement,
  cargoWeight,
  elephantWeight,
  stoneWeights,
  type StoneWeight,
} from "@lingyi-classroom/shared";
import { ChildIcon } from "../ChildIcon";
import { Stage } from "./Stage";
import { actor, type RoundProps } from "./types";
import "./explorations.css";

const painted = "art/wordbook/painted/";
const cues = {
  wind: "把风往左、往右拨，看看火苗会往哪边偏。也可以换一丛竹子试试。",
  left: "风往左吹。换个方向，再看看。",
  right: "风往右吹。换个方向，再看看。",
  guess: "这次把风藏起来了。看火苗或竹梢，它往哪边偏？",
  retry: "再看看尖尖的那一头，它偏向哪一边？",
  guessed: "猜到了！你从它弯过去的方向找到了风。",
  bamboo: "同一阵风吹到竹梢。拨一拨，看它往哪边弯。",
  water: "水滴落下来，这簇火苗灭了。",
  earth: "泥土盖住了这簇火苗。点再试一次，还能换一种试。",
  elephant: "大象上船了。看看水面碰到船身哪里，给船画一道记号。",
  cargo: "现在用石头代替大象。试着让船上的记号碰到水面。",
  light: "船浮得还高，记号在水面上方。试试再放一块石头。",
  heavy: "船沉得有点深。点一下船上的石头，就能把它搬下来。",
  level: "船上的记号和水面对齐了！留下这个装法，再试另一种。",
  another: "刚才的装法收好了。这次换些不一样的石头吧。",
  same: "这个装法已经有了。试试用几块小石头换掉一块大的。",
  two: "找到了两种不同的装法，它们让船停在同一条水线上。",
  bear: "小熊说，你把笔给我。谁是现在的我？点一点，把笔递给它。",
  rabbit: "小兔说，你把笔给我。谁是现在的我？点一点，把笔递给它。",
  held: "笔已经在说话人手里了。换个人说，再听听。",
  other: "听，是谁在说我？把笔递给说话的那个朋友。",
  received: "收到了！把话筒换给另一个朋友，再听同一句话。",
  both: "两位朋友都接到了笔。换一个人开口，我指的人也换了。",
};
type Cue = keyof typeof cues;
const clip = (key: Cue) => "media/explorations/" + key + ".mp3";

function Tool({
  label,
  picture,
  onClick,
  disabled,
}: {
  label: string;
  picture?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="lab-tool"
      disabled={disabled}
      onClick={onClick}
    >
      {picture && <img src={"./" + picture} alt="" />}
      <span>{label}</span>
    </button>
  );
}

export function WindLesson(game: RoundProps) {
  const [subject, setSubject] = useState<"flame" | "bamboo">("flame");
  const [wind, setWind] = useState(0);
  const [extinguished, setExtinguished] = useState<"water" | "earth" | null>(
    null,
  );
  const observed = useRef(new Set<string>());
  const [discovered, setDiscovered] = useState(false);
  const [guess, setGuess] = useState<"guess" | "retry" | "guessed" | null>(
    null,
  );
  function hideWind() {
    setExtinguished(null);
    setWind(Math.random() < 0.5 ? -2 : 2);
    setGuess("guess");
    game.runtime.speak(clip("guess"));
  }
  function tryDirection(direction: number) {
    const result = direction === Math.sign(wind) ? "guessed" : "retry";
    setGuess(result);
    game.runtime.speak(clip(result));
  }
  function observe(effect: string) {
    const seen = observed.current;
    seen.add(effect);
    if (
      !discovered &&
      seen.has("flame-wind") &&
      (seen.has("bamboo-wind") || seen.has("water") || seen.has("earth"))
    ) {
      setDiscovered(true);
      game.onWin();
    }
  }
  function changeWind(value: number) {
    setWind(value);
    if (value && (subject === "bamboo" || !extinguished))
      observe(subject + "-wind");
  }
  function changeSubject(next: typeof subject) {
    setSubject(next);
    if (wind && (next === "bamboo" || !extinguished)) observe(next + "-wind");
    game.runtime.speak(
      clip(next === "bamboo" ? "bamboo" : (extinguished ?? "wind")),
    );
  }
  function putOut(method: "water" | "earth") {
    setExtinguished(method);
    observe(method);
    game.runtime.sound(method === "water" ? "splash" : "touch");
    game.runtime.speak(clip(method));
  }
  const isBamboo = subject === "bamboo";
  const ended = !isBamboo && extinguished;
  const cue: Cue =
    guess ||
    ended ||
    (wind < 0 ? "left" : wind > 0 ? "right" : isBamboo ? "bamboo" : "wind");
  const actors = isBamboo
    ? [
        actor("bamboo", "photo", 53, 58, 51, {
          picture: painted + "bamboo.webp",
          wind: wind / 2,
        }),
      ]
    : [
        actor("log", "photo", 52, 74, 19, { picture: painted + "log.webp" }),
        ended
          ? actor("trace", "photo", 52, 65, 22, {
              picture:
                ended === "water"
                  ? painted + "water-drop.webp"
                  : painted + "shovel.webp",
            })
          : actor("flame", "flame", 52, 56, 49, { wind: wind / 2 }),
      ];
  const windText =
    wind === 0
      ? "静风"
      : (wind < 0 ? "向左" : "向右") + (Math.abs(wind) === 2 ? "强风" : "微风");
  return (
    <Stage
      game={game}
      actors={actors}
      phase={ended || subject}
      backdrop="clearing"
      pick={() => {}}
      target={isBamboo ? "竹" : ended ? "灭" : "火"}
      targetCaption={isBamboo ? "zhú" : ended ? "miè" : "huǒ"}
      beat={guess ? "猜风向" : windText}
      cue={cues[cue]}
      clips={[clip(cue)]}
      extra={
        ended && (
          <div className={"fire-trace trace-" + ended} aria-hidden="true" />
        )
      }
      controls={
        <div className="lab-controls">
          {guess ? (
            <div className="lab-tools">
              {guess === "guessed" ? (
                <Tool label="再猜一阵风" onClick={hideWind} />
              ) : (
                <>
                  <Tool label="向左吹" onClick={() => tryDirection(-1)} />
                  <Tool label="向右吹" onClick={() => tryDirection(1)} />
                </>
              )}
              <Tool label="回去拨风" onClick={() => setGuess(null)} />
            </div>
          ) : (
            <>
              <div className="lab-wind">
                <label htmlFor="lab-wind">拨动风向</label>
                <input
                  id="lab-wind"
                  type="range"
                  min="-2"
                  max="2"
                  step="1"
                  value={wind}
                  aria-valuetext={windText}
                  onChange={(e) => changeWind(Number(e.currentTarget.value))}
                />
                <span className="lab-scale" aria-hidden="true">
                  <span>向左</span>
                  <span>静风</span>
                  <span>向右</span>
                </span>
              </div>
              <div className="lab-tools">
                <Tool
                  label={isBamboo ? "换回火苗" : "换成竹子"}
                  picture={
                    isBamboo
                      ? "art/wordbook/fire.webp"
                      : painted + "bamboo.webp"
                  }
                  onClick={() => changeSubject(isBamboo ? "flame" : "bamboo")}
                />
                {!isBamboo &&
                  (ended ? (
                    <Tool
                      label="再试一次"
                      picture="art/wordbook/fire.webp"
                      onClick={() => {
                        setExtinguished(null);
                        if (wind) observe("flame-wind");
                        game.runtime.speak(clip("wind"));
                      }}
                    />
                  ) : (
                    <>
                      <Tool
                        label="水"
                        picture={painted + "water-drop.webp"}
                        onClick={() => putOut("water")}
                      />
                      <Tool
                        label="土"
                        picture={painted + "shovel.webp"}
                        onClick={() => putOut("earth")}
                      />
                    </>
                  ))}
              </div>
            </>
          )}
          {discovered && !guess && (
            <p className="lab-record">
              <ChildIcon name="check" /> 发现了风的作用
              <button className="guess-wind" type="button" onClick={hideWind}>
                猜风向 <ChildIcon name="next" />
              </button>
            </p>
          )}
        </div>
      }
    />
  );
}

const stoneNames: Record<StoneWeight, string> = {
  1: "小石",
  2: "中石",
  3: "大石",
};
export function BoatLesson(game: RoundProps) {
  const [marked, setMarked] = useState(false);
  const [stones, setStones] = useState<StoneWeight[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const total = cargoWeight(stones);
  const load = marked ? total : elephantWeight;
  const level = marked && total === elephantWeight;
  const combination = cargoArrangement(stones);
  const known = saved.includes(combination);
  const cue: Cue = !marked
    ? "elephant"
    : level
      ? known
        ? "same"
        : "level"
      : total > elephantWeight
        ? "heavy"
        : total > 0
          ? "light"
          : saved.length > 1
            ? "two"
            : saved.length
              ? "another"
              : "cargo";
  function remember() {
    if (!level || known) return;
    const next = [...saved, combination];
    setSaved(next);
    setStones([]);
    game.runtime.sound("chime");
    game.runtime.speak(clip(next.length === 1 ? "another" : "two"));
    if (next.length >= 2) game.onWin();
  }
  return (
    <Stage
      game={game}
      actors={[]}
      phase={marked ? "cargo" : "elephant"}
      backdrop="pond"
      target="称"
      targetCaption="chēng"
      beat={marked ? "配石头" : "记水线"}
      pick={() => {}}
      cue={cues[cue]}
      clips={[clip(cue)]}
      extra={
        <div className="weigh-scene">
          <div
            className="load-boat"
            style={{ bottom: 28 - (load - elephantWeight) * 2.5 + "%" }}
          >
            <div className="boat-deck">
              {!marked ? (
                <img
                  className="weigh-elephant"
                  src={"./" + painted + "elephant.webp"}
                  alt="船上的大象"
                />
              ) : (
                stones.map((stone, i) => (
                  <button
                    type="button"
                    key={i}
                    className={"onboard-stone stone-" + stone}
                    aria-label={"取下第" + (i + 1) + "块" + stoneNames[stone]}
                    onClick={() => {
                      setStones(stones.filter((_, j) => j !== i));
                      game.runtime.sound("touch");
                    }}
                  >
                    <img src={"./" + painted + "stone.webp"} alt="" />
                    <span>{stone}</span>
                  </button>
                ))
              )}
            </div>
            <div
              className="weigh-hull"
              style={{ backgroundImage: 'url("./art/play/boat.webp")' }}
            />
            {marked && <span className="hull-mark" aria-hidden="true" />}
          </div>
          <div className="river-level">
            <span>水面</span>
          </div>
        </div>
      }
      controls={
        <div className="lab-controls">
          <div className="lab-tools">
            {!marked ? (
              <Tool
                label="记下水线，换石头"
                picture="art/play/boat.webp"
                onClick={() => {
                  setMarked(true);
                  game.runtime.speak(clip("cargo"));
                }}
              />
            ) : (
              <>
                {stoneWeights.map((w) => (
                  <Tool
                    key={w}
                    label={stoneNames[w] + " " + w}
                    picture={painted + "stone.webp"}
                    disabled={total + w > 9}
                    onClick={() => {
                      setStones([...stones, w]);
                      game.runtime.sound("touch");
                    }}
                  />
                ))}
                {stones.length > 0 && !known && (
                  <Tool label="清空石头" onClick={() => setStones([])} />
                )}
                <Tool
                  label="记住装法"
                  disabled={!level || known}
                  onClick={remember}
                />
                {known && (
                  <Tool label="换个装法" onClick={() => setStones([])} />
                )}
              </>
            )}
          </div>
          {marked && (
            <p className="lab-record" aria-live="polite">
              当前石重 <b>{total}</b> / 水线目标 <b>{elephantWeight}</b>（
              {total === elephantWeight
                ? "刚好和水线齐平！"
                : total < elephantWeight
                  ? "船还浮得高"
                  : "船沉得太深"}
              ）
            </p>
          )}
          {saved.length > 0 && (
            <p className="lab-record">
              我的装法　
              {saved.map((s) => s.replaceAll("+", "＋")).join("　/　")}
            </p>
          )}
        </div>
      }
    />
  );
}

type Friend = "bear" | "rabbit";
const friends = {
  bear: { name: "小熊", picture: "art/bear.webp" },
  rabbit: { name: "小兔", picture: painted + "rabbit.webp" },
};
export function PencilLesson(game: RoundProps) {
  const [speaker, setSpeaker] = useState<Friend>("bear");
  const [owner, setOwner] = useState<Friend>("rabbit");
  const [cue, setCue] = useState<Cue>("bear");
  const received = useRef(new Set<Friend>());
  const drag = useRef<{ id: number; x: number; y: number } | null>(null);
  function finishDrag(e: PointerEvent<HTMLImageElement>, drop: boolean) {
    const start = drag.current;
    if (!start || start.id !== e.pointerId) return;
    drag.current = null;
    const pencil = e.currentTarget;
    pencil.style.translate = "";
    delete pencil.dataset.dragging;
    if (!drop) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) < 5) {
      give(owner);
      return;
    }
    const targets =
      pencil.parentElement?.querySelectorAll<HTMLButtonElement>(
        "[data-friend]",
      );
    for (const target of targets ?? []) {
      const rect = target.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        give(target.dataset.friend as Friend);
        break;
      }
    }
  }
  function changeSpeaker() {
    const next = speaker === "bear" ? "rabbit" : "bear";
    setSpeaker(next);
    const line = owner === next ? "held" : next;
    setCue(line);
    game.runtime.speak(clip(next), ...(line === "held" ? [clip("held")] : []));
  }
  function give(to: Friend) {
    let line: Cue;
    if (owner === speaker) line = "held";
    else if (to !== speaker) line = "other";
    else {
      setOwner(to);
      received.current.add(to);
      line = received.current.size === 2 ? "both" : "received";
      game.runtime.sound("chime");
      if (received.current.size === 2) game.onWin();
    }
    setCue(line);
    game.runtime.speak(clip(line));
  }
  return (
    <Stage
      game={game}
      actors={[]}
      backdrop="clearing"
      phase={owner}
      pick={() => {}}
      target="我"
      targetCaption="wǒ"
      beat="谁在说话？"
      cue={cues[cue]}
      clips={[clip(cue)]}
      extra={
        <div className={"pencil-scene speaker-" + speaker + " owner-" + owner}>
          <button
            className="speech-note"
            aria-label={"听" + friends[speaker].name + "说话"}
            onClick={() => game.runtime.listen(clip(speaker))}
          >
            <small>{friends[speaker].name}说</small>
            <strong>“你把笔给我。”</strong>
          </button>
          {(["bear", "rabbit"] as const).map((f) => (
            <button
              key={f}
              data-friend={f}
              className={"pencil-friend friend-" + f}
              aria-label={"把笔给" + friends[f].name}
              onClick={() => give(f)}
            >
              <img src={"./" + friends[f].picture} alt="" />
              <span>{friends[f].name}</span>
            </button>
          ))}
          <img
            className="shared-pencil"
            src={"./" + painted + "pencil.webp"}
            alt={"笔在" + friends[owner].name + "手里"}
            draggable={false}
            onPointerDown={(e) => {
              if (!e.isPrimary || e.button !== 0) return;
              drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
              e.currentTarget.setPointerCapture(e.pointerId);
              e.currentTarget.dataset.dragging = "true";
            }}
            onPointerMove={(e) => {
              if (drag.current?.id === e.pointerId)
                e.currentTarget.style.translate =
                  e.clientX -
                  drag.current.x +
                  "px " +
                  (e.clientY - drag.current.y) +
                  "px";
            }}
            onPointerUp={(e) => finishDrag(e, true)}
            onPointerCancel={(e) => finishDrag(e, false)}
          />
        </div>
      }
      controls={
        <div className="lab-controls">
          <div className="lab-tools">
            <Tool
              label={"换" + (speaker === "bear" ? "小兔" : "小熊") + "说"}
              picture={painted + "talk.webp"}
              onClick={changeSpeaker}
            />
          </div>
        </div>
      }
    />
  );
}
