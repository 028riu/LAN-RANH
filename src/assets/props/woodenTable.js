// Wooden table — market/vendor table with an angled display shelf.
// Local space: origin at ground centre.
export const meta = { id: 'wooden_table', label: 'Wooden Table' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const L = opts.length || 2.4;
  const D = 1.0;
  const H = 0.95;

  // Legs.
  for (const [ox, oz] of [[-L / 2 + 0.18, -D / 2 + 0.15], [L / 2 - 0.18, -D / 2 + 0.15], [-L / 2 + 0.18, D / 2 - 0.15], [L / 2 - 0.18, D / 2 - 0.15]]) {
    kit.box(mats.woodDark, [ox, H / 2 - 0.05, oz], [0.13, H - 0.1, 0.13]);
    kit.colliderCylinder([ox, H / 2 - 0.05, oz], 0.14, H - 0.1);
  }
  // Top boards + edge trim.
  for (let i = 0; i < 5; i += 1) {
    kit.box(mats.wall, [-L / 2 + 0.2 + i * (L - 0.4) / 4, H - 0.04, 0], [(L - 0.4) / 4 - 0.02, 0.07, D]);
  }
  kit.box(mats.woodDark, [0, H - 0.02, D / 2 - 0.02], [L, 0.06, 0.06]);

  // Lower display shelf (goods go here when placed by layouts).
  kit.box(mats.woodDark, [0, 0.3, 0], [L - 0.5, 0.06, D - 0.3]);

  // Solid collider so players can't walk through the table, but can step
  // onto it (top registered at seat height).
  kit.colliderBox([0, H / 2, 0], [L, H, D], { y0: 0, y1: H - 0.05 });
}
