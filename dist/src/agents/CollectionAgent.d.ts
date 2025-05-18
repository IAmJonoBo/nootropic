import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult, AgentLogger } from '../schemas/AgentOrchestrationEngineSchema.js';
import { z } from 'zod';
import type { CapabilityDescribe } from '../capabilities/Capability.js';
declare const DataCollectorTaskSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    query: z.ZodString;
}, "strip", z.ZodTypeAny, {
    query: string;
    id: string;
    description: string;
}, {
    query: string;
    id: string;
    description: string;
}>;
type DataCollectorTask = z.infer<typeof DataCollectorTaskSchema>;
export declare class CollectionAgent extends BaseAgent {
    readonly name: string;
    static inputSchema: {
        type: string;
        properties: {
            task: {
                type: string;
                properties: {
                    query: {
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
                    data: {
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
    runTask(task: DataCollectorTask, logger?: AgentLogger): Promise<AgentResult>;
    startEventLoop(): Promise<void>;
    static describe(): CapabilityDescribe;
    describe(): CapabilityDescribe;
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
