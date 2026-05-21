# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

This repo currently contains only `LICENSE`, `.gitignore` (Rust template), and the build plan at `docs/archimera-plan.html`. No source code has been written yet. The plan document is the authoritative spec — read it before scaffolding anything.

See the **Engineering Principles** section at the bottom of this file for behavioral guidelines that apply to every change — they take precedence over generic defaults when they conflict.

## What is being built

**Archimera** — a prediction-market intelligence agent for the Agora Agents Hackathon (RFB 02, submission deadline May 25). It:

1. Pulls active markets from Polymarket's Gamma API (public, no auth).
2. Produces an independent probability estimate + written reasoning trace for each market.
3. Flags +EV mispricings where `|your_prob − market_prob|` exceeds a threshold.
4. Sizes positions with **fractional Kelly (quarter-Kelly, never full)**.
5. Settles real USDC positions on **Arc testnet** through a Circle dev-controlled SCA wallet.

The **reasoning trace is the product**, not microsecond execution. Judging weights: agentic sophistication 30%, real users / traction 30%, Circle tool usage 20%, innovation 20%.

## Architecture: trust boundaries = language boundaries

Two services with a strict, asymmetric data flow. **This split is load-bearing** — do not blur it:

```
┌─ Cloudflare Edge (TypeScript) ──────────────────────────────┐
│  Pages frontend  ·  Read Worker (KV cache, Cron scan)       │
│  READS ONLY from Polymarket. No secrets. Tiny blast radius. │
└──────────────────────┬──────────────────────────────────────┘
                       │ action request (no secrets cross up)
                       ▼
┌─ Native Rust service ───────────────────────────────────────┐
│  Probability brain  ·  Kelly sizing  ·  Wallet engine       │
│  axum · reqwest · rsa · sha2 — no WASM, no SDK, no Node     │
│  ALL signing and settlement. Auditable dep tree.            │
└──────────────────────┬──────────────────────────────────────┘
                       │ read prices  /  sign · settle
                       ▼
   Polymarket Gamma API        Circle + Arc testnet (USDC)
```

Rules that follow from this split:

- The Worker **only reads**. It must never hold a Circle entity secret, private key, or any credential capable of moving funds.
- The Rust service is the only place that signs or settles. Keep its dependency tree small enough to `cargo audit` meaningfully.
- Don't reach for a Node SDK or a WASM bridge in the Rust service — the plan explicitly rejects these.

## Non-obvious implementation gotchas

These are details the plan calls out specifically because generic helpers get them wrong:

- **Entity-secret encryption**: RSA-OAEP with **SHA-256 for both the hash AND MGF1**. Generate fresh ciphertext per request; never cache it.
- **Circle wallet creation**: `POST /v1/w3s/developer/wallets` with `accountType: "SCA"` (this is the known-good Arc path).
- **Kelly sizing**: quarter-Kelly. Full Kelly is too aggressive; a judge who trades will spot raw Kelly immediately.
- **Demo framing**: Arc is testnet-only right now. Frame the demo as testnet settlement demonstrating the mechanism — don't imply mainnet money is moving.

## Build order (from the plan)

Day 1: Read Worker + one market end-to-end (market in → probability + rationale + edge out). No UI.
Day 2: +EV detection across markets, ranked feed, quarter-Kelly sizing. This is the brain.
Day 3: Rust wallet engine — RSA-OAEP encryption, dev-controlled SCA wallet on Arc, USDC transfer, trace pinned on-chain.
Day 4: Pages frontend with expandable reasoning traces, Cron auto-refresh, distribution in the Canteen Discord, Loom + submission.

## Triage when behind

Protect: probability estimate + trace, fractional Kelly sizing, one clean Arc/USDC settlement.
Cut in order: paymaster (gasless UX) → Cron auto-refresh (use manual button) → multi-market portfolio construction → historical backtesting.

---

## Engineering Principles

> Sourced verbatim from [multica-ai/andrej-karpathy-skills · CLAUDE.md](https://raw.githubusercontent.com/multica-ai/andrej-karpathy-skills/refs/heads/main/CLAUDE.md). Apply to every change in this repository; takes precedence over generic defaults where they conflict.

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
