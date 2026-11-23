import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { Platform } from "@lingyi-classroom/shared";
import { LearningApp } from "./LearningApp";

const platform: Platform = {
  name: "web",
  getAppVersion: async () => "test",
  store: { get: async () => undefined, set: async () => {} },
};

beforeEach(() => {
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  window.history.replaceState(null, "", "#/library/poems/p1a-j01");
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("opens a new poem link while the parent library is already showing another poem", async () => {
  render(<LearningApp platform={platform} onOpenSettings={vi.fn()} />);
  await screen.findByRole("heading", { name: "咏鹅" });
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "咏鹅" } });
  act(() => { window.location.hash = "/library/poems/p1a-k01"; });
  expect(await screen.findByRole("heading", { name: "江南" })).toBeTruthy();
});

it("returns from the theater to the lesson the parent actually launched", async () => {
  render(<LearningApp platform={platform} onOpenSettings={vi.fn()} />);
  const directory = screen.getByRole("complementary", { name: "选课目录" });
  fireEvent.click(within(directory).getByRole("button", { name: /江南/ }));
  await screen.findByRole("heading", { name: "江南" });
  fireEvent.click(screen.getByRole("button", { name: "用这项玩游戏" }));
  await vi.waitFor(() => {
    expect(window.location.hash).toBe("#/learn/poems/p1a-k01");
    expect(screen.queryByRole("button", { name: "用这项玩游戏" })).toBeNull();
  });
  act(() => { window.history.back(); });
  await screen.findByRole("button", { name: "用这项玩游戏" });
  expect(screen.getByRole("heading", { name: "江南" })).toBeTruthy();
});

it("restores the library filters, expanded directory and its scroll position on Back", async () => {
  render(<LearningApp platform={platform} onOpenSettings={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: /再看一些/ }));
  const list = document.querySelector<HTMLElement>(".entry-list")!;
  list.scrollTop = 160;
  fireEvent.click(within(list).getByRole("button", { name: /山行/ }));
  fireEvent.click(screen.getByRole("button", { name: "用这项玩游戏" }));
  await vi.waitFor(() => expect(window.location.hash).toBe("#/learn/poems/p3a-k02"));
  act(() => window.history.back());
  await screen.findByRole("button", { name: "用这项玩游戏" });
  await screen.findByRole("heading", { name: "山行" });
  expect(document.querySelectorAll(".entry-list .entry")).toHaveLength(48);
  expect(document.querySelector(".entry-list")?.scrollTop).toBe(160);

  fireEvent.change(screen.getByRole("combobox"), { target: { value: "四年级上册" } });
  fireEvent.change(screen.getByRole("searchbox"), { target: { value: "白居易" } });
  fireEvent.click(screen.getByRole("button", { name: "未掌握" }));
  fireEvent.click(screen.getByRole("button", { name: "用这项玩游戏" }));
  await vi.waitFor(() => expect(window.location.hash).toBe("#/learn/poems/p4a-k01"));
  act(() => window.history.back());
  await screen.findByRole("button", { name: "用这项玩游戏" });
  await screen.findByRole("heading", { name: "暮江吟" });
  expect(screen.getByRole<HTMLSelectElement>("combobox").value).toBe("四年级上册");
  expect(screen.getByRole<HTMLInputElement>("searchbox").value).toBe("白居易");
  expect(screen.getByRole("button", { name: "未掌握" }).getAttribute("aria-pressed")).toBe("true");
  expect(document.querySelector(".entry[aria-current=true]")?.textContent).toContain("暮江吟");
});
