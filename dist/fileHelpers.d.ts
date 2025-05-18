export declare function readJsonSafe<T = unknown>(filePath: string, fallback?: T): Promise<T>;
export declare function writeJsonSafe(filePath: string, data: unknown): Promise<void>;
export declare function getOrInitJson<T = unknown>(filePath: string, init: T): Promise<T>;
