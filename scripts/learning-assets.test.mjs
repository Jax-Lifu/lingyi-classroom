// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { learningAssets } from "./learning-assets";

let project;
beforeEach(() => { project = mkdtempSync(join(tmpdir(), "workbook-edition-")); });
afterEach(() => { rmSync(project, { recursive: true, force: true }); });

function outputs(plugin) {
  const files = new Map();
  plugin.generateBundle.call({ emitFile: ({ fileName, source }) => files.set(fileName, source) });
  return files;
}

function fixture() {
  const archive = join(project, "rea");
  mkdirSync(archive);
  const text = '<a href="../index.html">返回练习册</a>';
  writeFileSync(join(archive, "entry.html"), text);
  writeFileSync(join(archive, "extra.html"), "unlisted");
  const row = { source: "entry.html", path: "index.html", sha256: createHash("sha256").update(text).digest("hex") };
  const manifest = (rows) => writeFileSync(join(archive, "household-preview.json"), JSON.stringify({ version: 1, files: rows }));
  manifest([row]);
  return { archive, row, manifest };
}

describe("learning asset editions", () => {
  it("keeps archived stories out of ordinary builds and dev URLs even when a valid archive exists", () => {
    fixture();
    for (const mode of ["development", "production"]) {
      const plugin = learningAssets(mode, project);
      expect(plugin.config().define["import.meta.env.VITE_HOUSEHOLD_AUDIO"]).toBe('"false"');
      expect(outputs(plugin).size).toBe(0);
      const use = vi.fn();
      plugin.configureServer({ middlewares: { use } });
      const response = { statusCode: 200, end: vi.fn() };
      use.mock.calls[0][0]({ url: "/stories/index.html?audio=local", method: "GET" }, response, vi.fn());
      expect(response.statusCode).toBe(404);
    }
  });

  it("publishes only the files and virtual paths in the verified household manifest", () => {
    fixture();
    const plugin = learningAssets("household", project);
    expect(plugin.config().define["import.meta.env.VITE_HOUSEHOLD_AUDIO"]).toBe('"true"');
    const files = outputs(plugin);
    expect([...files.keys()]).toEqual(["stories/index.html"]);
    expect(files.get("stories/index.html").toString()).toContain("返回练习册");
  });

  it("disables the household edition if the archive is missing, a digest changes, or a path escapes", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(outputs(learningAssets("household", project)).size).toBe(0);
    const { archive, row, manifest } = fixture();
    manifest([row, { ...row, path: "picture.html", sha256: "0".repeat(64) }]);
    expect(outputs(learningAssets("household", project)).size).toBe(0);
    manifest([{ ...row, path: "../index.html" }]);
    expect(outputs(learningAssets("household", project)).size).toBe(0);
    writeFileSync(join(project, "outside.html"), "outside");
    symlinkSync(join(project, "outside.html"), join(archive, "linked.html"));
    manifest([row, { source: "linked.html", path: "linked.html", sha256: createHash("sha256").update("outside").digest("hex") }]);
    expect(outputs(learningAssets("household", project)).size).toBe(0);
  });
});
