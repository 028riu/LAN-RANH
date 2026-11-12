// Coconut tree — heavy leaning palm with big coconut bunches, common on
// beaches.
export const meta = {
  id: 'coconut_tree',
  label: 'Coconut Tree'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const trunkH = 4.2 * (0.9 + rng * 0.3);

  // Strong lean
  const leanA = rng * Math.PI * 2;
  const leanAmt = 0.9 + rng * 0.9;
  const segments = 4;
  let cx = 0;
  let cz = 0;
  for (let i = 0; i < segments; i += 1) {
    const t = i / segments;
    cx = Math.cos(leanA) * leanAmt * t * t;
    cz = Math.sin(leanA) * leanAmt * t * t;
    const r = 0.3 * (1 - t * 0.25);
    kit.cyl(mats.bark, [cx, (t + 0.5 / segments) * trunkH, cz], r, trunkH / segments + 0.06, 9, [0, leanA * 57.3, 0]);
  }
  // Ring bands
  for (let i = 1; i <= 5; i += 1) {
    const t = i / 6;
    kit.cyl(mats.barkDry, [Math.cos(leanA) * leanAmt * t * t, t * trunkH, Math.sin(leanA) * leanAmt * t * t], 0.32 * (1 - t * 0.25) + 0.04, 0.15, 9);
  }

  const topX = cx;
  const topZ = cz;

  // Broad drooping fronds
  const fronds = 8;
  for (let i = 0; i < fronds; i += 1) {
    const a = (i / fronds) * Math.PI * 2 + rng * 0.4;
    const len = 3.6 + rng * 0.6;
    kit.pushFrame([topX + Math.cos(a) * len * 0.44, trunkH + 0.2 - 0.5, topZ + Math.sin(a) * len * 0.44], a * 180 / Math.PI);
    kit.box(mats.leafPalm, [0, 0, 0], [0.5, 0.07, len], [-38, 90, 0]);
    kit.box(mats.leafDry, [0, -0.04, 0.2], [0.34, 0.05, len * 0.7], [-48, 90, 0]);
    kit.popFrame();
  }

  // Big coconut bunches
  for (let b = 0; b < 2; b += 1) {
    const ba = rng * Math.PI * 2;
    for (let i = 0; i < 3; i += 1) {
      const a = ba + i * 0.8;
      kit.sphere(mats.coconut, [topX + Math.cos(a) * 0.42, trunkH - 0.35 - i * 0.1, topZ + Math.sin(a) * 0.42], 0.22, 7, 5);
    }
  }

  kit.colliderCylinder([Math.cos(leanA) * leanAmt * 0.25, trunkH / 2, Math.sin(leanA) * leanAmt * 0.25], 0.4, trunkH);
}
