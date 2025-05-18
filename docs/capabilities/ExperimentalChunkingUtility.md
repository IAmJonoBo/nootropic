# ExperimentalChunkingUtility

Experimental LLM-driven chunk filtering utility (ChunkRAG-inspired) with adaptive semantic splitting and HNSW-based redundancy reduction. For research and prototyping only. Not production-ready.

**Usage:**

`import ExperimentalChunkingUtility from 'nootropic/utils/context/experimental/ChunkingUtility'; const util = new ExperimentalChunkingUtility(); await util.chunkAndFilter('text', 'query');`

## Methods/Functions

- **chunkAndFilter**: (text: string, query: string) => Promise<Chunk[]> - Chunk and filter text using LLM-driven strategies, adaptive semantic splitting, and HNSW-based redundancy reduction.

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

- https://arxiv.org/abs/2310.02600
- https://github.com/facebookresearch/llama
- https://github.com/yoshoku/hnswlib-node

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

