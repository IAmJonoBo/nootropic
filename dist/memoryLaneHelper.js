// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper.
/**
 * memoryLaneHelper: Event bus and memory lane for agent event auditing, replay, and registry-driven backend selection.
 *
 * LLM/AI-usage: Designed for robust, machine-usable event auditing and replay in agent-driven workflows. All event validation uses canonical Zod schemas.
 * Extension: Add new event bus backends or event types via the registry.
 */
import { readJsonSafe, writeJsonSafe, getOrInitJson, esmEntrypointCheck } from './utils.js';
import { getCacheFilePath, ensureCacheDirExists } from './src/utils/context/cacheDir.js';
import { promises as fsp } from 'fs';
import registry from './src/capabilities/registry.js';
import { validateAgentEvent } from './src/schemas/AgentOrchestrationEngineSchema.js';
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
// --- Redis Streams Backend ---
// class RedisEventBus implements EventBusBackend {
//   ... (commented out, replaced by registry-driven adapter)
// }
// --- Kafka Backend (stub) ---
// class KafkaEventBus implements EventBusBackend {
//   ... (commented out, replaced by registry-driven adapter)
// }
// --- NATS Backend (full implementation) ---
// class NatsEventBus implements EventBusBackend {
//   ... (commented out, replaced by registry-driven adapter)
// }
// --- Dapr Backend (stub) ---
// class DaprEventBus implements EventBusBackend {
//   ... (commented out, replaced by registry-driven adapter)
// }
// --- Backend Factory ---
function getEventBusBackend() {
    const backend = process.env['EVENT_BUS_BACKEND'] ?? 'jsonl';
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
    // Fallback to local JSONL event bus for dev/local
    return new JsonlEventBus();
}
const eventBus = getEventBusBackend();
// --- Public API: delegate to selected backend ---
/**
 * Publish (append) an event to the event log and notify subscribers (default topic: event.type).
 * Validates event using canonical Zod schema. See /types/AgentOrchestrationEngine.ts for schema details.
 */
export async function publishEvent(event) { return eventBus.publishEvent(event); }
/**
 * Publish an event to a specific topic/queue. Validates event and topic.
 */
export async function publishToTopic(event, topic) { return eventBus.publishToTopic?.(event, topic); }
/**
 * Get all events, optionally filtered by type/agentId/topic/correlationId. Returns validated AgentEvent array.
 */
export async function getEvents(filter) { return eventBus.getEvents?.(filter); }
/**
 * Get all events for a specific topic/queue. Returns validated AgentEvent array.
 */
export async function getEventsByTopic(topic) { return eventBus.getEventsByTopic?.(topic); }
/**
 * Subscribe to all events (topic: all). Callback receives validated AgentEvent.
 */
export function subscribe(callback) { return eventBus.subscribe?.(callback); }
/**
 * Subscribe to a specific topic/queue. Callback receives validated AgentEvent.
 */
export function subscribeToTopic(topic, callback) { return eventBus.subscribeToTopic?.(topic, async (event) => callback(event)); }
/**
 * Log an audit event (info, warn, error, debug) to a topic. Details are validated.
 */
export async function logEvent(level, message, details, agentId, correlationId, topic) {
    if (details)
        EventPayloadSchema.parse(details);
    return eventBus.logEvent?.(level, message, details, agentId ?? '', correlationId ?? '', topic ?? '');
}
const MEMORY_JSON = getCacheFilePath('memory.json');
/**
 * Initializes memoryLaneHelper. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 */
export async function initMemoryLaneHelper() {
    await ensureCacheDirExists();
}
/** Append an event to memory lane (legacy support). */
async function appendMemoryEvent(event) {
    const timeline = await getOrInitJson(MEMORY_JSON, []);
    const eventWithTimestamp = { ...event };
    eventWithTimestamp.timestamp ??= new Date().toISOString();
    timeline.push(eventWithTimestamp);
    await writeJsonSafe(MEMORY_JSON, timeline);
}
// --- Get the full memory lane timeline ---
async function getMemoryLane() {
    return (await readJsonSafe(MEMORY_JSON, []));
}
/**
 * Replay events from memory lane with filtering and dry-run support.
 */
export async function replayEvents(options) {
    const events = (await getEvents()) ?? [];
    let filtered = events;
    if (options.type)
        filtered = filtered.filter((e) => e.type === options.type);
    if (options.agentId)
        filtered = filtered.filter((e) => e.agentId === options.agentId);
    if (options.correlationId)
        filtered = filtered.filter((e) => e['correlationId'] === (options.correlationId ?? ''));
    if (options.topic)
        filtered = filtered.filter((e) => e['topic'] === (options.topic ?? ''));
    // Range filtering
    let fromIdx = 0, toIdx = filtered.length;
    if (typeof options.from === 'number')
        fromIdx = options.from;
    else if (typeof options.from === 'string') {
        const idx = filtered.findIndex((e) => e.timestamp >= (options.from ?? ''));
        if (idx >= 0)
            fromIdx = idx;
    }
    if (typeof options.to === 'number')
        toIdx = options.to;
    else if (typeof options.to === 'string') {
        const idx = filtered.findIndex((e) => e.timestamp > (options.to ?? ''));
        if (idx >= 0)
            toIdx = idx;
    }
    const replaySlice = filtered.slice(fromIdx, toIdx);
    for (const event of replaySlice) {
        if (options.dryRun) {
            console.log('[dry-run] Would replay event:', event);
        }
        else {
            await publishEvent(event);
        }
    }
    console.log(`[replay] Replayed ${replaySlice.length} events (dryRun=${!!options.dryRun})`);
}
// Add type guard for CLI event parsing
function isAgentEvent(obj) {
    try {
        validateEvent(obj);
        return true;
    }
    catch {
        return false;
    }
}
// --- CLI entrypoint extension ---
if (esmEntrypointCheck(import.meta.url)) {
    const [cmd, ...args] = process.argv.slice(2);
    if (cmd === 'append') {
        const event = JSON.parse(args.join(' '));
        if (!isAgentEvent(event))
            throw new Error('Invalid event format for append');
        await publishEvent(event);
        console.log('Event appended to event log.');
    }
    else if (cmd === 'get') {
        const filter = {};
        for (let i = 0; i < args.length; i += 2) {
            if (args[i] === '--topic')
                filter['topic'] = args[i + 1] ?? '';
            if (args[i] === '--type')
                filter.type = args[i + 1] ?? '';
            if (args[i] === '--correlationId')
                filter['correlationId'] = args[i + 1] ?? '';
        }
        const events = await getEvents(filter);
        console.log(JSON.stringify(events, null, 2));
    }
    else if (cmd === 'tail') {
        const n = parseInt(args[0] ?? '10', 10);
        let filter = {};
        for (let i = 1; i < args.length; i += 2) {
            if (args[i] === '--topic')
                filter['topic'] = args[i + 1] ?? '';
            if (args[i] === '--type')
                filter.type = args[i + 1] ?? '';
            if (args[i] === '--correlationId')
                filter['correlationId'] = args[i + 1] ?? '';
        }
        const events = (await getEvents(filter)) ?? [];
        console.log(JSON.stringify(events.slice(-n), null, 2));
    }
    else if (cmd === 'replay') {
        // Parse CLI args for replay
        const opts = {};
        for (let i = 0; i < args.length; i += 2) {
            if (args[i] === '--from')
                opts.from = args[i + 1] ?? 0;
            if (args[i] === '--to')
                opts.to = args[i + 1] ?? 0;
            if (args[i] === '--type')
                opts.type = args[i + 1] ?? '';
            if (args[i] === '--agentId')
                opts.agentId = args[i + 1] ?? '';
            if (args[i] === '--correlationId')
                opts.correlationId = args[i + 1] ?? '';
            if (args[i] === '--topic')
                opts.topic = args[i + 1] ?? '';
            if (args[i] === '--dry-run')
                opts.dryRun = true;
        }
        await replayEvents(opts);
    }
    else {
        console.log('Usage: pnpm tsx nootropic/memoryLaneHelper.ts append <jsonEvent>');
        console.log('       pnpm tsx nootropic/memoryLaneHelper.ts get [--topic <topic>] [--type <type>] [--correlationId <id>]');
        console.log('       pnpm tsx nootropic/memoryLaneHelper.ts tail <n> [--topic <topic>] [--type <type>] [--correlationId <id>]');
        console.log('       pnpm tsx nootropic/memoryLaneHelper.ts replay --from <start> --to <end> [--type <type>] [--agentId <id>] [--correlationId <id>] [--topic <topic>] [--dry-run]');
    }
}
// --- Self-describing API ---
function describe() {
    return {
        name: 'memoryLaneHelper',
        description: 'Memory lane event log and event bus abstraction.',
        schema: {},
        backends: [
            {
                name: 'NATS',
                description: 'NATS JetStream backend for distributed event bus.',
                observability: 'All publish/consume operations are traced with OTel. DLQ events are published to a dedicated subject. Use NATS CLI or JetStream Manager for monitoring. Trace context is propagated in event fields.',
                troubleshooting: 'Ensure NATS server is running and JetStream is enabled. Check stream/subject configuration. Use DLQ subject for error analysis. Validate event schemas with Zod.',
                references: [
                    'https://docs.nats.io/nats-concepts/jetstream',
                    'https://opentelemetry.io/docs/instrumentation/js/',
                    'https://zod.dev/'
                ]
            }
        ],
        functions: [
            { name: 'publishEvent', signature: 'async (event: AgentEvent) => Promise<void>', description: 'Publish (append) an event to the event log and notify subscribers (default topic: event.type).' },
            { name: 'publishToTopic', signature: 'async (event: AgentEvent, topic?: string) => Promise<void>', description: 'Publish an event to a specific topic/queue.' },
            { name: 'subscribe', signature: '(callback: (event: AgentEvent) => void) => void', description: 'Subscribe to all events (topic: all).' },
            { name: 'subscribeToTopic', signature: '(topic: string, callback: (event: AgentEvent) => void) => void', description: 'Subscribe to a specific topic/queue.' },
            { name: 'getEvents', signature: 'async (filter?: Partial<AgentEvent>) => Promise<AgentEvent[]>', description: 'Get all events, optionally filtered by type/agentId/topic/correlationId.' },
            { name: 'getEventsByTopic', signature: 'async (topic: string) => Promise<AgentEvent[]>', description: 'Get all events for a specific topic/queue.' },
            { name: 'logEvent', signature: 'async (level, message, details?, agentId?, correlationId?, topic?) => Promise<void>', description: 'Log an audit event (info, warn, error, debug) to a topic.' }
        ],
        usage: `// Set EVENT_BUS_BACKEND=nats and configure NATS_URL/NATS_STREAM/NATS_SUBJECT for NATS JetStream. Fallback is local JSONL.`
    };
}
export { appendMemoryEvent, getMemoryLane, describe };
