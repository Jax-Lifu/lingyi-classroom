import { type ReactElement, useEffect, useRef } from "react";
import * as THREE from "three";
import type { Subject } from "@lingyi-classroom/shared";
import { createPaperActor, makePaperMaterials, projectActorLabel } from "./paperModels";
import type { Focus, PlayActor } from "./types";

interface StageCanvasProps {
  actors: readonly PlayActor[];
  subject: Subject;
  focus: Focus;
  reduced: boolean;
  onAvailable: (available: boolean) => void;
  onProject: (id: string, xPercent: number, yPercent: number, signHeight?: number) => void;
}

type Model = ReturnType<typeof createPaperActor>;
interface Entry {
  actor: PlayActor;
  model: Model;
  identity: string;
  placed: boolean;
  phase: number;
  cooked: number;
  motionTime: number;
  travelTime: number;
  travelHeight: number;
}

const layers: Partial<Record<PlayActor["kind"], number>> = {
  sun: -60,
  moon: -60,
  mountain: -38,
  tree: -12,
  goose: 5,
  dock: -45,
  bear: -23,
  plate: -10,
  grill: -9,
  basket: -4,
  nest: -4,
  lily: -5,
  sign: -3,
  boat: 1,
  bird: 5,
  fish: 5,
  berry: 4,
};
const rawFish = new THREE.Color("#4b9bb6");
const roastedFish = new THREE.Color("#ba7b43");
const defaults = {
  wide: [1, 0, 0],
  work: [1.045, 0, -0.8],
  friend: [1.055, 0, 0.8],
} as const;
const tau = Math.PI * 2;

export function StageCanvas({
  actors,
  subject,
  focus,
  reduced,
  onAvailable,
  onProject,
}: StageCanvasProps): ReactElement | null {
  const node = useRef<HTMLCanvasElement>(null);
  const current = useRef({
    actors,
    subject,
    focus,
    reduced,
    onAvailable,
    onProject,
  });
  const wake = useRef<(() => void) | null>(null);

  useEffect(() => {
    current.current = {
      actors,
      subject,
      focus,
      reduced,
      onAvailable,
      onProject,
    };
    wake.current?.();
  }, [actors, subject, focus, reduced, onAvailable, onProject]);

  useEffect(() => {
    const canvas = node.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      if (typeof WebGL2RenderingContext === "undefined")
        throw new Error("WebGL 2 unavailable");
      const context = canvas.getContext("webgl2", {
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
      if (!context) throw new Error("No WebGL 2 context");
      renderer = new THREE.WebGLRenderer({
        canvas,
        context,
        alpha: true,
        antialias: true,
      });
    } catch {
      current.current.onAvailable(false);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-50, 50, 50, -50, 0.1, 360);
    camera.position.z = 140;
    const hemisphere = new THREE.HemisphereLight(0xfff2df, 0xc2c7ae, 1.55);
    const sun = new THREE.DirectionalLight(0xffdfae, 2.2);
    sun.position.set(-55, 73, 80);
    const fill = new THREE.DirectionalLight(0xc5ded9, 0.58);
    fill.position.set(61, 28, 28);
    scene.add(hemisphere, sun, fill);
    const kit = makePaperMaterials();
    const entries = new Map<string, Entry>();
    const projection = new THREE.Vector3();
    const signTop = new THREE.Vector3();
    const normal = new THREE.Vector3();
    let actorList: readonly PlayActor[] | null = null;
    let subjectKey: Subject | null = null;
    let width = 1,
      height = 1,
      aspect = 1,
      pixelRatio = 1;
    let stillAlive = true,
      failed = false,
      shown = false;
    let frame = 0,
      previousTime = 0,
      elapsed = 0;

    function schedule() {
      if (stillAlive && !failed && !document.hidden && !frame)
        frame = requestAnimationFrame(draw);
    }
    function fail() {
      if (!stillAlive || failed) return;
      failed = true;
      cancelAnimationFrame(frame);
      frame = 0;
      canvas!.style.visibility = "hidden";
      current.current.onAvailable(false);
    }
    function remove(entry: Entry) {
      scene.remove(entry.model.root);
      entry.model.dispose();
    }
    function populate() {
      const next = current.current;
      if (actorList === next.actors && subjectKey === next.subject) return;
      if (subjectKey !== next.subject) {
        entries.forEach(remove);
        entries.clear();
      }
      actorList = next.actors;
      subjectKey = next.subject;
      const remaining = new Set(entries.keys());
      for (const actor of next.actors) {
        remaining.delete(actor.id);
        const identity = [
          actor.kind,
          actor.picture || "",
          actor.kind === "fish" ? "" : actor.tint || "",
          !!actor.faded,
        ].join("|");
        let entry = entries.get(actor.id);
        if (!entry || entry.identity !== identity) {
          const model = createPaperActor(actor, kit, schedule, fail);
          if (entry) {
            model.root.position.copy(entry.model.root.position);
            model.root.scale.copy(entry.model.root.scale);
            remove(entry);
          }
          // Keep phases deterministic across re-renders while neighboring objects move independently.
          const seed = Array.from(actor.id).reduce(
            (hash, c) => (hash * 31 + c.charCodeAt(0)) >>> 0,
            0,
          );
          entry = {
            actor,
            model,
            identity,
            placed: !!entry?.placed,
            phase: (seed % 199) / 31,
            cooked: entry?.cooked || 0,
            motionTime: 0,
            travelTime: 1,
            travelHeight: 0,
          };
          entries.set(actor.id, entry);
          scene.add(model.root);
        }
        const travel = Math.hypot(
          (entry.actor.x - actor.x) * aspect,
          entry.actor.y - actor.y,
        );
        if (
          travel > 2 &&
          (actor.kind === "fish" ||
            actor.kind === "bird" ||
            actor.kind === "berry")
        ) {
          entry.travelTime = 0;
          entry.travelHeight = Math.min(7, travel * 0.25);
        }
        if (entry.actor.motion !== actor.motion) {
          entry.motionTime = 0;
          if (actor.motion === "swim" || actor.motion === "idle")
            entry.cooked = 0;
        }
        entry.actor = actor;
      }
      for (const id of remaining) {
        remove(entries.get(id)!);
        entries.delete(id);
      }
    }
    function resize() {
      const rect = canvas!.getBoundingClientRect();
      if (!rect.width || !rect.height) return false;
      const nextRatio = Math.min(window.devicePixelRatio || 1, 1.75);
      if (
        rect.width !== width ||
        rect.height !== height ||
        nextRatio !== pixelRatio
      ) {
        width = rect.width;
        height = rect.height;
        aspect = width / height;
        pixelRatio = nextRatio;
        camera.left = -50 * aspect;
        camera.right = 50 * aspect;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(pixelRatio);
        renderer.setSize(width, height, false);
      }
      return true;
    }
    function draw(time: number) {
      frame = 0;
      if (!stillAlive || failed || document.hidden || !resize()) return;
      try {
        populate();
        const settings = current.current;
        const dt = previousTime
          ? Math.min((time - previousTime) / 1000, 0.06)
          : 1 / 60;
        previousTime = time;
        if (!settings.reduced) elapsed += dt;
        const easing = settings.reduced ? 1 : -Math.expm1(-dt * 9);
        const [zoom, panX, panY] = defaults[settings.focus];
        const bear = Array.from(entries.values()).find(
          (e) => e.actor.kind === "bear",
        )?.actor;
        const pan =
          settings.focus === "friend" && bear
            ? (bear.x - 50) * aspect * 0.06
            : panX;
        camera.position.x = THREE.MathUtils.lerp(
          camera.position.x,
          pan,
          easing,
        );
        camera.position.y = THREE.MathUtils.lerp(
          camera.position.y,
          panY,
          easing,
        );
        camera.zoom = THREE.MathUtils.lerp(camera.zoom, zoom, easing);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
        for (const entry of entries.values()) {
          const { actor, model } = entry;
          const positionScale = entry.placed ? easing : 1;
          entry.placed = true;
          const motion = actor.motion || "idle";
          const t = elapsed + entry.phase;
          entry.motionTime += dt;
          // Keep neighbouring landing targets separate even in a narrow portrait viewport.
          const widthLimit =
            actor.id.startsWith("nest-") || actor.id.startsWith("tag-")
              ? 0.25
              : actor.id.startsWith("lily-")
                ? 0.26
                : 0.91;
          const targetHeight = Math.min(
            Math.max(0.1, actor.size),
            (100 * aspect * widthLimit) / Math.max(0.25, model.width),
          );
          const destinationX = (actor.x - 50) * aspect,
            destinationY = 50 - actor.y;
          const z = (layers[actor.kind] || 0) + actor.y * 0.035;
          normal.set(destinationX, destinationY, z);
          model.root.position.lerp(normal, positionScale);
          model.root.scale.setScalar(
            THREE.MathUtils.lerp(
              model.root.scale.x,
              targetHeight,
              positionScale,
            ),
          );
          let bob = 0,
            tilt = 0,
            pitch = 0,
            yaw = 0,
            sway = 0;
          if (!settings.reduced) {
            if (motion === "happy") {
              bob =
                Math.abs(Math.sin(((entry.motionTime * 1.75) % 1) * Math.PI)) *
                0.095;
              tilt = Math.sin(entry.motionTime * 9) * 0.045;
            } else if (motion === "swim" || motion === "fly") {
              bob = Math.sin(t * 3.1) * 0.034;
              sway = Math.sin(t * 2.2) * 0.036;
              tilt = Math.cos(t * 2.7) * 0.047;
              yaw = Math.sin(t * 3.7) * 0.16;
            } else if (motion === "shake") {
              tilt =
                Math.sin(t * 17) *
                (0.035 + 0.065 * Math.max(0, Math.sin(t * 2.5)));
            } else if (motion === "float") {
              bob = Math.sin(t * 2.4) * 0.028;
              tilt = Math.sin(t * 2.2) * 0.054;
              pitch = Math.cos(t * 1.9) * 0.035;
            } else if (motion === "glow" || actor.hint) {
              bob = Math.max(0, Math.sin(t * 2.7)) * 0.022;
            } else if (actor.kind === "bird" || actor.kind === "bear") {
              bob = Math.sin(t * 1.9) * 0.009;
            }
          }
          entry.travelTime = settings.reduced
            ? 1
            : Math.min(1, entry.travelTime + dt / 0.52);
          const lift =
            (Math.sin(entry.travelTime * Math.PI) * entry.travelHeight) /
            Math.max(1, targetHeight);
          model.pose.position.set(sway, bob + lift, 0);
          model.pose.rotation.set(pitch, yaw, tilt);
          if (actor.wind !== undefined) {
            const flicker = !settings.reduced && actor.kind === "flame" ? Math.sin(t * 6) * 0.035 : 0;
            model.pose.rotation.z -= actor.wind * 0.42 + flicker;
            model.pose.position.x += actor.wind * 0.12;
            if (actor.kind === "flame") model.pose.scale.y = 1 + Math.abs(actor.wind) * 0.20 + flicker;
          }
          if (model.fin)
            model.fin.rotation.y = settings.reduced
              ? 0
              : Math.sin(t * (motion === "swim" ? 8 : 2)) * 0.3;
          model.wings.forEach((wing) => {
            wing.rotation.z =
              (actor.kind === "goose" ? 0.035 : -0.83) +
              (settings.reduced
                ? 0
                : Math.sin(t * (motion === "fly" ? 11 : 3)) *
                  (motion === "fly" ? 0.32 : 0.045));
          });
          if (model.shellTop) {
            const open =
              motion === "shake" ? Math.min(1, entry.motionTime / 0.68) : 0;
            model.shellTop.position.y = open * 0.13;
            model.shellTop.rotation.z = open * 0.19;
          }
          model.feet.forEach((foot, i) => {
            foot.rotation.z =
              motion === "swim" && !settings.reduced
                ? Math.sin(t * 4 + i * Math.PI) * 0.3
                : 0;
          });
          if (model.crack)
            model.crack.visible = motion === "shake" || motion === "happy";
          if (model.fishSkin) {
            if (motion === "cook")
              entry.cooked = settings.reduced
                ? 1
                : Math.min(1, entry.cooked + dt * 0.67);
            model.fishSkin.color.copy(rawFish).lerp(roastedFish, entry.cooked);
            if (actor.tint && CSS.supports("color", actor.tint))
              model.fishSkin.color.set(actor.tint);
          }
          model.embers.forEach((ember, i) => {
            const cycle = settings.reduced
              ? 0.36
              : (elapsed * 0.64 + i * 0.34) % 1;
            ember.position.y = 0.2 + cycle * 0.32;
            ember.position.x =
              (i - 1) * 0.23 + Math.sin(cycle * Math.PI * 2 + i) * 0.07;
            ember.scale.setScalar((1 - cycle) * 0.047 + 0.008);
          });
          model.sparks.forEach((flame, i) => {
            const shimmer = settings.reduced
              ? 0
              : Math.sin(t * 7 + (i * tau) / 3);
            flame.scale.y = 0.22 + shimmer * 0.055;
            flame.position.y = 0.23 + shimmer * 0.015;
          });
          model.shadow.scale.y = 0.13 * (1 - Math.min(0.25, bob));
          model.shadow.position.x = -sway * 0.28;
        }
        renderer.render(scene, camera);
        const ready =
          entries.size > 0 &&
          !Array.from(entries.values()).some((entry) => entry.model.pending);
        if (ready !== shown) {
          shown = ready;
          canvas!.style.visibility = ready ? "visible" : "hidden";
          settings.onAvailable(ready);
        }
        if (shown) {
          for (const [id, entry] of entries) {
            const signHeight = projectActorLabel(entry.model, camera, height, projection, signTop);
            settings.onProject(
              id,
              (projection.x + 1) * 50,
              (1 - projection.y) * 50,
              signHeight,
            );
          }
        }
        if (!settings.reduced) schedule();
      } catch {
        fail();
      }
    }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        previousTime = 0;
      } else schedule();
    }
    function lost(event: Event) {
      event.preventDefault();
      fail();
    }
    const observer =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(schedule);
    observer?.observe(canvas);
    canvas.addEventListener("webglcontextlost", lost);
    window.addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", visibility);
    wake.current = schedule;
    schedule();
    return () => {
      stillAlive = false;
      wake.current = null;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      window.removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", visibility);
      entries.forEach(remove);
      kit.dispose();
      renderer.dispose();
      // Strict Mode reuses its canvas; an actually detached canvas can release its GPU context.
      queueMicrotask(() => {
        if (!canvas.isConnected && !renderer.getContext().isContextLost())
          renderer.forceContextLoss();
      });
    };
  }, []);

  return (
    <canvas
      ref={node}
      aria-hidden="true"
      className="play-stage-canvas"
      style={{
        position: "absolute",
        inset: 0,
        display: "block",
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        visibility: "hidden",
      }}
    />
  );
}

export default StageCanvas;
