import type { Lesson, Subject } from "@lingyi-classroom/shared";

export const explorations = {
  wind: {
    title: "火与风",
    invitation: "吹吹火苗",
    subject: "hanzi",
    lessonId: "hanzi-706b",
    image: "art/wordbook/fire.webp",
  },
  boat: {
    title: "曹冲称象",
    invitation: "给大象称重",
    subject: "poems",
    lessonId: "p6a-k09",
    image: "art/wordbook/painted/elephant.webp",
  },
  pencil: {
    title: "你给我",
    invitation: "递一支笔",
    subject: "hanzi",
    lessonId: "hanzi-6211",
    image: "art/wordbook/painted/pencil.webp",
  },
} as const;

export type Exploration = keyof typeof explorations;

export function explorationFor(
  subject: Subject,
  item: Lesson,
): Exploration | undefined {
  if (subject === "poems" && item.id === explorations.boat.lessonId)
    return "boat";
  if (subject !== "hanzi") return;
  if (["火", "风", "水", "土", "竹"].includes(item.label)) return "wind";
  if (["我", "你", "给", "接"].includes(item.label)) return "pencil";
  if (["轻", "重", "船", "石", "象"].includes(item.label)) return "boat";
}
