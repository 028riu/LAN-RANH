// Wooden chair — simple plank chair with a shaped backrest.
// Local space: origin at ground centre, seat faces +Z.
export const meta = { id: 'wooden_chair', label: 'Wooden Chair' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();

  // Four legs (slightly splayed).
  for (const [ox, oz] of [[-0.19, -0.19], [0.19, -0.19], [-0.19, 0.19], [0.19, 0.19]]) {
    kit.box(mats.woodDark, [ox, 0.22, oz], [0.075, 0.44, 0.075], [oz > 0 ? 4 : -4, 0, ox > 0 ? -4 : 4]);
  }
  // Seat frame + slats.
  kit.box(mats.wall, [0, 0.45, 0], [0.44, 0.05, 0.42]);
  kit.box(mats.wall, [0, 0.455, 0.1], [0.42, 0.05, 0.2]);
  kit.colliderBox([0, 0.3, 0], [0.46, 0.3, 0.44], { y0: 0.3, y1: 0.48 });
  // Backrest posts + slats.
  for (const sx of [-1, 1]) {
    kit.box(mats.woodDark, [sx * 0.19, 0.66, -0.19], [0.07, 0.5, 0.07], [-7, 0, 0]);
  }
  for (let i = 0; i < 2; i += 1) {
    kit.box(mats.wall, [0, 0.76 + i * 0.16, -0.215 - i * 0.02], [0.4, 0.08, 0.05], [-7, 0, 0]);
  }
  void rng;
}
