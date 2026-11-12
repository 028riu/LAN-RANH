// Rock 02 — medium angular boulder with flat facets.
export const meta = { id: 'rock_02', label: 'Rock 02' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const s = 0.9 + rng * 0.8;

  // Faceted body: rotated overlapping boxes
  kit.box(mats.rock, [0, s * 0.4, 0], [s * 1.2, s * 0.8, s], [4, rng * 40, -3]);
  kit.box(mats.rockDry, [s * 0.3, s * 0.55, -s * 0.2], [s * 0.7, s * 0.5, s * 0.7], [-8, rng * 60, 6]);
  kit.box(mats.rock, [-s * 0.35, s * 0.3, s * 0.25], [s * 0.6, s * 0.55, s * 0.6], [6, rng * 50, -8]);
  kit.colliderBox([0, s * 0.4, 0], [s * 1.35, s * 0.85, s * 1.15], { yaw: 0 });
}
