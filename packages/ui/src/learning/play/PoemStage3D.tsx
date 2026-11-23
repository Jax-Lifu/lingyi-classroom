import { StageHandoff } from "./stageHandoff";
import { useEffect, useRef, type ReactElement } from "react";
import * as THREE from "three";
import { type PoemScene } from "@lingyi-classroom/content/poem-scenes";
import { makeGlowTexture } from "./poemArtSprites";
import {
  BASE_CAM_Z,
  FOV_DEG,
  buildPoemWorld3D,
  type BuiltPoemWorld,
  type PoemTapSignal,
  type WorldBuildContext,
} from "./poemWorlds3D";

export interface PoemStage3DProps {
  poemId: string;
  scene: PoemScene;
  activeLine: number;
  lineCount: number;
  paused: boolean;
  reduced: boolean;
  tapSignal: PoemTapSignal | null;
  onAvailable: (ready: boolean) => void;
}

export function PoemStage3D({
  poemId,
  scene: poemScene,
  activeLine,
  lineCount,
  paused,
  reduced,
  tapSignal,
  onAvailable,
}: PoemStage3DProps): ReactElement | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    poemId,
    poemScene,
    activeLine,
    lineCount,
    paused,
    reduced,
    tapSignal,
    onAvailable,
  });
  const wakeRef = useRef<(() => void) | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const lastTapSeqRef = useRef(tapSignal?.seq ?? 0);

  useEffect(() => {
    stateRef.current = {
      poemId,
      poemScene,
      activeLine,
      lineCount,
      paused,
      reduced,
      tapSignal,
      onAvailable,
    };
    wakeRef.current?.();
  }, [poemId, poemScene, activeLine, lineCount, paused, reduced, tapSignal, onAvailable]);

  useEffect(() => {
    lastTapSeqRef.current = stateRef.current.tapSignal?.seq ?? 0;
    const canvas = canvasRef.current;
    if (!canvas) return;
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
      stateRef.current.onAvailable(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const world = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV_DEG, 16 / 9, 0.1, 100);
    camera.position.set(0, 0, BASE_CAM_Z);

    const loader = new THREE.TextureLoader();
    const textures = new Map<string, THREE.Texture>();
    const disposables: { dispose: () => void }[] = [];
    const glowTex = makeGlowTexture();
    disposables.push(glowTex);

    let stillAlive = true;
    const handoff = new StageHandoff((visible) => {
      canvas!.style.visibility = visible ? "visible" : "hidden";
      stateRef.current.onAvailable(visible);
    });
    let offscreen = false;
    let frame = 0;
    let prevTime = 0;
    let elapsed = 0;
    let width = 1;
    let height = 1;
    let aspect = 16 / 9;
    let pixelRatio = 1;
    let sceneVersion = "";
    let currentWorld: BuiltPoemWorld | null = null;

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
      opts?: {
        subdivisions?: number;
        customMat?: THREE.Material;
        critical?: boolean;
        opacity?: number;
      },
    ) {
      const segs = opts?.subdivisions ?? 1;
      const geo = new THREE.PlaneGeometry(1, 1, segs, segs);
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
      const mat =
        opts?.customMat ??
        new THREE.MeshBasicMaterial({
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

    function makeSpriteMesh(
      tex: THREE.Texture,
      targetH: number,
      z: number,
      opts?: { subdivisions?: number; customMat?: THREE.Material; opacity?: number },
    ) {
      const segs = opts?.subdivisions ?? 1;
      const geo = new THREE.PlaneGeometry(1, 1, segs, segs);
      const mat =
        opts?.customMat ??
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          opacity: opts?.opacity ?? 1,
          depthWrite: false,
        });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.z = z;
      const img = tex.image as HTMLCanvasElement | undefined;
      const ratio = img?.width && img?.height ? img.width / img.height : 1;
      mesh.scale.set(targetH * ratio, targetH, 1);
      return { mesh, geo, mat, tex };
    }

    const buildCtx: WorldBuildContext = {
      loadTex,
      makeImageMesh,
      makeSpriteMesh,
      glowTex,
      consumeTap(tap) {
        if (!tap || tap.seq === lastTapSeqRef.current) return false;
        lastTapSeqRef.current = tap.seq;
        return true;
      },
    };

    function ensureWorld(id: string, s: PoemScene, totalLines: number) {
      const key = `${id}|${s.drama ?? ""}|${s.layers.length}`;
      if (key === sceneVersion && currentWorld) return;
      sceneVersion = key;
      if (currentWorld) {
        world.remove(currentWorld.root);
        currentWorld.dispose();
        currentWorld = null;
      }
      currentWorld = buildPoemWorld3D(buildCtx, id, s, totalLines);
      world.add(currentWorld.root);
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
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
        const st = stateRef.current;
        ensureWorld(st.poemId, st.poemScene, st.lineCount);
        const dt = prevTime ? Math.min((now - prevTime) / 1000, 0.06) : 1 / 60;
        prevTime = now;
        const activeMotion = !st.paused && !st.reduced;
        if (activeMotion) elapsed += dt;
        const animDt = activeMotion ? dt : 0;
        const poseEase = st.reduced || !activeMotion ? 1 : Math.min(1, dt * 4.2);

        const targetCam = currentWorld!.update(
          elapsed,
          animDt,
          poseEase,
          st.activeLine,
          aspect,
          st.tapSignal,
        );
        const px = activeMotion ? pointerRef.current.x * 0.42 : 0;
        const py = activeMotion ? pointerRef.current.y * 0.22 : 0;
        const ease = st.reduced || !activeMotion ? 1 : -Math.expm1(-dt * 4.5);
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCam.camX + px, ease);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCam.camY + py, ease);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCam.camZ, ease);
        camera.lookAt(targetCam.camX * 0.35, targetCam.camY * 0.35, 0);

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
      pointerRef.current.x = ((ev.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerRef.current.y = -((ev.clientY - rect.top) / rect.height - 0.5) * 2;
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

    wakeRef.current = schedule;
    schedule();

    return () => {
      stillAlive = false;
      wakeRef.current = null;
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
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="poem-stage-3d"
      style={{ visibility: "hidden" }}
    />
  );
}

export default PoemStage3D;
