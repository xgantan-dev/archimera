# M02 — Polymarket Gamma fetch + parse (1.5h)

**Goal**: Fetch one market from Polymarket Gamma, normalize price → implied probability.

**Depends on**: M01.

## Files

- `rust-service/Cargo.toml` — add `reqwest = { version = "*", features = ["json", "rustls-tls"] }`.
- `rust-service/src/polymarket.rs` — `pub async fn fetch_market(id: &str) -> Result<Market>`, `Market { id, question, yes_price: f64, no_price: f64, ... }`, `pub fn implied_prob(yes_price: f64) -> f64`.
- `rust-service/tests/fixtures/gamma_market.json` — canned response for unit test.

## Verify by

```bash
cargo test polymarket::tests::parses_active
# → 1 passed

# manual smoke (one hand-picked market id):
cargo run --example fetch_one -- <market_id>
# → prints { question, yes_price, implied_prob }
```

## Notes

- Endpoint: `https://gamma-api.polymarket.com/markets`. Public, no auth.
- For MVP, hard-code ONE market id (`MARKET_ID` constant) so M03 has a stable input. Multi-market scan is below the cut line.
- `implied_prob` for a YES/NO market with prices summing to ~1.00: `yes_price / (yes_price + no_price)` (handle non-normalized books).
- Don't model resolution dates or order books. You need price and the question text.
