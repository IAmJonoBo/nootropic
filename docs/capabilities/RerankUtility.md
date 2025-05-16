# RerankUtility

**Description:** Bi-encoder and cross-encoder reranking utility. Supports LLM-based, embedding-based, and diversity (MMR) reranking. Registry/describe/health compliant.

- **Compliance:** Capability-compliant, registry/describe/health compliant, open-source-first

## Usage Example

```ts
import { RerankUtility, BiEncoderReranker, CrossEncoderReranker } from 'ai-helpers/utils/context/RerankUtility';
import { HuggingFaceLLMAdapter } from 'ai-helpers/adapters/HuggingFaceLLMAdapter';
const hf = new HuggingFaceLLMAdapter();
const bi = new BiEncoderReranker(hf);
const cross = new CrossEncoderReranker(hf);
const rerank = new RerankUtility(bi, cross);
await rerank.rerank('query', ['a', 'b']);
```

## Methods

| Method     | Signature                                         | Description                                 |
|------------|---------------------------------------------------|---------------------------------------------|
| rerank     | (query: string, candidates: string[]) => Promise<string[]> | Rerank candidates using bi/cross-encoder   |

## Supported Strategies
- Bi-encoder
- Cross-encoder
- LLM-based
- MMR (diversity)

## Integration Points
- HuggingFaceLLMAdapter
- OpenRouterLLMAdapter
- OllamaLLMAdapter

## References
- https://www.sbert.net/

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