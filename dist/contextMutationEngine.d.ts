import { PatchInfo } from './src/utils/context/contextManager.js';
interface SchemaDriftSuggestion {
    type: 'schemaDrift';
    agent: string;
    fix: string;
}
interface TodoSuggestion {
    type: 'todo';
    file: string;
    line: number;
    suggestion: string;
}
interface TestSuggestion {
    type: 'test';
    suggestion: string;
}
type MutationSuggestion = SchemaDriftSuggestion | TodoSuggestion | TestSuggestion;
/**
 * Generates mutation/refactor suggestions using full context snapshot.
 */
declare function getHolisticMutationSuggestions(): Promise<MutationSuggestion[]>;
declare function generatePatches(suggestions: MutationSuggestion[]): Promise<PatchInfo[]>;
declare function writeMutationPlan(patches: PatchInfo[], suggestions: MutationSuggestion[]): Promise<void>;
declare function runMutationEngine(): Promise<void>;
/**
 * Returns a context chunk for memory-efficient mutation planning.
 */
export declare function getMutationContextChunk(size: number): Promise<Record<string, unknown>>;
/**
 * Returns a delta snapshot for mutation/refactor planning (efficient incremental context).
 */
export declare function getMutationDeltaSnapshot(): Promise<Record<string, unknown>>;
/**
 * Returns semantic index keywords relevant to mutation/refactor planning.
 */
export declare function getMutationSemanticIndex(): Promise<string[]>;
/**
 * Returns telemetry events related to mutation/refactor planning.
 */
export declare function getMutationTelemetryEvents(): Promise<Record<string, string[]>>;
/**
 * Describes the event-driven interface for mutation/refactor suggestions.
 * Returns an object with name, emits, and eventSchemas.
 */
export declare function describe(): {
    name: string;
    description: string;
    schema: {};
    status: string;
    docsFirst: boolean;
    aiFriendlyDocs: boolean;
    license: string;
    isOpenSource: boolean;
    eventSchema: {
        title: string;
        type: string;
        properties: {
            eventId: {
                type: string;
                description: string;
            };
            type: {
                const: string;
            };
            version: {
                type: string;
                pattern: string;
                description: string;
            };
            source: {
                type: string;
                description: string;
            };
            agentId: {
                type: string;
            };
            timestamp: {
                type: string;
                format: string;
            };
            payload: {
                type: string;
            };
            correlationId: {
                type: string;
                description: string;
            };
            topic: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
    traceability: string;
};
/**
 * Initializes contextMutationEngine. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 */
export declare function initContextMutationEngine(): Promise<void>;
export { getHolisticMutationSuggestions, generatePatches, writeMutationPlan, runMutationEngine };
