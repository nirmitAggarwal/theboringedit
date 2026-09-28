import { useEffect, useState } from "react";
import { getStoredTheme, toggleTheme, type Theme } from "../lib/theme";

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5 5l1.6 1.6M17.4 17.4 19 19M19 5l-1.6 1.6M6.6 17.4 5 19" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    </svg>
  );
}

export function ThemeToggle() {
  // Start from "light" on both server and client so hydration always matches;
  // sync with the persisted theme right after mount.
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => setTheme(getStoredTheme()), []);
  return (
    <button
      type="button"
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      title={theme === "dark" ? "Light" : "Dark"}
      className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
      onClick={() => setTheme(toggleTheme())}
    >
      {theme === "dark" ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
