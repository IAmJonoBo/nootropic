import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult } from '../types/AgentOrchestrationEngine.js';
/**
 * ExplainabilityAgent: Provides detailed, LLM-friendly rationales and traces for any action or decision, supporting transparency and compliance.
 * Implements the Capability interface for unified orchestration and registry.
 */
export declare class ExplainabilityAgent extends BaseAgent {
    readonly name: string;
    constructor(options: BaseAgentOptions);
    /**
     * Hybrid LIME/SHAP Pipelines: Run LIME and SHAP interpretability passes to attribute decision influences at token and AST-node levels.
     * Extension: Integrate LIME/SHAP libraries or LLM-based interpretability.
     */
    runLimeShapInterpretability(): Promise<{
        lime: string;
        shap: string;
    }>;
    /**
     * Attention-Based Rationale Highlighting: Extract and surface cross-attention weights from the LLM during code edits.
     * Extension: Integrate with LLM APIs for attention extraction.
     */
    extractAttentionHighlights(): Promise<string>;
    /**
     * Interactive Traceback Views: Integrate with VS Code inline annotation APIs to display rationales alongside code changes.
     * Extension: Implement VS Code API integration.
     */
    showTracebackInVSCode(): Promise<string>;
    /**
     * Enhanced explainability logic: hybrid LIME/SHAP, attention highlights, interactive tracebacks.
     */
    runTask(): Promise<AgentResult>;
    /**
     * Initialize the agent (stub).
     */
    init(): Promise<void>;
    /**
     * Shutdown the agent (stub).
     */
    shutdown(): Promise<void>;
    /**
     * Reload the agent (stub).
     */
    reload(): Promise<void>;
    static describe(): {
        name: string;
        description: string;
        license: string;
        isOpenSource: boolean;
        provenance: string;
        docsFirst: boolean;
        aiFriendlyDocs: boolean;
        usage: string;
        methods: {
            name: string;
            signature: string;
            description: string;
        }[];
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
        usage: string;
        methods: {
            name: string;
            signature: string;
            description: string;
        }[];
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
}>;
