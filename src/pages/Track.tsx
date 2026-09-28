import { Link, useParams } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { NotFound } from "./NotFound";
import { getTrack, getTrackPosts, formatPostDate } from "../lib/posts";
import { useAllProgress } from "../lib/progress";
import { usePageTitle } from "../lib/usePageTitle";
import { pad2 } from "../lib/format";

export default function TrackPage() {
  const { slug } = useParams();
  const track = slug ? getTrack(slug) : undefined;
  usePageTitle(track?.title, track?.description);

  if (!track) return <NotFound />;

  const parts = getTrackPosts(track.slug);
  const accent = { color: track.color } as const;
  const progressMap = useAllProgress();
  const readCount = parts.filter((p) => progressMap[p.slug]?.done).length;
  const firstUnread = parts.find((p) => !progressMap[p.slug]?.done);

  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-28 sm:pt-36 pb-8">
        <Reveal>
          <p className="font-label text-[0.625rem] sm:text-xs text-muted-foreground">
            {"// track · "}
            {parts.length} {parts.length === 1 ? "part" : "parts"}
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h1
            className="mt-5 font-display text-4xl sm:text-5xl leading-[1.15] max-w-[24ch] text-balance"
            style={accent}
          >
            {track.title}
          </h1>
        </Reveal>
        {track.description && (
          <Reveal delay={2}>
            <p className="mt-6 text-lg text-ink-soft max-w-[56ch] leading-relaxed">
              {track.description}
            </p>
          </Reveal>
        )}
        {parts.length > 0 && (
          <Reveal delay={3}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to={`/blog/${(firstUnread ?? parts[0]).slug}`}
                className="btn-primary"
              >
                {readCount === 0
                  ? "Start at part 01"
                  : firstUnread
                    ? `Continue with part ${pad2(firstUnread.trackIndex!)}`
                    : "Reread from part 01"}
              </Link>
              <span className="font-mono text-xs text-muted-foreground">
                {readCount} of {parts.length} read
                {readCount < parts.length ? " — every post links to the next" : " — nicely done ✓"}
              </span>
            </div>
          </Reveal>
        )}
      </div>

      {track.descriptionHtml && (
        <div className="mx-auto max-w-6xl px-6 md:px-10 pb-4">
          <Reveal>
            <div
              className="prose-editorial max-w-[68ch] border-t border-border pt-10"
              dangerouslySetInnerHTML={{ __html: track.descriptionHtml }}
            />
          </Reveal>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-6 md:px-10 pb-10">
        {parts.length > 0 ? (
          <div className="border-b border-border">
            {parts.map((p) => (
              <Reveal key={p.slug}>
                <Link
                  to={`/blog/${p.slug}`}
                  className="group grid grid-cols-[3rem_1fr_auto] gap-x-6 gap-y-3 border-t border-border py-8 items-start"
                >
                  <span
                    className="font-mono text-sm pt-1.5"
                    style={accent}
                    aria-label={`Part ${p.trackIndex}`}
                  >
                    {pad2(p.trackIndex!)}
                  </span>
                  <div className="min-w-0">
                    <h2 className="font-display text-xl sm:text-2xl leading-snug text-balance group-hover:text-primary transition-colors">
                      {p.title}
                    </h2>
                    <p className="mt-2 text-muted-foreground max-w-[52ch] text-[0.95rem] leading-relaxed">
                      {p.excerpt}
                    </p>
                  </div>
                  <div className="col-start-2 sm:col-start-3 font-mono text-xs whitespace-nowrap pt-1.5">
                    {progressMap[p.slug]?.done ? (
                      <span className="text-primary">read ✓ · </span>
                    ) : null}
                    <span className="text-muted-foreground">
                      {formatPostDate(p.date)} · {p.readingMinutes} min
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="border-t border-border py-16 text-center">
              <p className="font-display text-2xl">No parts filed here yet.</p>
              <p className="mt-3 text-muted-foreground text-sm">
                Give a post <code className="inline-code">track: {track.slug}</code> and a{" "}
                <code className="inline-code">trackIndex:</code> to place it.
              </p>
            </div>
          </Reveal>
        )}

        <div className="mt-12 pb-6">
          <Link
            to="/tracks"
            className="link-sweep font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            ← all tracks
          </Link>
        </div>
      </div>
    </section>
  );
}
