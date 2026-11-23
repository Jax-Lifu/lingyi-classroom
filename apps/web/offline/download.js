(() => {
  const dialog = document.getElementById("resource-dialog");
  if (!dialog || typeof dialog.showModal !== "function") return;
  const title = dialog.querySelector("h2");
  const copy = document.getElementById("resource-copy");
  const status = document.getElementById("resource-status");
  const start = document.getElementById("resource-start");
  const close = document.getElementById("resource-close");
  const progress = dialog.querySelector("progress");
  const base = new URL(".", location.href).href;
  const prefix = "01class-resources:" + base;
  const activeKey = base + "resource-active";
  const secure = window.isSecureContext && "serviceWorker" in navigator && "caches" in window;
  const mobile = matchMedia("(max-width: 760px), (pointer: coarse)").matches;
  const version = dialog.dataset.version;
  let target = version;
  let busy, saved, finished = false;
  const read = (key) => { try { return localStorage.getItem(prefix + key); } catch { return null; } };
  const write = (key, value) => { try { localStorage.setItem(prefix + key, value); } catch {} };
  const note = (message) => { status.hidden = !message; status.textContent = message; };
  const urlFor = (pack) => base + "resource-packs/" + pack.hash + ".bin";
  const show = () => { if (!dialog.open) dialog.showModal(); };

  if (!mobile) title.textContent = "下载课堂资源？";
  if (!secure) copy.textContent += " 局域网 HTTP 地址会使用浏览器的普通缓存。";
  document.addEventListener("classroom-open-download", show);
  function dismiss() {
    busy?.abort();
    write(":dismissed", target);
    dialog.close();
    if (finished && secure && target !== version) location.reload();
  }
  close.onclick = dismiss;
  dialog.addEventListener("cancel", (event) => { event.preventDefault(); dismiss(); });

  // Show the offer from the HTML while the larger application modules are loading.
  if (mobile && !read(":saved") && read(":dismissed") !== version) show();
  function complete(id) {
    saved = id;
    finished = true;
    write(":saved", id);
    title.textContent = secure ? "课堂资源已下载" : "课堂资源已预载";
    copy.textContent = secure ? "绘本、朗读和笔顺已存到这台设备，下次可以直接打开。" : "课程文件已交给浏览器缓存，下次打开时可复用。";
    progress.hidden = true;
    start.hidden = secure;
    start.textContent = "重新预载";
    close.textContent = "进入课堂";
    note("");
    if (dialog.open) close.focus();
  }

  async function discover() {
    if (secure && read(":saved")) {
      const cache = await caches.open(prefix);
      const active = await (await cache.match(activeKey))?.json();
      const keys = new Set((await cache.keys()).map((k) => k.url));
      if (active && active.packs.every((p) => keys.has(urlFor(p)))) {
        if (!(await navigator.serviceWorker.getRegistration(base))?.active) {
          await navigator.serviceWorker.register(base + "resource-worker.js", { scope: base, updateViaCache: "none" });
        }
        complete(active.id);
      } else {
        write(":saved", "");
        if (mobile) show();
      }
    } else if (!secure && read(":saved") === version) complete(version);
    if (!saved) return;
    const response = await fetch(base + "resource-version.json", { cache: "no-store" });
    if (!response.ok) return;
    const latest = await response.json();
    if (latest.id === saved || busy) return;
    target = latest.id;
    finished = false;
    title.textContent = "课堂资源有更新";
    copy.textContent = secure ? "下载更新后，再次打开就能用上新内容。已保存的相同资源会直接复用。" : "重新预载，在局域网中更新这台设备的浏览器缓存。";
    start.textContent = "下载更新";
    start.hidden = false;
    close.textContent = "以后再说";
    if (mobile && read(":dismissed") !== target) show();
  }
  const discovered = discover().catch(() => {});

  async function download(signal) {
    let response = await fetch(base + "resource-packs/" + target + ".json", { signal, cache: "no-cache" });
    if (response.status === 404) {
      const latest = await fetch(base + "resource-version.json", { signal, cache: "no-store" });
      if (latest.ok) {
        target = (await latest.json()).id;
        response = await fetch(base + "resource-packs/" + target + ".json", { signal, cache: "no-store" });
      }
    }
    if (!response.ok) throw new Error("manifest");
    const plan = await response.json();
    if (plan.id !== target) throw new Error("manifest");
    const total = plan.packs.reduce((sum, p) => sum + p.size, 0);
    let done = 0;
    function advance(bytes) {
      done += bytes;
      progress.value = 100 * done / total;
      status.textContent = (done / 1e6).toFixed(1) + " / " + (total / 1e6).toFixed(1) + " MB";
    }
    advance(0);
    if (!secure) {
      // Plain HTTP on a NAS has no service worker; warm the exact URLs that the app uses.
      let cursor = 0;
      const entries = Object.entries(plan.files);
      async function loadFiles() {
        while (cursor < entries.length) {
          const [path, entry] = entries[cursor++];
          const url = new URL(path, base);
          if (plan.versionedSpeech && path.startsWith("media/") && path.endsWith(".mp3")) url.searchParams.set("v", plan.id);
          const res = await fetch(url, { signal, cache: read(":saved") && read(":saved") !== target ? "reload" : "default" });
          if (!res.ok || (await res.arrayBuffer()).byteLength !== entry[2]) throw new Error("file");
          advance(entry[2]);
        }
      }
      await Promise.all(Array.from({ length: 5 }, loadFiles));
      return;
    }
    const reg = await navigator.serviceWorker.register(base + "resource-worker.js", { scope: base, updateViaCache: "none" });
    await navigator.serviceWorker.ready;
    const cache = await caches.open(prefix);
    const present = new Set((await cache.keys()).map((k) => k.url));
    for (const pack of plan.packs) {
      signal.throwIfAborted();
      const url = urlFor(pack);
      if (!present.has(url)) {
        const res = await fetch(url, { signal, cache: "no-store" });
        if (!res.ok) throw new Error("pack");
        const bytes = await res.arrayBuffer();
        const sha = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
        const hash = Array.from(sha, (n) => n.toString(16).padStart(2, "0")).join("");
        if (bytes.byteLength !== pack.size || hash !== pack.hash) throw new Error("pack");
        await cache.put(url, new Response(bytes));
      }
      advance(pack.size);
    }
    signal.throwIfAborted();
    const previousKey = base + "resource-previous";
    let previous = await (await cache.match(activeKey))?.json();
    if (previous?.id === plan.id) previous = await (await cache.match(previousKey))?.json();
    else if (previous) await cache.put(previousKey, new Response(JSON.stringify(previous)));
    await cache.put(activeKey, new Response(JSON.stringify(plan)));
    reg.active?.postMessage("resources-updated");
    // Keep the previous version's packs through the handoff to any open tabs.
    const keep = new Set([activeKey, previousKey, ...plan.packs.map(urlFor), ...(previous?.packs || []).map(urlFor)]);
    if (navigator.locks) {
      for (const key of present) if (!keep.has(key)) await cache.delete(key);
    }
  }
  start.onclick = async () => {
    if (busy) return;
    const controller = new AbortController();
    busy = controller;
    start.hidden = true;
    progress.hidden = false;
    status.hidden = false;
    finished = false;
    close.textContent = "暂停，先进入课堂";
    close.focus();
    title.textContent = "正在下载课堂资源";
    try {
      await discovered;
      const run = () => download(controller.signal);
      if (navigator.locks) await navigator.locks.request(prefix, { signal: controller.signal }, run);
      else await run();
      complete(target);
    } catch (error) {
      const paused = controller.signal.aborted;
      controller.abort();
      finished = false;
      title.textContent = paused ? "下载已暂停" : "下载未完成";
      note(error.name === "QuotaExceededError" ? "设备空间不足。请清出一些空间，再继续下载。" :
        ["SecurityError", "NotAllowedError"].includes(error.name) ? "浏览器限制了本地存储。可以先进入课堂，或在普通浏览窗口重试。" :
        paused ? "可以稍后回来继续。" : "请检查网络后重试。已下载的资源会尽量复用。");
      start.hidden = false;
      start.textContent = "继续下载";
      close.textContent = "先进入课堂";
      if (dialog.open) start.focus();
    } finally {
      busy = undefined;
    }
  };
})();
