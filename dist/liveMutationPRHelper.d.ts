declare function createBranch(branchName: string): void;
declare function applyPatches(): Promise<void>;
declare function commitAll(message: string): void;
declare function suggestPR(branchName: string, base?: string): void;
declare function runLiveMutationPR(): Promise<void>;
/**
 * Returns a description of the live mutation/PR helper plugin/capability, including event-driven traceability.
 * See docs/orchestration.md for event schema and best practices (referenced in prose).
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
    emits: string[];
    eventSchemas: {
        mutationSuggested: {
            type: string;
            properties: {
                agentId: {
                    type: string;
                };
                timestamp: {
                    type: string;
                };
                suggestion: {
                    type: string;
                };
            };
            required: string[];
        };
        patchApplied: {
            type: string;
            properties: {
                agentId: {
                    type: string;
                };
                timestamp: {
                    type: string;
                };
                branch: {
                    type: string;
                };
            };
            required: string[];
        };
        branchCreated: {
            type: string;
            properties: {
                agentId: {
                    type: string;
                };
                timestamp: {
                    type: string;
                };
                branch: {
                    type: string;
                };
                base: {
                    type: string;
                };
            };
            required: string[];
        };
        prCreated: {
            type: string;
            properties: {
                agentId: {
                    type: string;
                };
                timestamp: {
                    type: string;
                };
                branch: {
                    type: string;
                };
                prUrl: {
                    type: string;
                };
            };
            required: string[];
        };
    };
    schema: {
        runLiveMutationPRHelper: {
            input: {
                type: string;
            };
            output: {
                type: string;
            };
        };
    };
};
export { runLiveMutationPR, createBranch, applyPatches, commitAll, suggestPR };
