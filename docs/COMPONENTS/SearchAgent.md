# SearchAgent

## Summary

The **SearchAgent** is responsible for retrieving relevant code snippets, documentation, and contextual information from project repositories and external knowledge sources using a hybrid Retrieval-Augmented Generation (RAG) approach. It combines dense vector search (e.g., Chroma) with sparse keyword search (e.g., Weaviate or Elasticsearch) and re-ranks the retrieved results using a lightweight reranking model. By providing high‐recall, high‐precision results, the SearchAgent ensures that other agents (CoderAgent, ReasoningAgent, etc.) have access to the most relevant context to inform code generation, refactoring, or architectural reasoning.

Key functions include:

* Indexing code, commit history, and documentation into both vector and inverted‐index stores.
* Accepting free‐text or structured queries and returning ranked snippets.
* Performing late‐fusion reranking to improve relevance.
* Caching recent queries and handling timeouts or missing-context scenarios gracefully.

***

## 1. Responsibilities

1. **Hybrid Indexing (Dense + Sparse)**

   * Ingest project files (source code, README, design docs) and chunk them into semantically meaningful units (functions, classes, paragraphs).
   * Generate embeddings for each chunk using a local or cloud embedding model (via ModelAdapter) and store them in a vector store (Chroma by default).
   * Simultaneously index text chunks into a sparse inverted index (Weaviate, Elasticsearch, or a lightweight fallback) to support keyword queries.
   * Keep both indices synchronized as files are added, modified, or deleted.

2. **Query Processing & Retrieval**

   * Accept user queries (free‐text “How do I initialize a Redis client in Node.js?” or structured requests “Find usages of function `getUserByID`”).
   * Compute an embedding for the query using the same embedding model used at index time.
   * Perform a dense vector search over Chroma to retrieve the top-K most semantically similar chunks.
   * In parallel, run a keyword‐based search over Weaviate (or Elasticsearch) to retrieve text chunks matching query terms.
   * Merge the results (union of dense + sparse hits), remove duplicates, and proceed to reranking.

3. **Reranking & Final Scoring**

   * Pass the merged candidate set to a lightweight reranker (e.g., a few-layer transformer or even a TF-IDF re‐scoring function) to refine the rank order.
   * Incorporate additional signals (e.g., snippet recency, file importance, author trust) as metadata features into the reranking model.
   * Return a final sorted list of snippets, each accompanied by metadata (file path, line range, similarity score).

4. **Contextual Chunk Assembly**

   * Once top snippets are identified, assemble surrounding context (e.g., full function definitions or adjacent comments) up to a configurable token or line limit.
   * Format results into a structured response that downstream agents can consume directly (e.g., `[{ file: "src/utils.js", startLine: 120, endLine: 150, snippet: "...", score: 0.82 }]`).

5. **Cache & Failure Handling**
   * Cache recent query results in an LRU cache (in memory or on disk) to avoid recomputing expensive embedding or reranking steps for repeated queries.
   * Implement timeouts for embedding calls (e.g., 2 seconds) and fall back to sparse search if embedding fails or exceeds the threshold.
   * If no candidates are found, return a "no results" response and log a low-recall event for telemetry.

***

## 2. Inputs & Outputs

### 2.1 Inputs

1. **Ingestion Sources**

   * **Local Project Files**: All files under the `src/`, `docs/`, and `tests/` directories.
   * **External Knowledge**: Optionally, public documentation (e.g., MDN, StackOverflow dumps) if configured.

2. **Chunk Configuration**

   * `maxChunkSizeTokens`: Maximum number of tokens per chunk (default: 512).
   * `chunkOverlapTokens`: Overlap between adjacent chunks to preserve context (default: 50 tokens).

3. **Query Objects**

   * `textQuery: string` (e.g., "optimize SQL query in Node.js")
   * Optional filters:
     * `filePaths?: string[]` (restrict search to certain files or directories)
     * `languages?: string[]` (e.g., `["javascript", "python"]`)
     * `minRecencyDays?: number` (only consider files modified within N days)
   * Pagination parameters:
     * `limit?: number` (max results to return, default: 10)
     * `cursor?: string` (for paginated follow-ups)

4. **Embedding Model Reference**
   * Provided by ModelAdapter:
     * `embeddingModelID: string` (e.g., `openai-embeddings-001` or `local-gpt-embed`)
     * Sampling or batch parameters: `batchSize`, `timeoutMs`

### 2.2 Outputs

1. **Ranked Snippet List**

   * Array of `SearchResult` objects sorted by final score:

     ```ts
     interface SearchResult {
       filePath: string; // e.g., "src/utils/cache.js"
       startLine: number; // e.g., 45
       endLine: number; // e.g., 78
       snippet: string; // Extracted lines of code or documentation
       score: number; // Final relevance score (0.0–1.0)
       source: "dense" | "sparse" | "merged";
     }
     ```

2. **Context Metadata**

   * For each snippet:
     * `lastModified: string` (ISO timestamp of file modification)
     * `language: string` (e.g., `javascript`)
     * `fileSizeBytes: number`

3. **Search Logs & Metrics**

   * Emit a `SearchLog` record for each query containing:

     ```ts
     interface SearchLog {
       query: string;
       numDenseHits: number;
       numSparseHits: number;
       numMerged: number;
       rerankLatencyMs: number;
       totalLatencyMs: number;
       usedEmbeddingModel: string;
       usedRerankerModel: string;
       timestamp: string;
     }
     ```

4. **Cache Keys**
   * For caching:
     * Key: `hash(textQuery + JSON.stringify(filters))`
     * Value: Serialized list of `SearchResult` with timestamp for TTL eviction.

***

## 3. Data Structures

### 3.1 Indexing & Chunk Structures

```ts
/** A single text chunk stored in both vector and inverted indices */
interface TextChunk {
  chunkID: string;           // Unique ID (e.g., "file-path::chunk-index")
  filePath: string;          // Original file path
  startLine: number;         // Starting line number
  endLine: number;           // Ending line number
  text: string;              // Raw text of the chunk
  embedding?: number[];      // Float32 vector generated at ingestion
  metadata: {
    language: string;        // Detected programming language or "markdown"
    lastModified: string;    // ISO timestamp of file modification
    fileSizeBytes: number;
  };
}

 • TextChunk.chunkID: Composed as <filePath>::<sequenceNumber>.
 • embedding: Computed once and stored in the vector store; optional in memory.
 • metadata: Used at rerank time to boost fresh or more important files.

3.2 Query & Result Types

/** Structure of a search request */
interface SearchQuery {
  textQuery: string;
  filePaths?: string[];
  languages?: string[];
  minRecencyDays?: number;
  limit?: number;
  cursor?: string;
}

/** Single search result item */
interface SearchResult {
  filePath: string;
  startLine: number;
  endLine: number;
  snippet: string;
  score: number;
  source: "dense" | "sparse" | "merged";
  metadata: {
    lastModified: string;
    language: string;
    fileSizeBytes: number;
  };
}

 • source indicates which retrieval method produced the snippet before merging.
 • cursor for pagination is encoded (e.g., base64) to resume the next page.

3.3 Internal Cache Entry

/** Entry stored in LRU cache for recent queries */
interface CacheEntry {
  queryHash: string;         // hash of the SearchQuery payload
  results: SearchResult[];    // Cached result list
  cachedAt: string;           // ISO timestamp when cached
}

 • The cache uses TTL (time-to-live) based on configuration (e.g., 1 hour).

⸻

4. Algorithms & Workflow

4.1 Ingestion Pipeline
 1. File System Watcher
 • Monitor project directories (e.g., src/, docs/) for file additions, modifications, or deletions using a watcher (e.g., chokidar).
 • On change detection:
 • If file created/updated: read file, chunk it into segments of maxChunkSizeTokens, compute embeddings in batches via ModelAdapter, and upsert chunks into both vector (Chroma) and sparse (Weaviate/Elasticsearch) indices.
 • If file deleted: remove associated chunks (identified by chunkID prefix) from both indices.
 2. Chunking Strategy
 • For code files: split on function or class boundaries when possible (e.g., use simple heuristics or a language parser).
 • For documentation: split on paragraphs or headings.
 • Ensure overlapping context by overlapping chunkOverlapTokens (for dense search recall) to avoid missing boundary content.
 3. Embedding Computation
 • Batch up to batchSize chunks and request embeddings from ModelAdapter.
 • If embedding fails or times out, mark chunk as "pending embedding" and retry on next ingestion cycle.
 • Maintain a small backoff queue for failed embeddings.
 4. Index Upsert
 • For each chunk with a valid embedding:
 • Chroma: call chroma.addDocument({ id: chunkID, embedding, metadata }).
 • Weaviate/Elasticsearch: index the raw text with appropriate analyzer (e.g., code tokenizers) and attach metadata.
 • If storage errors occur, log telemetry and schedule a retry.

4.2 Query Execution
 1. Cache Check
 • Compute queryHash = hash(textQuery + JSON.stringify(filters)).
 • If cache.contains(queryHash) and not expired, return cached results immediately (skip embedding & search).
 2. Embedding & Dense Retrieval
 • Request query embedding from ModelAdapter: vector = ModelAdapter.embed(textQuery).
 • Query Chroma: denseHits = chroma.query({ queryEmbedding: vector, nResults: topK_dense, filter: metadataFilter }).
 3. Sparse Retrieval
 • Construct a sparse search query (e.g., match query on "text" field), applying filters (filePaths, languages, minRecencyDays).
 • Query Weaviate/Elasticsearch: sparseHits = weaviate.search({ text: textQuery, filters, size: topK_sparse }).
 4. Merge & Deduplicate
 • Combine denseHits and sparseHits by chunkID; if the same chunk appears in both, keep the higher initial score.
 • Build a candidates set of up to maxCandidates (dense + sparse) for reranking.
 5. Reranking
 • For each candidate, assemble feature vector:
 • denseScore, sparseScore, recencyBoost = f(daysSinceModified), fileImportance = f(fileSizeBytes)
 • If using a learned reranker: pass features + chunk text through a small transformer to compute finalScore.
 • Otherwise, compute a weighted sum:

finalScore = α·denseScore + β·sparseScore + γ·recencyBoost + δ·fileImportance


 • Sort candidates by finalScore descending.

 6. Context Assembly
 • For each top result, read the original file and extract lines [startLine – contextBefore] to [endLine + contextAfter], respecting maxContextLines.
 • Format as a code‐fenced snippet or Markdown block.
 7. Cache & Return
 • Store SearchResult[] in cache under queryHash with current timestamp.
 • Emit telemetry log (SearchLog) with counts and latencies.
 • Return the top‐limit SearchResult[].

4.3 Failure & Fallback Strategies
 1. Embedding Timeout
 • If embedding call exceeds timeoutMs, abort dense retrieval and proceed with sparse search only.
 • Record a "denseFallback" flag in telemetry.
 2. Index Unavailability
 • If Chroma is down or unreachable, skip dense search and rely solely on sparse results.
 • If Weaviate/Elasticsearch is down, skip sparse search and rely solely on dense.
 • If both indices fail, return a "service unavailable" error to caller.
 3. No Results Found
 • If merged candidate set is empty, return a structured "no results" response with suggestions (e.g., "Try broader keywords," "Check spelling").
 • Log a "noRecall" event for later analysis.

⸻

5. Integration Points
 1. ModelAdapter
 • Used for all embedding computations (both chunk ingestion and query embedding).
 • Receives embeddingModelID, batchSize, and timeoutMs from configuration.
 • If local models are unavailable, ModelAdapter may fall back to cloud embedding APIs.
 2. CoderAgent & ReasoningAgent
 • When generating code or making architectural decisions, these agents call SearchAgent.search(query, filters) to fetch relevant context.
 • E.g., const contextSnippets = await SearchAgent.search({ textQuery: "validate JWT token in NestJS" });
 3. MemoryAgent
 • SearchAgent can query MemoryAgent for highly relevant historic episodes to include as additional context.
 • Typically, dense hits come from both codebase and memory store to aid in few-shot prompting.
 4. ProjectMgrAgent
 • Subscribes to "index-updated" events to trigger planning re‐evaluation if new code makes previous plan outdated.
 • May instruct SearchAgent to reindex less frequently during CI builds or after major refactors.
 5. ObservabilityAdapter
 • Instrument all critical methods (indexFile, search, rerank) with OTEL spans and metrics:
 • search.denseLatencyMs, search.sparseLatencyMs, search.rerankLatencyMs
 • Counters: search.requests_total, search.cacheHits_total, search.noResults_total
 6. PluginLoaderAdapter
 • If the system supports search‐related plugins (e.g., custom reranker models), PluginLoaderAdapter can register new reranker functions or custom filters that SearchAgent picks up at runtime.

⸻

6. Configuration

All SearchAgent settings reside under the searchAgent key in ~/.nootropic/config.json:

{
  "searchAgent": {
    // Chunking parameters
    "maxChunkSizeTokens": 512,
    "chunkOverlapTokens": 50,

    // Dense (vector) search settings
    "embeddingModelID": "openai-embeddings-001",
    "denseTopK": 10,
    "denseBatchSize": 16,
    "denseTimeoutMs": 2000,

    // Sparse (keyword) search settings
    "sparseTopK": 10,
    "sparseEndpoint": "http://localhost:8080",  // Weaviate/Elasticsearch URL
    "sparseTimeoutMs": 1000,

    // Reranking settings
    "useLearnedReranker": true,
    "rerankerModelID": "local-reranker-small",
    "rerankerBatchSize": 8,
    "rerankerTimeoutMs": 2000,
    "rerankerWeights": {
      "denseScore": 0.5,
      "sparseScore": 0.3,
      "recencyBoost": 0.1,
      "fileImportance": 0.1
    },

    // Caching settings
    "enableCache": true,
    "cacheTTLSeconds": 3600,
    "cacheMaxEntries": 500,

    // Context assembly
    "maxContextLines": 50,
    "contextBeforeLines": 5,
    "contextAfterLines": 5,

    // Failure handling
    "minRecencyDays": 0,
    "maxMergedCandidates": 20,
    "noResultsSuggestion": "Try broader keywords or ensure repository is indexed.",

    // Index refresh settings
    "watchDebounceMs": 500,
    "enableIndexing": true,

    // Pagination
    "defaultLimit": 10,
    "maxLimit": 50
  }
}

 • maxChunkSizeTokens & chunkOverlapTokens control how large and overlapping each text chunk is.
 • denseTopK, sparseTopK determine how many initial candidates from each index are retrieved.
 • useLearnedReranker toggles between learned vs. heuristic reranking.
 • cacheTTLSeconds and cacheMaxEntries govern the in-memory or on-disk query cache size and lifespan.
 • maxMergedCandidates caps how many candidates proceed to reranking to limit compute.
 • enableIndexing can be disabled for read-only search mode (e.g., on CI).

⸻

7. Metrics & Instrumentation

SearchAgent uses ObservabilityAdapter to emit the following telemetry:
 1. Span: searchAgent.indexFile
 • Fired whenever a file is ingested or updated.
 • Attributes:
 • filePath
 • numChunks
 • embeddingLatencyMs
 • indexLatencyMs
 2. Span: searchAgent.search
 • Wrapped around the overall search() call.
 • Attributes:
 • queryLength (characters)
 • denseHits (count returned)
 • sparseHits (count returned)
 • totalCandidates (after merge)
 • finalResults (count returned)
 • totalLatencyMs
 3. Span: searchAgent.denseSearch
 • Fired around vector search call.
 • Attributes:
 • denseLatencyMs
 • embeddingModelID
 4. Span: searchAgent.sparseSearch
 • Fired around keyword search call.
 • Attributes:
 • sparseLatencyMs
 • sparseEndpoint
 5. Span: searchAgent.rerank
 • Fired during reranking step.
 • Attributes:
 • candidateCount
 • rerankLatencyMs
 • rerankerModelID (if learned reranker)
 6. Counter: searchAgent.requests_total
 • Incremented each time search() is invoked.
 7. Counter: searchAgent.cacheHits_total
 • Incremented when a query returns cached results.
 8. Counter: searchAgent.noResults_total
 • Incremented when noResults is returned.
 9. Gauge: searchAgent.bufferedIndexOperations
 • Number of pending file‐watch indexing tasks when under high load.

These metrics enable monitoring of search latency, index freshness, cache effectiveness, and overall system health.

⸻

8. Testing & Validation

8.1 Unit Tests
 1. Chunking Logic
 • Given a small file with known content (e.g., a JavaScript file containing two functions), assert that it splits into correct chunks with expected startLine/endLine based on maxChunkSizeTokens and chunkOverlapTokens.
 2. Embedding Fallback
 • Mock ModelAdapter to throw a timeout error. Verify that search() falls back to sparse search only, logs denseFallback, and returns sparse‐driven results.
 3. Merge & Deduplication
 • Provide synthetic denseHits and sparseHits arrays with overlapping chunkID values. Assert that merge removes duplicates and preserves highest initial score.
 4. Reranking Heuristic
 • For a small set of synthetic candidates with known features, run heuristic reranker and check that sorting matches expected weighted sum formula.
 5. Cache Behavior
 • Populate the cache with a known queryHash and results. Invoke search() with the same query and filters; assert that no embedding or search calls are made and cached results are returned.

8.2 Integration Tests
 1. Indexing & Search End-to-End
 • Spin up a local Chroma instance and a lightweight Weaviate/Elasticsearch docker container.
 • Ingest a set of sample files (e.g., 5 small JS/Python files).
 • Run search("function addUser") and verify that returned snippets are relevant to addUser definitions or calls.
 2. Filtering by Language & Recency
 • Create two versions of a file: one modified today, one modified 90 days ago.
 • Invoke search() with minRecencyDays = 30. Assert that only the recent file's chunks appear in results.
 3. Learned Reranker Integration
 • Provide a mock reranker model that always promotes a particular candidate.
 • Ensure that search() returns that candidate at top position when useLearnedReranker = true.

8.3 End-to-End Performance Tests
 1. Large Codebase Simulation
 • Ingest ~500 files totaling ~100 MB of source code.
 • Measure times for indexing (chroma + sparse) under default chunk sizes. Ensure indexing completes within a reasonable timeframe (e.g., < 2 minutes on a dev workstation).
 2. High-Concurrency Queries
 • Issue 100 concurrent search() calls with different queries.
 • Measure p95 search latency; target < 300 ms per request when cache is warm.
 3. Failure Mode Stress Test
 • Simulate Chroma outage by pointing denseIndex to an invalid endpoint.
 • Issue 50 queries; confirm searches do not hang and rely on sparse search gracefully.

⸻

9. Edge Cases & Failure Modes
 1. No Context or Empty Repository
 • If the repository has no files or all indices are empty, search() should return an empty results array rather than throwing.
 • Suggest indexing instructions or "initialize the search index first."
 2. Embedding Service Unavailable
 • If ModelAdapter is misconfigured or offline, embedding calls will fail.
 • Dense search is skipped; log an error and proceed with sparse only.
 • Increment a denseFailures_total counter for monitoring.
 3. Sparse Index Staleness
 • If the sparse index has not been updated after recent file changes (e.g., due to watcher failure), some queries might miss relevant results.
 • On detecting sparse‐successful queries that return stale hits (based on metadata ages), emit a "staleIndexWarning" telemetry event.
 4. High Churn / Frequent File Changes
 • Rapid file edits can overwhelm the ingestion pipeline.
 • Implement a "debounce" (e.g., 500 ms) for the watcher, bundle file changes into a batch, and process them together to avoid repeated reindexing.
 5. Memory Pressure from Large Chunks
 • Very large files (e.g., > 10 MB) can produce thousands of chunks.
 • Limit maximum chunks per file (e.g., 100 chunks); skip the rest and log a warning.
 6. Pagination & Cursor Drift
 • If new search results appear between paginated requests, cursors may become invalid.
 • Simplest strategy: disallow pagination for highly dynamic contexts or return a "cursor invalidated" error prompting fresh search.

⸻

10. Future Enhancements
 1. Adaptive Chunk Granularity
 • Instead of fixed token counts, use AST or semantic parsing for code to chunk at logical boundaries (functions, classes) more accurately.
 2. Multi‐Modal Search
 • Incorporate image or diagram indexing (e.g., UML diagrams) using specialized embeddings, allowing "search by screenshot" or "search by design diagram."
 3. Query Intent Classification
 • Before performing retrieval, classify queries into intents (e.g., "error lookup," "how‐to," "API usage") and dynamically adjust retrieval weights or reranking features accordingly.
 4. User Feedback Loop
 • Capture user satisfaction signals (e.g., "mark as relevant" or "not useful") to fine-tune reranker models over time.
 5. Cross‐Project Search Federation
 • For monorepos or multi-repo organizations, enable federated search across multiple repositories with per-repository weighting or permissions.
 6. Zero-Shot Code Generation Assistance
 • Integrate SearchAgent results with a downstream Codex‐style generator to fill in missing code snippets based on retrieved context.
 7. Semantic Snippet Summaries
 • Generate one-line summaries for each code snippet using an LLM to help users more quickly scan search results.

⸻

11. Summary

The SearchAgent provides robust hybrid RAG retrieval for nootropic, ensuring that other agents have access to relevant code and documentation context. By combining dense embeddings (via Chroma) with sparse keyword search (via Weaviate/Elasticsearch), and reranking results using learned or heuristic models, it achieves high recall and precision. The ingestion pipeline maintains up‐to‐date indices as files change, while caching and failure fallbacks ensure responsiveness under load or partial outages. Comprehensive telemetry and configuration options allow tuning for latency, recall, and resource constraints. Finally, rigorous testing, from unit to large-scale integration, ensures reliability. Future enhancements around adaptive chunking, multimodal search, and user feedback promise to further elevate search relevance and developer productivity.

```
