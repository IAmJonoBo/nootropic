# CollectionAgent

Collects data in response to events. Fully event-driven.

**Usage:**

`Instantiate and call startEventLoop() to run as a service.`

## Methods/Functions

- **runTask**: (task, logger?) => Promise<AgentResult> - Collects data using available tools.
- **listTools**: () => Promise<AgentTool[]> - Lists dynamically discovered tools/plugins.
- **getContext**: () => Promise<AgentContext> - Returns the agent context.
- **startEventLoop**: () => Promise<void> - Starts the event-driven runtime loop: subscribes to DataCollectionRequested and TaskAssigned events, processes them, and emits results.

## References

- https://github.com/nootropic/nootropic
- https://github.com/nootropic/nootropic/blob/main/README.md

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

