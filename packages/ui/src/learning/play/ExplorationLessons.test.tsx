import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { curriculum } from "@lingyi-classroom/content";
import { PlayWorld } from "./PlayWorld";
import { WindLesson, BoatLesson, PencilLesson } from "./ExplorationLessons";
import type { RoundProps } from "./types";
import { explorations } from "./explorations";
import { readLearningRoute } from "../childCatalog";

vi.mock("./StageCanvas", () => ({ StageCanvas: () => null }));

function game(id: keyof typeof explorations): RoundProps {
  const { subject, lessonId } = explorations[id];
  return {
    subject,
    item: curriculum[subject].find((l) => l.id === lessonId)!,
    alternatives: [],
    muted: true,
    next: vi.fn(),
    replay: vi.fn(),
    onWin: vi.fn(),
    runtime: {
      speak: vi.fn(),
      voiceFailed: false,
      listen: vi.fn(),
      enableSound: vi.fn(() => true),
      sound: vi.fn(),
      later: vi.fn(),
      clear: vi.fn(),
      stop: vi.fn(),
    },
  };
}

beforeEach(() =>
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  })),
);
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const click = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));

it("keeps the original lessons and opens their exploration deep links", () => {
  for (const { subject, lessonId } of Object.values(explorations)) {
    const href = "#/learn/" + subject + "/" + lessonId;
    expect(readLearningRoute(href)).toMatchObject({
      screen: "round",
      item: { id: lessonId },
      explore: false,
    });
    expect(readLearningRoute(href + "/explore")).toMatchObject({
      screen: "round",
      item: { id: lessonId },
      explore: true,
    });
  }
});

it("carries the chosen wind across materials and allows either extinguishing result to be revisited", () => {
  const g = game("wind");
  render(<WindLesson {...g} />);
  fireEvent.change(screen.getByRole("slider"), { target: { value: "-2" } });
  expect(g.onWin).not.toHaveBeenCalled();
  click("换成竹子");
  expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe(
    "向左强风",
  );
  expect(g.onWin).toHaveBeenCalledTimes(1);
  click("换回火苗");
  click("水");
  expect(screen.getByText("灭")).toBeTruthy();
  click("再试一次");
  click("土");
  expect(screen.getByText(/泥土盖住/)).toBeTruthy();
  vi.spyOn(Math, "random").mockReturnValue(0.25);
  click("猜风向");
  expect(screen.queryByRole("slider")).toBeNull();
  click("向右吹");
  expect(screen.getByText(/再看看尖尖/)).toBeTruthy();
  click("向左吹");
  expect(screen.getByText(/猜到了/)).toBeTruthy();
  click("回去拨风");
  expect(screen.getByRole("slider").getAttribute("aria-valuetext")).toBe("向左强风");
});

it("requires two distinct stone combinations, regardless of loading order", () => {
  const g = game("boat");
  render(<BoatLesson {...g} />);
  click("记下水线，换石头");
  click("小石 1");
  click("中石 2");
  click("大石 3");
  click("记住装法");
  click("大石 3");
  click("中石 2");
  click("小石 1");
  expect(
    screen.getByRole<HTMLButtonElement>("button", { name: "记住装法" })
      .disabled,
  ).toBe(true);
  expect(g.onWin).not.toHaveBeenCalled();
  click("换个装法");
  click("大石 3");
  click("大石 3");
  click("小石 1");
  expect(screen.getByText(/船沉得有点深/)).toBeTruthy();
  click("取下第3块小石");
  click("记住装法");
  expect(g.onWin).toHaveBeenCalledTimes(1);
});

it("changing speakers leaves the pencil in the same hand until it is passed", () => {
  const g = game("pencil");
  render(<PencilLesson {...g} />);
  click("换小兔说");
  expect(screen.getByAltText("笔在小兔手里")).toBeTruthy();
  click("把笔给小兔");
  expect(g.onWin).not.toHaveBeenCalled();
  click("换小熊说");
  click("把笔给小兔");
  expect(screen.getByText(/听，是谁在说我/)).toBeTruthy();
  click("把笔给小熊");
  expect(screen.getByAltText("笔在小熊手里")).toBeTruthy();
  click("换小兔说");
  expect(screen.getByAltText("笔在小熊手里")).toBeTruthy();
  click("把笔给小兔");
  expect(g.onWin).toHaveBeenCalledTimes(1);
});

it.each(["#/learn/hanzi/hanzi-8239/explore", "#/learn/poems/p6a-k09/explore"])(
  "awards only the boat exploration's main lesson from %s", async (hash) => {
    const route = readLearningRoute(hash);
    if (route.screen !== "round") throw new Error("Missing boat exploration");
    const mark = vi.fn(async () => "saved" as const);
    render(<PlayWorld {...route} resetVersion={0} navigate={vi.fn()} mark={mark} platform={{
      name: "web", getAppVersion: async () => "test",
      store: { get: async <T,>() => true as T, set: async () => {} },
    }} />);
    await screen.findByRole("button", { name: "记下水线，换石头" });
    for (const action of ["记下水线，换石头", "小石 1", "中石 2", "大石 3", "记住装法", "大石 3", "大石 3", "记住装法"]) click(action);
    expect(mark.mock.calls).toEqual([["p6a-k09", 0]]);
  },
);

it.each(["retry", "reset"])("keeps a completed exploration after a failed save and respects %s", async (action) => {
  const route = readLearningRoute("#/learn/hanzi/hanzi-706b/explore");
  if (route.screen !== "round") throw new Error("Missing wind exploration");
  const mark = vi.fn().mockResolvedValueOnce("failed").mockResolvedValue("saved");
  const platform = { name: "web" as const, getAppVersion: async () => "test",
    store: { resetVersion: () => 3, get: async <T,>() => true as T, set: async () => {} } };
  const round = (version: number) => <PlayWorld {...route} platform={platform} navigate={vi.fn()} mark={mark} resetVersion={version} />;
  // The write must see the current reset even before its UI notification arrives.
  const view = render(round(2));
  const wind = await screen.findByRole("slider");
  fireEvent.change(wind, { target: { value: "-2" } });
  click("换成竹子");
  await screen.findByText("回合已完成，学习印章尚未保存。");
  expect(screen.queryByText("已收下学习印章。")).toBeNull();
  if (action === "retry") {
    click("重试保存");
    await screen.findByText("已收下学习印章。");
    expect(mark.mock.calls).toEqual([["hanzi-706b", 3], ["hanzi-706b", 3]]);
  } else {
    view.rerender(round(4));
    expect(screen.getByText(/学习印章已重置/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "重试保存" })).toBeNull();
    expect(mark).toHaveBeenCalledOnce();
  }
});
