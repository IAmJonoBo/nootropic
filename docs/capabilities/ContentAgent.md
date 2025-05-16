# ContentAgent

> **Status:** Implemented (2024-06). See `agents/ContentAgent.ts` for source and extension points.

## Overview

The `ContentAgent` generates content drafts and responds to feedback, supporting:
- **RAG-Driven Planning:** Ingests domain docs and generates a content outline before drafting. (TODO: Integrate RAG pipeline for outline generation)
- **Map-Reduce Summarisation:** Chunks drafts, summarises pieces, then synthesises for coherence on limited-context LLMs. (TODO: Integrate map-reduce summarisation logic)
- **Adaptive Tone Tuning:** Adjusts tone and style on-the-fly based on feedback using instruction-tuned embedding models. (TODO: Integrate instruction-tuned embedding model)
- **Event-driven:** Subscribes to `TaskAssigned` and `DraftFeedback` events; emits `Log` and `TaskCompleted` events.

## Usage

```ts
import { ContentAgent } from 'ai-helpers/agents';
const agent = new ContentAgent({ profile: { name: 'ContentAgent' } });
const result = await agent.runTask({ contentPlan: { ... } });
console.log(result);
```

- To run as a service: `agent.startEventLoop()`

## Extension Points
- **RAG Pipeline:** Integrate a RAG pipeline for domain doc ingestion and outline generation. (TODO: Integrate RAG pipeline)
- **Map-Reduce Summarisation:** Integrate map-reduce summarisation for long outputs. (TODO: Integrate summarisation logic)
- **Tone Tuning:** Integrate instruction-tuned embedding model for adaptive tone and style. (TODO: Integrate tone tuning backend)
- **Benchmarking & Test Coverage:** Automate benchmarking and test coverage for all enhancements. (TODO: Add/expand tests and benchmarks)

## Best Practices
- Integrate RAG pipeline for robust planning
- Use map-reduce summarisation for long content
- Tune tone/style using feedback and embedding models
- Automate benchmarking and test coverage for all enhancements
- Document extension points and rationale in describe()

## Research References
- [LangChain](https://github.com/hwchase17/langchain)
- [RAG for Content Generation (arXiv:2304.05128)](https://arxiv.org/abs/2304.05128)
- [Instructor Embedding](https://github.com/instructor-large/instructor-embedding)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If content is not generated as expected, check RAG and summarisation logic or extend with advanced backends.
- For custom tone tuning, override `adaptiveToneTuning()`.

---

_Last updated: 2024-06_ 