// Fern — layered arching fronds for the jungle understorey.
export const meta = {
  id: 'fern_01',
  label: 'Jungle Fern'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'jungle');
  const rng = kit.rng();
  const fronds = 6 + Math.floor(rng * 3);
  for (let i = 0; i < fronds; i += 1) {
    const a = (i / fronds) * Math.PI * 2 + rng * 0.5;
    const len = 0.55 + rng * 0.45;
    kit.pushFrame([0, 0.06, 0], a * 57.3);
    kit.box(mats.leaf, [len * 0.42, len * 0.22, 0], [0.16, 0.04, len], [-28 - rng * 14, 90, 0]);
    kit.popFrame();
  }
  kit.cyl(mats.stem, [0, 0.05, 0], 0.05, 0.12, 6);
}
