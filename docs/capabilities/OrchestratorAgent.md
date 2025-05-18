# OrchestratorAgent

Coordinates multi-agent workflows, delegates tasks, and manages dependencies between agents.

**Usage:**

`import { OrchestratorAgent } from 'nootropic/agents';`

## Methods/Functions

- **runTask**: (task, logger?) => Promise<AgentResult> - Runs an orchestrated workflow.
- **listTools**: () => Promise<AgentTool[]> - Lists available tools/plugins.
- **getContext**: () => Promise<AgentContext> - Returns the agent context.
- **startEventLoop**: () => Promise<void> - Starts the event-driven runtime loop.

## Schema

```json
{}
```
## References

- https://github.com/nootropic/nootropic
- https://github.com/nootropic/nootropic/blob/main/README.md

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

