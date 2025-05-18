/**
 * Ensures a directory exists (recursive, robust).
 */
export declare function ensureDirExists(dirPath: string): Promise<void>;
/**
 * Lists all files in a directory (non-recursive).
 */
export declare function listFilesInDir(dirPath: string): Promise<string[]>;
/**
 * Writes a file safely (string or object as JSON).
 */
export declare function writeFileSafe(filePath: string, data: string | object): Promise<void>;
