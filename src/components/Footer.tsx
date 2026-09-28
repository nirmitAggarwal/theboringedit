import { Link } from "react-router-dom";
import { SITE } from "../../scripts/config";

export function Footer() {
  return (
    <footer className="border-t border-border mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10 flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <p className="font-display text-lg">{SITE.name}</p>
          <nav className="flex items-center gap-5 font-mono text-xs text-muted-foreground/70" aria-label="Footer">
            <Link to="/blog" className="hover:text-foreground transition-colors">writing</Link>
            <Link to="/tracks" className="hover:text-foreground transition-colors">tracks</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">about</Link>
            <a href="/sitemap.xml" className="hover:text-foreground transition-colors">sitemap</a>
          </nav>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between border-t border-border pt-6">
          <p className="font-mono text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} {SITE.author} · set in Recoleta &amp; Caviar Dreams
          </p>
          <p className="flex flex-wrap items-center gap-5 font-mono text-xs text-muted-foreground/70">
            <a
              href={SITE.authorLinks.website}
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              theboringedit.in ↗
            </a>
            <a
              href={SITE.authorLinks.github}
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              github ↗
            </a>
            <a
              href={SITE.authorLinks.linkedin}
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              linkedin ↗
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
