import type { AgentEvent as ImportedAgentEvent } from './schemas/AgentOrchestrationEngineSchema.js';
type AgentEvent = ImportedAgentEvent & {
    [key: string]: unknown;
};
export declare function publishEvent(event: AgentEvent): Promise<void>;
export declare function publishToTopic(event: AgentEvent, topic?: string): Promise<void | undefined>;
export declare function getEvents(filter?: Partial<AgentEvent>): Promise<AgentEvent[] | undefined>;
export declare function getEventsByTopic(topic: string): Promise<AgentEvent[] | undefined>;
export declare function subscribeToTopic(topic: string, callback: (event: AgentEvent) => Promise<void>): Promise<void>;
export {};
