import type { Lesson, Subject } from "@lingyi-classroom/shared";

export type ActorKind =
  | "flame"
  | "bear"
  | "fish"
  | "grill"
  | "plate"
  | "berry"
  | "basket"
  | "bird"
  | "nest"
  | "egg"
  | "boat"
  | "lily"
  | "camera"
  | "sign"
  | "photo"
  | "nut"
  | "dock"
  | "seed"
  | "tree"
  | "mountain"
  | "sun"
  | "moon"
  | "goose";
export interface PlayActor {
  id: string;
  kind: ActorKind;
  x: number;
  y: number;
  size: number;
  motion?:
    "idle" | "swim" | "happy" | "cook" | "fly" | "shake" | "float" | "glow";
  tint?: string;
  picture?: string;
  label?: string;
  action?: string;
  hint?: boolean;
  faded?: boolean;
  wind?: number; // Signed from -1 (left) to 1 (right), in screen coordinates.
}
export type Focus = "wide" | "work" | "friend";
export type Backdrop = "clearing" | "orchard" | "canopy" | "pond";
export type Clip = string | { path: string; start?: number; end?: number };
export interface GameData {
  subject: Subject;
  item: Lesson;
  alternatives: readonly Lesson[];
  onWin: () => void;
}
export const playVoice = (name: string) => `media/play/${name}.mp3`;
export const countVoice = (n: number) => playVoice("count-" + n);
export function actor(
  id: string,
  kind: ActorKind,
  x: number,
  y: number,
  size: number,
  options: Partial<Omit<PlayActor, "id" | "kind" | "x" | "y" | "size">> = {},
): PlayActor {
  return { id, kind, x, y, size, ...options };
}
export const destinations: Record<
  Subject,
  { name: string; subjectName: string; image: string }
> = {
  hanzi: {
    name: "森林识字绘本",
    subjectName: "汉字",
    image: "art/wordbook/painted/book.webp",
  },
  numbers: {
    name: "草莓果园",
    subjectName: "数字",
    image: "art/berry.webp",
  },
  math: {
    name: "数字积木",
    subjectName: "加减",
    image: "art/wordbook/painted/block-tower.webp",
  },
  pinyin: {
    name: "拼音百灵谷",
    subjectName: "拼音",
    image: "art/play/canopy.webp",
  },
  poems: {
    name: "古诗画卷",
    subjectName: "古诗",
    image: "art/poems/bg-lushan-waterfall.webp",
  },
  english: {
    name: "英语绘本馆",
    subjectName: "英语",
    image: "art/poems/bg-spring-garden.webp",
  },
};

export interface RoundProps extends GameData {
  stampSaved?: boolean;
  stampFeedback?: import("react").ReactNode;
  muted: boolean;
  next: () => void;
  nextLabel?: string;
  replay: () => void;
  runtime: ReturnType<typeof import("./usePlayRuntime").usePlayRuntime>;
}
