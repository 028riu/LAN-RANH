// Rock 03 — tall standing stone (menhir), useful as a landmark.
export const meta = { id: 'rock_03', label: 'Standing Stone' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const h = 1.8 + rng * 1.6;

  kit.box(mats.rock, [0, h * 0.45, 0], [0.9, h, 0.7], [(rng - 0.5) * 8, rng * 40, (rng - 0.5) * 8]);
  kit.box(mats.rockDry, [0.15, h * 0.7, 0.1], [0.6, h * 0.5, 0.5], [(rng - 0.5) * 10, rng * 30, (rng - 0.5) * 6]);
  kit.box(mats.foundation, [0, 0.15, 0], [1.1, 0.3, 0.95], [0, rng * 30, 0]);
  kit.colliderBox([0, h * 0.45, 0], [1.0, h, 0.8]);
}
