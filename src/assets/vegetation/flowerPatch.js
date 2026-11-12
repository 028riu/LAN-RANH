// Flower patch — a dense mound of blossoms with a magenta vine cascade.
// Sits next to houses, well and market lanes as a splash of colour.
// Local space: origin at ground centre.
export const meta = {
  id: 'flower_patch',
  label: 'Flower Patch'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();

  // Foliage mound base.
  kit.ellipsoid(mats.grass, [0, 0.18, 0], [0.55, 0.26, 0.55], 6, 4);

  // Blossom clusters in mixed colours.
  const colors = [mats.flower, mats.flowerVine, mats.flowerAlt];
  for (let i = 0; i < 9; i += 1) {
    const a = (i / 9) * Math.PI * 2 + rng;
    const r = 0.12 + rng * 0.34;
    const mat = colors[i % colors.length];
    kit.sphere(mat, [Math.cos(a) * r, 0.3 + rng * 0.16, Math.sin(a) * r], 0.1 + rng * 0.05, 5, 4);
  }

  // A few leaf spears poking through.
  for (let i = 0; i < 4; i += 1) {
    const a = rng * Math.PI * 2;
    kit.beam(mats.leaf, [Math.cos(a) * 0.3, 0.1, Math.sin(a) * 0.3],
      [Math.cos(a) * 0.42, 0.42 + rng * 0.14, Math.sin(a) * 0.42], 0.05, 0.04);
  }

  // No collider — pure ground detail.
}
