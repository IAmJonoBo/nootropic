import { describe, it } from 'vitest';
// @ts-ignore
import { ChunkingUtility } from '../ChunkingUtility';
import { HybridRetrievalUtility } from '../HybridRetrievalUtility';
import { RerankUtility } from '../src/utils/context/RerankUtility';
// @ts-ignore
// import { RerankUtility } from '../utils/context/RerankUtility';
import { ShimiMemory } from '../src/utils/context/shimiMemory';

/**
 * Benchmark and performance tests for advanced utilities.
 * - Timing, throughput, and memory usage for ChunkingUtility, HybridRetrievalUtility, RerankUtility, ShimiMemory
 * - Use Vitest and console.time/performance.now for timing
 * - LLM/AI usage hint: "Benchmark advanced utilities for speed, throughput, and memory."
 */
describe('Advanced Utilities Benchmark', () => {
  it('benchmarks ShimiMemory insert/retrieve performance', async () => {
    const shimi = new ShimiMemory({ backend: { name: 'mock', async embedText(t: string) { return t.split('').map(c => c.charCodeAt(0) / 100); } } });
    const N = 1000;
    const start = performance.now();
    for (let i = 0; i < N; i++) {
      await shimi.insertEntity({ concept: 'bench', explanation: `item${i}` });
    }
    const insertTime = performance.now() - start;
    const retrieveStart = performance.now();
    await shimi.retrieveEntities('item500');
    const retrieveTime = performance.now() - retrieveStart;
    console.log(`[Benchmark] ShimiMemory: Insert ${N} entities: ${insertTime.toFixed(2)}ms, Retrieve: ${retrieveTime.toFixed(2)}ms`);
  });

  it('benchmarks ChunkingUtility performance', async () => {
    let callCount = 0;
    const mockAdapter = { async embedText(text: string) { callCount++; return Array(10).fill(callCount); } };
    const noopRedundancyFilter = { filter: (chunks: any[]) => chunks };
    const chunker = new ChunkingUtility(mockAdapter);
    chunker.redundancyFilter = noopRedundancyFilter;
    const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(1000); // ~56k chars
    const query = 'test query';
    const start = performance.now();
    const chunks = await chunker.chunkAndFilter(text, query);
    const elapsed = performance.now() - start;
    console.log(`[Benchmark] ChunkingUtility: Chunked ${text.length} chars into ${chunks.length} chunks in ${elapsed.toFixed(2)}ms`);
  });

  it('benchmarks HybridRetrievalUtility performance', async () => {
    // Mock dense retriever returns no results to force BM25 fallback
    const mockDense = { retrieve: async () => [] };
    const docs = Array.from({ length: 1000 }, (_, i) => `Document number ${i} about topic ${i % 10}`);
    const hybrid = new HybridRetrievalUtility(mockDense);
    hybrid.setDocuments(docs);
    const query = 'topic 5';
    const start = performance.now();
    const results = await hybrid.retrieve(query, 10);
    const elapsed = performance.now() - start;
    console.log(`[Benchmark] HybridRetrievalUtility: Retrieved ${results.length} docs from ${docs.length} in ${elapsed.toFixed(2)}ms`);
  });

  it('benchmarks RerankUtility performance', async () => {
    const mockAdapter = { async embedText(text: string) { return Array(10).fill(text.length); } };
    const { BiEncoderReranker, CrossEncoderReranker, RerankUtility } = await import('../src/utils/context/RerankUtility');
    const reranker = new RerankUtility(
      new BiEncoderReranker(mockAdapter),
      new CrossEncoderReranker(mockAdapter)
    );
    const query = 'test query';
    const candidates = Array.from({ length: 1000 }, (_, i) => `Candidate ${i}`);
    const start = performance.now();
    const results = await reranker.rerank(query, candidates, { topN: 10 });
    const elapsed = performance.now() - start;
    console.log(`[Benchmark] RerankUtility: Reranked ${candidates.length} candidates to ${results.length} in ${elapsed.toFixed(2)}ms`);
  });

  // Add memory usage and throughput tests as needed
}); 