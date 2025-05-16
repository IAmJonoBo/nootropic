// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { addAgentMessage, getAgentMessages, getContextChunk, getOptimizedHandoverPayload, AgentContextConfig } from './contextSnapshotHelper.js';

// --- Message Types ---
const MESSAGE_TYPES = ['proposal', 'counter', 'accept', 'reject', 'info'] as const;
type MessageType = typeof MESSAGE_TYPES[number];

// --- Protocol Message Type ---
interface ProtocolMessage {
  timestamp: string;
  agent: string;
  type: MessageType;
  message: { to: string | null; content: string };
}

// --- Send a protocol message ---
function sendProtocolMessage(agent: string, type: MessageType, content: string, to: string | null = null): void {
  if (!MESSAGE_TYPES.includes(type)) throw new Error('Invalid message type');
  addAgentMessage(agent, type, { to, content });
}

// --- Read protocol messages (optionally filter by type/agent) ---
function isProtocolMessage(m: unknown): m is ProtocolMessage {
  return (
    typeof m === 'object' &&
    m !== null &&
    'timestamp' in m &&
    'agent' in m &&
    'type' in m &&
    'message' in m &&
    typeof (m as { timestamp?: unknown }).timestamp === 'string' &&
    typeof (m as { agent?: unknown }).agent === 'string' &&
    typeof (m as { type?: unknown }).type === 'string' &&
    typeof (m as { message?: unknown }).message === 'object'
  );
}

export async function readProtocolMessages({ type, agent, to }: { type?: MessageType; agent?: string; to?: string }) {
  const messages = await getAgentMessages();
  return messages
    .filter(isProtocolMessage)
    .filter((msg) => {
      return (type ? msg['type'] === type : true) &&
        (agent ? msg['agent'] === agent : true) &&
        (to ? (msg['message'] as { to: string | null }).to === to : true);
    }) as ProtocolMessage[];
}

export async function getLastNProtocolMessages(n: number) {
  const messages = await getAgentMessages();
  return (messages.filter(isProtocolMessage).slice(-n) as unknown) as ProtocolMessage[];
}

/**
 * Returns the n most recent protocol messages (for context window optimization).
 */
export async function getRecentMessages(n: number): Promise<ProtocolMessage[]> {
  const messages = await getAgentMessages();
  return (messages.filter(isProtocolMessage).slice(-n) as unknown) as ProtocolMessage[];
}

/**
 * Returns a context chunk relevant to protocol messages (for efficient handoff).
 */
export async function getProtocolContextChunk(size: number): Promise<Record<string, unknown>> {
  return await getContextChunk(size);
}

/**
 * Returns an optimized, token-aware handover payload for protocol messages.
 */
export function getOptimizedProtocolHandover(contextArr: unknown[], agentConfig: AgentContextConfig, modelTokenLimit?: number) {
  return getOptimizedHandoverPayload(contextArr, agentConfig, modelTokenLimit);
}

/**
 * Returns a delta snapshot of protocol messages for efficient incremental handoff.
 */
export async function getProtocolDeltaSnapshot(): Promise<Record<string, unknown>> {
  const { getContextChunk } = await import('./contextSnapshotHelper.js');
  // Use a small chunk size for delta, or parameterize as needed
  return getContextChunk(4096); // Example: 4KB delta
}

/**
 * Returns semantic index keywords relevant to protocol messages.
 */
export async function getProtocolSemanticIndex(): Promise<string[]> {
  const { buildSemanticIndex } = await import('./contextSnapshotHelper.js');
  const index = await buildSemanticIndex();
  return Object.keys(index);
}

/**
 * Returns telemetry events related to protocol messages.
 */
export async function getProtocolTelemetryEvents(): Promise<Record<string, string[]>> {
  const { extractTelemetryEventsFromTests } = await import('./contextSnapshotHelper.js');
  return await extractTelemetryEventsFromTests();
}

// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const [cmd, ...args] = process.argv.slice(2);
    if (cmd === 'send') {
      const [agent, type, to, ...content] = args;
      sendProtocolMessage(agent ?? '', (MESSAGE_TYPES.includes(type as MessageType) ? type as MessageType : 'info'), content.join(' '), to !== 'null' ? to : null);
      console.log('Protocol message sent.');
    } else if (cmd === 'read') {
      const [type, agent, to] = args;
      const typeArg = MESSAGE_TYPES.includes(type as MessageType) ? (type as MessageType) : undefined;
      const params: { type?: MessageType; agent?: string; to?: string } = {};
      if (typeArg) params.type = typeArg;
      if (agent) params.agent = agent;
      if (to) params.to = to;
      const msgs = await readProtocolMessages(params);
      console.log(JSON.stringify(msgs, null, 2));
    } else {
      console.log('Usage: pnpm tsx nootropic/agentMessageProtocol.ts send <agent> <type> <to|null> <content>');
      console.log('       pnpm tsx nootropic/agentMessageProtocol.ts read <type|null> <agent|null> <to|null>');
    }
  })();
}

export { sendProtocolMessage, MESSAGE_TYPES };

export function describe() {
  return {
    functions: [
      { name: 'getRecentMessages', signature: '(n: number) => Promise<ProtocolMessage[]>', description: 'Returns the n most recent protocol messages.' },
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

export async function handleProtocolMessage(args: { type?: MessageType; agent?: string; to?: string }) {
  const typeArg = args.type && MESSAGE_TYPES.includes(args.type) ? args.type : undefined;
  const params: { type?: MessageType; agent?: string; to?: string } = {};
  if (typeArg) params.type = typeArg;
  if (args.agent) params.agent = args.agent;
  if (args.to) params.to = args.to;
  await readProtocolMessages(params);
} 