// Rock 01 — small boulder cluster.
export const meta = { id: 'rock_01', label: 'Rock 01' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const wet = opts.wet === true;

  const base = 0.55 + rng * 0.5;
  kit.ellipsoid(wet ? mats.rockWet : mats.rock, [0, base * 0.5, 0], [base, base * 0.72, base * 0.9], 7, 5, 0);
  const lobes = 1 + Math.floor(rng * 2);
  for (let i = 0; i < lobes; i += 1) {
    const a = rng * Math.PI * 2;
    const s = base * (0.45 + rng * 0.3);
    kit.ellipsoid(wet ? mats.rockWet : mats.rock,
      [Math.cos(a) * base * 0.7, s * 0.42, Math.sin(a) * base * 0.7],
      [s, s * 0.7, s * 0.85], 6, 5);
  }
  kit.colliderCylinder([0, base * 0.5, 0], base * 0.9, base);
}
