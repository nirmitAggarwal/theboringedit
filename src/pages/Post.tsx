import { Link, useParams } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { TrackBadge } from "../components/TrackBadge";
import { NotFound } from "./NotFound";
import { getPost, getAdjacent, getTrackMembership, getTrackPosts, formatPostDate } from "../lib/posts";
import { useScrollTracking, useProgress, useAllProgress, markDone } from "../lib/progress";
import { usePageTitle } from "../lib/usePageTitle";
import { pad2 } from "../lib/format";

export default function PostPage() {
  const { slug } = useParams();
  const post = slug ? getPost(slug) : undefined;
  usePageTitle(
    post?.title,
    post?.excerpt,
    post ? (post.ogImage ?? post.cover ?? `/og/${post.slug}.png`) : undefined
  );

  // Hooks run before the early return so React is always consistent.
  const activeSlug = post?.slug ?? "";
  const live = useScrollTracking(activeSlug);
  const prog = useProgress(activeSlug);
  const progressMap = useAllProgress();

  if (!post) return <NotFound />;

  const { older, newer } = getAdjacent(post.slug);
  const membership = getTrackMembership(post);
  const parts = membership ? getTrackPosts(membership.track.slug) : [];

  return (
    <article className="mx-auto max-w-6xl px-6 md:px-10 pt-28 sm:pt-36">
      {/* ——— Reading progress hairline (scroll % through this article) ——— */}
      <div className="fixed top-0 inset-x-0 z-40 h-[3px]" aria-hidden="true">
        <div
          className="h-full bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${live}%` }}
        />
      </div>
      <div className="xl:grid xl:grid-cols-[13rem_minmax(0,1fr)] xl:gap-14">
        {/* ——— TOC rail (wide screens) ——— */}
        {post.toc.length > 1 && (
          <Reveal className="hidden xl:block">
            <nav className="sticky top-32" aria-label="On this page">
              <p className="font-label text-[0.625rem] text-muted-foreground">{"// on this page"}</p>
              <ul className="mt-4 space-y-2 border-l border-border">
                {post.toc.map((h) => (
                  <li key={h.id} className={h.level === 3 ? "pl-5" : "pl-4"}>
                    <a
                      href={`#${h.id}`}
                      className="text-[0.8rem] leading-snug text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </Reveal>
        )}

        <div className="min-w-0 max-w-[72ch]">
          {/* ——— Header ——— */}
          <header className="pb-10 sm:pb-12">
            <Reveal>
              <p className="font-label text-[0.625rem] sm:text-xs text-primary">
                {"// writing"}
              </p>
            </Reveal>
            <Reveal delay={1}>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl leading-[1.15] text-balance">
                {post.title}
              </h1>
            </Reveal>
            {post.subtitle && (
              <Reveal delay={2}>
                <p className="mt-4 text-lg text-ink-soft max-w-[52ch]">{post.subtitle}</p>
              </Reveal>
            )}
            <Reveal delay={post.subtitle ? 3 : 2}>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">
                  {formatPostDate(post.date)} · {post.readingMinutes} min
                </span>
                <span
                  className={`font-mono text-xs ${prog.done ? "text-primary" : "text-muted-foreground"}`}
                  aria-live="polite"
                >
                  {live}% read{prog.done ? " · done ✓" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => markDone(post.slug, !prog.done)}
                  aria-pressed={prog.done}
                  className={`chip ${prog.done ? "chip--active" : ""}`}
                >
                  {prog.done ? "read ✓" : "mark read"}
                </button>
                {post.tags.map((t) => (
                  <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`} className="chip">
                    {t}
                  </Link>
                ))}
                {membership && <TrackBadge track={membership.track} index={membership.index} />}
              </div>
            </Reveal>
          </header>

          <div className="h-px bg-border" />

          {/* ——— Body (compiled at build time by npm run content:build) ——— */}
          <div
            id="article-body"
            className="prose-editorial pt-10"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />

          {/* ——— Track binge nav ——— */}
          {membership && (
            <nav
              className="mt-20 border-t border-border pt-8"
              aria-label={`Track: ${membership.track.title}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="font-label text-[0.625rem] text-muted-foreground">
                  {"// "}
                  {membership.track.title} · part {pad2(membership.index)} of {pad2(membership.total)}
                </p>
                <Link
                  to={`/tracks/${membership.track.slug}`}
                  className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  all {membership.total} parts →
                </Link>
              </div>

              {/* one square per part — solid = here, faded = read, outline = unread */}
              <div className="mt-5 flex flex-wrap gap-1.5">
                {parts.map((part) => {
                  const current = part.slug === post.slug;
                  const read = progressMap[part.slug]?.done === true;
                  return (
                    <Link
                      key={part.slug}
                      to={`/blog/${part.slug}`}
                      title={`${pad2(part.trackIndex!)} — ${part.title}${read && !current ? " (read)" : ""}`}
                      aria-label={`Part ${part.trackIndex}: ${part.title}${read ? " (read)" : ""}`}
                      aria-current={current ? "step" : undefined}
                      className={`size-2.5 transition-colors ${
                        current
                          ? "bg-primary"
                          : read
                            ? "bg-primary/40 hover:bg-primary/60"
                            : "border border-border-strong hover:border-primary"
                      }`}
                    />
                  );
                })}
              </div>

              <div className="mt-6 grid sm:grid-cols-2 border border-border">
                {membership.prev ? (
                  <Link
                    to={`/blog/${membership.prev.slug}`}
                    className="group p-5 border-b sm:border-b-0 sm:border-r border-border"
                  >
                    <p className="font-label text-[0.625rem] text-muted-foreground">{"← previous part"}</p>
                    <p className="mt-2 font-display text-lg leading-snug group-hover:text-primary transition-colors">
                      {membership.prev.title}
                    </p>
                  </Link>
                ) : (
                  <span className="p-5 border-b sm:border-b-0 sm:border-r border-border" aria-hidden="true" />
                )}
                {membership.next ? (
                  <Link
                    to={`/blog/${membership.next.slug}`}
                    className="group p-5 sm:text-right"
                  >
                    <p className="font-label text-[0.625rem] text-muted-foreground">{"next part →"}</p>
                    <p className="mt-2 font-display text-lg leading-snug group-hover:text-primary transition-colors">
                      {membership.next.title}
                    </p>
                  </Link>
                ) : (
                  <span className="p-5" aria-hidden="true" />
                )}
              </div>
            </nav>
          )}

          {/* ——— Older / newer (chronological, for untracked posts) ——— */}
          {!membership && (
          <nav className="mt-20 border-t border-border grid sm:grid-cols-2" aria-label="More posts">
            {older ? (
              <Link to={`/blog/${older.slug}`} className="group py-6 pr-6 border-b sm:border-b-0 border-border">
                <p className="font-label text-[0.625rem] text-muted-foreground">{"← older"}</p>
                <p className="mt-2 font-display text-lg leading-snug group-hover:text-primary transition-colors">
                  {older.title}
                </p>
              </Link>
            ) : (
              <span className="border-b sm:border-b-0 border-border" aria-hidden="true" />
            )}
            {newer ? (
              <Link to={`/blog/${newer.slug}`} className="group py-6 sm:pl-6 sm:text-right">
                <p className="font-label text-[0.625rem] text-muted-foreground">{"newer →"}</p>
                <p className="mt-2 font-display text-lg leading-snug group-hover:text-primary transition-colors">
                  {newer.title}
                </p>
              </Link>
            ) : (
              <span aria-hidden="true" />
            )}
          </nav>
          )}

          <div className="mt-12 pb-10">
            <Link to="/blog" className="link-sweep font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
              ← all writing
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
