// Wooden crate — plank box with corner braces and optional lid gap.
export const meta = { id: 'wooden_crate', label: 'Wooden Crate' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const s = 0.62 + (opts.variant || 0) * 0.22;

  // Panel walls (slightly proud corners)
  kit.box(mats.woodCrate, [0, s / 2, 0], [s, s, s]);
  // Corner posts
  for (const [ox, oz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    kit.box(mats.trim, [ox * (s / 2 - 0.03), s / 2, oz * (s / 2 - 0.03)], [0.09, s + 0.03, 0.09]);
  }
  // Cross planks on two faces
  kit.box(mats.trim, [0, s / 2, s / 2 + 0.01], [s - 0.1, 0.08, 0.03]);
  kit.box(mats.trim, [0, s / 2, -s / 2 - 0.01], [s - 0.1, 0.08, 0.03]);
  kit.box(mats.trim, [s / 2 + 0.01, s / 2, 0], [0.03, 0.08, s - 0.1]);

  kit.colliderBox([0, s / 2, 0], [s + 0.04, s + 0.04, s + 0.04]);
}
