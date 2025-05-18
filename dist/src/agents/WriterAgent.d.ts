/**
 * Writes content to a file or output stream.
 * content: Content to write
 * destination: Output destination
 */
/**
 * Sets the writing style for the agent.
 * style: Writing style
 */
/**
 * Stub lifecycle hooks for registry compliance.
 */
export declare function init(): Promise<void>;
export declare function health(): Promise<{
    status: string;
}>;
export declare function shutdown(): Promise<void>;
export declare function reload(): Promise<void>;
export declare function describe(): Promise<{
    name: string;
    description: string;
    promptTemplates: {
        name: string;
        description: string;
        template: string;
        usage: string;
    }[];
}>;
