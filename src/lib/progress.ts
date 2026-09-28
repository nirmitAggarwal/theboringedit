/**
 * Reading progress, stored in localStorage.
 *
 *   warmink:progress:<slug> → { p: 0-100, done: true|false, t: <ISO date> }
 *
 * `p` is the deepest scroll percentage reached on the post. `done` flips to
 * true automatically at AUTO_DONE% scroll (or when the reader marks it read),
 * and can be toggled off by the reader. Everything is wrapped in try/catch so
 * private-mode browsers degrade to in-memory state.
 */

const KEY_PREFIX = "warmink:progress:";

export interface ReadingProgress {
  /** Deepest scroll percentage reached, 0–100 */
  p: number;
  /** Post marked as fully read */
  done: boolean;
  /** ISO timestamp of the last update */
  t: string;
}

const AUTO_DONE = 95;

/* ——— storage plumbing ——————————————————————————————————————————— */

let memory: Record<string, string> = {};
let memoryMode = false;

function readRaw(slug: string): string | null {
  if (memoryMode) return memory[slug] ?? null;
  try {
    return localStorage.getItem(KEY_PREFIX + slug);
  } catch {
    memoryMode = true; // localStorage unavailable (private mode etc.)
    return memory[slug] ?? null;
  }
}

function writeRaw(slug: string, value: string): void {
  if (memoryMode) {
    memory[slug] = value;
    return;
  }
  try {
    localStorage.setItem(KEY_PREFIX + slug, value);
  } catch {
    memoryMode = true;
    memory[slug] = value;
  }
}

/* ——— API ———————————————————————————————————————————————————————— */

/** Deep-merge read so a partial record never crashes the UI. */
export function getProgress(slug: string): ReadingProgress {
  try {
    const raw = readRaw(slug);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ReadingProgress>;
      return {
        p: typeof parsed.p === "number" ? Math.min(100, Math.max(0, parsed.p)) : 0,
        done: parsed.done === true,
        t: typeof parsed.t === "string" ? parsed.t : "",
      };
    }
  } catch {
    /* fall through to empty */
  }
  return { p: 0, done: false, t: "" };
}

export function setProgress(slug: string, patch: Partial<ReadingProgress>): ReadingProgress {
  const next = { ...getProgress(slug), ...patch, t: new Date().toISOString() };
  writeRaw(slug, JSON.stringify(next));
  listeners.forEach((fn) => fn(slug, next));
  return next;
}

export function markDone(slug: string, done: boolean): ReadingProgress {
  return setProgress(slug, { done, ...(done ? { p: 100 } : {}) });
}

export function clearProgress(): void {
  if (!memoryMode) {
    try {
      const kill: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k?.startsWith(KEY_PREFIX)) kill.push(k);
        if (kill.length > 64) {
          // defensive: flush periodically so huge storages don't stall
          kill.forEach((k2) => localStorage.removeItem(k2));
          kill.length = 0;
        }
    }
      kill.forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
  }
  memory = {};
  listeners.forEach((fn) => fn("*", { p: 0, done: false, t: "" }));
}

/* ——— change notifications ——————————————————————————————————————— */

type Listener = (slug: string, progress: ReadingProgress) => void;
const listeners = new Set<Listener>();

export function onProgressChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ——— React hooks ———————————————————————————————————————————————— */

import { useEffect, useState } from "react";

/** Subscribe to one post's progress. */
export function useProgress(slug: string): ReadingProgress {
  const [progress, setLocal] = useState<ReadingProgress>(() => getProgress(slug));
  useEffect(() => {
    setLocal(getProgress(slug)); // resync when the slug changes
    return onProgressChange((changed, next) => {
      if (changed === slug || changed === "*") setLocal(next);
    });
  }, [slug]);
  return progress;
}

/** Subscribe to all progress as a slug → record map. */
export function useAllProgress(): Record<string, ReadingProgress> {
  const [all, setAll] = useState<Record<string, ReadingProgress>>(readAll);
  useEffect(() => onProgressChange(() => setAll(readAll())), []);
  return all;
}

function readAll(): Record<string, ReadingProgress> {
  const out: Record<string, ReadingProgress> = {};
  if (memoryMode) {
    for (const [slug, raw] of Object.entries(memory)) {
      try {
        out[slug] = JSON.parse(raw) as ReadingProgress;
      } catch {
        /* skip */
      }
    }
    return out;
  }
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(KEY_PREFIX)) continue;
      try {
        out[key.slice(KEY_PREFIX.length)] = JSON.parse(
          localStorage.getItem(key) ?? ""
        ) as ReadingProgress;
      } catch {
        /* skip corrupt entries */
      }
  }
  } catch {
    /* private mode fallback handled by memoryMode */
  }
  return out;
}

/* ——— scroll engine ————————————————————————————————————————————— */

/**
 * Track scroll depth across the whole article and persist the deepest reach.
 * Returns a cleanup for React's unmount.
 *
 * SCOPE FIX vs the design doc: the page background is a fixed dot grid, so
 * `document` height includes the whole page (footer, nav rails, binge nav).
 * We measure progress against the article body itself: percent = how far the
 * viewport bottom has travelled through the article, from "article top hits
 * viewport top" to "article bottom hits viewport bottom".
 */
export function useScrollTracking(slug: string): number {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const article = document.getElementById("article-body");
    if (!article) return;

    let deepest = getProgress(slug).p;
    setPercent(deepest);
    let raf = 0;

    const measure = () => {
      raf = 0;
      const rect = article.getBoundingClientRect();
      const view = window.innerHeight;
      // How far the article has travelled up: 0 when its top hits the viewport
      // top, == rect.height when its bottom hits the viewport bottom.
      const scrolled = view - rect.top;
      const pct = Math.min(100, Math.max(0, Math.round((scrolled / (rect.height || 1)) * 100)));
      if (pct > deepest) {
        deepest = pct;
        setPercent(pct);
        setProgress(slug, { p: deepest, done: getProgress(slug).done || deepest >= AUTO_DONE });
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [slug]);

  return percent;
}

export { AUTO_DONE };
