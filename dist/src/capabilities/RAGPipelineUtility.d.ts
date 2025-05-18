import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
/**
 * RAGPipelineUtility: Provides hybrid retrieval, advanced chunking, reranking, and feedback loops for RAG pipelines.
 * Integrates with embedding providers and semantic index. Reference: LlamaIndex, Weaviate, RAGAS, RaLLe, ARES, TruLens
 */
export declare class RAGPipelineUtility implements Capability {
    readonly name = "RAGPipelineUtility";
    private publishEvent;
    constructor(publishEvent: (event: unknown) => Promise<void>);
    /**
     * Run a RAG pipeline: hybrid retrieval, chunking, reranking, feedback.
     * Simulates a modern RAG pipeline as in LlamaIndex, Weaviate, RAGAS, TruLens, etc.
     * 'input' is the query or context for retrieval.
     * Returns a simulated RAG pipeline result and logs.
     */
    runRAGPipeline(input: unknown): Promise<{
        output: unknown;
        logs: string[];
    }>;
    queryRewrite(query: string): Promise<string>;
    submitFeedback(feedback: string): Promise<void>;
    health(): Promise<HealthStatus>;
    describe(): CapabilityDescribe;
}
export default RAGPipelineUtility;
