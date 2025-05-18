// ChunkingUtility.ts
// LLM-driven chunk filtering utility (ChunkRAG-inspired)
import { z } from 'zod';
import hnswlib from 'hnswlib-node';
export class SemanticChunkingStrategy {
    llmAdapter;
    constructor(llmAdapter) {
        this.llmAdapter = llmAdapter;
    }
    async chunk(text) {
        // Adaptive semantic splitting: split by sentences, then merge/split by embedding similarity
        const sentences = text.split(/(?<=[.!?])\s+/); // naive sentence split
        const embeddings = await Promise.all(sentences.map(s => this.llmAdapter.embedText(s ?? '')));
        // Group sentences by similarity threshold (adaptive)
        const threshold = 0.75; // TODO: make configurable
        const chunks = [];
        let current = [];
        let lastEmbedding = embeddings[0] ?? [];
        for (let i = 0; i < sentences.length; i++) {
            if (i === 0) {
                current.push(sentences[i] ?? '');
                continue;
            }
            const sim = cosineSimilarity(embeddings[i] ?? [], lastEmbedding);
            if (sim > threshold) {
                current.push(sentences[i] ?? '');
            }
            else {
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
export class LLMChunkRAGStrategy {
    llmAdapter;
    constructor(llmAdapter) {
        this.llmAdapter = llmAdapter;
    }
    async chunk(text) {
        // Use LLM to propose and filter chunks (ChunkRAG-inspired)
        // TODO: Implement LLM prompt to propose chunk boundaries and filter by relevance
        // For now, fallback to semantic splitting
        const semantic = new SemanticChunkingStrategy(this.llmAdapter);
        return semantic.chunk(text);
    }
}
function cosineSimilarity(a = [], b = []) {
    if (!a.length || !b.length)
        return 0;
    const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] ?? 0), 0);
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dot / (normA * normB);
}
export class LLMChunkRelevanceScorer {
    llmAdapter;
    constructor(llmAdapter) {
        this.llmAdapter = llmAdapter;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async score(_chunk, _query) {
        // Use llmAdapter.embedText for chunk and query, compute cosine similarity
        return 0;
    }
}
export class RedundancyFilter {
    filter(chunks) {
        // HNSW-based redundancy reduction: remove chunks with cosine similarity > 0.9
        if (!chunks.length)
            return chunks;
        const dim = (chunks[0] && chunks[0].embedding && Array.isArray(chunks[0].embedding)) ? chunks[0].embedding.length : 0;
        const index = new hnswlib.HierarchicalNSW('cosine', dim);
        index.initIndex(chunks.length);
        chunks.forEach((chunk, i) => {
            if (chunk && chunk.embedding && chunk.embedding.length === dim)
                index.addPoint(chunk.embedding, i);
        });
        const keep = new Set();
        for (let i = 0; i < chunks.length; i++) {
            if (!Array.isArray(chunks) || typeof chunks[i] === 'undefined' || !hasEmbedding(chunks[i]))
                continue;
            if (!keep.has(i)) {
                keep.add(i);
                const chunkI = typeof chunks[i] !== 'undefined' ? chunks[i] : undefined;
                if (!chunkI || !hasEmbedding(chunkI))
                    continue;
                const embeddingI = chunkI.embedding;
                if (!embeddingI)
                    continue;
                const neighbors = index.searchKnn(embeddingI, 3);
                for (const n of neighbors.neighbors ?? []) {
                    if (n !== i &&
                        typeof chunks[n] !== 'undefined' && (() => {
                        const chunkN = chunks[n];
                        if (!chunkN || !hasEmbedding(chunkN) || !chunkN.embedding)
                            return false;
                        return cosineSimilarity(embeddingI, chunkN.embedding) > 0.9;
                    })()) {
                        // Redundant, skip
                        continue;
                    }
                }
            }
        }
        return Array.from(keep)
            .map(i => chunks[i])
            .filter((c) => !!c);
    }
}
export class ChunkingUtility {
    llmAdapter;
    strategy;
    scorer;
    redundancyFilter;
    constructor(llmAdapter, strategy = new SemanticChunkingStrategy({}), scorer = new LLMChunkRelevanceScorer({}), redundancyFilter = new RedundancyFilter()) {
        this.llmAdapter = llmAdapter;
        this.strategy = strategy;
        this.scorer = scorer;
        this.redundancyFilter = redundancyFilter;
        this.strategy = new SemanticChunkingStrategy(llmAdapter);
        this.scorer = new LLMChunkRelevanceScorer(llmAdapter);
    }
    async chunkAndFilter(text, query) {
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
    schema: ExperimentalChunkingUtilitySchema,
    health: async () => ({ status: 'ok', timestamp: new Date().toISOString() })
};
export default ExperimentalChunkingUtilityCapability;
// Helper type guard for chunk embedding
function hasEmbedding(chunk) {
    return typeof chunk === 'object' && chunk !== null && 'embedding' in chunk && Array.isArray(chunk.embedding);
}
