# About Me: Home Screen Spec (v1)

The prototype is `index.html`. Open it in Safari on the iPad and rotate the device, or resize a desktop browser window. Screenshots are in `screens/`.

Metaphor: **a personal book with an archive.** It has chapters instead of cards and sentences instead of fields. Old versions stay on the record.

Visual direction (v2): **one bold statement on white.** Pure white page, heavy black grotesk, centered, and mostly empty space, like an Apple product page (the "Create More." reference). The home screen leads with the statement **About Me.**

**Rule: on iPad the home screen never scrolls.** It is one composed screen in every orientation and window size down to 700 × 600pt. Type sizes scale with window height (`vh` clamps), so the same composition fits an iPad mini as well as a 13" iPad Pro. Only narrower windows (Slide Over, iPhone) fall back to scrolling. **This applies to every page**, the chapter pages as well as home.

---

## 1. Reference canvases vs. real iPads

We design on 1200 × 1600 (portrait) and 1600 × 1200 (landscape) canvases, but **layout is driven by the available width in points, not by device or orientation**.

| Window | Width (pt) | Layout |
|---|---|---|
| iPhone, Slide Over, narrow split view | < 700 | Book (single column), 20pt margins |
| iPad portrait (mini → 13"), half split | 700 – 1032 | Book (single column) |
| Landscape, ⅔ split or small iPad | 900 – 1099 | Sidebar + page |
| Landscape full screen (11", 13", mini) | ≥ 1100 | Sidebar + page + context panel |

Rule: *landscape-shaped **and** ≥ 900pt wide* switches to the archive layout. Anything else gets the book. In SwiftUI this maps to `horizontalSizeClass == .regular` plus a `GeometryReader` width check. A regular size class alone isn't enough, because iPad portrait is also `.regular`.

Note: a 1200pt canvas is wider than any real iPad (13" iPad Pro is 1032 × 1376pt). So spacing is defined as a fixed text measure plus flexible margins, not as fixed pixel offsets from the canvas.

## 2. Portrait home: "the book" (one screen)

1. **Top bar** (56pt): Menu · About Me · Search
2. **Statement**: **About / Me.** on two lines, centered, 800 weight, then **London** · An ongoing record of me., then a short gold hairline.
3. **Contents list**: a plain list, like a minimal phone launcher. One lowercase word per line, 500 weight, ~34–64pt, left-aligned in a centred block, with no icons, boxes or counts: right now · myself · my life · my taste · my people · my mind · my history. Each word opens its page.
4. **What changed.**: two lines. Friendships: first version → latest version (3 versions). Career: ~~Web design~~ → Web + app development.

## 3. Landscape home: "the archive" (one screen)

- **Top bar** across the full width: About Me (left) · Search · ⋯ (right)
- **Left, 232pt, sidebar**: About Me, Right Now, and the six chapters with counts. This replaces the chapter grid.
- **Centre**: the statement on one line (**About Me.**) and the same contents list, vertically centred.
- **Right, 300pt, What changed**: the full Friendships thread (three dated versions, the newest marked *now*) and the Career before → after with the *why*. On a chapter page this panel shows that chapter's changes.
- So the three columns read: where to go · who I am now · how I got here. The earlier "Currently" panel was cut because it repeated Right now. word for word, which the no-scroll screen has no room for.
- Between 900 and 1100pt wide (split view) there's no right panel, so the two-line What changed. strip returns to the centre.

Content and features are the same as portrait. Only the arrangement changes.

## 3a. Right now page (one screen)

Right Now has its own page (`#now`): the statement **Right now.**, then the four sentences in a 2 × 2 grid (a grey lead-in with the date, and a bold sentence), then **+ Add to right now**.

## 3b. Chapter pages (one screen)

They use the same composition as home, so every page feels like the same book:

1. **Opening**: the tagline in small grey ("What I'm drawn to"), the chapter title as the statement (**My Taste.**), then "49 entries · 10 parts · 2 with recent entries" and the gold hairline.
2. **Parts**: a 2-column grid (up to 10 parts, 5 rows). Each part has its name in bold and one line under it: the latest entry in black, or its description in grey, or "Nothing yet. Tap to write the first entry." in light grey. Clamped to 2 lines.
3. **What changed.**: the chapter's evolution lines (e.g. Career: ~~Web design~~ → Web + app development) and "This chapter has evolved N times", with **View history →**. In wide landscape this moves to the right panel with the chapter's stats.

Verified with no overflow on all 6 chapters and home at 1200×1600, 1600×1200, iPad mini, 11" and 13" in both orientations, and a 1000×744 split-view window.

## 4. Typography

One family: **SF Pro** on iPad (Inter Tight as the web fallback). Hierarchy comes from weight and size, not from mixing faces.

| Role | Weight | Size | Tracking |
|---|---|---|---|
| Statement (About Me.) | 800 | 64–132 | −4.5% |
| Section / chapter titles (Right now., Myself) | 800 | 40–56 | −3.5% |
| Right Now sentences, versions | 700 (lead-in in light grey) | 24–34 | −2.5% |
| Body, contents lists | 500 | 17–20 | −1% |
| Labels, dates, counts | 400–600, grey | 13–14 | 0 |

## 5. Margins & spacing

- Text measure: **max 640pt**, centered. Side margins = `clamp(20, 7vw, 96)`, never less than the safe-area inset.
- Section gap: 88pt (64pt on compact). Chapter blocks: 44pt vertical padding, hairline rules between.
- Landscape page padding: `clamp(40, 5vw, 80)`, top 56pt.
- All bars and panels add `safe-area-inset-*` to their padding.

## 6. Navigation

- **Portrait:** the content is the navigation. Tapping a chapter opens it. The menu opens a left drawer with the same contents list. Search opens a sheet that searches chapters, parts, Right Now, and old versions.
- **Landscape:** a persistent sidebar, with the current page highlighted as a raised tab.
- No bottom tab bar. It isn't needed, and it would make the app feel like a utility.
- Deep links: `#home`, `#now`, `#myself`, `#life`, `#taste`, `#people`, `#mind`, `#history`.

## 7. Colour

| Token | Light | Dark | Use |
|---|---|---|---|
| bg | `#FFFFFF` | `#000000` | everything |
| ink | `#0B0B0C` | `#F5F5F7` | headlines, what you wrote |
| muted | `#6E6E73` | `#A1A1A6` | secondary text |
| faint | `#A1A1A6` | `#6E6E73` | earlier versions, meta |
| gold | `#B3A06B` / text `#8A7640` | `#CDB98A` | the one accent: hairline, "changed" |

Landscape uses hairline dividers instead of a raised page, so all three columns stay pure white.

History is shown by fading, not deleting. Earlier versions turn graphite, and replaced facts get a thin strike. The current version is ink, marked with the blue dot.

## Next

The chapter page in the prototype is a first pass (parts, latest entry, "This chapter has evolved N times → View history"). Next steps: design the **Myself** chapter properly, then **Decision History** (thought → decided → did → changed), then the entry and edit interaction that keeps old versions.
