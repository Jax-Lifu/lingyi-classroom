import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { PlayActor } from "./types";

type Position = [number, number, number];
type Geometry = THREE.BufferGeometry;
type Paint = THREE.MeshStandardMaterial;

function cutout(outline: [number, number][], thickness = 0.06) {
  const shape = new THREE.Shape();
  shape.moveTo(...outline[0]);
  for (const point of outline.slice(1)) shape.lineTo(...point);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSize: 0.018,
    bevelThickness: 0.015,
    bevelSegments: 2,
  });
  geometry.translate(0, 0, -thickness / 2);
  return geometry;
}

export function makePaperMaterials() {
  const flame = new THREE.Shape();
  flame.moveTo(0, -0.31);
  flame.bezierCurveTo(-0.25, -0.31, -0.31, -0.11, -0.19, 0.09);
  flame.quadraticCurveTo(-0.14, 0.16, -0.16, 0.23);
  flame.quadraticCurveTo(-0.06, 0.18, -0.08, 0.08);
  flame.bezierCurveTo(0.04, 0.17, -0.005, 0.3, 0.085, 0.44);
  flame.bezierCurveTo(0.06, 0.23, 0.25, 0.11, 0.24, -0.06);
  flame.quadraticCurveTo(0.22, -0.3, 0, -0.31);
  const crescent = new THREE.Shape();
  crescent.moveTo(0.27, 0.49);
  crescent.bezierCurveTo(-0.22, 0.58, -0.55, 0.2, -0.48, -0.18);
  crescent.bezierCurveTo(-0.44, -0.52, 0.13, -0.64, 0.43, -0.28);
  crescent.bezierCurveTo(0.04, -0.39, -0.23, -0.13, -0.15, 0.17);
  crescent.bezierCurveTo(-0.1, 0.34, 0.06, 0.47, 0.27, 0.49);
  const feather = new THREE.Shape();
  feather.moveTo(-0.33, -0.035);
  feather.bezierCurveTo(-0.12, 0.12, 0.13, 0.17, 0.24, 0.07);
  feather.bezierCurveTo(0.27, -0.07, 0.13, -0.14, -0.05, -0.13);
  feather.bezierCurveTo(-0.2, -0.12, -0.29, -0.07, -0.33, -0.035);
  const neckPath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.2, -0.02, 0.0),
    new THREE.Vector3(0.34, 0.14, 0.03),
    new THREE.Vector3(0.3, 0.37, 0.03),
    new THREE.Vector3(0.4, 0.52, 0.035),
  ]);
  const shapes = {
    flame: new THREE.ExtrudeGeometry(flame, { depth: 0.07, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 12 }),
    mountain: cutout(
      [
        [-0.66, -0.36],
        [-0.39, 0.025],
        [-0.14, 0.33],
        [0.058, 0.56],
        [0.17, 0.4],
        [0.31, 0.18],
        [0.65, -0.36],
      ],
      0.24,
    ),
    ridge: cutout(
      [
        [0.056, 0.51],
        [0.068, 0.14],
        [-0.19, -0.3],
        [0.52, -0.3],
      ],
      0.011,
    ),
    moon: new THREE.ExtrudeGeometry(crescent, {
      depth: 0.08,
      bevelEnabled: true,
      bevelSize: 0.022,
      bevelThickness: 0.018,
      bevelSegments: 2,
      curveSegments: 24,
    }),
    feather: new THREE.ExtrudeGeometry(feather, {
      depth: 0.035,
      bevelEnabled: true,
      bevelSize: 0.016,
      bevelThickness: 0.012,
      bevelSegments: 2,
      curveSegments: 12,
    }),
    neck: new THREE.TubeGeometry(neckPath, 20, 0.087, 10, false),
    webbedFoot: cutout(
      [
        [-0.15, 0.05],
        [-0.1, -0.09],
        [0.012, -0.075],
        [0.08, -0.1],
        [0.14, -0.05],
        [0.11, 0.025],
        [-0.005, 0.12],
      ],
      0.035,
    ),
    crown: new THREE.SphereGeometry(
      0.5,
      24,
      12,
      0,
      Math.PI * 2,
      0,
      Math.PI * 0.5,
    ),
    bead: new THREE.SphereGeometry(0.5, 18, 14),
    box: new RoundedBoxGeometry(1, 1, 1, 2, 0.095),
    tube: new THREE.CylinderGeometry(0.5, 0.5, 1, 16),
    cup: new THREE.CylinderGeometry(0.5, 0.36, 1, 28),
    bowl: new THREE.SphereGeometry(
      0.5,
      24,
      10,
      0,
      Math.PI * 2,
      Math.PI * 0.5,
      Math.PI * 0.5,
    ),
    ring: new THREE.TorusGeometry(0.43, 0.065, 8, 36),
    handle: new THREE.TorusGeometry(0.43, 0.05, 8, 32, Math.PI),
    leaf: cutout([
      [0, -0.52],
      [-0.25, -0.12],
      [-0.24, 0.14],
      [0, 0.54],
      [0.22, 0.12],
      [0.21, -0.14],
    ]),
    fin: cutout([
      [-0.48, -0.42],
      [-0.33, 0.02],
      [-0.47, 0.45],
      [0.52, 0.08],
      [0.48, -0.11],
    ]),
    hull: cutout(
      [
        [-0.91, 0.18],
        [-0.55, -0.21],
        [-0.27, -0.32],
        [0.5, -0.28],
        [0.91, 0.18],
        [0.39, 0.07],
        [-0.4, 0.07],
      ],
      0.24,
    ),
    sail: cutout(
      [
        [-0.36, -0.31],
        [0.27, -0.29],
        [0.23, 0.5],
      ],
      0.028,
    ),
    lily: new THREE.CylinderGeometry(
      0.52,
      0.49,
      0.075,
      42,
      1,
      false,
      0.25,
      5.76,
    ),
    cone: new THREE.ConeGeometry(0.5, 1, 10),
  };
  // A single, seeded paper texture gives the geometric puppets the grain of the painted backgrounds.
  const grainSize = 96;
  const grain = new Uint8Array(grainSize * grainSize * 4);
  let seed = 137;
  for (let i = 0; i < grain.length; i += 4) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const fiber = Math.sin((i / 4 / grainSize) * 1.28) * 3;
    const value = Math.min(
      255,
      Math.round(228 + (seed / 4294967296) * 25 + fiber),
    );
    grain[i] = grain[i + 1] = grain[i + 2] = value;
    grain[i + 3] = 255;
  }
  const paper = new THREE.DataTexture(grain, grainSize, grainSize);
  paper.colorSpace = THREE.SRGBColorSpace;
  paper.wrapS = paper.wrapT = THREE.RepeatWrapping;
  paper.minFilter = THREE.LinearMipmapLinearFilter;
  paper.magFilter = THREE.LinearFilter;
  paper.generateMipmaps = true;
  paper.needsUpdate = true;
  const paints = new Map<string, Paint>();
  const color = (value: string) => {
    let paint = paints.get(value);
    if (!paint) {
      paint = new THREE.MeshStandardMaterial({
        color: value,
        map: paper,
        roughness: 0.9,
        metalness: 0.01,
      });
      paints.set(value, paint);
    }
    return paint;
  };

  const shadowSurface = document.createElement("canvas");
  shadowSurface.width = 96;
  shadowSurface.height = 96;
  const ctx = shadowSurface.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(48, 48, 5, 48, 48, 47);
    gradient.addColorStop(0, "rgba(55,42,24,.34)");
    gradient.addColorStop(0.5, "rgba(59,45,25,.14)");
    gradient.addColorStop(1, "rgba(68,49,26,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 96, 96);
  }
  const shadowTexture = new THREE.CanvasTexture(shadowSurface);
  const shadowMaterial = new THREE.MeshBasicMaterial({
    map: shadowTexture,
    transparent: true,
    depthWrite: false,
    toneMapped: false,
  });
  const plane = new THREE.PlaneGeometry(1, 1);
  return {
    shapes,
    color,
    plane,
    shadowMaterial,
    dispose() {
      Object.values(shapes).forEach((shape) => shape.dispose());
      paints.forEach((paint) => paint.dispose());
      shadowMaterial.dispose();
      shadowTexture.dispose();
      paper.dispose();
      plane.dispose();
    },
  };
}

type Kit = ReturnType<typeof makePaperMaterials>;

export function createPaperActor(
  actor: PlayActor,
  kit: Kit,
  textureReady: () => void,
  textureFailed: () => void,
) {
  const root = new THREE.Group();
  const pose = new THREE.Group();
  const pieces = new THREE.Group();
  root.add(pose);
  pose.add(pieces);
  const shadow = new THREE.Mesh(kit.plane, kit.shadowMaterial);
  shadow.position.set(0, -0.48, -0.46);
  root.add(shadow);
  const { shapes } = kit;
  const localMaterials: THREE.Material[] = [];
  const localTextures: THREE.Texture[] = [];
  const sparks: THREE.Mesh[] = [];
  const wings: THREE.Mesh[] = [];
  const embers: THREE.Mesh[] = [];
  const fadedPaints = new Map<THREE.Material, THREE.Material>();
  const tint =
    actor.tint && CSS.supports("color", actor.tint) ? actor.tint : undefined;
  let fishSkin: Paint | undefined;
  let fin: THREE.Mesh | undefined;
  let crack: THREE.Group | undefined;
  let shellTop: THREE.Group | undefined;
  const feet: THREE.Mesh[] = [];
  let imagePending = false;
  let disposed = false;
  let width = 1;
  let signFace: THREE.Mesh | undefined;
  const mesh = (
    geometry: Geometry,
    paint: string | THREE.Material,
    xyz: Position,
    size: Position,
  ) => {
    let material = typeof paint === "string" ? kit.color(paint) : paint;
    if (actor.faded) {
      const shared = !localMaterials.includes(material);
      if (shared && !fadedPaints.has(material)) {
        const copy = material.clone();
        fadedPaints.set(material, copy);
        localMaterials.push(copy);
      }
      material = fadedPaints.get(material) || material;
      material.transparent = true;
      material.opacity = 0.46;
      material.depthWrite = false;
    }
    const item = new THREE.Mesh(geometry, material);
    item.position.set(...xyz);
    item.scale.set(...size);
    pieces.add(item);
    return item;
  };
  const oval = (paint: string | Paint, xyz: Position, size: Position) =>
    mesh(shapes.bead, paint, xyz, size);
  const block = (paint: string, xyz: Position, size: Position) =>
    mesh(shapes.box, paint, xyz, size);
  const rod = (
    paint: string,
    from: Position,
    to: Position,
    diameter: number,
  ) => {
    const a = new THREE.Vector3(...from),
      b = new THREE.Vector3(...to),
      delta = b.clone().sub(a);
    const center = a.addScaledVector(delta, 0.5);
    const item = mesh(
      shapes.tube,
      paint,
      [center.x, center.y, center.z],
      [diameter, delta.length(), diameter],
    );
    item.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      delta.normalize(),
    );
    return item;
  };
  const eyes = (x: number, y: number, z: number, radius: number) => {
    oval("#332c2b", [x, y, z], [radius, radius * 1.12, radius * 0.7]);
    oval(
      "#fffae8",
      [x - radius * 0.18, y + radius * 0.21, z + radius * 0.28],
      [radius * 0.29, radius * 0.29, radius * 0.18],
    );
  };
  const waterline = (paint: string, y: number, size: number, depth: number) => {
    const ring = mesh(
      shapes.ring,
      paint,
      [0, y, depth],
      [size, size * 0.72, size * 0.5],
    );
    ring.rotation.x = -Math.PI / 2;
    return ring;
  };
  const art = (url: string, aspect: number) => {
    imagePending = true;
    const mat = new THREE.MeshBasicMaterial({
      transparent: true,
      alphaTest: 0.025,
      depthWrite: false,
      toneMapped: false,
    });
    localMaterials.push(mat);
    const card = mesh(kit.plane, mat, [0, 0, 0], [aspect, 1, 1]);
    const tex = new THREE.TextureLoader().load(
      url,
      (loaded) => {
        if (disposed) return;
        const img = loaded.image as { width: number; height: number };
        width = img.width / img.height;
        card.scale.x = width;
        shadow.scale.x = width * 0.91;
        imagePending = false;
        textureReady();
      },
      undefined,
      () => {
        if (!disposed) textureFailed();
      },
    );
    tex.colorSpace = THREE.SRGBColorSpace;
    mat.map = tex;
    localTextures.push(tex);
  };
  const leaf = (paint: string, xyz: Position, size: Position, tilt = 0) => {
    const item = mesh(shapes.leaf, paint, xyz, size);
    item.rotation.z = tilt;
    return item;
  };

  switch (actor.kind) {
    case "flame":
      mesh(shapes.flame, "#e77435", [0, 0, 0], [1.2, 1.2, 1]);
      mesh(shapes.flame, "#ffc457", [0, -0.11, 0.12], [0.70, 0.76, 0.6]);
      mesh(shapes.flame, "#fff0a0", [-0.02, -0.20, 0.2], [0.32, 0.38, 0.5]);
      break;
    case "bear":
      art("./art/bear.webp", 0.91);
      break;
    case "photo":
      if (actor.picture) art(actor.picture, 1);
      else block("#fff1cf", [0, 0, 0], [0.94, 0.91, 0.15]);
      break;
    case "seed": {
      oval("#8b603d", [0, -0.27, 0], [0.43, 0.36, 0.31]).rotation.z = -0.28;
      oval("#bd9260", [-0.06, -0.3, 0.105], [0.28, 0.2, 0.11]).rotation.z =
        -0.32;
      rod("#658851", [0.008, -0.2, 0], [0.038, 0.14, 0.012], 0.052);
      leaf("#8fb35e", [-0.1, 0.13, 0.018], [0.51, 0.38, 0.55], 0.9);
      leaf("#609658", [0.15, 0.22, 0.008], [0.48, 0.45, 0.55], -0.81);
      rod("#bed280", [-0.2, 0.19, 0.046], [-0.008, 0.061, 0.04], 0.015);
      rod("#a5c678", [0.075, 0.135, 0.032], [0.255, 0.32, 0.034], 0.013);
      break;
    }
    case "tree": {
      mesh(
        shapes.cup,
        "#986a43",
        [0, -0.16, 0],
        [0.27, 0.82, 0.24],
      ).rotation.z = 0.04;
      rod("#a0734b", [-0.018, -0.18, 0.012], [-0.28, 0.17, -0.015], 0.096);
      rod("#a0734b", [0.022, -0.12, 0.025], [0.25, 0.17, 0.045], 0.092);
      rod("#67533b", [-0.038, -0.49, 0.105], [-0.052, -0.27, 0.105], 0.013);
      for (const [x, y, z, diameter, shade] of [
        [-0.23, 0.17, -0.04, 0.6, "#658b51"],
        [0.18, 0.22, -0.06, 0.65, "#759653"],
        [-0.04, 0.41, -0.055, 0.66, "#85a55e"],
        [-0.22, 0.28, 0.075, 0.42, "#88a65c"],
        [0.2, 0.31, 0.09, 0.43, "#8ea95a"],
        [0.015, 0.48, 0.1, 0.43, "#9cb367"],
      ] as const)
        oval(
          tint || shade,
          [x, y, z],
          [diameter, diameter * 0.89, diameter * 0.67],
        );
      for (const [x, y] of [
        [-0.28, 0.27],
        [-0.15, 0.36],
        [0.1, 0.46],
        [0.22, 0.28],
      ]) {
        leaf("#adc17b", [x, y, 0.25], [0.16, 0.095, 0.5], -0.85);
      }
      break;
    }
    case "mountain": {
      // The lesson raises three independently tappable peaks to form 山.
      mesh(shapes.mountain, tint || "#63857a", [0, 0, 0], [0.7, 1, 0.85]);
      mesh(shapes.ridge, "#92a895", [0, 0, 0.12], [0.7, 1, 1]);
      break;
    }
    case "sun": {
      oval(tint || "#ffca54", [0, 0, 0], [0.72, 0.72, 0.36]);
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 + 0.1;
        const ray = oval(
          i % 2 ? "#edbd65" : "#e7a84a",
          [Math.sin(angle) * 0.458, Math.cos(angle) * 0.458, -0.035],
          [0.051, 0.155, 0.065],
        );
        ray.rotation.z = -angle;
      }
      oval("#f7cb76", [-0.12, 0.12, 0.125], [0.19, 0.12, 0.055]).rotation.z =
        0.62;
      break;
    }
    case "moon":
      mesh(shapes.moon, tint || "#f2d995", [0, 0, 0], [1, 1, 1]);
      oval("#d7b878", [-0.337, -0.1, 0.089], [0.079, 0.096, 0.025]);
      oval("#d7b878", [-0.285, -0.235, 0.089], [0.052, 0.06, 0.025]);
      break;
    case "goose": {
      // The silhouette includes the curved neck and the pair of red webbed feet from 咏鹅.
      oval("#fffaf0", [-0.055, -0.105, 0], [0.98, 0.48, 0.55]);
      leaf("#e7d8b8", [-0.47, -0.018, -0.04], [0.37, 0.37, 0.84], 0.97);
      mesh(shapes.neck, "#fff9eb", [0, 0, 0], [1, 1, 1]);
      oval("#fffaf0", [0.432, 0.538, 0.035], [0.32, 0.25, 0.27]);
      oval("#e89b51", [0.6, 0.499, 0.04], [0.27, 0.094, 0.17]);
      eyes(0.462, 0.564, 0.15, 0.051);
      const wing = mesh(
        shapes.feather,
        "#eee5d0",
        [-0.08, -0.08, 0.245],
        [1.04, 0.93, 0.9],
      );
      wings.push(wing);
      for (const [x, y] of [
        [-0.19, -0.072],
        [-0.12, -0.024],
        [-0.22, -0.11],
      ]) {
        rod(
          "#d2c3a6",
          [x - 0.08, y - 0.028, 0.282],
          [x + 0.08, y + 0.007, 0.293],
          0.012,
        );
      }
      for (const [x, z] of [
        [-0.02, 0.11],
        [-0.18, -0.08],
      ]) {
        rod("#c9754c", [x, -0.26, z], [x - 0.02, -0.38, z + 0.036], 0.042);
        const foot = mesh(
          shapes.webbedFoot,
          "#d76b46",
          [x + 0.025, -0.382, z + 0.07],
          [0.81, 0.55, 1],
        );
        feet.push(foot);
      }
      break;
    }
    case "dock": {
      // Planks run across the camera, with their end grain and lashings facing the child.
      for (const z of [-0.27, 0.28]) {
        rod("#795235", [-1.0, -0.105, z], [1.0, -0.105, z], 0.16);
      }
      const boards = ["#bf8d58", "#d6a76d", "#bd8953", "#d1a067", "#bc8551"];
      boards.forEach((wood, i) => {
        const z = (i - 2) * 0.158;
        const plank = block(
          wood,
          [(i % 2) * 0.017, 0.015, z],
          [1.92 - (i % 3) * 0.035, 0.106, 0.153],
        );
        plank.rotation.y = i % 2 ? 0.006 : -0.007;
        rod(
          "#b18354",
          [-0.74, 0.07, z - 0.024],
          [-0.18, 0.071, z - 0.016],
          0.01,
        );
        rod(
          "#e4bc80",
          [0.05, 0.07, z + 0.019],
          [0.66, 0.071, z + 0.009],
          0.009,
        );
      });
      const posts: Position[] = [
        [-0.86, -0.02, 0.3],
        [0.83, -0.02, 0.3],
        [-0.89, -0.02, -0.28],
        [0.85, -0.02, -0.28],
      ];
      for (const [x, y, z] of posts) {
        rod("#946c48", [x, y - 0.2, z], [x, y + 0.19, z], 0.115);
        oval("#e1b479", [x, y + 0.187, z], [0.12, 0.036, 0.12]);
        for (const level of [0.085, 0.116]) {
          const rope = mesh(
            shapes.ring,
            "#d9bd86",
            [x, level, z],
            [0.135, 0.135, 0.105],
          );
          rope.rotation.x = Math.PI / 2;
        }
      }
      rod("#885c3a", [-0.72, 0.09, -0.24], [-0.94, 0.33, -0.25], 0.044);
      rod("#a47e4c", [-0.94, 0.33, -0.25], [-1.13, 0.46, -0.24], 0.028);
      rod("#b59769", [-1.13, 0.46, -0.24], [-1.3, 0.51, -0.22], 0.017);
      rod("#ebe1bc", [-1.3, 0.51, -0.22], [-1.34, 0.012, 0.17], 0.01);
      oval("#d77748", [-1.34, -0.023, 0.17], [0.072, 0.12, 0.074]);
      oval("#fbebc4", [-1.34, -0.052, 0.18], [0.071, 0.068, 0.071]);
      pieces.rotation.x = 0.44;
      pieces.rotation.y = -0.08;
      break;
    }
    case "fish": {
      fishSkin = kit.color("#509eb3").clone();
      localMaterials.push(fishSkin);
      oval(fishSkin, [0.03, 0, 0], [1.19, 0.61, 0.47]);
      oval("#e4d8ab", [0.045, -0.12, 0.13], [0.99, 0.33, 0.29]);
      fin = mesh(
        shapes.fin,
        "#e89952",
        [-0.66, 0.025, -0.02],
        [0.58, 0.62, 0.77],
      );
      leaf("#467f91", [0, 0.32, -0.025], [0.47, 0.34, 0.85], -0.48);
      leaf("#e99a5c", [-0.01, -0.105, 0.24], [0.34, 0.28, 0.7], -0.87);
      oval("#f8edc8", [0.39, 0.1, 0.18], [0.19, 0.19, 0.12]);
      eyes(0.401, 0.102, 0.235, 0.119);
      rod("#507775", [0.49, 0.002, 0.137], [0.52, -0.022, 0.119], 0.017);
      rod("#507775", [0.52, -0.022, 0.119], [0.56, -0.007, 0.086], 0.017);
      for (const y of [-0.095, 0.095]) {
        rod("#f6c184", [-0.82, y, 0.02], [-0.6, y * 0.25, 0.029], 0.016);
      }
      for (let i = 0; i < 4; i++)
        oval(
          "#a4c1bf",
          [-0.33 + i * 0.13, 0.08 + (i % 2) * 0.042, 0.212],
          [0.064, 0.046, 0.031],
        );
      break;
    }
    case "grill": {
      for (const x of [-0.48, 0.48]) {
        rod("#665345", [x, -0.13, -0.11], [x * 1.3, -0.53, -0.15], 0.105);
        rod("#715447", [x, -0.13, 0.17], [x * 1.17, -0.51, 0.24], 0.082);
      }
      const basin = mesh(
        shapes.bowl,
        "#3b5753",
        [0, 0.095, 0],
        [1.55, 0.83, 0.86],
      );
      basin.rotation.x = 0.05;
      oval("#594137", [0, 0.085, 0.04], [1.48, 0.13, 0.76]);
      for (const x of [-0.39, -0.16, 0.09, 0.33]) {
        oval("#be6736", [x, 0.16, 0.03], [0.27, 0.13, 0.24]);
        const flame = mesh(
          shapes.cone,
          "#edaf4d",
          [x, 0.24, -0.13],
          [0.12, 0.25, 0.13],
        );
        sparks.push(flame);
      }
      for (let i = 0; i < 3; i++)
        embers.push(
          oval(
            i === 1 ? "#ffa651" : "#d88739",
            [(i - 1) * 0.23, 0.24, -0.17],
            [0.03, 0.04, 0.03],
          ),
        );
      for (let i = 0; i < 7; i++)
        rod(
          "#8d917f",
          [-0.59 + i * 0.19, 0.235, -0.32],
          [-0.59 + i * 0.19, 0.235, 0.32],
          0.035,
        );
      rod("#c3b699", [-0.65, 0.23, 0.32], [0.65, 0.23, 0.32], 0.042);
      rod("#ad9d84", [-0.65, 0.23, -0.32], [0.65, 0.23, -0.32], 0.042);
      pieces.rotation.x = 0.38;
      break;
    }
    case "plate":
      oval("#497777", [0, -0.06, 0], [1.64, 0.27, 0.86]);
      oval("#c5e2d4", [0, 0.016, 0.015], [1.56, 0.23, 0.81]);
      waterline("#f4ead7", 0.06, 1.54, 0.015);
      pieces.rotation.x = 0.3;
      break;
    case "berry": {
      oval(tint || "#c64743", [0, -0.03, 0], [0.69, 0.85, 0.61]);
      oval(tint || "#db5a4e", [0, 0.12, -0.025], [0.8, 0.51, 0.65]);
      mesh(
        shapes.cone,
        "#b63d3a",
        [0, -0.29, 0],
        [0.52, 0.4, 0.51],
      ).rotation.z = Math.PI;
      for (let i = 0; i < 5; i++) {
        const a = (i * Math.PI * 2) / 5;
        leaf(
          i % 2 ? "#64834d" : "#426f4e",
          [Math.cos(a) * 0.1, 0.37, Math.sin(a) * 0.12],
          [0.31, 0.33, 0.35],
          a,
        );
      }
      rod("#58814b", [0, 0.31, 0], [0.08, 0.54, -0.02], 0.07);
      for (const [x, y] of [
        [-0.2, 0.16],
        [0.01, 0.19],
        [0.2, 0.14],
        [-0.12, -0.01],
        [0.1, -0.03],
        [0, -0.21],
      ]) {
        const seed = oval(
          "#f5c177",
          [x, y, 0.3 - Math.abs(x) * 0.31],
          [0.052, 0.084, 0.037],
        );
        seed.rotation.z = x;
      }
      break;
    }
    case "basket":
    case "nest": {
      const basket = actor.kind === "basket";
      mesh(
        shapes.cup,
        basket ? "#b87942" : "#936244",
        [0, -0.05, 0],
        [1.25, 0.43, 0.8],
      );
      oval("#77503a", [0, 0.166, 0], [1.23, 0.12, 0.77]);
      for (let i = 0; i < 3; i++)
        waterline(
          i % 2 ? "#a77443" : "#c4975e",
          -0.17 + i * 0.133,
          1.12 + i * 0.085,
          0.035,
        );
      if (basket) {
        const h = mesh(
          shapes.handle,
          "#b48855",
          [0, 0.14, -0.1],
          [1.18, 1.03, 0.82],
        );
        h.rotation.y = -0.1;
        block("#d99571", [0.22, 0.13, 0.29], [0.48, 0.1, 0.18]).rotation.z =
          -0.14;
      } else {
        for (let i = 0; i < 9; i++) {
          const x = (i - 4) * 0.12,
            y = -0.2 + Math.abs(x) * 0.13;
          rod(
            i % 2 ? "#bc975f" : "#89653d",
            [x - 0.19, y - 0.025, 0.28],
            [x + 0.18, y + 0.12, 0.32],
            0.037,
          );
        }
      }
      pieces.rotation.x = 0.18;
      break;
    }
    case "egg": {
      const shellColor = tint || "#e8dbc1";
      mesh(shapes.bowl, shellColor, [0, 0, 0], [0.74, 1, 0.62]);
      shellTop = new THREE.Group();
      pieces.add(shellTop);
      shellTop.add(mesh(shapes.crown, shellColor, [0, 0, 0], [0.74, 1, 0.62]));
      for (const [x, y] of [
        [-0.14, 0.17],
        [0.13, -0.12],
        [-0.08, -0.26],
        [0.17, 0.11],
      ]) {
        const spot = oval(
          "#b5a27e",
          [x, y, 0.28 - Math.abs(x) * 0.2],
          [0.062, 0.047, 0.025],
        );
        if (y > 0) shellTop.add(spot);
      }
      crack = new THREE.Group();
      pieces.add(crack);
      const points: Position[] = [
        [-0.23, 0.12, 0.21],
        [-0.1, 0.038, 0.3],
        [-0.025, 0.11, 0.306],
        [0.085, -0.015, 0.306],
        [0.205, 0.035, 0.25],
      ];
      for (let i = 1; i < points.length; i++)
        crack.add(rod("#765e4e", points[i - 1], points[i], 0.022));
      crack.visible = false;
      break;
    }
    case "bird": {
      oval(tint || "#64a7b0", [-0.04, -0.09, 0], [0.86, 0.72, 0.63]);
      oval("#83b7b0", [0.14, 0.19, 0.015], [0.65, 0.64, 0.58]);
      oval("#e8dbb8", [0.13, -0.11, 0.19], [0.49, 0.52, 0.32]);
      const wing = leaf(
        "#457d8a",
        [-0.19, -0.025, 0.29],
        [0.63, 0.55, 0.66],
        -0.83,
      );
      wings.push(wing);
      leaf("#498791", [-0.39, 0.11, -0.14], [0.44, 0.48, 0.65], 0.91);
      mesh(
        shapes.cone,
        "#dda457",
        [0.46, 0.13, 0.14],
        [0.14, 0.26, 0.16],
      ).rotation.z = -Math.PI * 0.46;
      eyes(0.255, 0.246, 0.275, 0.082);
      for (const x of [-0.11, 0.11])
        rod("#ac794c", [x, -0.32, 0.06], [x - 0.018, -0.46, 0.15], 0.045);
      break;
    }
    case "boat":
      mesh(shapes.hull, "#ad6a40", [0, -0.23, 0], [1, 1, 1]);
      rod("#825e41", [0.055, -0.19, -0.055], [0.055, 0.7, -0.055], 0.046);
      mesh(shapes.sail, "#f3dca4", [-0.15, 0.23, -0.045], [0.72, 0.89, 0.7]);
      mesh(shapes.sail, "#d28a63", [0.22, 0.16, -0.045], [-0.47, 0.65, 0.7]);
      rod("#d8a676", [-0.82, -0.085, 0.14], [0.79, -0.09, 0.14], 0.045);
      break;
    case "lily": {
      const pad = mesh(
        shapes.lily,
        tint || "#719950",
        [0, -0.06, 0],
        [1.24, 1, 1.08],
      );
      pad.rotation.x = 0.6;
      pad.rotation.y = 0.24;
      for (let i = 0; i < 3; i++) {
        const petal = leaf(
          i === 1 ? "#fff1d8" : "#e8b2ac",
          [0.18 + i * 0.058, 0.05 + 0.012 * i, 0.22],
          [0.25, 0.27, 0.4],
          (i - 1) * 0.66,
        );
        petal.rotation.x = -0.11;
      }
      oval("#d9ad55", [0.24, 0.025, 0.26], [0.13, 0.1, 0.12]);
      break;
    }
    case "camera":
      block("#638981", [0, 0, 0], [1.07, 0.69, 0.38]);
      block("#d9c8a1", [0, 0.17, 0.19], [1.02, 0.2, 0.04]);
      block("#9d7854", [-0.23, 0.38, -0.015], [0.35, 0.13, 0.3]);
      oval("#354e50", [0.02, -0.04, 0.215], [0.5, 0.5, 0.19]);
      mesh(shapes.ring, "#ccb994", [0.02, -0.04, 0.3], [0.48, 0.48, 0.43]);
      oval("#566e76", [0.02, -0.04, 0.32], [0.3, 0.3, 0.092]);
      oval("#c6dfdb", [-0.044, 0.022, 0.37], [0.08, 0.08, 0.035]);
      block("#efe4bf", [0.32, 0.2, 0.23], [0.17, 0.12, 0.04]);
      break;
    case "sign":
      rod("#846443", [0, -0.57, 0], [0.012, 0.02, 0], 0.13);
      block("#ba9867", [0, 0.09, 0.02], [1.2, 0.64, 0.14]).rotation.z = -0.015;
      signFace = block("#f6e1ab", [0, 0.095, 0.093], [1.11, 0.55, 0.035]);
      for (const x of [-0.5, 0.5])
        oval("#987d52", [x, 0.095, 0.12], [0.041, 0.041, 0.026]);
      break;
    case "nut":
      oval("#946140", [0, -0.05, 0], [0.72, 0.85, 0.64]);
      oval("#bea47a", [0.004, -0.23, 0.21], [0.56, 0.35, 0.28]);
      mesh(shapes.cone, "#845635", [0, 0.37, 0], [0.38, 0.25, 0.32]);
      break;
  }

  if (!(actor.kind === "bear" || (actor.kind === "photo" && actor.picture))) {
    const bounds = new THREE.Box3().setFromObject(pieces);
    const center = bounds.getCenter(new THREE.Vector3()),
      size = bounds.getSize(new THREE.Vector3());
    const height = Math.max(0.1, size.y);
    pieces.scale.setScalar(1 / height);
    pieces.position.copy(center).multiplyScalar(-1 / height);
    width = size.x / height;
  }
  shadow.scale.set(width * 0.91, 0.13, 1);
  shadow.visible = actor.kind !== "sun" && actor.kind !== "moon";
  return {
    root,
    pose,
    signFace,
    shadow,
    sparks,
    embers,
    wings,
    feet,
    shellTop,
    fin,
    crack,
    fishSkin,
    get width() {
      return width;
    },
    get pending() {
      return imagePending;
    },
    dispose() {
      disposed = true;
      localTextures.forEach((t) => t.dispose());
      localMaterials.forEach((m) => m.dispose());
    },
  };
}

/** Project the front of the wooden panel, independent of the length of its post. */
export function projectActorLabel(
  model: ReturnType<typeof createPaperActor>, camera: THREE.Camera, viewportHeight: number,
  point: THREE.Vector3, edge: THREE.Vector3,
) {
  if (!model.signFace) {
    model.pose.getWorldPosition(point).project(camera);
    return undefined;
  }
  model.signFace.localToWorld(point.set(0, 0, 0.5)).project(camera);
  model.signFace.localToWorld(edge.set(0, 0.5, 0.5)).project(camera);
  return Math.abs(edge.y - point.y) * viewportHeight;
}
