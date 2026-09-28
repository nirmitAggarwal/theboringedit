---
title: "Rusty's Hello World!"
subtitle: "print!, println!, eprint!, eprintln!, write!, format! — every Rust printing macro explained, the formatting engine behind them, and Display vs Debug, with code and output."
date: 2026-09-28
tags: [rust, basics, macros]
track: rust
trackIndex: 2
excerpt: "A detailed tour of Rust's printing macros — print!, println!, eprint!, eprintln!, write! and format! — plus the formatting engine: positional and named args, padding, radix, and Display vs Debug with code-output examples."
---

Every language has a "hello world", and in Rust that one line already teaches
you three things: you're calling a **macro** (the `!`), output is **buffered**
(stdout is line-buffered on terminals), and formatting is a small language of
its own. This article is the complete tour of printing in Rust — the macros,
the engine that powers them, and the two traits every type eventually meets:
`Display` and `Debug`.

![A desk with a lamp, coffee and a sheet of paper](/images/desk.svg "fig. 01 — every Rust journey starts at a terminal")

## The five (okay, six) printing macros

| Macro | Stream | Newline | Returns |
| --- | --- | --- | --- |
| `print!` | stdout | no | `()` |
| `println!` | stdout | yes | `()` |
| `eprint!` | stderr | no | `()` |
| `eprintln!` | stderr | yes | `()` |
| `write!` | any `Write` target | no | `fmt::Result` |
| `format!` | nowhere (a `String`) | no | `String` |

The `e*` pair writes to **stderr** — errors, diagnostics, progress noise — so
that when someone pipes your program's stdout into a file, only the *real
output* lands in the file.

```rust
fn main() {
    print!("no newline here -> ");
    println!("hello, stdout");

    eprintln!("hello, stderr"); // invisible if you pipe stdout
}
```

Run it directly and you see everything. Redirect stdout and stderr separates:

```bash
$ cargo run
no newline here -> hello, stdout
hello, stderr

$ cargo run > out.txt        # stdout → file, stderr → screen
hello, stderr

$ cargo run 2> err.txt       # stderr → file, stdout → screen
no newline here -> hello, stdout
```

> Rule of thumb: **data goes to stdout, everything *about* the data goes to
> stderr.** Unix has thought this way since the 1970s; Rust just bakes it
> into the standard library.

## The `!` matters: macros, not functions

`println!` ends in `!` because it's a macro, not a function — and it *must*
be, for one beautiful reason: **variadic, heterogeneous, compile-checked
arguments.**

```rust
let x = 42;
println!("x = {}, x + 1 = {}", x, x + 1);
```

A Rust function takes a fixed number of arguments of fixed types. `println!`
takes *any number* of arguments of *any type that implements `Display`*, and
the compiler checks each one against the format string at compile time. Pass
two placeholders but one argument, and it's a **compile error**, not a
runtime panic:

```rust
println!("{} and {}", 1);
// error: 2 positional arguments in format string, but there is 1 argument
```

C's `printf` discovers this mistake at 2 AM in production. Rust discovers it
while you're still typing.

## The formatting engine

All six macros share one engine: **`std::fmt`**, driven by format strings.
Inside `{}`, a whole mini-language lives:

```text
{   argument   :   [[fill]align]  [sign]  [#]  [0]  [width]  [,]  [.precision]  type}
```

### Positional and named arguments

```rust
println!("{0} + {1} = {0}", 2, 3);          // 2 + 3 = 2 (repeat by index)
println!("{greet}, {name}!", greet = "Hi", name = "Rust"); // named
let (x, y) = (7, 8);
println!("{x} and {y}");                     // implicit capture (1.58+)
```

Output:

```text
2 + 3 = 2
Hi, Rust!
7 and 8
```

That third form — capturing variables straight from scope — is why so many
modern Rust programs read almost like prose.

### Width, fill and alignment

```rust
// name    width = 5, default align: left for str
println!("[{:5}]", "ab");        // [ab   ]
// pad with zeros (numbers only)
println!("[{:05}]", 42);         // [00042]
// choose fill + alignment
println!("[{:-<8}]", "ab");      // [ab------]
println!("[{:>8}]", "ab");       // [      ab]
println!("[{:^8}]", "ab");       // [   ab   ]
```

Output:

```text
[ab   ]
[00042]
[ab------]
[      ab]
[   ab   ]
```

Zero-padding + width is exactly how you get `01`, `02`, `03…` part numbers —
this site's track numbering is generated with the same trick in TypeScript,
but in Rust it's `{:02}` and done.

### Precision, radix, and the debug-hex pair

```rust
let pi = 3.141_592_65;
println!("{:.2}", pi);           // 3.14  — precision (rounds)
println!("{:+}", 42);            // +42   — force the sign
println!("{:b} {:o} {:x} {:X}", 255, 255, 255, 255);
println!("{:#x} {:#b}", 255, 5); // 0xff 0b101 — prefixed forms
println!("{:e}", 1234.5678);     // 1.2345678e3 — exponential
```

Output:

```text
3.14
+42
11111111 377 ff FF
0xff 0b101
1.2345678e3
```

### Escaping braces

Braces are syntax, so a literal one needs doubling:

```rust
println!("{{}} renders as {{...}}"); // {} renders as {...}
```

## Display — the human formatter

`std::fmt::Display` is the trait for **end-user-facing text**. `{}` means
"give me your Display form". It's what you'd print in a CLI report.

```rust
use std::fmt;

struct Point {
    x: i32,
    y: i32,
}

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}

fn main() {
    let p = Point { x: 3, y: 7 };
    println!("point: {}", p);
}
```

Output:

```text
point: (3, 7)
```

Note the shape of `fmt`: it receives a `Formatter` (which carries the width,
precision and flags the caller asked for) and returns a `fmt::Result`. The
`write!` macro inside returns that result — hence no semicolon. One quirk:
**you can't `impl Display` on a type from another crate** (orphan rules), and
the standard library deliberately does *not* implement `Display` for
`Vec<T>` or `Option<T>` — because there's no single obviously-correct human
format for a container. Which brings us to…

## Debug — the developer formatter

`std::fmt::Debug` is the trait for **you, the programmer**. `{:?}` means
"give me your Debug form". Where Display asks *what would a reader want to
see*, Debug asks *what would a debugger want to see*.

```rust
#[derive(Debug)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p = Point { x: 3, y: 7 };
    println!("{:?}", p);
    println!("{:#?}", p); // pretty-printed
}
```

Output:

```text
Point { x: 3, y: 7 }
Point {
    x: 3,
    y: 7,
}
```

`#[derive(Debug)]` generates all of it — that's the trait you'll use 90% of
the time, and it's why `unwrap()` panics can show you the value. Rust
enforces a useful split:

- `Display` for `Point`, `{}` → `(3, 7)` — compact, human
- `Debug` for `Point`, `{:?}` → `Point { x: 3, y: 7 }` — reconstructable,
  mechanical

Containers only implement `Debug` (never `Display`), so:

```rust
let langs = vec!["rust", "go", "zig"];
println!("{:?}", langs);   // ["rust", "go", "zig"] — works
// println!("{}", langs);  // error: `Vec<&str>` doesn't implement Display
```

Side by side on the same type:

```rust
#[derive(Debug)]
struct Version { major: u8, minor: u8, patch: u8 }

impl std::fmt::Display for Version {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "v{}.{}.{}", self.major, self.minor, self.patch)
    }
}

fn main() {
    let v = Version { major: 1, minor: 82, patch: 0 };
    println!("{} ({:?})", v, v);
}
```

Output:

```text
v1.82.0 (Version { major: 1, minor: 82, patch: 0 })
```

Display for the release notes, Debug for the bug report.

## write! and format! — the engine without the console

`println!` is really `format!` + a write to stdout. Once you see that, the
other two macros make sense:

**`format!`** returns a `String` — printing without a printer:

```rust
let user = "nirmit";
let greeting = format!("hello, {user}!"); // String, nothing printed
println!("{}", greeting);                 // hello, nirmit!
```

**`write!`** targets *anything implementing `std::io::Write` or
`std::fmt::Write`* — files, sockets, buffers, your own types:

```rust
use std::fmt::Write; // in-memory target; io::Write for real streams

fn main() {
    let mut out = String::new();
    write!(out, "x = {}", 42).unwrap();
    writeln!(out, " (and counting)").unwrap();
    println!("{out}");
}
```

Output:

```text
x = 42 (and counting)
```

Note `write!` returns a `Result` — because I/O can fail. That's also why
`write!` inside `fmt` implementations ends without a semicolon: you're
returning that result.

> There's also `writeln!`, the newline-sibling of `write!`, just like
> `println!` is to `print!`.

## Buffering: the gotcha that gets everyone

stdout is **line-buffered** on terminals but **block-buffered** when
redirected. Combine that with `print!` (no newline) and a panic, and output
vanishes:

```rust
fn main() {
    print!("about to panic... ");
    panic!("boom");
}
```

In some contexts the prompt never appears before the crash — the buffer died
with the process. The fix is an explicit flush:

```rust
use std::io::{self, Write};

fn main() {
    print!("continue? [y/n] ");
    io::stdout().flush().unwrap(); // force it out, right now
}
```

This is the single most common printing bug in Rust CLIs, and now you'll
recognize it on sight.

## The cheat sheet

```rust
print!("no newline");                    // stdout, no newline
println!("newline: {}", 1);              // stdout + \n
eprint!("stderr, no newline");           // stderr, no newline
eprintln!("stderr + newline");           // stderr + \n
let s = format!("{:05.1}", 3.14159);     // "003.1" — String
write!(buf, "into anything Writable")?;  // Result — propagate it
println!("{:?}", value);                 // Debug
println!("{:#?}", value);                // Debug, pretty
println!("{:#x}", 255);                  // 0xff
println!("{:+08.2}", 1.5);               // +0001.50
```

Output of the last line: `+0001.50` — sign, zero-fill, width 8, precision 2,
all in one specifier.

## What's next

This is **part 02** of the [Learning Rust](/tracks/rust) track — part 01,
[Introduction to Rust](/blog/introduction-to-rust), covers why the language
exists and how to install it. Next up, when it comes: `Read`/`Write` traits
in depth, then real-world CLIs with `clap`. The borrow checker can wait —
first, learn to say hello properly.
