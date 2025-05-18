import type { EventBusAdapter } from '../types/AgentOrchestrationEngine.js';
import { AgentEvent } from '../schemas/AgentOrchestrationEngineSchema.js';
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';
export interface TraceContext {
    traceId?: string;
    spanId?: string;
    parentSpanId?: string;
}
/**
 * NatsEventBus: Distributed event bus backend using NATS JetStream. Implements both EventBusAdapter and Capability for registry/discoverability.
 */
export declare class NatsEventBus implements EventBusAdapter, Capability {
    readonly name = "NatsEventBus";
    private nc;
    private js;
    private jsm;
    connect(): Promise<void>;
    publishEvent(event: AgentEvent): Promise<void>;
    subscribeToSubject(subject: string, handler: (event: AgentEvent) => Promise<void>): Promise<void>;
    subscribeToTopic(subject: string, handler: (event: AgentEvent) => Promise<void>): Promise<void>;
    shutdown(): Promise<void>;
    /**
     * Optional: Initialize the capability (no-op for now).
     */
    init(): Promise<void>;
    /**
     * Optional: Hot-reload logic (no-op for now).
     */
    reload(): Promise<void>;
    /**
     * Health check for capability status.
     */
    health(): Promise<HealthStatus>;
    /**
     * Returns a machine-usable, LLM-friendly description of the event bus capability.
     * NOTE: Keep this in sync with the Capability interface in capabilities/Capability.ts.
     */
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
