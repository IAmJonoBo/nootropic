interface SemanticIndexEntry {
    file: string;
    line: number;
    text: string;
    embedding: number[];
    source?: string;
    capability?: string;
    section?: string | undefined;
}
declare function extractChunks(): Promise<Omit<SemanticIndexEntry, 'embedding'>[]>;
declare function buildSemanticIndex(): Promise<void>;
/**
 * Returns a description of the semantic index builder and its main functions.
 */
export declare function describe(): {
    name: string;
    description: string;
    functions: {
        name: string;
        signature: string;
        description: string;
    }[];
    usage: string;
    schema: {
        buildSemanticIndex: {
            input: {
                type: string;
            };
            output: {
                type: string;
            };
        };
        extractChunks: {
            input: {
                type: string;
            };
            output: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        file: {
                            type: string;
                        };
                        line: {
                            type: string;
                        };
                        text: {
                            type: string;
                        };
                    };
                    required: string[];
                };
            };
        };
        embed: {
            input: {
                type: string;
                properties: {
                    text: {
                        type: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
                items: {
                    type: string;
                };
            };
        };
    };
};
export { buildSemanticIndex, extractChunks };
/**
 * Initializes semanticIndexBuilder. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 */
export declare function initSemanticIndexBuilder(): Promise<void>;
