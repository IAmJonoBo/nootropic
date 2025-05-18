import { z } from 'zod';
export interface Retriever {
    retrieve(query: string, topK?: number): Promise<string[]>;
}
export interface HybridRetrievalLLMAdapter {
    embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
}
export declare class DenseRetriever implements Retriever {
    constructor();
    retrieve(_query: string, _topK?: number): Promise<string[]>;
}
export declare class SparseRetriever implements Retriever {
    private documents;
    setDocuments(docs: string[]): void;
    retrieve(query: string, topK?: number): Promise<string[]>;
}
export declare class HybridRetrievalUtility {
    private dense;
    private sparse;
    private documents;
    static schema: z.ZodObject<{
        query: z.ZodString;
        topK: z.ZodDefault<z.ZodNumber>;
        documents: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        query: string;
        topK: number;
        documents?: string[] | undefined;
    }, {
        query: string;
        topK?: number | undefined;
        documents?: string[] | undefined;
    }>;
    constructor(dense?: Retriever, sparse?: SparseRetriever, documents?: string[]);
    setDocuments(docs: string[]): void;
    retrieve(query: string, topK?: number): Promise<string[]>;
    static describe(): {
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
        references: string[];
        schema: z.ZodObject<{
            query: z.ZodString;
            topK: z.ZodDefault<z.ZodNumber>;
            documents: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            query: string;
            topK: number;
            documents?: string[] | undefined;
        }, {
            query: string;
            topK?: number | undefined;
            documents?: string[] | undefined;
        }>;
    };
}
declare const HybridRetrievalUtilityCapability: {
    name: string;
    describe: typeof HybridRetrievalUtility.describe;
    schema: z.ZodObject<{
        query: z.ZodString;
        topK: z.ZodDefault<z.ZodNumber>;
        documents: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        query: string;
        topK: number;
        documents?: string[] | undefined;
    }, {
        query: string;
        topK?: number | undefined;
        documents?: string[] | undefined;
    }>;
};
export default HybridRetrievalUtilityCapability;
