// Training dummy — straw-stuffed post with a target disc, arms and a
// wooden frame base.
export const meta = { id: 'training_dummy', label: 'Training Dummy' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');

  // Base cross
  kit.box(mats.trim, [0, 0.12, 0], [1.5, 0.14, 0.22]);
  kit.box(mats.trim, [0, 0.12, 0], [0.22, 0.14, 1.5]);
  // Post
  kit.cyl(mats.trim, [0, 1.0, 0], 0.1, 2.0, 8);
  kit.colliderCylinder([0, 1.0, 0], 0.34, 2.0);

  // Straw body
  kit.ellipsoid(mats.canvasCream, [0, 1.35, 0], [0.3, 0.42, 0.24], 8, 6);
  // Head
  kit.sphere(mats.canvasCream, [0, 1.9, 0], 0.2, 7, 5);
  // Painted target on the chest
  kit.cyl(mats.canvasRed, [0, 1.35, 0.25], 0.2, 0.05, 12, [90, 0, 0]);
  kit.cyl(mats.ironDark, [0, 1.35, 0.27], 0.1, 0.06, 10, [90, 0, 0]);
  // Rope arms
  kit.box(mats.rope, [0.42, 1.45, 0], [0.7, 0.07, 0.07], [0, 0, 8]);
  kit.box(mats.rope, [-0.42, 1.45, 0], [0.7, 0.07, 0.07], [0, 0, -8]);
  // Straw tufts at the top
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI * 2;
    kit.box(mats.canvasCream, [Math.cos(a) * 0.1, 2.12, Math.sin(a) * 0.1], [0.05, 0.2, 0.05], [14, 0, 10 * Math.cos(a)]);
  }
}
