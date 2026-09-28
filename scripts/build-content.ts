/**
 * Content compiler.
 *
 *   npm run content:build            scan + compile once
 *   npm run content:build -- --watch scan + compile on every change
 *
 * Scans every markdown file under content/ (nested folders included). One
 * file = one post, or several posts in one file separated by consecutive
 * frontmatter blocks:
 *
 *   ---
 *   title: Post one
 *   date: 2026-09-01
 *   ---
 *   …content…
 *
 *   ---
 *   title: Post two
 *   date: 2026-09-15
 *   ---
 *   …content…
 *
 * Tracks: content/tracks/<slug>.md — a frontmatter block (title, description,
 * color) plus optional markdown intro prose. Posts join a track via frontmatter
 * `track: <slug>` + `trackIndex: <n>`; indexes are author-assigned and
 * validated at build time (duplicates / gaps / unknown slugs are warnings).
 *
 * Emits:
 *   src/generated/content.ts   typed post + track data (HTML pre-rendered)
 *   public/sitemap.xml         one URL per route
 *   public/robots.txt
 *   public/feed.xml            RSS feed (scripts/seo.ts)
 *   public/og/<slug>.png       social share card per post (scripts/seo.ts)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseFrontmatter } from "../src/lib/frontmatter";
import { slugify } from "../src/lib/slug";
import { buildExcerpt, extractToc, renderPost } from "./markdown";
import { SITE } from "./config";
import { emitSeoArtifacts } from "./seo";
import type { Post, Track } from "../src/lib/types";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const contentDir = path.join(root, "content");
const tracksDir = path.join(contentDir, "tracks");
const generatedDir = path.join(root, "src", "generated");
const publicDir = path.join(root, "public");

/* ------------------------------------------------------------------------- */
/* Scanning                                                                   */
/* ------------------------------------------------------------------------- */

const within = (file: string, dir: string) =>
  file === dir || file.startsWith(dir + path.sep);

function listMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return (fs.readdirSync(dir, { recursive: true }) as string[])
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(dir, f))
    .filter((f) => !within(f, tracksDir))
    .sort();
}

/**
 * Split one file into posts. Everything after a frontmatter block belongs to
 * that post, until the next frontmatter block. A `---` that doesn't parse as
 * frontmatter with a title (e.g. a horizontal rule) is left as prose.
 */
function splitMultiPost(raw: string): { data: Record<string, string>; body: string }[] {
  const out: { data: Record<string, string>; body: string }[] = [];
  const re = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n?/gm;
  let lastEnd = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(raw))) {
    const parsed = parseFrontmatter(m[0]);
    if (!parsed.data.title) continue; // false positive (thematic break etc.)
    const current = { data: parsed.data, body: "" };
    if (out.length > 0) {
      out[out.length - 1].body += raw.slice(lastEnd, m.index);
    }
    out.push(current);
    lastEnd = re.lastIndex;
  }
  if (out.length > 0 && lastEnd < raw.length) {
    out[out.length - 1].body += raw.slice(lastEnd);
  }
  return out;
}

/* ------------------------------------------------------------------------- */
/* Tracks                                                                     */
/* ------------------------------------------------------------------------- */

/** Internal bookkeeping for one track while compiling. */
interface TrackDef {
  track: Track;
  /** Slugs of posts that declared this track but have no trackIndex yet */
  unindexed: string[];
  /** Posts with a validated trackIndex, unsorted */
  postsWithIndex: Post[];
  /** Index → post that currently holds it (duplicate detection) */
  duplicateOfIndex: Map<number, Post>;
}

let warnings = 0;
const warn = (msg: string) => {
  warnings++;
  console.warn(`  ⚠ ${msg}`);
};

/** Load every content/tracks/*.md into Track objects (markdown → HTML). */
function loadTracks(): Map<string, TrackDef> {
  const map = new Map<string, TrackDef>();
  if (!fs.existsSync(tracksDir)) return map;

  const files = (fs.readdirSync(tracksDir, { recursive: true }) as string[])
    .filter((f) => f.endsWith(".md"))
    .map((f) => path.join(tracksDir, f))
    .sort();

  for (const file of files) {
    const rel = path.relative(contentDir, file);
    const { data, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
    const rawSlug = path.basename(file).replace(/\.md$/, "");
    const slug = data.slug ? slugify(data.slug) : slugify(rawSlug);
    if (!slug) {
      warn(`${rel}: track file has no usable slug — skipped`);
      continue;
    }
    if (!data.title) {
      warn(`${rel}: track has no title — skipped`);
      continue;
    }
    if (map.has(slug)) {
      warn(`${rel}: duplicate track slug "${slug}" — skipped`);
      continue;
    }
    map.set(slug, {
      track: {
        slug,
        title: data.title,
        description: data.description || undefined,
        descriptionHtml: body.trim() ? renderPost(body) : undefined,
        color: data.color || undefined,
      },
      unindexed: [],
      postsWithIndex: [],
      duplicateOfIndex: new Map(),
    });
  }
  return map;
}

/* ------------------------------------------------------------------------- */
/* Compilation                                                                */
/* ------------------------------------------------------------------------- */

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function compileAll(): { posts: Post[]; tracks: Map<string, TrackDef> } {
  warnings = 0;
  const tracks = loadTracks();
  const files = listMarkdownFiles(contentDir);
  if (files.length === 0) {
    console.log("No markdown found in content/ — run `npm run new:post -- \"My title\"` to start.");
    return { posts: [], tracks };
  }

  const posts: Post[] = [];
  const slugs = new Set<string>();

  for (const file of files) {
    const rel = path.relative(contentDir, file);
    const raw = fs.readFileSync(file, "utf8");
    const chunks = splitMultiPost(raw);
    if (chunks.length === 0) {
      warn(`${rel}: no frontmatter block found — skipped`);
      continue;
    }

    for (const { data, body } of chunks) {
      const slug = data.slug ? slugify(data.slug) : slugify(data.title);
      if (!slug) {
        warn(`${rel}: post has no title/slug — skipped`);
        continue;
      }
      if (slugs.has(slug)) {
        warn(`${rel}: duplicate slug "${slug}" — skipped`);
        continue;
      }
      slugs.add(slug);

      const date = /^\d{4}-\d{2}-\d{2}$/.test(data.date ?? "") ? data.date : today();
      if (data.date && date === today() && data.date !== today()) {
        warn(`${rel}: bad date "${data.date}" (want YYYY-MM-DD) — using today`);
      }

      const tags = (data.tags ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      // Track membership — author assigns slug + explicit 1-based index.
      const trackSlugRaw = (data.track ?? "").trim();
      const trackSlug = trackSlugRaw ? slugify(trackSlugRaw) : "";
      if (trackSlugRaw && !trackSlug) {
        warn(`${rel}: track "${trackSlugRaw}" has no usable slug — ignored`);
      }
      const indexRaw = (data.trackIndex ?? "").trim();
      let trackIndex: number | undefined;
      if (indexRaw) {
        const n = Number(indexRaw);
        if (!Number.isInteger(n) || n < 1) {
          warn(`${rel}: bad trackIndex "${indexRaw}" (want integer ≥ 1) — ignored`);
        } else if (!trackSlug) {
          warn(`${rel}: trackIndex without track — ignored`);
        } else {
          trackIndex = n;
        }
      }

      const wordCount = body.split(/\s+/).filter(Boolean).length;

      posts.push({
        slug,
        title: data.title,
        subtitle: data.subtitle || undefined,
        date,
        tags,
        readingMinutes: Math.max(1, Math.round(wordCount / 220)),
        wordCount,
        excerpt: data.excerpt || buildExcerpt(body),
        cover: data.cover || undefined,
        ogImage: data.ogImage || undefined,
        contentHtml: renderPost(body),
        toc: extractToc(body),
        track: trackSlug || undefined,
        trackIndex,
      });
    }
  }

  posts.sort((a, b) => b.date.localeCompare(a.date));

  // Track integrity: unknown slugs, duplicate / missing / gapped indexes.
  for (const p of posts) {
    if (!p.track) continue;
    if (!tracks.has(p.track)) {
      warn(`"${p.slug}" references unknown track "${p.track}" — ignoring membership`);
      p.track = undefined;
      p.trackIndex = undefined;
      continue;
    }
    if (p.trackIndex) {
      const def = tracks.get(p.track)!;
      const dup = def.duplicateOfIndex.get(p.trackIndex);
      if (dup) {
        warn(
          `"${p.slug}" duplicates track ${p.track} #${p.trackIndex} (also held by "${dup.slug}") — ignoring index`
        );
        p.trackIndex = undefined;
        def.unindexed.push(p.slug);
      } else {
        def.duplicateOfIndex.set(p.trackIndex, p);
        def.postsWithIndex.push(p);
      }
    } else {
      tracks.get(p.track)!.unindexed.push(p.slug);
    }
  }
  for (const [slug, def] of tracks) {
    def.postsWithIndex.sort((a, b) => a.trackIndex! - b.trackIndex!);
    if (def.postsWithIndex.length > 0) {
      const max = def.postsWithIndex[def.postsWithIndex.length - 1].trackIndex!;
      const present = new Set(def.postsWithIndex.map((p) => p.trackIndex!));
      for (let n = 1; n <= max; n++) {
        if (!present.has(n)) warn(`track "${slug}": missing part ${n} (gap in numbering)`);
      }
    }
    if (def.unindexed.length > 0) {
      warn(
        `track "${slug}": ${def.unindexed.length} post(s) missing trackIndex: ${def.unindexed.join(", ")}`
      );
    }
  }

  // Image sanity check: local /images/... references should exist in public/
  for (const p of posts) {
    const refs = [...p.contentHtml.matchAll(/src="(\/[^"]+)"/g)].map((m) => m[1]);
    for (const ref of refs) {
      if (!fs.existsSync(path.join(publicDir, ref))) {
        warn(`"${p.slug}" references missing image ${ref}`);
      }
    }
  }

  return { posts, tracks };
}

/* ------------------------------------------------------------------------- */
/* Emitters                                                                   */
/* ------------------------------------------------------------------------- */

function emitContentTs(posts: Post[], tracks: Track[]): void {
  fs.mkdirSync(generatedDir, { recursive: true });
  const header =
    `// AUTO-GENERATED by \`npm run content:build\` — do not edit by hand.\n` +
    `// Source of truth: content/**/*.md · generated ${new Date().toISOString()}\n\n` +
    `import type { Post, Track } from "../lib/types";\n\n` +
    `export const generatedPosts: Post[] = ${JSON.stringify(posts, null, 2)};\n\n` +
    `export const generatedTracks: Track[] = ${JSON.stringify(tracks, null, 2)};\n`;
  fs.writeFileSync(path.join(generatedDir, "content.ts"), header, "utf8");
}

function emitSitemap(posts: Post[], tracks: Track[]): void {
  const urls: { loc: string; lastmod?: string }[] = [
    { loc: "/" },
    { loc: "/blog" },
    { loc: "/tracks" },
    { loc: "/about" },
    ...tracks.map((t) => ({ loc: `/tracks/${t.slug}` })),
    ...posts.map((p) => ({ loc: `/blog/${p.slug}`, lastmod: p.date })),
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls
      .map(
        (u) =>
          `  <url><loc>${SITE.url}${u.loc}</loc>${
            u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ""
          }</url>`
      )
      .join("\n") +
    `\n</urlset>\n`;
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");
}

function emitRobots(): void {
  const txt = `User-agent: *\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`;
  fs.writeFileSync(path.join(publicDir, "robots.txt"), txt, "utf8");
}

/* ------------------------------------------------------------------------- */
/* Main                                                                       */
/* ------------------------------------------------------------------------- */

async function run(): Promise<{ posts: Post[]; tracks: Track[] }> {
  const t0 = performance.now();
  const { posts, tracks: trackDefs } = compileAll();
  const tracks = [...trackDefs.values()].map((d) => d.track);
  emitContentTs(posts, tracks);
  emitSitemap(posts, tracks);
  emitRobots();
  await emitSeoArtifacts(posts, tracks);
  const ms = (performance.now() - t0).toFixed(0);
  console.log(
    `✓ ${posts.length} post${posts.length === 1 ? "" : "s"} · ${tracks.length} track${
      tracks.length === 1 ? "" : "s"
    } → src/generated/content.ts · sitemap.xml · robots.txt · feed.xml (${ms}ms)`
  );
  if (warnings > 0) console.warn(`  ${warnings} warning${warnings === 1 ? "" : "s"} — see above`);
  return { posts, tracks };
}

const watch = process.argv.includes("--watch");
const { posts } = await run();

if (watch) {
  console.log(`Watching content/ for changes… (Ctrl+C to stop)`);
  let timer: NodeJS.Timeout | undefined;
  fs.watch(contentDir, { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      console.log("— content changed —");
      void run();
    }, 250);
  });
} else if (posts.length === 0) {
  process.exitCode = 0; // fresh clone with no posts yet — not an error
}
