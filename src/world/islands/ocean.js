// Animated ocean using a custom ShaderMaterial so wave displacement
// runs entirely on the GPU. The ocean mesh is a large plane far below
// the island; wave amplitude is small enough to read as gentle swell.
import * as pc from 'playcanvas';
import { buildMesh, meshEntity } from '../../core/meshBuilder.js';

const VERT = /* glsl */`
  attribute vec3 aPosition;
  attribute vec2 aUv0;
  uniform mat4 matrix_model;
  uniform mat4 matrix_viewProjection;
  uniform float uTime;
  varying vec3 vWorldPos;
  varying float vWave;
  varying vec2 vUv;

  float waveHeight(vec2 p) {
    float h = 0.0;
    h += sin(dot(p, vec2(0.075, 0.045)) + uTime * 0.65) * 0.55;
    h += sin(dot(p, vec2(-0.12, 0.085)) + uTime * 0.95) * 0.40;
    h += sin(dot(p, vec2(0.030, -0.065)) + uTime * 1.45) * 0.22;
    h += sin(dot(p, vec2(0.18, 0.10)) + uTime * 1.85) * 0.12;
    return h;
  }

  void main() {
    vec3 pos = aPosition;
    float h = waveHeight(pos.xz);
    pos.y += h;
    vWave = h;
    vUv = aUv0;
    vec4 worldPos = matrix_model * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = matrix_viewProjection * worldPos;
  }
`;

const FRAG = /* glsl */`
  precision highp float;
  uniform vec3 uColorDeep;
  uniform vec3 uColorShallow;
  uniform vec3 uSkyColor;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform float uTime;
  uniform vec3 uFogColor;
  uniform float uFogStart;
  uniform float uFogEnd;
  varying vec3 vWorldPos;
  varying float vWave;
  varying vec2 vUv;

  // Recover a pseudo-normal from finite differences of the wave function.
  vec3 waveNormal(vec2 p, float t) {
    float e = 0.6;
    float hL = sin(dot(p - vec2(e,0.0), vec2(0.075, 0.045)) + t * 0.65) * 0.55
             + sin(dot(p - vec2(e,0.0), vec2(-0.12, 0.085)) + t * 0.95) * 0.40
             + sin(dot(p - vec2(e,0.0), vec2(0.030, -0.065)) + t * 1.45) * 0.22;
    float hR = sin(dot(p + vec2(e,0.0), vec2(0.075, 0.045)) + t * 0.65) * 0.55
             + sin(dot(p + vec2(e,0.0), vec2(-0.12, 0.085)) + t * 0.95) * 0.40
             + sin(dot(p + vec2(e,0.0), vec2(0.030, -0.065)) + t * 1.45) * 0.22;
    float hD = sin(dot(p - vec2(0.0,e), vec2(0.075, 0.045)) + t * 0.65) * 0.55
             + sin(dot(p - vec2(0.0,e), vec2(-0.12, 0.085)) + t * 0.95) * 0.40
             + sin(dot(p - vec2(0.0,e), vec2(0.030, -0.065)) + t * 1.45) * 0.22;
    float hU = sin(dot(p + vec2(0.0,e), vec2(0.075, 0.045)) + t * 0.65) * 0.55
             + sin(dot(p + vec2(0.0,e), vec2(-0.12, 0.085)) + t * 0.95) * 0.40
             + sin(dot(p + vec2(0.0,e), vec2(0.030, -0.065)) + t * 1.45) * 0.22;
    vec3 n = normalize(vec3(hL - hR, 2.0, hD - hU));
    return n;
  }

  void main() {
    vec3 n = waveNormal(vWorldPos.xz, uTime);
    vec3 viewDir = normalize(view_position - vWorldPos);
    float fres = pow(1.0 - max(dot(viewDir, n), 0.0), 4.0);
    fres = clamp(fres, 0.0, 1.0);

    vec3 sky = mix(uSkyColor * 0.9, vec3(1.0), fres * 0.5);
    vec3 water = mix(uColorDeep, uColorShallow, smoothstep(-0.7, 0.7, vWave));

    // Large-scale colour patching — slow drifting current/depth patches so
    // the sea is never one uniform tone.
    float shade = sin(vUv.x * 0.55 + uTime * 0.05) * sin(vUv.y * 0.42 - uTime * 0.04);
    water *= 0.93 + shade * 0.07;
    water = mix(water, uColorShallow * 1.08, smoothstep(0.5, 1.0, shade) * 0.25);

    // Sun specular highlight (dual lobes: tight glint + broad sheen)
    vec3 reflDir = reflect(-uSunDir, n);
    float spec = pow(max(dot(reflDir, viewDir), 0.0), 48.0);
    float sheen = pow(max(dot(reflDir, viewDir), 0.0), 9.0) * 0.12;
    vec3 specular = uSunColor * (spec * 1.35 + sheen);

    // Foam crests
    float foam = smoothstep(0.85, 1.05, vWave);
    vec3 foamCol = vec3(0.92, 0.96, 0.95) * foam * 0.4;

    vec3 col = water + sky * (0.30 + fres * 0.38) + specular + foamCol;

    // Distance fog blends the far ocean into the horizon haze
    float dist = length(view_position - vWorldPos);
    float fog = clamp((dist - uFogStart) / (uFogEnd - uFogStart), 0.0, 1.0);
    col = mix(col, uFogColor, fog * 0.85);

    gl_FragColor = vec4(col, 0.93);
  }
`;

export function buildOcean(app, device, options = {}) {
  const size = options.size || 3200;
  const segments = options.segments || 140;

  const vertexCount = (segments + 1) * (segments + 1);
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const half = size / 2;
  const step = size / segments;
  let pi = 0;
  let ui = 0;
  for (let j = 0; j <= segments; j += 1) {
    for (let i = 0; i <= segments; i += 1) {
      positions[pi++] = -half + i * step;
      positions[pi++] = 0; // y=0 = sea level
      positions[pi++] = -half + j * step;
      uvs[ui++] = (i / segments) * 40;
      uvs[ui++] = (j / segments) * 40;
    }
  }
  const indices = new Uint32Array(segments * segments * 6);
  const rowLen = segments + 1;
  let ii = 0;
  for (let j = 0; j < segments; j += 1) {
    for (let i = 0; i < segments; i += 1) {
      const a = j * rowLen + i;
      const b = a + 1;
      const c = a + rowLen;
      const d = c + 1;
      indices[ii++] = a;
      indices[ii++] = c;
      indices[ii++] = b;
      indices[ii++] = b;
      indices[ii++] = c;
      indices[ii++] = d;
    }
  }

  const mesh = buildMesh(device, { positions, uvs, indices });

  const material = new pc.ShaderMaterial({
    uniqueName: 'FZOcean',
    attributes: { aPosition: pc.SEMANTIC_POSITION, aUv0: pc.SEMANTIC_TEXCOORD0 },
    vertexGLSL: VERT,
    fragmentGLSL: FRAG
  });
  material.setParameter('uColorDeep', new Float32Array([0.02, 0.15, 0.26]));
  material.setParameter('uColorShallow', new Float32Array([0.13, 0.50, 0.56]));
  material.setParameter('uSkyColor', new Float32Array([0.62, 0.78, 0.88]));
  material.setParameter('uSunColor', new Float32Array([1.0, 0.92, 0.72]));
  material.setParameter('uSunDir', new Float32Array([0.42, 0.66, 0.62]));
  material.setParameter('uFogColor', new Float32Array([0.66, 0.78, 0.86]));
  material.setParameter('uFogStart', 350);
  material.setParameter('uFogEnd', 2200);
  material.setParameter('uTime', 0);
  material.blendType = pc.BLEND_NORMAL;
  material.cull = pc.CULLFACE_BACK;
  material.update();

  const entity = meshEntity(app, 'Ocean', mesh, material, [0, 0, 0], [0, 0, 0], [1, 1, 1]);
  entity.render.castShadows = false;
  entity.render.receiveShadows = false;

  return {
    entity,
    material,
    update(dt, time, sunDir) {
      this.material.setParameter('uTime', time);
      if (sunDir) this.material.setParameter('uSunDir', new Float32Array([sunDir.x, sunDir.y, sunDir.z]));
    }
  };
}
