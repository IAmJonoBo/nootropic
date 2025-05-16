// HybridRetrievalUtility.ts
// Hybrid retrieval utility: dense (DPR/Sentence-Transformers) + sparse (BM25)

import { z } from 'zod';
import BM25 from 'okapibm25';

export interface Retriever {
  retrieve(query: string, topK?: number): Promise<string[]>;
}

export interface HybridRetrievalLLMAdapter {
  // @ts-expect-error TS(7010): 'embedText', which lacks return-type annotation, i... Remove this comment to see the full error message
  embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
}

export class DenseRetriever implements Retriever {
  // @ts-expect-error TS(6138): Property 'llmAdapter' is declared but its value is... Remove this comment to see the full error message
  constructor(private llmAdapter: HybridRetrievalLLMAdapter) {}
  // DPR + ColBERT fusion stub
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async retrieve(_query: string, _topK?: number): Promise<string[]> {
    // TODO: Use DPR and ColBERT, fuse results, return with confidence scores
    // For now, return empty (simulate low confidence)
    return [];
  }
}

export class SparseRetriever implements Retriever {
  // @ts-expect-error TS(6133): 'documents' is declared but its value is never rea... Remove this comment to see the full error message
  private documents: string[] = [];
  // @ts-expect-error TS(6133): 'bm25' is declared but its value is never read.
  private bm25: typeof BM25 | null = null;

  setDocuments(docs: string[]) {
    this.documents = docs;
    // okapibm25 expects an array of strings
    // No need to precompute, just store
  }

  // @ts-expect-error TS(6133): 'query' is declared but its value is never read.
  async retrieve(query: string, topK = 5): Promise<string[]> {
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!this.documents.length) return [];
    // Use okapibm25 for BM25 ranking
    // @ts-expect-error TS(2552): Cannot find name 'bm25'. Did you mean 'BM25'?
    const bm25 = (BM25 as Record<string, unknown>)['BM25'];
    // @ts-expect-error TS(2552): Cannot find name 'bm25'. Did you mean 'BM25'?
    if (typeof bm25 !== 'function') throw new Error('BM25 is not a function');
    // @ts-expect-error TS(2552): Cannot find name 'bm25'. Did you mean 'BM25'?
    const scores = bm25(this.documents, query.split(' ')) as number[];
    // Get topK indices
    const topIndices = scores
      // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
      .map((score, idx) => ({ score, idx }))
      // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
      .sort((a, b) => b.score - a.score)
      // @ts-expect-error TS(2552): Cannot find name 'topK'. Did you mean 'top'?
      .slice(0, topK)
      // @ts-expect-error TS(2304): Cannot find name 'x'.
      .map(x => x.idx);
    return topIndices.map(i => this.documents[i]).filter((d): d is string => typeof d === 'string');
  }
}

export class HybridRetrievalUtility {
  static schema = z.object({
    query: z.string(),
    topK: z.number().int().positive().default(5),
    documents: z.array(z.string()).optional()
  });

  constructor(
    private dense: Retriever = new DenseRetriever({} as HybridRetrievalLLMAdapter),
    private sparse: SparseRetriever = new SparseRetriever(),
    private documents: string[] = []
  ) {
    if (this.sparse && this.documents.length) {
      this.sparse.setDocuments(this.documents);
    }
  }

  setDocuments(docs: string[]) {
    this.documents = docs;
    if (this.sparse) this.sparse.setDocuments(docs);
  }

  // @ts-expect-error TS(6133): 'query' is declared but its value is never read.
  async retrieve(query: string, topK = 5): Promise<string[]> {
    // Retrieve from both, fuse results, fallback to sparse if dense is low confidence
    // @ts-expect-error TS(2304): Cannot find name 'denseResults'.
    const denseResults = await this.dense.retrieve(query, topK);
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    let results: string[] = [];
    // @ts-expect-error TS(6133): 'denseResults' is declared but its value is never ... Remove this comment to see the full error message
    if (denseResults.length < Math.max(1, Math.floor(topK / 2))) {
      // Low confidence, fallback to BM25
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      const sparseResults = await this.sparse.retrieve(query, topK);
      // @ts-expect-error TS(2304): Cannot find name 'results'.
      results = Array.from(new Set([...denseResults, ...sparseResults]));
    } else {
      // Fusion logic: combine and rank (stub)
      // @ts-expect-error TS(2304): Cannot find name 'results'.
      results = denseResults;
    }
    return results.slice(0, topK);
  }

  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
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
  // @ts-expect-error TS(2339): Property 'describe' does not exist on type 'typeof... Remove this comment to see the full error message
  describe: HybridRetrievalUtility.describe,
  schema: HybridRetrievalUtility.schema
};

export default HybridRetrievalUtilityCapability; 