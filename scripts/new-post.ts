/**
 * Scaffold a new post:
 *
 *   npm run new:post -- "My great post"
 *   npm run new:post -- "My great post" --tags rust,notes
 *   npm run new:post -- "Borrowing" --track rust --index 2
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { slugify } from "../src/lib/slug";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const postsDir = path.join(root, "content", "posts");

const args = process.argv.slice(2);
const flags = (name: string): string[] =>
  args.flatMap((a, i) => (a === `--${name}` ? [args[i + 1] ?? ""] : []));

const tags = flags("tags").at(-1) ?? "";
const track = flags("track").at(-1)?.trim() ?? "";
const index = flags("index").at(-1)?.trim() ?? "";

const knownFlags = new Set(["--tags", "--track", "--index"]);
const title =
  args
    .filter((a, i) => !knownFlags.has(a) && (i === 0 || !knownFlags.has(args[i - 1] ?? "")))
    .join(" ")
    .trim() || "Untitled post";

const slug = slugify(title);
const today = new Date().toISOString().slice(0, 10);
const file = path.join(postsDir, `${slug}.md`);

if (fs.existsSync(file)) {
  console.error(`✗ already exists: content/posts/${slug}.md`);
  process.exit(1);
}

fs.mkdirSync(postsDir, { recursive: true });

const trackLines = track
  ? `track: ${slugify(track)}\ntrackIndex: ${index || "?"}\n`
  : "";

const template = `---
title: "${title}"
date: ${today}
tags: [${tags}]
${trackLines}excerpt: ""
---

Write here. A few conventions:

- Math: inline \`$E = mc^2$\`, display \`$$\\\\int_0^1 x\\\\,dx$$\`
- Code: \`\`\`ts fences — add \`title="file.ts"\` for a filename label
- Images: put files in \`public/images/\`, then:

  ![alt text](/images/pic.png "Optional caption — prefix with 'full ' to widen")
`;

fs.writeFileSync(file, template, "utf8");

console.log(`✓ created content/posts/${slug}.md`);
if (track) {
  console.log(
    index
      ? `  filed under track "${slugify(track)}" as part ${index}`
      : `  track "${slugify(track)}" — set trackIndex: N in frontmatter (don't forget it!)`
  );
}
console.log(`  next: edit it, then run \`npm run content:build\` (or keep \`npm run content:watch\` running)`);
