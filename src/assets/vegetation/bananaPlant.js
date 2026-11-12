// Banana plant — a clump of broad arcing leaves rising from a short stem,
// with a hanging fruit bunch. Instant tropical understorey signature.
// Local space: origin at ground centre.
import { arcBlade } from './frondKit.js';

export const meta = {
  id: 'banana_plant',
  label: 'Banana Plant'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const variant = opts.variant || 0;

  const stemH = 0.9 + rng * 0.5 + variant * 0.2;

  // Central stem + young side shoot.
  kit.cyl(mats.stem, [0, stemH / 2, 0], 0.13, stemH, 7, [0, rng * 360, 0], 0.09);
  kit.cyl(mats.stem, [0.24, stemH * 0.4, 0.1], 0.09, stemH * 0.6, 6, [0, rng * 360, 0], 0.07);

  // Broad arcing leaves around the crown.
  const leaves = 5 + Math.floor(rng * 2);
  for (let i = 0; i < leaves; i += 1) {
    const a = (i / leaves) * Math.PI * 2 + rng * 0.5;
    const yaw = a * 180 / Math.PI;
    kit.pushFrame([0, stemH - 0.12, 0], yaw);
    arcBlade(kit, {
      length: 1.5 + rng * 0.6,
      rise: 0.62,
      bend: 62 + rng * 30,
      width: 0.52 + rng * 0.16,
      segments: 3,
      mat: i % 3 === 2 ? mats.leaf : mats.leafBanana
    });
    // Midrib highlight along the leaf.
    kit.beam(mats.stem, [0, 0, 0], [1.35 + rng * 0.4, 0.18, 0], 0.05, 0.04);
    kit.popFrame();
  }

  // Hanging fruit bunch (green bananas) on mature variants.
  if (variant === 0 || rng > 0.4) {
    kit.pushFrame([0.1, stemH * 0.55, 0.14], rng * 90);
    kit.beam(mats.stem, [0, 0, 0], [0.02, -0.3, 0], 0.04, 0.04);
    for (let i = 0; i < 6; i += 1) {
      const a = i * 1.7;
      kit.cyl(mats.leafBanana,
        [Math.cos(a) * 0.07, -0.24 - (i % 3) * 0.05, Math.sin(a) * 0.07],
        0.045, 0.16, 5, [70, a * 57, 0]);
    }
    kit.popFrame();
  }

  // Soft collider so the player brushes through the leaves but not the stem.
  kit.colliderCylinder([0, stemH * 0.45, 0], 0.26, stemH, { y0: 0 });
}
