# Onboarding Troubleshooting

Welcome to the **nootropic** onboarding troubleshooting guide! This document lists common issues encountered during setup, automation, and CI, along with solutions and helpful links.

---

## 1. Setup & Installation Issues

**Problem:** `pnpm install` fails or dependencies are missing.
- **Solution:**
  - Ensure you are using Node.js v18+ and the latest pnpm.
  - Run `pnpm install -f` to force a clean install.
  - Delete `node_modules` and `pnpm-lock.yaml`, then reinstall.

**Problem:** Python-related errors (for advanced features).
- **Solution:**
  - Ensure Python 3.10+ is installed and available in your PATH.
  - (Optional) Create a virtual environment for Python dependencies.

---

## 2. Running Scripts & Automation

**Problem:** `pnpm tsx ...` scripts fail with module not found errors.
- **Solution:**
  - Ensure all dependencies are installed (`pnpm install`).
  - Check that the script path and file extension are correct.
  - For ESM/CommonJS issues, ensure you are using the correct import/export syntax.

**Problem:** Automation scripts (e.g., `generateBacklogSummary.ts`, `backlogInsights.ts`) do not update cache files.
- **Solution:**
  - Check for file write permissions in `.nootropic-cache/`.
  - Run scripts with the correct working directory (project root).
  - Review script output for error messages.

---

## 3. CI/CD & Linting

**Problem:** CI fails on lint, type check, or tests.
- **Solution:**
  - Run `pnpm lint`, `pnpm tsc --noEmit`, and `pnpm test` locally to reproduce errors.
  - Fix all reported issues before pushing.

**Problem:** Pre-commit hooks block commits.
- **Solution:**
  - Review `.pre-commit-config.yaml` for enforced checks.
  - Run the required scripts locally and fix issues.

---

## 4. Backlog & Automation Hygiene

**Problem:** Backlog scripts do not update or prune items as expected.
- **Solution:**
  - Ensure you are running the correct script (see [Onboarding Instructions](./onboarding%20instructions%20(planned).md)).
  - Check for JSON syntax errors in `agentBacklog.json`.
  - Review script output for triage or permission issues.

---

## 5. Feature Discovery & CLI Usage

**Problem:** CLI commands or feature discovery do not list expected capabilities.
- **Solution:**
  - Ensure all modules export a static `describe()` method.
  - Run `pnpm run nootropic list-capabilities` to refresh the registry.
  - See [CLI usage](./CLI%20usage%20(planned).md) for more details.

---

## 6. Getting Help

- See the [Onboarding Guide](./onboarding%20guide%20(planned).md) and [Onboarding Instructions](./onboarding%20instructions%20(planned).md) for setup and workflow details.
- For CI/CD and automation issues, see [CONTRIBUTING.md](../../CONTRIBUTING.md).
- For advanced LLM/AI integration, see [llm-integration.md](../llm-integration.md).
- If you are stuck, open an issue or join the discussion board.

---

**Happy hacking!**

