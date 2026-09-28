import { Link } from "react-router-dom";
import type { Track } from "../lib/types";
import { pad2 } from "../lib/format";

interface TrackBadgeProps {
  track: Track;
  /** 1-based position inside the track, e.g. "rust · 03" */
  index?: number;
  /** Render as a plain span instead of a link (used inside post rows) */
  static?: boolean;
}

export function TrackBadge({ track, index, static: isStatic }: TrackBadgeProps) {
  const style = track.color ? { borderColor: track.color, color: track.color } : undefined;
  const label = (
    <>
      <span aria-hidden="true">↳</span>
      {track.title}
      {index != null && <span className="opacity-70"> · {pad2(index)}</span>}
    </>
  );

  if (isStatic) {
    return (
      <span className="chip" style={style}>
        {label}
      </span>
    );
  }
  return (
    <Link to={`/tracks/${track.slug}`} className="chip" style={style}>
      {label}
    </Link>
  );
}
