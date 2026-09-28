export type Theme = "light" | "dark";

export function getStoredTheme(): Theme {
  try {
    return localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    if (theme === "dark") localStorage.setItem("theme", "dark");
    else localStorage.removeItem("theme");
  } catch {
    /* private mode — theme just won't persist */
  }
}

export function toggleTheme(): Theme {
  const next: Theme = getStoredTheme() === "dark" ? "light" : "dark";
  applyTheme(next);
  return next;
}
