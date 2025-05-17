# nootropic Orchestration Engine System

## Overview

The nootropic orchestration system provides a modular, extensible, and DRY-compliant interface for integrating multiple agent orchestration frameworks (e.g., LangChain, CrewAI, Semantic Kernel). It is designed to be plug-and-play for future projects and supports runtime selection of the orchestration backend.

---

## Architecture

- **Unified Interface:** All orchestration engines implement the `AgentOrchestrationEngine` interface (see `types/AgentOrchestrationEngine.ts`).
- **Adapters:** Each framework (LangChain, CrewAI, Semantic Kernel, etc.) has its own adapter implementing the interface.
- **Selector:** The `getOrchestrationEngine` function (in `orchestrationEngineSelector.ts`) returns the correct adapter based on user input.
- **CLI:** The `agentOrchestrationCli.ts` entrypoint allows users or agents to specify the engine, agent profile, task, and context at runtime.

---

## Adding a New Orchestration Engine

1. **Create an Adapter:**
   - Implement a new class (e.g., `MyNewAdapter`) in the nootropic directory.
   - The class must implement all methods from `AgentOrchestrationEngine`.
2. **Update the Selector:**
   - Import your adapter in `orchestrationEngineSelector.ts`.
   - Add a new case to the switch statement.
   - Extend the `OrchestrationEngineName` type.
3. **(Optional) Extend the CLI:**
   - The CLI will automatically support new engines if you update the selector and type.

---

## Using the CLI

Run the CLI with the desired engine, agent profile, and task:

```sh
pnpm tsx nootropic/agentOrchestrationCli.ts --engine langchain --profile '{"name":"TestAgent"}' --task '{"id":"t1","description":"Say hello"}'
```

- `--engine` can be `langchain`, `crewAI`, or `semanticKernel` (default: `langchain`).
- `--profile` and `--task` are required and must be valid JSON strings.
- `--context` is optional and must be a valid JSON string.
- `--help` prints usage information.

---

## Example: Adding a New Adapter

Suppose you want to add `SuperAgent`:

1. Create `superAgentAdapter.ts`:
   ```ts
   import type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult } from './types/AgentOrchestrationEngine';
   export class SuperAgentAdapter implements AgentOrchestrationEngine {
     // Implement all required methods...
   }
   ```
2. Update `orchestrationEngineSelector.ts`:
   ```ts
   import { SuperAgentAdapter } from './superAgentAdapter';
   export type OrchestrationEngineName = 'langchain' | 'crewAI' | 'semanticKernel' | 'superAgent';
   // Add a case for 'superAgent' in the switch
   ```

---

## Design Principles

- **Modular:** All code is local to nootropic and can be plugged into other projects.
- **Extensible:** New engines can be added with minimal changes.
- **DRY:** Shared types and logic are centralized.
- **Type-Safe:** All interfaces and adapters use TypeScript types.

---

## Event Bus & Audit Log Integration

- All agent orchestration actions, state changes, and errors now emit structured events to the event bus (`.nootropic-cache/event-log.jsonl`).
- The context snapshot logic (`gatherSnapshotData` in `contextSnapshotHelper.ts`) has been refactored into smaller, single-responsibility functions for maintainability and testability, following 2025 best practices. See the backlog and README for rationale.
- The event bus enables event-driven orchestration, observability, and replay of agent workflows.
- Events follow the schema in `event-schema.json` (type, agentId, timestamp, payload, correlationId, etc.).
- Audit logs are stored as events of type `Log` with level, message, and details.
- Use the event bus API (`publishEvent`, `logEvent`, etc.) from `memoryLaneHelper.ts`.
- Example (in an adapter):
  ```ts
  import { publishEvent } from 'nootropic/memoryLaneHelper';
  await publishEvent({ type: 'TaskAssigned', agentId: 'agent1', timestamp: new Date().toISOString(), payload: { task } });
  ```
- See the [memoryLaneGuide.md](./memoryLaneGuide.md) for more details and CLI/API usage.

---

## Event-Driven Multi-Agent System (MAS) Patterns (2024)

### Orchestrator-Worker Pattern
- Central orchestrator assigns tasks to worker agents via events.
- Workers consume events, process tasks, and emit results as new events.
- Scalable via consumer groups and partitioning (Kafka/NATS/etc).

### Choreography Pattern
- No central boss; agents react to events they care about and emit new events.
- Workflows emerge from event exchanges, not hardcoded logic.
- Highly scalable, resilient, and easy to extend.

### Blackboard Pattern
- Agents collaborate via a shared event log (blackboard topic/stream).
- Each agent posts and consumes knowledge/events as needed.

### Market-Based Pattern
- Agents negotiate/compete for tasks/resources via events (bids/asks).
- Useful for decentralized, competitive, or auction-based workflows.

## Agent Event Interface
- Each agent must declare the events it emits and consumes, with machine-readable schema (JSON/Avro/etc).
- Add this to the agent's `describe()` output and registry entry.
- Example:
  ```json
  {
    "name": "WriterAgent",
    "emits": ["DraftCreated", "DraftReviewed"],
    "consumes": ["TaskAssigned", "DraftFeedback"],
    "eventSchemas": {
      "DraftCreated": {"type": "object", "properties": {"draftId": {"type": "string"}, "content": {"type": "string"}}}
    }
  }
  ```

## Streaming Backend Integration
- Event bus supports pluggable backends: JSONL (local/dev), Kafka, NATS, Redis Streams, Dapr, etc.
- Production systems should use a distributed streaming backend for scalability and reliability.
- All events are logged for observability, replay, and debugging.
- Fault tolerance: retries, dead letter queue (DLQ), event sourcing.
- **NATS:** Set `EVENT_BUS_BACKEND=nats` and configure `NATS_URL`, `NATS_STREAM`, `NATS_SUBJECT`, and `NATS_DLQ_SUBJECT`. Uses `nats.js` with JetStream for high-performance, subject-based routing, replay, DLQ, and OTel tracing. All events are validated at runtime using Zod schemas. See `memoryLaneHelper.ts` for implementation details.
- **Dapr:** Set `EVENT_BUS_BACKEND=dapr` and configure Dapr pub/sub component YAMLs. Uses Dapr HTTP/gRPC APIs or SDK. Supports service invocation, state management, and pub/sub. See adapters/DaprEventBus.ts for implementation details. All events are validated at runtime using Zod schemas. See memoryLaneHelper.ts for integration and orchestration patterns.

## Dead Letter Queue (DLQ) Event Schema & Replay (2025 Best Practices)

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
  - [ ] Replay utilities in progress

## Supervisor Agent Pattern
- For complex workflows, a supervisor/lead agent coordinates teams of agents using events.
- Still uses event-driven communication for all coordination.

## References
- [Confluent: Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/)
- [AWS Labs: Agent Squad](https://github.com/awslabs/multi-agent-orchestrator)
- [Choreography vs. Orchestration](https://hammadulhaq.medium.com/rethinking-workflows-how-choreography-empowers-ai-agents-to-collaborate-without-a-boss-132a5b129c03)

---

## Event Schema Registry: Open Source Tools & Best Practices (2024)

- **Open Source Tools:**
  - [Confluent Schema Registry](https://www.confluent.io/blog/best-practices-for-confluent-schema-registry/) (Kafka, Avro/JSON Schema/Protobuf, REST API, versioning, compatibility checks)
  - [AWS EventBridge Schema Registry](https://community.aws/content/2dhVUFPH16jZbhZfUB73aRVJ5uD/eventbridge-schema-registry-best-practices?lang=en) (OpenAPI/JSON Schema, code bindings, versioning, event discovery)
  - [schema-compatibility-ui](https://github.com/steffen-karlsson/schema-compatibility-ui) (open-source UI for schema validation)
  - [eventbridge-schema-registry-plugin](https://github.com/mridehalgh/eventbridge-schema-registry-plugin) (Java/Maven, AWS)

- **Best Practices:**
  - Centralized, versioned, machine-readable registry (JSON Schema/OpenAPI recommended for LLM/agent workflows)
  - Compatibility checks (backward/forward/full) for schema evolution
  - CI/CD integration for schema registration/validation (no auto-registration in prod)
  - Schema normalization and naming conventions
  - Schema composition (references/unions for DRY)
  - Standard event metadata (eventId, timestamp, source, type, correlationId, etc.)
  - AsyncAPI/OpenAPI documentation for all events
  - Validation at build and runtime
  - Security: authentication and access control for registry
  - Immutability: schemas are immutable, new versions for changes
  - Error handling: standardized error event schemas/codes

- **nootropic Approach:**
  - Implements a central, versioned, machine-readable event schema registry (JSON Schema/OpenAPI)
  - Integrates schema registration/validation into CI/CD
  - Enforces compatibility checks and schema evolution policy
  - Generates AsyncAPI/OpenAPI docs for all events
  - Optionally provides a simple web UI for schema browsing/validation
  - Implements registry security and access control

---

## Event Schema Governance, Versioning & CI/CD Validation (2024 Best Practices)

- **Central Schema Registry:** All event types and payloads are defined in `.nootropic-cache/event-schema.json`.
- **Versioning:** Event schemas follow semantic versioning. Breaking changes increment the major version; backward-compatible changes increment the minor version.
- **Compatibility:** CI/CD pipeline enforces backward/forward compatibility using JSON Schema validation (see Ajv or similar tools).
- **Update Process:**
  1. Propose schema changes in a PR, updating `.nootropic-cache/event-schema.json`.
  2. Run schema validation and compatibility checks in CI/CD.
  3. Update relevant documentation and backlog items to reference the new/changed event(s).
  4. Reference external best practices and research links as needed.
- **Documentation:** All event-driven features in the backlog must link to their event types and schema definitions.
- **External References:**
  - [Confluent: Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/)
  - [AWS: Best Practices for Event-Driven Architectures](https://aws.amazon.com/blogs/architecture/best-practices-for-implementing-event-driven-architectures-in-your-organization/)

---

## Next Steps
- Implement real integrations in the adapter skeletons.
- Add tests (see project test plan).
- Extend documentation as new engines are added.

---

## Integrating Open Source JSON Schema CLI for Validation & CI/CD

### Overview
- Use [Sourcemeta JSON Schema CLI](https://github.com/sourcemeta/jsonschema) or equivalent for validating, linting, and testing event schemas.
- Supports formatting, linting, unit testing, and bundling schemas for local and CI/CD workflows.

### Example Usage
- Validate a schema:
  ```sh
  jsonschema validate path/to/schema.json
  ```
- Lint and format schemas:
  ```sh
  jsonschema lint path/to/schemas
  jsonschema fmt path/to/schemas --check
  ```
- Unit test schemas:
  ```sh
  jsonschema test path/to/schema.json
  ```

### GitHub Actions Workflow Example
```yaml
name: Validate Schemas
on:
  push:
    paths:
      - 'schemas/**/*.json'
  pull_request:
    paths:
      - 'schemas/**/*.json'
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install JSON Schema CLI
        run: npm install --global @sourcemeta/jsonschema
      - name: Validate Schemas
        run: jsonschema validate schemas/
      - name: Lint Schemas
        run: jsonschema lint schemas/
```

### Future Registry UI/API Integration
- Evaluate open source/self-hosted registry UIs for schema browsing, validation, and management.
- Plan for API integration to automate schema registration and validation.

### Developer Workflow Recommendations
- Validate and lint all schemas before committing changes.
- Use pre-commit hooks for schema validation.
- Document schema changes and version history.

---

## Pre-Commit & Husky Hooks for JSON Schema Validation

### Why Use Pre-Commit/Husky?
- Ensures all contributors validate and lint JSON Schemas before code is committed.
- Provides instant feedback, reduces CI/CD failures, and improves code quality.
- Works with both Python (pre-commit) and Node.js (Husky) developer environments.

### Example: .pre-commit-config.yaml (Python)
```yaml
repos:
  - repo: local
    hooks:
      - id: jsonschema-validate
        name: Validate JSON Schemas
        entry: jsonschema validate schemas/
        language: system
        types: [json]
```
- Install with:
  ```sh
  pip install pre-commit
  pre-commit install
  pre-commit run --all-files
  ```

### Example: Husky (Node.js)
- Install Husky and ajv-cli:
  ```sh
  npm install --save-dev husky ajv-cli
  npx husky install
  npx husky add .husky/pre-commit "npx ajv -d schemas/ -s schemas/schema.json"
  ```
- Add to `package.json` if needed:
  ```json
  "husky": {
    "hooks": {
      "pre-commit": "npx ajv -d schemas/ -s schemas/schema.json"
    }
  }
  ```

### Contributor Setup Instructions
- Clone the repo and run the setup for your environment (see above).
- All schema changes must pass validation locally before commit.
- Use `pre-commit run --all-files` or `npx ajv ...` to check manually if needed.

### Best Practices
- Document pre-commit/Husky setup in CONTRIBUTING.md or onboarding docs.
- Require local validation before CI/CD to catch issues early.
- Provide sample configs and troubleshooting tips for new contributors.
- Reference the [JSON Schema CLI docs](https://github.com/sourcemeta/jsonschema) or [ajv-cli docs](https://ajv.js.org/cli.html) for advanced usage.

---

## CI/CD Integration: JSON Schema Validation with ajv-cli (Monorepo Best Practices)

### Sample GitHub Actions Workflow
```yaml
name: Validate JSON Schemas
on:
  push:
    paths:
      - '**/*.json'
  pull_request:
    paths:
      - '**/*.json'
jobs:
  validate-schemas:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        package:
          - '.'
          - 'packages/package1'
          - 'packages/package2'
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Validate schemas in ${{ matrix.package }}
        run: |
          npx ajv validate -s "${{ matrix.package }}/schemas/*.json" --strict=true --all-errors || exit 1
```

### Best Practices
- Use a matrix to validate schemas in each package for better error reporting and performance.
- Always use `--strict=true` and `--all-errors` for maximum safety.
- For remote $ref or draft mismatches, use `--spec` and ensure all referenced schemas are available in the repo or CI environment.
- For large monorepos, split validation jobs or use caching to speed up CI.
- Document troubleshooting steps for common CI issues (e.g., remote refs, draft mismatches).

### Troubleshooting
- **Remote $ref errors:** Ensure all referenced schemas are local or available in the CI environment. Consider vendoring remote schemas or using ajv-cli's `-r` option for references.
- **Schema draft mismatches:** Use the `--spec` flag (e.g., `--spec=draft7`) to match your schema version.
- **Performance:** For very large repos, use job splitting, caching, or only validate changed files on push.

See [README.md](../README.md#ci-cd-integration-json-schema-validation-with-ajv-cli) for a quickstart and summary.

---

## Event-Driven Agent Example: WriterAgent

The WriterAgent is now fully event-driven. It emits events for all major actions and runs a persistent event-driven loop:

- Subscribes to `TaskAssigned` and `DraftFeedback` events (filtered by agentId)
- Processes events by calling `runTask` or updating state/context
- Emits results as events (`TaskStarted`, `DraftCreated`, `TaskCompleted`, etc.)
- Can be started as a long-lived service using `startEventLoop()`

**Usage Example:**
```ts
import { WriterAgent } from './agents/WriterAgent.js';
const agent = new WriterAgent({ profile: { name: 'WriterAgent' } });
await agent.startEventLoop(); // Runs the persistent event-driven runtime
```

See `agents/WriterAgent.ts` and the agent's `describe()` for details.

---

## Event-Driven Mutation Suggestion Traceability

The `contextMutationEngine` now emits a `mutationSuggested` event for every mutation/refactor suggestion (schema drift, TODO, test gap):

```ts
await publishEvent({
  type: 'mutationSuggested',
  agentId: drift.agent || 'contextMutationEngine',
  timestamp: new Date().toISOString(),
  payload: suggestion as unknown as Record<string, unknown>
});
```

**Event Schema (v1.mutationSuggested):**
```json
{
  "eventId": "string (UUID)",
  "type": "v1.mutationSuggested",
  "version": "v1.0",
  "source": "string (originating agent/module/service)",
  "agentId": "string",
  "timestamp": "date-time",
  "payload": { /* suggestion object */ },
  "correlationId": "string (optional)",
  "topic": "string (optional)"
}
```

> **Note:** The full schema is enforced in `.nootropic-cache/event-schema.json` and referenced in all relevant `describe()` outputs for LLM/AI-friendliness and CI validation.

- All events are logged to the event bus and memory lane for full traceability and replay.
- See `agentBacklog.json` for implementation status and future improvements.

---

## Event-Driven Agent Example: DataCollectorAgent

The DataCollectorAgent is now fully event-driven. It emits events for all major actions and runs a persistent event-driven loop:

- Subscribes to `DataCollectionRequested` and `TaskAssigned` events (filtered by agentId)
- Processes events by calling `runTask`
- Emits results as events (`DataCollected`, `TaskCompleted`, `Log`)
- Can be started as a long-lived service using `startEventLoop()`

**Usage Example:**
```ts
import { DataCollectorAgent } from './agents/DataCollectorAgent.js';
const agent = new DataCollectorAgent({ profile: { name: 'DataCollectorAgent' } });
await agent.startEventLoop(); // Runs the persistent event-driven runtime
```

See `agents/DataCollectorAgent.ts` and the agent's `describe()` for details.

---

## Event-Driven Agent Example: ReviewerAgent

The ReviewerAgent is now fully event-driven. It emits events for all major actions and runs a persistent event-driven loop:

- Subscribes to `DraftCreated`, `ReviewRequested`, and `TaskAssigned` events (filtered by agentId)
- Processes events by calling `runTask`
- Emits results as events (`DraftReviewed`, `ReviewFeedback`, `TaskCompleted`, `Log`)
- Can be started as a long-lived service using `startEventLoop()`

**Usage Example:**
```ts
import { ReviewerAgent } from './agents/ReviewerAgent.js';
const agent = new ReviewerAgent({ profile: { name: 'ReviewerAgent' } });
await agent.startEventLoop(); // Runs the persistent event-driven runtime
```

See `agents/ReviewerAgent.ts` and the agent's `describe()` for details.

---

## Event-Driven Agent Foundation: BaseAgent

The BaseAgent class now provides robust, type-safe event-driven utilities for all agents:

- **subscribeToEvent(topic, handler):** Protected utility for subscribing to event topics.
- **publishEvent(event):** Protected utility for publishing events (requires a valid AgentEvent).
- **logEvent(level, message, details?):** Protected utility for emitting structured log events.
- **buildAgentEvent(partial):** Helper to build a valid AgentEvent from partials (adds type, timestamp, etc.).
- **startEventLoop():** Stub for subclasses to implement their event-driven runtime loop.

**Usage Example:**
```ts
import { BaseAgent } from './agents/BaseAgent.js';

class MyEventDrivenAgent extends BaseAgent {
  async startEventLoop() {
    this.subscribeToEvent('MyEvent', async (event) => {
      // Handle event
      await this.logEvent('info', 'Received MyEvent', { event });
      // Emit a response event
      const response = this.buildAgentEvent({ type: 'MyEventHandled', payload: { ok: true } });
      await this.publishEvent(response);
    });
    await this.logEvent('info', 'MyEventDrivenAgent event loop started');
  }
}
```

See `agents/BaseAgent.ts` and the agent's `describe()` for details.

---

## 🧩 Distributed Event-Driven Plugins (2025 Best Practices)

All plugins now receive `publishEvent` and `subscribeToEvent` in their context, which delegate to the selected distributed event bus backend (Kafka, NATS, Dapr, or JSONL). Plugin event-driven workflows are backend-agnostic and fully OTel-instrumented for observability.

**Usage Example:**
```ts
appContext.subscribeToEvent('TaskAssigned', async (event) => {
  // Handle event
  await appContext.publishEvent({
    type: 'TaskCompleted',
    agentId: 'myPlugin',
    timestamp: new Date().toISOString(),
    payload: { ... }
  });
});
```

**Best Practices:**
- Use Zod schemas for all event payloads.
- Always clean up event subscriptions on shutdown (handled by PluginManager).
- Use OTel tracing for all event-driven logic (enabled by default).
- Plugins are now fully distributed and can participate in multi-agent workflows.

---

## 📖 Docs-First Engineering & AI/LLM-Friendly Documentation

nootropic adopts a docs-first workflow for all features and changes:
- All work begins and ends with documentation: user-facing docs, technical specs, and edge cases.
- Documentation is clear, versioned, and structured for both humans and AI/LLM agents (purpose, usage, best practices, API, troubleshooting).
- The describe() pattern is used everywhere for runtime and static documentation. All helpers, agents, and plugins must export a describe() with up-to-date metadata.
- The automated describe registry is aggregated and validated in CI. All PRs must pass describe registry, TSDoc, and lint checks.
- See [Crafting READMEs for AI](https://benhouston3d.com/blog/crafting-readmes-for-ai) and [Docs-First Engineering Workflow](https://www.octopipe.com/blog/docs-first-engineering-workflow) for rationale and examples.

**Actionable Steps:**
1. Start with user-facing docs and technical specs before writing code.
2. Update the relevant describe() output and markdown docs with every change.
3. Run `pnpm run validate-describe-registry` and `pnpm run docs:api` to ensure docs and code are in sync.
4. All PRs must pass describe registry, TSDoc, and lint checks in CI.

**References:**
- [TypeScript Best Practices 2025](https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052)
- [TypeScript Best Practices 2025: Elevate Your Code Quality](https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3)
- [Crafting READMEs for AI](https://benhouston3d.com/blog/crafting-readmes-for-ai)
- [Docs-First Engineering Workflow](https://www.octopipe.com/blog/docs-first-engineering-workflow)

---

## 🚀 2025 Best Practices for Event-Driven TypeScript Agent Frameworks

- **OpenTelemetry Observability:** All agents and the framework are being instrumented with OpenTelemetry for standardized traces, metrics, and logs. See [OpenTelemetry AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/).
- **Automated describe() Registry:** Every agent, plugin, and tool must export a `describe()` function. These are aggregated into a type-safe registry, validated in CI, and used for LLM/agent introspection, docs, and onboarding. See [Architecting AI Agents with TypeScript](https://apeatling.com/articles/architecting-ai-agents-with-typescript/).
- **Documentation Automation:** Docs are generated and enforced automatically for all agents, tools, and plugins. `describe()` and TSDoc/TypeDoc outputs must always be in sync. See [VoltAgent Docs](https://voltagent.dev/docs/).
- **Composable, Event-Driven Orchestration:** Agent orchestration is being refactored to use composable, event-driven patterns, supporting multi-agent workflows, supervisor/sub-agent patterns, and robust memory/state management. See [VoltAgent Framework](https://www.marktechpost.com/2025/04/22/meet-voltagent-a-typescript-ai-framework-for-building-and-orchestrating-scalable-ai-agents/).

**Actionable Steps:**
- All contributors must follow these practices for every code and documentation change.
- See the backlog for implementation status and next steps.

## 📊 OpenTelemetry Integration & GenAI Semantic Conventions

All agent, plugin, and event telemetry is instrumented using [OpenTelemetry](https://opentelemetry.io/) and follows the [GenAI/AI Agent semantic conventions](https://github.com/open-telemetry/semantic-conventions/blob/main/docs/genai/README.md). This ensures standardized, vendor-neutral observability for all agent lifecycles, plugin hooks, and event emissions.

- Baked-in instrumentation is opt-in and can be configured in `otel.config.ts`.
- All traces, metrics, and logs are compatible with OTel-based observability platforms.
- See [AI Agent Observability - Evolving Standards and Best Practices](https://opentelemetry.io/blog/2025/ai-agent-observability/) for more details.

## 🗂️ Event Schema Registry & AsyncAPI

All event-driven APIs, channels, and event payloads are governed by a canonical [AsyncAPI](https://www.asyncapi.com/docs/reference/specification/latest) spec (`docs/asyncapi.yaml`).

- The spec now uses the correct `channels` key (not `topics`), aligns with AsyncAPI 3.0.0, and passes linter/CI checks.
- All event schemas are referenced from `.nootropic-cache/event-schema.json` and versioned.
- The AsyncAPI spec is validated and checked for compatibility in CI/CD (see [ajv-cli](https://ajv.js.org/cli.html)).
- Docs are auto-generated and published for discoverability and machine-usage.
- Prevents drift between code, schemas, and docs.
- See [AsyncAPI as Infra Config](https://eviltux.com/2025/03/27/beyond-docs-using-asyncapi-as-a-config-for-infrastructure/).

## 📊 CI/CD: describe() Registry, Code/Doc Sync, and Monorepo Best Practices (2025)

- **describe() Registry Aggregation & Validation:** CI runs `pnpm run validate-describe-registry` to aggregate and validate all describe() outputs from agents, plugins, and tools. PRs fail if the registry is out of sync or missing required fields.
- **Code/Doc Sync Check:** CI runs `pnpm run docs:check-sync` to ensure all code changes are reflected in documentation and describe() outputs. PRs fail if docs or describe() are out of sync.
- **Test Enforcement:** CI runs `pnpm test` to ensure all tests pass before merge. PRs fail if any test fails.
- **Monorepo CI Best Practices:** Path filters, dependency caching, modular jobs, and fail-fast are used to keep CI fast and maintainable. See `.github/workflows/lint-and-type.yml` for implementation.

**References:**
- [Monorepo with GitHub Actions](https://graphite.dev/guides/monorepo-with-github-actions)
- [GitHub Community: Monorepo CI/CD Best Practices](https://github.com/orgs/community/discussions/158727)
- [Architecting AI Agents with TypeScript](https://apeatling.com/articles/architecting-ai-agents-with-typescript/)
- [Agentic Coding Best Practices](https://benhouston3d.com/blog/agentic-coding-best-practices)

## Code/Doc Sync Enforcement

To ensure robust documentation and discoverability, all described modules, agents, and plugins must be referenced in `docs/docManifest.json`, and all documented sections/references must correspond to a described module or capability in the codebase.

Run:

```sh
pnpm run docs:check-sync
```

This script will fail with actionable errors if any described module is missing from docs, or if any documented section/reference is missing from the codebase. This check is enforced in CI to prevent drift and ensure all capabilities remain discoverable and machine-usable.

## 🧩 Plugin/Tool Safety: Zod Validation, Type Guards & Hot-Reload

All plugins and tools must validate their inputs and outputs using Zod schemas. Type guards must be used at all plugin boundaries, and plugins must reference their schemas in `describe()`. The plugin registry enforces this pattern and will skip plugins that do not conform. See `plugins/examplePlugin.ts` for a reference implementation.

- Use Zod schemas for all plugin input/output validation (see `run` in examplePlugin).
- Reference schemas in `describe()` for discoverability and LLM/agent introspection.
- The plugin registry uses type guards and Zod checks to enforce safety at load time.
- Plugins/tools that do not conform will be skipped (see debug logs).
- **Dynamic event subscription:** Plugins must use `appContext.subscribeToEvent` (or `pluginManager.subscribe`) with their name for tracking. All event subscriptions are automatically cleaned up on unload/hot-reload, preventing stale handlers and enabling robust hot-reload. See the updated example plugin and PluginManager for details.

## 🚀 Distributed Event Bus: Kafka Integration

All distributed agent, plugin, and event communication is now handled via the `KafkaEventBus` abstraction (`adapters/KafkaEventBus.ts`).

- Uses [KafkaJS](https://kafka.js.org/) for robust, scalable event streaming.
- All events are validated at runtime using Zod schemas for type safety and schema governance.
- OTel traces/metrics/logs are emitted for all event bus operations (see `otel.config.ts`).
- Supports orchestrator-worker, hierarchical, blackboard, and market-based multi-agent patterns ([Confluent](https://www.confluent.io/blog/event-driven-multi-agent-systems/)).
- Plugins can hot-reload and dynamically subscribe/unsubscribe to topics at runtime.

See also: [Kai Waehner on Agentic AI](https://www.kai-waehner.de/blog/2025/04/14/how-apache-kafka-and-flink-power-event-driven-agentic-ai-in-real-time/), [Medium: Multi-Agent Orchestration](https://medium.com/@seanfalconer/how-to-build-a-multi-agent-orchestrator-using-flink-and-kafka-4ee079351161)

### Kafka Trace Context Propagation: W3C & B3 Interop (2025)

- **Propagator Support:** KafkaEventBus supports both [W3C Trace Context](https://www.w3.org/TR/trace-context/) and [B3 propagation](https://github.com/openzipkin/b3-propagation) for distributed tracing.
- **Runtime Selection:** Use the `KAFKA_TRACE_PROPAGATOR` environment variable or config to select the propagator (`w3c` or `b3`).
- **Interop & Custom Metadata:** Both protocols are interoperable with external tracing systems. Custom metadata (e.g., `userId`, `tenantId`) can be propagated in the trace context.
- **Canonical Tests:** See `tests/adapter.kafka.context-propagation.test.ts` for interop and custom metadata propagation tests.
- **Best Practices:** See [OpenTelemetry](https://opentelemetry.io/), [Confluent](https://www.confluent.io/blog/event-driven-multi-agent-systems/), and [Last9](https://last9.io/blog/kafka-with-opentelemetry/) for research-backed guidance.

### Advanced Kafka Metrics & Sampling (2025)

- **Metrics Scaffolded:** KafkaEventBus now includes OTel metrics scaffolding for producer throughput, consumer lag (offset/time), and message processing time. Sampling config is present for trace and metric collection.
- **Available Metrics:**
  - Producer throughput (messages/sec per topic)
  - Consumer lag (offset and time lag per topic/partition/group)
  - Message processing time (histogram)
- **Sampling:** Configurable via environment variables. Default: 100% metrics, 10% traces. Tune for your workload and cost.
- **Next Steps:** Expose metrics to OTel Collector/Prometheus for full observability. See agentBacklog.json for actionable items.
- **Troubleshooting:**
  - If metrics are missing, ensure OTel is enabled and environment variables are set.
  - For high-volume systems, adjust sampling rates to balance cost and visibility.
- **References:** See README.md and research links for best practices and AI/LLM agent observability.

### CI: Kafka Context Propagation Test

- **CI Job:** The `context-propagation-test` job in `.github/workflows/schema-validation.yml` runs the canonical KafkaEventBus context propagation test (`tests/adapter.kafka.context-propagation.test.ts`).
- **Enforcement:** CI will fail if traceId/spanId continuity is not preserved or if context is missing/corrupted in the test output.
- **Best Practices:** This enforces OpenTelemetry and AI agent observability best practices (2025) for distributed tracing and context propagation.
- **Troubleshooting:**
  - If the job fails, check that Kafka is available in the CI environment and that the test can connect to the broker.
  - Ensure the test output includes valid traceId/spanId values for all events.
  - Review instrumentation and propagator configuration if context is missing or corrupted.
- **References:** See `tests/adapter.kafka.context-propagation.test.ts` and OpenTelemetry docs for more details.

### Dapr Backend
- **Setup:** Install Dapr CLI/sidecar and configure pub/sub component (Kafka, Redis, NATS, etc.). Set `EVENT_BUS_BACKEND=dapr` and configure Dapr component YAMLs.
- **Usage:**
  ```ts
  import { DaprEventBus } from 'nootropic/adapters/DaprEventBus';
  const bus = new DaprEventBus();
  await bus.publishEvent(event, 'aihelpers.events');
  await bus.subscribeToTopic('aihelpers.events', async (event) => { /* ... */ });
  ```
- **Features:**
  - Dapr pub/sub integration (works with Kafka, Redis, NATS, etc. via Dapr components)
  - Zod schema validation for all events
  - OpenTelemetry tracing for publish/consume
  - W3C/B3 context propagation (configurable)
  - Dead-letter queue (DLQ) for failed events
  - LLM/agent-friendly describe() metadata
- **Configuration:**
  - `EVENT_BUS_BACKEND=dapr`
  - `DAPR_PUBSUB_NAME` (default: messagebus)
  - `DAPR_DLQ_TOPIC` (default: aihelpers.events.DLQ)
  - `DAPR_HOST` (default: 127.0.0.1)
  - `DAPR_HTTP_PORT` (default: 3500)
  - `DAPR_TRACE_PROPAGATOR` (w3c or b3)
- **Troubleshooting:**
  - Ensure Dapr sidecar is running and pub/sub component is configured.
  - Check DAPR_HOST and DAPR_HTTP_PORT environment variables.
  - Use OTel collector or Jaeger/Uptrace for trace visualization.
  - DLQ events are published to the configured DLQ topic on handler failure.
- **References:**
  - [Dapr Pub/Sub Docs](https://docs.dapr.io/developing-applications/building-blocks/pubsub/)
  - [Dapr W3C Trace Context](https://docs.dapr.io/operations/observability/tracing/w3c-tracing-overview/)
  - [OpenTelemetry AI Agent Observability](https://opentelemetry.io/blog/2025/ai-agent-observability/)
  - [TypeScript Best Practices 2025](https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3)
- See also: `adapters/DaprEventBus.ts`, `docs/memoryLaneGuide.md`.

File/directory existence checks and JSON file operations are now handled by utilities in `utils.ts`, used throughout the codebase (see `contextSnapshotHelper.ts`, `contextMutationEngine.ts`). This improves maintainability and DRYness. See the backlog and README for rationale.

Dead code detection and removal is now automated using knip and tsr. See the README and backlog for details and best practices. This ensures the codebase remains clean, maintainable, and efficient.

## TODO/FIXME Comment Policy (2025)

- All TODO/FIXME comments must be actionable, attributed, and resolved promptly.
- Use `TODO(owner):` or `FIXME(owner):` for traceability and context.
- Generic or stale TODOs are not allowed.
- See `contextMutationEngine.ts` and `contextSnapshotHelper.ts` for implementation and enforcement details.

All exports are now explicit, named, and follow 2025 ESM/TypeScript best practices. The canonical entrypoint is index.ts, and only public API exports are exposed. See the backlog and README for rationale and details.

All adapters and event bus backends now export a describe() function per 2025 best practices. This enables full registry automation, LLM/agent introspection, and CI enforcement. See adapters/* and the backlog for details.

### CI Enforcement: Context Propagation for Kafka, NATS, and Dapr (2025)

- **CI Jobs:** All three event bus backends (Kafka, NATS, Dapr) now have canonical context propagation integration tests enforced in CI. See `.github/workflows/schema-validation.yml` for job definitions:
  - `context-propagation-test` (Kafka)
  - `nats-context-propagation-test` (NATS)
  - `dapr-context-propagation-test` (Dapr)
- **Test Files:**
  - `tests/adapter.kafka.context-propagation.test.ts`
  - `tests/adapter.nats.context-propagation.test.ts`
  - `tests/adapter.dapr.context-propagation.test.ts`
- **Enforcement:** CI fails if traceId/spanId continuity is not preserved or context is missing/corrupted.
- **Troubleshooting:**
  - Ensure required infra (Kafka, NATS JetStream, Dapr sidecar) is available in CI.
  - Review test output for traceId/spanId assertions.
  - See job logs for actionable errors and troubleshooting hints.
- **Best Practices:**
  - Maintain parity in test coverage across all backends.
  - Regularly review and update tests as new edge cases emerge.
  - Reference OpenTelemetry and 2025 observability research for guidance.

### OpenTelemetry Integration for Event Bus (2025 Best Practices)

The KafkaEventBus now uses a global OpenTelemetry meter and tracer from `telemetry.ts`, ensuring all event bus metrics and traces are consistent and centralized. This enables robust distributed tracing, context propagation (W3C/B3), and seamless integration with observability platforms (Grafana, Jaeger, Prometheus, etc.).

Benefits:
- Centralized, best-practice OTel setup for all event bus operations
- Consistent metrics and traces across all agents and plugins
- Easier troubleshooting, SLO monitoring, and CI enforcement

Further metrics (consumer lag, error rate) are planned. See `telemetry.ts` and `adapters/KafkaEventBus.ts` for implementation details.

### Kafka Consumer Lag Metrics (2025 Best Practices)

KafkaEventBus now reports consumer lag (offset lag) as an OTel ObservableGauge metric, following 2025 best practices. This metric shows the offset difference between the latest message and the last consumed message for each topic/partition/group. Metrics are exported via OTel and can be visualized in Prometheus/Grafana. Time lag (based on message timestamps) and error rate metrics are planned next. See README.md and adapters/KafkaEventBus.ts for implementation details.

## Unified Event Bus Adapter Interface (2025 Best Practices)

- All distributed event bus backends (Kafka, NATS, Dapr, etc.) now implement the `EventBusAdapter` interface (see `types/AgentOrchestrationEngine.ts`).
- This interface standardizes methods for `publishEvent`, `subscribeToTopic`, and `shutdown`, ensuring:
  - CloudEvents-compliant payloads for interoperability
  - Zod-based runtime schema validation for all events
  - OpenTelemetry (OTel) tracing and metrics for all operations
  - Robust DLQ (Dead Letter Queue) handling for failed events
- Adapters are now fully interchangeable and can be selected/configured at runtime.
- See the table below for a feature comparison:

| Adapter         | CloudEvents | Zod Validation | OTel Tracing | DLQ Support | Batching | Configurable | Docs/Describe |
|----------------|-------------|----------------|--------------|-------------|----------|--------------|--------------|
| KafkaEventBus  | Yes         | Yes            | Yes          | Yes         | Yes      | Yes          | Yes          |
| NatsEventBus   | Yes         | Yes            | Yes          | Yes         | Yes      | Yes          | Yes          |
| DaprEventBus   | Yes         | Yes            | Yes          | Yes         | Partial* | Yes          | Yes          |

*DaprEventBus subscribe is limited by SDK as of 2025; see code/docs for details.

- Reference: 2025 best practices for event-driven, observable, and type-safe agent systems.
- For implementation details, see `adapters/KafkaEventBus.ts`, `adapters/NatsEventBus.ts`, and `adapters/DaprEventBus.ts`.

## Event Bus Backend Selector & Fallback (2025 Best Practices)

- The event bus backend is selected at runtime via the `EVENT_BUS_BACKEND` environment variable or config.
- Supported backends: Kafka, NATS, Dapr, Redis, and local JSONL (default).
- If the selected backend is unavailable or not implemented, the system automatically falls back to the local JSONL backend for reliability and data safety.
- All backends implement a unified interface and support CloudEvents, Zod validation, OTel tracing, and DLQ handling.
- **Troubleshooting:**
  - If you see errors about missing or unavailable backends, check your environment variables and infrastructure.
  - Fallback to JSONL ensures no data loss, but distributed features (e.g., multi-agent streaming, DLQ, OTel) will be unavailable until the backend is restored.
  - See `memoryLaneHelper.ts` for backend selector logic and fallback implementation.

## Distributed Event Bus Support

nootropic now supports a pluggable, distributed event bus architecture. The default backend is NATS, providing robust, cloud-native, and observable event streaming for agent workflows. Kafka and Dapr adapters are planned for future releases. For details on configuration, extension, and best practices, see [docs/eventBus.md](./eventBus.md).

## Advanced Workflow Step Types (2025+)

nootropic workflows now support the following step types:

- **task**: (default) Standard agent/tool invocation step.
- **approval**: Human-in-the-loop approval step (e.g., HumanInTheLoopAgent). Pauses workflow for human or LLM approval. Emits rationale/approval events and can use a custom approval handler.
- **parallel**: Runs multiple child steps concurrently (define child step ids in `metadata.children`). Results are aggregated. Emits rationale event on completion.
- **loop**: Repeats a step or group of steps (stub; for future extension, LLM/AI-driven iteration supported via hooks).

All steps are executed in topological order based on dependencies. Hooks for policy, mutation, rationale, and approval are supported for LLM/AI explainability and governance.

### Example Workflow YAML

See [`orchestration/examples/simple-workflow.yaml`](../orchestration/examples/simple-workflow.yaml) for a full example.

### Example: Advanced Workflow Execution with Hooks

See the [README](../README.md#🧩-declarative-composable-workflows-2025-best-practices) for a code example using `executeWorkflow` with hooks for policy, rationale, and approval.

- **Extension points:**
  - `preStep`/`postStep` hooks for policy/mutation (LLM/AI-driven governance)
  - `rationaleHandler` for explainability events (LLM/AI-friendly)
  - `approvalHandler` for custom approval logic (HITL/LLM/automation)

All new features are implemented as minimal, composable abstractions, reusing existing event, agent, and registry patterns (DRY/YAGNI). See `composeWorkflows.ts` for implementation details.

## Canonical Sources and Further Reading

- See the [README](../README.md#🧩-declarative-composable-workflows-2025-best-practices) for the canonical workflow documentation and code examples.
- See [agentBacklog.json](../agentBacklog.json) for the current backlog and roadmap. 