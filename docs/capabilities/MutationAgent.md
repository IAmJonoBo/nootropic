# MutationAgent

> **Status:** Implemented (2024-06). See `agents/MutationAgent.ts` for source and extension points.

## Overview

The `MutationAgent` handles live patching, mutation testing, and rollback for agents/plugins, supporting:
- **LLM-Augmented Mutant Generation:** Uses LLMs to propose semantically relevant code mutants, guided by real-bug corpora (e.g., Defects4J). (TODO: Integrate LLM and real-bug corpora)
- **Property-Based Fuzzing:** Feeds mutants into a Hypothesis-style fuzzer for boundary/edge-case validation. (TODO: Integrate property-based fuzzing)
- **Patch Ensemble & Voting:** Generates multiple candidate fixes via LLMs, then applies majority-vote or semantic-equivalence checks. (TODO: Integrate LLM ensemble and semantic voting)
- **Event-driven:** Emits events for each mutation, repair, fuzzing, and rollback for auditability.

## Usage

```ts
import { MutationAgent } from 'ai-helpers/agents';
const agent = new MutationAgent({ profile: { name: 'MutationAgent' }, backendName: 'nv-embed' });
const result = await agent.runTask({ file: 'example.ts', code: 'var x = 1;' });
console.log(result);
```

## Extension Points
- **LLM/Ensemble Integration:** Integrate advanced LLMs and ensemble strategies for mutant generation and repair. (TODO: Integrate LLM/ensemble)
- **Fuzzing:** Integrate property-based fuzzing for robust validation. (TODO: Integrate property-based fuzzing)
- **Semantic Voting:** Integrate semantic voting for patch selection. (TODO: Integrate semantic voting)
- **Benchmarking & Test Coverage:** Automate benchmarking and test coverage for all enhancements. (TODO: Add/expand tests and benchmarks)

## Best Practices
- Integrate StrykerJS for mutation testing
- Use LLM-driven repair for surviving mutants
- Integrate property-based fuzzing for robust validation
- Emit events for all mutation/repair/fuzzing/rollback actions
- Support rollback and auditability
- Automate benchmarking and test coverage for all enhancements
- Document event schemas and rationale in describe()

## Research References
- [StrykerJS](https://stryker-mutator.io/)
- [LiveCodeBench](https://github.com/ise-uiuc/LiveCodeBench)
- [Defects4J](https://github.com/rjust/defects4j/)
- [Hypothesis](https://hypothesis.readthedocs.io/en/latest/)
- [Mutation Testing (arXiv:2302.03494)](https://arxiv.org/abs/2302.03494)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If mutants or repairs are not generated as expected, check LLM/ensemble and fuzzing logic or extend with advanced backends.
- For custom rollback, override `rollback()`.

---

_Last updated: 2024-06_ 