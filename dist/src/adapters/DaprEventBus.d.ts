import type { EventBusAdapter } from '../types/AgentOrchestrationEngine.js';
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';
import { AgentEvent } from '../schemas/AgentOrchestrationEngineSchema.js';
/**
 * DaprEventBus: Distributed event bus backend for Dapr pub/sub. Implements both EventBusAdapter and Capability for registry/discoverability.
 */
export declare class DaprEventBus implements EventBusAdapter, Capability {
    readonly name = "DaprEventBus";
    private client;
    constructor();
    /**
     * Publishes an event to a Dapr topic, injecting trace context and validating schema.
     */
    publishEvent(event: AgentEvent, topic: string): Promise<void>;
    /**
     * Subscribes to a Dapr topic, extracting trace context and validating schema.
     * NOTE: As of 2025, the Dapr JS SDK only supports server-side subscriptions via DaprServer. If not available, throw an error.
     * See: https://docs.dapr.io/developing-applications/building-blocks/pubsub/howto-publish-subscribe/
     */
    subscribeToTopic(_topic: string, _handler: (event: AgentEvent) => Promise<void>): Promise<void>;
    /**
     * Publishes a DLQ event for failed events.
     */
    sendToDLQ(originalEvent: unknown, error: unknown): Promise<void>;
    /**
     * Shuts down the Dapr client.
     */
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
