// Palm tree variant 01 — classic curved tropical palm with a segmented,
// tapering trunk, a lush feathered crown (segmented fronds + leaflets) and
// a coconut cluster.
// Local space: origin at ground centre.
import { palmCrown } from './frondKit.js';
export const meta = {
  id: 'palm_tree_01',
  label: 'Palm Tree 01'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const scaleFix = opts.scale || 1;
  void scaleFix;

  const variant = opts.variant || 0;
  const trunkH = (4.6 + variant * 1.5) * (0.9 + rng * 0.25);
  const trunkR = 0.24 * (0.9 + rng * 0.2);

  // Curved trunk: stacked tapered segments bending toward +X
  const bend = (rng - 0.5) * 1.6;
  const segments = 5;
  let px = 0;
  let pz = 0;
  for (let i = 0; i < segments; i += 1) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const r = trunkR * (1 - t0 * 0.35);
    const h = (trunkH / segments) * 1.02;
    px += bend / segments;
    kit.cyl(mats.bark, [px, t0 * trunkH + h / 2, pz], r, h, 8, [0, rng * 360, 0], r * 0.82);
  }

  // Trunk ring texture (darker bands)
  for (let i = 1; i < segments; i += 1) {
    kit.cyl(mats.barkDry, [bend * (i / segments), (i / segments) * trunkH, 0], trunkR * (1 - (i / segments) * 0.35) + 0.03, 0.14, 8);
  }

  const topX = px;
  const topY = trunkH;

  // Feathered crown: segmented fronds with leaflets (frondKit).
  palmCrown(kit, {
    cx: topX, cy: topY + 0.14, cz: 0,
    count: 8,
    yawOffset: rng * 45,
    jitter: () => (rng - 0.5) * 24,
    length: () => 2.9 + variant * 0.5 + rng * 0.5,
    droop: () => 28 + rng * 26,
    width: 0.42,
    leafMat: (i) => (i % 4 === 3 ? mats.leafDry : mats.leafPalm),
    spineMat: mats.stem,
    segments: 3
  });
  palmCrown(kit, {
    cx: topX, cy: topY + 0.55, cz: 0,
    count: 5,
    yawOffset: rng * 70 + 20,
    jitter: () => (rng - 0.5) * 28,
    length: () => 2.1 + rng * 0.4,
    droop: () => 16 + rng * 14,
    width: 0.34,
    leafMat: (i) => (i % 3 === 2 ? mats.leafDry : mats.leafPalm),
    spineMat: mats.stem,
    segments: 2
  });

  // Coconut cluster
  const nuts = 2 + Math.floor(rng * 3);
  for (let i = 0; i < nuts; i += 1) {
    const a = rng * Math.PI * 2;
    kit.sphere(mats.coconut, [topX + Math.cos(a) * 0.32, topY - 0.12 - rng * 0.18, Math.sin(a) * 0.32], 0.17, 6, 5);
  }

  // Trunk collider (thin, so players brush past but do not phase through)
  kit.colliderCylinder([bend * 0.4, trunkH / 2, 0], 0.34, trunkH);
}
