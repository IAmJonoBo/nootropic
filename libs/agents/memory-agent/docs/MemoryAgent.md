# MemoryAgent

***

## Table of Contents

* [MemoryAgent](#memoryagent)
  * [Table of Contents](#table-of-contents)
  * [Overview](#overview)
  * [Responsibilities](#responsibilities)
  * [Inputs & Outputs](#inputs--outputs)
    * [Inputs](#inputs)
    * [Outputs](#outputs)
  * [Data Structures](#data-structures)
  * [Algorithms & Workflow](#algorithms--workflow)
    * [Storing Completed Episodes](#storing-completed-episodes)
    * [Retrieving Few-Shot Examples](#retrieving-few-shot-examples)
    * [Summarization & Pruning](#summarization--pruning)
    * [Aging & Retention](#aging--retention)
  * [Integration Points](#integration-points)
  * [Configuration](#configuration)
  * [Metrics & Instrumentation](#metrics--instrumentation)
  * [Testing & Validation](#testing--validation)
  * [Edge Cases & Failure Modes](#edge-cases--failure-modes)
  * [Future Enhancements](#future-enhancements)
  * [Summary](#summary)

***

## Overview

The **MemoryAgent** underpins nootropic's ability to provide contextually rich, consistent, and style-aligned code suggestions. By recording every successful generation as an "episode," embedding it, and enabling fast semantic retrieval, MemoryAgent accelerates future code generation and reduces redundancy. Its pruning, summarization, and retention mechanisms ensure that the memory store remains efficient and relevant, while metadata tracking and integration with FeedbackAgent drive continuous improvement.

***

## Responsibilities

1. **Episodic Storage**
   * Record each successful code generation or autofix cycle as an episode (prompt, output, metadata, context).
   * Persist entries in a local vector database (Chroma by default, LanceDB/Weaviate optionally) as embeddings with metadata.
2. **Few-Shot Retrieval**
   * Given a new request, compute its embedding and retrieve the top-k most semantically similar past episodes above a similarity threshold.
   * Return prompt-output pairs (or summaries) for use as few-shot examples.
3. **Summarization & Compression**
   * Periodically summarize clusters of older or low-utility episodes, reducing storage and speeding retrieval.
   * Merge/prune near-duplicate episodes to prevent bloat.
4. **Aging & Retention Management**
   * Enforce retention policies (e.g., max episodes per project, max age).
   * Archive older episodes to offline store (LanceDB or compressed JSON) as needed.
5. **Cross-Agent Collaboration**
   * Provide results to CoderAgent/ReasoningAgent for prompt construction.
   * Receive feedback from FeedbackAgent to weight retrieval/retention.
6. **Metadata & Provenance Tracking**
   * Store metadata fields (taskID, outcome, model, tokens, context paths, etc.) for filtering and provenance.
   * Expose API for querying episode metadata.

***

## Inputs & Outputs

### Inputs

* **Completed Task Episodes**: Each episode includes `prompt`, `output`, and `metadata` (taskID, timestamp, model, tokens, outcome, language, projectID, filesChanged, etc.).
* **Configuration Parameters**: Under `memoryAgent` in `~/.nootropic/config.json` (maxEpisodesPerProject, similarityThreshold, embeddingModel, summarizationStrategy, pruneIntervalHours, retentionDays, archiveLocation, etc.).
* **Retrieval Requests**: Includes `queryPrompt`, `projectID`, `language`, `maxResults`, `minSimilarity`.
* **Prune & Summarization Triggers**: Scheduled or manual triggers to run summarization/pruning.

### Outputs

* **Stored Episode Embeddings**: Persisted vector entries in Chroma (or alternative), each with id, embedding, and metadata.
* **Retrieved Episodes for Few-shot**: List of episode objects (prompt, output, metadata, similarity, summary).
* **Pruned Episode Deletions or Merges**: Logs or JSON report listing removed, merged, or archived episode IDs.
* **Embedded Archive Entries**: Compressed file or LanceDB batch file for archived entries.
* **OTEL Span Metadata**: Spans for major operations (store, retrieve, prune, summarize).

***

## Data Structures

```typescript
interface EpisodeMetadata {
  taskID: string;
  timestamp: string;
  modelUsed: string;
  tokensIn: number;
  tokensOut: number;
  generationOutcome: "accepted" | "fixed" | "failed";
  language: string;
  projectID: string;
  filesChanged: string[];
}

interface EpisodeRecord {
  id: string;
  prompt: string;
  output: string;
  metadata: EpisodeMetadata;
  embedding?: number[];
  summary?: string;
}

interface RetrievalQuery {
  queryPrompt: string;
  projectID?: string;
  languageFilter?: string;
  maxResults: number;
  minSimilarity?: number;
}

interface PruneReport {
  timestamp: string;
  episodesRemoved: string[];
  episodesArchived: string[];
  clustersCreated: number;
  durationMs: number;
}
```

***

## Algorithms & Workflow

### Storing Completed Episodes

1. **Receive Episode Data**
   * Called by CoderAgent or FeedbackAgent with prompt, output, and metadata.
   * Assign a unique id (projectID\_taskID\_timestamp).
2. **Compute Embedding**
   * Use configured embedding model (local/cloud) to embed prompt+output.
   * Store vector in memory and persist to Chroma/LanceDB.
3. **Insert into Vector Store**
   * Add document to Chroma or Arrow table to LanceDB.
4. **Update Local Index**
   * Maintain in-memory index for quick lookups/filtering.
5. **Emit OTEL Span**
   * Span: `memory.store_episode` (episodeID, embeddingTimeMs, storeBackend).

### Retrieving Few-Shot Examples

1. **Receive RetrievalQuery**
   * Compute embedding for queryPrompt.
2. **Vector Similarity Search**
   * Query Chroma/LanceDB for top-k similar episodes, filter by project/language.
3. **Filter by Similarity Threshold**
   * Discard episodes below minSimilarity.
4. **Construct Response Objects**
   * Fetch full EpisodeRecord, optionally generate summary.
5. **Return Top-k Episodes**
   * Return array of episodes, sorted by similarity.
6. **Emit OTEL Span**
   * Span: `memory.retrieve_episodes` (queryTimeMs, numResults, avgSimilarity).

### Summarization & Pruning

1. **Trigger Conditions**
   * Run when episode count exceeds max, retentionDays exceeded, or duplicates detected.
2. **Cluster Similar Episodes**
   * Cluster embeddings, generate summary for each cluster.
3. **Archive or Delete Entries**
   * Archive/delete old/duplicate episodes, keep summary for clusters.
4. **Update Vector Store**
   * Remove deleted/archived IDs, insert new summaries.
5. **Emit OTEL Span & Prune Report**
   * Span: `memory.prune` (episodesRemoved, episodesArchived, clustersCreated, durationMs).

### Aging & Retention

1. **Scheduled Check**
   * Run pruning at configured intervals.
2. **Retention Policy Enforcement**
   * Archive/delete episodes by age or count.
3. **Archive Storage Layout**
   * Write archive files to date-partitioned folders.
4. **Emit OTEL Span**
   * Span: `memory.retention_enforce` (episodesArchived, episodesDeleted, durationMs).

***

## Integration Points

* **CoderAgent & ReasoningAgent**: Store and retrieve episodes for prompt construction.
* **FeedbackAgent**: Supplies feedback to weight/prioritize episodes.
* **SearchAgent**: Maintains code-file index; can filter MemoryAgent results.
* **ProjectMgrAgent**: Can request full snapshot for archiving/migration.
* **ModelAdapter**: Provides embedding/summarization services.
* **Temporal & ReflexionAdapter**: Episodic storage/pruning as workflows; ReflexionAdapter monitors spans for errors.

***

## Configuration

All configuration parameters are under `memoryAgent` in `~/.nootropic/config.json`:

```jsonc
{
  "memoryAgent": {
    "maxEpisodesPerProject": 1000,
    "similarityThreshold": 0.7,
    "embeddingModel": "openai-ada-002",
    "summarizationStrategy": "llm",
    "pruneIntervalHours": 24,
    "retentionDays": 90,
    "archiveLocation": "~/.nootropic/archive/",
    "feedbackWeightFactor": 1.5,
  },
}
```

* `maxEpisodesPerProject`: Controls memory store size.
* `similarityThreshold`: Minimum cosine similarity for retrieval.
* `embeddingModel`: Model for computing embeddings.
* `summarizationStrategy`: "none", "heuristic", or "llm".
* `pruneIntervalHours`: How often pruning runs.
* `retentionDays`: Age threshold for archival.
* `archiveLocation`: Directory or LanceDB namespace for archives.
* `feedbackWeightFactor`: Multiplier for utility score from FeedbackAgent.

***

## Metrics & Instrumentation

* **Span:** `memory.store_episode` (episodeID, embeddingTimeMs, storeBackend, modelUsedForEmbedding)
* **Span:** `memory.retrieve_episodes` (queryTimeMs, numResultsReturned, avgSimilarity, projectID)
* **Counter:** `memory.episodes_stored_total`
* **Gauge:** `memory.episodes_in_index`
* **Span:** `memory.prune` (episodesRemovedCount, episodesArchivedCount, clustersCreatedCount, durationMs)
* **Histogram:** `memory.embedding_size_distribution`
* **Span:** `memory.summarize` (episodesSummarizedCount, summarizationTimeMs, modelUsedForSummarization)

These metrics feed into dashboards and ReflexionEngine for adaptive tuning and reliability.

***

## Testing & Validation

* **Unit Tests:** Validate episode storage, retrieval, summarization, and config.
* **Integration Tests:** Chroma/LanceDB integration, pruning, retention, and retrieval logic.
* **End-to-End Workflow:** Validate with CoderAgent/FeedbackAgent, ensure retrieval and ranking work as expected.
* **Performance & Load Testing:** Benchmark retrieval/pruning at scale.

***

## Edge Cases & Failure Modes

1. **Embedding Service Unavailability**: Fallback to secondary embedding backend or enqueue for retry.
2. **Duplicate Prompt/Output Pairs**: Update timestamp/metadata, increment duplicateCount.
3. **Similarity Retrieval with Too-Few Matches**: Return only those above threshold, log event.
4. **Memory Store Corruption**: Switch to LanceDB, schedule repair, notify user if persistent.
5. **High Memory Usage During Pruning**: Use streaming/batch approach, throttle if needed.
6. **Cross-Project Pollution**: Enforce strict projectID filtering unless cross-project retrieval is requested.

***

## Future Enhancements

1. **Hierarchical Memory Indexing**: Multi-granularity indices for large codebases.
2. **Adaptive Retention Policies**: Use feedback to adjust retention dynamically.
3. **Memory Distillation**: Merge episodes into canonical patterns.
4. **Multi-modal Episode Storage**: Store AST/code-graph embeddings for improved retrieval.
5. **Interactive Memory Visualization**: GUI panel for timeline/search/filtering.
6. **Federated & Shared Memory**: Enable collaborative memory pools with privacy-preserving techniques.

***

## Summary

> The MemoryAgent underpins nootropic's ability to provide contextually rich, consistent, and style-aligned code suggestions. By recording every successful generation as an "episode," embedding it, and enabling fast semantic retrieval, MemoryAgent accelerates future code generation and reduces redundancy. Its pruning, summarization, and retention mechanisms ensure that the memory store remains efficient and relevant, while metadata tracking and integration with FeedbackAgent drive continuous improvement. Robust instrumentation and testing guarantee reliability under diverse workloads; planned enhancements will further optimize retrieval and support collaborative scenarios. Consequently, MemoryAgent is fundamental for maintaining institutional knowledge, conveying best practices, and guiding LLM-driven workflows toward ever-higher fidelity.
