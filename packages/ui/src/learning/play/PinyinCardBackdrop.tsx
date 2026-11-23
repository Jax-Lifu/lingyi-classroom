import {
  pinyinBackdropUrls,
  pinyinScenes,
  type PinyinLayer,
} from "@lingyi-classroom/content/pinyin-scenes";

function clampCardLayer([pic, x, y, height]: PinyinLayer): {
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

/** Static illustrated thumbnail backdrop used on pinyin cards in the child catalog. */
export function PinyinCardBackdrop({
  itemId,
  eager = false,
}: {
  itemId: string;
  eager?: boolean;
}) {
  const scene = pinyinScenes[itemId];
  if (!scene) return null;
  const bgUrl = pinyinBackdropUrls[scene.backdrop];
  const visibleLayers = scene.layers.map(clampCardLayer);
  return (
    <span
      className={"pinyin-card-scene time-" + scene.time}
      aria-hidden="true"
    >
      <img
        className="pinyin-card-bg"
        src={"./" + bgUrl}
        loading={eager ? undefined : "lazy"}
        decoding="async"
        alt=""
      />
      <span className="pinyin-card-lighting" />
      {visibleLayers.map((layer, index) => (
        <img
          key={index}
          className="pinyin-card-prop"
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
