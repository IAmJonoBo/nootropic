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