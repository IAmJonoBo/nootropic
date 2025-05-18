/**
 * shimiMemory: Semantic Hierarchical Memory Index (SHIMI) for decentralized agent reasoning.
 *
 * LLM/AI-usage: Provides polyhierarchical semantic memory for agent workflows, supporting entity insertion, retrieval, and decentralized sync.
 * Extension: Add new backends, CRDT merge strategies, or entity types as needed.
 *
 * Main Types/Functions:
 *   - SemanticNode: Node in the polyhierarchical semantic memory graph
 *   - ShimiMemory: Main class for SHIMI memory (insertEntity, retrieveEntities, crdtMerge, etc.)
 *   - CRDTMergeUtility: Utility for CRDT merge logic
 *   - MemTree: Dynamic tree memory for structured long-term memory
 */
import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
import { EmbeddingBackend } from '../embedding/embeddingClient.js';
import { z } from 'zod';
/**
 * SemanticNode: Node in the polyhierarchical semantic memory graph.
 */
export interface SemanticNode {
    id: string;
    summary: string;
    children: SemanticNode[];
    entities: unknown[];
    parent?: SemanticNode;
    level: number;
    updatedAt?: string;
    timestamp?: string;
}
/** Options for ShimiMemory. */
export type ShimiMemoryOptions = {
    maxBranching?: number;
    maxLevels?: number;
    similarityThreshold?: number;
    compressionRatio?: number;
    backend?: EmbeddingBackend;
    backendName?: string;
};
/** LLM adapter interface for embedding. */
export interface ShimiLLMAdapter {
    embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
}
/**
 * CRDTMergeUtility: Implements CRDT merge logic for decentralized SHIMI memory sync.
 * Supports LWW (last-write-wins) and G-Counter for distributed node merging.
 * Extensible for other CRDT types.
 */
export declare class CRDTMergeUtility {
    static lwwMerge<T extends {
        id: string;
        updatedAt?: string;
        timestamp?: string;
    }>(a: T[], b: T[]): T[];
    static gCounterMerge(a: Record<string, number>, b: Record<string, number>): Record<string, number>;
}
/** SHIMI: Semantic Hierarchical Memory Index for decentralized agent reasoning. */
export declare class ShimiMemory implements Capability {
    readonly name = "ShimiMemory";
    private rootNodes;
    private options;
    private backend;
    private nodeMap;
    constructor(options?: ShimiMemoryOptions);
    /** Insert an entity into the polyhierarchical semantic graph. */
    insertEntity(entity: {
        concept: string;
        explanation: string;
        [key: string]: unknown;
    }): Promise<void>;
    /** Retrieve entities by semantic query (top-down traversal, pruning by similarity). */
    retrieveEntities(query: string, topK?: number): Promise<unknown[]>;
    private traverse;
    /** Decentralized sync: Merkle-DAG root hash, Bloom filter, CRDT merge (polyhierarchy-ready). */
    getMerkleRoot(): string;
    /** Get Bloom filter (set of all node IDs). */
    getBloomFilter(): Set<string>;
    /** Merge remote root nodes into local, using semantic similarity and idempotent merge. */
    crdtMerge(remote: ShimiMemory): Promise<void>;
    private findBestMatchIdx;
    private cloneNode;
    private mergeNodes;
    /** Create a new semantic node. */
    private createNode;
    /** Merge the two most similar children under a new abstraction node. */
    private mergeMostSimilarChildren;
    /** Hash a node and its subtree for Merkle root. */
    private hashNode;
    private hashStrings;
    /** Merge with another ShimiMemory instance. */
    mergeWith(other: ShimiMemory): void;
    /** Describe ShimiMemory for registry compliance. */
    describe(): CapabilityDescribe;
    /** Health check for ShimiMemory. */
    health(): Promise<HealthStatus>;
    /** No-op lifecycle hook for registry compliance. */
    init(): Promise<void>;
    /** No-op lifecycle hook for registry compliance. */
    reload(): Promise<void>;
}
export declare const ShimiMemorySchema: z.ZodObject<{
    concept: z.ZodString;
    explanation: z.ZodString;
    options: z.ZodOptional<z.ZodObject<{
        maxBranching: z.ZodOptional<z.ZodNumber>;
        maxLevels: z.ZodOptional<z.ZodNumber>;
        similarityThreshold: z.ZodOptional<z.ZodNumber>;
        compressionRatio: z.ZodOptional<z.ZodNumber>;
        backendName: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        backendName?: string | undefined;
        maxBranching?: number | undefined;
        maxLevels?: number | undefined;
        similarityThreshold?: number | undefined;
        compressionRatio?: number | undefined;
    }, {
        backendName?: string | undefined;
        maxBranching?: number | undefined;
        maxLevels?: number | undefined;
        similarityThreshold?: number | undefined;
        compressionRatio?: number | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    concept: string;
    explanation: string;
    options?: {
        backendName?: string | undefined;
        maxBranching?: number | undefined;
        maxLevels?: number | undefined;
        similarityThreshold?: number | undefined;
        compressionRatio?: number | undefined;
    } | undefined;
}, {
    concept: string;
    explanation: string;
    options?: {
        backendName?: string | undefined;
        maxBranching?: number | undefined;
        maxLevels?: number | undefined;
        similarityThreshold?: number | undefined;
        compressionRatio?: number | undefined;
    } | undefined;
}>;
declare const ShimiMemoryCapability: {
    name: string;
    describe: () => CapabilityDescribe;
    schema: z.ZodObject<{
        concept: z.ZodString;
        explanation: z.ZodString;
        options: z.ZodOptional<z.ZodObject<{
            maxBranching: z.ZodOptional<z.ZodNumber>;
            maxLevels: z.ZodOptional<z.ZodNumber>;
            similarityThreshold: z.ZodOptional<z.ZodNumber>;
            compressionRatio: z.ZodOptional<z.ZodNumber>;
            backendName: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            backendName?: string | undefined;
            maxBranching?: number | undefined;
            maxLevels?: number | undefined;
            similarityThreshold?: number | undefined;
            compressionRatio?: number | undefined;
        }, {
            backendName?: string | undefined;
            maxBranching?: number | undefined;
            maxLevels?: number | undefined;
            similarityThreshold?: number | undefined;
            compressionRatio?: number | undefined;
        }>>;
    }, "strip", z.ZodTypeAny, {
        concept: string;
        explanation: string;
        options?: {
            backendName?: string | undefined;
            maxBranching?: number | undefined;
            maxLevels?: number | undefined;
            similarityThreshold?: number | undefined;
            compressionRatio?: number | undefined;
        } | undefined;
    }, {
        concept: string;
        explanation: string;
        options?: {
            backendName?: string | undefined;
            maxBranching?: number | undefined;
            maxLevels?: number | undefined;
            similarityThreshold?: number | undefined;
            compressionRatio?: number | undefined;
        } | undefined;
    }>;
    init: () => Promise<void>;
    reload: () => Promise<void>;
};
export default ShimiMemoryCapability;
/**
 * MemTreeNode: Node in the dynamic tree memory (MemTree).
 */
export interface MemTreeNode {
    id: string;
    parent?: MemTreeNode;
    children: MemTreeNode[];
    summary?: string;
    data?: unknown;
}
/**
 * MemTree: Dynamic tree memory for structured long-term memory.
 */
export declare class MemTree {
    root: MemTreeNode;
    constructor(rootData: unknown);
    /**
     * Creates a new node under the given parent with provided data.
     * parent: Parent node
     * data: Data for the new node
     * Returns: The new node
     */
    addNode(parent: MemTreeNode, data: unknown): MemTreeNode;
    /**
     * Summarizes the given node.
     * node: Node to summarize
     */
    summarizeNode(node: MemTreeNode): void;
    /**
     * Searches nodes by query string.
     * query: Query string
     * Returns: Array of matching nodes
     */
    retrieve(_query: string): MemTreeNode[];
}
