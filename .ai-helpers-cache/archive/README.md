# nootropic

[![Doc/Code Sync](https://img.shields.io/github/actions/workflow/status/nootropic/docs-check-sync.yml?label=Doc%2FCode%20Sync)](https://github.com/nootropic/nootropic/actions/workflows/docs-check-sync.yml)
[![API Docs](https://img.shields.io/github/actions/workflow/status/nootropic/docs-api.yml?label=API%20Docs)](https://github.com/nootropic/nootropic/actions/workflows/docs-api.yml)
[![Schema Validation](https://img.shields.io/github/actions/workflow/status/nootropic/schema-validation.yml?label=Schema%20Validation)](https://github.com/nootropic/nootropic/actions/workflows/schema-validation.yml)
[![Roadmap Freshness](https://img.shields.io/github/actions/workflow/status/nootropic/roadmap.yml?label=Roadmap%20Freshness)](https://github.com/nootropic/nootropic/actions/workflows/roadmap.yml)

> **Note:** The canonical sources for all documentation and LLM/agent introspection are [`docs/docManifest.json`](./docs/docManifest.json) and [`.nootropic-cache/describe-registry.json`](./nootropic-cache/describe-registry.json). All code/doc sync, describe registry, and CI enforcement follow [2025 TypeScript monorepo best practices](https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052). See CONTRIBUTING.md for details.

**Badges legend:**

- **Doc/Code Sync:** Fails if code and docs are out of sync (see `docs-check-sync.yml`).
- **API Docs:** Status of API docs generation (see `docs-api.yml`).
- **Schema Validation:** Validates all event schemas and AsyncAPI spec (see `schema-validation.yml`).
- **Roadmap Freshness:** Ensures `docs/ROADMAP.md` is up to date with the backlog (see `roadmap.yml`).

If a badge is red, see the linked workflow run for troubleshooting steps. All automation is documented below and in CONTRIBUTING.md.

## 🚀 For AI/LLM Agents: Discovering and Using nootropic

**nootropic** is a modular, ESM-only TypeScript toolkit for orchestrating, testing, and automating AI agent workflows. It is designed for seamless integration with LLMs, agent frameworks, and automation systems.

### 🔍 How to Discover Capabilities

- **See the canonical, always-up-to-date feature table and describe registry reference:**
  - [docs/capabilities.md](./docs/capabilities.md) (auto-generated, canonical)
  - [Machine-readable registry](.nootropic-cache/describe-registry.json)

- **List all available helpers, adapters, and plugins:**
  - **CLI:**  

    ```sh
    pnpm run nootropic list-capabilities
    ```

  - **Programmatic:**  

    ```ts
    import { listCapabilities } from 'nootropic';
    const caps = await listCapabilities();
    console.log(caps);
    ```

  - **How it works:**
    - The discovery API now dynamically and recursively aggregates all `describe()` exports from all agents, adapters, plugins, and utilities (including all subfolders), always reflecting the latest code and available features.
    - This means the CLI and programmatic API are always up to date and introspectable, with no need to maintain a static registry. All new modules are automatically included if they export a `describe()`.
    - Each capability includes types, usage, and (where available) schema information for LLM/agent use. The registry is validated in CI and onboarding.
    - (Planned) JSON Schema and OpenAPI spec export for advanced LLM/agent workflows.

- **Machine-readable registry:**  
  See [`.nootropic-cache/describe-registry.json`](./nootropic-cache/describe-registry.json) for a full, auto-generated, always up-to-date list of all features, signatures, and usage.

- **HTTP endpoint for LLM/agent discovery:**
  - **/capabilities**: The HTTP API at `/capabilities` serves the full describe registry as JSON, always up to date. This endpoint is ideal for LLMs, agent frameworks, and automation tools to discover all available features, signatures, and usage in a machine-readable format.
  - Example: `curl http://localhost:4000/capabilities`
- **Self-description:**  
  Every agent, adapter, plugin, and utility exposes a static `.describe()` method or export:

  ```ts
  import { OrchestrationEngine } from 'nootropic';
  console.log(OrchestrationEngine.describe());
  ```

### 🚦 Features at a Glance (Auto-Generated)

> **The canonical, always-up-to-date feature table is now in [docs/capabilities.md](./docs/capabilities.md).**

| Capability | Description | Usage | Key Methods/Functions |
|------------|-------------|-------|----------------------|
| agents | Exports all core and advanced nootropic agents. All agents are registry/describe/event-schema compliant, export LLM/AI-friendly describe() outputs, include advanced feature stubs and extension points, and are documented in docs/capabilities with best practices, usage, and troubleshooting. CI/CD and onboarding enforce compliance. |

```ts
import { BaseAgent, ContentAgent, CollectionAgent, ReviewAgent } from 'nootropic/agents';
``` |  |
| examplePlugin | A sample plugin for nootropic. Demonstrates plugin lifecycle, dynamic event subscription, and hot-reload safety. [Schema] 🏅
Subscribes: Log | Emits: Log | 

```ts
nootropic plugins run examplePlugin
``` |  |
| updateNotifier | Notifies users of available package updates via CLI. Useful for keeping nootropic up to date. 🔗 | 

```ts
import updateNotifierCapability from 'nootropic/utils/describe/updateNotifier'; updateNotifierCapability.checkForUpdates();
``` | **checkForUpdates**: 
() => void
Checks for updates and notifies the user via CLI. |
| adapterUtils | Utility for dynamic ESM import with fallback and error formatting. Useful for plugin/adapter loading. 🔗 | 

```ts
import adapterUtilsCapability from 'nootropic/utils/plugin/adapterUtils'; await adapterUtilsCapability.tryDynamicImport('module');
``` | **tryDynamicImport**: 
(moduleName: string) => Promise<unknown | null>
Attempts to dynamically import a module, returns null on failure. |
| SecretsManager | Unified secrets management interface for local, KMS, and Vault backends. [Schema] 🔗 | 

```ts
See LocalSecretsManager and KmsVaultSecretsManager for usage.
``` |  |
| OrchestrationEngine | Unified interface for agent orchestration. | 
`const engine = getOrchestrationEngine('langchain'); const result = await engine.runAgentTask(profile, task, context);` | runAgentTask |
| utils | Shared utilities for file I/O, error logging, and ESM entrypoint checks. Follows docs-first workflow and AI/LLM-friendly documentation best practices. All exports must have TSDoc comments, and all changes must be reflected in documentation and describe() output. The describe() registry is validated in CI. | 
`import { readJsonSafe, writeJsonSafe, errorLogger } from 'nootropic';` | readJsonSafe, writeJsonSafe, getOrInitJson, errorLogger, esmEntrypointCheck, ensureDirExists, listFilesInDir, listFilesRecursive, loadAiHelpersConfig, getCacheDir, getCacheFilePath, listCacheFiles, ensureCacheDirExists, aggregateDescribeRegistry |
| quality/selfcheck | Unified, plugin-based quality enforcement system for linting, type-checking, security, and more. Follows docs-first workflow and AI/LLM-friendly documentation best practices. All exports must have TSDoc comments, and all changes must be reflected in documentation and describe() output. The describe() registry is validated in CI. | 
`pnpm run quality [--once\|--schedule <cron>]` |  |
| contextSnapshotHelper | Extracts, summarizes, and provides context for AI agents, including contracts, tests, todos, and semantic index. | 
`import { createSnapshot, extractTodos } from 'nootropic/contextSnapshotHelper';` | createSnapshot, getAgentMessages, addAgentMessage, extractTodos, detectSchemaDrift, getTestFiles, getContextChunk, getOptimizedHandoverPayload |
| semanticIndexBuilder | Builds a semantic search index for code, docs, and agent messages. | 
`import { buildSemanticIndex } from 'nootropic/semanticIndexBuilder';` | buildSemanticIndex, extractChunks, embed |
| ./agents/BaseAgent.js | No describe() export found. |  |  |
| ./agents/DataCollectorAgent.js | No describe() export found. |  |  |
| ./agents/WriterAgent.js | No describe() export found. |  |  |
| ./agents/ReviewerAgent.js | No describe() export found. |  |  |
| agentProfileRegistry | Registry for agent profiles and metadata. Planned: persistent agent metadata, dynamic discovery, lifecycle management, governance, and event hooks. | 
`pnpm tsx nootropic/agentProfileRegistry.ts register <agent> <profileJson>` | registerProfile, getProfiles |
| agentIntentRegistry | Registry for agent intents, plans, and feedback. Supports CLI, HTTP, and WebSocket APIs. Planned: plugin/capability integration, event hooks, and memory lane logging. | 
`pnpm tsx nootropic/agentIntentRegistry.ts register <agent> <intent> <planStep1> ...` | registerIntent, submitFeedback, getIntents, getFeedback |
| docDiagramGenerator | Generates agent/workflow diagrams from live registry/context. Follows docs-first workflow and AI/LLM-friendly documentation best practices. All exports must have TSDoc comments, and all changes must be reflected in documentation and describe() output. The describe() registry is validated in CI. | 
`pnpm tsx nootropic/docDiagramGenerator.ts` | runDocDiagramGenerator |
| liveMutationPRHelper | Automates code mutation, branch creation, and PR suggestion for agent-driven refactoring. Emits structured events for all major actions (mutationSuggested, patchApplied, branchCreated, prCreated) for full traceability. | 
`pnpm tsx nootropic/liveMutationPRHelper.ts` | runLiveMutationPRHelper |
|  |  |  | getRecentMessages |
| ReasoningLoopUtility | Advanced iterative code generation, explanation, and repair utility for agent workflows. Supports uncertainty-aware chain-of-thought, SCoT (structured reasoning), robust backtracking, pluggable LLM-driven explanation/repair, and event-driven feedback integration. | 
```ts
import { ReasoningLoopUtility } from 'nootropic/capabilities/ReasoningLoopUtility';
const util = new ReasoningLoopUtility();
const { result, log } = await util.runLoop('problem', {
  structuredReasoning: true,
  uncertaintyThreshold: 0.4,
  feedback: async (step, conf) => conf < 0.4 ? 'backtrack' : 'accept',
  llmExplain: async (step, ctx) => /* call LLM for explanation or structure */,
  llmRepair: async (step, ctx) => /* call LLM for repair */
});
console.log(result, log);
``` | runLoop, generateStructuredPlan, explainStep, repairStep |
| ChunkingUtility | Modular chunking utility supporting fixed-size, sentence, paragraph, semantic, recursive, and agentic chunking strategies. Registry-driven, describe/health compliant. | 
// ... existing code ...
```ts
import { ChunkingUtility } from 'nootropic/utils/context/chunking';
const util = new ChunkingUtility();
const chunks = await util.chunk(text, { strategy: 'fixed', chunkSize: 200 });
```

- Supports: `fixed`, `sentence`, `paragraph`, `semantic` (embedding-based, backlog), `recursive`, `agentic` (task-driven, backlog)
- Registry-driven interface, describe/health compliance
- See [Zilliz RAG Chunking Guide](https://zilliz.com/learn/guide-to-chunking-strategies-for-rag), [Superlinked Advanced RAG](https://superlinked.com/vectorhub/articles/advanced-retrieval-augmented-generation), [ARAGOG](https://arxiv.org/html/2404.01037v1)
- Backlog: implement real semantic/agentic chunking, expand tests, integrate with RAGPipelineUtility
// ... existing code ...

### 🛠️ How to Use a Helper/Tool

```ts
import { getOrchestrationEngine } from 'nootropic';

const engine = getOrchestrationEngine('langchain');
const result = await engine.runAgentTask(
  { name: 'TestAgent' },
  { id: 't1', description: 'Say hello' }
);
console.log(result);
```

### 📦 Context-Window-Friendly Data

- Use `getContextChunk(size)` or similar APIs to retrieve context/data sized for your LLM's window.

### 📚 More Information

- See [docs/llm-integration.md](./docs/llm-integration.md) for a deep dive on LLM/agent integration, tool use, and best practices.

## 🧠 Context-Window-Friendly & Efficient Handoff

- **ContextManager:** Now fully implemented, registry-compliant, and exposes public APIs for context pruning, archiving, tiering, and restoration. CLI/HTTP/event-driven integration is complete, and all operations emit events for observability. See [utils/context/contextManager.ts](./utils/context/contextManager.ts).

## Intelligent, Token-Aware Handover Payloads

nootropic now supports advanced, research-backed context handoff for LLM/agent workflows. When the context window approaches 80% utilization, the system can automatically generate an optimized payload using a hybrid of sliding window (recent N), vector retrieval (relevant old context), and summarization. All context items are labeled with relevance, permanence, and type, and the payload is prioritized and compressed to fit the token budget, with critical information placed first.

### CLI Usage: `handover-payload`

Generate an optimized, token-aware handover payload for agent context:

```sh
pnpm nootropic handover-payload \
  --critical-types user_intent,plan,code_diff \
  --sliding-window 10 \
  --max-tokens 16000 \
  --exclude-types ephemeral \
  --context-file .nootropic-cache/context.json \
  --json
```

**Options:**

- `--critical-types <types>`: Comma-separated list of critical context types (always included first)
- `--sliding-window <n>`: Number of recent messages/events to always include
- `--max-tokens <n>`: Max tokens for the context window (default: 16000)
- `--exclude-types <types>`: Comma-separated list of types to always exclude
- `--context-file <file>`: Path to context JSON file (default: `.nootropic-cache/context.json`)
- `--json`: Output as machine-readable JSON

**Best Practices:**

- Use agent-specific context configuration to define what is critical, how much history to keep, and what to exclude.
- Monitor context window usage and trigger handoff at 80% utilization.
- Always log handoff events and context composition for observability and debugging.

**Reference:** See `contextSnapshotHelper.ts` for the `AgentContextConfig` schema and the `getOptimizedHandoverPayload` utility.

## Codebase Hygiene and DRY Utilities

- All directory and file listing is now handled by a single, robust utility: `listFilesRecursive` (in `utils.ts`), which uses the well-maintained `rrdir` package for recursive, efficient, and DRY file discovery.
- The core context snapshot function (`gatherSnapshotData` in `contextSnapshotHelper.ts`) has been refactored into smaller, single-responsibility functions for maintainability and testability, following 2025 best practices. See the backlog and docs for rationale.
- Error logging is centralized via `errorLogger`.
- Dead code, unused exports, and files are detected using [Knip](https://knip.dev/). Run `pnpm knip` to generate a report and keep the codebase lean.

## LLM/Agent Memory and Payload Optimization

- All context handoff and snapshot utilities are optimized for minimal, relevant payloads for LLM/agent workflows.
- Use `getContextChunk(size)` (from `contextSnapshotHelper.ts`) to retrieve a context snapshot chunked to a specific byte size, ensuring efficient memory usage and agent handoff.
- All APIs and CLI commands are designed for context-window efficiency and structured output.

## Modular Agent Architecture & Dynamic Tool Registry

- **BaseAgent**: The new `BaseAgent` class (in `agents/BaseAgent.ts`) provides a modular, extensible foundation for all agent logic. It supports dynamic tool discovery (via the plugin registry), structured output enforcement, and LLM/agent introspection.
- **Dynamic Tool Registry**: Agents can discover and invoke tools/plugins at runtime, enabling flexible, composable workflows. Tools are registered as plugins and introspected via `describe()`.
- **Extensibility**: Create specialized agents (e.g., DataCollectorAgent, WriterAgent) by extending `BaseAgent` and overriding `runTask`, `getContext`, or other methods.
- **LLM/Agent Introspection**: All agents and tools export a `describe()` method with schema metadata for discoverability and agent/LLM integration.

### Example Usage

```ts
import { BaseAgent } from 'nootropic';
const agent = new BaseAgent({ profile: { name: 'myAgent' } });
const tools = await agent.listTools();
const result = await agent.runTask({ id: 't1', description: 'Do something' });
```

See the [llm-integration.md](docs/llm-integration.md) for more details on agent introspection and tool registry integration.

## Event-Driven Agent Choreography (2024–2025 Refactor)

**Rationale:**

- The system is being refactored to use event-driven choreography for all agent interactions, following 2024–2025 best practices for scalable, resilient, and evolvable multi-agent systems.
- Each agent subscribes to and emits events (see `.nootropic-cache/event-schema.json`), enabling workflows to emerge from event exchanges rather than a central plan.
- This approach supports autonomy, parallelism, loose coupling, and easy extensibility.

**Key Patterns:**

- Agents are autonomous, stateless where possible, and react to events.
- All agent interfaces are defined by the events they emit and consume (documented in JSON Schema/OpenAPI).
- Adding new agents/services is as simple as subscribing to existing events or emitting new ones.
- All events include standard metadata: `eventId`, `type`, `version`, `source`, `agentId`, `timestamp`, `correlationId`, `topic`.
- Thin events (minimal payload, reference by ID) are preferred for evolvability.

**Backlog & Implementation Plan:**

- See `agentBacklog.json` for the canonical, research-backed execution plan and batch breakdown.
- All changes are documented and discoverable for future agents and developers.

**Research & References:**

- [Choreography Empowers AI Agents](https://hammadulhaq.medium.com/rethinking-workflows-how-choreography-empowers-ai-agents-to-collaborate-without-a-boss-132a5b129c03)
- [Event-Driven Multi-Agent Systems (Confluent)](https://www.confluent.io/blog/event-driven-multi-agent-systems/)
- [Architecting AI Agents with TypeScript](https://apeatling.com/articles/architecting-ai-agents-with-typescript/)

## Event-Driven Agent Runtime Loop (2024–2025 Best Practices)

Agents now operate as long-lived event-driven services:

- **Subscribe to relevant event topics** (e.g., `TaskAssigned`, `DraftFeedback`) at startup using `subscribeToTopic`.
- **Filter events by `agentId` or metadata** to ensure only relevant events are processed.
- **Implement idempotent event handler logic** to handle duplicates or out-of-order events safely.
- **Process events and emit results** as new events (`TaskStarted`, `DraftCreated`, `TaskCompleted`, `Error`, etc.), always including full metadata.
- **Use context/memory APIs** for intelligent, context-aware output and feedback-driven improvement.
- **Implement error/retry/circuitbreaker logic** for robust, fault-tolerant operation.
- **Emit observability/logging events** for all actions and errors.
- **Support event replay and hot-reload** for debugging, recovery, and extensibility.
- **Document all consumed/emitted events and runtime patterns** in each agent's `describe()` output.

**References:**

- [Confluent: Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/)
- [Encore: Type-Safe Event-Driven Applications in TypeScript](https://dev.to/encore/building-type-safe-event-driven-applications-in-typescript-using-pubsub-cron-jobs-and-postgresql-50jc)
- [Architecting AI Agents with TypeScript](https://apeatling.com/articles/architecting-ai-agents-with-typescript/)

This pattern is now the standard for all agents in nootropic. See the backlog and agent source files for implementation details and actionable TODOs.

## Event Schema Governance, Versioning & CI/CD Validation (2025 Best Practices)

- **Automated Validation:** All event schemas (`.nootropic-cache/event-schema.json`) and the canonical AsyncAPI spec (`docs/asyncapi.yaml`) are automatically validated in CI/CD and pre-commit using [ajv-cli](https://ajv.js.org/cli.html), [@sourcemeta/jsonschema](https://github.com/sourcemeta/jsonschema), and [@asyncapi/cli](https://www.asyncapi.com/docs/tools/cli/).
- **CI/CD Workflow:** See `.github/workflows/schema-validation.yml` for the automated validation pipeline. PRs and pushes are blocked if schemas or the AsyncAPI spec are invalid.
- **Pre-commit Enforcement:** See `.pre-commit-config.yaml` for local validation hooks. Contributors must validate schemas before commit.
- **Update Process:**
  1. Propose schema changes in a PR, updating `.nootropic-cache/event-schema.json` and/or `docs/asyncapi.yaml`.
  2. Run pre-commit hooks or push to trigger CI validation.
  3. Update relevant documentation and backlog items to reference the new/changed event(s).
  4. Reference external best practices and research links as needed.

## 🧪 Describe Registry & Code/Doc Sync Validation (CI/Dev)

To ensure all agents, adapters, plugins, and utilities export valid, up-to-date `describe()` metadata, and that all code and documentation remain in sync, run:

```sh
pnpm run validate-describe-registry
pnpm run docs:check-sync
```

- `validate-describe-registry` now dynamically and recursively checks that all modules export a valid `describe()` with required fields and no duplicates. All new modules in `agents/`, `adapters/`, `plugins/`, and all `utils/` subfolders are included automatically.
- `docs:check-sync` enforces code/doc parity between `.nootropic-cache/describe-registry.json` and `docs/docManifest.json`.
- If any described module is missing from docs, or any documented section is missing from code, this script will fail with actionable errors.
- Both are required steps in CI and onboarding to prevent drift and ensure robust agent/LLM introspection.

Add these as required steps in your CI pipeline to prevent drift and ensure all capabilities remain discoverable and machine-usable.

## 📝 Event Bus, Audit Log & Memory Lane

- All agent actions, context snapshots, and audit logs are now persisted in `.nootropic-cache/event-log.jsonl` (JSONL, schema-aligned with `event-schema.json`).
- Use the event bus API for structured, append-only event logging and observability:
  - `publishEvent(event)` — Append an event to the log and notify subscribers
  - `getEvents(filter?)` — Retrieve all events, optionally filtered by type/agentId
  - `subscribe(callback)` — Subscribe to in-memory event notifications (runtime only)
  - `logEvent(level, message, details?, agentId?, correlationId?)` — Log an audit event (info, warn, error, debug)
- CLI usage:

  ```sh
  pnpm tsx nootropic/memoryLaneHelper.ts append '{"type":"TaskCompleted", ... }'
  pnpm tsx nootropic/memoryLaneHelper.ts get
  pnpm tsx nootropic/memoryLaneHelper.ts tail 20
  ```

- The event log is append-only, replayable, and used for traceability, debugging, and compliance.
- Legacy `memoryLane.json` is still supported for backward compatibility.
- See [docs/memoryLaneGuide.md](./docs/memoryLaneGuide.md) for full details and API examples.

## 🧩 Pluggable Event Bus Backend Abstraction

- Each event bus backend (JSONL, Redis, Kafka, NATS, Dapr) is implemented as a class with a common interface (`EventBusBackend`).
- The backend is selected at runtime via the `EVENT_BUS_BACKEND` environment variable or config.
- Supported backends: Kafka, NATS, Dapr, Redis, and local JSONL (default).
- If the selected backend is unavailable or not implemented, the system automatically falls back to the local JSONL backend for reliability.
- All backends implement a unified interface and support CloudEvents, Zod validation, OTel tracing, and DLQ handling.
- **Troubleshooting:** If you see errors about missing or unavailable backends, check your environment variables and infra. Fallback to JSONL ensures no data loss, but distributed features will be unavailable until the backend is restored.
- See `memoryLaneHelper.ts` and `docs/orchestration.md` for details and advanced configuration.

## 🚀 Distributed Event Bus: NATS Integration (2025 Best Practices)

- Uses [nats.js](https://github.com/nats-io/nats.js) for high-performance, lightweight event streaming with JetStream support.
- All events are validated at runtime using Zod schemas for type safety and schema governance.
- OTel traces/metrics/logs are emitted for all event bus operations (see `otel.config.ts`).
- Supports orchestrator-worker, hierarchical, blackboard, and market-based multi-agent patterns.
- DLQ (Dead Letter Queue) is implemented for robust error handling and replay.
- All NATS publish/consume operations are traced with OpenTelemetry. DLQ events are validated and routed to a dedicated subject for replay and debugging.
- See `memoryLaneHelper.ts` for implementation details and advanced configuration.

### NATS Backend Configuration

Set the backend and connection details via environment variables:

```sh
export EVENT_BUS_BACKEND=nats
export NATS_URL=nats://localhost:4222
export NATS_STREAM=AIHelpersEvents
export NATS_SUBJECT=aihelpers.events
export NATS_DLQ_SUBJECT=aihelpers.events.DLQ
```

### Example Usage

```ts
import { publishToTopic, getEventsByTopic } from './memoryLaneHelper';
await publishToTopic({ type: 'TaskAssigned', agentId: 'A1', payload: { ... } }, 'tasks');
const events = await getEventsByTopic('tasks');
```

- All events are validated at runtime using Zod schemas.
- OTel context is propagated for distributed tracing.
- DLQ events are handled and can be replayed for robust error recovery.

See [docs/memoryLaneGuide.md](./docs/memoryLaneGuide.md) for full details and API examples.

## 🛠️ Recent Changes

- ESM import path fixes: All relative imports now use explicit .js extensions. NodeNext/ESM compatibility ensured. Path constants replaced with local logic in CLI/ad hoc scripts.
- Event bus, audit log, and distributed backend: Event bus and audit log system supports pluggable backends (local JSONL, Redis Streams), topic/correlationId, and advanced event-driven patterns. Docs and test plan updated. Fallback and config logic implemented.
- Linter, type, and test suite fixes: All linter, type, and test errors resolved for ESM/NodeNext, event bus, and orchestration changes. Test suite passes. See docs.

## 🚀 Roadmap

- Kafka/NATS/Dapr event bus backend abstraction and multi-agent orchestration patterns (market-based, blackboard, distributed)
- Automated structured output prompting and validation for LLM/agent workflows (YAML, index-based, embedded reasoning)
- Robust plugin/agent hot-reload and live introspection

See `docs/` and `agentBacklog.json` for full details.

## Pre-Commit & Husky Hooks for JSON Schema Validation

To ensure all contributors validate and lint JSON Schemas before code is committed, this project supports both Python (pre-commit) and Node.js (Husky) hooks:

- **Why:** Instant feedback, fewer CI/CD failures, and higher code quality.
- **How:**
  - **Python:**
    1. Install [pre-commit](https://pre-commit.com/): `pip install pre-commit`
    2. Add the provided `.pre-commit-config.yaml` to your repo.
    3. Run `pre-commit install` and `pre-commit run --all-files`.
  - **Node.js:**
    1. Install [Husky](https://typicode.github.io/husky/) and [ajv-cli](https://ajv.js.org/cli.html): `npm install --save-dev husky ajv-cli`
    2. Run `npx husky install` and add a pre-commit hook: `npx husky add .husky/pre-commit "npx ajv -d schemas/ -s schemas/schema.json"`
    3. Or add to `package.json` under `husky.hooks`.
- **See full details and sample configs in [`docs/orchestration.md`](./docs/orchestration.md#pre-commit--husky-hooks-for-json-schema-validation).**

## CI/CD Integration: JSON Schema & AsyncAPI Validation

- **ajv-cli:** Validates event schemas for correctness and strictness.
- **@sourcemeta/jsonschema:** Lints and checks schema style and best practices.
- **@asyncapi/cli:** Validates the AsyncAPI spec for structure, references, and compliance.
- **Workflow:** See `.github/workflows/schema-validation.yml` for details.
- **Pre-commit:** See `.pre-commit-config.yaml` for local enforcement.

## 📝 Onboarding & Contributing

All contributors should read the [CONTRIBUTING.md](./CONTRIBUTING.md) file before starting. It covers:

- Project setup and environment requirements (Node version, .nvmrc, editor config)
- Coding standards and best practices
- Pre-commit and CI validation (JSON Schema, linting, tests)
- Troubleshooting common onboarding issues
- How to run and validate all onboarding steps

**For linting migration and troubleshooting, see [docs/orchestration.md](./docs/orchestration.md#eslint-9-migration--linting-best-practices-2024).**

**See [CONTRIBUTING.md](./CONTRIBUTING.md) for full onboarding, TSDoc/TypeDoc/linting, and monorepo TypeScript config details. All utilities are now grouped by domain for maintainability and discoverability.**

## 🧹 TSDoc Linting

- **Run TSDoc linting:**
  - Use `pnpm run lint:tsdoc` to check all TypeScript files for TSDoc comment style and syntax issues.
  - This uses [eslint-plugin-tsdoc](https://tsdoc.org/pages/packages/eslint-plugin-tsdoc/) to enforce the [TSDoc](https://tsdoc.org/) standard.
- **Why:**
  - Ensures all exported APIs are documented in a consistent, machine-readable way for TypeDoc and LLM/agent workflows.
  - Prevents documentation drift and improves IDE integration.
- **Playground:**
  - Try out TSDoc comments in the [TSDoc Playground](https://tsdoc.org/playground/).
- **CI:**
  - TSDoc linting is enforced in CI; all PRs must pass TSDoc checks.
- **Best practices:**
  - See [TSDoc best practices](https://tsdoc.org/pages/tags/) for recommended tags and usage.

## TypeScript Linting & Type Safety Best Practices (2024–2025)

All contributors, agents, and plugins must follow these linting and type safety practices:

- Use **TypeScript-ESLint** with recommended configs for robust, community-aligned linting.
- Enable **strict mode** in `tsconfig.json` for maximum type safety.
- Use **safe auto-fixing** (`--fix-type=problem,suggestion`), review complex fixes manually.
- Prefer **type guards** and **discriminated unions** for event/plugin data.
- Use **runtime validation** (e.g., Zod) for plugin/event payloads where possible.
- Integrate linting into **CI** to enforce standards and prevent regressions.
- **Upgrade regularly** to benefit from new rules and features.

See [docs/orchestration.md](./docs/orchestration.md#typescript-linting--type-safety-best-practices-20242025) for actionable steps and references.

+**For ESLint 9+ migration and troubleshooting, see [docs/orchestration.md](./docs/orchestration.md#eslint-9-migration--linting-best-practices-2024).**

All new code must adhere to these standards for maintainability, safety, and future-proofing.

## 📖 Docs-First & AI/LLM-Friendly Documentation

nootropic follows a **docs-first engineering workflow**: every feature or change begins and ends with documentation. This ensures:

- Early alignment and collaborative feedback
- Reduced friction and fewer unknowns
- Clear, versioned, and structured docs for both humans and AI/LLM agents

**Key principles:**

- All code changes must be accompanied by updates to documentation and `describe()` outputs.
- Documentation is structured for both human and AI agents (purpose, usage, best practices, API, troubleshooting).
- The automated `describe()` registry and TypeDoc API docs are always up to date and validated in CI.
- See [Crafting READMEs for AI](https://benhouston3d.com/blog/crafting-readmes-for-ai) and [Docs-First Engineering Workflow](https://www.octopipe.com/blog/docs-first-engineering-workflow) for rationale and examples.

**How to contribute:**

- Start with user-facing docs and technical specs before writing code.
- Update the relevant `describe()` output and markdown docs with every change.
- Run `pnpm run validate-describe-registry` and `pnpm run docs:check-sync` to ensure docs and code are in sync.
- All PRs must pass describe registry, TSDoc, and lint checks in CI.

---

## 🏆 Best Practices (2025)

- **Strict TypeScript:** Always use `"strict": true` in `tsconfig.json`. Leverage advanced types, type guards, and runtime validation (e.g., Zod) for all event/plugin payloads.
- **Type-Safe Event-Driven Patterns:** Use discriminated unions for events, template literal types for event names, and type guards for runtime safety.
- **Automated Documentation:** All exports must have TSDoc comments. Use TypeDoc for API docs and the `describe()` pattern for runtime and static documentation. The describe registry is validated in CI.
- **Docs-First Engineering:** Begin all features/changes with documentation. All code changes must be accompanied by describe() and markdown doc updates.
- **AI/LLM-Friendly Docs:** Structure docs for both humans and AI agents (purpose, usage, best practices, API, troubleshooting, versioning).
- **CI Enforcement:** All PRs must pass lint, TSDoc, describe registry, and schema validation.

**References:**

- [TypeScript Best Practices 2025](https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052)
- [TypeScript Best Practices 2025: Elevate Your Code Quality](https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3)
- [Crafting READMEs for AI](https://benhouston3d.com/blog/crafting-readmes-for-ai)
- [Docs-First Engineering Workflow](https://www.octopipe.com/blog/docs-first-engineering-workflow)

---

## 🚀 2025 Best Practices for Event-Driven TypeScript Agent Frameworks

nootropic is aligned with the latest (2025) best practices for event-driven, plugin-based TypeScript agent systems:

- **OpenTelemetry Observability:** All agents and the framework are being instrumented with OpenTelemetry for standardized traces, metrics, and logs. See [OpenTelemetry AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/).
- **Automated describe() Registry:** Every agent, plugin, and tool must export a `describe()` function. These are aggregated into a type-safe registry, validated in CI, and used for LLM/agent introspection, docs, and onboarding. See [Architecting AI Agents with TypeScript](https://apeatling.com/articles/architecting-ai-agents-with-typescript/).
- **Documentation Automation:** Docs are generated and enforced automatically for all agents, tools, and plugins. `describe()` and TSDoc/TypeDoc outputs must always be in sync. See [VoltAgent Docs](https://voltagent.dev/docs/).
- **Composable, Event-Driven Orchestration:** Agent orchestration is being refactored to use composable, event-driven patterns, supporting multi-agent workflows, supervisor/sub-agent patterns, and robust memory/state management. See [VoltAgent Framework](https://www.marktechpost.com/2025/04/22/meet-voltagent-a-typescript-ai-framework-for-building-and-orchestrating-scalable-ai-agents/).

**Actionable Steps:**

- All contributors must follow these practices for every code and documentation change.
- See the backlog and orchestration docs for implementation status and next steps.

## 📊 OpenTelemetry Integration & GenAI Semantic Conventions

All agent, plugin, and event telemetry is instrumented using [OpenTelemetry](https://opentelemetry.io/) and follows the [GenAI/AI Agent semantic conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/genai/README.md). This ensures standardized, vendor-neutral observability for all agent lifecycles, plugin hooks, and event emissions.

- Baked-in instrumentation is opt-in and can be configured in `otel.config.ts`.
- All traces, metrics, and logs are compatible with OTel-based observability platforms.
- See [AI Agent Observability - Evolving Standards and Best Practices](https://opentelemetry.io/blog/2025/ai-agent-observability/) for more details.

## 📊 OpenTelemetry Observability for Agents (2025)

> **Note:** All plugin lifecycle, OTel, health, and error reporting now follow the latest 2025 OTel/GenAI SIG best practices. See `pluginRegistry.ts`, `plugins/examplePlugin.ts`, and the canonical entries in [agentBacklog.json](./agentBacklog.json#note-latest-best-practices) and [docs/ROADMAP.md](./docs/ROADMAP.md#plugin-health-checks--error-reporting) for up-to-date guidance.

nootropic now includes [OpenTelemetry](https://opentelemetry.io/) for standardized, vendor-neutral observability, following the latest GenAI/OTel semantic conventions for AI agents, LLMs, and event-driven systems.

- **Why OTel?**
  - Industry standard for tracing, metrics, and logs
  - AI/LLM/agent-specific conventions (GenAI SIG)
  - Vendor-neutral, works with any backend (Uptrace, Jaeger, etc.)
- **What is instrumented?**
  - Agent lifecycle (start, stop, errors)
  - Event handling (subscribe, emit, process)
  - Tool/LLM calls (inputs, outputs, latency, token usage)
  - Plugin hooks and orchestration steps
- **How to enable/disable?**
  - Telemetry is opt-in by default; enable via config/env (`AIHELPERS_OTEL=1`)
  - All OTel setup is centralized in a `telemetry.ts` module (in progress)
  - Users can extend/override OTel setup for custom exporters or advanced use
- **Privacy & Data Sanitization:**
  - Sensitive data (e.g., prompts) is sanitized or hashed before export
  - Follows OTel/GenAI best practices for privacy and compliance
- **CI Validation:**
  - Telemetry hooks are tested and validated in CI
  - All contributors must ensure OTel spans/metrics are up to date for new features
- **References:**
  - [OpenTelemetry AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/)
  - [Uptrace: OTel for AI Systems](https://uptrace.dev/blog/opentelemetry-ai-systems)
  - [VoltAgent Observability](https://voltagent.dev/docs/)

See `CONTRIBUTING.md` and `docs/orchestration.md` for setup, extension, and troubleshooting details.

## 🛡️ CI/CD: describe() Registry, Code/Doc Sync, and Monorepo Best Practices (2025)

- **describe() Registry Aggregation & Validation:** CI runs `pnpm run validate-describe-registry` to aggregate and validate all describe() outputs from agents, plugins, and tools. PRs fail if the registry is out of sync or missing required fields.
- **Code/Doc Sync Check:** CI runs `pnpm run docs:check-sync` to ensure all code changes are reflected in documentation and describe() outputs. PRs fail if docs or describe() are out of sync.
- **Test Enforcement:** CI runs `pnpm test` to ensure all tests pass before merge. PRs fail if any test fails.
- **Monorepo CI Best Practices:** Path filters, dependency caching, modular jobs, and fail-fast are used to keep CI fast and maintainable. See `.github/workflows/lint-and-type.yml` for implementation.

**References:**

- [Monorepo with GitHub Actions](https://graphite.dev/guides/monorepo-with-github-actions)
- [GitHub Community: Monorepo CI/CD Best Practices](https://github.com/orgs/community/discussions/158727)
- [Architecting AI Agents with TypeScript](https://apeatling.com/articles/architecting-ai-agents-with-typescript/)
- [Agentic Coding Best Practices](https://benhouston3d.com/blog/agentic-coding-best-practices)

## 🛡️ Runtime Validation & Zod Schemas (2025 Best Practices)

All agent, plugin, and event contracts are validated at runtime using [Zod](https://zod.dev/). Each contract (profile, task, context, result, event) has a canonical Zod schema, which is exported and referenced in the module's `describe()` output. This ensures type safety, robust error handling, and AI/LLM-friendly introspection.

- All agent/plugin/event inputs and outputs are validated at runtime using Zod.
- Schemas are exported from `types/AgentOrchestrationEngine.ts` and used throughout the codebase.
- All event payloads are strictly typed as `Record<string, unknown>`.
- The system is compatible with the [Standard Schema](https://standardschema.dev/) spec, allowing future interop with other validation libraries (Valibot, ArkType, etc).
- See [9 Best Practices for Using Zod in 2025](https://javascript.plainenglish.io/9-best-practices-for-using-zod-in-2025-31ee7418062e) for rationale.

**Actionable Steps:**

- All contributors must validate all agent/plugin/event data at runtime using the provided schemas.
- All describe() outputs must reference the canonical Zod schema.
- CI enforces schema presence and code/doc sync.

## 🗂️ Event Schema Governance & Runtime Validation

All event types are defined as canonical Zod schemas in `types/AgentOrchestrationEngine.ts`. The `AgentEventSchemas` map provides a lookup for runtime validation, and the `validateAgentEvent(event)` utility validates any event at runtime. This ensures all events are type-safe, versioned, and centrally governed, following 2025 best practices and OTel GenAI conventions.

- All event emissions and plugin hooks must validate events at runtime using `validateAgentEvent`.
- Event schemas are versioned and centrally governed for compatibility and discoverability.
- See [GenAI/AI Agent semantic conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/genai/README.md) and [OpenTelemetry AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/).

## 🧩 Plugin/Tool Safety: Zod Validation, Type Guards & Hot-Reload

All plugins and tools must validate their inputs and outputs using Zod schemas. Type guards must be used at all plugin boundaries, and plugins must reference their schemas in `describe()`. The plugin registry enforces this pattern and will skip plugins that do not conform. See `plugins/examplePlugin.ts` for a reference implementation.

- Use Zod schemas for all plugin input/output validation (see `run` in examplePlugin).
- Reference schemas in `describe()` for discoverability and LLM/agent introspection.
- The plugin registry uses type guards and Zod checks to enforce safety at load time.
- Plugins/tools that do not conform will be skipped (see debug logs).
- **Dynamic event subscription:** Plugins must use `appContext.subscribeToEvent` (or `pluginManager.subscribe`) with their name for tracking. All event subscriptions are automatically cleaned up on unload/hot-reload, preventing stale handlers and enabling robust hot-reload. See the updated example plugin and PluginManager for details.

## 🚀 Distributed Event Bus: Kafka Integration (2025 Best Practices)

All distributed agent, plugin, and event communication is handled via the new `KafkaEventBus` abstraction (`adapters/KafkaEventBus.ts`).

- Uses [KafkaJS](https://kafka.js.org/) for robust, scalable event streaming.
- All events are validated at runtime using Zod schemas for type safety and schema governance.
- OTel traces/metrics/logs are emitted for all event bus operations (see `otel.config.ts`).
- Enables orchestrator-worker, hierarchical, blackboard, and market-based multi-agent patterns (see [Confluent](https://www.confluent.io/blog/event-driven-multi-agent-systems/)).
- Plugins can hot-reload and dynamically subscribe/unsubscribe to topics at runtime.

See also: [Kai Waehner on Agentic AI](https://www.kai-waehner.de/blog/2025/04/14/how-apache-kafka-and-flink-power-event-driven-agentic-ai-in-real-time/), [Medium: Multi-Agent Orchestration](https://medium.com/@seanfalconer/how-to-build-a-multi-agent-orchestrator-using-flink-and-kafka-4ee079351161)

## 📑 Event Schema Registry & AsyncAPI (2025 Best Practices)

All event-driven APIs, channels, and event payloads are governed by a canonical [AsyncAPI](https://www.asyncapi.com/) spec (`docs/asyncapi.yaml`).

- All event schemas are referenced from `.nootropic-cache/event-schema.json` and versioned.
- The AsyncAPI spec is validated and checked for compatibility in CI/CD (see [ajv-cli](https://ajv.js.org/cli.html)).
- Docs are auto-generated and published for discoverability and machine-usage.
- Prevents drift between code, schemas, and docs.
- See [AsyncAPI as Infra Config](https://eviltux.com/2025/03/27/beyond-docs-using-asyncapi-as-a-config-for-infrastructure/) and [AWS EventBridge Schema Registry Best Practices](https://community.aws/content/2dhVUFPH16jZbhZfUB73aRVJ5uD/eventbridge-schema-registry-best-practices?lang=en).

## Kafka Event Bus Observability & OpenTelemetry (2025)

- **Kafka OTel Instrumentation:** All Kafka publish/consume operations are now traced with OpenTelemetry. Trace context is propagated in message headers (W3C Trace Context), and trace/span IDs are available for correlation in logs and events.
- **GenAI/OTel Conventions:** All spans and metrics follow GenAI/AI Agent semantic conventions for observability, debugging, and compliance.
- **Planned:** Advanced Kafka metrics (throughput, lag, processing time), sampling strategies, and automated context propagation testing are next steps. See agentBacklog.json for details.

## Advanced Kafka Metrics & Sampling (2025)

- **Metrics Scaffolded:** KafkaEventBus now includes OTel metrics scaffolding for producer throughput, consumer lag (offset/time), and message processing time. Sampling config is present for trace and metric collection.
- **Available Metrics:**
  - Producer throughput (messages/sec per topic)
  - Consumer lag (offset and time lag per topic/partition/group)
  - Message processing time (histogram)
- **Sampling:** Configurable via environment variables. Default: 100% metrics, 10% traces.
- **Next Steps:** Expose metrics to OTel Collector/Prometheus for full observability. See agentBacklog.json for actionable items.
- **References:** See orchestration.md for best practices and research links for AI/LLM agent observability.

## Kafka Context Propagation Testing

- **Canonical Test:** See `tests/adapter.kafka.context-propagation.test.ts` for the standard integration test verifying context propagation in KafkaEventBus.
- **What it covers:**
  - Trace context (traceId, spanId) injection, propagation, and extraction across Kafka producer/consumer boundaries.
  - Handles missing/corrupted context gracefully.
  - Skips if Kafka is not available (for CI portability).
- **Usage:** Use this test as the reference for all distributed tracing and context propagation tests. See `docs/orchestration.md` and `CONTRIBUTING.md` for best practices and extension guidance.

## CI: Kafka Context Propagation Test

- **CI Job:** The `context-propagation-test` job in `.github/workflows/schema-validation.yml` runs the canonical KafkaEventBus context propagation test (`tests/adapter.kafka.context-propagation.test.ts`).
- **Enforcement:** CI will fail if traceId/spanId continuity is not preserved or if context is missing/corrupted in the test output.
- **Best Practices:** This enforces OpenTelemetry and AI agent observability best practices (2025) for distributed tracing and context propagation.
- **Troubleshooting:**
  - If the job fails, check that Kafka is available in the CI environment and that the test can connect to the broker.
  - Ensure the test output includes valid traceId/spanId values for all events.
  - Review instrumentation and propagator configuration if context is missing or corrupted.
- **References:** See `tests/adapter.kafka.context-propagation.test.ts` and OpenTelemetry docs for more details.

## Kafka Trace Context Propagation: W3C & B3 Interop (2025)

- **Propagator Support:** KafkaEventBus supports both [W3C Trace Context](https://www.w3.org/TR/trace-context/) and [B3 propagation](https://github.com/openzipkin/b3-propagation) for distributed tracing.
- **Runtime Selection:** Use the `KAFKA_TRACE_PROPAGATOR` environment variable or config to select the propagator (`w3c` or `b3`).
- **Interop & Custom Metadata:** Both protocols are interoperable with external tracing systems. Custom metadata (e.g., `userId`, `tenantId`) can be propagated in the trace context.
- **Canonical Tests:** See `tests/adapter.kafka.context-propagation.test.ts` for interop and custom metadata propagation tests.
- **Best Practices:** See [OpenTelemetry](https://opentelemetry.io/), [Confluent](https://www.confluent.io/blog/event-driven-multi-agent-systems/), and [Last9](https://last9.io/blog/kafka-with-opentelemetry/) for research-backed guidance.

## 🛡️ Dead Letter Queue (DLQ) Event Schema & Replay (2025 Best Practices)

- **Purpose:** The DLQ event schema provides a canonical, type-safe way to capture and route events that fail processing (after retries) to a dedicated DLQ topic. This enables robust error handling, observability, and replay in distributed agentic workflows.
- **Schema Location:** See `DLQEventSchema` in `types/AgentOrchestrationEngine.ts`.
- **Fields:**
  - `type`: 'DLQ'
  - `agentId`, `timestamp`: Standard event metadata
  - `originalEvent`: The original event (as a record) that failed processing
  - `error`: { errorType, message, stack }
  - `metadata`: { topic, partition, offset, originalTimestamp, traceContext }
  - `traceId`, `spanId`, `parentSpanId`: OpenTelemetry trace context
  - `version`: Schema version
- **Best Practices:**
  - Only non-retryable errors are routed to DLQ (after max retries)
  - Always include the full original event and error metadata for replay/debugging
  - DLQ events are validated at runtime using Zod and in CI/CD
  - DLQ topics should be monitored and have clear business processes for reprocessing or alerting
  - See [Confluent DLQ Guide](https://www.confluent.io/learn/kafka-dead-letter-queue/) and [Kai Waehner DLQ Best Practices](https://www.kai-waehner.de/blog/2022/05/30/error-handling-via-dead-letter-queue-in-apache-kafka/)
- **Replay:**
  - [x] Replay utility (CLI/script) implemented: re-publishes DLQ events to main topic, preserving trace context. Robust, Zod-validated, OTel-instrumented, and ready for use. See scripts/dlqReplay.ts.
  - [ ] Tests and CI validation for DLQ/replay flows and schemas in progress.
- **Status:**
  - [x] DLQ event schema and type implemented (see backlog)
  - [x] DLQ logic implemented in KafkaEventBus: failed events are produced to a dedicated DLQ topic with Zod validation and OTel tracing. See adapters/KafkaEventBus.ts

## Describe Registry & Code/Doc Sync Automation (2025 Best Practices)

To ensure robust, future-proof documentation and agent/LLM introspection, nootropic enforces a strict code/doc sync workflow:

- **Describe Registry:** All modules, agents, and plugins must export a complete `describe()` (name, description, usage, schemas, references).
- **Doc Manifest:** All described modules/capabilities must be present in `docs/docManifest.json`.
- **Automation:**
  - Run `pnpm run validate-describe-registry` to check that all modules/plugins export a valid `describe()` with required fields and no duplicates.
  - Run `pnpm run docs:check-sync` to enforce code/doc parity between `.nootropic-cache/describe-registry.json` and `docs/docManifest.json`.
  - CI/CD will block PRs if any described module is missing from docs, or any documented section is missing from code.
- **Onboarding Checklist:**
  - See the new onboarding checklist in [CONTRIBUTING.md](./CONTRIBUTING.md#onboarding-checklist-doccode-sync--canonical-sources-2025-best-practices) for step-by-step instructions and troubleshooting. All new modules must export a `describe()` and will be automatically included in the registry.
- **Troubleshooting:**
  - If code/doc sync fails, update both the `describe()` output and `docs/docManifest.json` as needed. See error output for missing or duplicate entries.
- **Canonical Sources:**
  - `.nootropic-cache/describe-registry.json` and `docs/docManifest.json` are the canonical sources for LLM/agent introspection and documentation automation.
- **Best Practices:**
  - All new features/exports must include a complete `describe()` and be added to the doc manifest.
  - Contributors must run the validation scripts locally before PR.
  - See [CONTRIBUTING.md](./CONTRIBUTING.md) for onboarding and workflow details.
- **References:**
  - [2025 TypeScript Monorepo Best Practices](https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052)
  - [TypeScript Best Practices 2025](https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3)

## 2025 Best Practices: Event-Driven Orchestration, Plugins, and CI/CD

nootropic follows the latest 2025 research-backed best practices for scalable, safe, and maintainable TypeScript agent frameworks:

- **Strict Mode & Type Guard Enforcement:**
  - All code uses strict mode, strictNullChecks, and type guards (with satisfies, unknown, and Zod) for runtime validation. See [Type Guards in TypeScript 2025](https://dev.to/paulthedev/type-guards-in-typescript-2025-next-level-type-safety-for-ai-era-developers-6me) and [Best Practices for Using TypeScript in 2025](https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052).
- **Modular Monorepo & Project References:**
  - Project references, shared config, and barrel files are used for scalable builds. See [TypeScript Best Practices 2025](https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3).
- **Plugin Hot-Reload & Dynamic Event Subscription:**
  - PluginManager supports runtime load/unload, event subscription tracking, and OTel tracing. See [Turbocharge Dev Velocity](https://dev.to/codanyks/turbocharge-dev-velocity-modern-tooling-dx-in-the-nodejs-ecosystem-30fl).
- **Distributed Event Bus Abstraction:**
  - Event bus backend supports Kafka/NATS/Dapr, event versioning, context propagation, DLQ/replay, and advanced OTel metrics. See [Complete Guide to Setting Up React with TypeScript and Parcel (2025)](https://medium.com/@robinviktorsson/complete-guide-to-setting-up-react-with-typescript-and-parcel-2025-bfb43ad69064).
- **Automated Doc/Code Sync & Describe Registry:**
  - Doc/code sync, TypeDoc integration, and describe registry enforcement are automated in CI/CD. See backlog for actionable steps.
- **Security & Secrets Management:**
  - Vault/ArgoCD/Kaniko are integrated for secure CI/CD and secrets management. See [scripts/vaultIntegrationGuide.md](./scripts/vaultIntegrationGuide.md), [scripts/kanikoBuildExample.md](./scripts/kanikoBuildExample.md), and [scripts/argoCdIntegrationGuide.md](./scripts/argoCdIntegrationGuide.md). Discoverable via the describe registry and /capabilities endpoint.

**All contributors and automation must follow these practices for every code, plugin, and documentation change. See `agentBacklog.json` for actionable steps and priorities.**

## Backlog, Roadmap, and Automation (2025 Best Practices)

- **Backlog <-> GitHub Issues Sync:**
  - All actionable backlog items in `agentBacklog.json` are synchronized with GitHub Issues using a CLI script (`scripts/backlogSync.ts`).
  - A CI job runs the script on push/PR and on a schedule to keep Issues and backlog in sync.
  - Status and labels are mirrored between Issues and backlog. See [IssueOps](https://github.blog/engineering/issueops-automate-ci-cd-and-more-with-github-issues-and-actions/).
- **Automated Roadmap Generation:**
  - The public roadmap is generated from `agentBacklog.json` using a CLI script (`scripts/generateRoadmap.ts`) and published to `docs/ROADMAP.md`.
  - A CI job regenerates the roadmap on backlog changes.
- **CI/CD Workflow Optimization:**
  - CI/CD uses path filters, matrix builds, and dependency caching for monorepo efficiency.
  - Scheduled jobs handle dependency updates (Renovate/Dependabot) and backlog/issue sync.
  - See [Monorepo CI/CD Best Practices](https://github.com/orgs/community/discussions/158727), [TypeScript Monorepo Guide](https://dev.to/mxro/the-ultimate-guide-to-typescript-monorepos-5ap7).
- **Doc/Code Sync & API/Schema Validation Badges:**
  - README includes badges for doc/code sync, API docs, and schema validation status.
  - Badge meaning and troubleshooting are documented in README.md.
- **Troubleshooting & Extension:**
  - All automation scripts and workflows are documented in this file and CONTRIBUTING.md.
  - Contributors can extend automation by adding new scripts or CI jobs as needed.

See `agentBacklog.json` for actionable steps and priorities. All contributors must follow these automation practices for backlog, roadmap, and CI/CD management.

## IssueOps-Driven Automation & Project Management (2025 Best Practices)

- **Backlog & IssueOps Automation:**
  - All actionable backlog items in `agentBacklog.json` are synchronized with GitHub Issues using IssueOps-style GitHub Actions workflows.
  - Workflows use labels, comments, and state-machine triggers to automate triage, status, and project management.
  - See [IssueOps: Automate CI/CD (and more!) with GitHub Issues and Actions](https://github.blog/engineering/issueops-automate-ci-cd-and-more-with-github-issues-and-actions/).

- **Automated Roadmap Generation:**
  - Roadmap is generated from the backlog using a CLI script and CI job, published to `docs/ROADMAP.md` (with state diagrams).

- **Monorepo CI/CD Optimization:**
  - CI/CD uses path filters, matrix builds, and dependency caching for efficient monorepo workflows.

- **Doc/Code Sync & API/Schema Validation Badges:**
  - README includes badges for doc/code sync and API/schema validation status.

- **Troubleshooting & Extension Guidance:**
  - Each automation step is documented in this file and CONTRIBUTING.md, with extension and troubleshooting tips.

- **Reference:**
  - See the backlog for actionable items and research links.

### Backlog <-> GitHub Issues Sync CLI

- Use `pnpm tsx scripts/backlogSync.ts` to synchronize actionable backlog items (planned, inProgress) in `agentBacklog.json` with GitHub Issues.
- Required env vars: `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`.
- Supports `--dry-run` to preview actions without making changes.
- Idempotent: only creates/updates/closes issues as needed, using the `nootropic-backlog` label.
- **Status labels (`planned`, `in progress`, `complete`) are now synced for richer filtering and automation.**
- Used in CI/CD to automate project management and ensure visibility of all actionable work.
- Follows [IssueOps](https://github.blog/engineering/issueops-automate-ci-cd-and-more-with-github-issues-and-actions/) and 2025 monorepo best practices.
- **Troubleshooting:**
  - If issues are missing or labels are out of sync, run the script locally with `--dry-run` to preview changes, or check the logs in the [backlog-sync.yml](.github/workflows/backlog-sync.yml) workflow.
  - Ensure your env vars are set correctly and you have repo/issue permissions.

> **Note:** The `scripts/backlogSync.ts` script requires the following environment variables to run:
>
> - `GITHUB_TOKEN`: A GitHub personal access token with repo/issue permissions
> - `GITHUB_OWNER`: The GitHub organization or user name
> - `GITHUB_REPO`: The repository name
> Ensure these are set in your environment or CI config before running the script.

### Automated Roadmap Generation CLI

- Use `pnpm tsx scripts/generateRoadmap.ts` to generate a Markdown roadmap from `agentBacklog.json`.
- Outputs to `docs/ROADMAP.md` (auto-generated, do not edit manually).
- Lists all planned, in-progress, and completed features, grouped by status and priority, with actionable steps and references.
- Used in CI/CD to keep the public roadmap up to date and visible.
- Follows 2025 best practices for roadmap automation and transparency.

File/directory existence checks and JSON file operations are now handled by utilities in `utils.ts`, used throughout the codebase (see `contextSnapshotHelper.ts`, `contextMutationEngine.ts`). This improves maintainability and DRYness. See the backlog for rationale.

## Automated Dead Code Detection & Removal (2025 Best Practices)

- **knip** is used to detect unused files, exports, and dependencies across the codebase. Run `pnpm knip` to generate a report.
- **tsr** is used for automated removal of dead code (unused files, exports, imports). Run `npx tsr --write '.*.ts$'` to clean up the codebase. Review changes before merging.
- Both tools are integrated into the maintenance workflow and can be added to CI for ongoing hygiene.
- See the backlog for actionable items and docs for details.

## TODO/FIXME Comment Policy (2025)

- All TODO/FIXME comments must be actionable, attributed, and resolved promptly.
- Use `TODO(owner):` or `FIXME(owner):` for traceability and context.
- Generic or stale TODOs are not allowed.
- See `contextMutationEngine.ts` and `contextSnapshotHelper.ts` for implementation and enforcement details.

All exports are now explicit, named, and follow 2025 ESM/TypeScript best practices. The canonical entrypoint is index.ts, and only public API exports are exposed. See the backlog for rationale and details.

All adapters and event bus backends now export a describe() function per 2025 best practices. This enables full registry automation, LLM/agent introspection, and CI enforcement. See adapters/* and the backlog for details.

## Distributed Event Bus (Registry-Driven)

nootropic now uses a **registry-driven, Capability-compliant event bus architecture**. All distributed event bus adapters (Kafka, NATS, Dapr) are auto-registered in the central registry and are discoverable by LLMs/agents via the `/capabilities` endpoint. Legacy local stubs have been removed. All event bus operations (publish, subscribe, etc.) use the unified interface from the registered adapters.

- **Adapters:** Kafka, NATS, Dapr (all Capability-compliant)
- **Registry:** All adapters are auto-registered and discoverable
- **Endpoint:** `/capabilities` returns all registered event bus backends
- **Usage:**

  ```ts
  import { publishEvent, subscribeToTopic } from 'nootropic/memoryLaneHelper';
  // Select backend via EVENT_BUS_BACKEND env var: 'kafka', 'nats', 'dapr', or fallback to local JSONL
  await publishEvent({ type: 'TaskAssigned', agentId: 'agent1', timestamp: new Date().toISOString(), payload: { task: 'demo' } });
  subscribeToTopic('TaskAssigned', event => { /* handle event */ });
  ```

- **Docs:** See /capabilities endpoint and registry for all available adapters.

## Quality Tools & Features

| Tool         | Features                                                      | Env Vars / Config         | Docs/Refs                  |
|--------------|---------------------------------------------------------------|---------------------------|----------------------------|
| ESLint       | Linting, strict TS, ESM, autofix                              | AIHELPERS_LINT            | quality/selfcheck.ts       |
| Markdownlint | Docs linting, code block checks                               | AIHELPERS_MARKDOWNLINT    | quality/selfcheck.ts       |
| Security     | npm audit, high/critical vuln fail                            | AIHELPERS_SECURITY        | quality/selfcheck.ts       |
| SonarQube    | Static analysis, code smells, vulnerabilities, Web API, describe(), LLM/agent APIs (list, explain, suggest, auto-fix) | AIHELPERS_SONARQUBE_API_URL, AIHELPERS_SONARQUBE_TOKEN | quality/sonarqubeApi.ts, docs/quality.md |
| Semgrep OSS  | OSS static analysis, custom rules, JSON output, describe(), LLM/agent APIs (list, explain, suggest, auto-fix, production-ready), feedback/memories system (shared schema) | AIHELPERS_SEMGREP         | quality/selfcheck.ts, docs/quality.md |
| Research     | LLM/agent best practices, dependency checks                   | AIHELPERS_RESEARCH        | quality/selfcheck.ts       |
| DocTest      | Markdown code block test, docs/code sync                      | AIHELPERS_DOCTEST         | quality/selfcheck.ts       |
| AI Review    | LLM/agent code review, best practices, docs sync              | AIHELPERS_AIREVIEW        | quality/selfcheck.ts       |

- Semgrep OSS now exposes LLM/agent APIs for listing, explaining, suggesting, production-ready auto-fixing of findings (see autoFixSemgrepFinding). SonarQube integration is planned. See docs/quality.md and quality/selfcheck.ts for details.

- Semgrep OSS and SonarQube now use a shared feedback/memories schema for cross-tool, organization-wide feedback, deduplication, and advanced LLM-powered triage. See docs/quality.md and types/SastFeedbackMemory.ts for details and best practices.

## Quality & SAST Feedback

- **Cross-tool/Org-wide SAST Feedback:**
  - Canonical merged view in `.nootropic-cache/sast-memories.json`
  - Pluggable remote storage and sync (S3, REST API, etc.)
  - Deterministic and LLM-powered deduplication
  - OTel tracing for all remote operations
  - **KMS/Vault integration:** Envelope encryption, key rotation, and audit logging for all remote/org-wide SAST feedback ([docs](docs/quality.md#kmsvault-integration-for-sast-feedback-encryption-2025)). AWS KMS implemented; GCP, Azure, Vault next. See docs/quality.md for usage and compliance.
  - **OIDC/JWT Security:** All remote APIs require OIDC/JWT authentication and validation ([docs](docs/quality.md#security-oidcjwt-for-remote-sast-feedback-apis-2025))

## OpenTelemetry Integration (2025 Best Practices)

The KafkaEventBus now uses a global OpenTelemetry meter and tracer from `telemetry.ts`, following 2025 best practices for distributed tracing and metrics. All event bus metrics and traces are now consistent and centralized, enabling robust observability, context propagation, and integration with modern observability platforms (e.g., Grafana, Jaeger, Prometheus). See `telemetry.ts` and `adapters/KafkaEventBus.ts` for implementation details.

### Kafka Consumer Lag Metrics (2025 Best Practices)

KafkaEventBus now reports consumer lag (offset lag) as an OTel ObservableGauge metric, following 2025 best practices. This enables real-time monitoring of how far consumers are behind the latest message in each topic/partition/group. Metrics are exported via OTel and can be visualized in Prometheus/Grafana. Time lag and error rate metrics are planned next. See `docs/orchestration.md` for details and best practices.

## 🧩 Declarative, Composable Workflows (2025 Best Practices)

nootropic now supports declarative, composable agent workflows defined in YAML or JSON. Workflows are validated using a canonical JSON Schema and Zod schema (see `orchestration/workflowSchema.ts`), and can be loaded, composed, and executed using the workflow composer (`orchestration/composeWorkflows.ts`).

- **How it works:**
  - Define workflows as YAML/JSON (see `orchestration/examples/simple-workflow.yaml`)
  - Validate and compose workflows using the describe registry (all agents/tools must be registered)
  - Steps can depend on each other, and are executed in dependency order
  - All workflows, agents, and tools are self-describing and discoverable
- **References:**
  - `orchestration/workflowSchema.ts` (schema)
  - `orchestration/composeWorkflows.ts` (loader/runner)
  - `orchestration/examples/simple-workflow.yaml` (example)

This approach is aligned with 2025 best practices for agentic systems, supporting event-driven choreography, composability, and robust validation. See the backlog and docs for implementation details.

## 📚 Auto-Generated Capability Documentation

Each capability (agent, plugin, tool, etc.) now has a dedicated Markdown doc in `docs/capabilities/`, auto-generated from the describe registry. These docs include name, description, usage, methods/functions, schemas, best practices, and references. Always in sync with code. See `scripts/generateDocsFromDescribe.ts` for details.

- **How it works:**
  - Run `pnpm tsx scripts/generateDocsFromDescribe.ts` to regenerate all capability docs.
  - Docs are updated automatically in CI/CD and must be kept in sync with code and describe() outputs.
  - See `docs/capabilities/` for the latest per-capability documentation.

## 📚 Documentation Automation & Canonical Sources

nootropic now uses a fully automated, docs-first workflow for all capabilities (agents, plugins, adapters, tools):

- **Per-Capability Docs:** Every capability has a dedicated Markdown doc in `docs/capabilities/`, auto-generated from the describe registry. These docs include name, description, usage, methods/functions, schemas, best practices, and references. Always in sync with code.
- **OpenAPI & AsyncAPI Specs:** Machine- and human-friendly API specs are auto-generated from the describe registry and available in `.nootropic-cache/openapi-spec.yaml` and `.nootropic-cache/asyncapi-spec.yaml`.
- **Describe Registry:** The canonical source for all features, APIs, and documentation is `.nootropic-cache/describe-registry.json`, aggregated from all describe() exports. This is validated in CI/CD and used for all doc/spec generation.
- **Feature Table:** The "Features at a Glance" table is auto-generated from the describe registry and always up to date.

### How to Use the Docs

- **For LLMs/Agents:**
  - Use the `/capabilities` HTTP endpoint or `.nootropic-cache/describe-registry.json` for machine-readable discovery.
  - For detailed docs, see `docs/capabilities/` (one Markdown file per capability).
  - For API integration, use the OpenAPI/AsyncAPI specs.
- **For Contributors:**
  - Update describe() outputs and run `pnpm tsx scripts/generateDocsFromDescribe.ts` after any change.
  - Run `pnpm tsx scripts/generateOpenApiSpec.ts` and `pnpm tsx scripts/generateAsyncApiSpec.ts` to update specs.
  - All doc/spec generation is enforced in CI/CD. PRs will fail if docs and code are out of sync.

### Troubleshooting Doc/Code Sync

- If you see errors about missing or outdated docs/specs:
  1. Ensure all describe() outputs are complete and up to date.
  2. Run the doc/spec generation scripts.
  3. Commit the updated docs/capabilities/ and .nootropic-cache/ files.
  4. See CONTRIBUTING.md for more troubleshooting tips.

## 🛡️ Quality & Security Automation

- **Secret Scanning in CI/CD:** All PRs and pushes are automatically scanned for secrets using TruffleHog or Gitleaks. If any findings are detected, the build fails and must be remediated before merging. The full scan report is uploaded as a workflow artifact. See [docs/secretScanGuide.md](./docs/secretScanGuide.md) for details and troubleshooting.
- **Automated Compliance Reporting:** Compliance reports (Markdown/JSON, LLM/human-friendly) are auto-generated in `.nootropic-cache/` by [scripts/generateComplianceReport.ts](./scripts/generateComplianceReport.ts), aggregating secret scan results and audit logs for CI/CD and human/LLM review.
- **Vault, Kaniko, and ArgoCD Managers:** All three are now scaffolded, registry-compliant, and ready for implementation. See [scripts/vaultIntegrationGuide.md](./scripts/vaultIntegrationGuide.md), [scripts/kanikoBuildExample.md](./scripts/kanikoBuildExample.md), and [scripts/argoCdIntegrationGuide.md](./scripts/argoCdIntegrationGuide.md). Discoverable via the describe registry and /capabilities endpoint.

## 🔍 Semantic Search & Embedding Models

- **Comprehensive Indexing:** The semantic index now includes all code, Markdown, and JSON files, all outputs from the describe registry (`.nootropic-cache/describe-registry.json`), all per-capability docs in `docs/capabilities/`, and all LLM/AI docs in `.nootropic-cache/llm-docs.json`. Each chunk is tagged with `source`, `capability`, and `section` metadata for robust LLM/agent workflows.
- **Pluggable Embedding Provider:** Semantic search supports HuggingFace (Transformers.js, local ONNX), Ollama (local REST API), Petals (distributed HTTP), LM Studio (OpenAI-compatible REST API), and custom/generic HTTP providers via the `EmbeddingProvider` interface in `capabilities/EmbeddingProvider.ts`.
- **Filtering:** You can filter semantic search results by `source` (e.g., only `capability-doc` or `describe-registry`) or by `capability` name for targeted LLM/agent workflows.
- **Best Practices:** Always keep describe outputs and per-capability docs up to date. Use the `source` and `capability` metadata for targeted semantic search. Document all new capabilities and ensure registry/describe compliance.
- **Default Provider:** A hash-based stub is used for offline/dev mode. To use HuggingFace, Ollama, Petals, LM Studio, or HTTP, set `EMBEDDING_PROVIDER` to the provider key and configure the model via the relevant env vars.

## 🕰️ Event Log Replay & Rollback (Local JSONL)

- **Replay:** Replay events from `.nootropic-cache/event-log.jsonl` to restore system state, debug workflows, or simulate past actions.
- **Rollback/Undo:** Roll back to a previous state by replaying events up to a checkpoint (by index, timestamp, or eventId).
- **Filtering:** Replay/rollback can be filtered by event type, agentId, correlationId, or topic for targeted restoration.
- **Dry-run:** All replay/rollback operations support dry-run mode to preview changes without applying them.
- **OTel Instrumentation:** All actions emit OpenTelemetry spans for observability and traceability.
- **CLI/API:** See [docs/memoryLaneGuide.md](./docs/memoryLaneGuide.md#checkpoint-based-rollback--restoration-local-jsonl) for usage examples and advanced options.

## Type Safety and Event Payload Validation (2025+ Best Practices)

- All agent, adapter, and plugin event payloads and task inputs **must** use `Record<string, unknown>` and type guards instead of `any` for extraction and validation.
- All event payloads and task inputs **must** be validated at runtime using Zod or an equivalent schema validator before use.
- This is a strict requirement for all new and existing code. PRs that introduce or retain `any` in event payload extraction will be rejected.
- See `CONTRIBUTING.md` and `onboarding-checklist.md` for details and enforcement policy.
- For migration of legacy code, see the migration notes in CONTRIBUTING.md.

## 🚦 Automated TODO/FIXME/Stub Extraction and Backlog Sync

- All TODO, FIXME, and PLANNED comments in the codebase are automatically extracted and synchronized with the canonical backlog (`agentBacklog.json`).
- The script `scripts/generateBacklogTodos.ts` scans the codebase, deduplicates, and appends new actionable items to the backlog with full metadata.
- This script is run automatically as a pre-commit hook (see `.pre-commit-config.yaml`). Contributors do not need to run it manually, but may do so with:
  ```sh
  pnpm tsx scripts/generateBacklogTodos.ts
  ```
- **How it works:**
  - Recursively scans for TODO/FIXME/PLANNED comments and stubs (future-proof: can be extended for more markers).
  - Deduplicates against existing backlog items by canonical ID (`todo:<file>:<line>`).
  - Appends new items as `planned`/`not started` with full context for later triage and folding.
- **Extending extraction:**
  - To support new markers or stub types, extend the `extractTodos()` function in `contextSnapshotHelper.ts`.
  - For LLM/AI triage, integrate with `scripts/aiTriageBacklogTodos.ts`.
- **Best practices:**
  - All actionable/planned work must be tracked in the backlog for discoverability, triage, and roadmap automation.
  - The backlog is the single source of truth for planned/in-progress work.

## 🗂️ Automated Backlog Pruning & Archiving

- The script `scripts/pruneBacklogTodos.ts` scans the backlog for TODOs/FIXMEs/PLANNED/STUB items that are resolved, ignored, stale, or complete, and moves them to `.nootropic-cache/backlog-archive.json`.
- This keeps the main backlog actionable and clean, while preserving full metadata for traceability.
- **How to use:**
  ```sh
  pnpm tsx scripts/pruneBacklogTodos.ts
  ```
- **Extending pruning:**
  - To adjust archiving criteria, edit the script to include/exclude additional triage or status fields.
  - For advanced workflows, integrate with LLM/AI triage or escalation scripts.
- **Best practices:**
  - Regularly prune the backlog to keep it focused and actionable.
  - Use the archive for historical review, compliance, or LLM/AI analysis.

## 🚨 Automated GitHub Issue Escalation for Hotspots & Stale TODOs

- The script `scripts/backlogSync.ts` not only syncs the backlog with GitHub Issues for features, but also escalates high-priority or stale TODOs (with `aiSuggestedPriority: 'top'` or `stale: true`) as GitHub Issues.
- Escalated issues are labeled with `nootropic-hotspot` or `nootropic-stale` for discoverability and triage.
- **How to use:**
  ```sh
  pnpm tsx scripts/backlogSync.ts [--dry-run] [--json]
  ```
- **Extending escalation:**
  - To adjust escalation criteria or labels, edit the script to include/exclude additional fields or logic.
  - For advanced workflows, integrate with LLM/AI triage or custom escalation scripts.
- **Best practices:**
  - Use the `--dry-run` flag to preview changes before updating GitHub Issues.
  - Regularly escalate hotspots and stale items to keep technical debt visible and actionable.

## 🔌 Plugin Discovery, Compliance, and Dynamic Registry

- All plugins **must export a `describe()` function** for LLM/AI and agent discoverability.
- Plugins are auto-discovered from the `plugins/` directory and included in the main describe registry.
- The registry is accessible at runtime and via CLI/API for both humans and LLMs/agents.
- **CLI usage:**
  ```sh
  pnpm tsx cliHandler.ts list-capabilities
  # or for plugins only:
  pnpm tsx nootropic/pluginRegistry.ts list
  ```
- Plugins missing a `describe()` function are skipped and a warning is logged in debug mode.
- See `CONTRIBUTING.md` for authoring and compliance details.

- **Prompt Templates:** All describe() outputs now include a `promptTemplates` field for LLM/agent workflows. For example, `updateNotifier`, `adapterUtils`, `pluginFeedback`, `SecretsManager`, `sastMemories`, and `semgrepMemories` provide robust prompt templates for automating capability usage. Use these templates to guide LLMs/agents in automating, deduplicating, and triaging feedback and memory management.
