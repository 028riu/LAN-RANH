// Rope decoration — hanging rope swag between posts, or a coiled rope
// on the ground (variant).
export const meta = { id: 'rope_decor', label: 'Rope' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const variant = opts.variant || 0;

  if (variant === 1) {
    // Coiled rope on the ground
    const rings = 3;
    for (let r = 0; r < rings; r += 1) {
      kit.cyl(mats.rope, [0, 0.05 + r * 0.07, 0], 0.5 - r * 0.13, 0.07, 12, [0, r * 25, 0]);
    }
  } else {
    // Hanging swag between two posts (posts included, 3 m apart)
    kit.box(mats.trim, [-1.5, 1.1, 0], [0.14, 2.2, 0.14]);
    kit.box(mats.trim, [1.5, 1.1, 0], [0.14, 2.2, 0.14]);
    kit.colliderCylinder([-1.5, 1.1, 0], 0.2, 2.2);
    kit.colliderCylinder([1.5, 1.1, 0], 0.2, 2.2);
    const sag = 7;
    for (let i = 0; i < 6; i += 1) {
      const t = (i + 0.5) / 6;
      const x = -1.5 + 3.0 * t;
      const y = 2.05 - Math.sin(t * Math.PI) * sag * 0.06;
      kit.box(mats.rope, [x, y, 0], [0.52, 0.06, 0.06], [0, 0, Math.cos(t * Math.PI) * sag]);
    }
  }
}
