// Palm tree variant 02 — tall, straighter trunk with a dense round crown
// of feathered fronds and a hanging dead frond skirt.
import { palmCrown } from './frondKit.js';
export const meta = {
  id: 'palm_tree_02',
  label: 'Palm Tree 02'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const variant = opts.variant || 0;
  const trunkH = (5.6 + variant * 1.4) * (0.92 + rng * 0.2);
  const trunkR = 0.27;

  // Straight trunk with a slight taper and ring bands
  const segments = 4;
  for (let i = 0; i < segments; i += 1) {
    const t0 = i / segments;
    const r = trunkR * (1 - t0 * 0.3);
    kit.cyl(mats.bark, [0, (t0 + 0.5 / segments) * trunkH, 0], r, trunkH / segments + 0.05, 9, [0, rng * 360, 0]);
  }
  for (let i = 1; i <= 6; i += 1) {
    kit.cyl(mats.barkDry, [0, (i / 7) * trunkH, 0], trunkR * (1 - (i / 7) * 0.3) + 0.035, 0.12, 9);
  }

  const topY = trunkH;

  // Dead frond skirt hanging under the crown
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2;
    kit.pushFrame([Math.cos(a) * 0.4, topY - 0.5, Math.sin(a) * 0.4], a * 180 / Math.PI);
    kit.box(mats.leafDry, [0, 0, 0], [0.3, 0.05, 1.4], [64, 90, 0]);
    kit.popFrame();
  }

  // Two-layer feathered crown
  palmCrown(kit, {
    cx: 0, cy: topY + 0.15, cz: 0,
    count: 9,
    yawOffset: rng * 30,
    jitter: () => (rng - 0.5) * 18,
    length: () => 3.3 + variant * 0.4 + rng * 0.4,
    droop: () => 30 + rng * 16,
    width: 0.44,
    leafMat: (i) => (i % 5 === 4 ? mats.leafDry : mats.leafPalm),
    spineMat: mats.stem,
    segments: 3
  });
  palmCrown(kit, {
    cx: 0, cy: topY + 0.6, cz: 0,
    count: 6,
    yawOffset: rng * 80 + 36,
    jitter: () => (rng - 0.5) * 22,
    length: () => 2.5 + rng * 0.4,
    droop: () => 16 + rng * 12,
    width: 0.36,
    leafMat: (i) => (i % 4 === 3 ? mats.leafDry : mats.leafPalm),
    spineMat: mats.stem,
    segments: 2
  });

  // Coconuts
  for (let i = 0; i < 3; i += 1) {
    const a = rng * Math.PI * 2;
    kit.sphere(mats.coconut, [Math.cos(a) * 0.3, topY - 0.2, Math.sin(a) * 0.3], 0.18, 6, 5);
  }

  kit.colliderCylinder([0, trunkH / 2, 0], 0.36, trunkH);
}
