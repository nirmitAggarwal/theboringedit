---
title: "Introduction to Rust: why it exists, who runs on it, and how to start today"
subtitle: "The case for a language that refuses to choose between speed and safety — plus install instructions, first commands, and the communities that will answer your questions at 2 AM."
date: 2026-09-28
tags: [rust, basics, getting-started]
slug: introduction-to-rust
track: rust
trackIndex: 1
excerpt: "Why Rust exists, the memory problems it eliminates, which big organisations and projects run on it, how to install it in minutes, and the communities that support it."
---

Before a single line of `hello world`, it's fair to ask: **why another
language?** We already have C, C++, Java, Python, Go. This is part 01 of the
[Learning Rust](/tracks/rust) track, and it's the question this whole series
has to answer first — because if the "why" isn't convincing, nothing else
matters.

## The problem Rust was built for

Every language makes a trade between **safety** and **control**:

- **C / C++** give you total control — and with it, total responsibility.
  Buffer overflows, use-after-free, data races: whole classes of bugs that
  are *invisible until they're catastrophic*. Roughly two-thirds of serious
  security bugs in large C/C++ codebases (Chrome, Microsoft, Android teams
  have all published similar numbers) trace back to memory misuse.
- **Java / Python / Go** take the responsibility away by managing memory
  *at runtime* — garbage collectors, virtual machines. Safe, but you pay in
  latency, memory overhead, and a runtime you don't control.

Rust's bet: **you can have both** — *if* you're willing to let the compiler
be strict with you. Instead of a garbage collector, Rust enforces a small
set of rules about **ownership and borrowing** at compile time. If your code
compiles, entire categories of bugs simply cannot exist in it:

- use-after-free and dangling pointers
- double frees and memory leaks (by default)
- data races between threads — *at compile time*

That third one is the headline. "Fearless concurrency" isn't marketing; the
same type system that keeps single-threaded code safe is what makes Rust's
multithreading trustworthy.

> The borrow checker is not your enemy. It is a very pedantic editor — and
> after a few weeks, you start missing the pedantry in every other language.

## Where the zero-cost idea shows up

"Zero-cost abstractions" means you can write high-level, ergonomic code and
get machine-level performance — no VM, no GC pauses, no interpreter. That's
why Rust shows up in:

- **systems**: operating systems, drivers, embedded devices
- **infrastructure**: databases, proxies, build tools
- **WebAssembly**: Rust is a first-class citizen of the browser
- **CLIs and services**: fast startup, tiny footprint, predictable latency

## Who's using it — big names, real projects

Rust stopped being an experiment years ago. A partial list, because names
make the argument better than adjectives:

| Organisation | What they built with Rust |
| --- | --- |
| **Microsoft** | Rewriting core Windows components (kernel libraries like win32k's GDI regions) in Rust |
| **Google** | Android's Binder IPC is being reimplemented in Rust; Chromium accepts Rust code; Rust is a top-2 contributor language in Android's new code |
| **Amazon (AWS)** | Firecracker — the microVM powering AWS Lambda & Fargate — is written in Rust |
| **Cloudflare** | Pingora, their Rust proxy framework handling over a trillion requests a day |
| **Meta** | Backend tooling (Mononoke source control, Sapling SCM) |
| **Dropbox** | Sync engine, storage (Magic Pocket) components |
| **Discord** | Switched a hot Go service (Read States) to Rust to eliminate GC latency spikes |
| **Vercel** | Turbopack — the Rust-based successor to Webpack |
| **npm** | Parts of their package registry services |
| **Linux kernel** | Officially supports Rust for kernel drivers since 6.1 |
| **Sentry, Figma, Shopify** | Performance-critical components (Figma's multiplayer server) |

And the flagship open-source projects people actually touch daily: **ripgrep**
(the search tool other editors embed), **uv** and **ruff** (the Python
ecosystem's fastest package manager and linter), **Deno** (a whole JS runtime),
**Polars** (a DataFrame library that embarrasses pandas on speed), **wasmtime**
(WebAssembly runtime), and **Servo**, the browser engine that started much of
this.

The pattern across all of them: places where C++ used to be the only
acceptable answer, and reliability failures cost millions.

## Installing Rust — the honest 5-minute guide

Rust ships through **rustup**, the official toolchain manager. It handles
stable/nightly channels, cross-compilation targets, and updates — and it's
the same on every OS.

### macOS / Linux / WSL

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

### Windows

Download and run **rustup-init.exe** from <https://rustup.rs>. It will offer
to install the MSVC build tools — accept (you need the Visual Studio C++
Build Tools linker). If you live in the terminal, `winget install
Rustlang.Rustup` works too.

### Verify it

```bash
rustc --version     # the compiler
cargo --version     # the build tool + package manager
```

Output (yours may be newer):

```text
rustc 1.82.0 (f6e511eec 2024-10-15)
cargo 1.82.0 (f6e511eec 2024-10-15)
```

### Your first project

```bash
cargo new hello-rust
cd hello-rust
cargo run
```

Output:

```text
   Compiling hello-rust v0.1.0
    Finished dev [unoptimized + debuginfo] target(s) in 0.42s
     Running `target/debug/hello-rust`
Hello, world!
```

Three commands, and you have a compiled, dependency-managed, testable
project. The three you'll use daily:

```bash
cargo build        # compile
cargo run          # compile + run
cargo test         # run tests
cargo add serde    # add a dependency (no XML, no lockfile drama)
```

Part 02 of this track — [Rusty's Hello World!](/blog/rustys-hello-world) —
picks up exactly here, inside that `println!`.

## The communities that keep you going

Rust has a reputation: hard language, friendly community. It's earned. When
you get stuck — and you will, around week two, at the borrow checker — these
are the rooms to walk into:

- **[users.rust-lang.org](https://users.rust-lang.org/)** — the official
  Rust forum. Patient, detailed answers from people who maintain the
  compiler and its ecosystem. Search before you post: most beginner
  questions are already answered beautifully.
- **[/r/rust](https://www.reddit.com/r/rust/)** — the largest Rust
  community. News, "what are you working on" threads, crate announcements,
  and a steady stream of learning resources. Lurk here daily; it's how you
  absorb the culture.
- **Rust Discord** (discord.gg/rust-lang) — real-time help, dedicated
  channels per topic, from `#beginners` to `#unsafe`. The fastest loop when
  you're mid-debug.
- **This Very Error Messages** — not a community, but worth saying: Rust's
  compiler errors are the best in the industry, and they usually *teach*
  instead of just rejecting. Read them fully before you reach for a search
  engine.

> A language is more than its syntax — it's the people who show up when the
> syntax fights you.

## Where this track goes

The [Learning Rust](/tracks/rust) track continues with
[Rusty's Hello World!](/blog/rustys-hello-world) — every printing macro, the
formatting engine, and Display vs Debug. From there: ownership and
borrowing, structs and enums, error handling, and eventually the borrow
checker itself. Install the toolchain, run `cargo new`, and read in order —
the track remembers where you are.
