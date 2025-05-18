import type { AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger, AgentEvent } from '../schemas/AgentOrchestrationEngineSchema.js';
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
export type AgentTool = {
    name: string;
    run: (...args: unknown[]) => Promise<unknown>;
    describe?: () => unknown;
};
export type BaseAgentOptions = {
    profile: AgentProfile;
    context?: AgentContext;
};
/**
 * BaseAgent: Base class for all nootropic agents.
 *
 * LLM/AI-usage: Implements runtime validation for all agent contracts using Zod schemas. All subclasses must validate inputs/outputs. Extension points for new agent types, tools, and event-driven logic.
 * Extension: Add new agent types, tools, or event-driven logic as needed.
 *
 * Main Methods:
 *   - listTools(): Dynamically discover available tools/plugins
 *   - runTask(task, logger?): Run a task using available tools (stub)
 *   - getContext(): Get agent context (stub)
 *   - startEventLoop(): Stub for starting an event-driven runtime loop
 *   - describe(): Returns a machine-usable description of the agent capability
 */
export declare class BaseAgent implements Capability {
    profile: AgentProfile;
    readonly name: string;
    context?: AgentContext;
    tools: AgentTool[];
    constructor(profile: AgentProfile);
    /** Dynamically discover available tools/plugins. */
    listTools(): Promise<AgentTool[]>;
    /** Run a task using available tools (stub: override in subclasses). */
    runTask(task: AgentTask, logger?: AgentLogger): Promise<AgentResult>;
    /** Get agent context (stub: override in subclasses). */
    getContext(): Promise<AgentContext>;
    /** Subscribe to an event topic with a handler. */
    protected subscribeToEvent(topic: string, handler: (event: unknown) => Promise<void> | void): void;
    /** Publish an event to the event bus. */
    protected publishEvent(event: AgentEvent): Promise<void>;
    /** Helper to build a valid AgentEvent from partials (adds type, timestamp, etc.). */
    protected buildAgentEvent(partial: Partial<AgentEvent> & {
        type: string;
    }): AgentEvent;
    /** Emit a structured log event for observability. */
    protected logEvent(level: 'info' | 'warn' | 'error', message: string, details?: Record<string, unknown>): Promise<void>;
    /** Stub for starting an event-driven runtime loop. */
    startEventLoop(): Promise<void>;
    /** Returns a machine-usable description of the agent capability. */
    static describe(): CapabilityDescribe;
    /** Instance describe() for registry compliance. */
    describe(): CapabilityDescribe;
    /** Optional: Health/status check for observability and orchestration. */
    health(): Promise<HealthStatus>;
    /** Optional: Graceful shutdown/cleanup. */
    shutdown(): Promise<void>;
    /** Optional: Hot-reload logic for dynamic updates. */
    reload(): Promise<void>;
    /** Optional: Event hook for event-driven orchestration. */
    onEvent(): Promise<void>;
    /** Optional: Initialization logic for agent startup. */
    init(): Promise<void>;
    protected baseAgentStub(_: string): Promise<string>;
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
    license: string;
    isOpenSource: boolean;
    provenance: string;
    usage: string;
    docsFirst: boolean;
    aiFriendlyDocs: boolean;
    methods: {
        name: string;
        signature: string;
        description: string;
    }[];
    schema: {
        runTask: {
            input: {
                type: string;
                description: string;
            };
            output: {
                type: string;
                properties: {
                    output: {
                        type: string;
                    };
                    success: {
                        type: string;
                    };
                    logs: {
                        type: string;
                        items: {
                            type: string;
                        };
                    };
                };
                required: string[];
            };
        };
    };
    promptTemplates: {
        name: string;
        description: string;
        template: string;
        usage: string;
    }[];
    references: string[];
}>;
