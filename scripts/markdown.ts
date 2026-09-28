import { marked } from "marked";
import hljs from "highlight.js";
import katex from "katex";
import { slugify } from "../src/lib/slug";
import type { TocEntry } from "../src/lib/types";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ---------------------------------------------------------------------------
 * Code fence metadata — ```ts title="fib.ts" caption="optional caption"
 * ------------------------------------------------------------------------- */
export function parseCodeMeta(info: string): {
  lang: string;
  title?: string;
  caption?: string;
} {
  const lang = (info.trim().split(/\s+/)[0] ?? "").toLowerCase();
  const title = /title="([^"]*)"/.exec(info)?.[1];
  const caption = /caption="([^"]*)"/.exec(info)?.[1];
  return { lang, title, caption };
}

/* ---------------------------------------------------------------------------
 * Protect code from the math pass (so $ inside code is never TeX'd)
 * ------------------------------------------------------------------------- */
function protectCode(markdown: string): { text: string; restore: (s: string) => string } {
  const vault: string[] = [];
  const stash = (code: string) => `\u0000C${vault.push(code) - 1}\u0000`;

  let text = markdown.replace(/```[\s\S]*?```/g, (m) => stash(m));
  text = text.replace(/`[^`\n]+`/g, (m) => stash(m));

  return {
    text,
    restore: (s) => s.replace(/\u0000C(\d+)\u0000/g, (_, i) => vault[Number(i)]),
  };
}

/* ---------------------------------------------------------------------------
 * Math — server-rendered with KaTeX so no JS ships to the browser.
 *   $$…$$  and  \[…\]   → display math
 *   $…$    and  \(…\)   → inline math
 * Escaped dollars (\$) are left alone. Inline spans may not cross lines.
 * ------------------------------------------------------------------------- */
function renderMath(html: string): string {
  const tex = (src: string, display: boolean) =>
    katex.renderToString(src, { displayMode: display, throwOnError: false, strict: false });

  let out = html
    .replace(/(?<!\\)\$\$([\s\S]+?)(?<!\\)\$\$/g, (_, eq) => `<div class="math-block">${tex(eq, true)}</div>\n\n`)
    .replace(/(?<!\\)\\\[([\s\S]+?)\\\]/g, (_, eq) => `<div class="math-block">${tex(eq, true)}</div>\n\n`);

  out = out
    .replace(/(?<!\\)\$(?!\s)((?:\\.|[^$\n])+?)(?<!\s)(?<!\\)\$/g, (_, eq) => tex(eq, false))
    .replace(/(?<!\\)\\\(([\s\S]+?)\\\)/g, (_, eq) => tex(eq, false));

  return out;
}

/* ---------------------------------------------------------------------------
 * Standalone-image lines become <figure> with an optional caption.
 *   ![alt](src)                 → figure
 *   ![alt](src "Caption")       → figure + caption
 *   ![alt](src "full Caption")  → full-bleed figure + caption
 * ------------------------------------------------------------------------- */
function preprocessFigures(markdown: string): string {
  const re = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)\s*$/gm;
  return markdown.replace(re, (_m, alt: string, src: string, title?: string) => {
    const full = typeof title === "string" && title.startsWith("full ");
    const caption = (full ? title.slice(5) : (title ?? "")).trim();
    return [
      `<figure class="${full ? "post-figure--full" : "post-figure"}">`,
      `  <img src="${src}" alt="${alt}" loading="lazy" decoding="async" />`,
      caption ? `  <figcaption>${escapeHtml(caption)}</figcaption>` : "",
      `</figure>`,
    ]
      .filter(Boolean)
      // Blank line after the HTML block is required: a raw HTML block only
      // ends at a blank line, so without it the next markdown construct
      // (e.g. a `##` heading) is swallowed as raw text.
      .join("\n") + "\n\n";
  });
}

/* ---------------------------------------------------------------------------
 * marked renderer overrides
 * ------------------------------------------------------------------------- */
const renderer = {
  /** Fenced code → GitHub-dark card with a label bar + optional caption */
  code(code: string, infostring: string | undefined): string {
    const { lang, title, caption } = parseCodeMeta(infostring ?? "");
    let body: string;
    if (lang && hljs.getLanguage(lang)) {
      try {
        body = hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
      } catch {
        body = escapeHtml(code);
      }
    } else {
      body = escapeHtml(code);
    }
    const label = title ?? lang ?? "text";
    return (
      `<figure class="code-panel">` +
      `<div class="code-panel-bar">` +
      `<span class="code-panel-lang">${escapeHtml(label)}</span>` +
      `<button type="button" class="code-panel-copy" data-code-copy>copy</button>` +
      `</div>` +
      `<pre><code class="hljs${lang ? ` language-${lang}` : ""}">${body}</code></pre>` +
      (caption ? `<figcaption class="code-caption">${escapeHtml(caption)}</figcaption>` : "") +
      `</figure>\n`
    );
  },

  /** Headings carry slug ids so the TOC can deep-link */
  heading(text: string, level: number, raw: string): string {
    return `<h${level} id="${slugify(raw)}">${text}</h${level}>\n`;
  },
};

marked.use({ renderer, gfm: true, breaks: false });

/** Markdown → final HTML (math + code already resolved). */
export function renderPost(markdown: string): string {
  const { text, restore } = protectCode(markdown);
  const withFigures = preprocessFigures(text);
  const withMath = renderMath(withFigures);
  return marked.parse(restore(withMath), { async: false }) as string;
}

/** h2/h3 outline for the article TOC. */
export function extractToc(markdown: string): TocEntry[] {
  const toc: TocEntry[] = [];
  const re = /^(#{2,3})\s+(.+)$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(markdown))) {
    const raw = m[2].replace(/[*`_]/g, "").trim();
    toc.push({ id: slugify(raw), text: raw, level: m[1].length });
  }
  return toc;
}

/** Plain-text excerpt for cards and <meta name="description">. */
export function buildExcerpt(markdown: string, max = 180): string {
  let text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`\n]+`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/\$[^$\n]+\$/g, " ")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~>|]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length > max) {
    text = text.slice(0, max);
    text = text.slice(0, text.lastIndexOf(" ")) + "…";
  }
  return text;
}
