import { z } from 'zod';
export interface Reranker {
    rerank(query: string, candidates: string[]): Promise<string[]>;
}
export interface RerankLLMAdapter {
    embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
    generateText?(prompt: string, model?: string, options?: Record<string, unknown>): Promise<string>;
}
export declare class BiEncoderReranker implements Reranker {
    private llmAdapter;
    constructor(llmAdapter: RerankLLMAdapter);
    rerank(query: string, candidates: string[]): Promise<string[]>;
}
export declare class CrossEncoderReranker implements Reranker {
    private llmAdapter;
    constructor(llmAdapter: RerankLLMAdapter);
    rerank(query: string, candidates: string[]): Promise<string[]>;
}
export declare class RerankUtility {
    private biEncoder;
    private crossEncoder;
    constructor(biEncoder?: Reranker, crossEncoder?: Reranker);
    rerank(query: string, candidates: string[], options?: {
        instruction?: string;
        topN?: number;
    }): Promise<string[]>;
}
export declare const RerankUtilitySchema: z.ZodObject<{
    query: z.ZodString;
    candidates: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    query: string;
    candidates: string[];
}, {
    query: string;
    candidates: string[];
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
    methods: {
        name: string;
        signature: string;
        description: string;
    }[];
    extensionPoints: string[];
    features: string[];
    promptTemplates: {
        name: string;
        description: string;
        template: string;
    }[];
    schema: z.ZodObject<{
        query: z.ZodString;
        candidates: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        query: string;
        candidates: string[];
    }, {
        query: string;
        candidates: string[];
    }>;
};
declare const RerankUtilityCapability: {
    name: string;
    describe: typeof describe;
    schema: z.ZodObject<{
        query: z.ZodString;
        candidates: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        query: string;
        candidates: string[];
    }, {
        query: string;
        candidates: string[];
    }>;
};
export default RerankUtilityCapability;
