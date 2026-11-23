export const subjectIds = [
  "hanzi",
  "numbers",
  "math",
  "pinyin",
  "poems",
  "english",
] as const;
export type Subject = (typeof subjectIds)[number];

export interface Poem {
  id: string;
  title: string;
  author: string;
  group: string;
  grade: number;
  volume: string;
  kind: string;
  url: string;
  lines: string[];
  textSource: string;
  audio?: string;
  lineStarts?: number[];
  note?: string;
}
export interface Lesson {
  id: string;
  group: string;
  label: string;
  caption: string;
  reading?: string;
  icon?: string;
  audio?: string;
  voiceLabel?: string;
  initialReading?: string;
  exampleAudio?: string;
  amount?: number;
  equation?: { left: number; right: number; sign: "+" | "−"; answer: number };
  poem?: Poem;
}
export const chineseNumbers = [
  "零",
  "一",
  "二",
  "三",
  "四",
  "五",
  "六",
  "七",
  "八",
  "九",
  "十",
  "十一",
  "十二",
  "十三",
  "十四",
  "十五",
  "十六",
  "十七",
  "十八",
  "十九",
  "二十",
];

export function numberLessons(): Lesson[] {
  return chineseNumbers.map((caption, amount) => ({
    id: `n-${amount}`,
    group: amount <= 10 ? "0–10" : "11–20",
    label: String(amount),
    caption,
    amount,
    audio: `media/math/n-${amount}.mp3`,
  }));
}
export function arithmeticLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (const sign of ["+", "−"] as const) {
    for (let left = 0; left <= 10; left++) {
      for (let right = 0; right <= 10; right++) {
        const answer = sign === "+" ? left + right : left - right;
        if (answer < 0 || answer > 10) continue;
        const id = `${sign === "+" ? "add" : "sub"}-${left}-${right}`;
        lessons.push({
          id,
          group: sign === "+" ? "加法" : "减法",
          label: `${left} ${sign} ${right}`,
          caption: "等于几？",
          equation: { left, right, sign, answer },
          audio: `media/math/${id}.mp3`,
        });
      }
    }
  }
  return lessons;
}

function shuffled<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function answerFor(item: Lesson) {
  return item.equation ? String(item.equation.answer) : item.label;
}

export function lessonChoices(item: Lesson, all: readonly Lesson[]): Lesson[] {
  const candidates = all.filter((other) =>
    other.id !== item.id && other.label !== item.label &&
    other.caption !== item.caption && (!item.reading || other.reading !== item.reading));
  const picked = [item];
  const local = candidates.filter((other) => other.group === item.group);
  const otherGroups = candidates.filter((other) => other.group !== item.group);
  for (const candidate of [...shuffled(local), ...shuffled(otherGroups)]) {
    if (picked.every((other) => other.label !== candidate.label && other.caption !== candidate.caption)) {
      picked.push(candidate);
      if (picked.length === 3) break;
    }
  }
  return shuffled(picked);
}

export function practiceChoices(
  subject: Subject,
  item: Lesson,
  all: Lesson[],
): string[] {
  const correct = answerFor(item);
  let alternatives: string[];
  if (subject === "math" || subject === "numbers") {
    const value = Number(correct);
    const max = subject === "math" ? 10 : 20;
    alternatives = Array.from({ length: max + 1 }, (_, i) => i)
      .filter((i) => i !== value && Math.abs(i - value) <= 4)
      .map(String);
  } else {
    return lessonChoices(item, all).map((choice) => choice.label);
  }
  return shuffled([
    correct,
    ...shuffled([...new Set(alternatives)]).slice(0, 2),
  ]);
}
