# M07 — USDC transfer on Arc testnet (3.0h) · **RH · NEVER SKIP**

**Goal**: Move real testnet USDC from the SCA wallet to a target address. Tx confirmed on Arc. Tx hash returned.

**Depends on**: M06.

> Murat: "Cheapest gate: create wallet, fund from faucet, transfer 0.01 USDC to burn address, poll for confirmed, commit the tx hash as known-good. Do not skip."
> Amelia: "Plan says 2h. Real budget: 3h. ERC-20 `transfer(address,uint256)` calldata padding — wrong = silent revert."

## Files

- `rust-service/src/circle/transaction.rs` — `pub async fn send_usdc(wallet_id, to_address, amount_usdc, entity_secret_ciphertext) -> Result<TxResult>` hitting `POST /v1/w3s/developer/transactions`.
- `rust-service/src/circle/transaction.rs` — helper: `fn erc20_transfer_calldata(to: Address, amount: U256) -> Vec<u8>` (4-byte selector + 32-byte padded `to` + 32-byte `amount`).
- `rust-service/bin/dry_run_settle.rs` — one-shot: send 0.01 USDC to a burn address, poll until confirmed, print tx hash.

## Verify by

```bash
cargo run --bin dry_run_settle
# → "tx submitted: 0x..."
# → "tx confirmed at block N"
# → "tx hash: 0x<commit this to a fixture file>"

# Manual: open Arc explorer at <pinned>/tx/<hash>
# → status: Success, USDC transferred, gas paid
```

Once it works, **paste the tx hash into `rust-service/tests/fixtures/known_good_settlement.txt`** as a reference. If a future run can't match this shape, something regressed.

## Notes

- ERC-20 `transfer(address,uint256)` selector: `0xa9059cbb`. Both args ABI-encoded as 32-byte big-endian. Common bug: passing the raw address with leading zeroes stripped — the encoder must left-pad to 32 bytes.
- USDC has **6 decimals** on most chains. 0.01 USDC = `10000` units. Confirm decimals on Arc (M00 unknown — if not pinned, query the contract).
- `POST /v1/w3s/developer/transactions` request body needs the freshly-encrypted entity secret (from M05). New ciphertext on every call.
- Poll the transaction state via Circle's GET endpoint, not Arc RPC directly. Circle's state machine: `INITIATED → QUEUED → SENT → CONFIRMED`. Anything else is failure.
- If the first tx silently reverts, dump the calldata as hex and decode it with a known ERC-20 tool before changing any code.
