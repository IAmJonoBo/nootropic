declare function runDocDiagramGenerator(): Promise<void>;
/**
 * Returns a description of the doc diagram generator plugin/capability.
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
        runDocDiagramGenerator: {
            input: {
                type: string;
            };
            output: {
                type: string;
            };
        };
    };
    docsFirst: boolean;
    aiFriendlyDocs: boolean;
    describeRegistry: boolean;
    bestPractices: string[];
    references: string[];
};
export { runDocDiagramGenerator };
