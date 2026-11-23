import type { CSSProperties } from "react";
import {
  blockSpec,
  cubePaintFor,
  type FaceStyle,
} from "./numberBlocksModel";

export type BlockMood = "idle" | "excited" | "puzzled" | "happy" | "bye";

function starPoints(cx: number, cy: number, outerR: number, innerR: number) {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outerR : innerR;
    pts.push(
      (cx + Math.cos(angle) * r).toFixed(1) +
        "," +
        (cy + Math.sin(angle) * r).toFixed(1),
    );
  }
  return pts.join(" ");
}

function Mouth({ mood, light }: { mood: BlockMood; light?: boolean }) {
  const stroke = light ? "#782018" : "#22332a";
  if (mood === "puzzled") {
    return (
      <circle
        cx="40"
        cy="40"
        r="3.8"
        fill="#fff8ec"
        stroke={stroke}
        strokeWidth="2.4"
      />
    );
  }
  if (mood === "excited" || mood === "happy") {
    return (
      <>
        <path
          d="M 29 37 Q 40 49 51 37 Z"
          fill="#8c2b2b"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d="M 33 38.5 Q 40 42 47 38.5" fill="#fffdf8" />
      </>
    );
  }
  return (
    <path
      d="M 31 38 Q 40 45 49 38"
      fill="none"
      stroke={stroke}
      strokeWidth="2.8"
      strokeLinecap="round"
    />
  );
}

function EyePair({
  x1 = 27,
  x2 = 53,
  y = 21,
  r = 7.5,
  winkRight = false,
}: {
  x1?: number;
  x2?: number;
  y?: number;
  r?: number;
  winkRight?: boolean;
}) {
  return (
    <>
      <circle
        cx={x1}
        cy={y}
        r={r}
        fill="#ffffff"
        stroke="#22332a"
        strokeWidth="2.2"
      />
      <circle cx={x1 + 1.2} cy={y + 0.5} r={r * 0.48} fill="#1f2c25" />
      <circle cx={x1 + 2.3} cy={y - 1.5} r={r * 0.19} fill="#ffffff" />
      {winkRight ? (
        <path
          d={`M ${x2 - r * 0.8} ${y + 1} Q ${x2} ${y - r * 0.65} ${x2 + r * 0.8} ${y + 1}`}
          fill="none"
          stroke="#22332a"
          strokeWidth="2.6"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle
            cx={x2}
            cy={y}
            r={r}
            fill="#ffffff"
            stroke="#22332a"
            strokeWidth="2.2"
          />
          <circle cx={x2 - 1.2} cy={y + 0.5} r={r * 0.48} fill="#1f2c25" />
          <circle cx={x2 - 0.1} cy={y - 1.5} r={r * 0.19} fill="#ffffff" />
        </>
      )}
    </>
  );
}

function BlockFace({
  styleKind,
  mood,
}: {
  styleKind: FaceStyle;
  mood: BlockMood;
}) {
  return (
    <svg
      className="nb-face"
      viewBox="0 0 80 56"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      {styleKind === "one" && (
        <>
          <circle
            cx="40"
            cy="21"
            r="11.5"
            fill="#ffffff"
            stroke="#4d1d17"
            strokeWidth="2.4"
          />
          <circle cx="40" cy="21.5" r="5.5" fill="#1f2c25" />
          <circle cx="42" cy="18.5" r="2.2" fill="#ffffff" />
          <Mouth mood={mood} light />
        </>
      )}

      {styleKind === "glasses" && (
        <>
          <EyePair x1={25} x2={55} y={21} r={7.2} />
          <circle
            cx="25"
            cy="21"
            r="10.2"
            fill="none"
            stroke="#6e2e11"
            strokeWidth="3"
          />
          <circle
            cx="55"
            cy="21"
            r="10.2"
            fill="none"
            stroke="#6e2e11"
            strokeWidth="3"
          />
          <path
            d="M 35 20 Q 40 17 45 20"
            fill="none"
            stroke="#6e2e11"
            strokeWidth="2.8"
            strokeLinecap="round"
          />
          <Mouth mood={mood} />
        </>
      )}

      {styleKind === "crown" && (
        <>
          <EyePair x1={26} x2={54} y={21} r={7.5} />
          <circle cx="20" cy="31" r="3.5" fill="rgba(226, 85, 70, 0.35)" />
          <circle cx="60" cy="31" r="3.5" fill="rgba(226, 85, 70, 0.35)" />
          <Mouth mood={mood} />
        </>
      )}

      {styleKind === "square" && (
        <>
          <rect
            x="17"
            y="12"
            width="16"
            height="16"
            rx="3.5"
            fill="#ffffff"
            stroke="#22441f"
            strokeWidth="2.2"
          />
          <rect
            x="47"
            y="12"
            width="16"
            height="16"
            rx="3.5"
            fill="#ffffff"
            stroke="#22441f"
            strokeWidth="2.2"
          />
          <circle cx="25.5" cy="20.5" r="3.6" fill="#1f2c25" />
          <circle cx="54.5" cy="20.5" r="3.6" fill="#1f2c25" />
          <rect x="16" y="6" width="18" height="4" rx="2" fill="#234d20" />
          <rect x="46" y="6" width="18" height="4" rx="2" fill="#234d20" />
          <Mouth mood={mood} />
        </>
      )}

      {styleKind === "star" && (
        <>
          <polygon
            points={starPoints(26, 20, 14.5, 6.8)}
            fill="#f7d556"
            stroke="#1e496b"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <EyePair x1={26} x2={54} y={20} r={6.8} />
          <Mouth mood={mood} />
        </>
      )}

      {styleKind === "dice" && (
        <>
          <EyePair x1={26} x2={54} y={21} r={7.6} />
          <Mouth mood={mood} />
        </>
      )}

      {styleKind === "rainbow" && (
        <>
          <EyePair x1={26} x2={54} y={21} r={7.4} />
          <circle cx="19" cy="31" r="3.6" fill="rgba(255, 210, 175, 0.55)" />
          <circle cx="61" cy="31" r="3.6" fill="rgba(255, 210, 175, 0.55)" />
          <Mouth mood={mood} light />
        </>
      )}

      {styleKind === "mask" && (
        <>
          <path
            d="M 11 20 C 13 11, 30 11, 40 17 C 50 11, 67 11, 69 20 C 71 29, 56 32, 45 27 Q 40 25 35 27 C 24 32, 9 29, 11 20 Z"
            fill="#7b2152"
            stroke="#4c1031"
            strokeWidth="2"
          />
          <EyePair x1={25} x2={55} y={21} r={6.8} />
          <Mouth mood={mood} />
        </>
      )}

      {styleKind === "gray-square" && (
        <>
          <EyePair x1={26} x2={54} y={22} r={7.2} />
          <rect x="17" y="7" width="18" height="5" rx="2.5" fill="#46524e" />
          <rect x="45" y="7" width="18" height="5" rx="2.5" fill="#46524e" />
          <Mouth mood={mood} />
        </>
      )}

      {styleKind === "rocket" && (
        <>
          <polygon
            points={starPoints(24, 21, 13.5, 6.2)}
            fill="#e25546"
            stroke="#942b21"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <polygon
            points={starPoints(56, 21, 13.5, 6.2)}
            fill="#e25546"
            stroke="#942b21"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <EyePair x1={24} x2={56} y={21} r={6.2} />
          <Mouth mood={mood} />
        </>
      )}

      {styleKind === "zero" && (
        <>
          <EyePair x1={28} x2={52} y={21} r={6.2} winkRight={mood !== "puzzled"} />
          <Mouth mood={mood} />
        </>
      )}
    </svg>
  );
}

function TopHatAccent({ styleKind }: { styleKind: FaceStyle }) {
  if (styleKind === "crown") {
    return (
      <svg
        className="nb-crown"
        viewBox="0 0 64 26"
        aria-hidden="true"
      >
        <path
          d="M 12 24 L 10 10 L 24 16 L 32 6 L 40 16 L 54 10 L 52 24 Z"
          fill="#e25546"
          stroke="#8d281e"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <circle cx="10" cy="8" r="4" fill="#fae06b" stroke="#8d281e" strokeWidth="2" />
        <circle cx="32" cy="5" r="4.5" fill="#fae06b" stroke="#8d281e" strokeWidth="2" />
        <circle cx="54" cy="8" r="4" fill="#fae06b" stroke="#8d281e" strokeWidth="2" />
      </svg>
    );
  }
  if (styleKind === "rainbow") {
    return (
      <svg className="nb-tuft" viewBox="0 0 54 22" aria-hidden="true">
        <path d="M 10 21 A 17 17 0 0 1 44 21" fill="none" stroke="#e05545" strokeWidth="4" strokeLinecap="round" />
        <path d="M 14 21 A 13 13 0 0 1 40 21" fill="none" stroke="#f0c237" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 18 21 A 9 9 0 0 1 36 21" fill="none" stroke="#4c97c9" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }
  return null;
}

export function NumberBlockFigure({
  value,
  badge,
  shapeIndex = 0,
  mood = "idle",
  detachCount = 0,
  countedUpTo = 0,
  splitAway = false,
  dropReady = false,
  dragging = false,
  className = "",
  style,
}: {
  value: number;
  badge?: string | number;
  shapeIndex?: number;
  mood?: BlockMood;
  detachCount?: number;
  countedUpTo?: number;
  splitAway?: boolean;
  dropReady?: boolean;
  dragging?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const spec = blockSpec(value);
  const shape =
    spec.shapes.length > 0
      ? spec.shapes[shapeIndex % spec.shapes.length]
      : ([1, 1] as const);
  const [cols, rows] = shape;

  const cells: { row: number; col: number; cubeIndex: number }[] = [];
  if (value > 0) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cubeIndex = (rows - 1 - r) * cols + c;
        if (cubeIndex < value) {
          cells.push({ row: r, col: c, cubeIndex });
        }
      }
    }
  }

  return (
    <span
      className={[
        "nb-figure",
        "nb-char-" + value,
        "nb-mood-" + mood,
        splitAway ? "is-split-away" : "",
        dropReady ? "is-drop-ready" : "",
        dragging ? "is-dragging" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-hidden="true"
    >
      {badge !== undefined && (
        <span
          className={
            "nb-numberling" + (badge === "?" ? " is-mystery" : "")
          }
          style={{ "--nb-badge": spec.accent } as CSSProperties}
        >
          {badge}
        </span>
      )}

      {value === 0 ? (
        <span className="nb-zero-bubble">
          <BlockFace styleKind="zero" mood={mood} />
        </span>
      ) : (
        <span className="nb-body-wrap">
          <TopHatAccent styleKind={spec.faceStyle} />
          <span
            className="nb-grid"
            style={
              {
                "--nb-cols": cols,
                "--nb-rows": rows,
              } as CSSProperties
            }
          >
            {cells.map(({ cubeIndex }) => {
              const paint = cubePaintFor(value, cubeIndex, cols);
              const detachable =
                detachCount > 0 && cubeIndex >= value - detachCount;
              const isBoundary =
                detachCount > 0 && cubeIndex === value - detachCount;
              const counted = countedUpTo > 0 && cubeIndex < countedUpTo;
              const activeCount =
                countedUpTo > 0 && cubeIndex === countedUpTo - 1;
              return (
                <span
                  key={cubeIndex}
                  className={[
                    "nb-cube",
                    paint.pip ? "has-pip" : "",
                    detachable ? "is-detachable" : "",
                    isBoundary ? "is-split-seam" : "",
                    counted ? "is-counted" : "",
                    activeCount ? "is-active-count" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    {
                      "--c-bg": paint.bg,
                      "--c-hi": paint.hi,
                      "--c-shade": paint.shade,
                      "--c-border": paint.border,
                    } as CSSProperties
                  }
                >
                  {paint.pip && <i className="nb-pip" />}
                  {counted && (
                    <b className="nb-count-num">{cubeIndex + 1}</b>
                  )}
                </span>
              );
            })}
            <span className="nb-face-slot">
              <BlockFace styleKind={spec.faceStyle} mood={mood} />
            </span>
          </span>
          <span className="nb-feet">
            <i />
            <i />
          </span>
        </span>
      )}
    </span>
  );
}
