// Compute shoreline local +Z positions for the 4 parametric islands.
import { fbm2D } from '../src/core/mathUtils.js';

function bump(x, z, f) {
  const dx = x - f.x, dz = z - f.z;
  const d2 = dx * dx + dz * dz;
  if (d2 >= f.radius * f.radius) return 0;
  const t = 1 - d2 / (f.radius * f.radius);
  return (f.height || 1) * t * t;
}

function makeHeight(cfg) {
  return function height(lx, lz) {
    const u = lx / cfg.rx, v = lz / cfg.rz;
    const d = Math.sqrt(u * u + v * v);
    const s = cfg.seed;
    const coastNoise = fbm2D((lx + cfg.cx) * 0.008 + s * 3.1, (lz + cfg.cz) * 0.008 - s * 2.7, 3, 2.0, 0.55) - 0.5;
    const dEff = d * (1 - (cfg.coastVariation ?? 0.16) * coastNoise);
    let h;
    const beach = cfg.beachWidth ?? 0.17;
    const inner = 1.02 - beach;
    if (dEff < inner) h = (cfg.peak ?? 6) * (1 - dEff * dEff * 0.72);
    else if (dEff < 1.02) { const t = (1.02 - dEff) / beach; h = 0.4 + (cfg.beachRise ?? 1.6) * t; }
    else h = 0.4 - (dEff - 1.02) * (cfg.shelfDrop ?? 6.5);
    h += (fbm2D((lx + cfg.cx) * 0.045 + s * 7.7, (lz + cfg.cz) * 0.045 - s * 4.9, 3, 2.0, 0.5) - 0.5) * (cfg.detail ?? 1.4);
    h += (fbm2D((lx + cfg.cx) * 0.012 - s * 1.3, (lz + cfg.cz) * 0.012 + s * 5.6, 2, 2.0, 0.6) - 0.5) * (cfg.undulation ?? 1.2);
    for (const b of cfg.bumps || []) h += bump(lx, lz, b);
    for (const vv of cfg.valleys || []) h -= bump(lx, lz, vv);
    if (cfg.plateau) {
      const p = cfg.plateau;
      h += bump(lx, lz, { x: p.x || 0, z: p.z || 0, height: p.height, radius: p.radius });
      h += bump(lx, lz, { x: p.x || 0, z: p.z || 0, height: -p.craterDepth, radius: p.craterRadius });
    }
    return Math.max(h, -9.5);
  };
}

const islands = {
  jungle: { seed: 2, cx: -680, cz: -240, rx: 150, rz: 125, peak: 7.5, detail: 1.8, undulation: 1.5, coastVariation: 0.2,
    bumps: [{ x: 40, z: -30, height: 7, radius: 60 }, { x: -55, z: 25, height: 5, radius: 55 }],
    valleys: [{ x: 10, z: 20, depth: 2.2, radius: 30 }] },
  desert: { seed: 3, cx: 640, cz: -380, rx: 165, rz: 135, peak: 5.5, detail: 2.2, undulation: 1.6, beachWidth: 0.24, beachRise: 1.2,
    bumps: [{ x: -35, z: -20, height: 8, radius: 75 }], valleys: [{ x: 40, z: 30, depth: 2.0, radius: 40 }] },
  snow: { seed: 4, cx: -520, cz: 640, rx: 150, rz: 140, peak: 8.5, detail: 1.6, undulation: 1.3,
    bumps: [{ x: 30, z: 20, height: 10, radius: 65 }, { x: -45, z: -25, height: 7, radius: 55 }] },
  volcanic: { seed: 5, cx: 560, cz: 600, rx: 140, rz: 125, peak: 5.0, detail: 1.5, undulation: 1.2,
    plateau: { x: -15, z: -10, height: 14, radius: 62, craterRadius: 26, craterDepth: 6 },
    bumps: [{ x: 45, z: 25, height: 6, radius: 50 }] }
};

for (const [name, cfg] of Object.entries(islands)) {
  const h = makeHeight(cfg);
  // scan local +Z axis from centre outward for last land and first deep water
  let waterAt = null;
  let landAt = null;
  for (let z = 40; z < 220; z += 1) {
    const hh = h(0, z);
    if (hh >= -0.3) landAt = z;
    if (hh < -1.2 && waterAt === null && landAt !== null) { waterAt = z; break; }
  }
  // ground at candidate ramp positions
  const rampGround = (z) => h(0, z).toFixed(1);
  console.log(`${name.padEnd(9)} lastLand z=${landAt}  water z=${waterAt}  | ramp@${landAt - 20} g=${rampGround(landAt - 20)}  seaEnd@${landAt + 12} g=${rampGround(landAt + 12)}`);
}
