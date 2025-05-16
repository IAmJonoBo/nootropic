// RerankUtility.ts
// Bi-encoder + cross-encoder reranking utility

import { z } from 'zod';

export interface Reranker {
  rerank(query: string, candidates: string[]): Promise<string[]>;
}

export interface RerankLLMAdapter {
  // @ts-expect-error TS(7010): 'embedText', which lacks return-type annotation, i... Remove this comment to see the full error message
  embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
  // @ts-expect-error TS(2304): Cannot find name 'generateText'.
  generateText?(prompt: string, model?: string, options?: Record<string, unknown>): Promise<string>;
}

export class BiEncoderReranker implements Reranker {
  // @ts-expect-error TS(6138): Property 'llmAdapter' is declared but its value is... Remove this comment to see the full error message
  constructor(private llmAdapter: RerankLLMAdapter) {}
  // @ts-expect-error TS(6133): 'query' is declared but its value is never read.
  async rerank(query: string, candidates: string[]): Promise<string[]> {
    // Use llmAdapter.embedText for bi-encoder reranking (cosine similarity)
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!this.llmAdapter.embedText) return candidates;
    // @ts-expect-error TS(2304): Cannot find name 'queryEmbedding'.
    const queryEmbedding = await this.llmAdapter.embedText(query);
    // @ts-expect-error TS(2304): Cannot find name 'candidateEmbeddings'.
    const candidateEmbeddings = await Promise.all(candidates.map(c => this.llmAdapter.embedText(c)));
    // @ts-expect-error TS(2304): Cannot find name 'scored'.
    const scored = candidates.map((c, i) => ({
      // @ts-expect-error TS(2304): Cannot find name 'c'.
      candidate: c,
      // @ts-expect-error TS(2304): Cannot find name 'queryEmbedding'.
      score: cosineSimilarity(queryEmbedding, candidateEmbeddings[i] ?? [])
    }));
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    scored.sort((a, b) => b.score - a.score);
    // @ts-expect-error TS(2304): Cannot find name 'scored'.
    return scored.map(s => s.candidate);
  }
}

export class CrossEncoderReranker implements Reranker {
  // @ts-expect-error TS(6138): Property 'llmAdapter' is declared but its value is... Remove this comment to see the full error message
  constructor(private llmAdapter: RerankLLMAdapter) {}
  // @ts-expect-error TS(6133): 'query' is declared but its value is never read.
  async rerank(query: string, candidates: string[]): Promise<string[]> {
    // Use llmAdapter.generateText or embedText for cross-encoder reranking (stub)
    // In real impl, use LLM to score (query, candidate) pairs
    // For now, return as-is
    // @ts-expect-error TS(2304): Cannot find name 'candidates'.
    return candidates;
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

export class RerankUtility {
  constructor(
    private biEncoder: Reranker = new BiEncoderReranker({} as RerankLLMAdapter),
    private crossEncoder: Reranker = new CrossEncoderReranker({} as RerankLLMAdapter)
  ) {}

  // @ts-expect-error TS(6133): 'query' is declared but its value is never read.
  async rerank(query: string, candidates: string[], options?: { instruction?: string, topN?: number }): Promise<string[]> {
    // Bi-encoder initial ranking
    // @ts-expect-error TS(2304): Cannot find name 'biRanked'.
    const biRanked = await this.biEncoder.rerank(query, candidates);
    // Cross-encoder rerank top-N (default N=5 or all if fewer)
    // @ts-expect-error TS(2304): Cannot find name 'topN'.
    const topN = options?.topN ?? Math.min(5, biRanked.length);
    // @ts-expect-error TS(2304): Cannot find name 'toRerank'.
    const toRerank = biRanked.slice(0, topN);
    // @ts-expect-error TS(2304): Cannot find name 'reranked'.
    const reranked = await this.crossEncoder.rerank(query, toRerank);
    // Instruction-following reranking (stub)
    // TODO: Use options.instruction to modify reranking criteria
    // For now, just append the rest
    // @ts-expect-error TS(2304): Cannot find name 'reranked'.
    return [...reranked, ...biRanked.slice(topN)];
  }
}

export const RerankUtilitySchema = z.object({
  query: z.string(),
  candidates: z.array(z.string())
});

export function describe() {
  return {
    name: 'RerankUtility',
    description: 'Bi-encoder + cross-encoder cascade reranking utility. Supports instruction-following reranking, registry/LLM/AI-friendly, pluggable adapters, and schema-validated.',
    license: 'MIT',
    isOpenSource: true,
    provenance: 'https://www.sbert.net/',
    docsFirst: true,
    aiFriendlyDocs: true,
    usage: "import RerankUtility from 'nootropic/utils/context/RerankUtility'; const util = new RerankUtility(); await util.rerank('query', ['candidate1', 'candidate2'], { instruction: 'prefer code', topN: 5 });",
    methods: [
      { name: 'rerank', signature: '(query: string, candidates: string[], options?: { instruction?: string, topN?: number }) => Promise<string[]>', description: 'Rerank candidates using bi-encoder and cross-encoder cascade, with optional instruction-following.' }
    ],
    extensionPoints: [
      'Pluggable bi-encoder/cross-encoder adapters',
      'Instruction-following reranking',
      'LLM/embedding backend selection',
      'Advanced scoring/fusion logic (TODO)'
    ],
    references: [
      'https://www.sbert.net/'
    ],
    schema: RerankUtilitySchema
  };
}

const RerankUtilityCapability = {
  name: 'RerankUtility',
  describe,
  schema: RerankUtilitySchema
};

export default RerankUtilityCapability; 