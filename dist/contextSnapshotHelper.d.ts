/**
 * Context snapshot helper for nootropic. Provides snapshotting, delta, semantic index, and handover features. All exported functions are LLM/AI-friendly and documented.
 *
 * LLM/AI-usage: Produces machine-usable and human-readable context snapshots for agent workflows. All outputs are designed for agent consumption and orchestration.
 * Extension: Add new context extraction, summarization, or handoff logic as needed.
 *
 * Main Functions:
 *   - createSnapshot(\{ delta \}): Creates a context snapshot, optionally delta
 *   - gatherSnapshotData(): Orchestrates full snapshot data gathering
 *   - extractTodos(): Extracts TODO/FIXME comments from codebase
 *   - detectSchemaDrift(): Detects schema drift between agents and schemas
 *   - getTestFiles(): Lists all test files
 *   - getContextChunk(size): Returns a context snapshot trimmed to fit the specified byte size
 *   - getOptimizedHandoverPayload(contextArr, agentConfig, modelTokenLimit): Returns an optimized, token-aware context payload for agent handoff
 *   - ...and more (see describe\(\))
 */
import { z } from 'zod';
export type TestFileInfo = {
    file: string;
    dir: string;
    size: number;
    mtime: string;
};
/**
 * Lists all test files in the test directories.
 * Returns a Promise resolving to an array of test file info.
 */
export declare function getTestFiles(): Promise<TestFileInfo[]>;
declare function extractTelemetryEventsFromTests(): Promise<Record<string, string[]>>;
declare function buildSemanticIndex(): Promise<Record<string, string[]>>;
export type TodoEntry = {
    file: string;
    line: number;
    text: string;
    type: string;
};
/**
 * Extracts TODO, FIXME, and PLANNED comments from the codebase. All outputs are Zod-validated.
 * Returns a Promise resolving to an array of TodoEntry.
 */
export declare function extractTodos(): Promise<TodoEntry[]>;
interface LargestFileEntry {
    file: string;
    size: number;
    dir: string;
}
/**
 * Gathers core snapshot data (filesystem, config, etc).
 * Returns a Promise resolving to the core data object.
 */
export declare function gatherSnapshotCore(): Promise<Record<string, unknown>>;
/**
 * Gathers telemetry data for the snapshot.
 * Returns a Promise resolving to the telemetry data object.
 */
export declare function gatherSnapshotTelemetry(): Promise<Record<string, unknown>>;
/**
 * Gathers agent-related data for the snapshot.
 * Returns a Promise resolving to the agent data object.
 */
export declare function gatherSnapshotAgent(): Promise<Record<string, unknown>>;
/**
 * Gathers orchestration-related data for the snapshot.
 * 'testFiles' is test file info, 'todos' are TODO entries, 'largestFiles' are largest file entries.
 * Returns a Promise resolving to orchestration data object.
 */
export declare function gatherSnapshotOrchestration(testFiles: TestFileInfo[], todos: TodoEntry[], largestFiles: LargestFileEntry[]): Promise<Record<string, unknown>>;
/**
 * Gathers handover data for the snapshot.
 * Returns the handover data object.
 */
export declare function gatherSnapshotHandover(): Record<string, unknown>;
/**
 * Orchestrates the full snapshot data gathering process.
 * Calls each sub-gatherer and merges results.
 * Returns a Promise resolving to full snapshot data object.
 */
export declare function gatherSnapshotData(): Promise<Record<string, unknown>>;
/**
 * Creates a context snapshot, optionally applying delta mode.
 * 'options.delta' determines whether to apply delta mode.
 * Returns a Promise that resolves when the snapshot is written.
 */
export declare function createSnapshot({ delta }?: {
    delta?: boolean | undefined;
}): Promise<void>;
export { getAgentMessages, addAgentMessage };
/**
 * Detects schema drift between agents and schemas.
 * Returns a Promise resolving to an array of drift objects.
 */
export declare function detectSchemaDrift(): Promise<Array<{
    agent: string;
    schema: string;
    missing: string[];
}>>;
declare function getAgentMessages(): Promise<Array<Record<string, unknown>>>;
declare function addAgentMessage(agent: string, type: string, message: unknown): Promise<void>;
/**
 * Returns a context snapshot trimmed to fit the specified byte size (prioritizes contracts, todos, testFiles, then other fields).
 * 'size' is the max byte size for the context chunk.
 * Returns a Promise resolving to the trimmed context snapshot.
 */
export declare function getContextChunk(size: number): Promise<Record<string, unknown>>;
/**
 * Agent-specific context configuration schema.
 * Allows each agent to define what context is critical, how much history to keep, and what to exclude.
 */
export type AgentContextConfig = {
    criticalTypes: string[];
    slidingWindowSize: number;
    maxTokens: number;
    excludeTypes?: string[];
};
/**
 * Returns an optimized, token-aware context payload for agent handoff.
 * 'contextArr' is the array of context items, 'agentConfig' is the agent context configuration, 'modelTokenLimit' is the model token limit (default 16000).
 * Returns an object with payload and log.
 */
export declare function getOptimizedHandoverPayload(contextArr: unknown[], agentConfig: AgentContextConfig, modelTokenLimit?: number): {
    payload: unknown[];
    log: unknown;
};
/**
 * Returns a description of the context snapshot helper and its main functions.
 * Returns an object with name, description, and function signatures.
 */
export declare function describe(): {
    name: string;
    description: string;
    functions: {
        name: string;
        signature: string;
        description: string;
    }[];
    usage: string;
    schema: {
        createSnapshot: {
            input: z.ZodObject<{
                delta: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
            }, "strip", z.ZodTypeAny, {
                delta: boolean;
            }, {
                delta?: boolean | undefined;
            }>;
            output: z.ZodNull;
        };
        getAgentMessages: {
            input: z.ZodNull;
            output: z.ZodArray<z.ZodRecord<z.ZodString, z.ZodUnknown>, "many">;
        };
        addAgentMessage: {
            input: z.ZodObject<{
                agent: z.ZodString;
                type: z.ZodString;
                message: z.ZodRecord<z.ZodString, z.ZodUnknown>;
            }, "strip", z.ZodTypeAny, {
                message: Record<string, unknown>;
                type: string;
                agent: string;
            }, {
                message: Record<string, unknown>;
                type: string;
                agent: string;
            }>;
            output: z.ZodNull;
        };
        extractTodos: {
            input: z.ZodNull;
            output: z.ZodArray<z.ZodObject<{
                file: z.ZodString;
                line: z.ZodNumber;
                text: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                text: string;
                file: string;
                line: number;
            }, {
                text: string;
                file: string;
                line: number;
            }>, "many">;
        };
        detectSchemaDrift: {
            input: z.ZodNull;
            output: z.ZodArray<z.ZodObject<{
                agent: z.ZodString;
                schema: z.ZodString;
                missing: z.ZodArray<z.ZodString, "many">;
            }, "strip", z.ZodTypeAny, {
                schema: string;
                agent: string;
                missing: string[];
            }, {
                schema: string;
                agent: string;
                missing: string[];
            }>, "many">;
        };
        getTestFiles: {
            input: z.ZodNull;
            output: z.ZodArray<z.ZodObject<{
                file: z.ZodString;
                dir: z.ZodString;
                size: z.ZodNumber;
                mtime: z.ZodString;
            }, "strip", z.ZodTypeAny, {
                file: string;
                size: number;
                mtime: string;
                dir: string;
            }, {
                file: string;
                size: number;
                mtime: string;
                dir: string;
            }>, "many">;
        };
        getContextChunk: {
            input: z.ZodObject<{
                size: z.ZodNumber;
            }, "strip", z.ZodTypeAny, {
                size: number;
            }, {
                size: number;
            }>;
            output: z.ZodRecord<z.ZodString, z.ZodUnknown>;
        };
        getOptimizedHandoverPayload: {
            input: z.ZodObject<{
                contextArr: z.ZodArray<z.ZodUnknown, "many">;
                agentConfig: z.ZodObject<{
                    criticalTypes: z.ZodArray<z.ZodString, "many">;
                    slidingWindowSize: z.ZodNumber;
                    maxTokens: z.ZodNumber;
                    excludeTypes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
                }, "strip", z.ZodTypeAny, {
                    criticalTypes: string[];
                    maxTokens: number;
                    slidingWindowSize: number;
                    excludeTypes?: string[] | undefined;
                }, {
                    criticalTypes: string[];
                    maxTokens: number;
                    slidingWindowSize: number;
                    excludeTypes?: string[] | undefined;
                }>;
                modelTokenLimit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
            }, "strip", z.ZodTypeAny, {
                contextArr: unknown[];
                agentConfig: {
                    criticalTypes: string[];
                    maxTokens: number;
                    slidingWindowSize: number;
                    excludeTypes?: string[] | undefined;
                };
                modelTokenLimit: number;
            }, {
                contextArr: unknown[];
                agentConfig: {
                    criticalTypes: string[];
                    maxTokens: number;
                    slidingWindowSize: number;
                    excludeTypes?: string[] | undefined;
                };
                modelTokenLimit?: number | undefined;
            }>;
            output: z.ZodObject<{
                payload: z.ZodArray<z.ZodUnknown, "many">;
                log: z.ZodUnknown;
            }, "strip", z.ZodTypeAny, {
                payload: unknown[];
                log?: unknown;
            }, {
                payload: unknown[];
                log?: unknown;
            }>;
        };
    };
};
/**
 * Initializes contextSnapshotHelper. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 * Returns a Promise that resolves when initialization is complete.
 */
export declare function initContextSnapshotHelper(): Promise<void>;
/**
 * Helper functions for context snapshot management.
 */
export { buildSemanticIndex, extractTelemetryEventsFromTests };
