// Flag — pole + waving cloth flag (Jolly Roger or plain red).
export const meta = { id: 'flag_decor', label: 'Flag Pole' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const h = opts.height || 5.5;
  const style = opts.variant || 0; // 0 = plain red, 1 = jolly roger

  kit.cyl(mats.trim, [0, h / 2, 0], 0.09, h, 8);
  kit.box(mats.foundation, [0, 0.1, 0], [0.44, 0.2, 0.44]);
  kit.colliderCylinder([0, h / 2, 0], 0.15, h);

  // Cross arm
  kit.box(mats.trim, [0.55, h - 0.35, 0], [1.1, 0.07, 0.07]);
  // Cloth
  const mat = style === 1 ? mats.flagJolly : mats.flagRed;
  kit.box(mat, [0.62, h - 0.85, 0], [1.05, 0.85, 0.04], [0, 0, -4]);
  kit.box(mat, [0.62, h - 0.42, 0.01], [1.05, 0.12, 0.05], [0, 0, 6]);
  if (style === 1) {
    kit.box(mats.flagRed, [0.45, h - 0.8, 0.03], [0.2, 0.16, 0.05]);
    kit.box(mats.flagJolly, [0.72, h - 0.75, 0.045], [0.34, 0.07, 0.06]);
  }
}
