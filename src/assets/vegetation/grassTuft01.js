// Grass tuft 01 — small crossed-blade clump (no collider, cheap).
export const meta = {
  id: 'grass_tuft_01',
  label: 'Grass Tuft 01'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const blades = 4;
  for (let i = 0; i < blades; i += 1) {
    const a = (i / blades) * 180 + rng * 40;
    const h = 0.34 + rng * 0.3;
    kit.box(mats.grass, [0, h * 0.45, 0], [0.07, h, 0.5], [-9 - rng * 8, a, 0]);
  }
}
