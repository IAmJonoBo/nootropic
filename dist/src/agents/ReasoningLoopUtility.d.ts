import type { CapabilityDescribe } from '../capabilities/Capability.js';
import { z } from 'zod';
/**
 * ReasoningLoopUtility: Provides iterative code generation, explanation, and repair
 *
 * LLM/AI-usage: Designed for agent workflows requiring iterative reasoning and self-debugging. Extension points for new reasoning strategies or event types.
 * Extension: Add new reasoning strategies, event types, or LLM adapters as needed.
 *
 * Main Methods:
 *   - runReasoningLoop(input): Run a reasoning loop: generate, explain, test, and repair code iteratively
 *   - describe(): Returns a machine-usable description of the utility
 */
export declare class ReasoningLoopUtility {
    readonly name = "ReasoningLoopUtility";
    static schema: z.ZodObject<{
        maxIterations: z.ZodDefault<z.ZodNumber>;
        stopOnSuccess: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        maxIterations: number;
        stopOnSuccess?: boolean | undefined;
    }, {
        maxIterations?: number | undefined;
        stopOnSuccess?: boolean | undefined;
    }>;
    /**
     * Run a reasoning loop: generate, explain, test, and repair code iteratively.
     * 'input' is the task or code to reason about.
     * Returns a stub result.
     */
    runReasoningLoop(input: unknown): Promise<{
        output: unknown;
        logs: string[];
    }>;
    describe(): CapabilityDescribe;
    /** Returns a machine-usable description of the utility. */
    static describe(): CapabilityDescribe;
}
declare const ReasoningLoopUtilityCapability: {
    name: string;
    describe: () => {
        schema: z.ZodObject<{
            maxIterations: z.ZodDefault<z.ZodNumber>;
            stopOnSuccess: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            maxIterations: number;
            stopOnSuccess?: boolean | undefined;
        }, {
            maxIterations?: number | undefined;
            stopOnSuccess?: boolean | undefined;
        }>;
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance?: string;
        cloudOnly?: boolean;
        optInRequired?: boolean;
        cost?: string;
        usage?: string;
        methods?: {
            name: string;
            signature: string;
            description?: string;
        }[];
        references?: string[];
        docsFirst?: boolean;
        aiFriendlyDocs?: boolean;
        promptTemplates?: {
            name: string;
            description: string;
            template: string;
            usage?: string;
        }[];
        supportedEventPatterns?: string[];
        eventSubscriptions?: string[];
        eventEmissions?: string[];
    };
    schema: z.ZodObject<{
        maxIterations: z.ZodDefault<z.ZodNumber>;
        stopOnSuccess: z.ZodOptional<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        maxIterations: number;
        stopOnSuccess?: boolean | undefined;
    }, {
        maxIterations?: number | undefined;
        stopOnSuccess?: boolean | undefined;
    }>;
};
declare const schema: z.ZodObject<{
    maxIterations: z.ZodDefault<z.ZodNumber>;
    stopOnSuccess: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    maxIterations: number;
    stopOnSuccess?: boolean | undefined;
}, {
    maxIterations?: number | undefined;
    stopOnSuccess?: boolean | undefined;
}>;
export { ReasoningLoopUtilityCapability, schema };
export declare function init(): Promise<void>;
export declare function shutdown(): Promise<void>;
export declare function reload(): Promise<void>;
export declare function health(): Promise<{
    status: string;
    timestamp: string;
}>;
export declare function describe(): Promise<{
    name: string;
    description: string;
    promptTemplates: never[];
    schema: {};
}>;
