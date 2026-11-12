// Wooden bench — slatted garden/harbour bench with iron-free joinery.
// Walkable-ish low prop: blocks with a tight collider.
// Local space: origin at ground centre, seat faces +Z.
export const meta = { id: 'wooden_bench', label: 'Wooden Bench' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const L = opts.length || 2.2;

  // Legs + aprons.
  for (const sx of [-1, 1]) {
    kit.box(mats.woodDark, [sx * (L / 2 - 0.2), 0.21, 0], [0.14, 0.42, 0.5]);
    kit.colliderBox([sx * (L / 2 - 0.2), 0.21, 0], [0.2, 0.42, 0.56]);
  }
  kit.box(mats.woodDark, [0, 0.36, 0], [L - 0.5, 0.09, 0.08]);

  // Seat slats.
  for (let i = 0; i < 4; i += 1) {
    kit.box(mats.wall, [0, 0.46, -0.19 + i * 0.13], [L, 0.06, 0.11]);
  }
  kit.colliderBox([0, 0.45, 0], [L, 0.14, 0.52], { y0: 0.3, y1: 0.52 });

  // Backrest.
  for (const sx of [-1, 1]) {
    kit.box(mats.woodDark, [sx * (L / 2 - 0.2), 0.62, -0.24], [0.12, 0.55, 0.09], [-8, 0, 0]);
  }
  for (let i = 0; i < 2; i += 1) {
    kit.box(mats.wall, [0, 0.68 + i * 0.18, -0.27 - i * 0.02], [L - 0.15, 0.09, 0.06], [-8, 0, 0]);
  }
}
