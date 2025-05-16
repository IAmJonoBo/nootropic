# Event Bus, Audit Log & Memory Lane Guide

[//]: # (Rebranding note: This file was updated from 'AI-Helpers' to 'nootropic'. Legacy references are archived in .ai-helpers-cache/archive/ for rollback.)

This system now persists a structured, append-only log of all agent events, context snapshots, audit logs, and mutation plans for full traceability, replay, and observability. All events are stored in `.nootropic-cache/event-log.jsonl` (JSONL, schema-aligned with `event-schema.json`). Legacy `memoryLane.json` is still supported for backward compatibility.

## 1. Appending Events (CLI)

```sh
pnpm tsx nootropic/memoryLaneHelper.ts append '{"type":"TaskAssigned","agentId":"agent1","timestamp":"2024-06-XXTXX:XX:XXZ","payload":{"task":{...}}}'
```

## 2. Viewing the Event Log (CLI)

```sh
pnpm tsx AI-Helpers/memoryLaneHelper.ts get
```

## 3. Tailing the Event Log (CLI)

```sh
pnpm tsx AI-Helpers/memoryLaneHelper.ts tail 20
```

## 4. Programmatic API

```ts
import { publishEvent, getEvents, subscribe, logEvent } from 'ai-helpers/memoryLaneHelper';

// Publish an event
await publishEvent({ type: 'TaskCompleted', agentId: 'agent1', timestamp: new Date().toISOString(), payload: { result: {...}, success: true } });

// Get all events
const events = await getEvents();

// Subscribe to events (runtime only)
subscribe(event => { console.log('Event:', event); });

// Log an audit event
await logEvent('info', 'Agent started', { details: '...' }, 'agent1');
```

## 5. Event Schema & Audit Logging

- All events follow the schema in `.ai-helpers-cache/event-schema.json` (type, agentId, timestamp, payload, correlationId, etc.).
- Audit logs are stored as events of type `Log` with level, message, and details.
- The event log is append-only and replayable for debugging, observability, and compliance.

## 6. Legacy Memory Lane

- The legacy timeline in `memoryLane.json` is still updated for backward compatibility.
- All new features and agent actions use the event bus and audit log.

---

- The event log is automatically updated when context snapshots, mutation plans, agent intents, or feedback are written.
- The context snapshot logic (`gatherSnapshotData` in `contextSnapshotHelper.ts`) has been refactored into smaller, single-responsibility functions for maintainability and testability, following 2025 best practices. See the backlog and README for rationale.
- Agents and plugins can append custom events for traceability and observability.
- Use the event log for replay, debugging, and advanced agent workflows.

## 7. HTTP API

Get the full memory lane timeline:
```
GET http://localhost:4000/memory-lane
```

## 8. WebSocket API

Request the full memory lane timeline:
```
{ "type": "getMemoryLane" }
```

Response:
```
{ "type": "memoryLane", "data": [ ... ] }
```

## Distributed Event Bus Backend

The event bus now supports pluggable backends for distributed, scalable event-driven agent orchestration:

- **Local JSONL (default):** Events are stored in `.ai-helpers-cache/event-log.jsonl`.
- **Redis Streams:** Set `EVENT_BUS_BACKEND=redis` and configure `REDIS_URL`/`REDIS_PASSWORD` to use Redis Streams for event publishing, subscribing, and replay.
- If Redis is unavailable, the system falls back to local JSONL.

### Configuration

Set the backend via environment variable or config:

```sh
export EVENT_BUS_BACKEND=redis
export REDIS_URL=redis://localhost:6379
export REDIS_PASSWORD=yourpassword
```

### Example Usage

```ts
import { publishToTopic, getEventsByTopic } from '../memoryLaneHelper';

// Publish an event to a topic (works for both backends)
await publishToTopic({ type: 'TaskAssigned', agentId: 'A1', payload: { ... } }, 'tasks');

// Get all events for a topic
const events = await getEventsByTopic('tasks');
```

### Advanced Patterns
- Orchestrator-worker, blackboard, and market-based agent patterns are supported via logical topics/queues.
- Future support for Kafka, NATS, and Dapr is planned.

See README.md for a summary and agentBacklog.json for roadmap.

---

## 🛠️ Changelog & Roadmap

- **ESM import path fixes:** All relative imports now use explicit .js extensions. NodeNext/ESM compatibility ensured. Path constants replaced with local logic in CLI/ad hoc scripts.
- **Event bus, audit log, and distributed backend:** Event bus and audit log system supports pluggable backends (local JSONL, Redis Streams), topic/correlationId, and advanced event-driven patterns. Docs and test plan updated. Fallback and config logic implemented.
- **Linter, type, and test suite fixes:** All linter, type, and test errors resolved for ESM/NodeNext, event bus, and orchestration changes. Test suite passes.

### Roadmap
- Kafka/NATS/Dapr event bus backend abstraction and multi-agent orchestration patterns (market-based, blackboard, distributed)
- Automated structured output prompting and validation for LLM/agent workflows (YAML, index-based, embedded reasoning)
- Robust plugin/agent hot-reload and live introspection

See `agentBacklog.json` and `README.md` for full details.

## Kafka, NATS, and Dapr Event Bus Backends

The event bus now supports additional distributed backends for advanced, scalable agent orchestration:

### Kafka Backend
- **Setup:** Install and configure Kafka brokers. Set `EVENT_BUS_BACKEND=kafka` and provide `KAFKA_BROKERS`, `KAFKA_CLIENT_ID`, etc. in your environment or config.
- **Usage:**
  ```ts
  import { publishToTopic, getEventsByTopic } from '../memoryLaneHelper';
  await publishToTopic({ type: 'TaskAssigned', agentId: 'A1', payload: { ... } }, 'tasks');
  const events = await getEventsByTopic('tasks');
  ```
- **Notes:** Uses `kafkajs` for robust, type-safe integration. Supports topic creation, admin, and partitioning.

### NATS Backend
- **Setup:** Install and configure a NATS server (with JetStream enabled). Set `EVENT_BUS_BACKEND=nats` and configure `NATS_URL`, `NATS_STREAM`, `NATS_SUBJECT`, and `NATS_DLQ_SUBJECT` as needed.
- **Usage:**
  ```ts
  import { publishToTopic, getEventsByTopic } from '../memoryLaneHelper';
  await publishToTopic({ type: 'TaskAssigned', agentId: 'A1', payload: { ... } }, 'tasks');
  const events = await getEventsByTopic('tasks');
  ```
- **Notes:** Uses `nats.js` for lightweight, high-performance messaging. Supports subject-based routing, JetStream replay, DLQ, and OTel tracing. All events are validated at runtime using Zod schemas. See `memoryLaneHelper.ts` for implementation details.
- **Observability:** All NATS publish/consume operations are traced with OpenTelemetry. DLQ events are validated and routed to a dedicated subject for replay and debugging. See [NATS JetStream Docs](https://docs.nats.io/jetstream) for advanced configuration and scaling.

### Dapr Backend
- **Setup:** Install Dapr CLI/sidecar and configure pub/sub component (Kafka, Redis, NATS, etc.). Set `EVENT_BUS_BACKEND=dapr` and configure Dapr component YAMLs.
- **Usage:**
  ```ts
  import { DaprEventBus } from 'ai-helpers/adapters/DaprEventBus';
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
- See also: `adapters/DaprEventBus.ts`, `docs/orchestration.md`.

### Advanced Patterns
- All backends support logical topics/queues, correlationId, and advanced event-driven patterns (orchestrator-worker, blackboard, market-based).
- Fallback to local JSONL if distributed backend is unavailable.

See `agentBacklog.json` and `README.md` for roadmap and details.

## Pluggable Event Bus Backend Abstraction

The event bus system is now fully pluggable and extensible:

- **Backend Abstraction:** Each backend (JSONL, Redis, Kafka, NATS, Dapr) is implemented as a class with a common interface (`EventBusBackend`).
- **Runtime Selection:** The backend is selected at runtime via the `EVENT_BUS_BACKEND` environment variable or config.
- **Extensibility:** To add a new backend, implement the `EventBusBackend` interface and add it to the backend selector in `memoryLaneHelper.ts`.
- **API:** All public event bus functions (`publishEvent`, `getEvents`, `subscribe`, etc.) delegate to the selected backend.
- **Benefits:** This enables robust, extensible, and testable event-driven agent orchestration, and makes it easy to add new distributed or cloud-native backends.

See `memoryLaneHelper.ts` for the backend interface and selector logic. Reference the roadmap for planned backend support and advanced patterns.

## Event Schema Governance, Versioning & CI/CD Validation (2024 Best Practices)

- **Central Schema Registry:** All event types and payloads are defined in `.ai-helpers-cache/event-schema.json`.
- **Versioning:** Event schemas follow semantic versioning. Breaking changes increment the major version; backward-compatible changes increment the minor version.
- **Compatibility:** CI/CD pipeline enforces backward/forward compatibility using JSON Schema validation (see Ajv or similar tools).
- **Update Process:**
  1. Propose schema changes in a PR, updating `.ai-helpers-cache/event-schema.json`.
  2. Run schema validation and compatibility checks in CI/CD.
  3. Update relevant documentation and backlog items to reference the new/changed event(s).
  4. Reference external best practices and research links as needed.
- **Documentation:** All event-driven features in the backlog must link to their event types and schema definitions.
- **External References:**
  - [Confluent: Event-Driven Multi-Agent Systems](https://www.confluent.io/blog/event-driven-multi-agent-systems/)
  - [AWS: Best Practices for Event-Driven Architectures](https://aws.amazon.com/blogs/architecture/best-practices-for-implementing-event-driven-architectures-in-your-organization/)

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

File/directory existence checks and JSON file operations are now handled by utilities in `utils.ts`, used throughout the codebase (see `contextSnapshotHelper.ts`, `contextMutationEngine.ts`). This improves maintainability and DRYness. See the backlog and README for rationale.

Dead code detection and removal is now automated using knip and tsr. See the README and backlog for details and best practices. This ensures the codebase remains clean, maintainable, and efficient.

## TODO/FIXME Comment Policy (2025)

- All TODO/FIXME comments must be actionable, attributed, and resolved promptly.
- Use `TODO(owner):` or `FIXME(owner):` for traceability and context.
- Generic or stale TODOs are not allowed.
- See `contextMutationEngine.ts` and `contextSnapshotHelper.ts` for implementation and enforcement details.

All exports are now explicit, named, and follow 2025 ESM/TypeScript best practices. The canonical entrypoint is index.ts, and only public API exports are exposed. See the backlog and README for rationale and details.

All adapters and event bus backends now export a describe() function per 2025 best practices. This enables full registry automation, LLM/agent introspection, and CI enforcement. See adapters/* and the backlog for details.

## NATS JetStream Backend

The NATS JetStream backend enables distributed, persistent, and high-throughput event streaming for agent orchestration. It supports:
- Zod schema validation for all events
- OpenTelemetry tracing for publish/consume
- DLQ (dead-letter queue) for failed events
- Multi-agent topic/queue patterns
- Durable subscriptions
- Type guards for JetStream messages
- Async/await, ESM-first, TypeScript strict mode

**Configuration (env vars):**
- `EVENT_BUS_BACKEND=nats`
- `NATS_URL` (default: nats://localhost:4222)
- `NATS_STREAM` (default: AIHelpersEvents)
- `NATS_SUBJECT` (default: aihelpers.events)
- `NATS_DLQ_SUBJECT` (default: aihelpers.events.DLQ)

**Usage Example:**
```ts
import { publishEvent, subscribe } from '../memoryLaneHelper.js';
process.env.EVENT_BUS_BACKEND = 'nats';
process.env.NATS_URL = 'nats://localhost:4222';
await publishEvent({ type: 'TaskAssigned', agentId: 'agent1', timestamp: new Date().toISOString(), payload: { task: 'demo' } });
subscribe(event => { console.log('Received event:', event); });
```

**Observability:**
- All publish/consume operations are traced with OTel.
- DLQ events are published to a dedicated subject.
- Use NATS CLI or JetStream Manager for monitoring.
- Trace context is propagated in event fields.

**Troubleshooting:**
- Ensure NATS server is running and JetStream is enabled.
- Check stream/subject configuration.
- Use DLQ subject for error analysis.
- Validate event schemas with Zod.

**References:**
- https://docs.nats.io/nats-concepts/jetstream
- https://opentelemetry.io/docs/instrumentation/js/
- https://zod.dev/

**Notes:**
- The NATS JetStream backend is designed to be LLM/agent-friendly and up to date with 2025 best practices.
- The describe() output and README provide detailed information about the backend's features and usage.
- The NATS JetStream backend supports distributed, persistent, and high-throughput event streaming for agent orchestration.
- The NATS JetStream backend is designed to be LLM/agent-friendly and up to date with 2025 best practices.
- The describe() output and README provide detailed information about the backend's features and usage.
- The NATS JetStream backend supports distributed, persistent, and high-throughput event streaming for agent orchestration.
- The NATS JetStream backend is designed to be LLM/agent-friendly and up to date with 2025 best practices.
- The describe() output and README provide detailed information about the backend's features and usage.

## Event Bus Backend Selector & Fallback (2025 Best Practices)

- The backend is selected at runtime via the `EVENT_BUS_BACKEND` environment variable or config.
- Supported backends: Kafka, NATS, Dapr, Redis, and local JSONL (default).
- If the selected backend is unavailable or not implemented, the system automatically falls back to the local JSONL backend for reliability and data safety.
- All backends implement a unified interface and support CloudEvents, Zod validation, OTel tracing, and DLQ handling.
- **Troubleshooting:**
  - If you see errors about missing or unavailable backends, check your environment variables and infrastructure.
  - Fallback to JSONL ensures no data loss, but distributed features (e.g., multi-agent streaming, DLQ, OTel) will be unavailable until the backend is restored.
  - See `memoryLaneHelper.ts` for backend selector logic and fallback implementation.

## 9. Event Log Replay & Restoration

The event log supports replay and restoration for debugging, recovery, and rollback scenarios:

- **Replay:** You can replay events from `.ai-helpers-cache/event-log.jsonl` to restore system state, debug workflows, or simulate past actions.
- **Rollback/Undo:** You can roll back to a previous state by replaying events up to a checkpoint or by undoing specific events (where supported).
- **Filtering:** Replay/rollback can be filtered by event type, agentId, correlationId, or topic for targeted restoration.
- **Dry-run:** All replay/rollback operations support dry-run mode to preview changes without applying them.
- **Restoration:** Use the replay/rollback API to restore the system to a previous state, or to simulate alternate event histories for testing.

### CLI Usage

```sh
pnpm tsx AI-Helpers/memoryLaneHelper.ts replay --from <start> --to <end> [--type <type>] [--agentId <id>] [--correlationId <id>] [--topic <topic>] [--dry-run]
```

- `--from <start>`: Start index or timestamp
- `--to <end>`: End index or timestamp
- `--type <type>`: Filter by event type
- `--agentId <id>`: Filter by agentId
- `--correlationId <id>`: Filter by correlationId
- `--topic <topic>`: Filter by topic
- `--dry-run`: Log actions, do not apply

### Programmatic API

```ts
import { replayEvents, rollbackToCheckpoint } from 'ai-helpers/memoryLaneHelper';
await replayEvents({ from: 0, to: 100, type: 'TaskAssigned', dryRun: true });
await rollbackToCheckpoint({ checkpointId: 'abc123', dryRun: false });
```

- See `memoryLaneHelper.ts` for implementation details and advanced options.
- See `agentBacklog.json` for roadmap and planned enhancements.

## 10. Checkpoint-Based Rollback & Restoration (Local JSONL)

You can now roll back to a checkpoint in the event log (by index, timestamp, or eventId) to restore system state, debug, or simulate alternate histories.

- **Replay:** Replay events up to a checkpoint for restoration or simulation.
- **Rollback/Undo:** Roll back to a previous state by replaying events up to a checkpoint.
- **Filtering:** All options (type, agentId, correlationId, topic) are supported.
- **Dry-run:** Preview actions without applying them.
- **OTel Instrumentation:** All actions emit OpenTelemetry spans for observability.

### CLI Usage

```sh
pnpm tsx AI-Helpers/memoryLaneHelper.ts rollback --checkpoint <id|timestamp|index> [--type <type>] [--agentId <id>] [--correlationId <id>] [--topic <topic>] [--dry-run]
```

### Programmatic API

```ts
import { rollbackToCheckpoint } from 'ai-helpers/memoryLaneHelper';
await rollbackToCheckpoint({ checkpoint: '2024-06-01T12:00:00Z', dryRun: true });
```

### Best Practices
- Use dry-run to preview before applying changes.
- Use filtering to target specific event types, agents, or topics.
- For distributed backends, use DLQ replay utilities.
- All actions are OTel-instrumented for traceability.

### Limitations & Future Enhancements
- Only available for the local JSONL backend.
- Distributed backends (Kafka/NATS/Dapr) use DLQ replay utilities.
- Selective undo (removing specific events) is not yet supported.
- Planned: richer checkpoint metadata, UI for checkpoint selection, and advanced restoration flows.

See README.md and agentBacklog.json for roadmap and status. 