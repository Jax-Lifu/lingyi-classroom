import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { dirname, extname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import type { Plugin } from "vitest/config";

const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".webp": "image/webp", ".mp3": "audio/mpeg", ".png": "image/png",
};

function isRelativeFile(value: unknown): value is string {
  return typeof value === "string" && !/[\\:\x00-\x1f%?#]/.test(value)
    && value.split("/").every((part) => part !== "" && part !== "." && part !== "..");
}

function readPrivateFile(root: string, name: string): Buffer {
  const actual = realpathSync(join(root, name));
  const inside = relative(root, actual);
  if (inside === ".." || inside.startsWith(".." + sep) || isAbsolute(inside)) throw new Error("源文件位于归档之外");
  return readFileSync(actual);
}

function householdAssets(project: string): Map<string, Buffer> {
  try {
    const expected = join(realpathSync(project), "rea");
    const actual = realpathSync(expected);
    if (actual !== expected) throw new Error("归档目录不能重定向到项目以外");
    const manifest = JSON.parse(readPrivateFile(actual, "household-preview.json").toString("utf8"));
    if (manifest?.version !== 1 || !Array.isArray(manifest.files)) throw new Error("不支持的清单格式");

    const checked = new Map<string, Buffer>();
    for (const entry of manifest.files) {
      if (!isRelativeFile(entry?.path) || !isRelativeFile(entry?.source) ||
        !Object.hasOwn(mime, extname(entry.path)) || extname(entry.source) !== extname(entry.path) ||
        !/^[a-f0-9]{64}$/.test(entry.sha256) || checked.has(entry.path)) {
        throw new Error("清单路径、摘要或文件类型无效");
      }
      const bytes = readPrivateFile(actual, entry.source);
      if (createHash("sha256").update(bytes).digest("hex") !== entry.sha256) throw new Error("文件校验未通过");
      checked.set(entry.path, bytes);
    }
    if (!checked.has("index.html")) throw new Error("缺少故事入口");
    return checked;
  } catch (error) {
    const reason = (error as NodeJS.ErrnoException).code === "ENOENT" ? "缺少本机归档或清单文件" : (error as Error).message;
    console.warn(`家庭故事未启用（${reason}），练习册仍可使用。`);
    return new Map();
  }
}

export function learningAssets(mode: string, project = workspace): Plugin {
  const files = mode === "household" ? householdAssets(project) : new Map<string, Buffer>();
  return {
    name: "lingyi-classroom-assets",
    config: () => ({
      publicDir: join(project, "packages/content/public"),
      define: { "import.meta.env.VITE_HOUSEHOLD_AUDIO": JSON.stringify(files.size ? "true" : "false") },
      server: { fs: {
        allow: ["apps", "packages", "node_modules"].map((dir) => join(project, dir)),
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "**/rea/**"],
      } },
    }),
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const path = req.url?.split("?")[0];
        if (!path?.startsWith("/stories/")) return next();
        const name = path.slice("/stories/".length) || "index.html";
        const bytes = files.get(name);
        if (!bytes || !["GET", "HEAD"].includes(req.method ?? "")) {
          res.statusCode = 404;
          res.end();
          return;
        }
        res.setHeader("Content-Type", mime[extname(name)]);
        res.setHeader("Cache-Control", "no-cache");
        res.end(req.method === "HEAD" ? undefined : bytes);
      });
    },
    generateBundle() {
      for (const [name, source] of files) this.emitFile({ type: "asset", fileName: "stories/" + name, source });
    },
  };
}
