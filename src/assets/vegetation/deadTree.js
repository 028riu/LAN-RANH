// Dead tree — charred, leafless tree for the volcanic island and dry
// corners of the desert.
export const meta = {
  id: 'dead_tree',
  label: 'Dead Tree'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'volcanic');
  const rng = kit.rng();
  const h = (2.6 + rng * 1.8) * (opts.scale || 1);

  kit.cyl(mats.barkBurnt, [0, h * 0.45, 0], 0.2, h * 0.9, 7, [0, rng * 360, 0], 0.1);
  kit.colliderCylinder([0, h * 0.45, 0], 0.28, h * 0.9);

  // Bare branches
  const branches = 3 + Math.floor(rng * 3);
  for (let i = 0; i < branches; i += 1) {
    const a = rng * Math.PI * 2;
    const t = 0.45 + rng * 0.45;
    const by = h * t;
    const len = 0.9 + rng * 1.1;
    const pitch = -(20 + rng * 35);
    kit.pushFrame([0, by, 0], a * 57.3);
    kit.box(mats.barkBurnt, [len * 0.45, 0, 0], [len, 0.08, 0.08], [pitch, 90, 0]);
    if (rng > 0.5) {
      kit.box(mats.barkBurnt, [len * 0.8, len * 0.22, 0], [len * 0.5, 0.06, 0.06], [pitch + 25, 90, 0]);
    }
    kit.popFrame();
  }
}
