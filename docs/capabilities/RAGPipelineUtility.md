# RAGPipelineUtility

Hybrid retrieval, advanced chunking, reranking, and feedback loops for RAG pipelines. Delegates all core steps to modular, registry-compliant context utilities (ChunkingUtility, HybridRetrievalUtility, RerankUtility). Integrates with embedding providers and semantic index. Registry-compliant.

**Usage:**

`import { RAGPipelineUtility } from 'nootropic/capabilities/RAGPipelineUtility'; const util = new RAGPipelineUtility(publishEvent); await util.runRAGPipeline(input);`

## Methods/Functions

- **runRAGPipeline**: (input: unknown) => Promise<{ output: unknown; logs: string[] }> - Run a RAG pipeline: hybrid retrieval, chunking, reranking, feedback.
- **health**: () => Promise<HealthStatus> - Health check for RAGPipelineUtility.

## References

- https://github.com/jerryjliu/llama_index
- https://weaviate.io/
- https://github.com/explodinggradients/ragas
- README.md#state-of-the-art-rag-pipelines-for-code--context-optimization
- docs/ROADMAP.md#rag-pipeline-utility
- RerankUtility.describe()

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

