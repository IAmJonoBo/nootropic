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
  // @ts-expect-error TS(7010): 'embedText', which lacks return-type annotation, i... Remove this comment to see the full error message
  embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
  // @ts-expect-error TS(2304): Cannot find name 'generateText'.
  generateText?(prompt: string, model?: string, options?: Record<string, unknown>): Promise<string>;
}

export class SemanticChunkingStrategy implements ChunkingStrategy {
  // @ts-expect-error TS(6138): Property 'llmAdapter' is declared but its value is... Remove this comment to see the full error message
  constructor(private llmAdapter: ChunkingLLMAdapter) {}
  // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
  async chunk(text: string): Promise<Chunk[]> {
    // Adaptive semantic splitting: split by sentences, then merge/split by embedding similarity
    // @ts-expect-error TS(2304): Cannot find name 'sentences'.
    const sentences = text.split(/(?<=[.!?])\s+/); // naive sentence split
    // @ts-expect-error TS(2304): Cannot find name 'embeddings'.
    const embeddings = await Promise.all(sentences.map(s => this.llmAdapter.embedText(s ?? '')));
    // Group sentences by similarity threshold (adaptive)
    // @ts-expect-error TS(2304): Cannot find name 'threshold'.
    const threshold = 0.75; // TODO: make configurable
    // @ts-expect-error TS(2304): Cannot find name 'chunks'.
    const chunks: Chunk[] = [];
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let current: string[] = [];
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let lastEmbedding = embeddings[0] ?? [];
    // @ts-expect-error TS(2300): Duplicate identifier 'i'.
    for (let i = 0; i < sentences.length; i++) {
      // @ts-expect-error TS(2304): Cannot find name 'i'.
      if (i === 0) {
        // @ts-expect-error TS(2304): Cannot find name 'current'.
        current.push(sentences[i] ?? '');
        continue;
      }
      // @ts-expect-error TS(2304): Cannot find name 'embeddings'.
      const sim = cosineSimilarity(embeddings[i] ?? [], lastEmbedding);
      // @ts-expect-error TS(2304): Cannot find name 'threshold'.
      if (sim > threshold) {
        // @ts-expect-error TS(2304): Cannot find name 'current'.
        current.push(sentences[i] ?? '');
      } else {
        // @ts-expect-error TS(2304): Cannot find name 'chunks'.
        chunks.push({ text: current.join(' '), embedding: lastEmbedding ?? [] });
        // @ts-expect-error TS(2304): Cannot find name 'current'.
        current = [sentences[i] ?? ''];
        // @ts-expect-error TS(2304): Cannot find name 'lastEmbedding'.
        lastEmbedding = embeddings[i] ?? [];
      }
    }
    // @ts-expect-error TS(2304): Cannot find name 'current'.
    if (current.length) {
      // @ts-expect-error TS(2304): Cannot find name 'chunks'.
      chunks.push({ text: current.join(' '), embedding: lastEmbedding ?? [] });
    }
    return chunks;
  }
}

export class LLMChunkRAGStrategy implements ChunkingStrategy {
  // @ts-expect-error TS(6138): Property 'llmAdapter' is declared but its value is... Remove this comment to see the full error message
  constructor(private llmAdapter: ChunkingLLMAdapter) {}
  // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
  async chunk(text: string): Promise<Chunk[]> {
    // Use LLM to propose and filter chunks (ChunkRAG-inspired)
    // TODO: Implement LLM prompt to propose chunk boundaries and filter by relevance
    // For now, fallback to semantic splitting
    // @ts-expect-error TS(2304): Cannot find name 'semantic'.
    const semantic = new SemanticChunkingStrategy(this.llmAdapter);
    // @ts-expect-error TS(2304): Cannot find name 'semantic'.
    return semantic.chunk(text);
  }
}

function cosineSimilarity(a: number[] = [], b: number[] = []): number {
  if (!a.length || !b.length) return 0;
  // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
  const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] ?? 0), 0);
  // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

export class LLMChunkRelevanceScorer {
  // @ts-expect-error TS(6138): Property 'llmAdapter' is declared but its value is... Remove this comment to see the full error message
  constructor(private llmAdapter: ChunkingLLMAdapter) {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async score(_chunk: Chunk, _query: string): Promise<number> {
    // Use llmAdapter.embedText for chunk and query, compute cosine similarity
    return 0;
  }
}

export class RedundancyFilter {
  // @ts-expect-error TS(2366): Function lacks ending return statement and return ... Remove this comment to see the full error message
  filter(chunks: Chunk[]): Chunk[] {
    // HNSW-based redundancy reduction: remove chunks with cosine similarity > 0.9
    if (!chunks.length) return chunks;
    const dim = (chunks[0] && chunks[0].embedding && Array.isArray(chunks[0].embedding)) ? chunks[0].embedding.length : 0;
    const index = new HierarchicalNSW('cosine', dim);
    index.initIndex(chunks.length);
    // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
    chunks.forEach((chunk, i) => {
      // @ts-expect-error TS(6133): 'chunk' is declared but its value is never read.
      if (chunk && chunk.embedding && chunk.embedding.length === dim) index.addPoint(chunk.embedding, i);
    });
    // @ts-expect-error TS(2693): 'number' only refers to a type, but is being used ... Remove this comment to see the full error message
    const keep = new Set<number>();
    // @ts-expect-error TS(2304): Cannot find name 'chunks'.
    for (let i = 0; i < chunks.length; i++) {
      // @ts-expect-error TS(2304): Cannot find name 'chunks'.
      if (!chunks[i] || !chunks[i].embedding) continue;
      // @ts-expect-error TS(2304): Cannot find name 'keep'.
      if (!keep.has(i)) {
        // @ts-expect-error TS(2304): Cannot find name 'keep'.
        keep.add(i);
        // @ts-expect-error TS(2304): Cannot find name 'chunks'.
        const embeddingI = chunks[i].embedding;
        if (!embeddingI) continue;
        // @ts-expect-error TS(2304): Cannot find name 'index'.
        const neighbors = index.searchKnn(embeddingI, 3);
        for (const n of neighbors.neighbors ?? []) {
          if (
            n !== i &&
            // @ts-expect-error TS(2304): Cannot find name 'chunks'.
            chunks[n] && chunks[n].embedding &&
            // @ts-expect-error TS(2304): Cannot find name 'chunks'.
            cosineSimilarity(embeddingI, chunks[n].embedding) > 0.9
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
    private strategy: ChunkingStrategy = new SemanticChunkingStrategy({} as ChunkingLLMAdapter),
    private scorer: LLMChunkRelevanceScorer = new LLMChunkRelevanceScorer({} as ChunkingLLMAdapter),
    // @ts-expect-error TS(6138): Property 'redundancyFilter' is declared but its va... Remove this comment to see the full error message
    private redundancyFilter: RedundancyFilter = new RedundancyFilter()
  ) {}

  // @ts-expect-error TS(6133): 'text' is declared but its value is never read.
  async chunkAndFilter(text: string, query: string): Promise<Chunk[]> {
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let chunks = await this.strategy.chunk(text);
    // Score relevance
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    for (const chunk of chunks) {
      // @ts-expect-error TS(2339): Property 'scorer' does not exist on type '{ let: a... Remove this comment to see the full error message
      chunk.relevanceScore = await this.scorer.score(chunk, query);
    }
    // Filter redundant
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
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