import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { curriculum } from "@lingyi-classroom/content";
import { WordFeed } from "./WordFeed";

const items = curriculum.hanzi
  .filter((item) => item.group === "动物")
  .slice(0, 3);
function pointer(target: Element, type: string, x: number, y: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, {
    pointerId: 1,
    isPrimary: true,
    button: 0,
    clientX: x,
    clientY: y,
  });
  fireEvent(target, event);
}
beforeEach(() => vi.stubGlobal("matchMedia", () => ({ matches: true })));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it("finishes a swipe when implicit touch capture transfers from the picture to the deck", () => {
  const select = vi.fn(),
    replay = vi.fn();
  const { container } = render(
    <WordFeed items={items} index={1} onSelect={select} toolbar={null}>
      <button onClick={replay}>插画</button>
    </WordFeed>,
  );
  const deck = container.querySelector<HTMLElement>(".reader-deck")!;
  Object.defineProperties(deck, {
    clientWidth: { value: 360 },
    clientHeight: { value: 450 },
    setPointerCapture: { value: vi.fn() },
  });
  const picture = screen.getByText("插画");
  pointer(picture, "pointerdown", 160, 200);
  pointer(picture, "pointermove", 160, 170);
  pointer(picture, "lostpointercapture", 160, 170);
  pointer(deck, "pointermove", 160, 100);
  pointer(deck, "pointerup", 160, 100);
  fireEvent.click(picture, { detail: 1 });
  expect(select).toHaveBeenCalledExactlyOnceWith(items[2]);
  expect(replay).not.toHaveBeenCalled();
  pointer(picture, "pointerdown", 160, 200);
  pointer(picture, "pointerup", 160, 200);
  fireEvent.click(picture, { detail: 1 });
  expect(replay).toHaveBeenCalledOnce();
});
it("consumes one wheel burst even across the change of active character", () => {
  const select = vi.fn();
  const show = (index: number) => (
    <WordFeed items={items} index={index} onSelect={select} toolbar={null}>
      <span>插画</span>
    </WordFeed>
  );
  const { container, rerender } = render(show(0));
  const deck = container.querySelector(".reader-deck")!;
  fireEvent.wheel(deck, { deltaY: -87 });
  expect(select).not.toHaveBeenCalled();
  fireEvent.wheel(deck, { deltaY: 87 });
  rerender(show(1));
  fireEvent.wheel(deck, { deltaY: 68 });
  fireEvent.wheel(deck, { deltaY: 20 });
  expect(select).toHaveBeenCalledExactlyOnceWith(items[1]);
});
