// Tropical broadleaf tree — a big, friendly adventure-game canopy tree:
// buttressed trunk, two leaning branch arms, and a three-lobed canopy of
// clustered ellipsoid crowns with a lighter top highlight. Distinct from
// palms and jungle giants; works on tropical, jungle and desert themes.
// Local space: origin at ground centre.
export const meta = {
  id: 'tropical_tree_01',
  label: 'Tropical Broadleaf Tree'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const variant = opts.variant || 0;

  const trunkH = (2.6 + variant * 0.7) * (0.9 + rng * 0.25);
  const trunkR = 0.34;

  // Buttressed trunk: tapered column + three root buttresses.
  kit.cyl(mats.bark, [0, trunkH / 2, 0], trunkR * 0.8, trunkH, 9, [0, rng * 360, 0], trunkR * 0.62);
  for (let i = 0; i < 4; i += 1) {
    const a = (i / 4) * Math.PI * 2 + rng * 0.6;
    const dx = Math.cos(a);
    const dz = Math.sin(a);
    kit.beam(mats.bark, [dx * 0.3, trunkH * 0.42, dz * 0.3], [dx * 0.78, 0.04, dz * 0.78], 0.2, 0.16);
    kit.colliderCylinder([dx * 0.35, trunkH * 0.2, dz * 0.35], 0.3, trunkH * 0.5, { y0: 0, y1: trunkH * 0.45 });
  }

  // Two branch arms reaching out of the trunk top.
  const branchA = rng * Math.PI * 2;
  const branchB = branchA + Math.PI * (0.6 + rng * 0.5);
  const armLen = 1.3 + rng * 0.5;
  const armTipA = [Math.cos(branchA) * armLen, trunkH + 0.9, Math.sin(branchA) * armLen];
  const armTipB = [Math.cos(branchB) * armLen * 0.85, trunkH + 1.5, Math.sin(branchB) * armLen * 0.85];
  kit.beam(mats.bark, [0, trunkH - 0.1, 0], armTipA, 0.22, 0.16);
  kit.beam(mats.bark, [0, trunkH + 0.1, 0], armTipB, 0.19, 0.13);
  kit.beam(mats.bark, [0, trunkH, 0], [0, trunkH + 2.0, 0], 0.18, 0.13);

  // Canopy: three lobes of clustered ellipsoids, lightest tone on top.
  const lobes = [
    { c: armTipA, r: [2.1, 1.25, 2.1], dy: 0.7 },
    { c: armTipB, r: [1.8, 1.1, 1.8], dy: 0.5 },
    { c: [0, trunkH + 2.4, 0], r: [2.3, 1.3, 2.3], dy: 0.2 }
  ];
  for (const lobe of lobes) {
    kit.ellipsoid(mats.leafBroadleaf, [lobe.c[0], lobe.c[1] + lobe.dy, lobe.c[2]], lobe.r, 7, 5);
    kit.ellipsoid(mats.leaf, [lobe.c[0] + 0.3, lobe.c[1] + lobe.dy + lobe.r[1] * 0.55, lobe.c[2] - 0.2],
      [lobe.r[0] * 0.62, lobe.r[1] * 0.5, lobe.r[2] * 0.62], 6, 4);
  }

  // Fruit dots (desert theme turns them orange, others keep mixed).
  const fruitMat = mats.leafBroadleaf;
  for (let i = 0; i < 5; i += 1) {
    const a = rng * Math.PI * 2;
    const rr = 1.4 + rng * 0.8;
    kit.sphere(mats.fruitOrange,
      [Math.cos(a) * rr, trunkH + 1.4 + rng * 1.2, Math.sin(a) * rr], 0.12, 5, 4);
  }
  void fruitMat;

  // Single tight trunk collider (canopy is overhead, no collider).
  kit.colliderCylinder([0, trunkH * 0.55, 0], 0.5, trunkH * 1.3, { y0: 0 });
}
