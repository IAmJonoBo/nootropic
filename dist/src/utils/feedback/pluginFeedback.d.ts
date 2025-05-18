import { z } from 'zod';
import { BaseMemoryUtility } from './BaseMemoryUtility.js';
export declare const PluginFeedbackSchema: z.ZodObject<{
    pluginName: z.ZodString;
    user: z.ZodString;
    rating: z.ZodNumber;
    review: z.ZodOptional<z.ZodString>;
    timestamp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    timestamp: string;
    pluginName: string;
    user: string;
    rating: number;
    review?: string | undefined;
}, {
    timestamp: string;
    pluginName: string;
    user: string;
    rating: number;
    review?: string | undefined;
}>;
export type PluginFeedback = z.infer<typeof PluginFeedbackSchema>;
export type PluginFeedbackAggregate = {
    pluginName: string;
    averageRating: number;
    reviewCount: number;
    ratings: number[];
    reviews: {
        user: string;
        review: string;
        timestamp: string;
    }[];
};
/**
 * PluginFeedbackUtility: Feedback/memory utility for plugin feedback.
 * Extends BaseMemoryUtility for aggregation, deduplication, and registry compliance.
 */
export declare class PluginFeedbackUtility extends BaseMemoryUtility<PluginFeedback> {
    name: string;
    filePath: string;
    schema: z.ZodObject<{
        pluginName: z.ZodString;
        user: z.ZodString;
        rating: z.ZodNumber;
        review: z.ZodOptional<z.ZodString>;
        timestamp: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        timestamp: string;
        pluginName: string;
        user: string;
        rating: number;
        review?: string | undefined;
    }, {
        timestamp: string;
        pluginName: string;
        user: string;
        rating: number;
        review?: string | undefined;
    }>;
    /**
     * Submit feedback for a plugin.
     */
    submitPluginFeedback(feedback: PluginFeedback): Promise<void>;
    /**
     * List all feedback for a given plugin.
     */
    listFeedbackForPlugin(pluginName: string): Promise<PluginFeedback[]>;
    /**
     * Aggregate feedback for a plugin (average rating, review count, etc).
     */
    aggregatePluginFeedback(pluginName: string): Promise<PluginFeedbackAggregate>;
}
export declare const submitPluginFeedback: (feedback: PluginFeedback) => Promise<void>;
export declare const listFeedbackForPlugin: (pluginName: string) => Promise<PluginFeedback[]>;
export declare const aggregatePluginFeedback: (pluginName: string) => Promise<PluginFeedbackAggregate>;
declare const pluginFeedbackCapability: {
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
        schema: z.ZodObject<{
            pluginName: z.ZodString;
            user: z.ZodString;
            rating: z.ZodNumber;
            review: z.ZodOptional<z.ZodString>;
            timestamp: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            timestamp: string;
            pluginName: string;
            user: string;
            rating: number;
            review?: string | undefined;
        }, {
            timestamp: string;
            pluginName: string;
            user: string;
            rating: number;
            review?: string | undefined;
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
export default pluginFeedbackCapability;
