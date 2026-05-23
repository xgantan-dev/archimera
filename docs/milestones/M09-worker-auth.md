# M09 — Worker read + HMAC auth (2.0h) · RH

**Goal**: TS Worker that proxies `/v1/score` and `/v1/settle` from the public web to the Rust service, authenticated with HMAC-SHA256 (+ CF Access if free tier permits).

**Depends on**: M08 (Rust `/v1/settle` returns the full receipt).

> Amelia: "Plan says 1h. Real budget: 2h. Canonical-string bugs (trailing slash, body hashing pre/post-parse) eat the second hour."
> Murat: "If pressed, cut the HMAC replay-window test. CF Access is the real perimeter."

## Files

- `worker-read/wrangler.toml` — `name = "archimera-edge"`, `compatibility_date`, secret bindings.
- `worker-read/src/index.ts` — fetch handler: `/api/score` and `/api/settle` POST through to `rust.archimera.app` with HMAC headers.
- `worker-read/src/hmac.ts` — `signRequest(ts, method, path, body, secret) -> hex`. Same canonical string as Rust side.
- `rust-service/src/auth.rs` — axum middleware that verifies HMAC + (if available) CF Access service-token headers.
- Worker secrets: `wrangler secret put RUST_HMAC_SECRET`, `CF_ACCESS_SVC_TOKEN_ID`, `CF_ACCESS_SVC_TOKEN_SECRET`.

## Canonical string

`ts ‖ "\n" ‖ method ‖ "\n" ‖ path ‖ "\n" ‖ sha256(body_bytes)`

Pin this in a comment in BOTH `hmac.ts` and `auth.rs`. Drift = 401s in production.

## Verify by

```bash
# 1. Valid signed request
TS=$(date +%s) BODY='{"market_id":"X"}' \
  SIG=$(printf "%s\nPOST\n/v1/score\n%s" "$TS" "$(echo -n "$BODY" | sha256sum | cut -d' ' -f1)" \
        | openssl dgst -sha256 -hmac "$RUST_HMAC_SECRET" -hex | cut -d' ' -f2)
curl -X POST http://127.0.0.1:8787/v1/score \
  -H "X-Archimera-Timestamp: $TS" -H "X-Archimera-Signature: $SIG" \
  -H 'content-type: application/json' -d "$BODY"
# → 200

# 2. Tampered body
curl ... -d '{"market_id":"Y"}'  # changed body, same sig
# → 401

# 3. Stale timestamp (ts = now - 600s)
# → 401
```

## Notes

- 5-minute skew window is fine for MVP.
- Body hashing: hash the **raw bytes**, never re-serialize after parsing. Worker hashes the outgoing body, Rust hashes the incoming body — these must be byte-identical.
- If CF Access on free tier is blocked (M00 unknown #3): collapse to HMAC-only over a Cloudflare Tunnel ingress restricted by Tunnel ID. Document in `MANUAL_STEPS.md` §6.
- Worker holds NO secret capable of moving funds. The Rust HMAC secret is read-only authority over the score/settle API surface — losing it costs you control of the API, not the wallet.
