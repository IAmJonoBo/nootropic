# ReviewAgent

> **Status:** Implemented (2024-06). See `agents/ReviewAgent.ts` for source and extension points.

## Overview

The `ReviewAgent` provides advanced, LLM/AI-friendly review of drafts and content, supporting:
- **Sentiment and Aspect Analysis:** Tags content with sentiment (positive/neutral/negative) and extracts key aspects (clarity, logic, redundancy).
- **Multi-Pass Chain-of-Thought (SCoT):** Performs structured, multi-pass review for logic, redundancy, and clarity.
- **Ensemble Scoring:** Aggregates feedback from multiple models for robust critique (stubbed, extensible).
- **Event-driven:** Subscribes to `DraftCreated`, `ReviewRequested`, and `TaskAssigned` events; emits `DraftReviewed`, `ReviewFeedback`, `TaskCompleted`, and `Log` events.

## Usage

```ts
import { ReviewAgent } from 'ai-helpers/agents';
const agent = new ReviewAgent({ profile: { name: 'ReviewAgent' } });
const result = await agent.runTask({ id: 't1', description: 'Review draft', content: 'This is an excellent draft because it is clear.' });
console.log(result);
```

- To run as a service: `agent.startEventLoop()`
- To select a backend: `new ReviewAgent({ backendName: 'huggingface' })`

## Extension Points
- **Sentiment/Aspect Analysis:** Integrate HuggingFace, Ollama, or local LLMs for richer analysis.
- **Ensemble Scoring:** Plug in multiple models (llama.cpp, micro-LLMs) and aggregate results.
- **Chain-of-Thought:** Extend multi-pass logic for domain-specific review.

## Research References
- [Chain-of-Thought Prompting](https://arxiv.org/abs/2201.11903)
- [Ensemble Methods in NLP](https://aclanthology.org/2020.acl-main.111/)
- [LLM Sentiment Analysis](https://huggingface.co/tasks/sentiment-analysis)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If sentiment/aspect analysis is too simple, configure a richer backend or extend the method.
- For custom scoring, override `ensembleScoring()`.

---

_Last updated: 2024-06_ 