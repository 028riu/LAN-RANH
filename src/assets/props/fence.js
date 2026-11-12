// Wooden fence — a run of posts + two rails between two points, with a
// continuous blocking collider. `length` along local +Z.
export const meta = { id: 'wooden_fence', label: 'Wooden Fence' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const length = opts.length || 3.2;
  const h = 1.15;

  const posts = Math.max(2, Math.round(length / 1.6) + 1);
  for (let i = 0; i < posts; i += 1) {
    const z = -length / 2 + (i * length) / (posts - 1);
    kit.box(mats.trim, [0, h / 2, z], [0.14, h, 0.14]);
    kit.box(mats.trim, [0, h + 0.06, z], [0.2, 0.1, 0.2]);
  }
  kit.box(mats.wall, [0, h * 0.82, 0], [0.09, 0.14, length]);
  kit.box(mats.wall, [0, h * 0.45, 0], [0.07, 0.11, length]);

  kit.colliderBox([0, h / 2, 0], [0.26, h, length]);
}
