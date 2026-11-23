import {
  arithmeticLessons,
  numberLessons,
  type Lesson,
  type Subject,
} from "@lingyi-classroom/shared";
import hanzi from "./data/hanzi.json";
import english from "./data/english.json";
import pinyin from "./data/pinyin.json";
import poems from "./data/poems.json";

export const curriculum: Record<Subject, Lesson[]> = {
  hanzi: hanzi.map((c) => ({
    ...c,
    reading: c.pinyin,
    caption: c.example,
    voiceLabel: "听字和词",
  })),
  numbers: numberLessons(),
  math: arithmeticLessons(),
  pinyin: pinyin.map((c) => ({
    ...c,
    caption: c.example,
    reading: c.examplePinyin,
    voiceLabel: c.audioKind === "认读音" ? "听声母" : c.audioKind === "示范音" ? "听示范音" : "听例字",
  })),
  poems: poems.map((p) => ({
    id: p.id,
    label: p.title,
    group: p.group,
    caption: p.author,
    audio: p.audio,
    poem: p,
  })),
  english: english.map((c) => ({
    ...c,
    caption: c.meaning,
    voiceLabel: "听英语",
  })),
};
