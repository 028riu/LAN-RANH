// Cactus — desert saguaro with ribbed column and arms.
export const meta = {
  id: 'cactus',
  label: 'Desert Cactus'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'desert');
  const rng = kit.rng();
  const h = (2.2 + rng * 1.6) * (opts.scale || 1);

  // Main ribbed column (tapered cylinder + vertical ribs)
  kit.cyl(mats.leafCactus, [0, h / 2, 0], 0.34, h, 9, [0, rng * 360, 0], 0.24);
  kit.cyl(mats.leafCactus, [0, h + 0.1, 0], 0.2, 0.22, 9);
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 + rng;
    kit.box(mats.leafCactus, [Math.cos(a) * 0.31, h / 2, Math.sin(a) * 0.31], [0.05, h * 0.92, 0.05]);
  }
  kit.colliderCylinder([0, h / 2, 0], 0.42, h);

  // Arms (0-2), elbow joints
  const arms = Math.floor(rng * 3);
  for (let i = 0; i < arms; i += 1) {
    const a = rng * Math.PI * 2;
    const ay = h * (0.42 + rng * 0.2);
    const ax = Math.cos(a);
    const az = Math.sin(a);
    // Horizontal elbow
    kit.pushFrame([ax * 0.42, ay, az * 0.42], a * 57.3);
    kit.cyl(mats.leafCactus, [0.3, 0, 0], 0.17, 0.6, 8, [0, 0, 90]);
    // Vertical forearm
    kit.cyl(mats.leafCactus, [0.58, 0.42, 0], 0.16, 0.95, 8, [0, 0, 0], 0.11);
    kit.popFrame();
  }

  // Flowers on top (rare)
  if (rng > 0.72) {
    kit.sphere(mats.flower, [0, h + 0.22, 0], 0.14, 6, 5);
  }
}
