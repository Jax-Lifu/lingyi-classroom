import { useReducedMotion } from "./useReducedMotion";
import { ChildIcon } from "../ChildIcon";
import { useEffect, useRef, useState } from "react";
import type HanziWriter from "hanzi-writer";

// Hanzi Writer installs document-level input listeners. Reuse one writing board as children change stories.
let board:
  { host: HTMLDivElement; writer: HanziWriter; word: string } | undefined;

export function GlyphTrace({
  word,
  caption,
  repeat,
}: {
  word: string;
  caption: string;
  repeat: () => void;
}) {
  const reduced = useReducedMotion();
  const holder = useRef<HTMLDivElement>(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    let live = true;
    const element = holder.current;
    if (!element) return;
    setDrawn(false);
    void Promise.all([
      import("hanzi-writer"),
      import("@lingyi-classroom/content/strokes"),
    ])
      .then(async ([{ default: Writer }, { strokeGlyphs }]) => {
        if (!live || !strokeGlyphs[word]) return;
        const size = Math.max(64, element.clientWidth || 112);
        if (!board) {
          const host = document.createElement("div");
          element.replaceChildren(host);
          const writer = Writer.create(host, word, {
            width: size,
            height: size,
            padding: 4,
            renderer: "svg",
            showOutline: true,
            showCharacter: false,
            strokeColor: "#34553b",
            outlineColor: "#d8d4b3",
            strokeAnimationSpeed: 1.8,
            delayBetweenStrokes: 130,
            charDataLoader: (char, loaded, failed) => {
              const glyph = strokeGlyphs[char];
              if (glyph) loaded(glyph);
              else failed();
            },
          });
          board = { host, writer, word };
        } else {
          element.replaceChildren(board.host);
          board.writer.updateDimensions({ width: size, height: size });
          board.word = word;
          await board.writer.setCharacter(word);
        }
        if (!live) return;
        setDrawn(true);
        if (reduced) await board.writer.showCharacter({ duration: 0 });
        else await board.writer.animateCharacter();
      })
      .catch(() => {
        if (live) setDrawn(false);
      });
    return () => {
      live = false;
      if (board?.host.parentNode === element) {
        void board.writer.pauseAnimation().catch(() => {});
        board.host.remove();
      }
    };
  }, [word, reduced]);
  return (
    <button
      className="glyph-sheet"
      aria-label={"重看" + word + "的笔顺"}
      onClick={() => {
        repeat();
        if (board?.word === word && !reduced)
          void board.writer.animateCharacter().catch(() => {});
      }}
    >
      <span>认一认</span>
      <div className="writing-grid">
        <div className="glyph-svg" ref={holder} />
        {!drawn && <b>{word}</b>}
      </div>
      <small className="glyph-repeat">
        <ChildIcon name="replay" />
        {caption}
      </small>
    </button>
  );
}
