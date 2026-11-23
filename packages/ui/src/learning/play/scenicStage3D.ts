import { StageHandoff } from "./stageHandoff";
import * as THREE from "three";
import { makeGlowTexture } from "./poemArtSprites";
import { createSkyMoodMaterial } from "./poemShaders3D";

export const SCENIC_FOV_DEG = 32;
export const SCENIC_BASE_CAM_Z = 18;
const TAN_HALF_FOV = Math.tan(((SCENIC_FOV_DEG / 2) * Math.PI) / 180);

export type ScenicTime = "day" | "dawn" | "dusk" | "night" | "mist";
export type ScenicAtmosphere =
  | "none"
  | "petals"
  | "wind"
  | "rain"
  | "stars"
  | "ripples"
  | "clouds"
  | "leaves"
  | "fireflies";

export interface ScenicTapSignal {
  x: number;
  y: number;
  seq: number;
}

export type ScenicLayerSpec = readonly [
  picture: string,
  x: number,
  y: number,
  height: number,
  motion?: string,
  dx?: number,
  dy?: number,
];

export function worldSpanAtZ(z: number, aspect: number) {
  const dist = Math.max(2, SCENIC_BASE_CAM_Z - z);
  const h = 2 * dist * TAN_HALF_FOV;
  return { w: h * aspect, h };
}

export function percentToWorld(
  xPct: number,
  yPct: number,
  z: number,
  aspect: number,
) {
  const { w, h } = worldSpanAtZ(z, aspect);
  return {
    x: (xPct / 100 - 0.5) * w,
    y: (0.5 - yPct / 100) * h,
    visW: w,
    visH: h,
  };
}

export function sizeCoverBackdrop(
  mesh: THREE.Mesh,
  tex: THREE.Texture,
  z: number,
  aspectNow: number,
) {
  const far = worldSpanAtZ(z, aspectNow);
  const img = tex.image as HTMLImageElement | undefined;
  const ratio = img?.naturalWidth ? img.naturalWidth / img.naturalHeight : 16 / 9;
  const h = Math.max(far.h * 1.48, (far.w * 1.48) / ratio);
  mesh.scale.set(h * ratio, h, 1);
}

function moodPalette(time: ScenicTime) {
  switch (time) {
    case "dawn":
      return { top: "#ffd99a", bottom: "#f9c5a2", opacity: 0.16 };
    case "dusk":
      return { top: "#d97a4a", bottom: "#f2b872", opacity: 0.2 };
    case "night":
      return { top: "#0c1736", bottom: "#1d315c", opacity: 0.28 };
    case "mist":
      return { top: "#dce9e2", bottom: "#eff5f0", opacity: 0.22 };
    default:
      return { top: "#fff9eb", bottom: "#f4f9ef", opacity: 0.06 };
  }
}

interface ParticleSpec {
  count: number;
  color: number;
  size: number;
  opacity: number;
  mode: "fall" | "rain" | "twinkle" | "breeze" | "shimmer";
}

function particleSpecFor(atm: ScenicAtmosphere): ParticleSpec | null {
  switch (atm) {
    case "petals":
      return { count: 55, color: 0xf8b9c6, size: 0.25, opacity: 0.85, mode: "fall" };
    case "leaves":
      return { count: 48, color: 0xde7a42, size: 0.28, opacity: 0.82, mode: "fall" };
    case "rain":
      return { count: 96, color: 0xd4ecff, size: 0.14, opacity: 0.65, mode: "rain" };
    case "stars":
      return { count: 72, color: 0xfff5c0, size: 0.24, opacity: 0.88, mode: "twinkle" };
    case "fireflies":
      return { count: 46, color: 0xffe27a, size: 0.28, opacity: 0.9, mode: "twinkle" };
    case "wind":
    case "clouds":
      return { count: 36, color: 0xf6faf4, size: 0.72, opacity: 0.34, mode: "breeze" };
    case "ripples":
      return { count: 32, color: 0xfffbe0, size: 0.22, opacity: 0.5, mode: "shimmer" };
    default:
      return null;
  }
}

export function createScenicParticleField(
  atm: ScenicAtmosphere,
  glowTex: THREE.Texture,
  disposables: { dispose: () => void }[],
  root: THREE.Group,
  tintHex?: string,
) {
  const spec = particleSpecFor(atm);
  if (!spec) return null;
  const pos = new Float32Array(spec.count * 3);
  const seeds = Array.from({ length: spec.count }, (_, i) => ({
    x: (((i * 73) % 100) / 100 - 0.5) * 20,
    y: (((i * 37) % 100) / 100 - 0.5) * 11,
    z: -2.6 + ((i * 29) % 100) / 20,
    phase: (i * 0.13) % 1,
    speed: 0.7 + ((i * 19) % 100) / 140,
  }));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const color = tintHex ? new THREE.Color(tintHex).lerp(new THREE.Color(spec.color), 0.35) : spec.color;
  const mat = new THREE.PointsMaterial({
    map: glowTex,
    color,
    size: spec.size,
    transparent: true,
    opacity: spec.opacity,
    depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  disposables.push(geo, mat);
  root.add(pts);
  return {
    update(t: number) {
      const pAttr = geo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < seeds.length; i++) {
        const sd = seeds[i];
        let px = sd.x;
        let py = sd.y;
        if (spec.mode === "fall") {
          const prog = (t * 0.13 * sd.speed + sd.phase) % 1;
          px = sd.x + Math.sin(t * 1.2 + i) * 0.45;
          py = 6.2 - prog * 12.4;
        } else if (spec.mode === "rain") {
          const prog = (t * 0.65 * sd.speed + sd.phase) % 1;
          px = sd.x - prog * 1.8;
          py = 6.2 - prog * 12.4;
        } else if (spec.mode === "breeze") {
          const prog = (t * 0.09 * sd.speed + sd.phase) % 1;
          px = -10.5 + prog * 21.0;
        } else {
          py = sd.y + Math.sin(t * 1.5 + i) * 0.18;
        }
        pAttr.setXYZ(i, px, py, sd.z);
      }
      pAttr.needsUpdate = true;
    },
  };
}

export function createScenicTapBurst(
  glowTex: THREE.Texture,
  disposables: { dispose: () => void }[],
  root: THREE.Group,
  color = 0xfff3ba,
) {
  const burstCount = 24;
  const burstPos = new Float32Array(burstCount * 3);
  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute("position", new THREE.BufferAttribute(burstPos, 3));
  const burstMat = new THREE.PointsMaterial({
    map: glowTex,
    color,
    size: 0.3,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const burstPts = new THREE.Points(burstGeo, burstMat);
  disposables.push(burstGeo, burstMat);
  root.add(burstPts);
  let burstLife = 0;
  let burstOrigin = { x: 0, y: 0 };

  return {
    trigger(xPct: number, yPct: number, aspectNow: number) {
      burstLife = 1;
      burstOrigin = percentToWorld(xPct, yPct, 2.6, aspectNow);
    },
    update(animDt: number) {
      if (burstLife > 0) {
        burstLife = Math.max(0, burstLife - animDt * 1.25);
        burstMat.opacity = burstLife * 0.92;
        const bAttr = burstGeo.getAttribute("position") as THREE.BufferAttribute;
        const prog = 1 - burstLife;
        for (let i = 0; i < burstCount; i++) {
          const ang = (i / burstCount) * Math.PI * 2;
          const rad = prog * (1.25 + (i % 3) * 0.45);
          bAttr.setXYZ(
            i,
            burstOrigin.x + Math.cos(ang) * rad,
            burstOrigin.y + Math.sin(ang) * rad,
            2.6,
          );
        }
        bAttr.needsUpdate = true;
      } else {
        burstMat.opacity = 0;
      }
    },
  };
}

export interface ScenicSpriteLayer {
  mesh: THREE.Mesh;
  tex: THREE.Texture;
  x: number;
  y: number;
  heightPct: number;
  motion: string;
  dx: number;
  dy: number;
  z: number;
  idx: number;
}

export function updateScenicSpriteLayers(
  layers: readonly ScenicSpriteLayer[],
  t: number,
  aspectNow: number,
  activeBoost = false,
) {
  for (const a of layers) {
    const wp = percentToWorld(
      a.x + (activeBoost ? a.dx * 0.45 : 0),
      a.y + (activeBoost ? a.dy * 0.45 : 0),
      a.z,
      aspectNow,
    );
    const img = a.tex.image as HTMLImageElement | undefined;
    const ratio = img?.naturalWidth ? img.naturalWidth / img.naturalHeight : 1;
    const baseH = (a.heightPct / 100) * wp.visH * (activeBoost ? 1.04 : 1);
    a.mesh.scale.set(baseH * ratio, baseH, 1);

    let ox = 0;
    let oy = 0;
    let rz = 0;
    const ph = t + a.idx * 0.9;
    switch (a.motion) {
      case "float":
      case "sail":
        oy = Math.sin(ph * 2.0) * 0.14;
        rz = Math.sin(ph * 1.5) * 0.04;
        break;
      case "swim":
      case "glide":
        ox = Math.sin(ph * 1.7) * 0.26;
        oy = Math.cos(ph * 2.2) * 0.08;
        break;
      case "fly":
      case "flutter":
        ox = Math.sin(ph * 2.2) * 0.24;
        oy = Math.sin(ph * 3.1) * 0.18;
        rz = Math.cos(ph * 2.2) * 0.07;
        break;
      case "hop":
        oy = Math.abs(Math.sin(ph * 3.1)) * 0.22;
        break;
      case "sway":
        rz = Math.sin(ph * 2.0) * 0.065;
        break;
      case "drift":
        ox = Math.sin(ph * 1.1) * 0.34;
        break;
      case "rise":
        oy = Math.sin(ph * 1.7) * 0.17;
        break;
      case "fall":
        oy = -Math.abs(Math.sin(ph * 1.6)) * 0.18;
        break;
      case "pulse":
      case "glow":
      case "grow": {
        const s = 1 + Math.sin(ph * 2.2) * 0.045;
        a.mesh.scale.set(baseH * ratio * s, baseH * s, 1);
        break;
      }
      default:
        oy = Math.sin(ph * 1.4) * 0.04;
    }
    a.mesh.position.set(wp.x + ox, wp.y + oy, a.z);
    a.mesh.rotation.z = rz;
  }
}

export interface ScenicBuildTools {
  glowTex: THREE.Texture;
  loadTex: (path: string, onReady?: (tex: THREE.Texture) => void, critical?: boolean) => THREE.Texture;
  makeImageMesh: (
    path: string,
    targetH: number,
    z: number,
    opts?: { critical?: boolean; opacity?: number },
  ) => { mesh: THREE.Mesh; geo: THREE.PlaneGeometry; mat: THREE.MeshBasicMaterial; tex: THREE.Texture };
  addSkyMood: (time: ScenicTime, localDisp: { dispose: () => void }[], root: THREE.Group) => (aspectNow: number) => void;
}

export interface ScenicWorldInstance {
  root: THREE.Group;
  update: (
    elapsed: number,
    animDt: number,
    poseEase: number,
    aspect: number,
  ) => { camX?: number; camY?: number; camZ?: number };
  dispose: () => void;
}

export function mountScenicCanvas<S extends { paused: boolean; reduced: boolean }>(
  canvas: HTMLCanvasElement,
  initialState: S,
  hooks: {
    onAvailable: (ready: boolean) => void;
    ensureWorld: (tools: ScenicBuildTools, state: S) => ScenicWorldInstance;
  },
) {
  let state = initialState;
  const host = canvas.parentElement;
  let renderer: THREE.WebGLRenderer;
  try {
    if (typeof WebGL2RenderingContext === "undefined") {
      throw new Error("WebGL2 unavailable");
    }
    const gl = canvas.getContext("webgl2", {
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
    if (!gl) throw new Error("No WebGL2 context");
    renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl,
      alpha: true,
      antialias: true,
    });
  } catch {
    hooks.onAvailable(false);
    return { updateState: () => {}, dispose: () => {} };
  }

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const world = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(SCENIC_FOV_DEG, 16 / 9, 0.1, 100);
  camera.position.set(0, 0, SCENIC_BASE_CAM_Z);

  const loader = new THREE.TextureLoader();
  const textures = new Map<string, THREE.Texture>();
  const disposables: { dispose: () => void }[] = [];
  const glowTex = makeGlowTexture();
  disposables.push(glowTex);

  let stillAlive = true;
  const handoff = new StageHandoff((visible) => {
    canvas.style.visibility = visible ? "visible" : "hidden";
    hooks.onAvailable(visible);
  });
  let offscreen = false;
  let frame = 0;
  let prevTime = 0;
  let elapsed = 0;
  let width = 1;
  let height = 1;
  let aspect = 16 / 9;
  let pixelRatio = 1;
  let currentWorld: ScenicWorldInstance | null = null;
  const pointer = { x: 0, y: 0 };

  function schedule() {
    if (stillAlive && !handoff.failed && !offscreen && !document.hidden && !frame) {
      frame = requestAnimationFrame(draw);
    }
  }

  function fail() {
    if (!stillAlive || handoff.failed) return;
    cancelAnimationFrame(frame);
    frame = 0;
    handoff.fail();
  }

  function loadTex(
    path: string,
    onReady?: (tex: THREE.Texture) => void,
    isCritical = false,
  ): THREE.Texture {
    const existing = textures.get(path);
    if (existing) {
      if (isCritical) handoff.useBackground(existing);
      if (existing.image) {
        onReady?.(existing);
      }
      return existing;
    }
    const tex = loader.load(
      "./" + path,
      (loaded) => {
        if (!stillAlive || handoff.failed) return;
        loaded.colorSpace = THREE.SRGBColorSpace;
        loaded.wrapS = THREE.ClampToEdgeWrapping;
        loaded.wrapT = THREE.ClampToEdgeWrapping;
        onReady?.(loaded);
        schedule();
      },
      undefined,
      () => {
        if (isCritical && handoff.uses(tex)) fail();
      },
    );
    if (isCritical) handoff.useBackground(tex);
    tex.colorSpace = THREE.SRGBColorSpace;
    textures.set(path, tex);
    disposables.push(tex);
    return tex;
  }

  function makeImageMesh(
    path: string,
    targetH: number,
    z: number,
    opts?: { critical?: boolean; opacity?: number },
  ) {
    const geo = new THREE.PlaneGeometry(1, 1);
    let mesh: THREE.Mesh | null = null;
    const tex = loadTex(
      path,
      (loaded) => {
        const img = loaded.image as HTMLImageElement | undefined;
        if (mesh && img?.naturalWidth && img?.naturalHeight) {
          mesh.scale.set(
            targetH * (img.naturalWidth / img.naturalHeight),
            targetH,
            1,
          );
        }
      },
      opts?.critical,
    );
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      opacity: opts?.opacity ?? 1,
      depthWrite: false,
    });
    mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = z;
    const img = tex.image as HTMLImageElement | undefined;
    if (img?.naturalWidth && img?.naturalHeight) {
      mesh.scale.set(
        targetH * (img.naturalWidth / img.naturalHeight),
        targetH,
        1,
      );
    } else {
      mesh.scale.set(targetH, targetH, 1);
    }
    return { mesh, geo, mat, tex };
  }

  function addSkyMood(
    time: ScenicTime,
    localDisp: { dispose: () => void }[],
    root: THREE.Group,
  ) {
    const palette = moodPalette(time);
    const geo = new THREE.PlaneGeometry(1, 1);
    const mat = createSkyMoodMaterial(palette.top, palette.bottom, palette.opacity);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.z = -8.5;
    localDisp.push(geo, mat);
    root.add(mesh);
    return (aspectNow: number) => {
      const span = worldSpanAtZ(-8.5, aspectNow);
      mesh.scale.set(span.w * 1.4, span.h * 1.4, 1);
    };
  }

  const tools: ScenicBuildTools = {
    glowTex,
    loadTex,
    makeImageMesh,
    addSkyMood,
  };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return false;
    const nextRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    if (rect.width !== width || rect.height !== height || nextRatio !== pixelRatio) {
      width = rect.width;
      height = rect.height;
      aspect = width / height;
      pixelRatio = nextRatio;
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
    }
    return true;
  }

  function draw(now: number) {
    frame = 0;
    if (!stillAlive || handoff.failed || offscreen || document.hidden || !resize()) return;
    try {
      const nextWorld = hooks.ensureWorld(tools, state);
      if (nextWorld !== currentWorld) {
        if (currentWorld) {
          world.remove(currentWorld.root);
          currentWorld.dispose();
        }
        currentWorld = nextWorld;
        world.add(currentWorld.root);
      }
      const dt = prevTime ? Math.min((now - prevTime) / 1000, 0.06) : 1 / 60;
      prevTime = now;
      const activeMotion = !state.paused && !state.reduced;
      if (activeMotion) elapsed += dt;
      const animDt = activeMotion ? dt : 0;
      const poseEase = state.reduced || !activeMotion ? 1 : Math.min(1, dt * 4.5);

      const cam = currentWorld.update(elapsed, animDt, poseEase, aspect);
      const px = activeMotion ? pointer.x * 0.36 : 0;
      const py = activeMotion ? pointer.y * 0.2 : 0;
      const ease = state.reduced || !activeMotion ? 1 : -Math.expm1(-dt * 4.5);
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, (cam.camX ?? 0) + px, ease);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, (cam.camY ?? 0) + py, ease);
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, cam.camZ ?? SCENIC_BASE_CAM_Z, ease);
      camera.lookAt((cam.camX ?? 0) * 0.35, (cam.camY ?? 0) * 0.35, 0);

      renderer.render(world, camera);
      handoff.afterRender(renderer.getContext());
      if (activeMotion) schedule();
    } catch {
      fail();
    }
  }

  function onPointerMove(ev: PointerEvent) {
    if (!host) return;
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointer.x = ((ev.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = -((ev.clientY - rect.top) / rect.height - 0.5) * 2;
  }

  function onVisibility() {
    if (document.hidden) {
      cancelAnimationFrame(frame);
      frame = 0;
      prevTime = 0;
    } else {
      schedule();
    }
  }

  function onLost(ev: Event) {
    ev.preventDefault();
    fail();
  }

  const onAutoState = (ev: Event) => {
    const skipped = Boolean((ev as Event & { skipped?: boolean }).skipped);
    offscreen = skipped;
    if (skipped) {
      cancelAnimationFrame(frame);
      frame = 0;
      prevTime = 0;
    } else {
      schedule();
    }
  };

  let io: IntersectionObserver | null = null;
  if (host) {
    if ("contentVisibility" in document.documentElement.style) {
      host.addEventListener("contentvisibilityautostatechange", onAutoState);
    } else if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting);
          offscreen = !visible;
          if (offscreen) {
            cancelAnimationFrame(frame);
            frame = 0;
            prevTime = 0;
          } else {
            schedule();
          }
        },
        { rootMargin: "200px" },
      );
      io.observe(host);
    }
    host.addEventListener("pointermove", onPointerMove, { passive: true });
  }

  const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
  ro?.observe(host ?? canvas);
  canvas.addEventListener("webglcontextlost", onLost);
  window.addEventListener("resize", schedule);
  document.addEventListener("visibilitychange", onVisibility);

  schedule();

  return {
    updateState(next: S) {
      state = next;
      schedule();
    },
    dispose() {
      stillAlive = false;
      cancelAnimationFrame(frame);
      ro?.disconnect();
      io?.disconnect();
      host?.removeEventListener("contentvisibilityautostatechange", onAutoState);
      host?.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("webglcontextlost", onLost);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", onVisibility);
      if (currentWorld) {
        world.remove(currentWorld.root);
        currentWorld.dispose();
        currentWorld = null;
      }
      disposables.forEach((d) => d.dispose());
      textures.clear();
      renderer.dispose();
      queueMicrotask(() => {
        if (!canvas.isConnected && !renderer.getContext().isContextLost()) {
          renderer.forceContextLoss();
        }
      });
    },
  };
}
