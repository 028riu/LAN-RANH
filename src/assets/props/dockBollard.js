// Dock bollard — heavy mooring post with a rope coil, placed along the
// quay edge. Working-harbour dressing with a tight collider.
// Local space: origin at ground centre.
export const meta = { id: 'dock_bollard', label: 'Dock Bollard' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();

  // Stone base + iron post + brass cap.
  kit.box(mats.stoneSmooth, [0, 0.18, 0], [0.72, 0.36, 0.72]);
  kit.colliderBox([0, 0.18, 0], [0.78, 0.4, 0.78], { y0: -0.2, y1: 0.4 });
  kit.cyl(mats.ironDark, [0, 0.62, 0], 0.17, 0.5, 9);
  kit.cyl(mats.brass, [0, 0.92, 0], 0.24, 0.12, 9);
  kit.cyl(mats.ironDark, [0, 1.0, 0], 0.1, 0.1, 8);
  kit.colliderCylinder([0, 0.62, 0], 0.24, 0.6, { y0: 0.3, y1: 1.05 });

  // Rope coil at the foot (variant keeps a rope running to the pier edge).
  if (opts.variant !== 1) {
    kit.cyl(mats.rope, [0.42, 0.08, 0.18], 0.19, 0.14, 10);
    kit.cyl(mats.rope, [0.42, 0.18, 0.18], 0.15, 0.08, 10);
  } else {
    // Rope running off toward +X, drooping to the ground.
    kit.beam(mats.rope, [0.2, 0.75, 0], [0.85, 0.3, 0.25], 0.06, 0.055);
    kit.beam(mats.rope, [0.85, 0.3, 0.25], [1.5, 0.05, 0.4], 0.06, 0.055);
    kit.cyl(mats.rope, [1.5, 0.07, 0.4], 0.16, 0.12, 10);
  }
  void rng;
}
