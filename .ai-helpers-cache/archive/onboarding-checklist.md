# Onboarding Checklist (Auto-Generated)

Follow these steps to get started with nootropic:

- [ ] Clone the repository and install dependencies with `pnpm install`.
- [ ] Use the Node version in `.nvmrc`.
- [ ] Run `pnpm run validate-describe-registry` and `pnpm run docs:check-sync` to ensure code/doc sync.
- [ ] Review the canonical sources: `docs/docManifest.json` and `.nootropic-cache/describe-registry.json`.
- [ ] Run `pnpm run lint` and `pnpm run lint:tsdoc` to check code and TSDoc style.
- [ ] Run `pnpm test` to ensure all tests pass.
- [ ] Review onboarding, automation, and feature table docs in README.md and CONTRIBUTING.md.
- [ ] Check the Automation Scripts table in README.md for available scripts and usage.
- [ ] Review the latest backlog summary in `.nootropic-cache/backlog-summary.json`.
- [ ] If contributing a new feature, export a `describe()` and update docs.
- [ ] If adding a new capability, ensure it is registry/describe/health compliant.
- [ ] Run `pnpm tsx scripts/generateOnboardingChecklist.ts` to refresh this checklist.
- [ ] Use `pnpm run ts-migrate -- <folder-or-file>` for targeted type safety upgrades (see CONTRIBUTING.md for details)
- [ ] Never run ts-migrate on the whole project by default
- [ ] If you see over-escaped braces or angle brackets in code, follow CONTRIBUTING.md recovery steps
- [ ] Verify and use advanced context APIs:
    - `GET /context/delta` for delta snapshots
    - `GET /context/semantic-index` for semantic index
    - `GET /context/telemetry` for telemetry events
    - `POST /context/optimized-handover` for optimized, token-aware handover
  - LLM/AI usage: Use these APIs for efficient, context-aware, and token-limited agent/LLM workflows.

> This checklist is auto-generated. Run `pnpm tsx scripts/generateOnboardingChecklist.ts` to refresh.