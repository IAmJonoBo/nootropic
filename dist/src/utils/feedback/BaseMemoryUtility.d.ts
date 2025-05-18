import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
import { ZodSchema } from 'zod';
/**
 * BaseMemoryUtility: Abstract base class for feedback/memory utilities.
 * Handles aggregation, deduplication, event emission, registry/describe/health compliance, and Zod schema validation.
 * Subclasses should provide filePath, schema, and type-specific logic.
 */
export declare abstract class BaseMemoryUtility<T extends object> implements Capability {
    abstract name: string;
    abstract filePath: string;
    abstract schema: ZodSchema<T>;
    /**
     * Optional event hooks. Subclasses or users can override or assign these.
     */
    onAdd?: (memory: T) => Promise<void> | void;
    onDeduplicate?: (memories: T[]) => Promise<void> | void;
    onAggregate?: (result: unknown) => Promise<void> | void;
    /**
     * Pluggable deduplication. Subclasses can override or assign this function.
     * If not set, uses the default deduplication logic.
     */
    deduplicateFn?: (memories: T[]) => T[];
    /**
     * Load all memory entries from the file.
     */
    loadAll(): Promise<T[]>;
    /**
     * Save all memory entries to the file.
     */
    saveAll(memories: T[]): Promise<void>;
    /**
     * Deduplicate memory entries. Subclasses can override for custom logic.
     */
    deduplicate(memories: T[]): T[];
    /**
     * Add a memory entry. Triggers onAdd hook if present.
     */
    add(memory: T): Promise<void>;
    /**
     * List all memory entries (deduplicated).
     */
    list(): Promise<T[]>;
    /**
     * Generic aggregation method. Aggregates memories by a key or custom logic.
     * Triggers onAggregate hook if present.
     */
    aggregate<K>(by: (memory: T) => K, aggregator: (group: T[]) => unknown): Promise<Record<string, unknown>>;
    /**
     * Registry/describe compliance.
     */
    describe(): CapabilityDescribe;
    health(): Promise<HealthStatus>;
}
