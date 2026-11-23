// The download page commits the manifest only after every content-addressed pack is stored.
const base = self.registration.scope;
const cacheName = "01class-resources:" + base;
const manifestKey = new URL("resource-active", base).href;
const mime = {
  html: "text/html; charset=utf-8", js: "text/javascript", css: "text/css",
  webp: "image/webp", mp3: "audio/mpeg", wav: "audio/wav",
};
let manifest;
self.addEventListener("install", (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("message", (event) => {
  if (event.data === "resources-updated") manifest = undefined;
});

function ranged(blob, range, type) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!m || (!m[1] && !m[2])) return null;
  const start = m[1] ? Number(m[1]) : Math.max(0, blob.size - Number(m[2]));
  const end = m[1] && m[2] ? Math.min(Number(m[2]), blob.size - 1) : blob.size - 1;
  if (start > end || start >= blob.size) {
    return new Response(null, { status: 416, headers: { "Content-Range": "bytes */" + blob.size } });
  }
  return new Response(blob.slice(start, end + 1), { status: 206, headers: {
    "Content-Type": type, "Accept-Ranges": "bytes", "Content-Length": String(end - start + 1),
    "Content-Range": "bytes " + start + "-" + end + "/" + blob.size,
  } });
}

async function fromPack(path, request, revision) {
  const cache = await caches.open(cacheName);
  manifest ??= cache.match(manifestKey).then((r) => r?.json());
  let snapshot = await manifest;
  if ((revision && revision !== snapshot?.id) || (path.startsWith("assets/") && !snapshot?.files[path])) {
    snapshot = await (await cache.match(new URL("resource-previous", base)))?.json();
  }
  if (revision && revision !== snapshot?.id) return null;
  // An already-open pre-versioning tab still requests bare poem URLs with its old line offsets.
  if (!revision && snapshot?.versionedSpeech && request.mode !== "navigate" && path.startsWith("media/poems/")) {
    const previous = await (await cache.match(new URL("resource-previous", base)))?.json();
    if (previous && !previous.versionedSpeech) snapshot = previous;
  }
  const entry = snapshot?.files[path];
  if (!Array.isArray(entry)) return null;
  const [index, offset, size] = entry;
  const pack = await cache.match(new URL("resource-packs/" + snapshot.packs[index].hash + ".bin", base));
  if (!pack) return null;
  const type = mime[path.split(".").pop()] || "application/octet-stream";
  const blob = (await pack.blob()).slice(offset, offset + size, type);
  const range = request.headers.get("Range");
  if (range) return ranged(blob, range, type);
  return new Response(blob, { headers: { "Content-Type": type, "Content-Length": String(blob.size), "Accept-Ranges": "bytes" } });
}
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || !url.href.startsWith(base)) return;
  let path = url.pathname.slice(new URL(base).pathname.length);
  const versionedAudio = path.startsWith("media/") && path.endsWith(".mp3") && /^\?v=[a-f0-9]{20}$/.test(url.search);
  if (request.mode === "navigate" && (!path || path === "index.html")) {
    path = "index.html";
    manifest = undefined;
  } else if (!/^(assets|art|media)\//.test(path) || (url.search && !versionedAudio)) return;
  event.respondWith(fromPack(path, request, versionedAudio ? url.searchParams.get("v") : null).catch(() => null).then((hit) => hit || fetch(request)));
});
