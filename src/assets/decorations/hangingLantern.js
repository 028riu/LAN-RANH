// Hanging lantern — a glowing lantern hung from a wall bracket or beam.
export const meta = { id: 'hanging_lantern', label: 'Hanging Lantern' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');

  // Wall bracket
  kit.box(mats.ironDark, [0, 0, -0.18], [0.08, 0.08, 0.4]);
  kit.box(mats.ironDark, [0, -0.16, -0.34], [0.07, 0.3, 0.07]);
  // Chain + body
  kit.box(mats.ironDark, [0, -0.38, -0.34], [0.05, 0.18, 0.05]);
  kit.box(mats.ironDark, [0, -0.56, -0.34], [0.3, 0.07, 0.3]);
  kit.box(mats.lanternGlow, [0, -0.72, -0.34], [0.22, 0.3, 0.22]);
  kit.box(mats.ironDark, [0, -0.9, -0.34], [0.26, 0.06, 0.26]);
}
