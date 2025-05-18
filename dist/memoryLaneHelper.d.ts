import type { AgentEvent as ImportedAgentEvent } from './src/schemas/AgentOrchestrationEngineSchema.js';
type LogLevel = 'info' | 'warn' | 'error' | 'debug';
type AgentEvent = ImportedAgentEvent & {
    [key: string]: unknown;
};
/**
 * Publish (append) an event to the event log and notify subscribers (default topic: event.type).
 * Validates event using canonical Zod schema. See /types/AgentOrchestrationEngine.ts for schema details.
 */
export declare function publishEvent(event: AgentEvent): Promise<void>;
/**
 * Publish an event to a specific topic/queue. Validates event and topic.
 */
export declare function publishToTopic(event: AgentEvent, topic?: string): Promise<void | undefined>;
/**
 * Get all events, optionally filtered by type/agentId/topic/correlationId. Returns validated AgentEvent array.
 */
export declare function getEvents(filter?: Partial<AgentEvent>): Promise<AgentEvent[] | undefined>;
/**
 * Get all events for a specific topic/queue. Returns validated AgentEvent array.
 */
export declare function getEventsByTopic(topic: string): Promise<AgentEvent[] | undefined>;
/**
 * Subscribe to all events (topic: all). Callback receives validated AgentEvent.
 */
export declare function subscribe(callback: (event: AgentEvent) => void): void | undefined;
/**
 * Subscribe to a specific topic/queue. Callback receives validated AgentEvent.
 */
export declare function subscribeToTopic(topic: string, callback: (event: AgentEvent) => void): Promise<void>;
/**
 * Log an audit event (info, warn, error, debug) to a topic. Details are validated.
 */
export declare function logEvent(level: LogLevel, message: string, details?: Record<string, unknown>, agentId?: string, correlationId?: string, topic?: string): Promise<void | undefined>;
interface MemoryLaneEvent {
    timestamp?: string;
    type: string;
    [key: string]: unknown;
}
/**
 * Initializes memoryLaneHelper. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 */
export declare function initMemoryLaneHelper(): Promise<void>;
/** Append an event to memory lane (legacy support). */
declare function appendMemoryEvent(event: MemoryLaneEvent): Promise<void>;
declare function getMemoryLane(): Promise<MemoryLaneEvent[]>;
export interface ReplayOptions {
    from?: number | string;
    to?: number | string;
    type?: string;
    agentId?: string;
    correlationId?: string;
    topic?: string;
    dryRun?: boolean;
}
/**
 * Replay events from memory lane with filtering and dry-run support.
 */
export declare function replayEvents(options: ReplayOptions): Promise<void>;
declare function describe(): {
    name: string;
    description: string;
    schema: {};
    backends: {
        name: string;
        description: string;
        observability: string;
        troubleshooting: string;
        references: string[];
    }[];
    functions: {
        name: string;
        signature: string;
        description: string;
    }[];
    usage: string;
};
export { appendMemoryEvent, getMemoryLane, describe };
