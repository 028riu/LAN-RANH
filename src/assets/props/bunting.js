// Bunting line — festive string of pennant flags strung between two posts.
// The market and village dress with these for an inhabited feel. The rope
// sags via three beam segments; pennants hang from the sag points.
// Local space: origin at ground centre of the span, line runs along +X.
export const meta = { id: 'bunting', label: 'Bunting Line' };

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const rng = kit.rng();
  const span = opts.length || 7.0;
  const H = opts.height || 3.2;
  const sag = 0.55;
  const colors = [mats.flagRed, mats.canvasTeal, mats.canvasCream, mats.woodPaintedTeal];

  // End posts.
  for (const sx of [-1, 1]) {
    kit.box(mats.trim, [sx * span / 2, H / 2, 0], [0.14, H, 0.14], [0, 0, sx * 2]);
    kit.colliderCylinder([sx * span / 2, H / 2, 0], 0.16, H);
    kit.box(mats.accent, [sx * span / 2, H + 0.06, 0], [0.2, 0.1, 0.2]);
  }

  // Sagging rope (4 segments through a parabola-ish polyline).
  const pts = [];
  for (let i = 0; i <= 4; i += 1) {
    const t = i / 4;
    pts.push([-span / 2 + t * span, H - Math.sin(t * Math.PI) * sag, 0]);
  }
  for (let i = 0; i < pts.length - 1; i += 1) {
    kit.beam(mats.rope, pts[i], pts[i + 1], 0.045, 0.04);
  }

  // Pennants hanging from each interior point + quarter points.
  const hang = [];
  for (let i = 1; i < pts.length; i += 1) {
    hang.push([(pts[i - 1][0] + pts[i][0]) / 2, (pts[i - 1][1] + pts[i][1]) / 2]);
  }
  for (let i = 0; i < hang.length; i += 1) {
    const [x, y] = hang[i];
    const sway = Math.sin(i * 1.7 + rng) * 0.1;
    kit.beam(colors[i % colors.length],
      [x, y, 0], [x + sway, y - 0.5, 0.02], 0.22, 0.02,
      [Math.sin(i * 0.9), 1, 0.4]);
    // Triangle fold (second beam slightly narrower).
    kit.beam(colors[(i + 1) % colors.length],
      [x, y - 0.2, 0], [x + sway * 1.4, y - 0.48, 0.02], 0.16, 0.02,
      [Math.sin(i * 0.9), 1, 0.4]);
  }
}
