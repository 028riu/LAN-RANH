// Shared architecture vocabulary.
//
// These helpers compose real structural parts — plank walls with real
// door openings, timber frames, shingled gable roofs, glazed windows with
// shutters, steps, railings, lanterns — that every building module mixes
// and matches. Walls register per-segment colliders so doorways stay
// walkable while the rest of the wall blocks the player.
//
// Conventions:
//   - Building local space: origin at ground centre, +Z = front facade.
//   - Walls: `along` = 'x' (length along X) or 'z' (length along Z).
//   - Heights are measured from the local ground (y=0).

const PLANK_W = 0.52;       // nominal plank strip width
const BAND = 0.34;          // bottom/top band height

// ---------------------------------------------------------------------------
// Plank wall with real openings
// ---------------------------------------------------------------------------
// opts: {
//   along, width, height, thickness,
//   base          — Y of the wall bottom (local),
//   center        — [cx, base, cz]  (cx/cz = wall centre),
//   openings: [{ x, width, y0, y1, type: 'door' | 'window' }]
// }
// Door openings split the wall colliders; windows keep one collider (glass).
export function plankWall(kit, mats, opts) {
  const along = opts.along || 'x';
  const w = opts.width;
  const h = opts.height;
  const t = opts.thickness || 0.28;
  const base = opts.base || 0;
  const cx = opts.center[0];
  const cz = opts.center[2];
  const openings = (opts.openings || []).filter((o) => o.type === 'door' || o.type === 'window');

  const sizeFor = (len, hh) => (along === 'x' ? [len, hh, t] : [t, hh, len]);
  const posFor = (offsetAlong, y) => (along === 'x' ? [cx + offsetAlong, y, cz] : [cx, y, cz + offsetAlong]);

  // Bottom & top bands (slightly proud of the planks).
  kit.box(mats.trim, posFor(0, base + BAND / 2), sizeFor(w + 0.12, BAND));
  kit.box(mats.trim, posFor(0, base + h - BAND / 2), sizeFor(w + 0.12, BAND));

  // Vertical planks between the bands.
  const innerH = h - BAND * 2;
  const strips = Math.max(2, Math.round(w / PLANK_W));
  const stripW = w / strips;
  for (let i = 0; i < strips; i += 1) {
    const sx = -w / 2 + stripW * (i + 0.5);
    const top = base + h - BAND;
    const bottom = base + BAND;
    // Skip planks covered by an opening.
    let covered = false;
    for (const o of openings) {
      const inX = Math.abs(sx - o.x) < o.width / 2 + stripW * 0.34;
      if (inX && top > o.y0 && bottom < o.y1) covered = true;
    }
    if (covered) continue;
    kit.box(mats.wall, posFor(sx, (bottom + top) / 2), sizeFor(stripW + 0.015, innerH));
  }

  // Lintel / sill fillers above & below each opening.
  for (const o of openings) {
    if (o.y1 < h - BAND - 0.05) {
      kit.box(mats.trim, posFor(o.x, o.y1 + 0.17), sizeFor(o.width + 0.3, 0.34));
    }
    if (o.y0 > base + BAND + 0.05) {
      kit.box(mats.trim, posFor(o.x, o.y0 - 0.17), sizeFor(o.width + 0.3, 0.34));
    }
  }

  // --- Colliders: contiguous runs minus door gaps, plus door lintels ---
  if (opts.collide !== false) {
    const doors = openings.filter((o) => o.type === 'door');
    const sorted = doors.slice().sort((a, b) => a.x - b.x);
    let cursor = -w / 2;
    const runs = [];
    for (const d of sorted) {
      const d0 = d.x - d.width / 2;
      const d1 = d.x + d.width / 2;
      if (d0 > cursor) runs.push([cursor, d0]);
      cursor = Math.max(cursor, d1);
    }
    if (cursor < w / 2) runs.push([cursor, w / 2]);

    for (const [r0, r1] of runs) {
      const len = r1 - r0;
      if (len < 0.05) continue;
      const mid = (r0 + r1) / 2;
      kit.colliderBox(posFor(mid, base + h / 2), sizeFor(len, h));
    }
    for (const d of sorted) {
      const lintelH = Math.max(0.3, base + h - (d.y1));
      if (d.y1 < base + h - 0.05) {
        kit.colliderBox(posFor(d.x, d.y1 + lintelH / 2), sizeFor(d.width + 0.1, lintelH));
      }
    }
  }
}

// Corner timber post (with a small base plinth).
export function cornerPost(kit, mats, x, z, height, r = 0.16) {
  kit.box(mats.trim, [x, height / 2, z], [r * 2, height, r * 2]);
  kit.box(mats.trim, [x, 0.12, z], [r * 2 + 0.12, 0.24, r * 2 + 0.12]);
  kit.colliderCylinder([x, height / 2, z], r * 1.4, height);
}

// ---------------------------------------------------------------------------
// Door unit — frame + real hinged leaf (open by default) + handle
// ---------------------------------------------------------------------------
// opts: { x, z, base, along ('x'|'z'), width, height, open (bool), openAngle }
export function doorUnit(kit, mats, opts) {
  const along = opts.along || 'x';
  const w = opts.width || 1.5;
  const h = opts.height || 2.55;
  const base = opts.base || 0;
  const t = 0.16;
  const yaw = along === 'x' ? 0 : 90;

  kit.pushFrame([opts.x, base, opts.z], yaw);

  // Frame: two jambs + lintel + threshold.
  kit.box(mats.trim, [-w / 2 - 0.07, h / 2, 0], [0.16, h + 0.14, t + 0.12]);
  kit.box(mats.trim, [w / 2 + 0.07, h / 2, 0], [0.16, h + 0.14, t + 0.12]);
  kit.box(mats.trim, [0, h + 0.05, 0], [w + 0.44, 0.18, t + 0.12]);
  kit.box(mats.trim, [0, 0.05, 0], [w + 0.3, 0.1, t + 0.22]);

  // Door leaf — hinged at the left jamb, swung open into the room.
  const openAngle = opts.open === false ? 0 : (opts.openAngle !== undefined ? opts.openAngle : 62);
  const hingeX = -w / 2 + 0.05;
  const plankCount = 4;
  const plankW = (w - 0.1) / plankCount;
  kit.pushFrame([hingeX, 0, -t / 2 + 0.02], -openAngle);
  for (let i = 0; i < plankCount; i += 1) {
    kit.box(mats.door, [plankW * (i + 0.5), h / 2, 0], [plankW - 0.02, h - 0.06, 0.07]);
  }
  // Cross braces + handle.
  kit.box(mats.trim, [w / 2, h * 0.28, 0.055], [w - 0.12, 0.12, 0.03]);
  kit.box(mats.trim, [w / 2, h * 0.72, 0.055], [w - 0.12, 0.12, 0.03]);
  kit.sphere(mats.brass, [w - 0.16, h * 0.48, 0.09], 0.055, 6, 5);
  kit.popFrame();

  kit.popFrame();
}

// ---------------------------------------------------------------------------
// Window unit — frame, cross mullions, glass, shutters, sill
// ---------------------------------------------------------------------------
// opts: { x, z, base, along, width, height, shutters (bool) }
export function windowUnit(kit, mats, opts) {
  const along = opts.along || 'x';
  const w = opts.width || 1.4;
  const h = opts.height || 1.3;
  const base = opts.base || 0;
  const yaw = along === 'x' ? 0 : 90;

  kit.pushFrame([opts.x, base, opts.z], yaw);

  const gy = h / 2 + 0.15;
  // Frame
  kit.box(mats.trim, [0, gy + h / 2 + 0.06, 0], [w + 0.26, 0.14, 0.2]);
  kit.box(mats.trim, [0, gy - h / 2 - 0.06, 0], [w + 0.26, 0.14, 0.2]);
  kit.box(mats.trim, [-w / 2 - 0.06, gy, 0], [0.14, h + 0.26, 0.2]);
  kit.box(mats.trim, [w / 2 + 0.06, gy, 0], [0.14, h + 0.26, 0.2]);
  // Glass + mullions
  kit.box(mats.glass, [0, gy, 0], [w, h, 0.06]);
  kit.box(mats.trim, [0, gy, 0.045], [0.08, h, 0.04]);
  kit.box(mats.trim, [0, gy, 0.045], [w, 0.08, 0.04]);
  // Sill
  kit.box(mats.trim, [0, gy - h / 2 - 0.16, 0.1], [w + 0.4, 0.1, 0.34]);

  if (opts.shutters !== false) {
    kit.box(mats.shutter, [-w / 2 - 0.22, gy, 0.06], [0.3, h, 0.06], [0, -14, 0]);
    kit.box(mats.shutter, [w / 2 + 0.22, gy, 0.06], [0.3, h, 0.06], [0, 14, 0]);
  }

  kit.popFrame();
}

// ---------------------------------------------------------------------------
// Detailed gable roof — prism inset + proud shingle rows + ridge + fascia
// ---------------------------------------------------------------------------
// opts: { center:[x, y, z], width, depth, height, along ('x' ridge along X |
//         'z' ridge along Z), overhang, rows }
export function gableRoofDetailed(kit, mats, opts) {
  const cx = opts.center[0];
  const cy = opts.center[1];
  const cz = opts.center[2];
  const yaw = opts.along === 'z' ? 90 : 0;
  const w = opts.width + (opts.overhang !== undefined ? opts.overhang : 0.7) * 2;
  const d = opts.depth + (opts.overhang !== undefined ? opts.overhang : 0.7) * 2;
  const h = opts.height;

  kit.pushFrame([cx, cy, cz], yaw);

  // Solid prism, inset slightly so the shingle rows read on top of it.
  kit.gable(mats.roof, [0, 0, 0], w, d - 0.24, h);
  // Shingle rows on both slopes.
  const rows = opts.rows || Math.max(3, Math.round(h / 0.55));
  const slopeAngle = Math.atan2(h, d / 2) * 180 / Math.PI;
  for (let side = 0; side < 2; side += 1) {
    const sgn = side === 0 ? 1 : -1;
    for (let k = 0; k < rows; k += 1) {
      const t = (k + 0.5) / rows;                    // 0 eave → 1 ridge
      const z = sgn * (d / 2) * (1 - t);
      const y = h * t + 0.05;
      const rowDepth = (d / 2) / rows + 0.1;
      const eul = [sgn * slopeAngle, 0, 0];
      kit.box(mats.roof, [0, y, z], [w + 0.1, 0.09, rowDepth], eul);
    }
  }
  // Ridge cap.
  kit.box(mats.roofTrim, [0, h + 0.06, 0], [w + 0.16, 0.16, 0.5]);
  // Fascia boards along both eaves.
  kit.box(mats.roofTrim, [0, -0.1, d / 2], [w + 0.1, 0.22, 0.14]);
  kit.box(mats.roofTrim, [0, -0.1, -d / 2], [w + 0.1, 0.22, 0.14]);

  kit.popFrame();
}

// Detailed lean-to roof (porch / shed): sloped slats + edge beams.
export function leanToRoofDetailed(kit, mats, opts) {
  const cx = opts.center[0];
  const cy = opts.center[1];
  const cz = opts.center[2];
  const yaw = opts.along === 'z' ? 90 : 0;
  const w = opts.width;
  const d = opts.depth;
  const h = opts.height;

  kit.pushFrame([cx, cy, cz], yaw);
  kit.leanTo(mats.roof, [0, 0, 0], w + 0.4, d + 0.2, h);
  const rows = Math.max(2, Math.round(d / 0.8));
  for (let k = 0; k < rows; k += 1) {
    const t = (k + 0.5) / rows;
    const z = (d / 2) * (1 - t);
    const y = h * t + 0.05;
    kit.box(mats.roof, [0, y, z], [w + 0.4, 0.08, d / rows + 0.08], [-Math.atan2(h, d / 2) * 180 / Math.PI, 0, 0]);
  }
  kit.box(mats.roofTrim, [0, 0.02, d / 2 + 0.06], [w + 0.44, 0.2, 0.12]);
  kit.popFrame();
}

// Detailed pyramid (hip) roof + finial.
export function pyramidRoofDetailed(kit, mats, opts) {
  const cx = opts.center[0];
  const cy = opts.center[1];
  const cz = opts.center[2];
  const w = opts.width;
  const d = opts.depth;
  const h = opts.height;

  kit.pushFrame([cx, cy, cz], 0);
  kit.pyramid(mats.roof, [0, 0, 0], w, d, h);
  // Horizontal shingle bands (proud of the slopes).
  const rows = opts.rows || Math.max(2, Math.round(h / 0.6));
  for (let k = 0; k < rows; k += 1) {
    const t = (k + 0.5) / rows;
    const shrink = 1 - t;
    const y = h * t + 0.04;
    kit.box(mats.roof, [0, y, 0], [w * shrink + 0.12, 0.08, d * shrink + 0.12]);
  }
  kit.box(mats.roofTrim, [0, h + 0.05, 0], [0.5, 0.14, 0.5]);
  kit.sphere(mats.accent, [0, h + 0.24, 0], 0.14, 6, 5);
  kit.popFrame();
}

// ---------------------------------------------------------------------------
// Steps — ascending stack along +Z with walkable colliders
// ---------------------------------------------------------------------------
export function stepsRun(kit, mats, opts) {
  const cx = opts.center[0];
  const baseY = opts.baseY || 0;
  const cz = opts.center[2];
  const width = opts.width || 2.2;
  const count = opts.count || 4;
  const stepH = opts.stepH || 0.3;
  const stepD = opts.stepD || 0.6;
  const yaw = opts.yaw || 0;

  kit.pushFrame([cx, baseY, cz], yaw);
  for (let i = 0; i < count; i += 1) {
    const top = (i + 1) * stepH;
    kit.box(mats.wall, [0, top - stepH / 2, stepD * (count - 0.5 - i)], [width, stepH, stepD]);
    kit.colliderBox([0, top - stepH / 2, stepD * (count - 0.5 - i)], [width, stepH, stepD], {
      y0: 0, y1: top
    });
  }
  // Side stringers
  kit.box(mats.trim, [-width / 2 - 0.06, count * stepH * 0.5, 0], [0.12, count * stepH, stepD * count + 0.1], [-Math.atan2(count * stepH, stepD * count) * 180 / Math.PI, 0, 0]);
  kit.box(mats.trim, [width / 2 + 0.06, count * stepH * 0.5, 0], [0.12, count * stepH, stepD * count + 0.1], [-Math.atan2(count * stepH, stepD * count) * 180 / Math.PI, 0, 0]);
  kit.popFrame();
}

// ---------------------------------------------------------------------------
// Railing run between two points (with a blocking collider)
// ---------------------------------------------------------------------------
export function railingRun(kit, mats, opts) {
  const ax = opts.from[0];
  const az = opts.from[1];
  const bx = opts.to[0];
  const bz = opts.to[1];
  const y = opts.y || 0;
  const postH = opts.postH || 1.05;

  const dx = bx - ax;
  const dz = bz - az;
  const len = Math.hypot(dx, dz);
  if (len < 0.1) return;
  const yawDeg = Math.atan2(dx, dz) * 180 / Math.PI;
  const mx = (ax + bx) / 2;
  const mz = (az + bz) / 2;

  kit.pushFrame([mx, y, mz], yawDeg);
  const posts = Math.max(2, Math.round(len / 1.7) + 1);
  for (let i = 0; i < posts; i += 1) {
    const p = -len / 2 + (len / (posts - 1)) * i;
    kit.box(mats.trim, [0, postH / 2, p], [0.12, postH, 0.12]);
  }
  kit.box(mats.wall, [0, postH - 0.09, 0], [0.1, 0.1, len]);
  kit.box(mats.wall, [0, postH * 0.55, 0], [0.08, 0.08, len]);
  kit.colliderBox([0, postH / 2, 0], [0.24, postH, len]);
  kit.popFrame();
}

// ---------------------------------------------------------------------------
// Ladder (visual only)
// ---------------------------------------------------------------------------
export function ladderRun(kit, mats, opts) {
  const cx = opts.center[0];
  const baseY = opts.baseY || 0;
  const cz = opts.center[2];
  const h = opts.height || 5;
  const yaw = opts.yaw || 0;

  kit.pushFrame([cx, baseY, cz], yaw);
  kit.box(mats.trim, [-0.28, h / 2, 0], [0.1, h, 0.1]);
  kit.box(mats.trim, [0.28, h / 2, 0], [0.1, h, 0.1]);
  const rungs = Math.floor(h / 0.45);
  for (let i = 1; i <= rungs; i += 1) {
    kit.box(mats.wall, [0, i * 0.45, 0], [0.66, 0.08, 0.08]);
  }
  kit.popFrame();
}

// ---------------------------------------------------------------------------
// Lantern on a post (emissive glass)
// ---------------------------------------------------------------------------
export function lanternPost(kit, mats, opts) {
  const cx = opts.center[0];
  const cz = opts.center[2];
  const h = opts.height || 3.0;
  const armDir = opts.armDir === undefined ? 0 : opts.armDir; // yaw deg of arm

  kit.pushFrame([cx, 0, cz], 0);
  kit.cyl(mats.trim, [0, h / 2, 0], 0.09, h, 8);
  kit.colliderCylinder([0, h / 2, 0], 0.14, h);
  kit.pushFrame([0, h - 0.12, 0], armDir);
  kit.box(mats.trim, [0.36, 0, 0], [0.72, 0.08, 0.08]);
  kit.box(mats.ironDark, [0.72, -0.16, 0], [0.08, 0.26, 0.08]);
  kit.popFrame();
  // Hanging lantern body
  const ly = h - 0.5;
  const lx = Math.cos(armDir * Math.PI / 180) * 0.72;
  const lz = -Math.sin(armDir * Math.PI / 180) * 0.72;
  kit.box(mats.ironDark, [lx, ly + 0.18, lz], [0.3, 0.08, 0.3]);
  kit.box(mats.lanternGlow, [lx, ly, lz], [0.22, 0.3, 0.22]);
  kit.box(mats.ironDark, [lx, ly - 0.18, lz], [0.26, 0.06, 0.26]);
  kit.popFrame();
}

// ---------------------------------------------------------------------------
// Stone chimney with cap
// ---------------------------------------------------------------------------
export function chimneyStack(kit, mats, opts) {
  const cx = opts.center[0];
  const baseY = opts.baseY || 0;
  const cz = opts.center[2];
  const h = opts.height || 2.6;
  const s = opts.size || 1.1;

  kit.box(mats.foundation, [cx, baseY + h / 2, cz], [s, h, s]);
  kit.box(mats.foundation, [cx, baseY + h + 0.12, cz], [s + 0.24, 0.24, s + 0.24]);
  kit.box(mats.ironDark, [cx, baseY + h + 0.3, cz], [s * 0.55, 0.2, s * 0.55]);
  kit.colliderBox([cx, baseY + h / 2, cz], [s + 0.24, h + 0.4, s + 0.24]);
}

// ---------------------------------------------------------------------------
// Foundation slab that buries itself into sloped ground
// ---------------------------------------------------------------------------
export function foundationSlab(kit, mats, opts) {
  const w = opts.width;
  const d = opts.depth;
  const h = opts.height || 0.7;
  const cx = opts.center[0];
  const cz = opts.center[2];
  // opts.baseY should be the LOWEST ground corner of the footprint.
  kit.box(mats.foundation, [cx, opts.baseY + h / 2, cz], [w + 0.5, h, d + 0.5]);
  kit.box(mats.foundation, [cx, opts.baseY + h + 0.06, cz], [w + 0.72, 0.16, d + 0.72]);
  if (opts.collide !== false) {
    kit.colliderBox([cx, opts.baseY + h / 2, cz], [w + 0.5, h, d + 0.5], {
      y0: opts.baseY - 1.5, y1: opts.baseY + h + 0.12
    });
  }
}

// ---------------------------------------------------------------------------
// Hanging sign board (for shops)
// ---------------------------------------------------------------------------
export function signBoard(kit, mats, opts) {
  const cx = opts.center[0];
  const cy = opts.center[1];
  const cz = opts.center[2];
  const yaw = opts.yaw || 0;
  const w = opts.width || 1.7;

  kit.pushFrame([cx, cy, cz], yaw);
  kit.box(mats.ironDark, [-w / 2 + 0.1, 0.35, 0], [0.06, 0.7, 0.06]);
  kit.box(mats.ironDark, [w / 2 - 0.1, 0.35, 0], [0.06, 0.7, 0.06]);
  kit.box(mats.wall, [0, 0, 0], [w, 0.62, 0.09]);
  kit.box(mats.trim, [0, 0.34, 0], [w + 0.1, 0.1, 0.11]);
  kit.box(mats.trim, [0, -0.34, 0], [w + 0.1, 0.1, 0.11]);
  if (opts.emblem) {
    kit.box(mats.accent, [0, 0, 0.06], [0.5, 0.34, 0.03]);
  }
  kit.popFrame();
}
