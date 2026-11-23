import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { curriculum } from "@lingyi-classroom/content";
import { ParentLibrary } from "./ParentLibrary";

vi.mock("./useNarration", () => ({ useNarration: () => ({ playing: false, stop: vi.fn(), play: vi.fn() }) }));

afterEach(cleanup);
it("keeps index-only texts searchable after all playable poems are learned", () => {
  const done = new Set(curriculum.poems.filter((item) => item.poem?.lines.length).map((item) => item.id));
  render(<ParentLibrary subject="poems" done={done} mark={vi.fn()} unmark={vi.fn()} home={vi.fn()} startGame={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "未掌握" }));
  expect(screen.getByText("没有找到符合条件的课目")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "全部" }));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "对韵歌" } });
  expect(screen.getByText("本篇收录目录和出处。")).toBeTruthy();
});

it("lists all textbook columns together in each of twelve volumes", () => {
  render(<ParentLibrary subject="poems" done={new Set()} mark={vi.fn()} unmark={vi.fn()} home={vi.fn()} startGame={vi.fn()} />);
  const grades = screen.getByRole("group", { name: "教材年级" });
  expect(grades.querySelectorAll("option")).toHaveLength(12);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "一年级上册" } });
  expect(document.querySelectorAll(".directory .entry")).toHaveLength(7);
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "咏鹅" } });
  expect(screen.getByRole("button", { name: /咏鹅.*日积月累/ })).toBeTruthy();
});

it("retains a correct result in the unlearned filter and finishes a single-result group", () => {
  function Library() {
    const [done, setDone] = useState(new Set<string>());
    return <ParentLibrary subject="math" done={done} mark={(id) => setDone(new Set([id]))} unmark={vi.fn()} home={vi.fn()} startGame={vi.fn()} />;
  }
  render(<Library />);
  fireEvent.click(screen.getByRole("button", { name: "未掌握" }));
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "3 + 2" } });
  fireEvent.click(screen.getByRole("button", { name: "5" }));
  expect(screen.getByText("答对啦！")).toBeTruthy();
  expect(screen.getByText("这组练完了")).toBeTruthy();
  const back = screen.getByRole("button", { name: "回到选课目录" });
  expect(document.activeElement).toBe(back);
  fireEvent.click(back);
  expect(screen.getByRole("button", { name: "全部" }).getAttribute("aria-pressed")).toBe("true");
});
