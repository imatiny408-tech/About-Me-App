// App Store screenshots for iPad 13" (2064 × 2752): a headline over the real app in an iPad frame.
// `node scripts/make-store-shots.mjs` writes store/01-….png and so on.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const app = pathToFileURL(join(root, 'index.html')).href;
const icon = 'data:image/svg+xml;base64,' + readFileSync(join(root, 'icons', 'icon.svg')).toString('base64');
const W = 1032, H = 1376;          // iPad Pro 13" in points; rendered at 2x

const shots = [
  { file: '01-home', route: 'home', tint: 'graphite', eyebrow: true,
    title: 'A living record<br>of <em>who you are.</em>', sub: 'Everything about you, in one calm place.', bg: ['#EEF2F8', '#DCE4F1'] },
  { file: '02-sections', route: 'life', tint: 'blue',
    title: 'Every part of you,<br><em>beautifully organized.</em>', sub: 'Nine chapters, from Myself to My Little Things.', bg: ['#EAF1FD', '#D3E2FA'] },
  { file: '03-changes', route: 'life/career', tint: 'violet',
    title: 'See how you’ve<br><em>changed over time.</em>', sub: 'New entries never erase the old ones.', bg: ['#F1EDFD', '#E0D8FA'] },
  { file: '04-history', route: 'history', tint: 'ocean',
    title: 'Your story,<br><em>moment by moment.</em>', sub: 'Scroll back through the choices that shaped you.', bg: ['#E8F5FB', '#D0EAF5'] },
  { file: '05-mind', route: 'mind', tint: 'emerald', layout: ['mind', 'list'],
    title: 'Thoughts, feelings, ideas.<br><em>All in one place.</em>', sub: 'Write it down before it changes.', bg: ['#E9F7F2', '#D2EEE4'] },
  { file: '06-colors', route: 'people', tint: 'rose', settings: true,
    title: 'Make it <em>yours.</em>', sub: 'Seven colors. One quiet design. Private by default.', bg: ['#FCEEF3', '#F7DAE5'] },
];
const grad = { graphite: ['#0B0B0F', '#6B7080'], blue: ['#1638C9', '#5E8FF0'], violet: ['#4B22C9', '#9B7BF3'], ocean: ['#05608A', '#3DB3E0'],
  emerald: ['#0A6B55', '#2FBF93'], rose: ['#B01E5B', '#E86A9A'] };

const browser = await chromium.launch();
for (const s of shots) {
  // 1. the real app, at iPad size
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await page.clock.setFixedTime(new Date('2026-09-29T15:20:00'));
  await page.addInitScript(({ tint, layout }) => {
    localStorage.clear();
    if (layout) localStorage.setItem('about-me-layout-v2:' + layout[0], layout[1]);
    localStorage.setItem('about-me-tint', JSON.stringify(tint));
    const now = Date.now() - 5 * 60e3;
    localStorage.setItem('about-me-entries', JSON.stringify({
      'life/Career': [{ id: 'a1', text: 'Building apps full time, starting with this one.', at: now - 3600e3 }],
      'people/Family': [{ id: 'b1', text: 'Sunday dinners are non-negotiable.', at: now - 26 * 3600e3 }],
      'mind/Thoughts': [{ id: 'c1', text: 'I do my best thinking on long walks.', at: now - 2 * 3600e3 }],
      'mind/Feelings': [{ id: 'c2', text: 'Calmer than I’ve been in a long time.', at: now - 4 * 3600e3 }],
      'mind/Questions': [{ id: 'c3', text: 'What would I build if no one was watching?', at: now - 25 * 3600e3 }],
    }));
  }, { tint: s.tint, layout: s.layout });
  await page.goto(`${app}#${s.route}`);
  await page.addStyleTag({ content: '#app { padding-top: 30px; } .topbar { top: 30px; }' });
  await page.waitForTimeout(900);
  if (s.settings) { await page.click('#settingsBtn'); await page.waitForTimeout(400); }
  const screen = 'data:image/png;base64,' + (await page.screenshot()).toString('base64');
  await page.close();

  // 2. the marketing canvas
  const [g1, g2] = grad[s.tint];
  const canvas = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await canvas.setContent(`<!doctype html><html><head><style>
    * { box-sizing: border-box; margin: 0; }
    body { width: ${W}px; height: ${H}px; overflow: hidden; font-family: -apple-system, "SF Pro Display", "Inter Tight", "Helvetica Neue", Helvetica, Arial, sans-serif;
      background: radial-gradient(120% 70% at 50% 0%, #FFFFFF 0%, ${s.bg[0]} 45%, ${s.bg[1]} 100%); color: #0B0B0F; }
    .copy { position: absolute; top: 96px; left: 0; right: 0; text-align: center; display: grid; justify-items: center; gap: 22px; }
    .brand { display: flex; align-items: center; gap: 14px; font: 600 26px/1 inherit; letter-spacing: -.01em; }
    .brand img { width: 56px; height: 56px; border-radius: 13px; box-shadow: 0 6px 16px -6px rgba(20,40,90,.45); }
    h1 { font: 800 88px/1.02 inherit; letter-spacing: -.045em; }
    h1 em { font-style: normal; background: linear-gradient(115deg, ${g1}, ${g2}); -webkit-background-clip: text; background-clip: text; color: transparent; }
    p { font: 500 31px/1.35 inherit; color: #5B6070; letter-spacing: -.01em; }
    .ipad { position: absolute; left: 50%; top: ${s.eyebrow ? 440 : 340}px; transform: translateX(-50%); width: 860px; padding: 20px; border-radius: 64px;
      background: linear-gradient(145deg, #2B2D33, #0E0F12); box-shadow: 0 0 0 2px #45474F inset, 0 60px 120px -40px rgba(20, 30, 60, .55), 0 20px 40px -20px rgba(20,30,60,.35); }
    .ipad .screen { position: relative; border-radius: 44px; overflow: hidden; background: #fff; }
    .ipad img.s { display: block; width: 100%; }
    .status { position: absolute; top: 2px; left: 0; right: 0; height: 30px; display: flex; justify-content: space-between; align-items: center; padding: 0 28px; font: 600 15px/1 inherit; color: #0B0B0F; z-index: 2; }
    .status .r { display: flex; gap: 8px; align-items: center; }
    .bat { width: 26px; height: 13px; border-radius: 4px; border: 1.5px solid #0B0B0F; padding: 1.5px; } .bat i { display: block; height: 100%; width: 80%; background: #0B0B0F; border-radius: 1.5px; }
    .cam { position: absolute; top: 8px; left: 50%; width: 8px; height: 8px; margin-left: -4px; border-radius: 50%; background: #1C1D22; box-shadow: 0 0 0 1.5px #2C2E35; }
  </style></head><body>
    <div class="copy">
      ${s.eyebrow ? `<div class="brand"><img src="${icon}" alt="">About Me</div>` : ''}
      <h1>${s.title}</h1>
      <p>${s.sub}</p>
    </div>
    <div class="ipad"><span class="cam"></span><div class="screen">
      <div class="status"><span>9:41</span><span class="r">
        <svg width="18" height="13" viewBox="0 0 18 13"><path d="M9 12.5 1 4.2a11.5 11.5 0 0 1 16 0z" fill="#0B0B0F"/></svg>
        100% <span class="bat"><i></i></span></span></div>
      <img class="s" src="${screen}" alt=""></div></div>
  </body></html>`);
  await canvas.waitForTimeout(300);
  await canvas.screenshot({ path: join(root, 'store', `${s.file}.png`) });
  await canvas.close();
}
await browser.close();
console.log(`${shots.length} App Store screenshots (2064 × 2752) written to store/`);
