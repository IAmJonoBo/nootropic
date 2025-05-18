// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper.
/**
 * memoryLaneHelper: Event bus and memory lane for agent event auditing, replay, and registry-driven backend selection.
 *
 * LLM/AI-usage: Designed for robust, machine-usable event auditing and replay in agent-driven workflows. All event validation uses canonical Zod schemas.
 * Extension: Add new event bus backends or event types via the registry.
 */
import { getCacheFilePath, ensureCacheDirExists } from './utils/context/cacheDir.js';
import { promises as fsp } from 'fs';
import { validateAgentEvent } from './schemas/AgentOrchestrationEngineSchema.js';
import { z } from 'zod';
// Zod schema for event payloads and details
const EventPayloadSchema = z.record(z.string(), z.unknown());
// Use canonical Zod-based validation for AgentEvent
function validateEvent(event) {
    const result = validateAgentEvent(event);
    if (!result.success) {
        throw new Error(`Invalid event schema: ${result.error}`);
    }
    // Validate payload and details if present
    if ('payload' in event && event.payload !== undefined) {
        EventPayloadSchema.parse(event.payload);
    }
    return true;
}
const EVENT_LOG_PATH = getCacheFilePath('event-log.jsonl');
// --- In-memory subscribers by topic ---
const topicSubscribers = {};
// --- JSONL Backend ---
class JsonlEventBus {
    async publishEvent(event) {
        await this.publishToTopic(event, typeof event['topic'] === 'string' ? event['topic'] : event.type);
    }
    async publishToTopic(event, topic) {
        if (!validateEvent(event))
            throw new Error('Invalid event schema');
        const topicName = topic ?? (typeof event['topic'] === 'string' ? event['topic'] : undefined) ?? event.type;
        const eventWithMeta = { ...event, timestamp: event.timestamp ?? new Date().toISOString(), topic: topicName };
        await ensureCacheDirExists();
        await fsp.appendFile(EVENT_LOG_PATH, JSON.stringify(eventWithMeta) + '\n');
        // Notify topic subscribers
        if (typeof topicName === 'string' && topicName) {
            topicSubscribers[topicName] ??= [];
            for (const sub of topicSubscribers[topicName])
                sub(eventWithMeta);
        }
        if (topicSubscribers['all']) {
            topicSubscribers['all'] ??= [];
            for (const sub of topicSubscribers['all'])
                sub(eventWithMeta);
        }
    }
    async getEvents(filter = {}) {
        await ensureCacheDirExists();
        try {
            const lines = (await fsp.readFile(EVENT_LOG_PATH, 'utf-8')).split('\n').filter((l) => Boolean(l));
            let events = lines.map((l) => JSON.parse(l));
            if (filter.type)
                events = events.filter((e) => e.type === filter.type);
            if (filter.agentId)
                events = events.filter((e) => e.agentId === filter.agentId);
            if ('topic' in filter && filter['topic'])
                events = events.filter((e) => typeof e['topic'] === 'string' && e['topic'] === (filter['topic'] ?? ''));
            if ('correlationId' in filter && filter['correlationId'])
                events = events.filter((e) => typeof e['correlationId'] === 'string' && e['correlationId'] === (filter['correlationId'] ?? ''));
            return events;
        }
        catch {
            return [];
        }
    }
    async getEventsByTopic(topic) {
        await ensureCacheDirExists();
        try {
            const lines = (await fsp.readFile(EVENT_LOG_PATH, 'utf-8')).split('\n').filter((l) => Boolean(l));
            return lines.map((l) => JSON.parse(l)).filter((e) => typeof e['topic'] === 'string' && e['topic'] === topic);
        }
        catch {
            return [];
        }
    }
    subscribe(callback) {
        this.subscribeToTopic('all', async (event) => callback(event));
    }
    async subscribeToTopic(topic, handler) {
        topicSubscribers[topic] ??= [];
        topicSubscribers[topic].push((event) => { void handler(event); });
    }
    async logEvent(level, message, details, agentId, correlationId, topic) {
        await this.publishToTopic({
            type: 'Log',
            agentId,
            timestamp: new Date().toISOString(),
            payload: { level, message, details },
            correlationId,
            topic
        }, topic ?? 'Log');
    }
    async shutdown() { }
}
// --- Backend Factory ---
/**
 * Dynamically loads the registry only if a non-default event bus backend is requested.
 * This avoids circular dependencies with registry and RAGPipelineUtility.
 */
async function getEventBusBackend() {
    const backend = process.env['EVENT_BUS_BACKEND'] ?? 'jsonl';
    if (backend === 'kafka' || backend === 'nats' || backend === 'dapr') {
        // Dynamically import registry only if needed
        const registry = (await import('./capabilities/registry.js')).default;
        if (backend === 'kafka') {
            const kafka = registry.get('KafkaEventBus');
            if (!kafka)
                throw new Error('KafkaEventBus is not registered in the registry');
            return kafka;
        }
        if (backend === 'nats') {
            const nats = registry.get('NatsEventBus');
            if (!nats)
                throw new Error('NatsEventBus is not registered in the registry');
            return nats;
        }
        if (backend === 'dapr') {
            const dapr = registry.get('DaprEventBus');
            if (!dapr)
                throw new Error('DaprEventBus is not registered in the registry');
            return dapr;
        }
    }
    // Fallback to local JSONL event bus for dev/local
    return new JsonlEventBus();
}
let eventBusPromise = null;
function getEventBus() {
    if (!eventBusPromise) {
        eventBusPromise = getEventBusBackend();
    }
    return eventBusPromise;
}
// --- Public API: delegate to selected backend ---
export async function publishEvent(event) { return (await getEventBus()).publishEvent(event); }
export async function publishToTopic(event, topic) { return (await getEventBus()).publishToTopic?.(event, topic); }
export async function getEvents(filter) { return (await getEventBus()).getEvents?.(filter); }
export async function getEventsByTopic(topic) { return (await getEventBus()).getEventsByTopic?.(topic); }
export async function subscribeToTopic(topic, callback) {
    return (await getEventBus()).subscribeToTopic?.(topic, (event) => callback(event));
}
// ... rest of the file ... 
