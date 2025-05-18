import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
export declare class OpenRouterLLMAdapter implements Capability {
    readonly name = "OpenRouterLLMAdapter";
    generateText(prompt: string, model?: string, options?: Record<string, unknown>): Promise<string>;
    embedText(text: string, model?: string, options?: Record<string, unknown>): Promise<number[]>;
    getModelInfo(model: string): Promise<Record<string, unknown>>;
    health(): Promise<HealthStatus>;
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
