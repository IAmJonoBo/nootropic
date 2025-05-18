/**
 * ExamplePlugin: Demonstrates plugin lifecycle, dynamic event subscription, and hot-reload safety.
 * Implements the Capability interface for unified registry and LLM/agent discovery.
 */
export declare function init(): Promise<void>;
export declare function shutdown(): Promise<void>;
export declare function reload(): Promise<void>;
export declare function health(): Promise<{
    status: string;
    timestamp: string;
}>;
export declare function describe(): Promise<{
    name: string;
    description: string;
    promptTemplates: never[];
    schema: {};
}>;
