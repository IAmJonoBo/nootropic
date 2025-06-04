# nootropic

***

## Table of Contents

* [nootropic](#nootropic)
  * [Table of Contents](#table-of-contents)
  * [Project Overview](#project-overview)
  * [Quick Links](#quick-links)
  * [Getting Started (At a Glance)](#getting-started-at-a-glance)
  * [Key Features](#key-features)
  * [How to Use This Documentation](#how-to-use-this-documentation)
  * [Getting Help](#getting-help)
  * [License](#license)

***

## Project Overview

**nootropic** is an open-source, self-healing, self-teaching AI development environment intended to run entirely (or primarily) on users' machines. It unifies project planning, code generation, static analysis, continuous integration, deployment, and ongoing learning into a single, cohesive platform. By default, all code, telemetry, and embeddings stay on-premises, and inference happens locally (via Tabby ML, Ollama, `llama.cpp`, or `vLLM`). Paid cloud APIs (OpenAI, Anthropic, Hugging Face, Petals) are opt-in only when local hardware cannot meet specified SLAs.

**Key design principles include:**

* **Free-first, local-first inference:** All essential LLM capabilities run offline.
* **Declarative, agent-driven workflows:** Users state high-level goals; agents (Planner, Coder, Critic, etc.) coordinate via Temporal workflows and RxJS streams.
* **Self-healing & Reflexion loops:** OpenTelemetry traces and OpenCost data feed a ReflexionEngine that automatically repairs or reroutes failing tasks.
* **Continuous learning:** Nightly LoRA fine-tuning on accepted diffs keeps local models improving over time, at zero cloud cost.
* **Registry-driven, plugin-based extensibility:** Core functionality is minimal; optional plugins (FuzzTesting, DesignSync, etc.) can be added without touching core code.

***

## Quick Links

* [`GETTING_STARTED.md`](GETTING_STARTED.md): Step-by-step installation and first run
* [`TUTORIALS/`](TUTORIALS/): Hands-on walkthroughs for common tasks
* [`ARCHITECTURE.md`](ARCHITECTURE.md): High-level system design and rationale
* [`COMPONENTS/`](COMPONENTS/): In-depth design for each agent and adapter
* [`API_REFERENCE.md`](API_REFERENCE.md): All public endpoints, data schemas, and examples
* [`CLI_REFERENCE.md`](CLI_REFERENCE.md): Detailed CLI commands and usage
* [`DEPLOYMENT.md`](DEPLOYMENT.md): Local and production deployment
* [`CI_CD.md`](CI_CD.md): CI/CD pipeline and configuration
* [`SECURITY.md`](SECURITY.md): Security policy and vulnerability reporting
* [`OPERATIONS.md`](OPERATIONS.md): Monitoring, backup, and maintenance
* [`ROADMAP.md`](ROADMAP.md): Milestones and governance
* [`GLOSSARY.md`](GLOSSARY.md): Definitions and acronyms
* [`CHANGELOG.md`](CHANGELOG.md): Notable changes and releases
* [`CONTRIBUTING.md`](CONTRIBUTING.md): How to contribute
* [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md): Community expectations

***

## Getting Started (At a Glance)

1. **Prerequisites**

   * `Node.js` (v18 or later)
   * `Python` (v3.9 or later)
   * `Docker` (for optional services)
   * `Git`
   * Optional: GPU and up-to-date drivers

2. **Clone the Repository**

   ```bash
   git clone https://github.com/your-org/nootropic.git
   cd nootropic
   ```

3. **Install Dependencies**

   ```bash
   # At the repo root (Nx monorepo)
   npm install
   # Python dependencies for Tabby ML
   pip install tabby-ml
   ```

4. **Start Local Services**

   * **Tabby ML (local LLM gateway):**

     ```bash
     tabby serve --host 0.0.0.0 --port 8000 --config tabby.config.json
     ```

   * **Temporal Server (durable workflow engine):**

     ```bash
     docker-compose -f infrastructure/temporal/docker-compose.yml up -d
     ```

   * **Chroma Vector Store:** (automatic after first run)

5. **Run the Onboarding Wizard**

   ```bash
   npx nootropic wizard
   ```

   Answer prompts to generate an initial `project-spec.md`, scaffold a skeleton, and create a task graph.

6. **Open VS Code Extension**

   * Install the VSIX from `apps/nootropic-vscode-ext/` or run in dev mode:

     ```bash
     cd apps/nootropic-vscode-ext
     npm install
     npm run build
     code --extensionDevelopmentPath="${PWD}"
     ```

   * In VS Code, invoke slash commands (`/nootropic`) in the chat pane or use inline diff previews.

> **Note:** This monorepo uses ESM/NodeNext everywhere. All `tsconfig.json` files use `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`. All `package.json` files set `"type": "module"`. All local imports must use explicit `.js` extensions. Use `pnpm` for all dependency management and Nx for all scripts. See troubleshooting below for ESM/NodeNext and Mac resource fork file issues.

***

## Key Features

1. **Intelligent, On-Prem Inference**

   * Hardware-aware Model Matcher: Probes CPU/GPU and scores quantized models (StarCoder2 3B, Llama 2 7B, Gemma 3 1B, etc.) for throughput, accuracy, memory, and cost. Falls back to cloud APIs only if needed.
   * Fully Local by Default: All embedding, generation, and retrieval happen locally. Only routes to cloud if local models can't meet requirements.
   * Nightly LoRA Fine-Tuning: User-approved diffs are used for nightly LoRA jobs, improving local models incrementally.

2. **Declarative Planning & Self-Healing**

   * Goal → DAG Planning: `PlannerAgent` turns high-level specs into a DAG of epics, stories, and tasks.
   * Autonomous Workflows: Each task spawns a Temporal sub-workflow (`CoderAgent`, `CriticAgent`, `ReasoningAgent`, `ProjectMgrAgent`).
   * ReflexionEngine & Auto-Repair: Monitors OpenTelemetry spans for errors/SLA breaches and triggers auto-repair or model switches.

3. **Hybrid RAG & Episodic Memory**

   * Chroma Vector Store: Stores code, docs, and "episodes" for semantic search and retrieval.
   * Optional Weaviate Integration: For large/multi-repo setups, use Weaviate (hybrid dense + BM25).
   * Few-Shot Priming: `MemoryAgent` fetches relevant "successful episodes" for few-shot context.

4. **Unified UX (VS Code & Electron)**

   * Continue VS Code Extension: Chat pane, slash commands, inline diff previews, explainability sidebar.
   * Electron Dashboard: Kanban board, Temporal Timeline, Mermaid/UML canvas, Trace Explorer.

5. **Security, Compliance & Observability**
   * In-Process `SecurityScannerAgent`: Runs Semgrep rules and applies AI autofix.
   * OpenTelemetry + OpenCost: All LLM calls and workflow activities emit OTEL spans with cost tags.
   * Keptn & LitmusChaos: SLO-driven remediation and chaos testing.
   * Supply-Chain Security: Docker images signed via Sigstore, CI pipelines include Trivy scans, SLSA Level 2 provenance.

***

## How to Use This Documentation

* **New Users:**
  1. Read [`GETTING_STARTED.md`](GETTING_STARTED.md) for installation and first run.
  2. Work through [`TUTORIALS/`](TUTORIALS/) for hands-on guides.
* **Developers & Contributors:**
  1. See [`ARCHITECTURE.md`](ARCHITECTURE.md) and [`COMPONENTS/`](COMPONENTS/) for design details.
  2. Use [`API_REFERENCE.md`](API_REFERENCE.md) and [`CLI_REFERENCE.md`](CLI_REFERENCE.md) for integration.
  3. Follow [`CONTRIBUTING.md`](CONTRIBUTING.md) for coding/testing standards.
* **Operators & Maintainers:**
  1. Read [`DEPLOYMENT.md`](DEPLOYMENT.md) and [`OPERATIONS.md`](OPERATIONS.md) for deployment and monitoring.
  2. Set up CI/CD with [`CI_CD.md`](CI_CD.md).
  3. Reference [`SECURITY.md`](SECURITY.md) for vulnerability reporting and compliance.
* **Community & Roadmap:**
  * See [`ROADMAP.md`](ROADMAP.md) for milestones and governance.
  * Consult [`GLOSSARY.md`](GLOSSARY.md) for terminology.
  * Track changes in [`CHANGELOG.md`](CHANGELOG.md).
  * Adhere to [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md).

***

## Getting Help

* **Discussions & Support:**
  * Open an issue in GitHub Issues for bugs or features.
  * Join the Discord/Slack channel (see [`CONTRIBUTING.md`](CONTRIBUTING.md)).
* **Reporting Vulnerabilities:**
  * Follow [`SECURITY.md`](SECURITY.md) for confidential reporting.

### Troubleshooting

* If you see errors about missing `describe`/`it` in tests, ensure each lib/app has a `vitest.config.ts` with `globals: true` and at least one test suite per file.
* If you see ESM/NodeNext import errors, check that all local imports use explicit `.js` extensions and all `package.json` files set `"type": "module"`.
* If you see errors about `._*` files or `Unexpected \x00`, delete Mac resource fork files from your test directories: `find . -name '._*' -delete`.

***

## License

nootropic is released under the Apache 2.0 License. See the `LICENSE` file for full terms and conditions.

***

Thank you for exploring nootropic—let's build smarter, self-repairing, and continuously improving AI-driven projects!

## Documentation Linting

All Markdown documentation is checked using a two-phase process: auto-fix (Prettier, remark-lint) and manual review (markdownlint-cli2). For full automation, run:

```bash
pnpm run clean:md
```

This script runs Prettier, remark-lint, and markdownlint-cli2 in sequence. See [GETTING\_STARTED.md#markdown-linting-and-formatting](./GETTING_STARTED.md#markdown-linting-and-formatting) for details and commands.
