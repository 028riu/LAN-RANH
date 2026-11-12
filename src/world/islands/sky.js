// Sky dome — a large inverted sphere with a gradient shader. The dome
// follows the camera so the horizon never rolls off-screen. We also draw
// a soft sun disk in the fragment shader, matched to the directional light
// direction so the sun and the bright spot in the sky align.
//
// V3: this module also builds the stylized cloud layer — a handful of
// puffy cloud clusters (merged primitive batches, one material) that drift
// slowly around the world centre. Clouds sit below the sky dome and above
// the fog so they haze out naturally near the horizon.
import * as pc from 'playcanvas';
import { buildMesh, meshEntity, pbrMaterial } from '../../core/meshBuilder.js';
import { makePRNG } from '../../core/mathUtils.js';

const VERT = /* glsl */`
  attribute vec3 aPosition;
  uniform mat4 matrix_model;
  uniform mat4 matrix_viewProjection;
  varying vec3 vDir;
  void main() {
    vec4 worldPos = matrix_model * vec4(aPosition, 1.0);
    vDir = normalize(aPosition);
    gl_Position = matrix_viewProjection * worldPos;
    gl_Position.z = gl_Position.w; // pin sky to far plane
  }
`;

const FRAG = /* glsl */`
  precision highp float;
  uniform vec3 uZenith;
  uniform vec3 uHorizon;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform float uSunIntensity;
  varying vec3 vDir;

  void main() {
    vec3 dir = normalize(vDir);
    float h = clamp(dir.y, 0.0, 1.0);
    // Smooth gradient from horizon up to zenith
    float t = pow(h, 0.55);
    vec3 sky = mix(uHorizon, uZenith, t);

    // Sun disk + glow
    float sunDot = max(dot(dir, normalize(uSunDir)), 0.0);
    float disk = smoothstep(0.9985, 0.9995, sunDot);
    float glow = pow(sunDot, 220.0);
    float halo = pow(sunDot, 12.0) * 0.35;
    sky += uSunColor * (disk * 1.0 + glow * 1.2 + halo);

    // Subtle horizon haze band
    float horizonBand = exp(-h * 8.0) * 0.25;
    sky += vec3(1.0, 0.95, 0.85) * horizonBand;

    gl_FragColor = vec4(sky, 1.0);
  }
`;

export function buildSky(app, device, options = {}) {
  // Use a high-subdivision sphere (inverted so we see it from inside)
  const radius = options.radius || 4000;
  const segments = 32;
  const rings = 24;

  const positions = [];
  for (let r = 0; r <= rings; r += 1) {
    const theta = (r / rings) * Math.PI; // 0..PI from top to bottom
    const y = Math.cos(theta);
    const ringR = Math.sin(theta);
    for (let s = 0; s <= segments; s += 1) {
      const phi = (s / segments) * Math.PI * 2;
      const x = ringR * Math.cos(phi);
      const z = ringR * Math.sin(phi);
      positions.push(x * radius, y * radius, z * radius);
    }
  }
  const indices = [];
  for (let r = 0; r < rings; r += 1) {
    for (let s = 0; s < segments; s += 1) {
      const a = r * (segments + 1) + s;
      const b = a + segments + 1;
      // Inverted winding so we see it from inside
      indices.push(a, b, a + 1);
      indices.push(a + 1, b, b + 1);
    }
  }

  const mesh = buildMesh(device, { positions: new Float32Array(positions), indices: new Uint32Array(indices) });

  const material = new pc.ShaderMaterial({
    uniqueName: 'FZSkyDome',
    attributes: { aPosition: pc.SEMANTIC_POSITION },
    vertexGLSL: VERT,
    fragmentGLSL: FRAG
  });
  material.setParameter('uZenith', new Float32Array([0.20, 0.45, 0.78]));
  material.setParameter('uHorizon', new Float32Array([0.78, 0.86, 0.92]));
  material.setParameter('uSunColor', new Float32Array([1.0, 0.95, 0.78]));
  material.setParameter('uSunIntensity', 1.0);
  material.setParameter('uSunDir', new Float32Array([0.42, 0.66, 0.62]));
  material.cull = pc.CULLFACE_FRONT; // see the inside of the sphere
  material.depthWrite = false;
  material.depthTest = false;
  material.update();

  const entity = meshEntity(app, 'Sky Dome', mesh, material, [0, 0, 0], [0, 0, 0], [1, 1, 1]);

  return {
    entity,
    material,
    setSunDirection(dir) {
      this.material.setParameter('uSunDir', new Float32Array([dir.x, dir.y, dir.z]));
    },
    follow(camera) {
      const cp = camera.getPosition();
      this.entity.setPosition(cp.x, cp.y, cp.z);
    }
  };
}

// ---------------------------------------------------------------------------
// Stylized cloud layer — puffy merged-primitive clusters drifting slowly.
// ---------------------------------------------------------------------------
export function buildClouds(app, device, options = {}) {
  const rng = makePRNG(options.seed || 9182);
  const count = options.count || 9;
  const innerR = options.innerRadius || 700;
  const outerR = options.outerRadius || 1600;
  const hMin = 120;
  const hMax = 220;

  // One soft material for all clouds (no shadows). The strong emissive
  // share keeps the underside pale instead of mud-grey when seen from
  // below against the sky.
  const cloudMat = pbrMaterial({
    color: [0.82, 0.84, 0.9],
    emissive: new pc.Color(0.72, 0.74, 0.8),
    roughness: 1.0,
    metalness: 0.0
  });

  const clouds = [];
  for (let c = 0; c < count; c += 1) {
    const puffs = 4 + Math.floor(rng() * 4);
    const positions = [];
    const indices = [];
    let base = 0;
    for (let p = 0; p < puffs; p += 1) {
      // Row of overlapping flattened spheres, widest in the middle.
      const t = (p + 0.5) / puffs;
      const spread = (t - 0.5) * 2;
      const px = spread * (14 + rng() * 8);
      const py = Math.sin(t * Math.PI) * (4 + rng() * 3);
      const pz = (rng() - 0.5) * 6;
      const r = (0.55 + Math.sin(t * Math.PI) * 0.75) * (10 + rng() * 6);
      // Low-poly sphere, flattened (cloud profile).
      const wSeg = 9;
      const hSeg = 6;
      for (let y = 0; y <= hSeg; y += 1) {
        const v = y / hSeg;
        const phi = v * Math.PI;
        for (let x = 0; x <= wSeg; x += 1) {
          const u = x / wSeg;
          const theta = u * Math.PI * 2;
          const nx = Math.sin(phi) * Math.cos(theta);
          const ny = Math.cos(phi);
          const nz = Math.sin(phi) * Math.sin(theta);
          positions.push(px + nx * r, py + ny * r * 0.55, pz + nz * r * 0.8);
        }
      }
      for (let y = 0; y < hSeg; y += 1) {
        for (let x = 0; x < wSeg; x += 1) {
          const a = base + y * (wSeg + 1) + x;
          const b = a + 1;
          const cc = a + (wSeg + 1);
          const d = cc + 1;
          indices.push(a, cc, b);
          indices.push(b, cc, d);
        }
      }
      base += (wSeg + 1) * (hSeg + 1);
    }
    const mesh = buildMesh(device, {
      positions: new Float32Array(positions),
      indices: new Uint32Array(indices)
    });
    const e = meshEntity(app, `Cloud ${c}`, mesh, cloudMat, [0, 0, 0], [0, 0, 0], [1, 1, 1]);
    e.render.castShadows = false;
    e.render.receiveShadows = false;

    const angle = rng() * Math.PI * 2;
    const radius = innerR + rng() * (outerR - innerR);
    const height = hMin + rng() * (hMax - hMin);
    clouds.push({ entity: e, angle, radius, height, speed: 0.004 + rng() * 0.006, scale: 1.4 + rng() * 1.6 });
    e.setLocalScale(clouds[c].scale, clouds[c].scale * 0.8, clouds[c].scale);
  }

  return {
    clouds,
    update(time) {
      for (const c of clouds) {
        const a = c.angle + time * c.speed;
        c.entity.setPosition(Math.cos(a) * c.radius, c.height, Math.sin(a) * c.radius);
      }
    }
  };
}
