/**
 * Safe async JSON file read.
 * 'path' is the file path. Returns the parsed JSON object.
 */
export declare function readJsonFile(path: string): Promise<unknown>;
/**
 * Safe async JSON file write.
 * 'path' is the file path. 'data' is the data to write.
 */
export declare function writeJsonFile(path: string, data: unknown): Promise<void>;
/**
 * Robust JSON.parse with error handling.
 * 'str' is the JSON string. Returns the parsed object or null.
 */
export declare function safeParseJson(str: string): unknown;
/**
 * Robust JSON.stringify with fallback.
 * 'obj' is the object to stringify. Returns the JSON string or empty string on error.
 */
export declare function safeStringifyJson(obj: unknown): string;
/**
 * Standardized error handler for scripts.
 * 'e' is the error object. 'asJson' outputs as JSON if true.
 */
export declare function handleError(e: unknown, asJson?: boolean): void;
/** No-op lifecycle hook for registry compliance. */
export declare function init(): Promise<void>;
/** No-op lifecycle hook for registry compliance. */
export declare function shutdown(): Promise<void>;
/** No-op lifecycle hook for registry compliance. */
export declare function reload(): Promise<void>;
/** Health check for automation helpers. */
export declare function health(): Promise<{
    status: string;
    timestamp: string;
}>;
/** Describe automation helpers for registry compliance. */
export declare function describe(): Promise<{
    name: string;
    description: string;
}>;
