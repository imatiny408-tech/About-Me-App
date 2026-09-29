# About Me

An iPad app that answers one question: **Who am I?**

About Me is a personal archive. You record who you are, what you care about, how your life is changing, and how your thoughts evolve. Old versions are never deleted, so over time the app shows how you changed. It's meant to read like a personal book, not a productivity dashboard.

## What's here

| Path | What it is |
|---|---|
| `index.html` | Working prototype of the iPad layout: home plus the six chapter pages, in portrait and landscape |
| `DESIGN.md` | The layout spec: size classes, portrait vs. landscape, typography, spacing, navigation, colour |
| `screens/` | Screenshots at every iPad size |
| `scripts/check-fit.mjs` | Checks that no page scrolls at any iPad window size |

## Try it

Open `index.html` in Safari on an iPad and rotate it, or resize a desktop browser window.

- **Portrait** is the book: one column, a centered statement, and chapters as a grid of type.
- **Landscape** is the archive: the page, plus a "What changed" panel on the right.
- **No page scrolls** on anything iPad-sized, from iPad mini to 13" iPad Pro, including split view.

## Checking the one-screen rule

```sh
npm install
npm run check     # fails if any page overflows at any iPad size
npm run screens   # same check, and refreshes screens/
```

## Structure

Home · Right Now · Myself · My Life · My Taste · My People · My Mind · My Appearance · My Routines · My Little Things · My History, plus Decision History, What Changed and Timeline (next up).
