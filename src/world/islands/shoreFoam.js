// Shore foam — an animated foam band hugging each island's ACTUAL waterline.
//
// For every angle around an island we march the island's own terrain height
// function to find where the shore crosses sea level, then build a ring mesh
// that follows that contour (including harbour channels and coast noise). A
// custom shader animates translucent foam that washes in and out. No
// depth-buffer tricks, no per-frame CPU work.
import * as pc from 'playcanvas';
import { buildMesh, meshEntity } from '../../core/meshBuilder.js';

const VERT = /* glsl */`
  attribute vec3 aPosition;
  attribute vec2 aUv0;
  uniform mat4 matrix_model;
  uniform mat4 matrix_viewProjection;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main() {
    vec4 worldPos = matrix_model * vec4(aPosition, 1.0);
    vUv = aUv0;
    vWorldPos = worldPos.xyz;
    gl_Position = matrix_viewProjection * worldPos;
  }
`;

const FRAG = /* glsl */`
  precision highp float;
  uniform float uTime;
  uniform vec3 uFoamColor;
  varying vec2 vUv;

  void main() {
    float u = vUv.x;   // 0 = waterline (inner) → 1 = outer fade
    float v = vUv.y;   // 0..1 around the island

    // Wash bands travelling outward, strongest at the inner edge.
    float bands = sin(v * 46.0 - uTime * 0.9 + sin(v * 17.0 + uTime * 0.35) * 1.6);
    bands = smoothstep(-0.25, 1.0, bands);

    // Pulse: foam pushes out and retreats.
    float pulse = 0.5 + 0.5 * sin(uTime * 0.55 + v * 12.0);

    // Radial falloff: bright at the waterline, fading outward.
    float falloff = pow(1.0 - u, 1.5);
    float alpha = falloff * (0.55 + 0.45 * bands) * (0.6 + 0.4 * pulse);

    // Break the band into patches so it reads as foam, not a tube.
    float shade = smoothstep(0.05, 0.85,
      sin(v * 60.0 + sin(v * 23.0 - uTime * 0.4) * 2.2) * 0.5 + 0.5);
    alpha *= 0.45 + 0.55 * shade;
    alpha = clamp(alpha * 2.0, 0.0, 0.95);

    gl_FragColor = vec4(uFoamColor, alpha);
  }
`;

// Find the sea-level crossing radius multiplier for one bearing angle.
// Marches the island's world-space height function between m0 and m1.
function waterlineMultiplier(height, cx, cz, rx, rz, cosA, sinA) {
  const m0 = 0.78;
  const m1 = 1.55;
  const step = 0.025;
  let prevM = m0;
  let prevH = height(cx + cosA * rx * m0, cz + sinA * rz * m0);
  for (let m = m0 + step; m <= m1; m += step) {
    const h = height(cx + cosA * rx * m, cz + sinA * rz * m);
    if (prevH > 0 && h <= 0) {
      // Linear interpolation of the crossing point.
      const t = prevH / (prevH - h);
      return prevM + (m - prevM) * t;
    }
    prevM = m;
    prevH = h;
  }
  return null; // no shoreline on this bearing (should not happen)
}

// Build one waterline-following foam ring for an island.
function buildRing(device, def, height) {
  const { cx, cz, rx, rz } = def;
  const steps = 160;
  const radial = 5;
  const SEA_Y = 0.24;

  const inner = [];
  for (let i = 0; i < steps; i += 1) {
    const a = (i / steps) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const m = waterlineMultiplier(height, cx, cz, rx, rz, ca, sa);
    // No crossing found — collapse this column to the ellipse default so
    // the ring stays closed.
    inner.push(m === null ? 1.02 : m);
  }

  const positions = [];
  const uvs = [];
  const indices = [];
  for (let j = 0; j <= radial; j += 1) {
    const t = j / radial; // 0 at waterline → 1 outer
    const grow = 1 + t * 0.17;
    for (let i = 0; i <= steps; i += 1) {
      const a = (i / steps) * Math.PI * 2;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const m = inner[i] * grow;
      // Ring is authored in WORLD space (entity sits at the origin).
      positions.push(cx + ca * rx * m, SEA_Y, cz + sa * rz * m);
      uvs.push(t, i / steps);
    }
  }
  const rowLen = steps + 1;
  for (let j = 0; j < radial; j += 1) {
    for (let i = 0; i < steps; i += 1) {
      const a = j * rowLen + i;
      const b = a + 1;
      const c = a + rowLen;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }
  return buildMesh(device, {
    positions: new Float32Array(positions),
    uvs: new Float32Array(uvs),
    indices: new Uint32Array(indices)
  });
}

// Public API: build foam rings for every island.
// islandEntries: [{ def, height }] — height = world-space terrain function.
export function buildShoreFoam(app, device, islandEntries) {
  const material = new pc.ShaderMaterial({
    uniqueName: 'FZShoreFoam',
    attributes: { aPosition: pc.SEMANTIC_POSITION, aUv0: pc.SEMANTIC_TEXCOORD0 },
    vertexGLSL: VERT,
    fragmentGLSL: FRAG
  });
  material.setParameter('uTime', 0);
  material.setParameter('uFoamColor', new Float32Array([0.98, 1.0, 0.99]));
  material.blendType = pc.BLEND_NORMAL;
  material.cull = pc.CULLFACE_NONE;
  material.depthWrite = false;
  material.update();

  const entities = [];
  for (const { def, height } of islandEntries) {
    const mesh = buildRing(device, def, height);
    const e = meshEntity(app, `${def.name} Shore Foam`, mesh, material,
      [0, 0, 0], [0, 0, 0], [1, 1, 1]);
    e.render.castShadows = false;
    e.render.receiveShadows = false;
    entities.push(e);
  }

  return {
    entities,
    update(time) {
      material.setParameter('uTime', time);
    }
  };
}
