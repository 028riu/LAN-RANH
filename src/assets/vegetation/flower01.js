// Flower cluster — colourful island blossoms on thin stems.
export const meta = {
  id: 'flower_01',
  label: 'Flower Cluster'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const blooms = 3 + Math.floor(rng * 3);
  for (let i = 0; i < blooms; i += 1) {
    const a = rng * Math.PI * 2;
    const dx = Math.cos(a) * (0.1 + rng * 0.22);
    const dz = Math.sin(a) * (0.1 + rng * 0.22);
    const h = 0.32 + rng * 0.25;
    kit.box(mats.stem, [dx, h / 2, dz], [0.04, h, 0.04], [(rng - 0.5) * 10, 0, (rng - 0.5) * 10]);
    kit.sphere(mats.flower, [dx, h + 0.05, dz], 0.09, 6, 5);
    kit.sphere(mats.flowerAlt, [dx, h + 0.11, dz], 0.045, 5, 4);
  }
}
