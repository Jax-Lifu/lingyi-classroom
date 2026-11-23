import { createElement, useState } from "react";
import {
  fireEvent,
  render,
  renderHook,
  screen,
  act,
  cleanup,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { curriculum } from "@lingyi-classroom/content";
import type { Subject } from "@lingyi-classroom/shared";
import type { PlayActor, RoundProps } from "./types";
import { Fishing, Orchard, PicnicShop } from "./FoodGames";
import { NumberBlocksMath } from "./NumberBlocksMath";
import { PinyinTheater } from "./PinyinTheater";
import { EnglishTheater } from "./EnglishTheater";
import { PoemTheater } from "./PoemTheater";
import { usePlayRuntime } from "./usePlayRuntime";
import { useReducedMotion } from "./useReducedMotion";
import { NatureLetters } from "./NatureLetters";
import { WordBook } from "./WordBook";
import { playable } from "../childCatalog";

const howlCalls = vi.hoisted(() => ({
  instances: [] as {
    options: {
      src: string[];
      sprite?: { line?: [number, number] };
      onplay?: (id: number) => void;
      onloaderror?: (id: number, reason: string) => void;
      onend?: (id: number) => void;
    };
    play: ReturnType<typeof vi.fn>;
    unload: ReturnType<typeof vi.fn>;
  }[],
}));
vi.mock("howler", () => ({
  Howl: class {
    play = vi.fn((spriteKey?: string) => {
      this.options.onplay?.(1);
      return spriteKey ? 1 : 1;
    });
    unload = vi.fn();
    load = vi.fn();
    seek = vi.fn(() => 0);
    once = vi.fn();
    constructor(public options: (typeof howlCalls.instances)[number]["options"]) {
      howlCalls.instances.push(this);
    }
  },
}));

vi.mock("./Stage", () => ({
  SpeakerIcon: () => null,
  Stage: ({
    actors,
    pick,
    phase,
  }: {
    actors: PlayActor[];
    pick: (id: string) => void;
    phase: string;
  }) =>
    createElement(
      "section",
      { "data-testid": "stage", "data-phase": phase },
      actors
        .filter((a) => a.action)
        .map((a) =>
          createElement(
            "button",
            { key: a.id, "data-testid": a.id, onClick: () => pick(a.id) },
            a.action,
          ),
        ),
    ),
}));
beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  howlCalls.instances.length = 0;
  vi.unstubAllGlobals();
  vi.clearAllTimers();
  vi.useRealTimers();
});
function props(s: Subject, id: string): RoundProps {
  const all = curriculum[s];
  const item = all.find((x) => x.id === id)!;
  return {
    subject: s,
    item,
    alternatives: [
      all.find((x) => x.id !== id)!,
      item,
      ...all.filter((x) => x.id !== id).slice(1, 2),
    ],
    onWin: vi.fn(),
    next: vi.fn(),
    replay: vi.fn(),
    muted: false,
    runtime: {
      speak: vi.fn(),
      voiceFailed: false,
      listen: vi.fn(),
      enableSound: vi.fn(() => true),
      sound: vi.fn(),
      clear: vi.fn(),
      stop: vi.fn(),
      later: (ms, fn) => {
        setTimeout(fn, ms);
      },
    },
  };
}
const click = (id: string) => fireEvent.click(screen.getByTestId(id));
const tick = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const phase = () => screen.getByTestId("stage").dataset.phase;
describe("child story actions", () => {
  it("keeps all curriculum items reachable, except poems that only have a catalogue entry", () => {
    for (const s of Object.keys(curriculum) as Subject[]) {
      const expected = curriculum[s]
        .filter((v) => !v.poem || (v.poem.lines.length && v.audio))
        .map((v) => v.id);
      expect(playable[s].map((v) => v.id).sort()).toEqual(expected.sort());
    }
  });
  it("replays the meaning scene and awards a stamp only for the matching character", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    const g = props("hanzi", "hanzi-96f7");
    render(<WordBook {...g} />);
    fireEvent.click(screen.getByRole("button", { name: "重播字义动画" }));
    expect(g.runtime.speak).toHaveBeenCalledWith(
      "media/wordbook/thunder.mp3",
      "media/wordbook/hanzi-96f7.mp3",
    );
    fireEvent.click(screen.getByRole("button", { name: /看图选字/ }));
    fireEvent.click(
      screen.getByRole("button", { name: g.alternatives[0].label }),
    );
    expect(screen.getByRole("status").textContent).toContain("再看");
    expect(g.onWin).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "雷" }));
    expect(screen.getByRole("status").textContent).toContain("雷");
    expect(g.onWin).toHaveBeenCalledTimes(1);
  });
  it("waits for the child to feed the fish even after cooking has finished", () => {
    const g = props("hanzi", "hanzi-4e00");
    render(<Fishing {...g} />);
    click("fish-" + g.item.id);
    tick(950);
    expect(g.runtime.speak).toHaveBeenCalledWith("media/play/fish-label.mp3");
    tick(9000);
    expect(phase()).toBe("ready");
    expect(g.onWin).not.toHaveBeenCalled();
    click("fish-" + g.item.id);
    tick(1000);
    expect(g.onWin).toHaveBeenCalledTimes(1);
  });
  it("builds a forest from two separately planted seeds", () => {
    const g = props("hanzi", "hanzi-6797");
    render(<NatureLetters {...g} />);
    click("object-0");
    tick(750);
    expect(phase()).toBe("grow");
    click("object-1");
    tick(750);
    expect(phase()).toBe("reveal");
    click("object-0");
    expect(g.onWin).toHaveBeenCalledTimes(1);
  });
  it("accepts an empty basket for zero and a whole basket for ten", () => {
    const zero = props("numbers", "n-0");
    render(<Orchard {...zero} />);
    click("basket");
    expect(zero.onWin).toHaveBeenCalledTimes(1);
    cleanup();
    const ten = props("numbers", "n-10");
    render(<Orchard {...ten} />);
    click("basket");
    expect(ten.onWin).not.toHaveBeenCalled();
    click("ten");
    click("basket");
    expect(ten.onWin).toHaveBeenCalledTimes(1);
  });
  it("merges Numberblocks for addition, counts blocks, handles wrong picks, and wins on the right Numberling", () => {
    const g = props("math", "add-2-1");
    const { container } = render(<NumberBlocksMath {...g} />);
    const theater = container.querySelector<HTMLElement>(".nb-theater")!;
    expect(theater.dataset.phase).toBe("ready");

    fireEvent.click(screen.getByRole("button", { name: "把它们合体！" }));
    expect(theater.dataset.phase).toBe("animating");
    tick(420);
    expect(theater.dataset.phase).toBe("choose");

    const countBtn = screen.getByRole("button", { name: "点积木数一数" });
    fireEvent.click(countBtn);
    expect(container.querySelectorAll(".nb-cube.is-counted")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "未知数字积木，点积木数一数" }));
    fireEvent.click(screen.getByRole("button", { name: /继续数/ }));
    expect(container.querySelectorAll(".nb-cube.is-counted")).toHaveLength(3);

    const choices = screen
      .getAllByRole("button")
      .filter((b) => b.getAttribute("aria-label")?.startsWith("戴上数字"));
    const wrong = choices.find((b) => b.getAttribute("aria-label") !== "戴上数字3")!;
    fireEvent.click(wrong);
    expect(g.onWin).not.toHaveBeenCalled();
    expect(container.textContent).toContain("再换一顶数字帽");

    fireEvent.click(screen.getByRole("button", { name: "戴上数字3" }));
    expect(g.onWin).toHaveBeenCalledTimes(1);
    expect(theater.dataset.phase).toBe("won");
    expect(container.textContent).toContain("2 + 1 = 3");
  });
  it("supports Numberblock shapeshifting and subtraction split-and-choose", () => {
    const add4 = props("math", "add-3-1");
    const { container } = render(<NumberBlocksMath {...add4} />);
    fireEvent.click(screen.getByRole("button", { name: "把它们合体！" }));
    tick(420);
    const gridBefore = container.querySelector<HTMLElement>(".nb-result-actor .nb-grid")!;
    expect(gridBefore.style.getPropertyValue("--nb-cols")).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: /换个队形/ }));
    expect(gridBefore.style.getPropertyValue("--nb-cols")).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "戴上数字4" }));
    expect(add4.onWin).toHaveBeenCalledTimes(1);

    cleanup();
    const sub73 = props("math", "sub-7-3");
    const subView = render(<NumberBlocksMath {...sub73} />);
    expect(subView.container.querySelectorAll(".nb-cube")).toHaveLength(7);
    expect(subView.container.querySelectorAll(".nb-cube.is-detachable")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "咔嚓分出 3 块" }));
    tick(420);
    expect(subView.container.querySelector(".nb-detached-group")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "戴上数字4" }));
    expect(sub73.onWin).toHaveBeenCalledTimes(1);
  });
  it.each([
    ["sub-4-4", "咔嚓分出 4 块", 0],
    ["sub-5-0", "看看还剩几块", 5],
    ["sub-0-0", "看看还剩几块", 0],
    ["add-0-4", "把它们合体！", 4],
  ] as const)(
    "handles zero edge cases cleanly for %s",
    (id, actionLabel, answer) => {
      const g = props("math", id);
      const { container } = render(<NumberBlocksMath {...g} />);
      fireEvent.click(screen.getByRole("button", { name: actionLabel }));
      tick(420);
      const wrong = screen
        .getAllByRole("button")
        .find(
          (b) =>
            b.getAttribute("aria-label")?.startsWith("戴上数字") &&
            b.getAttribute("aria-label") !== `戴上数字${answer}`,
        )!;
      fireEvent.click(wrong);
      expect(g.onWin).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: `戴上数字${answer}` }));
      expect(g.onWin).toHaveBeenCalledTimes(1);
      expect(container.querySelector<HTMLElement>(".nb-theater")?.dataset.phase).toBe("won");
    },
  );
  it("reports a recording failure and clears it only when playback starts successfully", () => {
    const { result } = renderHook(() => usePlayRuntime(false));
    act(() => result.current.speak("word.mp3"));
    const first = howlCalls.instances.at(-1)!;
    act(() => first.options.onloaderror?.(1, "404"));
    expect(result.current.voiceFailed).toBe(true);
    act(() => result.current.listen("word.mp3"));
    expect(result.current.voiceFailed).toBe(false);
    act(() => first.options.onloaderror?.(1, "late"));
    expect(result.current.voiceFailed).toBe(false);
  });

  it.each(["pinyin", "english"] as const)("keeps the same %s listening question available for a recording retry", (subject) => {
    const g = props(subject, subject === "english" ? "en-cake" : "initial-b");
    const Theater = subject === "english" ? EnglishTheater : PinyinTheater;
    const view = render(<Theater {...g} />);
    fireEvent.click(screen.getByRole("button", { name: subject === "english" ? "听词找图" : "找一找" }));
    view.rerender(<Theater {...g} runtime={{ ...g.runtime, voiceFailed: true }} />);
    const option = screen.getByRole<HTMLButtonElement>("button", { name: subject === "english" ? "给蛋糕拍照" : "选择拼音 b" });
    expect(option.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "重新播放录音" }));
    expect(g.runtime.listen).toHaveBeenCalledWith(g.item.audio);
    expect(g.onWin).not.toHaveBeenCalled();
    view.rerender(<Theater {...g} />);
    expect(option.disabled).toBe(false);
    expect(screen.queryByText(/声音没播出来/)).toBeNull();
    fireEvent.click(option);
    expect(g.onWin).toHaveBeenCalledOnce();
  });

  it("offers the same equation as a picnic and accepts only its correct wooden sign", () => {
    const g = props("math", "sub-2-0");
    render(<PicnicShop {...g} />);
    click("basket");
    const wrong = screen.getAllByRole("button").find(b => b.textContent?.startsWith("挂上数字") && b.textContent !== "挂上数字2")!;
    fireEvent.click(wrong);
    expect(g.onWin).not.toHaveBeenCalled();
    click("tag-2");
    expect(g.onWin).toHaveBeenCalledOnce();
  });

  it("keeps automatic narration muted until the child chooses to listen", () => {
    const unmute = vi.fn();
    const { result } = renderHook(() => usePlayRuntime(true, unmute));
    act(() => result.current.speak("intro.mp3"));
    expect(unmute).not.toHaveBeenCalled();
    expect(howlCalls.instances).toHaveLength(0);
    act(() => result.current.listen("word.mp3"));
    expect(unmute).toHaveBeenCalledOnce();
    expect(howlCalls.instances[0].options.src).toEqual(["./word.mp3"]);
  });

  it("unmutes only explicit tone replays and keeps a newly started contour connected", () => {
    const disconnect = vi.fn();
    const start = vi.fn();
    const param = { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() };
    vi.stubGlobal("AudioContext", class {
      state = "running";
      currentTime = 0;
      destination = {};
      createGain() { return { gain: param, connect: vi.fn(), disconnect }; }
      createOscillator() { return { frequency: param, connect: vi.fn(), disconnect: vi.fn(), start, stop: vi.fn() }; }
    });
    const game = props("pinyin", "initial-b");
    function MutedRound() {
      const [muted, setMuted] = useState(true);
      const runtime = usePlayRuntime(muted, () => setMuted(false));
      return <><button onClick={() => setMuted(true)}>Mute test round</button>
        <PinyinTheater {...game} muted={muted} runtime={runtime} /></>;
    }
    render(<MutedRound />);
    const press = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
    press("声调拼读");
    expect(howlCalls.instances).toHaveLength(0);
    press("重播声音与动画");
    expect(howlCalls.instances.at(-1)?.options.src).toEqual(["./media/pinyin/bo1.mp3"]);
    press("Mute test round");
    press(/二声扬/);
    expect(start).not.toHaveBeenCalled();
    press("重播声音与动画");
    expect(start).toHaveBeenCalledOnce();
    expect(disconnect).not.toHaveBeenCalled();
    press("Mute test round");
    expect(disconnect).toHaveBeenCalled();
  });

  it.each(["pinyin", "english"] as const)("does not start a late %s introduction on the first gesture after a deep link", (subject) => {
    const activation = { hasBeenActive: false };
    vi.stubGlobal("navigator", { userActivation: activation });
    const game = props(subject, subject === "pinyin" ? "initial-b" : "en-cat");
    const Theater = subject === "pinyin" ? PinyinTheater : EnglishTheater;
    const view = render(<Theater {...game} />);
    activation.hasBeenActive = true;
    view.rerender(<Theater {...game} runtime={{ ...game.runtime }} />);
    expect(game.runtime.speak).not.toHaveBeenCalled();
  });

  it("reacts independently to app and system reduced motion", async () => {
    const media = Object.assign(new EventTarget(), { matches: false });
    vi.stubGlobal("matchMedia", () => media);
    const root = document.documentElement;
    const { result } = renderHook(useReducedMotion);
    try {
      expect(result.current).toBe(false);
      await act(async () => { root.dataset.reduceMotion = "true"; });
      expect(result.current).toBe(true);
      await act(async () => { delete root.dataset.reduceMotion; });
      expect(result.current).toBe(false);
      act(() => { media.matches = true; media.dispatchEvent(new Event("change")); });
      expect(result.current).toBe(true);
    } finally {
      delete root.dataset.reduceMotion;
    }
  });

  it("waits for both digits of 10 before awarding a number hat by keyboard", () => {
    const g = props("math", "add-9-1");
    render(<NumberBlocksMath {...g} />);
    fireEvent.click(screen.getByRole("button", { name: "把它们合体！" }));
    tick(420);
    fireEvent.keyDown(window, { key: "1" });
    expect(g.onWin).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "0" });
    expect(g.onWin).toHaveBeenCalledOnce();
  });

  it.each([true, false])("requires all poem lines after playing only the ending (muted=%s)", (muted) => {
    const g = props("poems", "p1a-k01");
    const { container } = render(<PoemTheater {...g} muted={muted} />);
    const lines = Array.from(container.querySelectorAll<HTMLButtonElement>(".poem-verse-btn"));
    expect(container.querySelectorAll(".poem-verse-btn.is-seen")).toHaveLength(0);
    fireEvent.click(lines[5]);
    fireEvent.click(screen.getByRole("button", { name: "看动画听诗" }));
    if (muted) tick(10000);
    else act(() => howlCalls.instances.at(-1)?.options.onend?.(1));
    expect(g.onWin).not.toHaveBeenCalled();
    for (const line of lines.slice(0, 5)) fireEvent.click(line);
    expect(g.onWin).toHaveBeenCalledOnce();
  });

  it.each(["english", "pinyin"] as const)("keeps %s quiz clues hidden until help or two wrong answers", (subject) => {
    const g = props(subject, subject === "pinyin" ? "initial-b" : "en-cat");
    const Theater = subject === "pinyin" ? PinyinTheater : EnglishTheater;
    const enter = () => fireEvent.click(screen.getByRole("button", { name: subject === "pinyin" ? "找一找" : "听词找图" }));
    const view = render(<Theater {...g} />);
    enter();
    expect(view.container.querySelector(".scenic-story-whisper")).toBeNull();
    expect(view.container.querySelector(".scenic-storyboard")?.hasAttribute("hidden")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "给我提示" }));
    expect(view.container.querySelector(".is-hinted")).toBeTruthy();
    expect(view.container.querySelector(".scenic-storyboard")?.hasAttribute("hidden")).toBe(false);
    view.unmount();
    const second = render(<Theater {...g} />);
    enter();
    const wrong = g.alternatives.find((a) => a.id !== g.item.id)!;
    const button = screen.getByRole("button", { name: subject === "pinyin" ? "选择拼音 " + wrong.label : "给" + wrong.caption + "拍照" });
    fireEvent.click(button);
    expect(second.container.querySelector(".is-hinted")).toBeNull();
    fireEvent.click(button);
    expect(second.container.querySelector(".is-hinted")).toBeTruthy();
    expect(g.onWin).not.toHaveBeenCalled();
  });

  it("keeps concealed silent navigation and timers separate from explicit recitation", () => {
    const g = props("poems", "p1a-j01");
    const { container } = render(<PoemTheater {...g} muted />);
    const press = (name: string) => fireEvent.click(screen.getByRole("button", { name }));
    press("遮句背一背");
    for (const name of ["下一句", "下一句", "下一句", "上一句", "上一句", "上一句"]) press(name);
    press("看动画听诗");
    tick(15000);
    expect(container.querySelectorAll(".poem-verse-btn.is-seen")).toHaveLength(0);
    expect(g.onWin).not.toHaveBeenCalled();
    for (let i = 3; i >= 0; i--) {
      press("这句背出来了");
      if (i) press("上一句");
    }
    expect(container.querySelectorAll(".poem-verse-btn.is-concealed")).toHaveLength(4);
    expect(g.onWin).toHaveBeenCalledOnce();
  });

  it("finishes a muted poem without tapping each line", () => {
    const g = props("poems", "p1a-j01");
    const { container } = render(<PoemTheater {...g} muted />);
    fireEvent.click(screen.getByRole("button", { name: "看动画听诗" }));
    act(() => vi.advanceTimersByTime(2200));
    expect(container.querySelector(".poem-stage")?.getAttribute("data-line")).toBe("1");
    act(() => vi.advanceTimersByTime(8000));
    expect(g.onWin).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "看动画听诗" })).toBeTruthy();
  });
  it("stages pinyin scenes with four-line grids, tone flight, blending, and audio quiz", () => {
    const g = props("pinyin", "initial-b");
    const { container } = render(<PinyinTheater {...g} />);
    expect(container.querySelector(".pinyin-theater")).toBeTruthy();
    expect(container.querySelector(".scenic-stage-bg")).toBeTruthy();
    expect(container.querySelector(".pinyin-seal")?.textContent).toContain("b");

    fireEvent.click(screen.getByRole("button", { name: "听声母" }));
    expect(g.runtime.listen).toHaveBeenLastCalledWith("media/pinyin/bo1.mp3");
    expect(screen.queryByText(/例字：八/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /拼一拼 b 和 ō 读作 bō/ }));
    expect(container.querySelector(".pinyin-blend-card.is-blended")).toBeTruthy();
    expect(g.runtime.speak).toHaveBeenLastCalledWith("media/pinyin/bo1.mp3");

    fireEvent.click(screen.getByRole("button", { name: "声调拼读" }));
    expect(container.querySelector(".pinyin-tone-svg")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /二声扬/ }));
    expect(container.querySelector(".scenic-stage-caption")?.textContent).toContain("bó");

    fireEvent.click(screen.getByRole("button", { name: "找一找" }));
    expect(g.runtime.speak).toHaveBeenLastCalledWith("media/pinyin/bo1.mp3", "media/play/pinyin-nest.mp3");
    const wrongAlt = g.alternatives.find((a) => a.id !== g.item.id)!;
    fireEvent.click(screen.getByRole("button", { name: "选择拼音 " + wrongAlt.label }));
    expect(g.onWin).not.toHaveBeenCalled();
    expect(container.querySelector(".pinyin-quiz-prompt")?.textContent).toContain("不是");

    fireEvent.click(screen.getByRole("button", { name: "选择拼音 " + g.item.label }));
    expect(g.onWin).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/学会「b」啦！/)).toBeTruthy();
  });
  it("distinguishes the classroom reading fō from the cue character 佛 fó", () => {
    const g = props("pinyin", "initial-f");
    render(<PinyinTheater {...g} />);
    fireEvent.click(screen.getByRole("button", { name: "听声母" }));
    expect(g.runtime.listen).toHaveBeenLastCalledWith("media/pinyin/fo1.mp3");
    fireEvent.click(screen.getByRole("button", { name: "听字音「佛」" }));
    expect(g.runtime.listen).toHaveBeenLastCalledWith("media/pinyin/fo2.mp3");
    fireEvent.click(screen.getByRole("button", { name: "声调拼读" }));
    expect(g.runtime.speak).toHaveBeenLastCalledWith("media/pinyin/fo1.mp3");
    fireEvent.click(screen.getByRole("button", { name: /二声扬/ }));
    expect(g.runtime.speak).toHaveBeenLastCalledWith("media/pinyin/fo2.mp3");
  });
  it("stages english storybook scenes, letter spelling, and picture quiz", () => {
    const g = props("english", "en-cat");
    const { container } = render(<EnglishTheater {...g} />);
    expect(container.querySelector(".english-theater")).toBeTruthy();
    expect(container.querySelector(".scenic-stage-bg")).toBeTruthy();
    expect(container.querySelector(".english-seal")?.textContent).toContain("cat");

    fireEvent.click(screen.getByRole("button", { name: "听英语" }));
    expect(g.runtime.listen).toHaveBeenCalledWith(g.item.audio);

    fireEvent.click(screen.getByRole("button", { name: "拼一拼" }));
    for (const ch of ["c", "a", "t"]) {
      const tile = screen
        .getAllByRole("button", { name: "字母 " + ch })
        .find((b) => !(b as HTMLButtonElement).disabled)!;
      fireEvent.click(tile);
    }
    expect(container.querySelector(".english-spell-status")?.textContent).toContain("拼对啦");

    fireEvent.click(screen.getByRole("button", { name: "听词找图" }));
    const wrongAlt = g.alternatives.find((a) => a.id !== g.item.id)!;
    fireEvent.click(screen.getByRole("button", { name: "给" + wrongAlt.caption + "拍照" }));
    expect(g.onWin).not.toHaveBeenCalled();
    expect(container.querySelector(".english-quiz-prompt")?.textContent).toContain("再听一次英语");

    fireEvent.click(screen.getByRole("button", { name: "给" + g.item.caption + "拍照" }));
    expect(g.onWin).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".scenic-finish-badge")?.textContent).toContain("cat");
  });
  it("stages poem scenes line-by-line, supports verse-hiding recitation, and records completion", () => {
    const yongE = props(
      "poems",
      curriculum.poems.find((p) => p.label === "咏鹅")!.id,
    );
    render(<PoemTheater {...yongE} />);
    expect(document.querySelector(".drama-yong-e")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /第2句：曲项向天歌。/ }));
    expect(document.querySelector(".drama-yong-e.at-line-1")).toBeTruthy();
    expect(howlCalls.instances.at(-1)?.options.src[0]).toContain("p1a-j01.mp3");
    expect(howlCalls.instances.at(-1)?.options.sprite?.line?.[0]).toBeGreaterThan(1500);

    fireEvent.click(screen.getByRole("button", { name: "遮句背一背" }));
    const hiddenFirst = screen.getByRole("button", { name: "看第1句画面提示并揭开" });
    fireEvent.click(hiddenFirst);
    expect(screen.getByRole("button", { name: /第1句：鹅，鹅，鹅，/ })).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "显示全文" }));
    fireEvent.click(screen.getByRole("button", { name: /第3句：白毛浮绿水，/ }));
    fireEvent.click(screen.getByRole("button", { name: /第4句：红掌拨清波。/ }));
    expect(yongE.onWin).toHaveBeenCalledTimes(1);
    expect(screen.getByText("赏完这首诗啦！")).toBeTruthy();

    cleanup();
    const lushan = props(
      "poems",
      curriculum.poems.find((p) => p.label === "望庐山瀑布")!.id,
    );
    render(<PoemTheater {...lushan} />);
    expect(document.querySelector(".drama-lushan-waterfall")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "下一句" }));
    expect(document.querySelector(".drama-lushan-waterfall.at-line-1")).toBeTruthy();

    cleanup();
    const xiaoChi = props(
      "poems",
      curriculum.poems.find((p) => p.label === "小池")!.id,
    );
    render(<PoemTheater {...xiaoChi} />);
    expect(document.querySelector(".drama-xiao-chi")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "下一句" }));
    expect(document.querySelector(".drama-xiao-chi.at-line-1")).toBeTruthy();

    cleanup();
    const jingYeSi = props(
      "poems",
      curriculum.poems.find((p) => p.label === "静夜思")!.id,
    );
    render(<PoemTheater {...jingYeSi} />);
    expect(document.querySelector(".drama-jing-ye-si")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "下一句" }));
    expect(document.querySelector(".drama-jing-ye-si.at-line-1")).toBeTruthy();
  });
});
