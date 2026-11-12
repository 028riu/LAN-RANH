// Wooden barrel — iron-banded storage barrel.
export const meta = { id: 'wooden_barrel', label: 'Wooden Barrel' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const lying = opts.variant === 1;

  if (lying) {
    kit.cyl(mats.woodBarrel, [0, 0.52, 0], 0.5, 1.15, 12, [0, 0, 90]);
    kit.cyl(mats.barrelBand, [0.28, 0.52, 0], 0.53, 0.09, 12, [0, 0, 90]);
    kit.cyl(mats.barrelBand, [-0.28, 0.52, 0], 0.53, 0.09, 12, [0, 0, 90]);
    kit.colliderBox([0, 0.5, 0], [1.15, 1.0, 1.0]);
  } else {
    kit.cyl(mats.woodBarrel, [0, 0.55, 0], 0.5, 1.1, 12);
    kit.cyl(mats.barrelBand, [0, 0.85, 0], 0.53, 0.09, 12);
    kit.cyl(mats.barrelBand, [0, 0.25, 0], 0.53, 0.09, 12);
    kit.cyl(mats.wall, [0, 1.06, 0], 0.42, 0.08, 10);
    kit.colliderCylinder([0, 0.55, 0], 0.55, 1.1);
  }
}
