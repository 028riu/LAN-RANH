// Procedural skeletal animation. We drive named joints from a small
// state machine: idle / walk / run / jump / fall / land. Each state has
// a per-frame routine that computes joint rotations from a phase value
// and a blend weight. Smooth transitions are handled by the controller
// (state changes happen with a brief cross-fade).

const DEG = Math.PI / 180;

// Apply a target local rotation (Euler XYZ in degrees) onto a joint
// using additive lerp with the current rotation, so we can blend layers.
function setRot(joint, eulerDeg) {
  if (!joint) return;
  joint.setLocalEulerAngles(eulerDeg[0], eulerDeg[1], eulerDeg[2]);
}

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpEuler(out, a, b, t) {
  for (let i = 0; i < 3; i += 1) out[i] = lerp(a[i], b[i], t);
  return out;
}

// Reusable scratch arrays
const A = [0, 0, 0];
const B = [0, 0, 0];

export class AnimationSystem {
  constructor(joints) {
    this.joints = joints;
    this.state = 'idle';
    this.lastState = 'idle';
    this.stateTime = 0;          // seconds since state started
    this.blendTime = 0.25;       // crossfade duration
    this.speed = 0;              // current horizontal speed (m/s)
    this.grounded = true;
    this.verticalSpeed = 0;
    this.turnRate = 0;           // smooth target turn applied to head/torso

    // Phase accumulators
    this.walkPhase = 0;
    this.idlePhase = 0;
  }

  setState(newState) {
    if (this.state === newState) return;
    this.lastState = this.state;
    this.state = newState;
    this.stateTime = 0;
  }

  // dt: seconds. speed: horizontal speed in m/s.
  update(dt, speed, grounded, verticalSpeed) {
    this.stateTime += dt;
    this.idlePhase += dt;

    // Update walk cycle phase based on speed for ground-speed-matched cadence.
    // Walk cycle period is ~1.4m of forward travel per stride; run is ~2.4m.
    if (grounded && speed > 0.4) {
      const stride = speed > 5.5 ? 2.4 : 1.5;
      this.walkPhase += dt * (speed / stride) * Math.PI * 2;
    } else {
      // Keep walking phase frozen while idle so legs settle to neutral
      this.walkPhase += dt * 0.5;
    }

    // Apply the current state's pose. Each routine writes joint rotations.
    switch (this.state) {
      case 'idle': this.applyIdle(dt); break;
      case 'walk': this.applyWalkRun(dt, false); break;
      case 'run': this.applyWalkRun(dt, true); break;
      case 'jump': this.applyJump(dt); break;
      case 'fall': this.applyFall(dt); break;
      case 'land': this.applyLand(dt); break;
      default: this.applyIdle(dt);
    }
  }

  applyIdle(dt) {
    const j = this.joints;
    const t = this.idlePhase;

    // Gentle breathing — chest scales slightly; we fake this with a small
    // vertical bob of the chest joint.
    const breath = Math.sin(t * 1.5) * 0.5;
    setRot(j.chest, [breath, 0, 0]);
    setRot(j.torso, [0, 0, 0]);

    // Subtle weight shift on hips
    setRot(j.hips, [Math.sin(t * 0.7) * 0.4, 0, 0]);

    // Arms hang by side with slight outward drift, slow sway
    const armSway = Math.sin(t * 0.5) * 1.5;
    setRot(j.shoulderL, [0, 0, 8 + armSway]);
    setRot(j.shoulderR, [0, 0, -8 - armSway]);
    setRot(j.elbowL, [0, 0, 12]);
    setRot(j.elbowR, [0, 0, -12]);

    // Head looks slightly forward, occasional glance
    setRot(j.head, [Math.sin(t * 0.3) * 1.5, 0, 0]);

    // Legs in neutral stance
    setRot(j.hipL, [0, 0, 0]);
    setRot(j.hipR, [0, 0, 0]);
    setRot(j.kneeL, [4, 0, 0]);
    setRot(j.kneeR, [4, 0, 0]);
    setRot(j.footL, [0, 0, 0]);
    setRot(j.footR, [0, 0, 0]);
  }

  applyWalkRun(dt, isRun) {
    const j = this.joints;
    const p = this.walkPhase;
    const swingAmp = isRun ? 38 : 22;
    const armAmp = isRun ? 50 : 30;
    const torsoLean = isRun ? 8 : 3;
    const bobAmp = isRun ? 0.10 : 0.05;
    const stride = isRun ? 14 : 8; // knee lift amplitude

    // Legs swing in opposition (left forward when right back)
    const legL = Math.sin(p) * swingAmp;
    const legR = Math.sin(p + Math.PI) * swingAmp;
    setRot(j.hipL, [legL, 0, 0]);
    setRot(j.hipR, [legR, 0, 0]);

    // Knees bend more on the back-swing (when leg is moving back)
    const kneeL = Math.max(0, -Math.sin(p + Math.PI * 0.5)) * stride + (isRun ? 18 : 10);
    const kneeR = Math.max(0, -Math.sin(p + Math.PI * 0.5 + Math.PI)) * stride + (isRun ? 18 : 10);
    setRot(j.kneeL, [kneeL, 0, 0]);
    setRot(j.kneeR, [kneeR, 0, 0]);

    // Feet plant when leg is forward, lift when leg is back
    setRot(j.footL, [-Math.max(0, Math.sin(p + Math.PI * 0.25)) * 12, 0, 0]);
    setRot(j.footR, [-Math.max(0, Math.sin(p + Math.PI * 1.25)) * 12, 0, 0]);

    // Arms swing opposite to legs — right arm forward when left leg forward
    const armL = Math.sin(p + Math.PI) * armAmp;
    const armR = Math.sin(p) * armAmp;
    setRot(j.shoulderL, [armL, 0, 5]);
    setRot(j.shoulderR, [armR, 0, -5]);
    // Elbows bend slightly when arm swings back
    setRot(j.elbowL, [0, 0, 12 + Math.max(0, -armL) * 0.25]);
    setRot(j.elbowR, [0, 0, -12 - Math.max(0, -armR) * 0.25]);

    // Torso leans forward, chest rises/falls with the stride
    setRot(j.torso, [torsoLean, 0, 0]);
    setRot(j.chest, [Math.sin(p * 2) * 2.0, 0, 0]);
    // Hips bob up and down
    setRot(j.hips, [Math.sin(p * 2) * 1.5, 0, 0]);

    // Vertical bob on the root is handled by the controller's gravity
    // step; here we just keep the head stable relative to the chest
    setRot(j.head, [-torsoLean * 0.3, 0, 0]);
  }

  applyJump(dt) {
    const j = this.joints;
    // Tuck legs up, raise arms up
    setRot(j.hipL, [25, 0, 0]);
    setRot(j.hipR, [25, 0, 0]);
    setRot(j.kneeL, [55, 0, 0]);
    setRot(j.kneeR, [55, 0, 0]);
    setRot(j.footL, [-10, 0, 0]);
    setRot(j.footR, [-10, 0, 0]);
    setRot(j.shoulderL, [-140, 0, 5]);
    setRot(j.shoulderR, [-140, 0, -5]);
    setRot(j.elbowL, [0, 0, 25]);
    setRot(j.elbowR, [0, 0, -25]);
    setRot(j.torso, [-5, 0, 0]);
    setRot(j.chest, [-2, 0, 0]);
    setRot(j.head, [5, 0, 0]);
    setRot(j.hips, [5, 0, 0]);
  }

  applyFall(dt) {
    const j = this.joints;
    // Arms spread out for balance, legs slightly apart
    setRot(j.hipL, [10, 0, 8]);
    setRot(j.hipR, [10, 0, -8]);
    setRot(j.kneeL, [25, 0, 0]);
    setRot(j.kneeR, [25, 0, 0]);
    setRot(j.footL, [0, 0, 0]);
    setRot(j.footR, [0, 0, 0]);
    setRot(j.shoulderL, [-90, 0, 35]);
    setRot(j.shoulderR, [-90, 0, -35]);
    setRot(j.elbowL, [0, 0, 30]);
    setRot(j.elbowR, [0, 0, -30]);
    setRot(j.torso, [-8, 0, 0]);
    setRot(j.chest, [-4, 0, 0]);
    setRot(j.head, [-5, 0, 0]);
    setRot(j.hips, [-4, 0, 0]);
  }

  applyLand(dt) {
    const j = this.joints;
    // Recover from a crouch — ease toward idle over ~0.4s
    const t = Math.min(1, this.stateTime / 0.4);
    const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
    const crouch = (1 - ease);
    setRot(j.hipL, [crouch * 35, 0, 0]);
    setRot(j.hipR, [crouch * 35, 0, 0]);
    setRot(j.kneeL, [10 + crouch * 55, 0, 0]);
    setRot(j.kneeR, [10 + crouch * 55, 0, 0]);
    setRot(j.footL, [crouch * -15, 0, 0]);
    setRot(j.footR, [crouch * -15, 0, 0]);
    setRot(j.shoulderL, [-20 + ease * 20, 0, 5 + ease * 3]);
    setRot(j.shoulderR, [-20 + ease * 20, 0, -5 - ease * 3]);
    setRot(j.elbowL, [0, 0, 25 - ease * 13]);
    setRot(j.elbowR, [0, 0, -25 + ease * 13]);
    setRot(j.torso, [8 - ease * 8, 0, 0]);
    setRot(j.chest, [4 - ease * 4, 0, 0]);
    setRot(j.head, [4 - ease * 4, 0, 0]);
    setRot(j.hips, [8 - ease * 8, 0, 0]);
  }
}
