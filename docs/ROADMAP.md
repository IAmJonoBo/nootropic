# Roadmap

***

## Table of Contents

* [Version 1.x (Current – Q2/Q3 2025)](#version-1x-current--q2q3-2025)
* [Version 2.x (Q4 2025 – Q2 2026)](#version-2x-q4-2025--q2-2026)
* [Version 3.x + (Q3 2026 and Beyond)](#version-3x--q3-2026-and-beyond)
* [Backlog (Unprioritized / Long‐Term)](#backlog-unprioritized--long‐term)
* [How to Get Involved](#how-to-get-involved)

***

This roadmap outlines the planned evolution of **nootropic** across multiple versions, from the current v1.x milestone through v3.x and beyond. Each version is divided into approximate quarters (or sprint blocks) with clear deliverables, dependencies, and success criteria. The final “Backlog” section captures longer‐term ideas and lower‐priority enhancements.

***

## Version 1.x (Current – Q2/Q3 2025)

### Overview

Version 1.x focuses on establishing the core functionality: a lean, AI‐first local development environment with essential agents, extensible plugin support, and initial UX integrations for VS Code and Electron. The goal is to ship a stable, free‐first platform that demonstrates end‐to‐end AI‐driven planning, coding, and feedback loops.

### Milestone 1.0 (v1.0) – Foundation & MVP Delivery (July 2025)

* **Project Scaffold & Bootstrapping**
  * Initialize monorepo structure with `packages/` (core agents, adapters, CLI) and `extensions/` (VS Code, Electron).
  * Set up CI/CD (`GitHub Actions`) to run linting, unit tests, and basic integration checks on every PR.
* **Core Agents Implementation**
  * `ProjectMgrAgent`: Basic project‐spec parsing, DAG generation via PDDL (fast‐downward integration), and Git commit hooks. Expose `plan` CLI command that writes `TaskGraph.json` and updates `project‐spec.md`.
  * `CoderAgent`: Integrate with `ModelAdapter` to generate simple code patches for single‐file tasks. Support `npx nootropic code <task-id>` for dry‐run patch previews.
  * `CriticAgent`: Add Semgrep integration for static security/style checks in CI. Basic test runner orchestration (e.g., run `npm test` or `pytest`) for test validations.
  * `MemoryAgent`: Implement a lightweight episodic store using Chroma for local embeddings; allow simple “remember”/“recall” calls.
  * `PlannerAgent`: Tie into `ProjectMgrAgent` for PDDL planning; produce `TaskGraph` with sprint assignments.
* **Model & Tooling Adapters**
  * `ModelAdapter`: Default to local StarCoder‐2 via Ollama; fallback to HuggingFace endpoints. Provide an interface to choose model (local vs. cloud) via `~/.nootropic/config.json`.
  * `SearchAgent`: Index local repo with Chroma/Weaviate for hybrid search; support keyword + vector queries. Expose `npx nootropic search` for simple snippet retrieval.
  * `StorageAdapter`: Store embeddings and documents in Chroma/LanceDB; fallback to Weaviate. Support metadata CRUD in SQLite for v1.0.
* **VS Code Extension (v1.0)**
  * Ship a minimal Continue‐based VSIX that provides:
    * Slash commands: `/plan` (generate/update plan), `/code <task-id>` (invoke CoderAgent).
    * Inline “hover” suggestions powered by CriticAgent feedback.
    * Display of TaskGraph in a sidebar view (tree visualization).
* **Electron Dashboard (v1.0)**
  * Basic dashboard showing:
    * Current project plan (TaskGraph).
    * Recent agent events (Reflexion events feed).
    * Simple plugin management UI (list + enable/disable).
* **Plugin SDK (v1.0 alpha)**
  * Release a minimal `PluginLoaderAdapter` + manifest schema. Provide example “hello-world” plugin that registers a new CLI command and slash command.
* **Documentation & Developer Guide**
  * Finalize `README.md`, `GETTING-STARTED.md`, and initial API docs.
  * Publish v1.0 “Getting Started” tutorial: bootstrap a sample Node.js repo and generate a plan, code a task, and run tests.
* **Success Criteria**
  * All core agents (`ProjectMgr`, `Coder`, `Critic`, `Planner`, `Memory`) can run locally end‐to‐end.
  * VS Code extension can invoke planning, codegen, and display results without errors.
  * Electron app connects, shows plan, and logs agent events.
  * CI pipeline green across Windows/macOS/Linux.

***

### Milestone 1.1 (v1.1) – Stability & UX Polish (Q3 2025)

* **Self-Healing Loops**
  * Integrate Keptn‐based self-healing for CI: automatically rollback on test regression; run LitmusChaos for resilience tests.
  * ReflexionAdapter wiring: log RSM events, enable ExplainabilityAgent to show chain-of-thought in UI.
* **Advanced Planning Features**
  * `--delta` flag on `npx nootropic plan` to only replan modified tasks.
  * Resource constraints: support numeric fluents (sprint hours) in PDDL; produce warnings if capacity exceeded.
* **Plugin Ecosystem v1**
  * Finalize Plugin SDK: publishing to npm registry, versioning, and multiple plugin samples (e.g., a theme plugin, a custom search plugin).
  * Add CLI commands: `plugin:list`, `plugin:install`, `plugin:remove` fully functional, with manifest validation.
* **VS Code v1.1 Enhancements**
  * Multi-file refactoring command: `/rewrite-file <rule-id>`.
  * Display CriticAgent issues inline as diagnostics with quick-fix suggestions.
  * CodeLens integration: show “Apply Patch” above modified functions.
* **Electron v1.1 Enhancements**
  * Add interactive timeline: see chronological agent activity; filter by agent type (Coder, Critic, Planner).
  * Embed search UI: allow performing “search” within the dashboard and display results.
* **CLI & API Refinements**
  * Finalize `v1.1` CLI flags, ensure consistent error messages.
  * Publish stable `/v1/chat/completions` and `/v1/embeddings` endpoints for local models.
* **Documentation**
  * Expand “Components” docs (e.g., ReasoningAgent, ReflexionAdapter).
  * Add “Troubleshooting” guides for common setup issues (model download, Chroma indexing).
* **Success Criteria**
  * Zero critical bugs reported in public alpha.
  * Demonstrable self-healing in CI and basic resilience tests pass.
  * At least 3 community plugins published and installable via CLI.

***

## Version 2.x (Q4 2025 – Q2 2026)

### Overview

Version 2.x shifts focus toward scalability, multi‐IDE support, richer AI features (longer context, advanced LLMs), and solidifying a plugin marketplace. The ambition is to become the “Copilot‐class” free-first platform widely adopted by open‐source developers.

### Milestone 2.0 (v2.0) – Multi-IDE & Scaling (Q4 2025)

* **Multi-IDE Support**
  * Ship a **Neovim/Emacs plugin** leveraging the same Language Service Protocol (LSP) adapters used by VS Code.
  * Provide CLI hooking to allow JetBrains IDE integration via the LanguageServiceAdapter.
* **Model Router & Quantization**
  * Integrate an **Intelligent Model Matcher**: benchmark local hardware (CPU/GPU) and automatically select a quantized GGUF model (e.g., via LM Studio or Ollama).
  * Support seamless fallback to cloud LLM endpoints (Anthropic, OpenAI, Gemini) behind an opt-in plugin.
  * Add Petals integration: allow distributed inference on pooled GPUs for heavy tasks (e.g., nightly LoRA training).
* **RAG & Knowledge Enhancements**
  * Upgrade SearchAgent to support **hybrid retrieval**: combine Chroma + Weaviate + local symbol graph (akin to Sourcegraph); implement live incremental indexing for large monorepos.
  * Embed vector store replication to a central Weaviate cluster for cross-project search.
* **Self-Teaching Pipeline**
  * Enable **Nightly LoRA Pipeline**: automatically fine-tune StarCoder2 on “accepted diffs” logged by FeedbackAgent.
  * Add feedback loop: fetch CriticAgent pass/fail stats to adapt prompt heuristics.
* **Plugin Marketplace (v2.0)**
  * Publish a **central plugin registry** (hosted on GitHub/GitLab) with metadata, versioning, and user ratings.
  * CLI: implement `plugin:search <keyword>`, `plugin:publish`, and automatic dependency resolution (install peer-dependencies).
* **VS Code & Extension Pack**
  * Bundle **v2.0 extension** into an “Extension Pack” including: Continue, Roo Code, Semgrep, and custom nootropic commands.
  * Implement unified **activity bar** panel for planning + coding + feedback.
* **Electron Dashboard (v2.0)**
  * Introduce a **Multi-Tenant Web UI**: allow users to sign in, switch between projects, and share dashboards.
  * Add a **“Community Plugins”** tab with one-click install from marketplace.
* **API & CLI**
  * Launch `/v2/*` API endpoints: support streaming debug logs, plugin hooks in responses, and version negotiation.
  * CLI: add `nootropic sync` to sync settings across machines via Git repos or cloud storage.
* **Documentation**
  * Write “Advanced Architecture” guide detailing plugin marketplace, multi-IDE integration, and RAG design.
  * Create a “Scaling Guides” section: best practices for indexing monorepos >10K files, optimizing vector store replication.
* **Success Criteria**
  * Verified multi-IDE support (VS Code, Neovim, JetBrains).
  * Evidence of performance improvements when using intelligent model matcher on consumer-grade hardware.
  * At least 10 community plugins available, 100+ stars on plugin registry.

***

### Milestone 2.1 (v2.1) – Enterprise & Extensibility (Q1 2026)

* **Enterprise Features**
  * Add **Role-Based Access Control (RBAC)** for multi-tenant Web UI: allow org admins to manage user permissions, project visibility, and plugin access.
  * Introduce **audit logging**: record agent actions, plan changes, and plugin installations with timestamps.
* **Reflexion & Explainability Enhancements**
  * Enhance **ExplainabilityAgent**: allow replay of RSM event traces with visual overlays in the Electron UI.
  * Implement a **“Why-This-Suggestion”** feature: show chain-of-thought summaries inline when CoderAgent proposes code.
* **CI/CD Integration**
  * Provide **official Docker images** for all services (Chroma, Weaviate, LanceDB, MinIO) pre-configured with nootropic.
  * Publish Helm charts for Kubernetes: enable one-click deployment of entire nootropic stack (agents, adapters, vector stores).
* **Plugin Marketplace v2.1**
  * Add **semantic versioning enforcement** and compatibility checks (e.g., check plugin's `peerDependencies` against core version).
  * Implement **plugin security scanning**: run Snyk or Semgrep on plugin code before allowing publication.
* **SearchAgent & Storage Enhancements**
  * **Federated Search**: support searching across multiple repositories/organizations with permission filters (e.g., only search allowed projects).
  * **Multimodal RAG**: allow indexing of images (UML diagrams) using CLIP embeddings; enable “search by screenshot” in Electron.
* **VS Code & Extensions**
  * Ship **CodeTour-style guided tours** in VS Code: interactive walkthroughs of nootropic features.
  * Integrate **Figma DesignSyncAgent**: allow importing Figma components and generating Tailwind/React code stubs.
* **Documentation**
  * Publish an **“Enterprise Admin Guide”**: cover RBAC setup, audit logs, Kubernetes deployment, and compliance considerations (SOC 2, HIPAA).
  * Create a **“Plugin Development Best Practices”** handbook with examples of advanced plugin patterns (middleware hooks, UI components).
* **Success Criteria**
  * At least one enterprise pilot (e.g., open-source org adopting nootropic in production).
  * Docker + Helm charts downloaded 500+ times.
  * Evidence of plugin security scanning catching real issues.

***

## Version 3.x + (Q3 2026 and Beyond)

### Vision

Version 3.x+ broadens nootropic into a full-blown AI software development ecosystem—supporting multi-lingual, multi-platform, and multi-domain (frontend, backend, ML) workflows. Emphasis shifts to intelligent collaboration at scale: cross-team planning, real-time co-editing, and advanced autonomous expansion.

### Milestone 3.0 (v3.0) – Autonomous Expansion & Beyond (Q3 2026)

* **OpenDevin-Style Long-Horizon Agents**
  * Introduce a **Long-Horizon ReasoningAgent** (LATS v2) capable of end-to-end feature delivery (e.g., migrate monolith to microservices) with minimal human supervision.
  * Support orchestrating multi-agent workflows across several sprints: automatically propose epics, break into stories, assign to developers.
* **Cross-Team & Multi-Project Planning**
  * Enable **cross-project DAGs**: allow PlannerAgent to coordinate resource sharing across multiple repositories/teams.
  * Add a **“Shared Sprint Board”** in Web UI where multiple projects converge under a single roadmap.
* **Real-Time Collaboration**
  * Implement **co-authoring capabilities**: multiple developers can see real-time nootropic prompts, chat, and plan updates in a shared session (e.g., via Electron or web).
  * Integrate with collaboration tools (Slack/MS Teams) to push plan updates, critical CriticAgent warnings, and Reflexion insights directly into channels.
* **Advanced RAG & Knowledge Graph**
  * Build a **project-wide knowledge graph** (integrating CodeQL, Git history, and design docs) to power deeper semantic queries (e.g., “Show me all endpoints that touch user PII”).
  * Incorporate **graph neural networks** to suggest likely refactoring hotspots or architectural antipatterns.
* **AI-Driven QA & Testing**
  * Develop an **Autonomous QAAgent** that writes and runs randomized fuzz tests, property-based tests, and security experiments (e.g., use LitmusChaos in production‐like environments).
  * Add **AI-powered performance tuning**: automatically profile code, identify bottlenecks, and suggest optimized implementations (e.g., refactoring for async I/O vs. thread pools).
* **Multi-Modal Extensions**
  * Support **voice‐driven commands**: allow developers to speak “Create a new microservice for authentication in Go” and have nootropic generate scaffolding.
  * Integrate **screen recording analysis**: ingest user‐recorded demos and auto-generate documentation or test scenarios.
* **Enterprise & Ecosystem**
  * Launch a **Nootropic OSS Foundation**: steward governance, community contributions, and long-term vision.
  * Formalize **commercial support options**: premium compute burst, dedicated SLAs, custom plugin development.

### Post-v3.0 (v3.1, v3.2+)

* **Language‐Agile Support**
  * Extend CodeAgent and PlannerAgent to handle **polyglot monorepos** (Java, Python, Rust, Go) with cross‐language dependency analysis.
  * Provide **Jupyter Notebook integration** for data science workflows, enabling RAG queries over data pipelines and auto-generation of analysis code.
* **Global Knowledge Federation**
  * Enable federated knowledge graphs across organizational boundaries (e.g., across forks, guilds) while preserving data sovereignty and permissions.
  * Implement **zero‐trust embeddings**: allow secure vector search over encrypted indexes.
* **Adaptive Learning & Personalization**
  * Introduce a **PersonalizationAgent** that adapts code suggestions, planning heuristics, and CriticAgent policies based on individual developer behavior (keyboard patterns, commit history).
  * Offer an **“AI Coach”** in the dashboard that proactively surfaces potential improvements (e.g., “Consider adding docstrings to newly created functions”).
* **Emergent AI Collaborators**
  * Research and prototype **AI pair‐programming partners** that can hold extended context (100k+ tokens), converse in natural language, debug live code, and propose debugging workflows.
  * Integrate **multi-agent negotiation** for competing resource or architectural trade-offs (e.g., cost vs. performance) using game-theoretic approaches.

***

## Backlog (Unprioritized / Long‐Term)

* **Deprecate Old Models**: Migrate away from legacy LLMs (e.g., early GPT‐3 instances), automate model retirement workflows.
* **Federated Search**: Support privacy-preserving cross-repo search (e.g., via secure enclaves or homomorphic encryption).
* **Multimodal RAG v2**: Extend to include video/audio indexing (e.g., demo walkthroughs) and graph‐structured knowledge.
* **Augmented Reality (AR) Integration**: Prototype AR overlays that visualize code structure or data flows in real‐world contexts.
* **Zero-Code Application Generation**: Develop a “no-code” layer where non-technical users can define high-level application requirements and nootropic generates full stacks.
* **Plug-and-Play Embedding Hubs**: Build a marketplace for custom embeddings (company-specific, domain-specific) that can be plugged into the SearchAgent with one command.
* **AI-Driven Infrastructure Management**: Auto-generate Terraform/Pulumi modules for cloud infra based on high-level cost constraints or compliance needs.
* **Custom Hardware Acceleration Support**: Integrate support for custom inference accelerators (e.g., Graphcore IPU, Habana Gaudi) for on-premises LLM inference.
* **Advanced DevSecOps**: Incorporate fully AI-driven security testing (fuzzing, pentesting) orchestration as part of CI/CD.

***

## How to Get Involved

* **GitHub Issues & Projects**:
  * Browse existing issues under [`/issues`](https://github.com/your-org/nootropic/issues) labeled by milestone (e.g., `v1.0`, `v2.0`).
  * Join our Discussion board for roadmap feedback, design proposals, and community Q\&A.
* **Contribution Guidelines**:
  * See `CONTRIBUTING.md` for commit conventions, code style, and pull request requirements.
  * New plugin authors can start by forking `plugins/hello-world` and submitting a PR to the Plugin Registry.
* **Community Meetings**:
  * Biweekly community calls (via Zoom) are announced in the “Events” channel on our Slack workspace.
  * Sign up for our mailing list to receive monthly newsletters summarizing progress.

***

*Last updated: June 2025*

> Notes on Structure and Usage:
>
> * Each Milestone is tied to an approximate timeframe (quarters or sprint ranges). Adjust dates as your release schedule evolves.
> * Success Criteria at the end of each milestone ensure clear “done” conditions.
> * The Backlog collects lower‐priority or exploratory items that can be reprioritized into roadmap milestones as capacity allows.
> * The How to Get Involved section guides contributors to relevant resources and processes.
>
> This stepwise roadmap should serve as a living document, evolving as new requirements emerge, community feedback is received, and development priorities shift.
