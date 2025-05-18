import { readJsonSafe, writeJsonSafe, getOrInitJson } from './fileHelpers.js';
declare function errorLogger(context: string, error: unknown): void;
declare function esmEntrypointCheck(importMetaUrl: string): boolean;
/**
 * Recursively lists all files in a directory (returns absolute paths).
 */
declare function listFilesRecursive(dirPath: string): Promise<string[]>;
/**
 * Loads nootropic config from .nootropicrc (JSON) or nootropic.config.ts, with fallback to defaults.
 * Precedence: CLI > env > config file > defaults (config merging is handled by caller).
 */
declare function loadAiHelpersConfig<T = Record<string, unknown>>(defaults?: T): Promise<T>;
/**
 * Aggregates all describe() outputs from core modules, agents, adapters, plugins, and utilities, and writes to .nootropic-cache/describe-registry.json.
 * For CI/code/doc sync and agent/LLM introspection.
 */
export declare function aggregateDescribeRegistry(): Promise<unknown[]>;
/**
 * Returns a description of the nootropic utilities and their usage.
 *
 * Note: The linter may warn about the '>' character in signature fields (e.g., Promise<string[]>). Attempts to escape this do not resolve the warning due to TSDoc parser limitations in string fields. These warnings can be safely ignored for now. See CONTRIBUTING.md for details.
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
        errorLogger: {
            input: {
                type: string;
                properties: {
                    context: {
                        type: string;
                    };
                    error: {
                        type: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
            };
        };
        esmEntrypointCheck: {
            input: {
                type: string;
                properties: {
                    importMetaUrl: {
                        type: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
            };
        };
        listFilesRecursive: {
            input: {
                type: string;
                properties: {
                    dirPath: {
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
        loadAiHelpersConfig: {
            input: {
                type: string;
                properties: {
                    defaults: {
                        type: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
            };
        };
        aggregateDescribeRegistry: {
            input: {};
            output: {
                type: string;
                items: {
                    type: string;
                };
            };
        };
        writeFileSafe: {
            input: {
                type: string;
                properties: {
                    filePath: {
                        type: string;
                    };
                    data: {
                        type: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
            };
        };
        findFilePath: {
            input: {
                type: string;
                properties: {
                    filename: {
                        type: string;
                    };
                    dirs: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
                required: string[];
            };
            output: {
                type: string;
            };
        };
        generateTodoPatch: {
            input: {
                type: string;
                properties: {
                    original: {
                        type: string;
                    };
                    patched: {
                        type: string;
                    };
                    file: {
                        type: string;
                    };
                    line: {
                        type: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
            };
        };
        PatchInfo: {
            type: string;
            properties: {
                file: {
                    type: string;
                };
                line: {
                    type: string;
                };
                patchFile: {
                    type: string;
                };
                type: {
                    type: string;
                };
            };
            required: string[];
        };
    };
    docsFirst: boolean;
    aiFriendlyDocs: boolean;
    describeRegistry: boolean;
    bestPractices: string[];
    references: string[];
};
export { errorLogger, esmEntrypointCheck, readJsonSafe, writeJsonSafe, getOrInitJson, listFilesRecursive, loadAiHelpersConfig };
