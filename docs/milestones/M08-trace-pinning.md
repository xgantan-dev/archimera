# M08 — SHA-256 trace pinning on Arc (1.5h)

**Goal**: Hash the canonical trace JSON, pin the hash on Arc, return both `tx_hash` (settlement) and `trace_uri` (off-chain storage) + `trace_hash`. Satisfies integrity bar (a)–(e) from `docs/decisions.md` §3.

**Depends on**: M07, M03 (canonical trace).

## Two paths (decided in M00)

- **If `transactions_endpoint_accepts_data = true`**: embed `sha256(trace_json)` as the `data` field of the settlement tx. One tx total. Cheaper.
- **If false**: send a second zero-value tx after settlement, carrying the hash in calldata. Two txs, ~doubled latency/cost. Still fits the integrity bar.

## Files

- `rust-service/src/pinning.rs` — `pub async fn pin_trace_hash(hash: [u8; 32]) -> Result<TxHash>` OR `pub async fn settle_and_pin(...)` if combined.
- `rust-service/src/trace.rs` (extend) — `pub fn write_to_storage(&self) -> Result<TraceUri>`. For MVP: write to a Worker KV namespace (or R2 bucket) keyed by hash hex. Trace URI = `https://archimera.app/trace/<hex>`.
- `rust-service/src/main.rs` — wire `POST /v1/settle { market_id }` → score → Kelly → transfer → pin → return `{ tx_hash, trace_uri, trace_hash, edge, stake_usdc }`.

## Verify by

```bash
curl -X POST http://127.0.0.1:8787/v1/settle \
  -H 'content-type: application/json' \
  -d '{"market_id": "<hand-picked>"}'
# → { tx_hash, trace_uri, trace_hash, edge, stake_usdc }

# Integrity check (Murat's gate):
curl -s "$trace_uri" | sha256sum
# → must equal trace_hash returned above AND the bytes32 readable from the on-chain tx
```

## Notes

- **Encoding drift is the failure mode.** UTF-8 with NO BOM, no trailing newline, sorted JSON keys. Use the same `Trace::canonical_json()` function from M03 — never re-serialize.
- Storage backend: pick ONE — KV or R2. Don't build a two-backend abstraction.
- Integrity bar (f) — byte-equal verification of the retrieved trace against the pinned hash — is **deliberately dropped** (`docs/decisions.md` §3). Document this in the README as a conscious 4-day scope cut, not an oversight.
- If you fall behind: pin manually with a one-off script for the demo trace, ship M11 without programmatic pinning. The triage list permits this.
