import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Writing" },
  { to: "/tracks", label: "Tracks" },
  { to: "/about", label: "About" },
];

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `px-2.5 sm:px-3 py-2 text-[0.8rem] sm:text-sm rounded-lg transition-colors ${
    isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
  }`;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const shellRef = useRef<HTMLDivElement>(null);

  // Route changed → close the sheet (also covers browser back/forward)
  useEffect(() => setOpen(false), [pathname]);

  // While open: close on Escape or any click outside the navbar shell
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onPointer = (e: PointerEvent) => {
      if (!shellRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-3 sm:top-5 z-50 px-4">
      <div ref={shellRef} className="relative mx-auto w-full max-w-6xl">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="pill flex h-11 sm:h-13 items-center gap-2.5 px-4 sm:px-5"
            aria-label="The Boring Edit — home"
          >
            <span className="size-2 bg-primary shrink-0" aria-hidden="true" />
            <span className="font-display text-lg leading-none whitespace-nowrap">
              The Boring Edit
            </span>
          </Link>

          {/* ——— Desktop nav ——— */}
          <nav
            className="pill hidden md:flex h-11 sm:h-13 items-center gap-0.5 px-1.5"
            aria-label="Primary"
          >
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={navLinkClass}
              >
                {l.label}
              </NavLink>
            ))}
            <span className="h-5 w-px bg-border mx-1" aria-hidden="true" />
            <ThemeToggle />
          </nav>

          {/* ——— Mobile controls ——— */}
          <div className="pill flex md:hidden h-11 items-center gap-0.5 px-1.5">
            <ThemeToggle />
            <button
              type="button"
              className="p-2 rounded-lg text-foreground"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="relative block h-3 w-[18px]" aria-hidden="true">
                <span
                  className={`absolute left-0 h-[1.5px] w-full bg-current transition-all duration-200 ${
                    open ? "top-[5px] rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 h-[1.5px] w-full bg-current transition-all duration-200 ${
                    open ? "top-[5px] -rotate-45" : "top-[9px]"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>

        {/* ——— Mobile sheet ——— */}
        <nav
          id="mobile-menu"
          aria-label="Primary"
          className={`pill menu-sheet absolute left-[calc(50%_-_8rem)] top-full mt-2 w-64 py-2 md:hidden ${
            open ? "" : "hidden"
          }`}
        >
          <ul>
            {links.map((l, i) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/"}
                  className={({ isActive }) =>
                    `flex items-baseline gap-3 px-5 py-3 text-sm transition-colors ${
                      isActive
                        ? "text-primary font-bold"
                        : "text-muted-foreground hover:text-foreground"
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  <span className="font-mono text-[0.625rem] text-muted-foreground/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
