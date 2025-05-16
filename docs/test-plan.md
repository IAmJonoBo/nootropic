# nootropic Orchestration Engine Test Plan

[//]: # (Rebranding note: This file was updated from 'AI-Helpers' to 'nootropic'. Legacy references are archived in .ai-helpers-cache/archive/ for rollback.)

## Overview
This test plan covers the modular orchestration engine system in nootropic, ensuring correctness, extensibility, and DRY compliance.

---

## 1. Adapter Unit Tests
- **Goal:** Each adapter (LangChain, CrewAI, Semantic Kernel, etc.) should implement the interface and handle basic method calls.
- **Tests:**
  - `runAgentTask` returns a valid AgentResult (even if a stub)
  - `getAgentContext` returns a valid AgentContext
  - `listAgents` returns an array (empty or stub)
- **Example:**
  ```ts
  import { LangChainAdapter } from '../langchainAdapter';
  test('LangChainAdapter.runAgentTask returns stub', async () => {
    const adapter = new LangChainAdapter();
    const result = await adapter.runAgentTask({ name: 'A' }, { id: 't', description: 'd' });
    expect(result).toHaveProperty('success');
  });
  ```

---

## 2. Selector Integration Tests
- **Goal:** The selector returns the correct adapter for each engine name.
- **Tests:**
  - `getOrchestrationEngine('langchain')` returns LangChainAdapter
  - `getOrchestrationEngine('crewAI')` returns CrewAIAdapter
  - `getOrchestrationEngine('semanticKernel')` returns SemanticKernelAdapter

---

## 3. CLI Integration Tests
- **Goal:** The CLI runs with different engines and prints results.
- **Tests:**
  - CLI with `--engine langchain` prints stub result
  - CLI with `--engine crewAI` prints stub result
  - CLI with `--engine semanticKernel` prints stub result
  - CLI with missing required args prints help/error

---

## 4. Extension Tests
- **Goal:** Adding a new adapter is DRY and does not break existing code.
- **Tests:**
  - Add a dummy adapter, update selector/type, and verify all tests still pass

---

## 5. Event Bus & Audit Log Tests
- **Goal:** Ensure all agent actions emit structured events, audit logs are persisted, and the event log is replayable.
- **Tests:**
  - Emitting an event via `publishEvent` appends to `.ai-helpers-cache/event-log.jsonl`
  - `getEvents` returns all events, filtered by type/agentId
  - `logEvent` creates a Log event with correct level/message
  - CLI: `append`, `get`, and `tail` commands work as expected
  - Event log is append-only and replayable
  - Legacy `memoryLane.json` is still updated for backward compatibility
- **Example:**
  ```ts
  import { publishEvent, getEvents, logEvent } from '../memoryLaneHelper';
  test('publishEvent appends to event log', async () => {
    await publishEvent({ type: 'TestEvent', timestamp: new Date().toISOString() });
    const events = await getEvents({ type: 'TestEvent' });
    expect(events.length).toBeGreaterThan(0);
  });
  ```

---

## Best Practices
- Use only local types/interfaces from `types/AgentOrchestrationEngine.ts`.
- Keep all test code modular and DRY.
- Prefer integration tests for CLI and selector.

---

## Next Steps
- Implement real framework integrations in adapters.
- Expand tests as new engines are added. 