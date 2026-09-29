---
name: write-post
description: How to write or edit a post for The Boring Edit — frontmatter, body syntax, images, track filing, voice defaults, and the exact validation loop.
---

# Writing a post

## The workflow, in order

1. **Orient.** If the post joins a series, read the previous 1–2 parts of that
   track (`content/posts/`) for voice, running jokes, and where the story
   stopped. Do not contradict earlier parts.
2. **Check the table of contents.** If the track has ≥ 3 parts, your post's
   "Next:" footer must point where the track actually is (or explicitly say
   "next up, when it comes"). Never promise a part that already exists under a
   different title.
3. **Pick a slug** — lowercase, hyphens (`rustys-type`). Filename = slug. The
   post lives at `content/posts/<slug>.md` and publishes at `/blog/<slug>`.
   Prefix by series (`bash-…`, `rustys-…`) keeps the folder and related-post
   links tidy.
4. **Scaffold** (optional): `npm run new:post -- "Title" --tags a,b --track
   slug --index n`, or just create the file directly — the scaffolder output
   is plain markdown either way.
5. **Write** the frontmatter, then the body (references below). If a writing
   mode was named in the user's request, load
   [`.agents/skills/writing-modes/SKILL.md`](../writing-modes/SKILL.md) and
   apply its voice rules; its rules override the default voice section here.
6. **Artwork.** Posts traditionally have one in-article figure
   (`public/images/<slug-ish>.svg`, referenced on a line by itself). Style
   template below. Skip only if the post genuinely needs none.
7. **Validate** (the loop, below): `npm run content:build` → zero warnings →
   `npm run typecheck` → report.

## Frontmatter — the complete legal set

```yaml
---
title: "Rusty's Type"        # REQUIRED
date: 2026-09-29             # REQUIRED-ish — YYYY-MM-DD; build defaults to today
tags: [rust, basics, types]  # lowercase, 2–4, consistent with existing posts
excerpt: "One sentence, ≤160 chars. Becomes <meta description> + card text."
subtitle: "The long joke or framing line shown under the title."  # optional
slug: custom-slug            # optional; filename is the default
cover: /images/x.svg         # optional (OG/hero override)
ogImage: /images/x.png       # optional (OG override; auto-card is generated)
track: rust                  # track slug from content/tracks/<slug>.md
trackIndex: 3                # 1-based position; REQUIRED if track is set
---
```

Hard rules:

- No invented keys. These nine are the entire set.
- `date` must be a real `YYYY-MM-DD` (the compiler regex-checks and falls
  back to today with a warning otherwise).
- If `track:` is set, `trackIndex:` must be set — an unnumbered post silently
  drops out of the track's part list.
- Reading time is computed (~220 wpm) — never fake it, never write it.

## Body syntax — exactly what the pipeline supports

- **Standard markdown:** headings (`##`/`###` — these build the TOC), lists,
  tables, task lists, blockquotes, bold/italic/strikethrough, links.
- **Links to other posts/tracks:** plain site paths —
  `[part 02](/blog/rustys-hello-world)`, `[the track](/tracks/rust)`.
  Never absolute URLs to this site.
- **Math:** `$E = mc^2$` inline; `$$…$$` or `\[…\]` display. Delimiters hug
  the TeX (`$x$`, not `$ x$`). Escape literal dollars as `\$5`. Dollar signs
  inside inline code are safe automatically.
- **Code fences:** ` ```rust `` ` etc., with optional metadata:
  ` ```ts title="fib.ts" caption="The classic." `` ` — `title` labels the
  panel bar, `caption` renders small beneath. Any highlight.js language.
- **Code + output pattern:** for teaching posts, pair a runnable block with a
  separate ` ```text `` ` block showing its exact output. This is the house
  style (see any existing part of a track).
- **Figures:** an image on a line **by itself** becomes a styled figure; the
  title attribute is the caption: `![alt](/images/rust-type.svg "fig. 03 — …")`.
  Caption prefix `full ` widens it. Referenced images must exist under
  `public/images/` (build warns otherwise).
- **Task lists** (`- [ ] …`) are the "Your quest" homework convention.
- Avoid bare `---` horizontal rules — they can be misread as frontmatter.
  Use headings and blockquotes for separation.

## Image style — the house figure (SVG)

1200×800 viewBox; warm paper `#f8f5ef` background; a faint dot-grid pattern
(28×28 cells, 1.2px circles, ink `#262626` at opacity 0.12); ink `#262626`
strokes at 3–4px; white `#fefefe` cards with rounded corners; one accent
color (a track's `color:` if it has one — e.g. rust track `#fd4d25`, bash
track violet `#7c3aed`); label text in monospace (`Menlo, Consolas,
monospace`), letter-spaced, `FIG. NN — SHORT NAME` top-left at `(80, 92)`,
`#777777`. Copy the skeleton from `public/images/rust-type.svg` or
`public/images/bash-variables.svg` rather than inventing markup. `role="img"`
+ `aria-label` required.

## Default voice (used when no mode is named)

Dry-warm and playful but **information-dense**: the joke earns its place by
framing a real idea. Concrete artifacts (code, terminal output, real
commands) outrank abstractions. Asides and bold call-outs exist to prevent a
specific mistake, not to decorate. Second person, present tense, active.
Longest paragraphs ~4 lines. Every teaching post ends with **Your quest** (a
task list) and, for tracked posts, a **Next:** footer plus the filed-under
footer in italics — copy the exact format from a recent tracked post.

## The validation loop

```bash
npm run content:build   # ~25 s. MUST end with no ⚠ warnings
npm run typecheck       # passes when generated content type-checks
```

Every warning is a real defect: duplicate slug, unknown track slug, missing
`trackIndex`, numbering gap, missing image, bad date. Fix the source in
`content/`, never the generated output. Then report (see AGENTS.md).
