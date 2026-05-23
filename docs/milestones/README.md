# Archimera Milestones — MVP by end of 2026-05-24

**Submission**: 2026-05-25. **MVP target**: end of 2026-05-24 (~36h wall-clock from 2026-05-23 morning).
**Synthesized from** `docs/archimera-plan.html` + `docs/decisions.md` + party-mode panel (John / Winston / Amelia / Murat).

## The five-thing demo

Open page → see one market → read trace → see "Settle" receipt → see tx hash on Arc explorer → see trace hash pinned.

Anything not on that path is below the line. MVP runs **pre-settled** (judge sees a receipt, not a live click) — safer in 36h.

## Critical path (serial spine)

```
M00 → M01 → M02 → M03 → M04
                          ↓
              M05 → M06 → M07 → M08
                                  ↓
                          M09 → M10 → M11
```

M05 (RSA-OAEP) and M07 (Arc transfer) are the **rabbit holes**. Probe M00 unknowns in parallel with M01–M03 to de-risk M05–M07.

## Budget

| # | Milestone | Hours | Flag | Verify-by (cheapest gate) |
|---|---|---:|---|---|
| [M00](M00-resolve-unknowns.md) | Resolve unknowns | 0.5 | gate | Arc RPC, USDC contract, tx data behavior, CF Access tier all pinned in `config.toml` |
| [M01](M01-rust-scaffold.md) | Rust scaffold + config | 1.5 | | `cargo run` → `GET /healthz` 200 |
| [M02](M02-polymarket-fetch.md) | Polymarket Gamma fetch | 1.5 | | `cargo test polymarket::parses_active` green |
| [M03](M03-anthropic-trace.md) | Anthropic probability + trace | 2.0 | | integration test returns `{prob, rationale}` for one live market |
| [M04](M04-quarter-kelly.md) | Quarter-Kelly sizer | 1.5 | | `cargo test kelly::quarter_never_exceeds_full` green |
| [M05](M05-rsa-oaep-entity-secret.md) | RSA-OAEP entity secret | 3.0 | **RH · never skip** | Circle accepts ciphertext on a no-op call (200) + fresh-per-call asserted |
| [M06](M06-bootstrap-sca-wallet.md) | Bootstrap SCA wallet + faucet | 1.5 | | wallet id in `config.toml`, address shown on Arc explorer with USDC balance |
| [M07](M07-usdc-transfer-arc.md) | USDC transfer on Arc | 3.0 | **RH · never skip** | 0.01 USDC burn-address tx confirmed; tx hash committed as reference |
| [M08](M08-trace-pinning.md) | SHA-256 trace pinning | 1.5 | | pin tx confirmed; retrieved-trace SHA-256 == on-chain bytes32 |
| [M09](M09-worker-auth.md) | Worker read + HMAC auth | 2.0 | RH | curl: valid sig 200, tampered body 401, stale ts 401 |
| [M10](M10-frontend-receipt.md) | Pages frontend (pre-settled receipt) | 2.5 | | static page renders trace + tx hash + Arc explorer link |
| [M11](M11-loom-submit.md) | E2E smoke + Loom + submit | 1.5 | | Loom recorded, submission form filed |

**Total focused**: 22h. **Slack**: ~14h for the two RH overruns and packaging.

## Triage if behind (cuts in order)

Inherited from `docs/decisions.md` + tightened by John:

1. M09 HMAC → bearer token if CF Access free-tier blocks
2. M10 polish → curl-and-screenshot demo
3. M02 multi-market → one hand-picked market, hardcoded
4. M08 pinning automation → manual one-time pin

**Never cut**: M05 (crypto correctness), M07 (one funded settlement), M11 (Loom).

## Conventions

- Each milestone file: **Goal · Depends on · Files · Verify by · Notes**.
- `**RH**` = rabbit-hole risk (Amelia's flag); double-budget if you're sleep-deprived.
- Mark a milestone done when its verify-by gate passes — not when the code "looks right."
