import { useEffect } from "react";
import { SITE } from "../../scripts/config";

const DEFAULT_TITLE = SITE.title;
const DEFAULT_DESCRIPTION = SITE.description;

function upsertMeta(attr: "name" | "property", key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string): void {
  let el = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = "canonical";
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Keeps the live <head> in sync during SPA navigation. Static prerendered
 * pages already ship full meta tags (scripts/prerender.tsx); this updates
 * them in place as the reader moves between routes — so every virtual
 * page-view presents correct title/description/canonical/OG data.
 */
export function usePageTitle(title?: string, description?: string, ogImagePath?: string): void {
  useEffect(() => {
    const path = window.location.pathname;
    const fullTitle = title ? `${title} — ${SITE.name}` : DEFAULT_TITLE;
    const desc = description ?? DEFAULT_DESCRIPTION;

    document.title = fullTitle;
    upsertMeta("name", "description", desc);
    upsertCanonical(SITE.url + path);
    upsertMeta("property", "og:title", fullTitle);
    upsertMeta("property", "og:description", desc);
    upsertMeta("property", "og:url", SITE.url + path);
    if (ogImagePath) upsertMeta("property", "og:image", SITE.url + ogImagePath);
  }, [title, description, ogImagePath]);
}
