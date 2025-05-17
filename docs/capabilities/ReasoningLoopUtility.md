# ReasoningLoopUtility

Iterative code generation, explanation, and repair (chain-of-thought, self-debugging, SCoT).

**Usage:**

`import { ReasoningLoopUtility } from 'nootropic/agents/ReasoningLoopUtility'; const util = new ReasoningLoopUtility(); await util.runReasoningLoop(input);`

## Methods/Functions

- **runReasoningLoop**: (input: unknown) => Promise<{ output: unknown; logs: string[] }> - Run a reasoning loop: generate, explain, test, and repair code iteratively.

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
## References

- README.md#chain-of-thought-prompting--self-debugging-augmented-with-scot
- arXiv:2304.05128
- dl.acm.org/doi/10.1145/3690635

