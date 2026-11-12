// Survey of the starter island terrain along key layout lines.
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

console.log('=== North dock line (x=0), z from 150 down to 60 ===');
for (let z = 150; z >= 60; z -= 5) {
  console.log(`z=${String(z).padStart(3)}  h=${terrainHeight(0, z).toFixed(2)}`);
}

console.log('\n=== Key layout points ===');
const pts = [
  ['dock land end (0, 92)', 0, 92], ['dock mid (0, 110)', 0, 110], ['dock sea end (0, 130)', 0, 130],
  ['settlement center (0, 48)', 0, 48],
  ['captain house (48, 42)', 48, 42], ['captain corner (54, 47)', 54, 47],
  ['market (-58, 30)', -58, 30],
  ['training (48, -48)', 48, -48],
  ['palm grove (-8, -78)', -8, -78],
  ['lookout (80, 0)', 80, 0],
  ['cove (-112, -88)', -112, -88],
  ['beach (-78, -28)', -78, -28],
  ['shed old (14, 96)', 14, 96],
  ['stone house (-30, 66)', -30, 66],
  ['big house (-22, 38)', -22, 38],
  ['watchtower (36, 72)', 36, 72],
  ['coastal house (-52, 92)', -52, 92],
  ['cave mouth (-118, -74)', -118, -74]
];
for (const [name, x, z] of pts) {
  console.log(`${name.padEnd(28)} h=${terrainHeight(x, z).toFixed(2)}`);
}
