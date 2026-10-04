// Uses the app the way a person would, in a real browser, and checks that everything works:
// writing, versions, Trash, hiding sections, layouts, Right Now, decisions, history, search,
// settings, backups, annotate and the offline Home Screen app. `npm test` runs it after the fit check.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appUrl = pathToFileURL(join(root, 'index.html')).href;
const IPAD = { width: 1194, height: 834 };          // 11" iPad, landscape
const PORTRAIT = { width: 834, height: 1194 };
const FIT_SIZES = [[1200, 1600], [1600, 1200], [834, 1194], [1194, 834], [744, 1133], [1133, 744], [1376, 1032], [1000, 744]];

/* ── A tiny test runner ── */
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
function assert(ok, msg) { if (!ok) throw new Error(msg); }
function eq(actual, expected, msg) { if (actual !== expected) throw new Error(`${msg}\n    expected: ${JSON.stringify(expected)}\n    actual:   ${JSON.stringify(actual)}`); }
function has(haystack, needle, msg) { if (!String(haystack).includes(needle)) throw new Error(`${msg}\n    expected to contain: ${JSON.stringify(needle)}\n    actual: ${JSON.stringify(haystack)}`); }

/* ── Helpers ── */
const clean = s => s.trim().replace(/\s+/g, ' ');
const text = (page, sel) => page.$eval(sel, el => el.textContent).then(clean);
const texts = (page, sel) => page.$$eval(sel, els => els.map(el => el.textContent)).then(a => a.map(clean));
const count = (page, sel) => page.$$eval(sel, els => els.length);
const stored = (page, key) => page.evaluate(k => JSON.parse(localStorage.getItem(k)), key);
const waitText = (page, sel, want) => page.waitForFunction(([s, w]) => [...document.querySelectorAll(s)].some(el => el.textContent.includes(w)), [sel, want], { timeout: 5000 });
async function go(page, hash) {   // navigate like a link would, and wait for the page to draw
  await page.evaluate(h => new Promise(done => {
    if (location.hash === '#' + h) { render(); return done(); }
    addEventListener('hashchange', () => setTimeout(done), { once: true });
    location.hash = h;
  }), hash);
}
async function overflow(page) {   // how far the one-screen pages spill (0 means they fit)
  return page.evaluate(() => {
    const home = document.querySelector('.home'), ctx = document.querySelector('.context');
    return Math.max(document.documentElement.scrollHeight - innerHeight, home ? home.scrollHeight - home.clientHeight : 0, ctx.scrollHeight - ctx.clientHeight);
  });
}
async function write(page, hash, entry, why) {
  await go(page, hash);
  await page.fill('#composeText', entry);
  if (why) await page.fill('#composeWhy', why);
  await page.click('#composeAdd');
  await waitText(page, '#entryStatus', 'Saved.');
}

/* ── The tests ── */
test('every page draws, at iPad sizes, with working links and no errors', async ({ open }) => {
  for (const viewport of [IPAD, PORTRAIT]) {
    const page = await open('home', { viewport });
    const routes = await page.evaluate(() => ['home', 'now', ...chapters.flatMap(c => [c.id, ...c.parts.map(p => `${c.id}/${slug(p[0])}`)])]);
    for (const r of routes) {
      await go(page, r);
      assert(await count(page, '#main h1') === 1, `#${r} has no title`);
    }
    // In every layout, every link goes somewhere real (List used to link to "undefined")
    for (const layout of ['list', 'cards', 'grid', 'tiles']) {
      await page.evaluate(l => chapters.forEach(c => setLayout(c.id, l)), layout);
      for (const c of await page.evaluate(() => chapters.map(c => c.id))) {
        await go(page, c);
        const bad = await page.$$eval('a[href]', as => as.map(a => a.getAttribute('href')).filter(h => !/^#[a-z]+(\/[a-z0-9-]+)?$|^https?:/.test(h)));
        eq(bad.length, 0, `#${c} in ${layout} has broken links ${bad.join(', ')}`);
      }
    }
    await page.close();
  }
});

test('a section in the List layout opens its page', async ({ open }) => {
  const page = await open('mind');
  await page.click('#layoutBtn');
  await page.click('[data-layout="list"]');
  await page.click('.note[data-part="Ideas"]');
  await waitText(page, '#main h1', 'Ideas.');
  eq(await page.evaluate(() => location.hash), '#mind/ideas', 'List row went to the wrong place');
});

test('a new entry keeps the old one, and every screen updates', async ({ open }) => {
  const page = await open('myself/values');
  eq(await text(page, '.latest-card .big'), 'Honesty over comfort, almost always.', 'example entry missing');
  assert(await page.$eval('#composeWhy', el => el.hidden), 'the why field shows before you write');
  await page.fill('#composeText', 'Kindness first, then honesty.');
  assert(!(await page.$eval('#composeWhy', el => el.hidden)), 'the why field should appear once you write');
  await page.fill('#composeWhy', 'I learned that honesty without care can hurt.');
  await page.click('#composeAdd');
  await waitText(page, '#entryStatus', 'Saved.');
  eq(await text(page, '.latest-card .big'), 'Kindness first, then honesty.', 'latest entry');
  has(await text(page, '.latest-card .why-q'), 'honesty without care', 'why under the latest');
  has((await texts(page, '.earlier li p')).join(' | '), 'Honesty over comfort, almost always.', 'old version kept');
  has(await text(page, '.entry-page .meta'), '2 entries', 'entry count on the section');

  await go(page, 'myself');
  has(await text(page, '.statement .sub'), '5 entries', 'chapter count');
  eq(await text(page, '#drawerNav a[href="#myself"] .count'), '5', 'drawer count');

  await go(page, 'home');
  eq(await text(page, '.latest .row .topic'), 'Values', 'home What changed shows the newest change first');
  eq(await text(page, '.latest .row .new'), 'Kindness first, then honesty.', 'home What changed latest');
  eq(await text(page, '#context .change .is'), 'Kindness first, then honesty.', 'side panel change');
  has(await text(page, '#context .change .why'), 'honesty without care', 'side panel why');

  await go(page, 'history/what-changed');
  eq(await text(page, '.change-card .is'), 'Kindness first, then honesty.', 'What Changed page');
  await go(page, 'history');
  has(await text(page, '#histFocus .hf-said'), 'Kindness first', 'the timeline opens on the newest moment');

  await page.reload(); await page.waitForSelector('#main h1');
  await go(page, 'myself/values');
  eq(await text(page, '.latest-card .big'), 'Kindness first, then honesty.', 'saved across a reload');
});

test('deleting goes to Trash for 7 days: undo, restore, then gone for good', async ({ open }) => {
  const page = await open('life/career');
  await page.click('.latest-card [data-del]');
  eq(await text(page, '.latest-card .big'), 'Web design.', 'the version before becomes the latest');
  await page.click('#entryStatus [data-undo]');
  eq(await text(page, '.latest-card .big'), 'Web and app development.', 'undo brings it back');

  await page.click('.latest-card [data-del]');
  await go(page, 'home');
  eq(await text(page, '#trashCount'), '1', 'trash badge');
  await page.click('#trashBtn');
  has(await text(page, '#trashSheet .trash-item'), 'My Life › Career', 'where it came from');
  has(await text(page, '#trashSheet .trash-item'), '7 days left', 'time left');
  await page.click('#trashSheet [data-restore]');
  has(await text(page, '#trashSheet .as-list'), 'Trash is empty.', 'restored');
  await go(page, 'life/career');
  eq(await text(page, '.latest-card .big'), 'Web and app development.', 'restored entry is the latest again');

  // After 7 days your own entry is erased from the device, not just hidden
  await write(page, 'life/money', 'Saving ten percent of everything.');
  await page.click('.latest-card [data-del]');
  await page.evaluate(() => {
    const t = JSON.parse(localStorage.getItem('about-me-trash'));
    t.forEach(x => { x.deletedAt -= 8 * 86400000; });
    localStorage.setItem('about-me-trash', JSON.stringify(t));
  });
  await page.reload(); await page.waitForSelector('#main h1');
  eq((await stored(page, 'about-me-trash')).length, 0, 'trash emptied after 7 days');
  assert(!JSON.stringify(await stored(page, 'about-me-entries')).includes('ten percent'), 'the entry should be erased from storage');
  eq(await count(page, '.latest-card'), 0, 'nothing left in Money');
});

test('a failed save says so and keeps your words', async ({ open }) => {
  const page = await open('taste/music');
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('full', 'QuotaExceededError'); }; });
  await page.fill('#composeText', 'Anything with a good bassline.');
  await page.click('#composeAdd');
  has(await text(page, '#entryStatus'), 'Couldn’t save', 'failure message');
  eq(await page.inputValue('#composeText'), 'Anything with a good bassline.', 'text stays in the box');
  eq(await count(page, '.latest-card'), 0, 'nothing pretends to be saved');
});

test('sections hide and show again, and nothing is lost', async ({ open }) => {
  const page = await open('life/health');
  await page.click('[data-hide]');
  await waitText(page, '#main h1', 'My Life.');
  has(await text(page, '.statement .sub'), '1 hidden', 'hidden count');
  assert(!(await texts(page, '.tile .tn')).includes('Health'), 'Health tile should be gone');
  await go(page, 'life/home');
  eq(await text(page, '.sec-nav a.next b'), 'Relationships', 'Next skips the hidden section');

  await go(page, 'life/health');
  await page.click('[data-show]');
  await go(page, 'life');
  assert((await texts(page, '.tile .tn')).includes('Health'), 'Show this section brings it back');

  await go(page, 'people');
  await page.click('#moreBtn');
  for (const name of await page.$$eval('#sectionsSheet [data-sec]', els => els.map(e => e.dataset.sec))) {
    await page.click(`#sectionsSheet label:has([data-sec="${name}"]) i`);
  }
  await page.click('#sectionsSheet [data-close]');
  has(await text(page, '.all-hidden'), 'All sections here are hidden', 'all hidden message');
  await page.click('[data-open-sections]');
  assert(await page.isVisible('#sectionsSheet'), 'Show sections opens the list');

  await go(page, 'history');
  assert(await page.isVisible('#moreBtn'), 'My History can hide sections too');
  await page.click('#moreBtn');
  await page.click('#sectionsSheet label:has([data-sec="Memories"]) i');
  await page.click('#sectionsSheet [data-close]');
  assert(!(await texts(page, '.hist-secs .chip')).includes('Memories'), 'hidden part leaves the History page');
});

test('layouts switch and are remembered per section', async ({ open }) => {
  const page = await open('taste');
  assert(await count(page, '.cards') === 1, 'My Taste starts as Cards');
  await page.click('#layoutBtn');
  await page.click('[data-layout="grid"]');
  assert(await count(page, '.gridx.swipe') === 1, 'Grid layout');
  await page.reload(); await page.waitForSelector('#main h1');
  assert(await count(page, '.gridx.swipe') === 1, 'Grid is remembered');
  await go(page, 'mind');
  assert(await count(page, '.tiles6') === 1, 'other sections keep their own layout');
});

test('Right Now: add, update with earlier versions, delete and undo', async ({ open }) => {
  const page = await open('now');
  eq(await count(page, '.now-item'), 4, 'four example sentences');
  await page.click('[data-now-add]');
  eq(await page.getAttribute('#nowSheet [aria-checked="true"]', 'data-pick'), 'reading', 'Add starts on the first empty one');
  await page.fill('#nowText', 'a book about how habits form.');
  await page.click('#nowSave');
  await waitText(page, '.now-page .sub', '5 things');
  has(await text(page, '.now-page .eyebrow'), 'Updated today', 'updated label');

  await page.click('.now-item[data-lead="learning"]');
  has(await text(page, '#nowSheet .nv'), 'Web development, one small project at a time.', 'current sentence shown');
  await page.fill('#nowText', 'Swift, so this can be a real iPad app.');
  await page.click('#nowSave');
  has(await text(page, '.now-item[data-lead="learning"]'), 'Swift, so this can be a real iPad app.', 'updated sentence');
  await page.click('.now-item[data-lead="learning"]');
  has(await text(page, '#nowSheet .nv.old'), 'Web development, one small project at a time.', 'earlier version kept');

  await page.click('#nowSheet .nv:not(.old) [data-del]');
  has(await text(page, '#nowStatus'), 'Moved to Trash', 'delete moves it to Trash');
  has(await text(page, '.now-item[data-lead="learning"]'), 'Web development', 'the earlier one is current again');
  await page.click('#nowStatus [data-undo]');
  has(await text(page, '.now-item[data-lead="learning"]'), 'Swift', 'undo');
  await page.click('#nowSheet [data-close]');

  await page.click('[data-now-add]');
  await page.click('[data-pick="feeling"]');
  await page.fill('#nowText', 'calm, and a little restless about what comes next.');
  await page.click('#nowSave');
  eq(await count(page, '.now-item'), 6, 'all six');
  eq(await text(page, '[data-now-add]'), 'Update right now', 'button label when all six are filled');

  await go(page, 'history/what-changed');
  has((await texts(page, '.change-card')).join(' | '), 'I’m learning', 'Right Now changes count as changes');
});

test('Decisions: thought → decided → did → changed', async ({ open }) => {
  const page = await open('history/decisions');
  eq(await count(page, '.decision .dsteps li.on'), 4, 'the example decision has all four steps');
  await page.fill('[data-step="thought"]', 'My mornings were too scattered.');
  assert(await page.isDisabled('#composeAdd'), 'a decision needs what you decided');
  await page.fill('[data-step="decided"]', 'No phone until after breakfast.');
  await page.click('#composeAdd');
  await waitText(page, '#entryStatus', 'Saved.');
  has(await text(page, '.decision'), 'No phone until after breakfast.', 'new decision first');
  eq(await count(page, '.decision:first-child [data-fill]'), 2, 'did and changed can be added later');
  await page.click('.decision:first-child [data-fill="did"]');
  await page.fill('.ds-form textarea', 'Put the phone in the hallway at night.');
  await page.click('.ds-form .btn-primary');
  has(await text(page, '.decision'), 'Put the phone in the hallway at night.', 'step filled in');
  await page.reload(); await page.waitForSelector('#main h1');
  has(await text(page, '.decision'), 'Put the phone in the hallway at night.', 'kept after reload');
  await go(page, 'history');
  has(await text(page, '#histFocus'), 'No phone until after breakfast.', 'decision is on the timeline');
});

test('My History: timeline, keyboard, parts and empty state', async ({ open }) => {
  const page = await open('history');
  const last = await text(page, '#histFocus .hf-said');
  has(last, 'I changed how I see myself.', 'opens on the newest moment');
  await page.focus('#histRail');
  await page.keyboard.press('ArrowUp');
  await page.waitForFunction(l => !document.querySelector('#histFocus .hf-said').textContent.includes(l), 'I changed how I see myself.');
  has(await text(page, '#histFocus .hf-said'), 'moving', 'ArrowUp goes back in time');
  await page.click('.hist-secs .chip:has-text("Memories")');
  await waitText(page, '#main h1', 'Memories.');
  await page.fill('#composeText', 'The first night in the new city.');
  await page.click('#composeAdd');
  await waitText(page, '.record', 'The first night in the new city.');

  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('about-me-examples', 'false'); });
  await go(page, 'history');
  has(await text(page, '.hist-empty'), 'Every entry you write becomes a moment here', 'empty timeline');
});

test('search finds every version, and opens results', async ({ open }) => {
  const page = await open('home');
  await page.click('#searchBtn');
  await page.fill('#q', 'web design');
  has(await text(page, '#results a'), 'My Life › Career', 'finds an earlier version');
  await page.fill('#q', 'I\'m learning');   // straight apostrophe still finds ’
  has(await text(page, '#results'), 'Right Now', 'apostrophes match');
  await page.fill('#q', 'honesty');
  await page.press('#q', 'Enter');
  await waitText(page, '#main h1', 'Values.');
  assert(!(await page.$eval('#sheet', el => el.classList.contains('open'))), 'sheet closes');
  await page.click('#searchBtn');
  eq(await page.inputValue('#q'), '', 'search starts empty again');
  await page.fill('#q', 'honesty');
  await page.click('#results a');   // the page you're already on
  assert(!(await page.$eval('#sheet', el => el.classList.contains('open'))), 'sheet closes on the same page');
});

test('the drawer opens pages and closes itself', async ({ open }) => {
  const page = await open('home', { viewport: PORTRAIT });
  await page.click('#menuBtn');
  await page.click('#drawerNav a[href="#life"]');
  await waitText(page, '#main h1', 'My Life.');
  assert(!(await page.$eval('#drawer', el => el.classList.contains('open'))), 'drawer closed after navigating');
  await go(page, 'home');
  await page.click('#menuBtn');
  await page.click('#drawerNav a[href="#home"]');
  assert(!(await page.$eval('#drawer', el => el.classList.contains('open'))), 'drawer closes on the page you are on');
});

test('settings: color, your name, example entries', async ({ open }) => {
  const page = await open('home');
  await page.click('#settingsBtn');
  await page.click('.swatch-opt[data-tint="emerald"]');
  eq(await page.getAttribute('html', 'data-tint'), 'emerald', 'color applied');
  await page.fill('#setName', 'Sam');
  await page.fill('#setLine', 'Still figuring it out.');
  eq(await text(page, '#homeSub'), 'Sam · Still figuring it out.', 'home updates as you type');
  await page.reload(); await page.waitForSelector('#main h1');
  eq(await page.getAttribute('html', 'data-tint'), 'emerald', 'color remembered');
  eq(await text(page, '#homeSub'), 'Sam · Still figuring it out.', 'name remembered');

  await write(page, 'life/goals', 'Ship this app.');
  await go(page, 'home');
  await page.click('#settingsBtn');
  await page.click('label:has(#setExamples) i');
  has(await text(page, '#setStatus'), 'hidden', 'status');
  await page.click('#settingsSheet [data-close]');
  has(await text(page, '.latest .rows'), 'Nothing yet', 'home has no changes without examples');
  await go(page, 'life');
  has(await text(page, '.statement .sub'), '1 entry', 'only your own entry counts');
  await go(page, 'now');
  has(await text(page, '.now-empty'), 'Nothing here yet', 'Right Now is empty');
  await page.click('#searchBtn');
  await page.fill('#q', 'honesty');
  has(await text(page, '#results'), 'Nothing in the archive', 'examples are out of search too');
  await page.keyboard.press('Escape');
  await page.click('#settingsBtn');
  await page.click('label:has(#setExamples) i');
  await page.click('#settingsSheet [data-close]');
  eq(await count(page, '.now-item'), 4, 'examples come back');
});

test('backups export and import without replacing anything', async ({ open, context }) => {
  const page = await open('home');
  await write(page, 'people/family', 'Sunday dinners are non-negotiable.');
  await write(page, 'people/family', 'Sunday dinners, and a call midweek.');
  await go(page, 'home');
  await page.click('#settingsBtn');
  const [download] = await Promise.all([page.waitForEvent('download'), page.click('#setExport')]);
  const backup = JSON.parse(readFileSync(await download.path(), 'utf8'));
  eq(backup.app, 'About Me', 'backup format');
  eq(backup.data['about-me-entries']['people/Family'].length, 2, 'both versions exported');
  const file = join(dirname(await download.path()), 'backup.json');
  await download.saveAs(file);

  const fresh = await context.browser().newContext({ viewport: IPAD });
  const other = await fresh.newPage();
  await other.goto(`${appUrl}#home`); await other.waitForSelector('#main h1');
  await other.evaluate(() => localStorage.clear());
  await other.reload(); await other.waitForSelector('#main h1');
  await other.click('#settingsBtn');
  await other.setInputFiles('#setFile', file);
  await waitText(other, '#setStatus', 'Imported 2 entries');
  await other.setInputFiles('#setFile', file);
  await waitText(other, '#setStatus', 'already here');
  await other.setInputFiles('#setFile', { name: 'notes.json', mimeType: 'application/json', buffer: Buffer.from('{"hello": 1}') });
  await waitText(other, '#setStatus', 'isn’t an About Me backup');
  await other.click('#settingsSheet [data-close]');
  await go(other, 'people/family');
  eq(await text(other, '.latest-card .big'), 'Sunday dinners, and a call midweek.', 'imported latest');
  eq(await count(other, '.earlier li'), 1, 'imported earlier version');
  await fresh.close();
});

test('annotate saves a drawing with the right page name', async ({ open }) => {
  const page = await open('life/career');
  await page.click('#annotateBtn');
  await page.mouse.move(300, 300); await page.mouse.down(); await page.mouse.move(420, 360, { steps: 6 }); await page.mouse.up();
  await page.click('#annotDone');
  await page.waitForSelector('#annotSheet:not([hidden])', { timeout: 20000 });
  await page.fill('#asNote', 'Make the title smaller.');
  await page.click('#asSave');
  await waitText(page, '#asStatus', 'Saved');
  await page.waitForSelector('#annot[hidden]', { state: 'attached', timeout: 5000 });
  await page.click('#annotateBtn');
  await page.click('#annotSaved');
  await waitText(page, '#ssList', 'My Life › Career');
  await page.click('#ssList [data-act="delete"]');
  await waitText(page, '#ssList', 'No saved comments yet.');
});

test('long entries never break the one-screen pages', async ({ open }) => {
  const long = 'This is a very long entry that keeps going because some days there is a lot to say about how things are going and what changed and why it matters, and it should never push the page past the bottom of the screen.';
  const page = await open('home');
  await page.evaluate(long => {
    const at = Date.now(), entries = {};
    ['into', 'thinking', 'learning', 'working', 'reading', 'feeling'].forEach((id, i) => { entries[`now/${id}`] = [{ id: 'n' + i, text: long, at: at - i }]; });
    entries['people/Friends'] = [{ id: 'f1', text: long, at, why: long }];
    entries['life/Career'] = [{ id: 'c1', text: long, at: at - 1000, why: long }];
    entries['history/Memories'] = [{ id: 'm1', text: long, at }];
    localStorage.setItem('about-me-entries', JSON.stringify(entries));
  }, long);
  for (const [width, height] of FIT_SIZES) {
    await page.setViewportSize({ width, height });
    for (const r of ['home', 'now', 'history']) {
      await go(page, r);
      eq(await overflow(page), 0, `#${r} spills at ${width}×${height}`);
    }
  }
});

test('the published app opens offline from the Home Screen', async ({ context }) => {
  execFileSync(process.execPath, [join(root, 'scripts', 'build-site.mjs')], { stdio: 'ignore' });
  const dist = join(root, 'dist'), types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
  const server = createServer((req, res) => {   // like GitHub Pages: the site lives under /About-Me-App/
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/About-Me-App/, '');
    let file = join(dist, path);
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file)) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const site = `http://127.0.0.1:${server.address().port}/About-Me-App/`;
  try {
    const page = await context.newPage();
    await page.goto(site + '#life');
    await page.waitForSelector('#main h1');
    await page.waitForFunction(() => navigator.serviceWorker && navigator.serviceWorker.controller, null, { timeout: 15000 });
    has(await text(page, '#appVersion'), 'Version', 'version label from the build');
  } finally { await new Promise(r => server.close(r)); }
  // The server is gone and the device is offline: the app must still open
  await context.setOffline(true);
  const page = await context.newPage();
  await page.goto(site + '#life');
  await page.waitForSelector('#main h1', { timeout: 10000 });
  eq(await text(page, '#main h1'), 'My Life.', 'opens offline');
});

/* ── Run ── */
const only = process.argv[2];
const browser = await chromium.launch();
let failed = 0, ran = 0;
for (const t of tests) {
  if (only && !t.name.includes(only)) continue;
  ran++;
  const context = await browser.newContext({ viewport: IPAD, acceptDownloads: true });
  const errors = [];
  const open = async (hash = 'home', { viewport } = {}) => {
    const page = await context.newPage();
    if (viewport) await page.setViewportSize(viewport);
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${appUrl}#${hash}`);
    await page.waitForSelector('#main h1');
    return page;
  };
  const started = Date.now();
  try {
    await t.fn({ open, context });
    if (errors.length) throw new Error(`errors on the page: ${errors.join('; ')}`);
    console.log(`✓ ${t.name} (${((Date.now() - started) / 1000).toFixed(1)}s)`);
  } catch (e) {
    failed++;
    console.log(`✗ ${t.name}\n    ${e.message.split('\n').join('\n    ')}`);
  } finally { await context.close(); }
}
await browser.close();
console.log(failed ? `\n${failed} of ${ran} failed` : `\nAll ${ran} passed`);
process.exit(failed ? 1 : 0);
