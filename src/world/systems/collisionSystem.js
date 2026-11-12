// CollisionSystem — static world collision registry.
//
// Houses, rocks, props, fences, docks and trees register axis-aligned or
// yaw-rotated box colliders and cylinder colliders here. The player
// controller resolves its capsule (circle in XZ) against nearby colliders
// each frame:
//
//   - Low colliders (top within step-up height of the feet) are WALKABLE:
//     the player steps onto crates, dock decks and watchtower platforms.
//   - Tall colliders BLOCK horizontal movement and push the player out,
//     so walls, posts, rocks and fences cannot be walked through.
//   - Colliders with a raised bottom (lintels above doors, bridge decks)
//     can be passed UNDER.
//
// Colliders live in a coarse spatial hash so per-frame queries stay cheap
// even with thousands of registered objects.
import { clamp } from '../../core/mathUtils.js';

const CELL = 16;          // spatial hash cell size (metres)
const EPS = 1e-4;

function cellKey(cx, cz) {
  return cx * 73856093 ^ cz * 19349663; // deterministic int hash
}

export class CollisionSystem {
  constructor() {
    this.grid = new Map();     // cellKey -> collider[]
    this.colliders = [];       // all colliders (for stats / debug)
  }

  _insert(c) {
    this.colliders.push(c);
    const minX = Math.floor((c.x - (c.kind === 'box' ? c.hx : c.r)) / CELL);
    const maxX = Math.floor((c.x + (c.kind === 'box' ? c.hx : c.r)) / CELL);
    const minZ = Math.floor((c.z - (c.kind === 'box' ? c.hz : c.r)) / CELL);
    const maxZ = Math.floor((c.z + (c.kind === 'box' ? c.hz : c.r)) / CELL);
    for (let cx = minX; cx <= maxX; cx += 1) {
      for (let cz = minZ; cz <= maxZ; cz += 1) {
        const key = cellKey(cx, cz);
        let list = this.grid.get(key);
        if (!list) {
          list = [];
          this.grid.set(key, list);
        }
        list.push(c);
      }
    }
  }

  // box: { x, z, hx, hz, y0, y1, yaw(rad) }
  addBox(box) {
    this._insert({
      kind: 'box',
      x: box.x, z: box.z,
      hx: box.hx, hz: box.hz,
      y0: box.y0, y1: box.y1,
      cos: Math.cos(box.yaw || 0),
      sin: Math.sin(box.yaw || 0)
    });
  }

  // cyl: { x, z, r, y0, y1 }
  addCylinder(cyl) {
    this._insert({ kind: 'cyl', x: cyl.x, z: cyl.z, r: cyl.r, y0: cyl.y0, y1: cyl.y1 });
  }

  // Query colliders whose cells overlap a circle at (x, z) with radius r.
  query(x, z, r, out = []) {
    out.length = 0;
    const minX = Math.floor((x - r) / CELL);
    const maxX = Math.floor((x + r) / CELL);
    const minZ = Math.floor((z - r) / CELL);
    const maxZ = Math.floor((z + r) / CELL);
    for (let cx = minX; cx <= maxX; cx += 1) {
      for (let cz = minZ; cz <= maxZ; cz += 1) {
        const list = this.grid.get(cellKey(cx, cz));
        if (!list) continue;
        for (const c of list) {
          if (out.indexOf(c) === -1) out.push(c);
        }
      }
    }
    return out;
  }

  // Closest point on a collider's XZ footprint to (x, z). Returns null if
  // the point is inside, in which case distance is 0.
  _closestPoint(c, x, z) {
    if (c.kind === 'cyl') {
      const dx = x - c.x;
      const dz = z - c.z;
      const d = Math.hypot(dx, dz);
      if (d < EPS) return { x: c.x + c.r, z: c.z, inside: true, dist: 0 };
      if (d <= c.r) return { x: c.x + (dx / d) * c.r, z: c.z + (dz / d) * c.r, inside: true, dist: 0 };
      return { x: c.x + (dx / d) * c.r, z: c.z + (dz / d) * c.r, inside: false, dist: d - c.r };
    }
    // OBB: transform point into box space
    const px = x - c.x;
    const pz = z - c.z;
    const lx = px * c.cos + pz * c.sin;
    const lz = -px * c.sin + pz * c.cos;
    const qx = clamp(lx, -c.hx, c.hx);
    const qz = clamp(lz, -c.hz, c.hz);
    const inside = (Math.abs(lx) <= c.hx) && (Math.abs(lz) <= c.hz);
    // back to world
    const wx = c.x + qx * c.cos - qz * c.sin;
    const wz = c.z + qx * c.sin + qz * c.cos;
    return { x: wx, z: wz, inside, dist: inside ? 0 : Math.hypot(lx - qx, lz - qz) };
  }

  // Resolve a player capsule (vertical cylinder) against nearby colliders.
  //   x, z      — player XZ position
  //   feetY     — player feet height
  //   radius    — capsule XZ radius
  //   height    — capsule height
  //   stepUp    — max ledge height the player can step onto while grounded
  // Returns { x, z, pushOut, standTop } — standTop is the highest collider
  // top the capsule may stand on this frame (-Infinity when none).
  resolve(x, z, feetY, radius, height, stepUp, out) {
    const result = out || { x, z, standTop: -Infinity, touched: false };
    result.x = x;
    result.z = z;
    result.standTop = -Infinity;
    result.touched = false;

    const near = this.query(x, z, radius + 1.5);
    // Two relaxation iterations so corner overlaps settle.
    for (let iter = 0; iter < 2; iter += 1) {
      let moved = false;
      for (const c of near) {
        // Vertical overlap test — capsule body [feetY, feetY + height]
        if (feetY + height <= c.y0 + EPS) continue;             // fully below → pass under
        if (feetY >= c.y1 - EPS) {
          // Feet at or above the top — candidate standing surface.
          const cp = this._closestPoint(c, result.x, result.z);
          const overlapDist = radius - cp.dist;
          if (overlapDist > 0) {
            if (c.y1 > result.standTop) result.standTop = c.y1;
          }
          continue;
        }
        const stepTolerance = (iter === 0) ? stepUp : 0.08;
        if (feetY >= c.y1 - stepTolerance && c.y1 - feetY > 0) {
          // Ledge within step-up range — walk on top instead of blocking.
          const cp = this._closestPoint(c, result.x, result.z);
          if (radius - cp.dist > 0 && c.y1 > result.standTop) result.standTop = c.y1;
          continue;
        }
        // Blocking collider — push the circle out of the footprint.
        const cp = this._closestPoint(c, result.x, result.z);
        const overlapDist = radius - cp.dist;
        if (overlapDist > 0) {
          result.touched = true;
          if (cp.inside) {
            // Deep inside: push toward the nearest face.
            this._pushFromInside(c, result, radius);
          } else {
            const dx = result.x - cp.x;
            const dz = result.z - cp.z;
            const d = Math.hypot(dx, dz);
            if (d > EPS) {
              result.x += (dx / d) * overlapDist;
              result.z += (dz / d) * overlapDist;
            } else {
              result.x += radius; // degenerate — nudge along X
            }
          }
          moved = true;
        }
      }
      if (!moved) break;
    }
    return result;
  }

  // When the circle centre ends up inside a box footprint, push it out via
  // the shallowest face so the player never gets teleported across a wall.
  _pushFromInside(c, result, radius) {
    if (c.kind === 'cyl') {
      const dx = result.x - c.x;
      const dz = result.z - c.z;
      const d = Math.hypot(dx, dz) || EPS;
      result.x = c.x + (dx / d) * (c.r + radius);
      result.z = c.z + (dz / d) * (c.r + radius);
      return;
    }
    const px = result.x - c.x;
    const pz = result.z - c.z;
    const lx = px * c.cos + pz * c.sin;
    const lz = -px * c.sin + pz * c.cos;
    const dxFace = c.hx - Math.abs(lx); // distance to X faces
    const dzFace = c.hz - Math.abs(lz); // distance to Z faces
    let nlx = lx;
    let nlz = lz;
    if (dxFace < dzFace) {
      nlx = (lx >= 0 ? 1 : -1) * (c.hx + radius);
    } else {
      nlz = (lz >= 0 ? 1 : -1) * (c.hz + radius);
    }
    result.x = c.x + nlx * c.cos - nlz * c.sin;
    result.z = c.z + nlx * c.sin + nlz * c.cos;
  }

  // Point clearance test used by the camera pull-in: is a sphere at (x, y, z)
  // with the given radius free of colliders?
  sphereFree(x, y, z, radius) {
    const near = this.query(x, z, radius + 0.5);
    for (const c of near) {
      if (y - radius > c.y1 || y + radius < c.y0) continue;
      const cp = this._closestPoint(c, x, z);
      if (cp.dist < radius) return false;
    }
    return true;
  }

  get count() {
    return this.colliders.length;
  }
}
