# Semantic Search Guide

The semantic search feature allows agents (and humans) to find relevant code, docs, agent messages, **describe outputs**, and per-capability documentation by meaning, not just keywords. It uses embeddings to match queries to indexed text chunks.

## 1. What is Indexed?

The semantic index now includes:
- All code, Markdown, and JSON files (chunked by lines/sections)
- All outputs from the describe registry (`.nootropic-cache/describe-registry.json`)
- All per-capability docs in `docs/capabilities/`
- All LLM/AI docs in `.nootropic-cache/llm-docs.json`

Each chunk is tagged with metadata: `source` (e.g., `code`, `describe-registry`, `llm-docs`, `capability-doc`), `capability` (if available), and `section` (if available).

## 2. Build the Semantic Index

Before searching, build the index:

```sh
pnpm tsx nootropic/semanticIndexBuilder.ts
```

This creates `nootropic/.nootropic-cache/semantic-index.json`.

## 3. CLI Usage

Search for relevant code, docs, or describe outputs:

```sh
pnpm tsx nootropic/semanticSearchHelper.ts "How do agents communicate?"
```

### Filtering by Source or Capability
- You can filter results by `source` (e.g., only `capability-doc` or `describe-registry`) or by `capability` name for targeted LLM/agent workflows (see CLI/API docs for options).

## 4. HTTP API

POST to `/semantic-search` on the real-time server:

```
POST http://localhost:4000/semantic-search
Content-Type: application/json

{
  "query": "How do agents communicate?",
  "topN": 5,
  "source": "capability-doc", // optional, filter by source
  "capability": "ShimiMemory"   // optional, filter by capability
}
```

## 5. WebSocket API

Send a message to the WebSocket server:

```
{
  "type": "semanticSearch",
  "data": { "query": "How do agents communicate?", "topN": 5, "source": "describe-registry", "capability": "ShimiMemory" }
}
```

## 6. Best Practices for LLM/Agent Discoverability
- Always keep describe outputs and per-capability docs up to date.
- Use the `source` and `capability` metadata for targeted semantic search.
- Prefer batch embedding for large document sets.
- Document all new capabilities and ensure registry/describe compliance.

## 7. Extensibility

- The embedding model is now pluggable via the `EmbeddingProvider` interface in `capabilities/EmbeddingProvider.ts`.
- **Available Providers:**
  - **HuggingFace (Transformers.js, local ONNX):** Set `EMBEDDING_PROVIDER=huggingface` and `HUGGINGFACE_MODEL` (e.g., `Xenova/all-MiniLM-L6-v2`). No API key needed. Runs locally using ONNX.
  - **Ollama (local REST API):** Set `EMBEDDING_PROVIDER=ollama` and `OLLAMA_MODEL` (e.g., `mxbai-embed-large`). Ollama must be running locally. Supports open and HuggingFace models.
  - **Petals (distributed HTTP):** Set `EMBEDDING_PROVIDER=petals`, `PETALS_URL` (default: `http://localhost:8080/embed`), and `PETALS_MODEL` (e.g., `bigscience/bloom-petals`). Petals must be running as a distributed inference server.
  - **LM Studio (OpenAI-compatible REST API):** Set `EMBEDDING_PROVIDER=lmstudio`, `LMSTUDIO_URL` (default: `http://localhost:1234/v1/embeddings`), and `LMSTUDIO_MODEL` (e.g., `all-MiniLM-L6-v2`). LM Studio must be running locally.
  - **HTTP (generic endpoint):** Set `EMBEDDING_PROVIDER=http`, `HTTP_EMBEDDING_URL`, and `HTTP_EMBEDDING_MODEL` for any compatible HTTP embedding service.
  - **Custom:** Extend `CustomEmbeddingProvider` in `capabilities/embeddingRegistry.ts` and register with a unique key for advanced or enterprise use cases.
  - **Default:** A hash-based stub is used for offline/dev mode.
- **Batch embedding** is supported for all providers for efficiency.
- **How to add a provider:** Implement the `EmbeddingProvider` interface and register in `embeddingRegistry.ts`.
- **Env Vars:**
  - `EMBEDDING_PROVIDER`: Selects the provider (`huggingface`, `ollama`, `petals`, `lmstudio`, `http`, `custom`, or `hash-stub`)
  - `HUGGINGFACE_MODEL`: Model name for HuggingFace (default: `Xenova/all-MiniLM-L6-v2`)
  - `OLLAMA_MODEL`: Model name for Ollama (default: `mxbai-embed-large`)
  - `PETALS_URL`: URL for Petals (default: `http://localhost:8080/embed`)
  - `PETALS_MODEL`: Model name for Petals (default: `bigscience/bloom-petals`)
  - `LMSTUDIO_URL`: URL for LM Studio (default: `http://localhost:1234/v1/embeddings`)
  - `LMSTUDIO_MODEL`: Model name for LM Studio (default: `all-MiniLM-L6-v2`)
  - `HTTP_EMBEDDING_URL`: URL for HTTP embedding
  - `HTTP_EMBEDDING_MODEL`: Model name for HTTP embedding

### Best Practices (2025)
- Use local ONNX models for privacy and cost efficiency (HuggingFace/Transformers.js).
- Use Ollama for fast, local embedding with open or HuggingFace models.
- Use Petals for distributed, large-model embedding (e.g., BLOOM, Llama) when local resources are insufficient.
- Use LM Studio for OpenAI-compatible local embedding workflows.
- Use the HTTP provider for custom or enterprise endpoints (e.g., gRPC/REST wrappers, cloud APIs).
- Prefer batch embedding for large document sets.
- Choose the embedding model (e.g., OpenAI, local, HuggingFace, Ollama, Petals, LM Studio, HTTP) based on privacy, cost, and performance needs.
- Document all providers in the registry and ensure they export a `describe()` method for LLM/agent discovery.
- For custom/enterprise providers, extend `CustomEmbeddingProvider` and follow the describe/registry pattern.

---

For more, see the code in `nootropic/semanticIndexBuilder.ts`, `nootropic/semanticSearchHelper.ts`, and `capabilities/EmbeddingProvider.ts`. 