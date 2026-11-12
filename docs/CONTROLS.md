# Controls — V3

| Action     | Input        | Notes |
| ---------- | ------------ | ----- |
| Move       | W A S D / Arrows | Camera-relative; diagonal is normalised |
| Sprint     | Shift (hold) | Run speed 9.0 m/s |
| Jump       | Space        | Only when grounded |
| Look       | Mouse        | Pointer Lock required. Mouse up = look **up**, mouse down = look **down**, mouse right = turn **right**, mouse left = turn **left** |
| Sail       | E            | Stand on the deck beside a moored travel boat → prompt appears → E opens the island menu → click a destination |
| Close menu | E / Esc      | Returns to the game and re-locks the mouse |
| Pause      | Esc          | Releases the mouse, opens the Pause menu |
| Resume     | RESUME button | Re-locks the pointer |
| Restart    | RESTART button | Respawns at the arrival dock |

## Pointer lock behaviour

- PLAY (from a user click) requests the lock.
- ESC (browser-level) releases it → Pause menu.
- RESUME re-requests the lock; a click-to-retry overlay appears if the browser refuses.
- The travel menu temporarily frees the cursor (state `travel`); choosing an island
  or pressing E/Esc re-locks.

## Camera notes (fix verified since V2, preserved in V3)

Pitch is the camera's elevation angle above the player: moving the mouse up lowers
the camera and tilts the view up (clamped to −34° … +63° view angles). The camera
also pulls in automatically when a wall or rock would block the view, and lifts
above terrain.
