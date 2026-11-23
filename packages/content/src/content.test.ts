import { lessonChoices } from "@lingyi-classroom/shared";
// @vitest-environment node
import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  answerFor,
  practiceChoices,
  subjectIds,
} from "@lingyi-classroom/shared";
import { curriculum } from "./index";
import {
  numberPictographFor,
  numberPictographs,
} from "./numberPictographs";
import {
  poemBackdropUrls,
  poemGroups,
  poemScenes,
  resolvePoemArchetype,
  resolvePoemCast,
} from "./poemScenes";
import {
  pinyinBackdropUrls,
  pinyinGroups,
  pinyinScenes,
} from "./pinyinScenes";
import {
  englishBackdropUrls,
  englishGroups,
  englishScenes,
} from "./englishScenes";
import { wordScenes } from "./wordScenes";

const publicRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public",
);

describe("portable first-batch curriculum", () => {
  it("gives every entry a stable ID and references actual bundled media", () => {
    const rows = subjectIds.flatMap((subject) => curriculum[subject]);
    expect(new Set(rows.map((x) => x.id)).size).toBe(rows.length);
    for (const row of rows) {
      expect(row.label.trim()).not.toBe("");
      if (!row.audio) {
        expect(row.poem?.lines.length).toBe(0);
      } else {
        expect(row.audio).toMatch(/^media\/[\w/-]+\.mp3$/);
        expect(existsSync(resolve(publicRoot, row.audio)), row.id).toBe(true);
      }
    }
  });
  it("covers each ordered sum and nonnegative difference through ten including zero", () => {
    const all = curriculum.math;
    expect(all).toHaveLength(132);
    for (let a = 0; a <= 10; a++)
      for (let b = 0; b <= 10; b++) {
        const add = all.find((i) => i.id === `add-${a}-${b}`);
        const sub = all.find((i) => i.id === `sub-${a}-${b}`);
        expect(add?.equation?.answer).toBe(a + b <= 10 ? a + b : undefined);
        expect(sub?.equation?.answer).toBe(a >= b ? a - b : undefined);
      }
    expect(curriculum.numbers.map((i) => i.amount)).toEqual(
      Array.from({ length: 21 }, (_, i) => i),
    );
  });
  it("produces three distinct choices with exactly one matching answer", () => {
    for (const s of subjectIds.filter((s) => s !== "poems"))
      for (const row of curriculum[s]) {
        const choices = practiceChoices(s, row, curriculum[s]);
        expect(new Set(choices).size, row.id).toBe(3);
        expect(
          choices.filter((v) => v === answerFor(row)),
          row.id,
        ).toHaveLength(1);
      }
  });
  it("offers the original lesson and two distinguishable alternatives in each picture quiz", () => {
    for (const subject of ["pinyin", "hanzi", "english"] as const) {
      for (const item of curriculum[subject]) {
        const choices = lessonChoices(item, curriculum[subject]);
        expect(choices.filter((choice) => choice.id === item.id)).toEqual([item]);
        expect(new Set(choices.map((choice) => choice.label)).size, item.id).toBe(3);
        expect(new Set(choices.map((choice) => choice.caption)).size, item.id).toBe(3);
      }
    }
  });
  it("retains catalogue positions, source-only exceptions, and aligned line start times", () => {
    const poems = curriculum.poems.map((row) => row.poem!);
    expect(poems).toHaveLength(131);
    expect(new Set(poems.map((p) => p.group)).size).toBe(25);
    expect(new Set(poems.map((p) => p.url)).size).toBe(125);
    expect(poems.filter((p) => p.lines.length > 0)).toHaveLength(127);
    for (const p of poems) {
      if (!p.lines.length) {
        expect(p.note).toBeTruthy();
        continue;
      }
      const times = p.lineStarts!;
      expect(times.length, p.id).toBe(p.lines.length);
      expect(
        times.every(
          (n, i) =>
            Number.isFinite(n) && n >= 0 && (i === 0 || n > times[i - 1]),
        ),
        p.id,
      ).toBe(true);
    }
  });
  it("keeps all 23 approved initial cues, word tones, recordings and scenes in agreement", () => {
    const initials = curriculum.pinyin.filter((item) => item.group === "声母");
    const words = Array.from("播泼摸佛得特讷勒哥科喝鸡七西知吃诗日资雌思衣乌");
    const readings = "bo po mo fo de te ne le ge ke he ji qi xi zhi chi shi ri zi ci si yi wu".split(" ");
    const tones = [1,1,1,2,2,4,4,4,1,1,1,1,1,1,1,1,1,4,1,2,1,1,1];
    expect(initials.map((item) => item.caption)).toEqual(words);
    expect(initials.map((item) => item.reading)).toEqual("bō pō mō fó dé tè nè lè gē kē hē jī qī xī zhī chī shī rì zī cí sī yī wū".split(" "));
    initials.forEach((item, index) => {
      const scene = pinyinScenes[item.id];
      expect(item.audio).toBe(`media/pinyin/${readings[index]}1.mp3`);
      expect(item.exampleAudio).toBe(`media/pinyin/${readings[index]}${tones[index]}.mp3`);
      expect(item.initialReading).toBe(scene.toneForms[0]);
      expect(item.reading).toBe(scene.toneForms[tones[index] - 1]);
      expect(scene.blend?.word).toBe(item.caption);
      expect(scene.blend?.syllable).toBe(item.reading);
      expect(item.voiceLabel).toBe("听声母");
      expect(existsSync(resolve(publicRoot, item.exampleAudio!))).toBe(true);
    });
  });

  it("ships the public pinyin recordings' attribution", () => {
    const rows = curriculum.pinyin;
    expect(
      ["声母", "韵母", "整体认读音节"].map(
        (k) => rows.filter((x) => x.group === k).length,
      ),
    ).toEqual([23, 24, 16]);
    expect(
      readFileSync(resolve(publicRoot, "media/pinyin/ATTRIBUTION.txt"), "utf8"),
    ).toContain("CC BY-SA");
  });
});

describe("locally bundled story art", () => {
  it("bundles a narrated, individually staged meaning scene for every everyday character", () => {
    const words = curriculum.hanzi;
    expect(words).toHaveLength(300);
    expect(Object.keys(wordScenes).sort()).toEqual(
      words.map((word) => word.label).sort(),
    );
    const stories = words.map((word) => {
      expect(word.icon, word.label).toBeUndefined();
      const scene = wordScenes[word.label];
      expect(scene.sentence.length, word.label).toBeGreaterThan(3);
      expect(
        scene.layers.some((layer) => layer[4]),
        word.label,
      ).toBe(true);
      expect(
        existsSync(resolve(publicRoot, "media/wordbook/" + word.id + ".mp3")),
        word.label,
      ).toBe(true);
      for (const [picture] of scene.layers) {
        expect(picture, word.label).toMatch(/\.webp$/);
        expect(picture, word.label).not.toMatch(/^art\/english\//);
        expect(existsSync(resolve(publicRoot, picture)), picture).toBe(true);
      }
      return JSON.stringify([scene.setting, scene.layers]);
    });
    expect(new Set(stories).size).toBe(words.length);
  });
  it("ships a complete stroke sequence for each character", async () => {
    const { strokeGlyphs } = await import("./strokes");
    for (const item of curriculum.hanzi) {
      const glyph = strokeGlyphs[item.label];
      expect(glyph?.strokes.length, item.label).toBeGreaterThan(0);
      expect(glyph.medians.length).toBe(glyph.strokes.length);
    }
    for (const file of [
      "art/play/STROKES-LICENSE.txt",
      "art/play/ARPHICPL.TXT",
      "art/play/ENGINE-LICENSES.txt",
    ]) {
      expect(existsSync(resolve(publicRoot, file)), file).toBe(true);
    }
  });
  it("gives every playable poem a thematic scene with existing backdrops and watercolor layers", () => {
    const playablePoems = curriculum.poems.filter(
      (item) => item.poem && item.poem.lines.length > 0 && item.audio,
    );
    expect(Object.keys(poemScenes).sort()).toEqual(
      playablePoems.map((item) => item.id).sort(),
    );
    expect(poemGroups).toHaveLength(9);
    for (const group of poemGroups) {
      expect(existsSync(resolve(publicRoot, group.cover)), group.cover).toBe(
        true,
      );
      expect(
        existsSync(resolve(publicRoot, group.badgeArt)),
        group.badgeArt,
      ).toBe(true);
    }
    for (const item of playablePoems) {
      const scene = poemScenes[item.id];
      expect(scene.story.length, item.id).toBeGreaterThan(5);
      expect(resolvePoemArchetype(item.id, scene)).toMatch(
        /^(water-voyage|mountain-mist|night-moon|spring-blossom|winter-plum|frontier-epic|pastoral-child|ancient-fable)$/,
      );
      expect(resolvePoemCast(item.id, scene).length, item.id).toBeGreaterThan(0);
      const backdrop = poemBackdropUrls[scene.backdrop];
      expect(existsSync(resolve(publicRoot, backdrop)), backdrop).toBe(true);
      for (const [picture] of scene.layers) {
        expect(picture, item.id).toMatch(/\.webp$/);
        expect(picture, item.id).not.toMatch(/^art\/english\//);
        expect(existsSync(resolve(publicRoot, picture)), picture).toBe(true);
      }
    }
  });
  it("bundles pictographic backgrounds for every number card from 0 to 20", () => {
    expect(Object.keys(numberPictographs)).toHaveLength(21);
    for (const item of curriculum.numbers) {
      const art = numberPictographFor(item.amount!);
      expect(art, item.id).toBeDefined();
      expect(art!.image).toBe(`art/numbers/num-${item.amount}.webp`);
      expect(existsSync(resolve(publicRoot, art!.image)), art!.image).toBe(
        true,
      );
      if (item.amount! <= 10) {
        expect(art!.mnemonic?.trim().length, item.id).toBeGreaterThan(0);
      }
    }
  });
  it("gives every pinyin card a themed storybook scene, 4-tone forms, and existing watercolor art", () => {
    const toneGroups = ["āēīōūǖ", "áéíóúǘ", "ǎěǐǒǔǚ", "àèìòùǜ"];
    expect(Object.keys(pinyinScenes).sort()).toEqual(
      curriculum.pinyin.map((item) => item.id).sort(),
    );
    expect(pinyinGroups).toHaveLength(3);
    for (const group of pinyinGroups) {
      expect(existsSync(resolve(publicRoot, group.cover)), group.cover).toBe(
        true,
      );
      expect(
        existsSync(resolve(publicRoot, group.badgeArt)),
        group.badgeArt,
      ).toBe(true);
    }
    for (const item of curriculum.pinyin) {
      const scene = pinyinScenes[item.id];
      expect(scene.rhyme.trim().length, item.id).toBeGreaterThan(3);
      expect(scene.mouthTip.trim().length, item.id).toBeGreaterThan(3);
      expect(scene.story.trim().length, item.id).toBeGreaterThan(5);
      expect(new Set(scene.toneForms).size, item.id).toBe(4);
      const readingTone =
        toneGroups.findIndex((chars) =>
          Array.from(item.reading ?? "").some((c) => chars.includes(c)),
        ) + 1;
      expect(scene.exampleTone, item.id).toBe(readingTone);
      expect(
        Array.from(scene.toneForms[scene.exampleTone - 1]).some((c) =>
          toneGroups[scene.exampleTone - 1].includes(c),
        ),
        item.id,
      ).toBe(true);
      if (item.group === "声母") {
        const whole = ["zh", "ch", "sh", "r", "z", "c", "s", "y", "w"].includes(item.label);
        expect(Boolean(scene.blend?.whole), item.id).toBe(whole);
        if (scene.blend && !scene.blend.whole) {
          expect(scene.blend.initial).toBe(item.label);
          expect(scene.blend.initial + scene.blend.final).toBe(item.reading);
        }
        expect(scene.blend?.word, item.id).toBe(item.caption);
      }
      const backdrop = pinyinBackdropUrls[scene.backdrop];
      expect(existsSync(resolve(publicRoot, backdrop)), backdrop).toBe(true);
      expect(scene.layers.length, item.id).toBeGreaterThan(0);
      for (const [picture] of scene.layers) {
        expect(picture, item.id).toMatch(/\.webp$/);
        expect(picture, item.id).not.toMatch(/^art\/english\//);
        expect(existsSync(resolve(publicRoot, picture)), picture).toBe(true);
      }
    }
  });
  it("uses the cake illustration for the English cake lesson and its scene", () => {
    const cake = englishScenes["en-cake"];
    expect(cake.heroArt).toBe("art/wordbook/painted/cake.webp");
    expect(cake.layers.some(([art]) => art === cake.heroArt)).toBe(true);
    expect(existsSync(resolve(publicRoot, cake.heroArt))).toBe(true);
  });
  it("gives every english card a painted watercolor scene, phrase, and color swatches", () => {
    expect(Object.keys(englishScenes).sort()).toEqual(
      curriculum.english.map((item) => item.id).sort(),
    );
    expect(englishGroups).toHaveLength(6);
    for (const group of englishGroups) {
      expect(existsSync(resolve(publicRoot, group.cover)), group.cover).toBe(
        true,
      );
      expect(
        existsSync(resolve(publicRoot, group.badgeArt)),
        group.badgeArt,
      ).toBe(true);
    }
    for (const item of curriculum.english) {
      const scene = englishScenes[item.id];
      expect(scene.phonics.trim().length, item.id).toBeGreaterThan(1);
      expect(scene.phrase.trim().length, item.id).toBeGreaterThan(3);
      expect(scene.phraseZh.trim().length, item.id).toBeGreaterThan(2);
      expect(scene.story.trim().length, item.id).toBeGreaterThan(5);
      expect(scene.heroArt, item.id).toMatch(/\.webp$/);
      expect(scene.heroArt, item.id).not.toMatch(/^art\/english\//);
      expect(existsSync(resolve(publicRoot, scene.heroArt)), scene.heroArt).toBe(
        true,
      );
      if (item.group === "颜色") {
        expect(scene.swatchColor, item.id).toMatch(/^#[0-9a-f]{6}$/i);
      }
      const backdrop = englishBackdropUrls[scene.backdrop];
      expect(existsSync(resolve(publicRoot, backdrop)), backdrop).toBe(true);
      expect(scene.layers.length, item.id).toBeGreaterThan(0);
      for (const [picture] of scene.layers) {
        expect(picture, item.id).toMatch(/\.webp$/);
        expect(picture, item.id).not.toMatch(/^art\/english\//);
        expect(existsSync(resolve(publicRoot, picture)), picture).toBe(true);
      }
    }
  });
});
