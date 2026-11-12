// Pointer Lock manager. Wraps the browser Pointer Lock API so the rest
// of the game can subscribe to a clean locked/unlocked state and read
// mouse delta in a single place.
//
// Behaviour:
//   - request() locks the canvas (must be called from a user gesture).
//   - On lock acquired, emits 'locked'.
//   - On lock lost (browser ESC, alt-tab, focus loss), emits 'unlocked'.
//   - On mousemove while locked, accumulates movementX/Y for the game
//     loop to read at the next update tick.
//   - If the browser refuses to lock, emits 'error'.
export function createPointerLock(canvas) {
  let locked = false;
  let pendingRequest = false;
  let movementX = 0;
  let movementY = 0;
  const listeners = { locked: [], unlocked: [], error: [], move: [] };

  function emit(name, payload) {
    for (const cb of listeners[name]) {
      try { cb(payload); } catch (err) { console.error('pointerlock listener error', err); }
    }
  }

  document.addEventListener('pointerlockchange', () => {
    locked = (document.pointerLockElement === canvas);
    pendingRequest = false;
    if (locked) emit('locked');
    else emit('unlocked');
  });

  document.addEventListener('pointerlockerror', () => {
    pendingRequest = false;
    emit('error');
  });

  document.addEventListener('mousemove', (event) => {
    if (!locked) return;
    movementX += event.movementX || 0;
    movementY += event.movementY || 0;
    emit('move', { dx: event.movementX || 0, dy: event.movementY || 0 });
  });

  // Re-lock automatically when the tab regains focus if we were trying.
  window.addEventListener('focus', () => {
    if (pendingRequest && !locked) {
      try { canvas.requestPointerLock(); } catch (e) { /* ignore */ }
    }
  });

  return {
    isLocked() { return locked; },
    request() {
      if (locked) return;
      pendingRequest = true;
      // Some browsers return a Promise; wrap in try/catch.
      try {
        const r = canvas.requestPointerLock();
        if (r && typeof r.then === 'function') {
          r.then(() => { pendingRequest = false; })
            .catch(() => { pendingRequest = false; emit('error'); });
        }
      } catch (e) {
        pendingRequest = false;
        emit('error');
      }
    },
    exit() {
      if (!locked) return;
      try { document.exitPointerLock(); } catch (e) { /* ignore */ }
    },
    consumeMovement() {
      const m = { x: movementX, y: movementY };
      movementX = 0;
      movementY = 0;
      return m;
    },
    on(name, cb) {
      if (listeners[name]) listeners[name].push(cb);
      return this;
    }
  };
}
