/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
type Tier = 'hot' | 'warm' | 'cold';
/**
 * ContextManager: Public API for context pruning, archiving, tiering, and restoration.
 * Emits events and is registry-compliant. Ready for CLI/HTTP integration.
 * Integrates SHIMI memory for advanced context/memory management.
 *
 * Main Methods:
 *   - pruneContext(options): Prune context by age, size, or token budget
 *   - archiveContext(tier?): Archive current context snapshot
 *   - listSnapshots(): List available context snapshots
 *   - restoreSnapshot(name): Restore a context snapshot by name/tier
 *   - getContextSummaries(query, topK?): Retrieve context summaries from SHIMI memory
 *   - describe(): Returns a machine-usable, LLM-friendly description of the context manager
 */
export declare class ContextManager implements Capability {
    readonly name = "ContextManager";
    private shimi;
    constructor(options?: Record<string, unknown>);
    /**
     * Prunes context memories based on options (age, size, token budget).
     * @param options Pruning options (age, size, token budget). Runtime validated with Zod.
     * @returns Promise<void>
     */
    pruneContext(options?: {
        maxAgeDays?: number;
        maxSizeBytes?: number;
        maxTokens?: number;
    }): Promise<void>;
    /**
     * Loads a context snapshot for a given tier/size (e.g., 32k, 64k, 128k).
     * @param tier Optional context tier/size. No runtime validation (stub, for future extension).
     * @returns Promise<void>
     */
    archiveContext(tier?: number): Promise<void>;
    /**
     * List available context snapshots (full, compressed, delta).
     */
    listSnapshots(): Promise<string[]>;
    /**
     * Restore a context snapshot by name/tier.
     */
    restoreSnapshot(name: string): Promise<void>;
    /**
     * Health check for context manager.
     */
    health(): Promise<HealthStatus>;
    /**
     * Update and enforce manifest-driven tiering policies.
     */
    enforceTiering(): Promise<void>;
    /**
     * List all cache files with metadata (from manifest).
     */
    listCacheFiles(): Promise<unknown[]>;
    /**
     * Get the contents of a cache file by name (safe, manifest-driven).
     */
    getCacheFile(fileName: string): Promise<Buffer | string>;
    /**
     * Get a health/summary report of the cache (total size, file count, etc).
     */
    getCacheHealthReport(): Promise<unknown>;
    /**
     * Migrate a file to a different tier (hot/warm/cold).
     */
    migrateFileTier(fileName: string, targetTier: Tier): Promise<void>;
    /**
     * Retrieve context summaries from SHIMI memory.
     */
    getContextSummaries(query: string, topK?: number): Promise<unknown[]>;
    /**
     * Registry/LLM-friendly describe output.
     */
    describe(): CapabilityDescribe;
    /**
     * Optional: Initialization logic for context manager startup.
     */
    init(): Promise<void>;
    /**
     * Optional: Reload logic for context manager.
     */
    reload(): Promise<void>;
    shutdown(): Promise<void>;
}
/**
 * Returns a description of the contextManager and its main functions.
 */
export declare function describe(): {
    name: string;
    description: string;
    functions: {
        name: string;
        signature: string;
        description: string;
    }[];
    promptTemplates: {
        name: string;
        description: string;
        template: string;
    }[];
    references: string[];
    schema: {};
};
/**
 * Checks if a path exists.
 */
export declare function pathExists(pathToCheck: string): Promise<boolean>;
/**
 * Reads a JSON file, returns null on error.
 */
export declare function readJsonFile<T = unknown>(filePath: string): Promise<T | null>;
/**
 * Writes a JSON file, robust to errors.
 */
export declare function writeJsonFile<T = unknown>(filePath: string, data: T): Promise<void>;
/**
 * Generates a patch for TODO/FIXME resolution.
 */
export declare function generateTodoPatch(original: string, patched: string, file: string, line: number): string;
/**
 * Patch info type for patch generation utilities.
 */
export interface PatchInfo {
    file: string;
    line?: number;
    patchFile: string;
    type: 'todo' | 'schemaDrift';
}
export declare function extractWordsFromFile(filePath: string): Promise<string[]>;
export {};
