// @vitest-environment node
import { expect, it } from "vitest";
import { createHash } from "node:crypto";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { offlineResources } from "../apps/web/offline/build";

it("publishes complete, versioned packs and reuses unchanged audio when the shell changes", () => {
  const dir = mkdtempSync(join(tmpdir(), "classroom-packs-"));
  try {
    for (const folder of ["assets", "art", "media", "stories"]) mkdirSync(join(dir, folder));
    writeFileSync(join(dir, "media/voice.mp3"), "two notes");
    writeFileSync(join(dir, "art/leaf.webp"), "leaf");
    writeFileSync(join(dir, "stories/private.mp3"), "household");
    function build(shell) {
      writeFileSync(join(dir, "index.html"), "<html><body>" + shell + "</body></html>");
      offlineResources().writeBundle({ dir });
      const { id, bytes } = JSON.parse(readFileSync(join(dir, "resource-version.json")));
      const manifest = JSON.parse(readFileSync(join(dir, "resource-packs", id + ".json")));
      expect(readFileSync(join(dir, "index.html"), "utf8")).toContain(`data-resource-version="${id}"`);
      expect(bytes).toBe(manifest.packs.reduce((sum, p) => sum + p.size, 0));
      expect(Object.keys(manifest.files).sort()).toEqual(["art/leaf.webp", "index.html", "media/voice.mp3"]);
      for (const [name, [index, offset, size]] of Object.entries(manifest.files)) {
        const hash = manifest.packs[index].hash;
        const pack = readFileSync(join(dir, "resource-packs", hash + ".bin"));
        expect(createHash("sha256").update(pack).digest("hex")).toBe(hash);
        expect(pack.subarray(offset, offset + size)).toEqual(readFileSync(join(dir, name)));
      }
      return { id, audio: manifest.packs[manifest.files["media/voice.mp3"][0]].hash };
    }
    const one = build("first"), repeat = build("first"), two = build("second");
    expect(one).toEqual(repeat);
    expect(one.id).not.toBe(two.id);
    expect(one.audio).toBe(two.audio);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
