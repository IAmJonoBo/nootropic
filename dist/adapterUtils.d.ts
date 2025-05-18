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
}>;
