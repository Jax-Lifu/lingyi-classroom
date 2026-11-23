import type { CSSProperties } from "react";
import {
  englishBackdropUrls,
  englishScenes,
  type EnglishLayer,
} from "@lingyi-classroom/content/english-scenes";

function clampCardLayer([pic, x, y, height]: EnglishLayer): {
  pic: string;
  x: number;
  y: number;
  height: number;
} {
  // Keep focal illustrations clearly visible above the bottom gradient title scrim.
  return {
    pic,
    x: Math.max(20, Math.min(82, x)),
    y: Math.max(16, Math.min(48, y * 0.74)),
    height: Math.min(50, Math.max(24, height * 1.1)),
  };
}

/** Static illustrated thumbnail backdrop used on English cards in the child catalog. */
export function EnglishCardBackdrop({
  itemId,
  eager = false,
}: {
  itemId: string;
  eager?: boolean;
}) {
  const scene = englishScenes[itemId];
  if (!scene) return null;
  const bgUrl = englishBackdropUrls[scene.backdrop];
  const visibleLayers = scene.layers.slice(0, 3).map(clampCardLayer);
  return (
    <span
      className={"english-card-scene time-" + scene.time}
      aria-hidden="true"
    >
      <img
        className="english-card-bg"
        src={"./" + bgUrl}
        loading={eager ? undefined : "lazy"}
        decoding="async"
        alt=""
      />
      <span className="english-card-lighting" />
      {scene.swatchColor && (
        <span
          className="english-card-color-wash"
          style={{ "--swatch-color": scene.swatchColor } as CSSProperties}
        />
      )}
      {visibleLayers.map((layer, index) => (
        <img
          key={index}
          className="english-card-prop"
          src={"./" + layer.pic}
          loading={eager ? undefined : "lazy"}
          decoding="async"
          alt=""
          style={{
            left: layer.x + "%",
            top: layer.y + "%",
            height: layer.height + "%",
          }}
        />
      ))}
    </span>
  );
}
