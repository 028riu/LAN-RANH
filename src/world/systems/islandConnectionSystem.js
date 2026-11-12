// IslandConnectionSystem — sea travel between islands.
//
// Each island layout registers a travel point beside its moored boat.
// When the player stands inside a point's radius, a prompt appears
// ("Press E to sail"). Pressing E opens a small destination menu; choosing
// one fades the screen and teleports the player to that island's dock.
export function createIslandConnection(world, hud, callbacks = {}) {
  let activePoint = null;
  let menuOpen = false;
  let fading = false;

  const prompt = document.querySelector('#travel-prompt');
  const promptLabel = document.querySelector('#travel-prompt-label');
  const menu = document.querySelector('#travel-menu');
  const menuList = document.querySelector('#travel-menu-list');
  const menuTitle = document.querySelector('#travel-menu-title');
  const fade = document.querySelector('#fade-overlay');

  function showPrompt(text) {
    if (!prompt) return;
    promptLabel.textContent = text;
    prompt.classList.remove('hidden');
  }

  function hidePrompt() {
    if (prompt) prompt.classList.add('hidden');
  }

  function openMenu(fromPoint) {
    menuOpen = true;
    hidePrompt();
    menuTitle.textContent = fromPoint.label || 'Where to, captain?';
    menuList.innerHTML = '';
    for (const island of world.islands.islands) {
      if (island.def.id === fromPoint.islandId) continue;
      const btn = document.createElement('button');
      btn.className = 'travel-option';
      btn.textContent = island.def.name;
      btn.addEventListener('click', () => {
        travelTo(island.def.id);
      });
      menuList.appendChild(btn);
    }
    menu.classList.remove('hidden');
    if (callbacks.onMenuOpen) callbacks.onMenuOpen();
  }

  function closeMenu() {
    if (!menuOpen) return;
    menuOpen = false;
    if (menu) menu.classList.add('hidden');
    if (callbacks.onMenuClose) callbacks.onMenuClose();
  }

  function travelTo(islandId) {
    if (fading) return;
    const island = world.islands.islandById(islandId);
    if (!island) return;
    fading = true;
    closeMenu();

    fade.classList.remove('hidden');
    fade.classList.add('visible');

    setTimeout(() => {
      // def.spawn is LOCAL to the island — convert to world coordinates.
      const spawn = island.def.spawn;
      const wx = island.def.cx + spawn.x;
      const wz = island.def.cz + spawn.z;
      const y = world.groundAt(wx, wz) + 0.1;
      world.onTravelArrive && world.onTravelArrive(wx, y, wz, spawn.yaw || 0);
      hud.showToast(`Arrived at ${island.def.name}`, 2800);

      setTimeout(() => {
        fade.classList.remove('visible');
        setTimeout(() => fade.classList.add('hidden'), 420);
        fading = false;
      }, 140);
    }, 480);
  }

  // E-key handling (wired by main.js via handleInteractKey)
  function handleInteractKey() {
    if (menuOpen) {
      closeMenu();
      return;
    }
    if (activePoint) openMenu(activePoint);
  }

  // Per-frame proximity scan.
  function update(playerPos) {
    if (fading) return;

    if (menuOpen) return;

    let nearest = null;
    let nearestD = Infinity;
    for (const pt of world.islands.allTravelPoints()) {
      const d = Math.hypot(playerPos.x - pt.x, playerPos.z - pt.z);
      if (d < pt.r && d < nearestD) {
        nearest = pt;
        nearestD = d;
      }
    }

    if (nearest !== activePoint) {
      activePoint = nearest;
      if (nearest) {
        showPrompt('Press [E]  —  ' + (nearest.label || 'Set sail'));
      } else {
        hidePrompt();
      }
    }
  }

  return {
    update,
    handleInteractKey,
    get menuOpen() { return menuOpen; },
    closeMenu
  };
}
