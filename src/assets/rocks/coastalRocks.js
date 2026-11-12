// Coastal rocks — a stacked sea-stack cluster for the intertidal zone:
// two or three rounded boulders piled with a flat cap stone, optional wet
// band and gull-pole. Reads as shoreline geology rather than inland rocks.
// Local space: origin at ground centre.
export const meta = { id: 'coastal_rocks', label: 'Coastal Rock Stack' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const wet = opts.wet === true;
  const stone = wet ? mats.rockWet : mats.rock;

  // Base boulder.
  const base = 1.1 + rng * 0.5;
  kit.ellipsoid(stone, [0, base * 0.42, 0], [base, base * 0.62, base * 0.85], 8, 5);

  // Second boulder resting on top, offset.
  const mid = base * 0.62;
  const ox = (rng - 0.5) * 0.7;
  const oz = (rng - 0.5) * 0.7;
  kit.ellipsoid(stone, [ox, base * 0.78 + mid * 0.3, oz], [mid, mid * 0.66, mid * 0.8], 7, 5);

  // Flat cap stone.
  kit.ellipsoid(stone, [ox * 0.6, base * 0.95 + mid * 0.62, oz * 0.6],
    [mid * 0.72, mid * 0.22, mid * 0.68], 7, 4);

  // Small side stone + barnacle band on the wet variant.
  kit.ellipsoid(stone, [base * 0.85, base * 0.22, oz - base * 0.4],
    [base * 0.32, base * 0.24, base * 0.3], 6, 4);
  if (wet) {
    kit.ellipsoid(mats.stoneSmooth, [0, base * 0.22, 0], [base * 0.98, base * 0.14, base * 0.82], 8, 4);
  }

  // Collider spans the cluster footprint.
  kit.colliderCylinder([0, base * 0.5, 0], base * 0.95, base * 1.6, { y0: 0 });
}
