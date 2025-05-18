declare function listFiles(): Promise<Array<{
    file: string;
    size: number;
    mtime: string;
}>>;
interface PruneOptions {
    maxAgeDays?: number | null;
    maxCount?: number | null;
    maxTotalSize?: number | null;
}
declare function pruneFiles({ maxAgeDays, maxCount, maxTotalSize }?: PruneOptions): Promise<Array<{
    file: string;
    size: number;
    mtime: string;
}>>;
interface PruneJsonFieldOptions {
    maxItems?: number | null;
    maxAgeDays?: number | null;
}
declare function pruneJsonField(file: string, field: string, { maxItems, maxAgeDays }?: PruneJsonFieldOptions): Promise<boolean>;
interface RunAgentControlOptions {
    list?: boolean;
    prune?: boolean;
    pruneOptions?: PruneOptions;
}
declare function runAgentControl({ list, prune, pruneOptions }?: RunAgentControlOptions): Promise<void>;
/**
 * Initializes agentControl. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 */
export declare function initAgentControl(): Promise<void>;
export { listFiles, pruneFiles, pruneJsonField, runAgentControl };
