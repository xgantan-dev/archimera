# M01 — Rust scaffold + config loader (1.5h)

**Goal**: A bootable axum service with a healthcheck endpoint and a typed config loader. Nothing more.

**Depends on**: nothing (can run in parallel with M00).

## Files

- `rust-service/Cargo.toml` — pin: `axum`, `tokio`, `tower`, `tracing`, `tracing-subscriber`, `serde`, `serde_json`, `toml`, `anyhow`.
- `rust-service/src/main.rs` — axum router, `GET /healthz`, listens on `127.0.0.1:8787`.
- `rust-service/src/config.rs` — `Config` struct, `Config::from_file("config.toml")`.
- `rust-service/config.toml` — minimal: `[server] port`, `[arc]` (from M00), `[circle]` placeholders, `[edge] threshold = 0.05`, `[edge] absolute_pp = 3`.
- `rust-service/.env.example` — `CIRCLE_API_KEY=`, `CIRCLE_ENTITY_SECRET=`, `ANTHROPIC_API_KEY=`, `RUST_HMAC_SECRET=`.
- `rust-service/.gitignore` — `target/`, `.env`.

## Verify by

```bash
cd rust-service && cargo run
# in another terminal:
curl -s http://127.0.0.1:8787/healthz
# → 200 "ok"
```

## Notes

- Keep `Cargo.toml` deps tight. Every crate you add now is a crate you'll defend in M05–M07 when `cargo audit` matters.
- No `clap`, no `config-rs`, no derive-builder. `toml::from_str` + `serde::Deserialize` covers it in 20 lines.
- Don't add middleware yet — auth lands in M09.
