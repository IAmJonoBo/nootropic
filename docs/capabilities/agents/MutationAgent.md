# MutationAgent

> **Status:** Implemented (2024-06). See `agents/MutationAgent.ts` for source and extension points.

## Overview

The `MutationAgent` handles live patching, mutation testing, and repair for agents/plugins, supporting:
- **LLM-Augmented Mutant Generation:** Uses LLMs to propose semantically relevant code mutants, guided by real-bug corpora (e.g., Defects4J).
- **Property-Based Fuzzing Integration:** Feeds mutants into a Hypothesis-style fuzzer for boundary/edge-case validation.
- **Patch Ensemble & Voting:** Generates multiple candidate fixes via LLMs, then applies majority-vote or semantic-equivalence checks.
- **Event-driven:** Emits events for each mutation, repair, fuzzing, and rollback.

## Usage

```ts
import { MutationAgent } from 'ai-helpers/agents';
const agent = new MutationAgent({ profile: { name: 'MutationAgent' } });
const result = await agent.runTask({ file: 'example.js', code: 'var x = 1;' });
console.log(result);
```

- To run as a service: `agent.startEventLoop()`
- To select a backend: `new MutationAgent({ backendName: 'nv-embed' })`

## Extension Points
- **Mutant Generation:** Integrate LLM and real-bug corpora (Defects4J) for richer mutants.
- **Fuzzing:** Integrate Hypothesis-style fuzzer and property-based tests.
- **Ensemble Voting:** Integrate LLM ensemble and semantic voting.

## Research References
- [StrykerJS](https://stryker-mutator.io/)
- [LiveCodeBench](https://github.com/ise-uiuc/LiveCodeBench)
- [Defects4J](https://github.com/rjust/defects4j/)
- [Hypothesis](https://hypothesis.readthedocs.io/en/latest/)
- [arXiv:2302.03494](https://arxiv.org/abs/2302.03494)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If mutant generation is too simple, extend `generateMutants()` with LLM or bug corpora.
- For custom voting, override `patchEnsembleVoting()`.

---

_Last updated: 2024-06_ 