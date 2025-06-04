Below is the fully updated docs/TOOLCHAIN.md, ensuring every library, tool, technology, and package mentioned across all previous drafts is now included. Citations remain intact.

⸻

# Nootropic Toolchain Specification

## Table of Contents

* [Nootropic Toolchain Specification](#nootropic-toolchain-specification)
  * [Table of Contents](#table-of-contents)
  * [Summary](#summary)
  * [1. Monorepo & Build Tooling](#1-monorepo--build-tooling)
    * [1.1 Nx as the Canonical Monorepo Manager](#11-nx-as-the-canonical-monorepo-manager)
    * [1.2 Compiler & Bundling](#12-compiler--bundling)
    * [1.3 npm Workspaces & Dependency Management](#13-npm-workspaces--dependency-management)
    * [1.4 Linting & Formatting](#14-linting--formatting)
  * [2. Testing & Coverage](#2-testing--coverage)
    * [2.1 Vitest as Primary Test Runner](#21-vitest-as-primary-test-runner)
    * [2.2 Legacy Frameworks (Optional)](#22-legacy-frameworks-optional)
    * [2.3 End-to-End Testing](#23-end-to-end-testing)
  * [3. LLM Inference & Model Routing](#3-llm-inference--model-routing)
    * [3.1 Local-First Inference Tier](#31-local-first-inference-tier)
    * [3.2 Hybrid Routing via ModelRegistry](#32-hybrid-routing-via-modelregistry)
  * [4. Vector Databases & Retrieval](#4-vector-databases--retrieval)
    * [4.1 LanceDB for Local/Offline](#41-lancedb-for-localoffline)
    * [4.2 ChromaDB as Default RAG Store](#42-chromadb-as-default-rag-store)
    * [4.3 Milvus for Clustered Scale](#43-milvus-for-clustered-scale)
    * [4.4 Weaviate for Hybrid Search](#44-weaviate-for-hybrid-search)
  * [5. Full-Text Search & Document Indexing](#5-full-text-search--document-indexing)
    * [5.1 Elasticsearch (v8.x)](#51-elasticsearch-v8x)
    * [5.2 SQLite / PostgreSQL](#52-sqlite--postgresql)
  * [6. Orchestration & Self-Healing](#6-orchestration--self-healing)
    * [6.1 Temporal (v1.18+)](#61-temporal-v118)
    * [6.2 RxJS & ReflexionEngine](#62-rxjs--reflexionengine)
    * [6.3 Keptn & LitmusChaos](#63-keptn--litmuschaos)
  * [7. Observability & Logging](#7-observability--logging)
    * [7.1 OpenTelemetry for AI-Focused Tracing](#71-opentelemetry-for-ai-focused-tracing)
    * [7.2 Explainability Panel](#72-explainability-panel)
    * [7.3 Structured Logging](#73-structured-logging)
  * [8. Security & Compliance](#8-security--compliance)
    * [8.1 Supply-Chain Protection](#81-supply-chain-protection)
    * [8.2 Vulnerability Scanning & Secrets Protection](#82-vulnerability-scanning--secrets-protection)
  * [9. Documentation & Developer Experience](#9-documentation--developer-experience)
    * [9.1 Documentation Platform](#91-documentation-platform)
    * [9.2 CLI Framework & Interactive Onboarding](#92-cli-framework--interactive-onboarding)
  * [10. Registry-Driven Discovery & Capability Registry](#10-registry-driven-discovery--capability-registry)
    * [10.1 Unified `describe()` Interface](#101-unified-describe-interface)
    * [10.2 Central Registry JSON](#102-central-registry-json)
  * [11. Summary Table of Toolchain](#11-summary-table-of-toolchain)

***

## Summary

This document provides the definitive toolchain for **nootropic**, reconciling the master architecture brief with best practices. It specifies every tool, library, and package used in development, testing, deployment, and runtime—prioritizing a lean, Nx-powered monorepo; local-first AI/LLM workflows; flexible retrieval backends; robust orchestration and self-healing; comprehensive observability; and strong security/compliance. Each section cites rationale to demonstrate performance, extensibility, and future-proofing.

***

## 1. Monorepo & Build Tooling

### 1.1 Nx as the Canonical Monorepo Manager

* **Nx (v16+)**: Official monorepo orchestrator offering AI/LLM-friendly project graphs, incremental caching ("affected" tasks), and built-in generators for scaffolding. Nx ensures consistent linting, testing, and formatting across packages and extensions .
* **ESLint Integration**: Nx extends `plugin:@nrwl/nx/typescript` and `plugin:prettier/recommended` to enforce strict import hygiene (`import/order`) and style consistency .
* **No TypeScript Project References**: Each `tsconfig.json` sets `"composite": false` and `"declaration": false` per master brief. Avoiding `.d.ts` emission reduces CI overhead and eliminates declaration drift .
* **Graph Library (graphlib or dagre)**: Used by ProjectMgrAgent to represent and visualize task dependency DAGs within the IDE and Electron UI.
* **YAML Parser (js-yaml, v4+)**: Parses `project-spec.yaml` for ProjectMgrAgent to generate PDDL domain/problem files.

### 1.2 Compiler & Bundling

* **TypeScript (v5+) with NodeNext/ESM**: All `tsconfig.json` files use `"module": "NodeNext"` and `"moduleResolution": "NodeNext"` for native ESM support. All `package.json` files set `"type": "module"` for ESM compatibility. All local imports must use explicit `.js` extensions. No TypeScript project references; `"composite": false`, `"declaration": false` in base config. Each project sets its own `baseUrl`, `outDir`, and `rootDir`.
* **SWC (v0.2.x)**: Default TypeScript compiler, offering sub-50ms compile times for large codebases, significantly reducing developer feedback loops .
* **Esbuild (v0.18+)**: Used to bundle production artifacts (Electron main process, VSIX) due to its extremely fast tree-shaking and bundling performance .

### 1.3 npm Workspaces & Dependency Management

* **pnpm Workspaces (v8+)**: Canonical package manager for this monorepo. All dependency management and scripts use pnpm. Do not use yarn or npm directly. Underpins Nx by installing dependencies at root for all packages (`apps/*`, `libs/*`), ensuring deduplication and consistent resolutions .

### 1.4 Linting & Formatting

* **ESLint (v8+)**: Enforces TypeScript/JavaScript best practices, extending `@typescript-eslint/recommended`. Rules like `no-explicit-any` maintain type safety where applicable.
* **Prettier (v2+)**: Standardizes formatting (indentation, quotes) across code, Markdown, JSON, and YAML, avoiding style debates in PRs .

***

## 2. Testing & Coverage

### 2.1 Vitest as Primary Test Runner

* **Vitest (v3.x+)**: Vite-based test runner integrated with Nx for JS/TS. Uses a root `vitest.config.ts` with a `projects` array for all testable libs/apps, and per-lib `vitest.config.ts` using `defineProject` and `globals: true`. All test files must contain at least one test suite (placeholder if needed). Mac resource fork files (`._*`) should be deleted from test directories if present. `nx affected:test` runs only impacted tests, reducing CI times .

### 2.2 Legacy Frameworks (Optional)

* **Jest (v29+)** & **Mocha + Chai (v10+)**: Available for submodules requiring specialized reporters or integration with native extensions (e.g., C++ or Python). Maintained under `tools/legacy-tests` and invoked explicitly as needed .
* **pytest (v8+)**: Python test runner for Python-based adapters or components.
* **JUnit (v5+)**: Java test framework for Java-based modules or plugins.

### 2.3 End-to-End Testing

* **Playwright (v1.33+)**: Automates E2E for the `nootropic` CLI (child process) and VS Code extension (`@vscode/test`), verifying file diffs and command outputs .
* **Cypress (v12+)**: Used for any browser-based UI components (e.g., Electron's React webviews), ensuring plugin manager and search panels function correctly .

***

## 3. LLM Inference & Model Routing

### 3.1 Local-First Inference Tier

* **Tabby ML (v0.4+)**: Self-hostable GPT-compatible server supporting StarCoder2 and CodeLlama. Achieves ~50 tokens/s on a 3090 GPU, with <100ms latency per 100 tokens .
* **Ollama (v1.0+)**: Manages GGUF/ GGML quantized models (e.g., CodeLlama 7B 4-bit) on local hardware. Runs at ~20 tokens/s on an RTX 3060 with <12GB VRAM .
* **vLLM (v0.13+)**: GPU inference engine for LLaMA models (e.g., 100 tokens/s on A100), suitable for users with high-end hardware .
* **Exllama v2 (v2.0+)**: Lightweight Llama 2 kernel for consumer GPUs (~80 tokens/s on 3080 Ti) .
* **llama.cpp (v4.x)**: C/C++ inference engine for LLaMA-family models on CPU/GPU, supporting quantized formats for on-device LLM inference.
* **GPT4All (v1.1)**: Bundles small GPT models (e.g., Alpaca) with an Electron frontend for offline inference and prototyping.
* **Local.AI (v0.8+)**: Provides a universal REST API to run multiple LLMs (Llama, Mistral, Falcon) locally with auto-quantization.
* **LM Studio CLI (v1.2+)**: Command-line tool for managing and running GGUF/GGML models locally, with optimized pipelines.

### 3.2 Hybrid Routing via ModelRegistry

* **ModelRegistry (Zod v3.21+)**: Defines a JSON schema (`~/.nootropic/config.json`) with fields: `modelAlias`, `backend: ["local","tabby","vllm","exllama","openai","anthropic"]`, and `policy: ["localPreferred","cloudFallback"]`. Validated by Zod at startup to prevent misconfiguration .
* **AutoGPTQ (v0.3+)**: Automates quantization (4-bit, 8-bit) for LLaMA-based models, integrated into ModelRegistry pipelines to balance performance and accuracy.
* **Routing Logic**: ModelRegistry selects the best local backend per hardware capabilities. If no local backend is viable, falls back to **OpenAI GPT-4o** or **Anthropic Claude 3 Opus** .
* **User Overrides**: Example policy: `{ "localPreferred": true, "maxCostPerRequest": 0.001 }` ensures on-prem first unless latency or token usage exceeds thresholds.

***

## 4. Vector Databases & Retrieval

### 4.1 LanceDB for Local/Offline

* **LanceDB (v0.1.x)**: On-disk Arrow-based store for up to ~1M vectors with auto-compaction. Provides <10ms p99 query latency on a laptop CPU .

### 4.2 ChromaDB as Default RAG Store

* **ChromaDB (v0.4+)**: Lightweight vector DB using HNSWLib (v0.7+), ~5ms p95 latency on 100k vectors. Primary store for RAG and MemoryAgent, with Python/Node.js SDKs .
* **HNSWLib (v0.7+)**: The underlying ANN index library used by ChromaDB and LanceDB for fast approximate nearest neighbor searches.
* **Elasticsearch (v8.x)**: Optionally used for full-text indexing of code and documentation, complementing vector-based retrieval in SearchAgent.
* **VectorStoreAdapter**: Abstracts ChromaDB, LanceDB, Milvus, Weaviate behind a unified API (`upsert()`, `query()`, `delete()`). Dynamically switches backends based on dataset size or configuration.

### 4.3 Milvus for Clustered Scale

* **Milvus (v2.3+)**: GPU-accelerated, distributed vector DB for >10M vectors. Uses IVF+PQ and HNSW indexes to achieve ~0.1s latency on 10M vectors with an 8×A100 node cluster .

### 4.4 Weaviate for Hybrid Search

* **Weaviate (v1.18+)**: Hybrid vector+keyword DB with GraphQL interface, ACLs, and modular text2vec modules. VectorStoreAdapter falls back to Weaviate for schema-based or filtered queries .
* **Qdrant (v1.12+)**: Lightweight Rust-based vector DB with advanced filtering and GDPR compliance for mid-tier semantic search use cases.
* **FAISS (v1.7+)**: Core ANN library for custom indexing pipelines, used by ChromaDB, Milvus, and other vector stores for GPU-accelerated search.

***

## 5. Full-Text Search & Document Indexing

### 5.1 Elasticsearch (v8.x)

* **Role**: Full-text indexing of code and docs, with analyzers tuned for programming (`word_delimiter`, `camelCase`) to support regex, fuzzy, and phrase queries. Integrated with Kibana for debugging .

### 5.2 SQLite / PostgreSQL

* **SQLite (v3.x) + FTS5**: Local storage for project metadata (task definitions, plugin manifests) and small-scale full-text search.
* **PostgreSQL (v15+) + pgvector (v1.0+)**: Production RDBMS for metadata and fallback vector search, supporting relational+vector queries (e.g., `SELECT * FROM embeddings WHERE vector <-> $1 < 0.7`) .

***

## 6. Orchestration & Self-Healing

### 6.1 Temporal (v1.18+)

* **Role**: Orchestrates durable workflows (nightly LoRA fine-tuning, large refactors, CI self-healing). Temporal's event sourcing and exactly-once activity semantics ensure resilience: if a worker crashes, the workflow resumes from last checkpoint .

### 6.2 RxJS & ReflexionEngine

* **RxJS (v7+)**: Powers ReflexionEngine's in-process event bus. Uses operators (`bufferTime`, `retryWhen`) to implement reflexive reasoning loops: collects LLM outputs, CriticAgent feedback, and iterates until confidence exceeds thresholds or iteration limit is reached .
* **ReflexionEngine**: Emits typed events (`reasoning.start`, `reasoning.result`, `reasoning.escalation`) for subscribers (ExplainabilityAgent, ObservabilityAdapter) to consume in real time.
* **Node.js EventEmitter / gRPC Streams**: Implements ReflexionAdapter's in-process or networked event bus for multicast of events like `ModelSwitched` or `PatchApplied`.
* **Level-Up / SQLite (v3.x)**: Persists the ReflexionAdapter append-only event log (`reflexion-events.log`) and offset checkpoints for replay and durability.

### 6.3 Keptn & LitmusChaos

* **Keptn (v0.12+)**: Monitors Prometheus metrics (e.g., `ci.test.failures`, `service.latency`) and triggers remediation workflows (LitmusChaos experiments, rollbacks). Ensures automatic recovery when SLOs breach .
* **LitmusChaos (v2.3+)**: Defines Kubernetes CRDs (e.g., `pod-kill`, `network-latency`) to validate resilience. If chaos experiments breach SLOs, Keptn rolls back deployments to stable revisions .

***

## 7. Observability & Logging

### 7.1 OpenTelemetry for AI-Focused Tracing

* **OpenTelemetry (v1.20+)**: Instruments LLM calls, vector queries, and plugin lifecycle. Captures:
  * **Spans**: `reasoning.request` (attributes: `taskId`,`modelId`,`promptTokens`,`iterationCount`), `inference.call` (`backend`,`latencyMs`), `vector.query` (`namespace`,`k`,`latencyMs`).
  * **Metrics**: `reasoning.latency_ms` (histogram), `patchApplied.count` (counter), `reflexion.loop.count` (gauge).
* OTEL exporters send metrics to **Prometheus (v2.50+)** and traces to **Jaeger (v1.41+)**, visualized in **Grafana (v9+)** .

### 7.2 Explainability Panel

* **ExplainabilityAgent** subscribes to ReflexionEngine events, persisting CoT traces to `reflexion_events.log`.
* A React component in the Electron UI ("Explainability Panel") visualizes chain-of-thought, prompt token usage, and confidence scores, aiding developers in understanding AI decisions .

### 7.3 Structured Logging

* **Pino (v7+)**: High-performance, JSON-structured logging from Node.js services, including fields like `timestamp`, `level`, `component`, `requestId`. Logs correlate with OTEL traces for end-to-end observability .
* **Winston (v3+)**: Alternative Node.js logging library to Pino; used by some agents or adapters where structured logging must conform to legacy patterns.

***

## 8. Security & Compliance

### 8.1 Supply-Chain Protection

* **Sigstore (Rekor, v0.11+)**: Signs every npm package and Docker image, storing proofs in a public, immutable transparency log. Users can verify provenance before installation/deployment .
* **SLSA Level 2**: CI pipeline enforces builds in hermetic environments, signs resulting artifacts with a known GPG key, and verifies provenance before publishing to npm or container registry .

### 8.2 Vulnerability Scanning & Secrets Protection

* **Semgrep (v1.30+)**: Runs pre-commit and CI scans for security/style issues, using `--autofix` to automatically patch low-severity patterns (e.g., SQL injection) .
* **Trivy (v0.50+)**: Scans Docker images in CI for CVEs and misconfigurations; build fails on high/critical findings .
* **Snyk (v2.50+)**: Continuously monitors npm dependencies; auto-opens PRs when vulnerabilities emerge.
* **Dependabot (GitHub)**: Automatically scans and opens PRs to update vulnerable npm dependencies.
* **Data-Leak Guard (v1.0+)**: Pre-commit hook scans git diffs for high-entropy secrets (AWS keys, private keys) via Husky (v8+), blocking commits containing suspicious patterns .
* **Vault (v1.15+)**: Manages runtime secrets (API keys, DB credentials). Applications retrieve them via Vault API; Kubernetes CSI driver injects secrets into pods.
* **OPA (v0.53+)**: Enforces policies at deployment via Gatekeeper (e.g., disallowing unapproved registries or enforcing resource quotas) .

***

## 9. Documentation & Developer Experience

### 9.1 Documentation Platform

* **Docusaurus (v3.0+)**: Hosts versioned docs (v1.x, v2.x), with Algolia DocSearch integration for fast, relevance-based search .
* **TypeDoc (v0.29+)**: Generates API reference from JSDoc in TS packages (e.g., `packages/search-agent`). Rendered in Docusaurus via `docusaurus-plugin-typedoc` .
* **PlantUML & Mermaid**: Embeds architecture and sequence diagrams directly in Markdown for clarity (e.g., Temporal workflows, ReasoningAgent loops).

### 9.2 CLI Framework & Interactive Onboarding

* **Commander.js (v10+)**: Defines `nootropic` CLI with subcommands (`wizard`, `plan`, `scaffold`, `code`, `search`, `fix-tests`, `deploy`, `monitor`, `plugin:list`, `plugin:install`). Declarative option parsing and auto-generated help ensure consistency with capability registry .
* **Inquirer.js (v9+)**: Powers the `wizard` mode for interactive project setup (project name, language, dependencies, CI preferences). Generates `project-spec.yaml`, bootstraps Nx workspace, and populates initial templates with AI-generated suggestions (via Continue IDE) .
* **Continue IDE & Roo Code** Integration:
  * **Continue IDE**: Provides slash commands inside VS Code (`/plan`, `/code`, `/search`). Consumes JSON outputs from CLI (e.g., `nootropic plan --json`) and renders inline suggestions .
  * **Roo Code**: Enables multi-file refactors. The `/rewrite-file` command uses Roo Code's API to apply context-aware AST transformations (e.g., migrating Python 2 to 3) without timing out or losing editor state.
* **Yeoman (v5.x)** or **Cookiecutter (v2.x)**: Powers the `scaffold` command to generate new project skeletons based on `project-spec.yaml`, enabling language/framework selection and CI config templates.

### 9.3 markdownlint and markdownlint-cli2

* **markdownlint**: Enforces Markdown style and docs-as-code quality.
* **markdownlint-cli2**: Command-line tool for applying markdownlint rules.

***

## 10. Registry-Driven Discovery & Capability Registry

### 10.1 Unified `describe()` Interface

* Each agent/adapter implements `describe(): Capability[]` returning:
  * `id`: Unique identifier (e.g., `CoderAgent`)
  * `version`: Semantic version (e.g., `1.0.0-beta`)
  * `commands`: Array of CLI commands (e.g., `["code", "fix-tests"]`)
  * `inputs` / `outputs`: JSON schemas for expected data structures
  * `runtimeRequirements`: Requirements (e.g., GPU RAM ≥8GB for `vLLM`).

### 10.2 Central Registry JSON

* **PluginLoaderAdapter** watches `plugins/` via **Chokidar (v3.x)**. For each plugin, runs `describe()`, validating output against a Zod schema (v3.21+) to ensure fields (`id`, `description`, `inputs`, `outputs`, `runtimeRequirements`) .
* Aggregated capabilities are written to `~/.nootropic/describe-registry.json`. Used by:
  1. **CLI Help Generation**: `nootropic --help` auto-generates help text with available plugin commands.
  2. **Docs Synchronization**: A nightly GitHub Action reads this registry to regenerate `docs/AGENTS.md`, ensuring up-to-date documentation .
  3. **VS Code Extension**: Provides IntelliSense for slash commands at activation by querying the local registry.
* **Zod (v3.21+)**: Validates plugin manifest schemas (`name`, `version`, `commands`, `capabilities`) to ensure runtime consistency.

***

## 11. Summary Table of Toolchain

| Category                         | Tool / Library                                                                                                                                                                                                                            | Purpose & Rationale                                                                                                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo & Build Tooling**     | **Nx (v21+), pnpm (v8+), Nx Cloud**                                                                                                                                                                                                       | Nx's project graph, distributed caching, affected/parallelized runs, and pnpm workspace management are the canonical dev/CI workflow.                                                                                            |
|                                  | **SWC (v0.2.x), Esbuild (v0.18+)**                                                                                                                                                                                                        | SWC's sub-50ms compile, no-dts policy .                                                                                                                                                                                          |
|                                  | **ESLint (v8+), Prettier (v2+)**                                                                                                                                                                                                          | Enforces strict import hygiene and consistent formatting .                                                                                                                                                                       |
|                                  | **graphlib / dagre, js-yaml**                                                                                                                                                                                                             | DAG/graph representation for ProjectMgrAgent, and YAML parsing for project specs.                                                                                                                                                |
| **Testing & Coverage**           | **Vitest (v3.x+), Jest (v29+), Mocha+Chai (v10+), pytest (v8+), JUnit (v5+), Playwright (v1.33+), Cypress (v12+)**                                                                                                                        | Vitest's Vite-powered speed & Nx-affected runs ; legacy frameworks for specialized cases; Playwright for CLI & extension E2E ; Cypress for browser UIs .                                                                         |
| **LLM Inference & Routing**      | **Tabby ML (v0.4+), Ollama (v1.0+), vLLM (v0.13+), Exllama v2 (v2.0+), llama.cpp (v4.x), GPT4All (v1.1), Local.AI (v0.8+), LM Studio CLI (v1.2+), OpenAI SDK (v4.x), Anthropic SDK (v1.x), AutoGPTQ (v0.3+), ModelRegistry (Zod v3.21+)** | Local-first quantized inference (Tabby/Ollama/vLLM/Exllama/llama.cpp/GPT4All/Local.AI/LM Studio), hybrid fallback to cloud .                                                                                                     |
| **Vector DB & Retrieval**        | **LanceDB (v0.1.x), ChromaDB (v0.4+), Milvus (v2.3+), Weaviate (v1.18+), Qdrant (v1.12+), FAISS (v1.7+)**                                                                                                                                 | LanceDB auto-compaction for local use ; Chroma default for RAG ; Milvus/Weaviate for scale and hybrid search, Qdrant for GDPR/multi-tenant, FAISS underpins performance .                                                        |
| **Full-Text Search**             | **Elasticsearch (v8.x), SQLite (v3.x) + FTS5, PostgreSQL (v15+) + pgvector (v1.0+)**                                                                                                                                                      | Elastic's code analyzers (camelCase, regex) ; SQLite for local metadata and FTS; PostgreSQL+pgvector for production, combining relational & vector queries .                                                                     |
| **Orchestration & Self-Healing** | **Temporal (v1.18+), RxJS (v7+), ReflexionEngine, Node.js EventEmitter / gRPC Streams, Level-Up / SQLite (v3.x), Keptn (v0.12+), LitmusChaos (v2.3+)**                                                                                    | Durable workflows (Temporal's event sourcing) ; RxJS/ReflexionEngine for reflexive loops ; event bus persistence via Level-Up/SQLite; Keptn+LitmusChaos for automated remediation .                                              |
| **Observability & Logging**      | **OpenTelemetry (v1.20+), Prometheus (v2.50+), Grafana (v9+), Jaeger (v1.41+), Pino (v7+), Winston (v3+)**                                                                                                                                | AI-focused traces & metrics (OTEL) ; Grafana dashboards for performance/SLOs ; Pino/Winston for structured logging.                                                                                                              |
| **Security & Compliance**        | **Sigstore (Rekor v0.11+), SLSA (Level 2), Data-Leak Guard (v1.0+), Semgrep (v1.30+), Snyk (v2.50+), Trivy (v0.50+), Dependabot (GitHub), Vault (v1.15+), OPA (v0.53+)**                                                                  | Sigstore for transparency logs ; SLSA enforcement for CI provenance ; Semgrep/Trivy in CI ; Dependabot for automated dependency updates.                                                                                         |
| **Documentation & CLI**          | **Docusaurus (v3.0+), Algolia DocSearch, TypeDoc (v0.29+), PlantUML, Mermaid, Commander.js (v10+), Inquirer.js (v9+), Yeoman (v5.x) / Cookiecutter (v2.x), Continue IDE, Roo Code, markdownlint, markdownlint-cli2**                      | Versioned docs with Algolia search ; TypeDoc for API refs ; Yeoman/Cookiecutter for project scaffolding; AI-powered slash commands (Continue, Roo Code); **markdownlint/markdownlint-cli2 for docs-as-code style enforcement** . |
| **Registry-Driven Discovery**    | **Chokidar (v3.x), Zod (v3.21+), PluginLoaderAdapter, `describe-registry.json`**                                                                                                                                                          | Dynamic capability discovery—each agent/adaptor's `describe()` auto-registers into a central registry used by CLI & docs .                                                                                                       |
| **Ancillary Utilities**          | **Husky (v8+), Commitizen & Conventional Changelog, EditorConfig (v0.21+), Docker CLI & Docker Compose CLI Plugins, Azure/AWS/GCP CLIs**                                                                                                  | Pre-commit hooks for lint/tests, commit conventions for automated changelog, Docker-based local dev orchestration, and optional cloud CLI utilities .                                                                            |
