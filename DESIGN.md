# About Me: Home Screen Spec (v1)

The prototype is `home.html`. Open it in Safari on the iPad and rotate the device, or resize a desktop browser window. Screenshots are in `screens/`.

Metaphor: **a personal book with an archive.** It has chapters instead of cards and sentences instead of fields. Old versions stay on the record.

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
2. **Masthead**: `ABOUT ME` label · **London** (display, ~90pt) · *An ongoing record of me.* · `Begun January 2026 · 214 entries`
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

| Role | Face | Size |
|---|---|---|
| Display (name, chapter titles) | Newsreader, light 350 | 56–92 / 34–44 |
| Right Now sentences | Newsreader 380, lead-in italic in graphite | 24–30 |
| Body / entries | Newsreader | 19–21 |
| Labels (RIGHT NOW, MYSELF) | Schibsted Grotesk 600, caps, +0.14em | 12–13 |
| Dates, counts, "since" stamps | IBM Plex Mono | 12.5 |

Serif carries everything the person *wrote*. Grotesk labels are the book's structure. Mono is the archive's record-keeping (dates, counts, versions). For the native app: New York can stand in for Newsreader, SF Pro for the grotesk, and SF Mono for the mono.

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
| paper | `#ECEEE9` | `#12151B` | desk behind the page (landscape) |
| page | `#F7F8F4` | `#191D25` | reading surface |
| ink | `#1C2230` | `#E4E7E1` | what you wrote |
| graphite | `#5E6573` | `#9AA1AD` | prompts, labels, earlier versions |
| accent | `#2D4B8E` | `#93AAE2` | links, "changed", the *now* marker |

History is shown by fading, not deleting. Earlier versions turn graphite, and replaced facts get a thin strike. The current version is ink, marked with the blue dot.

## Next

The chapter page in the prototype is a first pass (parts, latest entry, "This chapter has evolved N times → View history"). Next steps: design the **Myself** chapter properly, then **Decision History** (thought → decided → did → changed), then the entry and edit interaction that keeps old versions.
