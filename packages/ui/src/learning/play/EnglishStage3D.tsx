import { useEffect, useRef, type ReactElement } from "react";
import * as THREE from "three";
import {
  englishBackdropUrls,
  type EnglishScene,
} from "@lingyi-classroom/content/english-scenes";
import {
  createScenicParticleField,
  createScenicTapBurst,
  mountScenicCanvas,
  sizeCoverBackdrop,
  updateScenicSpriteLayers,
  worldSpanAtZ,
  type ScenicBuildTools,
  type ScenicSpriteLayer,
  type ScenicTapSignal,
  type ScenicWorldInstance,
} from "./scenicStage3D";

export interface EnglishStage3DProps {
  itemId: string;
  scene: EnglishScene;
  celebrateSeq: number;
  won: boolean;
  conceal: boolean;
  paused: boolean;
  reduced: boolean;
  tapSignal: ScenicTapSignal | null;
  onAvailable: (ready: boolean) => void;
}

export function EnglishStage3D(props: EnglishStage3DProps): ReactElement | null {
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
    let lastCelebrateSeq = latestRef.current.celebrateSeq;

    function buildWorld(tools: ScenicBuildTools, st: EnglishStage3DProps): ScenicWorldInstance {
      const key = `${st.itemId}|${st.scene.layers.length}`;
      if (cachedWorld && key === builtKey) return cachedWorld;
      builtKey = key;

      const root = new THREE.Group();
      const localDisp: { dispose: () => void }[] = [];

      const bg = tools.makeImageMesh(englishBackdropUrls[st.scene.backdrop], 21, -10, {
        critical: true,
      });
      localDisp.push(bg.geo, bg.mat);
      root.add(bg.mesh);

      const updateSky = tools.addSkyMood(st.scene.time, localDisp, root);

      let swatchSprite: THREE.Sprite | null = null;
      if (st.scene.swatchColor) {
        const auraMat = new THREE.SpriteMaterial({
          map: tools.glowTex,
          color: st.scene.swatchColor,
          transparent: true,
          opacity: 0.42,
          depthWrite: false,
        });
        swatchSprite = new THREE.Sprite(auraMat);
        swatchSprite.position.set(0, 0.2, -3.0);
        localDisp.push(auraMat);
        root.add(swatchSprite);
      }

      const particles = createScenicParticleField(
        st.scene.atmosphere,
        tools.glowTex,
        localDisp,
        root,
        st.scene.swatchColor,
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

      cachedWorld = {
        root,
        update(elapsed, animDt, _poseEase, aspect) {
          const cur = latestRef.current;
          sizeCoverBackdrop(bg.mesh, bg.tex, -10, aspect);
          updateSky(aspect);
          particles?.update(elapsed);

          if (swatchSprite) {
            const span = worldSpanAtZ(-3.0, aspect);
            const pulse = 1 + Math.sin(elapsed * 2.1) * 0.08;
            swatchSprite.scale.set(span.w * 0.52 * pulse, span.h * 0.72 * pulse, 1);
          }

          if (swatchSprite) swatchSprite.visible = !cur.conceal;
          for (const layer of spriteLayers) {
            layer.mesh.visible = !cur.conceal;
          }
          updateScenicSpriteLayers(spriteLayers, elapsed, aspect, cur.won);

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
            camX: Math.sin(elapsed * 0.35) * 0.16,
            camY: 0,
            camZ: cur.won ? 17.3 : 18.0,
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
      className="english-stage-3d"
      style={{ visibility: "hidden" }}
    />
  );
}

export default EnglishStage3D;
