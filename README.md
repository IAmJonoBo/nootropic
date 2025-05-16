[//]: # (Rebranding note: This README was restored from the archive and updated for full 'nootropic' compliance. Legacy references are archived in .ai-helpers-cache/archive/ for rollback.)

# nootropic

[![Doc/Code Sync](https://img.shields.io/github/actions/workflow/status/nootropic/docs-check-sync.yml?label=Doc%2FCode%20Sync)](https://github.com/nootropic/nootropic/actions/workflows/docs-check-sync.yml)
[![API Docs](https://img.shields.io/github/actions/workflow/status/nootropic/docs-api.yml?label=API%20Docs)](https://github.com/nootropic/nootropic/actions/workflows/docs-api.yml)
[![Schema Validation](https://img.shields.io/github/actions/workflow/status/nootropic/schema-validation.yml?label=Schema%20Validation)](https://github.com/nootropic/nootropic/actions/workflows/schema-validation.yml)
[![Roadmap Freshness](https://img.shields.io/github/actions/workflow/status/nootropic/roadmap.yml?label=Roadmap%20Freshness)](https://github.com/nootropic/nootropic/actions/workflows/roadmap.yml)

> **Note:** The canonical sources for all documentation and LLM/agent introspection are [`docs/docManifest.json`](./docs/docManifest.json) and [`.nootropic-cache/describe-registry.json`](./nootropic-cache/describe-registry.json). All code/doc sync, describe registry, and CI enforcement follow [2025 TypeScript monorepo best practices](https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052). See CONTRIBUTING.md for details.

## Development Hygiene

This project enforces strict development hygiene for maximal LLM/agent-friendliness and maintainability:

- **Linting:** All code must pass `pnpm lint` (run in CI and pre-commit).
- **Type Checking:** All code must pass `pnpm tsc --noEmit` (run in CI and pre-commit).
- **Tests:** All code must pass `pnpm test` (run in CI and pre-commit).
- **Dead Code/Dependency Check:** `pnpm exec knip --no-gitignore` runs in CI and pre-commit to ensure no unused files, exports, or dependencies remain.

See `.pre-commit-config.yaml` and `.github/workflows/ci.yml` for details.
