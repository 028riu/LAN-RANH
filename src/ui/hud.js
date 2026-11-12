// In-game HUD: shows the current zone / island name based on the player's
// position across the whole archipelago. Also manages the toast
// notification and pointer-prompt overlay.
function distance2D(x1, z1, x2, z2) {
  return Math.hypot(x1 - x2, z1 - z2);
}

export function bindHud(app, player, world) {
  const zoneLabel = document.querySelector('#hud-zone-name');
  const toast = document.querySelector('#toast');
  const hud = document.querySelector('#hud');
  const prompt = document.querySelector('#pointer-prompt');

  const zones = world.islands.allZones();
  let currentZoneKey = null;

  function showToast(message, duration = 3000) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  function showHud() { hud.classList.remove('hidden'); }
  function hideHud() { hud.classList.add('hidden'); }
  function showPrompt() { prompt.classList.remove('hidden'); }
  function hidePrompt() { prompt.classList.add('hidden'); }

  app.on('update', () => {
    if (!player.entity) return;
    const pos = player.entity.getLocalPosition();
    let nearest = null;
    let nearestDist = Infinity;
    for (const zone of zones) {
      const d = distance2D(pos.x, pos.z, zone.x, zone.z);
      if (d < zone.radius && d < nearestDist) {
        nearest = zone;
        nearestDist = d;
      }
    }
    const key = nearest ? `z:${nearest.islandId}:${nearest.id}` : `i:${world.islands.defaultZoneName(pos.x, pos.z)}`;
    if (key !== currentZoneKey) {
      currentZoneKey = key;
      const name = nearest ? nearest.name : world.islands.defaultZoneName(pos.x, pos.z);
      if (zoneLabel) zoneLabel.textContent = name;
      if (nearest) showToast(nearest.name, 2400);
    }
  });

  return { showHud, hideHud, showPrompt, hidePrompt, showToast };
}
