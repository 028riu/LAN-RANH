// Treasure chest — brass-banded pirate chest, closed or open with gold.
export const meta = { id: 'treasure_chest', label: 'Treasure Chest' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const open = opts.variant === 1;

  // Body
  kit.box(mats.wall, [0, 0.3, 0], [1.1, 0.6, 0.7]);
  // Corner brackets
  for (const [ox, oz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    kit.box(mats.brass, [ox * 0.52, 0.3, oz * 0.32], [0.08, 0.62, 0.08]);
  }
  // Bands
  kit.box(mats.brass, [0, 0.3, 0.36], [1.14, 0.1, 0.03]);
  kit.box(mats.brass, [0, 0.3, -0.36], [1.14, 0.1, 0.03]);

  if (open) {
    // Gold heap inside + open lid tilted back
    kit.ellipsoid(mats.gold, [0, 0.62, 0], [0.42, 0.14, 0.26], 7, 5);
    for (let i = 0; i < 4; i += 1) {
      kit.sphere(mats.gold, [(i - 1.5) * 0.16, 0.74 - (i % 2) * 0.04, (i % 2 ? 0.08 : -0.08)], 0.055, 5, 4);
    }
    kit.pushFrame([0, 0.6, -0.33], 0);
    kit.box(mats.wall, [0, 0.16, -0.1], [1.06, 0.14, 0.66], [-58, 0, 0]);
    kit.box(mats.brass, [0, 0.16, -0.42], [1.1, 0.1, 0.05], [-58, 0, 0]);
    kit.popFrame();
  } else {
    // Domed closed lid
    kit.ellipsoid(mats.wall, [0, 0.6, 0], [0.55, 0.18, 0.35], 8, 5);
    kit.box(mats.brass, [0, 0.72, 0], [0.16, 0.12, 0.05]);
    kit.box(mats.brass, [0, 0.62, 0.36], [0.14, 0.14, 0.05]);
  }

  kit.colliderBox([0, 0.32, 0], [1.14, 0.75, 0.74]);
}
