// Builds dist/ for GitHub Pages: wraps index.html in a full document with the
// Home Screen (web app) tags, and copies the manifest and icons alongside it.
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const page = readFileSync(join(root, 'index.html'), 'utf8');
// Each deploy gets a version; the installed app checks it whenever it's opened.
const version = (process.env.GITHUB_SHA || Date.now().toString(36)).slice(0, 12);
writeFileSync(join(dist, 'version.json'), JSON.stringify({ version }) + '\n');

// A Home Screen web app resumes instead of reloading, and Pages lets the iPad
// cache the page for 10 minutes. So on open, compare with the live version and
// reload from a fresh URL when a newer one is published.
const updater = `<script>
(() => {
  const current = ${JSON.stringify(version)};
  const label = document.getElementById("appVersion");
  if (label) { label.textContent = "Version " + current.slice(0, 7); label.hidden = false; }
  let busy = false;
  async function check() {
    if (busy || !navigator.onLine) return;
    busy = true;
    try {
      const res = await fetch("version.json?t=" + Date.now(), { cache: "no-store" });
      const { version } = await res.json();
      let tried = null;
      try { tried = sessionStorage.getItem("about-me-reload"); } catch (e) {}
      if (version && version !== current && tried !== version) {
        try { sessionStorage.setItem("about-me-reload", version); } catch (e) {}
        location.replace(location.pathname + "?v=" + version + location.hash);
      }
    } catch (e) {
    } finally { busy = false; }
  }
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") check(); });
  addEventListener("pageshow", check);
  addEventListener("focus", check);
})();
</script>`;
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="About Me">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: dark)">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" type="image/png" href="icons/icon-192.png">
<style>:root { padding-top: env(safe-area-inset-top, 0px); padding-bottom: env(safe-area-inset-bottom, 0px); }</style>
</head>
<body>
${page}
${updater}
</body>
</html>
`;
writeFileSync(join(dist, 'index.html'), html);
cpSync(join(root, 'manifest.webmanifest'), join(dist, 'manifest.webmanifest'));
cpSync(join(root, 'icons'), join(dist, 'icons'), { recursive: true });
console.log(`Built dist/ (version ${version})`);
