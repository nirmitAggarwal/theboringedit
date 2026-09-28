import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type RevealKind = "block" | "media";

interface RevealProps {
  children: ReactNode;
  /** Stagger step, multiplied by 80ms */
  delay?: number;
  /** "media" uses the clip-path wipe (for images/artwork) */
  kind?: RevealKind;
  className?: string;
}

export function Reveal({ children, delay = 0, kind = "block", className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const base = kind === "media" ? "reveal-media" : "reveal";
  return (
    <div
      ref={ref}
      className={`${base}${visible ? " is-visible" : ""} ${className}`.trim()}
      style={{ "--reveal-delay": delay } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
