---
status: implemented
---
# HybridRetrievalUtility

**Description:** Hybrid retrieval utility combining dense (DPR/embeddings) and sparse (BM25) retrieval. Registry/describe/health compliant.

- **Compliance:** Capability-compliant, registry/describe/health compliant, open-source-first

## Usage Example

```ts
import { HybridRetrievalUtility, DenseRetriever } from 'nootropic/utils/context/HybridRetrievalUtility';
import { HuggingFaceLLMAdapter } from 'nootropic/adapters/HuggingFaceLLMAdapter';
const hf = new HuggingFaceLLMAdapter();
const dense = new DenseRetriever(hf);
const hybrid = new HybridRetrievalUtility(dense);
await hybrid.retrieve('query');
```

## Methods

| Method     | Signature                                 | Description                                 |
|------------|--------------------------------------------|---------------------------------------------|
| retrieve   | (query: string, topK?: number) => Promise<string[]> | Retrieve results using hybrid strategy      |

## Supported Strategies
- Dense (DPR/embeddings)
- Sparse (BM25)
- Hybrid (fusion)

## Integration Points
- HuggingFaceLLMAdapter
- OpenRouterLLMAdapter
- OllamaLLMAdapter
- BM25/Vector backends

## References
- https://github.com/facebookresearch/DPR
- https://github.com/dorianbrown/rank_bm25

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

## Type Safety and Event Payload Validation (2025+)

- All hybrid retrieval utility event payloads and data extraction **must** use `Record<string, unknown>` and type guards instead of `any`.
- All payloads must be validated at runtime using Zod or equivalent.
- See CONTRIBUTING.md and onboarding-checklist.md for migration notes and enforcement policy. 