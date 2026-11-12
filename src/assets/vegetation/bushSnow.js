// Snow bush — low, rounded evergreen with a snow cap.
export const meta = {
  id: 'bush_snow',
  label: 'Snow Bush'
};

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'snow');
  const rng = kit.rng();

  const lobes = 3 + Math.floor(rng * 3);
  for (let i = 0; i < lobes; i += 1) {
    const a = (i / lobes) * Math.PI * 2 + rng;
    kit.ellipsoid(mats.leafPine, [Math.cos(a) * 0.25, 0.3 + rng * 0.15, Math.sin(a) * 0.25], [0.42, 0.3, 0.42], 6, 5);
  }
  // Snow cap
  kit.ellipsoid(mats.snow, [0, 0.52, 0], [0.4, 0.16, 0.4], 7, 4);
}
