# About Me

An iPad app that answers one question: **Who am I?**

About Me is a personal archive. You record who you are, what you care about, how your life is changing, and how your thoughts evolve. Old versions are never deleted, so over time the app shows how you changed. It's meant to read like a personal book, not a productivity dashboard.

## What's here

| Path | What it is |
|---|---|
| `index.html` | The whole app: home, Right Now, the nine chapters, every section's page and My History, in portrait and landscape |
| `DESIGN.md` | The spec: size classes, portrait vs. landscape, every page, typography, spacing, navigation, colour |
| `screens/` | Screenshots at every iPad size |
| `store/` | App Store screenshots for the 13" iPad |
| `scripts/check-fit.mjs` | Checks that no one-screen page scrolls at any iPad window size |
| `scripts/test.mjs` | Uses the app in a real browser and checks that every feature works |

## Try it

Open `index.html` in Safari on an iPad and rotate it, or resize a desktop browser window.

- **Portrait** is the book: one column, a centered statement, and chapters as a grid of type.
- **Landscape** is the archive: the page, plus a "What changed" panel on the right.
- **No page scrolls** on anything iPad-sized, from iPad mini to 13" iPad Pro, including split view.

## What it does

- **Write** in any section. A new entry never overwrites the last one: it becomes the latest, the old one moves to Earlier versions, and you can say why it changed.
- **What changed** on home, the side panel and My History › What Changed is worked out from those versions, so it always reflects what you've actually written.
- **Right Now**: tap a sentence to update it, or add what you're into, thinking about, learning, working toward, reading or feeling. Earlier versions are kept.
- **My History** is a timeline of everything you write, plus Decisions (thought → decided → did → changed), What Changed, Old Thoughts, Memories and Past Versions of Me.
- **Search** covers every version of everything, not just the latest.
- **Trash** keeps deleted entries for 7 days, then erases them from the device.
- **Settings**: the colour, your name, the example entries the app comes with, and backups.

## Install it on your iPad

The app is published with GitHub Pages at **https://imatiny408-tech.github.io/About-Me-App/**. Every push to `main` republishes it, but only after every check below passes.

1. Open that address in Safari on the iPad.
2. Tap Share, then **Add to Home Screen**.
3. Open About Me from the Home Screen. It runs full screen, like an app, and opens without a connection too.

The installed app checks for a new version every time you open or switch back to it, and reloads itself when one is published. The version number is at the bottom of the menu and in Settings.

**Your entries are saved only on that iPad.** Use Settings → Export backup now and then and keep the file in Files or iCloud Drive; Import a backup brings it back on any device, adding what's missing without replacing anything.

`npm run build` makes the Pages version (`dist/`) locally; `scripts/make-icons.mjs` redraws the Home Screen icon.

## Checking that everything works

```sh
npm install
npm test          # the one-screen check, then every feature in a real browser
npm run check     # just the one-screen check
npm run screens   # the one-screen check, and refreshes screens/
npm run store     # refreshes the App Store screenshots in store/
```

`node scripts/test.mjs Right` runs only the tests whose names contain "Right". GitHub runs `npm test` on every push.

## Structure

Home · Right Now · Myself · My Life · My Taste · My People · My Mind · My Appearance · My Routines · My Little Things · My History (timeline, Decisions, What Changed, Old Thoughts, Memories, Past Versions of Me).
