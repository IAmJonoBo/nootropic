---
status: implemented
---
# ShimiMemory

**Description:** SHIMI-style semantic hierarchical memory for distributed agent reasoning and feedback aggregation. Registry/describe/health compliant.

- **Compliance:** Capability-compliant, registry/describe/health compliant, open-source-first

## Usage Example

```ts
import { ShimiMemory } from 'nootropic/utils/context/shimiMemory';
const shimi = new ShimiMemory();
await shimi.insertEntity({ concept: 'foo', explanation: 'bar' });
const results = await shimi.retrieveEntities('query');
```

## Methods

| Method           | Signature                                              | Description                                 |
|------------------|-------------------------------------------------------|---------------------------------------------|
| insertEntity     | (entity: { concept: string, explanation: string, ... }) => Promise<void> | Insert entity into semantic tree           |
| retrieveEntities | (query: string, topK?: number) => Promise<any[]>      | Retrieve entities by semantic query         |
| health           | () => Promise<HealthStatus>                           | Health check                                |
| describe         | () => CapabilityDescribe                              | Describe this memory utility                |

## Supported Features
- Semantic similarity
- Hierarchical memory (tree structure)
- Distributed/CRDT merge (planned)
- LLM/embedding backend integration

## Integration Points
- HuggingFaceLLMAdapter
- OpenRouterLLMAdapter
- OllamaLLMAdapter
- FeedbackAgent
- contextManager

## References
- https://arxiv.org/abs/2504.06135

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