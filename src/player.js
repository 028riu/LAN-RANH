export function createExplorer(app, pc, camera, canvas, getGroundHeight = () => 0) {
  const keys = Object.create(null);
  let active = false;
  let yaw = 0;
  let pitch = 0;
  let verticalVelocity = 0;
  let grounded = true;
  const position = new pc.Vec3(0, getGroundHeight(0, 28) + 2, 28);
  const move = new pc.Vec3();

  camera.setPosition(position);
  camera.setEulerAngles(0, 0, 0);

  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  document.addEventListener('mousemove', (e) => {
    if (!active || document.pointerLockElement !== canvas) return;
    yaw -= e.movementX * 0.12;
    pitch = Math.max(-82, Math.min(82, pitch - e.movementY * 0.12));
    camera.setEulerAngles(pitch, yaw, 0);
  });

  return {
    setActive(value) { active = value; },
    update(dt) {
      const forward = (keys.KeyW || keys.ArrowUp ? 1 : 0) - (keys.KeyS || keys.ArrowDown ? 1 : 0);
      const side = (keys.KeyD || keys.ArrowRight ? 1 : 0) - (keys.KeyA || keys.ArrowLeft ? 1 : 0);
      const speed = keys.ShiftLeft || keys.ShiftRight ? 12 : 7;
      const radians = yaw * Math.PI / 180;
      move.set(
        -Math.sin(radians) * forward + Math.cos(radians) * side,
        0,
        -Math.cos(radians) * forward - Math.sin(radians) * side
      );
      if (move.lengthSq() > 1) move.normalize();
      position.x += move.x * speed * dt;
      position.z += move.z * speed * dt;
      if (keys.Space && grounded) { verticalVelocity = 7.2; grounded = false; }
      verticalVelocity -= 19 * dt;
      position.y += verticalVelocity * dt;
      const floorY = getGroundHeight(position.x, position.z) + 2;\n      if (position.y <= floorY) { position.y = floorY; verticalVelocity = 0; grounded = true; }
      position.x = Math.max(-195, Math.min(195, position.x));
      position.z = Math.max(-195, Math.min(195, position.z));
      camera.setPosition(position);
    }
  };
}
