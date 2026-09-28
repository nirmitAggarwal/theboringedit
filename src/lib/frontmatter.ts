/**
 * Strips a leading `--- ... ---` block and parses the few fields we need.
 * Supports `key: value` and simple inline arrays `[a, b]`.
 */
export function parseFrontmatter(raw: string): {
  data: Record<string, string>;
  body: string;
} {
  const data: Record<string, string> = {};
  let body = raw;

  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (match) {
    body = raw.slice(match[0].length);
    for (const line of match[1].split(/\r?\n/)) {
      const kv = /^(\w[\w-]*):\s*(.*)$/.exec(line.trim());
      if (!kv) continue;
      let value = kv[2].trim();
      const arr = /^\[(.*)\]$/.exec(value);
      if (arr) {
        data[kv[1]] = arr[1]
          .split(",")
          .map((s) => s.trim().replace(/^["']|["']$/g, ""))
          .filter(Boolean)
          .join(",");
      } else {
        data[kv[1]] = value.replace(/^["']|["']$/g, "");
      }
    }
  }

  return { data, body };
}
