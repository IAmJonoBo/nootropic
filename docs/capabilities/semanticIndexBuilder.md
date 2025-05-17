---
status: implemented
---
# semanticIndexBuilder

The `semanticIndexBuilder` builds a comprehensive semantic search index for the nootropic project. It now indexes:
- All code, Markdown, and JSON files (chunked by lines/sections)
- All outputs from the describe registry (`.nootropic-cache/describe-registry.json`)
- All per-capability docs in `docs/capabilities/`
- All LLM/AI docs in `.nootropic-cache/llm-docs.json`

Each chunk is tagged with metadata: `source` (e.g., `code`, `describe-registry`, `llm-docs`, `capability-doc`), `capability` (if available), and `section` (if available).

## Usage

To build the semantic index:

```sh
pnpm tsx nootropic/semanticIndexBuilder.ts
```

This creates `.nootropic-cache/semantic-index.json`.

## API Filtering Support

The semantic search API (HTTP and WebSocket) now robustly supports filtering by `source` and `capability` fields. Use these for targeted LLM/agent workflows:
- `source`: Filter by chunk source (e.g., `capability-doc`, `describe-registry`)
- `capability`: Filter by capability name (if available)

See [docs/semanticSearchGuide.md](../semanticSearchGuide.md) for API usage and examples.

## Best Practices
- Keep describe outputs and per-capability docs up to date for maximal LLM/agent discoverability.
- Use the `source` and `capability` metadata for targeted semantic search and agent workflows.
- Prefer batch embedding for large document sets. 