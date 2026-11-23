import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vite";

const templates = fileURLToPath(new URL(".", import.meta.url));
const digest = (bytes: Buffer | string) => createHash("sha256").update(bytes).digest("hex");
function walk(root: string, dir: string): string[] {
  return readdirSync(join(root, dir), { withFileTypes: true }).sort((a, b) => a.name < b.name ? -1 : 1)
    .flatMap((entry) => entry.isDirectory() ? walk(root, dir + "/" + entry.name)
      : entry.isFile() ? [dir + "/" + entry.name] : []);
}

// Pack each family separately so that updating the app doesn't invalidate its audio.
export function offlineResources(): Plugin {
  return {
    name: "classroom-offline-resources",
    apply: "build",
    writeBundle(options) {
      const root = resolve(options.dir!);
      const dir = join(root, "resource-packs");
      mkdirSync(dir, { recursive: true });
      const files: Record<string, [number, number, number]> = {};
      const packs: { hash: string; size: number }[] = [];
      let parts: Buffer[] = [], size = 0, family = "";
      function flush() {
        if (!parts.length) return;
        const bytes = Buffer.concat(parts);
        const hash = digest(bytes);
        writeFileSync(join(dir, hash + ".bin"), bytes);
        packs.push({ hash, size });
        parts = [];
        size = 0;
      }
      function append(path: string, bytes: Buffer) {
        const nextFamily = path.substring(0, path.lastIndexOf("/"));
        if (nextFamily !== family || size + bytes.length > 1500_000) flush();
        family = nextFamily;
        files[path] = [packs.length, size, bytes.length];
        parts.push(bytes);
        size += bytes.length;
      }
      for (const folder of ["assets", "art", "media"]) {
        for (const path of walk(root, folder)) {
          if (extname(path).toLowerCase() !== ".txt") append(path, readFileSync(join(root, path)));
        }
      }
      flush();
      const template = (name: string) => readFileSync(join(templates, name), "utf8");
      const worker = template("worker.js");
      writeFileSync(join(root, "resource-worker.js"), worker);
      const shell = readFileSync(join(root, "index.html"), "utf8").replace("</body>",
        template("dialog.html") + "\n<script>" + template("download.js") + "</script>\n</body>");
      const id = digest(JSON.stringify({ files, packs }) + shell + worker).slice(0, 20);
      const payload = packs.reduce((n, p) => n + p.size, 0);
      const page = shell.replace(/<html\b/, `<html data-resource-version="${id}"`).replaceAll("__RESOURCE_VERSION__", id)
        .replaceAll("__RESOURCE_MB__", ((payload + Buffer.byteLength(shell)) / 1e6).toFixed(1));
      writeFileSync(join(root, "index.html"), page);
      append("index.html", Buffer.from(page));
      flush();
      writeFileSync(join(dir, id + ".json"), JSON.stringify({ id, files, packs, versionedSpeech: true }));
      writeFileSync(join(root, "resource-version.json"), JSON.stringify({ id, bytes: payload + Buffer.byteLength(page) }));
    },
  };
}
