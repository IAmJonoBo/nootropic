// nootropic: BaseAgent class for modular, extensible agent logic
// Supports dynamic tool discovery, structured output enforcement, and LLM/agent introspection
// @ts-ignore
import { getPlugins } from '../../pluginLoader.js';
// @ts-ignore
import { publishEvent, subscribeToTopic } from '../memoryLaneHelper.js';
import { z } from 'zod';
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
export class BaseAgent {
    profile;
    name;
    context;
    tools = [];
    constructor(profile) {
        this.profile = profile;
        // Validate profile at construction
        // Use zod inline validation since AgentProfileSchema import was removed
        const ProfileSchema = z.object({ name: z.string() });
        const parsed = ProfileSchema.safeParse(profile);
        if (!parsed.success) {
            throw new Error('Invalid AgentProfile: ' + JSON.stringify(parsed.error.issues));
        }
        this.profile = parsed.data;
        this.name = this.profile.name ?? 'BaseAgent';
    }
    /** Dynamically discover available tools/plugins. */
    async listTools() {
        const plugins = await getPlugins();
        return plugins.map((p) => ({
            name: p.name,
            run: typeof p.run === 'function' ? async (...args) => Promise.resolve(p.run(...args)) : async () => undefined,
            ...(p.describe ? { describe: p.describe } : {})
        }));
    }
    /** Run a task using available tools (stub: override in subclasses). */
    async runTask(task, logger) {
        if (logger)
            logger({ type: 'start', adapter: 'BaseAgent', method: 'runTask' });
        // Example: just echo the task for now
        return { output: { echo: task }, success: true, logs: ['BaseAgent ran task (stub)'] };
    }
    /** Get agent context (stub: override in subclasses). */
    async getContext() {
        return this.context ?? { agentId: this.profile.name };
    }
    /** Subscribe to an event topic with a handler. */
    subscribeToEvent(topic, handler) {
        subscribeToTopic(topic, (event) => Promise.resolve(handler(event)));
    }
    /** Publish an event to the event bus. */
    async publishEvent(event) {
        // The event is always constructed as a valid AgentEvent (see buildAgentEvent).
        await publishEvent(event);
    }
    /** Helper to build a valid AgentEvent from partials (adds type, timestamp, etc.). */
    buildAgentEvent(partial) {
        // For known event types, rely on the discriminated union
        if (partial.type && partial.agentId && partial.timestamp && typeof partial.payload !== 'undefined') {
            return partial;
        }
        // Fallback: generic event type
        // Always use payload: {} to guarantee Record<string, unknown>
        const event = {
            type: partial.type,
            agentId: partial.agentId ?? 'unknown',
            timestamp: partial.timestamp ?? new Date().toISOString(),
            payload: {},
            ...(partial && typeof partial["correlationId"] === 'string' ? { correlationId: partial["correlationId"] } : {}),
            ...(partial && typeof partial["topic"] === 'string' ? { topic: partial["topic"] } : {})
        };
        // Type assertion is safe here because payload is always Record<string, unknown>
        // See: https://github.com/microsoft/TypeScript/issues/56106
        return event;
    }
    /** Emit a structured log event for observability. */
    async logEvent(level, message, details) {
        await publishEvent({
            type: 'Log',
            agentId: this.profile?.name ?? 'BaseAgent',
            timestamp: new Date().toISOString(),
            payload: { level, message, ...(details ?? {}) }
        });
    }
    /** Stub for starting an event-driven runtime loop. */
    async startEventLoop() {
        // Subclasses should implement event-driven runtime here.
        throw new Error('startEventLoop() not implemented in BaseAgent. Override in subclass.');
    }
    /** Returns a machine-usable description of the agent capability. */
    static describe() {
        return {
            name: 'BaseAgent',
            description: 'Base class for all nootropic agents. Implements Capability interface and standard lifecycle methods.',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/nootropic/nootropic',
            usage: "import { BaseAgent } from 'nootropic/agents';",
            docsFirst: true,
            aiFriendlyDocs: true,
            methods: [
                { name: 'runTask', signature: '(task: unknown) => Promise<AgentResult>', description: 'Run a task and return the result.' },
                { name: 'init', signature: '() => Promise<void>', description: 'Initialize the agent.' },
                { name: 'shutdown', signature: '() => Promise<void>', description: 'Shutdown the agent.' },
                { name: 'reload', signature: '() => Promise<void>', description: 'Reload the agent.' },
                { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check for the agent.' }
            ],
            schema: {
                runTask: {
                    input: { type: 'unknown', description: 'Task input (problem, code, or prompt)' },
                    output: {
                        type: 'object',
                        properties: {
                            output: { type: 'unknown' },
                            success: { type: 'boolean' },
                            logs: { type: 'array', items: { type: 'string' } }
                        },
                        required: ['output', 'success', 'logs']
                    }
                }
            },
            promptTemplates: [
                {
                    name: 'Agent Task Execution',
                    description: 'Prompt for instructing the agent to execute a task and return the result.',
                    template: 'Execute the following task: {{taskDescription}}. Return the result as a structured object.',
                    usage: 'Used by runTask.'
                },
                {
                    name: 'Context Handoff',
                    description: 'Prompt for instructing the agent to perform a context handoff when the context window is nearly full.',
                    template: 'When the context window is nearly full, generate an optimized handover payload using recent messages, relevant old context, and a summary. Prioritize critical information.',
                    usage: 'Used by getOptimizedHandoverPayload.'
                },
                {
                    name: 'Error Handling',
                    description: 'Prompt for instructing the agent to handle errors gracefully and log them.',
                    template: 'If an error occurs during task execution, log the error and return a structured error object.',
                    usage: 'Used by error handling logic.'
                }
            ],
            references: [
                'https://benhouston3d.com/blog/crafting-readmes-for-ai',
                'https://www.octopipe.com/blog/docs-first-engineering-workflow',
                'https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052',
                'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3'
            ]
        };
    }
    /** Instance describe() for registry compliance. */
    describe() {
        return this.constructor.describe();
    }
    /** Optional: Health/status check for observability and orchestration. */
    async health() {
        // Example: always healthy unless overridden
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    /** Optional: Graceful shutdown/cleanup. */
    async shutdown() {
        // No-op for base; override in subclasses if needed
    }
    /** Optional: Hot-reload logic for dynamic updates. */
    async reload() {
        // No-op for base; override in subclasses if needed
    }
    /** Optional: Event hook for event-driven orchestration. */
    async onEvent() {
        // No-op for base; override in subclasses if needed
    }
    /** Optional: Initialization logic for agent startup. */
    async init() {
        // No-op for base; override in subclasses if needed
    }
    // Example stub method
    async baseAgentStub(_) {
        void _;
        // TODO: Integrate real base agent logic
        return '[BaseAgent] (stub)';
    }
}
export async function init() { }
export async function shutdown() { }
export async function reload() { }
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() {
    return {
        name: 'BaseAgent',
        description: 'Stub lifecycle hooks for registry compliance.',
        license: 'MIT',
        isOpenSource: true,
        provenance: 'https://github.com/nootropic/nootropic',
        usage: "import { BaseAgent } from 'nootropic/agents';",
        docsFirst: true,
        aiFriendlyDocs: true,
        methods: [
            { name: 'runTask', signature: '(task: unknown) => Promise<AgentResult>', description: 'Run a task and return the result.' },
            { name: 'init', signature: '() => Promise<void>', description: 'Initialize the agent.' },
            { name: 'shutdown', signature: '() => Promise<void>', description: 'Shutdown the agent.' },
            { name: 'reload', signature: '() => Promise<void>', description: 'Reload the agent.' },
            { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check for the agent.' }
        ],
        schema: {
            runTask: {
                input: { type: 'unknown', description: 'Task input (problem, code, or prompt)' },
                output: {
                    type: 'object',
                    properties: {
                        output: { type: 'unknown' },
                        success: { type: 'boolean' },
                        logs: { type: 'array', items: { type: 'string' } }
                    },
                    required: ['output', 'success', 'logs']
                }
            }
        },
        promptTemplates: [
            {
                name: 'Agent Task Execution',
                description: 'Prompt for instructing the agent to execute a task and return the result.',
                template: 'Execute the following task: {{taskDescription}}. Return the result as a structured object.',
                usage: 'Used by runTask.'
            },
            {
                name: 'Context Handoff',
                description: 'Prompt for instructing the agent to perform a context handoff when the context window is nearly full.',
                template: 'When the context window is nearly full, generate an optimized handover payload using recent messages, relevant old context, and a summary. Prioritize critical information.',
                usage: 'Used by getOptimizedHandoverPayload.'
            },
            {
                name: 'Error Handling',
                description: 'Prompt for instructing the agent to handle errors gracefully and log them.',
                template: 'If an error occurs during task execution, log the error and return a structured error object.',
                usage: 'Used by error handling logic.'
            }
        ],
        references: [
            'https://benhouston3d.com/blog/crafting-readmes-for-ai',
            'https://www.octopipe.com/blog/docs-first-engineering-workflow',
            'https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052',
            'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3'
        ]
    };
}
