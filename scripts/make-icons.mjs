// Renders the Home Screen icons (icons/icon-*.png): "Me." on white with the gold hairline.
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch();
for (const size of [180, 192, 512]) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<body style="margin:0;width:${size}px;height:${size}px;background:#fff;display:grid;place-content:center;justify-items:center;gap:${size * .05}px">
    <div style="font:800 ${size * .4}px/.9 'Helvetica Neue',Helvetica,Arial,sans-serif;letter-spacing:-.05em;color:#0B0B0C">Me.</div>
    <div style="width:${size * .22}px;height:${Math.max(2, size * .012)}px;background:#B3A06B"></div></body>`);
  await page.screenshot({ path: join(root, 'icons', `icon-${size}.png`) });
  await page.close();
}
await browser.close();
console.log('Icons written to icons/');
