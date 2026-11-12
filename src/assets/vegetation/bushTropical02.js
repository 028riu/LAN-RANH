// Tropical bush 02 — taller, leggy shrub with visible woody stems and a
// loose crown, good for mid-ground fill.
export const meta = {
  id: 'bush_tropical_02',
  label: 'Tropical Bush 02'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();

  // Stems
  const stems = 3 + Math.floor(rng * 2);
  for (let i = 0; i < stems; i += 1) {
    const a = (i / stems) * Math.PI * 2 + rng;
    const lean = 0.12 + rng * 0.22;
    kit.box(mats.bark, [Math.cos(a) * lean, 0.35, Math.sin(a) * lean], [0.07, 0.8, 0.07], [0, 0, Math.cos(a) * 14]);
    // Crown blob on each stem
    kit.ellipsoid(mats.leaf, [Math.cos(a) * (lean + 0.08), 0.85 + rng * 0.2, Math.sin(a) * (lean + 0.08)], [0.42, 0.3, 0.42], 6, 5);
  }
  // Base clump
  kit.ellipsoid(mats.leafJungle, [0, 0.28, 0], [0.55, 0.3, 0.55], 7, 5);
}
