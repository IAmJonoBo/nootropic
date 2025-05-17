# CLI Usage Guide

Welcome to the **nootropic** CLI usage guide! This document covers all major CLI commands, automation scripts, flags, troubleshooting, and LLM/AI-usage hints for contributors and agents.

---

## 🚀 Quick Reference

- **List all scripts:**
  ```sh
  pnpm run
  ```
- **Run a script with help:**
  ```sh
  pnpm tsx <script>.ts --help
  ```
- **Run a script with machine-readable output:**
  ```sh
  pnpm tsx <script>.ts --json
  ```

---

## 📜 Major CLI Commands & Scripts

| Script                        | Description                                      | Flags/Options         |
|-------------------------------|--------------------------------------------------|----------------------|
| `generateBacklogSummary.ts`   | Generate `.nootropic-cache/backlog-summary.json` | `--help`, `--json`   |
| `backlogInsights.ts`          | Output backlog insights and staleness reports     | `--help`, `--json`   |
| `aiTriageBacklogTodos.ts`     | AI/LLM triage and prioritization of TODOs        | `--help`, `--json`   |
| `backlogSync.ts`              | Sync backlog and derived files                   | `--help`, `--json`   |
| `pruneBacklogTodos.ts`        | Prune/Archive resolved/ignored TODOs             | `--help`, `--json`   |
| `generateDocsFromDescribe.ts` | Generate docs/specs from describe registry       | `--help`, `--json`   |
| `generateContextGraph.ts`     | Generate context/semantic graph                  | `--help`, `--json`   |
| `generateSemanticEmbeddings.ts`| Generate semantic embeddings for context         | `--help`, `--json`   |

---

## 🏷️ Flags & Options

- `--help`: Show usage and available options for any script.
- `--json`: Output results in machine-readable JSON format for LLM/AI workflows.
- Most scripts support additional flags (see `--help`).

---

## 🛠️ Troubleshooting

- **Module not found:**
  - Ensure you are in the project root and have run `pnpm install`.
  - Check script path and file extension.
- **Permission denied:**
  - Check file permissions for `.nootropic-cache/` and output files.
- **Script fails silently:**
  - Run with `--help` or `--json` for more verbose output.
  - Check logs and output files for error messages.

---

## 🤖 LLM/AI Usage Hints

- All scripts are designed to be LLM/AI-usable with `--json` output.
- Use `backlogInsights.ts` and `aiTriageBacklogTodos.ts` for automated triage and prioritization.
- Use `generateBacklogSummary.ts` to keep LLM/agent workflows in sync with the backlog.
- See [Onboarding Guide](./onboarding%20guide%20(planned).md) and [Onboarding Instructions](./onboarding%20instructions%20(planned).md) for more context.

---

## 📚 Related Docs

- [Onboarding Guide](./onboarding%20guide%20(planned).md)
- [Onboarding Instructions](./onboarding%20instructions%20(planned).md)
- [Onboarding Troubleshooting](./onboarding%20troubleshooting%20(planned).md)
- [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**For more details, run any script with `--help` or see the script source in the `scripts/` directory.**

