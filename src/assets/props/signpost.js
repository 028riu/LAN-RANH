// Signpost — directional post with 2-4 arrow planks.
export const meta = { id: 'signpost', label: 'Signpost' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const signs = opts.signs || [
    { text: 'DOCK', yaw: 0, color: 0 },
    { text: 'MARKET', yaw: 60, color: 1 }
  ];
  const h = 2.9;

  kit.cyl(mats.trim, [0, h / 2, 0], 0.11, h, 8);
  kit.box(mats.foundation, [0, 0.12, 0], [0.5, 0.24, 0.5]);
  kit.colliderCylinder([0, h / 2, 0], 0.17, h);

  signs.forEach((s, i) => {
    const y = h - 0.5 - i * 0.52;
    kit.pushFrame([0, y, 0], s.yaw || 0);
    kit.box(mats.wall, [0.55, 0, 0], [1.3, 0.4, 0.07]);
    kit.box(mats.accent, [1.12, 0, 0], [0.16, 0.4, 0.08]);
    kit.box(mats.trim, [0.55, 0.14, 0.05], [1.2, 0.06, 0.02]);
    kit.popFrame();
  });
}
