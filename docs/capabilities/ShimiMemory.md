# ShimiMemory

Semantic Hierarchical Memory Index (SHIMI) for decentralized agent reasoning. Supports entity insertion, retrieval, and decentralized sync. Registry/LLM/AI-friendly.

**Usage:**

`import { ShimiMemory } from 'nootropic/utils/context/shimiMemory'; const shimi = new ShimiMemory(); await shimi.insertEntity({ concept: 'foo', explanation: 'bar' }); await shimi.retrieveEntities('foo');`

## Methods/Functions

- **insertEntity**: (entity: { concept: string; explanation: string; [key: string]: unknown }) => Promise<void> - Insert an entity into the semantic memory graph.
- **retrieveEntities**: (query: string, topK?: number) => Promise<unknown[]> - Retrieve entities by semantic query.
- **crdtMerge**: (remote: ShimiMemory) => Promise<void> - Merge with a remote SHIMI memory using CRDT logic.

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
## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

