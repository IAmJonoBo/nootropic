import type { SastFeedbackMemory } from '../../schemas/SastFeedbackMemorySchema.js';
import { BaseMemoryUtility } from './BaseMemoryUtility.js';
/**
 * SonarQubeMemoriesUtility: Feedback/memory utility for SonarQube findings.
 * Extends BaseMemoryUtility for aggregation, deduplication, and registry compliance.
 */
export declare class SonarQubeMemoriesUtility extends BaseMemoryUtility<SastFeedbackMemory> {
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
     * Add a feedback/memory entry for a SonarQube finding.
     */
    addSonarQubeMemory(findingId: string, memory: Partial<SastFeedbackMemory>): Promise<void>;
    /**
     * List all feedback/memories for a SonarQube finding.
     */
    listSonarQubeMemories(findingId: string): Promise<SastFeedbackMemory[]>;
    /**
     * Apply memories/feedback to a list of findings.
     */
    applySonarQubeMemories(findings: unknown[]): Promise<unknown[]>;
    health(): Promise<{
        status: 'ok';
        timestamp: string;
    }>;
}
export declare const sonarQubeMemoriesCapability: {
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
    addSonarQubeMemory: (findingId: string, memory: Partial<SastFeedbackMemory>) => Promise<void>;
    listSonarQubeMemories: (findingId: string) => Promise<SastFeedbackMemory[]>;
    applySonarQubeMemories: (findings: unknown[]) => Promise<unknown[]>;
    init: () => Promise<void>;
    reload: () => Promise<void>;
    health: () => Promise<{
        status: 'ok';
        timestamp: string;
    }>;
};
export default sonarQubeMemoriesCapability;
