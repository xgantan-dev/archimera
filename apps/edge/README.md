# archimera-edge

Cloudflare Worker (TypeScript, read-only) for Archimera. This package only
reads from public APIs and serves the frontend — it must never hold a Circle
entity secret, private key, or any credential capable of moving funds. All
signing and settlement lives in `services/core/` (Rust).

## Quickstart

```sh
cd apps/edge
pnpm install
pnpm dev        # http://localhost:8787
pnpm typecheck  # tsc --noEmit
```

Smoke-test once the dev server is up:

```sh
curl http://127.0.0.1:8787/       # -> "hello from archimera-edge"
```

## Port collision with services/core

Both `wrangler dev` and the Rust `services/core` axum server default to
**port 8787**. Run only one at a time on the default port, or override the
worker with:

```sh
pnpm dev -- --port 8788
```

Do not change the Rust service's port to accommodate this.

## Layout

```
apps/edge/
├── src/worker.ts          # fetch handler — hello-world stub for now
├── wrangler.toml          # worker name, compatibility date, KV placeholder
├── tsconfig.json          # strict TS with @cloudflare/workers-types
├── .dev.vars.example      # env var names only — never commit .dev.vars
├── package.json
└── pnpm-workspace.yaml    # whitelists esbuild + workerd postinstall scripts
```

## Notes

- The KV namespace binding in `wrangler.toml` is a commented placeholder.
  Provision with `wrangler kv namespace create MARKETS_KV` in Wave 2 and
  fill in the returned id.
- `pnpm-workspace.yaml` here is **not** a workspace declaration; pnpm 11
  uses that file to host settings like `allowBuilds`, which lets workerd
  install its platform binary during `pnpm install`.
- Wrangler is already authenticated on this machine (`wrangler login` ran
  during Wave 1 setup). `wrangler dev` works fully offline against the
  local workerd runtime.
