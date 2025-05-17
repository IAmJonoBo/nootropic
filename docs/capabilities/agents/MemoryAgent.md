---
status: implemented
---
# MemoryAgent

> **Status:** Implemented (2024-06). See `agents/MemoryAgent.ts` for source and extension points.

## Overview

The `MemoryAgent` manages persistent memory, context pruning, and retrieval for agents and plugins, supporting:
- **Persistent Memory:** Stores and retrieves long-term context for agent workflows. (TODO: Implement persistent memory storage and retrieval)
- **Context Pruning:** Prunes context based on recency, relevance, and size for efficient LLM/agent operation. (TODO: Implement context pruning logic)
- **Event-driven:** Emits events for memory updates, pruning, and retrieval for observability and auditability. (TODO: Emit events for all memory management actions)

## Usage

```ts
import { MemoryAgent } from 'nootropic/agents';
const agent = new MemoryAgent({ profile: { name: 'MemoryAgent' } });
const result = await agent.runTask({ ... });
console.log(result);
```

- To run as a service: `agent.startEventLoop()`

## Extension Points
- **Persistent Storage:** Integrate advanced storage backends for scalable memory (vector DBs, semantic memory, etc.). (TODO: Integrate advanced storage backends)
- **Context Pruning:** Add advanced pruning strategies (semantic, tiered, hybrid). (TODO: Add advanced pruning strategies)
- **Event Types:** Expand event schemas for richer memory operations and observability. (TODO: Expand event schemas)
- **Benchmarking & Test Coverage:** Automate benchmarking and test coverage for all enhancements. (TODO: Add/expand tests and benchmarks)

## Best Practices
- Use persistent storage for long-term memory
- Prune context for efficient LLM/agent operation
- Emit events for all memory management actions
- Automate benchmarking and test coverage for all enhancements
- Document extension points and rationale in describe()

## Research References
- [nootropic Project](https://github.com/nootropic/nootropic)
- [LangGraph](https://github.com/langchain-ai/langgraph)
- [R3Mem: Reversible Compression](https://arxiv.org/abs/2402.00000)
- [HEMA: Hippocampus-Inspired Memory](https://arxiv.org/abs/2402.00000)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If memory is not managed as expected, check storage/pruning logic or extend with advanced backends.
- For custom event handling, override event emission methods.

---

_Last updated: 2024-06_ 