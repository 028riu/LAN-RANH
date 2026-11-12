// Wicker basket — woven market basket with produce. Variant 1 lies
// tipped over with fruit spilled out (market storytelling).
// Local space: origin at ground centre.
export const meta = { id: 'wicker_basket', label: 'Wicker Basket' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const tipped = opts.variant === 1;

  if (!tipped) {
    kit.cyl(mats.wicker, [0, 0.22, 0], 0.42, 0.44, 12, [0, 0, 0], 0.5);
    kit.cyl(mats.woodDark, [0, 0.45, 0], 0.5, 0.05, 12);
    // Woven bands.
    kit.cyl(mats.woodBarrel, [0, 0.28, 0], 0.47, 0.05, 12);
    // Produce pile.
    const fruit = [mats.fruitOrange, mats.flowerAlt, mats.leafBanana];
    for (let i = 0; i < 6; i += 1) {
      const a = rng * Math.PI * 2;
      const r = rng * 0.3;
      kit.sphere(fruit[i % fruit.length], [Math.cos(a) * r, 0.5 + rng * 0.1, Math.sin(a) * r], 0.09, 5, 4);
    }
    // Handle arch.
    kit.beam(mats.wicker, [-0.3, 0.45, 0], [-0.18, 0.75, 0], 0.05, 0.04);
    kit.beam(mats.wicker, [-0.18, 0.75, 0], [0.18, 0.75, 0], 0.05, 0.04);
    kit.beam(mats.wicker, [0.18, 0.75, 0], [0.3, 0.45, 0], 0.05, 0.04);
    kit.colliderCylinder([0, 0.22, 0], 0.5, 0.5);
  } else {
    // Tipped basket + spill trail.
    kit.pushFrame([0, 0.35, 0], 20);
    kit.cyl(mats.wicker, [0.18, 0, 0], 0.42, 0.5, 12, [0, 0, 104], 0.48);
    kit.popFrame();
    kit.colliderBox([0.1, 0.3, 0], [0.9, 0.5, 0.8]);
    for (let i = 0; i < 7; i += 1) {
      kit.sphere(mats.fruitOrange,
        [0.55 + rng * 0.7, 0.09 + rng * 0.05, (rng - 0.5) * 0.6], 0.09, 5, 4);
    }
  }
}
