// Dry bush — sparse desert scrub with twiggy branches.
export const meta = {
  id: 'bush_dry',
  label: 'Dry Bush'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'desert');
  const rng = kit.rng();

  const twigs = 5 + Math.floor(rng * 4);
  for (let i = 0; i < twigs; i += 1) {
    const a = rng * Math.PI * 2;
    const pitch = -(24 + rng * 40);
    const len = 0.4 + rng * 0.55;
    kit.pushFrame([0, 0.05, 0], a * 57.3);
    kit.box(rng > 0.4 ? mats.leafDry : mats.bark, [len * 0.4, len * 0.32, 0], [len, 0.05, 0.05], [pitch, 90, 0]);
    kit.popFrame();
  }
  kit.ellipsoid(mats.leafDry, [0, 0.16, 0], [0.3, 0.18, 0.3], 6, 4);
}
