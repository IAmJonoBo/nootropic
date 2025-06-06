# Roadmap

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://docs.nootropic.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

This roadmap outlines the planned evolution of **nootropic** as a solo developer project, focusing on delivering a powerful, intelligent, and self-improving AI coding assistant platform with a local-first approach. The priorities are organized by focus areas rather than strict timelines.

## Table of Contents

- [Current Focus](#current-focus)
- [Next Priorities](#next-priorities)
- [Future Enhancements](#future-enhancements)
- [Success Metrics](#success-metrics)
- [Resource Constraints](#resource-constraints)
- [Local Development](#local-development)

## Current Focus

### Core Agent System Implementation
- **Local Agent Contracts**
  - Finalize input/output schemas for all agents
  - Implement local event handling
  - Add health checking and local discovery
- **Agent Scaffolding**
  - Create local libraries under libs/agents/
  - Set up TypeScript references and build targets
  - Configure local dependencies
- **ReflexionAdapter Integration**
  - Implement local event streams
  - Add local event persistence (SQLite)
  - Set up local event replay

### Local RAG & Vector Store
- **Local Vector Store**
  - Set up local ChromaDB instance
  - Implement local VectorStoreAdapter
  - Add local LanceDB fallback
- **SearchAgent Implementation**
  - Local code/doc chunking
  - Local embedding generation
  - Local vector store optimization
- **Local Validation**
  - Test local context retrieval
  - Measure local query latency
  - Validate local RAG quality

### Local Plugin System
- **PluginLoaderAdapter**
  - Implement local plugin discovery
  - Add local manifest validation
  - Set up local workspace integration
- **Local Registry**
  - Design local registry schema
  - Implement local registry updates
  - Add local version checks
- **Local UI Integration**
  - Add local plugin commands
  - Surface commands in VS Code
  - Update local dashboard

## Next Priorities

### Local Self-Healing
- **Local Monitoring**
  - Set up local metrics
  - Configure local alerts
  - Implement local recovery
- **Local Instrumentation**
  - Add local tracing
  - Implement local metrics
  - Configure local logging
- **Local Recovery**
  - Implement local restart
  - Add local rollback
  - Set up local alerts

### Local Learning
- **FeedbackAgent Implementation**
  - Capture local feedback
  - Store in local memory
  - Track local acceptance
- **Local Training**
  - Design local training
  - Implement local data prep
  - Add local model integration
- **Local Benchmarking**
  - Create local benchmarks
  - Measure local accuracy
  - Track local latency

### Local Performance
- **Local Caching**
  - Configure local cache
  - Optimize local builds
  - Speed up local tests
- **Local Profiling**
  - Add local monitoring
  - Optimize local paths
  - Implement local quantization
- **Local Telemetry**
  - Add local traces
  - Set up local dashboards
  - Track local metrics

## Future Enhancements

### Local Plugin System
- **Local Registry**
  - Create local plugin store
  - Add local versioning
  - Implement local security
- **Local SDK**
  - Document local practices
  - Add local examples
  - Create local tests

### Local Search
- **Local Vector Store**
  - Add local optimization
  - Implement local backup
  - Optimize local storage
- **Local Search**
  - Add local filtering
  - Implement local search
  - Optimize local queries

### Local Features
- **Local Security**
  - Add local access
  - Implement local roles
  - Add local logging
- **Local Management**
  - Add local isolation
  - Implement local quotas
  - Add local tracking

## Success Metrics

### Local Response Times
- **Local Inference**
  - Local models: < 100ms/token (GPU)
  - CPU fallback: < 500ms/token
  - Local optimization: < 1s/token
- **Local Search**
  - Local store: < 50ms
  - Local fallback: < 100ms
- **Local Operations**
  - Command start: < 200ms
  - Local prompts: < 500ms
  - Local suggestions: < 300ms

### Local Code Quality
- **Local Ratings**: ≥ 4.0/5.0
- **Local Tests**: ≥ 90%
- **Local Errors**: < 10%

### Local Reliability
- **Local Uptime**: ≥ 99.9%
- **Local Errors**: < 1%
- **Local Recovery**: < 30s

### Local Satisfaction
- **Local NPS**: ≥ 50
- **Local Setup**: < 2 minutes
- **Local Usage**: ≥ 75%

### Local Efficiency
- **Local Resources**
  - CPU: < 50%
  - Memory: < 8GB
  - Storage: ≥ 50GB
- **Local Costs**
  - Local spend: < $50
  - Local efficiency: ≥ 50%
  - Local time: < 10 minutes

## Resource Constraints

### Local Hardware
- **GPU**: Midrange (e.g., GTX 1660 Ti)
- **RAM**: ≥ 8GB (7B models)
- **Storage**: ≥ 50GB SSD

### Local Infrastructure
- **Local-First**: All functionality local
- **Local Backup**: Local storage
- **Local CI**: 7GB RAM, local commands

### Development
- **Size**: Solo developer
- **Expertise**: TypeScript, local tools
- **Focus**: Local agents, adapters

## Local Development

### Version Control
- **Local Git**
- **Local CI**
- **Local Updates**
- **Local Analysis**

### Local Pipeline
- **Local Build**
  - Local install
  - Local build
  - Local test
  - Local lint
  - Local coverage

### Local Monitoring
- **Local Metrics**
- **Local Tracing**
- **Local Logs**
  - Local latency
  - Local throughput
  - Local health

### Local Services
- **Local Models**
  - Local inference
  - Local fallback
  - Local optimization
- **Local Storage**
  - Local primary
  - Local backup
  - Local cache

## Version 1.x (Current – Q2/Q3 2025)

### Overview

Version 1.x focuses on establishing the core functionality: a lean, AI‐first local development environment with essential agents, extensible plugin support, and local UX integrations. The goal is to ship a stable, local‐first platform that demonstrates end‐to‐end AI‐driven planning, coding, and feedback loops.

> **See Also**: [Architecture Overview](../ARCHITECTURE.md#architecture-overview) for technical details.

### Milestone 1.0 (v1.0) – Foundation & MVP Delivery (July 2025)

* **Local Project Setup**
  * Initialize local structure with `packages/` (core agents, adapters, CLI) and `extensions/` (VS Code, Electron).
  * Set up local CI to run linting, unit tests, and basic integration checks.

> **See Also**: [Project Structure](../ARCHITECTURE.md#project-structure) for detailed layout.

* **Local Agents**
  * `ProjectMgrAgent`: Local project parsing, local DAG generation, and local Git hooks. Expose local `plan` command.
  * `CoderAgent`: Local model integration for code patches. Support local code previews.
  * `CriticAgent`: Local security/style checks. Local test runner.
  * `MemoryAgent`: Local episodic store using local embeddings.

## Version 2.x (Q4 2025 – Q2 2026)

### Overview

Version 2.x shifts focus toward scalability, multi‐IDE support, richer AI features (longer context, advanced LLMs), and solidifying a plugin marketplace. The ambition is to become the "Copilot‐class" free-first platform widely adopted by open‐source developers.

> **See Also**: [Architecture Overview](../ARCHITECTURE.md#architecture-overview) for technical details.

### Milestone 2.0 (v2.0) – Multi-IDE & Scaling (Q4 2025)

* **Multi-IDE Support**
  * Ship a **Neovim/Emacs plugin** leveraging the same Language Service Protocol (LSP) adapters used by VS Code.
  * Provide CLI hooking to allow JetBrains IDE integration via the LanguageServiceAdapter.

> **See Also**: [IDE Integration](../EXTENSIONS.md#ide-integration) for IDE details.

* **Model Router & Quantization**
  * Integrate an **Intelligent Model Matcher**: benchmark local hardware (CPU/GPU) and automatically select a quantized GGUF model (e.g., via LM Studio or Ollama).
  * Support seamless fallback to cloud LLM endpoints (Anthropic, OpenAI, Gemini) behind an opt-in plugin.
  * Add Petals integration: allow distributed inference on pooled GPUs for heavy tasks (e.g., nightly LoRA training).

> **See Also**: [Model System](../ARCHITECTURE.md#model-system) for model details.

* **RAG & Knowledge Enhancements**
  * Upgrade SearchAgent to support **hybrid retrieval**: combine Chroma + Weaviate + local symbol graph (akin to Sourcegraph); implement live incremental indexing for large monorepos.
  * Embed vector store replication to a central Weaviate cluster for cross-project search.

> **See Also**: [Search System](../ARCHITECTURE.md#search-system) for search details.

* **Self-Teaching Pipeline**
  * Enable **Nightly LoRA Pipeline**: automatically fine-tune StarCoder2 on "accepted diffs" logged by FeedbackAgent.
  * Add feedback loop: fetch CriticAgent pass/fail stats to adapt prompt heuristics.

> **See Also**: [Learning System](../ARCHITECTURE.md#learning-system) for learning details.

* **Plugin Marketplace (v2.0)**
  * Publish a **central plugin registry** (hosted on GitHub/GitLab) with metadata, versioning, and user ratings.
  * CLI: implement `plugin:search <keyword>`, `plugin:publish`, and automatic dependency resolution (install peer-dependencies).

> **See Also**: [Plugin Marketplace](../PLUGINS.md#plugin-marketplace) for marketplace details.

* **VS Code & Extension Pack**
  * Bundle **v2.0 extension** into an "Extension Pack" including: Continue, Roo Code, Semgrep, and custom nootropic commands.
  * Implement unified **activity bar** panel for planning + coding + feedback.

> **See Also**: [VS Code Extension](../EXTENSIONS.md#vs-code-extension) for extension details.

* **Electron Dashboard (v2.0)**
  * Introduce a **Multi-Tenant Web UI**: allow users to sign in, switch between projects, and share dashboards.
  * Add a **"Community Plugins"** tab with one-click install from marketplace.

> **See Also**: [Electron Dashboard](../EXTENSIONS.md#electron-dashboard) for dashboard details.

* **API & CLI**
  * Launch `/v2/*` API endpoints: support streaming debug logs, plugin hooks in responses, and version negotiation.
  * CLI: add `nootropic sync` to sync settings across machines via Git repos or cloud storage.

> **See Also**: [CLI Reference](../CLI_REFERENCE.md) for CLI details.
> **See Also**: [API Reference](../API_REFERENCE.md) for API details.

* **Documentation**
  * Write "Advanced Architecture" guide detailing plugin marketplace, multi-IDE integration, and RAG design.
  * Create a "Scaling Guides" section: best practices for indexing monorepos >10K files, optimizing vector store replication.

> **See Also**: [Documentation Guide](../DOCUMENTATION.md) for documentation details.

* **Success Criteria**
  * Verified multi-IDE support (VS Code, Neovim, JetBrains).
  * Evidence of performance improvements when using intelligent model matcher on consumer-grade hardware.
  * At least 10 community plugins available, 100+ stars on plugin registry.

> **See Also**: [Testing Guide](../TESTING.md) for testing criteria.

### Milestone 2.1 (v2.1) – Enterprise & Extensibility (Q1 2026)

* **Enterprise Features**
  * Add **Role-Based Access Control (RBAC)** for multi-tenant Web UI: allow org admins to manage user permissions, project visibility, and plugin access.
  * Introduce **audit logging**: record agent actions, plan changes, and plugin installations with timestamps.

> **See Also**: [Enterprise Features](../ENTERPRISE.md#enterprise-features) for enterprise details.

* **Reflexion & Explainability Enhancements**
  * Enhance **ExplainabilityAgent**: allow replay of RSM event traces with visual overlays in the Electron UI.
  * Implement a **"Why-This-Suggestion"** feature: show chain-of-thought summaries inline when CoderAgent proposes code.

> **See Also**: [Explainability](../ARCHITECTURE.md#explainability) for explainability details.

* **CI/CD Integration**
  * Provide **official Docker images** for all services (Chroma, Weaviate, LanceDB, MinIO) pre-configured with nootropic.
  * Publish Helm charts for Kubernetes: enable one-click deployment of entire nootropic stack (agents, adapters, vector stores).

> **See Also**: [CI/CD Guide](../CI_CD.md) for CI/CD details.

* **Plugin Marketplace v2.1**
  * Add **semantic versioning enforcement** and compatibility checks (e.g., check plugin's `peerDependencies` against core version).
  * Implement **plugin security scanning**: run Snyk or Semgrep on plugin code before allowing publication.

> **See Also**: [Plugin Marketplace](../PLUGINS.md#plugin-marketplace) for marketplace details.

* **SearchAgent & Storage Enhancements**
  * **Federated Search**: support searching across multiple repositories/organizations with permission filters (e.g., only search allowed projects).
  * **Multimodal RAG**: allow indexing of images (UML diagrams) using CLIP embeddings; enable "search by screenshot" in Electron.

> **See Also**: [Search System](../ARCHITECTURE.md#search-system) for search details.

* **VS Code & Extensions**
  * Ship **CodeTour-style guided tours** in VS Code: interactive walkthroughs of nootropic features.
  * Integrate **Figma DesignSyncAgent**: allow importing Figma components and generating Tailwind/React code stubs.

> **See Also**: [VS Code Extension](../EXTENSIONS.md#vs-code-extension) for extension details.

* **Documentation**
  * Publish an **"Enterprise Admin Guide"**: cover RBAC setup, audit logs, Kubernetes deployment, and compliance considerations (SOC 2, HIPAA).
  * Create a **"Plugin Development Best Practices"** handbook with examples of advanced plugin patterns (middleware hooks, UI components).

> **See Also**: [Documentation Guide](../DOCUMENTATION.md) for documentation details.

* **Success Criteria**
  * At least one enterprise pilot (e.g., open-source org adopting nootropic in production).
  * Docker + Helm charts downloaded 500+ times.
  * Evidence of plugin security scanning catching real issues.

> **See Also**: [Testing Guide](../TESTING.md) for testing criteria.

## Version 3.x + (Q3 2026 and Beyond)

### Vision

Version 3.x+ broadens nootropic into a full-blown AI software development ecosystem—supporting multi-lingual, multi-platform, and multi-domain (frontend, backend, ML) workflows. Emphasis shifts to intelligent collaboration at scale: cross-team planning, real-time co-editing, and advanced autonomous expansion.

> **See Also**: [Architecture Overview](../ARCHITECTURE.md#architecture-overview) for technical details.

### Milestone 3.0 (v3.0) – Autonomous Expansion & Beyond (Q3 2026)

* **OpenDevin-Style Long-Horizon Agents**
  * Introduce a **Long-Horizon ReasoningAgent** (LATS v2) capable of end-to-end feature delivery (e.g., migrate monolith to microservices) with minimal human supervision.
  * Support orchestrating multi-agent workflows across several sprints: automatically propose epics, break into stories, assign to developers.

> **See Also**: [Agent System](../AGENTS.md#agent-system) for agent details.

* **Cross-Team & Multi-Project Planning**
  * Enable **cross-project DAGs**: allow PlannerAgent to coordinate resource sharing across multiple repositories/teams.
  * Add a **"Shared Sprint Board"** in Web UI where multiple projects converge under a single roadmap.

> **See Also**: [Planning System](../ARCHITECTURE.md#planning-system) for planning details.

* **Real-Time Collaboration**
  * Implement **co-authoring capabilities**: multiple developers can see real-time nootropic prompts, chat, and plan updates in a shared session (e.g., via Electron or web).
  * Integrate with collaboration tools (Slack/MS Teams) to push plan updates, critical CriticAgent warnings, and Reflexion insights directly into channels.

> **See Also**: [Collaboration](../ARCHITECTURE.md#collaboration) for collaboration details.

* **Advanced RAG & Knowledge Graph**
  * Build a **project-wide knowledge graph** (integrating CodeQL, Git history, and design docs) to power deeper semantic queries (e.g., "Show me all endpoints that touch user PII").
  * Incorporate **graph neural networks** to suggest likely refactoring hotspots or architectural antipatterns.

> **See Also**: [Knowledge Graph](../ARCHITECTURE.md#knowledge-graph) for knowledge graph details.

* **AI-Driven QA & Testing**
  * Develop an **Autonomous QAAgent** that writes and runs randomized fuzz tests, property-based tests, and security experiments (e.g., use LitmusChaos in production‐like environments).
  * Add **AI-powered performance tuning**: automatically profile code, identify bottlenecks, and suggest optimized implementations (e.g., refactoring for async I/O vs. thread pools).

> **See Also**: [Testing System](../ARCHITECTURE.md#testing-system) for testing details.

* **Multi-Modal Extensions**
  * Support **voice‐driven commands**: allow developers to speak "Create a new microservice for authentication in Go" and have nootropic generate scaffolding.
  * Integrate **screen recording analysis**: ingest user‐recorded demos and auto-generate documentation or test scenarios.

> **See Also**: [Extensions](../EXTENSIONS.md) for extension details.

* **Enterprise & Ecosystem**
  * Launch a **Nootropic OSS Foundation**: steward governance, community contributions, and long-term vision.
  * Formalize **commercial support options**: premium compute burst, dedicated SLAs, custom plugin development.

> **See Also**: [Enterprise Features](../ENTERPRISE.md#enterprise-features) for enterprise details.

### Post-v3.0 (v3.1, v3.2+)

* **Language‐Agile Support**
  * Extend CodeAgent and PlannerAgent to handle **polyglot monorepos** (Java, Python, Rust, Go) with cross‐language dependency analysis.

> **See Also**: [Language Support](../ARCHITECTURE.md#language-support) for language details.

## Backlog (Unprioritized / Long‐Term)

* **Research & Innovation**
  * Explore quantum computing integration for optimization problems
  * Investigate novel neural architectures for code understanding
  * Research advanced program synthesis techniques

> **See Also**: [Research](../RESEARCH.md) for research details.

## How to Get Involved

* **Contributing**
  * Review [Contributing Guide](../CONTRIBUTING.md) for guidelines
  * Join [Discord](https://discord.gg/nootropic) for community discussions
  * Follow [GitHub Discussions](https://github.com/nootropic/discussions) for updates

> **See Also**: [Community](../COMMUNITY.md) for community details.
> **See Also**: [Contributing](../CONTRIBUTING.md) for contribution guidelines.

*Last updated: June 2025*

> Notes on Structure and Usage:
>
> * Each Milestone is tied to an approximate timeframe (quarters or sprint ranges). Adjust dates as your release schedule evolves.
> * Success Criteria at the end of each milestone ensure clear "done" conditions.
> * The Backlog collects lower‐priority or exploratory items that can be reprioritized into roadmap milestones as capacity allows.
> * The How to Get Involved section guides contributors to relevant resources and processes.
>
> This stepwise roadmap should serve as a living document, evolving as new requirements emerge, community feedback is received, and development priorities shift.
