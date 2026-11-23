import { useState } from "react";
import { Stage } from "./Stage";
import { GlyphTrace } from "./GlyphTrace";
import { actor, playVoice, type PlayActor, type RoundProps } from "./types";

export const natureWords = new Set(["木", "林", "山", "日", "月"]);
export function NatureLetters(game: RoundProps) {
  const { item, runtime: rt } = game;
  const tree = item.label === "木" || item.label === "林",
    mountain = item.label === "山";
  const [made, setMade] = useState(0),
    [busy, setBusy] = useState(false),
    [won, setWon] = useState(false);
  const steps = item.label === "林" ? 2 : mountain ? 3 : 1;
  const ready = made === steps;
  const sound = ready
    ? "reveal-word"
    : mountain
      ? "raise-peak"
      : tree
        ? made
          ? "two-trees"
          : "plant-seed"
        : "sky-rise";
  const caption = won
    ? item.label + "，" + item.caption + "。"
    : ready
      ? "点一点，看看它藏着哪个字。"
      : mountain
        ? "点亮一座山峰，再让下一座长高。"
        : tree
          ? made
            ? "再点一颗种子，两棵树会变成什么字？"
            : "点点种子，帮小熊种棵树。"
          : "点一点，让" + (item.label === "日" ? "太阳" : "月亮") + "升起来。";
  const actors: PlayActor[] = [
    actor("bear", "bear", 82, 64, 41, { motion: won ? "happy" : "idle" }),
  ];
  if (tree) {
    for (let i = 0; i < steps; i++) {
      const grown = i < made;
      actors.push(
        actor(
          "object-" + i,
          grown ? "tree" : "seed",
          steps === 1 ? 42 : 30 + i * 23,
          grown ? 53 : 77,
          grown ? 55 : 13,
          {
            action:
              !busy && !won && (i === made || ready)
                ? grown
                  ? "看看树里的字"
                  : "种下第" + (i + 1) + "颗种子"
                : undefined,
            hint: !busy && !won && (i === made || (ready && i === 0)),
          },
        ),
      );
    }
  } else if (mountain) {
    for (let i = 0; i < 3; i++) {
      const grown = i < made;
      actors.push(
        actor(
          "object-" + i,
          "mountain",
          26 + i * 16,
          grown ? 60 - (i === 1 ? 8 : 0) : 75,
          grown ? (i === 1 ? 53 : 39) : 15,
          {
            action:
              !busy && !won && (i === made || ready)
                ? grown
                  ? "看看山峰里的字"
                  : "升起第" + (i + 1) + "座山峰"
                : undefined,
            hint: !busy && !won && (i === made || (ready && i === 1)),
          },
        ),
      );
    }
  } else {
    actors.push(
      actor(
        "object-0",
        item.label === "日" ? "sun" : "moon",
        ready ? 49 : 37,
        ready ? 29 : 70,
        ready ? 33 : 22,
        {
          motion: "glow",
          action: busy || won ? undefined : ready ? "找出藏着的字" : "升到天空",
          hint: !busy && !won,
        },
      ),
    );
  }
  function pick() {
    if (busy || won) return;
    if (ready) {
      setWon(true);
      rt.sound("chime");
      rt.speak(item.audio);
      game.onWin();
      return;
    }
    const n = made + 1;
    setBusy(true);
    setMade(n);
    rt.sound("touch");
    rt.later(750, () => {
      setBusy(false);
      rt.speak(
        playVoice(
          n === steps ? "reveal-word" : mountain ? "raise-peak" : "two-trees",
        ),
      );
    });
  }
  return (
    <Stage
      game={game}
      actors={actors}
      backdrop={won ? "clearing" : tree ? "orchard" : "clearing"}
      focus={won ? "friend" : ready ? "work" : "wide"}
      phase={won ? "won" : ready ? "reveal" : "grow"}
      target={item.label}
      targetCaption={item.reading ?? "今天的字"}
      beat={
        won
          ? "字形出现了"
          : tree
            ? "林间种树"
            : mountain
              ? "三峰成山"
              : "抬头看天空"
      }
      cue={caption}
      clips={won ? [item.audio] : [playVoice(sound)]}
      pick={pick}
      success={won}
      extra={
        won && (
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
