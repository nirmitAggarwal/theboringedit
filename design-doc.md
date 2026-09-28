# Design Doc — "Warm Editorial Ink" 📄

A copy-paste design system for this site. Use it to port the **vibe, background, colors, and fonts** to any other website — light and dark theme included.

---

## 1. The Vibe

**One line:** a quiet, personal, editorial "paper" page — warm off-whites and ink text, hairline borders instead of cards, one loud orange accent used sparingly, with tiny experimental type labels as ornament.

Keywords: `editorial` · `warm` · `minimal` · `typographic` · `calm` · `precise`

### Rules that create the feel

- **Paper, not screens.** Backgrounds are never pure black/white. Light is a warm paper `#fefefe`; dark is a warm near-black `#0e0d0c`. Everything else (borders, muted text, surfaces) is warm-tinted, never neutral gray or blue.
- **Hairlines over boxes.** Sections are separated with 1px top borders (`border-t`), not background blocks. Cards are rare; the site is an open layout with generous whitespace.
- **One loud color.** A vivid orange is the *only* saturated color. It appears in buttons, links, list markers, active states — never as a background wash covering content.
- **Typographic ornament.** Small uppercase "index labels" (`01 — ABOUT`, `// rust · in progress`) in the decorative Svetze font, with wide letter-spacing, act like pencil annotations in a magazine margin.
- **Squared with exceptions.** Editorial elements are square-cornered; only chips/badges are `rounded-full` and floating navbar pills are `rounded-xl`.
- **Subtle texture.** A fixed dot-grid sits behind everything — ink dots mixed from `--foreground` at 8% opacity, 36px spacing — so the paper never feels flat without fighting the text.
- **Motion is a whisper.** Content rises in 18px with an expo-out ease and staggers in 80ms steps. Links get an underline "sweep". Nothing bounces except the loading dots.

---

## 2. Color System

Two themes, toggled by a `.dark` class on `<html>`. **Default is light.** Every color is a warm-tinted token — there are no neutral grays.

### Light theme (default)

| Token | Hex | Role |
|---|---|---|
| `--background` | `#fefefe` | Warm paper white — page background |
| `--foreground` | `#262626` | Ink — primary text |
| `--ink-soft` | `#4a4a4a` | Soft ink — blockquotes, emphasized body text |
| `--muted` | `#f4f2ee` | Warm light gray — inline code bg, hover fills |
| `--muted-foreground` | `#777777` | Secondary text, labels, descriptions |
| `--primary` | `#fd4d25` | **The accent** — vivid orange-red: buttons, links, markers |
| `--primary-foreground` | `#fefefe` | Text on primary (paper white) |
| `--accent` | `#fd4d25` | Same as primary (selection, focus rings) |
| `--accent-soft` | `#fdeae4` | Pale orange tint for soft highlights |
| `--border` | `#e8e5e0` | Hairline borders |
| `--border-strong` | `#d6d2cb` | Stronger hairlines (outline buttons, scrollbars, hrs) |
| `--surface` | `#ffffff` | Card/code-panel background |
| `--surface-warm` | `#f8f5ef` | Warm panel bg — image placeholders, table zebra, media |

### Dark theme (`.dark`)

| Token | Hex | Role |
|---|---|---|
| `--background` | `#0e0d0c` | Warm near-black "night paper" |
| `--foreground` | `#ece8e2` | Warm off-white text |
| `--ink-soft` | `#c4beb5` | Soft warm text |
| `--muted` | `#141210` | Elevated warm dark — code bg, hover fills |
| `--muted-foreground` | `#a09a91` | Secondary text |
| `--primary` | `#ff5c1a` | **Accent**, brightened for dark contrast |
| `--primary-foreground` | `#1a0d08` | Dark brown text on primary |
| `--accent` | `#ff5c1a` | Same as primary |
| `--accent-soft` | `#3d2012` | Dark orange tint for soft highlights |
| `--border` | `#262220` | Hairline borders |
| `--border-strong` | `#35302a` | Stronger hairlines |
| `--surface` | `#161412` | Card background |
| `--surface-warm` | `#1a1714` | Warm panel background |

### Fixed colors (same in both themes)

| Hex | Use |
|---|---|
| `#0d1117` | Code block background (GitHub-dark card — stays dark in both themes) |
| `#8b949e` / `#e6edf3` | Code block label/copy text (muted / hover) |
| `emerald-600` (`#059669`) | "Shipped" status dot |
| `rgba(255, 255, 255, 0.1 / 0.08 / 0.04)` | Code block border / bar divider / bar fill |
| `black/70 → transparent` gradient | Text scrim over photos (BuildingPhases) |

### Palette origin (`resources/color_pallete.json`)

- Main set: `#fefefe` paper · `#262626` ink · `#777777` gray · `#bcbcbc` silver · `#fd4d25` accent
- Warm support tones (from "visible css" set): `#f3e3cf` / `#2b2620` / `#4a4238`

**Contrast notes:** ink-on-paper ≈ 14.6:1, muted-on-paper ≈ 4.9:1, paper-on-primary ≈ 3.6:1 (large/bold only), warm-off-white on night-paper ≈ 13:1. The dark primary `#ff5c1a` is a step brighter than `#fd4d25` so it keeps vibrancy on near-black.

---

## 3. Typography

Three self-hosted faces + one system mono stack. Display does the drama, sans does the reading, label does the ornament.

| Role | Font | Weights | Files |
|---|---|---|---|
| Display (headings, quotes, big titles) | **Recoleta** — soft expressive serif | 400 only | `public/fonts/recoleta/Recoleta-Regular.otf` |
| Body / UI (paragraphs, nav, buttons) | **Caviar Dreams** — geometric humanist sans | 400, 700, italic, bold-italic | `public/fonts/caviar_dreams/CaviarDreams*.ttf` |
| Label (tiny uppercase tags, indexes, ticker) | **Svetze** — experimental display | 400 only | `public/fonts/svetze/Svetze.otf` |
| Mono (code, timestamps, coordinates) | system stack | — | `ui-monospace, SFMono-Regular, Cascadia Code, Menlo, Consolas` |

Fallbacks: `Recoleta → "Iowan Old Style", Georgia, serif` · `Caviar Dreams → "Avenir Next", "Segoe UI", system-ui, sans-serif` · `Svetze → "Caviar Dreams", sans-serif`

### Type scale

| Element | Size / leading | Font |
|---|---|---|
| Body base | `1.0625rem` (17px) / `1.65` | Caviar Dreams |
| Hero H1 | `2.1rem → 3.6rem` (resp.) / `1.18`, max `24ch` | Recoleta 400 |
| Section H2 | `1.875rem → 2.75rem` / `1.15`, `text-balance` | Recoleta 400 |
| Card/article H3 | `1.25rem – 1.75rem` / `1.2–1.3` | Recoleta (h2-style) or Caviar 700 |
| Body lead | `1rem – 1.125rem` / `1.625` | Caviar Dreams |
| Article prose | `1.0625rem` / `1.75` | Caviar Dreams |
| Label (`.font-label`) | `0.625rem – 0.75rem`, `uppercase`, tracking `0.18em` | Svetze |
| Chip / mono tag | `0.6875rem – 0.75rem` | Mono |
| Footer fine print | `0.75rem`, `text-muted-foreground/70` | Mono |

### Typographic conventions

- Headings are **Recoleta 400 — never bolded**; the serif carries the weight.
- Svetze is **always uppercase, tiny, and tracked out** (`letter-spacing: 0.18em`), and usually colored `muted-foreground` or `primary`.
- Headlines use `text-wrap: balance` and max-widths in `ch` (`24ch`, `40ch`, `56ch`) to keep ragged edges nice.
- Standard ligatures are disabled site-wide (`font-variant-ligatures: none; "liga" 0, "clig" 0`) — Svetze's ligatures misbehave at small sizes. KaTeX re-enables its own.

---

## 4. Background & Texture

```css
/* Dot grid — fixed behind ALL content (z -1, on body::before;
   html carries the page color so the layer stays visible) */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background-image: radial-gradient(
    color-mix(in srgb, var(--foreground) 8%, transparent) 1.2px,
    transparent 1.8px
  );
  background-size: 36px 36px;
}
```- The dots auto-adapt per theme because they're mixed from `--foreground`.
- Photo overlays use a `bg-gradient-to-t from-black/70 via-black/10` scrim with white text (`white/60` labels, `white` headings, `white/75` body).

---

## 5. Components & Motifs

| Motif | Recipe |
|---|---|
| **Section shell** | `border-t border-border` → `max-w-6xl px-6 py-20 md:px-10 md:py-28 lg:py-32` → header row: `font-label` index label left, `h-px w-24 bg-border-strong` rule right |
| **Primary button** | `bg-primary text-primary-foreground font-bold h-11/h-12 px-6-8`, hover `bg-primary/90`, **square corners** |
| **Outline button** | `border border-border-strong font-bold`, hover `border-primary text-primary` |
| **Ghost/link button** | `text-muted-foreground hover:text-foreground` / `text-primary underline-offset-4` |
| **Floating navbar** | Two independent pills: `rounded-xl border border-border bg-background/85 backdrop-blur-md`, `h-12 sm:h-16`, fixed top with `z-50` |
| **Chips / badges** | `rounded-full border border-border px-3 py-1 font-mono text-[0.6875rem] text-muted-foreground`, hover `border-primary text-primary` |
| **Status badge** | `font-label text-[0.6875rem]` + `size-1.5 rounded-full` dot: orange = Building, emerald = Shipped, `foreground/60` = default |
| **Card** | `border border-border bg-surface` square corners, `p-6` — used *sparingly* |
| **Editorial placeholder** | `bg-surface-warm` + hairline border, giant `foreground/8` Recoleta initial, crosshair rules (`h-px`/`w-px bg-border-strong`), `font-label` coordinate comment `// rust · in progress` |
| **Link underline sweep** | 1px `background-image: linear-gradient(currentColor, currentColor)`, size `0% → 100%` on hover, 320ms expo |
| **Selection** | `background: accent; color: primary-foreground` |
| **Focus ring** | `:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; border-radius: 2px }` — never removed |
| **Scrollbar** | 10px, thumb `border-strong` with 2px `background` border, transparent track |

---

## 6. Motion System

```css
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--duration-base: 420ms;
```

- **Entrance reveal:** `.reveal` starts `opacity: 0`; when visible, `rise-in` (translateY 18px → 0, fade) for 420ms expo-out, staggered `--reveal-delay × 80ms`. Driven by a tiny IntersectionObserver.
- **Media reveal:** `.reveal-media` wipes open via `clip-path: inset(0 0 100% 0)` → `inset(0)` over 900ms.
- **Micro-interactions:** color hovers 200–300ms; image zoom on hover 700ms ease-out; accordion via `grid-rows-[0fr]→[1fr]` 300ms.
- **Reduced motion:** everything renders instantly visible; all animations/transitions clamped to 0.01ms; scroll-behavior forced auto.

---

## 7. Theming & Implementation (port this)

### 7a. Tokens + Tailwind v4 mapping

```css
@import "tailwindcss";

:root {
  /* Light */
  --background: #fefefe;      --foreground: #262626;
  --muted: #f4f2ee;           --muted-foreground: #777777;
  --primary: #fd4d25;         --primary-foreground: #fefefe;
  --accent: #fd4d25;          --accent-soft: #fdeae4;
  --border: #e8e5e0;          --border-strong: #d6d2cb;
  --surface: #ffffff;         --surface-warm: #f8f5ef;
  --ink-soft: #4a4a4a;
  --font-display: "Recoleta", "Iowan Old Style", Georgia, serif;
  --font-sans: "Caviar Dreams", "Avenir Next", "Segoe UI", system-ui, sans-serif;
  --font-label: "Svetze", "Caviar Dreams", sans-serif;
  --font-mono: ui-monospace, "SFMono-Regular", "Cascadia Code", Menlo, Consolas, monospace;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-base: 420ms;
}

.dark {
  --background: #0e0d0c;      --foreground: #ece8e2;
  --muted: #141210;           --muted-foreground: #a09a91;
  --primary: #ff5c1a;         --primary-foreground: #1a0d08;
  --accent: #ff5c1a;          --accent-soft: #3d2012;
  --border: #262220;          --border-strong: #35302a;
  --surface: #161412;         --surface-warm: #1a1714;
  --ink-soft: #c4beb5;
}

/* Tailwind v4: expose tokens as utilities (bg-primary, text-muted-foreground, …) */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-soft: var(--accent-soft);
  --color-border: var(--border);
  --color-border-strong: var(--border-strong);
  --color-surface: var(--surface);
  --color-surface-warm: var(--surface-warm);
  --color-ink-soft: var(--ink-soft);
  --font-display: var(--font-display);
  --font-sans: var(--font-sans);
  --font-label: var(--font-label);
  --font-mono: var(--font-mono);
}
```

> On Tailwind v3 instead: keep the same `:root`/`.dark` variables and map them in `tailwind.config.js` under `theme.extend.colors`, e.g. `background: "var(--background)"`.

### 7b. Font loading

Copy `public/fonts/` (recoleta, caviar_dreams, svetze) and declare with `font-display: swap`. Svetze/Recoleta are single-weight OTFs; Caviar Dreams has 4 TTF styles. See `src/styles/globals.css` for the exact `@font-face` blocks.

### 7c. Theme bootstrap (no flash of wrong theme)

**Default is LIGHT** — dark applies only when explicitly stored. Put this inline in `<head>` **before any stylesheet paint**:

```html
<meta name="theme-color" content="#fefefe" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#0e0d0c" media="(prefers-color-scheme: dark)" />
<script>
  (function () {
    try {
      if (localStorage.getItem("theme") === "dark")
        document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
</script>
```

Toggle logic (see `src/lib/theme.ts`): `.dark` class on `<html>` + `localStorage["theme"]`. (In this repo the OS `prefers-color-scheme` is deliberately ignored — light is the house default.)

### 7d. Svetze label utility

```css
@utility font-label {
  font-family: var(--font-label);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}
```

---

## 8. Don'ts

- ❌ No pure `#000` / `#fff` backgrounds, no blue-gray neutrals — everything is warm-tinted.
- ❌ No second saturated accent color. Orange is the only voice; emerald appears solely as the "Shipped" status dot.
- ❌ No rounded cards everywhere / soft shadows — depth comes from hairlines and whitespace. (Only exceptions: `rounded-full` chips, `rounded-xl` nav pills, code block 14px.)
- ❌ No bold display headings, no hover-only information, no motion without a `prefers-reduced-motion` fallback.
- ❌ No dark-on-dark syntax themes — code blocks are `#0d1117` in **both** themes so highlighting stays readable.
