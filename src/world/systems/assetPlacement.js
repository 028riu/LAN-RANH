// AssetPlacement — helpers for placing assets on the terrain.
//
// sampleFootprint: world ground heights under an asset footprint (used by
// buildings to bury foundations into slopes).
// scatter: deterministic, terrain-aware placement of many instances of one
// asset (vegetation, rocks) with density masking and exclusion zones.
// scatterGroup: mixed-species scatter driven by a weighted list.

const TAU = Math.PI * 2;

// Returns [4 corner ground heights] for a footprint of w×d rotated by yaw.
export function sampleFootprint(env, position, w, d, yawDeg) {
  const r = (yawDeg || 0) * Math.PI / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const hw = w / 2;
  const hd = d / 2;
  const pts = [[-hw, -hd], [hw, -hd], [-hw, hd], [hw, hd]];
  return pts.map(([ox, oz]) => {
    const wx = position[0] + ox * c + oz * s;
    const wz = position[2] - ox * s + oz * c;
    return env.groundAt(wx, wz);
  });
}

// Deterministic scatter of one asset.
// opts: {
//   asset, count, seed,
//   center: [x, z], radius | innerRadius+outerRadius (ring),
//   minHeight, maxHeight, minSlope, maxSlope,
//   scale: [min, max], rotation: 'random' | 0,
//   theme, collide,
//   exclude: [{x, z, r}],
//   density: (x, z) => probability multiplier (optional)
//   place: (env, i, x, z, yaw, scale) => override for custom calls
// }
export function scatter(env, opts) {
  const rng = makeRng(opts.seed !== undefined ? opts.seed : 1234);
  const placed = [];
  let attempts = 0;
  let index = 0;
  const maxAttempts = (opts.count || 10) * 30;
  const cx = opts.center ? opts.center[0] : 0;
  const cz = opts.center ? opts.center[1] : 0;
  const rMin = opts.innerRadius !== undefined ? opts.innerRadius : 0;
  const rMax = opts.radius !== undefined ? opts.radius : 50;

  while (placed.length < (opts.count || 10) && attempts < maxAttempts) {
    attempts += 1;
    const a = rng() * TAU;
    const r = Math.sqrt(rMin * rMin + rng() * (rMax * rMax - rMin * rMin));
    const x = cx + Math.cos(a) * r;
    const z = cz + Math.sin(a) * r;

    if (opts.exclude && opts.exclude.some((e) => Math.hypot(x - e.x, z - e.z) < e.r)) continue;

    const h = env.groundAt(x, z);
    if (opts.minHeight !== undefined && h < opts.minHeight) continue;
    if (opts.maxHeight !== undefined && h > opts.maxHeight) continue;
    const slope = env.slopeAt ? env.slopeAt(x, z) : 0;
    if (opts.minSlope !== undefined && slope < opts.minSlope) continue;
    if (opts.maxSlope !== undefined && slope > opts.maxSlope) continue;
    if (opts.density && rng() > opts.density(x, z)) continue;

    const scaleMin = Array.isArray(opts.scale) ? opts.scale[0] : (opts.scale || 1);
    const scaleMax = Array.isArray(opts.scale) ? opts.scale[1] : (opts.scale || 1);
    const scale = scaleMin + rng() * (scaleMax - scaleMin);
    const yaw = opts.rotation === 'random' ? rng() * 360 : (opts.rotation || 0);

    if (opts.place) {
      opts.place(env, index, x, z, yaw, scale);
    } else {
      // Lazy import avoided: env.placeAsset is injected by createWorld.
      env.placeAsset(opts.asset, {
        position: [x, z],
        rotationY: yaw,
        scale,
        theme: opts.theme,
        variant: opts.variant,
        seed: (opts.seed || 0) + index * 7919,
        collide: opts.collide
      });
    }
    placed.push({ x, z, y: h, scale, yaw });
    index += 1;
  }
  return placed;
}

// Weighted mixed scatter — e.g. 60% grass, 25% bush, 15% flower.
export function scatterGroup(env, opts) {
  const rng = makeRng(opts.seed !== undefined ? opts.seed : 999);
  const total = (opts.weighted || []).reduce((s, w) => s + w.weight, 0);
  const placed = [];
  let index = 0;
  for (const w of opts.weighted) {
    const count = Math.max(0, Math.round((w.weight / total) * (opts.count || 0)));
    const sub = scatter(env, {
      ...opts,
      asset: w.asset,
      count,
      seed: (opts.seed || 0) + index * 131,
      place: w.place,
      collide: w.collide !== undefined ? w.collide : opts.collide
    });
    placed.push(...sub);
    index += 1;
  }
  return placed;
}

export function makeRng(seed = 1234) {
  let s = seed >>> 0;
  return function next() {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
