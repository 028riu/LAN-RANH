// Main menu — the start screen. Wires up the PLAY button, displays
// the 3D world behind the panel, and informs the game when the user
// wants to start playing.
export function bindMainMenu(onPlay) {
  const menu = document.querySelector('#main-menu');
  const playButton = document.querySelector('#play-button');

  function hide() {
    menu.classList.add('hidden');
  }
  function show() {
    menu.classList.remove('hidden');
  }

  playButton.addEventListener('click', () => {
    if (typeof onPlay === 'function') onPlay();
  });

  return { show, hide };
}
