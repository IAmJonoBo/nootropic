import { AgentEvent } from '../schemas/AgentOrchestrationEngineSchema.js';
import type { EventBusAdapter } from '../types/AgentOrchestrationEngine.js';
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';
/**
 * TraceContext: Helper type for trace context (for AI/LLM agent observability).
 */
export interface TraceContext {
    traceId?: string;
    spanId?: string;
    parentSpanId?: string;
}
/**
 * KafkaEventBus: Distributed event bus backend using Kafka.
 * Implements both EventBusAdapter and Capability for registry/discoverability.
 * Uses Kafka as the event backbone for agent/plugin/event communication.
 * All events are validated at runtime using Zod schemas.
 * OTel traces/metrics/logs are emitted for all operations.
 * Import: import { KafkaEventBus } from 'nootropic/adapters/KafkaEventBus'; const bus = new KafkaEventBus(['localhost:9092']); await bus.publishEvent(event).
 * Reference: https://kafka.js.org/
 */
export declare class KafkaEventBus implements EventBusAdapter, Capability {
    private readonly brokers;
    private readonly clientId;
    private readonly kafka;
    private readonly producer;
    private readonly consumers;
    private readonly consumerLag;
    private readonly admin;
    private readonly consumerGroupIds;
    readonly name = "KafkaEventBus";
    private readonly consumerLagCallback;
    constructor(brokers: string[], clientId?: string);
    /**
     * Connect the producer (call before publishing).
     * Returns a Promise that resolves when the producer is connected.
     */
    connectProducer(): Promise<void>;
    /**
     * Subscribe to a topic with a handler. Validates each message with the provided Zod schema.
     * Returns a subscription ID for later unsubscription.
     * 'topic' is the topic name. 'handler' is the event handler function.
     * Returns a Promise that resolves when subscription is complete.
     */
    subscribeToTopic(topic: string, handler: (event: AgentEvent) => Promise<void>): Promise<void>;
    /**
     * Gracefully shutdown all consumers and the producer.
     * Returns a Promise that resolves when shutdown is complete.
     */
    shutdown(): Promise<void>;
    /**
     * Publishes an event to the bus.
     * 'event' is the AgentEvent to publish.
     * Returns a Promise that resolves when the event is published.
     */
    publishEvent(event: AgentEvent): Promise<void>;
    /**
     * Publishes an event to a specific topic.
     * 'event' is the AgentEvent to publish. 'topic' is the optional topic name.
     * Returns a Promise that resolves when the event is published.
     */
    publishToTopic(event: AgentEvent, topic?: string): Promise<void>;
    /**
     * Not implemented: Kafka is not designed for querying all events.
     * Throws an Error if called.
     */
    getEvents(): Promise<AgentEvent[]>;
    /**
     * Not implemented: Kafka is not designed for querying events by topic.
     * Throws an Error if called.
     */
    getEventsByTopic(): Promise<AgentEvent[]>;
    /**
     * Logs an event to the bus.
     * 'level' is the log level. 'message' is the log message. 'details', 'agentId', 'correlationId', and 'topic' are optional.
     * Returns a Promise that resolves when the log event is published.
     */
    logEvent(level: 'info' | 'warn' | 'error' | 'debug', message: string, details?: Record<string, unknown>, agentId?: string, correlationId?: string, topic?: string): Promise<void>;
    /**
     * Optional: Initialize the capability (no-op for now).
     * Returns a Promise that resolves when initialization is complete.
     */
    init(): Promise<void>;
    /**
     * Optional: Hot-reload logic (no-op for now).
     * Returns a Promise that resolves when reload is complete.
     */
    reload(): Promise<void>;
    /**
     * Health check for capability status.
     * Returns a HealthStatus object.
     */
    health(): Promise<HealthStatus>;
    /**
     * Returns a machine-usable, LLM-friendly description of the event bus capability.
     * Returns a CapabilityDescribe object.
     */
    describe(): CapabilityDescribe;
}
/**
 * Stub lifecycle hooks for registry compliance.
 */
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
/**
 * Kafka event handler for message processing. (Escaped right brace: \})
 */
