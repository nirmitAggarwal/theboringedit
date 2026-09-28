import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { SectionHeading } from "../components/SectionHeading";
import { TrackBadge } from "../components/TrackBadge";
import { tracks, getTrackPosts } from "../lib/posts";
import { usePageTitle } from "../lib/usePageTitle";
import { pad2 } from "../lib/format";

export default function Tracks() {
  usePageTitle("Tracks");

  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-28 sm:pt-36 pb-8">
        <Reveal>
          <p className="font-label text-[0.625rem] sm:text-xs text-muted-foreground">
            {"// tracks · "}
            {tracks.length} {tracks.length === 1 ? "series" : "series"}
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl leading-[1.15] max-w-[24ch] text-balance">
            Read it like a book, not a feed.
          </h1>
        </Reveal>
        <Reveal delay={2}>
          <p className="mt-6 text-muted-foreground max-w-[56ch] leading-relaxed">
            Tracks are numbered series — start at part 01 and keep going. Every
            part carries its index, so you always know where you are.
          </p>
        </Reveal>
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-10 pb-10">
        {tracks.length > 0 ? (
          <div className="border-b border-border">
            {tracks.map((t, i) => {
              const parts = getTrackPosts(t.slug);
              const latest = parts[parts.length - 1];
              return (
                <Reveal key={t.slug} delay={Math.min(i + 1, 4)}>
                  <Link
                    to={`/tracks/${t.slug}`}
                    className="group grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 border-t border-border py-8 items-start"
                  >
                    <div className="min-w-0">
                      <h2
                        className="font-display text-2xl sm:text-3xl leading-snug text-balance group-hover:text-primary transition-colors"
                        style={t.color ? { color: t.color } : undefined}
                      >
                        {t.title}
                      </h2>
                      {t.description && (
                        <p className="mt-2 text-muted-foreground max-w-[56ch] text-[0.95rem] leading-relaxed">
                          {t.description}
                        </p>
                      )}
                      <p className="mt-3 font-mono text-xs text-muted-foreground">
                        {parts.length} {parts.length === 1 ? "part" : "parts"}
                        {latest && (
                          <>
                            {" · latest: "}
                            <span className="group-hover:text-primary transition-colors">
                              {pad2(latest.trackIndex!)} — {latest.title}
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="font-label text-[0.625rem] text-muted-foreground pt-2 whitespace-nowrap">
                      open ↗
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        ) : (
          <Reveal>
            <div className="border-t border-border py-16 text-center">
              <p className="font-display text-2xl">No tracks yet.</p>
              <p className="mt-3 text-muted-foreground text-sm">
                Add a markdown file to <code className="inline-code">content/tracks/</code> and
                point posts at it with <code className="inline-code">track:</code> +{" "}
                <code className="inline-code">trackIndex:</code>.
              </p>
            </div>
          </Reveal>
        )}
      </div>

      {tracks.length > 0 && (
        <div className="mx-auto max-w-6xl px-6 md:px-10 pb-10">
          <Reveal>
            <SectionHeading label="how numbering works" />
          </Reveal>
          <Reveal delay={1}>
            <p className="mt-6 text-muted-foreground max-w-[60ch] leading-relaxed">
              You assign each post its number in frontmatter —{" "}
              <code className="inline-code">track: rust</code> and{" "}
              <code className="inline-code">trackIndex: 4</code> — so a series can
              grow out of order and still read in order. The build checks for
              gaps and duplicates so the numbering stays honest.
            </p>
          </Reveal>
          <Reveal delay={2}>
            <div className="mt-4 flex flex-wrap gap-2">
              {tracks.map((t) => (
                <TrackBadge key={t.slug} track={t} />
              ))}
            </div>
          </Reveal>
        </div>
      )}
    </section>
  );
}
