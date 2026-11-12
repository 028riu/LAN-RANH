// Grass tuft 02 — taller wind-blown clump with seed heads.
export const meta = {
  id: 'grass_tuft_02',
  label: 'Grass Tuft 02'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const blades = 5;
  for (let i = 0; i < blades; i += 1) {
    const a = (i / blades) * 180 + rng * 50;
    const h = 0.55 + rng * 0.4;
    kit.box(mats.grass, [0, h * 0.42, 0], [0.06, h, 0.62], [-14 - rng * 12, a, 0]);
    if (i % 2 === 0) {
      kit.box(mats.grassDry, [0.05, h * 0.86, 0.24], [0.045, 0.22, 0.045], [-16, a, 0]);
    }
  }
}
