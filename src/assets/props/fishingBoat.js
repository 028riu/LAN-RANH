// Fishing boat — moored rowboat with mast and furled sail (used at
// docks and beaches). Floats at y≈0.15 above the water plane.
export const meta = { id: 'fishing_boat', label: 'Fishing Boat' };

import { fishingBoat as buildBoat } from '../buildings/dockPieces.js';

export function build(kit, env, opts = {}) {
  const mats = env.mats.forTheme(opts.theme || 'tropical');
  const bob = opts.variant === 1 ? -0.06 : 0;
  kit.pushFrame([0, 0.15 + bob, 0], 0);
  buildBoat(kit, mats, { length: 5.0 + (opts.variant || 0) * 0.8, width: 1.9 });
  kit.popFrame();
  // Hull collider so the player can't walk through the boat
  kit.colliderBox([0, 0.5, 0], [2.0, 1.1, 5.0], { y0: -0.4, y1: 0.85 });
}
