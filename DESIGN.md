# About Me: Home Screen Spec (v1)

The prototype is `index.html`. Open it in Safari on the iPad and rotate the device, or resize a desktop browser window. Screenshots are in `screens/`.

Metaphor: **a personal book with an archive.** It has chapters instead of cards and sentences instead of fields. Old versions stay on the record.

Visual direction (v2): **one bold statement on white.** Pure white page, heavy black grotesk, centered, and mostly empty space, like an Apple product page (the "Create More." reference). The home screen leads with the statement **About Me.**

**Rule: on iPad the home screen never scrolls.** It is one composed screen in every orientation and window size down to 700 × 600pt. Type sizes scale with window height (`vh` clamps), so the same composition fits an iPad mini as well as a 13" iPad Pro. Only narrower windows (Slide Over, iPhone) fall back to scrolling. This applies to home and Right Now. **Section pages are the exception**: they are long lists and scroll.

---

## 1. Reference canvases vs. real iPads

We design on 1200 × 1600 (portrait) and 1600 × 1200 (landscape) canvases, but **layout is driven by the available width in points, not by device or orientation**.

| Window | Width (pt) | Layout |
|---|---|---|
| iPhone, Slide Over, narrow split view | < 700 | Book (single column), 20pt margins |
| iPad portrait (mini → 13"), half split | 700 – 1032 | Book (single column) |
| Landscape, ⅔ split or small iPad | 900 – 1099 | Wider page, single column |
| Landscape full screen (11", 13", mini) | ≥ 1100 | Page + What changed panel |

Rule: *landscape-shaped **and** ≥ 900pt wide* switches to the archive layout. Anything else gets the book. In SwiftUI this maps to `horizontalSizeClass == .regular` plus a `GeometryReader` width check. A regular size class alone isn't enough, because iPad portrait is also `.regular`.

Note: a 1200pt canvas is wider than any real iPad (13" iPad Pro is 1032 × 1376pt). So spacing is defined as a fixed text measure plus flexible margins, not as fixed pixel offsets from the canvas.

## 2. Portrait home: "the book" (one screen)

1. **Top bar** (56pt): Menu · About Me · Search
2. **Statement**: **About / Me.** on two lines, centered, 800 weight, then **London** · An ongoing record of me., then a short gold hairline.
3. **Contents list**: a plain list, like a minimal phone launcher. One lowercase word per line, 500 weight, ~28–56pt, left-aligned on the left edge of the page under the left-aligned statement, with no icons, boxes or counts: right now · myself · my life · my taste · my people · my mind · my appearance · my routines · my little things · my history. Each word opens its page.
4. **What changed.**: two lines. Friendships: first version → latest version (3 versions). Career: ~~Web design~~ → Web + app development.

## 3. Landscape home: "the archive" (one screen)

- **Top bar** across the full width: Menu · About Me · Search · ⋯. There's no sidebar: the home contents list and the Menu drawer are how you move around, the same as in portrait.
- **Centre**: the statement on one line (**About Me.**) and the same contents list, vertically centred.
- **Right, 300pt, What changed**: the full Friendships thread (three dated versions, the newest marked *now*) and the Career before → after with the *why*. The panel appears only on home; every other page is full width.
- So the two columns read: who I am now · how I got here. The earlier "Currently" panel was cut because it repeated Right now. word for word, which the no-scroll screen has no room for.
- Between 900 and 1100pt wide (split view) there's no right panel, so the two-line What changed. strip returns to the centre.

Content and features are the same as portrait. Only the arrangement changes.

## 3a. Right now page (one screen)

Right Now has its own page (`#now`): the statement **Right now.**, then the four sentences in a 2 × 2 grid (a grey lead-in with the date, and a bold sentence), then **+ Add to right now**.

## 3b. Chapter pages (one screen)

They use the same composition as home, so every page feels like the same book:

1. **Opening (kept small so the list leads)**: the tagline in small grey ("What I’m drawn to"), the chapter title at ~34–56pt (**My Taste.**), then "49 entries · 10 parts · 2 with recent entries" and the gold hairline.
2. **Topics, as one straight Notes-style list that scrolls**: grouped by when you last wrote in them (**Today**, **Yesterday**, **Earlier**, **Nothing yet**), each group a rounded card with hairline separators. Every row is two lines: the topic in bold, then one grey line (the latest entry, the topic's description, or "Tap to write the first entry."). No times, folder labels or tiles. The list spans the full width of the screen, with a 20pt margin (or the safe-area inset) on each side.
3. **No What changed.** It appears only on the home screen. Section pages show just their title and parts, full width, in both orientations.

Verified with no overflow on all 9 chapters, Right Now and home at 1200×1600, 1600×1200, iPad mini, 11" and 13" in both orientations, and a 1000×744 split-view window.

## 3c. Section layouts (chosen per section)

A **layout button** (sliders icon) in the top-right corner of every section page opens a menu with four layouts. The choice is remembered for each section on that device.

| Layout | Looks like | Best for | Default for |
|---|---|---|---|
| **List** | iPhone Notes: grouped rows, bold title plus one grey line | Reading in order of when you wrote | (available everywhere) |
| **Cards** | mymind: a masonry board of cards; picture or colour on top, your words in bold, the topic and date as a caption underneath; empty topics as dashed "+ Add" cards | Visual sections | My Taste, My Appearance |
| **Grid** | Grid Diary: equal cells with hairline dividers; topic in bold, your latest words under it; empty topics in light grey. **Two rows that you swipe left to right**, with part of the next column peeking in (about 3 columns on screen in landscape, 2 in portrait) | Sections you write in a lot | (available everywhere) |
| **Tiles** | Grid Diary's "Personalize Template": equal tiles with only the topic name | A serious tone, or quick scanning | Myself, My Life, My People, My Mind, My Little Things, My Routines, My History |

Tiles use 3 columns in landscape, 2 in portrait and 1 on a phone; when there are more tiles than fit, the page scrolls down normally and nothing is cut off. Cards use 3, 2 and 1 columns in the same way. Empty cells close off the last row.

## 3d. My History (one screen, its own design)

My History doesn't use the layout switcher. It is a **focus card driven by a timeline**:

- **Right: the timeline.** Every moment you recorded, oldest at the top, with a dot on a thin line, a topic icon, the date and what you said. It scrolls and snaps; the moment in the middle is selected (filled dot, icon a little larger, date in black). Moments fade the further they are from the middle, so only 3–5 are readable at once. It never lists empty months. It opens on the newest moment, so scrolling up is going back in time.
- **Left: the moment you’re on**, set straight on the page with no box around it. The topic (icon plus name, in small caps), the date, what you said in large bold type, and a line under a hairline about where it led. It changes as you scroll the timeline.
- **Topics are meaningful, not decorative:** ✦ Career, ♡ Relationships, ⌂ Home, ✎ Learning, ◌ Identity, $ Money, → Goals, ◎ Perspective.
- Portrait puts the card on top and the timeline under it. The page never scrolls; only the timeline does. Tapping a moment or pressing ↑/↓ also moves through it.

## 3e. Annotate (feedback while designing)

The pencil button in the top bar (every page) turns the screen into a drawing layer: draw with a finger or Apple Pencil in red, black or blue, with Undo and Clear. **Done** takes a screenshot of the screen with the drawing on top and asks "What should change?" for a note. **Save comment** stores the picture, the note, the page, the orientation, the window size and the section's layout.

- In the Claude preview, comments go to the artifact's private database (collection `annotations`, owner-only), where Claude reads them directly.
- In the Home Screen app they're kept on the iPad (last 40). **Saved** lists them, with **Share** to send one to Claude and **Delete**.

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

- **Back button:** every page except home shows **‹ Back** in the top-left corner, where the menu button sits on home. It returns to the home screen.
- **Portrait:** the content is the navigation. Tapping a chapter opens it. The menu opens a left drawer with the same contents list. Search opens a sheet that searches chapters, parts, Right Now, and old versions.
- **Landscape:** no sidebar. Same as portrait: the contents list on home, plus the Menu drawer.
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
