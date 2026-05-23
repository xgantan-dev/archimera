# M10 — Pages frontend (pre-settled receipt) (2.5h)

**Goal**: ONE static page. Shows the showpiece market, the reasoning trace, the Kelly stake, the settlement receipt with a clickable Arc explorer link. **No live Settle button for MVP** — judge sees a real receipt, not a live click.

**Depends on**: M09.

> John: "Pre-settle is safer in 36 hours. Single HTML page, server-rendered from Worker. No framework."
> Winston: "Get the loop closing end-to-end first; decompose after."

## Files

- `pages-frontend/index.html` — single page, semantic HTML, ~150 lines including inline CSS.
- `pages-frontend/src/feed.ts` — `fetch('/api/showpiece')` → renders the showpiece card.
- `pages-frontend/src/trace-modal.ts` — expandable reasoning trace (prior → evidence → final_prob).
- `worker-read/src/index.ts` (extend) — `GET /api/showpiece` returns the cached receipt JSON from a KV key written once during the pre-settle ceremony.

## The pre-settle ceremony (done ONCE before recording the Loom)

```bash
# 1. Pick the showpiece market id, set it as MARKET_ID env on Rust.
# 2. Hit /v1/settle through the Worker once. Capture the JSON receipt.
# 3. wrangler kv:key put SHOWPIECE_RECEIPT "<paste receipt JSON>"
# 4. Page now serves the same receipt to all visitors. Real on-chain tx, captured.
```

## What the card shows

- Market question (from Polymarket)
- Market probability vs Archimera probability vs edge
- Stake (USDC, quarter-Kelly)
- "Settled" badge with tx hash → links to `<arc_explorer>/tx/<hash>`
- "View reasoning trace" → opens trace modal
- "Trace hash" with link to `https://archimera.app/trace/<hex>`

## Verify by

```bash
wrangler pages dev pages-frontend/
# Open in browser:
# → showpiece card renders
# → tx hash link opens Arc explorer to a real confirmed tx
# → trace modal shows prior + evidence + direction_of_update
# → trace hash link returns the JSON whose sha256 matches the on-chain bytes32
```

## Notes

- Triage option: if `wrangler pages` fights you, ship as a static HTML file served by the Worker itself. The judge doesn't care about hosting topology.
- No React, no Tailwind, no build step. `<style>` block, fetch + DOM manipulation, ship.
- The card is your demo. Spend the polish budget on the trace modal — that's the 30% innovation score.
