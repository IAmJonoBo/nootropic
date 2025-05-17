---
status: implemented
---
# ChunkingUtility

**Description:** Modular chunking utility supporting LLM-driven chunk filtering, semantic/agentic chunking, and redundancy filtering. Registry/describe/health compliant.

- **Compliance:** Capability-compliant, registry/describe/health compliant, open-source-first

## Usage Example

```ts
import { ChunkingUtility, SemanticChunkingStrategy, LLMChunkRelevanceScorer } from 'nootropic/utils/context/ChunkingUtility';
import { HuggingFaceLLMAdapter } from 'nootropic/adapters/HuggingFaceLLMAdapter';
const hf = new HuggingFaceLLMAdapter();
const chunker = new ChunkingUtility(
  new SemanticChunkingStrategy(hf),
  new LLMChunkRelevanceScorer(hf)
);
await chunker.chunkAndFilter('text', 'query');
```

## Methods

| Method           | Signature                                              | Description                                 |
|------------------|-------------------------------------------------------|---------------------------------------------|
| chunkAndFilter   | (text: string, query: string) => Promise<Chunk[]>      | Chunk and filter text using LLM scoring     |

## Supported Strategies
- Fixed-size
- Sentence
- Paragraph
- Semantic (embedding-based)
- Recursive
- Agentic (task-driven)

## Integration Points
- HuggingFaceLLMAdapter
- OpenRouterLLMAdapter
- OllamaLLMAdapter

## References
- https://arxiv.org/abs/2310.02600
- https://zilliz.com/learn/guide-to-chunking-strategies-for-rag

## Registry/Describe/Health Compliance
- Exports `describe()` and `health()` methods
- Discoverable via registry and /capabilities endpoint
- AI/LLM-friendly documentation 

## 🧪 Advanced Testing & Best Practices (2024)

- **Repeatability/Alignment**: Utility is tested for consistent output across multiple runs with different LLM adapters.
- **Responsibility**: Basic bias, toxicity, and fairness checks are included (with stubs or open-source tools).
- **Performance/Cost**: Latency and token usage are logged and monitored.
- **Edge Cases**: Tested with malformed, adversarial, and long/complex inputs.
- **Feedback & Observability**: Feedback loops and error logging are integrated for continuous improvement.

See `tests/context/llmAdapterIntegration.test.ts` and README for details. Run with `pnpm test:integration`. 