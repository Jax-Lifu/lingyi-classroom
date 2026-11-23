import { useEffect, useRef, type ReactElement } from "react";
import * as THREE from "three";
import {
  pinyinBackdropUrls,
  type PinyinScene,
} from "@lingyi-classroom/content/pinyin-scenes";
import {
  createScenicParticleField,
  createScenicTapBurst,
  mountScenicCanvas,
  percentToWorld,
  sizeCoverBackdrop,
  updateScenicSpriteLayers,
  type ScenicBuildTools,
  type ScenicSpriteLayer,
  type ScenicTapSignal,
  type ScenicWorldInstance,
} from "./scenicStage3D";

export interface PinyinStage3DProps {
  itemId: string;
  scene: PinyinScene;
  mode: "explore" | "tone" | "quiz";
  activeTone: 1 | 2 | 3 | 4;
  toneFlightSeq: number;
  celebrateSeq: number;
  conceal: boolean;
  paused: boolean;
  reduced: boolean;
  tapSignal: ScenicTapSignal | null;
  onAvailable: (ready: boolean) => void;
}

const TONE_CURVES: Readonly<Record<1 | 2 | 3 | 4, readonly number[]>> = {
  1: [30, 30, 30, 30],
  2: [60, 48, 36, 24],
  3: [44, 65, 58, 28],
  4: [24, 38, 54, 68],
};

function sampleToneY(tone: 1 | 2 | 3 | 4, u: number) {
  const pts = TONE_CURVES[tone];
  const scaled = Math.max(0, Math.min(1, u)) * (pts.length - 1);
  const idx = Math.min(pts.length - 2, Math.floor(scaled));
  const frac = scaled - idx;
  return pts[idx] + (pts[idx + 1] - pts[idx]) * frac;
}

export function PinyinStage3D(props: PinyinStage3DProps): ReactElement | null {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const controllerRef = useRef<ReturnType<typeof mountScenicCanvas> | null>(null);
  const latestRef = useRef(props);
  latestRef.current = props;

  useEffect(() => {
    controllerRef.current?.updateState(props);
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let builtKey = "";
    let cachedWorld: ScenicWorldInstance | null = null;
    let lastTapSeq = latestRef.current.tapSignal?.seq ?? 0;
    let lastFlightSeq = latestRef.current.toneFlightSeq;
    let lastCelebrateSeq = latestRef.current.celebrateSeq;

    function buildWorld(tools: ScenicBuildTools, st: PinyinStage3DProps): ScenicWorldInstance {
      const key = `${st.itemId}|${st.scene.layers.length}`;
      if (cachedWorld && key === builtKey) return cachedWorld;
      builtKey = key;

      const root = new THREE.Group();
      const localDisp: { dispose: () => void }[] = [];

      const bg = tools.makeImageMesh(pinyinBackdropUrls[st.scene.backdrop], 21, -10, {
        critical: true,
      });
      localDisp.push(bg.geo, bg.mat);
      root.add(bg.mesh);

      const updateSky = tools.addSkyMood(st.scene.time, localDisp, root);
      const particles = createScenicParticleField(
        st.scene.atmosphere,
        tools.glowTex,
        localDisp,
        root,
      );
      const burst = createScenicTapBurst(tools.glowTex, localDisp, root);

      const spriteLayers: ScenicSpriteLayer[] = st.scene.layers.map(
        ([pic, x, y, height, motion = "float", dx = 0, dy = 0], idx) => {
          const item = tools.makeImageMesh(pic, 2.2, 0.2 + idx * 0.35);
          localDisp.push(item.geo, item.mat);
          root.add(item.mesh);
          return {
            mesh: item.mesh,
            tex: item.tex,
            x,
            y,
            heightPct: height,
            motion,
            dx,
            dy,
            z: 0.2 + idx * 0.35,
            idx,
          };
        },
      );

      // Tone flight trail beads & songbird
      const trailGroup = new THREE.Group();
      const trailBeads: THREE.Sprite[] = [];
      for (let i = 0; i < 13; i++) {
        const sMat = new THREE.SpriteMaterial({
          map: tools.glowTex,
          color: 0xfff3ba,
          transparent: true,
          opacity: 0.85,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const sprite = new THREE.Sprite(sMat);
        localDisp.push(sMat);
        trailGroup.add(sprite);
        trailBeads.push(sprite);
      }
      root.add(trailGroup);

      const songbird = tools.makeImageMesh("art/play/bird.webp", 2.2, 2.4);
      localDisp.push(songbird.geo, songbird.mat);
      root.add(songbird.mesh);

      let flightProgress = 1;

      cachedWorld = {
        root,
        update(elapsed, animDt, _poseEase, aspect) {
          const cur = latestRef.current;
          sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspect);
          updateSky(aspect);
          particles?.update(elapsed);

          const isTone = cur.mode === "tone";
          const isQuiz = cur.mode === "quiz";
          for (const layer of spriteLayers) {
            layer.mesh.visible = !cur.conceal;
            (layer.mesh.material as THREE.MeshBasicMaterial).opacity = isTone ? 0.45 : 1;
          }
          updateScenicSpriteLayers(spriteLayers, elapsed, aspect, isQuiz);

          trailGroup.visible = isTone;
          songbird.mesh.visible = isTone;

          if (cur.toneFlightSeq !== lastFlightSeq) {
            lastFlightSeq = cur.toneFlightSeq;
            flightProgress = 0;
          }
          if (isTone) {
            if (flightProgress < 1 && animDt > 0) {
              flightProgress = Math.min(1, flightProgress + animDt / 1.15);
            }
            for (let i = 0; i < trailBeads.length; i++) {
              const u = i / (trailBeads.length - 1);
              const wp = percentToWorld(20 + u * 60, sampleToneY(cur.activeTone, u), 1.9, aspect);
              trailBeads[i].position.set(wp.x, wp.y, 1.9);
              const passed = u <= flightProgress;
              trailBeads[i].scale.setScalar(passed ? 0.56 : 0.34);
              (trailBeads[i].material as THREE.SpriteMaterial).opacity = passed ? 0.92 : 0.42;
            }
            const uNow = flightProgress < 1 ? flightProgress : 1;
            const bPos = percentToWorld(
              20 + uNow * 60,
              sampleToneY(cur.activeTone, uNow),
              2.4,
              aspect,
            );
            const hoverY = flightProgress >= 1 ? Math.sin(elapsed * 2.8) * 0.14 : 0;
            const img = songbird.tex.image as HTMLImageElement | undefined;
            const ratio = img?.naturalWidth ? img.naturalWidth / img.naturalHeight : 1;
            const bH = (22 / 100) * bPos.visH;
            songbird.mesh.scale.set(bH * ratio, bH, 1);
            songbird.mesh.position.set(bPos.x, bPos.y + hoverY, 2.4);
            songbird.mesh.rotation.z =
              cur.activeTone === 2
                ? 0.12
                : cur.activeTone === 4
                  ? -0.14
                  : Math.sin(elapsed * 3) * 0.05;
          }

          if (cur.tapSignal && cur.tapSignal.seq !== lastTapSeq) {
            lastTapSeq = cur.tapSignal.seq;
            burst.trigger(cur.tapSignal.x * 100, cur.tapSignal.y * 100, aspect);
          }
          if (cur.celebrateSeq !== lastCelebrateSeq) {
            lastCelebrateSeq = cur.celebrateSeq;
            burst.trigger(50, 48, aspect);
          }
          burst.update(animDt);

          return {
            camX: Math.sin(elapsed * 0.35) * 0.18,
            camY: isTone ? 0.12 : 0,
            camZ: isTone ? 17.6 : 18.0,
          };
        },
        dispose() {
          localDisp.forEach((d) => d.dispose());
        },
      };
      return cachedWorld;
    }

    controllerRef.current = mountScenicCanvas(canvas, latestRef.current, {
      onAvailable: (ready) => latestRef.current.onAvailable(ready),
      ensureWorld: buildWorld,
    });

    return () => {
      controllerRef.current?.dispose();
      controllerRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pinyin-stage-3d"
      style={{ visibility: "hidden" }}
    />
  );
}

export default PinyinStage3D;
