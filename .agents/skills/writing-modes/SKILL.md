---
name: writing-modes
description: Named writing styles the user can request in a prompt (EzExplain, Fun&Games, Academic, Interview, Devlog, Deathmatch, and friends). Load when the user names a mode; its voice rules override the write-post defaults.
---

# Writing modes

When the user's prompt names a mode — "use EzExplain", "write it Fun&Games",
"reference-sheet please" — apply that mode's rules to **every sentence** of
the post: title, subtitle, excerpt, body, comments, quest items, footer.
Structure (frontmatter, figures, validation) still comes from the write-post
skill; only the voice changes. If a user asks for a mode that isn't defined
here, define it inline from their description, use it, and suggest adding it
to this file.

**Mixing:** one mode per post unless the user explicitly names two; if two,
the *later-named* one wins the body, the earlier sets the title/excerpt.

---

## EzExplain

*Trigger:* "EzExplain", "explain like I'm five-ish", "absolute beginner".

Explain to a smart person who has **never written a line of this language
before**. No assumed vocabulary — every term of art is defined in one
parenthetical or dash aside the first time it appears, and used consistently
after ("immutable (frozen — you cannot change it later)"). Analogies do the
heavy lifting: one strong analogy per concept, drawn from everyday life
(boxes, kitchens, traffic), kept consistent across the whole post — do not
switch metaphors mid-explanation. Short sentences. Short paragraphs (2–4
lines). One idea per paragraph. Order strictly from what the reader already
knows to the new thing; no forward references ("we'll cover X in part 12" is
fine, *using* X before part 12 is not). Every code example runs and is shown
with its output in a `text` block. Jargon allowed only after its definition,
and an acronym is spelled out on first use. Title says what the reader will
be able to *do* ("Rusty's Type" + subtitle promising "explained like you're
new here"). Quest items are tiny wins (declare a variable, break it, fix it),
not mini-projects. Reading level target: a motivated 14-year-old.

## Fun&Games

*Trigger:* "Fun&Games", "sarcastic", "jokes everywhere", "roast me".

The bash-track register turned up: sarcastic, bit-heavy, jokes in
every section — but **every joke must pay rent** by framing the technical
truth, and the technical truth must survive the joke (the reader should be
able to learn from the punchline alone). Running bits are welcome: pick a
premise per post (a trial, a nature documentary, a customer-service call) and
commit for the whole piece. Roast *the technology and common programmer
suffering*, never the reader — the reader is the co-conspirator, the
language is the butt. Code comments carry jokes; output stays truthful.
Section titles may be punchlines but the first body line always lands the
actual content. Blockquotes for "a moment of ceremony" asides. End the quest
with at least one self-aware item ("Break something on purpose. Apologize to
no one."). Profanity: none; innuendo: none; punching down: never. Sarcasm
density ceiling: if a paragraph has two jokes and one fact, cut a joke.

## ReferenceSheet

*Trigger:* "reference sheet", "cheat sheet mode", "table mode".

Maximum density, minimum prose. Lead every section with a table or code
block; sentences exist only to warn about gotchas (and are bolded). No
analogies, no narrative arc, no humor beyond dry one-line warnings. Every
section: a `summary` code block at the end. TOC is the product — section
titles must be scannable ("Integers — sizes, literals, overflow", "The cheat
sheet"). Longest paragraph: two lines. Quest becomes "Try these" with
one-liner commands.

## WarStory

*Trigger:* "war story", "narrative mode", "story mode".

First-person-plural narrative around one extended scenario: a real-feeling
incident (an outage, a deadline, a haunting bug) that the post's concepts
*resolve*. Concepts appear exactly when the story needs them. Code blocks are
evidence, not lectures. Present tense, clock timestamps allowed ("3:07 AM.
The retry loop is still retrying."). The quest becomes "Your debrief": what
went wrong, what you'd do differently. Humor allowed but understated.

## ZeroToShipped

*Trigger:* "build along", "project mode", "zero to shipped".

One project built start-to-finish inside the post. Every section produces a
checkpoint that compiles/runs ("After this section: `cargo run` prints …").
Chapters numbered like the track parts. Code grows incrementally — show
diffs-of-intent ("add this under `main`") rather than reprinting whole files,
but reprint the full file at each major milestone. Ends with the shipped
artifact and a "Where to take it next" list instead of a quest.

## Academic

*Trigger:* "academic", "paper mode", "formal", "rigorous".

Write like a well-written conference paper or graduate textbook chapter:
precise, hedged, citation-minded. Register: no contractions, no rhetorical
exclamation, first person plural limited to "we observe", "we define".
Structure is load-bearing — open with a short **Abstract** blockquote (3–5
sentences: problem, approach, result), then **Definitions** (each term of art
given a numbered definition), then the body in **claim → formal statement →
example → caveat** rhythm. Use the site's LaTeX freely: notation is primary,
prose translates it. Every claim that has a known boundary gets one
("holds for $n \geq 1$; the $n = 0$ case degenerates"). Claims are attributed
("Hoare, 1978") inline rather than with a bibliography unless the user asks.
No jokes; dry understatement is the ceiling of humor. Code blocks are minimal
demonstrations, always with output, framed as "Example 3." The quest becomes
**Exercises**: 3–5 items escalating from recall to application, at least one
proof-shaped ("show that …").

## Interview

*Trigger:* "interview style", "Q&A", "conversation mode".

The post is a staged interview between an eager, sharp **Interviewer** (asks
what the reader would ask) and a patient **Expert** (who happens to know the
answers). Section headings (H2) are the Interviewer's questions, verbatim and
specific — "Why does Rust panic on overflow instead of wrapping?" — never
generic ("Overview", "Introduction"). Answers are conversational but exact:
the Expert defines terms when using them, concedes genuine tradeoffs ("a fair
criticism"), and corrects the Interviewer's small wrong assumptions — that
correction is where misconceptions die. Follow-up questions drill one level
deeper than the reader expected; that drill is the mode's signature move.
Formatting: answers may use code and lists freely; the Interviewer's voice
appears only in headings and occasional one-line interjections in italics.
No narrative arc needed; the question sequence IS the structure, ordered easy
→ deep. The quest becomes **Questions you should now be able to answer** —
literally a list of the interview questions, mixed with a few new ones.

## Devlog

*Trigger:* "devlog", "journal mode", "building in public".

A first-person-singular journal of actually building something, honest about
the mess. Organized as dated entries inside the post (H2: "Day 1 — the
confident phase", "Day 3 — why is everything on fire"); each entry is past
tense, what was attempted, what broke, what was learned, with the actual
commands/errors as receipts (`text` blocks of real-looking stack traces).
Numbers over adjectives: LOC, timings, benchmark deltas, money spent. Wrong
turns are content, not embarrassing asides — the reader learns as much from
"I rewrote it and why" as from the working result. Voice: casual, self-deprecating
but never self-flagellating; no lecture mode — conclusions are earned by the
last entry, not announced in the first. End each entry with a one-line
**Status:** footer ("Status: builds, tests red, morale uncertain"). The quest
becomes **Next week**: 3–4 concrete TODOs continuing the project.

## Deathmatch

*Trigger:* "deathmatch", "versus", "X vs Y", "comparison mode".

Two (or three) technologies, paradigms, or approaches, compared honestly in a
boxing-match frame. Structure is rounds: H2 per round with a real
competitive axis — "Round 1: error handling", "Round 2: performance under
load", "Round 3: hiring and ecosystem" — each round showing the *same task*
done in both corners (side-by-side code blocks, same problem, so differences
are visible, not vibes). Every round names a winner and, crucially, the
*conditions* under which the loser wins instead — there is no absolute
champion, and saying so plainly is the mode's credibility. Include a scoring
table near the end (rows = rounds, columns = contenders, ✓/✗) and a verdict
section that hands the reader a decision rule: "choose A if you need …;
B if …". Roast both corners evenly; fanboying is a disqualification. Quest
becomes **Your title fight**: run the same small task in both corners and
write down which hurt less and why.
