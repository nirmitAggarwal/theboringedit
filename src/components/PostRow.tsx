import { Link } from "react-router-dom";
import type { Post } from "../lib/types";
import { formatPostDate, getTrack } from "../lib/posts";
import { useAllProgress } from "../lib/progress";
import { pad2 } from "../lib/format";
import { TrackBadge } from "./TrackBadge";

interface PostRowProps {
  post: Post;
  index: number;
}

export function PostRow({ post, index }: PostRowProps) {
  const progressMap = useAllProgress();
  const read = progressMap[post.slug]?.done === true;

  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group grid grid-cols-[2.25rem_1fr] sm:grid-cols-[3rem_1fr_auto] gap-x-3 sm:gap-x-6 gap-y-3 border-t border-border py-7 sm:py-8 items-start"
    >
      <span className="font-mono text-xs text-muted-foreground pt-1.5 group-hover:text-primary transition-colors">
        {pad2(index + 1)}
      </span>

      <div className="min-w-0">
        <h3 className="font-display text-xl sm:text-2xl leading-snug text-balance group-hover:text-primary transition-colors">
          {post.title}
        </h3>
        <p className="mt-2 text-muted-foreground max-w-[52ch] text-[0.95rem] leading-relaxed">
          {post.excerpt}
        </p>
        {post.track && (
          <div className="mt-3.5">
            <TrackBadge track={getTrack(post.track)!} index={post.trackIndex} static />
          </div>
        )}
        {post.tags.length > 0 && (
          <div className="mt-3.5 flex flex-wrap gap-2">
            {post.tags.map((t) => (
              <span key={t} className="chip">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="col-start-2 sm:col-start-3 font-mono text-xs whitespace-nowrap pt-1.5">
        {read && <span className="text-primary">read ✓ · </span>}
        <span className="text-muted-foreground">
          {formatPostDate(post.date)} · {post.readingMinutes} min
        </span>
      </div>
    </Link>
  );
}
