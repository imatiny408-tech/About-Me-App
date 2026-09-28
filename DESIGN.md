# About Me: Home Screen Spec (v1)

The prototype is `home.html`. Open it in Safari on the iPad and rotate the device, or resize a desktop browser window. Screenshots are in `screens/`.

Metaphor: **a personal book with an archive.** It has chapters instead of cards and sentences instead of fields. Old versions stay on the record.

Visual direction (v2): **one bold statement on white.** Pure white page, heavy black grotesk, centered, and mostly empty space, like an Apple product page (the "Create More." reference). The home screen opens on a single full-screen statement, **About Me.**, and everything else sits below it.

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

## 2. Portrait home: "the book"

Top to bottom, one column, scrolls:

1. **Top bar** (56pt, translucent, hairline appears once scrolled): Menu · ABOUT ME · Search
2. **Statement (fills the first screen)**: **About / Me.** centered in 800-weight grotesk (~130pt), with one small line under it: **London** · An ongoing record of me. A thin gold hairline marks the bottom of the first screen.
3. **Right Now**: four sentences, not fields: *I'm into* design, and the way… Each has a `since Aug 2026` stamp. Then **+ Add to right now**.
4. **Chapters**: Myself, My Life, My Taste, My People, My Mind, My History. Each one is a chapter opening, not a button: tagline label ("Who I am"), big serif title, its contents as an inline index (Personality · Values · Standards …), and `41 entries · changed 4 times`. The whole block is the tap target.
5. **What Changed, Lately**: one evolution thread (Friendships: three dated versions, the newest marked *now*) and one before → after change (Career), with the *why* quoted.

You never see everything at once. The chapters sit below the fold on purpose.

## 3. Landscape home: "the archive"

- **Top bar** across the full width: ABOUT ME (left) · Search · ⋯ (right)
- **Left, 232pt, sidebar**: About Me, Right Now, then the six chapters with entry counts. It replaces the chapter list, so the chapter index is hidden in this layout.
- **Center, the page**: a raised sheet with a soft left shadow acting as the spine. Same masthead, Right Now, and What Changed as portrait.
- **Right, 300pt, context**: on Home it shows **Currently** (Learning / Thinking about / Interested in / Working toward / Changed recently) and **This archive** (begun, entries, number of changes). On a chapter page it switches to that chapter's stats and recent changes, so the panel is contextual rather than duplicated.

Content and features are the same as portrait. Only the arrangement changes.

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
