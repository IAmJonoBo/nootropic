import type { AgentEvent } from '../types/AgentOrchestrationEngine.js';
import { BaseAgent } from './BaseAgent.js';
import type { AgentResult } from '../types/AgentOrchestrationEngine.js';
/**
 * FeedbackAgent: Aggregates, summarizes, and routes feedback from LLMs/humans, and manages improvement suggestions.
 * Implements the Capability interface for unified orchestration and registry.
 */
interface FeedbackAgentOptions {
    profile?: {
        name?: string;
    };
    backendName?: string;
    [key: string]: unknown;
}
export declare class FeedbackAgent extends BaseAgent {
    readonly name: string;
    private shimi;
    private aggregation;
    private backendName;
    constructor(options: FeedbackAgentOptions);
    /**
     * Automated Self-Critique (CRITIC Framework): Re-evaluate feedback against summary metrics, filter low-confidence suggestions.
     * Extension: Integrate LLM or CRITIC model for richer critique.
     */
    selfCritiqueLoop(feedback: string): Promise<{
        improved: string;
        confidence: number;
        rationale: string;
    }>;
    /**
     * Noise Filtering & Multi-Agent Aggregation: Deduplicate, filter, and aggregate feedback using multi-agent voting/aggregation.
     * Extension: Use advanced voting/aggregation strategies (majority, semantic, etc.).
     */
    noiseFilter(feedbacks: string[]): Promise<string[]>;
    /**
     * Real-Time Observability: Emit OpenTelemetry metrics for feedback aggregation (latency, volume, sentiment drift).
     * Extension: Integrate with OpenTelemetry API for distributed tracing/metrics.
     */
    emitObservabilityMetrics(metrics?: {
        latency?: number;
        volume?: number;
        sentimentDrift?: number;
    }): Promise<void>;
    /**
     * Enhanced feedback aggregation logic: self-critique, noise filtering, observability, event-driven.
     */
    runTask(task: unknown): Promise<AgentResult>;
    /**
     * Event-driven runtime: subscribe to rationale, mutationSuggested, repair, explanation events, aggregate and moderate feedback.
     * Extension: Add more event types as needed.
     */
    startEventLoop(): Promise<void>;
    /**
     * Summarize rationale from aggregated events. Extension: Integrate LLM summarization.
     */
    summarizeRationale(events: AgentEvent[]): Promise<string>;
    /**
     * Moderate feedback using LLM/human moderation. Extension: Integrate LLM/human moderation backend.
     */
    moderateFeedback(_summary: string): Promise<{
        status: string;
        reason?: string;
    }>;
    static describe(): {
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance: string;
        docsFirst: boolean;
        aiFriendlyDocs: boolean;
        methods: {
            name: string;
            signature: string;
            description: string;
        }[];
        eventSubscriptions: string[];
        eventEmissions: string[];
        usage: string;
        references: string[];
    };
    describe(): {
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance: string;
        docsFirst: boolean;
        aiFriendlyDocs: boolean;
        methods: {
            name: string;
            signature: string;
            description: string;
        }[];
        eventSubscriptions: string[];
        eventEmissions: string[];
        usage: string;
        references: string[];
    };
    health(): Promise<{
        status: "ok";
        timestamp: string;
    }>;
}
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
    promptTemplates: {
        name: string;
        description: string;
        template: string;
        usage: string;
    }[];
}>;
export {};
