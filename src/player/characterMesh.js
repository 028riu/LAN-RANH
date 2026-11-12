// Procedural pirate-adventurer character built from primitives organized
// as a skeletal hierarchy. Each joint is an entity whose local rotation
// we drive from the animation system. Materials are shared per surface
// type so the whole character is a handful of shader setups.
import * as pc from 'playcanvas';
import { pbrMaterial } from '../core/meshBuilder.js';

function primitive(parent, name, type, position, scale, material, euler = [0, 0, 0]) {
  const e = new pc.Entity(name);
  e.addComponent('render', { type, material });
  e.setLocalPosition(position[0], position[1], position[2]);
  e.setLocalEulerAngles(euler[0], euler[1], euler[2]);
  e.setLocalScale(scale[0], scale[1], scale[2]);
  parent.addChild(e);
  return e;
}

function joint(parent, name, position) {
  const e = new pc.Entity(name);
  e.setLocalPosition(position[0], position[1], position[2]);
  parent.addChild(e);
  return e;
}

// Build the character. Returns { entity, joints, materials, setVisibility }
// where `entity` is the root (placed at the player's feet) and `joints`
// is a map of named joint entities the animation system can rotate.
export function buildCharacter(app) {
  const m = {
    skin: pbrMaterial({ color: [0.86, 0.66, 0.50], roughness: 0.62, metalness: 0.0 }),
    skinShade: pbrMaterial({ color: [0.78, 0.58, 0.44], roughness: 0.62 }),
    hair: pbrMaterial({ color: [0.16, 0.09, 0.05], roughness: 0.85 }),
    bandana: pbrMaterial({ color: [0.74, 0.18, 0.18], roughness: 0.82 }),
    shirt: pbrMaterial({ color: [0.82, 0.78, 0.66], roughness: 0.92 }),
    vest: pbrMaterial({ color: [0.30, 0.16, 0.08], roughness: 0.65, metalness: 0.02 }),
    pants: pbrMaterial({ color: [0.36, 0.28, 0.18], roughness: 0.88 }),
    belt: pbrMaterial({ color: [0.22, 0.12, 0.07], roughness: 0.55, metalness: 0.05 }),
    boot: pbrMaterial({ color: [0.28, 0.16, 0.08], roughness: 0.58, metalness: 0.05 }),
    brass: pbrMaterial({ color: [0.86, 0.66, 0.30], roughness: 0.32, metalness: 0.85 }),
    eye: pbrMaterial({ color: [0.06, 0.10, 0.20], roughness: 0.18, metalness: 0.1 }),
    eyeWhite: pbrMaterial({ color: [0.95, 0.93, 0.88], roughness: 0.4 }),
    lip: pbrMaterial({ color: [0.65, 0.42, 0.36], roughness: 0.55 }),
    gold: pbrMaterial({ color: [0.94, 0.78, 0.32], roughness: 0.4, metalness: 0.85 })
  };

  // Root entity — placed at the player's feet on the ground.
  const root = new pc.Entity('Player');
  app.root.addChild(root);

  // Hips joint — the parent of the upper body and the legs. The
  // animation system can rotate this for jump crouch etc.
  const hips = joint(root, 'Hips', [0, 0.95, 0]);
  // Pelvis mesh (visible)
  primitive(hips, 'Pelvis', 'box', [0, 0.02, 0], [0.32, 0.22, 0.22], m.pants);

  // Torso pivot — drives torso lean (forward when running, etc.)
  const torso = joint(hips, 'Torso', [0, 0.10, 0]);
  // Lower torso mesh — slightly tapered
  primitive(torso, 'Lower Torso', 'box', [0, 0.10, 0], [0.38, 0.20, 0.24], m.shirt);
  // Vest over shirt (slightly larger)
  primitive(torso, 'Vest', 'box', [0, 0.10, 0.02], [0.42, 0.22, 0.26], m.vest);
  // Brass buttons down the front
  for (let i = 0; i < 4; i += 1) {
    primitive(torso, `Vest Button ${i}`, 'sphere',
      [0, 0.16 - i * 0.06, 0.20], [0.03, 0.03, 0.03], m.brass);
  }
  // Belt at the bottom of the torso
  primitive(torso, 'Belt', 'box', [0, -0.02, 0], [0.40, 0.06, 0.27], m.belt);
  // Belt buckle
  primitive(torso, 'Belt Buckle', 'box', [0, -0.02, 0.14], [0.08, 0.08, 0.04], m.brass);
  // Tiny shoulder capes — small boxes on top of shoulders (decorative)
  primitive(torso, 'Shoulder Cape L', 'box', [-0.22, 0.20, 0], [0.12, 0.08, 0.22], m.vest);
  primitive(torso, 'Shoulder Cape R', 'box', [0.22, 0.20, 0], [0.12, 0.08, 0.22], m.vest);

  // Chest pivot — drives chest breathing and arm rotation parent.
  const chest = joint(torso, 'Chest', [0, 0.20, 0]);
  primitive(chest, 'Chest Mesh', 'box', [0, 0.05, 0], [0.36, 0.18, 0.22], m.shirt);

  // Head — neck joint then head mesh.
  const neck = joint(chest, 'Neck', [0, 0.18, 0]);
  primitive(neck, 'Neck Mesh', 'cylinder', [0, 0.04, 0], [0.08, 0.10, 0.08], m.skin);
  const head = joint(neck, 'Head', [0, 0.10, 0]);
  // Skull
  primitive(head, 'Head Mesh', 'sphere', [0, 0.10, 0], [0.18, 0.21, 0.20], m.skin);
  // Jaw — small box under the skull
  primitive(head, 'Jaw', 'box', [0, 0.02, 0.05], [0.16, 0.10, 0.14], m.skin);
  // Hair — back of the head (curved box, scaled sphere)
  primitive(head, 'Hair Back', 'sphere', [0, 0.10, -0.04], [0.20, 0.22, 0.20], m.hair);
  // Hair fringe on the front under the bandana
  primitive(head, 'Hair Fringe', 'box', [0, 0.20, 0.10], [0.22, 0.06, 0.06], m.hair);
  // Bandana — covers the top of the head
  primitive(head, 'Bandana', 'box', [0, 0.22, 0.02], [0.22, 0.06, 0.22], m.bandana);
  // Bandana knot at the back
  primitive(head, 'Bandana Knot', 'box', [0, 0.20, -0.16], [0.10, 0.06, 0.06], m.bandana);
  // Bandana tails (two small triangles — boxes)
  primitive(head, 'Bandana Tail L', 'box', [-0.06, 0.16, -0.18], [0.05, 0.10, 0.02], m.bandana, [0, 0, 10]);
  primitive(head, 'Bandana Tail R', 'box', [0.06, 0.16, -0.18], [0.05, 0.10, 0.02], m.bandana, [0, 0, -10]);
  // Gold earring
  primitive(head, 'Earring', 'sphere', [0.16, 0.06, 0.06], [0.025, 0.025, 0.025], m.gold);

  // Face details — eyes, eyebrows, nose, mouth
  // Left eye (camera-relative... actually face is toward +Z)
  primitive(head, 'Eye White L', 'sphere', [-0.07, 0.10, 0.17], [0.035, 0.025, 0.012], m.eyeWhite);
  primitive(head, 'Eye White R', 'sphere', [0.07, 0.10, 0.17], [0.035, 0.025, 0.012], m.eyeWhite);
  primitive(head, 'Pupil L', 'sphere', [-0.07, 0.10, 0.185], [0.018, 0.018, 0.018], m.eye);
  primitive(head, 'Pupil R', 'sphere', [0.07, 0.10, 0.185], [0.018, 0.018, 0.018], m.eye);
  // Eyebrows (small dark boxes above eyes)
  primitive(head, 'Eyebrow L', 'box', [-0.07, 0.155, 0.175], [0.07, 0.018, 0.018], m.hair);
  primitive(head, 'Eyebrow R', 'box', [0.07, 0.155, 0.175], [0.07, 0.018, 0.018], m.hair);
  // Nose — small wedge
  primitive(head, 'Nose', 'box', [0, 0.06, 0.19], [0.05, 0.07, 0.06], m.skinShade);
  // Mouth — small thin box on the jaw
  primitive(head, 'Mouth', 'box', [0, -0.01, 0.18], [0.10, 0.020, 0.020], m.lip);
  // Light stubble shading under mouth
  primitive(head, 'Stubble', 'box', [0, -0.04, 0.16], [0.14, 0.04, 0.04], m.skinShade);

  // --- ARMS ---
  // Shoulder joints — drive the upper arm swing
  const shoulderL = joint(chest, 'Shoulder L', [-0.24, 0.10, 0]);
  const shoulderR = joint(chest, 'Shoulder R', [0.24, 0.10, 0]);
  // Shoulder pads (small spheres)
  primitive(shoulderL, 'Shoulder Pad L', 'sphere', [0, 0, 0], [0.10, 0.08, 0.10], m.vest);
  primitive(shoulderR, 'Shoulder Pad R', 'sphere', [0, 0, 0], [0.10, 0.08, 0.10], m.vest);

  // Elbow joints — drive forearm bend
  const elbowL = joint(shoulderL, 'Elbow L', [0, -0.30, 0]);
  const elbowR = joint(shoulderR, 'Elbow R', [0, -0.30, 0]);
  // Upper arm mesh (cylinder, slightly tapered)
  primitive(shoulderL, 'Upper Arm L', 'capsule', [0, -0.15, 0], [0.16, 0.30, 0.16], m.shirt);
  primitive(shoulderR, 'Upper Arm R', 'capsule', [0, -0.15, 0], [0.16, 0.30, 0.16], m.shirt);
  // Forearm mesh (cylinder)
  primitive(elbowL, 'Forearm L', 'capsule', [0, -0.13, 0], [0.14, 0.26, 0.14], m.skin);
  primitive(elbowR, 'Forearm R', 'capsule', [0, -0.13, 0], [0.14, 0.26, 0.14], m.skin);
  // Wrist wraps (small dark band)
  primitive(elbowL, 'Wrist Wrap L', 'box', [0, -0.25, 0], [0.16, 0.04, 0.16], m.belt);
  primitive(elbowR, 'Wrist Wrap R', 'box', [0, -0.25, 0], [0.16, 0.04, 0.16], m.belt);

  // Hand joints (small, fixed-position)
  const handL = joint(elbowL, 'Hand L', [0, -0.27, 0]);
  const handR = joint(elbowR, 'Hand R', [0, -0.27, 0]);
  primitive(handL, 'Palm L', 'box', [0, 0, 0], [0.10, 0.08, 0.14], m.skin);
  primitive(handR, 'Palm R', 'box', [0, 0, 0], [0.10, 0.08, 0.14], m.skin);
  // Fingers (small boxes)
  for (let i = 0; i < 4; i += 1) {
    const xOff = -0.035 + i * 0.024;
    primitive(handL, `Finger L ${i}`, 'box', [xOff, -0.06, 0.02], [0.018, 0.06, 0.02], m.skin);
    primitive(handR, `Finger R ${i}`, 'box', [xOff, -0.06, 0.02], [0.018, 0.06, 0.02], m.skin);
  }
  primitive(handL, 'Thumb L', 'box', [-0.06, -0.02, -0.04], [0.022, 0.04, 0.022], m.skin);
  primitive(handR, 'Thumb R', 'box', [0.06, -0.02, -0.04], [0.022, 0.04, 0.022], m.skin);

  // --- LEGS ---
  // Hip joints — drive upper leg swing (front/back) and side kick
  const hipL = joint(hips, 'Hip L', [-0.13, -0.08, 0]);
  const hipR = joint(hips, 'Hip R', [0.13, -0.08, 0]);

  // Knee joints — drive lower leg bend
  const kneeL = joint(hipL, 'Knee L', [0, -0.42, 0]);
  const kneeR = joint(hipR, 'Knee R', [0, -0.42, 0]);
  // Upper leg mesh (cylinder, slightly tapered)
  primitive(hipL, 'Thigh L', 'capsule', [0, -0.21, 0], [0.16, 0.42, 0.16], m.pants);
  primitive(hipR, 'Thigh R', 'capsule', [0, -0.21, 0], [0.16, 0.42, 0.16], m.pants);

  // Lower leg mesh
  primitive(kneeL, 'Shin L', 'capsule', [0, -0.20, 0], [0.14, 0.40, 0.14], m.pants);
  primitive(kneeR, 'Shin R', 'capsule', [0, -0.20, 0], [0.14, 0.40, 0.14], m.pants);

  // Foot joints
  const footL = joint(kneeL, 'Foot L', [0, -0.42, 0.06]);
  const footR = joint(kneeR, 'Foot R', [0, -0.42, 0.06]);
  primitive(footL, 'Boot L', 'box', [0, -0.04, 0.02], [0.14, 0.08, 0.32], m.boot);
  primitive(footR, 'Boot R', 'box', [0, -0.04, 0.02], [0.14, 0.08, 0.32], m.boot);
  // Boot cuff (small band at the top)
  primitive(footL, 'Boot Cuff L', 'box', [0, 0.02, -0.05], [0.16, 0.06, 0.18], m.belt);
  primitive(footR, 'Boot Cuff R', 'box', [0, 0.02, -0.05], [0.16, 0.06, 0.18], m.belt);
  // Brass buckle on the boot
  primitive(footL, 'Boot Buckle L', 'box', [0, 0.02, 0.04], [0.04, 0.04, 0.02], m.brass);
  primitive(footR, 'Boot Buckle R', 'box', [0, 0.02, 0.04], [0.04, 0.04, 0.02], m.brass);

  // --- Decorative sash across the chest (red fabric, slight diagonal) ---
  primitive(torso, 'Sash', 'box', [0, 0.10, 0.13], [0.42, 0.06, 0.05], m.bandana, [0, 0, -15]);

  // --- Sword on the back (decorative) ---
  primitive(torso, 'Scabbard', 'box', [0, 0.10, -0.18], [0.06, 0.50, 0.06], m.vest, [10, 0, 0]);
  primitive(torso, 'Sword Handle', 'box', [0, 0.40, -0.16], [0.04, 0.10, 0.04], m.brass, [10, 0, 0]);
  primitive(torso, 'Sword Guard', 'box', [0, 0.36, -0.16], [0.18, 0.03, 0.04], m.gold, [10, 0, 0]);

  // Enable shadows on all child render components
  root.findComponents('render').forEach((r) => {
    r.castShadows = true;
    r.receiveShadows = false;
  });

  return {
    entity: root,
    joints: {
      root,
      hips,
      torso,
      chest,
      neck,
      head,
      shoulderL, shoulderR,
      elbowL, elbowR,
      handL, handR,
      hipL, hipR,
      kneeL, kneeR,
      footL, footR
    },
    materials: m
  };
}
