# FormalVerifierAgent

Integrates LLM-driven spec generation, formal verification (TLA+, Coq, Lean), and event-driven repair. Emits rationale/explanation for each step. References TLA+, Coq, Lean, tenspiler, arXiv:2505.02500v1.

**Usage:**

`import { FormalVerifierAgent } from 'ai-helpers/agents/FormalVerifierAgent'; const agent = new FormalVerifierAgent({ profile: { name: 'FormalVerifierAgent' } }); await agent.runTask({ ... });`

## Methods/Functions

- **runTask**: (task: unknown) => Promise<AgentResult> - Run a task with LLM-driven spec generation, formal verification, event-driven repair, and rationale/explanation.
- **generateSpec**: (code: string) => Promise<string> - Generates a formal spec (TLA+, Coq, Lean) from code.
- **runVerification**: (spec: string) => Promise<boolean> - Runs formal verification on a spec.
- **health**: () => Promise<HealthStatus> - Health check for FormalVerifierAgent.

## Schema

```json
{
  "_def": {
    "unknownKeys": "strip",
    "catchall": {
      "_def": {
        "typeName": "ZodNever"
      },
      "~standard": {
        "version": 1,
        "vendor": "zod"
      }
    },
    "typeName": "ZodObject"
  },
  "~standard": {
    "version": 1,
    "vendor": "zod"
  },
  "_cached": null
}
```
## Best Practices

- Use LLMs to generate formal specs from code/comments
- Integrate TLA+, Coq, Lean, or stubs for verification
- Emit events for all spec/verification/repair actions
- Document event schemas and rationale in describe()

## References

- https://lamport.azurewebsites.net/tla/tla.html
- https://coq.inria.fr/
- https://leanprover.github.io/
- https://github.com/awslabs/tenspiler
- https://arxiv.org/html/2505.02500v1
- README.md#formal-verification--genefication-workflows-augmented
- docs/ROADMAP.md#formal-verifier-agent

