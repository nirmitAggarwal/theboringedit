import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { PostRow } from "../components/PostRow";
import { posts, getAllTags, tracks, getTrackPosts } from "../lib/posts";
import { usePageTitle } from "../lib/usePageTitle";
import { pad2 } from "../lib/format";

export default function Home() {
  usePageTitle();
  const latest = posts.slice(0, 3);
  const tags = getAllTags();

  return (
    <>
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 md:px-10 pt-28 sm:pt-36 pb-24 sm:pb-32 min-h-[76vh] flex flex-col justify-center">
          <Reveal>
            <p className="font-label text-[0.625rem] sm:text-xs text-muted-foreground">
              {"01 — Nirmit Aggarwal, writing slowly"}
            </p>
          </Reveal>

          <Reveal delay={1}>
            <h1 className="mt-6 font-display text-[2.1rem] sm:text-5xl lg:text-6xl leading-[1.18] max-w-[24ch] text-balance">
              Notes worth the slow read, from Nirmit's desk.
            </h1>
          </Reveal>

          <Reveal delay={2}>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-[56ch] leading-relaxed">
              Notes on code, math, and making things — written in plain markdown,
              compiled to a fast static site. No trackers, no feed, just paper.
            </p>
          </Reveal>

          <Reveal delay={3}>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link to="/blog" className="btn-primary">Read the writing</Link>
              <Link to="/about" className="btn-ghost">About this site</Link>
              <span className="inline-flex items-center gap-2 font-label text-[0.625rem] sm:text-[0.6875rem] text-muted-foreground ml-1">
                <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                writing · monthly-ish
              </span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ——— Latest writing ——— */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
          <Reveal>
            <SectionHeading
              label="02 — Latest writing"
              right={
                <Link to="/blog" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
                  all →
                </Link>
              }
            />
          </Reveal>

          {latest.length > 0 ? (
            <>
              <div className="mt-10">
                {latest.map((p, i) => (
                  <Reveal key={p.slug} delay={i + 1}>
                    <PostRow post={p} index={i} />
                  </Reveal>
                ))}
              </div>
              <div className="mt-10">
                <Link to="/blog" className="btn-outline">View all {posts.length} posts</Link>
              </div>
            </>
          ) : (
            <Reveal>
              <p className="mt-10 text-muted-foreground">
                Nothing here yet — write your first post with{" "}
                <code className="inline-code">npm run new:post -- "Hello world"</code>.
              </p>
            </Reveal>
          )}
        </div>
      </section>

      {/* ——— Tracks ——— */}
      {tracks.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
            <Reveal>
              <SectionHeading
                label="03 — Tracks"
                right={
                  <Link to="/tracks" className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
                    all →
                  </Link>
                }
              />
            </Reveal>
            <div className="mt-10 border-b border-border">
              {tracks.slice(0, 3).map((t) => {
                const parts = getTrackPosts(t.slug);
                const latest = parts[parts.length - 1];
                return (
                  <Reveal key={t.slug}>
                    <Link
                      to={`/tracks/${t.slug}`}
                      className="group grid grid-cols-[1fr_auto] gap-x-6 items-center border-t border-border py-6"
                    >
                      <div className="min-w-0">
                        <h3 className="font-display text-xl sm:text-2xl leading-snug text-balance group-hover:text-primary transition-colors">
                          {t.title}
                        </h3>
                        {t.description && (
                          <p className="mt-1.5 text-muted-foreground max-w-[56ch] text-[0.95rem] leading-relaxed">
                            {t.description}
                          </p>
                        )}
                      </div>
                      <div className="font-mono text-xs text-muted-foreground whitespace-nowrap text-right">
                        <span
                          className="font-display text-2xl block"
                          style={t.color ? { color: t.color } : undefined}
                        >
                          {pad2(parts.length)}
                        </span>
                        {latest ? `thru ${pad2(latest.trackIndex!)}` : ""}
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            {tracks.length > 3 && (
              <Reveal>
                <div className="mt-8">
                  <Link to="/tracks" className="btn-outline">
                    All {tracks.length} tracks
                  </Link>
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ——— Topics ——— */}
      {tags.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-6xl px-6 md:px-10 py-20 md:py-28">
            <Reveal>
              <SectionHeading label="04 — Topics" />
            </Reveal>
            <Reveal delay={1}>
              <div className="mt-10 flex flex-wrap gap-2.5 max-w-3xl">
                {tags.map(({ tag, count }) => (
                  <Link key={tag} to={`/blog?tag=${encodeURIComponent(tag)}`} className="chip">
                    {tag} · {count}
                  </Link>
                ))}
              </div>
            </Reveal>
            <Reveal delay={2}>
              <p className="mt-10 text-muted-foreground max-w-[52ch]">
                Everything is tagged. Follow a thread, or{" "}
                <Link to="/about" className="link-sweep text-primary">read about the machine</Link>{" "}
                that compiles the markdown.
              </p>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
