export function bindHud(app, player) {
  const level = document.querySelector('#level');
  app.on('update', () => {
    if (level && player.entity) level.textContent = '1';
  });
}
