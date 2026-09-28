import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { usePageTitle } from "../lib/usePageTitle";

export function NotFound() {
  usePageTitle("Not found");
  return (
    <section className="mx-auto max-w-6xl px-6 md:px-10 pt-32 sm:pt-40 pb-20 text-center">
      <Reveal>
        <p className="font-label text-[0.625rem] sm:text-xs text-primary">{"// error · 404"}</p>
      </Reveal>
      <Reveal delay={1}>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl leading-[1.15] text-balance mx-auto max-w-[26ch]">
          This page slipped out of the margins.
        </h1>
      </Reveal>
      <Reveal delay={2}>
        <div className="mt-10 flex justify-center">
          <Link to="/" className="btn-primary">Back to the desk</Link>
        </div>
      </Reveal>
    </section>
  );
}
