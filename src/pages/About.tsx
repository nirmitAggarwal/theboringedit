import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { SITE } from "../../scripts/config";
import { usePageTitle } from "../lib/usePageTitle";

export default function About() {
  usePageTitle("About");

  return (
    <section className="mx-auto max-w-6xl px-6 md:px-10 pt-28 sm:pt-36 pb-10">
      <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20 items-start">
        <div>
          <Reveal>
            <p className="font-label text-[0.625rem] sm:text-xs text-muted-foreground">{"// about · who writes this"}</p>
          </Reveal>
          <Reveal delay={1}>
            <h1 className="mt-5 font-display text-4xl sm:text-5xl leading-[1.15] max-w-[24ch] text-balance">
              Hi, I'm Nirmit.
            </h1>
          </Reveal>
          <Reveal delay={2}>
            <div className="mt-8 space-y-5 text-[1.0625rem] leading-[1.75] max-w-[58ch] text-ink-soft">
              <p>
                I write {SITE.name} — a quiet, personal journal about code, math,
                and making things. Every post starts as a plain markdown file,
                with LaTeX math, code blocks, and images mixed right in.
              </p>
              <p>
                A small build step compiles those files into this site: math is
                typeset by KaTeX, code is highlighted, and every page is
                prerendered to static HTML so it loads instantly and reads well
                to machines too.
              </p>
              <p>
                The design is deliberately calm — warm paper, hairline rules,
                and one loud orange where something deserves your attention.
                Longer series live in <Link to="/tracks" className="link-sweep text-primary">tracks</Link>,
                numbered parts you can read start to finish.
              </p>
            </div>
          </Reveal>

          <Reveal delay={3}>
            <dl className="mt-12 space-y-8 border-t border-border pt-10">
              <div>
                <dt className="font-label text-[0.625rem] text-muted-foreground">Now</dt>
                <dd className="mt-2 max-w-[52ch]">Building quiet software, writing here monthly-ish.</dd>
              </div>
              <div>
                <dt className="font-label text-[0.625rem] text-muted-foreground">Tools</dt>
                <dd className="mt-3 flex flex-wrap gap-2">
                  {["React", "TypeScript", "Markdown", "KaTeX", "Vite"].map((t) => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="font-label text-[0.625rem] text-muted-foreground">Elsewhere</dt>
                <dd className="mt-3 flex flex-wrap gap-5">
                  <a href={SITE.authorLinks.website} className="link-sweep text-sm" target="_blank" rel="noreferrer">
                    theboringedit.in ↗
                  </a>
                  <a href={SITE.authorLinks.github} className="link-sweep text-sm" target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                  <a href={SITE.authorLinks.linkedin} className="link-sweep text-sm" target="_blank" rel="noreferrer">
                    LinkedIn ↗
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={4}>
            <div className="mt-12">
              <Link to="/blog" className="btn-primary">Start reading</Link>
            </div>
          </Reveal>
        </div>

        {/* ——— Editorial placeholder art ——— */}
        <Reveal kind="media" className="lg:mt-16">
          <div className="relative aspect-[4/5] border border-border bg-surface-warm overflow-hidden">
            <span className="absolute inset-x-0 top-1/2 h-px bg-border-strong" aria-hidden="true" />
            <span className="absolute inset-y-0 left-1/2 w-px bg-border-strong" aria-hidden="true" />
            <span
              className="absolute -bottom-12 -left-5 font-display text-[11rem] sm:text-[14rem] leading-none text-foreground/8 select-none"
              aria-hidden="true"
            >
              N
            </span>
            <p className="absolute top-4 left-4 font-label text-[0.625rem] text-muted-foreground">
              {"// paper · ink · one loud orange"}
            </p>
            <p className="absolute bottom-4 right-4 font-label text-[0.625rem] text-muted-foreground">
              fig. 01 — the desk
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
