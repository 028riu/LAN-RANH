// Village well — stone wellhead with a timber windlass, bucket on a rope,
// shingle canopy roof and a flower box. Village-centre landmark prop that
// also gives the settlement square a heart. The rim is a tight round
// collider; players can step on the base ring.
// Local space: origin at ground centre.
export const meta = { id: 'village_well', label: 'Village Well' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();

  // Circular stone wellhead: two stacked stone rings + inner dark water.
  kit.cyl(mats.stoneSmooth, [0, 0.3, 0], 1.05, 0.6, 14);
  kit.cyl(mats.stoneSmooth, [0, 0.72, 0], 1.15, 0.24, 14);
  kit.cyl(mats.ironDark, [0, 0.82, 0], 0.8, 0.12, 14);
  kit.cyl(mats.pondWater, [0, 0.84, 0], 0.62, 0.06, 12);
  // Ring colliders (outer blocks, inner floor walkable).
  kit.colliderCylinder([0, 0.45, 0], 1.16, 0.95, { y0: -0.2, y1: 0.9 });
  kit.colliderCylinder([0, 0.45, 0], 0.66, 0.6, { y0: 0.9, y1: 0.92 });

  // Wooden windlass posts + drum + crank.
  for (const sx of [-1, 1]) {
    kit.box(mats.trim, [sx * 1.0, 1.45, 0], [0.16, 1.4, 0.16]);
    kit.box(mats.woodDark, [sx * 1.0, 0.85, 0], [0.3, 0.2, 0.3]);
    kit.colliderCylinder([sx * 1.0, 1.45, 0], 0.17, 1.5, { y0: 0.75, y1: 2.15 });
    kit.beam(mats.ironDark, [sx * 1.0, 1.95, 0], [sx * 1.28, 1.6, 0], 0.06, 0.05);
  }
  kit.cyl(mats.woodDark, [0, 1.62, 0], 0.14, 2.0, 9, [0, 0, 90]);

  // Rope down to the bucket.
  kit.beam(mats.rope, [0.1, 1.66, 0.1], [0.02, 1.0, 0.04], 0.04, 0.035);
  kit.cyl(mats.woodDark, [0.02, 0.9, 0.04], 0.16, 0.22, 8);
  kit.beam(mats.ironDark, [-0.14, 0.9, 0.04], [0.18, 0.9, 0.04], 0.03, 0.025);

  // Shingle canopy: two small gable halves on the posts.
  kit.box(mats.thatch, [0, 2.35, 0.28], [2.6, 0.09, 1.0], [-22, 0, 0]);
  kit.box(mats.thatch, [0, 2.35, -0.28], [2.6, 0.09, 1.0], [22, 0, 0]);
  kit.box(mats.roofTrim, [0, 2.62, 0], [2.7, 0.12, 0.24]);

  // Flower box on the wellhead rim.
  kit.box(mats.woodDark, [0, 1.05, 1.02], [1.1, 0.24, 0.3]);
  kit.ellipsoid(mats.grass, [0, 1.2, 1.02], [0.5, 0.12, 0.16], 6, 4);
  const bloom = rng > 0.5 ? mats.flower : mats.flowerVine;
  for (let i = 0; i < 5; i += 1) {
    kit.sphere(bloom, [-0.4 + i * 0.2, 1.3 + (i % 2) * 0.05, 1.02], 0.07, 5, 4);
  }
}
