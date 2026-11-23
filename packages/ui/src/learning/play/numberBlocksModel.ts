export interface CubePaint {
  bg: string;
  hi: string;
  shade: string;
  border: string;
  pip?: boolean;
}

export type FaceStyle =
  | "zero"
  | "one"
  | "glasses"
  | "crown"
  | "square"
  | "star"
  | "dice"
  | "rainbow"
  | "mask"
  | "gray-square"
  | "rocket";

export interface NumberBlockSpec {
  value: number;
  name: string;
  accent: string;
  shapes: readonly (readonly [number, number])[];
  faceStyle: FaceStyle;
}

const characterPaints: Record<number, CubePaint> = {
  0: {
    bg: "#f4f8f4",
    hi: "#ffffff",
    shade: "#d5e4da",
    border: "#5e8f7b",
  },
  1: {
    bg: "#e25546",
    hi: "#f57c6c",
    shade: "#be3c2e",
    border: "#8d281e",
  },
  2: {
    bg: "#ee8c34",
    hi: "#faad5c",
    shade: "#cb6d1d",
    border: "#924a0f",
  },
  3: {
    bg: "#f0c237",
    hi: "#fae06b",
    shade: "#d49f1b",
    border: "#986d0c",
  },
  4: {
    bg: "#64ab56",
    hi: "#87ca76",
    shade: "#4a8c3f",
    border: "#32632b",
  },
  5: {
    bg: "#4c97c9",
    hi: "#76b9e5",
    shade: "#3578a8",
    border: "#225377",
  },
  6: {
    bg: "#7d5da8",
    hi: "#9f80ca",
    shade: "#61428c",
    border: "#442b67",
    pip: true,
  },
  8: {
    bg: "#cb4f85",
    hi: "#e576a6",
    shade: "#a83668",
    border: "#782047",
  },
  10: {
    bg: "#fffdf5",
    hi: "#ffffff",
    shade: "#f7e2dd",
    border: "#d94e3f",
  },
};

const rainbowBottomToTop: readonly CubePaint[] = [
  { bg: "#8c6bb1", hi: "#ad8ed1", shade: "#6f4f94", border: "#4e346d" },
  { bg: "#5c6cb3", hi: "#7e8fd4", shade: "#445395", border: "#2f3b6d" },
  { bg: "#4c97c9", hi: "#76b9e5", shade: "#3578a8", border: "#225377" },
  { bg: "#66ab56", hi: "#87ca76", shade: "#4a8c3f", border: "#32632b" },
  { bg: "#f0c237", hi: "#fae06b", shade: "#d49f1b", border: "#986d0c" },
  { bg: "#ef8b33", hi: "#faad5c", shade: "#cb6d1d", border: "#924a0f" },
  { bg: "#e05545", hi: "#f57c6c", shade: "#be3c2e", border: "#8d281e" },
];

const nineColumnShades: readonly CubePaint[] = [
  { bg: "#a8b2ae", hi: "#c3ccc8", shade: "#8c9792", border: "#5d6864" },
  { bg: "#8d9995", hi: "#a8b4b0", shade: "#73807c", border: "#4d5754" },
  { bg: "#73807c", hi: "#8f9b97", shade: "#5b6763", border: "#3d4643" },
];

export const numberBlocks: Readonly<Record<number, NumberBlockSpec>> = {
  0: {
    value: 0,
    name: "零泡泡",
    accent: "#5e8f7b",
    shapes: [],
    faceStyle: "zero",
  },
  1: {
    value: 1,
    name: "一块红",
    accent: "#e25546",
    shapes: [[1, 1]],
    faceStyle: "one",
  },
  2: {
    value: 2,
    name: "双双橙",
    accent: "#ee8c34",
    shapes: [
      [1, 2],
      [2, 1],
    ],
    faceStyle: "glasses",
  },
  3: {
    value: 3,
    name: "三角黄",
    accent: "#f0c237",
    shapes: [
      [1, 3],
      [3, 1],
    ],
    faceStyle: "crown",
  },
  4: {
    value: 4,
    name: "方块绿",
    accent: "#64ab56",
    shapes: [
      [2, 2],
      [1, 4],
      [4, 1],
    ],
    faceStyle: "square",
  },
  5: {
    value: 5,
    name: "五星蓝",
    accent: "#4c97c9",
    shapes: [
      [1, 5],
      [5, 1],
    ],
    faceStyle: "star",
  },
  6: {
    value: 6,
    name: "骰子紫",
    accent: "#7d5da8",
    shapes: [
      [2, 3],
      [3, 2],
    ],
    faceStyle: "dice",
  },
  7: {
    value: 7,
    name: "彩虹七",
    accent: "#e05545",
    shapes: [[1, 7]],
    faceStyle: "rainbow",
  },
  8: {
    value: 8,
    name: "八爪莓",
    accent: "#cb4f85",
    shapes: [
      [2, 4],
      [4, 2],
    ],
    faceStyle: "mask",
  },
  9: {
    value: 9,
    name: "九宫灰",
    accent: "#8d9995",
    shapes: [[3, 3]],
    faceStyle: "gray-square",
  },
  10: {
    value: 10,
    name: "火箭十",
    accent: "#d94e3f",
    shapes: [
      [2, 5],
      [5, 2],
    ],
    faceStyle: "rocket",
  },
};

export function blockSpec(n: number): NumberBlockSpec {
  const clamped = Math.max(0, Math.min(10, Math.round(n)));
  return numberBlocks[clamped];
}

export function cubePaintFor(
  value: number,
  cubeIndex: number,
  cols: number,
): CubePaint {
  if (value === 7) {
    return (
      rainbowBottomToTop[cubeIndex % rainbowBottomToTop.length] ??
      rainbowBottomToTop[0]
    );
  }
  if (value === 9) {
    const col = cubeIndex % Math.max(1, cols);
    return nineColumnShades[col % nineColumnShades.length];
  }
  return characterPaints[value] ?? characterPaints[1];
}

let sharedCtx: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!sharedCtx) sharedCtx = new Ctor();
  if (sharedCtx.state === "suspended") {
    void sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
}

function playTone(
  ctx: AudioContext,
  freqStart: number,
  freqEnd: number,
  durationSec: number,
  delaySec = 0,
  type: OscillatorType = "triangle",
  peak = 0.14,
) {
  const now = ctx.currentTime + delaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, now);
  if (freqEnd !== freqStart) {
    osc.frequency.exponentialRampToValueAtTime(
      Math.max(40, freqEnd),
      now + durationSec,
    );
  }
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationSec + 0.02);
}

const scaleNotes = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5, 1174.66, 1318.51];

export type BlockSfxKind =
  | "grab"
  | "snap"
  | "split"
  | "count"
  | "morph"
  | "win"
  | "oops";

export function playBlockSfx(kind: BlockSfxKind, muted: boolean, step = 0) {
  if (muted) return;
  try {
    const ctx = audioContext();
    if (!ctx) return;
    switch (kind) {
      case "grab":
        playTone(ctx, 310, 360, 0.055, 0, "triangle", 0.1);
        break;
      case "snap":
        playTone(ctx, 330, 523.25, 0.12, 0, "triangle", 0.15);
        playTone(ctx, 659.25, 659.25, 0.09, 0.06, "sine", 0.09);
        break;
      case "split":
        playTone(ctx, 520, 310, 0.11, 0, "triangle", 0.14);
        break;
      case "count": {
        const note = scaleNotes[Math.abs(step) % scaleNotes.length];
        playTone(ctx, note, note, 0.13, 0, "sine", 0.16);
        break;
      }
      case "morph":
        playTone(ctx, 390, 620, 0.11, 0, "sine", 0.13);
        break;
      case "oops":
        playTone(ctx, 240, 210, 0.12, 0, "triangle", 0.12);
        playTone(ctx, 210, 180, 0.12, 0.09, "triangle", 0.1);
        break;
      case "win":
        playTone(ctx, 523.25, 523.25, 0.18, 0, "sine", 0.14);
        playTone(ctx, 659.25, 659.25, 0.18, 0.07, "sine", 0.14);
        playTone(ctx, 783.99, 783.99, 0.18, 0.14, "sine", 0.14);
        playTone(ctx, 1046.5, 1046.5, 0.28, 0.21, "sine", 0.16);
        break;
    }
  } catch {
    // Ignore audio context restriction errors in non-interactive or test environments.
  }
}
