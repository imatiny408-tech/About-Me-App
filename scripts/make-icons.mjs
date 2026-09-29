// Renders the Home Screen icons (icons/icon-*.png) from icons/icon.svg:
// a folder of pages with a person, an orbit and a spark. Full-bleed, since iOS rounds the corners.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const svg = readFileSync(join(root, 'icons', 'icon.svg'), 'utf8');
const preview = process.argv.includes('--preview');
const browser = await chromium.launch();
for (const size of [180, 192, 512, 1024]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body>`);
  await page.screenshot({ path: join(root, 'icons', `icon-${size}.png`) });
  await page.close();
}
if (preview) {   // how it looks masked on an iPad Home Screen
  const page = await browser.newPage({ viewport: { width: 760, height: 380 } });
  const tile = s => `<div style="display:grid;justify-items:center;gap:10px;font:500 15px -apple-system,Helvetica,Arial;color:#fff">
    <div style="width:${s}px;height:${s}px;border-radius:${s * .225}px;overflow:hidden;box-shadow:0 10px 30px -10px rgba(0,0,0,.5)">${svg.replace('<svg ', `<svg width="${s}" height="${s}" `)}</div>About Me</div>`;
  await page.setContent(`<body style="margin:0;height:380px;display:flex;align-items:center;justify-content:center;gap:56px;background:linear-gradient(135deg,#C9D3F5,#8E9BD6 60%,#6C74B8)">${tile(240)}${tile(120)}${tile(64)}</body>`);
  await page.screenshot({ path: join(root, 'screens', 'icon-preview.png') });
}
await browser.close();
console.log('Icons written to icons/');
