# M11 — E2E smoke + Loom + submission (1.5h)

**Goal**: Final dry-run + 3-min Loom + hackathon submission filed before the May 25 cutoff.

**Depends on**: M10.

> `docs/decisions.md` #18: "Pre-recorded settlement video primary; live link bonus. Demo-day networks fail. Loom always works."

## The dry-run smoke (do this first, before recording)

```bash
# Fresh terminal. Pretend you are a judge.
open https://archimera.app
# → showpiece card visible within 3 seconds
# → click tx hash → Arc explorer shows confirmed transfer
# → click trace → modal shows prior, evidence, direction, final_prob
# → click trace hash link → JSON returned, sha256 matches on-chain bytes32
```

If any of those four checks fail, fix before recording. Do not record around a broken step.

## Loom (3 minutes max)

Beats, in order:

1. **0:00 — Hook (15s)**: "Archimera finds mispriced prediction markets, sizes the bet with quarter-Kelly, and settles real USDC on Arc. The reasoning trace is the product."
2. **0:15 — The market (30s)**: showpiece card. Market price, agent probability, edge.
3. **0:45 — The reasoning (60s)**: open the trace modal. Walk: prior → evidence → direction of update → final_prob. **This is the 30% agentic + 20% innovation score.** Slow down here.
4. **1:45 — The settlement (45s)**: click tx hash → Arc explorer → highlight confirmed transfer + the pinned trace hash in calldata.
5. **2:30 — The architecture (20s)**: "TS reads, Rust signs. One auditable dep tree. One shared SCA wallet, dev-controlled."
6. **2:50 — Wrap (10s)**: "Testnet for now, but the mechanism is real. Link in the description."

## Files / deliverables

- `demo/loom-script.md` — the beats above, expanded to spoken lines.
- `demo/submission-form-draft.md` — pre-fill answers to the hackathon form so submission is mechanical.
- `README.md` — judge-friendly: what it does, how to click through it, what's testnet vs. mainnet, what's deliberately scoped out (integrity bar (f)).

## Verify by

- Loom recorded, under 3:30 (target 3:00).
- Submission form filed. Confirmation email screenshot saved.
- README readable cold by someone who has never seen the project.

## Notes

- **Submit early, resubmit often.** Hackathon allows multiple submissions — file a passing submission with the dry-run loop done at the M10/M11 boundary, then re-submit if M10 polish or trace prose improves.
- If you blow the time budget: a curl-and-screenshot demo is acceptable per the triage list. Loom is still required.
- After submitting: post in the Canteen Discord. Traction = 30% of the score. The submission is the artifact; the link in Discord is the user acquisition.
