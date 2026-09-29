---
title: "Bash: Forks in the Road"
subtitle: "if, elif, else, and case — how to make a script that decides things, powered entirely by the ancient question 'but did it exit zero?'"
date: 2026-09-29
tags: [bash, if, case, conditionals]
slug: bash-forks-in-the-road
track: bash-smash
trackIndex: 7
excerpt: "Part 07 of the bash crash course: conditionals — if/elif/else, the test brackets and their gotchas, file existence checks, and case, the most readable spell in the book."
---

Until today, your scripts have been conveyor belts: top to bottom, no thought.
Today they grow opinions. Conditionals let a script look at the world and pick
a path — and in a plot twist that will never stop being funny, all that
decision-making power rests on a single question inherited from part 05: *did
the last thing exit zero?*

## The if

```bash
if grep -q "dragon" prophecy.txt; then
  echo "Pack the fireproof cloak."
fi
```

Anatomy, because the punctuation is load-bearing:

- `if … then` on one line, separated by a semicolon (or a real line break)
- `grep -q` — the `-q` (quiet) flag: *don't print matches, just report success
  or failure*. It's a pure yes/no probe
- `fi` — "if" backwards, because bash closes doors the way it opens them, and
  the 1980s thought this was charming. It is. You'll miss `fi` in every other
  language.

And the else:

```bash
if grep -q "dragon" prophecy.txt; then
  echo "Pack the fireproof cloak."
else
  echo "Prophecy is boring. Take snacks."
fi
```

And elif — "else if", for scripts with ranges of opinions:

```bash
count=$(grep -c "dragon" prophecy.txt)
if [ "$count" -eq 0 ]; then
  echo "No dragons. Suspicious, honestly."
elif [ "$count" -eq 1 ]; then
  echo "One dragon. Manageable."
else
  echo "Multiple dragons. Reconsider career."
fi
```

## The brackets: test in a costume

Here's the secret hiding in plain sight: `[ … ]` is not punctuation. It's a
**command** — an alias for `test`, a program that checks conditions and exits
zero (true) or non-zero (false). That's why the spaces around the brackets are
mandatory: bash needs to see it as a command name followed by arguments.

```bash
[ "$age" -gt 100 ]     # the command "test", wearing square brackets
```

Forget a space and bash tries to execute `["$age"` as a command name and fails
in ways that generate exactly zero useful error messages. This single missing
space has consumed more beginner hours than any other bug in this course. Put
it in your notes. Tattoo optional.

Which brackets, though? Bash offers two dialects:

- `[ … ]` — the classic. Portable: works in every shell ever made. Strict,
  minimal, occasionally pedantic.
- `[[ … ]]` — the bash-only upgrade. More forgiving and more powerful: no word
  splitting surprises, pattern matching, and `&&` / `||` operators inside.

This course uses `[[ ]]` (you're here for bash), but you'll meet `[ ]` in every
old script on every server, so learn to read both.

### The test vocabulary

Numbers, strings, files — three families:

```bash
# numbers (mnemonic: 'g'ter, 'l'ess, 'e'qual — the letters are the operators)
[ "$count" -eq 3 ]     # equal
[ "$count" -ne 3 ]     # not equal
[ "$count" -gt 3 ]     # greater than
[ "$count" -lt 3 ]     # less than

# strings
[ "$name" = "Gandalf" ]    # equal (yes, one = here; bash hates consistency)
[ "$name" != "Sauron" ]    # not equal — also a valid security policy
[ -z "$name" ]             # zero length: is the string empty?
[ -n "$name" ]             # non-zero: does it have content?

# files — the three you'll use weekly
[ -f potion.txt ]     # exists and is a regular file
[ -d potions ]        # exists and is a directory
[ -s potion.txt ]     # exists and is non-empty
```

And the connectors:

```bash
[[ -f potion.txt && -s potion.txt ]]    # AND: exists AND has content
[[ "$age" -lt 18 || "$age" -gt 200 ]]   # OR: outside the mortal range
[[ ! -f dragon.txt ]]                   # NOT: dragon file is missing
```

`&&` and `||` also work *between commands*, which is a lovely piece of
shorthand you'll use forever:

```bash
mkdir -p backups && cp save.log backups/    # copy only if the folder got made
grep -q "ok" health.log || echo "ALERT: not ok"    # shout only if the check failed
```

## The granddaddy: does the file exist

The single most common conditional in real scripts:

```bash
if [[ -f config.env ]]; then
  source config.env
  echo "Config loaded."
else
  echo "No config found. Running on vibes."   # (vibes are not a supported feature)
fi
```

## case: the readable one

When you're comparing one value against many options, chains of elif turn into
a staircase. `case` is the elevator:

```bash
read -p "Choose your familiar: " pet
case "$pet" in
  cat)     echo "Aloof. Powerful. Judges your commits." ;;
  owl)     echo "Mail service included. Hooting extra." ;;
  toad)    echo "Moist companion. Low maintenance, high warts." ;;
  dragon)  echo "Ambitious. Please check your insurance." ;;
  *)       echo "Unknown familiar. It chose YOU." ;;
esac
```

Read it: `case VALUE in pattern) body ;;` — each pattern tries in order, `*`
is the catch-all "anything else", and `esac` closes it, because yes, "case"
backwards, they really did that consistently.

This pattern is everywhere in real scripts: argument parsing, install menus,
"which OS am I on" checks. It's also the most *readable* spell in bash, which
given the competition is not a high bar, but still.

## Your quest

- [ ] Write `weather.sh`: a variable holding `"rain"`, and an if/else that
      packs an umbrella or sunglasses accordingly
- [ ] Deliberately remove a space before `]]`. Meet the error. Return the
      space. Never speak of it again.
- [ ] Write a check: `[[ -d backups ]] || mkdir backups` — the "ensure folder"
      one-liner you'll use in every script from now on
- [ ] Port the familiar chooser to `case`, add your own animal

Next: [part 08 — The Loop](/blog/bash-the-loop), where one spell learns to
cast itself a thousand times — `for`, `while`, and the file-iterating moves
that define the shell.

> Filed under [Wizardy of Bash](/tracks/bash-smash) — part 07 of 15 ·
> Previous: [Labelled Boxes](/blog/bash-labelled-boxes) · Next: [The
> Loop](/blog/bash-the-loop)
