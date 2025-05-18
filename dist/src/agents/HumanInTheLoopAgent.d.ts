import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult } from '../types/AgentOrchestrationEngine.js';
/**
 * HumanInTheLoopAgent: Manages human approval, intervention, or feedback steps in workflows.
 * Implements the Capability interface for unified orchestration and registry.
 */
export declare class HumanInTheLoopAgent extends BaseAgent {
    readonly name: string;
    constructor(options: BaseAgentOptions);
    runTask(task: unknown): Promise<AgentResult>;
    private governanceThresholdStub;
    private activeLearningStub;
    private reciprocalLearningStub;
    static eventSchemas: {
        governanceCheckpoint: {
            type: string;
            properties: {
                input: {};
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        activeLearning: {
            type: string;
            properties: {
                input: {};
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        reciprocalLearning: {
            type: string;
            properties: {
                input: {};
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        checkpoint: {
            type: string;
            properties: {
                input: {};
                status: {
                    type: string;
                };
            };
            required: string[];
        };
    };
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
        schema: {};
        references: string[];
        bestPractices: string[];
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
        schema: {};
        references: string[];
        bestPractices: string[];
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
