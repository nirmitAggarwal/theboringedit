/**
 * A track is a curated series — e.g. "Rust from zero" — that posts can be
 * filed under. Parts are numbered explicitly by the author (`trackIndex`),
 * so a track reads as one continuous story.
 */
export interface Track {
  slug: string;
  title: string;
  /** Short plain-text description (meta tags, cards) */
  description?: string;
  /** Track intro prose, markdown pre-rendered to HTML at build time */
  descriptionHtml?: string;
  /** Optional accent hue override, e.g. "#ff5c1a" */
  color?: string;
}

export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/** One blog post, fully resolved by `npm run content:build`. */
export interface Post {
  slug: string;
  title: string;
  subtitle?: string;
  /** ISO date "YYYY-MM-DD" */
  date: string;
  tags: string[];
  readingMinutes: number;
 /** Body word count (feeds JSON-LD wordCount + timeRequired) */
  wordCount: number;
  /** Short description used on cards + <meta name="description"> */
  excerpt: string;
  /** Optional cover image path (from frontmatter) */
  cover?: string;
  /** Optional social-share image override (from frontmatter `ogImage:`) */
  ogImage?: string;
  /** Markdown pre-rendered to HTML at build time (math, code, figures) */
  contentHtml: string;
  /** h2/h3 outline for the article sidebar */
  toc: TocEntry[];
  /** Track slug this post belongs to (from frontmatter `track:`) */
  track?: string;
  /** 1-based position inside the track (from frontmatter `trackIndex:`) */
  trackIndex?: number;
}
