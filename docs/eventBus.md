# Event Bus Architecture & Distributed Backends

## Overview

nootropic uses a modular, pluggable event bus system to enable robust, observable, and distributed communication between agents, plugins, and orchestration components. The event bus supports multiple backends, including file-based (JSONL), NATS (default), and planned support for Kafka and Dapr.

## Key Features

- **Pluggable Adapters:** Easily swap event bus backends via configuration or environment variables.
- **Distributed Support:** NATS backend is fully implemented and production-ready. Kafka and Dapr are planned.
- **Type Safety:** All events conform to strict Zod schemas (`AgentEvent`, `DLQEvent`).
- **Observability:** All operations emit OpenTelemetry (OTel) traces and metrics.
- **CloudEvents Compatibility:** Event payloads are designed for interoperability.
- **DLQ Handling:** Failed events are routed to a Dead Letter Queue (DLQ) topic/subject/stream.

## Supported Backends

### 1. JSONL (File-Based, Default for Local)

- Simple, append-only log for local development and testing.
- Not suitable for distributed or production use.

### 2. NATS (Default Distributed Backend)

- Lightweight, cloud-native, and fast.
- Supports topics, JetStream persistence, and DLQ.
- Configurable via environment variables:
  - `NATS_URL` (default: `nats://localhost:4222`)
  - `NATS_STREAM`, `NATS_SUBJECT`, `NATS_DLQ_SUBJECT`
- **Usage Example:**

  ```ts
  import { publishEvent, subscribeToTopic } from '../memoryLaneHelper';
  publishEvent({ type: 'TaskAssigned', agentId: 'agent1', timestamp: new Date().toISOString(), payload: { task: ... } });
  subscribeToTopic('TaskAssigned', event => { /* handle event */ });
  ```

### 3. Kafka (Planned)

- High-throughput, persistent, strong ordering.
- Adapter stub exists; see `adapters/KafkaEventBus.ts`.
- Will support DLQ and OTel.

### 4. Dapr (Planned)

- Sidecar abstraction, supports multiple backends.
- Adapter stub exists; see `adapters/DaprEventBus.ts`.

## Best Practices

- **Use the Unified API:** Always use the exported `publishEvent`, `subscribeToTopic`, etc. from `memoryLaneHelper.ts`.
- **Validate Events:** All events are validated at runtime using Zod schemas.
- **Observability:** Instrument custom adapters with OTel for traces and metrics.
- **DLQ:** Ensure failed events are routed to DLQ for reliability.
- **CloudEvents:** Follow CloudEvents spec for payloads when extending event types.

## Extension Points

- Implement new adapters by extending the `EventBusBackend` or `EventBusAdapter` interface (see `types/AgentOrchestrationEngine.ts`).
- Reference NATS implementation in `memoryLaneHelper.ts` for best practices.
- Add new adapters in the `adapters/` directory.

## Contributor Guidance

- See `types/AgentOrchestrationEngine.ts` for canonical event types and schemas.
- Reference OTel and CloudEvents documentation for advanced integrations.
- Add tests and usage examples for new adapters.

## References

- [NATS Documentation](https://docs.nats.io/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Dapr Pub/Sub](https://docs.dapr.io/developing-applications/building-blocks/pubsub/)
- [CloudEvents Spec](https://cloudevents.io/)
- [OpenTelemetry](https://opentelemetry.io/)

## Rationale, Mutation, and Self-Healing Events

- **Rationale, mutation, and self-healing events** (e.g., `rationale`, `mutationSuggested`, `reasoningStep`, `repair`, `explanation`) are now emitted to the distributed event bus by all agents and utilities.
- **Subscribe to these events** using `subscribeToTopic('rationale', handler)` or similar for distributed LLM/agent introspection, dashboards, or feedback loops.
- **Best Practice:** Always emit rationale/mutation/self-healing events with proper schema and agentId for traceability and observability.
- **Example:**

  ```ts
  import { subscribeToTopic } from '../memoryLaneHelper';
  subscribeToTopic('rationale', event => { /* handle rationale event */ });
  subscribeToTopic('mutationSuggested', event => { /* handle mutation/self-healing event */ });
  ```

- **All events are observable** via OTel and can be consumed by distributed agents, plugins, or external dashboards.

## Distributed Rationale Aggregation & Feedback Loop

- **FeedbackAgent** subscribes to `rationale`, `mutationSuggested`, `repair`, and `explanation` events, aggregates by `correlationId`, and emits `rationaleAggregated` and `feedbackSuggested` events for distributed LLM/human feedback loops.
- **Pattern:** Any agent or plugin can subscribe to these aggregation events for further action, moderation, or dashboarding.
- **Example:**

  ```ts
  import { FeedbackAgent } from '../agents/FeedbackAgent';
  const agent = new FeedbackAgent({ profile: { name: 'FeedbackAgent' } });
  await agent.startEventLoop();
  // Now aggregates rationale/mutation/repair/explanation events and emits rationaleAggregated/feedbackSuggested
  ```

- **Event Types:**
  - `rationaleAggregated`: Aggregated rationale/feedback for a task or correlationId.
  - `feedbackSuggested`: Actionable feedback for LLM/human review or escalation.

- **Next Steps:**
  - Implement SHIMI-style decentralized memory for scalable, explainable aggregation ([arXiv:2504.06135](https://arxiv.org/abs/2504.06135)).
  - Add advanced feedback moderation and distributed explainability dashboards.

## SHIMI-Style Semantic Hierarchical Memory (Decentralized)

- **SHIMI (Semantic Hierarchical Memory Index)** enables scalable, decentralized agent reasoning and feedback aggregation.
- Implements a semantic tree for memory organization, supporting entity insertion (semantic descent, sibling matching/merging, abstraction/compression), semantic retrieval (top-down traversal, pruning), and decentralized sync (Merkle-DAG, Bloom filter, CRDT merge).
- **Integration:** Designed to work with FeedbackAgent (for distributed rationale aggregation) and ContextManager (for context tiering, pruning, and restoration).
- **Reference:** [SHIMI Paper (arXiv:2504.06135)](https://arxiv.org/abs/2504.06135)
- **Backlog:** See `agentBacklog.json` for actionable items: LLM/embedding backend, CRDT merge, tests/docs, integration, and evaluation.

### Core Algorithms
- **Entity Insertion:**
  - Semantic descent from root nodes, using LLM/embedding similarity to find insertion point.
  - Sibling matching/merging to avoid duplication; triggers abstraction/compression if branching exceeds max.
- **Semantic Retrieval:**
  - Top-down traversal, expanding only nodes above similarity threshold.
  - Returns entities from relevant leaves, supporting explainable retrieval paths.
- **Decentralized Sync:**
  - Merkle-DAG root hash for divergence detection.
  - Bloom filter for efficient subtree comparison.
  - CRDT-style merge for eventual consistency across agent nodes.

### Best Practices
- Use strict TypeScript and type-safe semantic trees.
- Integrate a pluggable LLM/embedding backend for semantic similarity and merging.
- Automate describe/docs compliance for registry discoverability.
- Evaluate retrieval and sync against vector-based baselines for accuracy, speed, and explainability.
- Use FeedbackAgent and ContextManager for distributed aggregation, tiering, and restoration.

### Example Usage
```ts
import { ShimiMemory } from '../utils/context/shimiMemory';
const shimi = new ShimiMemory();
await shimi.insertEntity({ concept: 'agent reasoning', explanation: 'multi-agent task allocation' });
const results = await shimi.retrieveEntities('task allocation');
```

### Next Steps
- Integrate LLM/embedding backend for semantic similarity/merging.
- Implement CRDT merge logic for decentralized sync.
- Add tests and documentation for SHIMI memory.
- Integrate with FeedbackAgent and ContextManager.
- Evaluate against vector-based baseline.

## SHIMI Memory: Test Coverage & Evaluation

- **Test suite:** See `tests/shimiMemory.test.ts` for comprehensive tests covering:
  - Entity insertion and semantic tree structure
  - Semantic retrieval
  - CRDT merge (idempotence, commutativity, associativity)
  - Pluggable backend
  - Edge cases (empty, duplicate, deep merge)
- **How to run:** `pnpm test` or your project's test runner.
- **Status:** SHIMI memory is linter-clean, CRDT merge logic is implemented, and all core behaviors are tested.
- **Next:** Integrate with FeedbackAgent and ContextManager, and benchmark against vector-based baselines for retrieval and sync quality.
