import type { Post } from "./types";
import { posts } from "./posts";

/* ---------------------------------------------------------------------------
 * Client-side search over posts (and their tracks as secondary hits).
 * All content already ships in the JS bundle for SPA navigation, so search
 * costs nothing extra to load — it just indexes what's there.
 * ------------------------------------------------------------------------- */

interface SearchDoc {
  post: Post;
  /** lowercase haystacks, weighted strongest → weakest */
  title: string;
  tags: string;
  track: string;
  excerpt: string;
  body: string;
}

/**
 * Strip HTML → text once per session (19 posts ≈ trivial; rebuilds only when
 * the module reloads, i.e. on deploy).
 */
function buildDocs(allPosts: Post[]): SearchDoc[] {
  return allPosts.map((post) => {
    const div = document.createElement("div");
    div.innerHTML = post.contentHtml;
    const body = (div.textContent ?? "").replace(/\s+/g, " ").trim().toLowerCase();
    return {
      post,
      title: post.title.toLowerCase(),
      tags: post.tags.join(" ").toLowerCase(),
      track: (post.track ?? "").toLowerCase(),
      excerpt: post.excerpt.toLowerCase(),
      body,
    };
  });
}

let docsCache: SearchDoc[] | null = null;
function docs(): SearchDoc[] {
  // Lazy + browser-only: prerender never touches search.
  docsCache ??= buildDocs(posts);
  return docsCache;
}

export interface SearchHit {
  post: Post;
  /** Rough relevance 0..~16, for ranking only (never shown). */
  score: number;
}

const emptyHits: SearchHit[] = [];

/**
 * Search posts. All terms must match somewhere (AND); a post scores per-term
 * as: title match 8 (6 more if the term starts the title), tag 4, track 4,
 * excerpt 2, body 1. Summed; results sorted by score, then newest first.
 */
export function searchPosts(query: string): SearchHit[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return emptyHits;

  const hits: SearchHit[] = [];
  for (const doc of docs()) {
    let score = 0;
    let all = true;
    for (const term of terms) {
      let s = 0;
      if (doc.title.includes(term)) s += 8 + (doc.title.startsWith(term) ? 6 : 0);
      if (doc.tags.includes(term)) s += 4;
      if (doc.track.includes(term)) s += 4;
      if (doc.excerpt.includes(term)) s += 2;
      if (doc.body.includes(term)) s += 1;
      if (s === 0) {
        all = false;
        break;
      }
      score += s;
    }
    if (all) hits.push({ post: doc.post, score });
  }

  return hits
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, 12);
}

/** Track titles/slug words worth suggesting when a query names a series. */
export function suggestTracks(query: string): { slug: string; title: string }[] {
  const q = query.toLowerCase().trim();
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const out: { slug: string; title: string }[] = [];
  for (const doc of docs()) {
    const t = doc.post.track;
    if (!t || seen.has(t)) continue;
    seen.add(t);
    if (t.includes(q)) out.push({ slug: t, title: t });
  }
  return out.slice(0, 2);
}

/** The one-liner under each result: date · minutes · first matching context. */
export function snippetFor(post: Post, query: string): string {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const doc = docs().find((d) => d.post.slug === post.slug);
  if (!doc) return post.excerpt;
  for (const term of terms) {
    const at = doc.body.indexOf(term);
    if (at > -1) {
      const start = Math.max(0, at - 30);
      const raw = (start > 0 ? "…" : "") + doc.body.slice(start, at + term.length + 60) + "…";
      return raw;
    }
  }
  return post.excerpt;
}
