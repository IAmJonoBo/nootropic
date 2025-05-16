# LLM & Agent Integration Guide

[//]: # (Rebranding note: This file was updated from 'AI-Helpers' to 'nootropic'. Legacy references are archived in .ai-helpers-cache/archive/ for rollback.)

## Overview

How to integrate nootropic with LLMs, agent frameworks, and automation systems for optimal performance and discoverability.

---

## 1. Discovering Capabilities

- Use the CLI:
  ```sh
  pnpm run ai-helpers list-capabilities
  ```
- Use the programmatic API:
  ```ts
  import { listCapabilities } from 'ai-helpers';
  const caps = await listCapabilities();
  console.log(caps);
  ```
- **How it works:**
  - The discovery API dynamically aggregates all `describe()` exports from core modules (orchestration, utils, quality, context, semantic index, etc.), always reflecting the latest code and available features.
  - The CLI and programmatic API are always up to date and introspectable, with no need to maintain a static registry.
  - Each capability includes types, usage, and (where available) schema information for LLM/agent use.
  - (Planned) JSON Schema and OpenAPI spec export for advanced LLM/agent workflows.

---

## 2. Tool/Function Calling

- All helpers/tools have clear TypeScript input/output types and (optionally) JSON schema in their `describe()` output.
- Use the `.describe()` static method or export to get a self-description:
  ```ts
  import { OrchestrationEngine } from 'ai-helpers';
  console.log(OrchestrationEngine.describe());
  ```
- Example agent workflow:
  1. List capabilities
  2. Select tool/helper
  3. Read `.describe()` for usage, types, and schema
  4. Call with type-safe arguments

---

## 3. Context & Data Access

- Use chunked/context-window-friendly APIs (e.g., `getContextChunk(size)`) to retrieve data sized for your LLM.
- All outputs are available in both JSON and Markdown for LLM and human consumption.

---

## 4. Prompt Versioning & Output Parsing

- Use prompt versioning to track and audit changes to prompts.
- Parse LLM outputs with robust utilities to ensure structured data (e.g., JSON) is always valid.

---

## 5. Example Agent Workflows

- **Discovery:**
  ```ts
  const caps = await listCapabilities();
  ```
- **Invocation:**
  ```ts
  const engine = getOrchestrationEngine('langchain');
  const result = await engine.runAgentTask(profile, task, context);
  ```
- **Context Chunking:**
  ```ts
  const chunk = await getContextChunk(32000); // 32k tokens
  ```
- **Error Handling:**
  - All helpers return structured error results; check `success` and `logs` fields.

---

## 6. FAQ & Troubleshooting

**Q: How do I find all available helpers/tools?**
A: Use the CLI, programmatic API, or check the capability registry.

**Q: How do I use a helper from an LLM or agent?**
A: Import the helper, check its `.describe()` method, and call it with type-safe arguments.

**Q: How do I get context-sized for my LLM?**
A: Use the chunked context APIs (e.g., `getContextChunk(size)`).

**Q: How do I get a machine-readable list of all capabilities?**
A: Use the programmatic API or read `ai-helpers-capabilities.json`.

---

## 7. Advanced: OpenAPI/JSON Schema

- All programmatic APIs are strictly typed; JSON schema or OpenAPI specs are available for advanced LLMs and automation.

---

## 8. Error Handling & Observability (Planned)

- All helpers/tools return structured errors (with code, message, and context).
- (Planned) Observability hooks/events for agent/LLM tool use, errors, and results.

---

## Intelligent, Token-Aware Handover Payloads

AI-Helpers provides advanced, research-backed context handoff for LLM/agent workflows. When the context window approaches 80% utilization, the system can automatically generate an optimized payload using a hybrid of:
- **Sliding window** (recent N messages/events)
- **Vector retrieval** (most relevant old context, via semantic search)
- **Summarization** (for the rest)

All context items are labeled with relevance, permanence, and type. The payload is prioritized and compressed to fit the token budget, with critical information placed first for maximal LLM attention.

### Agent Context Configuration

Each agent or tool can define its own context configuration:
- `criticalTypes`: Types of context that are always included (e.g., user intent, plan, code diff)
- `slidingWindowSize`: Number of recent messages/events to always include
- `maxTokens`: Max tokens for the context window (default: 80% of model limit)
- `excludeTypes`: Types to always exclude

See `AgentContextConfig` in `contextSnapshotHelper.ts` for schema and usage.

### CLI/API Usage

You can generate an optimized handover payload using the CLI:

```sh
pnpm ai-helpers handover-payload \
  --critical-types user_intent,plan,code_diff \
  --sliding-window 10 \
  --max-tokens 16000 \
  --exclude-types ephemeral \
  --context-file .ai-helpers-cache/context.json \
  --json
```

Or programmatically via:

```ts
import { getOptimizedHandoverPayload } from 'ai-helpers/contextSnapshotHelper';
const { payload, log } = getOptimizedHandoverPayload(contextArr, agentConfig);
```

### Best Practices
- Use agent-specific context configuration for optimal results.
- Monitor context window usage and trigger handoff at 80% utilization.
- Log all handoff events and context composition for observability.
- Place critical information at the start of the context window for best LLM performance.

This system ensures robust, efficient, and agent-usable handoff for all LLM/agent workflows.

## Codebase Hygiene and DRY Utilities

- All directory and file listing is now handled by a single, robust utility: `listFilesRecursive` (in `utils.ts`), which uses the well-maintained `rrdir` package for recursive, efficient, and DRY file discovery.
- Error logging is centralized via `errorLogger`.
- Dead code, unused exports, and files are detected using [Knip](https://knip.dev/). Run `pnpm knip` to generate a report and keep the codebase lean.

## LLM/Agent Memory and Payload Optimization

- All context handoff and snapshot utilities are optimized for minimal, relevant payloads for LLM/agent workflows.
- Use `getContextChunk(size)` (from `contextSnapshotHelper.ts`) to retrieve a context snapshot chunked to a specific byte size, ensuring efficient memory usage and agent handoff.
- All APIs and CLI commands are designed for context-window efficiency and structured output.

## Modular Agent Architecture & Dynamic Tool Registry

### BaseAgent

- The `BaseAgent` class (in `agents/BaseAgent.ts`) is the foundation for all agent logic in AI-Helpers.
- It supports:
  - **Dynamic tool discovery**: Agents can list and invoke tools/plugins at runtime via the plugin registry.
  - **Structured output enforcement**: All outputs are validated against schemas for LLM/agent reliability.
  - **LLM/agent introspection**: The `describe()` method provides metadata, usage, and schema for agent/LLM consumption.
- Extend `BaseAgent` to create specialized agents (e.g., DataCollectorAgent, WriterAgent) by overriding `runTask`, `getContext`, etc.

### Example Usage

```ts
import { BaseAgent } from 'ai-helpers';
const agent = new BaseAgent({ profile: { name: 'myAgent' } });
const tools = await agent.listTools();
const result = await agent.runTask({ id: 't1', description: 'Do something' });
```

### Introspection & Schema

- All agents and tools export a `describe()` method with schema metadata for LLM/agent workflows.
- Example:

```json
{
  "name": "BaseAgent",
  "description": "Modular, extensible agent class with dynamic tool discovery and structured output.",
  "methods": [
    { "name": "runTask", "signature": "(task, logger?) => Promise<AgentResult>", "description": "Runs a task using available tools." },
    { "name": "listTools", "signature": "() => Promise<AgentTool[]>", "description": "Lists dynamically discovered tools/plugins." },
    { "name": "getContext", "signature": "() => Promise<AgentContext>", "description": "Returns the agent context." }
  ],
  "usage": "const agent = new BaseAgent({ profile }); await agent.runTask(task);",
  "schema": { /* ... see code ... */ }
}
```

- See the README for more details and usage patterns.

--- 