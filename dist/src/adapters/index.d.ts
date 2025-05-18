export declare function registerAllAdapters(registry: typeof import('../capabilities/registry.js').default): void;
export { KafkaEventBus } from './KafkaEventBus.js';
export * from './NatsEventBus.js';
export * from './DaprEventBus.js';
export * from './semanticKernelAdapter.js';
export * from './crewAIAdapter.js';
export * from './langchainAdapter.js';
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
