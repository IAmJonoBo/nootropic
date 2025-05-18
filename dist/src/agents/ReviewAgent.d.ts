import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult, AgentLogger } from '../schemas/AgentOrchestrationEngineSchema.js';
import { z } from 'zod';
import type { CapabilityDescribe } from '../capabilities/Capability.js';
declare const ReviewerTaskSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    content: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    description: string;
    content: string;
}, {
    id: string;
    description: string;
    content: string;
}>;
type ReviewerTask = z.infer<typeof ReviewerTaskSchema>;
/**
 * ReviewAgent: Reviews drafts and provides feedback. Event-driven.
 * Enhancements: Sentiment-and-aspect analysis, multi-pass chain-of-thought (SCoT) review, ensemble scoring.
 * Extension points: LLM/embedding backend for sentiment/aspect analysis, multi-model ensemble scoring, custom multi-pass review logic.
 * Reference: https://huggingface.co/tasks/sentiment-analysis
 */
export declare class ReviewAgent extends BaseAgent {
    static inputSchema: {
        type: string;
        properties: {
            task: {
                type: string;
                properties: {
                    content: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            };
            logger: {
                type: string[];
            };
        };
        required: string[];
    };
    static outputSchema: {
        type: string;
        properties: {
            output: {
                type: string;
                properties: {
                    review: {
                        type: string;
                    };
                    score: {
                        type: string;
                    };
                };
                required: string[];
            };
            success: {
                type: string;
            };
            logs: {
                type: string;
                items: {
                    type: string;
                };
            };
        };
        required: string[];
    };
    readonly name: string;
    constructor(options: BaseAgentOptions & {
        backendName?: string;
    });
    /**
     * LLM-powered sentiment and aspect analysis. Extension: HuggingFace, Ollama, or local LLM.
     * 'content' is the content to analyze.
     * Returns sentiment and aspects.
     */
    sentimentAndAspectAnalysis(content: string): Promise<{
        sentiment: string;
        aspects: Record<string, string>;
    }>;
    /**
     * Multi-pass chain-of-thought review. Extension: SCoT pipeline, LLM/embedding backend.
     * 'content' is the content to review.
     * Returns an array of review pass results.
     */
    multiPassChainOfThought(content: string): Promise<string[]>;
    /**
     * Aggregate scores from multiple models. Extension: quantized LLMs, voting/aggregation strategies.
     * 'content' is the content to score.
     * Returns a heuristic score (0-10).
     */
    ensembleScoring(content: string): Promise<number>;
    /**
     * Reviews outputs using sentiment analysis, multi-pass SCoT, and ensemble scoring.
     * 'task' is the ReviewerTask input. 'logger' is an optional logger.
     * Returns AgentResult.
     */
    runTask(task: ReviewerTask, logger?: AgentLogger): Promise<AgentResult>;
    /**
     * Starts the ReviewerAgent event-driven runtime loop.
     * Subscribes to DraftCreated, ReviewRequested, and TaskAssigned events, processes them, and emits results.
     * Returns a Promise that resolves when the event loop is started.
     */
    startEventLoop(): Promise<void>;
    /**
     * Returns a machine-usable, LLM-friendly description of the agent.
     * Returns a CapabilityDescribe object.
     */
    static describe(): CapabilityDescribe;
    /**
     * Instance describe for registry compliance.
     */
    describe(): CapabilityDescribe;
    /**
     * Instance health for registry compliance.
     */
    health(): Promise<{
        status: "ok";
        timestamp: string;
    }>;
}
/**
 * Stub lifecycle hooks for registry compliance.
 */
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
}>;
export {};
