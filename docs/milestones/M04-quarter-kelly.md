# M04 — Quarter-Kelly sizer (1.5h)

**Goal**: Pure function: `(your_prob, market_prob, bankroll_usdc) → stake_usdc`. Quarter-Kelly. Never full.

**Depends on**: M03.

## Files

- `rust-service/src/kelly.rs` — `pub fn quarter_kelly(p: f64, market_price: f64, bankroll: f64) -> f64`.
- `rust-service/src/main.rs` — extend `/v1/score` to include `edge` and `stake_usdc` in the response.

## Verify by

```bash
cargo test kelly::quarter_never_exceeds_full
cargo test kelly::zero_when_no_edge
cargo test kelly::respects_threshold
# → 3 passed
```

Hand-check one case at the boundary: `p=0.60`, `market_price=0.50`, `bankroll=100` → roughly $5.

## Notes

- Kelly formula (binary): `f* = (bp - q) / b` where `b = (1 - market_price) / market_price`, `p = your_prob`, `q = 1 - p`. Quarter: `0.25 * f* * bankroll`. Clamp to `>= 0`.
- Edge threshold from `config.toml`: `|p_ours − p_market| >= 0.05` AND `>= 3pp absolute` (`docs/decisions.md` #16). Below threshold → stake_usdc = 0.
- **Never return more than `0.25 * bankroll`**, period. Assert this in the test.
- No portfolio construction, no correlation modeling, no win-rate adjustment. One market, one stake.
