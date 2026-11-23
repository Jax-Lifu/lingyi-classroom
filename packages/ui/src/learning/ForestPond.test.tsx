import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ForestPond } from "./ForestPond";

const play = vi.hoisted(() => vi.fn());
vi.mock("howler", () => ({
  Howl: class {
    play = play;
    stop() {}
    unload() {}
  },
}));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  play.mockClear();
});

it("plays back the child's rhythm and cancels pending hops when a new song starts", async () => {
  vi.useFakeTimers();
  const store = { get: async () => undefined, set: async () => {} };
  await act(async () => {
    render(<ForestPond store={store} count="" />);
  });
  const tap = (digit: number) =>
    fireEvent.click(
      screen.getByRole("button", { name: new RegExp(digit + "号荷叶") }),
    );
  const wait = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  tap(3);
  wait(240);
  tap(1);
  wait(400);
  tap(5);
  play.mockClear();
  fireEvent.click(screen.getByRole("button", { name: "听我的歌" }));
  expect(play.mock.calls).toEqual([["3"]]);
  wait(239);
  expect(play).toHaveBeenCalledTimes(1);
  wait(1);
  expect(play.mock.calls).toEqual([["3"], ["1"]]);
  fireEvent.click(screen.getByRole("button", { name: "重新编歌" }));
  tap(4);
  wait(1500);
  expect(play.mock.calls).toEqual([["3"], ["1"], ["4"]]);
  expect(screen.getByRole("img", { name: "我的曲子：发" })).toBeTruthy();
});
