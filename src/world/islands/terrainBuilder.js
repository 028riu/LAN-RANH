// Parametric island terrain.
//
// Each island is described by an IslandTerrainDef: centre, elliptical
// radii, a height profile (peak, beach, shelf + feature bumps/valleys)
// and a colour palette. From that definition we get:
//
//   - height(x, z)  — the same function used for rendering AND collision
//   - slope(x, z)   — approximate gradient magnitude
//   - colorAt(...)  — vertex colours themed per island
//   - build(app, device) — the render mesh
//
// The Pirate Starter Island keeps its original hand-tuned height function
// so the existing settlement layout remains valid.
import * as pc from 'playcanvas';
import { fbm2D } from '../../core/mathUtils.js';
import { buildMesh, meshEntity, pbrMaterial } from '../../core/meshBuilder.js';

// Smooth gaussian-style bump used by all feature shaping.
export function bump(x, z, feature) {
  const dx = x - feature.x;
  const dz = z - feature.z;
  const r2 = feature.radius * feature.radius;
  const d2 = dx * dx + dz * dz;
  if (d2 >= r2) return 0;
  const t = 1 - d2 / r2;
  return (feature.height || 1) * t * t;
}

// ---------------------------------------------------------------------------
// Pirate Starter Island — original hand-tuned profile (unchanged)
// ---------------------------------------------------------------------------

const STARTER = {
  rx: 170,
  rz: 150,
  features: {
    lookout: { x: 80, z: 0, height: 9, radius: 70 },
    captain: { x: 48, z: 42, height: 2.6, radius: 28 },
    cove: { x: -112, z: -88, depth: 2.4, radius: 36 }
  }
};

function starterHeight(x, z) {
  const u = x / STARTER.rx;
  const v = z / STARTER.rz;
  const d = Math.sqrt(u * u + v * v);

  const coastNoise = fbm2D(x * 0.008 + 11.2, z * 0.008 - 7.3, 3, 2.0, 0.55) - 0.5;
  const dEff = d * (1 - 0.18 * coastNoise);

  let h;
  if (dEff < 0.85) {
    h = 6.5 * (1 - dEff * dEff * 0.72);
  } else if (dEff < 1.02) {
    const t = (1.02 - dEff) / 0.17;
    h = 0.4 + 1.6 * t;
  } else {
    h = 0.4 - (dEff - 1.02) * 6.5;
  }

  h += (fbm2D(x * 0.045 + 5.1, z * 0.045 - 3.7, 3, 2.0, 0.5) - 0.5) * 1.4;
  h += (fbm2D(x * 0.012 - 2.4, z * 0.012 + 8.9, 2, 2.0, 0.6) - 0.5) * 1.2;

  h += bump(x, z, STARTER.features.lookout);
  h += bump(x, z, STARTER.features.captain);

  const f = STARTER.features.cove;
  const coveDx = x - f.x;
  const coveDz = z - f.z;
  const coveR2 = f.radius * f.radius;
  if (coveDx * coveDx + coveDz * coveDz < coveR2) {
    const t = 1 - (coveDx * coveDx + coveDz * coveDz) / coveR2;
    h -= f.depth * t * t;
  }

  // Harbour channel: carve a smooth trench up the north access so deep
  // water reaches the dock (a natural inlet between sand banks).
  if (z > 122) {
    const bank = Math.exp(-((x * x) / (2 * 20 * 20)));
    const depthT = Math.min(1, (z - 122) / 26);
    h -= 3.4 * bank * depthT * depthT;
  }

  return Math.max(h, -9.5);
}

// ---------------------------------------------------------------------------
// Generic parametric profile for the other islands
// ---------------------------------------------------------------------------

// cfg: {
//   rx, rz, seed,
//   peak: base interior height,
//   beachWidth, shelfDrop, coastVariation,
//   detail, undulation,   // noise amplitudes
//   bumps: [{x, z, height, radius}],   // local coords relative to centre
//   valleys: [{x, z, depth, radius}],
//   plateau: {radius, height} | null,  // flat top mound (volcanoes)
// }
function makeParametricHeight(cfg) {
  const s = cfg.seed || 1;
  return function height(x, z) {
    const lx = x - cfg.cx;
    const lz = z - cfg.cz;
    const u = lx / cfg.rx;
    const v = lz / cfg.rz;
    const d = Math.sqrt(u * u + v * v);

    const coastNoise = fbm2D(x * 0.008 + s * 3.1, z * 0.008 - s * 2.7, 3, 2.0, 0.55) - 0.5;
    const dEff = d * (1 - (cfg.coastVariation ?? 0.16) * coastNoise);

    let h;
    const beach = cfg.beachWidth ?? 0.17;
    const inner = 1.02 - beach;
    if (dEff < inner) {
      h = (cfg.peak ?? 6) * (1 - dEff * dEff * 0.72);
    } else if (dEff < 1.02) {
      const t = (1.02 - dEff) / beach;
      h = 0.4 + (cfg.beachRise ?? 1.6) * t;
    } else {
      h = 0.4 - (dEff - 1.02) * (cfg.shelfDrop ?? 6.5);
    }

    h += (fbm2D(x * 0.045 + s * 7.7, z * 0.045 - s * 4.9, 3, 2.0, 0.5) - 0.5) * (cfg.detail ?? 1.4);
    h += (fbm2D(x * 0.012 - s * 1.3, z * 0.012 + s * 5.6, 2, 2.0, 0.6) - 0.5) * (cfg.undulation ?? 1.2);

    for (const b of cfg.bumps || []) {
      h += bump(lx, lz, b);
    }
    for (const vv of cfg.valleys || []) {
      h -= bump(lx, lz, vv);
    }

    // Crater / plateau: raise a mound then carve a caldera bowl.
    if (cfg.plateau) {
      const p = cfg.plateau;
      h += bump(lx, lz, { x: p.x || 0, z: p.z || 0, height: p.height, radius: p.radius });
      const cr = bump(lx, lz, { x: p.x || 0, z: p.z || 0, height: -p.craterDepth, radius: p.craterRadius });
      h += cr;
    }

    return Math.max(h, -9.5);
  };
}

// ---------------------------------------------------------------------------
// Palettes
// ---------------------------------------------------------------------------

export const TERRAIN_PALETTES = {
  tropical: {
    deep: [0.24, 0.30, 0.38],
    wetSand: [0.58, 0.51, 0.34],
    sand: [0.86, 0.79, 0.56],
    grass: [0.27, 0.48, 0.21],
    dryGrass: [0.43, 0.51, 0.22],
    rock: [0.44, 0.42, 0.38]
  },
  jungle: {
    deep: [0.16, 0.26, 0.30],
    wetSand: [0.42, 0.42, 0.30],
    sand: [0.62, 0.60, 0.42],
    grass: [0.13, 0.36, 0.15],
    dryGrass: [0.24, 0.40, 0.16],
    rock: [0.30, 0.32, 0.27]
  },
  desert: {
    deep: [0.42, 0.40, 0.30],
    wetSand: [0.68, 0.58, 0.38],
    sand: [0.91, 0.82, 0.58],
    grass: [0.72, 0.66, 0.40],
    dryGrass: [0.78, 0.68, 0.42],
    rock: [0.62, 0.50, 0.36]
  },
  snow: {
    deep: [0.30, 0.42, 0.50],
    wetSand: [0.60, 0.64, 0.66],
    sand: [0.85, 0.87, 0.88],
    grass: [0.78, 0.82, 0.84],
    dryGrass: [0.70, 0.76, 0.78],
    rock: [0.40, 0.42, 0.46]
  },
  volcanic: {
    deep: [0.16, 0.14, 0.16],
    wetSand: [0.28, 0.24, 0.24],
    sand: [0.36, 0.30, 0.30],
    grass: [0.30, 0.26, 0.26],
    dryGrass: [0.38, 0.30, 0.28],
    rock: [0.20, 0.18, 0.19]
  }
};

function lerp3(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

function makeColorAt(paletteName, tintSnowLine = null) {
  const P = TERRAIN_PALETTES[paletteName] || TERRAIN_PALETTES.tropical;
  // slope is passed in by the caller (computed once per vertex).
  return function colorAt(x, z, h, slope) {
    let r, g, b;
    if (h < -0.2) {
      const t = Math.max(0, Math.min(1, (h + 4) / 4));
      const mixed = lerp3(P.deep, P.wetSand, t);
      r = mixed[0]; g = mixed[1]; b = mixed[2];
    } else if (h < 1.6) {
      const t = Math.max(0, Math.min(1, (h + 0.2) / 1.8));
      const mixed = lerp3(P.sand, P.grass, smoothstep01(t));
      r = mixed[0]; g = mixed[1]; b = mixed[2];
      // Wet-sand band: the strip just above the waterline is darker and
      // glossier-looking, then dries out over ~0.7 m of elevation.
      const wet = 1 - smoothstep01((h - 0.15) / 0.7);
      if (wet > 0) {
        r = r + (P.wetSand[0] - r) * wet * 0.85;
        g = g + (P.wetSand[1] - g) * wet * 0.85;
        b = b + (P.wetSand[2] - b) * wet * 0.85;
      }
    } else if (h < 6.6) {
      const t = Math.max(0, Math.min(1, (h - 1.6) / 5.0));
      const mixed = lerp3(P.grass, P.dryGrass, smoothstep01(t));
      r = mixed[0]; g = mixed[1]; b = mixed[2];
    } else {
      // Rocky only on true peaks (the highest lookouts), keeping the
      // settlement hills green — V2 turned everything above 5 m grey.
      const t = Math.max(0, Math.min(1, (h - 6.6) / 6.0));
      const mixed = lerp3(P.dryGrass, P.rock, smoothstep01(t) * 0.9);
      r = mixed[0]; g = mixed[1]; b = mixed[2];
    }

    // Optional snow cap above a given elevation
    if (tintSnowLine !== null && h > tintSnowLine) {
      const t = Math.max(0, Math.min(1, (h - tintSnowLine) / 2.5));
      r = r + (0.92 - r) * t;
      g = g + (0.94 - g) * t;
      b = b + (0.96 - b) * t;
    }

    const slopeFactor = smoothstep01((slope - 0.65) / 0.7);
    r = r + (P.rock[0] - r) * slopeFactor;
    g = g + (P.rock[1] - g) * slopeFactor;
    b = b + (P.rock[2] - b) * slopeFactor;

    // Large soft grass patchiness + fine grain noise.
    const variation = fbm2D(x * 0.18 + 3.3, z * 0.18 - 1.7, 2, 2.0, 0.55) - 0.5;
    const patchy = fbm2D(x * 0.05 + 9.1, z * 0.05 - 4.2, 2, 2.0, 0.5) - 0.5;
    r = Math.max(0, Math.min(1, r + variation * 0.075 + patchy * 0.085));
    g = Math.max(0, Math.min(1, g + variation * 0.09 + patchy * 0.095));
    b = Math.max(0, Math.min(1, b + variation * 0.06 + patchy * 0.07));

    return [r, g, b];
  };
}

function smoothstep01(t) {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

// ---------------------------------------------------------------------------
// Island terrain definition object
// ---------------------------------------------------------------------------

export function createIslandTerrainDef(cfg) {
  let heightFn;
  let colorFn;

  if (cfg.kind === 'starter') {
    heightFn = starterHeight;
    colorFn = makeColorAt('tropical');
  } else {
    heightFn = makeParametricHeight(cfg);
    colorFn = makeColorAt(cfg.palette || 'tropical', cfg.snowLine ?? null);
  }

  function height(x, z) {
    return heightFn(x, z);
  }

  function slope(x, z) {
    const e = 1.5;
    const hL = heightFn(x - e, z);
    const hR = heightFn(x + e, z);
    const hD = heightFn(x, z - e);
    const hU = heightFn(x, z + e);
    const dx = (hR - hL) / (2 * e);
    const dz = (hU - hD) / (2 * e);
    return Math.sqrt(dx * dx + dz * dz);
  }

  // Rough containment test — inside the island ellipse (coast noise makes
  // the true edge fuzzy; containment is used for island lookup only).
  function contains(x, z, margin = 1.18) {
    const lx = x - cfg.cx;
    const lz = z - cfg.cz;
    const u = lx / cfg.rx;
    const v = lz / cfg.rz;
    const d = Math.sqrt(u * u + v * v);
    return d < margin;
  }

  function build(app, device, segments) {
    const size = cfg.meshSize || 700;
    const seg = segments || cfg.meshSegments || 180;
    const half = size / 2;
    const step = size / seg;
    // The mesh is authored in LOCAL island coords and the entity is placed
    // at the island centre — height/colour are sampled in WORLD space.
    const ox = cfg.cx || 0;
    const oz = cfg.cz || 0;

    const vertexCount = (seg + 1) * (seg + 1);
    const positions = new Float32Array(vertexCount * 3);
    const colors = new Float32Array(vertexCount * 4);
    const uvs = new Float32Array(vertexCount * 2);

    let pi = 0;
    let ci = 0;
    let ui = 0;
    for (let j = 0; j <= seg; j += 1) {
      for (let i = 0; i <= seg; i += 1) {
        const x = -half + i * step;
        const z = -half + j * step;
        const wx = x + ox;
        const wz = z + oz;
        const y = height(wx, wz);
        positions[pi] = x;
        positions[pi + 1] = y;
        positions[pi + 2] = z;
        pi += 3;

        const c = colorFn(wx, wz, y, slope(wx, wz));
        colors[ci] = c[0];
        colors[ci + 1] = c[1];
        colors[ci + 2] = c[2];
        colors[ci + 3] = 1.0;
        ci += 4;

        uvs[ui] = i / seg;
        uvs[ui + 1] = j / seg;
        ui += 2;
      }
    }

    const indexCount = seg * seg * 6;
    const indices = new Uint32Array(indexCount);
    let ii = 0;
    const rowLen = seg + 1;
    for (let j = 0; j < seg; j += 1) {
      for (let i = 0; i < seg; i += 1) {
        const a = j * rowLen + i;
        const b = a + 1;
        const c = a + rowLen;
        const d = c + 1;
        indices[ii] = a;
        indices[ii + 1] = c;
        indices[ii + 2] = b;
        indices[ii + 3] = b;
        indices[ii + 4] = c;
        indices[ii + 5] = d;
        ii += 6;
      }
    }

    const mesh = buildMesh(device, { positions, colors, uvs, indices });
    // Diffuse must be pure white: PlayCanvas multiplies the material colour
    // by the vertex colours, so any tint here would shift every palette.
    const material = pbrMaterial({
      color: [1, 1, 1],
      roughness: 1.0,
      metalness: 0.0,
      useVertexColors: true
    });
    material.diffuseVertexColor = true;
    const entity = meshEntity(app, `${cfg.name} Terrain`, mesh, material, [cfg.cx || 0, 0, cfg.cz || 0], [0, 0, 0], [1, 1, 1]);
    entity.render.castShadows = false;
    entity.render.receiveShadows = true;
    return { entity, mesh, material };
  }

  return {
    cfg,
    height,
    slope,
    contains,
    build
  };
}
