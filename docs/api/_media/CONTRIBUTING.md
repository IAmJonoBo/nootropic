## Development Hygiene

All contributions must pass the following checks before merging:

- **Linting:** Run `pnpm lint` and fix all issues.
- **Type Checking:** Run `pnpm tsc --noEmit` and fix all type errors.
- **Tests:** Run `pnpm test` and ensure all tests pass.
- **Dead Code/Dependency Check:** Run `pnpm exec knip --no-gitignore` to ensure no unused files, exports, or dependencies remain.

These checks are enforced in CI (`.github/workflows/ci.yml`, `.github/workflows/ci-knip.yml`) and pre-commit (`.pre-commit-config.yaml`).

## 🚀 Onboarding & Automation Docs

- [CLI Usage Guide](docs/capabilities/CLI%20usage%20(planned).md)
- [Onboarding Guide](docs/capabilities/onboarding%20guide%20(planned).md)
- [Onboarding Instructions](docs/capabilities/onboarding%20instructions%20(planned).md)
- [Onboarding Troubleshooting](docs/capabilities/onboarding%20troubleshooting%20(planned).md)

## 🛠️ Automation Scripts & LLM/AI Usage

- All automation scripts support `--help` and `--json` flags for human and LLM/AI usage.
- See the CLI usage guide for script details, flags, and troubleshooting.
- Use machine-readable outputs (`--json`) for LLM/AI workflows and automation.
- Keep onboarding and docs up to date with any new scripts or automation workflows.

## ℹ️ Known Lint/Doc Warnings

- Some TSDoc linter warnings (e.g., about the '>' character in function signatures, or unsupported tags like @param/@returns) are known parser limitations and **do not affect type safety or documentation generation** (e.g., with TypeDoc or JSDoc).
- These warnings can be safely ignored. See the relevant comments in `utils.ts` and `jwtValidation.ts` for details.
- If you encounter these warnings, you do **not** need to fix or suppress them—they are expected and documented here for clarity.
- All tests must use [Vitest](https://vitest.dev/) with ESM/TypeScript. Jest is not supported. See `vitest.config.ts` for configuration and best practices.

## 📝 Manifest and Registry Hygiene

- All planned, in-progress, or stub capability docs in `docs/capabilities` **must** include a YAML frontmatter `status` field (e.g., `status: planned`, `status: in progress`, `status: stub`).
- The sync and manifest scripts (`scripts/generateDocManifest.ts`, `scripts/docs-check-sync.ts`) will categorize docs based on this field. If missing, they will use filename/title heuristics, but this is discouraged.
- **Implemented/complete docs should also include `status: implemented` or `status: complete` in YAML frontmatter for clarity and automation.**
- All agent capability docs should be placed in `docs/capabilities/agents/` for discoverability and LLM/AI workflows.
- The sync scripts will warn if a doc is missing a status field or is ambiguous. Please fix these warnings promptly.
- Naming conventions for planned/in-progress/stub docs (e.g., `(planned)`, `(in progress)`, `planned-`, `stub`, `draft`) are supported but explicit status fields are preferred for automation and LLM-friendliness.
- See the onboarding and CLI usage guides for more details on documentation and automation best practices.

## Automated Security & Dependency Updates

This repository uses [Renovate](https://docs.renovatebot.com/) for automated dependency and security updates. Renovate will automatically open pull requests to update dependencies and address known vulnerabilities. All contributors should:

- Regularly review and merge Renovate PRs.
- Monitor [GitHub security alerts](https://github.com/IAmJonoBo/nootropic/security/dependabot) for additional vulnerabilities.
- Run `pnpm update --latest` and `pnpm install` locally if urgent security issues are flagged.

For more details, see the `renovate.json` config and the [Renovate documentation](https://docs.renovatebot.com/).

## LLM/AI PR Summaries & Safe Update Workflow

- All Renovate PRs include labels for update type (e.g., `auto-merge`, `safe-update`, `major`, `breaking-change`, `needs-review`).
- Patch and minor updates are auto-merged if CI passes. Major updates require human review.
- Use LLM/AI tools (e.g., OpenAI PR reviewer or custom GPT workflows) to auto-summarize PRs, highlight breaking changes, and suggest migration steps.
- Regularly audit dependencies and dead code using Knip, npm-check, or custom scripts. Add a recurring backlog item for this.
- See `renovate.json` for config details and update policy.

# Contributing to Nootropic

## Agent and Registry Decoupling
- **All agent registration must be performed in `src/capabilities/agentRegistry.ts` via the `registerAllAgents()` function.**
- The central registry (`src/capabilities/registry.ts`) should only register utilities, adapters, and plugins, not agents directly.
- This pattern prevents circular dependencies and ESM evaluation order issues.

## ESM/CJS Script Handling
- The project uses ESM (`"type": "module"` in `package.json`).
- **All scripts using `require` or CommonJS syntax must use the `.cjs` extension.**
- The registry scan script (`scripts/scanAndHealRegistry.ts`) excludes `.cjs` files to avoid ESM/CJS conflicts.

## Circular Dependency Rules
- **Agents may use utilities, but not the registry or other agents directly.**
- **Utilities may use other utilities, but not agents or the registry.**
- **Registry may import utilities, adapters, and plugins, but not agents directly.**
- Use `madge` to check for circular dependencies. CI will fail if new cycles are introduced.

## Registry Health and Automation
- The registry scan (`scripts/scanAndHealRegistry.ts`) must be run after any agent or utility change.
- All registry entries must pass describe/health/schema validation.
- Add a CI job to run `madge --circular --extensions ts src/` and the registry scan script.
- Backlog any technical debt or skipped/errored registry entries.

## Best Practices
- All agents/utilities must implement a `describe()` and (optionally) `health()` method for registry compliance.
- Use Zod schemas for input/output validation.
- Document new capabilities in `docs/capabilities/` and update the backlog as needed.