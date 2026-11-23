import { practiceChoices } from "@lingyi-classroom/shared";
import { curriculum } from "@lingyi-classroom/content";
import { useMemo, useState } from "react";
import { numberPictographFor } from "@lingyi-classroom/content/number-pictographs";
import { Stage } from "./Stage";
import { GlyphTrace } from "./GlyphTrace";
import {
  actor,
  countVoice,
  playVoice,
  type Clip,
  type PlayActor,
  type RoundProps,
} from "./types";

export function Fishing(game: RoundProps) {
  const { item, runtime: rt } = game;
  const first = item.label === "一";
  const [phase, setPhase] = useState<
    "find" | "landing" | "roast" | "ready" | "feed" | "won"
  >("find");
  const [wrong, setWrong] = useState("");
  const [misses, setMisses] = useState(0);
  const actors: PlayActor[] = [];
  const finding = phase === "find";
  const cue = finding
    ? first
      ? "小熊饿啦，点一条小鱼。"
      : "听一听，钓起带「" + item.label + "」的小鱼。"
    : phase === "landing"
      ? "小鱼跳上烤架啦！"
      : phase === "roast"
        ? first
          ? "一条鱼。"
          : item.label + "，" + item.caption + "。"
        : phase === "ready"
          ? "好香呀！点点烤好的鱼，喂小熊。"
          : phase === "feed"
            ? "啊呜，小熊吃到啦！"
            : "小熊记住了「" + item.label + "」！";
  const clips: (Clip | undefined)[] = finding
    ? first
      ? [playVoice("fish-intro")]
      : [playVoice("hanzi-find"), item.audio]
    : phase === "ready"
      ? [playVoice("fish-ready")]
      : phase === "won"
        ? [item.audio]
        : [first ? playVoice("fish-label") : item.audio];
  const id = "fish-" + item.id;
  if (finding) {
    actors.push(actor("shore-dock", "dock", 79, 68, 20));
    actors.push(actor("bear", "bear", 79, 46, 45));
    (first ? [item] : game.alternatives).forEach((v, i) => {
      const x = first ? 38 : [19, 45, 69][i],
        y = first ? 71 : [67, 77, 68][i];
      actors.push(
        actor("fish-" + v.id, "fish", x, y, first ? 22 : 16, {
          motion: wrong === v.id ? "shake" : "swim",
          label: first ? undefined : v.label,
          action: "钓起" + (first ? "小鱼" : v.label + "字小鱼"),
          hint: first || (misses > 1 && v.id === item.id),
        }),
      );
    });
  } else {
    actors.push(
      actor("bear", "bear", 75, 53, 62, {
        motion: ["feed", "won"].includes(phase) ? "happy" : "idle",
      }),
      actor("stove", "grill", 42, 74, 31, {
        motion: phase === "roast" || phase === "ready" ? "cook" : "idle",
      }),
    );
    if (phase !== "won")
      actors.push(
        actor(
          id,
          "fish",
          phase === "feed" ? 73 : 42,
          phase === "feed" ? 44 : 64,
          phase === "feed" ? 9 : 19,
          {
            motion: ["roast", "ready"].includes(phase) ? "cook" : "idle",
            tint: phase === "ready" || phase === "feed" ? "#c98b43" : undefined,
            action: phase === "ready" ? "把烤好的鱼喂给小熊" : undefined,
            hint: phase === "ready",
          },
        ),
      );
  }
  function pick(pickId: string) {
    if (finding) {
      if (pickId !== id) {
        setWrong(pickId.slice(5));
        setMisses((n) => n + 1);
        rt.sound("splash");
        rt.speak(playVoice("gentle"), item.audio);
        rt.later(460, () => setWrong(""));
        return;
      }
      rt.stop();
      rt.sound("splash");
      setPhase("landing");
      rt.later(950, () => {
        setPhase("roast");
        rt.sound("sizzle");
        rt.speak(first ? playVoice("fish-label") : item.audio);
      });
      rt.later(3060, () => rt.sound("sizzle"));
      rt.later(3550, () => {
        setPhase("ready");
        rt.speak(playVoice("fish-ready"));
      });
    } else if (phase === "ready" && pickId === id) {
      setPhase("feed");
      rt.stop();
      rt.sound("touch");
      rt.later(480, () => {
        rt.sound("chime");
        rt.speak(playVoice("fish-thanks"));
      });
      rt.later(900, () => {
        setPhase("won");
        game.onWin();
      });
    }
  }
  return (
    <Stage
      game={game}
      actors={actors}
      backdrop={finding ? "pond" : "clearing"}
      focus={
        finding
          ? "wide"
          : phase === "feed" || phase === "won"
            ? "friend"
            : "work"
      }
      phase={phase}
      target={item.label}
      targetCaption={item.reading ?? "今天的字"}
      beat={
        finding ? "溪边找鱼" : phase === "won" ? "字宝宝到家" : "小熊的厨房"
      }
      cue={wrong ? "它游开啦，再找找「" + item.label + "」。" : cue}
      clips={clips}
      pick={pick}
      success={phase === "won"}
      extra={
        phase === "won" && (
          <GlyphTrace
            word={item.label}
            caption={item.caption}
            repeat={() => rt.listen(item.audio)}
          />
        )
      }
    />
  );
}

function basketFruit(
  count: number,
  x: number,
  y: number,
  prefix: string,
): PlayActor[] {
  const columns = Math.min(5, count);
  return Array.from({ length: count }, (_, i) =>
    actor(
      prefix + i,
      "berry",
      x + ((i % 5) - (columns - 1) / 2) * 3.65,
      y - Math.floor(i / 5) * 3.15,
      4.8,
    ),
  );
}
export function Orchard(game: RoundProps) {
  const rt = game.runtime,
    goal = game.item.amount!;
  const numArt = numberPictographFor(goal);
  const [count, setCount] = useState(0),
    [moving, setMoving] = useState(false),
    [won, setWon] = useState(false),
    [feedback, setFeedback] = useState("");
  const actors = [
    actor("bear", "bear", 78, 49, 54, { motion: won ? "happy" : "idle" }),
    actor("basket", "basket", won ? 69 : 52, won ? 69 : 74, 29, {
      action: !won && !moving ? "把篮子送给小熊" : undefined,
      hint: !won && !moving && count === goal,
    }),
    ...basketFruit(count, won ? 69 : 52, won ? 67 : 72, "kept"),
  ];
  if (!won && goal >= 10 && count === 0 && !moving)
    actors.push(
      actor("ten", "basket", 20, 43, 18, {
        label: "10",
        action: "装进一整篮十颗草莓",
      }),
    );
  if (!won) {
    actors.push(
      actor("vine", "berry", 21, 68, 17, { faded: true }),
      actor("berry-" + count, "berry", moving ? 52 : 25, moving ? 65 : 64, 17, {
        action: !moving && count < 20 ? "采一颗草莓" : undefined,
        hint: count < goal && !moving,
      }),
    );
    if (count > 0)
      actors.push(
        actor("undo", "sign", 20, 88, 10, {
          label: "−1",
          action: !moving ? "放回一颗草莓" : undefined,
          hint: count > goal && !moving,
        }),
      );
  }
  function pick(id: string) {
    if (won || moving) return;
    if (id === "ten" && count === 0 && goal >= 10) {
      setCount(10);
      setFeedback("");
      rt.sound("chime");
      rt.speak(
        playVoice("basket-ten"),
        ...(goal === 10 ? [playVoice("number-send")] : []),
      );
      return;
    }
    if (id.startsWith("berry-") && count < 20) {
      setFeedback("");
      setMoving(true);
      rt.stop();
      rt.sound("touch");
      rt.later(430, () => {
        setCount(count + 1);
        setMoving(false);
        rt.speak(
          countVoice(count + 1),
          ...(count + 1 === goal ? [playVoice("number-send")] : []),
        );
      });
    } else if (id === "undo" && count) {
      setCount(count - 1);
      setFeedback("");
      rt.speak(countVoice(count - 1));
    } else if (id === "basket") {
      if (count === goal) {
        setWon(true);
        game.onWin();
        rt.sound("chime");
        rt.speak(countVoice(count), playVoice("all-done"));
      } else {
        const less = count < goal;
        setFeedback(
          less
            ? "还差 " + (goal - count) + " 颗，再采一点。"
            : "多了 " + (count - goal) + " 颗，点木牌放回去。",
        );
        rt.speak(
          playVoice(less ? "number-fewer" : "number-more"),
          countVoice(goal),
        );
      }
    }
  }
  const cue = won
    ? "送到了！篮子里有 " + goal + " 颗草莓。"
    : moving
      ? "草莓正飞进篮子。"
      : feedback ||
        (count > goal
          ? "多了 " + (count - goal) + " 颗，点木牌放回去。"
          : count === goal
            ? "数量正好，把篮子送给小熊。"
            : "点草莓采果子，给小熊送 " + goal + " 颗。");
  return (
    <Stage
      game={game}
      actors={actors}
      backdrop={won ? "clearing" : "orchard"}
      focus={won ? "friend" : "wide"}
      phase={won ? "won" : moving ? "picking" : "collect"}
      target={String(goal)}
      targetCaption="小熊想要"
      beat={won ? "野餐出发" : "草莓果园"}
      cue={cue}
      clips={
        won
          ? [countVoice(count)]
          : count === goal
            ? [countVoice(goal), playVoice("number-send")]
            : [game.item.audio, playVoice("number-pick")]
      }
      pick={pick}
      success={won}
      extra={
        !won && (
          <div className="basket-meter" aria-live="polite">
            篮子里 <b>{count}</b> 颗
          </div>
        )
      }
      controls={
        <div className="orchard-controls">
          {numArt && (
            <div className="orchard-mnemonic">
              <img src={"./" + numArt.image} alt="" />
              <span>
                <strong>
                  {game.item.label} · {game.item.caption}
                </strong>
                <small>{numArt.mnemonic}</small>
              </span>
            </div>
          )}
          <div className="orchard-actions" role="group" aria-label="采草莓操作">
            <button
              type="button"
              className="orchard-btn"
              disabled={won || moving || count >= 20}
              onClick={() => pick("berry-" + count)}
            >
              <span>＋1 采草莓</span>
            </button>
            {goal >= 10 && count === 0 && !won && (
              <button
                type="button"
                className="orchard-btn"
                disabled={moving}
                onClick={() => pick("ten")}
              >
                <span>＋10 装一篮</span>
              </button>
            )}
            {count > 0 && !won && (
              <button
                type="button"
                className="orchard-btn"
                disabled={moving}
                onClick={() => pick("undo")}
              >
                <span>−1 放回一颗</span>
              </button>
            )}
            <button
              type="button"
              className={
                "orchard-btn is-send" + (count === goal && !won ? " is-ready" : "")
              }
              disabled={won || moving}
              onClick={() => pick("basket")}
            >
              <span>
                送给小熊 ({count}/{goal})
              </span>
            </button>
          </div>
        </div>
      }
    />
  );
}

export function PicnicShop(game: RoundProps) {
  const { item, runtime: rt } = game,
    eq = item.equation!,
    add = eq.sign === "+";
  const [moved, setMoved] = useState(0),
    [moving, setMoving] = useState(false),
    [phase, setPhase] = useState<"move" | "choose" | "won">("move");
  const [miss, setMiss] = useState(false);
  const current = eq.left + (add ? moved : -moved);
  const labels = useMemo(
    () => practiceChoices("math", item, curriculum.math),
    [item],
  );
  const actors: PlayActor[] = [
    actor(
      "bear",
      "bear",
      78,
      phase === "move" ? 47 : 42,
      phase === "move" ? 54 : 47,
      { motion: phase === "won" ? "happy" : "idle" },
    ),
    actor(
      "basket",
      "basket",
      phase === "won" ? 70 : phase === "choose" ? 76 : 49,
      phase === "move" ? 75 : 65,
      phase === "choose" ? 18 : 29,
      {
        action: phase === "move" && eq.right === 0 ? "看看篮子" : undefined,
        hint: phase === "move" && eq.right === 0,
      },
    ),
  ];
  if (phase === "choose") {
    // Spread the very same berries over a low board, so the rim cannot hide the answer.
    actors.push(actor("count-board", "plate", 43, 57, 27));
    const columns = Math.min(5, current);
    for (let i = 0; i < current; i++) {
      actors.push(
        actor(
          "basketfruit" + i,
          "berry",
          43 + ((i % 5) - (columns - 1) / 2) * 6.8,
          (current > 5 ? 49 : 54) + Math.floor(i / 5) * 7.6,
          7.5,
        ),
      );
    }
  } else {
    actors.push(
      ...basketFruit(
        current - (phase === "move" && !add && moved < eq.right ? 1 : 0),
        phase === "won" ? 70 : 49,
        phase === "move" ? 73 : 64,
        "basketfruit",
      ),
    );
  }
  if (phase === "move") {
    if (add)
      actors.push(
        actor("tray", "plate", 22, 82, 18),
        ...basketFruit(Math.max(0, eq.right - moved - 1), 22, 77, "supply"),
      );
    if (moved < eq.right)
      actors.push(
        actor(
          "transfer-" + moved,
          "berry",
          moving ? (add ? 49 : 76) : add ? 23 : 49,
          moving ? (add ? 65 : 42) : add ? 73 : 68,
          18,
          {
            action: moving ? undefined : add ? "装进一颗草莓" : "分出一颗草莓",
            hint: !moving,
          },
        ),
      );
  } else if (phase === "choose") {
    labels.forEach((v, i) =>
      actors.push(
        actor("tag-" + v, "sign", [21, 48, 75][i], 83, 18, {
          label: v,
          action: "挂上数字" + v,
        }),
      ),
    );
  }
  function pick(id: string) {
    if (phase === "move" && !moving) {
      if (eq.right === 0) {
        setPhase("choose");
        rt.speak(item.audio, playVoice("math-choose"));
        return;
      }
      if (!id.startsWith("transfer-")) return;
      setMoving(true);
      rt.sound("touch");
      rt.stop();
      rt.later(450, () => {
        const n = moved + 1;
        setMoved(n);
        setMoving(false);
        if (n === eq.right) {
          setPhase("choose");
          rt.speak(item.audio, playVoice("math-choose"));
        } else rt.speak(countVoice(eq.left + (add ? n : -n)));
      });
    } else if (phase === "choose" && id.startsWith("tag-")) {
      if (id === "tag-" + eq.answer) {
        setPhase("won");
        game.onWin();
        rt.sound("chime");
        rt.speak(countVoice(eq.answer), playVoice("all-done"));
      } else {
        setMiss(true);
        rt.speak(playVoice("gentle"), item.audio);
      }
    }
  }
  const cue =
    phase === "won"
      ? "挂好了！" + item.label + " = " + eq.answer + "。"
      : phase === "choose"
        ? miss
          ? "再数数木盘里的草莓，换一块数字牌。"
          : "草莓排好了，数一数，挂上数字牌。"
        : eq.right === 0
          ? "不用搬，点篮子，看看还剩几颗。"
          : add
            ? "原有 " + eq.left + " 颗，再装 " + eq.right + " 颗。"
            : "原有 " + eq.left + " 颗，分给小熊 " + eq.right + " 颗。";
  return (
    <Stage
      game={game}
      actors={actors}
      backdrop={phase === "move" ? "orchard" : "clearing"}
      focus={phase === "won" ? "friend" : phase === "choose" ? "wide" : "work"}
      phase={phase}
      target={phase === "won" ? String(eq.answer) : item.label}
      targetCaption={add ? "添进篮子" : "分给小熊"}
      beat={phase === "move" ? "野餐备料" : "挂数字牌"}
      cue={cue}
      clips={
        phase === "move"
          ? [
              item.audio,
              playVoice(
                eq.right === 0 ? "math-zero" : add ? "math-add" : "math-sub",
              ),
            ]
          : [
              item.audio,
              playVoice(phase === "won" ? "all-done" : "math-choose"),
            ]
      }
      pick={pick}
      success={phase === "won"}
      extra={
        phase === "move" && (
          <div className="basket-meter" aria-live="polite">
            {add ? "已添" : "已分"} <b>{moved}</b> / {eq.right}
          </div>
        )
      }
    />
  );
}
