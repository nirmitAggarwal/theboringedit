---
title: "Bash: The Quest Board"
subtitle: "Six capstone projects — renamer, backup, monitor, scaffold, cleanup, quiz — each one a working spell welded together from everything you've learned. Choose your quest."
date: 2026-09-29
tags: [bash, projects, finale]
slug: bash-the-quest-board
track: bash-smash
trackIndex: 15
excerpt: "Part 15, the finale of the bash crash course: six complete capstone scripts — bulk renamer, rotating backup, site monitor, project scaffolder, disk hunter, and a terminal quiz game — each built from the previous fourteen parts."
---

Fourteen parts ago, `$` was a strange rune and Ctrl+C was a prayer. Today it's
the finale of the [Wizardy of Bash](/tracks/bash-smash) bash crash
course, and there's nothing left to teach — only things to build. On the wall
of the guild hall hangs the quest board. Six quests. Each one is a real,
working script, and each is deliberately assembled from a specific set of
parts — so finishing one tells you *exactly* what you've mastered, and
skipping one tells you what to reread.

![The quest board](/images/bash-projects.svg "fig. 15 — the quest board: six quests, no level requirements, one rule — ship it")

## Quest I: renamer.sh — the herder

**Skills: loops (08), variables & quoting (06), command substitution (06),
arithmetic.** The classic first script, because the pain it cures is
universal: 400 files with terrible names.

```bash
#!/usr/bin/env bash
# renamer.sh — rename every file matching a pattern to prefix-001, prefix-002...
# usage: ./renamer.sh "Screenshot_" "trip"
set -euo pipefail                                # the ward (11)

pattern="${1:?Usage: renamer.sh <pattern> <prefix>}"
prefix="${2:?Usage: renamer.sh <pattern> <prefix>}"

n=1
for f in "$pattern"*; do                         # glob with the pattern; quoted for safety
  [[ -f "$f" ]] || continue                      # skip directories (07)
  ext="${f##*.}"                                 # everything after the last dot (parameter expansion)
  new=$(printf '%s-%03d.%s' "$prefix" "$n" "$ext")
  mv -n -- "$f" "$new"                           # -n: never clobber an existing file
  echo "$f → $new"
  n=$((n + 1))
done
echo "Herd complete: $((n - 1)) files renamed."
```

Run it on sacrificial files first: `mkdir practice && cd practice && touch
"Screenshot_a b.png" "Screenshot_c.png"` then
`~/bin/renamer.sh "Screenshot_" trip`. Note the space in that first filename —
that's the file that breaks unquoted scripts, and yours will eat it for
breakfast, because every variable is quoted and the ward is on.

## Quest II: backup.sh — the vault

**Skills: functions & arguments (09), tar, `trap` (11), cron (14).** Part 09
sketched this; here's the full build with rotation — keep a week, then prune:

```bash
#!/usr/bin/env bash
# backup.sh — dated, rotating backups of a folder
# usage: ./backup.sh <source> [dest] [keep]
set -euo pipefail

src="${1:?Usage: backup.sh <source> [dest] [keep]}"
dest="${2:-$HOME/backups}"
keep="${3:-7}"

[[ -d "$src" ]] || { echo "No such folder: $src" >&2; exit 1; }   # stderr for complaints (05)
mkdir -p "$dest"

stamp=$(date +%Y-%m-%d_%H%M)                     # minute-precision: no same-day collisions
archive="$dest/backup-$stamp.tar.gz"

tar -czf "$archive" "$src"
echo "✓ stored $archive ($(du -h "$archive" | cut -f1))"

# rotation: delete archives older than $keep days
find "$dest" -name 'backup-*.tar.gz' -mtime +"$keep" -print -delete   # (04: print, then delete)
echo "Rotation done. Kept the last $keep."
```

And the immortality step from part 14: `crontab -e`, then
`30 2 * * * ~/bin/backup.sh ~/projects >> ~/backups/backup.log 2>&1`. Your
data now backs itself up nightly while you dream. This is the script that
eventually saves your career; add the cron line the same evening.

## Quest III: monitor.sh — the watchman

**Skills: pipes (05), `until` (08), functions (09), `trap` (11), nohup (12).**
Watch a website and cry out when it falls:

```bash
#!/usr/bin/env bash
# monitor.sh — check a URL on a loop; log status changes
# usage: ./monitor.sh <url> [interval-seconds]
set -uo pipefail                                  # no -e here: a failed curl IS the data

url="${1:?Usage: monitor.sh <url> [interval]}"
interval="${2:-60}"
log="$HOME/monitor-$(date +%Y-%m-%d).log"
was_up="unknown"

cleanup() { echo "Watch ended. Log: $log" >&2; }
trap cleanup EXIT                                 # (11: tidy, whatever happens)

while true; do
  if code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 10 "$url"); then
    status="up ($code)"
  else
    status="DOWN"
  fi

  if [[ "$status" != "$was_up" ]]; then           # only speak on CHANGES: no spam
    echo "$(date '+%H:%M:%S') $url $status" | tee -a "$log"   # (05: screen AND file)
    was_up="$status"
  fi
  sleep "$interval"
done
```

Run it with part 12's survival spell: `nohup ~/bin/monitor.sh
https://yoursite.com 60 > /dev/null 2>&1 &` — it outlives your terminal and
logs every flip between up and down. Point it at something you love. It will
eventually go DOWN, and you'll be *glad* something was watching.

## Quest IV: scaffold.sh — the summoner

**Skills: functions (09), heredocs, `case` (07), defaults (06).** New
projects deserve rituals, not copy-paste archaeology:

```bash
#!/usr/bin/env bash
# scaffold.sh — summon a ready-to-work project folder
# usage: ./scaffold.sh <name> [python|node]
set -euo pipefail

name="${1:?Usage: scaffold.sh <name> [python|node]}"
type="${2:-python}"

mkdir -p "$name"
cd "$name"
mkdir -p src tests

case "$type" in                                   # (07: the readable fork)
  python)
    cat > README.md <<EOF                         # heredoc: a multi-line spell, no echo chorus
# $name
Created $(date +%Y-%m-%d). Rituals pending.
EOF
    touch src/main.py tests/test_main.py requirements.txt
    ;;
  node)
    cat > package.json <<EOF
{ "name": "$name", "version": "0.1.0", "scripts": { "test": "echo no tests yet" } }
EOF
    mkdir -p lib
    ;;
  *)
    echo "Unknown type: $type (want python or node)" >&2
    exit 1
    ;;
esac

git init -q
echo "✓ $name summoned ($type). Enter: cd $name"
```

The heredoc (`<<EOF … EOF`) is the new rune here: everything until the
terminator is written verbatim — *with variables expanded* — into the file.
It's the polite way to write templates. Your five-minute setup is now one
command, forever.

## Quest V: cleanup.sh — the hunter of hogs

**Skills: `find` (04), awk (10), `set -u` (11), interactive confirmation.**
A disk janitor that *asks before touching anything*:

```bash
#!/usr/bin/env bash
# cleanup.sh — find big, old files; delete only with consent
set -u                                            # no -e: we WANT to survive findings

dir="${1:-.}"
min_age="${2:-30}"                                # days untouched
min_size="${3:-50M}"

echo "Hunting in $dir: files > $min_size, untouched $min_age+ days"
find "$dir" -type f -size +"$min_size" -mtime +"$min_age" -print0 |
while IFS= read -r -d '' f; do                    # -print0/-d '': survives ALL filenames (spaces! newlines!)
  size=$(du -h "$f" | cut -f1)
  read -p "Delete $size  $f? [y/N] " answer
  [[ "$answer" == "y" ]] && rm -- "$f" || echo "spared: $f"
done
echo "Hunt complete."
```

The `read -p` confirmation makes it safe; the `-print0`/`-d ''` pairing makes
it *bulletproof* — the professional answer to "but what if a file has a
newline in its name" (someone's does). This is part 04's hunters, fully
domesticated.

## Quest VI: quiz.sh — the final exam

**Skills: arrays, `read`, arithmetic, exit codes — everything, plus one new
rune.** A tiny quiz game. The course's last new syntax is arrays, and you get
it as a reward:

```bash
#!/usr/bin/env bash
# quiz.sh — terminal trivia, self-administered graduation
set -u

questions=(
  "Which stream is the drunk friend shouting from the kitchen? (stdout/stderr)"
  "What exit code means success? (a number)"
  "Which key finishes your sentences? (a key)"
  "The four-letter ward? (a set command)"
)
answers=( "stderr" "0" "tab" "set -euo pipefail" )

score=0
for i in "${!questions[@]}"; do                   # arrays: "${!arr}" = the indexes
  read -p "$(echo "${questions[$i]}) ")" ans
  if [[ "${ans,,}" == "${answers[$i],,}" ]]; then   # ${var,,}: lowercase (bash 4+)
    echo "✓ correct"; score=$((score + 1))
  else
    echo "✗ it was: ${answers[$i]}"
  fi
done

echo "Score: $score/${#questions[@]}"             # ${#arr}: the count, like $# (06)
[[ $score -eq ${#questions[@]} ]] && echo "GRADUATE. The guild banner is yours." \
                                  || echo "The guild welcomes retry-takers. (14 parts await.)"
```

If you can *read* every line of that script without looking anything up — the
array indexing, `${var,,}`, `$(( ))`, the `&&`/`||` chain, the exit-code
humour at the end — you didn't take a quiz. You took a final exam, and the
score doesn't matter, because comprehension is the banner.

## After the quests

Ship all six into `~/bin/` (add `~/bin` to your `PATH` — part 06, full
circle), chmod +x each, and they're spells you cast from anywhere. Put them
in your dotfiles repo (part 13) and every future machine inherits your guild
achievements.

That's the whole course: prompt to pipelines, boxes to background jobs, wards
to quests. Fifteen parts, one honestly under-rated truth — the shell was the
real magic all along, and now it's *yours*. Go automate something you hate.

> Filed under [Wizardy of Bash](/tracks/bash-smash) — part 15 of 15 ·
> Previous: [The Wider Realm](/blog/bash-the-wider-realm) · Next: none — you
> are the next part.
