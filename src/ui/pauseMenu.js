// Pause menu — shown when pointer lock is lost (user pressed ESC).
// Provides RESUME (re-lock) and RESTART (respawn player) actions.
export function bindPauseMenu(onResume, onRestart) {
  const menu = document.querySelector('#pause-menu');
  const resumeButton = document.querySelector('#resume-button');
  const restartButton = document.querySelector('#restart-button');

  function show() { menu.classList.remove('hidden'); }
  function hide() { menu.classList.add('hidden'); }

  resumeButton.addEventListener('click', () => {
    if (typeof onResume === 'function') onResume();
  });
  restartButton.addEventListener('click', () => {
    if (typeof onRestart === 'function') onRestart();
  });

  return { show, hide };
}
