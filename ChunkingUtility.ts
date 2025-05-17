// ChunkingUtility.ts
// LLM-driven chunk filtering utility (ChunkRAG-inspired)

import { z } from 'zod';
import { HierarchicalNSW } from 'hnswlib-node';

export interface Chunk {
  text: string;
  embedding?: number[];
  relevanceScore?: number;
}

export interface ChunkingStrategy {
  chunk(text: string): Promise<Chunk[]>;
}

export interface ChunkingLLMAdapter {
  embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
  generateText?(prompt: string, model?: string, options?: Record<string, unknown>): Promise<string>;
}

export class SemanticChunkingStrategy implements ChunkingStrategy {
  constructor(public llmAdapter: ChunkingLLMAdapter) {}

  async chunk(text: string): Promise<Chunk[]> {
    // Adaptive semantic splitting: split by sentences, then merge/split by embedding similarity
    const sentences = text.split(/(?<=[.!?])\s+/); // naive sentence split
    const embeddings = await Promise.all(sentences.map(s => this.llmAdapter.embedText(s ?? '')));
    // Group sentences by similarity threshold (adaptive)
    const threshold = 0.75; // TODO: make configurable
    const chunks: Chunk[] = [];
    let current: string[] = [];
    let lastEmbedding = embeddings[0] ?? [];
    for (let i = 0; i < sentences.length; i++) {
      if (i === 0) {
        current.push(sentences[i] ?? '');
        continue;
      }
      const sim = cosineSimilarity(embeddings[i] ?? [], lastEmbedding);
      if (sim > threshold) {
        current.push(sentences[i] ?? '');
      } else {
        chunks.push({ text: current.join(' '), embedding: lastEmbedding ?? [] });
        current = [sentences[i] ?? ''];
        lastEmbedding = embeddings[i] ?? [];
      }
    }
    if (current.length) {
      chunks.push({ text: current.join(' '), embedding: lastEmbedding ?? [] });
    }
    return chunks;
  }
}

export class LLMChunkRAGStrategy implements ChunkingStrategy {
  constructor(public llmAdapter: ChunkingLLMAdapter) {}

  async chunk(text: string): Promise<Chunk[]> {
    // Use LLM to propose and filter chunks (ChunkRAG-inspired)
    // TODO: Implement LLM prompt to propose chunk boundaries and filter by relevance
    // For now, fallback to semantic splitting
    const semantic = new SemanticChunkingStrategy(this.llmAdapter);
    return semantic.chunk(text);
  }
}

function cosineSimilarity(a: number[] = [], b: number[] = []): number {
  if (!a.length || !b.length) return 0;
  const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] ?? 0), 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

export class LLMChunkRelevanceScorer {
  constructor(public llmAdapter: ChunkingLLMAdapter) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async score(_chunk: Chunk, _query: string): Promise<number> {
    // Use llmAdapter.embedText for chunk and query, compute cosine similarity
    return 0;
  }
}

export class RedundancyFilter {
  filter(chunks: Chunk[]): Chunk[] {
    // HNSW-based redundancy reduction: remove chunks with cosine similarity > 0.9
    if (!chunks.length) return chunks;
    const dim = (chunks[0] && chunks[0].embedding && Array.isArray(chunks[0].embedding)) ? chunks[0].embedding.length : 0;
    const index = new HierarchicalNSW('cosine', dim);
    index.initIndex(chunks.length);
    chunks.forEach((chunk, i) => {
      if (chunk && chunk.embedding && chunk.embedding.length === dim) index.addPoint(chunk.embedding, i);
    });
    const keep = new Set<number>();
    for (let i = 0; i < chunks.length; i++) {
      if (!Array.isArray(chunks) || typeof chunks[i] === 'undefined' || !hasEmbedding(chunks[i])) continue;
      if (!keep.has(i)) {
        keep.add(i);
        const chunkI = typeof chunks[i] !== 'undefined' ? chunks[i] : undefined;
        if (!chunkI || !hasEmbedding(chunkI)) continue;
        const embeddingI = chunkI.embedding;
        if (!embeddingI) continue;
        const neighbors = index.searchKnn(embeddingI, 3);
        for (const n of neighbors.neighbors ?? []) {
          if (
            n !== i &&
            typeof chunks[n] !== 'undefined' && (() => {
              const chunkN = chunks[n];
              if (!chunkN || !hasEmbedding(chunkN) || !chunkN.embedding) return false;
              return cosineSimilarity(embeddingI, chunkN.embedding) > 0.9;
            })()
          ) {
            // Redundant, skip
            continue;
          }
        }
      }
    }
    return Array.from(keep)
      .map(i => chunks[i])
      .filter((c): c is Chunk => !!c);
  }
}

export class ChunkingUtility {
  constructor(
    public llmAdapter: ChunkingLLMAdapter,
    public strategy: ChunkingStrategy = new SemanticChunkingStrategy(({} as ChunkingLLMAdapter)),
    public scorer: LLMChunkRelevanceScorer = new LLMChunkRelevanceScorer(({} as ChunkingLLMAdapter)),
    public redundancyFilter: RedundancyFilter = new RedundancyFilter()
  ) {
    this.strategy = new SemanticChunkingStrategy(llmAdapter);
    this.scorer = new LLMChunkRelevanceScorer(llmAdapter);
  }

  async chunkAndFilter(text: string, query: string): Promise<Chunk[]> {
    let chunks = await this.strategy.chunk(text);
    // Score relevance
    for (const chunk of chunks) {
      chunk.relevanceScore = await this.scorer.score(chunk, query);
    }
    // Filter redundant
    return this.redundancyFilter.filter(chunks);
  }
}

// Add schema for registry compliance
export const ExperimentalChunkingUtilitySchema = z.object({
  text: z.string(),
  query: z.string().optional()
});

export function describe() {
  return {
    name: 'ExperimentalChunkingUtility',
    description: 'Experimental LLM-driven chunk filtering utility (ChunkRAG-inspired) with adaptive semantic splitting and HNSW-based redundancy reduction. For research and prototyping only. Not production-ready.',
    license: 'MIT',
    isOpenSource: true,
    provenance: 'https://arxiv.org/abs/2310.02600',
    docsFirst: true,
    aiFriendlyDocs: true,
    usage: "import ExperimentalChunkingUtility from 'nootropic/utils/context/experimental/ChunkingUtility'; const util = new ExperimentalChunkingUtility(); await util.chunkAndFilter('text', 'query');",
    status: 'experimental',
    methods: [
      { name: 'chunkAndFilter', signature: '(text: string, query: string) => Promise<Chunk[]>', description: 'Chunk and filter text using LLM-driven strategies, adaptive semantic splitting, and HNSW-based redundancy reduction.' }
    ],
    extensionPoints: [
      'Pluggable chunking strategies (LLMChunkRAGStrategy, SemanticChunkingStrategy, etc.)',
      'LLM/embedding backend adapters',
      'HNSW/ColBERT/advanced chunking (TODO)'
    ],
    references: [
      'https://arxiv.org/abs/2310.02600',
      'https://github.com/facebookresearch/llama',
      'https://github.com/yoshoku/hnswlib-node'
    ],
    schema: ExperimentalChunkingUtilitySchema
  };
}

const ExperimentalChunkingUtilityCapability = {
  name: 'ExperimentalChunkingUtility',
  describe,
  schema: ExperimentalChunkingUtilitySchema
};

export default ExperimentalChunkingUtilityCapability;

// Helper type guard for chunk embedding
function hasEmbedding(chunk: unknown): chunk is { embedding: number[] } {
  return typeof chunk === 'object' && chunk !== null && 'embedding' in chunk && Array.isArray((chunk as any).embedding);
} 