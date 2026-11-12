// Tropical bush 01 — rounded leafy shrub built from clustered leaf
// ellipsoids (soft, organic silhouette).
export const meta = {
  id: 'bush_tropical_01',
  label: 'Tropical Bush 01'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const s = opts.scale || 1;

  const lobes = 4 + Math.floor(rng * 3);
  for (let i = 0; i < lobes; i += 1) {
    const a = (i / lobes) * Math.PI * 2 + rng * 0.8;
    const dist = 0.28 + rng * 0.3;
    const rx = 0.55 + rng * 0.3;
    kit.ellipsoid(i % 2 ? mats.leaf : mats.leafJungle,
      [Math.cos(a) * dist, (0.42 + rng * 0.3) * s, Math.sin(a) * dist],
      [rx * s, (0.4 + rng * 0.25) * s, rx * s], 7, 5);
  }
  // Berries (decorative)
  if (rng > 0.6) {
    for (let i = 0; i < 3; i += 1) {
      const a = rng * Math.PI * 2;
      kit.sphere(mats.flower, [Math.cos(a) * 0.45, 0.5 + rng * 0.35, Math.sin(a) * 0.45], 0.06, 5, 4);
    }
  }
}
