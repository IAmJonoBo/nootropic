import { AgentContextConfig } from './contextSnapshotHelper.js';
declare const MESSAGE_TYPES: readonly ["proposal", "counter", "accept", "reject", "info"];
type MessageType = typeof MESSAGE_TYPES[number];
interface ProtocolMessage {
    timestamp: string;
    agent: string;
    type: MessageType;
    message: {
        to: string | null;
        content: string;
    };
}
declare function sendProtocolMessage(agent: string, type: MessageType, content: string, to?: string | null): void;
export declare function readProtocolMessages(): Promise<ProtocolMessage[]>;
export declare function getLastNProtocolMessages(n: number): Promise<ProtocolMessage[]>;
/**
 * Returns the n most recent protocol messages (for context window optimization).
 */
export declare function getRecentMessages(): Promise<ProtocolMessage[]>;
/**
 * Returns a context chunk relevant to protocol messages (for efficient handoff).
 */
export declare function getProtocolContextChunk(size: number): Promise<Record<string, unknown>>;
/**
 * Returns an optimized, token-aware handover payload for protocol messages.
 */
export declare function getOptimizedProtocolHandover(contextArr: unknown[], agentConfig: AgentContextConfig, modelTokenLimit?: number): {
    payload: unknown[];
    log: unknown;
};
/**
 * Returns a delta snapshot of protocol messages for efficient incremental handoff.
 */
export declare function getProtocolDeltaSnapshot(): Promise<Record<string, unknown>>;
/**
 * Returns semantic index keywords relevant to protocol messages.
 */
export declare function getProtocolSemanticIndex(): Promise<string[]>;
/**
 * Returns telemetry events related to protocol messages.
 */
export declare function getProtocolTelemetryEvents(): Promise<Record<string, string[]>>;
export { sendProtocolMessage, MESSAGE_TYPES };
export declare function describe(): {
    functions: {
        name: string;
        signature: string;
        description: string;
    }[];
    schema: {
        getRecentMessages: {
            input: {
                type: string;
                properties: {
                    n: {
                        type: string;
                        description: string;
                    };
                };
                required: string[];
            };
            output: {
                type: string;
                items: {
                    type: string;
                    description: string;
                };
            };
        };
    };
};
export declare function handleProtocolMessage(args: {
    type?: MessageType;
    agent?: string;
    to?: string;
}): Promise<void>;
