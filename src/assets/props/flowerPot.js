// Flower pot — terracotta pot with a flowering plant, for steps, porches
// and market stalls. Variant picks the bloom colour. No collider (kickable
// decoration that must not trap the player).
// Local space: origin at ground centre.
export const meta = { id: 'flower_pot', label: 'Flower Pot' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const variant = opts.variant || 0;

  // Pot: tapered cylinder + rim.
  kit.cyl(mats.potTerracotta, [0, 0.19, 0], 0.24, 0.38, 10, [0, 0, 0], 0.3);
  kit.cyl(mats.potTerracotta, [0, 0.4, 0], 0.31, 0.09, 10);
  // Soil.
  kit.cyl(mats.bark, [0, 0.43, 0], 0.26, 0.05, 10);

  // Foliage tuft.
  kit.ellipsoid(mats.grass, [0, 0.55, 0], [0.2, 0.14, 0.2], 5, 4);

  // Blooms: colour by variant (red / yellow / magenta).
  const bloom = variant % 3 === 0 ? mats.flower : variant % 3 === 1 ? mats.flowerAlt : mats.flowerVine;
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI * 2 + rng;
    kit.sphere(bloom, [Math.cos(a) * 0.14, 0.62 + rng * 0.1, Math.sin(a) * 0.14], 0.06, 5, 4);
  }
  kit.sphere(bloom, [0, 0.72, 0], 0.07, 5, 4);
}
