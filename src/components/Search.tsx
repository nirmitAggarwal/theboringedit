import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchPosts, suggestTracks, snippetFor } from "../lib/search";
import { formatPostDate } from "../lib/posts";
import { pad2 } from "../lib/format";

/* ---------------------------------------------------------------------------
 * Search — a command-palette dialog over the site's content, styled with the
 * navbar's pill vocabulary. Trigger lives in the navbar (desktop + mobile);
 * opens via button, ⌘K/Ctrl+K, or "/". Fully keyboard-driven once open.
 * ------------------------------------------------------------------------- */

const RECENT_KEY = "warmink:search:recent";
const RECENT_LIMIT = 3;

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.slice(0, RECENT_LIMIT) : [];
  } catch {
    return [];
  }
}

function pushRecent(q: string): string[] {
  const next = [q, ...readRecent().filter((r) => r !== q)].slice(0, RECENT_LIMIT);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* private browsing — recent searches are optional */
  }
  return next;
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M15.8 15.8 21 21" />
    </svg>
  );
}

function CornerIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

interface PaletteProps {
  open: boolean;
  onClose: () => void;
}

export function SearchPalette({ open, onClose }: PaletteProps) {
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(-1);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const hits = useMemo(() => searchPosts(query), [query]);
  const trackSuggestions = useMemo(() => suggestTracks(query), [query]);

  // Flat keyboard-addressable order: track suggestions, then posts.
  const flat = useMemo(
    () => [...trackSuggestions, ...hits.map((h) => h.post)],
    [trackSuggestions, hits]
  );

  // Fresh state each open; focus the field after the dialog mounts.
  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(-1);
      setRecents(readRecent());
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Keep the highlighted row in view while arrowing.
  useEffect(() => {
    if (cursor < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-idx="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  const goPost = (slug: string, record = false) => {
    if (record) setRecents(pushRecent(query.trim()));
    onClose();
    navigate(`/blog/${slug}`);
  };

  const goTrack = (slug: string) => {
    onClose();
    navigate(`/tracks/${slug}`);
  };

  const commitRecent = (q: string) => {
    setQuery(q);
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (cursor >= 0 && flat[cursor]) {
        goPost(flat[cursor].slug, true);
      } else if (query.trim() && hits.length > 0) {
        goPost(hits[0].post.slug, true);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!open) return null;

  const showRecents = query.trim() === "" && recents.length > 0;
  const empty = query.trim() !== "" && hits.length === 0 && trackSuggestions.length === 0;

  const rowClass = (active: boolean) =>
    `flex items-baseline gap-3 w-full text-left px-4 sm:px-5 py-3 transition-colors ${
      active ? "bg-accent-soft/70" : ""
    }`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:pt-[16vh] bg-background/55 backdrop-blur-[3px]"
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="pill w-full max-w-xl max-h-[70vh] flex flex-col overflow-hidden"
        style={{ animation: "menu-in 220ms var(--ease-out-expo) both" }}
      >
        {/* input row */}
        <div className="flex items-center gap-3 px-4 sm:px-5 h-14 border-b border-border shrink-0">
          <span className="text-muted-foreground shrink-0">
            <SearchIcon />
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(-1);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search articles…"
            aria-label="Search articles"
            autoComplete="off"
            spellCheck={false}
            className="flex-1 min-w-0 bg-transparent outline-none text-base sm:text-lg placeholder:text-muted-foreground/70"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCursor(-1);
                inputRef.current?.focus();
              }}
              className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors shrink-0"
              aria-label="Clear search"
            >
              clear ×
            </button>
          )}
          <kbd className="hidden sm:inline-block font-mono text-[0.625rem] text-muted-foreground/80 border border-border rounded px-1.5 py-0.5 shrink-0">
            esc
          </kbd>
        </div>

        {/* results */}
        <div ref={listRef} className="overflow-y-auto overscroll-contain">
          {showRecents && (
            <div className="py-2 border-b border-border/70">
              <p className="px-4 sm:px-5 pt-2 pb-1 font-label text-[0.625rem] text-muted-foreground">
                recent
              </p>
              {recents.map((q) => (
                <button
                  key={q}
                  type="button"
                  className={rowClass(false)}
                  onClick={() => commitRecent(q)}
                >
                  <span className="font-mono text-xs text-muted-foreground/70">↻</span>
                  <span className="text-sm text-foreground">{q}</span>
                </button>
              ))}
            </div>
          )}

          {trackSuggestions.length > 0 && (
            <div className="py-2 border-b border-border/70">
              <p className="px-4 sm:px-5 pt-2 pb-1 font-label text-[0.625rem] text-muted-foreground">
                tracks
              </p>
              {trackSuggestions.map((t, i) => (
                <button
                  key={t.slug}
                  type="button"
                  data-idx={i}
                  className={rowClass(cursor === i)}
                  onClick={() => goTrack(t.slug)}
                  onPointerMove={() => setCursor(i)}
                >
                  <span className="font-mono text-xs text-muted-foreground/70">↳</span>
                  <span className="text-sm font-bold text-primary">{t.title}</span>
                  <span className="font-mono text-[0.625rem] text-muted-foreground/70">
                    see all parts
                  </span>
                </button>
              ))}
            </div>
          )}

          {hits.length > 0 && (
            <div className="py-2">
              <p className="px-4 sm:px-5 pt-2 pb-1 font-label text-[0.625rem] text-muted-foreground">
                {hits.length} {hits.length === 1 ? "article" : "articles"}
              </p>
              {hits.map((h, i) => {
                const idx = trackSuggestions.length + i;
                const active = cursor === idx;
                return (
                  <button
                    key={h.post.slug}
                    type="button"
                    data-idx={idx}
                    className={rowClass(active)}
                    onClick={() => goPost(h.post.slug, true)}
                    onPointerMove={() => setCursor(idx)}
                  >
                    <span
                      className={`font-mono text-xs pt-0.5 shrink-0 ${
                        active ? "text-primary" : "text-muted-foreground/70"
                      }`}
                    >
                      {pad2(idx + 1)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm sm:text-[0.95rem] font-bold text-foreground">
                        {h.post.title}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {formatPostDate(h.post.date)} · {h.post.readingMinutes} min ·{" "}
                        {snippetFor(h.post, query)}
                      </span>
                    </span>
                    {active && (
                      <span className="text-primary shrink-0 self-center">
                        <CornerIcon />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {empty && (
            <div className="px-5 py-12 text-center">
              <p className="font-display text-xl">Nothing found for “{query}”.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try a tag, part of a title, or a word from the article.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Navbar trigger — `inMenu` renders the full-width mobile-sheet variant. */
export function SearchTrigger({ onOpen, inMenu }: { onOpen: () => void; inMenu?: boolean }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`group flex items-center rounded-lg transition-colors text-muted-foreground hover:text-foreground ${
        inMenu
          ? "w-full px-5 py-3 gap-3 text-sm justify-start"
          : "h-11 sm:h-13 px-2.5 sm:px-3 gap-2 text-[0.8rem] sm:text-sm"
      }`}
      aria-label="Search articles"
    >
      <SearchIcon />
      {inMenu ? (
        <span className="flex-1 text-left">Search</span>
      ) : (
        <>
          <span className="hidden lg:inline">Search</span>
          <kbd className="hidden lg:inline-block font-mono text-[0.625rem] text-muted-foreground/70 border border-border rounded px-1.5 py-0.5">
            ⌘K
          </kbd>
        </>
      )}
    </button>
  );
}
