// AssetFactory — the single entry point for placing any registered asset.
//
//   placeAsset(env, 'house_wood_small', { position: [10, 20], rotationY: 45 })
//
// env must provide: { app, device, batch, collision, mats, groundAt(x, z) }
//
// The factory resolves the ground height automatically (unless the caller
// supplies an explicit Y), creates a fresh deterministic AssetKit, lets the
// asset module author its geometry in local space, then merges the result
// into the island batch + collision system.
import { AssetKit } from '../../assets/kit.js';
import { BUILDING_ASSETS } from '../../assets/buildings/index.js';
import { VEGETATION_ASSETS } from '../../assets/vegetation/index.js';
import { PROP_ASSETS } from '../../assets/props/index.js';
import { ROCK_ASSETS } from '../../assets/rocks/index.js';
import { DECORATION_ASSETS } from '../../assets/decorations/index.js';

const REGISTRY = new Map();
for (const mod of [
  ...BUILDING_ASSETS,
  ...VEGETATION_ASSETS,
  ...PROP_ASSETS,
  ...ROCK_ASSETS,
  ...DECORATION_ASSETS
]) {
  REGISTRY.set(mod.meta.id, mod);
}

// Stable numeric seed per asset id + placement index.
function seedFor(id, index) {
  let h = 2166136261;
  const str = `${id}#${index}`;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

let placementCounter = 0;

// opts: {
//   position: [x, z] or [x, y, z]   — LOCAL to the island when env carries
//                                     an islandOffset (layouts), world otherwise
//   rotationY, scale,
//   theme, variant, colorVariant, seed,
//   collide (bool, default true),
//   detail (bool — route to the island's LOD detail batch)
// }
export function placeAsset(env, assetId, opts = {}) {
  const asset = REGISTRY.get(assetId);
  if (!asset) {
    console.warn(`[assetFactory] unknown asset "${assetId}"`);
    return null;
  }

  const off = env.islandOffset || [0, 0];
  const pos = opts.position;
  const lx = pos[0];
  const lz = pos.length >= 3 ? pos[2] : pos[1];
  const y = pos.length >= 3 ? pos[1] : env.groundAt(lx, lz);
  // World placement (batch geometry + colliders live in world space).
  const x = lx + off[0];
  const z = lz + off[1];

  const index = opts.seedIndex !== undefined ? opts.seedIndex : placementCounter++;
  const kit = new AssetKit().setSeed(opts.seed !== undefined ? opts.seed : seedFor(assetId, index));

  // Micro-detail assets (grass, flowers) can be routed to the island's
  // detail batch so the LOD system can hide them at distance.
  const targetEnv = (opts.detail && env.detailBatch)
    ? { ...env, batch: env.detailBatch }
    : env;

  const localOpts = {
    ...opts,
    position: [lx, y, lz]
  };

  // The asset authors geometry in kit-local space (origin at ground centre).
  const extra = asset.build(kit, targetEnv, localOpts) || {};

  kit.build(targetEnv, {
    position: [x, y, z],
    rotationY: opts.rotationY || 0,
    scale: opts.scale || 1,
    collide: opts.collide !== false
  });

  return { x, y, z, ...extra };
}

export function hasAsset(assetId) {
  return REGISTRY.has(assetId);
}

export function listAssets() {
  return [...REGISTRY.keys()];
}
