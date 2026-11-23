import * as THREE from "three";

export const GLSL_NOISE = /* glsl */ `
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p = p * 2.03 + vec2(17.1, 31.7);
      a *= 0.5;
    }
    return v;
  }
`;

export interface PondWaterOptions {
  baseTint?: THREE.ColorRepresentation;
  tintStrength?: number;
  reflectColor?: THREE.ColorRepresentation;
  shimmerColor?: THREE.ColorRepresentation;
  flowSpeed?: number;
}

export function createGooseMaterial(tex: THREE.Texture) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: { value: tex },
      uTime: { value: 0 },
      uSing: { value: 0 },
      uPaddle: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSing;
      uniform float uPaddle;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        // Arch upper-right neck & head skyward when singing ("曲项向天歌")
        float neckMask = smoothstep(0.36, 0.88, uv.y) * smoothstep(0.28, 0.72, uv.x);
        float singWave = sin(uTime * 4.2) * 0.045;
        pos.y += neckMask * (uSing * 0.24 + singWave * uSing);
        pos.x -= neckMask * uSing * 0.14;
        // Kick bottom orange webbed feet back-and-forth when paddling ("红掌拨清波")
        float footMask = smoothstep(0.22, 0.03, uv.y);
        pos.x += footMask * sin(uTime * 8.0) * (0.04 + uPaddle * 0.11);
        pos.y += footMask * cos(uTime * 8.0) * (uPaddle * 0.045);
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
}

export function createPondWaterMaterial(options: PondWaterOptions = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uGooseUv: { value: new THREE.Vector2(0.55, 0.78) },
      uReflectGlow: { value: 0.4 },
      uAspect: { value: 1.77 },
      uBaseTint: { value: new THREE.Color(options.baseTint ?? "#3f8776") },
      uTintStrength: { value: options.tintStrength ?? 0.0 },
      uReflectColor: { value: new THREE.Color(options.reflectColor ?? "#f8faee") },
      uShimmerColor: { value: new THREE.Color(options.shimmerColor ?? "#f5fcf0") },
      uFlowSpeed: { value: options.flowSpeed ?? 2.1 },
      uRipples: {
        value: [
          new THREE.Vector4(-10, -10, 10, 0),
          new THREE.Vector4(-10, -10, 10, 0),
          new THREE.Vector4(-10, -10, 10, 0),
          new THREE.Vector4(-10, -10, 10, 0),
        ],
      },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec2 uGooseUv;
      uniform float uReflectGlow;
      uniform float uAspect;
      uniform vec3 uBaseTint;
      uniform float uTintStrength;
      uniform vec3 uReflectColor;
      uniform vec3 uShimmerColor;
      uniform float uFlowSpeed;
      uniform vec4 uRipples[4];
      varying vec2 vUv;
      ${GLSL_NOISE}

      void main() {
        float topFade = smoothstep(1.0, 0.72, vUv.y);
        float wave = sin(vUv.y * 46.0 - uTime * uFlowSpeed + vnoise(vUv * 8.0 + uTime * 0.25) * 4.5);
        float shimmer = smoothstep(0.65, 1.0, wave) * 0.12 * topFade;

        // Soft highlight reflection column beneath focal boat/moon/goose
        vec2 reflDelta = (vUv - vec2(uGooseUv.x, uGooseUv.y - 0.14)) * vec2(1.0, 2.8);
        float reflDist = length(reflDelta);
        float reflWave = sin(vUv.y * 72.0 - uTime * 3.0) * 0.02;
        float refl = exp(-pow((reflDist + reflWave) * 5.2, 2.0)) * uReflectGlow * topFade;

        // Concentric interactive & ambient ripple rings
        float ringGlow = 0.0;
        float warmTint = 0.0;
        for (int i = 0; i < 4; i++) {
          vec4 rp = uRipples[i];
          if (rp.w > 0.01 && rp.z < 2.2) {
            vec2 d = vUv - rp.xy;
            d.x *= uAspect * 0.55;
            d.y *= 1.45;
            float dist = length(d);
            float radius = 0.02 + rp.z * 0.21;
            float fade = (1.0 - rp.z / 2.2) * rp.w;
            float r1 = exp(-pow((dist - radius) * 68.0, 2.0));
            float r2 = exp(-pow((dist - radius * 0.62) * 84.0, 2.0)) * 0.65;
            ringGlow += (r1 + r2) * fade;
            warmTint += (r1 + r2) * fade * smoothstep(0.5, 1.0, rp.w);
          }
        }

        vec3 col = uBaseTint * uTintStrength * (0.68 + 0.32 * (1.0 - vUv.y));
        col += uShimmerColor * shimmer;
        col += uReflectColor * refl * 0.52;
        vec3 ringCol = mix(uShimmerColor, vec3(1.0, 0.88, 0.66), clamp(warmTint, 0.0, 0.7));
        col += ringCol * ringGlow * 0.75;
        float alpha = clamp(uTintStrength * 0.58 + shimmer + refl * 0.45 + ringGlow * 0.78, 0.0, 0.84) * topFade;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

export interface SmokeMaterialOptions {
  lowColor?: THREE.ColorRepresentation;
  highColor?: THREE.ColorRepresentation;
  opacity?: number;
  speed?: number;
}

export function createSmokeMaterial(options: SmokeMaterialOptions = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: options.opacity ?? 0.7 },
      uSpeed: { value: options.speed ?? 0.28 },
      uLowColor: { value: new THREE.Color(options.lowColor ?? "#8f70c7") },
      uHighColor: { value: new THREE.Color(options.highColor ?? "#dec7f2") },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform float uSpeed;
      uniform vec3 uLowColor;
      uniform vec3 uHighColor;
      varying vec2 vUv;
      ${GLSL_NOISE}

      void main() {
        vec2 p = vUv;
        float sway = sin(p.y * 5.0 - uTime * 1.1) * 0.08 * p.y;
        float distX = abs((p.x - 0.5) + sway) / mix(0.24, 0.46, p.y);
        float mask = smoothstep(1.0, 0.15, distX) * smoothstep(0.0, 0.22, p.y) * smoothstep(1.0, 0.2, p.y);
        float n = fbm(vec2(p.x * 3.4 + sway * 2.0, p.y * 3.0 - uTime * uSpeed));
        float plume = smoothstep(0.32, 0.76, n) * mask;
        vec3 col = mix(uLowColor, uHighColor, p.y * 0.75 + n * 0.25);
        float alpha = plume * uOpacity;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

export function createWaterfallMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: 0.5 },
      uStarTint: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      uniform float uStarTint;
      varying vec2 vUv;
      ${GLSL_NOISE}

      void main() {
        float halfW = mix(0.32, 0.46, 1.0 - vUv.y);
        float edge = smoothstep(halfW, halfW * 0.28, abs(vUv.x - 0.5));
        float topSoft = smoothstep(1.0, 0.86, vUv.y);
        float botSoft = smoothstep(0.0, 0.16, vUv.y);

        float speed = mix(0.75, 1.45, clamp(uIntensity * 0.7, 0.0, 1.2));
        float n1 = fbm(vec2(vUv.x * 7.5, vUv.y * 4.4 + uTime * speed));
        float n2 = fbm(vec2(vUv.x * 13.0 + 3.1, vUv.y * 8.0 + uTime * speed * 1.45));
        float streaks = smoothstep(0.32, 0.78, n1 * 0.65 + n2 * 0.35);

        float foam = smoothstep(0.28, 0.02, vUv.y) * 0.38;
        vec3 baseCol = mix(vec3(0.76, 0.92, 0.96), vec3(0.99, 0.99, 0.98), streaks + foam);
        baseCol = mix(baseCol, vec3(0.86, 0.93, 1.0), uStarTint * 0.45);
        float alpha = edge * topSoft * botSoft * (0.45 + 0.55 * streaks + foam) * clamp(uIntensity, 0.0, 1.2);
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(baseCol, clamp(alpha, 0.0, 0.95));
      }
    `,
  });
}

export interface MilkyWayOptions {
  colorA?: THREE.ColorRepresentation;
  colorB?: THREE.ColorRepresentation;
  opacity?: number;
}

export function createMilkyWayMaterial(options: MilkyWayOptions = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uOpacity: { value: options.opacity ?? 0 },
      uColorA: { value: new THREE.Color(options.colorA ?? "#85b8ff") },
      uColorB: { value: new THREE.Color(options.colorB ?? "#fff5cc") },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying vec2 vUv;
      ${GLSL_NOISE}

      void main() {
        float curveX = mix(0.36, 0.92, pow(vUv.y, 0.82)) + sin(vUv.y * 5.0 + uTime * 0.4) * 0.03;
        float dist = abs(vUv.x - curveX);
        float width = mix(0.08, 0.24, vUv.y);
        float band = exp(-pow(dist / width, 2.0));
        float dust = fbm(vec2(vUv.x * 5.0 - uTime * 0.14, vUv.y * 5.5 + uTime * 0.22));
        float stars = smoothstep(0.74, 0.94, vnoise(vUv * 26.0 + uTime * 0.3)) * band;
        vec3 col = mix(uColorA, uColorB, dust * 0.65 + stars);
        float alpha = (band * (0.38 + dust * 0.45) + stars * 0.8) * smoothstep(0.0, 0.14, vUv.y) * uOpacity;
        if (alpha < 0.01) discard;
        gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
      }
    `,
  });
}

export function createFlutterSpriteMaterial(tex: THREE.Texture, sway = 0.04, phase = 0) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMap: { value: tex },
      uTime: { value: 0 },
      uSway: { value: sway },
      uPhase: { value: phase },
      uOpacity: { value: 1 },
      uBoost: { value: 0 },
    },
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uSway;
      uniform float uPhase;
      uniform float uBoost;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec3 pos = position;
        float bend = smoothstep(0.05, 0.95, 1.0 - uv.y * 0.7);
        float amp = uSway * (1.0 + uBoost * 1.4);
        pos.x += sin(uTime * 1.85 + uPhase + uv.y * 2.8) * amp * bend;
        pos.z += cos(uTime * 1.4 + uPhase + uv.x * 2.5) * amp * 0.55;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D uMap;
      uniform float uOpacity;
      uniform float uBoost;
      varying vec2 vUv;
      void main() {
        vec4 tex = texture2D(uMap, vUv);
        if (tex.a < 0.02) discard;
        tex.rgb += vec3(1.0, 0.95, 0.82) * (uBoost * 0.12) * tex.a;
        tex.a *= uOpacity;
        gl_FragColor = tex;
      }
    `,
  });
}

export function createSunRaysMaterial(
  color: THREE.ColorRepresentation = "#ffd97a",
  opacity = 0.52,
  origin = new THREE.Vector2(0.5, 0.5),
) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uOpacity: { value: opacity },
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOrigin: { value: origin.clone() },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uOpacity;
      uniform float uTime;
      uniform vec3 uColor;
      uniform vec2 uOrigin;
      varying vec2 vUv;
      void main() {
        vec2 d = vUv - uOrigin;
        float r = length(d) * 2.0;
        float angle = atan(d.y, d.x);
        float beams = 0.72 + 0.28 * sin(angle * 8.0 + uTime * 0.45);
        float glow = exp(-r * r * 3.2) * beams * smoothstep(1.05, 0.15, r);
        gl_FragColor = vec4(uColor, glow * uOpacity);
      }
    `,
  });
}

export function createMoonBeamMaterial(
  color: THREE.ColorRepresentation = "#cfe4ff",
  opacity = 0.36,
  origin = new THREE.Vector2(0.72, 0.84),
) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uOrigin: { value: origin.clone() },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uOpacity;
      uniform vec2 uOrigin;
      varying vec2 vUv;
      ${GLSL_NOISE}

      void main() {
        vec2 d = vUv - uOrigin;
        float coneDist = abs(d.x + d.y * 0.42);
        float spread = 0.08 + max(0.0, -d.y) * 0.56;
        float cone = smoothstep(spread, spread * 0.16, coneDist);
        float vertical = smoothstep(0.05, 0.42, vUv.y) * smoothstep(1.0, 0.65, vUv.y);
        float dust = smoothstep(0.45, 0.9, vnoise(vUv * 12.0 + vec2(0.0, -uTime * 0.22)));
        float alpha = cone * vertical * (0.68 + dust * 0.32) * uOpacity;
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.68));
      }
    `,
  });
}

export function createWindRibbonMaterial(
  color: THREE.ColorRepresentation = "#eaf7f2",
  opacity = 0.46,
) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uSpeed: { value: 0.78 },
      uColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uSpeed;
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec2 vUv;

      void main() {
        float x = vUv.x;
        float wave1 = sin(x * 8.5 - uTime * uSpeed * 3.1) * 0.14 + 0.58;
        float wave2 = sin(x * 6.0 - uTime * uSpeed * 2.4 + 1.8) * 0.11 + 0.36;
        float r1 = exp(-pow((vUv.y - wave1) * 20.0, 2.0));
        float r2 = exp(-pow((vUv.y - wave2) * 24.0, 2.0));
        float dash1 = smoothstep(-0.2, 0.7, sin(x * 11.0 - uTime * uSpeed * 4.5));
        float dash2 = smoothstep(-0.1, 0.8, sin(x * 9.0 - uTime * uSpeed * 3.8 + 1.2));
        float edgeFade = smoothstep(0.0, 0.16, x) * smoothstep(1.0, 0.82, x);
        float alpha = (r1 * dash1 + r2 * dash2 * 0.8) * edgeFade * uOpacity;
        gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.78));
      }
    `,
  });
}

export function createSkyMoodMaterial(
  topColor: THREE.ColorRepresentation,
  bottomColor: THREE.ColorRepresentation,
  opacity = 0.26,
) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uTopColor: { value: new THREE.Color(topColor) },
      uBottomColor: { value: new THREE.Color(bottomColor) },
      uOpacity: { value: opacity },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uTopColor;
      uniform vec3 uBottomColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        vec3 col = mix(uBottomColor, uTopColor, smoothstep(0.08, 0.92, vUv.y));
        float edgeMask = smoothstep(0.0, 0.22, vUv.y);
        gl_FragColor = vec4(col, uOpacity * (0.65 + 0.35 * edgeMask));
      }
    `,
  });
}
