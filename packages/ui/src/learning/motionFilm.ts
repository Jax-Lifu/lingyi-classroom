import type {
  WordMotion,
  WordScene,
} from "@lingyi-classroom/content/word-scenes";

interface Pose {
  x?: number;
  y?: number;
  r?: number;
  sx?: number;
  sy?: number;
  opacity?: number;
}
interface Motion {
  poses: Pose[];
  repeats?: number;
  anchor?: [number, number];
}
const still: Motion = { poses: [{}, {}] };
const turn = (r: number, repeats = 1): Motion => ({
  poses: [{}, { r }, {}],
  repeats,
  anchor: [0.5, 0.83],
});
const swing = (angle: number, repeats = 3): Motion => ({
  poses: [{}, { r: angle }, { r: -angle }, {}],
  repeats,
  anchor: [0.5, 0.85],
});
const hop = (lift: number, repeats = 1): Motion => ({
  poses: [{}, { y: -lift, r: -4 }, {}],
  repeats,
});
const bob = (lift: number, repeats: number): Motion => ({
  poses: [{}, { y: -lift, r: -5 }, { r: 3 }, {}],
  repeats,
});
const pulse: Motion = { poses: [{}, { sx: 1.16, sy: 1.16 }, {}], repeats: 2 };
const grow: Motion = { poses: [{ sx: 0.18, sy: 0.18 }, {}], anchor: [0.5, 1] };
const settle: Motion = {
  poses: [{}, {}, { sx: 1.07, sy: 0.92 }, {}],
  anchor: [0.5, 1],
};
const away: Motion = { poses: [{}, {}, { opacity: 0 }] };
const reveal: Motion = { poses: [{ opacity: 0 }, { opacity: 0 }, {}] };
const small: Motion = { poses: [{}, { sx: 0.52, sy: 0.52 }] };
const rub: Motion = { poses: [{}, { x: -0.12 }, { x: 0.12 }, {}], repeats: 3 };
const openDoor: Motion = { poses: [{}, { sx: 0.18 }], anchor: [0, 0.5] };

// Poses are in local image units. The curriculum supplies the independent path across the scene.
const motions: Record<WordMotion, Motion> = {
  approach: grow,
  arc: hop(0.48),
  beat: pulse,
  bloom: grow,
  bob: bob(0.08, 2),
  bolt: { poses: [{ sy: 0.12, opacity: 0.2 }, {}, {}], anchor: [0.5, 0] },
  bounce: settle,
  bow: turn(17),
  brush: { poses: [{}, { y: -0.15 }, { y: 0.15 }, {}], repeats: 4 },
  closeDoor: { poses: [{ sx: 0.18 }, {}], anchor: [0, 0.5] },
  crawl: bob(0.018, 4),
  depart: away,
  draw: rub,
  drift: bob(0.12, 2),
  drop: settle,
  fall: still,
  flicker: {
    poses: [
      {},
      { sx: 0.94, sy: 1.12, r: 2 },
      { sx: 1.03, sy: 0.96, r: -2 },
      {},
    ],
    repeats: 4,
    anchor: [0.5, 0.9],
  },
  flutter: bob(0.19, 4),
  gallop: hop(0.13, 6),
  glide: still,
  grow,
  hop: hop(0.25, 2),
  inside: away,
  leap: hop(0.88),
  light: { poses: [{ opacity: 0.4, sx: 0.92, sy: 0.92 }, {}] },
  nod: turn(12),
  open: {
    poses: [{ sy: 0.52 }, { sy: 1 }, { sy: 1 }, { sy: 0.55 }],
    repeats: 2,
  },
  openDoor,
  peck: turn(16, 3),
  recede: small,
  reveal,
  ride: hop(0.025, 4),
  ring: { ...swing(19), anchor: [0.5, 0] },
  rise: still,
  rock: swing(9),
  roll: { poses: [{ r: -135 }, {}] },
  rumble: { poses: [{}, { x: -0.035 }, { x: 0.035 }, {}], repeats: 4 },
  sail: bob(0.06, 2),
  scoop: { poses: [{}, { x: -0.14, y: 0.35, r: 25 }, {}] },
  scrub: rub,
  serve: still,
  settle,
  shake: swing(6, 5),
  shiver: swing(4, 6),
  shrink: small,
  slide: still,
  step: settle,
  sway: swing(10),
  swim: bob(0.08, 2),
  tilt: turn(15),
  tip: turn(35),
  twinkle: pulse,
  twirl: { poses: [{}, { sx: 0.22, r: 7 }, {}] },
  unfold: { poses: [{ sx: 0.12 }, {}] },
  vanish: away,
  walk: bob(0.07, 4),
  wave: swing(16),
};
interface Actor {
  src: string;
  w: number;
  h: number;
  x: number;
  y: number;
  height: number;
  dx?: number;
  dy?: number;
  motion: Motion;
  delay?: number;
  crop?: [number, number];
}
function property(frames: number[], values: (number | number[])[]) {
  const list = values.map((v) => (typeof v === "number" ? [v] : v));
  if (list.every((v) => v.every((n, i) => n === list[0][i])))
    return { a: 0, k: values[0] };
  return {
    a: 1,
    k: frames.map((t, i) =>
      i === frames.length - 1
        ? { t, s: list[i] }
        : {
            t,
            s: list[i],
            e: list[i + 1],
            i: { x: [0.65], y: [1] },
            o: { x: [0.35], y: [0] },
          },
    ),
  };
}
function imageMask(w: number, h: number, [top, bottom]: [number, number]) {
  const vertices = [
    [0, top * h],
    [w, top * h],
    [w, bottom * h],
    [0, bottom * h],
  ];
  const tangents = vertices.map(() => [0, 0]);
  return {
    hasMask: true,
    masksProperties: [
      {
        mode: "a",
        inv: false,
        o: { a: 0, k: 100 },
        x: { a: 0, k: 0 },
        pt: { a: 0, k: { v: vertices, i: tangents, o: tangents, c: true } },
      },
    ],
  };
}

function composition(w: number, h: number, actors: Actor[], duration: number) {
  const assets = actors.map(({ src, w, h }, i) => ({
    id: "art" + i,
    w,
    h,
    u: "",
    p: "./" + src,
  }));
  const end = duration + Math.max(0, ...actors.map((a) => a.delay ?? 0)) + 2;
  const layers = actors
    .map((actor, i) => {
      const { motion, w: imageW, h: imageH, height, delay = 0 } = actor;
      const [ax, ay] = motion.anchor ?? [0.5, 0.5];
      const width = (height * imageW) / imageH,
        scale = (100 * height) / imageH;
      const poses: Pose[] = [];
      for (let repeat = 0; repeat < (motion.repeats ?? 1); repeat++)
        poses.push(...(repeat ? motion.poses.slice(1) : motion.poses));
      const frames = poses.map(
        (_, j) => delay + (duration * j) / (poses.length - 1),
      );
      const positions = poses.map((pose, j) => {
        const t = j / (poses.length - 1);
        return [
          actor.x + (actor.dx ?? 0) * t + width * ((pose.x ?? 0) + ax - 0.5),
          actor.y + (actor.dy ?? 0) * t + height * ((pose.y ?? 0) + ay - 0.5),
          0,
        ];
      });
      return {
        ddd: 0,
        ind: i + 1,
        ty: 2,
        refId: assets[i].id,
        ...(actor.crop ? imageMask(imageW, imageH, actor.crop) : {}),
        ip: 0,
        op: end,
        st: 0,
        sr: 1,
        bm: 0,
        ks: {
          a: { a: 0, k: [imageW * ax, imageH * ay, 0] },
          p: property(frames, positions),
          s: property(
            frames,
            poses.map((p) => [scale * (p.sx ?? 1), scale * (p.sy ?? 1), 100]),
          ),
          r: property(
            frames,
            poses.map((p) => p.r ?? 0),
          ),
          o: property(
            frames,
            poses.map((p) => p.opacity ?? 100),
          ),
        },
      };
    })
    .reverse();
  return { v: "5.12.2", fr: 30, ip: 0, op: end, w, h, ddd: 0, assets, layers };
}
export async function wordFilm(host: HTMLElement, scene: WordScene) {
  const images = Array.from(
    host.parentElement!.querySelectorAll<HTMLImageElement>(".picture-actor"),
  );
  await Promise.all(images.map((img) => img.decode()));
  const w = host.clientWidth,
    h = host.clientHeight;
  if (!w || !h || images.length !== scene.layers.length)
    throw new Error("Word illustration is not laid out");
  const actors = scene.layers.flatMap<Actor>(
    ([src, x, y, size, motion, dx = 0, dy = 0], i) => {
      const actor: Actor = {
        src,
        w: images[i].naturalWidth,
        h: images[i].naturalHeight,
        x: (x * w) / 100,
        y: (y * h) / 100,
        height: (size * h) / 100,
        dx: (dx * w) / 100,
        dy: (dy * h) / 100,
        delay: Math.min(8, i) * 3,
        motion: motion ? motions[motion] : still,
      };
      // The thunder illustration has a cloud above the bolt. Reveal the bolt independently.
      if (motion === "rumble")
        return [
          { ...actor, crop: [0, 0.56] },
          { ...actor, crop: [0.56, 1], motion: reveal },
        ];
      return [actor];
    },
  );
  return composition(w, h, actors, 56);
}
export type CueName = "tap" | "scroll" | "swipe" | "drag" | "stamp" | "retry";
export const handArt = "art/wordbook/painted/point-up.webp";
export const starArt = "art/wordbook/painted/star.webp";
const cues: Record<CueName, Motion> = {
  tap: {
    poses: [
      { y: 0.09, r: -8 },
      { y: -0.07, sy: 0.92 },
      { y: 0.05 },
      { y: -0.07, sy: 0.92 },
      { y: 0.05, r: -8 },
    ],
  },
  scroll: {
    poses: [
      { y: 0.27, r: 7 },
      { y: -0.25, r: -5 },
      { y: -0.25, r: -5 },
      { y: 0.27, r: 7 },
    ],
  },
  swipe: {
    poses: [
      { x: 0.37, r: 8 },
      { x: -0.37, r: -12 },
      { x: 0, r: 0 },
      { y: 0.23 },
      { y: -0.32, r: -6 },
      {},
    ],
  },
  drag: {
    poses: [
      { x: -0.4, r: -8 },
      { x: -0.4, sy: 0.92 },
      { x: 0.43, r: 10 },
      { x: 0.43 },
      {},
    ],
  },
  stamp: {
    poses: [
      { sx: 0.4, sy: 0.4, r: -18 },
      { sx: 1.15, sy: 1.15, r: 5 },
      { sx: 0.96, sy: 0.96 },
      {},
    ],
  },
  retry: { poses: [{}, { r: -15, x: -0.13 }, { r: 12, x: 0.12 }, {}] },
};
export function cueFilm(kind: CueName) {
  const star = kind === "stamp";
  return composition(
    100,
    80,
    [
      {
        src: star ? starArt : handArt,
        w: star ? 277 : 147,
        h: star ? 266 : 287,
        x: 50,
        y: 41,
        height: star ? 70 : 55,
        motion: cues[kind],
      },
    ],
    kind === "swipe" ? 74 : 40,
  );
}
