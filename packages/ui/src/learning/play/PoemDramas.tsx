import type { CSSProperties } from "react";
import {
  poemBackdropUrls,
  poemScenes,
  type PoemAtmosphere,
  type PoemDramaId,
  type PoemLayer,
} from "@lingyi-classroom/content/poem-scenes";

interface AtmosphereParticle {
  x: number;
  y: number;
  delay: number;
  duration: number;
  scale: number;
  drift: number;
}

const particles: readonly AtmosphereParticle[] = [
  { x: 9, y: 12, delay: 0, duration: 5.2, scale: 0.9, drift: 18 },
  { x: 21, y: 24, delay: 0.9, duration: 6.1, scale: 1.05, drift: -14 },
  { x: 34, y: 14, delay: 1.7, duration: 5.7, scale: 0.8, drift: 22 },
  { x: 47, y: 28, delay: 0.4, duration: 6.4, scale: 1.1, drift: -18 },
  { x: 61, y: 16, delay: 2.1, duration: 5.5, scale: 0.95, drift: 16 },
  { x: 74, y: 22, delay: 1.2, duration: 6.2, scale: 0.85, drift: -20 },
  { x: 86, y: 18, delay: 2.6, duration: 5.8, scale: 1.0, drift: 12 },
  { x: 15, y: 38, delay: 1.9, duration: 6.6, scale: 0.78, drift: 14 },
  { x: 54, y: 36, delay: 2.9, duration: 5.9, scale: 0.92, drift: -15 },
  { x: 82, y: 40, delay: 0.7, duration: 6.3, scale: 0.88, drift: 19 },
];

export function PoemAtmosphereLayer({
  atmosphere,
  paused = false,
}: {
  atmosphere: PoemAtmosphere;
  paused?: boolean;
}) {
  if (atmosphere === "none") return null;
  if (atmosphere === "mist" || atmosphere === "clouds") {
    return (
      <div
        className={
          "poem-atmosphere atm-" + atmosphere + (paused ? " is-paused" : "")
        }
        aria-hidden="true"
      >
        <span className="atm-wisp wisp-a" />
        <span className="atm-wisp wisp-b" />
        <span className="atm-wisp wisp-c" />
      </div>
    );
  }
  if (atmosphere === "ripples") {
    return (
      <div
        className={"poem-atmosphere atm-ripples" + (paused ? " is-paused" : "")}
        aria-hidden="true"
      >
        <span className="atm-shimmer shimmer-a" />
        <span className="atm-shimmer shimmer-b" />
        <span className="atm-shimmer shimmer-c" />
      </div>
    );
  }
  if (atmosphere === "wind") {
    return (
      <div
        className={"poem-atmosphere atm-wind" + (paused ? " is-paused" : "")}
        aria-hidden="true"
      >
        <span className="atm-breeze breeze-a" />
        <span className="atm-breeze breeze-b" />
        <span className="atm-breeze breeze-c" />
      </div>
    );
  }
  return (
    <div
      className={
        "poem-atmosphere atm-" + atmosphere + (paused ? " is-paused" : "")
      }
      aria-hidden="true"
    >
      {particles.map((item, i) => (
        <i
          key={i}
          className="atm-particle"
          style={
            {
              left: item.x + "%",
              top:
                atmosphere === "stars" || atmosphere === "fireflies"
                  ? item.y + (atmosphere === "fireflies" ? 36 : 0) + "%"
                  : "-8%",
              "--p-delay": item.delay + "s",
              "--p-dur": item.duration + "s",
              "--p-scale": String(item.scale),
              "--p-drift": item.drift + "px",
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Small monochrome traditional Chinese brush figure (`山水点景人物`) for classical poet scenes. */
function InkScholar({
  pose = "stand",
  className = "",
}: {
  pose?: "walk" | "stand" | "gaze" | "bow" | "fish" | "hoe";
  className?: string;
}) {
  if (pose === "fish") {
    return (
      <svg
        className={"ink-figure " + className}
        viewBox="0 0 90 90"
        aria-hidden="true"
      >
        <g fill="#22372c">
          <path d="M22 36 Q40 20 58 36 Z" />
          <path d="M29 36 C25 46 23 58 21 67 L49 67 C48 56 46 46 41 36 Z" />
          <circle cx="40" cy="39" r="5" />
        </g>
        <path
          d="M46 46 L78 24 M78 24 L80 82"
          fill="none"
          stroke="#2f4a3c"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (pose === "hoe") {
    return (
      <svg
        className={"ink-figure " + className}
        viewBox="0 0 90 100"
        aria-hidden="true"
      >
        <g fill="#24382c">
          <path d="M26 24 Q42 12 58 24 Z" />
          <circle cx="42" cy="29" r="6" />
          <path d="M36 37 C30 48 28 63 29 74 L43 74 L48 54 L56 44 Z" />
          <path d="M32 74 L27 92 M40 74 L46 92" stroke="#24382c" strokeWidth="4.5" strokeLinecap="round" />
        </g>
        <path
          d="M46 46 L68 78 M62 78 L75 74"
          fill="none"
          stroke="#4b3a29"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  const headTilt = pose === "gaze" ? -16 : pose === "bow" ? 18 : 0;
  return (
    <svg
      className={"ink-figure " + className}
      viewBox="0 0 80 120"
      aria-hidden="true"
    >
      <g fill="#22382c">
        <g transform={`rotate(${headTilt} 40 26)`}>
          <circle cx="40" cy="23" r="7.5" />
          <circle cx="38" cy="14" r="3.4" />
        </g>
        <path d="M32 32 C25 50 22 76 19 102 L51 102 C50 76 48 52 43 32 Z" />
        <path
          d={
            pose === "gaze"
              ? "M41 39 Q56 32 64 25 L60 39 Q49 46 41 48 Z"
              : pose === "walk"
                ? "M38 40 Q26 53 23 64 L31 66 Q38 56 42 46 Z"
                : "M39 40 Q52 50 56 60 L48 63 Q41 53 38 47 Z"
          }
        />
        <path
          d={
            pose === "walk"
              ? "M29 100 L22 114 M43 100 L52 114"
              : "M31 100 L30 113 M42 100 L44 113"
          }
          stroke="#22382c"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}

function ActorPicture({
  src,
  alt = "",
  className = "",
  style,
}: {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <img
      className={"drama-art " + className}
      src={"./" + src}
      alt={alt}
      draggable={false}
      style={style}
    />
  );
}

export function PoemDramaStage({
  drama,
  activeLine,
  playing,
  paused,
  pulse,
  onInteract,
}: {
  drama: PoemDramaId;
  activeLine: number;
  playing: boolean;
  paused: boolean;
  pulse: number;
  onInteract: () => void;
}) {
  const line = Math.max(0, Math.min(3, activeLine));
  const cls = [
    "poem-drama",
    "drama-" + drama,
    "at-line-" + line,
    playing ? "is-playing" : "",
    paused ? "is-paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      data-pulse={pulse % 2}
      onClick={onInteract}
      role="presentation"
    >
      {drama === "yong-e" && (
        <>
          <div className="y-water-shimmer" aria-hidden="true" />
          <div className="y-lotus">
            <ActorPicture src="art/play/lily.webp" />
          </div>
          <div className="y-poet-child">
            <ActorPicture src="art/wordbook/child.webp" />
          </div>
          <div className="y-goose-rig">
            <div className="y-pond-ripples" aria-hidden="true">
              <span className="ripple r1" />
              <span className="ripple r2" />
              <span className="ripple r3" />
            </div>
            <div className="y-paddle-splash" aria-hidden="true">
              <span className="splash s1" />
              <span className="splash s2" />
            </div>
            <div className="y-goose-body">
              <ActorPicture src="art/play/goose.webp" />
            </div>
            <div className="y-sound-arcs" aria-hidden="true">
              <span className="arc a1" />
              <span className="arc a2" />
              <span className="arc a3" />
            </div>
            <div className="y-music-notes" aria-hidden="true">
              <ActorPicture src="art/wordbook/painted/music.webp" />
            </div>
          </div>
        </>
      )}

      {drama === "lushan-waterfall" && (
        <>
          <div className="ls-twilight-veil" aria-hidden="true" />
          <div className="ls-sun">
            <ActorPicture src="art/play/sun.webp" />
            <span className="ls-sun-rays" aria-hidden="true" />
          </div>
          <div className="ls-purple-smoke" aria-hidden="true">
            <span className="smoke sm1" />
            <span className="smoke sm2" />
            <span className="smoke sm3" />
            <span className="smoke sm4" />
          </div>
          <div className="ls-milky-way" aria-hidden="true">
            <span className="galaxy-ribbon" />
            <span className="galaxy-stream" />
            <span className="galaxy-stars">
              <ActorPicture src="art/wordbook/painted/star.webp" className="gs gs1" />
              <ActorPicture src="art/wordbook/painted/star.webp" className="gs gs2" />
              <ActorPicture src="art/wordbook/painted/star.webp" className="gs gs3" />
              <ActorPicture src="art/wordbook/painted/star.webp" className="gs gs4" />
              <ActorPicture src="art/wordbook/painted/star.webp" className="gs gs5" />
            </span>
          </div>
          <div className="ls-waterfall" aria-hidden="true">
            <span className="wf-glow" />
            <span className="wf-stream wf-main" />
            <span className="wf-ribbon wf-r1" />
            <span className="wf-ribbon wf-r2" />
            <span className="wf-ribbon wf-r3" />
          </div>
          <div className="ls-gorge-mist" aria-hidden="true">
            <span className="gm gm1" />
            <span className="gm gm2" />
            <span className="gm gm3" />
          </div>
          <div className="ls-libai">
            <InkScholar pose={line === 0 ? "walk" : "gaze"} />
          </div>
        </>
      )}

      {drama === "jing-ye-si" && (
        <>
          <div className="jys-moon">
            <ActorPicture src="art/play/moon.webp" />
          </div>
          <div className="jys-window">
            <ActorPicture src="art/wordbook/painted/window.webp" />
          </div>
          <div className="jys-moonbeam" aria-hidden="true" />
          <div className="jys-frost-glow" aria-hidden="true" />
          <div className="jys-bed">
            <ActorPicture src="art/wordbook/painted/bed.webp" />
          </div>
          <div className="jys-home-memory" aria-hidden="true">
            <ActorPicture src="art/wordbook/painted/house.webp" />
          </div>
          <div className="jys-poet">
            <InkScholar pose={line === 2 ? "gaze" : line === 3 ? "bow" : "stand"} />
          </div>
        </>
      )}

      {drama === "chun-xiao" && (
        <>
          <div className="cx-dawn-glow" aria-hidden="true" />
          <div className="cx-window">
            <ActorPicture src="art/wordbook/painted/window.webp" />
          </div>
          <div className="cx-bird b1">
            <ActorPicture src="art/play/bird.webp" />
          </div>
          <div className="cx-bird b2">
            <ActorPicture src="art/play/bird.webp" />
          </div>
          <div className="cx-notes">
            <ActorPicture src="art/wordbook/painted/music.webp" />
          </div>
          <div className="cx-petals">
            <ActorPicture src="art/wordbook/painted/blossom.webp" className="pt pt1" />
            <ActorPicture src="art/wordbook/painted/blossom.webp" className="pt pt2" />
            <ActorPicture src="art/wordbook/painted/blossom.webp" className="pt pt3" />
          </div>
        </>
      )}

      {drama === "jiang-xue" && (
        <>
          <div className="jx-bird">
            <ActorPicture src="art/play/bird.webp" />
          </div>
          <div className="jx-boat-group">
            <div className="jx-fisherman">
              <InkScholar pose="fish" />
            </div>
            <div className="jx-boat">
              <ActorPicture src="art/play/boat.webp" />
            </div>
          </div>
          <div className="jx-ripples" aria-hidden="true" />
        </>
      )}

      {drama === "hua" && (
        <>
          <div className="hua-scroll-frame" aria-hidden="true" />
          <div className="hua-mountain">
            <ActorPicture src="art/play/mountain.webp" />
          </div>
          <div className="hua-water">
            <ActorPicture src="art/wordbook/waterdrop.webp" />
          </div>
          <div className="hua-flower">
            <ActorPicture src="art/wordbook/painted/blossom.webp" />
          </div>
          <div className="hua-bird">
            <ActorPicture src="art/play/bird.webp" />
          </div>
          <div className="hua-child">
            <ActorPicture src="art/wordbook/child.webp" />
          </div>
        </>
      )}

      {drama === "feng" && (
        <>
          <div className="fg-tree">
            <ActorPicture src="art/wordbook/windtree.webp" />
          </div>
          <div className="fg-leaves">
            <ActorPicture src="art/wordbook/painted/maple-leaf.webp" className="lf lf1" />
            <ActorPicture src="art/wordbook/painted/dry-leaves.webp" className="lf lf2" />
          </div>
          <div className="fg-flowers">
            <ActorPicture src="art/wordbook/painted/blossom.webp" className="fl fl1" />
            <ActorPicture src="art/wordbook/painted/daisy.webp" className="fl fl2" />
          </div>
          <div className="fg-waves">
            <ActorPicture src="art/wordbook/painted/wave.webp" />
          </div>
          <div className="fg-bamboo">
            <ActorPicture src="art/wordbook/painted/bamboo.webp" className="bm bm1" />
            <ActorPicture src="art/wordbook/painted/bamboo.webp" className="bm bm2" />
          </div>
        </>
      )}

      {drama === "gu-lang-yue-xing" && (
        <>
          <div className="gy-moon">
            <ActorPicture src="art/play/moon.webp" />
          </div>
          <div className="gy-plate">
            <ActorPicture src="art/play/plate.webp" />
          </div>
          <div className="gy-mirror">
            <ActorPicture src="art/wordbook/painted/mirror.webp" />
          </div>
          <div className="gy-cloud">
            <ActorPicture src="art/wordbook/painted/cloud.webp" />
          </div>
          <div className="gy-child">
            <ActorPicture src="art/wordbook/child.webp" />
          </div>
        </>
      )}

      {drama === "min-nong" && (
        <>
          <div className="mn-sun">
            <ActorPicture src="art/play/sun.webp" />
          </div>
          <div className="mn-rice">
            <ActorPicture src="art/wordbook/painted/rice-stalks.webp" />
          </div>
          <div className="mn-farmer">
            <InkScholar pose="hoe" />
          </div>
          <div className="mn-sweat">
            <ActorPicture src="art/wordbook/painted/water-drop.webp" />
          </div>
          <div className="mn-bowl">
            <ActorPicture src="art/wordbook/painted/rice-bowl.webp" />
            <ActorPicture src="art/wordbook/painted/steam.webp" className="mn-steam" />
          </div>
        </>
      )}

      {drama === "deng-guan-que-lou" && (
        <>
          <div className="dg-sun">
            <ActorPicture src="art/play/sun.webp" />
          </div>
          <div className="dg-mountain">
            <ActorPicture src="art/play/mountain.webp" />
          </div>
          <div className="dg-wave">
            <ActorPicture src="art/wordbook/painted/wave.webp" />
          </div>
          <div className="dg-tower">
            <ActorPicture src="art/wordbook/painted/house.webp" />
          </div>
          <div className="dg-poet">
            <InkScholar pose="gaze" />
          </div>
        </>
      )}

      {drama === "chi-shang" && (
        <>
          <div className="cs-wake" aria-hidden="true" />
          <div className="cs-lily">
            <ActorPicture src="art/play/lily.webp" />
          </div>
          <div className="cs-lotus">
            <ActorPicture src="art/wordbook/painted/blossom.webp" />
          </div>
          <div className="cs-boat-group">
            <div className="cs-child">
              <ActorPicture src="art/wordbook/child.webp" />
            </div>
            <div className="cs-boat">
              <ActorPicture src="art/play/boat.webp" />
            </div>
          </div>
        </>
      )}

      {drama === "cun-ju" && (
        <>
          <div className="cj-bird">
            <ActorPicture src="art/play/bird.webp" />
          </div>
          <div className="cj-willow">
            <ActorPicture src="art/wordbook/windtree.webp" />
          </div>
          <div className="cj-child">
            <ActorPicture src="art/wordbook/child.webp" />
          </div>
          <div className="cj-runner">
            <ActorPicture src="art/wordbook/painted/runner.webp" />
          </div>
          <div className="cj-kite-group">
            <svg className="cj-string" viewBox="0 0 200 200" aria-hidden="true">
              <path
                d="M15 190 Q85 110 175 18"
                fill="none"
                stroke="#f5ecd6"
                strokeWidth="2.4"
                strokeDasharray="6 4"
              />
            </svg>
            <ActorPicture src="art/wordbook/painted/balloon.webp" className="cj-kite" />
          </div>
        </>
      )}

      {drama === "xiao-chi" && (
        <>
          <div className="xc-drop" style={{ position: "absolute", left: "27%", top: "60%", height: "17%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/wordbook/painted/water-drop.webp" />
          </div>
          <div className="xc-lily" style={{ position: "absolute", left: "52%", top: "66%", height: "26%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/play/lily.webp" />
          </div>
          <div className="xc-dragonfly" style={{ position: "absolute", left: line >= 3 ? "53%" : "70%", top: line >= 3 ? "43%" : "30%", height: "18%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/wordbook/painted/butterfly.webp" />
          </div>
        </>
      )}

      {drama === "hua-ji" && (
        <>
          <div className="hj-house" style={{ position: "absolute", left: "22%", top: "54%", height: "32%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/wordbook/painted/house.webp" />
          </div>
          <div className="hj-rooster" style={{ position: "absolute", left: "50%", top: "60%", height: "36%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/wordbook/painted/chick.webp" />
          </div>
          <div className="hj-sun" style={{ position: "absolute", left: "81%", top: line >= 3 ? "20%" : "28%", height: "22%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/play/sun.webp" />
          </div>
        </>
      )}

      {drama === "mei-hua" && (
        <>
          <div className="mh-blossom" style={{ position: "absolute", left: "44%", top: "46%", height: "28%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/wordbook/painted/blossom.webp" />
          </div>
          <div className="mh-snow" style={{ position: "absolute", left: "72%", top: "30%", height: "17%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/wordbook/painted/snowflake.webp" />
          </div>
        </>
      )}

      {drama === "zao-fa-bai-di-cheng" && (
        <>
          <div className="bd-mountain-l" style={{ position: "absolute", left: "25%", top: "48%", height: "30%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/play/mountain.webp" />
          </div>
          <div className="bd-mountain-r" style={{ position: "absolute", left: "76%", top: "48%", height: "30%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/play/mountain.webp" />
          </div>
          <div className="bd-boat" style={{ position: "absolute", left: `${32 + line * 14}%`, top: "64%", height: "28%", transform: "translate(-50%, -50%)" }}>
            <ActorPicture src="art/play/boat.webp" />
          </div>
        </>
      )}
    </div>
  );
}

function clampCardLayer([pic, x, y, height]: PoemLayer): {
  pic: string;
  x: number;
  y: number;
  height: number;
} {
  // Keep focal illustrations clearly visible above the bottom gradient title scrim.
  return {
    pic,
    x: Math.max(18, Math.min(82, x)),
    y: Math.max(16, Math.min(50, y * 0.78)),
    height: Math.min(54, Math.max(22, height * 1.15)),
  };
}

/** Static illustrated thumbnail backdrop used on poem cards in the child catalog. */
export function PoemCardBackdrop({ poemId }: { poemId: string }) {
  const scene = poemScenes[poemId];
  if (!scene) return null;
  const bgUrl = poemBackdropUrls[scene.backdrop];
  const visibleLayers = scene.layers.slice(0, 3).map(clampCardLayer);
  return (
    <span
      className={"poem-card-scene time-" + scene.time}
      aria-hidden="true"
    >
      <img
        className="poem-card-bg"
        src={"./" + bgUrl}
        loading="lazy"
        decoding="async"
        alt=""
      />
      <span className="poem-card-lighting" />
      {scene.drama === "lushan-waterfall" && (
        <span className="poem-card-waterfall" />
      )}
      {visibleLayers.map((layer, index) => (
        <img
          key={index}
          className="poem-card-prop"
          src={"./" + layer.pic}
          loading="lazy"
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
