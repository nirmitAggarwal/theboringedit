# The Boring Edit ✦

A fast, static, SEO-friendly personal blog by **Nirmit Aggarwal**. You write
**plain markdown files** — with LaTeX math, code blocks and images mixed in,
ChatGPT-style — run one command, and they become a beautifully typeset website.
No server, no database, no running costs beyond a static host.

- **Website:** <https://www.theboringedit.in/>
- **GitHub:** <https://github.com/nirmitAggarwal>
- **LinkedIn:** <https://www.linkedin.com/in/nirmit-aggarwal/>

Built with **React 18 + Vite + React Router + Tailwind v4**, following the
"Warm Editorial Ink" design system (`design-doc.md`): warm paper, ink text,
hairline borders, one loud orange, light + dark themes.

---

## Table of contents

1. [Quick start](#quick-start)
2. [Writing posts](#writing-posts)
   - [Frontmatter reference](#frontmatter-reference)
   - [Math](#math)
   - [Code blocks](#code-blocks)
   - [Images & figures](#images--figures)
   - [Everything else markdown](#everything-else-markdown)
   - [Several posts in one file](#several-posts-in-one-file)
3. [Tracks — numbered series](#tracks--numbered-series)
4. [Reading progress — what readers see](#reading-progress--what-readers-see)
5. [Commands](#commands)
6. [Project structure](#project-structure)
7. [How the pipeline works](#how-the-pipeline-works)
8. [SEO — what you get for free](#seo--what-you-get-for-free)
9. [Customizing the site](#customizing-the-site)
10. [Deploying](#deploying)
11. [Troubleshooting](#troubleshooting)

---

## Quick start

```bash
npm install          # once
npm run dev          # start the dev server → http://localhost:5173
```

The dev server auto-compiles your markdown first. Keep a second terminal
running the watcher so edits appear on refresh:

```bash
npm run content:watch
```

Write your first post:

```bash
npm run new:post -- "My first post"
# → creates content/posts/my-first-post.md — edit it, save, refresh.
```

Ship it:

```bash
npm run build        # → dist/ is a fully static site
npm run preview      # check it locally before uploading
```

---

## Writing posts

Every post is a `.md` file in **`content/posts/`**. The filename becomes the
URL slug: `fourier-in-ink.md` → `/blog/fourier-in-ink`. Each file starts with
a small frontmatter block, followed by the body in plain markdown.

### Frontmatter reference

```yaml
---
title: "Fourier, but make it ink"     # required
date: 2026-09-14                      # YYYY-MM-DD — posts are sorted by this
tags: [math, signal-processing]       # optional; powers chips + /blog?tag= filter
excerpt: "Optional. Used on cards."   # optional; auto-generated from the body if omitted
subtitle: "A short, visual tour."     # optional; shown under the title
cover: /images/wave.svg               # optional; used for the OG/social image
slug: my-custom-slug                  # optional; overrides the filename
track: rust                           # optional; join a series (see Tracks below)
trackIndex: 2                         # optional; your 1-based position in that series
---
```

Reading time is computed automatically (~220 words/minute). No counters to
maintain.

### Math

Type TeX directly into your markdown — it's typeset by KaTeX **at build
time**, so readers get crisp math with zero client-side JavaScript:

```md
Inline math like $E = mc^2$ flows inside a sentence.

Display math sits on its own lines:

$$
X(k) = \sum_{n=0}^{N-1} x[n] \, e^{-i 2\pi k n / N}
$$
```

`\[ ... \]` and `\( ... \)` delimiters work too. To write a literal dollar
amount, escape it: `\$5`.

### Code blocks

Standard fenced blocks, optionally with a **file label** and a **caption** in
the info string:

````md
```ts title="fib.ts" caption="The classic."
export const fib = (n: number): number => (n < 2 ? n : fib(n - 1) + fib(n - 2));
```
````

- `title="fib.ts"` — shown in the panel's label bar (defaults to the language)
- `caption="…"` — small caption under the panel
- Any highlight.js language works (`ts`, `rust`, `python`, `bash`, …)
- Every panel ships a **copy** button

Code blocks stay GitHub-dark (`#0d1117`) in both themes, per the design doc.

### Images & figures

Put files in **`public/images/`**, reference them with a `/images/...` path.
An image on a line **by itself** becomes a styled `<figure>`; the title
attribute becomes the caption:

```md
![A sine wave](/images/wave.svg "fig. 02 — three rotations, unwound")
```

Prefix the caption with `full ` to visually widen the figure:

```md
![A sine wave](/images/wave.svg "full fig. 02 — three rotations, unwound")
```

The build validates that referenced `/images/...` files actually exist and
warns you if one is missing.

### Everything else markdown

Full GitHub-flavored markdown is supported: tables, task lists
(`- [x] done`), blockquotes, ordered/unordered lists, strikethrough, links.
Links to other posts are just `/blog/<slug>` paths.

### Several posts in one file

A single `.md` file can hold multiple posts — each new frontmatter block
starts the next post, and the text between blocks belongs to the post above
it (this is how you can paste one big exported document):

```md
---
title: Post one
date: 2026-09-01
---
…content…

---
title: Post two
date: 2026-09-15
---
…content…
```

> Tip: avoid bare `---` horizontal rules inside posts; use frontmatter
> blocks only to separate posts (the compiler ignores `---` lines that don't
> parse as frontmatter).

---

## Tracks — numbered series

A **track** is a series you binge-read like a book — e.g. *"Rust from zero"* —
where every post carries its part number. Tracks are **fully author-controlled**:
you decide the index of every post, so a series can grow out of order and still
read in order.

### 1. Define a track

Create `content/tracks/<slug>.md`. The filename is the slug (`rust.md` →
`/tracks/rust`). Frontmatter plus optional markdown intro prose:

```yaml
---
title: "Rust from zero"
description: "A slow, honest walk into Rust — ownership first, syntax later."
color: "#ff5c1a"                      # optional accent for this track's badges
---

Optional intro prose in plain markdown — shown on the track page
before the part list.
```

### 2. File posts into it

Add two lines of frontmatter to any post:

```yaml
track: rust      # must match the track's slug
trackIndex: 1    # your chosen position — part 1, 2, 3, …
```

Or scaffold directly:

```bash
npm run new:post -- "Borrowing" --track rust --index 2
```

### 3. What the build checks

`npm run content:build` warns you about:

- `references unknown track "…"` — the post's `track:` doesn't match a file in `content/tracks/`
- `duplicates track rust #2` — two posts claim the same index (the later post loses it)
- `track "rust": missing part 3 (gap in numbering)` — a hole in your sequence
- `post(s) missing trackIndex` — a post joined the track without a number

Warnings never fail the build — un-indexed posts simply don't appear in the
track's part list until you number them.

### 4. What readers get

- **`/tracks`** — all series with part counts
- **`/tracks/<slug>`** — the binge view: intro, "Start at part 01", and parts
  listed in *your* order regardless of publish dates
- **Badges** — every tracked post shows `↳ Rust from zero · 01` on cards and
  article headers
- **Binge navigation** — inside each tracked post: "part 02 of 09", a square
  per part (solid = current, faded = read, outline = unread), and
  previous/next part links

---

## Reading progress — what readers see

Progress lives **only in the reader's browser** (`localStorage`) — no cookies,
no analytics, no server. Per post, the key `warmink:progress:<slug>` stores the
deepest scroll percentage and whether it's finished.

- **Scroll %** — a 3px orange hairline at the top of every article fills as you
  read, and the meta row shows `37% read`.
- **Auto-complete** — reaching 95% scroll marks the post read automatically.
  Readers can also **mark read / unread** by hand with a button in the meta row.
- **Read markers** — cards on the home and blog indexes show `read ✓`.
- **Track resume** — a track page shows `3 of 9 read` and its button becomes
  *"Continue with part 04"*, pointing at the first unread part.

Clearing site data in the browser resets everything; there is nothing to
configure.

---

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server at `localhost:5173` (compiles content first) |
| `npm run content:watch` | Recompile markdown on every save — run alongside `dev` |
| `npm run content:build` | Compile markdown once → `src/generated/content.ts`, `sitemap.xml`, `robots.txt` |
| `npm run new:post -- "Title"` | Scaffold `content/posts/title.md` (`--tags a,b`, `--track slug`, `--index n` optional) |
| `npm run build` | Content → Vite bundle → **prerender every route** → `dist/` |
| `npm run preview` | Serve `dist/` locally to check the production site |
| `npm run typecheck` | TypeScript check across app + scripts |

---

## Project structure

```
├── content/
│   ├── posts/                ← ✍️ your markdown lives here (source of truth)
│   └── tracks/               ← series definitions — one .md per track
├── public/
│   ├── fonts/                ← Recoleta / Caviar Dreams / Svetze (self-hosted)
│   ├── images/               ← post images, referenced as /images/...
│   ├── favicon.svg · og-default.svg
├── scripts/                  ← the build-time brain
│   ├── config.ts             ← ✏️ site name, domain, author, links — edit me
│   ├── build-content.ts      ← markdown → TypeScript compiler (CLI, tracks too)
│   ├── markdown.ts           ← marked + KaTeX + highlight.js pipeline
│   ├── prerender.tsx         ← renders every route to static HTML (SEO)
│   └── new-post.ts           ← post scaffolder (--track / --index)
├── src/
│   ├── generated/content.ts  ← 🤖 auto-generated post + track data — don't edit
│   ├── components/           ← Navbar, Footer, PostRow, TrackBadge, Reveal…
│   ├── pages/                ← Home, Blog, Post, Tracks, Track, About, NotFound
│   ├── lib/                  ← post API, reading progress (localStorage), helpers
│   └── styles/globals.css    ← design tokens, prose styles, motion
├── index.html                ← theme bootstrap + prerender markers
└── dist/                     ← build output (deploy this)
```

---

## How the pipeline works

```
content/*.md ──npm run content:build──▶ src/generated/content.ts  (typed posts + tracks, HTML pre-rendered)
                                       ├─▶ public/sitemap.xml
                                       └─▶ public/robots.txt
src/App.tsx ──vite build──▶ dist/ JS + CSS bundle (220 kB, 66 kB gzipped)
            ──prerender──▶ dist/index.html · dist/blog/<slug>/index.html · …
                           real HTML + per-route <title>/OG/JSON-LD
```

1. **Compile** — `scripts/build-content.ts` parses frontmatter, renders math
   (KaTeX), highlights code (highlight.js), wraps standalone images into
   figures, extracts a table of contents, and computes reading time — all at
   build time.
2. **Bundle** — Vite builds the React app. The browser never downloads
   marked/KaTeX/highlight.js; math is plain HTML + CSS.
3. **Prerender** — `scripts/prerender.tsx` renders every route with
   `react-dom/server` into real HTML files. The client then *hydrates* for
   SPA-fast navigation.

---

## SEO — what's generated for you

Everything below is produced automatically on `npm run content:build` +
`npm run build` — you never write meta tags by hand.

### Meta tags (per route, baked into static HTML)

- `<title>` — `"Post title — The Boring Edit"`
- `<meta name="description">` — your frontmatter `excerpt:` (auto-generated from the body if omitted)
- `<meta name="author">` + `rel=canonical` per page
- **Open Graph** (`og:title`, `og:description`, `og:url`, `og:type`, `og:image` + width/height/alt) and **Twitter card** tags
- `article:published_time`, `article:author`, `article:tag` on posts
- **RSS autodiscovery** — `<link rel="alternate" type="application/rss+xml">`
- On **client-side navigation** the SPA re-syncs title/description/canonical/OG (`src/lib/usePageTitle.ts`), so every virtual page-view presents correct metadata

### Social share images — generated per post

`public/og/<slug>.png` — a 1200×630 card per post (warm paper, dot grid, the
loud orange circle, your title, date, reading time, tags), rendered at build
time with `sharp` from an on-brand SVG template. The default card is
`og-default.png` (also auto-rendered from its SVG). Override per post with
`ogImage: /path.png` or `cover: /path.png` in frontmatter.

### RSS feed

`public/feed.xml` — RSS 2.0, latest 20 posts with categories, `pubDate`,
permalinks, and `<atom:link rel="self">`. Linked from every page's head for
feed autodiscovery.

### Structured data (JSON-LD)

- **Every route** — a `Person` node for you: name, website + `sameAs` linking
  your GitHub and LinkedIn (E-E-A-T author signals)
- **Posts** — full `BlogPosting` (author, publisher, wordCount, `timeRequired`
  = reading time, `inLanguage`, keywords) **plus** a `BreadcrumbList`
  (Home → Writing → Post)
- **Tracks** — `CollectionPage` with `hasPart` listing every part in order
- **Home** — `WebSite` entity

### Discovery files

- `sitemap.xml` — every route (home, /blog, /tracks, /about, each track, each
  post with `lastmod`)
- `robots.txt` — allows all, points at the sitemap
- Full article content readable with JavaScript disabled

### Optional frontmatter for SEO

```yaml
---
excerpt: "Your 160-character pitch — becomes meta description"  # else auto
ogImage: /images/my-card.png                                     # else auto-generated
description: "Track page meta description"                       # tracks/ only
---
```

---

## Customizing the site

- **Identity** — edit `scripts/config.ts`: `name`, `url` (your production
  domain — feeds canonical URLs, OG tags, sitemap), `author`, `authorLinks`
  (website/GitHub/LinkedIn), descriptions. The footer, About page, and
  JSON-LD all read from here.
- **Tracks** — add or edit files in `content/tracks/`; see the Tracks section
  above for the full workflow.
- **Colors & type** — every token lives in `src/styles/globals.css`
  (`--background`, `--primary`, fonts…). Light theme is the default; `.dark`
  overrides it. All ligatures are disabled site-wide.
- **Pages** — pages live in `src/pages/` and routes in `src/App.tsx`. If you
  add a new top-level page, also add it to the `routes` array in
  `scripts/prerender.tsx` so it gets static HTML + SEO tags.
- **Fonts** — swap files in `public/fonts/` (paths in `globals.css`).
- **Home page** — `src/pages/Home.tsx` shows the 3 latest posts and your
  tags automatically.

After editing content config, re-run `npm run content:build` (or just
`npm run build`).

---

## Deploying — write locally, upload static pages

The site is **fully frontend**. Nothing renders on a server; the host only
delivers files. Your workflow is exactly this loop:

1. **Write** — add a `.md` file to `content/posts/` (or `content/tracks/`).
2. **Compile** — `npm run build`. Your markdown is compiled into the site:
   → `src/generated/content.ts` (typed data the React app imports)
   → `dist/blog/<slug>/index.html` (a real static page per post, full SEO head)
   → updated `sitemap.xml` / `robots.txt`.
3. **Upload `dist/`** — that's the entire deploy artifact. **`content/` never
   goes to the host** — your markdown stays on your machine (keep it in git).
   From the host's point of view there is no CMS, no database, no server code:
   just HTML/CSS/JS files.

### What a host actually receives on each update

- **New post** → a new folder `dist/blog/<slug>/` with an `index.html` in it —
  literally *new pages added to the code*, nothing else touched.
- Plus one regenerated `dist/index.html` + `dist/blog/index.html` (the lists
  that now include the new post), an updated `sitemap.xml`, and a refreshed
  hashed JS bundle (`assets/index-*.js`) — the bundle embeds the compiled post
  data for SPA-fast navigation. HTML pages never change for old posts.
- Most hosts (Netlify, Vercel, Cloudflare Pages) diff the folder and transfer
  only changed files, so an update is a few kilobytes over the wire.

### Connecting a domain

Set `SITE.url` in `scripts/config.ts` to your real domain **before** building —
it feeds canonical URLs, OG tags, and the sitemap.

Host-specific notes:

- **Netlify / Vercel / Cloudflare Pages** — build command `npm run build`,
  publish directory `dist`. Pretty URLs work out of the box. (You can also
  connect git instead of uploading — same result.)
- **GitHub Pages** — `dist/404.html` (already generated) is your 404 fallback.
- **S3 / nginx / plain FTP hosting** — serve `dist/` and fall back to
  `404.html` for unknown paths. Nested `blog/<slug>/index.html` files give
  clean extension-free URLs.

---

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| New post doesn't show in dev | Run `npm run content:build` (or keep `content:watch` running) — posts are compiled, not scanned live |
| `⚠ … references missing image` | The file doesn't exist under `public/` — check the path |
| `duplicate slug "…"` | Two posts resolve to the same slug; rename a file or set `slug:` in frontmatter |
| `⚠ references unknown track` | The post's `track:` doesn't match a file in `content/tracks/` — check the slug |
| `⚠ duplicates track … #n` | Two posts claim the same `trackIndex` — renumber one of them |
| `⚠ missing part n (gap)` | A hole in the track's numbering — fill it or renumber |
| `⚠ post(s) missing trackIndex` | A post has `track:` but no `trackIndex:` — add the number |
| Math shows as raw `$…$` | Delimiters need to hug the TeX (`$x$`, not `$ x$`); escaped `\$` is shown literally |
| Weird fonts | Check `public/fonts/` filenames match the `@font-face` paths in `globals.css` |
| Type errors in generated file | Run `npm run content:build` first — `src/generated/content.ts` must exist |

---

*Set in Recoleta, Caviar Dreams & Svetze · one loud orange · no trackers.*
