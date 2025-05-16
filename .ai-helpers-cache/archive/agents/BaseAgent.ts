// nootropic: BaseAgent class for modular, extensible agent logic
// Supports dynamic tool discovery, structured output enforcement, and LLM/agent introspection
import { getPlugins } from '../pluginRegistry.js';
// @ts-expect-error TS(6196): 'AgentTask' is declared but never used.
import type { AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger, AgentEvent } from '../types/AgentOrchestrationEngine.js';
import { publishEvent, subscribeToTopic } from '../memoryLaneHelper.js';
import { z } from 'zod';
// @ts-expect-error TS(6196): 'CapabilityDescribe' is declared but never used.
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';

// AgentTool: Tool interface for agent plugins
export type AgentTool = {
  name: string;
  // @ts-expect-error TS(2693): 'unknown' only refers to a type, but is being used... Remove this comment to see the full error message
  run: (...args: unknown[]) => Promise<unknown>;
  // @ts-expect-error TS(2774): This condition will always return true since this ... Remove this comment to see the full error message
  describe?: () => unknown;
}

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
// @ts-expect-error TS(2420): Class 'BaseAgent' incorrectly implements interface... Remove this comment to see the full error message
export class BaseAgent implements Capability {
  public readonly name: string;
  context?: AgentContext;
  tools: AgentTool[] = [];

  constructor(public profile: AgentProfile) {
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
  async listTools(): Promise<AgentTool[]> {
    // @ts-expect-error TS(2552): Cannot find name 'plugins'. Did you mean 'Plugin'?
    const plugins = await getPlugins();
    // @ts-expect-error TS(2552): Cannot find name 'plugins'. Did you mean 'Plugin'?
    return plugins.map(p => ({
      // @ts-expect-error TS(2304): Cannot find name 'p'.
      name: p.name,
      // @ts-expect-error TS(2304): Cannot find name 'p'.
      run: typeof p.run === 'function' ? async (...args: unknown[]) => Promise.resolve(p.run!(...args)) : async () => undefined,
      // @ts-expect-error TS(2488): Type '{ describe: any; } | {}' must have a '[Symbo... Remove this comment to see the full error message
      ...(p.describe ? { describe: p.describe } : {})
    }));
  }

  /** Run a task using available tools (stub: override in subclasses). */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async runTask(task: AgentTask, logger?: AgentLogger): Promise<AgentResult> {
    // @ts-expect-error TS(2300): Duplicate identifier '(Missing)'.
    if (logger) logger({ type: 'start', adapter: 'BaseAgent', method: 'runTask' });
    // Example: just echo the task for now
    // @ts-expect-error TS(2304): Cannot find name 'task'.
    return { output: { echo: task }, success: true, logs: ['BaseAgent ran task (stub)'] };
  }

  /** Get agent context (stub: override in subclasses). */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async getContext(): Promise<AgentContext> {
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    return this.context ?? { agentId: this.profile.name };
  }

  /** Subscribe to an event topic with a handler. */
  // @ts-expect-error TS(2304): Cannot find name 'subscribeToEvent'.
  protected subscribeToEvent(topic: string, handler: (event: unknown) => Promise<void> | void) {
    // @ts-expect-error TS(2304): Cannot find name 'topic'.
    subscribeToTopic(topic, handler);
  }

  /** Publish an event to the event bus. */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  protected async publishEvent(event: AgentEvent) {
    // The event is always constructed as a valid AgentEvent (see buildAgentEvent).
    // @ts-expect-error TS(2345): Argument of type 'Event | undefined' is not assign... Remove this comment to see the full error message
    await publishEvent(event);
  }

  /** Helper to build a valid AgentEvent from partials (adds type, timestamp, etc.). */
  // @ts-expect-error TS(2304): Cannot find name 'buildAgentEvent'.
  protected buildAgentEvent(partial: Partial<AgentEvent> & { type: string }): AgentEvent {
    // For known event types, rely on the discriminated union
    // @ts-expect-error TS(2304): Cannot find name 'partial'.
    if (partial.type && partial.agentId && partial.timestamp && typeof (partial as { payload?: unknown }).payload !== 'undefined') {
      return partial as AgentEvent;
    }
    // Fallback: generic event type
    // Always use payload: {} to guarantee Record<string, unknown>
    const event = {
      // @ts-expect-error TS(2304): Cannot find name 'partial'.
      type: partial.type,
      // @ts-expect-error TS(2304): Cannot find name 'partial'.
      agentId: partial.agentId ?? 'unknown',
      // @ts-expect-error TS(2304): Cannot find name 'partial'.
      timestamp: partial.timestamp ?? new Date().toISOString(),
      payload: {},
      // @ts-expect-error TS(2304): Cannot find name 'partial'.
      ...(partial && typeof (partial as Record<string, unknown>)["correlationId"] === 'string' ? { correlationId: (partial as Record<string, unknown>)["correlationId"] } : {}),
      // @ts-expect-error TS(2304): Cannot find name 'partial'.
      ...(partial && typeof (partial as Record<string, unknown>)["topic"] === 'string' ? { topic: (partial as Record<string, unknown>)["topic"] } : {})
    };
    // Type assertion is safe here because payload is always Record<string, unknown>
    // See: https://github.com/microsoft/TypeScript/issues/56106
    return event as AgentEvent;
  }

  /** Emit a structured log event for observability. */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  protected async logEvent(level: 'info' | 'warn' | 'error', message: string, details?: Record<string, unknown>) {
    await publishEvent({
      // @ts-expect-error TS(2322): Type '"Log"' is not assignable to type '"TaskAssig... Remove this comment to see the full error message
      type: 'Log',
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      agentId: this.profile?.name ?? 'BaseAgent',
      timestamp: new Date().toISOString(),
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      payload: { level, message, ...(details ?? {}) }
    });
  }

  /** Stub for starting an event-driven runtime loop. */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async startEventLoop(): Promise<void> {
    // Subclasses should implement event-driven runtime here.
    throw new Error('startEventLoop() not implemented in BaseAgent. Override in subclass.');
  }

  /** Returns a machine-usable description of the agent capability. */
  static describe(): CapabilityDescribe {
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
  // @ts-expect-error TS(2693): 'CapabilityDescribe' only refers to a type, but is... Remove this comment to see the full error message
  describe(): CapabilityDescribe {
    return (this.constructor as typeof BaseAgent).describe();
  }

  /** Optional: Health/status check for observability and orchestration. */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    // Example: always healthy unless overridden
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Optional: Graceful shutdown/cleanup. */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async shutdown(): Promise<void> {
    // No-op for base; override in subclasses if needed
  }

  /** Optional: Hot-reload logic for dynamic updates. */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async reload(): Promise<void> {
    // No-op for base; override in subclasses if needed
  }

  /** Optional: Event hook for event-driven orchestration. */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async onEvent(): Promise<void> {
    // No-op for base; override in subclasses if needed
  }

  /** Optional: Initialization logic for agent startup. */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async init(): Promise<void> {
    // No-op for base; override in subclasses if needed
  }

  // Example stub method
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  protected async baseAgentStub(_: string): Promise<string> {
    // @ts-expect-error TS(2304): Cannot find name '_'.
    void _;
    // TODO: Integrate real base agent logic
    return '[BaseAgent] (stub)';
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
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