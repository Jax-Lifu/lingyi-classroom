import { ChildIcon } from "./ChildIcon";
import { useState } from "react";
import type { Poem } from "@lingyi-classroom/shared";
import { useNarration } from "./useNarration";

export function PoemCard({
  poem,
  done,
  mark,
}: {
  poem: Poem;
  done: boolean;
  mark: () => void;
}) {
  const voice = useNarration();
  const [cover, setCover] = useState(false);
  const [hints, setHints] = useState<Set<number>>(new Set());
  const [active, setActive] = useState(-1);
  const starts = poem.lineStarts ?? [];
  const timed =
    !!poem.audio && starts.length === poem.lines.length && starts.length > 0;
  function read(index?: number) {
    if (index === undefined && voice.playing) {
      voice.stop();
      setActive(-1);
      return;
    }
    setActive(index ?? 0);
    voice.play(
      poem.audio,
      index === undefined ? 0 : starts[index],
      index === undefined ? undefined : starts[index + 1],
      (seconds) => {
        if (!timed) return;
        let i = 0;
        while (i + 1 < starts.length && seconds >= starts[i + 1]) i++;
        setActive(i);
      },
    );
  }
  const source = (
    <a
      className="source-link"
      href={poem.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      查看原篇出处 ↗
    </a>
  );
  return (
    <article className="practice-pad poem-pad" aria-label="古诗文学习">
      <div className="pad-label">
        {poem.group} · {poem.kind}
      </div>
      <h2>{poem.title}</h2>
      <p className="poet">{poem.author || "作者未署名"}</p>
      {poem.lines.length === 0 ? (
        <div className="index-note">
          <p>本篇收录目录和出处。</p>
          {poem.note && <p>{poem.note}</p>}
          {source}
        </div>
      ) : (
        <>
          <div className="poem-controls">
            {poem.audio && (
              <button className="leaf-button" onClick={() => read()}>
                <ChildIcon name={voice.playing ? "stop" : "sound"} />
                {voice.playing ? "停止" : "听朗读"}
              </button>
            )}
            <button
              className="plain-button"
              onClick={() => {
                voice.stop();
                setActive(-1);
                setCover(!cover);
                setHints(new Set());
              }}
            >
              {cover ? "显示全文" : "遮句接背"}
            </button>
          </div>
          <div className="poem-lines">
            {poem.lines.map((line, i) => {
              const hidden = cover && !hints.has(i);
              return (
                <button
                  key={i}
                  className={
                    "verse" +
                    (voice.playing && active === i ? " sounding" : "") +
                    (hidden ? " concealed" : "")
                  }
                  onClick={() => {
                    if (hidden) {
                      setHints((old) => new Set([...old, i]));
                      return;
                    }
                    if (timed) read(i);
                  }}
                  disabled={!hidden && !timed}
                  aria-label={
                    hidden
                      ? `提示第${i + 1}句`
                      : (timed ? `听第${i + 1}句，` : "") + line
                  }
                >
                  {hidden ? `第${i + 1}句 · 看提示` : line}
                </button>
              );
            })}
          </div>
          <div className="poem-foot">
            <small>
              {poem.audio ? "普通话合成朗读" : ""}
              {timed && " · 点诗句可单听"}
            </small>
            {source}
          </div>
          <button
            className="plain-button mark-poem"
            onClick={mark}
          >
            {done ? "✓ 已练过 · 取消标记" : "记为已练过"}
          </button>
        </>
      )}
      {voice.error && <p role="status">{voice.error}</p>}
    </article>
  );
}
