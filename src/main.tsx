import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./styles/globals.css";

// Styles for build-time-rendered article HTML (KaTeX + syntax theme)
import "katex/dist/katex.min.css";
import "highlight.js/styles/github-dark.css";

const container = document.getElementById("root")!;
const app = (
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

// `npm run build` prerenders every route to static HTML (see scripts/prerender.ts).
// If that HTML is present we hydrate it (fast first paint + SEO); otherwise
// (plain `vite dev`) we render from scratch.
const isPrerendered = container.hasChildNodes();

if (isPrerendered) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
