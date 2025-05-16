# OllamaLLMAdapter

**Description:** Adapter for Ollama local LLM server. Supports text generation, embeddings (if available), and model info. Registry/describe/health compliant.

- **License:** MIT
- **Provenance:** https://github.com/jmorganca/ollama
- **Compliance:** Capability-compliant, registry/describe/health compliant, open-source-first

## Usage Example

```ts
import { OllamaLLMAdapter } from 'ai-helpers/adapters/OllamaLLMAdapter';
const adapter = new OllamaLLMAdapter();
await adapter.generateText('Hello!');
await adapter.embedText('Text to embed');
await adapter.getModelInfo('llama2');
```

## Methods

| Method         | Signature                                                                 | Description                                 |
|----------------|--------------------------------------------------------------------------|---------------------------------------------|
| generateText   | (prompt: string, model?: string, options?: object) => Promise<string>     | Generate text using an Ollama model         |
| embedText      | (text: string, model?: string, options?: object) => Promise<number[]>     | Get embeddings for text (if supported)      |
| getModelInfo   | (model: string) => Promise<object>                                       | Get model metadata from Ollama              |
| health         | () => Promise<HealthStatus>                                              | Health check                                |
| describe       | () => CapabilityDescribe                                                 | Describe this adapter                       |

## Integration Points
- ChunkingUtility
- HybridRetrievalUtility
- RerankUtility
- ShimiMemory

## References
- https://github.com/jmorganca/ollama

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

## Type Safety and Event Payload Validation (2025+)

- All adapter event payloads and data extraction **must** use `Record<string, unknown>` and type guards instead of `any`.
- All payloads must be validated at runtime using Zod or equivalent.
- See CONTRIBUTING.md and onboarding-checklist.md for migration notes and enforcement policy. 