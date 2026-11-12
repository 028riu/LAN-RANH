// AssetKit — the foundation of the modular asset system.
//
// Every asset module (house, tree, rock, prop) authors its geometry in
// LOCAL space (origin at the ground centre of the asset, +Z = front)
// using an AssetKit instance. When the asset is placed, the kit
// transforms every part by (position, rotationY, uniform scale) and
// merges the geometry into the island's PrimitiveBatch, then registers
// transformed colliders into the CollisionSystem.
//
// AssetKit also supports a FRAME STACK: pushFrame(pos, yaw, scale) lets
// an asset author sub-assemblies (a door on the side wall, a window row)
// in their own local coordinates, then pop back. This is what makes the
// shared architecture parts composable.
//
// Material fields may be a single material OR an array of tone variants —
// the kit deterministically picks one per part so large surfaces read as
// varied construction instead of flat colour.
import * as pc from 'playcanvas';

// ---------------------------------------------------------------------------
// Geometry generators (local space, centred)
// ---------------------------------------------------------------------------

function boxGeometry(size) {
  const hx = size[0] / 2;
  const hy = size[1] / 2;
  const hz = size[2] / 2;
  const positions = [
    -hx,-hy,-hz,  hx,-hy,-hz,  hx, hy,-hz, -hx, hy,-hz, // back  (-Z)
     hx,-hy, hz, -hx,-hy, hz, -hx, hy, hz,  hx, hy, hz, // front (+Z)
    -hx,-hy, hz, -hx,-hy,-hz, -hx, hy,-hz, -hx, hy, hz, // left  (-X)
     hx,-hy,-hz,  hx,-hy, hz,  hx, hy, hz,  hx, hy,-hz, // right (+X)
    -hx, hy,-hz,  hx, hy,-hz,  hx, hy, hz, -hx, hy, hz, // top
    -hx,-hy, hz,  hx,-hy, hz,  hx,-hy,-hz, -hx,-hy,-hz  // bottom
  ];
  const indices = [
    0,1,2, 0,2,3,
    4,5,6, 4,6,7,
    8,9,10, 8,10,11,
    12,13,14, 12,14,15,
    16,17,18, 16,18,19,
    20,21,22, 20,22,23
  ];
  return { positions, indices };
}

// Cylinder / truncated cone along Y (rTop may differ → taper / cone).
function cylinderGeometry(rTop, rBottom, height, radialSegments = 10) {
  const positions = [];
  const indices = [];
  const hy = height / 2;
  for (let r = 0; r < 2; r += 1) {
    const y = (r === 0) ? -hy : hy;
    const rad = (r === 0) ? rTop : rBottom;
    for (let s = 0; s < radialSegments; s += 1) {
      const a = (s / radialSegments) * Math.PI * 2;
      positions.push(Math.cos(a) * rad, y, Math.sin(a) * rad);
    }
  }
  for (let s = 0; s < radialSegments; s += 1) {
    const s0 = s;
    const s1 = (s + 1) % radialSegments;
    const t0 = s + radialSegments;
    const t1 = ((s + 1) % radialSegments) + radialSegments;
    indices.push(s0, t0, s1);
    indices.push(s1, t0, t1);
  }
  const topCenter = positions.length / 3;
  positions.push(0, hy, 0);
  const botCenter = positions.length / 3;
  positions.push(0, -hy, 0);
  for (let s = 0; s < radialSegments; s += 1) {
    const s1 = (s + 1) % radialSegments;
    indices.push(s1 + radialSegments, s + radialSegments, topCenter);
    indices.push(s, s1, botCenter);
  }
  return { positions, indices };
}

// Gable roof: triangular prism, ridge along X. Base sits at local y=0.
function gableRoofGeometry(width, depth, height) {
  const hx = width / 2;
  const hz = depth / 2;
  const positions = [
    -hx, 0, -hz,
     hx, 0, -hz,
      0, height, -hz,
    -hx, 0,  hz,
     hx, 0,  hz,
      0, height,  hz
  ];
  const indices = [
    0, 1, 2,
    3, 5, 4,
    0, 2, 3,
    3, 2, 5,
    1, 4, 2,
    4, 5, 2,
    0, 3, 1,
    3, 4, 1
  ];
  return { positions, indices };
}

// Pyramid (hip) roof: rectangular base at y=0, apex in the middle.
function pyramidRoofGeometry(width, depth, height) {
  const hx = width / 2;
  const hz = depth / 2;
  const positions = [
    -hx, 0, -hz,
     hx, 0, -hz,
     hx, 0,  hz,
    -hx, 0,  hz,
      0, height, 0
  ];
  const indices = [
    0, 1, 4,
    1, 2, 4,
    2, 3, 4,
    3, 0, 4,
    0, 3, 2,
    0, 2, 1
  ];
  return { positions, indices };
}

// Lean-to: single sloped plane, low edge at +Z, high edge at -Z.
function leanToGeometry(width, depth, height) {
  const hx = width / 2;
  const hz = depth / 2;
  const positions = [
    -hx, 0,       hz,
     hx, 0,       hz,
     hx, height, -hz,
    -hx, height, -hz
  ];
  const indices = [
    0, 1, 2,
    0, 2, 3,
    0, 3, 1,
    3, 2, 1
  ];
  return { positions, indices };
}

// Low-poly UV sphere.
function sphereGeometry(radius, widthSegments = 8, heightSegments = 6) {
  const positions = [];
  const indices = [];
  for (let y = 0; y <= heightSegments; y += 1) {
    const v = y / heightSegments;
    const phi = v * Math.PI;
    for (let x = 0; x <= widthSegments; x += 1) {
      const u = x / widthSegments;
      const theta = u * Math.PI * 2;
      const nx = Math.sin(phi) * Math.cos(theta);
      const ny = Math.cos(phi);
      const nz = Math.sin(phi) * Math.sin(theta);
      positions.push(nx * radius, ny * radius, nz * radius);
    }
  }
  const rowLen = widthSegments + 1;
  for (let y = 0; y < heightSegments; y += 1) {
    for (let x = 0; x < widthSegments; x += 1) {
      const a = y * rowLen + x;
      const b = a + 1;
      const c = a + rowLen;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }
  return { positions, indices };
}

// ---------------------------------------------------------------------------
// Small math helpers
// ---------------------------------------------------------------------------

function composeMatrix(pos, eulerDeg, scale) {
  const m = new pc.Mat4();
  m.setTRS(
    new pc.Vec3(pos[0], pos[1], pos[2]),
    new pc.Quat().setFromEulerAngles(eulerDeg[0], eulerDeg[1], eulerDeg[2]),
    new pc.Vec3(scale[0], scale[1], scale[2])
  );
  return m.data;
}

function applyTransform(positions, m) {
  const out = new Array(positions.length);
  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    out[i] = m[0] * x + m[4] * y + m[8] * z + m[12];
    out[i + 1] = m[1] * x + m[5] * y + m[9] * z + m[13];
    out[i + 2] = m[2] * x + m[6] * y + m[10] * z + m[14];
  }
  return out;
}

function rotXZ(x, z, yawRad) {
  const c = Math.cos(yawRad);
  const s = Math.sin(yawRad);
  return [x * c + z * s, -x * s + z * c];
}

// Cross product of two 3-vectors.
function cross3(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];
}

function normalize3(v) {
  const l = Math.hypot(v[0], v[1], v[2]) || 1e-6;
  return [v[0] / l, v[1] / l, v[2] / l];
}

function eulerIdentity() { return [0, 0, 0]; }

function pickTone(mat, rng) {
  if (Array.isArray(mat)) return mat[Math.floor(rng() * mat.length) % mat.length];
  return mat;
}

// ---------------------------------------------------------------------------
// AssetKit
// ---------------------------------------------------------------------------

export class AssetKit {
  constructor() {
    this.parts = [];
    this.colliders = [];
    this._frames = [];   // { pos:[x,y,z], yaw(rad), scale }
    this._rng = Math.random;
  }

  setSeed(seed) {
    let s = (seed === undefined ? 12345 : seed) >>> 0;
    this._rng = () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
    return this;
  }

  rng() { return this._rng(); }

  // --- Frame stack ---------------------------------------------------------
  pushFrame(pos, yawDeg = 0, scale = 1) {
    this._frames.push({ pos, yaw: yawDeg * Math.PI / 180, scale });
    return this;
  }

  popFrame() {
    this._frames.pop();
    return this;
  }

  // Composed frame transform applied to a local point.
  _framePoint(x, y, z) {
    let px = x, py = y, pz = z;
    for (const f of this._frames) {
      const sx = px * f.scale, sy = py * f.scale, sz = pz * f.scale;
      const rx = sx * Math.cos(f.yaw) + sz * Math.sin(f.yaw);
      const rz = -sx * Math.sin(f.yaw) + sz * Math.cos(f.yaw);
      px = f.pos[0] + rx;
      py = f.pos[1] + sy;
      pz = f.pos[2] + rz;
    }
    return [px, py, pz];
  }

  _frameYaw(yawRad) {
    let total = yawRad || 0;
    for (const f of this._frames) total += f.yaw;
    return total;
  }

  _frameScale() {
    let s = 1;
    for (const f of this._frames) s *= f.scale;
    return s;
  }

  // Total Y translation contributed by the frame stack (colliders need it).
  _frameY() {
    let y = 0;
    let s = 1;
    for (const f of this._frames) {
      y += f.pos[1] * s;
      s *= f.scale;
    }
    return y;
  }

  _push(material, positions, indices) {
    this.parts.push({ material, positions, indices });
  }

  // --- Primitive adders (kit-local space, transformed by the frame stack) --
  box(mat, center, size, euler = [0, 0, 0]) {
    const s = this._frameScale();
    const geo = boxGeometry([size[0] * s, size[1] * s, size[2] * s]);
    const c = this._framePoint(center[0], center[1], center[2]);
    const e = [euler[0], (euler[1] || 0) + this._frameYaw(0) * 180 / Math.PI, euler[2] || 0];
    const m = composeMatrix(c, e, [1, 1, 1]);
    this._push(pickTone(mat, this._rng), applyTransform(geo.positions, m), geo.indices);
    return this;
  }

  cyl(mat, center, radius, height, segments = 10, euler = [0, 0, 0], topRadius = null) {
    const s = this._frameScale();
    const geo = cylinderGeometry(
      (topRadius === null ? radius : topRadius) * s,
      radius * s,
      height * s,
      segments
    );
    const c = this._framePoint(center[0], center[1], center[2]);
    const e = [euler[0], (euler[1] || 0) + this._frameYaw(0) * 180 / Math.PI, euler[2] || 0];
    const m = composeMatrix(c, e, [1, 1, 1]);
    this._push(pickTone(mat, this._rng), applyTransform(geo.positions, m), geo.indices);
    return this;
  }

  sphere(mat, center, radius, widthSegments = 8, heightSegments = 6) {
    const s = this._frameScale();
    const geo = sphereGeometry(radius * s, widthSegments, heightSegments);
    const c = this._framePoint(center[0], center[1], center[2]);
    const m = composeMatrix(c, eulerIdentity(), [1, 1, 1]);
    this._push(pickTone(mat, this._rng), applyTransform(geo.positions, m), geo.indices);
    return this;
  }

  ellipsoid(mat, center, radii, widthSegments = 8, heightSegments = 6) {
    const s = this._frameScale();
    const geo = sphereGeometry(1, widthSegments, heightSegments);
    const scaled = new Array(geo.positions.length);
    for (let i = 0; i < geo.positions.length; i += 3) {
      scaled[i] = geo.positions[i] * radii[0] * s;
      scaled[i + 1] = geo.positions[i + 1] * radii[1] * s;
      scaled[i + 2] = geo.positions[i + 2] * radii[2] * s;
    }
    const c = this._framePoint(center[0], center[1], center[2]);
    const m = composeMatrix(c, eulerIdentity(), [1, 1, 1]);
    this._push(pickTone(mat, this._rng), applyTransform(scaled, m), geo.indices);
    return this;
  }

  // Oriented beam between two points (p0 → p1). The box's long (+Z) axis
  // follows the segment, `up` steers the roll. Endpoints are interpreted in
  // the CURRENT frame space, so beams compose with pushFrame like boxes.
  // This enables drooping fronds, arched branches, diagonal braces and any
  // geometry a yaw-only euler box cannot express.
  beam(mat, p0, p1, width, thickness = null, up = [0, 1, 0]) {
    const s = this._frameScale();
    const a = this._framePoint(p0[0], p0[1], p0[2]);
    const b = this._framePoint(p1[0], p1[1], p1[2]);
    const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const len = Math.hypot(d[0], d[1], d[2]);
    if (len < 1e-5) return this;
    const z = [d[0] / len, d[1] / len, d[2] / len];
    let x = normalize3(cross3(up, z));
    if (!isFinite(x[0]) || Math.hypot(x[0], x[1], x[2]) < 0.5) x = [1, 0, 0];
    const y = cross3(z, x);
    const th = (thickness === null ? width * 0.35 : thickness);
    const geo = boxGeometry([width * s, th * s, len]);
    // Column-major basis: columns = X, Y, Z axes + translation.
    const m = [
      x[0], x[1], x[2], 0,
      y[0], y[1], y[2], 0,
      z[0], z[1], z[2], 0,
      a[0], a[1], a[2], 1
    ];
    this._push(pickTone(mat, this._rng), applyTransform(geo.positions, m), geo.indices);
    return this;
  }

  gable(mat, center, width, depth, height, euler = [0, 0, 0]) {
    const s = this._frameScale();
    const geo = gableRoofGeometry(width * s, depth * s, height * s);
    const c = this._framePoint(center[0], center[1], center[2]);
    const e = [euler[0] || 0, (euler[1] || 0) + this._frameYaw(0) * 180 / Math.PI, euler[2] || 0];
    const m = composeMatrix(c, e, [1, 1, 1]);
    this._push(pickTone(mat, this._rng), applyTransform(geo.positions, m), geo.indices);
    return this;
  }

  pyramid(mat, center, width, depth, height, euler = [0, 0, 0]) {
    const s = this._frameScale();
    const geo = pyramidRoofGeometry(width * s, depth * s, height * s);
    const c = this._framePoint(center[0], center[1], center[2]);
    const e = [euler[0] || 0, (euler[1] || 0) + this._frameYaw(0) * 180 / Math.PI, euler[2] || 0];
    const m = composeMatrix(c, e, [1, 1, 1]);
    this._push(pickTone(mat, this._rng), applyTransform(geo.positions, m), geo.indices);
    return this;
  }

  leanTo(mat, center, width, depth, height, euler = [0, 0, 0]) {
    const s = this._frameScale();
    const geo = leanToGeometry(width * s, depth * s, height * s);
    const c = this._framePoint(center[0], center[1], center[2]);
    const e = [euler[0] || 0, (euler[1] || 0) + this._frameYaw(0) * 180 / Math.PI, euler[2] || 0];
    const m = composeMatrix(c, e, [1, 1, 1]);
    this._push(pickTone(mat, this._rng), applyTransform(geo.positions, m), geo.indices);
    return this;
  }

  // --- Colliders (kit-local space, frame-transformed at add time) ----------
  colliderBox(center, size, opts = {}) {
    const s = this._frameScale();
    const c = this._framePoint(center[0], center[1], center[2]);
    const yaw = (opts.yaw || 0) * Math.PI / 180 + this._frameYaw(0);
    const fy = this._frameY();
    const localY0 = opts.y0 !== undefined ? opts.y0 : center[1] - size[1] / 2;
    const localY1 = opts.y1 !== undefined ? opts.y1 : center[1] + size[1] / 2;
    this.colliders.push({
      kind: 'box',
      x: c[0], z: c[2],
      hx: (size[0] / 2) * s,
      hz: (size[2] / 2) * s,
      y0: localY0 * s + fy,
      y1: localY1 * s + fy,
      yaw
    });
    return this;
  }

  colliderCylinder(center, radius, height, opts = {}) {
    const c = this._framePoint(center[0], center[1], center[2]);
    const fy = this._frameY();
    const s = this._frameScale();
    const localY0 = opts.y0 !== undefined ? opts.y0 : center[1] - height / 2;
    const localY1 = opts.y1 !== undefined ? opts.y1 : center[1] + height / 2;
    this.colliders.push({
      kind: 'cyl',
      x: c[0], z: c[2],
      r: radius * s,
      y0: localY0 * s + fy,
      y1: localY1 * s + fy
    });
    return this;
  }

  // --- Placement ------------------------------------------------------------
  // Transform all kit-local parts by the placement and merge into ctx.batch,
  // registering colliders into ctx.collision.
  build(ctx, placement) {
    const pos = placement.position || [0, 0, 0];
    const yawDeg = placement.rotationY || 0;
    const scale = placement.scale || 1;
    const m = composeMatrix(pos, [0, yawDeg, 0], [scale, scale, scale]);
    const yawRad = yawDeg * Math.PI / 180;

    for (const part of this.parts) {
      const world = applyTransform(part.positions, m);
      ctx.batch._pushRaw(part.material, world, part.indices);
    }

    if (ctx.collision && placement.collide !== false) {
      for (const c of this.colliders) {
        const [wx, wz] = rotXZ(c.x * scale, c.z * scale, yawRad);
        const world = {
          kind: c.kind,
          x: pos[0] + wx,
          z: pos[2] + wz,
          y0: pos[1] + c.y0 * scale,
          y1: pos[1] + c.y1 * scale
        };
        if (c.kind === 'box') {
          world.hx = c.hx * scale;
          world.hz = c.hz * scale;
          world.yaw = yawRad + c.yaw;
          ctx.collision.addBox(world);
        } else {
          world.r = c.r * scale;
          ctx.collision.addCylinder(world);
        }
      }
    }
    return this;
  }
}

export { boxGeometry, cylinderGeometry, gableRoofGeometry, pyramidRoofGeometry, sphereGeometry };
