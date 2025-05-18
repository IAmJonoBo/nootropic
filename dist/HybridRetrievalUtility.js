// HybridRetrievalUtility.ts
// Hybrid retrieval utility: dense (DPR/Sentence-Transformers) + sparse (BM25)
import { z } from 'zod';
// @ts-ignore
import BM25 from 'okapibm25';
export class DenseRetriever {
    constructor() { }
    // DPR + ColBERT fusion stub
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async retrieve(_query, _topK) {
        // TODO: Use DPR and ColBERT, fuse results, return with confidence scores
        // For now, return empty (simulate low confidence)
        return [];
    }
}
export class SparseRetriever {
    documents = [];
    // TODO: bm25 is intentionally omitted; add if needed for future extension.
    setDocuments(docs) {
        this.documents = docs;
        // okapibm25 expects an array of strings
        // No need to precompute, just store
    }
    async retrieve(query, topK = 5) {
        if (!this.documents.length)
            return [];
        // Use okapibm25 for BM25 ranking
        const scores = (BM25.default || BM25)(this.documents, query.split(' '));
        // Get topK indices
        const topIndices = scores
            .map((score, idx) => ({ score, idx }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK)
            .map(x => x.idx);
        return topIndices.map(i => this.documents[i]).filter((d) => typeof d === 'string');
    }
}
export class HybridRetrievalUtility {
    dense;
    sparse;
    documents;
    static schema = z.object({
        query: z.string(),
        topK: z.number().int().positive().default(5),
        documents: z.array(z.string()).optional()
    });
    constructor(dense = new DenseRetriever(), sparse = new SparseRetriever(), documents = []) {
        this.dense = dense;
        this.sparse = sparse;
        this.documents = documents;
        if (this.sparse && this.documents.length) {
            this.sparse.setDocuments(this.documents);
        }
    }
    setDocuments(docs) {
        this.documents = docs;
        if (this.sparse)
            this.sparse.setDocuments(docs);
    }
    async retrieve(query, topK = 5) {
        // Retrieve from both, fuse results, fallback to sparse if dense is low confidence
        const denseResults = await this.dense.retrieve(query, topK);
        let results = [];
        if (denseResults.length < Math.max(1, Math.floor(topK / 2))) {
            // Low confidence, fallback to BM25
            const sparseResults = await this.sparse.retrieve(query, topK);
            results = Array.from(new Set([...denseResults, ...sparseResults]));
        }
        else {
            // Fusion logic: combine and rank (stub)
            results = denseResults;
        }
        return results.slice(0, topK);
    }
    static describe() {
        return {
            name: 'HybridRetrievalUtility',
            description: 'Hybrid retrieval utility combining dense (DPR/ColBERT/Sentence-Transformers) and sparse (BM25) retrieval. Registry/LLM/AI-friendly, pluggable adapters, confidence gating, and schema-validated.',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/facebookresearch/DPR',
            docsFirst: true,
            aiFriendlyDocs: true,
            usage: "import HybridRetrievalUtility from 'nootropic/utils/context/HybridRetrievalUtility'; const util = new HybridRetrievalUtility(); util.setDocuments(['doc1', 'doc2']); await util.retrieve('query');",
            methods: [
                { name: 'retrieve', signature: '(query: string, topK?: number) => Promise<string[]>', description: 'Retrieve results using hybrid dense+sparse retrieval with confidence gating and fusion.' },
                { name: 'setDocuments', signature: '(docs: string[]) => void', description: 'Set the document corpus for retrieval.' }
            ],
            extensionPoints: [
                'Pluggable dense retrievers (DPR, ColBERT, etc.)',
                'BM25 backend adapters',
                'Fusion/confidence gating logic',
                'ColBERT/advanced fusion (TODO)'
            ],
            references: [
                'https://github.com/facebookresearch/DPR',
                'https://github.com/xhluca/bm25s',
                'https://github.com/kyr0/vectorstore',
                'https://www.npmjs.com/package/okapibm25'
            ],
            schema: HybridRetrievalUtility.schema
        };
    }
}
const HybridRetrievalUtilityCapability = {
    name: 'HybridRetrievalUtility',
    describe: HybridRetrievalUtility.describe,
    schema: HybridRetrievalUtility.schema
};
export default HybridRetrievalUtilityCapability;
