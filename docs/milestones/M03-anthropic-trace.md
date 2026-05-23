# M03 — Anthropic probability + reasoning trace (2.0h)

**Goal**: One market in → independent probability estimate + structured reasoning trace out. **The trace IS the product.**

**Depends on**: M02.

## Files

- `rust-service/Cargo.toml` — add `sha2 = "0.10"`, `hex = "0.4"`.
- `rust-service/src/anthropic.rs` — `pub async fn score(market: &Market) -> Result<Score>`, hits `https://api.anthropic.com/v1/messages`.
- `rust-service/src/trace.rs` — `Trace { prior, evidence: Vec<Evidence>, direction_of_update, final_prob, rationale }`, `pub fn canonical_json(&self) -> String`, `pub fn sha256_hex(&self) -> String`.
- `rust-service/src/main.rs` — wire `POST /v1/score { market_id }` → fetch → score → return `Trace`.

## Verify by

```bash
curl -s -X POST http://127.0.0.1:8787/v1/score \
  -H 'content-type: application/json' \
  -d '{"market_id": "<hand-picked>"}'
# → { prior: 0.x, evidence: [...], final_prob: 0.x, rationale: "...", trace_hash: "<sha256>" }
```

Per `docs/decisions.md` #8: trace must show **prior**, **evidence**, and **direction of update**. This tests legibility, not accuracy.

## Notes

- Model: Claude (whatever's current; pin model id in `config.toml`, not in code).
- Prompt template lives inline in `anthropic.rs` — don't build a templating system. ~30 lines of string is fine.
- `canonical_json` = sorted keys, no whitespace, UTF-8 no BOM. **Encoding drift here breaks M08.** Use one canonicalization function and call it from both M03 and M08.
- Cost guardrail: cap `max_tokens` to 1500. Score-then-Kelly is the loop; you don't need 4000-token essays.
- No streaming. Block on the full response, parse JSON, return.
