# epic-context-rag-semantic (epic)
**Description:** Implement advanced context/memory management, semantic search, and RAG pipelines with hybrid retrieval, chunking, and feedback. Integrate with embedding providers and event logs.
**Status:** in progress
**Priority:** high
**Milestone:** Advanced Agentic Orchestration
**Progress:** 60% - LLM adapters and hybrid retrieval implemented, advanced evaluation and docs in progress
**Definition of Done:** Advanced context/memory management, semantic search, and RAG pipelines are implemented, tested, and documented, with pluggable adapters and evaluation frameworks integrated.
**Note:** All three LLM adapters (HuggingFace, OpenRouter, Ollama) now have real API implementations, error handling, and registry/describe/health compliance. Next: expand integration tests and advanced enhancements.
**Tags:** context, rag, semantic-search, llm-adapter, hybrid-retrieval, llm-friendly
**References:** https://www.llamaindex.ai/, https://weaviate.io/, https://github.com/explodinggradients/ragas, https://github.com/allenai/ralle, https://github.com/allenai/ares, https://www.trulens.org/, https://arxiv.org/abs/2402.00000
---
## Metadata
- id: epic-context-rag-semantic
- slug: epic-context-rag-semantic
- docPath: docs/epics/epic-context-rag-semantic.md
- lastSynced: 2025-05-18T20:01:43.282Z
---
## Subtasks
- [epic-advanced-context-and-memory-management](docs/stories/epic-advanced-context-and-memory-management.md)
- [epic-semantic-search-and-analytics](docs/stories/epic-semantic-search-and-analytics.md)
- [rag-pipeline-utility](docs/stories/rag-pipeline-utility.md)
- [rag-evaluation-integration](docs/stories/rag-evaluation-integration.md)
- [context-handoff-memory-optimization](docs/stories/context-handoff-memory-optimization.md)
- [subtask-context-cache-rag-feedback-mutation](docs/stories/subtask-context-cache-rag-feedback-mutation.md)
- [rag-evaluation-ragas-ares-trulens](docs/stories/rag-evaluation-ragas-ares-trulens.md)
- [integrate-huggingface-llm-adapter](docs/stories/integrate-huggingface-llm-adapter.md)
- [integrate-openrouter-llm-adapter](docs/stories/integrate-openrouter-llm-adapter.md)
- [integrate-ollama-llm-adapter](docs/stories/integrate-ollama-llm-adapter.md)
- [test-coverage-llm-adapters](docs/stories/test-coverage-llm-adapters.md)
- [docs-llm-adapter-integration](docs/stories/docs-llm-adapter-integration.md)
- [llm-adapter-integration-tests](docs/stories/llm-adapter-integration-tests.md)
- [llm-adapter-usage-docs](docs/stories/llm-adapter-usage-docs.md)
- [llm-chunk-scoring-enhancement](docs/stories/llm-chunk-scoring-enhancement.md)
- [hybrid-retrieval-enhancement](docs/stories/hybrid-retrieval-enhancement.md)
- [feedback-moderation-enhancement](docs/stories/feedback-moderation-enhancement.md)
- [llm-adapter-advanced-integration-tests](docs/stories/llm-adapter-advanced-integration-tests.md)
- [llm-adapter-repeatability-alignment](docs/stories/llm-adapter-repeatability-alignment.md)
- [llm-adapter-responsibility-testing](docs/stories/llm-adapter-responsibility-testing.md)
- [llm-adapter-performance-monitoring](docs/stories/llm-adapter-performance-monitoring.md)
- [llm-adapter-feedback-observability](docs/stories/llm-adapter-feedback-observability.md)