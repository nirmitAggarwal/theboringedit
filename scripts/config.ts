/**
 * Site configuration — used by the content compiler (sitemap, SEO head tags,
 * prerender). Set `url` to your real production domain before deploying.
 */
export const SITE = {
  /** Display name of the site */
  name: "The Boring Edit",
  /** Production origin, no trailing slash — used for canonical/OG/sitemap */
  url: "https://www.theboringedit.in",
  /** Default <title> for the home page */
  title: "The Boring Edit — a personal blog",
  /** Default meta description (home page) */
  description:
    "A quiet, personal, editorial blog by Nirmit Aggarwal — warm paper, ink text, one loud orange. Written in markdown, compiled to static ink.",
  /** Blog index description */
  blogDescription:
    "Notes on code, math, and making things — written in markdown, compiled to ink.",
  /** Author name for bylines and JSON-LD */
  author: "Nirmit Aggarwal",
  language: "en",
  /** Author presence around the web */
  authorLinks: {
    github: "https://github.com/nirmitAggarwal",
    website: "https://www.theboringedit.in/",
    linkedin: "https://www.linkedin.com/in/nirmit-aggarwal/",
  },
} as const;
