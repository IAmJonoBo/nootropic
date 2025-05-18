# MutationAgent

Handles live patching, mutation testing (StrykerJS), LLM-augmented mutant generation, property-based fuzzing, patch ensemble/voting, and rollback for agents/plugins. Emits events for each mutation, repair, fuzzing, and rollback. Extension points for LLM/ensemble, fuzzing, and semantic voting. Best practices: Integrate StrykerJS for mutation testing, use LLM-driven repair for surviving mutants, integrate property-based fuzzing for robust validation, emit events for all mutation/repair/fuzzing/rollback actions, support rollback and auditability, document event schemas and rationale in describe(). References arXiv:2302.03494, LiveCodeBench, StrykerJS, Defects4J, Hypothesis.

**Usage:**

`import { MutationAgent } from 'nootropic/agents'; const agent = new MutationAgent({ profile: { name: 'MutationAgent' }, backendName: 'nv-embed' }); await agent.runTask({ ... });`

## Methods/Functions

- **runTask**: (task) => Promise<AgentResult> - Runs a mutation/patching/repair task. Integrates LLM/embedding backend if available.
- **generateMutants**: (code: string) => Promise<unknown[]> - LLM-augmented mutant generation, guided by real-bug corpora.
- **propertyBasedFuzz**: (mutant: unknown) => Promise<{ passed: boolean; details?: string }> - Property-based fuzzing for boundary/edge-case validation.
- **patchEnsembleVoting**: (candidates: unknown[]) => Promise<unknown> - Patch ensemble/voting (majority/semantic equivalence).
- **listTools**: () => Promise<AgentTool[]> - Lists available tools/plugins.
- **getContext**: () => Promise<AgentContext> - Returns the agent context.
- **startEventLoop**: () => Promise<void> - Starts the event-driven runtime loop.
- **health**: () => Promise<HealthStatus> - Health check for MutationAgent.

## References

- https://stryker-mutator.io/
- https://arxiv.org/abs/2302.03494
- https://github.com/ise-uiuc/LiveCodeBench
- https://github.com/rjust/defects4j/
- https://hypothesis.readthedocs.io/en/latest/
- README.md#mutationagent
- docs/ROADMAP.md#mutationagent

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

