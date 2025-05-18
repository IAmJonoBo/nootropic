export declare function embedTexts(texts: string[]): Promise<number[][]>;
/**
 * Universal EmbeddingBackend interface for pluggable embedding providers.
 */
export interface EmbeddingBackend {
    name: string;
    embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
    getInfo?(): Promise<Record<string, unknown>>;
}
export declare class NVEmbedBackend implements EmbeddingBackend {
    name: string;
    private url;
    constructor(url?: string);
    embedText(text: string): Promise<number[]>;
    getInfo(): Promise<{
        url: string;
    }>;
}
export declare class OllamaEmbedBackend implements EmbeddingBackend {
    name: string;
    private url;
    private model;
    constructor(url?: string, model?: string);
    embedText(text: string): Promise<number[]>;
    getInfo(): Promise<{
        url: string;
        model: string;
    }>;
}
export declare class HuggingFaceEmbedBackend implements EmbeddingBackend {
    name: string;
    private apiKey;
    private model;
    constructor(apiKey?: string, model?: string);
    embedText(text: string): Promise<number[]>;
    getInfo(): Promise<{
        model: string;
    }>;
}
export declare class OpenRouterEmbedBackend implements EmbeddingBackend {
    name: string;
    private apiKey;
    private model;
    constructor(apiKey?: string, model?: string);
    embedText(text: string): Promise<number[]>;
    getInfo(): Promise<{
        model: string;
    }>;
}
export declare class NomicEmbedBackend implements EmbeddingBackend {
    name: string;
    private apiUrl;
    private apiKey;
    constructor(apiUrl?: string, apiKey?: string);
    embedText(text: string): Promise<number[]>;
    getInfo(): Promise<{
        apiUrl: string;
    }>;
}
export declare class LMStudioEmbedBackend implements EmbeddingBackend {
    name: string;
    private url;
    constructor(url?: string);
    embedText(text: string): Promise<number[]>;
    getInfo(): Promise<{
        url: string;
    }>;
}
export declare function getEmbeddingBackend(name?: string): EmbeddingBackend;
