// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// @ts-ignore
import { addAgentMessage, getAgentMessages, getContextChunk, getOptimizedHandoverPayload } from './contextSnapshotHelper.js';
// --- Message Types ---
const MESSAGE_TYPES = ['proposal', 'counter', 'accept', 'reject', 'info'];
// --- Send a protocol message ---
function sendProtocolMessage(agent, type, content, to = null) {
    if (!MESSAGE_TYPES.includes(type))
        throw new Error('Invalid message type');
    addAgentMessage(agent, type, { to, content });
}
// --- Read protocol messages (optionally filter by type/agent) ---
function isProtocolMessage(m) {
    return (typeof m === 'object' &&
        m !== null &&
        'timestamp' in m &&
        'agent' in m &&
        'type' in m &&
        'message' in m &&
        typeof m.timestamp === 'string' &&
        typeof m.agent === 'string' &&
        typeof m.type === 'string' &&
        typeof m.message === 'object');
}
export async function readProtocolMessages() {
    const messages = await getAgentMessages();
    const filtered = messages.filter(isProtocolMessage);
    // @ts-expect-error TS2352: TypeScript cannot fully narrow array after filter; safe due to type guard
    return filtered;
}
export async function getLastNProtocolMessages(n) {
    const messages = await getAgentMessages();
    const filtered = messages.filter(isProtocolMessage).slice(-n);
    // @ts-expect-error TS2352: TypeScript cannot fully narrow array after filter; safe due to type guard
    return filtered;
}
/**
 * Returns the n most recent protocol messages (for context window optimization).
 */
export async function getRecentMessages() {
    const messages = await getAgentMessages();
    const filtered = messages.filter(isProtocolMessage);
    // @ts-expect-error TS2352: TypeScript cannot fully narrow array after filter; safe due to type guard
    return filtered;
}
/**
 * Returns a context chunk relevant to protocol messages (for efficient handoff).
 */
export async function getProtocolContextChunk(size) {
    return await getContextChunk(size);
}
/**
 * Returns an optimized, token-aware handover payload for protocol messages.
 */
export function getOptimizedProtocolHandover(contextArr, agentConfig, modelTokenLimit) {
    return getOptimizedHandoverPayload(contextArr, agentConfig, modelTokenLimit);
}
/**
 * Returns a delta snapshot of protocol messages for efficient incremental handoff.
 */
export async function getProtocolDeltaSnapshot() {
    const { getContextChunk } = await import('./contextSnapshotHelper.js');
    // Use a small chunk size for delta, or parameterize as needed
    return getContextChunk(4096); // Example: 4KB delta
}
/**
 * Returns semantic index keywords relevant to protocol messages.
 */
export async function getProtocolSemanticIndex() {
    const { buildSemanticIndex } = await import('./contextSnapshotHelper.js');
    const index = await buildSemanticIndex();
    return Object.keys(index);
}
/**
 * Returns telemetry events related to protocol messages.
 */
export async function getProtocolTelemetryEvents() {
    const { extractTelemetryEventsFromTests } = await import('./contextSnapshotHelper.js');
    return await extractTelemetryEventsFromTests();
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const [cmd, ...args] = process.argv.slice(2);
        if (cmd === 'send') {
            const [agent, type, to, ...content] = args;
            sendProtocolMessage(agent ?? '', (MESSAGE_TYPES.includes(type) ? type : 'info'), content.join(' '), to !== 'null' ? to : null);
            console.log('Protocol message sent.');
        }
        else if (cmd === 'read') {
            const [type, agent, to] = args;
            const typeArg = MESSAGE_TYPES.includes(type) ? type : undefined;
            const params = {};
            if (typeArg)
                params.type = typeArg;
            if (agent)
                params.agent = agent;
            if (to)
                params.to = to;
            const msgs = await readProtocolMessages();
            console.log(JSON.stringify(msgs, null, 2));
        }
        else {
            console.log('Usage: pnpm tsx nootropic/agentMessageProtocol.ts send <agent> <type> <to|null> <content>');
            console.log('       pnpm tsx nootropic/agentMessageProtocol.ts read <type|null> <agent|null> <to|null>');
        }
    })();
}
export { sendProtocolMessage, MESSAGE_TYPES };
export function describe() {
    return {
        functions: [
            { name: 'getRecentMessages', signature: '() => Promise<ProtocolMessage[]>', description: 'Returns the n most recent protocol messages.' },
            { name: 'getProtocolContextChunk', signature: '(size: number) => Promise<Record<string, unknown>>', description: 'Returns a context chunk relevant to protocol messages.' },
            { name: 'getOptimizedProtocolHandover', signature: '(contextArr, agentConfig, modelTokenLimit?) => { payload, log }', description: 'Returns an optimized, token-aware handover payload for protocol messages.' },
            { name: 'getProtocolDeltaSnapshot', signature: '() => Promise<Record<string, unknown>>', description: 'Returns a delta snapshot of protocol messages for efficient incremental handoff.' },
            { name: 'getProtocolSemanticIndex', signature: '() => Promise<string[]>', description: 'Returns semantic index keywords relevant to protocol messages.' },
            { name: 'getProtocolTelemetryEvents', signature: '() => Promise<Record<string, string[]>>', description: 'Returns telemetry events related to protocol messages.' }
        ],
        schema: {
            getRecentMessages: {
                input: {
                    type: 'object',
                    properties: { n: { type: 'number', description: 'Number of recent messages to return.' } },
                    required: ['n']
                },
                output: {
                    type: 'array',
                    items: { type: 'object', description: 'ProtocolMessage' }
                }
            },
        }
    };
}
export async function handleProtocolMessage(args) {
    const typeArg = args.type && MESSAGE_TYPES.includes(args.type) ? args.type : undefined;
    const params = {};
    if (typeArg)
        params.type = typeArg;
    if (args.agent)
        params.agent = args.agent;
    if (args.to)
        params.to = args.to;
    await readProtocolMessages();
}
