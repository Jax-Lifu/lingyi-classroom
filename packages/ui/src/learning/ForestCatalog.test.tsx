import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ForestCatalog } from "./ForestCatalog";
import { cardsHref, lessonGroups, subjectHref } from "./childCatalog";

const store = { get: async () => undefined, set: async () => {} };

afterEach(cleanup);
describe("continuous child catalog", () => {
  it("offers every topic without opening another page", () => {
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "groups", subject: "hanzi" }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const topics = within(
      screen.getByRole("navigation", { name: "选择汉字分组" }),
    ).getAllByRole("link");
    expect(topics.map((a) => a.getAttribute("href"))).toEqual(
      lessonGroups("hanzi").map((g) => cardsHref("hanzi", g.name)),
    );
    topics.forEach((link) => {
      expect(link.className).toContain("with-scenic-group");
      expect(link.querySelector(".poem-group-bg")).toBeTruthy();
    });
    expect(screen.queryByRole("navigation", { name: "翻页" })).toBeNull();
  });
  it("renders the last character of a long group in the same list as the first", () => {
    const group = lessonGroups("hanzi").find((g) => g.name === "动作")!;
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "cards", subject: "hanzi", group }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const links = within(
      screen.getByRole("navigation", { name: "动一动选卡" }),
    ).getAllByRole("link");
    expect(links).toHaveLength(44);
    expect(links.at(-1)?.getAttribute("href")).toBe(
      subjectHref("hanzi") + "/" + group.items.at(-1)!.id,
    );
  });
  it("renders child-friendly poem groups and illustrated scenic poem title cards", () => {
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "groups", subject: "poems" }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const groupsNav = screen.getByRole("navigation", { name: "选择古诗分组" });
    const groupLinks = within(groupsNav).getAllByRole("link");
    expect(groupLinks).toHaveLength(9);
    expect(within(groupsNav).getByText("小动物")).toBeTruthy();
    expect(within(groupsNav).getByText("看山水")).toBeTruthy();

    cleanup();
    const animals = lessonGroups("poems").find((g) => g.name === "小动物")!;
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "cards", subject: "poems", group: animals }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const poemCard = screen.getByRole("link", { name: /咏鹅/ });
    expect(poemCard.className).toContain("with-poem-cover");
    expect(poemCard.querySelector(".poem-card-bg")).toBeTruthy();
  });
  it("renders pictographic watercolor backdrops and mnemonics on number cards", () => {
    const basicGroup = lessonGroups("numbers").find((g) => g.name === "0–10")!;
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "cards", subject: "numbers", group: basicGroup }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const basicNav = screen.getByRole("navigation", { name: "0–10选卡" });
    const basicLinks = within(basicNav).getAllByRole("link");
    expect(basicLinks).toHaveLength(11);
    basicLinks.forEach((link, n) => {
      expect(link.className).toContain("with-number-art");
      const img = link.querySelector<HTMLImageElement>("img.number-card-bg");
      expect(img?.getAttribute("src")).toBe(`./art/numbers/num-${n}.webp`);
    });
    expect(within(basicLinks[1]).getByText("像铅笔")).toBeTruthy();
    expect(within(basicLinks[2]).getByText("像小鸭")).toBeTruthy();
    expect(within(basicLinks[10]).getByText("铅笔和鸡蛋")).toBeTruthy();

    cleanup();
    const teensGroup = lessonGroups("numbers").find((g) => g.name === "11–20")!;
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "cards", subject: "numbers", group: teensGroup }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const teensNav = screen.getByRole("navigation", { name: "11–20选卡" });
    const teensLinks = within(teensNav).getAllByRole("link");
    expect(teensLinks).toHaveLength(10);
    teensLinks.forEach((link, i) => {
      expect(link.className).toContain("with-number-art");
      const img = link.querySelector<HTMLImageElement>("img.number-card-bg");
      expect(img?.getAttribute("src")).toBe(`./art/numbers/num-${11 + i}.webp`);
    });
  });
  it("labels the math adventure as Numberblocks and shows mini block previews on math cards", () => {
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "home" }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    expect(screen.getByText("数字积木")).toBeTruthy();

    cleanup();
    const addGroup = lessonGroups("math").find((g) => g.name === "加法")!;
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "cards", subject: "math", group: addGroup }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const card = screen.getByRole("link", { name: /3 \+ 2/ });
    expect(card.className).toContain("with-math-blocks");
    expect(card.querySelector(".math-blocks-preview")).toBeTruthy();
  });
  it("renders scenic watercolor group cards and illustrated item cards for pinyin", () => {
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "groups", subject: "pinyin" }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const groupsNav = screen.getByRole("navigation", { name: "选择拼音分组" });
    const groupLinks = within(groupsNav).getAllByRole("link");
    expect(groupLinks).toHaveLength(3);
    groupLinks.forEach((link) => {
      expect(link.className).toContain("with-pinyin-group");
      expect(link.querySelector(".poem-group-bg")).toBeTruthy();
    });

    cleanup();
    const initials = lessonGroups("pinyin").find((g) => g.name === "声母")!;
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "cards", subject: "pinyin", group: initials }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const bCard = screen.getByRole("link", { name: /播 · bō/ });
    expect(bCard.querySelector(".pinyin-card-prop")?.getAttribute("src")).toContain("/sow-seeds.webp");
    expect(screen.getByRole("link", { name: /佛 · fó（呼读 fō）/ })).toBeTruthy();
    const seven = screen.getByRole("link", { name: /七 · qī/ });
    expect(seven.querySelectorAll('img[src$="/star.webp"]')).toHaveLength(7);
    expect(bCard.className).toContain("with-pinyin-cover");
    expect(bCard.querySelector("img.pinyin-card-bg")).toBeTruthy();
  });
  it("renders scenic watercolor group cards, painted item scenes, and color swatches for english", () => {
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "groups", subject: "english" }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const groupsNav = screen.getByRole("navigation", { name: "选择英语分组" });
    const groupLinks = within(groupsNav).getAllByRole("link");
    expect(groupLinks).toHaveLength(6);
    groupLinks.forEach((link) => {
      expect(link.className).toContain("with-english-group");
      expect(link.querySelector(".poem-group-bg")).toBeTruthy();
    });

    cleanup();
    const animals = lessonGroups("english").find((g) => g.name === "动物")!;
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "cards", subject: "english", group: animals }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const catCard = screen.getByRole("link", { name: /cat/ });
    expect(catCard.className).toContain("with-english-cover");
    expect(catCard.querySelector("img.english-card-bg")).toBeTruthy();
    const props = Array.from(catCard.querySelectorAll<HTMLImageElement>("img.english-card-prop"));
    expect(props.length).toBeGreaterThan(0);
    props.forEach((img) => {
      expect(img.getAttribute("src")).not.toContain("art/english/");
    });

    cleanup();
    const colors = lessonGroups("english").find((g) => g.name === "颜色")!;
    render(
      <ForestCatalog
        store={store}
        route={{ screen: "cards", subject: "english", group: colors }}
        done={new Set()}
        onChoose={() => {}}
      />,
    );
    const redCard = screen.getByRole("link", { name: /red/ });
    expect(redCard.querySelector(".color-swatch-dot")).toBeTruthy();
  });
});
