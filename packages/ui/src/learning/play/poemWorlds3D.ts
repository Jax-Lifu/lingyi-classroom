import * as THREE from "three";
import {
  poemBackdropUrls,
  resolvePoemArchetype,
  resolvePoemCast,
  type PoemArchetype,
  type PoemAtmosphere,
  type PoemCastTag,
  type PoemScene,
  type PoemTime,
} from "@lingyi-classroom/content/poem-scenes";
import {
  createFlutterSpriteMaterial,
  createGooseMaterial,
  createMilkyWayMaterial,
  createMoonBeamMaterial,
  createPondWaterMaterial,
  createSkyMoodMaterial,
  createSmokeMaterial,
  createSunRaysMaterial,
  createWaterfallMaterial,
  createWindRibbonMaterial,
} from "./poemShaders3D";
import {
  makeCourtyardWallTexture,
  makeDragonflyTexture,
  makeFarmerTexture,
  makeFishermanTexture,
  makeFrontierTowerTexture,
  makeLanternTexture,
  makeLiBaiTexture,
  makeLotusBudTexture,
  makePavilionTexture,
  makePlumBranchTexture,
  makePoetBowTexture,
  makeRoosterTexture,
  makeScrollFrameTexture,
  makeSwallowKiteTexture,
  makeWaterJarTexture,
  makeWillowCurtainTexture,
  makeWoodenSkiffTexture,
} from "./poemArtSprites";

export const FOV_DEG = 32;
export const BASE_CAM_Z = 18;
export const TAN_HALF_FOV = Math.tan(((FOV_DEG / 2) * Math.PI) / 180);

export function worldSpanAtZ(z: number, aspect: number) {
  const dist = Math.max(2, BASE_CAM_Z - z);
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

export interface PoemTapSignal {
  x: number;
  y: number;
  seq: number;
}

export interface ImageMeshHandle {
  mesh: THREE.Mesh;
  geo: THREE.PlaneGeometry;
  mat: THREE.Material;
  tex: THREE.Texture;
}

export interface WorldBuildContext {
  loadTex: (
    path: string,
    onReady?: (tex: THREE.Texture) => void,
    isCritical?: boolean,
  ) => THREE.Texture;
  makeImageMesh: (
    path: string,
    targetH: number,
    z: number,
    opts?: {
      subdivisions?: number;
      customMat?: THREE.Material;
      critical?: boolean;
      opacity?: number;
    },
  ) => ImageMeshHandle;
  makeSpriteMesh: (
    tex: THREE.Texture,
    targetH: number,
    z: number,
    opts?: {
      subdivisions?: number;
      customMat?: THREE.Material;
      opacity?: number;
    },
  ) => ImageMeshHandle;
  glowTex: THREE.Texture;
  consumeTap: (tap: PoemTapSignal | null) => boolean;
}

export interface BuiltPoemWorld {
  root: THREE.Group;
  update: (
    t: number,
    animDt: number,
    poseEase: number,
    line: number,
    aspectNow: number,
    tap: PoemTapSignal | null,
  ) => { camX: number; camY: number; camZ: number };
  dispose: () => void;
}

interface ParticleSpec {
  count: number;
  color: number;
  size: number;
  opacity: number;
  mode: "fall" | "rain" | "twinkle" | "floatUp" | "breeze" | "shimmer";
}

function particleSpecFor(atm: PoemAtmosphere): ParticleSpec | null {
  switch (atm) {
    case "snow":
      return { count: 95, color: 0xffffff, size: 0.22, opacity: 0.85, mode: "fall" };
    case "petals":
      return { count: 65, color: 0xf8b9c6, size: 0.25, opacity: 0.85, mode: "fall" };
    case "leaves":
      return { count: 55, color: 0xde7a42, size: 0.28, opacity: 0.82, mode: "fall" };
    case "rain":
      return { count: 110, color: 0xd4ecff, size: 0.14, opacity: 0.65, mode: "rain" };
    case "stars":
      return { count: 80, color: 0xfff5c0, size: 0.24, opacity: 0.88, mode: "twinkle" };
    case "fireflies":
      return { count: 50, color: 0xffe27a, size: 0.28, opacity: 0.9, mode: "twinkle" };
    case "sparks":
      return { count: 55, color: 0xffd076, size: 0.24, opacity: 0.88, mode: "floatUp" };
    case "wind":
    case "clouds":
    case "mist":
      return { count: 42, color: 0xf6faf4, size: 0.72, opacity: 0.34, mode: "breeze" };
    case "ripples":
      return { count: 36, color: 0xfffbe0, size: 0.22, opacity: 0.5, mode: "shimmer" };
    default:
      return null;
  }
}

function timeMoodPalette(time: PoemTime): {
  top: string;
  bottom: string;
  opacity: number;
} {
  switch (time) {
    case "dawn":
      return { top: "#ffd99a", bottom: "#f9c5a2", opacity: 0.16 };
    case "dusk":
      return { top: "#d97a4a", bottom: "#f2b872", opacity: 0.2 };
    case "night":
      return { top: "#0c1736", bottom: "#1d315c", opacity: 0.28 };
    case "mist":
      return { top: "#dce9e2", bottom: "#eff5f0", opacity: 0.22 };
    case "snow":
      return { top: "#d7e6f5", bottom: "#eef5fa", opacity: 0.18 };
    default:
      return { top: "#fff9eb", bottom: "#f4f9ef", opacity: 0.06 };
  }
}

function inferLayerZ(pic: string, index: number): number {
  if (/sun|moon|cloud|rain-cloud|star/.test(pic)) return -3.8 + index * 0.2;
  if (/mountain|landscape/.test(pic)) return -2.6 + index * 0.25;
  if (/tree|house|school|bridge|bamboo|windtree/.test(pic)) return -0.8 + index * 0.25;
  if (/boat|lily|pond|wave|bed|window/.test(pic)) return 0.2 + index * 0.25;
  return 1.3 + index * 0.25;
}

function sizeCoverBackdrop(
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

function createParticleField(
  spec: ParticleSpec,
  glowTex: THREE.Texture,
  localDisp: { dispose: () => void }[],
  root: THREE.Group,
) {
  const pos = new Float32Array(spec.count * 3);
  const seeds = Array.from({ length: spec.count }, (_, i) => ({
    x: (((i * 73) % 100) / 100 - 0.5) * 20,
    y: (((i * 37) % 100) / 100 - 0.5) * 11,
    z: -2.8 + ((i * 29) % 100) / 18,
    phase: (i * 0.13) % 1,
    speed: 0.7 + ((i * 19) % 100) / 140,
  }));
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    map: glowTex,
    color: spec.color,
    size: spec.size,
    transparent: true,
    opacity: spec.opacity,
    depthWrite: false,
  });
  const pts = new THREE.Points(geo, mat);
  localDisp.push(geo, mat);
  root.add(pts);

  return {
    mat,
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
        } else if (spec.mode === "floatUp") {
          const prog = (t * 0.18 * sd.speed + sd.phase) % 1;
          py = -5.5 + prog * 11.0;
        } else if (spec.mode === "breeze") {
          const prog = (t * 0.09 * sd.speed + sd.phase) % 1;
          px = -10.5 + prog * 21.0;
        } else if (spec.mode === "twinkle" || spec.mode === "shimmer") {
          py = sd.y + Math.sin(t * 1.5 + i) * 0.18;
        }
        pAttr.setXYZ(i, px, py, sd.z);
      }
      pAttr.needsUpdate = true;
    },
  };
}

function createTapBurst(
  glowTex: THREE.Texture,
  localDisp: { dispose: () => void }[],
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
    size: 0.28,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const burstPts = new THREE.Points(burstGeo, burstMat);
  localDisp.push(burstGeo, burstMat);
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
        burstMat.opacity = burstLife * 0.9;
        const bAttr = burstGeo.getAttribute("position") as THREE.BufferAttribute;
        const prog = 1 - burstLife;
        for (let i = 0; i < burstCount; i++) {
          const ang = (i / burstCount) * Math.PI * 2;
          const rad = prog * (1.2 + (i % 3) * 0.45);
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

// 1. BESPOKE: 《咏鹅》 (Yong E)
function buildYongEWorld(ctx: WorldBuildContext, s: PoemScene): BuiltPoemWorld {
  const root = new THREE.Group();
  const localDisp: { dispose: () => void }[] = [];

  const bg = ctx.makeImageMesh(poemBackdropUrls[s.backdrop], 21, -10, { critical: true });
  localDisp.push(bg.geo, bg.mat);
  root.add(bg.mesh);

  const pondGeo = new THREE.PlaneGeometry(1, 1);
  const pondMat = createPondWaterMaterial();
  const pondMesh = new THREE.Mesh(pondGeo, pondMat);
  pondMesh.position.set(0, -2.5, -1.6);
  localDisp.push(pondGeo, pondMat);
  root.add(pondMesh);

  const child = ctx.makeImageMesh("art/wordbook/child.webp", 3.55, 1.8);
  localDisp.push(child.geo, child.mat);
  root.add(child.mesh);

  const lotusBack = ctx.makeImageMesh("art/play/lily.webp", 1.55, -0.7);
  const lotusFront = ctx.makeImageMesh("art/play/lily.webp", 2.05, 2.3);
  localDisp.push(lotusBack.geo, lotusBack.mat, lotusFront.geo, lotusFront.mat);
  root.add(lotusBack.mesh, lotusFront.mesh);

  const gooseTex = ctx.loadTex("art/play/goose.webp");
  const gooseMat = createGooseMaterial(gooseTex);
  const goose = ctx.makeImageMesh("art/play/goose.webp", 3.7, 0.4, {
    subdivisions: 24,
    customMat: gooseMat,
  });
  localDisp.push(goose.geo, gooseMat);
  root.add(goose.mesh);

  const notes = ctx.makeImageMesh("art/wordbook/painted/music.webp", 1.45, 1.4, {
    opacity: 0,
  });
  localDisp.push(notes.geo, notes.mat);
  root.add(notes.mesh);

  const splashCount = 46;
  const splashPos = new Float32Array(splashCount * 3);
  const splashSeeds = Array.from({ length: splashCount }, (_, i) => ({
    phase: (i * 0.23) % 1,
    vx: -0.6 - ((i * 37) % 100) / 85,
    vy: 0.7 + ((i * 53) % 100) / 90,
  }));
  const splashGeo = new THREE.BufferGeometry();
  splashGeo.setAttribute("position", new THREE.BufferAttribute(splashPos, 3));
  const splashMat = new THREE.PointsMaterial({
    map: ctx.glowTex,
    color: 0xf4fcff,
    size: 0.22,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const splashPts = new THREE.Points(splashGeo, splashMat);
  localDisp.push(splashGeo, splashMat);
  root.add(splashPts);

  let gooseXPct = 56;
  let singLevel = 0;
  let paddleLevel = 0;
  let autoRippleTimer = 0;
  let rippleIdx = 0;
  let tapRippleBoost = 0;

  function emitRipple(uvX: number, uvY: number, strength: number) {
    const arr = pondMat.uniforms.uRipples.value as THREE.Vector4[];
    arr[rippleIdx % 4].set(uvX, uvY, 0, strength);
    rippleIdx++;
  }

  emitRipple(0.55, 0.35, 0.75);

  return {
    root,
    update(t, animDt, poseEase, line, aspectNow, tap) {
      const e = poseEase;
      const targetGooseX = [56, 55, 48, 60][line] ?? 56;
      gooseXPct = THREE.MathUtils.lerp(gooseXPct, targetGooseX, e);

      const isSinging = line === 0 || line === 1 || tapRippleBoost > 0.15 ? 1 : 0;
      const isPaddling = line === 3 ? 1 : 0;
      singLevel = THREE.MathUtils.lerp(
        singLevel,
        line === 1 ? 1.0 : line === 0 ? 0.5 : tapRippleBoost * 0.7,
        e,
      );
      paddleLevel = THREE.MathUtils.lerp(paddleLevel, isPaddling, e);
      tapRippleBoost = Math.max(0, tapRippleBoost - animDt * 1.1);

      sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspectNow);

      const pondSpan = worldSpanAtZ(-1.6, aspectNow);
      pondMesh.scale.set(pondSpan.w * 1.5, pondSpan.h * 0.56, 1);
      pondMesh.position.set(0, -pondSpan.h * 0.22, -1.6);

      const childPos = percentToWorld(18, 64, 1.8, aspectNow);
      const childHop =
        line === 0 || line === 3 ? Math.abs(Math.sin(t * 4.2)) * 0.12 : Math.sin(t * 1.8) * 0.04;
      child.mesh.position.set(childPos.x, childPos.y + childHop, 1.8);
      child.mesh.rotation.z = line === 0 ? -0.06 : line === 3 ? 0.04 : 0;

      const l1 = percentToWorld(29, 71, -0.7, aspectNow);
      lotusBack.mesh.position.set(l1.x, l1.y + Math.sin(t * 1.9) * 0.05, -0.7);
      const l2 = percentToWorld(81, 69, 2.3, aspectNow);
      lotusFront.mesh.position.set(l2.x, l2.y + Math.cos(t * 2.1) * 0.07, 2.3);
      lotusFront.mesh.rotation.z = Math.sin(t * 1.5) * 0.04;

      const gp = percentToWorld(gooseXPct, line === 1 ? 55 : 59, 0.4, aspectNow);
      const bob = Math.sin(t * 2.6) * 0.07;
      goose.mesh.position.set(gp.x, gp.y + bob, 0.4);
      goose.mesh.rotation.z =
        line === 1
          ? 0.09 + Math.sin(t * 3.0) * 0.03
          : line === 3
            ? -0.05 + Math.sin(t * 6.0) * 0.04
            : Math.sin(t * 2.0) * 0.025;
      gooseMat.uniforms.uTime.value = t;
      gooseMat.uniforms.uSing.value = singLevel;
      gooseMat.uniforms.uPaddle.value = paddleLevel;

      const noteMat = notes.mat as THREE.MeshBasicMaterial;
      const noteAlpha = isSinging ? (line === 1 ? 0.96 : 0.72) : 0;
      noteMat.opacity = THREE.MathUtils.lerp(noteMat.opacity, noteAlpha, e);
      notes.mesh.position.set(
        gp.x + 1.55,
        gp.y + 1.2 + Math.sin(t * 3.1) * 0.16,
        1.4,
      );
      notes.mesh.rotation.z = Math.sin(t * 2.4) * 0.12;

      pondMat.uniforms.uTime.value = t;
      pondMat.uniforms.uAspect.value = aspectNow;
      const gooseUvX = 0.5 + (gooseXPct - 50) / 125;
      pondMat.uniforms.uGooseUv.value.set(gooseUvX, 0.46);
      pondMat.uniforms.uReflectGlow.value = THREE.MathUtils.lerp(
        pondMat.uniforms.uReflectGlow.value,
        line === 2 ? 0.95 : 0.42,
        e,
      );

      const ripples = pondMat.uniforms.uRipples.value as THREE.Vector4[];
      for (let i = 0; i < 4; i++) {
        ripples[i].z += animDt;
      }
      autoRippleTimer += animDt;
      const cadence = line === 3 ? 0.48 : 1.05;
      if (autoRippleTimer >= cadence) {
        autoRippleTimer = 0;
        emitRipple(gooseUvX - 0.02, 0.34, line === 3 ? 1.0 : 0.65);
      }

      if (ctx.consumeTap(tap) && tap) {
        tapRippleBoost = 1;
        const pondUvX = 0.5 + (tap.x - 0.5) / 1.25;
        const pondUvY = THREE.MathUtils.clamp((1.0 - tap.y) / 0.56, 0.08, 0.92);
        emitRipple(pondUvX, pondUvY, 1.0);
      }

      splashMat.opacity = THREE.MathUtils.lerp(
        splashMat.opacity,
        line === 3 ? 0.86 : 0.08,
        e,
      );
      const posAttr = splashGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < splashCount; i++) {
        const seed = splashSeeds[i];
        const age = (t * (line === 3 ? 1.35 : 0.5) + seed.phase) % 1;
        const px = gp.x - 0.35 + seed.vx * age * 1.45;
        const py = gp.y - 1.25 + seed.vy * age * 1.15 - age * age * 1.25;
        posAttr.setXYZ(i, px, py, 0.75);
      }
      posAttr.needsUpdate = true;

      const cams = [
        { x: -0.35, y: 0.1, z: 18.0 },
        { x: 0.75, y: 0.78, z: 16.0 },
        { x: -0.1, y: -0.25, z: 17.5 },
        { x: 0.9, y: -0.92, z: 14.9 },
      ];
      const c = cams[line] ?? cams[0];
      return { camX: c.x, camY: c.y, camZ: c.z };
    },
    dispose() {
      localDisp.forEach((d) => d.dispose());
    },
  };
}

// 2. BESPOKE: 《望庐山瀑布》 (Lushan Waterfall)
function buildLushanWorld(ctx: WorldBuildContext, s: PoemScene): BuiltPoemWorld {
  const root = new THREE.Group();
  const localDisp: { dispose: () => void }[] = [];

  const bg = ctx.makeImageMesh(poemBackdropUrls[s.backdrop], 21, -10, { critical: true });
  localDisp.push(bg.geo, bg.mat);
  root.add(bg.mesh);

  const twilightGeo = new THREE.PlaneGeometry(1, 1);
  const twilightMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uOpacity: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        float fade = smoothstep(0.28, 0.92, vUv.y);
        gl_FragColor = vec4(0.09, 0.14, 0.34, fade * uOpacity);
      }
    `,
  });
  const twilightMesh = new THREE.Mesh(twilightGeo, twilightMat);
  twilightMesh.position.z = -8.5;
  localDisp.push(twilightGeo, twilightMat);
  root.add(twilightMesh);

  const sun = ctx.makeImageMesh("art/play/sun.webp", 2.75, -6.8);
  const rayGeo = new THREE.PlaneGeometry(7.2, 7.2);
  const rayMat = createSunRaysMaterial("#ffd97a", 0.55);
  const rayMesh = new THREE.Mesh(rayGeo, rayMat);
  rayMesh.position.z = -7.0;
  localDisp.push(sun.geo, sun.mat, rayGeo, rayMat);
  root.add(rayMesh, sun.mesh);

  const smokeGeo = new THREE.PlaneGeometry(5.6, 6.2);
  const smokeMat = createSmokeMaterial();
  const smokeMesh = new THREE.Mesh(smokeGeo, smokeMat);
  smokeMesh.position.z = -5.0;
  localDisp.push(smokeGeo, smokeMat);
  root.add(smokeMesh);

  const galaxyGeo = new THREE.PlaneGeometry(1, 1);
  const galaxyMat = createMilkyWayMaterial({ opacity: 0 });
  const galaxyMesh = new THREE.Mesh(galaxyGeo, galaxyMat);
  galaxyMesh.position.z = -4.2;
  localDisp.push(galaxyGeo, galaxyMat);
  root.add(galaxyMesh);

  const starCount = 150;
  const starPos = new Float32Array(starCount * 3);
  const starSeeds = Array.from({ length: starCount }, (_, i) => ({
    phase: (i * 0.17) % 1,
    spread: (((i * 47) % 100) / 100 - 0.5) * 1.4,
  }));
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({
    map: ctx.glowTex,
    color: 0xfff4c2,
    size: 0.24,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const starPts = new THREE.Points(starGeo, starMat);
  localDisp.push(starGeo, starMat);
  root.add(starPts);

  const wfGeo = new THREE.PlaneGeometry(2.15, 7.1);
  const wfMat = createWaterfallMaterial();
  const wfMesh = new THREE.Mesh(wfGeo, wfMat);
  wfMesh.position.z = -3.0;
  localDisp.push(wfGeo, wfMat);
  root.add(wfMesh);

  const mistCount = 160;
  const mistPos = new Float32Array(mistCount * 3);
  const mistSeeds = Array.from({ length: mistCount }, (_, i) => ({
    phase: (i * 0.19) % 1,
    rx: (((i * 71) % 100) / 100 - 0.5) * 3.6,
    ry: (((i * 31) % 100) / 100) * 1.4,
  }));
  const mistGeo = new THREE.BufferGeometry();
  mistGeo.setAttribute("position", new THREE.BufferAttribute(mistPos, 3));
  const mistMat = new THREE.PointsMaterial({
    map: ctx.glowTex,
    color: 0xf4fbff,
    size: 0.62,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const mistPts = new THREE.Points(mistGeo, mistMat);
  localDisp.push(mistGeo, mistMat);
  root.add(mistPts);

  const libaiTex = makeLiBaiTexture();
  const libaiGeo = new THREE.PlaneGeometry(1.75, 2.6, 8, 12);
  const libaiMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uMap: { value: libaiTex }, uTime: { value: 0 }, uWalk: { value: 1 } },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uWalk;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float sway = (1.0 - uv.y) * 0.045 * sin(uTime * 2.4 + uv.y * 4.0);
        float sleeve = smoothstep(0.55, 0.85, uv.x) * sin(uTime * 3.1) * 0.03;
        pos.x += sway + sleeve;
        pos.y += abs(sin(uTime * 4.8)) * 0.04 * uWalk;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      varying vec2 vUv;
      void main() {
        vec4 col = texture2D(uMap, vUv);
        if (col.a < 0.02) discard;
        gl_FragColor = col;
      }
    `,
  });
  const libaiMesh = new THREE.Mesh(libaiGeo, libaiMat);
  libaiMesh.position.z = 2.4;
  localDisp.push(libaiTex, libaiGeo, libaiMat);
  root.add(libaiMesh);

  let libaiXPct = 15;
  let libaiYPct = 81;
  let tapBurst = 0;

  return {
    root,
    update(t, animDt, poseEase, line, aspectNow, tap) {
      const e = poseEase;
      if (ctx.consumeTap(tap)) {
        tapBurst = 1;
      }
      tapBurst = Math.max(0, tapBurst - animDt * 0.85);

      sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspectNow);

      const skySpan = worldSpanAtZ(-8.5, aspectNow);
      twilightMesh.scale.set(skySpan.w * 1.5, skySpan.h * 1.5, 1);
      twilightMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        twilightMat.uniforms.uOpacity.value,
        line === 3 ? 0.65 : 0,
        e,
      );

      const sunPos = percentToWorld(23, 21, -6.8, aspectNow);
      sun.mesh.position.set(sunPos.x, sunPos.y, -6.8);
      rayMesh.position.set(sunPos.x, sunPos.y, -7.0);
      const sunMat = sun.mat as THREE.MeshBasicMaterial;
      const targetSun = line === 0 ? 1.0 : line === 3 ? 0.28 : 0.72;
      sunMat.opacity = THREE.MathUtils.lerp(sunMat.opacity, targetSun, e);
      rayMat.uniforms.uTime.value = t;
      rayMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        rayMat.uniforms.uOpacity.value,
        line === 0 ? 0.72 : line === 3 ? 0.12 : 0.4,
        e,
      );

      const smokePos = percentToWorld(31, 23, -5.0, aspectNow);
      smokeMesh.position.set(smokePos.x, smokePos.y, -5.0);
      smokeMat.uniforms.uTime.value = t;
      smokeMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        smokeMat.uniforms.uOpacity.value,
        line === 0 ? 0.92 : line === 3 ? 0.35 : 0.56,
        e,
      );

      const wfPos = percentToWorld(69, 53.5, -3.0, aspectNow);
      wfMesh.position.set(wfPos.x, wfPos.y, -3.0);
      wfMat.uniforms.uTime.value = t;
      const targetWf = ([0.36, 0.96, 1.32, 1.22][line] ?? 0.96) + tapBurst * 0.25;
      wfMat.uniforms.uIntensity.value = THREE.MathUtils.lerp(
        wfMat.uniforms.uIntensity.value,
        targetWf,
        e,
      );
      wfMesh.scale.x = THREE.MathUtils.lerp(
        wfMesh.scale.x,
        [0.58, 1.0, 1.34, 1.18][line] ?? 1.0,
        e,
      );
      wfMat.uniforms.uStarTint.value = THREE.MathUtils.lerp(
        wfMat.uniforms.uStarTint.value,
        line === 3 ? 1 : 0,
        e,
      );

      const poolPos = percentToWorld(69.5, 80.5, -2.2, aspectNow);
      mistMat.opacity = THREE.MathUtils.lerp(
        mistMat.opacity,
        ([0.24, 0.52, 0.78, 0.72][line] ?? 0.52) + tapBurst * 0.25,
        e,
      );
      const mAttr = mistGeo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < mistCount; i++) {
        const seed = mistSeeds[i];
        const age = (t * (line >= 2 ? 0.52 : 0.32) + seed.phase) % 1;
        const spread = 1 + age * (line >= 2 ? 1.4 : 0.8);
        mAttr.setXYZ(
          i,
          poolPos.x + seed.rx * spread,
          poolPos.y - 0.3 + seed.ry * age * (line >= 2 ? 2.1 : 1.3),
          -2.2 + (i % 5) * 0.15,
        );
      }
      mAttr.needsUpdate = true;

      const galSpan = worldSpanAtZ(-4.2, aspectNow);
      galaxyMesh.scale.set(galSpan.w * 0.65, galSpan.h * 0.62, 1);
      galaxyMesh.position.set(galSpan.w * 0.19, galSpan.h * 0.24, -4.2);
      galaxyMat.uniforms.uTime.value = t;
      galaxyMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        galaxyMat.uniforms.uOpacity.value,
        line === 3 ? 0.95 : tapBurst * 0.5,
        e,
      );

      starMat.opacity = THREE.MathUtils.lerp(
        starMat.opacity,
        line === 3 ? 0.95 : tapBurst * 0.6,
        e,
      );
      const sAttr = starGeo.getAttribute("position") as THREE.BufferAttribute;
      const wfTop = percentToWorld(69, 28, -3.4, aspectNow);
      const skyStart = percentToWorld(93, 4, -3.4, aspectNow);
      for (let i = 0; i < starCount; i++) {
        const seed = starSeeds[i];
        const prog = (t * 0.26 + seed.phase) % 1;
        const sx =
          THREE.MathUtils.lerp(skyStart.x, wfTop.x, prog * prog * 0.85 + prog * 0.15) +
          seed.spread * (1 - prog * 0.65);
        const sy = THREE.MathUtils.lerp(
          skyStart.y,
          wfTop.y - 2.6 * Math.max(0, prog - 0.5),
          prog,
        );
        sAttr.setXYZ(i, sx, sy, -3.4);
      }
      sAttr.needsUpdate = true;

      const targetLx = line === 0 ? 15.5 : 37.5;
      const targetLy = line === 0 ? 81.0 : 80.5;
      libaiXPct = THREE.MathUtils.lerp(libaiXPct, targetLx, e * 0.72);
      libaiYPct = THREE.MathUtils.lerp(libaiYPct, targetLy, e * 0.72);
      const lp = percentToWorld(libaiXPct, libaiYPct, 2.4, aspectNow);
      libaiMesh.position.set(lp.x, lp.y, 2.4);
      libaiMat.uniforms.uTime.value = t;
      libaiMat.uniforms.uWalk.value = Math.abs(targetLx - libaiXPct) > 0.8 ? 1 : 0;

      const cams = [
        { x: -1.35, y: 0.28, z: 16.5 },
        { x: 0.35, y: -0.05, z: 18.0 },
        { x: 1.72, y: -0.45, z: 15.2 },
        { x: 0.85, y: 0.85, z: 17.0 },
      ];
      const c = cams[line] ?? cams[0];
      return { camX: c.x, camY: c.y, camZ: c.z };
    },
    dispose() {
      localDisp.forEach((d) => d.dispose());
    },
  };
}

// 3. BESPOKE: 《静夜思》 (Jing Ye Si)
function buildJingYeSiWorld(ctx: WorldBuildContext, s: PoemScene): BuiltPoemWorld {
  const root = new THREE.Group();
  const localDisp: { dispose: () => void }[] = [];

  const bg = ctx.makeImageMesh(poemBackdropUrls[s.backdrop], 21, -10, { critical: true });
  localDisp.push(bg.geo, bg.mat);
  root.add(bg.mesh);

  const moodGeo = new THREE.PlaneGeometry(1, 1);
  const moodMat = createSkyMoodMaterial("#091330", "#172b52", 0.38);
  const moodMesh = new THREE.Mesh(moodGeo, moodMat);
  moodMesh.position.z = -8.6;
  localDisp.push(moodGeo, moodMat);
  root.add(moodMesh);

  const starsGeo = new THREE.PlaneGeometry(1, 1);
  const starsMat = createMilkyWayMaterial({ opacity: 0.72, colorA: "#7fa7eb", colorB: "#fff4ca" });
  const starsMesh = new THREE.Mesh(starsGeo, starsMat);
  starsMesh.position.z = -7.6;
  localDisp.push(starsGeo, starsMat);
  root.add(starsMesh);

  const moonGlowGeo = new THREE.PlaneGeometry(5.6, 5.6);
  const moonGlowMat = createSunRaysMaterial("#e8f0ff", 0.45);
  const moonGlowMesh = new THREE.Mesh(moonGlowGeo, moonGlowMat);
  moonGlowMesh.position.z = -3.8;
  localDisp.push(moonGlowGeo, moonGlowMat);
  root.add(moonGlowMesh);

  const moon = ctx.makeImageMesh("art/play/moon.webp", 2.05, -3.4);
  const beamGeo = new THREE.PlaneGeometry(1, 1);
  const beamMat = createMoonBeamMaterial("#d9eaff", 0.42);
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamMesh.position.z = -3.2;
  const windowFrame = ctx.makeImageMesh("art/wordbook/painted/window.webp", 4.1, -2.0);
  const bed = ctx.makeImageMesh("art/wordbook/painted/bed.webp", 2.6, 0.2);

  // Frost shimmer strip along floor ("疑是地上霜")
  const frostGeo = new THREE.PlaneGeometry(1, 1);
  const frostMat = createPondWaterMaterial({
    baseTint: "#dcecff",
    tintStrength: 0.22,
    reflectColor: "#ffffff",
    shimmerColor: "#e6f2ff",
    flowSpeed: 0.65,
  });
  const frostMesh = new THREE.Mesh(frostGeo, frostMat);
  frostMesh.position.z = -0.8;

  const poetUp = ctx.makeSpriteMesh(makeLiBaiTexture(), 3.45, 1.8);
  const poetBow = ctx.makeSpriteMesh(makePoetBowTexture(), 3.45, 1.85, { opacity: 0 });
  const lantern = ctx.makeSpriteMesh(makeLanternTexture(), 1.9, 2.2, { opacity: 0.3 });

  localDisp.push(
    moon.geo, moon.mat,
    beamGeo, beamMat,
    windowFrame.geo, windowFrame.mat,
    bed.geo, bed.mat,
    frostGeo, frostMat,
    poetUp.tex, poetUp.geo, poetUp.mat,
    poetBow.tex, poetBow.geo, poetBow.mat,
    lantern.tex, lantern.geo, lantern.mat,
  );
  root.add(
    moon.mesh,
    beamMesh,
    windowFrame.mesh,
    frostMesh,
    bed.mesh,
    poetUp.mesh,
    poetBow.mesh,
    lantern.mesh,
  );

  const pt = createParticleField(
    { count: 70, color: 0xf4f8ff, size: 0.2, opacity: 0.72, mode: "twinkle" },
    ctx.glowTex,
    localDisp,
    root,
  );
  const burst = createTapBurst(ctx.glowTex, localDisp, root, 0xdfefff);
  let tapGlow = 0;

  return {
    root,
    update(t, animDt, poseEase, line, aspectNow, tap) {
      const e = poseEase;
      if (ctx.consumeTap(tap) && tap) {
        tapGlow = 1;
        burst.trigger(tap.x * 100, tap.y * 100, aspectNow);
      }
      tapGlow = Math.max(0, tapGlow - animDt * 0.9);
      sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspectNow);

      const moodSpan = worldSpanAtZ(-8.6, aspectNow);
      moodMesh.scale.set(moodSpan.w * 1.5, moodSpan.h * 1.5, 1);

      const starSpan = worldSpanAtZ(-7.6, aspectNow);
      starsMesh.scale.set(starSpan.w * 1.5, starSpan.h * 0.95, 1);
      starsMesh.position.set(0, starSpan.h * 0.14, -7.6);
      starsMat.uniforms.uTime.value = t;

      const mPos = percentToWorld(74, line >= 2 ? 31 : 34, -3.4, aspectNow);
      moon.mesh.position.set(mPos.x, mPos.y, -3.4);
      const mScale = line === 2 ? 1.15 : 1.0;
      moon.mesh.scale.set(2.05 * mScale, 2.05 * mScale, 1);
      moonGlowMesh.position.set(mPos.x, mPos.y, -3.8);
      moonGlowMat.uniforms.uTime.value = t;
      moonGlowMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        moonGlowMat.uniforms.uOpacity.value,
        (line === 2 ? 0.68 : 0.42) + tapGlow * 0.35,
        e,
      );

      const beamSpan = worldSpanAtZ(-3.2, aspectNow);
      beamMesh.scale.set(beamSpan.w * 1.5, beamSpan.h * 1.25, 1);
      beamMat.uniforms.uTime.value = t;
      beamMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        beamMat.uniforms.uOpacity.value,
        line === 0 ? 0.56 : line === 1 ? 0.48 : 0.28,
        e,
      );

      const winPos = percentToWorld(74, 38, -2.0, aspectNow);
      windowFrame.mesh.position.set(winPos.x, winPos.y, -2.0);
      const bedPos = percentToWorld(22, 68, 0.2, aspectNow);
      bed.mesh.position.set(bedPos.x, bedPos.y, 0.2);

      const frSpan = worldSpanAtZ(-0.8, aspectNow);
      frostMesh.scale.set(frSpan.w * 1.5, frSpan.h * 0.34, 1);
      frostMesh.position.set(0, -frSpan.h * 0.33, -0.8);
      frostMat.uniforms.uTime.value = t;
      frostMat.uniforms.uAspect.value = aspectNow;
      frostMat.uniforms.uReflectGlow.value = THREE.MathUtils.lerp(
        frostMat.uniforms.uReflectGlow.value,
        line === 1 ? 0.95 : 0.25,
        e,
      );

      const pPos = percentToWorld(48, 68, 1.8, aspectNow);
      poetUp.mesh.position.set(pPos.x, pPos.y + Math.sin(t * 1.6) * 0.03, 1.8);
      poetBow.mesh.position.set(pPos.x, pPos.y - 0.04, 1.85);
      const isBowing = line >= 3;
      (poetUp.mat as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (poetUp.mat as THREE.MeshBasicMaterial).opacity,
        isBowing ? 0 : 1,
        e,
      );
      (poetBow.mat as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (poetBow.mat as THREE.MeshBasicMaterial).opacity,
        isBowing ? 1 : 0,
        e,
      );

      const lanPos = percentToWorld(14, 29, 2.2, aspectNow);
      lantern.mesh.position.set(lanPos.x, lanPos.y + Math.sin(t * 2.1) * 0.06, 2.2);
      lantern.mesh.rotation.z = Math.sin(t * 1.7) * 0.05;
      (lantern.mat as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (lantern.mat as THREE.MeshBasicMaterial).opacity,
        line === 3 ? 0.98 : 0.32,
        e,
      );

      pt.update(t);
      burst.update(animDt);

      const cams = [
        { x: -0.2, y: 0.1, z: 18.0 },
        { x: 0.4, y: -0.55, z: 16.8 },
        { x: 0.95, y: 0.72, z: 16.0 },
        { x: -0.45, y: -0.2, z: 15.8 },
      ];
      const c = cams[line] ?? cams[0];
      return { camX: c.x, camY: c.y, camZ: c.z };
    },
    dispose() {
      localDisp.forEach((d) => d.dispose());
    },
  };
}

// 4. BESPOKE: 《小池》 (Xiao Chi)
function buildXiaoChiWorld(ctx: WorldBuildContext, s: PoemScene): BuiltPoemWorld {
  const root = new THREE.Group();
  const localDisp: { dispose: () => void }[] = [];

  const bg = ctx.makeImageMesh(poemBackdropUrls[s.backdrop], 21, -10, { critical: true });
  localDisp.push(bg.geo, bg.mat);
  root.add(bg.mesh);

  const pondGeo = new THREE.PlaneGeometry(1, 1);
  const pondMat = createPondWaterMaterial({
    reflectColor: "#fff8db",
    shimmerColor: "#e6faec",
    flowSpeed: 1.5,
  });
  const pondMesh = new THREE.Mesh(pondGeo, pondMat);
  pondMesh.position.z = -1.6;

  const sun = ctx.makeImageMesh("art/play/sun.webp", 2.2, -5.8);
  const rayGeo = new THREE.PlaneGeometry(6.5, 6.5);
  const rayMat = createSunRaysMaterial("#ffdf8e", 0.42);
  const rayMesh = new THREE.Mesh(rayGeo, rayMat);
  rayMesh.position.z = -6.2;

  const willowTex = makeWillowCurtainTexture();
  const willowMat = createFlutterSpriteMaterial(willowTex, 0.055, 0.3);
  const willow = ctx.makeSpriteMesh(willowTex, 3.5, -2.2, {
    subdivisions: 12,
    customMat: willowMat,
  });

  const waterDrop = ctx.makeImageMesh("art/wordbook/painted/water-drop.webp", 1.5, -0.4);
  const lotusLeaf = ctx.makeImageMesh("art/play/lily.webp", 2.45, 0.3);
  const lotusBud = ctx.makeSpriteMesh(makeLotusBudTexture(), 2.95, 1.2);
  const dragonfly = ctx.makeSpriteMesh(makeDragonflyTexture(), 1.55, 1.6);

  localDisp.push(
    pondGeo, pondMat,
    sun.geo, sun.mat,
    rayGeo, rayMat,
    willowTex, willow.geo, willowMat,
    waterDrop.geo, waterDrop.mat,
    lotusLeaf.geo, lotusLeaf.mat,
    lotusBud.tex, lotusBud.geo, lotusBud.mat,
    dragonfly.tex, dragonfly.geo, dragonfly.mat,
  );
  root.add(
    rayMesh,
    sun.mesh,
    willow.mesh,
    pondMesh,
    waterDrop.mesh,
    lotusLeaf.mesh,
    lotusBud.mesh,
    dragonfly.mesh,
  );

  let autoRippleTimer = 0;
  let rippleIdx = 0;
  function emitRipple(uvX: number, uvY: number, strength: number) {
    const arr = pondMat.uniforms.uRipples.value as THREE.Vector4[];
    arr[rippleIdx % 4].set(uvX, uvY, 0, strength);
    rippleIdx++;
  }
  emitRipple(0.27, 0.44, 0.72);
  const burst = createTapBurst(ctx.glowTex, localDisp, root, 0xfff3ba);

  return {
    root,
    update(t, animDt, poseEase, line, aspectNow, tap) {
      const e = poseEase;
      sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspectNow);

      const sunPos = percentToWorld(74, 24, -5.8, aspectNow);
      sun.mesh.position.set(sunPos.x, sunPos.y, -5.8);
      rayMesh.position.set(sunPos.x, sunPos.y, -6.2);
      rayMat.uniforms.uTime.value = t;

      const wPos = percentToWorld(14, 17, -2.2, aspectNow);
      willow.mesh.position.set(wPos.x, wPos.y, -2.2);
      willowMat.uniforms.uTime.value = t;
      willowMat.uniforms.uBoost.value = line === 1 ? 0.7 : 0.1;

      const pondSpan = worldSpanAtZ(-1.6, aspectNow);
      pondMesh.scale.set(pondSpan.w * 1.5, pondSpan.h * 0.58, 1);
      pondMesh.position.set(0, -pondSpan.h * 0.21, -1.6);
      pondMat.uniforms.uTime.value = t;
      pondMat.uniforms.uAspect.value = aspectNow;
      pondMat.uniforms.uGooseUv.value.set(0.54, 0.45);
      const ripples = pondMat.uniforms.uRipples.value as THREE.Vector4[];
      for (let i = 0; i < 4; i++) ripples[i].z += animDt;
      autoRippleTimer += animDt;
      if (autoRippleTimer >= (line === 0 ? 0.65 : 1.15)) {
        autoRippleTimer = 0;
        emitRipple(line === 0 ? 0.27 : 0.54, 0.4, 0.65);
      }

      if (ctx.consumeTap(tap) && tap) {
        const pondUvX = 0.5 + (tap.x - 0.5) / 1.25;
        const pondUvY = THREE.MathUtils.clamp((1.0 - tap.y) / 0.58, 0.08, 0.92);
        emitRipple(pondUvX, pondUvY, 1.0);
        burst.trigger(tap.x * 100, tap.y * 100, aspectNow);
      }

      const dropPos = percentToWorld(27, 62, -0.4, aspectNow);
      waterDrop.mesh.position.set(dropPos.x, dropPos.y + Math.sin(t * 2.5) * 0.1, -0.4);
      (waterDrop.mat as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (waterDrop.mat as THREE.MeshBasicMaterial).opacity,
        line === 0 ? 1 : 0.6,
        e,
      );

      const leafPos = percentToWorld(53, 73, 0.3, aspectNow);
      lotusLeaf.mesh.position.set(leafPos.x, leafPos.y + Math.sin(t * 1.8) * 0.04, 0.3);

      const budYTarget = line >= 2 ? 58 : 66;
      const budPos = percentToWorld(53, budYTarget, 1.2, aspectNow);
      lotusBud.mesh.position.set(
        THREE.MathUtils.lerp(lotusBud.mesh.position.x || budPos.x, budPos.x, e),
        THREE.MathUtils.lerp(lotusBud.mesh.position.y || budPos.y, budPos.y + Math.sin(t * 1.9) * 0.04, e),
        1.2,
      );
      const budScale = line >= 2 ? 1.05 : 0.72;
      lotusBud.mesh.scale.set(
        THREE.MathUtils.lerp(lotusBud.mesh.scale.x, (220 / 280) * 2.95 * budScale, e),
        THREE.MathUtils.lerp(lotusBud.mesh.scale.y, 2.95 * budScale, e),
        1,
      );

      // Dragonfly lands right onto the pointed lotus tip on Verse 3 ("早有蜻蜓立上头")
      const dfTargetX = line >= 3 ? 53 : 74;
      const dfTargetY = line >= 3 ? 39.0 : 29 + Math.sin(t * 3.1) * 3.5;
      const dfPos = percentToWorld(dfTargetX, dfTargetY, 1.6, aspectNow);
      dragonfly.mesh.position.set(
        THREE.MathUtils.lerp(dragonfly.mesh.position.x || dfPos.x, dfPos.x, e * 0.7),
        THREE.MathUtils.lerp(
          dragonfly.mesh.position.y || dfPos.y,
          dfPos.y + (line >= 3 ? Math.sin(t * 4.5) * 0.03 : Math.sin(t * 3.6) * 0.18),
          e * 0.7,
        ),
        1.6,
      );
      dragonfly.mesh.rotation.z = line >= 3 ? Math.sin(t * 6) * 0.04 : -0.14 + Math.sin(t * 2.8) * 0.1;

      burst.update(animDt);

      const cams = [
        { x: -1.1, y: -0.15, z: 17.0 },
        { x: -0.2, y: 0.45, z: 18.0 },
        { x: 0.25, y: -0.25, z: 15.8 },
        { x: 0.35, y: 0.15, z: 14.8 },
      ];
      const c = cams[line] ?? cams[0];
      return { camX: c.x, camY: c.y, camZ: c.z };
    },
    dispose() {
      localDisp.forEach((d) => d.dispose());
    },
  };
}

// 5. BESPOKE: 《江雪》 (Jiang Xue)
function buildJiangXueWorld(ctx: WorldBuildContext, s: PoemScene): BuiltPoemWorld {
  const root = new THREE.Group();
  const localDisp: { dispose: () => void }[] = [];

  const bg = ctx.makeImageMesh(poemBackdropUrls[s.backdrop], 21, -10, { critical: true });
  const moodGeo = new THREE.PlaneGeometry(1, 1);
  const moodMat = createSkyMoodMaterial("#cbdcf0", "#e9f2f9", 0.26);
  const moodMesh = new THREE.Mesh(moodGeo, moodMat);
  moodMesh.position.z = -8.5;

  const mistGeo = new THREE.PlaneGeometry(10, 5.5);
  const mistMat = createSmokeMaterial({
    lowColor: "#c8dae8",
    highColor: "#f3f8fc",
    opacity: 0.55,
    speed: 0.16,
  });
  const mistMesh = new THREE.Mesh(mistGeo, mistMat);
  mistMesh.position.z = -4.2;

  const riverGeo = new THREE.PlaneGeometry(1, 1);
  const riverMat = createPondWaterMaterial({
    baseTint: "#5a7c96",
    tintStrength: 0.25,
    reflectColor: "#e6f2ff",
    shimmerColor: "#eff7ff",
    flowSpeed: 1.2,
  });
  const riverMesh = new THREE.Mesh(riverGeo, riverMat);
  riverMesh.position.z = -1.8;

  const skiff = ctx.makeSpriteMesh(makeWoodenSkiffTexture(), 2.45, 0.8);
  const fisherman = ctx.makeSpriteMesh(makeFishermanTexture(), 2.65, 1.45);
  const bird = ctx.makeImageMesh("art/play/bird.webp", 1.2, -3.5);

  localDisp.push(
    bg.geo, bg.mat,
    moodGeo, moodMat,
    mistGeo, mistMat,
    riverGeo, riverMat,
    skiff.tex, skiff.geo, skiff.mat,
    fisherman.tex, fisherman.geo, fisherman.mat,
    bird.geo, bird.mat,
  );
  root.add(bg.mesh, moodMesh, mistMesh, bird.mesh, riverMesh, skiff.mesh, fisherman.mesh);

  const snow = createParticleField(
    { count: 145, color: 0xffffff, size: 0.24, opacity: 0.9, mode: "fall" },
    ctx.glowTex,
    localDisp,
    root,
  );
  const burst = createTapBurst(ctx.glowTex, localDisp, root, 0xffffff);

  return {
    root,
    update(t, animDt, poseEase, line, aspectNow, tap) {
      const e = poseEase;
      sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspectNow);

      const moodSpan = worldSpanAtZ(-8.5, aspectNow);
      moodMesh.scale.set(moodSpan.w * 1.5, moodSpan.h * 1.5, 1);

      const mistPos = percentToWorld(48, 35, -4.2, aspectNow);
      mistMesh.position.set(mistPos.x, mistPos.y, -4.2);
      mistMat.uniforms.uTime.value = t;

      const birdPos = percentToWorld(line === 0 ? 78 : 114, 18, -3.5, aspectNow);
      bird.mesh.position.set(
        THREE.MathUtils.lerp(bird.mesh.position.x || birdPos.x, birdPos.x, e),
        birdPos.y + Math.sin(t * 4) * 0.08,
        -3.5,
      );
      (bird.mat as THREE.MeshBasicMaterial).opacity = THREE.MathUtils.lerp(
        (bird.mat as THREE.MeshBasicMaterial).opacity,
        line === 0 ? 0.85 : 0,
        e,
      );

      const rSpan = worldSpanAtZ(-1.8, aspectNow);
      riverMesh.scale.set(rSpan.w * 1.5, rSpan.h * 0.5, 1);
      riverMesh.position.set(0, -rSpan.h * 0.25, -1.8);
      riverMat.uniforms.uTime.value = t;
      riverMat.uniforms.uAspect.value = aspectNow;
      riverMat.uniforms.uGooseUv.value.set(0.5, 0.45);

      const bob = Math.sin(t * 1.55) * 0.06;
      const boatPos = percentToWorld(line >= 2 ? 50 : 54, 71, 0.8, aspectNow);
      skiff.mesh.position.set(boatPos.x, boatPos.y + bob, 0.8);
      skiff.mesh.rotation.z = Math.sin(t * 1.3) * 0.028;

      const fPos = percentToWorld(line >= 2 ? 48 : 52, 59, 1.45, aspectNow);
      fisherman.mesh.position.set(fPos.x, fPos.y + bob * 1.05, 1.45);
      fisherman.mesh.rotation.z = Math.sin(t * 1.3) * 0.025;

      if (ctx.consumeTap(tap) && tap) {
        burst.trigger(tap.x * 100, tap.y * 100, aspectNow);
      }

      snow.update(t);
      burst.update(animDt);

      const cams = [
        { x: -0.6, y: 0.7, z: 18.0 },
        { x: 0.2, y: 0.1, z: 17.5 },
        { x: 0.0, y: -0.35, z: 15.8 },
        { x: 0.15, y: -0.5, z: 14.9 },
      ];
      const c = cams[line] ?? cams[0];
      return { camX: c.x, camY: c.y, camZ: c.z };
    },
    dispose() {
      localDisp.forEach((d) => d.dispose());
    },
  };
}

// 6. BESPOKE: 《梅花》 (Mei Hua)
function buildMeiHuaWorld(ctx: WorldBuildContext, s: PoemScene): BuiltPoemWorld {
  const root = new THREE.Group();
  const localDisp: { dispose: () => void }[] = [];

  const bg = ctx.makeImageMesh(poemBackdropUrls[s.backdrop], 21, -10, { critical: true });
  const mistGeo = new THREE.PlaneGeometry(14, 3.8);
  const mistMat = createSmokeMaterial({
    lowColor: "#d9e4ed",
    highColor: "#f7fbff",
    opacity: 0.78,
    speed: 0.14,
  });
  const mistMesh = new THREE.Mesh(mistGeo, mistMat);
  mistMesh.position.z = -2.2;

  const wallTex = makeCourtyardWallTexture();
  const wall = ctx.makeSpriteMesh(wallTex, 4.4, -1.5);

  const branchTex = makePlumBranchTexture();
  const branchMat = createFlutterSpriteMaterial(branchTex, 0.032, 0.5);
  const branch = ctx.makeSpriteMesh(branchTex, 5.8, 1.3, {
    subdivisions: 14,
    customMat: branchMat,
  });

  // Translucent dark-gold aroma waves ("为有暗香来")
  const aromaGeo = new THREE.PlaneGeometry(1, 1);
  const aromaMat = createWindRibbonMaterial("#ffe8f0", 0.42);
  const aromaMesh = new THREE.Mesh(aromaGeo, aromaMat);
  aromaMesh.position.z = 2.0;

  localDisp.push(
    bg.geo, bg.mat,
    mistGeo, mistMat,
    wallTex, wall.geo, wall.mat,
    branchTex, branch.geo, branchMat,
    aromaGeo, aromaMat,
  );
  root.add(bg.mesh, mistMesh, wall.mesh, branch.mesh, aromaMesh);

  const snow = createParticleField(
    { count: 105, color: 0xffffff, size: 0.22, opacity: 0.85, mode: "fall" },
    ctx.glowTex,
    localDisp,
    root,
  );
  const burst = createTapBurst(ctx.glowTex, localDisp, root, 0xffd7e3);

  return {
    root,
    update(t, animDt, poseEase, line, aspectNow, tap) {
      const e = poseEase;
      sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspectNow);

      const mPos = percentToWorld(50, 74, -2.2, aspectNow);
      mistMesh.position.set(mPos.x, mPos.y, -2.2);
      mistMat.uniforms.uTime.value = t;

      const wPos = percentToWorld(23, 76, -1.5, aspectNow);
      wall.mesh.position.set(wPos.x, wPos.y, -1.5);

      const bPos = percentToWorld(38, 50, 1.3, aspectNow);
      branch.mesh.position.set(bPos.x, bPos.y, 1.3);
      branchMat.uniforms.uTime.value = t;
      branchMat.uniforms.uBoost.value = line >= 1 ? 0.5 : 0.15;

      const aSpan = worldSpanAtZ(2.0, aspectNow);
      aromaMesh.scale.set(aSpan.w * 1.4, aSpan.h * 0.45, 1);
      aromaMesh.position.set(0, aSpan.h * 0.05, 2.0);
      aromaMat.uniforms.uTime.value = t;
      aromaMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        aromaMat.uniforms.uOpacity.value,
        line === 3 ? 0.72 : 0.18,
        e,
      );

      if (ctx.consumeTap(tap) && tap) {
        burst.trigger(tap.x * 100, tap.y * 100, aspectNow);
      }

      snow.update(t);
      burst.update(animDt);

      const cams = [
        { x: -0.7, y: 0.15, z: 17.5 },
        { x: 0.1, y: 0.25, z: 16.0 },
        { x: 0.75, y: 0.35, z: 17.0 },
        { x: 0.15, y: -0.05, z: 15.2 },
      ];
      const c = cams[line] ?? cams[0];
      return { camX: c.x, camY: c.y, camZ: c.z };
    },
    dispose() {
      localDisp.forEach((d) => d.dispose());
    },
  };
}

// 7. BESPOKE: 《画鸡》 (Hua Ji)
function buildHuaJiWorld(ctx: WorldBuildContext, s: PoemScene): BuiltPoemWorld {
  const root = new THREE.Group();
  const localDisp: { dispose: () => void }[] = [];

  const bg = ctx.makeImageMesh(poemBackdropUrls[s.backdrop], 21, -10, { critical: true });
  const sun = ctx.makeImageMesh("art/play/sun.webp", 2.6, -5.8);
  const rayGeo = new THREE.PlaneGeometry(7.2, 7.2);
  const rayMat = createSunRaysMaterial("#ffd97a", 0.45);
  const rayMesh = new THREE.Mesh(rayGeo, rayMat);
  rayMesh.position.z = -6.2;

  const house = ctx.makeImageMesh("art/wordbook/painted/house.webp", 4.3, -1.5);
  const rooster = ctx.makeSpriteMesh(makeRoosterTexture(), 4.2, 1.5);
  const notes = ctx.makeImageMesh("art/wordbook/painted/music.webp", 1.75, 2.0, { opacity: 0 });

  localDisp.push(
    bg.geo, bg.mat,
    sun.geo, sun.mat,
    rayGeo, rayMat,
    house.geo, house.mat,
    rooster.tex, rooster.geo, rooster.mat,
    notes.geo, notes.mat,
  );
  root.add(bg.mesh, rayMesh, sun.mesh, house.mesh, rooster.mesh, notes.mesh);

  const burst = createTapBurst(ctx.glowTex, localDisp, root, 0xffe494);
  let crowBoost = 0;

  return {
    root,
    update(t, animDt, poseEase, line, aspectNow, tap) {
      const e = poseEase;
      sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspectNow);

      const sunY = line >= 3 ? 20 : 32;
      const sunPos = percentToWorld(80, sunY, -5.8, aspectNow);
      sun.mesh.position.set(
        sunPos.x,
        THREE.MathUtils.lerp(sun.mesh.position.y || sunPos.y, sunPos.y, e),
        -5.8,
      );
      rayMesh.position.set(sun.mesh.position.x, sun.mesh.position.y, -6.2);
      rayMat.uniforms.uTime.value = t;
      rayMat.uniforms.uOpacity.value = THREE.MathUtils.lerp(
        rayMat.uniforms.uOpacity.value,
        line >= 3 ? 0.72 : 0.35,
        e,
      );

      const hPos = percentToWorld(22, 57, -1.5, aspectNow);
      house.mesh.position.set(hPos.x, hPos.y, -1.5);

      if (ctx.consumeTap(tap) && tap) {
        crowBoost = 1;
        burst.trigger(tap.x * 100, tap.y * 100, aspectNow);
      }
      crowBoost = Math.max(0, crowBoost - animDt * 0.9);

      const strutX = [45, 52, 54, 57][line] ?? 52;
      const rPos = percentToWorld(strutX, 62, 1.5, aspectNow);
      const stride = Math.abs(Math.sin(t * 4.2)) * (line === 1 ? 0.16 : 0.05);
      rooster.mesh.position.set(
        THREE.MathUtils.lerp(rooster.mesh.position.x || rPos.x, rPos.x, e),
        rPos.y + stride,
        1.5,
      );
      rooster.mesh.rotation.z = line === 3 ? -0.07 : Math.sin(t * 3.1) * 0.03;

      const noteMat = notes.mat as THREE.MeshBasicMaterial;
      const singing = line === 3 || crowBoost > 0.15;
      noteMat.opacity = THREE.MathUtils.lerp(noteMat.opacity, singing ? 0.96 : 0, e);
      notes.mesh.position.set(
        rooster.mesh.position.x + 1.55,
        rooster.mesh.position.y + 1.25 + Math.sin(t * 4) * 0.18,
        2.0,
      );

      burst.update(animDt);

      const cams = [
        { x: 0.1, y: 0.55, z: 16.5 },
        { x: 0.0, y: 0.0, z: 17.5 },
        { x: 0.25, y: -0.1, z: 17.8 },
        { x: 0.55, y: 0.25, z: 16.0 },
      ];
      const c = cams[line] ?? cams[0];
      return { camX: c.x, camY: c.y, camZ: c.z };
    },
    dispose() {
      localDisp.forEach((d) => d.dispose());
    },
  };
}

// 8. BESPOKE: 《早发白帝城》 (Zao Fa Bai Di Cheng)
function buildBaiDiChengWorld(ctx: WorldBuildContext, s: PoemScene): BuiltPoemWorld {
  const root = new THREE.Group();
  const localDisp: { dispose: () => void }[] = [];

  const bg = ctx.makeImageMesh(poemBackdropUrls[s.backdrop], 21, -10, { critical: true });
  const dawnClouds = createSmokeMaterial({
    lowColor: "#f09986",
    highColor: "#ffe8bc",
    opacity: 0.72,
    speed: 0.22,
  });
  const cloudGeo = new THREE.PlaneGeometry(8.5, 4.5);
  const cloudMesh = new THREE.Mesh(cloudGeo, dawnClouds);
  cloudMesh.position.z = -5.4;

  const gorgeL = ctx.makeImageMesh("art/play/mountain.webp", 5.8, -3.2);
  const gorgeR = ctx.makeImageMesh("art/play/mountain.webp", 5.8, -2.5);
  const gorgeMistGeo = new THREE.PlaneGeometry(14, 3.6);
  const gorgeMistMat = createSmokeMaterial({
    lowColor: "#b8dcd9",
    highColor: "#eef9f5",
    opacity: 0.72,
    speed: 0.19,
  });
  const gorgeMistMesh = new THREE.Mesh(gorgeMistGeo, gorgeMistMat);
  gorgeMistMesh.position.z = -2.0;

  const riverGeo = new THREE.PlaneGeometry(1, 1);
  const riverMat = createPondWaterMaterial({
    baseTint: "#3e8b82",
    tintStrength: 0.22,
    reflectColor: "#ffdca8",
    shimmerColor: "#ffffff",
    flowSpeed: 3.4,
  });
  const riverMesh = new THREE.Mesh(riverGeo, riverMat);
  riverMesh.position.z = -1.6;

  const windGeo = new THREE.PlaneGeometry(1, 1);
  const windMat = createWindRibbonMaterial("#fff7e2", 0.48);
  const windMesh = new THREE.Mesh(windGeo, windMat);
  windMesh.position.z = 2.0;

  const skiff = ctx.makeSpriteMesh(makeWoodenSkiffTexture(), 2.35, 1.1);
  const poet = ctx.makeSpriteMesh(makeLiBaiTexture(), 2.25, 1.5);

  localDisp.push(
    bg.geo, bg.mat,
    cloudGeo, dawnClouds,
    gorgeL.geo, gorgeL.mat,
    gorgeR.geo, gorgeR.mat,
    gorgeMistGeo, gorgeMistMat,
    riverGeo, riverMat,
    windGeo, windMat,
    skiff.tex, skiff.geo, skiff.mat,
    poet.tex, poet.geo, poet.mat,
  );
  root.add(bg.mesh, cloudMesh, gorgeL.mesh, gorgeR.mesh, gorgeMistMesh, riverMesh, skiff.mesh, poet.mesh, windMesh);

  const burst = createTapBurst(ctx.glowTex, localDisp, root, 0xffe4a8);

  return {
    root,
    update(t, animDt, poseEase, line, aspectNow, tap) {
      const e = poseEase;
      sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspectNow);

      const cPos = percentToWorld(25, 22, -5.4, aspectNow);
      cloudMesh.position.set(cPos.x, cPos.y, -5.4);
      dawnClouds.uniforms.uTime.value = t;

      const shift = [0, -8, -16, -26][line] ?? 0;
      const g1 = percentToWorld(28 + shift * 0.45, 50, -3.2, aspectNow);
      const g2 = percentToWorld(76 + shift * 0.55, 50, -2.5, aspectNow);
      gorgeL.mesh.position.set(THREE.MathUtils.lerp(gorgeL.mesh.position.x || g1.x, g1.x, e), g1.y, -3.2);
      gorgeR.mesh.position.set(THREE.MathUtils.lerp(gorgeR.mesh.position.x || g2.x, g2.x, e), g2.y, -2.5);

      const gmPos = percentToWorld(52, 62, -2.0, aspectNow);
      gorgeMistMesh.position.set(gmPos.x, gmPos.y, -2.0);
      gorgeMistMat.uniforms.uTime.value = t;

      const rSpan = worldSpanAtZ(-1.6, aspectNow);
      riverMesh.scale.set(rSpan.w * 1.5, rSpan.h * 0.52, 1);
      riverMesh.position.set(0, -rSpan.h * 0.24, -1.6);
      riverMat.uniforms.uTime.value = t;
      riverMat.uniforms.uAspect.value = aspectNow;

      const wSpan = worldSpanAtZ(2.0, aspectNow);
      windMesh.scale.set(wSpan.w * 1.45, wSpan.h * 0.48, 1);
      windMesh.position.set(0, -wSpan.h * 0.05, 2.0);
      windMat.uniforms.uTime.value = t;
      windMat.uniforms.uSpeed.value = line >= 3 ? 1.55 : 0.9;

      const boatXPct = [28, 46, 58, 72][line] ?? 46;
      const bp = percentToWorld(boatXPct, 69, 1.1, aspectNow);
      const bob = Math.sin(t * 3.8) * 0.08;
      skiff.mesh.position.set(
        THREE.MathUtils.lerp(skiff.mesh.position.x || bp.x, bp.x, e),
        bp.y + bob,
        1.1,
      );
      skiff.mesh.rotation.z = Math.sin(t * 3.1) * 0.04;
      poet.mesh.position.set(skiff.mesh.position.x - 0.1, skiff.mesh.position.y + 0.95, 1.5);

      if (ctx.consumeTap(tap) && tap) {
        burst.trigger(tap.x * 100, tap.y * 100, aspectNow);
      }
      burst.update(animDt);

      const cams = [
        { x: -1.1, y: 0.45, z: 17.5 },
        { x: -0.1, y: -0.1, z: 16.8 },
        { x: 0.35, y: 0.15, z: 16.5 },
        { x: 1.05, y: -0.25, z: 15.6 },
      ];
      const c = cams[line] ?? cams[0];
      return { camX: c.x, camY: c.y, camZ: c.z };
    },
    dispose() {
      localDisp.forEach((d) => d.dispose());
    },
  };
}

// 9. BESPOKE EXTRA DRAMAS: 春晓, 画, 风, 古朗月行, 悯农, 登鹳雀楼, 池上, 村居
function buildSecondaryBespoke(
  ctx: WorldBuildContext,
  poemId: string,
  s: PoemScene,
  totalLines: number,
): BuiltPoemWorld | null {
  switch (s.drama) {
    case "chun-xiao":
      return buildArchetypeWorld(ctx, poemId, s, totalLines, "spring-blossom", ["pavilion", "willow"]);
    case "hua":
      return buildArchetypeWorld(ctx, poemId, s, totalLines, "mountain-mist", ["scroll"]);
    case "feng":
      return buildArchetypeWorld(ctx, poemId, s, totalLines, "spring-blossom", ["willow"]);
    case "gu-lang-yue-xing":
      return buildArchetypeWorld(ctx, poemId, s, totalLines, "night-moon", ["poet"]);
    case "min-nong":
      return buildArchetypeWorld(ctx, poemId, s, totalLines, "pastoral-child", ["farmer"]);
    case "deng-guan-que-lou":
      return buildArchetypeWorld(ctx, poemId, s, totalLines, "water-voyage", ["pavilion", "poet"]);
    case "chi-shang":
      return buildArchetypeWorld(ctx, poemId, s, totalLines, "water-voyage", ["skiff", "child", "lotus-bud"]);
    case "cun-ju":
      return buildArchetypeWorld(ctx, poemId, s, totalLines, "spring-blossom", ["kite", "willow", "child"]);
    default:
      return null;
  }
}

interface ArchetypeConfig {
  moodTop: string;
  moodBottom: string;
  moodOpacity: number;
  hasWater: boolean;
  waterTint: string;
  waterTintStrength: number;
  waterReflect: string;
  hasMist: boolean;
  mistLow: string;
  mistHigh: string;
  hasSunRays: boolean;
  hasMoonBeam: boolean;
  hasStars: boolean;
  hasWind: boolean;
  windColor: string;
  defaultParticle: PoemAtmosphere;
}

const ARCHETYPE_CONFIGS: Readonly<Record<PoemArchetype, ArchetypeConfig>> = {
  "water-voyage": {
    moodTop: "#d9ecf5",
    moodBottom: "#fff6e5",
    moodOpacity: 0.14,
    hasWater: true,
    waterTint: "#2d7874",
    waterTintStrength: 0.16,
    waterReflect: "#fff2cc",
    hasMist: true,
    mistLow: "#bcd9db",
    mistHigh: "#f5fbfa",
    hasSunRays: true,
    hasMoonBeam: false,
    hasStars: false,
    hasWind: true,
    windColor: "#eefaf7",
    defaultParticle: "ripples",
  },
  "mountain-mist": {
    moodTop: "#cde0d8",
    moodBottom: "#f5f4e6",
    moodOpacity: 0.18,
    hasWater: false,
    waterTint: "#4a7c7a",
    waterTintStrength: 0,
    waterReflect: "#ffffff",
    hasMist: true,
    mistLow: "#9fbdb5",
    mistHigh: "#f7faf4",
    hasSunRays: true,
    hasMoonBeam: false,
    hasStars: false,
    hasWind: false,
    windColor: "#eefaf7",
    defaultParticle: "clouds",
  },
  "night-moon": {
    moodTop: "#091330",
    moodBottom: "#1b2e59",
    moodOpacity: 0.34,
    hasWater: true,
    waterTint: "#1c335e",
    waterTintStrength: 0.14,
    waterReflect: "#eaf3ff",
    hasMist: false,
    mistLow: "#4c628a",
    mistHigh: "#b6c8e8",
    hasSunRays: false,
    hasMoonBeam: true,
    hasStars: true,
    hasWind: false,
    windColor: "#d9e7ff",
    defaultParticle: "stars",
  },
  "spring-blossom": {
    moodTop: "#ffe9ea",
    moodBottom: "#f0fae6",
    moodOpacity: 0.12,
    hasWater: false,
    waterTint: "#4a8e7c",
    waterTintStrength: 0,
    waterReflect: "#fff5e0",
    hasMist: false,
    mistLow: "#e8f2df",
    mistHigh: "#ffffff",
    hasSunRays: true,
    hasMoonBeam: false,
    hasStars: false,
    hasWind: true,
    windColor: "#fff1f4",
    defaultParticle: "petals",
  },
  "winter-plum": {
    moodTop: "#cadbeb",
    moodBottom: "#edf4fa",
    moodOpacity: 0.22,
    hasWater: false,
    waterTint: "#63849c",
    waterTintStrength: 0,
    waterReflect: "#ffffff",
    hasMist: true,
    mistLow: "#c2d4e4",
    mistHigh: "#f6fbff",
    hasSunRays: false,
    hasMoonBeam: false,
    hasStars: false,
    hasWind: true,
    windColor: "#ffeef4",
    defaultParticle: "snow",
  },
  "frontier-epic": {
    moodTop: "#c46a3b",
    moodBottom: "#efc889",
    moodOpacity: 0.22,
    hasWater: false,
    waterTint: "#7a6652",
    waterTintStrength: 0,
    waterReflect: "#ffd98c",
    hasMist: true,
    mistLow: "#c89f72",
    mistHigh: "#f8dfc0",
    hasSunRays: true,
    hasMoonBeam: false,
    hasStars: false,
    hasWind: true,
    windColor: "#fcecd2",
    defaultParticle: "wind",
  },
  "pastoral-child": {
    moodTop: "#fff4d8",
    moodBottom: "#edf7df",
    moodOpacity: 0.12,
    hasWater: false,
    waterTint: "#458875",
    waterTintStrength: 0,
    waterReflect: "#fff5d0",
    hasMist: false,
    mistLow: "#e8f2dc",
    mistHigh: "#ffffff",
    hasSunRays: true,
    hasMoonBeam: false,
    hasStars: false,
    hasWind: true,
    windColor: "#f3fbed",
    defaultParticle: "leaves",
  },
  "ancient-fable": {
    moodTop: "#f7ecd2",
    moodBottom: "#ebe0c2",
    moodOpacity: 0.14,
    hasWater: false,
    waterTint: "#4a8078",
    waterTintStrength: 0,
    waterReflect: "#fff3cc",
    hasMist: true,
    mistLow: "#dccda8",
    mistHigh: "#f9f3e2",
    hasSunRays: true,
    hasMoonBeam: false,
    hasStars: false,
    hasWind: false,
    windColor: "#f7eed6",
    defaultParticle: "sparks",
  },
};

function spawnCastSprite(
  tag: PoemCastTag,
  ctx: WorldBuildContext,
): {
  tag: PoemCastTag;
  item: ImageMeshHandle;
  ownsTex: boolean;
  flutter?: THREE.ShaderMaterial;
  xPct: number;
  yPct: number;
  z: number;
  motion: "bob" | "sway" | "hover" | "idle";
} {
  switch (tag) {
    case "poet": {
      const tex = makeLiBaiTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 3.25, 1.45),
        ownsTex: true,
        xPct: 24,
        yPct: 71,
        z: 1.45,
        motion: "sway",
      };
    }
    case "poet-bow": {
      const tex = makePoetBowTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 3.2, 1.45),
        ownsTex: true,
        xPct: 30,
        yPct: 72,
        z: 1.45,
        motion: "sway",
      };
    }
    case "fisherman": {
      const tex = makeFishermanTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 2.75, 1.35),
        ownsTex: true,
        xPct: 48,
        yPct: 60,
        z: 1.35,
        motion: "bob",
      };
    }
    case "farmer": {
      const tex = makeFarmerTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 3.1, 1.4),
        ownsTex: true,
        xPct: 42,
        yPct: 68,
        z: 1.4,
        motion: "sway",
      };
    }
    case "child": {
      return {
        tag,
        item: ctx.makeImageMesh("art/wordbook/child.webp", 2.95, 1.6),
        ownsTex: false,
        xPct: 24,
        yPct: 71,
        z: 1.6,
        motion: "bob",
      };
    }
    case "pavilion": {
      const tex = makePavilionTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 4.1, -2.1),
        ownsTex: true,
        xPct: 76,
        yPct: 47,
        z: -2.1,
        motion: "idle",
      };
    }
    case "skiff": {
      const tex = makeWoodenSkiffTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 2.35, 0.8),
        ownsTex: true,
        xPct: 54,
        yPct: 72,
        z: 0.8,
        motion: "bob",
      };
    }
    case "lantern": {
      const tex = makeLanternTexture();
      const mat = createFlutterSpriteMaterial(tex, 0.04, 0.9);
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 2.1, 1.9, { subdivisions: 10, customMat: mat }),
        ownsTex: true,
        flutter: mat,
        xPct: 16,
        yPct: 28,
        z: 1.9,
        motion: "sway",
      };
    }
    case "plum": {
      const tex = makePlumBranchTexture();
      const mat = createFlutterSpriteMaterial(tex, 0.032, 0.4);
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 4.3, 1.1, { subdivisions: 12, customMat: mat }),
        ownsTex: true,
        flutter: mat,
        xPct: 28,
        yPct: 42,
        z: 1.1,
        motion: "sway",
      };
    }
    case "willow": {
      const tex = makeWillowCurtainTexture();
      const mat = createFlutterSpriteMaterial(tex, 0.06, 0.1);
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 4.3, 1.75, { subdivisions: 12, customMat: mat }),
        ownsTex: true,
        flutter: mat,
        xPct: 20,
        yPct: 24,
        z: 1.75,
        motion: "sway",
      };
    }
    case "kite": {
      const tex = makeSwallowKiteTexture();
      const mat = createFlutterSpriteMaterial(tex, 0.06, 1.2);
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 2.5, 0.4, { subdivisions: 10, customMat: mat }),
        ownsTex: true,
        flutter: mat,
        xPct: 68,
        yPct: 27,
        z: 0.4,
        motion: "hover",
      };
    }
    case "rooster": {
      const tex = makeRoosterTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 3.5, 1.4),
        ownsTex: true,
        xPct: 48,
        yPct: 65,
        z: 1.4,
        motion: "bob",
      };
    }
    case "dragonfly": {
      const tex = makeDragonflyTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 1.5, 1.6),
        ownsTex: true,
        xPct: 56,
        yPct: 39,
        z: 1.6,
        motion: "hover",
      };
    }
    case "lotus-bud": {
      const tex = makeLotusBudTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 2.75, 1.0),
        ownsTex: true,
        xPct: 64,
        yPct: 64,
        z: 1.0,
        motion: "sway",
      };
    }
    case "frontier": {
      const tex = makeFrontierTowerTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 4.2, -1.8),
        ownsTex: true,
        xPct: 26,
        yPct: 50,
        z: -1.8,
        motion: "idle",
      };
    }
    case "jar": {
      const tex = makeWaterJarTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 2.85, 0.9),
        ownsTex: true,
        xPct: 58,
        yPct: 68,
        z: 0.9,
        motion: "idle",
      };
    }
    case "scroll": {
      const tex = makeScrollFrameTexture();
      return {
        tag,
        item: ctx.makeSpriteMesh(tex, 8.6, 2.2, { opacity: 0.72 }),
        ownsTex: true,
        xPct: 50,
        yPct: 50,
        z: 2.2,
        motion: "idle",
      };
    }
  }
}

// Universal 2.5D Cinema Archetype Engine covering all remaining 111+ poems
function buildArchetypeWorld(
  ctx: WorldBuildContext,
  poemId: string,
  s: PoemScene,
  totalLines: number,
  forcedArchetype?: PoemArchetype,
  forcedCast?: readonly PoemCastTag[],
): BuiltPoemWorld {
  const root = new THREE.Group();
  const localDisp: { dispose: () => void }[] = [];

  const archetype = forcedArchetype ?? resolvePoemArchetype(poemId, s);
  const castTags = forcedCast ?? resolvePoemCast(poemId, s);
  const cfg = ARCHETYPE_CONFIGS[archetype];
  const moodPalette = timeMoodPalette(s.time);

  const bg = ctx.makeImageMesh(poemBackdropUrls[s.backdrop], 21, -10, { critical: true });
  localDisp.push(bg.geo, bg.mat);
  root.add(bg.mesh);

  const moodGeo = new THREE.PlaneGeometry(1, 1);
  const moodMat = createSkyMoodMaterial(
    s.time === "night" || s.time === "dusk" || s.time === "dawn" ? moodPalette.top : cfg.moodTop,
    s.time === "night" || s.time === "dusk" || s.time === "dawn" ? moodPalette.bottom : cfg.moodBottom,
    Math.max(cfg.moodOpacity, moodPalette.opacity),
  );
  const moodMesh = new THREE.Mesh(moodGeo, moodMat);
  moodMesh.position.z = -8.6;
  localDisp.push(moodGeo, moodMat);
  root.add(moodMesh);

  let starsMat: THREE.ShaderMaterial | null = null;
  let starsMesh: THREE.Mesh | null = null;
  if (cfg.hasStars || s.time === "night" || s.atmosphere === "stars") {
    const g = new THREE.PlaneGeometry(1, 1);
    starsMat = createMilkyWayMaterial({ opacity: 0.68 });
    starsMesh = new THREE.Mesh(g, starsMat);
    starsMesh.position.z = -7.6;
    localDisp.push(g, starsMat);
    root.add(starsMesh);
  }

  let rayMat: THREE.ShaderMaterial | null = null;
  let rayMesh: THREE.Mesh | null = null;
  if (cfg.hasMoonBeam || s.time === "night") {
    const g = new THREE.PlaneGeometry(1, 1);
    rayMat = createMoonBeamMaterial("#d4e7ff", 0.34);
    rayMesh = new THREE.Mesh(g, rayMat);
    rayMesh.position.z = -6.4;
    localDisp.push(g, rayMat);
    root.add(rayMesh);
  } else if (cfg.hasSunRays && s.time !== "snow") {
    const g = new THREE.PlaneGeometry(7.0, 7.0);
    rayMat = createSunRaysMaterial(s.time === "dusk" ? "#ffba70" : "#ffdf88", 0.42);
    rayMesh = new THREE.Mesh(g, rayMat);
    rayMesh.position.z = -6.5;
    localDisp.push(g, rayMat);
    root.add(rayMesh);
  }

  let mistMat: THREE.ShaderMaterial | null = null;
  let mistMesh: THREE.Mesh | null = null;
  if (cfg.hasMist || s.time === "mist" || s.atmosphere === "mist" || s.atmosphere === "clouds") {
    const g = new THREE.PlaneGeometry(9.5, 4.8);
    mistMat = createSmokeMaterial({
      lowColor: cfg.mistLow,
      highColor: cfg.mistHigh,
      opacity: 0.48,
      speed: 0.18,
    });
    mistMesh = new THREE.Mesh(g, mistMat);
    mistMesh.position.z = -4.2;
    localDisp.push(g, mistMat);
    root.add(mistMesh);
  }

  let waterMat: THREE.ShaderMaterial | null = null;
  let waterMesh: THREE.Mesh | null = null;
  let autoRippleTimer = 0;
  let rippleIdx = 0;
  const emitRipple = (uvX: number, uvY: number, strength: number) => {
    if (!waterMat) return;
    const arr = waterMat.uniforms.uRipples.value as THREE.Vector4[];
    arr[rippleIdx % 4].set(uvX, uvY, 0, strength);
    rippleIdx++;
  };
  if (cfg.hasWater || s.atmosphere === "ripples") {
    const g = new THREE.PlaneGeometry(1, 1);
    waterMat = createPondWaterMaterial({
      baseTint: cfg.waterTint,
      tintStrength: cfg.waterTintStrength,
      reflectColor: cfg.waterReflect,
      shimmerColor: "#f3faf7",
      flowSpeed: 1.9,
    });
    waterMesh = new THREE.Mesh(g, waterMat);
    waterMesh.position.z = -1.7;
    localDisp.push(g, waterMat);
    root.add(waterMesh);
    emitRipple(0.54, 0.42, 0.72);
  }

  let windMat: THREE.ShaderMaterial | null = null;
  let windMesh: THREE.Mesh | null = null;
  if (cfg.hasWind || s.atmosphere === "wind") {
    const g = new THREE.PlaneGeometry(1, 1);
    windMat = createWindRibbonMaterial(cfg.windColor, 0.42);
    windMesh = new THREE.Mesh(g, windMat);
    windMesh.position.z = 2.0;
    localDisp.push(g, windMat);
    root.add(windMesh);
  }

  // Spawn curated watercolor cast actors
  const castActors = castTags.map((tag) => {
    const sp = spawnCastSprite(tag, ctx);
    if (sp.ownsTex) localDisp.push(sp.item.tex);
    localDisp.push(sp.item.geo, sp.item.mat);
    root.add(sp.item.mesh);
    return sp;
  });

  // Skip raw duplicate icons already covered by higher-craft cast or GLSL layers
  const hasSkiff = castTags.includes("skiff");
  const hasLotus = castTags.includes("lotus-bud");
  const hasDragonfly = castTags.includes("dragonfly");
  const hasPlum = castTags.includes("plum");
  const hasChild = castTags.includes("child");
  const hasRooster = castTags.includes("rooster");
  const filteredLayers = s.layers.filter(([pic]) => {
    if (hasSkiff && /play\/boat\.webp$/.test(pic)) return false;
    if (hasLotus && /play\/lily\.webp$/.test(pic)) return false;
    if (hasDragonfly && /painted\/butterfly\.webp$/.test(pic)) return false;
    if (hasPlum && /painted\/blossom\.webp$/.test(pic)) return false;
    if (hasChild && /wordbook\/child\.webp$/.test(pic)) return false;
    if (hasRooster && /painted\/chick\.webp$/.test(pic)) return false;
    if (rayMesh && !cfg.hasMoonBeam && /play\/sun\.webp$/.test(pic)) return false;
    return true;
  });

  const layerActors = filteredLayers.map(
    ([pic, x, y, heightPct, motion = "idle", beat, dx = 0, dy = 0], idx) => {
      const z = inferLayerZ(pic, idx);
      const { h: visH } = worldSpanAtZ(z, 16 / 9);
      const targetH = (heightPct / 100) * visH;
      const item = ctx.makeImageMesh(pic, targetH, z);
      localDisp.push(item.geo, item.mat);
      root.add(item.mesh);
      return { item, pic, x, y, heightPct, motion, beat, dx, dy, z, idx };
    },
  );

  const spec = particleSpecFor(s.atmosphere !== "none" ? s.atmosphere : cfg.defaultParticle);
  const ptField = spec ? createParticleField(spec, ctx.glowTex, localDisp, root) : null;
  const burst = createTapBurst(ctx.glowTex, localDisp, root);

  return {
    root,
    update(t, animDt, poseEase, line, aspectNow, tap) {
      const e = poseEase;
      sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspectNow);

      const moodSpan = worldSpanAtZ(-8.6, aspectNow);
      moodMesh.scale.set(moodSpan.w * 1.5, moodSpan.h * 1.5, 1);

      if (starsMesh && starsMat) {
        const starSpan = worldSpanAtZ(-7.6, aspectNow);
        starsMesh.scale.set(starSpan.w * 1.5, starSpan.h * 0.95, 1);
        starsMesh.position.set(0, starSpan.h * 0.14, -7.6);
        starsMat.uniforms.uTime.value = t;
      }

      if (rayMesh && rayMat) {
        if (cfg.hasMoonBeam || s.time === "night") {
          const bSpan = worldSpanAtZ(-6.4, aspectNow);
          rayMesh.scale.set(bSpan.w * 1.5, bSpan.h * 1.25, 1);
        } else {
          const sunPos = percentToWorld(80, 22, -6.5, aspectNow);
          rayMesh.position.set(sunPos.x, sunPos.y, -6.5);
        }
        rayMat.uniforms.uTime.value = t;
      }

      if (mistMesh && mistMat) {
        const mPos = percentToWorld(46, 38, -4.2, aspectNow);
        mistMesh.position.set(mPos.x + Math.sin(t * 0.25) * 0.5, mPos.y, -4.2);
        mistMat.uniforms.uTime.value = t;
      }

      if (waterMesh && waterMat) {
        const wSpan = worldSpanAtZ(-1.7, aspectNow);
        waterMesh.scale.set(wSpan.w * 1.5, wSpan.h * 0.54, 1);
        waterMesh.position.set(0, -wSpan.h * 0.23, -1.7);
        waterMat.uniforms.uTime.value = t;
        waterMat.uniforms.uAspect.value = aspectNow;
        const ripples = waterMat.uniforms.uRipples.value as THREE.Vector4[];
        for (let i = 0; i < 4; i++) ripples[i].z += animDt;
        autoRippleTimer += animDt;
        if (autoRippleTimer >= 1.15) {
          autoRippleTimer = 0;
          emitRipple(0.54, 0.42, 0.65);
        }
      }

      if (windMesh && windMat) {
        const wiSpan = worldSpanAtZ(2.0, aspectNow);
        windMesh.scale.set(wiSpan.w * 1.45, wiSpan.h * 0.44, 1);
        windMesh.position.set(0, wiSpan.h * 0.04, 2.0);
        windMat.uniforms.uTime.value = t;
      }

      // Position cast actors cleanly with per-verse progression
      const progress = totalLines > 1 ? line / (totalLines - 1) : 0;
      for (const c of castActors) {
        if (c.flutter) {
          c.flutter.uniforms.uTime.value = t;
          c.flutter.uniforms.uBoost.value = line % 2 === 1 ? 0.45 : 0.1;
        }
        const wp = percentToWorld(
          c.xPct + (c.tag === "skiff" ? (progress - 0.3) * 14 : c.tag === "kite" ? progress * 10 : 0),
          c.yPct + (c.tag === "kite" ? -progress * 10 : 0),
          c.z,
          aspectNow,
        );
        let ox = 0;
        let oy = 0;
        let rz = 0;
        if (c.motion === "bob") {
          oy = Math.sin(t * 2.0) * 0.08;
          rz = Math.sin(t * 1.5) * 0.035;
        } else if (c.motion === "hover") {
          ox = Math.sin(t * 2.4) * 0.18;
          oy = Math.cos(t * 3.1) * 0.14;
          rz = Math.sin(t * 2.2) * 0.06;
        } else if (c.motion === "sway") {
          rz = Math.sin(t * 1.7) * 0.035;
        }
        c.item.mesh.position.set(
          THREE.MathUtils.lerp(c.item.mesh.position.x || wp.x, wp.x + ox, e),
          THREE.MathUtils.lerp(c.item.mesh.position.y || wp.y, wp.y + oy, e),
          c.z,
        );
        c.item.mesh.rotation.z = rz;
      }

      // Position curated scene.layers actors
      let focusActor = layerActors[0];
      for (const a of layerActors) {
        const arrived = a.beat === undefined || line >= a.beat;
        const activeBeat = a.beat !== undefined && line === a.beat;
        if (activeBeat) focusActor = a;
        const mat = a.item.mat as THREE.MeshBasicMaterial;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, arrived ? 1 : 0.42, e);

        const wp = percentToWorld(
          a.x + (arrived ? a.dx : 0),
          a.y + (arrived ? a.dy : 0),
          a.z,
          aspectNow,
        );
        const img = a.item.tex.image as HTMLImageElement | undefined;
        const ratio = img?.naturalWidth ? img.naturalWidth / img.naturalHeight : 1;
        const baseH = (a.heightPct / 100) * wp.visH * (activeBeat ? 1.07 : 1);
        a.item.mesh.scale.set(baseH * ratio, baseH, 1);

        let ox = 0;
        let oy = 0;
        let rz = 0;
        const ph = t + a.idx * 0.8;
        if (a.motion === "float" || a.motion === "sail") {
          oy = Math.sin(ph * 2.1) * 0.14;
          rz = Math.sin(ph * 1.6) * 0.045;
        } else if (a.motion === "swim" || a.motion === "glide") {
          ox = Math.sin(ph * 1.7) * 0.25;
          oy = Math.cos(ph * 2.2) * 0.08;
        } else if (a.motion === "fly" || a.motion === "flutter") {
          ox = Math.sin(ph * 2.2) * 0.24;
          oy = Math.sin(ph * 3.1) * 0.18;
          rz = Math.cos(ph * 2.2) * 0.07;
        } else if (a.motion === "hop") {
          oy = Math.abs(Math.sin(ph * 3.2)) * 0.24;
        } else if (a.motion === "sway") {
          rz = Math.sin(ph * 2.0) * 0.07;
        } else if (a.motion === "drift") {
          ox = Math.sin(ph * 1.1) * 0.35;
        } else if (a.motion === "rise") {
          oy = Math.sin(ph * 1.6) * 0.18;
        } else if (a.motion === "fall") {
          oy = -Math.abs(Math.sin(ph * 1.6)) * 0.2;
        }
        a.item.mesh.position.set(wp.x + ox, wp.y + oy, a.z);
        a.item.mesh.rotation.z = rz;
      }

      ptField?.update(t);

      if (ctx.consumeTap(tap) && tap) {
        burst.trigger(tap.x * 100, tap.y * 100, aspectNow);
        if (waterMat) {
          const pondUvX = 0.5 + (tap.x - 0.5) / 1.25;
          const pondUvY = THREE.MathUtils.clamp((1.0 - tap.y) / 0.54, 0.08, 0.92);
          emitRipple(pondUvX, pondUvY, 1.0);
        }
      }
      burst.update(animDt);

      const fx = focusActor ? ((focusActor.x - 50) / 100) * 2.1 : 0;
      const fy = focusActor ? ((50 - focusActor.y) / 100) * 1.05 : 0;
      return {
        camX: fx + Math.sin(progress * Math.PI) * 0.35,
        camY: fy,
        camZ: 17.8 - (line % 2) * 0.65,
      };
    },
    dispose() {
      localDisp.forEach((d) => d.dispose());
    },
  };
}

export function buildPoemWorld3D(
  ctx: WorldBuildContext,
  poemId: string,
  scene: PoemScene,
  totalLines: number,
): BuiltPoemWorld {
  switch (scene.drama) {
    case "yong-e":
      return buildYongEWorld(ctx, scene);
    case "lushan-waterfall":
      return buildLushanWorld(ctx, scene);
    case "jing-ye-si":
      return buildJingYeSiWorld(ctx, scene);
    case "xiao-chi":
      return buildXiaoChiWorld(ctx, scene);
    case "jiang-xue":
      return buildJiangXueWorld(ctx, scene);
    case "mei-hua":
      return buildMeiHuaWorld(ctx, scene);
    case "hua-ji":
      return buildHuaJiWorld(ctx, scene);
    case "zao-fa-bai-di-cheng":
      return buildBaiDiChengWorld(ctx, scene);
    default: {
      const secondary = buildSecondaryBespoke(ctx, poemId, scene, totalLines);
      if (secondary) return secondary;
      return buildArchetypeWorld(ctx, poemId, scene, totalLines);
    }
  }
}
