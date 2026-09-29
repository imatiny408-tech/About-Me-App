// Checks the one-screen rule: no page may scroll at any iPad window size.
// `npm run check` reports overflow; `npm run screens` also refreshes screens/.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const url = pathToFileURL(join(root, 'index.html')).href;
const saveScreens = process.argv.includes('--screens');

const sizes = [
  ['portrait-1200x1600', 1200, 1600],
  ['landscape-1600x1200', 1600, 1200],
  ['portrait-ipad11-834x1194', 834, 1194],
  ['landscape-ipad11-1194x834', 1194, 834],
  ['portrait-ipadmini-744x1133', 744, 1133],
  ['landscape-ipadmini-1133x744', 1133, 744],
  ['landscape-ipad13-1376x1032', 1376, 1032],
  ['landscape-split-1000x744', 1000, 744],
];
const routes = ['home', 'now', 'myself', 'life', 'taste', 'people', 'mind', 'appearance', 'routines', 'little', 'history'];

const browser = await chromium.launch();
const failures = [];
for (const [name, width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(url);
  await page.waitForTimeout(600);
  for (const route of routes) {
    await page.evaluate(r => { location.hash = r; }, route);
    await page.waitForTimeout(150);
    const o = await page.evaluate(() => {
      const home = document.querySelector('.home');
      const ctx = document.querySelector('.context');
      return {
        page: document.documentElement.scrollHeight - innerHeight,
        content: home.scrollHeight - home.clientHeight,
        panel: ctx.scrollHeight - ctx.clientHeight,
      };
    });
    if (o.page > 0 || o.content > 0 || o.panel > 0) failures.push(`${name} #${route} overflows ${JSON.stringify(o)}`);
    if (saveScreens && (route === 'home' || route === 'taste')) {
      await page.screenshot({ path: join(root, 'screens', `${route === 'home' ? '' : 'chapter-'}${name}.png`) });
    }
  }
  await page.close();
}
await browser.close();

if (failures.length) { console.error(failures.join('\n')); process.exit(1); }
console.log(`All ${routes.length} pages fit at ${sizes.length} window sizes.`);
