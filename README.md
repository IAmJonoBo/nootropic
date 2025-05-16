[//]: # (Rebranding note: This README was updated from 'AI-Helpers' to 'nootropic'. Legacy references are archived in .ai-helpers-cache/archive/ for rollback.)

[![CI](https://github.com/rocketship-ai/nootropic/actions/workflows/ci.yml/badge.svg)](https://github.com/rocketship-ai/nootropic/actions/workflows/ci.yml)

## Development Hygiene

This project enforces strict development hygiene for maximal LLM/agent-friendliness and maintainability:

- **Linting:** All code must pass `pnpm lint` (run in CI and pre-commit).
- **Type Checking:** All code must pass `pnpm tsc --noEmit` (run in CI and pre-commit).
- **Tests:** All code must pass `pnpm test` (run in CI and pre-commit).
- **Dead Code/Dependency Check:** `pnpm exec knip --no-gitignore` runs in CI and pre-commit to ensure no unused files, exports, or dependencies remain.

See `.pre-commit-config.yaml` and `.github/workflows/ci.yml` for details.
