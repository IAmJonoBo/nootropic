# HumanInTheLoopAgent

Embeds human review and feedback into agentic workflows, supporting governance, active learning, and reciprocal learning. Advanced features: governance-driven HITL, active learning loops, reciprocal learning (RHML), event-driven checkpoints. Extension points: governance/review frameworks, active/reciprocal learning, event schemas, annotation UIs. Best practices: Use confidence thresholds to trigger human review, store and leverage human corrections, emit events for all checkpoints and reviews, document extension points and rationale. Reference: RHML, enterprise HITL frameworks.

**Usage:**

`import { HumanInTheLoopAgent } from 'nootropic/agents';`

## Methods/Functions

- **runTask**: (task) => Promise<AgentResult> - Runs a human-in-the-loop task.
- **init**: () => Promise<void> - Initialize the agent.
- **shutdown**: () => Promise<void> - Shutdown the agent.
- **reload**: () => Promise<void> - Reload the agent.
- **listTools**: () => Promise<AgentTool[]> - Lists available tools/plugins.
- **getContext**: () => Promise<AgentContext> - Returns the agent context.
- **startEventLoop**: () => Promise<void> - Starts the event-driven runtime loop.
- **health**: () => Promise<HealthStatus> - Health check for HumanInTheLoopAgent.

## Schema

```json
{}
```
## References

- https://github.com/nootropic/nootropic
- https://github.com/nootropic/nootropic/blob/main/README.md

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

