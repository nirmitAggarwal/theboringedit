---
name: write-track
description: How to create, extend, or renumber a track (numbered series) — track files, index etiquette, continuity, and the build's validation rules.
---

# Writing and managing tracks

A **track** is a numbered series ("Learning Rust", "Wizardry of Bash") that
readers binge in order. Two things define it: a definition file and per-post
frontmatter. Both are yours to edit.

## Anatomy

**Definition** — `content/tracks/<slug>.md` (filename = slug, used as
`/tracks/<slug>` and matched by posts' `track:` key):

```yaml
---
title: "Learning Rust"                # required
description: "One-liner for cards and meta tags."
color: "#fd4d25"                      # optional accent — used by badges and figures
---

Optional intro prose in plain markdown — shown on the track page above the
part list. One short paragraph: what the series covers, whether to read in
order, how new parts land.
```

**Membership** — in each post's frontmatter: `track: <slug>` (must equal the
definition's filename slug) and `trackIndex: <n>` (1-based, author-assigned).

## Creating a new track

1. Decide the slug — lowercase, hyphenated, singular concept (`rust`, not
   `rust-series`). Write `content/tracks/<slug>.md` with title, description,
   and a color not visually identical to an existing track's (see
   `content/tracks/` for taken hues — e.g. rust `#fd4d25`, bash `#7c3fff`).
2. File posts into it with `track: <slug>` + `trackIndex: <n>`.
3. Ensure every filed post has an index — unindexed posts vanish from the
   part list (the build warns: `post(s) missing trackIndex`).

## Extending a track (a new part)

1. Read the **last two published parts** for voice, running jokes, footer
   format, and the exact "Next:" promise the previous part made. Your new
   part must *be* what the previous part pointed to, or the footer must
   explain the change.
2. **Never renumber existing parts.** Indexes are reader-facing (badges say
   "part 03 of 09"; progress squares are stored per index in readers'
   browsers). Always append the next free integer.
3. If the previous part's "Next:" link points at a slug that doesn't exist
   yet, your new post's slug should honor that promise when reasonable; if it
   can't, go back and edit the *previous* part's footer — fixing the promise
   beats breaking it.
4. Update the previous part's "Filed under … part N of M" line if it states a
   total that your new part changes.

## Renumbering / inserting (rare, do it deliberately)

The build allows author-assigned indexes to change, but reader progress is
keyed by slug, not index, so a one-time renumber is safe for progress — still,
avoid it: external links and bookmarks may cite "part 03". If you must insert
between parts, renumber in one pass and verify the whole track:

```bash
npm run content:build   # zero warnings = no gaps, no duplicates
```

The build warns on: `references unknown track` (post's `track:` doesn't match
a definition file), `duplicates track <slug> #n` (two posts claim an index —
later post loses it), `missing part n (gap in numbering)`, and `post(s)
missing trackIndex`. Zero warnings is the bar.

## Cross-post rituals (what makes a track read like a book)

- Footer of every tracked post, in italics, exactly this shape:
  `> Filed under [Track Title](/tracks/<slug>) — part NN of MM ·`
  `> Previous: [Title](/blog/slug) · Next: [Title](/blog/slug)`
  (omit Previous on part 01; on the newest part, "Next" points forward to a
  planned part or is omitted).
- "Your quest" task list at the end of teaching posts, building on that
  part's material.
- Badges ("↳ Track Title · NN") and track-page ordering come free from the
  build — never hand-maintain them anywhere.
