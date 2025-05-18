import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult, AgentLogger } from '../schemas/AgentOrchestrationEngineSchema.js';
import type { CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
/**
 * ContentAgent: Generates content drafts and responds to feedback. Event-driven.
 *
 * LLM/AI-usage: Fully event-driven, RAG-driven planning, map-reduce summarisation, adaptive tone tuning. Extension points for RAG pipeline, summarisation, and tone model.
 * Extension: Add new event types, planning/summarisation/tone strategies as needed.
 *
 * Main Methods:
 *   - runTask(task, logger?): Enhanced content generation logic
 *   - runRagPlanning(): Generates a content outline using a RAG pipeline (stub)
 *   - mapReduceSummarise(content): Summarises content using map-reduce (stub)
 *   - tuneTone(content, tone): Tunes content tone (stub)
 *   - submitFeedback(feedback): Accepts feedback for continuous improvement (stub)
 *   - health(): Health check
 *   - describe(): Returns a machine-usable description of the agent
 * Reference: https://github.com/hwchase17/langchain, https://arxiv.org/abs/2304.05128
 */
export declare class ContentAgent extends BaseAgent {
    readonly name: string;
    static inputSchema: {
        type: string;
        properties: {
            task: {
                type: string;
                properties: {
                    contentPlan: {
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
                    content: {
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
    constructor(options: BaseAgentOptions);
    /**
     * Generates a content outline using a RAG pipeline (stub).
     * Returns a content outline string.
     */
    runRagPlanning(): Promise<string>;
    /**
     * Summarises content using map-reduce (stub).
     * 'content' is the content to summarise.
     * Returns a summary string.
     */
    mapReduceSummarise(content: string): Promise<string>;
    /**
     * Tunes content tone (stub).
     * 'content' is the content to tune. 'tone' is the target tone.
     * Returns the tuned content string.
     */
    tuneTone(content: string, tone: string): Promise<string>;
    /**
     * Accepts feedback for continuous improvement (stub).
     * 'feedback' is the feedback string.
     */
    submitFeedback(feedback: string): Promise<void>;
    /**
     * Health check for ContentAgent.
     * Returns a HealthStatus object.
     */
    health(): Promise<HealthStatus>;
    /**
     * Returns a machine-usable description of the agent.
     */
    describe(): CapabilityDescribe;
    /**
     * Enhanced content generation logic for a given task.
     * 'task' is the content generation task. 'logger' is an optional logger.
     * Returns an AgentResult.
     */
    runTask(task: unknown, logger?: AgentLogger): Promise<AgentResult>;
    /**
     * Starts the ContentAgent event-driven runtime loop.
     * Subscribes to TaskAssigned and DraftFeedback events, processes them, and emits results.
     * Returns a Promise that resolves when the event loop is started.
     */
    startEventLoop(): Promise<void>;
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
