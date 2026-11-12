// Pine tree — conical cold-climate tree with snow-dusted tier branches.
export const meta = {
  id: 'pine_tree',
  label: 'Pine Tree'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'snow');
  const rng = kit.rng();
  const variant = opts.variant || 0;
  const trunkH = (3.2 + variant * 1.1) * (0.9 + rng * 0.25);
  const snowy = opts.snow !== false;

  // Trunk
  kit.cyl(mats.bark, [0, trunkH * 0.4, 0], 0.22, trunkH * 0.8, 8, [0, rng * 360, 0], 0.16);
  kit.colliderCylinder([0, trunkH * 0.4, 0], 0.3, trunkH * 0.8);

  // Conical tiers (3-4 stacked cones)
  const tiers = 3 + Math.floor(rng * 2);
  const baseR = 1.6 + variant * 0.35;
  for (let i = 0; i < tiers; i += 1) {
    const t = i / tiers;
    const y = trunkH * 0.35 + t * trunkH * 0.75;
    const r = baseR * (1 - t * 0.55);
    const h = trunkH * 0.55;
    kit.cyl(mats.leafPine, [0, y + h * 0.28, 0], r, h, 9, [0, rng * 360, 0], 0.02);
    if (snowy) {
      // Snow rim on the top edge of each tier
      kit.cyl(mats.snow, [0, y + h * 0.52, 0], r * 0.62, 0.14, 9, [0, rng * 360, 0], 0.01);
    }
  }
  // Tip
  kit.cyl(mats.leafPine, [0, trunkH + 0.55, 0], 0.42, 0.9, 8, [0, 0, 0], 0.02);
  if (snowy) kit.cyl(mats.snow, [0, trunkH + 0.78, 0], 0.26, 0.16, 8, [0, 0, 0], 0.01);
}
