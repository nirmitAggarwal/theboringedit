---
title: "Bash: Text Alchemy"
subtitle: "sed, awk, cut, sort, uniq, tr — the transmutation wing, where raw text dregs become gold and your colleagues' hour of Excel becomes your four keystrokes."
date: 2026-09-29
tags: [bash, sed, awk, text-processing]
slug: bash-text-alchemy
track: bash-smash
trackIndex: 10
excerpt: "Part 10 of the bash crash course: the text-processing battery — sed find-and-replace, awk column surgery, cut, sort, uniq, tr — and the pipelines that glue them into one-liners of mass productivity."
---

Unix was built by people who believed one thing with religious fervour: *all
data is text.* Logs, config, code, comma-separated anything — it's all just
lines, and lines can be sliced, filtered, reordered, and reassembled. So they
built a forge full of tools for exactly that. Today we open the forge.

The working sample, so every example is concrete:

```text
$ cat brews.csv
potion,price,stock
invisibility,50,12
love,99,1
mana,35,240
invisibility,50,12
firebreathing,120,3
```

![The alchemy bench](/images/bash-alchemy.svg "fig. 10 — text alchemy: crude text goes in one end, refined gold pours out the other, no cauldron scrubbing required")

## cut: the guillotine

Text with delimiters? `cut` takes columns:

```bash
cut -d, -f1 brews.csv          # -d: delimiter, -f: field
# potion
# invisibility
# love
# mana
# invisibility
# firebreathing

cut -d, -f2 brews.csv          # just the prices
cut -c1-8 brews.csv            # first 8 characters of every line (char mode)
```

One delimiter, one cut, zero fuss. When the data gets uglier, you'll want…

## sed: the find-and-replace warlock

`sed` (stream editor) edits text in flight. The 90% case:

```bash
sed 's/invisibility/uncertainty/' brews.csv
```

Read it: `s/old/new/` — substitute. Every line, invisibility becomes
uncertainty (a fair trade, honestly). But wait — it only replaced the *first*
occurrence per line. For all of them, add `g` (global):

```bash
sed 's/love/doom/g' brews.csv            # every occurrence, every line
sed 's/,/;/g' brews.csv                  # commas to semicolons (CSV → SCSV, a format nobody asked for)
sed -i 's/mana/aether/g' brews.csv       # -i = edit the file IN PLACE. The file changes. Forever.
```

`-i` deserves the respect `rm` got in part 03: it rewrites the file with no
undo and no ceremony. Test the spell *without* `-i` first, watch the output,
then commit.

Bonus moves:

```bash
sed -n '5,10p' big.log         # print only lines 5–10 (painless surgery)
sed '/^$/d' notes.txt          # delete empty lines (d = delete; /^$/ = "empty line" pattern)
```

## sort and uniq: the bouncers

```bash
sort brews.csv                       # alphabetical, whole lines
sort -t, -k2 -n brews.csv            # -t delimiter, -k key column, -n numeric
                                     # → sorted by price: 35, 50, 50, 99, 120
sort -t, -k2 -nr brews.csv           # -r reverse: richest potion first
```

And `uniq` — which does NOT do what its name whispers. It only collapses
*adjacent* duplicates, so it lives chained to `sort` like a conjoined twin:

```bash
cut -d, -f1 brews.csv | sort | uniq
# firebreathing
# invisibility      ← (appeared twice in the file; shown once here)
# love
# mana
# potion            ← (the header. It's a file, not a family member. no feelings were spared)
```

And the crown jewel — counts with duplicates preserved:

```bash
cut -d, -f1 brews.csv | sort | uniq -c | sort -rn
#   2 invisibility
#   1 potion
#   1 love
#   1 mana
#   1 firebreathing
```

Four commands, and you've just built an analytics engine. That chain —
`cut | sort | uniq -c | sort -rn` — is *the* "what appears most often in this
data" spell. It works on log files, word lists, commit messages, access logs,
your own bad habits. Memorise it as one gesture.

## tr: the rune translator

`tr` translates characters character-by-character. No files — it reads stdin
only (part 05, in its hour of need):

```bash
echo "WHISPER" | tr 'A-Z' 'a-z'      # whisper
echo "shout" | tr 'a-z' 'A-Z'        # SHOUT
echo "a,b,c" | tr ',' '\n'           # commas become newlines — instant vertical list
```

## awk: the whole wizard

Now the big one. `awk` treats every line as **columns** and gives you a
language to operate on them. `$1` is the first column, `$2` the second, `$0`
the whole line (bash's `$1` with a day job):

```bash
awk -F, '{print $2}' brews.csv             # -F: field separator. Column 2: prices.
awk -F, '{print $1, "costs", $2}' brews.csv
# invisibility costs 50
# love costs 99
```

Filter, like grep with column awareness:

```bash
awk -F, '$2 > 90 {print $1}' brews.csv     # potions costing over 90
# love
# firebreathing
```

Do *math* on the fly:

```bash
awk -F, 'NR > 1 {total += $2} END {print "Total value:", total}' brews.csv
# Total value: 354
```

`NR > 1` skips the header row, `total += $2` accumulates, `END {…}` runs after
the last line. That's a spreadsheet function in one line, no spreadsheet
launching, no spinner, no "Excel has stopped responding" — the emotional arc
of Excel in a single sentence.

## The full transmutation

Everything chains (part 05's pipes, now carrying precious cargo). Price list,
sorted by value, formatted:

```bash
tail -n +2 brews.csv | sort -t, -k2 -nr | head -n 3 | awk -F, '{print $1 " — " $2} '
# firebreathing — 120
# love — 99
# invisibility — 50
```

Read the assembly line: skip the header (`tail -n +2`), sort by price
descending, take the top three, print them prettily. A data pipeline. You
wrote a data pipeline. AWS charges corporations millions for less.

## Your quest

- [ ] Grab any CSV (export your passwords manager's "categories", whatever's
      legal) and `cut` three different columns
- [ ] Fix a typo across a file with `sed` — preview first, then `-i`
- [ ] Run the crown jewel (`sort | uniq -c | sort -rn`) on some log or list;
      identify your most frequent anything
- [ ] Sum a column with awk on real data. Compare with doing it by hand. Feel
      the fur grow.

Next: [part 11 — Defensive Wizardry](/blog/bash-defensive-wizardry), the
warding chapter: `set -euo pipefail`, `trap`, and debugging with `bash -x` —
because a spell you can't trust is a spell that deletes your backups at 3 AM.

> Filed under [Wizardy of Bash](/tracks/bash-smash) — part 10 of 15 ·
> Previous: [The Spell Factory](/blog/bash-the-spell-factory) · Next:
> [Defensive Wizardry](/blog/bash-defensive-wizardry)
