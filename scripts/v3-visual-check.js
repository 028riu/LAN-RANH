// V3 landmark visual check — teleports the player to key locations and
// captures screenshots of the new/dressed areas for manual review.
import { createRequire } from 'module';
const require = createRequire('/home/z/.npm-global/lib/node_modules/');
const { chromium } = require('playwright');

const BASE = (process.argv[2] || 'http://localhost:5173') + '?fx=low';
const OUT = process.argv[3] || '/tmp/render/v3';

import { mkdirSync } from 'fs';
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ['--enable-unsafe-swiftshader', '--no-sandbox']
});
const page = await browser.newPage({ viewport: { width: 1024, height: 576 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(BASE, { waitUntil: 'load', timeout: 60000 });
await page.waitForTimeout(7000);
await page.click('#play-button');
await page.waitForTimeout(1500);

async function shot(name, x, z, camYawDeg, pitch = 0.3, island = null, heightOff = null) {
  await page.evaluate(([x, z, camYawDeg, pitch, island, heightOff]) => {
    const FZ = window.__FZ;
    const def = FZ.world.islands.islands.map(i => i.def).find(d => !island || d.id === island);
    const gx = def.cx + x, gz = def.cz + z;
    const gy = FZ.world.groundAt(gx, gz) + (heightOff !== null && heightOff !== undefined ? heightOff : 0.1);
    FZ.player.teleport(gx, gy, gz, camYawDeg);
    FZ.setCamYaw(camYawDeg * Math.PI / 180); FZ.setCamPitch(pitch);
  }, [x, z, camYawDeg, pitch, island, heightOff]);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('shot', name);
}

// camYawDeg = direction the CAMERA looks (0 = -Z, 90 = -X... note: PC yaw
// semantics — offset is (sin yaw, cos yaw), so yaw 180 looks toward +Z).
// Pirate Starter Island landmarks (local coords)
await shot('01-harbour', -2, 116, 180, 0.35, 'pirate_starter');
await shot('02-village-square', 0, 34, 180, 0.34, 'pirate_starter');
await shot('03-market-lane', -44, 31, 90, 0.3, 'pirate_starter');
await shot('04-captain-house', 40, 30, -146, 0.28, 'pirate_starter');
await shot('05-lookout-deck', 72, -8, -141, 0.25, 'pirate_starter');
await shot('06-south-beach', -6, -112, -6, 0.3, 'pirate_starter');
await shot('07-cove', -100, -74, 64, 0.28, 'pirate_starter');
await shot('08-shore-foam', -4, 136, 180, 0.12, 'pirate_starter', 1.2);

// Other islands: one hero shot each
await shot('09-jungle', 14, 82, 8, 0.32, 'jungle_isle');
await shot('10-desert', 0, 80, 180, 0.35, 'desert_isle');
await shot('11-snow', 0, 90, 180, 0.35, 'snow_isle');
await shot('12-volcanic', 0, 100, 180, 0.35, 'volcanic_isle');

console.log('page errors:', errors.length ? errors : 'none');
await browser.close();
