// @vitest-environment node
import { existsSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { curriculum } from "@lingyi-classroom/content";
import { subjectIds } from "@lingyi-classroom/shared";
import {
  cardsHref,
  countSubjectStamps,
  countTotalStamps,
  expandLearnedIds,
  groupVoice,
  hanziCovers,
  lessonGroups,
  lessonHref,
  readLearningRoute,
} from "./childCatalog";

describe("children's picture catalog", () => {
  it("opens all the cards in every group from a single link", () => {
    const groups = lessonGroups("hanzi");
    expect(groups).toHaveLength(13);
    const reached: string[] = [];
    for (const group of groups) {
      const picker = readLearningRoute(cardsHref("hanzi", group.name));
      if (picker.screen !== "cards") throw new Error("Missing group");
      expect(picker.group.items).toEqual(
        curriculum.hanzi.filter((item) => item.group === group.name),
      );
      for (const item of picker.group.items) {
        reached.push(item.id);
        expect(readLearningRoute(lessonHref("hanzi", item))).toMatchObject({
          screen: "round",
          item: { id: item.id },
        });
      }
    }
    expect(reached.sort()).toEqual(
      curriculum.hanzi.map((item) => item.id).sort(),
    );
  });
  it("maps old numbered links to a card on the continuous shelf", () => {
    const animals = lessonGroups("hanzi").find((g) => g.name === "动物")!;
    const group = (suffix: string) =>
      readLearningRoute(cardsHref("hanzi", animals.name) + suffix);
    expect(group("/4")).toMatchObject({
      screen: "cards",
      initialChoice: lessonHref("hanzi", animals.items[18]),
    });
    expect(group("/999")).toMatchObject({
      screen: "cards",
      initialChoice: lessonHref("hanzi", animals.items[24]),
    });
    expect(group("/-3")).toMatchObject({
      screen: "cards",
      initialChoice: undefined,
    });
    expect(readLearningRoute("#/learn/hanzi/groups/2")).toMatchObject({
      screen: "groups",
      initialChoice: cardsHref("hanzi", lessonGroups("hanzi")[6].name),
    });
    expect(readLearningRoute("#/learn/hanzi/group/%E0%A4").screen).toBe(
      "groups",
    );
    expect(readLearningRoute("#/library/hanzi/hanzi-706b")).toMatchObject({
      screen: "library",
      id: "hanzi-706b",
    });
    expect(readLearningRoute("")).toEqual({ screen: "home" });
  });
  it("has offline group narration and a short title recording for each playable poem", () => {
    const hasAudio = (path: string) =>
      existsSync(new URL("../../../content/public/" + path, import.meta.url));
    for (const subject of subjectIds) {
      expect(hasAudio("media/catalog/" + subject + ".mp3")).toBe(true);
      for (const group of lessonGroups(subject)) {
        expect(hasAudio(groupVoice(group.name)), group.name).toBe(true);
        if (subject === "poems")
          for (const item of group.items)
            expect(
              hasAudio("media/catalog/title-" + item.id + ".mp3"),
              item.id,
            ).toBe(true);
      }
    }
  });
  it("ships exactly the referenced group narration and all hanzi group covers", () => {
    const root = new URL("../../../content/public/", import.meta.url);
    const voices = subjectIds.flatMap((subject) => lessonGroups(subject).map((group) => groupVoice(group.name)));
    const files = readdirSync(new URL("media/catalog/", root)).filter((file) => file.startsWith("group-") && file.endsWith(".mp3"));
    expect(files.map((file) => "media/catalog/" + file).sort()).toEqual([...new Set(voices)].sort());
    for (const { name } of lessonGroups("hanzi")) {
      expect(existsSync(new URL("art/wordbook/" + hanziCovers[name].picture + ".webp", root)), name).toBe(true);
    }
  });
  it("groups poems into child-friendly themes and resolves duplicate textbook poem IDs cleanly", () => {
    const poemGroups = lessonGroups("poems");
    expect(poemGroups).toHaveLength(9);
    for (const group of poemGroups) {
      expect(group.name).not.toMatch(/年级|日积月累|古诗词诵读/);
    }
    expect(readLearningRoute("#/learn/poems/p1a-j01")).toMatchObject({
      screen: "round",
      subject: "poems",
      item: { id: "p1a-j01", label: "咏鹅" },
      group: { name: "小动物" },
    });
    expect(readLearningRoute("#/learn/poems/p2a-k02")).toMatchObject({
      screen: "round",
      subject: "poems",
      item: { id: "p2a-k02", label: "望庐山瀑布" },
      group: { name: "看山水" },
    });
    expect(readLearningRoute("#/learn/poems/p5b-j01")).toMatchObject({
      screen: "round",
      subject: "poems",
      item: { id: "p5b-j01", label: "游子吟" },
      group: { name: "小船和朋友" },
    });
  });
  it("shares learning stamps across duplicate textbook poem occurrences and deduplicates totals", () => {
    const byUrl = new Map<string, string[]>();
    for (const p of curriculum.poems) {
      if (!p.poem?.url) continue;
      byUrl.set(p.poem.url, [...(byUrl.get(p.poem.url) ?? []), p.id]);
    }
    const duplicateIds = [...byUrl.values()].find((ids) => ids.length > 1)!;
    expect(duplicateIds.length).toBeGreaterThan(1);

    const expanded = expandLearnedIds([duplicateIds[0], "initial-b"]);
    for (const siblingId of duplicateIds) {
      expect(expanded.has(siblingId)).toBe(true);
    }
    expect(countSubjectStamps("poems", expanded)).toEqual({
      learned: 1,
      total: 121,
    });
    expect(countSubjectStamps("pinyin", expanded)).toEqual({
      learned: 1,
      total: 63,
    });
    expect(countTotalStamps(expanded)).toBe(2);
  });
});
