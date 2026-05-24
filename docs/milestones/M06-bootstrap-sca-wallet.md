# M06 — Bootstrap SCA wallet + faucet fund (1.5h)

**Goal**: Create the ONE shared dev-controlled SCA wallet on Arc testnet, persist its id, fund it from the faucet.

**Depends on**: M05.

> Wallet type = SCA, `accountType: "SCA"`. Exactly one wallet for the demo.

## Files

- `rust-service/src/circle/wallet.rs` — `pub async fn create_sca_wallet(api_key, entity_secret_ciphertext) -> Result<Wallet>` hitting `POST /v1/w3s/developer/wallets` with `accountType: "SCA"`, `blockchains: ["ARC-TESTNET"]` (pin exact chain id from M00).
- `rust-service/bin/bootstrap_wallet.rs` — one-shot: encrypt entity secret, call `create_sca_wallet`, print `{id, address}`, write `wallet_id` into `config.toml` under `[circle]`.

## Verify by

```bash
cargo run --bin bootstrap_wallet
# → writes [circle] wallet_id = "..." and prints the address

# Manual: open Arc testnet explorer at <pinned base>/address/<addr>
# → wallet visible on-chain

# Fund from Circle testnet faucet (URL pinned in MANUAL_STEPS.md)
# → balance shows USDC after 1-2 confirmations
```

## Notes

- **Run bootstrap_wallet ONCE.** If you run it twice you have two wallets and your demo is split. Guard with: if `wallet_id` already in `config.toml`, refuse and print "wallet already exists at <addr>".
- Document the bootstrap run + faucet steps in `MANUAL_STEPS.md` so a judge (or future-you at 4am) can repro.
- SCA wallets on Arc are deployed lazily — the address exists immediately but the on-chain contract deploys on first outbound tx. That's expected; do not panic when the explorer shows "contract not yet deployed."
- No multisig, no policy engine, no recovery shards. One wallet, one key surface (per decision #11).
