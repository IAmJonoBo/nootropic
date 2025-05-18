import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
import { z } from 'zod';
/**
 * Supported reranking strategies.
 */
export type RerankStrategy = 'embedding' | 'llm' | 'cross-encoder' | 'mmr';
/**
 * Options for reranking results.
 */
export interface RerankOptions {
    strategy: RerankStrategy;
    query: string;
    results: string[];
    topK?: number;
}
/**
 * Modular reranking utility supporting embedding-based, LLM-based, cross-encoder, and MMR (diversity) reranking.
 * Registry-driven, describe/health compliant. Stubs for pluggable backends.
 *
 * LLM/AI-usage: Use rerank() with the desired strategy. All inputs are runtime validated with Zod.
 * Extension: Plug in real embedding/LLM/cross-encoder backends as needed.
 */
export declare class RerankUtility implements Capability {
    readonly name = "RerankUtility";
    /**
     * Canonical Zod schema for rerank options.
     */
    static schema: z.ZodObject<{
        strategy: z.ZodEnum<["embedding", "llm", "cross-encoder", "mmr"]>;
        query: z.ZodString;
        results: z.ZodArray<z.ZodString, "many">;
        topK: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        query: string;
        strategy: "embedding" | "llm" | "cross-encoder" | "mmr";
        results: string[];
        topK?: number | undefined;
    }, {
        query: string;
        strategy: "embedding" | "llm" | "cross-encoder" | "mmr";
        results: string[];
        topK?: number | undefined;
    }>;
    /**
     * Rerank results using the selected strategy. All options are runtime validated.
     * @param options RerankOptions (validated at runtime)
     * @returns Promise<string[]> Reranked results
     */
    rerank(options: RerankOptions): Promise<string[]>;
    /**
     * Embedding-based reranking (stub).
     * @param query Query string
     * @param results Results to rerank
     * @param topK Number of top results
     */
    embeddingRerank(_query: string, results: string[], topK: number): Promise<string[]>;
    /**
     * LLM-based reranking (stub).
     * @param query Query string
     * @param results Results to rerank
     * @param topK Number of top results
     */
    llmRerank(_query: string, results: string[], topK: number): Promise<string[]>;
    /**
     * Cross-encoder reranking (stub).
     * @param query Query string
     * @param results Results to rerank
     * @param topK Number of top results
     */
    crossEncoderRerank(_query: string, results: string[], topK: number): Promise<string[]>;
    /**
     * Maximal Marginal Relevance (MMR) reranking (stub).
     * @param query Query string
     * @param results Results to rerank
     * @param topK Number of top results
     */
    mmrRerank(_query: string, results: string[], topK: number): Promise<string[]>;
    /**
     * Health check for RerankUtility.
     */
    health(): Promise<HealthStatus>;
    /**
     * Registry/LLM-friendly describe output.
     */
    describe(): CapabilityDescribe;
}
/**
 * Registry-compliant capability export for RerankUtility.
 */
declare const RerankUtilityCapability: {
    name: string;
    describe: () => CapabilityDescribe;
    schema: z.ZodObject<{
        strategy: z.ZodEnum<["embedding", "llm", "cross-encoder", "mmr"]>;
        query: z.ZodString;
        results: z.ZodArray<z.ZodString, "many">;
        topK: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        query: string;
        strategy: "embedding" | "llm" | "cross-encoder" | "mmr";
        results: string[];
        topK?: number | undefined;
    }, {
        query: string;
        strategy: "embedding" | "llm" | "cross-encoder" | "mmr";
        results: string[];
        topK?: number | undefined;
    }>;
};
export default RerankUtilityCapability;
