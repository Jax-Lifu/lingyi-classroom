export function manualChunks(id: string) {
  if (id.includes("packages/content/src/data/poems.json") || id.includes("packages/content/src/poemScenes")) {
    return "content-poems";
  }
  if (id.includes("packages/content/src/data/hanzi.json") || id.includes("packages/content/src/wordScenes")) {
    return "content-hanzi";
  }
  if (id.includes("strokes")) {
    return undefined;
  }
  if (id.includes("packages/content/src/")) {
    return "content-core";
  }
  if (id.includes("node_modules/react") || id.includes("node_modules/howler")) {
    return "vendor";
  }
}
