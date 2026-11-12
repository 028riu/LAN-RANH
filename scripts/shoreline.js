// Find shoreline (h crosses -0.3) on rays from island centre.
import { fbm2D } from '../src/core/mathUtils.js';

const RX = 170, RZ = 150;
const LOOKOUT = { x: 80, z: 0, height: 9, radius: 70 };
const CAPT = { x: 48, z: 42, height: 2.6, radius: 28 };
const COVE = { x: -112, z: -88, depth: 2.4, radius: 36 };

function bump(x, z, f) {
  const dx = x - f.x, dz = z - f.z;
  const d2 = dx * dx + dz * dz;
  if (d2 >= f.radius * f.radius) return 0;
  const t = 1 - d2 / (f.radius * f.radius);
  return (f.height || 1) * t * t;
}
function terrainHeight(x, z) {
  const u = x / RX, v = z / RZ;
  const d = Math.sqrt(u * u + v * v);
  const coastNoise = fbm2D(x * 0.008 + 11.2, z * 0.008 - 7.3, 3, 2.0, 0.55) - 0.5;
  const dEff = d * (1 - 0.18 * coastNoise);
  let h;
  if (dEff < 0.85) h = 6.5 * (1 - dEff * dEff * 0.72);
  else if (dEff < 1.02) { const t = (1.02 - dEff) / 0.17; h = 0.4 + 1.6 * t; }
  else h = 0.4 - (dEff - 1.02) * 6.5;
  h += (fbm2D(x * 0.045 + 5.1, z * 0.045 - 3.7, 3, 2.0, 0.5) - 0.5) * 1.4;
  h += (fbm2D(x * 0.012 - 2.4, z * 0.012 + 8.9, 2, 2.0, 0.6) - 0.5) * 1.2;
  h += bump(x, z, LOOKOUT);
  h += bump(x, z, CAPT);
  const dx = x - COVE.x, dz = z - COVE.z;
  if (dx * dx + dz * dz < COVE.radius * COVE.radius) {
    const t = 1 - (dx * dx + dz * dz) / (COVE.radius * COVE.radius);
    h -= COVE.depth * t * t;
  }
  return Math.max(h, -9.5);
}

// Scan rays at various angles, report where h first drops below -0.3
for (let ang = 0; ang < 360; ang += 22.5) {
  const a = ang * Math.PI / 180;
  const dx = Math.sin(a), dz = Math.cos(a);
  let shore = null;
  for (let r = 60; r < 220; r += 1) {
    const h = terrainHeight(dx * r, dz * r);
    if (h < -0.3) { shore = r; break; }
  }
  console.log(`angle ${String(ang).padStart(5)} deg  (dir ${dx.toFixed(2)}, ${dz.toFixed(2)})  shore at r=${shore}  point=(${(dx*shore).toFixed(0)}, ${(dz*shore).toFixed(0)})`);
}
