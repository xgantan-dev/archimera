# Repository Guidelines

## Project Structure & Module Organization

This repository is currently a planning and agent-workflow scaffold; application source has not been added yet. Treat [docs/archimera-plan.html](/home/xg/Developer/archimera/docs/archimera-plan.html) as the authoritative product plan and [CLAUDE.md](/home/xg/Developer/archimera/CLAUDE.md) as the implementation guardrail document.

- `_bmad/` contains installed BMAD/WDS modules, configs, data files, and helper scripts.
- `_bmad-output/` is reserved for generated planning, implementation, and test artifacts.
- `design-artifacts/` is the WDS artifact area for product briefs, trigger maps, UX scenarios, development notes, and design-system material.
- Future app code should preserve the planned split: Cloudflare Edge TypeScript for read-only frontend/worker code, and native Rust for probability, Kelly sizing, wallet signing, and settlement.

## Build, Test, and Development Commands

There is no repository-wide build command until the TypeScript and Rust services are scaffolded.

- `node _bmad/wds/scripts/wds-validate.js --all` validates all generated WDS page specs.
- `node _bmad/wds/scripts/wds-init-scenario.js --scenario "01 Name" --description "..."` creates a UX scenario scaffold.
- `node _bmad/wds/scripts/wds-init-page.js --page "01 Start" --scenario "01 Name" --platform "Mobile web" --visibility "Public"` creates a page spec.
- After Rust crates exist, use `cargo fmt`, `cargo clippy`, and `cargo test` before submitting changes.

## Coding Style & Naming Conventions

Use Markdown headings and short sections for docs. Keep YAML indentation at two spaces. WDS scenario and page folders use numbered kebab-case slugs, for example `01-new-user-onboarding/01-start/`. Shell examples should run from the repository root.

For future implementation, keep TypeScript code focused on read-only Cloudflare behavior. Keep signing, settlement, and Circle credentials inside the Rust service only.

## Testing Guidelines

Run WDS validation after changing generated UX specs or scenario structure. When Rust code is introduced, place unit tests near the module under test and integration tests under the crate’s `tests/` directory. When TypeScript code is introduced, add tests according to that package’s test runner and document the command in this file.

## Commit & Pull Request Guidelines

Git history currently contains only `Initial commit`, so use simple imperative commit messages such as `Add WDS scenario validation notes`. Pull requests should include the change scope, validation commands run, linked issues or hackathon tasks, and screenshots or Loom links for UI-facing work.

## Security & Configuration Tips

Never put Circle entity secrets, private keys, wallet credentials, or fund-moving credentials in Cloudflare Worker code, docs, or generated artifacts. The Rust service must use RSA-OAEP with SHA-256 for both hash and MGF1, generate fresh ciphertext per request, and never cache encrypted entity secrets.
