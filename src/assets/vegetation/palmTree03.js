// Palm tree variant 03 — the "postcard" palm: a pronounced lean, an S-curved
// segmented trunk with root flare, and a lush crown of feathered fronds
// (segmented spine + leaflets) plus a coconut cluster. The lean direction
// and curvature are seeded per instance so groves read as natural growth.
// Local space: origin at ground centre.
import { palmCrown } from './frondKit.js';

export const meta = {
  id: 'palm_tree_03',
  label: 'Palm Tree 03'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const variant = opts.variant || 0;

  const trunkH = (5.2 + variant * 1.6) * (0.9 + rng * 0.25);
  const trunkR = 0.26 * (0.9 + rng * 0.15);
  const lean = (rng - 0.5) * 2.2;                    // total lateral drift
  const segments = 6;

  // S-curved trunk: each segment offsets laterally with ease-in/out so the
  // curve reads as wind-grown rather than a straight cylinder.
  let px = 0;
  const topPts = [];
  for (let i = 0; i < segments; i += 1) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const curve = Math.sin(t0 * Math.PI * 0.9) * lean * 0.5 + lean * t0 * 0.5;
    const curve1 = Math.sin(t1 * Math.PI * 0.9) * lean * 0.5 + lean * t1 * 0.5;
    px = curve1;
    const h = (trunkH / segments) * 1.03;
    const r = trunkR * (1 - t0 * 0.38);
    const rTop = trunkR * (1 - t1 * 0.38);
    kit.cyl(mats.bark, [px, t1 * trunkH - h / 2, 0], r, h, 8, [0, rng * 360, 0], rTop);
    topPts.push([px, t1 * trunkH]);
  }

  // Trunk ring bands (darker) following the curve.
  for (let i = 1; i < segments; i += 1) {
    const p = topPts[i];
    kit.cyl(mats.barkDry, [p[0], p[1], 0], trunkR * (1 - (i / segments) * 0.38) + 0.03, 0.13, 8);
  }

  // Root flare at the base.
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 + rng;
    kit.beam(mats.bark, [Math.cos(a) * 0.15, 0.5, Math.sin(a) * 0.15],
      [Math.cos(a) * 0.62, 0.02, Math.sin(a) * 0.62], 0.16, 0.12);
  }

  const topX = px;
  const topY = trunkH;

  // Lush crown: two rows of feathered fronds.
  palmCrown(kit, {
    cx: topX, cy: topY + 0.16, cz: 0,
    count: 8,
    yawOffset: rng * 40,
    jitter: () => (rng - 0.5) * 22,
    length: () => 3.1 + variant * 0.5 + rng * 0.6,
    droop: () => 30 + rng * 26,
    width: 0.44,
    leafMat: (i) => (i % 4 === 3 ? mats.leafDry : mats.leafPalm),
    spineMat: mats.stem,
    segments: 3
  });
  palmCrown(kit, {
    cx: topX, cy: topY + 0.62, cz: 0,
    count: 5,
    yawOffset: rng * 60 + 24,
    jitter: () => (rng - 0.5) * 26,
    length: () => 2.3 + rng * 0.5,
    droop: () => 18 + rng * 16,
    width: 0.36,
    leafMat: (i) => (i % 3 === 2 ? mats.leafDry : mats.leafPalm),
    spineMat: mats.stem,
    segments: 2
  });

  // Young green coconuts tucked under the crown.
  const nuts = 2 + Math.floor(rng * 3);
  for (let i = 0; i < nuts; i += 1) {
    const a = rng * Math.PI * 2;
    kit.sphere(mats.coconut, [topX + Math.cos(a) * 0.3, topY - 0.16 - rng * 0.2, Math.sin(a) * 0.3], 0.16, 6, 5);
  }

  // Trunk collider follows the lean (cylinder centred on the mid-trunk).
  kit.colliderCylinder([lean * 0.42, trunkH / 2, 0], 0.36, trunkH + 0.6, { y0: 0 });
}
