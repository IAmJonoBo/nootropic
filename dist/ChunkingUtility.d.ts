import { z } from 'zod';
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
export declare class SemanticChunkingStrategy implements ChunkingStrategy {
    llmAdapter: ChunkingLLMAdapter;
    constructor(llmAdapter: ChunkingLLMAdapter);
    chunk(text: string): Promise<Chunk[]>;
}
export declare class LLMChunkRAGStrategy implements ChunkingStrategy {
    llmAdapter: ChunkingLLMAdapter;
    constructor(llmAdapter: ChunkingLLMAdapter);
    chunk(text: string): Promise<Chunk[]>;
}
export declare class LLMChunkRelevanceScorer {
    llmAdapter: ChunkingLLMAdapter;
    constructor(llmAdapter: ChunkingLLMAdapter);
    score(_chunk: Chunk, _query: string): Promise<number>;
}
export declare class RedundancyFilter {
    filter(chunks: Chunk[]): Chunk[];
}
export declare class ChunkingUtility {
    llmAdapter: ChunkingLLMAdapter;
    strategy: ChunkingStrategy;
    scorer: LLMChunkRelevanceScorer;
    redundancyFilter: RedundancyFilter;
    constructor(llmAdapter: ChunkingLLMAdapter, strategy?: ChunkingStrategy, scorer?: LLMChunkRelevanceScorer, redundancyFilter?: RedundancyFilter);
    chunkAndFilter(text: string, query: string): Promise<Chunk[]>;
}
export declare const ExperimentalChunkingUtilitySchema: z.ZodObject<{
    text: z.ZodString;
    query: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    text: string;
    query?: string | undefined;
}, {
    text: string;
    query?: string | undefined;
}>;
export declare function describe(): {
    name: string;
    description: string;
    license: string;
    isOpenSource: boolean;
    provenance: string;
    docsFirst: boolean;
    aiFriendlyDocs: boolean;
    usage: string;
    status: string;
    methods: {
        name: string;
        signature: string;
        description: string;
    }[];
    extensionPoints: string[];
    references: string[];
    schema: z.ZodObject<{
        text: z.ZodString;
        query: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        query?: string | undefined;
    }, {
        text: string;
        query?: string | undefined;
    }>;
};
declare const ExperimentalChunkingUtilityCapability: {
    name: string;
    describe: typeof describe;
    schema: z.ZodObject<{
        text: z.ZodString;
        query: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text: string;
        query?: string | undefined;
    }, {
        text: string;
        query?: string | undefined;
    }>;
    health: () => Promise<{
        status: 'ok';
        timestamp: string;
    }>;
};
export default ExperimentalChunkingUtilityCapability;
