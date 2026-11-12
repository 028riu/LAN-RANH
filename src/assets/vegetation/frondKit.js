// FrondKit — shared builders for lush, segmented palm fronds and arcing
// grass blades. A frond is a drooping segmented spine with angled leaflets
// on both sides, built from kit.beam() so the droop curve is exact — a far
// richer silhouette than V2's single flat blade, without any engine-level
// cost (everything still merges into the island's batched mesh).
//
// All builders author in the CURRENT kit frame: push a frame at the crown
// attachment point with the frond's yaw, then call palmFrond().

const RAD = Math.PI / 180;

// Cumulative droop polyline for a frond of `segments` segments.
function droopPoints(len, droopDeg, segments) {
  const pts = [[0, 0]];
  let x = 0;
  let y = 0;
  let ang = 0;
  const segLen = len / segments;
  const perSeg = (droopDeg / segments) * RAD;
  for (let i = 0; i < segments; i += 1) {
    ang += perSeg;
    x += Math.cos(ang) * segLen;
    y -= Math.sin(ang) * segLen;
    pts.push([x, y]);
  }
  return pts;
}

// One full frond. opts: {
//   length, droop (deg, total bend), width, leafMat, spineMat,
//   segments (default 3), leaflets (true by default)
// }
// Called INSIDE a frame whose origin is the crown attachment point; the
// frond extends along local +X and bends downward. The spine carries two
// rows of paired leaflet blades plus a tip fan, so crowns read as full
// feathered palms even at mid distance.
export function palmFrond(kit, opts) {
  const len = opts.length || 3.0;
  const droop = opts.droop !== undefined ? opts.droop : 34;
  const width = opts.width || 0.5;
  const segments = opts.segments || 3;
  const leafMat = opts.leafMat;
  const spineMat = opts.spineMat || leafMat;
  const withLeaflets = opts.leaflets !== false;

  const pts = droopPoints(len, droop, segments);

  // Segmented spine (slightly thinner toward the tip).
  for (let i = 0; i < segments; i += 1) {
    const a = pts[i];
    const b = pts[i + 1];
    const t = (i + 0.5) / segments;
    kit.beam(spineMat, [a[0], a[1], 0], [b[0], b[1], 0],
      width * (1 - t * 0.45), width * 0.16 * (1 - t * 0.4));
  }

  if (!withLeaflets) return;

  // Leaflet stations along the spine: two blades per side per station
  // (a long outer blade + a shorter inner filler), plus a tip fan.
  const stations = Math.max(2, segments);
  for (let st = 1; st <= stations; st += 1) {
    const idx = Math.min(st * (pts.length - 1) / (stations + 0.2), pts.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, pts.length - 1);
    const f = idx - i0;
    const px = pts[i0][0] + (pts[i1][0] - pts[i0][0]) * f;
    const py = pts[i0][1] + (pts[i1][1] - pts[i0][1]) * f;
    const t = st / (stations + 1);
    for (const sgn of [1, -1]) {
      // Long blade
      const ll = len * 0.34 * (1 - t * 0.5);
      const wL = width * 0.30 * (1 - t * 0.3);
      kit.beam(leafMat,
        [px, py, sgn * width * 0.1],
        [px + ll * 0.42, py - ll * 0.30 - ll * 0.10, sgn * ll * 0.82],
        wL, wL * 0.22);
      // Short filler blade (fills the gap toward the spine)
      const ls = ll * 0.62;
      kit.beam(leafMat,
        [px, py, sgn * width * 0.08],
        [px + ls * 0.30, py - ls * 0.16, sgn * ls * 0.94],
        wL * 0.85, wL * 0.20);
    }
  }

  // Tip fan: three blades splaying from the end of the spine.
  const tip = pts[pts.length - 1];
  for (const [dz, dy] of [[0.7, 0.05], [-0.7, 0.05], [0.1, -0.2]]) {
    const lt = len * 0.24;
    kit.beam(leafMat,
      [tip[0], tip[1], 0],
      [tip[0] + lt * 0.5, tip[1] - lt * (0.5 + dy), dz * lt * 0.9],
      width * 0.24, width * 0.2);
  }
}

// A whole radial crown of fronds. opts: {
//   cx, cy, cz            — crown centre in current frame space
//   count, yawOffset,
//   length (fn or number), droop (fn or number), width,
//   leafMat (fn(i) or material), spineMat
// }
export function palmCrown(kit, opts) {
  const count = opts.count || 9;
  const yawOffset = opts.yawOffset || 0;
  const cx = opts.cx || 0;
  const cy = opts.cy || 0;
  const cz = opts.cz || 0;
  const val = (v, i) => (typeof v === 'function' ? v(i) : v);
  for (let i = 0; i < count; i += 1) {
    const yaw = yawOffset + (i / count) * 360 + val(opts.jitter, i);
    kit.pushFrame([cx, cy, cz], yaw);
    palmFrond(kit, {
      length: val(opts.length, i),
      droop: val(opts.droop, i),
      width: val(opts.width, i),
      leafMat: typeof opts.leafMat === 'function' ? opts.leafMat(i) : opts.leafMat,
      spineMat: opts.spineMat,
      segments: opts.segments,
      leaflets: opts.leaflets
    });
    kit.popFrame();
  }
}

// An arcing grass/leaf blade (used by beach grass and big tropical leaves).
// Sweeps from the base upward then over, along local +X.
export function arcBlade(kit, opts) {
  const len = opts.length || 1.0;
  const rise = opts.rise !== undefined ? opts.rise : 0.55;    // 0..1 share of len spent rising
  const width = opts.width || 0.14;
  const bend = opts.bend !== undefined ? opts.bend : 80;      // deg of arc
  const segs = opts.segments || 3;
  const mat = opts.mat;
  const pts = droopPoints(len, bend, segs);
  // Rescale so the arc first rises: flip the polyline upward then tip over.
  for (let i = 1; i < pts.length; i += 1) {
    const t = i / (pts.length - 1);
    pts[i][1] = Math.sin(t * Math.PI * rise * 1.4) * len * 0.55 - t * bend * 0.35 * RAD * len * 0.4;
    pts[i][0] = t * len;
  }
  for (let i = 0; i < segs; i += 1) {
    const a = pts[i];
    const b = pts[i + 1];
    const t = (i + 0.5) / segs;
    kit.beam(mat, [a[0], a[1], 0], [b[0], b[1], 0],
      width * (1 - t * 0.6), width * 0.22);
  }
  return pts;
}
