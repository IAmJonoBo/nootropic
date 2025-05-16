## Development Hygiene

All contributions must pass the following checks before merging:

- **Linting:** Run `pnpm lint` and fix all issues.
- **Type Checking:** Run `pnpm tsc --noEmit` and fix all type errors.
- **Tests:** Run `pnpm test` and ensure all tests pass.
- **Dead Code/Dependency Check:** Run `pnpm exec knip --no-gitignore` to ensure no unused files, exports, or dependencies remain.

These checks are enforced in CI (`.github/workflows/ci.yml`, `.github/workflows/ci-knip.yml`) and pre-commit (`.pre-commit-config.yaml`). 