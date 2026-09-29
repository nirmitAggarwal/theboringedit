---
title: "Rusty's Type"
subtitle: "Integers that know their own size, floats that drift, tuples that carry groceries, and enums that ended a billion-dollar mistake — everything a value is, explained like you're new here. Because you are. Welcome."
date: 2026-09-29
tags: [rust, basics, types]
slug: rustys-type
track: rust
trackIndex: 3
excerpt: "Part 03 of the Rust crash course: every primitive type (integers, floats, bool, char, tuples, arrays), variables and shadowing, constants vs statics, and custom types with structs and enums — with code and output at every step."
---

In [part 02](/blog/rustys-hello-world) we learned to *speak*. Today we learn
*what the words mean*. Every value in a Rust program has a **type** — a
contract, written down at compile time, describing exactly what the value is
and what you may do to it. `5` is a number. `"5"` is text. Mixing them up is
not a bug you find at 2 AM in production; it's an error the compiler shows you
while you're still typing, coffee in hand, dignity intact.

That's the whole philosophy of this article: **in Rust, types are not
paperwork. They're the guard rails.** Let's walk the whole fence.

![Primitive type boxes and two cards showing a struct and an enum](/images/rust-type.svg "fig. 03 — Rusty's type: primitives on the shelf, your own types beside them")

## Variables: let, mut, and the art of shadowing

Rust variables are **immutable by default**. You declare with `let`, and the
binding is frozen unless you ask for a changeable one with `mut`:

```rust
fn main() {
    let hp = 100;        // immutable: hp = 95 would be a compile error
    let mut mana = 50;   // mutable: free to change
    mana = 42;

    println!("hp = {hp}, mana = {mana}");
}
```

Output:

```text
hp = 100, mana = 42
```

Why freeze things by default? Because most bugs are things *changing that
shouldn't have*. Immutability makes the compiler your witness: if a value can
change, you wrote `mut`, so you always know where to look. It's the `set -u`
of [part 11 of the bash course](/blog/bash-defensive-wizardry), but built into
the language's spine.

### Shadowing — declare it again, fresh

You can redeclare the same name with a new `let`. The new binding *shadows*
the old one from that point on:

```rust
fn main() {
    let spaces = "   ";      // a &str — three characters
    let spaces = spaces.len(); // a usize — the number 3
    println!("spaces = {spaces}");
}
```

Output:

```text
spaces = 3
```

Note what shadowing is *not*: it's not `mut`. With `mut`, the same box changes
contents — and its type can never change. With shadowing, you get a **brand
new box** with the same name, which may even hold a different type (above:
text became a number). Handy for conversions mid-function without inventing
names like `spaces_str`, `spaces_num`, `spaces_final_v2`.

## Type annotations and inference

You usually don't write the type — the compiler **infers** it:

```rust
let x = 5;          // compiler: "integer. I'll pick i32."
let y = 2.5;        // "float. f64."
let flag = true;    // "bool."
let letter = 'z';   // "char."
```

But inference isn't psychic. When a value could legally be several types, you
annotate with a colon:

```rust
let guess: u32 = "42".parse().expect("not a number");
//                   ^ parse could give u8, i16, u64... you must choose
```

Rule of thumb: let inference do the local work; write annotations where the
meaning would otherwise be ambiguous — function signatures, struct fields,
global constants. (We'll hit all three.)

## Integers — a number for every size of worry

Rust has **12 integer types**, and their names are the documentation. Each is
a *signedness* plus a *bit width*:

| Type | Range | Notes |
| --- | --- | --- |
| `i8` / `u8` | −128..127 / 0..255 | 8 bits — a byte. `u8` is what file I/O speaks |
| `i16` / `u16` | ±~32 thousand / 0..65,535 | 16 bits — audio samples live here |
| `i32` / `u32` | ±~2.1 billion / 0..~4.2 billion | **i32 is the default** |
| `i64` / `u64` | ±~9 quintillion | timestamps, big counters |
| `i128` / `u128` | absurdly large | cryptography, nerd flexes |
| `isize` / `usize` | pointer-sized (64-bit on most machines) | indexing and memory math |

- **`i` = signed** (can be negative), **`u` = unsigned** (zero and up only).
  The number is *bits*, so a `u8` holds 2⁸ = 256 different values.
- **`usize`** is the type of array indices and `.len()` — it's as wide as a
  memory address on your platform. You'll meet it constantly.

```rust
let a: i32 = -42;
let b: u8 = 255;
let big = 1_000_000_i64;  // underscores are free readability
let hex = 0xff;           // 255
let oct = 0o77;           // 63
let bin = 0b1010_1010;    // 170
let byte = b'A';          // 65u8 — a byte literal
println!("{a} {b} {big} {hex} {oct} {bin} {byte}");
```

Output:

```text
-42 255 1000000 255 63 170 65
```

### The overflow story (this is the good part)

What happens when a `u8` holding 255 gets +1? In C, undefined behavior. In
many languages, silent wrapping. Rust does something characteristically
honest:

- **Debug builds** (`cargo run`): **panic**. Your program stops dead and tells
  you. Loudly. In the console. At the exact line.
- **Release builds** (`cargo run --release`): it wraps — two's complement —
  255 + 1 becomes 0. The fast path is quiet, so the loud path exists to warn
  you *before* you ship.

And if wrapping is genuinely what you want, you say so, in words:

```rust
let x: u8 = 255;
// x + 1;                 // panics in debug
let _ = x.wrapping_add(1);   // 0  — on purpose
let _ = x.saturating_add(1); // 255 — clamps at the ceiling
let _ = x.checked_add(1);    // None — an Option that admits it overflowed
```

The language refuses to *guess*. You choose the behavior; the code states it.

## Floats — precise enough, and honest about it

Two types: `f32` (single precision) and `f64` (double precision, the
default). They follow IEEE-754, the same standard as everyone else, which
means they're **approximations**:

```rust
let x = 2.0;      // f64
let y: f32 = 3.0; // f32

println!("{}", 0.1 + 0.2);          // 0.30000000000000004 — hello, old friend
println!("{}", 0.1 + 0.2 == 0.3);   // false — never == floats directly
println!("{}", (0.1 + 0.2 - 0.3).abs() < 1e-10); // true — compare with a tolerance
```

Output:

```text
0.30000000000000004
false
true
```

Three house rules: don't mix `f32` and `f64` in one expression (the compiler
won't allow it silently), don't use `==` on computed floats (compare with a
tolerance), and for money use integer cents. Rust won't fix floating point —
nobody can — but it won't let you mix precisions *by accident*.

One more resident of number-town: **division behaves by type**. `7 / 2` with
two integers is `3` (truncated). `7.0 / 2.0` is `3.5`. The types decide the
operation, not the other way around.

## bool — the two-state switch

```rust
let t = true;
let f: bool = false;

println!("{}, {}", t, !f);        // true, true
// if t { ... }                    // bool, and ONLY bool, goes in an if
```

`if` in Rust takes a `bool` and *nothing else* — no `if 1`, no truthy strings,
no "empty list is false". If you've been burned by a language where `0 ==
false` was somehow `true`, this is the truce you've been waiting for.

## char — one honest Unicode letter

A `char` is a single **Unicode scalar value**, four bytes wide, in single
quotes (double quotes are strings):

```rust
let c = 'z';
let heart = '❤';
let cat = '🐱';

println!("{} {} {}", c, heart, cat);
```

Output:

```text
z ❤ 🐱
```

Four bytes means it can hold any Unicode scalar — emoji included — with no
encoding surprises. (A full *string* is UTF-8 in memory, so a string's length
in *bytes* and its count of *characters* can differ — a rabbit hole for the
strings chapter.)

## Tuples — the carry-all bag

A tuple glues a fixed number of values, possibly of *different* types, into
one thing:

```rust
fn main() {
    let item: (&str, f64, u32) = ("coffee", 3.50, 2); // name, price, quantity

    println!("{}", item.0);        // access by index: coffee
    println!("{}", item.1 * item.2 as f64); // 7.0

    let (name, price, qty) = item; // destructuring — unpack in one line
    println!("{name} x{qty} = {}", price * qty as f64);
}
```

Output:

```text
coffee
7
coffee x2 = 7
```

Destructuring is the payoff: one value comes out of the function, unpacks at
the destination, no temp variables. The empty tuple `()` — **"unit"** — is
Rust's "nothing", the type of a function that returns nothing. Every
expression in Rust has a type, even the ones that mean "I have nothing to
give you."

## Arrays — same type, fixed size, lives on the stack

An array holds **N values of one type**, and N is part of the type itself:

```rust
fn main() {
    let dice = [1, 2, 3, 4, 5, 6];      // [i32; 6] — the 6 is IN the type
    let zeros = [0u8; 512];             // 512 zeros, one line

    println!("{} {} {}", dice.len(), dice[0], zeros.len());
    // dice[9];                          // panics: index out of bounds — checked, always
}
```

Output:

```text
6 1 512
```

Two things worth underlining. First, **out-of-bounds indexing panics** — Rust
checks every array access at runtime instead of letting you read garbage
memory. Second, because the length is part of the type, arrays can't grow.
For "a list I'll add things to", you want `Vec<T>` — a later chapter. Arrays
are for when the size is *known and fixed*: a die, RGB pixels, lookup tables.

## Constants — known at compile time, forever

`const` looks like `let` but plays a different sport. Three rules make it
distinct:

```rust
const MAX_PLAYERS: u32 = 4;              // 1. type is REQUIRED
const SECONDS_IN_HOUR: u32 = 60 * 60;    // 2. computed at COMPILE time
const WELCOME: &str = "hello, player";   // 3. UPPER_SNAKE_CASE by convention

fn main() {
    println!("{WELCOME} — max {MAX_PLAYERS}, hour = {SECONDS_IN_HOUR}s");
}
```

Output:

```text
hello, player — max 4, hour = 3600s
```

- The type must be written out — no inference.
- The value must be computable **at compile time**: literals, arithmetic,
  other constants. No function calls that need to run, no heap.
- Constants can live at *any* scope, including top-level, outside any
  function — because they're inlined wherever used, not stored anywhere.

How is that different from an immutable `let`? `let x = 5;` creates a
*binding* at runtime; `const MAX: u32 = 5;` is more like a note the compiler
substitutes everywhere you wrote it. Use `const` for magic numbers and fixed
configuration — anything where changing the value means recompiling anyway.

> There's also **`static`** — `static APP_NAME: &str = "boring";` — which is a
> constant with a *fixed memory address* for the program's whole life. Reach
> for `const` first; you'll meet `static` again with globals and `lazy_static`.

## Structs — build your own type, part 1

Primitives describe *numbers and letters*. Real programs traffic in *things*:
users, invoices, dragons. A **struct** bundles related values into one named
type:

```rust
#[derive(Debug)] // asks the compiler to auto-generate the printing trait from part 02
struct Dragon {
    name: String,
    wingspan: f64,   // meters
    fire: bool,
}

fn main() {
    let mut smaug = Dragon {
        name: String::from("Smaug"),
        wingspan: 12.5,
        fire: true,
    };

    smaug.wingspan = 13.0;                  // mutate one field (needs the whole dragon to be mut)

    let smaug2 = Dragon {                   // struct update syntax: clone the rest
        wingspan: 15.0,
        ..smaug
    };

    println!("{:?}", smaug2);
}
```

Output:

```text
Dragon { name: "Smaug", wingspan: 15.0, fire: true }
```

Field access is `thing.field`, mutation needs the *whole* struct to be `mut`,
and `..base` copies the remaining fields from another instance. The
`#[derive(Debug)]` line is the trick from part 02 that makes `{:?}` printing
free.

Structs come in three flavors, and the other two are just… terser:

```rust
struct Point(f64, f64);   // tuple struct — fields have no names
struct Anchor;            // unit struct — carries no data, is itself the value

fn main() {
    let origin = Point(0.0, 0.0);
    println!("x = {}", origin.0); // access by index, like a tuple
}
```

Output:

```text
x = 0
```

Tuple structs are great for "a thing that is fundamentally one value with a
stronger identity" — a `Meters(f64)` is not interchangeable with a
`Seconds(f64)`, and the compiler now enforces that. (This trick is called a
*newtype*, and it's free domain modeling.)

### Methods — teaching the struct to do things

Types get behavior through `impl` blocks. Functions taking `Self` as their
first parameter are **methods**; ones without it are **associated functions**
(your constructors live here):

```rust
struct Dragon {
    name: String,
    fire: bool,
}

impl Dragon {
    // associated function — no self — called as Dragon::hatch()
    fn hatch(name: &str, fire: bool) -> Dragon {
        Dragon { name: name.to_string(), fire }
    }

    // method — borrows self for reading (&self)
    fn describe(&self) -> String {
        match self.fire {
            true  => format!("{} breathes fire", self.name),
            false => format!("{} is disappointingly tame", self.name),
        }
    }

    // method — borrows self for mutation (&mut self)
    fn enchant(&mut self) {
        self.fire = true;
    }
}

fn main() {
    let mut d = Dragon::hatch("Puff", false);
    println!("{}", d.describe());
    d.enchant();
    println!("{}", d.describe());
}
```

Output:

```text
Puff is disappointingly tame
Puff breathes fire
```

The three flavors of `self` are a preview of part 05 (ownership and
borrowing) — for now: `&self` to read, `&mut self` to change, `self` to
consume. `Dragon::hatch(...)` with the double colon is how you call something
on the *type itself* rather than an instance.

## Enums — build your own type, part 2 (the famous one)

Where a struct says "this AND this AND this", an **enum** says "this OR this
OR this" — exactly one variant at a time. And Rust's variants can **carry
data**:

```rust
enum Shape {
    Circle(f64),                       // just a radius
    Rectangle { w: f64, h: f64 },      // named fields, like a struct
    Triangle(f64, f64, f64),           // three sides
}

fn area(s: &Shape) -> f64 {
    match s {                          // match = "which variant is this?"
        Shape::Circle(r) => std::f64::consts::PI * r * r,
        Shape::Rectangle { w, h } => w * h,
        Shape::Triangle(a, b, c) => {
            let s = (a + b + c) / 2.0; // Heron, for the curious
            (s * (s - a) * (s - b) * (s - c)).sqrt()
        }
    }
}

fn main() {
    let shapes = [Shape::Circle(1.0), Shape::Rectangle { w: 2.0, h: 3.0 }];
    for s in &shapes {
        println!("{:.2}", area(s));
    }
}
```

Output:

```text
3.14
6.00
```

Two powers compound here. `match` must handle **every variant** — add a
`Square` variant tomorrow and every `match` in the codebase that forgot it
becomes a compile error, not a support ticket. And variants hold whatever you
put in them: one value, named fields, or nothing.

This is the mechanism behind Rust's most famous decision. Other languages
express "a value that might not exist" with `null` — a value that is secretly
every type and no type, which Tony Hoare (who invented it) famously called his
*"billion-dollar mistake"*. Rust has no `null`. It has an enum:

```rust
enum Option<T> {
    Some(T),   // there IS a value, and it's a T
    None,      // there is no value
}
```

The compiler *forces* you to handle `None` before you can touch the value
inside:

```rust
let maybe: Option<i32> = Some(42);
// println!("{}", maybe + 1);      // COMPILE ERROR: can't add to an Option
println!("{}", maybe.unwrap_or(0) + 1); // 43 — you must choose a default
```

"Can this be missing?" becomes part of the type. If a function returns
`Option<User>`, the `?`-shaped question mark is written into the signature,
and forgetting it is impossible — the compiler checks every path. That's the
guard-rail philosophy again, applied to the single most common bug in the
industry.

Enums with `match` also make brilliant **state machines**, because illegal
states simply cannot be written:

```rust
enum Connection {
    Idle,
    Connecting { attempt: u32 },
    Open { sent: u64, received: u64 },
    Failed(String), // carries the error message with it
}
```

A `Connection` is *always exactly one* of those four. There is no value that
is somehow "connecting but also failed with no message" — that bug is
unrepresentable.

## Casting — `as`, and its sharp edges

Rust never converts numeric types implicitly — `i32` into `u8` must be
*explicit*, with `as`:

```rust
let big: i32 = 300;
let small = big as u8;        // truncates: keeps low 8 bits
println!("{big} -> {small}"); // 300 -> 44 (300 - 256)
```

Output:

```text
300 -> 44
```

`as` is fast and dumb: it just reinterprets the bits, so out-of-range values
truncate or wrap silently. For conversions that can fail, prefer the honest
APIs — `u32::try_from(big)` returns an `Option`/`Result` admitting the risk —
and for structurally safe widening, `From`/`Into` (`let x: i64 = 42.into();`).
A later chapter covers the whole conversion zoo; for today, know that `as`
exists, and that its silence is a choice, not an accident.

## The cheat sheet

```rust
let a = 42_i64;            // integer with suffix
let b: u8 = 255;           // annotated, will panic on overflow in debug
let c = 0xff;              // hex literal
let f = 2.5_f64;           // float (f64 default)
let t = true;              // bool — the ONLY thing if accepts
let ch = 'ñar';            // no wait, that's 3 chars; 'ñ' is one char
let tup = (1, "two", 3.0); // tuple: fixed, mixed types
let arr = [0u8; 4];        // array: fixed, one type, length in the type
const MAX: u32 = 100;      // compile-time, typed, UPPER_CASE
static NAME: &str = "ed";  // constant with a fixed address

struct Dragon { name: String, fire: bool }      // your type: AND
impl Dragon { fn new(name: &str) -> Self { ... } } // its behavior
enum Maybe { Some(i32), None }                  // your type: OR (exactly one)
type Meters = f64;                              // alias: a new name, same type
```

(Yes, the `ch` line was a trap — `'ñ'` is a `char`, `'ñar'` is a `&str`.
Single quotes for one, double quotes for many. The compiler said so before you
even ran it.)

## Your quest

- [ ] Declare `let x = 5;` then shadow it into a float and print both types
      using `{:?}` and `std::any::type_name` — meet your first type inspector
- [ ] Make a `u8` overflow in a debug build and *read the panic*; then fix it
      three ways: `wrapping_add`, `saturating_add`, `checked_add`
- [ ] Build a `Song` struct (title, artist, seconds) with a `summary(&self)`
      method; print three songs
- [ ] Write an enum `Payment` with variants `Cash(f64)`, `Card { last4: u16 }`,
      and `None`; write a `describe` function with `match` that handles all
      three — then add a fourth variant and enjoy the compiler doing your code
      review
- [ ] Replace a magic number in an old program with a `const` and feel the
      future you saying thanks

Next: [part 04 — control flow](/tracks/rust): `if` as an *expression*,
`loop`/`while`/`for`, and the full depth of `match` — including guards,
binding, and the `?` operator's cousin. The types are the nouns; next we get
the verbs.

> Filed under [Learning Rust](/tracks/rust) — part 03 of the series ·
> Previous: [Rusty's Hello World!](/blog/rustys-hello-world)
