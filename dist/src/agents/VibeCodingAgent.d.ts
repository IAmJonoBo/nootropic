import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult } from '../schemas/AgentOrchestrationEngineSchema.js';
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
/**
 * VibeCodingAgent: Enables voice, error log ingestion, and conversational repair for real-time, interactive coding.
 * Supports speech-to-code, error-message-driven repair, and chat-based debugging. Implements Capability interface.
 * Reference: Vibe Coding (Medium), IBM Vibe Coding
 */
export declare class VibeCodingAgent extends BaseAgent implements Capability {
    readonly name: string;
    constructor(options: BaseAgentOptions);
    runTask(task: unknown): Promise<AgentResult>;
    private whisperSerenadeStub;
    private errorLogRepairStub;
    private conversationalDebugStub;
    static eventSchemas: {
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
        errorLogRepaired: {
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
        conversationDebugged: {
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
    static describe(): CapabilityDescribe;
    describe(): CapabilityDescribe;
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
