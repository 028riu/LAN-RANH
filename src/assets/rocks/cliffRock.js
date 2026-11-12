// Cliff rock — big coastal cliff boulder for shorelines and coves.
// Built from stacked, flattened ellipsoid lobes with a rock-strata tint
// band and a wet base skirt, so clusters read as weathered sea cliffs
// rather than stacked boxes. Several placed together form cave mouths.
export const meta = { id: 'cliff_rock', label: 'Cliff Rock' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const s = opts.scale || 1;

  const bodyH = (3.2 + rng * 2.4) * s;
  const bodyW = (3.4 + rng * 2.0) * s;

  // Main mass — three big lobes.
  kit.ellipsoid(mats.rock, [0, bodyH * 0.42, 0], [bodyW * 0.62, bodyH * 0.46, bodyW * 0.55], 8, 6);
  kit.ellipsoid(mats.rockDry, [bodyW * 0.22, bodyH * 0.66, -bodyW * 0.12],
    [bodyW * 0.42, bodyH * 0.34, bodyW * 0.38], 7, 5);
  kit.ellipsoid(mats.rock, [-bodyW * 0.26, bodyH * 0.3, bodyW * 0.16],
    [bodyW * 0.4, bodyH * 0.3, bodyW * 0.36], 7, 5);

  // Strata band (slightly lighter shelf across the face).
  kit.ellipsoid(mats.stoneSmooth, [0, bodyH * 0.28, bodyW * 0.16],
    [bodyW * 0.5, bodyH * 0.1, bodyW * 0.3], 7, 4);

  // Scree chunks at the foot.
  for (let i = 0; i < 3; i += 1) {
    const a = rng * Math.PI * 2;
    const rr = bodyW * (0.5 + rng * 0.25);
    const sz = bodyW * (0.14 + rng * 0.12);
    kit.ellipsoid(mats.rock, [Math.cos(a) * rr, sz * 0.4, Math.sin(a) * rr],
      [sz, sz * 0.7, sz * 0.85], 6, 4);
  }

  // Wet base skirt.
  kit.ellipsoid(mats.rockWet, [0, bodyH * 0.1, 0], [bodyW * 0.72, bodyH * 0.14, bodyW * 0.64], 8, 5);

  kit.colliderBox([0, bodyH * 0.4, 0], [bodyW * 1.1, bodyH * 0.85, bodyW * 0.95], { yaw: 0 });
}
