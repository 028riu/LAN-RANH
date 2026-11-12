// Cargo stack — a composed pile of crates and barrels tied with rope,
// staged for loading. Variants change the arrangement. One solid collider
// around the pile footprint (steppable at the low end).
// Local space: origin at ground centre.
export const meta = { id: 'cargo_stack', label: 'Cargo Stack' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const variant = opts.variant || 0;

  if (variant === 0) {
    // Classic pyramid: two crates + one on top, barrel at the side.
    kit.box(mats.woodCrate, [-0.45, 0.42, 0], [0.84, 0.84, 0.84], [0, rng * 8 - 4, 0]);
    kit.box(mats.woodCrate, [0.42, 0.42, 0.12], [0.8, 0.8, 0.8], [0, rng * -10, 0]);
    kit.box(mats.woodCrate, [0, 1.24, 0.05], [0.78, 0.78, 0.78], [0, rng * 6, 0]);
    kit.cyl(mats.woodBarrel, [1.15, 0.5, -0.75], 0.44, 1.0, 10);
    kit.cyl(mats.barrelBand, [1.15, 0.78, -0.75], 0.46, 0.07, 10);
    // Rope over the top crate.
    kit.beam(mats.rope, [-0.4, 1.62, 0.03], [0.42, 1.62, 0.06], 0.05, 0.045);
    kit.colliderBox([0, 0.8, 0.02], [1.35, 1.65, 0.9]);
    kit.colliderCylinder([1.15, 0.5, -0.75], 0.48, 1.0);
  } else if (variant === 1) {
    // Long low row — dock staging.
    for (let i = 0; i < 3; i += 1) {
      kit.box(mats.woodCrate, [-0.9 + i * 0.9, 0.4, 0], [0.82, 0.8, 0.82], [0, (rng - 0.5) * 8, 0]);
      kit.box(mats.woodCrate, [-0.9 + i * 0.9, 1.18, 0.02], [0.76, 0.76, 0.76], [0, (rng - 0.5) * 10, 0]);
    }
    kit.colliderBox([0, 0.75, 0], [2.7, 1.55, 0.85]);
  } else {
    // Sack pile (bulging ellipsoids) + one crate.
    for (let i = 0; i < 5; i += 1) {
      const a = (i / 5) * Math.PI * 2;
      kit.ellipsoid(mats.canvasCream, [Math.cos(a) * 0.32, 0.3, Math.sin(a) * 0.32],
        [0.3, 0.24, 0.3], 6, 5);
    }
    kit.ellipsoid(mats.canvasCream, [0, 0.62, 0], [0.34, 0.26, 0.34], 6, 5);
    kit.box(mats.woodCrate, [0.95, 0.4, 0.4], [0.75, 0.75, 0.75], [0, rng * 12, 0]);
    kit.colliderBox([0, 0.45, 0], [1.3, 0.95, 1.3]);
  }
}
