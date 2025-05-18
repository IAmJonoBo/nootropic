import type { Capability } from '../../capabilities/Capability.js';
/**
 * Returns the path to the nootropic cache directory.
 * This getter pattern avoids ReferenceError and circular import issues.
 */
export declare function getCacheDirPath(): string;
/**
 * Ensures the nootropic cache directory exists.
 */
export declare function ensureCacheDirExists(): Promise<void>;
/**
 * Returns the path to a file in the nootropic cache directory.
 * If the path cannot be determined, logs a warning and falls back to process.cwd().
 */
export declare function getCacheFilePath(name: string): string;
/**
 * Lists all files in the nootropic cache directory.
 */
export declare function listCacheFiles(): Promise<string[]>;
declare const cacheDirCapability: Capability;
export default cacheDirCapability;
