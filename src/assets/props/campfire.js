// Campfire — stone ring, log teepee, ember glow. No collider on the
// flames; a low stone collider keeps players from standing in it.
export const meta = { id: 'campfire', label: 'Campfire' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();

  // Stone ring
  const stones = 7;
  for (let i = 0; i < stones; i += 1) {
    const a = (i / stones) * Math.PI * 2;
    kit.sphere(mats.foundation, [Math.cos(a) * 0.72, 0.12, Math.sin(a) * 0.72], 0.2 + rng * 0.07, 6, 5);
  }
  kit.colliderCylinder([0, 0.12, 0], 0.95, 0.3);

  // Log teepee
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 + rng * 0.3;
    kit.pushFrame([0, 0.1, 0], a * 57.3);
    kit.box(mats.bark, [0.22, 0.32, 0], [0.72, 0.12, 0.12], [0, 90, -52]);
    kit.popFrame();
  }
  // Embers + glow
  kit.sphere(mats.lanternGlow, [0, 0.14, 0], 0.22, 6, 5);
  kit.sphere(mats.ember, [0.1, 0.3, -0.05], 0.1, 5, 4);
  kit.sphere(mats.ember, [-0.12, 0.26, 0.08], 0.08, 5, 4);
}
