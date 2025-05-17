# Utilities Reference

This page documents all major utilities in the `utils/` directory. Each utility is designed for modularity, LLM/AI-friendliness, and automation. Use this as a quick reference for contributors and LLM/AI agents.

---

## 📦 Core Utilities

- **utils.ts**: General-purpose helpers for file I/O, JSON parsing, patch generation, and more. Used across scripts and agents.
- **automationHelpers.ts** (planned): Shared helpers for automation scripts (file reading/writing, error handling, etc.).
- **cliHelpers.ts**: CLI argument parsing, usage printing, and result formatting for all automation scripts. Ensures consistent CLI/flag support.

---

## 🧠 Context & Embedding Utilities

- **context/**: Context management, chunking, summarization, and memory utilities.
  - **ChunkingUtility.ts**: LLM-driven chunking and semantic passage evaluation.
  - **HybridRetrievalUtility.ts**: Hybrid retrieval (BM25 + dense) for advanced RAG workflows.
  - **shimiMemory.ts**: Tree-based memory for agentic workflows.
  - **RerankUtility.ts**: Bi-encoder/cross-encoder reranking for retrieval.

---

## 📝 Describe, Plugin, and Feedback Utilities

- **describe/**: Registry/describe/health compliance helpers.
- **plugin/**: Plugin scaffolding, CLI, and templates.
- **feedback/**: Feedback/memory helpers for submission, retrieval, and suggestion routing.

---

## 🔒 Security & Testing Utilities

- **security/**: Secret scanning, guardrails, audit logging, and compliance helpers.
- **testing/**: Mutation, contract/integration, and coverage helpers.

---

## 🤖 LLM/AI Usage Hints

- All utilities are designed to be LLM/AI-usable and registry/describe compliant.
- Use `--json` flags in scripts for machine-readable outputs.
- See [CLI Usage Guide](./CLI%20usage%20(planned).md) and [Onboarding Guide](./onboarding%20guide%20(planned).md) for more.

---

## 📚 Related Docs

- [CLI Usage Guide](./CLI%20usage%20(planned).md)
- [Onboarding Guide](./onboarding%20guide%20(planned).md)
- [Onboarding Instructions](./onboarding%20instructions%20(planned).md)
- [Onboarding Troubleshooting](./onboarding%20troubleshooting%20(planned).md)

