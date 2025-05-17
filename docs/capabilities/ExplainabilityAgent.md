# ExplainabilityAgent

> **Status:** Implemented (2024-06). See `agents/ExplainabilityAgent.ts` for source and extension points.

## Overview

The `ExplainabilityAgent` provides detailed, LLM-friendly rationales and traces for any action or decision, supporting transparency and compliance:
- **Hybrid LIME/SHAP Pipelines:** Run LIME and SHAP interpretability passes to attribute decision influences at token and AST-node levels. (TODO: Integrate LIME/SHAP libraries or LLM-based interpretability)
- **Attention-Based Rationale Highlighting:** Extract and surface cross-attention weights from the LLM during code edits. (TODO: Integrate with LLM APIs for attention extraction)
- **Interactive Traceback Views:** Integrate with VS Code inline annotation APIs to display rationales alongside code changes. (TODO: Implement VS Code API integration)

## Usage

```ts
import { ExplainabilityAgent } from 'nootropic/agents';
const agent = new ExplainabilityAgent({ profile: { name: 'ExplainabilityAgent' } });
const result = await agent.runTask('Explain this code change');
console.log(result);
```

## Extension Points
- **LIME/SHAP Integration:** Integrate LIME/SHAP libraries or LLM-based interpretability for robust explanations. (TODO: Integrate LIME/SHAP)
- **Attention Extraction:** Integrate with LLM APIs for attention-based rationale highlighting. (TODO: Integrate attention extraction backend)
- **VS Code Integration:** Implement VS Code API integration for interactive tracebacks. (TODO: Implement VS Code API integration)
- **Benchmarking & Test Coverage:** Automate benchmarking and test coverage for all enhancements. (TODO: Add/expand tests and benchmarks)

## Best Practices
- Integrate LIME/SHAP for interpretability
- Extract and visualize LLM attention for transparency
- Support interactive tracebacks in developer tools
- Automate benchmarking and test coverage for all enhancements
- Document extension points and rationale in describe()

## Research References
- [LIME](https://github.com/marcotcr/lime)
- [SHAP](https://github.com/slundberg/shap)
- [VS Code API](https://code.visualstudio.com/api)
- [Attention Is All You Need (arXiv:1706.03762)](https://arxiv.org/abs/1706.03762)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If explanations are not generated as expected, check LIME/SHAP and attention extraction logic or extend with advanced backends.
- For custom tracebacks, override `showTracebackInVSCode()`.

---

_Last updated: 2024-06_ 