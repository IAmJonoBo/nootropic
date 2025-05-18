# RerankUtility

Modular reranking utility supporting embedding-based, LLM-based, cross-encoder, and MMR (diversity) reranking. Registry-driven, describe/health compliant. Stubs for pluggable backends.

**Usage:**

`import RerankUtility from 'nootropic/utils/context/rerank'; const util = new RerankUtility(); await util.rerank({ strategy: 'embedding', query: 'foo', results });`

## Methods/Functions

- **rerank**: (options: RerankOptions) => Promise<string[]> - Rerank results using the selected strategy.
- **health**: () => Promise<HealthStatus> - Health check.
- **describe**: () => CapabilityDescribe - Describe this utility.

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

- https://arxiv.org/html/2404.01037v1
- https://github.com/explodinggradients/ragas
- https://www.pinecone.io/learn/series/rag/rerankers/

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

