/**
 * Static prerender — runs after `vite build`.
 *
 * Renders each route with react-dom/server (StaticRouter) and writes real
 * HTML files into dist/, so crawlers and no-JS visitors get full content:
 *
 *   dist/index.html              home
 *   dist/blog/index.html         writing index
 *   dist/about/index.html
 *   dist/blog/<slug>/index.html  one per post (full SEO head + JSON-LD)
 *   dist/404.html                SPA fallback / not-found page
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";

import App from "../src/App";
import { posts, tracks, getTrackPosts } from "../src/lib/posts";
import { SITE } from "./config";
import type { Post, Track } from "../src/lib/types";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const distDir = path.join(root, "dist");

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

interface RouteSpec {
  path: string;
  file: string;
  title: string;
  description: string;
  post?: Post;
  track?: Track;
  noindex?: boolean;
}

/** Author entity reused across every route's JSON-LD (E-E-A-T signals). */
const personLd = {
  "@type": "Person",
  name: SITE.author,
  url: SITE.authorLinks.website,
  sameAs: [
    SITE.authorLinks.website,
    SITE.authorLinks.github,
    SITE.authorLinks.linkedin,
  ],
};

function headTags(r: RouteSpec): string {
  const url = SITE.url + r.path;
  const image =
    SITE.url +
    (r.post ? (r.post.ogImage ?? r.post.cover ?? `/og/${r.post.slug}.png`) : "/og-default.png");
  const imageAlt = r.post?.title ?? SITE.name;
  const tags: string[] = [
    `<title>${esc(r.title)}</title>`,
    `<meta name="description" content="${esc(r.description)}" />`,
    `<meta name="author" content="${esc(SITE.author)}" />`,
    `<link rel="canonical" href="${url}" />`,
    `<link rel="alternate" type="application/rss+xml" title="${esc(SITE.name)}" href="${SITE.url}/feed.xml" />`,
    `<meta property="og:site_name" content="${esc(SITE.name)}" />`,
    `<meta property="og:title" content="${esc(r.title)}" />`,
    `<meta property="og:description" content="${esc(r.description)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${r.post ? "article" : "website"}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(r.title)}" />`,
    `<meta name="twitter:description" content="${esc(r.description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
    `<script type="application/ld+json">${JSON.stringify(personLd)}</script>`,
  ];

  if (r.noindex) {
    tags.push(`<meta name="robots" content="noindex" />`);
  }

  if (r.post) {
    tags.push(
      `<meta property="article:published_time" content="${r.post.date}" />`,
      `<meta property="article:author" content="${esc(SITE.authorLinks.website)}" />`,
      ...r.post.tags.map((t) => `<meta property="article:tag" content="${esc(t)}" />`),
      `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: r.post.title,
        description: r.post.excerpt,
        datePublished: r.post.date,
        author: personLd,
        publisher: { "@type": "Person", name: SITE.author, url: SITE.authorLinks.website },
        image,
        mainEntityOfPage: url,
        keywords: r.post.tags.join(", "),
        wordCount: r.post.wordCount,
        timeRequired: `PT${r.post.readingMinutes}M`,
        inLanguage: SITE.language,
      })}</script>`,
      `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url + "/" },
          { "@type": "ListItem", position: 2, name: "Writing", item: SITE.url + "/blog" },
          { "@type": "ListItem", position: 3, name: r.post.title, item: url },
        ],
      })}</script>`
    );
  } else if (r.track) {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: r.track.title,
        description: r.track.description,
        author: personLd,
        image: `${SITE.url}/og-default.png`,
        hasPart: getTrackPosts(r.track.slug).map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          datePublished: p.date,
          url: `${SITE.url}/blog/${p.slug}`,
          position: p.trackIndex,
        })),
      })}</script>`
    );
  } else if (r.path === "/") {
    tags.push(
      `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: SITE.name,
        url: SITE.url + "/",
        description: SITE.description,
        author: personLd,
      })}</script>`
    );
  }

  return tags.join("\n    ");
}

const routes: RouteSpec[] = [
  {
    path: "/",
    file: "index.html",
    title: SITE.title,
    description: SITE.description,
  },
  {
    path: "/blog",
    file: "blog/index.html",
    title: `Writing — ${SITE.name}`,
    description: SITE.blogDescription,
  },
  {
    path: "/tracks",
    file: "tracks/index.html",
    title: `Tracks — ${SITE.name}`,
    description:
      "Numbered series you can read start to finish — every part carries its index, so you always know where you are.",
  },
  ...tracks.map((t) => ({
    path: `/tracks/${t.slug}`,
    file: path.join("tracks", t.slug, "index.html"),
    title: `${t.title} — ${SITE.name}`,
    description: t.description ?? SITE.blogDescription,
    track: t,
  })),
  {
    path: "/about",
    file: "about/index.html",
    title: `About — ${SITE.name}`,
    description: `Who writes ${SITE.name} and why it looks the way it does.`,
  },
  ...posts.map((p) => ({
    path: `/blog/${p.slug}`,
    file: path.join("blog", p.slug, "index.html"),
    title: `${p.title} — ${SITE.name}`,
    description: p.excerpt,
    post: p,
  })),
  {
    path: "/404-not-found",
    file: "404.html",
    title: `Not found — ${SITE.name}`,
    description: "This page slipped out of the margins.",
    noindex: true,
  },
];

let written = 0;
for (const r of routes) {
  const appHtml = renderToString(
    <StaticRouter location={r.path}>
      <App />
    </StaticRouter>
  );

  const html = template
    .replace(/<title>[\s\S]*?<\/title>/, "") // headTags() writes the title
    .replace("<!--head-meta-->", `    ${headTags(r)}`)
    .replace("<!--app-html-->", appHtml);

  const out = path.join(distDir, r.file);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, "utf8");
  written++;
}

console.log(`✓ prerendered ${written} routes → dist/`);
