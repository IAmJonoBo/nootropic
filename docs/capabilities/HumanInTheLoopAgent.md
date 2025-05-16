# HumanInTheLoopAgent

> **Status:** Planned/Advanced (2024-06). See `agents/HumanInTheLoopAgent.ts` for source and extension points.

## Overview

The `HumanInTheLoopAgent` embeds human review and feedback into agentic workflows, supporting governance, active learning, and reciprocal learning.

### Advanced Features
- **Governance-Driven HITL:** Embed checkpoints where the model flags low-confidence cases (< τ threshold) for human review, following best practices from enterprise HITL frameworks.
- **Active Learning Loops:** Implement feedback loops where human corrections are stored and used for periodic fine-tuning, reducing annotation costs over time.
- **Reciprocal Learning (RHML):** Leverage Reciprocal Human-Machine Learning, where both agent and human learn from each other's corrections, improving model and human performance.
- **Event-Driven Checkpoints:** Emit events for all HITL checkpoints, reviews, and corrections for auditability and compliance.

## Usage

```ts
import { HumanInTheLoopAgent } from 'ai-helpers/agents/HumanInTheLoopAgent';
const agent = new HumanInTheLoopAgent({ profile: { name: 'HumanInTheLoopAgent' } });
await agent.runTask({ ... });
```

## Extension Points
- Integrate advanced governance and review frameworks
- Add support for active and reciprocal learning workflows
- Expand event schemas for richer auditability and compliance
- Integrate with annotation and feedback UIs

## Best Practices
- Use confidence thresholds to trigger human review
- Store and leverage human corrections for model improvement
- Emit events for all checkpoints and reviews
- Document extension points and rationale in describe()

## Research References
- [Reciprocal Human-Machine Learning (RHML)](https://arxiv.org/abs/2309.00864)
- [Enterprise HITL Frameworks](https://arxiv.org/abs/2309.00864)

## LLM/AI Usage Hints
- Use `--json` flag for machine-readable output if running via CLI.
- All outputs are schema-validated and event-driven for agentic workflows.

## Troubleshooting
- If HITL checkpoints or learning loops are not working as expected, check event emission and review logic.
- For custom workflows, override governance and learning logic.

---

_Last updated: 2024-06_ 