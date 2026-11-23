import { curriculum } from "@lingyi-classroom/content";
import { poemGroupOrder, poemScenes } from "@lingyi-classroom/content/poem-scenes";
import {
  subjectIds,
  type Lesson,
  type Subject,
} from "@lingyi-classroom/shared";

// Familiar things first. The keys are the same groups that parents see in the curriculum.
export const hanziCovers: Record<string, { title: string; picture: string }> = {
  动物: { title: "小动物", picture: "painted/rabbit" },
  家人: { title: "我的家人", picture: "painted/grandmother" },
  身体: { title: "我的身体", picture: "painted/ear" },
  食物: { title: "好吃的", picture: "painted/rice-bowl" },
  天气四季: { title: "天气和四季", picture: "painted/rain-cloud" },
  山水草木: { title: "大自然", picture: "painted/sunflower" },
  家里: { title: "家里的东西", picture: "painted/chair" },
  幼儿园: { title: "幼儿园", picture: "painted/school" },
  出门: { title: "出门啦", picture: "painted/car" },
  动作: { title: "动一动", picture: "painted/runner" },
  位置大小: { title: "比一比", picture: "painted/elephant" },
  数字: { title: "数一数", picture: "painted/block-tower" },
  一起生活: { title: "好朋友", picture: "painted/girl" },
};

export const playable = Object.fromEntries(
  subjectIds.map((subject) => [
    subject,
    curriculum[subject].filter(
      (item) => !item.poem || (item.poem.lines.length > 0 && !!item.audio),
    ),
  ]),
) as Record<Subject, Lesson[]>;

const poemIdsByUrl = new Map<string, string[]>();
const poemUrlById = new Map<string, string>();
for (const item of curriculum.poems) {
  const url = item.poem?.url;
  if (!url) continue;
  poemUrlById.set(item.id, url);
  const bucket = poemIdsByUrl.get(url);
  if (bucket) bucket.push(item.id);
  else poemIdsByUrl.set(url, [item.id]);
}

/**
 * Expands raw completed lesson IDs so that any completed poem occurrence
 * marks all textbook grade occurrences of the same poem Work (`poem.url`) as learned.
 */
export function expandLearnedIds(ids: Iterable<string>): Set<string> {
  const out = new Set<string>();
  for (const id of ids) {
    out.add(id);
    const url = poemUrlById.get(id);
    if (url) {
      for (const siblingId of poemIdsByUrl.get(url) ?? []) {
        out.add(siblingId);
      }
    }
  }
  return out;
}

export function countSubjectStamps(
  subject: Subject,
  done: ReadonlySet<string>,
): { learned: number; total: number } {
  const expanded = expandLearnedIds(done);
  const items =
    subject === "poems"
      ? lessonGroups("poems").flatMap((g) => g.items)
      : playable[subject];
  let learned = 0;
  for (const item of items) {
    if (expanded.has(item.id)) learned++;
  }
  return { learned, total: items.length };
}

export function countTotalStamps(done: ReadonlySet<string>): number {
  const expanded = expandLearnedIds(done);
  let total = 0;
  for (const subject of subjectIds) {
    total += countSubjectStamps(subject, expanded).learned;
  }
  return total;
}

export interface LessonGroup {
  name: string;
  items: Lesson[];
}
export function lessonGroups(subject: Subject): LessonGroup[] {
  const byName = new Map<string, Lesson[]>();
  const seenPoemUrls = new Set<string>();
  for (const item of playable[subject]) {
    if (subject === "poems" && item.poem) {
      if (seenPoemUrls.has(item.poem.url)) continue;
      seenPoemUrls.add(item.poem.url);
    }
    const groupName =
      subject === "poems" ? (poemScenes[item.id]?.group ?? item.group) : item.group;
    if (!byName.has(groupName)) byName.set(groupName, []);
    byName.get(groupName)!.push(item);
  }
  const order =
    subject === "hanzi"
      ? new Set([...Object.keys(hanziCovers), ...byName.keys()])
      : subject === "poems"
        ? new Set([...poemGroupOrder, ...byName.keys()])
        : byName.keys();
  return Array.from(order)
    .filter((name) => byName.has(name))
    .map((name) => ({ name, items: byName.get(name)! }));
}

export function groupTitle(subject: Subject, name: string) {
  return subject === "hanzi" || subject === "english"
    ? (hanziCovers[name]?.title ?? name)
    : name;
}
export function groupVoice(name: string) {
  const code = Array.from(name, (c) => c.codePointAt(0)!.toString(16)).join(
    "-",
  );
  return "media/catalog/group-" + code + ".mp3";
}
export const homeHref = "#/";
export function subjectHref(subject: Subject) {
  return "#/learn/" + subject;
}
export function cardsHref(subject: Subject, group: string) {
  return subjectHref(subject) + "/group/" + encodeURIComponent(group);
}
export function lessonHref(subject: Subject, item: Lesson) {
  return subjectHref(subject) + "/" + item.id;
}
export function libraryHref(subject: Subject, id?: string) {
  return "#/library/" + subject + (id ? "/" + id : "");
}

export type ChildRoute =
  | { screen: "home" }
  | { screen: "groups"; subject: Subject; initialChoice?: string }
  | {
      screen: "cards";
      subject: Subject;
      group: LessonGroup;
      initialChoice?: string;
    }
  | {
      screen: "round";
      subject: Subject;
      item: Lesson;
      group: LessonGroup;
      explore?: boolean;
    };
type LearningRoute =
  ChildRoute | { screen: "library"; subject: Subject; id?: string };

// Old shared links pointed to sheets of six. Open the same first card in the continuous shelf.
function oldSheetStart<T>(items: T[], raw?: string): T | undefined {
  const sheet = Number(raw);
  if (!Number.isSafeInteger(sheet) || sheet <= 1) return undefined;
  const lastSheet = Math.ceil(items.length / 6);
  return items[(Math.min(sheet, lastSheet) - 1) * 6];
}

export function readLearningRoute(hash: string): LearningRoute {
  const [, area, topic, id, name, page] = hash.slice(1).split("/");
  const subject = subjectIds.find((s) => s === topic);
  if (area === "library")
    return { screen: "library", subject: subject ?? "hanzi", id };
  if (area !== "learn" || !subject) return { screen: "home" };
  const groups = lessonGroups(subject);
  if (id === "group") {
    let groupName: string | undefined;
    try {
      groupName = decodeURIComponent(name ?? "");
    } catch {
      // A malformed shared link still opens the subject's group picker.
    }
    const group = groups.find((g) => g.name === groupName);
    if (group) {
      const start = oldSheetStart(group.items, page);
      return {
        screen: "cards",
        subject,
        group,
        initialChoice: start && lessonHref(subject, start),
      };
    }
  } else if (id && id !== "groups") {
    const item = playable[subject].find((v) => v.id === id);
    if (item) {
      const groupKey =
        subject === "poems" ? (poemScenes[item.id]?.group ?? item.group) : item.group;
      return {
        screen: "round",
        subject,
        item,
        explore: name === "explore",
        group: groups.find((g) => g.name === groupKey) ?? groups[0],
      };
    }
  }
  const start = id === "groups" ? oldSheetStart(groups, name) : undefined;
  return {
    screen: "groups",
    subject,
    initialChoice: start && cardsHref(subject, start.name),
  };
}
