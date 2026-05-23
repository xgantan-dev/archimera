# M00 — Resolve unknowns (0.5h)

**Goal**: Pin the three answers that gate everything downstream into `rust-service/config.toml` so no code is written against a guess.

**Depends on**: nothing. Run first.

## The unknowns

From `docs/decisions.md` §6:

1. **Calldata on `POST /v1/w3s/developer/transactions`** — does it accept an arbitrary `data` field so the USDC transfer and the trace-hash pin happen in one tx, or do we need a second zero-value tx? If two, budget two settlement calls per showpiece and adjust Kelly accounting.
2. **Arc testnet RPC URL + USDC contract address** — not in the plan. Get both from Circle's Arc docs or a block explorer.
3. **CF Access service tokens on free Cloudflare tier** — if Zero Trust seat is paid-only, the Worker→Rust auth collapses to HMAC-only over a Tunnel ingress restricted by Tunnel ID.

## Files

- `rust-service/config.toml` — pin all four values under `[arc]` and `[circle]`.
- `MANUAL_STEPS.md` §6 — document the CF Access fallback if free-tier blocks.

## Verify by

```toml
# rust-service/config.toml
[arc]
rpc_url = "<pinned>"
usdc_contract = "0x<pinned>"
explorer_base = "<pinned>"

[circle]
transactions_endpoint_accepts_data = true | false   # decided
```

If `transactions_endpoint_accepts_data = false`, file a follow-up note in M08 to do a second pin tx.

## Notes

- 30 minutes is a hard cap. If you can't resolve in 30, assume `transactions_endpoint_accepts_data = false` (the safe default — pin via second tx) and move on.
- Probe in parallel with M01 scaffold — no need to block.
- Skipping this milestone is the single highest-leverage way to lose 4 hours later.
