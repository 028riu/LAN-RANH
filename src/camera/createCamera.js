// Third-person camera.
//
// Mouse handling (fixed in V2):
//   - yaw   → mouse X: right = view turns right, left = view turns left
//   - pitch → mouse Y: up = view looks up, down = view looks down
//     (pitch is the camera's elevation angle ABOVE the target: lower
//     pitch = camera sinks = view tilts up)
//
// The camera also avoids clipping: the ray from the look target to the
// desired position is sampled and the camera pulls in to the last free
// sample (terrain height + registered colliders).
import * as pc from 'playcanvas';
import { WORLD_CONFIG } from '../world/worldConfig.js';

export function createCamera(app, world) {
  const groundAt = world.groundAt;
  const collision = world.collision;
  const cfg = WORLD_CONFIG.camera;

  const entity = new pc.Entity('Main Camera');
  entity.addComponent('camera', {
    clearColor: new pc.Color(0.66, 0.78, 0.86),
    fov: 60,
    nearClip: 0.1,
    farClip: 7000
  });
  app.root.addChild(entity);

  const current = new pc.Vec3(0, 6, 14);
  const desired = new pc.Vec3();
  const target = new pc.Vec3();
  const sample = new pc.Vec3();

  const baseDistance = cfg.distance;
  const heightOffset = cfg.heightOffset;
  const targetHeight = cfg.targetHeight;
  const followRate = 9;
  const lookRate = 14;

  const lookAt = new pc.Vec3(0, 4, 0);

  return {
    entity,
    setInitial(playerPos) {
      current.set(playerPos.x, playerPos.y + 4, playerPos.z + 10);
      entity.setPosition(current);
      lookAt.set(playerPos.x, playerPos.y + targetHeight, playerPos.z);
    },
    update(dt, playerEntity, yaw, pitch) {
      const p = playerEntity.getLocalPosition();
      target.set(p.x, p.y + targetHeight, p.z);

      // Smooth the look-at target (the visible mesh bobs slightly).
      const a = 1 - Math.exp(-lookRate * dt);
      lookAt.lerp(lookAt, target, a);

      // Desired camera position from yaw/pitch around the look target.
      const horizontal = Math.cos(pitch) * baseDistance;
      const vertical = Math.sin(pitch) * baseDistance + heightOffset;
      desired.set(
        lookAt.x + Math.sin(yaw) * horizontal,
        lookAt.y + vertical,
        lookAt.z + Math.cos(yaw) * horizontal
      );

      // --- Obstruction pull-in: sample the ray target → desired and stop
      // at the last sample that is above terrain AND free of colliders.
      let bestT = 0;
      const STEPS = 8;
      for (let i = 1; i <= STEPS; i += 1) {
        const t = i / STEPS;
        sample.set(
          lookAt.x + (desired.x - lookAt.x) * t,
          lookAt.y + (desired.y - lookAt.y) * t,
          lookAt.z + (desired.z - lookAt.z) * t
        );
        const minY = groundAt(sample.x, sample.z) + 0.35;
        if (sample.y < minY) break;
        if (!collision.sphereFree(sample.x, sample.y, sample.z, 0.45)) break;
        bestT = t;
      }
      if (bestT > 0.12) {
        sample.set(
          lookAt.x + (desired.x - lookAt.x) * bestT,
          lookAt.y + (desired.y - lookAt.y) * bestT,
          lookAt.z + (desired.z - lookAt.z) * bestT
        );
        desired.copy(sample);
      } else {
        // Fully blocked — hug the target.
        desired.set(lookAt.x, lookAt.y + 0.6, lookAt.z);
      }

      // Smooth camera position toward desired.
      const b = 1 - Math.exp(-followRate * dt);
      current.lerp(current, desired, b);
      entity.setPosition(current);

      entity.lookAt(lookAt.x, lookAt.y, lookAt.z);
    },
    getPosition() { return current; }
  };
}
