# M05 — RSA-OAEP entity-secret encryption (3.0h) · **RH · NEVER SKIP**

**Goal**: Encrypt the 32-byte Circle entity secret with RSA-OAEP using **SHA-256 for both the hash AND MGF1**. Fresh ciphertext per call.

**Depends on**: M01 (config), M00 (Circle pubkey fetch endpoint pinned).

> Murat: "#1 silent killer. Circle rejects with opaque errors. Do not skip the echo test."
> Amelia: "Plan says 1h. Real budget: 3h. Default `rsa` crate examples use SHA-1 MGF1."

## Files

- `rust-service/Cargo.toml` — add `rsa = "0.9"`, `rand = "0.8"`, `base64 = "0.22"`.
- `rust-service/src/circle/mod.rs` — module declaration.
- `rust-service/src/circle/entity_secret.rs` — `pub fn encrypt(entity_secret_hex: &str, pubkey_pem: &str) -> Result<String>` returning base64.
- `rust-service/src/circle/pubkey.rs` — `pub async fn fetch_pubkey(api_key: &str) -> Result<String>` hitting `GET /v1/w3s/config/entity/publicKey`.
- `rust-service/tests/entity_secret_circle_echo.rs` — integration test (real network).

## Verify by

```bash
# Crypto correctness (the gate Murat will not allow to be skipped):
cargo test --test entity_secret_circle_echo
# → ciphertext A != ciphertext B (fresh-per-call)
# → POST <Circle no-op endpoint> with each ciphertext returns 200
```

Manual cross-check: call `encrypt()` 10x in a loop, assert all 10 outputs differ. Caching the ciphertext anywhere in the call stack fails this.

## Notes

- Use `rsa::Oaep::new::<sha2::Sha256>()` — this constructor sets BOTH hash AND MGF1 to SHA-256. **Do NOT** use `Oaep::new_with_mgf_hash` and pass SHA-1; that's the well-meaning footgun.
- Input: 32-byte entity secret as hex (decode to raw bytes before encryption).
- Output: base64-standard (not URL-safe) ciphertext, fits in the Circle JSON body.
- Pubkey is rotated by Circle periodically. Fetch on startup, cache in memory, refresh on 401 from Circle. Do NOT persist to disk.
- If you cannot pass the echo test within 3h, stop and read the Circle SDK source for their exact RSA call. Don't keep guessing — the failure modes are silent.
