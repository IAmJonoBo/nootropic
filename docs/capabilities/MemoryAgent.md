# MemoryAgent

Manages persistent memory, context pruning, and retrieval for agents and plugins.

**Usage:**

`import { MemoryAgent } from 'nootropic/agents';`

## Methods/Functions

- **runTask**: (task) => Promise<AgentResult> - Runs a memory/context management task.
- **init**: () => Promise<void> - Initialize the agent.
- **shutdown**: () => Promise<void> - Shutdown the agent.
- **reload**: () => Promise<void> - Reload the agent.
- **listTools**: () => Promise<AgentTool[]> - Lists available tools/plugins.
- **getContext**: () => Promise<AgentContext> - Returns the agent context.
- **startEventLoop**: () => Promise<void> - Starts the event-driven runtime loop.
- **health**: () => Promise<HealthStatus> - Health check for MemoryAgent.

## Schema

```json
{}
```
## References

- https://github.com/nootropic/nootropic
- https://github.com/nootropic/nootropic/blob/main/README.md

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

