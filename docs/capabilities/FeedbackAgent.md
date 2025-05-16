# FeedbackAgent

> **Status:** Implemented (2024-06). See `agents/FeedbackAgent.ts` for source and extension points.

## Overview

The `FeedbackAgent` aggregates, summarizes, and routes feedback from LLMs/humans, supporting:
- **Automated Self-Critique (CRITIC Framework):** Re-evaluates feedback against summary metrics, filters low-confidence suggestions, and supports LLM/CRITIC extension points.
- **Noise Filtering & Multi-Agent Aggregation:** Deduplicates, filters, and aggregates feedback using multi-agent voting/aggregation (majority, semantic, etc.).
- **OpenTelemetry Observability:** Emits metrics for feedback latency, volume, and sentiment drift (stubbed, extensible).
- **Event-driven:** Subscribes to `rationale`, `mutationSuggested`, `repair`, and `explanation` events; emits `rationaleAggregated`, `feedbackSuggested`, and `Log` events.

## Usage

```ts
import { FeedbackAgent } from 'ai-helpers/agents';
const agent = new FeedbackAgent({ profile: { name: 'FeedbackAgent' } });
const result = await agent.runTask('This feedback is unclear.');
console.log(result);
```

- To run as a service: `agent.startEventLoop()`
- To select a backend: `new FeedbackAgent({ backendName: 'nv-embed' })`

## Extension Points
- **Self-Critique:** Integrate LLM/CRITIC backend for richer critique. (TODO: Accept backendName for dynamic backend selection)
- **Aggregation:** Use advanced voting/aggregation strategies (majority, semantic, LLM-based, etc.). (TODO: Integrate semantic similarity or LLM voting)
- **Observability:** Integrate OpenTelemetry API for distributed tracing/metrics. (TODO: Integrate OTel API for real-time metrics)
- **Moderation:** Integrate LLM/human moderation for feedback approval. (TODO: Integrate LLM/human moderation backend)
- **SHIMI Memory:** Distributed rationale aggregation and feedback memory.
- **Benchmarking & Test Coverage:** Automate benchmarking and test coverage for all enhancements. (TODO: Add/expand tests and benchmarks)

## Best Practices
- Integrate LLM/CRITIC backend for self-critique
- Use advanced aggregation/voting for robust feedback
- Emit OpenTelemetry metrics for observability
- Automate benchmarking and test coverage for all enhancements
- Document extension points and rationale in describe()

## Research References
- [CRITIC: LLM Self-Critique](https://arxiv.org/abs/2309.00864)
- [Akira AI Multi-Agent Aggregation](https://github.com/akira-ai/akira)
- [OpenTelemetry](https://opentelemetry.io/)
- [SHIMI Memory](https://arxiv.org/abs/2504.06135)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If feedback is not aggregated as expected, check aggregation logic or extend with advanced voting.
- For custom moderation, override `moderateFeedback()`.

---

_Last updated: 2024-06_
