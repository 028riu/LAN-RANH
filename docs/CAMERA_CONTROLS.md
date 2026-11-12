# CAMERA CONTROLS — third-person camera and pointer lock

The inverted-camera problem from V1 was fixed in V2 and **preserved verbatim
in V3** — the semantics are verified by four live assertions in the test
harness, not by reading source.

## Axis semantics (verified 28/28 PASS)

| Mouse input | movement delta | State change | Visible result |
| --- | --- | --- | --- |
| Move mouse **right** | movementX > 0 | `cameraYaw -= m.x * sens` | View turns **right** |
| Move mouse **left** | movementX < 0 | yaw increases | View turns **left** |
| Move mouse **up** | movementY < 0 | `pitch += m.y * sens` (pitch = camera elevation) | Camera sinks → view looks **up** |
| Move mouse **down** | movementY > 0 | pitch increases | Camera rises → view looks **down** |

Pitch clamps: −0.6 (low, looking up) … 1.1 (high, looking down). Sensitivity
0.0022 rad/count (`WORLD_CONFIG.camera`). Yaw is a single unclamped value.

Why it is correct: the camera position is `lookAt + (sin yaw, ·, cos yaw) ×
distance`. Decreasing yaw rotates the offset clockwise viewed from above,
which swings the view direction to the player's right. Lowering the camera
elevation angle raises the view vector's upward component (the camera looks
along `lookAt − camPos`; lowering camPos tilts that vector upward).

The camera orbits the player; **movement is camera-relative** — `W` walks
away from the camera, `A/D` strafe along its right vector.

## Smoothness and anti-clipping

- Look target is exponentially smoothed (rate 14); position follows at rate 9.
- **Obstruction pull-in:** the ray from target to desired position is sampled
  at 8 steps; the camera stops at the last sample that is both above terrain
  (+0.35 m) and free of colliders (`collision.sphereFree`, r = 0.45).
  Fully blocked → camera hugs the target (+0.6 m), no clipping through
  buildings, no jumps.
- Player mesh bob does not shake the camera (target smoothing absorbs it).
- No camera reset on pause/resume or travel (except explicit restart/arrival).

## Pointer Lock contract (`src/input/pointerLock.js`)

- **PLAY** (menu) and **RESUME** (pause) request the lock from a user gesture.
- Lock acquired → `gameState = 'playing'`; lost (browser ESC, alt-tab) → pause
  menu opens; refused → click-prompt overlay appears (click re-locks).
- ESC releases the pointer and opens the pause menu; clicking RESUME re-locks.
- A pending auto-relock fires when the tab regains focus.
- Deltas accumulate between frames and are consumed once per update tick.

## Bindings

| Action | Input |
| --- | --- |
| Move | W A S D (+ arrows) |
| Sprint | Shift (hold) |
| Jump | Space (grounded only) |
| Look | Mouse (pointer-locked) |
| Sail | E near a travel boat |
| Pause / release mouse | Esc |
| Resume | Click RESUME (re-locks) |

## Verification hooks

`window.__FZ` exposes `getCamYaw/getCamPitch/setCamYaw/setCamPitch` and the
camera entity — the harness asserts all four mouse directions via rendered
forward vectors and checks lock state through the real Pointer Lock API.
