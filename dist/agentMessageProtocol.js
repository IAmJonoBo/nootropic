// AI-Helpers is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { addAgentMessage, getAgentMessages } from './contextSnapshotHelper.js';
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
    return m && typeof m === 'object' && 'timestamp' in m && 'agent' in m && 'type' in m && 'message' in m;
}
function readProtocolMessages({ type, agent, to } = {}) {
    return getAgentMessages()
        .filter(isProtocolMessage)
        .filter((m) => (!type || m.type === type) &&
        (!agent || m.agent === agent) &&
        (!to || (m.message && typeof m.message === 'object' && 'to' in m.message && m.message.to === to)));
}
/**
 * Returns the n most recent protocol messages (for context window optimization).
 */
export function getRecentMessages(n) {
    return getAgentMessages().filter(isProtocolMessage).slice(-n);
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    const [cmd, ...args] = process.argv.slice(2);
    if (cmd === 'send') {
        const [agent, type, to, ...content] = args;
        sendProtocolMessage(agent, type, content.join(' '), to !== 'null' ? to : null);
        console.log('Protocol message sent.');
    }
    else if (cmd === 'read') {
        const [type, agent, to] = args;
        const msgs = readProtocolMessages({
            type: type !== 'null' ? type : undefined,
            agent: agent !== 'null' ? agent : undefined,
            to: to !== 'null' ? to : undefined
        });
        console.log(JSON.stringify(msgs, null, 2));
    }
    else {
        console.log('Usage: pnpm tsx AI-Helpers/agentMessageProtocol.ts send <agent> <type> <to|null> <content>');
        console.log('       pnpm tsx AI-Helpers/agentMessageProtocol.ts read <type|null> <agent|null> <to|null>');
    }
}
export { sendProtocolMessage, readProtocolMessages, MESSAGE_TYPES };
export function describe() {
    return {
        functions: [
            { name: 'getRecentMessages', signature: '(n: number) => ProtocolMessage[]', description: 'Returns the n most recent protocol messages.' },
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
