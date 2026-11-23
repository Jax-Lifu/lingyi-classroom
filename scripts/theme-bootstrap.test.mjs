// @vitest-environment node
import { readFile } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { expect, it } from "vitest";

it.each([
  ["web", "com.team.first", "dark"],
  ["web", "com.team.second", "light"],
  ["web", "com.lingyi.classroom", "dark"],
  ["desktop", "", "light"],
])("restores the %s first-frame theme for %s", async (app, identifier, theme) => {
  const html = (await readFile(new URL(`../apps/${app}/index.html`, import.meta.url), "utf8"))
    .replaceAll("%VITE_APP_IDENTIFIER%", identifier);
  const dom = new JSDOM(html, {
    url: "https://example.test/nested/",
    runScripts: "dangerously",
    beforeParse(window) {
      window.matchMedia = () => ({ matches: false });
      window.localStorage.setItem("app:theme-cache", '{"theme":"light"}');
      window.localStorage.setItem("app:com.sensen.workbook:theme-cache", '{"theme":"dark"}');
      window.localStorage.setItem("app:com.team.first:theme-cache", '{"theme":"dark"}');
      window.localStorage.setItem("app:com.team.second:theme-cache", '{"theme":"light"}');
    },
  });
  try {
    const root = dom.window.document.documentElement;
    expect(root.dataset.theme).toBe(theme);
    expect(dom.window.getComputedStyle(root).backgroundColor).toBe(
      theme === "dark" ? "rgb(216, 210, 190)" : "rgb(250, 248, 239)",
    );
  }
  finally { dom.window.close(); }
});
