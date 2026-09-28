import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import PostPage from "./pages/Post";
import Tracks from "./pages/Tracks";
import TrackPage from "./pages/Track";
import About from "./pages/About";
import { NotFound } from "./pages/NotFound";

export default function App() {
  const { pathname } = useLocation();

  // Scroll restoration on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Copy buttons live inside build-time-rendered code panels
  // (scripts/markdown.ts emits them), so handle clicks by delegation.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const btn = target?.closest?.("[data-code-copy]") as HTMLElement | null;
      if (!btn) return;
      const code = btn.closest(".code-panel")?.querySelector("pre")?.textContent ?? "";
      void navigator.clipboard.writeText(code).then(() => {
        btn.textContent = "copied ✓";
        window.setTimeout(() => {
          btn.textContent = "copy";
        }, 1600);
      });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<PostPage />} />
          <Route path="/tracks" element={<Tracks />} />
          <Route path="/tracks/:slug" element={<TrackPage />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
