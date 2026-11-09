import * as pc from 'playcanvas';

export function createCamera(app, player) {
  const entity = new pc.Entity('Main Camera');
  entity.addComponent('camera', {
    clearColor: new pc.Color(0.42, 0.68, 0.84),
    fov: 62,
    nearClip: 0.1,
    farClip: 260
  });
  app.root.addChild(entity);

  const target = new pc.Vec3();
  const position = new pc.Vec3();
  return {
    entity,
    update(dt, playerEntity, yaw, pitch) {
      const p = playerEntity.getPosition();
      target.set(p.x, p.y + 1.15, p.z);
      const distance = 9;
      const horizontal = Math.cos(pitch) * distance;
      position.set(
        p.x + Math.sin(yaw) * horizontal,
        p.y + 3.1 - pitch * 2.5,
        p.z + Math.cos(yaw) * horizontal
      );
      const alpha = 1 - Math.exp(-8 * dt);
      entity.getPosition().lerp(entity.getPosition(), position, alpha);
      entity.lookAt(target);
    }
  };
}
