import type { Lesson } from "@lingyi-classroom/shared";

export function pinyinCueLabel(item: Lesson) {
  const word = [item.caption, item.reading].filter(Boolean).join(" · ");
  return item.initialReading && item.initialReading !== item.reading
    ? `${word}（呼读 ${item.initialReading}）`
    : word;
}
