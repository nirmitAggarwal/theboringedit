import { useSearchParams } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { PostRow } from "../components/PostRow";
import { posts, getAllTags } from "../lib/posts";
import { usePageTitle } from "../lib/usePageTitle";

export default function Blog() {
  usePageTitle("Writing");
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get("tag") ?? undefined;
  const allTags = getAllTags();
  const visible = tag ? posts.filter((p) => p.tags.includes(tag)) : posts;

  return (
    <section>
      <div className="mx-auto max-w-6xl px-6 md:px-10 pt-28 sm:pt-36 pb-8">
        <Reveal>
          <p className="font-label text-[0.625rem] sm:text-xs text-muted-foreground">
            {"// all writing · "}
            {visible.length} {visible.length === 1 ? "entry" : "entries"}
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h1 className="mt-5 font-display text-4xl sm:text-5xl leading-[1.15] max-w-[24ch] text-balance">
            {tag ? `Filed under “${tag}”.` : "Everything written so far."}
          </h1>
        </Reveal>

        {allTags.length > 0 && (
          <Reveal delay={2}>
            <div className="mt-8 flex flex-wrap items-center gap-2">
              {allTags.map(({ tag: t, count }) => {
                const active = t === tag;
                return (
                  <button
                    key={t}
                    type="button"
                    className={`chip ${active ? "chip--active" : ""}`}
                    onClick={() =>
                      active ? setSearchParams({}) : setSearchParams({ tag: t })
                    }
                  >
                    {t} · {count}
                  </button>
                );
              })}
              {tag && (
                <button
                  type="button"
                  onClick={() => setSearchParams({})}
                  className="font-mono text-xs text-muted-foreground hover:text-primary transition-colors ml-1"
                >
                  clear ×
                </button>
              )}
            </div>
          </Reveal>
        )}
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-10 pb-10">
        <div className="border-b border-border">
          {visible.map((p, i) => (
            <Reveal key={p.slug} delay={Math.min(i + 1, 4)}>
              <PostRow post={p} index={i} />
            </Reveal>
          ))}
          {visible.length === 0 && (
            <Reveal>
              <div className="border-t border-border py-16 text-center">
                <p className="font-display text-2xl">Nothing filed here yet.</p>
                <button type="button" onClick={() => setSearchParams({})} className="btn-ghost mt-6">
                  ← Back to everything
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
