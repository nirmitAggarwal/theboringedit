import { generatedPosts, generatedTracks } from "../generated/content";
import type { Post, Track } from "./types";

export const posts: Post[] = [...generatedPosts].sort((a, b) =>
  b.date.localeCompare(a.date)
);

export const tracks: Track[] = [...generatedTracks].sort((a, b) =>
  a.title.localeCompare(b.title)
);

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAdjacent(slug: string): { newer?: Post; older?: Post } {
  const i = posts.findIndex((p) => p.slug === slug);
  if (i === -1) return {};
  return { newer: posts[i - 1], older: posts[i + 1] };
}

export function getTrack(slug: string): Track | undefined {
  return tracks.find((t) => t.slug === slug);
}

/**
 * Posts of a track ordered by their author-assigned `trackIndex` (part 01,
 * part 02, …). Un-indexed posts are not listed — the compiler warns about
 * them at build time.
 */
export function getTrackPosts(slug: string): Post[] {
  return posts
    .filter((p) => p.track === slug && p.trackIndex != null)
    .sort((a, b) => a.trackIndex! - b.trackIndex!);
}

export interface TrackMembership {
  track: Track;
  index: number;
  total: number;
  /** Previous / next part within the track (binge navigation) */
  prev?: Post;
  next?: Post;
}

/** This post's position inside its track, or undefined if untracked. */
export function getTrackMembership(post: Post): TrackMembership | undefined {
  if (!post.track) return undefined;
  const track = getTrack(post.track);
  if (!track) return undefined;
  const parts = getTrackPosts(track.slug);
  const i = parts.findIndex((p) => p.slug === post.slug);
  if (i === -1) return undefined;
  return {
    track,
    index: post.trackIndex ?? i + 1,
    total: parts.length,
    prev: parts[i - 1],
    next: parts[i + 1],
  };
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function formatPostDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
