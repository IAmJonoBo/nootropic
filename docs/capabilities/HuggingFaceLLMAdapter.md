# HuggingFaceLLMAdapter

**Description:** Adapter for HuggingFace Inference API. Supports text generation, embeddings, and model info. Registry/describe/health compliant.

- **License:** Apache-2.0
- **Provenance:** https://huggingface.co/docs/api-inference/index
- **Compliance:** Capability-compliant, registry/describe/health compliant, open-source-first

## Usage Example

```ts
import { HuggingFaceLLMAdapter } from 'ai-helpers/adapters/HuggingFaceLLMAdapter';
const adapter = new HuggingFaceLLMAdapter();
await adapter.generateText('Hello!');
await adapter.embedText('Text to embed');
await adapter.getModelInfo('bigscience/bloom-560m');
```

## Methods

| Method         | Signature                                                                 | Description                                 |
|----------------|--------------------------------------------------------------------------|---------------------------------------------|
| generateText   | (prompt: string, model?: string, options?: object) => Promise<string>     | Generate text using a HuggingFace model     |
| embedText      | (text: string, model?: string, options?: object) => Promise<number[]>     | Get embeddings for text                     |
| getModelInfo   | (model: string) => Promise<object>                                       | Get model metadata from HuggingFace         |
| health         | () => Promise<HealthStatus>                                              | Health check                                |
| describe       | () => CapabilityDescribe                                                 | Describe this adapter                       |

## Integration Points
- ChunkingUtility
- HybridRetrievalUtility
- RerankUtility
- ShimiMemory

## References
- https://huggingface.co/docs/api-inference/index

## Registry/Describe/Health Compliance
- Exports `describe()` and `health()` methods
- Discoverable via registry and /capabilities endpoint
- AI/LLM-friendly documentation 

## 🧪 Advanced Testing & Best Practices (2024)

- **Repeatability/Alignment**: Adapter is tested for consistent output across multiple runs (Continuous Alignment Testing).
- **Responsibility**: Basic bias, toxicity, and fairness checks are included (with stubs or open-source tools).
- **Performance/Cost**: Latency and token usage are logged and monitored.
- **Edge Cases**: Tested with malformed, adversarial, and long/complex inputs.
- **Feedback & Observability**: Feedback loops and error logging are integrated for continuous improvement.

See `tests/context/llmAdapterIntegration.test.ts` and README for details. Run with `pnpm test:integration`. 