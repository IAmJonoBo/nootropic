# Describe Registry Guide

The **describe registry** is the canonical source for all capabilities, plugins, and utilities in the nootropic project. It enables discoverability, compliance, and LLM/AI-friendly automation across the codebase.

---

## 📖 Purpose

- Centralizes metadata for all capabilities, agents, plugins, and utilities.
- Ensures registry/describe/health compliance for automation, CI, and LLM/AI workflows.
- Drives onboarding, feature tables, and documentation generation.

---

## 🛠️ Usage

- All modules should export a static `describe()` method returning metadata (name, description, version, tags, promptTemplates, etc.).
- The registry is used by automation scripts (e.g., `generateDocsFromDescribe.ts`, `generateBacklogSummary.ts`) to generate docs, onboarding checklists, and LLM/AI-usable outputs.
- See [CLI Usage Guide](./CLI%20usage%20(planned).md) for script details.

---

## ➕ Adding New Capabilities

1. Implement your capability, agent, or utility in the appropriate directory.
2. Export a static `describe()` method with rich metadata and prompt templates.
3. Register the new capability in the registry file (see `describe/` utilities).
4. Run `generateDocsFromDescribe.ts` to update docs and onboarding.
5. Cross-link in onboarding and CLI usage docs as needed.

---

## 🤖 LLM/AI Usage Hints

- The registry powers LLM/AI workflows by surfacing all available capabilities and usage patterns.
- Use `--json` flags in scripts for machine-readable outputs.
- See [Onboarding Guide](./onboarding%20guide%20(planned).md) and [Utilities Reference](./utils%20(planned).md) for more.

---

## 📚 Related Docs

- [CLI Usage Guide](./CLI%20usage%20(planned).md)
- [Onboarding Guide](./onboarding%20guide%20(planned).md)
- [Utilities Reference](./utils%20(planned).md)

