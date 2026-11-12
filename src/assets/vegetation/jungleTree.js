// Jungle tree — tall canopy giant: buttressed trunk, layered leaf domes,
// hanging vines. Dominates the Jungle Island skyline.
export const meta = {
  id: 'jungle_tree',
  label: 'Jungle Canopy Tree'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'jungle');
  const rng = kit.rng();
  const variant = opts.variant || 0;
  const trunkH = (6.5 + variant * 2.0) * (0.9 + rng * 0.25);
  const trunkR = 0.42;

  // Trunk with root buttresses
  kit.cyl(mats.bark, [0, trunkH / 2, 0], trunkR, trunkH, 9, [0, rng * 360, 0], trunkR * 0.72);
  const butts = 4 + Math.floor(rng * 2);
  for (let i = 0; i < butts; i += 1) {
    const a = (i / butts) * Math.PI * 2 + rng;
    const bx = Math.cos(a) * trunkR * 1.6;
    const bz = Math.sin(a) * trunkR * 1.6;
    kit.box(mats.bark, [bx * 0.7, 0.8, bz * 0.7], [0.4, 1.8, 0.4], [0, a * 57.3, 0]);
    kit.box(mats.bark, [bx * 0.45, 1.5, bz * 0.45], [0.34, 1.4, 0.34], [0, a * 57.3, 0]);
  }
  kit.colliderCylinder([0, trunkH / 2, 0], 0.75, trunkH);

  // Canopy: stacked leaf ellipsoids
  const domes = 3 + Math.floor(rng * 2);
  for (let i = 0; i < domes; i += 1) {
    const a = rng * Math.PI * 2;
    const dist = i === 0 ? 0 : 1.4 + rng * 1.4;
    const dy = trunkH - 0.6 - i * 0.85 + (i === 0 ? 0.9 : 0);
    const rx = 2.2 + rng * 1.3;
    kit.ellipsoid(i % 3 === 2 ? mats.leafJungle : mats.leaf, [Math.cos(a) * dist, dy, Math.sin(a) * dist], [rx, 1.25 + rng * 0.5, rx], 8, 6);
  }
  // Top dome
  kit.ellipsoid(mats.leafJungle, [0, trunkH + 0.9, 0], [2.4, 1.3, 2.4], 8, 6);

  // Vines
  const vines = 3 + Math.floor(rng * 3);
  for (let i = 0; i < vines; i += 1) {
    const a = rng * Math.PI * 2;
    const dist = 1.2 + rng * 1.6;
    const vx = Math.cos(a) * dist;
    const vz = Math.sin(a) * dist;
    const vy = trunkH + 0.4;
    const vl = 2.2 + rng * 1.8;
    kit.box(mats.vine, [vx, vy - vl / 2, vz], [0.07, vl, 0.07], [0, 0, (rng - 0.5) * 10]);
  }
}
