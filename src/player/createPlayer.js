// Player controller — camera-relative movement, gravity, ground detection
// (terrain + walkable collider tops), collision push-out against the
// static world, slope limits and the animation state machine.
//
// Collision model (see collisionSystem.js):
//   - nearby colliders are resolved as a vertical capsule (circle in XZ)
//   - low collider tops are stepped onto / landed on (crates, decks,
//     platforms, stairs)
//   - tall colliders push the player out (walls, posts, rocks, fences)
//   - raised collider bottoms are walked under (lintels, bridge decks)
import * as pc from 'playcanvas';
import { AnimationSystem } from './animation.js';
import { WORLD_CONFIG } from '../world/worldConfig.js';

const DEG = 180 / Math.PI;

export function createPlayer(app, character, world) {
  const joints = character.joints;
  const root = character.entity;
  const anim = new AnimationSystem(joints);
  const groundAt = world.groundAt;
  const slopeAt = world.slopeAt;
  const collision = world.collision;
  const cfg = WORLD_CONFIG.player;

  const WALK_SPEED = cfg.walkSpeed;
  const RUN_SPEED = cfg.runSpeed;
  const ACCEL = 12;
  const DECEL = 9;
  const GRAVITY = 22;
  const JUMP_VELOCITY = cfg.jumpVelocity;
  const SLOPE_LIMIT = 0.85;        // tangent — steeper is not climbable
  const GROUND_SNAP = 0.18;
  const DEEP_WATER_LIMIT = cfg.deepWaterLimit;
  const PLAYER_RADIUS = 0.42;
  const PLAYER_HEIGHT = 1.7;
  const STEP_UP = 0.55;

  const spawn = world.spawn;

  const state = {
    position: new pc.Vec3(spawn.x, spawn.y, spawn.z),
    horizontal: new pc.Vec3(),
    vertical: 0,
    grounded: true,
    wasGrounded: true,
    currentYaw: 0,
    targetYaw: 0,
    speed: 0,
    inDeepWater: false,
    fallStartY: spawn.y,
    landedHard: false,
    onColliderTop: false
  };

  root.setLocalPosition(state.position.x, state.position.y, state.position.z);
  root.setLocalEulerAngles(0, spawn.yaw || 0, 0);
  state.currentYaw = spawn.yaw || 0;
  state.targetYaw = state.currentYaw;

  const scratchForward = new pc.Vec3();
  const scratchRight = new pc.Vec3();
  const resolveOut = { x: 0, z: 0, standTop: -Infinity, touched: false };

  function wrapAngle(a) {
    while (a > Math.PI) a -= 2 * Math.PI;
    while (a < -Math.PI) a += 2 * Math.PI;
    return a;
  }

  function place(x, y, z) {
    state.position.set(x, y, z);
    root.setLocalPosition(x, y, z);
  }

  return {
    entity: root,
    anim,
    state,

    respawn() {
      const s = world.spawn;
      place(s.x, s.y, s.z);
      state.horizontal.set(0, 0, 0);
      state.vertical = 0;
      state.grounded = true;
      state.wasGrounded = true;
      state.currentYaw = s.yaw || 0;
      state.targetYaw = state.currentYaw;
      state.speed = 0;
      state.inDeepWater = false;
      state.landedHard = false;
      root.setLocalEulerAngles(0, state.currentYaw * DEG, 0);
    },

    // Sea-travel teleport (used by the island connection system).
    teleport(x, y, z, yaw = 0) {
      place(x, y, z);
      state.horizontal.set(0, 0, 0);
      state.vertical = 0;
      state.grounded = true;
      state.fallStartY = y;
      state.currentYaw = yaw;
      state.targetYaw = yaw;
      root.setLocalEulerAngles(0, yaw * DEG, 0);
    },

    update(dt, input, cameraYaw) {
      // ----- Camera-relative desired direction -----
      const sy = Math.sin(cameraYaw);
      const cy = Math.cos(cameraYaw);
      scratchForward.set(-sy, 0, -cy);
      scratchRight.set(cy, 0, -sy);

      let fAxis = (input.forward ? 1 : 0) - (input.backward ? 1 : 0);
      let sAxis = (input.right ? 1 : 0) - (input.left ? 1 : 0);
      if (fAxis !== 0 && sAxis !== 0) {
        const inv = 1 / Math.sqrt(2);
        fAxis *= inv;
        sAxis *= inv;
      }

      const desiredSpeed = input.sprint ? RUN_SPEED : WALK_SPEED;
      const moveDir = new pc.Vec3();
      moveDir.add(scratchForward).scale(fAxis);
      moveDir.x += scratchRight.x * sAxis;
      moveDir.z += scratchRight.z * sAxis;

      // ----- Horizontal acceleration/deceleration -----
      const desired = moveDir.clone().scale(desiredSpeed);
      const accelRate = (moveDir.lengthSq() > 0.001) ? ACCEL : DECEL;
      state.horizontal.x = damp(state.horizontal.x, desired.x, accelRate, dt);
      state.horizontal.z = damp(state.horizontal.z, desired.z, accelRate, dt);
      state.speed = Math.hypot(state.horizontal.x, state.horizontal.z);

      // ----- Attempted horizontal move with slope & water checks -----
      const curX = state.position.x;
      const curZ = state.position.z;
      const curY = state.position.y;
      const tryX = curX + state.horizontal.x * dt;
      const tryZ = curZ + state.horizontal.z * dt;
      const stepUpTolerance = 0.45;

      let newX = curX;
      let newZ = curZ;
      {
        const yAtX = groundAt(tryX, curZ);
        const slopeAtX = slopeAt(tryX, curZ);
        if (yAtX >= DEEP_WATER_LIMIT && (slopeAtX < SLOPE_LIMIT || yAtX < groundAt(curX, curZ) || yAtX - groundAt(curX, curZ) < stepUpTolerance)) {
          newX = tryX;
        }
        const yAtZ = groundAt(newX, tryZ);
        const slopeAtZ = slopeAt(newX, tryZ);
        if (yAtZ >= DEEP_WATER_LIMIT && (slopeAtZ < SLOPE_LIMIT || yAtZ < groundAt(newX, curZ) || yAtZ - groundAt(newX, curZ) < stepUpTolerance)) {
          newZ = tryZ;
        }
      }

      // ----- Static world collision (walls push out, tops stand) -----
      collision.resolve(newX, newZ, curY, PLAYER_RADIUS, PLAYER_HEIGHT, STEP_UP, resolveOut);
      newX = resolveOut.x;
      newZ = resolveOut.z;
      state.onColliderTop = resolveOut.standTop > -Infinity;

      // ----- World boundary (safety net far out at sea) -----
      const distFromCenter = Math.hypot(newX, newZ);
      if (distFromCenter > cfg.worldBoundRadius) {
        const k = cfg.worldBoundRadius / distFromCenter;
        newX *= k;
        newZ *= k;
        state.horizontal.x *= 0.5;
        state.horizontal.z *= 0.5;
      }

      // ----- Vertical: gravity + jump + ground snap -----
      const terrainY = groundAt(newX, newZ);
      const groundY = Math.max(terrainY, resolveOut.standTop);
      const wasGrounded = state.grounded;
      state.wasGrounded = wasGrounded;

      if (input.jump && wasGrounded) {
        state.vertical = JUMP_VELOCITY;
        state.grounded = false;
        state.fallStartY = curY;
        anim.setState('jump');
      } else {
        state.vertical -= GRAVITY * dt;
      }

      let nextY = curY + state.vertical * dt;

      if (state.vertical <= 0 && nextY <= groundY + GROUND_SNAP) {
        const fallDist = Math.max(0, state.fallStartY - groundY);
        nextY = groundY;
        state.vertical = 0;
        state.grounded = true;
        if (!wasGrounded && fallDist > 1.6) {
          state.landedHard = true;
        }
      } else if (nextY > groundY + GROUND_SNAP) {
        state.grounded = false;
      }

      state.inDeepWater = terrainY < DEEP_WATER_LIMIT;

      // ----- Commit position -----
      place(newX, nextY, newZ);

      // ----- Rotation toward movement direction -----
      if (state.speed > 0.15) {
        state.targetYaw = Math.atan2(state.horizontal.x, state.horizontal.z);
      }
      const diff = wrapAngle(state.targetYaw - state.currentYaw);
      const rotRate = state.speed > 0.4 ? 14 : 6;
      state.currentYaw += diff * (1 - Math.exp(-rotRate * dt));
      root.setLocalEulerAngles(0, state.currentYaw * DEG, 0);

      // ----- Animation state machine -----
      if (!state.grounded) {
        if (state.vertical > 1.5) {
          anim.setState('jump');
        } else if (state.vertical < -0.5) {
          anim.setState('fall');
        }
      } else {
        if (state.landedHard) {
          anim.setState('land');
          state.landedHard = false;
        } else if (anim.state === 'land' && anim.stateTime < 0.35) {
          // keep playing land until it eases out
        } else if (state.speed > 5.5) {
          anim.setState('run');
        } else if (state.speed > 0.4) {
          anim.setState('walk');
        } else {
          anim.setState('idle');
        }
      }

      anim.update(dt, state.speed, state.grounded, state.vertical);

      return state;
    }
  };
}

function damp(current, target, rate, dt) {
  return current + (target - current) * (1 - Math.exp(-rate * dt));
}
