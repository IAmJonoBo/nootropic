import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult } from '../types/AgentOrchestrationEngine.js';
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
/**
 * MultimodalAgent: Ingests UI mockups, diagrams, and code to generate code skeletons and bridge design-development.
 * Supports vision-language modeling, design-to-code, and diagram parsing. Implements Capability interface.
 * Reference: Flame-Code-VLM, GPT-4V, Qwen-VL
 */
export declare class MultimodalAgent extends BaseAgent implements Capability {
    readonly name: string;
    constructor(options: BaseAgentOptions);
    runTask(task: unknown): Promise<AgentResult>;
    private visionLanguageModelStub;
    private diagramParsingStub;
    private whisperTranscriptionStub;
    private textSynthesisStub;
    static eventSchemas: {
        visionLanguageProcessed: {
            type: string;
            properties: {
                input: {
                    type: string;
                };
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        diagramParsed: {
            type: string;
            properties: {
                input: {
                    type: string;
                };
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        audioTranscribed: {
            type: string;
            properties: {
                input: {
                    type: string;
                };
                result: {
                    type: string;
                };
            };
            required: string[];
        };
        textSynthesized: {
            type: string;
            properties: {
                input: {
                    type: string;
                };
                result: {
                    type: string;
                };
            };
            required: string[];
        };
    };
    static describe(): CapabilityDescribe;
    describe(): CapabilityDescribe;
    health(): Promise<HealthStatus>;
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
