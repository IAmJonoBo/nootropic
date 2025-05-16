# CollectionAgent

> **Status:** Implemented (2024-06). See `agents/CollectionAgent.ts` for source and extension points.

## Overview

The `CollectionAgent` collects data in response to events, supporting:
- **Tool Aggregation:** Dynamically discovers and invokes available tools/plugins to collect data for a given query.
- **Event-driven:** Subscribes to `DataCollectionRequested` and `TaskAssigned` events; emits `DataCollected`, `TaskCompleted`, and `Log` events.
- **Extensible:** Designed for easy integration of new tools and event types. (TODO: Add/expand tool/plugin registry integration)

## Usage

```ts
import { CollectionAgent } from 'ai-helpers/agents';
const agent = new CollectionAgent({ profile: { name: 'CollectionAgent' } });
const result = await agent.runTask({ id: 't1', description: 'Collect data', query: 'example' });
console.log(result);
```

- To run as a service: `agent.startEventLoop()`

## Extension Points
- **Tool/Plugin Aggregation:** Integrate additional tools/plugins for richer data collection. (TODO: Expand tool/plugin registry integration)
- **Event Types:** Add support for new event types and workflows. (TODO: Add/expand event subscriptions)
- **Benchmarking & Test Coverage:** Automate benchmarking and test coverage for all enhancements. (TODO: Add/expand tests and benchmarks)

## Best Practices
- Use dynamic tool discovery for extensibility
- Emit structured events for observability and debugging
- Automate benchmarking and test coverage for all enhancements
- Document extension points and rationale in describe()

## Research References
- [AI-Helpers Project](https://github.com/AI-Helpers/AI-Helpers)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If data is not collected as expected, check tool/plugin integration or extend with additional tools.
- For custom event handling, override `startEventLoop()`.

---

_Last updated: 2024-06_ 