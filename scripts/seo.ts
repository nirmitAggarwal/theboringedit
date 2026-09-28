/**
 * SEO artifacts — emitted by `npm run content:build`.
 *
 *   public/feed.xml        RSS 2.0 feed of the latest 20 posts
 *   public/og/<slug>.png   1200×630 social share card per post (sharp)
 *   public/og-default.png  PNG fallback for pages without a post card
 *
 * The card design mirrors the site: warm paper, dot grid, one loud orange
 * circle, editorial serif title, mono metadata. Posts can override the
 * auto-generated image with `ogImage:` (or `cover:`) in frontmatter.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SITE } from "./config";
import type { Post, Track } from "../src/lib/types";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicDir = path.join(root, "public");
const ogDir = path.join(publicDir, "og");

/* ------------------------------------------------------------------------- */
/* XML helpers                                                                */
/* ------------------------------------------------------------------------- */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC-822 date for RSS; noon UTC so timezones never push a post a day back. */
function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toUTCString();
}

/* ------------------------------------------------------------------------- */
/* RSS feed                                                                   */
/* ------------------------------------------------------------------------- */

function emitRssFeed(posts: Post[]): void {
  const latest = posts.slice(0, 20);
  const items = latest
    .map(
      (p) => `    <item>
      <title>${esc(p.title)}</title>
      <link>${SITE.url}/blog/${p.slug}</link>
      <guid isPermaLink="true">${SITE.url}/blog/${p.slug}</guid>
      <pubDate>${rfc822(p.date)}</pubDate>
      <description>${esc(p.excerpt)}</description>
      ${p.tags.map((t) => `<category>${esc(t)}</category>`).join("\n      ")}
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE.name)}</title>
    <link>${SITE.url}</link>
    <description>${esc(SITE.description)}</description>
    <language>${SITE.language}</language>
    <lastBuildDate>${rfc822(latest[0]?.date ?? new Date().toISOString().slice(0, 10))}</lastBuildDate>
    <generator>The Boring Edit static pipeline</generator>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  fs.writeFileSync(path.join(publicDir, "feed.xml"), xml, "utf8");
}

/* ------------------------------------------------------------------------- */
/* OG share images                                                            */
/* ------------------------------------------------------------------------- */

function xmlTitle(s: string): string {
  return esc(s);
}

/** Greedy word wrap tuned for Georgia 66px inside the safe area. */
function wrapTitle(title: string, maxChars = 26, maxLines = 3): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines) {
    const consumed = lines.join(" ").length;
    if (consumed < title.length) {
      lines[maxLines - 1] = lines[maxLines - 1].replace(/\s*\S*$/, "…");
    }
  }
  return lines;
}

function cardSvg(title: string, meta: string, tags: string[]): string {
  const lines = wrapTitle(title);
  const startY = lines.length > 2 ? 240 : 280;
  const titleSvg = lines
    .map((l, i) => `<text x="80" y="${startY + i * 78}" font-family="Georgia, 'Times New Roman', serif" font-size="66" fill="#262626">${xmlTitle(l)}</text>`)
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${xmlTitle(title)}">
  <defs>
    <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="1.2" cy="1.2" r="1.2" fill="#262626" opacity="0.12"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="#f8f5ef"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <circle cx="1020" cy="480" r="92" fill="#fd4d25"/>
  <circle cx="1020" cy="480" r="128" fill="none" stroke="#262626" stroke-opacity="0.45" stroke-width="2"/>
  <text x="80" y="118" font-family="Menlo, Consolas, monospace" font-size="22" letter-spacing="6" fill="#777777">// ${xmlTitle(SITE.name.toUpperCase())}</text>
  ${titleSvg}
  <line x1="80" y1="548" x2="860" y2="548" stroke="#d6d2cb" stroke-width="2"/>
  <text x="80" y="588" font-family="Menlo, Consolas, monospace" font-size="20" fill="#777777">${xmlTitle(meta)}</text>
  <text x="1120" y="588" text-anchor="end" font-family="Menlo, Consolas, monospace" font-size="20" fill="#fd4d25">${xmlTitle(tags.map((t) => `#${t}`).join("  "))}</text>
</svg>
`;
}

async function renderPng(svg: string, out: string): Promise<void> {
  const { default: sharp } = await import("sharp");
  await sharp(Buffer.from(svg), { density: 96 }).png().toFile(out);
}

/**
 * Generate one OG card per post plus a PNG of og-default.svg. Never throws —
 * if sharp's native binary is unavailable we warn and let posts fall back to
 * the default OG image so the build still succeeds.
 */
export async function emitSeoArtifacts(posts: Post[], _tracks: Track[]): Promise<void> {
  try {
    emitRssFeed(posts);
    fs.mkdirSync(ogDir, { recursive: true });

    for (const p of posts) {
      const meta = `${p.date} · ${p.readingMinutes} min read`;
      const tags = p.tags.slice(0, 2);
      await renderPng(cardSvg(p.title, meta, tags), path.join(ogDir, `${p.slug}.png`));
    }

    // PNG fallback matching the SVG default (most scrapers prefer raster)
    const defSvg = fs.readFileSync(path.join(publicDir, "og-default.svg"), "utf8");
    await renderPng(defSvg, path.join(publicDir, "og-default.png"));

    console.log(`✓ og cards → public/og/ (${posts.length} post${posts.length === 1 ? "" : "s"}) · feed.xml`);
  } catch (err) {
    console.warn(`  ⚠ og image generation skipped (${(err as Error).message}) — posts fall back to og-default`);
  }
}
