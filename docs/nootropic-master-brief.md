***

# NOTE: The canonical source for the technology and tool stack is `docs/TOOLCHAIN.md`. This document provides high-level architecture and vision. For all authoritative details on tools, libraries, and stack, refer to TOOLCHAIN.md.

***

title: Nootropic Re-imagined
summary: Canonical architecture & stack for the AI-native rewrite
tags: \[spec, architecture]
updated: 2025-06-03

***

# Nootropic Reimagined

***

## Table of Contents

- [NOTE: The canonical source for the technology and tool stack is `docs/TOOLCHAIN.md`. This document provides high-level architecture and vision. For all authoritative details on tools, libraries, and stack, refer to TOOLCHAIN.md.](#note-the-canonical-source-for-the-technology-and-tool-stack-is-docstoolchainmd-this-document-provides-high-level-architecture-and-vision-for-all-authoritative-details-on-tools-libraries-and-stack-refer-to-toolchainmd)
- [Nootropic Reimagined](#nootropic-reimagined)
  - [Table of Contents](#table-of-contents)
  - [1. Architecture Overview](#1-architecture-overview)
    - [1.1 Monorepo \& Build Tooling](#11-monorepo--build-tooling)
    - [1.2 Lean Codebase Conventions](#12-lean-codebase-conventions)
    - [1.x Registry-Driven Discovery \& LLM-First UX](#1x-registry-driven-discovery--llm-first-ux)
    - [1.3 Durable, Reactive Orchestration](#13-durable-reactive-orchestration)
    - [1.4 Unified Model Abstraction \& Hybrid Routing](#14-unified-model-abstraction--hybrid-routing)
    - [1.5 Task Graph Planning \& Critical Path](#15-task-graph-planning--critical-path)
    - [1.6 Adaptive Intelligence \& Continuous Learning](#16-adaptive-intelligence--continuous-learning)
  - [2. Quantization \& Inference Engine](#2-quantization--inference-engine)
  - [3. AI/LLM Integration](#3-aillm-integration)
  - [4. Observability \& Resilience](#4-observability--resilience)
  - [5. Developer Experience \& Extensibility](#5-developer-experience--extensibility)
  - [6. Implementation Roadmap](#6-implementation-roadmap)
  - [7. Core Agent Ecosystem](#7-core-agent-ecosystem)
  - [8. Adapter Layer](#8-adapter-layer)
  - [9. Utility Services](#9-utility-services)
  - [10. Self-Healing \& Meta-Reasoning Patterns](#10-self-healing--meta-reasoning-patterns)
  - [11. Workflow Patterns](#11-workflow-patterns)
  - [12. Observability \& Feedback Loops](#12-observability--feedback-loops)
  - [13. Extensibility \& Governance](#13-extensibility--governance)
  - [14. AI Coding Assistant Pain Points](#14-ai-coding-assistant-pain-points)
    - [14.1 Context \& Memory Limitations](#141-context--memory-limitations)
    - [14.2 Inaccurate or Irrelevant Suggestions](#142-inaccurate-or-irrelevant-suggestions)
    - [14.3 Lack of Explainability \& Trust](#143-lack-of-explainability--trust)
    - [14.4 Performance \& Latency](#144-performance--latency)
  - [15. Proposed New Agents \& Utilities](#15-proposed-new-agents--utilities)
  - [16. Supporting Technologies \& Integrations](#16-supporting-technologies--integrations)
    - [16.1 Hybrid Local/Cloud Model Routing](#161-hybrid-localcloud-model-routing)
    - [16.2 Sourcegraph \& Code Search](#162-sourcegraph--code-search)
    - [16.3 OpenAI Function Calling \& Tools](#163-openai-function-calling--tools)
    - [16.4 Real-Time Collaboration Hooks](#164-real-time-collaboration-hooks)
    - [16.5 Explainable AI Tooling](#165-explainable-ai-tooling)
  - [17. Best-of-Breed Feature Integration](#17-best-of-breed-feature-integration)
  - [18. Registry-First, Code-as-Docs](#18-registry-first-code-as-docs)
  - [19. End-to-End Technology Stack (Aurora)](#19-end-to-end-technology-stack-aurora)
    - [19.1 Key Enhancements](#191-key-enhancements)
    - [19.2 Tech-Stack Matrix](#192-tech-stack-matrix)
    - [19.3 Performance Outcomes](#193-performance-outcomes)
  - [20. AutoRL \& Continuous Optimisation](#20-autorl--continuous-optimisation)
    - [20.1 Reinforcement Learning Feedback Loops](#201-reinforcement-learning-feedback-loops)
    - [20.2 Continual Parameter-Efficient Fine-Tuning](#202-continual-parameter-efficient-fine-tuning)
    - [20.3 Automated Evaluation Harness](#203-automated-evaluation-harness)
    - [20.4 Safety \& Alignment Guard-Rails](#204-safety--alignment-guard-rails)
  - [A. Advanced Ops \& Security](#a-advanced-ops--security)

***

> **Executive Summary**

Nootropic's reimagined architecture unifies cutting-edge monorepo tooling, ultra-fast build pipelines, durable orchestration, hybrid local/cloud LLM support, advanced quantization, AI-native observability, resilience practices, and superior developer ergonomics. This document outlines the recommended stack, agent ecosystem, pain points, and best-of-breed integrations for a next-generation, explainable, and self-healing AI coding platform.

***

## 1. Architecture Overview

### 1.1 Monorepo & Build Tooling

* **Nx** for monorepo management: distributed task-graph caching, dependency graph visualiser, and rich plugin ecosystem.
* **SWC (`@nx/js:swc` executor)** as the default compiler for every library; emits source-maps, no declaration files, ~20 × faster than `tsc`.
* **esbuild / Bun** reserved only for final application bundles and dev/CI scripts where single-binary output matters.
* **Workspace linking, no project-references**: every library sets `"composite": false` and `"declaration": false`; Nx links via the package-manager workspace to honour the project's strict *no-dts* policy.
* **NodeNext module resolution** with explicit file extensions enforced by ESLint; aliases (`@agents/*`, `@utils/*`, `@core/*`) defined once in `tsconfig.base.json`.
* **Vitest** (via `@nx/vite:test`) as the only test runner; workspace-mode parallelism plus Nx affected targets keep CI lean.
* **OpenTelemetry** injected at `BaseAgent` level, so every agent gets tracing "for free".
* **ESLint guard-rails** (`import/no-absolute-path`, `import/extensions`, `@typescript-eslint/consistent-type-imports`) run in every PR.
* **Remote distributed cache** – configured via Nx Cloud (or self-hosted S3/GCS bucket) to guarantee < 2 s no-op CI.
* **Default executor** – set globally to `@nx/js:swc`; legacy Turborepo configs are removed.
* **Strict ESLint import hygiene** – CI blocks `require()` regressions and missing extensions.

### 1.2 Lean Codebase Conventions

1. **Single runtime package (`@nootropic/runtime`)**\
   Consolidates `BaseAgent`, `eventBus`, `agentControl`, and logging helpers.

2. **Context & Retrieval package (`@nootropic/context`)**\
   Bundles `MemoryAgent`, chunking, hybrid retrieval, index builder, and RAG pipeline under one API (`context.snapshot()`, `context.search()`, `context.hydrate()`).

3. **Agent families, not one-off classes**

   * `CoderAgent` = writer + mutator + refactor strategies
   * `CriticAgent` = review + formal-verify modes
   * `PairProgrammingAgent` absorbs voice/CLI features of `VibeCodingAgent`
   * Ensemble voting logic folded into the ReflexionEngine

4. **Capability Registry first**\
   Every agent/export exposes `describe()`. CLI, wizards, and docs derive help & autocompletion from `.nootropic-cache/describe-registry.json`.

5. **TaskGraphService as single source of truth**\
   PlannerAgent, ProjectManagerAgent, and OrchestratorAgent all read/write the same DAG; no ad-hoc todo lists inside prompts.

6. **Zero declaration files**\
   All libs set `"declaration": false`, `"composite": false`; artefacts are pure JS + sourcemaps.

7. **Strict import hygiene**\
   Codemods removed leading-slash paths; ESLint rules block regressions and a nightly extension-enforcer keeps relative paths explicit.

### 1.x Registry-Driven Discovery & LLM-First UX

All agents, adapters, and utilities now export a `describe()` method and live in a unified capability registry (`.nootropic-cache/describe-registry.json`). The CLI, wizards, and future IDE/plugins dynamically load this registry to:

1. Autocomplete commands and flags.
2. Surface up-to-date help and documentation.
3. Power AI-driven suggestions via the `registryQuery` utility.

This design ensures every capability—be it a `SecurityScannerAgent`, `BacklogManagementUtility`, or `MutationTestingUtility`—is instantly discoverable, documented, and test-covered.

### 1.3 Durable, Reactive Orchestration

* **Temporal.io** workflows: auto-persist state at each step, resume after failures, and provide time-travel debugging for complex multi-agent flows.
* **RxJS** event streams: observable pipelines with backpressure, error recovery, and dynamic multicasting for decoupled agent communication.
* **Dynamic Plugin Loader:** hot-reloadable agents/adapters validated at runtime with Zod schemas for zero-boilerplate extensibility.
* **Dynamic Command Registry:** Instead of hard-coded subcommands, the CLI loads capabilities at runtime from `.nootropic-cache/describe-registry.json` and dispatches `npx nootropic <capability>` automatically.

### 1.4 Unified Model Abstraction & Hybrid Routing

* **ModelRegistry Interface:** Zod-validated metadata describing each backend's type (local quantized, on-prem container, cloud API), latency, cost, and accuracy.
* **Intelligent Routing:** Oblix.ai patterns to monitor system load, request complexity, and SLAs to dynamically route inference to local or remote LLMs.
* **Fallback Strategy:** Attempt local inference first; if SLAs aren't met, degrade to a cloud API (OpenAI, HuggingFace).
* **Local-First Inference:** Integrations with Ollama CLI & Tabby ML provide sub-100 ms on-device completions, with cloud fallback only when SLAs necessitate.

### 1.5 Task Graph Planning & Critical Path

| Component                               | Purpose                                                                 | Implementation Notes                                                                                                                                               |
| --------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **TaskGraphService**                    | Durable DAG of tasks with `duration`, `cost`, `deps`, `status`.         | Persists to Temporal KV + Redis; each node maps to a Temporal child-workflow.                                                                                      |
| **Symbolic micro-planner (PDDL / HTN)** | Converts a goal into the smallest feasible DAG before any LLM call.     | Use `pddl-lib` or `htn-solver`; keeps binary size small. **Default engine is `pyperplan` (WASM build) with optional containerised FAST-Downward for larger DAGs.** |
| **LLM Task Idealiser**                  | GPT-4 drafts tasks and estimates; symbolic layer validates constraints. | Combines creativity with deterministic guard-rails.                                                                                                                |
| **CriticalPathGuardRail**               | Middleware blocking any task not in the DAG.                            | Tags OTEL spans with `criticalPath=true`.                                                                                                                          |
| **Delta-planner loop**                  | Re-plans only the impacted subtree after each deviation.                | Prevents roadmap drift while staying reactive.                                                                                                                     |

> **Outcome** – PlannerAgent now delivers deterministic critical-path tracking yet adapts instantly to micro-deviations.

### 1.6 Adaptive Intelligence & Continuous Learning

Nootropic's agents are not static scripts—they adapt their behaviour at runtime, coordinating through shared memory, policy feedback and on‑the‑fly LLM reasoning.

| Capability                          | Mechanism                                                                                                                                                                                                                                                   | Key Artefacts                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| **Live Re‑planning**                | PlannerAgent re‑queries the TaskGraphService after every task completion. It uses a *few‑shot* GPT‑4 prompt that embeds the current DAG, latency/cost telemetry and outstanding goals, returning a JSON patch that is schema‑validated before being merged. | `PlannerAgent`, `TaskGraphService`, `Δ‑Planner Loop`        |
| **Critical‑Path Drift Detection**   | CriticalPathGuardRail listens to OTEL traces; if a span marked `criticalPath=true` exceeds its SLA, the guard‑rail flags the node and triggers an immediate micro‑replan.                                                                                   | `CriticalPathGuardRail`, OTEL span processor                |
| **Reflexion‑Driven Self‑Repair**    | On any failure event, ReflexionEngine queries the embedded RSM trace and automatically chooses a repair policy: *retry with revised parameters*, *roll back one node*, or *escalate to human‑in‑the‑loop*.                                                  | `ReflexionEngine`, `Reflexion State Machine`                |
| **Cost‑Aware Scheduling**           | Each node in the TaskGraph carries a running $‑cost (from ModelRegistry + OpenCost tags). PlannerAgent prefers local models if cumulative cost threatens the sprint budget.                                                                                 | `ModelRegistry`, `OpenCost OTEL exporter`                   |
| **Lifelong Knowledge Distillation** | After every successful workflow, MemoryAgent compresses prompts/patches into embeddings and stores them as *episodes*. Subsequent planning prompts reference the top‑k similar episodes, yielding faster convergence and reduced token usage.               | `MemoryAgent`, `semanticIndexBuilder`, `RAGPipelineUtility` |
| **Multi‑Agent Negotiation**         | When tasks are ambiguous, PlannerAgent spawns a short‑lived *DeliberationWorkflow*: CoderAgent, CriticAgent and ProjectManagerAgent each propose a plan; a deterministic vote (majority or weighted by historical accuracy) selects the winning patch.      | `DeliberationWorkflow`, `EnsembleVotingStrategy`            |

> **Why this matters** – The platform moves beyond static "prompt‑then‑execute" models. Agents continuously observe, decide and learn, resulting in shorter feedback loops, lower costs, and dramatically higher success rates on complex, multi‑day migrations.

***

## 2. Quantization & Inference Engine

* **llama.cpp + GGUF:** Cross-platform CPU/ARM inference with AVX/NEON optimizations, 2–3× speedups on modern SoCs.
* **Exllama V2 4-bit KV Cache:** Compresses keys/values in memory, approaching FP16 throughput on CPU.
* **vLLM (PagedAttention runtime):** Flash-Attention-2 kernels and paged-KV caching deliver ~ 2–3 × GPU throughput over Exllama on A10 G/L4 instances while keeping the Hugging Face generation API.
* **Tabby ML self-hosted completion server:** Streams OpenAI-compatible completions from on-device or on-prem weights; serves as the default low-latency model pool for VS Code/Electron.
* **Ollama model runner:** Manages local 4-bit GGUF/MLX builds (StarCoder-2, Llama-3-8B-Q4). Used by Tabby or directly via the CLI for quick single-model experiments.
* **SmoothQuant⁺:** Group-wise 4-bit post-training quantization with channel-wise activation smoothing for lossless accuracy and 1.9–4× throughput gains.
* **GPTQ:** Second-order PTQ for 3–4-bit models, enabling 3.25–4.5× GPU speedups with minimal accuracy loss.
* **AWQ:** Activation-aware weighting preserves 1% salient channels, delivering >3× speedups and robust multi-modal LLM support.
* **Hugging Face Quantization Pipelines:** Native support for AWQ, AutoGPTQ, and bitsandbytes for streamlined experimentation and conversion.

***

## 3. AI/LLM Integration

* **Registry-Enabled Prompt Engineering:** The `agentWizard` and other automation flows query the capability registry to tailor prompts—e.g., suggesting `SecurityScannerAgent` for vulnerability workflows.
* **Local-first model pool via Tabby ML + Ollama:** All runtime agents call Tabby first; RouterAdapter falls back to cloud models only when SLA or cost policies dictate.
* **Machine-Readable I/O:** Every command supports `--json` and `--yaml`, enabling AI agents and CI workflows to introspect, chain, or patch operations programmatically.
* **LangChain.js orchestration:** Chains LLM calls, retrievers, prompt templates, and tool invocations into coherent multi-agent workflows.
* **Semantic Kernel pipelines:** Defines reusable AI kernels that abstract over local and cloud LLMs, complete with memory, functions, and orchestration constructs.
* **Ollama Minions Protocol:** Bidirectional local-cloud dialogue achieving 30.4× API cost reduction while retaining 87% of cloud model performance.
* **OpenAI Python SDK / AsyncOpenAI:** Robust cloud integration with synchronous and asynchronous clients, Pydantic-powered type definitions, and automatic retry logic via backoff.

***

## 4. Observability & Resilience

* **OpenTelemetry (AI-focused):** Captures request/response metadata, token usage, and latency for each prompt execution.
* **Structured Logging with Pino:** Sub-10 µs JSON logging, zero dependencies, and negligible overhead (<1%) ensure detailed logs at scale.
* **Keptn Remediation Controller:** Subscribes to Prometheus SLO alerts and triggers declarative `remediation.yaml` workflows (rollback, scale-up, config patch). Tightly integrated with Temporal workflows so ReflexionEngine can capture and audit every remediation step.
* **Chaos Engineering & Resilience Testing:**
  * **Real-time Monitoring:**
    * Grafana dashboards for chaos experiment visibility
    * Variable-based filtering by experiment type and namespace
    * Success rate tracking and runbook integration
    * Resource impact visualization (CPU, memory, network)
  * **Automated Chaos Tests:**
    * Pod kill experiments for service resilience
    * Network partition testing for distributed system robustness
    * Resource stress tests (CPU, memory) for performance validation
    * Automated recovery verification
  * **Metrics & Alerts:**
    * Experiment duration and success rates
    * Resource utilization during chaos
    * Failure counts and patterns
    * Alert correlation and impact analysis
  * **Recovery Validation:**
    * Self-healing effectiveness metrics
    * Rollback success rates
    * Service resilience scoring
  * **Integration with LitmusChaos:**
    * Kubernetes-native chaos experiments
    * Automated experiment scheduling
    * GitOps-friendly configuration
    * CI/CD pipeline integration
* **Canary Releases:** Roll out new agent versions to a subset of environments, monitor error rates and resource metrics, and auto-rollback on anomaly detection.
* **Reflexion Telemetry:** Extends AI-Native Telemetry to capture RSM state transitions and repair policy executions, correlating token traces with healing actions.

> **Implementation note** – every span emitted by `@nootropic/runtime` inherits agent metadata (`name`, `version`, `describe().capabilities`). This guarantees trace correlation across the entire workflow without per-agent boilerplate.

***

## 5. Developer Experience & Extensibility

* **Zero-Boilerplate CLI Scaffolding:** Commander.js + Zod-powered generator scaffolds new agents/adapters with manifest registration, test stubs, and type-safe schemas in seconds.
* **Continue IDE Chat & Roo Code Commands:** The VS Code extension embeds Continue for natural-language chat and slash-commands, while Roo Code provides autonomous multi-file "agent runs" (e.g., `/roo fix-tests`).
* **Unified Refactor Preview Panel:** Powered by Roo Code's diff UI and OpenRewrite AST visualiser, enabling safe apply/undo of large-scale edits.
* **Interactive Documentation:** Deploy Docusaurus with Algolia DocSearch for free, weekly-crawled search across guides, API references, and prompt playbooks.
* **AI-Powered Onboarding Agent:** Embedded assistant guides contributors through setup, answers context-aware questions, and suggests next tasks.

***

## 6. Implementation Roadmap

1. **Monorepo Migration:** Run `npx nx init` to convert from Turborepo; configure distributed caching and graph visualization.
2. **Build Tool POCs:** Swap one core package's build to esbuild/SWC; benchmark CI cold and warm build times.
3. **Temporal Pilot:** Model a critical agent workflow in Temporal; validate persistence, retries, and time-travel debugging.
4. **Prompt Telemetry:** Integrate OpenTelemetry instrumentation into the LLM invocation layer; visualize latency and token metrics.
5. **CLI & Docs Launch:** Release the CLI scaffolding tool; deploy Docusaurus with Algolia DocSearch.
6. **Resilience Testing:** Embed basic Gremlin/Litmus chaos experiments in CI; configure a canary channel.

***

## 7. Core Agent Ecosystem

| Agent Family                    | Core Class / Strategy Modes                        | Responsibility                                                          |
| ------------------------------- | -------------------------------------------------- | ----------------------------------------------------------------------- |
| **Planning**                    | `PlannerAgent` + `TaskGraphService`                | Goal → DAG planning, critical-path computation, delta-replan            |
| **Orchestration**               | `OrchestratorAgent`                                | Temporal-backed multi-agent workflow scheduling, task graph maintenance |
| **Project Management & Health** | `ProjectManagerAgent` (supersedes SupervisorAgent) | SLA prediction, adaptive resource allocation, fine-grained self-healing |
| **Coding & Refactor**           | `CoderAgent` (writer / mutator / refactor)         | Generates code, large-scale edits, safe refactors                       |
| **Quality & Verification**      | `CriticAgent` (static-analysis / formal-verify)    | Lint, security scan, SMT proofs, PR review                              |
| **Context & Memory**            | `MemoryAgent`                                      | Short-/long-term context management, semantic index                     |
| **Retrieval & RAG**             | `SearchAgent` + `@nootropic/context` utilities     | Hybrid dense/sparse retrieval, RAG pipelines                            |
| **Feedback & Self-tuning**      | `FeedbackAgent`, `ExplainabilityAgent`             | Aggregate feedback, attach rationale, feed Reflexion loops              |
| **Meta-Reasoning & Healing**    | `ReasoningAgent` + ReflexionEngine                 | Detect failures, backtrack, apply repair policies                       |
| **Human Collaboration**         | `PairProgrammingAgent`, `HumanInTheLoopAgent`      | Real-time co-editing, human approvals, voice/CLI interaction            |
| **Multimodal**                  | `MultimodalAgent`                                  | Ingest diagrams/images, generate code or docs from visual input         |

***

## 8. Adapter Layer

| Adapter                   | Responsibility                                                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **ModelAdapter**          | Abstracts local (llama.cpp, Exllama) and cloud (OpenAI, HF API) LLMs with a unified API and dynamic routing.                                          |
| **EventBusAdapter**       | Connects to Kafka, NATS, or Dapr for high-throughput, distributed event streaming.                                                                    |
| **StorageAdapter**        | Interfaces with vector DBs (**LanceDB** for local, **Milvus 2.4** or **Pinecone** for distributed), object stores (MinIO), and RDBMS for persistence. |
| **SecretsManagerAdapter** | Securely retrieves and rotates secrets from Vault, AWS KMS, or local stores.                                                                          |
| **PluginLoaderAdapter**   | Dynamically loads/unloads plugins; validates against Zod schemas for type safety.                                                                     |
| **ObservabilityAdapter**  | Emits OpenTelemetry spans and metrics to Jaeger/Prometheus for end-to-end tracing.                                                                    |
| **NotificationAdapter**   | Sends alerts via Slack, email, or dashboard on critical workflow events.                                                                              |
| **ReflexionAdapter**      | Exposes Reflexion State Machine events over the EventBus, allowing external systems and dashboards to subscribe to healing workflows.                 |

***

## 9. Utility Services

* **RAGPipelineUtility:** Hybrid retrieval-augmented generation combining dense (embedding) and sparse (keyword) search, with LLM-based reranking and feedback-driven chunk refinement. Default local vector store is **Chroma** for embedded sqlite-kv ease; pipeline can fall back to **LanceDB** for edge/offline scenarios or **Weaviate** for clustered hybrid search (dense + BM25).
* **ChunkingUtility:** Semantic and size-based chunking of documents, code, and logs; supports overlap and sliding window strategies for ultra-long context management.
* **PromptAnalyticsUtility:** Captures token-level metrics, latency, and success rates for each prompt execution; feeds data into the FeedbackAgent for automated prompt optimization.
* **DependencyGraphUtility:** Builds and visualizes code and task dependency graphs, enabling PlannerAgent to generate conflict-free roadmaps.
* **FormalVerificationUtility:** Integrates with SMT solvers and type validators to prove invariants and ensure workflow correctness before execution.
* **BacklogManagementUtility:** Automates backlog refinement: triages tasks, merges duplicates, and prioritizes based on risk, impact, and developer feedback.
* **ComplianceReportUtility:** Generates audit reports for security, licensing, and style compliance; integrates SAST tools (Semgrep, SonarQube) into CI pipelines.

***

## 10. Self-Healing & Meta-Reasoning Patterns

* **Reflexion State Machine (RSM):** Captures agent execution state, decisions, and outcomes as a first-class event stream. Each step emits a state transition event consumed by the ReflexionEngine.
* **ReflexionEngine:** Applies declarative repair policies (e.g., retry with adjusted prompt, roll back to last known-good state, escalate to Meta-Agent) to autonomously heal failures.
* **Policy DSL:** Define health-check, rollback, and backtrack rules using a Zod-validated schema; supports custom policies per workflow.
* **Reflexion Telemetry:** Integrated with OpenTelemetry to record state transitions, repair actions, and resolution latencies for observability and continuous improvement.
* **Failure Detection & Recovery:** Leverage Azure's self-healing design principles—detect via health checks, respond with service restarts or workflow rollbacks, and monitor outcomes.
* **Recursive Introspection:** ReasoningAgent uses chain-of-thought and meta-reasoning prompts to identify logic loops and repair itself, inspired by Ember's multi-model orchestration to avoid overthinking loops.
* **Isolation & Bulkheads:** Containerize agents and limit blast radius using bulkhead patterns; restart only affected agents on failure.

***

## 11. Workflow Patterns

* **Durable State Management:** Temporal.io ensures each agent step is recorded, retried on failure, and can be time-travel debugged.
* **Reactive Pipelines:** RxJS streams allow agents to subscribe to event topics, apply backpressure operators, and handle errors gracefully.
* **Plugin-Driven Extensibility:** Plugins register new agents/adapters at runtime; PluginLoaderAdapter validates and injects them without requiring system restarts.

***

## 12. Observability & Feedback Loops

* **AI-Native Telemetry:** Instrument every LLM call and agent action with OpenTelemetry; visualize traces in Jaeger and metrics in Prometheus for granular insight.
* **Explainability Panel:** Inside both the VS Code extension and Electron app, a dedicated tab replays OpenTelemetry spans, chain-of-thought snippets, and agent decision graphs so users can audit and learn from every suggestion.
* **Continuous Feedback:** FeedbackAgent aggregates outcomes to retrain embedding models, refine prompts, and adjust agent policies—closing a closed-loop learning cycle.
* **Reflexion Telemetry:** Extends AI-Native Telemetry to capture RSM state transitions and repair policy executions, correlating token traces with healing actions.

***

## 13. Extensibility & Governance

* **Dynamic Schema Validation:** All agent/adapters/utilities must expose a `describe()` method and validate against a central Zod schema registry for compatibility.
* **Governance Policies:** Enforce API quotas, cost budgets for paid APIs, and data-privacy rules at the orchestration layer.
* **Versioned Registries:** Maintain versioned manifests for agents/plugins, enabling safe rollbacks and A/B testing of new capabilities.
* **RefactoringAgent:** Performs safe, large-scale code refactors (e.g., extract methods, rename symbols) with undo checkpoints.
* **OpenRewriteService** | Executes language-specific recipes for large-scale code migrations (e.g., Java → 17, React → Server Components) with AST-level safety. |
* **SemgrepAutofixUtility** | Runs Semgrep's AI Autofix engine to patch security findings automatically, gated by CriticAgent confidence thresholds. |
* **QualityAgent** | Aggregates Semgrep, OpenRewrite, test coverage, and CodeHotspot metrics to generate DORA dashboards and feed PlannerAgent task prioritisation. |

***

## 14. AI Coding Assistant Pain Points

### 14.1 Context & Memory Limitations

* Short context windows lead to irrelevant suggestions once the local window is exceeded, demanding manual context stitching.
* Multi-file reasoning remains inconsistent: assistants often ignore imports or global definitions across modules.

### 14.2 Inaccurate or Irrelevant Suggestions

* Low suggestion precision in edge-case code (e.g., complex algorithms or domain-specific APIs) frustrates users.
* Over-reliance on defaults produces boilerplate rather than tailored logic, requiring heavy human pruning.

### 14.3 Lack of Explainability & Trust

* Opaque reasoning: users can't trace why a snippet was suggested, hindering debugging and learning.
* Limited "why-this" context: few tools annotate suggestions with rationale or linked documentation.

### 14.4 Performance & Latency

* Cloud calls introduce delays, breaking coding flow, while local quantized models struggle on modest hardware without tailored acceleration.
* IDE resource consumption: real-time inference can stall editors, especially for large codebases.

***

## 15. Proposed New Agents & Utilities

| Agent / Utility              | Purpose                                                                                                                                        |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **ExplainabilityAgent**      | Attaches "why" annotations to every suggestion by logging LLM chain-of-thought snippets.                                                       |
| **APIExplorerAgent**         | Dynamically fetches and surfaces relevant API docs, usage examples, and common patterns.                                                       |
| **DependencyManagerAgent**   | Scans project dependencies, suggests upgrades/fixes, and auto-resolves version conflicts.                                                      |
| **SecurityScannerAgent**     | Integrates SAST tools (Semgrep, Bandit) and LLM-driven vulnerability triage.                                                                   |
| **PerformanceProfilerAgent** | Profiles runtime hotspots, suggests optimizations, and benchmarks alternative implementations.                                                 |
| **PairProgrammingAgent**     | Enables synchronous co-editing sessions with AI, simulating a live collaborator.                                                               |
| **FuzzTestingUtility**       | Generates targeted fuzz tests via LLMs to uncover edge-case bugs.                                                                              |
| **MutationTestingUtility**   | Creates and runs mutation tests to validate test suite robustness automatically.                                                               |
| **StackOverflowSearchAgent** | Queries and summarizes top Q\&A threads for error messages and edge-case solutions.                                                            |
| **RefactoringAgent**         | Performs safe, large-scale refactors (e.g., extract methods, rename symbols) with undo checkpoints.                                            |
| **OpenRewriteService**       | Executes language-specific recipes for large-scale code migrations (e.g., Java → 17, React → Server Components) with AST-level safety.         |
| **SemgrepAutofixUtility**    | Runs Semgrep's AI Autofix engine to patch security findings automatically, gated by CriticAgent confidence thresholds.                         |
| **QualityAgent**             | Aggregates Semgrep, OpenRewrite, test coverage, and CodeHotspot metrics to generate DORA dashboards and feed PlannerAgent task prioritisation. |

***

## 16. Supporting Technologies & Integrations

### 16.1 Hybrid Local/Cloud Model Routing

* **ModelRegistry** with metadata (latency, cost, accuracy) decides between local llama.cpp quantized inference or cloud APIs (OpenAI, Hugging Face) dynamically.
* **Local GPU inference via vLLM:** Paged-Attention runtime auto-selected when CUDA devices are available for sub-30 ms token latency.

### 16.2 Sourcegraph & Code Search

* Deep codebase indexing enables cross-repo search, symbol navigation, and impact analysis directly from within agents.

### 16.3 OpenAI Function Calling & Tools

* Agents expose well-typed functions (via OpenAI's function-calling API) for filesystem, process, and network operations under LLM control.

### 16.4 Real-Time Collaboration Hooks

* Integrate with Live Share or VS Code's pairing APIs to let human users co-pilot alongside AI agents in real time.

### 16.5 Explainable AI Tooling

* Store and visualize prompt/chain traces in a UI panel, enabling developers to drill into decision provenance.

***

## 17. Best-of-Breed Feature Integration

By addressing common pain points—context fragmentation, suggestion accuracy, explainability, and latency—through dedicated agents (e.g., ExplainabilityAgent, APIExplorerAgent), robust utilities (FuzzTesting, MutationTesting), and seamless hybrid local/cloud model orchestration, Nootropic can leapfrog existing platforms. Incorporating proven features from Copilot, Cursor, CodeWhisperer, and Tabnine—while mitigating their limitations—will yield an AI/LLM ecosystem that is self-healing, transparent, and incredibly powerful across hardware spectrums.

***

## 18. Registry-First, Code-as-Docs

* **Single Source of Truth:** The capability registry drives both CLI help and documentation.
* **Auto-Generated Docs:** CI scripts use the registry to produce `docs/capabilities/*.md`, ensuring docs mirror code.
* **Onboarding & Discovery:** Contributors can run `npx nootropic list-capabilities` or `npx nootropic guide` to explore available features and scaffold new ones.

*This document synthesizes research and best practices from Refact.ai, GitHub Copilot, Cursor, Amazon CodeWhisperer, Tabnine, and Sourcery to inform the next generation of AI-native developer tooling.*

## 19. End-to-End Technology Stack (Aurora)

Below is the canonical, performance‑tuned stack that every agent, service and human contributor should consider "source of truth". It unifies build speed, inference latency, observability and security into one cohesive map.

### 19.1 Key Enhancements

* **Nx 16 + remote task‑graph cache**: < 2 s no‑op CI builds on GitHub hosted runners.
* **SWC for libraries, esbuild/Bun for apps**: 15–20 × faster transpilation; single‑binary bundles in ≈ 300 ms.
* **Latency‑aware ModelRegistry** routes requests between **vLLM** (GPU), **ExLlama v2** (low‑VRAM GPU), **llama.cpp GGUF** (CPU/ARM) and cloud APIs, delivering sub‑30 ms tokens on RTX‑class GPUs while cutting API spend ~30×.
* **Temporal.io 1.23** guarantees durable orchestration, "time‑travel" debugging and deterministic replay.
* **LanceDB** for laptop/offline vectors, **Milvus 2.4** for clustered ANN search—both surfaced through a single VectorStoreAdapter.
* **OpenTelemetry (generative‑AI semantic conventions)** + **OpenCost** enrich every span with token‑count, latency and $‑cost, letting PlannerAgent stay within sprint budgets automatically.
* **Semgrep 1.50 + Trivy 0.50** add < 90 s to CI yet block critical CVEs and supply‑chain exploits.
* **Sourcegraph 5.4** and **Docusaurus v3 + Algolia** ensure instant code and docs navigation, powering SearchAgent and ExplainabilityAgent.

### 19.2 Tech-Stack Matrix

| **Layer**               | **Component**         | **Chosen Tech / Version**               | **Performance KPI**        | **Synergy / Intelligence Hook**     |
| ----------------------- | --------------------- | --------------------------------------- | -------------------------- | ----------------------------------- |
| **Monorepo**            | Task‑graph & cache    | **Nx 16 + remote cache**                | < 2 s no‑op CI             | feeds *TaskGraphService* DAG        |
| **Compile**             | Libraries             | **SWC (@nx/js:swc)**                    | 15–20× faster than `tsc`   | hot‑reload for *CoderAgent*         |
|                         | Apps                  | **esbuild / Bun**                       | single‑binary in ≈ 300 ms  | minimal cold‑start for workers      |
| **Inference**           | GPU (full)            | **vLLM 0.4**                            | 2–3× HF throughput         | metrics → OTEL spans                |
|                         | GPU (low‑mem)         | **ExLlama v2**                          | –46 % VRAM, +1.7× tokens/s | shares weights with vLLM            |
|                         | CPU / Edge            | **llama.cpp GGUF 4‑bit**                | ≤ 150 ms first‑token       | served via Ollama side‑car          |
| **Routing**             | Broker                | **ModelRegistry**                       | 99 % SLA adherence         | cost/latency stats for PlannerAgent |
| **Workflow**            | Durable orchestration | **Temporal.io 1.23**                    | zero unrecovered failures  | ReflexionEngine retries logged      |
| **Data / Vector**       | Local                 | **LanceDB 0.5**                         | ~ 2 ms ANN query           | zero‑copy Arrow → RAG               |
|                         | Cluster               | **Milvus 2.4 sparse‑vector**            | > 200 k QPS                | hybrid dense + sparse recall        |
| **Observability**       | Tracing               | **OpenTelemetry 1.30 + gen‑AI semconv** | 100 % spans w/ token data  | ReflexionEngine depends on it       |
|                         | Cost                  | **OpenCost 1.4**                        | per‑span $ attribution     | PlannerAgent budget guard‑rail      |
| **Security**            | Static                | **Semgrep 1.50**                        | 30 s median scan           | merge‑gate alerts                   |
|                         | Supply‑chain          | **Trivy 0.50**                          | 45 s fs + SBOM scan        | feeds ComplianceReportUtility       |
| **Developer Tools**     | Code search           | **Sourcegraph CE 5.4**                  | < 50 ms symbol jump        | SearchAgent → RAG chunks            |
|                         | Docs                  | **Docusaurus v3 + Algolia**             | 100 ms query               | ExplainabilityAgent links rationale |
| **Continuous Learning** | Eval                  | **OpenAI evals 0.3**                    | 40 benchmarks / PR         | AutoRL loops tune prompts           |

### 19.3 Performance Outcomes

1. **Blazing‑fast inner loop** – SWC + Nx keep *compile‑test‑lint* under 5 s on a dev laptop, unlocking rapid RLHF iteration.
2. **Adaptive inference** – ModelRegistry's real‑time latency/cost data yields sub‑30 ms tokens on GPUs and graceful CPU fallback without SLA violations.
3. **Self‑healing workflows** – Temporal + ReflexionEngine + OTEL semantics enable autonomous repair or human‑in‑the‑loop escalation with zero lost state.
4. **End‑to‑end cost transparency** – Token, latency **and** dollar tags on every span let ProjectManagerAgent forecast sprint budgets in real time.
5. **Security that keeps pace** – Semgrep & Trivy scans add < 90 s to pipelines yet block critical CVEs, eliminating weekend fire drills.

***

*This matrix supersedes the earlier "Detailed Technology Stack" draft and is now the single source of truth for performance, security and intelligence alignment.*

## 20. AutoRL & Continuous Optimisation

Continuous learning turns Nootropic from a static agent‑orchestration layer into a *self‑improving* engineering organism.

### 20.1 Reinforcement Learning Feedback Loops

* **Bandit Optimiser** (`@nootropic/optimisation/bandit.ts`) tracks success, latency and cost for every agent action, awarding scalar rewards.
* **RLHF Collector** integrates VS Code/CLI thumbs‑up/down and automated unit‑test truth signals; rewards feed into a proximal‑policy‑optimisation (PPO) trainer.
* **Self‑Play for Planning Agents** – PlannerAgent simulates two competing roadmaps and selects the one with the higher expected reward, boosting plan optimality over time.

### 20.2 Continual Parameter-Efficient Fine-Tuning

Local checkpoints are served by Tabby ML; models are first evaluated in a canary pool before promotion to default.

* Nightly offline batches of anonymised prompt/response pairs undergo LoRA v2 fine‑tuning.
* **Delta‑LoRA snapshots** are versioned; ModelRegistry rolls out new deltas via canary routes, enabling instant rollback.
* **Flash‑Attention 2** kernels ensure fine‑tuning completes in under 15 minutes on A100 GPUs.

### 20.3 Automated Evaluation Harness

* Powered by **OpenAI evals** and **HELM** benchmarks; runs on every pull request.
* `EvalGeneratorAgent` mutates real‑world codebases to synthesise novel evaluation corpora for regression and robustness testing.

### 20.4 Safety & Alignment Guard-Rails

* All fine‑tuned checkpoints pass `guardrails‑ai` policy tests and **DeepEval** attack suites (prompt‑injection, data leakage, jailbreak).
* Canary deployments use **A/B containment** scopes with an automatic kill‑switch triggered at a 0.05 % bad‑output threshold.

> **Payoff** – Agents learn from every interaction, closing the loop between telemetry, evaluation and micro‑fine‑tuning while keeping cost and risk tightly controlled.

## A. Advanced Ops & Security

* **Static analysis & supply-chain:** Semgrep, Trivy FS, and Snyk monitor run in every pull request; builds fail on critical CVEs.
* **Cost Attribution:** Integrate *OpenCost* so each OTEL span carries CPU/GPU/$ tags, enabling per-agent cost metrics and PlannerAgent cost-aware scheduling.
* **Supply-chain Trust:** Enforce *Sigstore Rekor* and SLSA-Level 2 provenance for every container and dependency, blocking unsigned or unverified artifacts.
* **Data-Leak Guard:** Run OPA Gatekeeper policies before any external LLM invocation to enforce privacy and data-leak prevention rules.

***

*See also: [ADR-001 "Why Nx?"](docs/adr/2025-Nx-Decision.md) for terminology used throughout this specification.*
