# Architecture Overview

***

## Table of Contents

* [Architecture Overview](#architecture-overview)
  * [Table of Contents](#table-of-contents)
  * [Introduction & Goals](#introduction--goals)
  * [Layered Architecture Diagram](#layered-architecture-diagram)
  * [Component Interactions](#component-interactions)
  * [Design Principles](#design-principles)
  * [Technology Stack](#technology-stack)
    * [Core Open-Source Components](#core-open-source-components)
    * [Quality, Security & Compliance](#quality-security--compliance)
    * [Observability & Self-Healing](#observability--self-healing)
    * [Container & Orchestration](#container--orchestration)
  * [Security & Compliance Overview](#security--compliance-overview)
  * [Performance Considerations](#performance-considerations)
  * [Scaling & Multi-User Considerations](#scaling--multi-user-considerations)
  * [Nx Monorepo & CI/CD](#nx-monorepo--ci-cd)

***

## Introduction & Goals

The nootropic architecture is engineered to deliver a lean, high-performance, and extensible AI development platform that runs primarily on-premises, with optional cloud fallbacks. Its core goals are:

1. **Free‐First, Local‐First Inference**\
   All critical AI workloads—LLM inference, embeddings, and vector retrieval—run on the user's machine via open‐source runtimes (Tabby ML, Ollama, llama.cpp, vLLM). Cloud APIs (OpenAI, Anthropic, Hugging Face, Petals) are available only by explicit opt-in, ensuring data sovereignty and minimal cost.

2. **Declarative, Agent-Driven Workflows**\
   Developers express high-level intent (e.g., "build a Flask user-auth microservice"), and agents (PlannerAgent, CoderAgent, CriticAgent, etc.) coordinate via a durable workflow engine (Temporal.io) and reactive event streams (RxJS). This removes the need for manual orchestration scripts or separate task queues.

3. **Self-Healing & Reflexion-In-the-Loop**\
   Every LLM call, static‐analysis check, and workflow step emits structured OpenTelemetry spans (including OpenCost tags for resource‐cost attribution). A ReflexionEngine continuously monitors these spans to detect errors, SLA breaches, or budget overruns and automatically applies corrective actions—switching models, regenerating code, or triggering re-planning.

4. **Continuous Learning via Nightly LoRA**\
   Accepted diffs and human feedback are recorded as "episodes" in a local vector store (Chroma). Each night, a LoRA fine-tuning job runs on a base model (StarCoder2 or Llama 2), producing a refined checkpoint that is canaried in the local inference pool. This ensures nootropic's suggestions improve over time without incurring cloud training costs.

5. **Registry-Driven Extensibility**\
   Core capabilities are minimal; all agents and plugins expose a `describe()` manifest. At build time, a central JSON registry is generated (`.nootropic-cache/describe-registry.json`), which drives CLI autocompletion, VS Code slash commands, and wizard flows. New plugins require no code changes—simply place their folder under `plugins/`.

6. **Unified UX, Zero Context Switching**\
   The Continue VS Code extension (backed by Tabby ML and Roo Code) provides inline chat, slash commands, and AST-safe diff previews. An Electron dashboard offers an alternate standalone interface—Kanban backlog, Temporal timeline, and live trace explorer. Developers never need to leave their IDE or switch browser tabs to access planning, coding, testing, or deployment workflows.

7. **Minimal Bloat & Single Source of Truth**\
   All state—project specs, task graphs, telemetry, LoRA checkpoints—lives in either the Git repository, Temporal's durable store, or local vector databases (Chroma/LanceDB). There are no separate planning servers, analytics clusters, or SaaS requirements by default. Security and compliance tools (Semgrep, OpenRewrite, Sigstore, Trivy) run in-process or via CI YAML, eliminating heavyweight third-party services.

By converging these principles, nootropic delivers a Copilot-class developer experience on consumer-grade hardware, without vendor lock-in or recurring subscription fees.

***

## Layered Architecture Diagram

Below is a textual representation of nootropic's layered architecture. Each layer is responsible for discrete concerns, with clear boundaries and event‐driven interactions.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                                UI Layer                                   │
│ ┌───────────────────┐   ┌───────────────────┐   ┌──────────────────────┐   │
│ │ VS Code Extension │   │ CLI Client        │   │ Electron Dashboard   │   │
│ │ (Continue + Roo)  │   │ (npx nootropic) │   │ (Kanban, Trace View) │   │
│ └───────────────────┘   └───────────────────┘   └──────────────────────┘   │
│          ↑                    ↑                         ↑                │
│          │                    │                         │                │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │                    Capability Registry (JSON)                         │ │
│ │  .nootropic-cache/describe-registry.json                            │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│          ↑                    ↑                         ↑                │
│          │                    │                         │                │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │         Orchestration & Agents Layer (Temporal + RxJS)                │ │
│ │                                                                       │ │
│ │  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────┐ │ │
│ │  │ PlannerAgent │   │ CoderAgent   │   │ CriticAgent  │   │SearchAgent│ │ │
│ │  │ (Goal→DAG)   │   │ (Gen/Refactor)│  │ (SAST+Tests) │   │ (RAG)     │ │ │
│ │  └──────────────┘   └──────────────┘   └──────────────┘   └──────────┘ │ │
│ │       │                     │                   │                   │ │
│ │  ┌──────────────┐   ┌──────────────────┐   ┌──────────────┐        │ │
│ │  │ProjectMgr    │   │ ReasoningAgent   │   │ FeedbackAgent│        │ │
│ │  │Agent (Tasks) │   │ (Self-Reflect)   │   │ (LoRA Jobs)  │        │ │
│ │  └──────────────┘   └──────────────────┘   └──────────────┘        │ │
│ │                           │                                        │ │
│ │                     ┌──────────────┐                                │ │
│ │                     │Explainability│                                │ │
│ │                     │Agent (Traces)│                                │ │
│ │                     └──────────────┘                                │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│          ↓                    ↓                         ↓                │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │             Utility & Adapter Layer                                   │ │
│ │                                                                       │ │
│ │  • ModelAdapter (Hardware Probe, Model Matcher, API Routing)          │ │
│ │  • StorageAdapter (Chroma, LanceDB, Weaviate, MinIO, RDBMS)           │ │
│ │  • ObservabilityAdapter (OpenTelemetry + OpenCost → Jaeger/Prom)      │ │
│ │  • PluginLoaderAdapter (Zod Validation, Registry Generation)          │ │
│ │  • ReflexionAdapter (Event Emitter for Self-Healing Actions)          │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│          ↓                    ↓                         ↓                │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │              Inference & Data Layer                                    │ │
│ │                                                                       │ │
│ │  • Local Models: llama.cpp (4-bit GGUF)                                │ │
│ │                Ollama (GGUF/MLX)                                        │ │
│ │                vLLM (GPU PagedAttention)                                │ │
│ │                StarCoder2/Llama2 (LoRA Checkpoints)                     │ │
│ │  • LLM Gateway: Tabby ML (OpenAI-compatible REST API)                   │ │
│ │  • Hybrid RAG: Chroma (SQLite + FAISS)                                  │ │
│ │               LanceDB (Arrow)                                          │ │
│ │               Weaviate (Hybrid Dense + BM25)                            │ │
│ │  • Source Graph: LSP-based AST & Symbol Index                            │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
│          ↓                    ↓                         ↓                │
│ ┌───────────────────────────────────────────────────────────────────────┐ │
│ │          Infrastructure & Ops Layer                                    │ │
│ │                                                                       │ │
│ │  • Orchestration: Temporal.io (Durable Workflows, Time Travel Debug)   │ │
│ │  • CI/CD: Nx 16 + SWC (Distributed Caching, 20× Faster Builds)         │ │
│ │           esbuild/Bun (Electron Bundles <300 ms)                       │ │
│ │  • Observability: OpenTelemetry 1.30 + OpenCost 1.4 (Cost Attribution) │ │
│ │  • Resilience: Keptn (SLO-Driven Remediation)                           │ │
│ │             LitmusChaos (Chaos Experiments)                             │ │
│ │  • Security: Semgrep 1.50 (In-Process SAST + Autofix)                   │ │
│ │             OpenRewrite (AST Refactors)                                 │ │
│ │             Sigstore (Container Signing, SLSA Level 2)                  │ │
│ │             Trivy (CVE Scans)                                            │ │
│ │  • Containerization: Docker (All Services), Kubernetes (Optional)        │ │
│ └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

> **Note:** Wherever "Insert diagram here" appears (e.g., in Design Principles), you may embed a hand-drawn or generated SVG/PNG of this layered architecture. For now, the textual diagram clarifies interactions and responsibilities.

***

## Component Interactions

1. **PlannerAgent ↔ ProjectMgrAgent**

   * **PlannerAgent** reads the project brief (from `project-spec.md`) and generates an initial PDDL/HTN task graph (DAG).
   * **ProjectMgrAgent** monitors SLOs (time, cost, quality) and sprint progress. If a critical path task fails or an SLA is breached, it signals PlannerAgent (via Temporal signal) to trigger a "delta‐replan" that re-evaluates only the impacted subtree.

2. **Temporal Workflows & Activities**

   * Each high-level operation is a Temporal workflow. For example, `initializeProject` spawns activities:
     1. `generateSpec(brief)` (calls PlannerAgent)
     2. `createTaskGraph(spec)` (runs PDDL solver)
     3. `generateScaffold(spec)` (invokes CoderAgent via Cookiecutter)
   * Each task in the DAG spawns a child workflow `executeTask(taskID)`:
     1. Call CoderAgent to generate or refactor code.
     2. Run CriticAgent (Semgrep + unit tests).
     3. If tests fail, invoke ReasoningAgent for self-reflection (critique → patch → retest).
     4. If still failing, notify ProjectMgrAgent to escalate.
   * Temporal ensures durability—if the machine restarts, workflows resume at the last checkpoint.

3. **SearchAgent → CoderAgent / ReasoningAgent**

   * When CoderAgent needs context for code generation or refactoring, it calls **SearchAgent**:
     1. **Dense search** on Chroma embeddings.
     2. If top similarity < threshold (0.3), fall back to **sparse BM25** on Weaviate (if configured).
     3. Re-rank top candidates with a local cross-encoder.
   * The retrieved code snippets, documentation fragments, or prior "episodes" (via MemoryAgent) are included as context in the prompt to CoderAgent or ReasoningAgent.

4. **CriticAgent → ReflexionEngine → ModelAdapter**

   * **CriticAgent** runs Semgrep 1.50 in-process. If a rule violation is found (confidence ≥ 0.8), it can auto-apply a patch generated by the LLM.
   * If a patch cannot be applied or if unit tests still fail, an OTEL span is emitted with `error=true`.
   * **ReflexionEngine** subscribes to these spans (via **ReflexionAdapter**). Upon detecting an error or an SLA breach (e.g., `latency_ms > threshold`), it can:
     1. Instruct ModelAdapter to switch to a smaller/faster model (e.g., from StarCoder2 3B CPUs to Llama 2 7B on GPU).
     2. If inference latency is the issue, requeue the generate/refactor request using a GPU backend (vLLM/Ollama).
     3. If budget is the issue (`cost_usd > budgetThreshold`), route to an entirely different model (e.g., `gemma3-1b-4bit`) or defer non-critical tasks.

5. **FeedbackAgent → Nightly LoRA Pipeline → ModelAdapter**
   * Throughout the day, **FeedbackAgent** collects user feedback (thumbs up/down in VS Code UI), unit test results, and OTEL cost/latency metrics.
   * Each accepted diff (patch) is stored in Chroma as an "episode" (prompt + response).
   * Every night (Cron or GitHub Actions), a LoRA fine‐tuning job runs on a base model (StarCoder2 or Llama 2) using that day's episodes.
   * The fine-tuned LoRA checkpoint is published to Tabby ML's model pool. ModelAdapter's next invocation sees the new model and can select it for inference.
   * This incremental approach ensures suggestions continue to align with the team's code style, project conventions, and architecture patterns.

***

## Design Principles

1. **Declarative Goals & Blackboard Coordination**

   * Developers specify "what" they want (e.g., epics, stories, tasks) in `project-spec.md`.
   * Agents coordinate via a blackboard pattern implemented over Temporal's durable KV store, where each agent reads/writes structured "signals" (e.g., DAG updates, SLO events, error signals).

2. **Registry-Driven UX**

   * Each agent/plugin exports a `describe()` method returning a Zod-validated manifest (name, version, capabilities, configs).
   * At build time, a Node script scans `plugins/` and generates `.nootropic-cache/describe-registry.json`.
   * The CLI and VS Code extension load this JSON at startup, dynamically registering commands, flags, and slash commands—no hard-coded wiring required.

3. **Local-First Inference, Cloud Fallback**

   * ModelAdapter first probes hardware (CPU cores, RAM, GPU availability) and assesses each local model's viability (size, RAM footprint, throughput, accuracy).

   * It ranks candidates by a scoring function:

     ```
     score = α·(tokens_per_s_norm) + β·(accuracy) − γ·(cost_usd) − δ·(memory_pressure)
     ```

   * If no local candidate meets the requested SLA (latency, accuracy), it falls back to a configured cloud API (OpenAI, Anthropic, HF).

   * Users can override this via `~/.nootropic/config.json` (`localFirst`, `allowCloudFallback`, `modelPreference`).

4. **Self-Healing via Reflexion Loops**

   * Every LLM call and static analysis run is wrapped in an OpenTelemetry span capturing:
     * Model name & revision
     * Number of tokens in/out
     * Latency (ms)
     * Cost (USD)
     * Outcome (success/failure)
   * The ReflexionEngine monitors spans in real time. On detecting an error (e.g., failing tests) or an SLA breach (latency > threshold, cost > budget), it triggers automated corrective actions:
     1. **Model Switch**: Re-invoke ModelAdapter to pick a different backend or quantization.
     2. **Regeneration**: Ask CoderAgent or ReasoningAgent to regenerate/fix the code.
     3. **Replanning**: Notify PlannerAgent to update the DAG if a task is no longer feasible under current constraints.

5. **Continuous Learning via Episodic Memory & LoRA**

   * Each accepted code patch is recorded as an "episode" (prompt + final diff) in Chroma, stored as embeddings with metadata.
   * On each new code generation request, MemoryAgent retrieves the top k semantically similar episodes (cosine similarity ≥ 0.7) to provide few-shot examples to the LLM.
   * A nightly LoRA fine-tuning job (triggered via CI) uses those episodes to update a base model, improving suggestion relevance over time.

6. **Minimal Bloat & Single Source of Truth**
   * No separate planning database—project specs and task graphs live in Git and Temporal.
   * No external search servers—Chroma (SQLite + FAISS) is the default; Weaviate is optional and containerized.
   * Quality & security checks (Semgrep + OpenRewrite) run in the same process as CriticAgent—no SonarQube or standalone scanners.
   * CI/CD defined in `CI_CD.md` uses Nx, which handles build, test, lint, and releases. All configurations live in the monorepo—no hidden Jenkins jobs or external pipelines.

***

## Technology Stack

### Core Open-Source Components

* **Tabby ML** (Apache 2.0)\
  Self-hosted, OpenAI-compatible REST server that wraps local backends (Ollama, vLLM, llama.cpp). Handles model caching, API routing, and multi-model management.

* **Ollama** (MIT)\
  Cross-platform wrapper around GGUF and MLX model formats. Provides sub-100 ms token latencies for quantized models on Apple Silicon and x86 GPUs.

* **llama.cpp** (MIT)\
  CPU inference engine for Llama‐based models (4-bit GGUF). Delivers ~150 ms first-token on M1/M2 and under 1 s for a 200-token response on a 7 B model.

* **vLLM 0.4** (Apache 2.0)\
  GPU inference engine using PagedAttention, offering up to 24× throughput vs. Hugging Face's TGI. Ideal for concurrent, low-latency LLM requests on NVIDIA GPUs.

* **Chroma** (Apache 2.0)\
  Embedded vector database (SQLite + FAISS) for dense semantic retrieval. Scales to millions of embeddings and returns top-k results in sub-5 ms on SSD.

* **LanceDB** (Apache 2.0)\
  Arrow-based offline vector store for large datasets (> 10 GB) or CI pipelines that need offline RAG without Weaviate.

* **Weaviate** (Apache 2.0)\
  Containerized hybrid dense + sparse (BM25) search, used optionally for multi-repo setups or extremely large codebases (≥ 50 GB) to improve recall.

* **Temporal.io 1.23** (MIT)\
  Durable workflow engine with TypeScript/Node SDK. Provides persistence, retries, and time-travel debugging for all agent workflows.

* **Nx 16** (MIT)\
  Monorepo orchestrator with distributed caching. Enables sub-2 s no-op CI check times and 15–20× faster TypeScript builds via SWC.

* **SWC (@nx/js:swc)** (Apache 2.0)\
  Fast TypeScript compiler/transpiler replacing `tsc` in most build targets. Cuts full workspace transpile times from minutes to seconds.

* **esbuild / Bun** (MIT)\
  Bundler for Electron and Node apps. Produces sub-300 ms cold-start bundles, improving the development experience.

### Quality, Security & Compliance

* **Semgrep 1.50** (LGPL v2.1)\
  In-process static analysis with AI-driven autofix capabilities (Semgrep AI Autofix). Embedded in CriticAgent.

* **OpenRewrite** (Apache 2.0)\
  AST-safe refactoring engine used by CoderAgent for large-scale code transforms (e.g., migrating React JSX → TSX).

* **Sigstore** (Apache 2.0)\
  Container signing and SLSA Level 2 supply-chain provenance to ensure every release artifact is verifiable and immutable.

* **Trivy 0.50** (Apache 2.0)\
  CVE scanner used in CI to detect critical/high vulnerabilities in dependencies and Docker images.

### Observability & Self-Healing

* **OpenTelemetry 1.30** (Apache 2.0)\
  Standardized tracing and metrics API. All LLM calls, agent activities, and workflow steps are instrumented for full observability.

* **OpenCost 1.4** (Apache 2.0)\
  Attaches cost metrics to OpenTelemetry spans (e.g., GPU time at $/ms rates), enabling budget enforcement by ReflexionEngine.

* **Keptn 0.x** (Apache 2.0)\
  SLO-driven remediation orchestrator. Monitors Prometheus metrics (OTEL exports) and triggers auto-repair steps (model switches, rollbacks) on SLO breaches.

* **LitmusChaos** (Apache 2.0)\
  Chaos-engineering framework used to run resilience tests (pod deletion, CPU stress) in a local Kubernetes or Docker Compose environment. ReflexionEngine repairs induced failures automatically.

### Container & Orchestration

* **Docker** (CEO)\
  Runs Temporal server, optional Weaviate, and can host Tabby ML in a container. Standardizes runtimes across developer machines.

* **Kubernetes (Optional)**\
  Production deployments can leverage Kubernetes with Helm charts for scaling Temporal, Weaviate, and nootropic's own microservices (CLI-behind-server, Electron backend).

***

## Security & Compliance Overview

1. **Data Sovereignty by Default**

   * All code, telemetry, and embeddings live on-premises in local vector stores (Chroma/LanceDB) and Temporal's durable store.
   * No egress to cloud APIs unless explicitly permitted in `~/.nootropic/config.json`.

2. **Supply-Chain Security**

   * **Sigstore** signs all Docker images (nootropic-cli, nootropic-dashboard, Tabby ML).
   * Each published npm or PyPI package contains SLSA Level 2 provenance, enabling verifiable SBOMs.

3. **Static Analysis & Autofix**

   * **Semgrep 1.50** runs as part of CriticAgent. If violations are detected (confidence ≥ 0.8), CriticAgent can auto-apply patches generated by an LLM.
   * **OpenRewrite** recipes eliminate common anti-patterns (e.g., N+1 SQL in Java, unparameterized queries). Unsafe transformations are gated behind preview diffs in the VS Code extension.

4. **Vulnerability Scanning**

   * **Trivy** in CI scans for CVEs in Node/Python dependencies and Docker images.
   * Builds fail on critical or high CVEs.
   * Periodic Semgrep rule updates (via `nx run security:update-rules`) ensure rule sets remain current.

5. **Secure Defaults & Hardening**
   * **Tabby ML** binds to localhost (127.0.0.1) by default; remote access requires manual config changes.
   * **Temporal Server** (dev mode) is unauthenticated by default; production deployments must enable TLS and authentication.
   * **Weaviate** is deployed with anonymous access disabled by default; access requires API keys or token authentication.

***

## Performance Considerations

1. **Intelligent Model Matching**

   * **Hardware Probe:** ModelAdapter inspects CPU (core count, architecture, vector instructions) and GPU (CUDA availability, VRAM).

   * **Scoring Formula:**

     ```
     score = α·(throughput_norm) + β·(accuracy) − γ·(estimated_cost) − δ·(memory_pressure)
     ```

     • throughput\_norm = model's tokens/s relative to best candidate\
     • accuracy = benchmarked code/generation accuracy (0–1)\
     • estimated\_cost = cost if falling back to cloud (USD)\
     • memory\_pressure = (model\_size\_gb / available\_ram\_gb)

   * **Runtime Re-Evaluation:** Before each inference, ModelAdapter recalculates scores. If a chosen model's latency > specified SLA, it automatically reroutes to a GPU backend (vLLM/Ollama) or a smaller model.

2. **Vector Retrieval Latency**

   * **Chroma** (SQLite + FAISS) returns top-k queries in ~2 ms for 1 M embeddings on NVMe SSD.
   * By chunking files at 512 tokens (stride 128), SearchAgent limits vector sizes to ~1 KB, optimizing batching and cache locality.
   * If RAG recall is low (similarity < 0.3), fallback to **Weaviate**'s BM25 index (average 10 ms for top-k on 10 M documents) for sparse retrieval, then re-rank with a 15 MB cross-encoder locally (< 50 ms inference).

3. **Workflow Concurrency**

   * **Temporal Workers:** Each activity type (e.g., `CoderAgent.generateCode`) runs in a dedicated worker pool. Horizontal scaling (multiple worker nodes) is straightforward—Temporal handles task queuing.
   * **Batched Inference:** ModelAdapter can batch multiple LLM requests when using GPU backends (vLLM) to improve throughput by 2–3×.
   * **Cache & Deduplication:** MemoryAgent caches embeddings of repeated prompts; identical prompt fingerprints return cached LLM responses (TTL configurable). This reduces redundant model calls for boilerplate operations.

4. **CI/CD Build Performance**
   * **Nx + SWC:** Full rebuilds complete in < 6 s on a 16 GB MacBook Pro, thanks to distributed caching.
   * **esbuild/Bun for Electron:** The dashboard bundle rebuilds in < 300 ms, enabling instant feedback when tweaking UI components.

***

## Scaling & Multi-User Considerations

1. **Shared Temporal & Weaviate Clusters**

   * In a team or enterprise setting, deploy **Temporal** in a Kubernetes cluster (statefulset with PostgreSQL/MySQL persistence).
   * For large teams or multi-repo setups, run **Weaviate** as a multi-replica cluster with sharding enabled (each namespace represents a project or repo).
   * **Namespace Isolation:** Temporal namespaces isolate workflow executions per team or project. Weaviate classes and schemas are namespace-isolated to prevent data mixing.

2. **Multi-Tenant RAG Index**

   * Chroma repositories can be segmented by project via subdirectories (`.vectorstore/<projectID>/`).
   * For cross-repo searches (e.g., "show all code referencing library X across repos"), a shared Weaviate instance with a unified class schema can span multiple projects.
   * **Access Controls:** Weaviate's API keys or authentication tokens ensure only authorized users query multi-repo data.

3. **Horizontal Worker Scaling**

   * **Temporal Workers:** Add more worker pods labeled for specific capabilities (e.g., GPU vs. CPU inference, SAST vs. design sync) to handle spikes in code generation or static analysis.
   * **vLLM/Ollama Pools:** For heavy inference workloads (e.g., teams with 10+ active users), deploy a GPU machine pool running vLLM with load balancing (via a service mesh or HAProxy) to distribute requests.
   * **Cache Warming:** On startup, ModelAdapter can preload commonly used models into memory (e.g., Llama 2 7B, StarCoder2 3B) to reduce cold-start latency.

4. **Data Retention & Archival**
   * **Chroma**: Periodically prune "episodes" older than 90 days or beyond a specified storage budget; optionally export to LanceDB for cold archival.
   * **Temporal**: Configure retention policies (e.g., retain workflow history for 30 days). Use Temporal's built-in archival features to offload to long-term storage (S3 or on-prem equivalent).
   * **LoRA Checkpoints**: Keep nightly LoRA checkpoints for the past 30 days; older checkpoints can be consolidated or deleted according to a rolling retention policy.

***

## Nx Monorepo & CI/CD

* All apps and libraries are managed as Nx projects in a single monorepo, using pnpm for dependency management.
* Nx Cloud is enabled for distributed caching and fast CI/CD.
* Each app/lib has standardized Nx targets: lint, type-check, test, build, and (where relevant) e2e.
* CI/CD is implemented via GitHub Actions, using Nx's affected commands and parallelization for fast, incremental checks.
* All dev, build, and test tasks should be run via Nx and pnpm from the repo root.

***

For detailed technical specifications on each core agent and adapter, see the corresponding files under the [`COMPONENTS/`](COMPONENTS/) folder. This architecture document should serve as a high-level reference for understanding how nootropic's pieces fit together and why certain design decisions were made.
