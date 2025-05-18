import type { SastFeedbackMemory } from '../../schemas/SastFeedbackMemorySchema.js';
import { BaseMemoryUtility } from './BaseMemoryUtility.js';
/**
 * sastMemories: Deduplicates, lists, and syncs SAST feedback memories across tools.
 *
 * LLM/AI-usage: Designed for robust, machine-usable SAST feedback memory management in agent workflows. Extension points for new memory types, adapters, or deduplication strategies.
 * Extension: Add new memory types, adapters, or deduplication/merge strategies as needed.
 *
 * Main Functions:
 *   - loadAllMemories(): Load all SAST feedback memories
 *   - deduplicateMemories(memories): Deduplicate memories by id, tool, and context
 *   - listAllSastMemories(): List all deduplicated SAST memories
 *   - getMemoriesForFile(file): Get all memories for a given file
 *   - getMemoriesForRule(ruleId): Get all memories for a given ruleId
 *   - syncWithRemote(localMemories, remoteAdapter): Sync local SAST memories with remote storage
 *   - mergeWithRemote(local, remote): Merge local and remote SAST memories
 */
export declare class SastMemoriesUtility extends BaseMemoryUtility<SastFeedbackMemory> {
    name: string;
    filePath: string;
    schema: import("zod").ZodObject<{
        id: import("zod").ZodString;
        tool: import("zod").ZodString;
        ruleId: import("zod").ZodOptional<import("zod").ZodString>;
        file: import("zod").ZodString;
        line: import("zod").ZodOptional<import("zod").ZodNumber>;
        memoryType: import("zod").ZodString;
        rationale: import("zod").ZodString;
        user: import("zod").ZodOptional<import("zod").ZodString>;
        timestamp: import("zod").ZodOptional<import("zod").ZodString>;
        triage: import("zod").ZodOptional<import("zod").ZodEnum<["true_positive", "false_positive", "needs_review"]>>;
        tags: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
        project: import("zod").ZodOptional<import("zod").ZodString>;
        organization: import("zod").ZodOptional<import("zod").ZodString>;
        context: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
        version: import("zod").ZodOptional<import("zod").ZodString>;
    }, "strip", import("zod").ZodTypeAny, {
        id: string;
        tool: string;
        file: string;
        memoryType: string;
        rationale: string;
        timestamp?: string | undefined;
        user?: string | undefined;
        ruleId?: string | undefined;
        line?: number | undefined;
        triage?: "true_positive" | "false_positive" | "needs_review" | undefined;
        tags?: string[] | undefined;
        project?: string | undefined;
        organization?: string | undefined;
        context?: Record<string, unknown> | undefined;
        version?: string | undefined;
    }, {
        id: string;
        tool: string;
        file: string;
        memoryType: string;
        rationale: string;
        timestamp?: string | undefined;
        user?: string | undefined;
        ruleId?: string | undefined;
        line?: number | undefined;
        triage?: "true_positive" | "false_positive" | "needs_review" | undefined;
        tags?: string[] | undefined;
        project?: string | undefined;
        organization?: string | undefined;
        context?: Record<string, unknown> | undefined;
        version?: string | undefined;
    }>;
    /**
     * Deduplicate memories by id, tool, and context. Uses pluggable deduplication if set.
     */
    deduplicate(memories: SastFeedbackMemory[]): SastFeedbackMemory[];
    /**
     * List all deduplicated SAST memories (across tools).
     */
    listAllSastMemories(): Promise<SastFeedbackMemory[]>;
    /**
     * Get all memories for a given file.
     */
    getMemoriesForFile(file: string): Promise<SastFeedbackMemory[]>;
    /**
     * Get all memories for a given ruleId.
     */
    getMemoriesForRule(ruleId: string): Promise<SastFeedbackMemory[]>;
    /**
     * Syncs local SAST feedback memories with a remote adapter instance.
     */
    syncWithRemote(localMemories: SastFeedbackMemory[], remoteAdapter: unknown): Promise<SastFeedbackMemory[]>;
    /**
     * Merges local and remote SAST feedback memories.
     */
    mergeWithRemote(local: SastFeedbackMemory[], remote: SastFeedbackMemory[]): SastFeedbackMemory[];
}
export declare const listAllSastMemories: () => Promise<SastFeedbackMemory[]>;
export declare const getMemoriesForFile: (file: string) => Promise<SastFeedbackMemory[]>;
export declare const getMemoriesForRule: (ruleId: string) => Promise<SastFeedbackMemory[]>;
export declare const syncWithRemote: (localMemories: SastFeedbackMemory[], remoteAdapter: unknown) => Promise<SastFeedbackMemory[]>;
export declare const mergeWithRemote: (local: SastFeedbackMemory[], remote: SastFeedbackMemory[]) => SastFeedbackMemory[];
export declare const deduplicateMemories: (memories: SastFeedbackMemory[]) => SastFeedbackMemory[];
declare const sastMemoriesCapability: {
    name: string;
    describe: () => {
        promptTemplates: {
            name: string;
            description: string;
            template: string;
        }[];
        usage: string;
        docs: string;
        features: string[];
        schema: import("zod").ZodObject<{
            id: import("zod").ZodString;
            tool: import("zod").ZodString;
            ruleId: import("zod").ZodOptional<import("zod").ZodString>;
            file: import("zod").ZodString;
            line: import("zod").ZodOptional<import("zod").ZodNumber>;
            memoryType: import("zod").ZodString;
            rationale: import("zod").ZodString;
            user: import("zod").ZodOptional<import("zod").ZodString>;
            timestamp: import("zod").ZodOptional<import("zod").ZodString>;
            triage: import("zod").ZodOptional<import("zod").ZodEnum<["true_positive", "false_positive", "needs_review"]>>;
            tags: import("zod").ZodOptional<import("zod").ZodArray<import("zod").ZodString, "many">>;
            project: import("zod").ZodOptional<import("zod").ZodString>;
            organization: import("zod").ZodOptional<import("zod").ZodString>;
            context: import("zod").ZodOptional<import("zod").ZodRecord<import("zod").ZodString, import("zod").ZodUnknown>>;
            version: import("zod").ZodOptional<import("zod").ZodString>;
        }, "strip", import("zod").ZodTypeAny, {
            id: string;
            tool: string;
            file: string;
            memoryType: string;
            rationale: string;
            timestamp?: string | undefined;
            user?: string | undefined;
            ruleId?: string | undefined;
            line?: number | undefined;
            triage?: "true_positive" | "false_positive" | "needs_review" | undefined;
            tags?: string[] | undefined;
            project?: string | undefined;
            organization?: string | undefined;
            context?: Record<string, unknown> | undefined;
            version?: string | undefined;
        }, {
            id: string;
            tool: string;
            file: string;
            memoryType: string;
            rationale: string;
            timestamp?: string | undefined;
            user?: string | undefined;
            ruleId?: string | undefined;
            line?: number | undefined;
            triage?: "true_positive" | "false_positive" | "needs_review" | undefined;
            tags?: string[] | undefined;
            project?: string | undefined;
            organization?: string | undefined;
            context?: Record<string, unknown> | undefined;
            version?: string | undefined;
        }>;
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance?: string;
        cloudOnly?: boolean;
        optInRequired?: boolean;
        cost?: string;
        methods?: {
            name: string;
            signature: string;
            description?: string;
        }[];
        references?: string[];
        docsFirst?: boolean;
        aiFriendlyDocs?: boolean;
        supportedEventPatterns?: string[];
        eventSubscriptions?: string[];
        eventEmissions?: string[];
    };
    health: () => Promise<import("../../capabilities/Capability.js").HealthStatus>;
    init: () => Promise<void>;
    reload: () => Promise<void>;
};
export default sastMemoriesCapability;
