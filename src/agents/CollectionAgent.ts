// @ts-ignore
import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
// @ts-ignore
import type { AgentResult, AgentLogger } from '../schemas/AgentOrchestrationEngineSchema.js';
// @ts-ignore
import { publishEvent, subscribeToTopic } from '../memoryLaneHelper.js';
// @ts-ignore
import { AgentResultSchema } from '../schemas/AgentOrchestrationEngineSchema.js';
import { z } from 'zod';
// @ts-ignore
import type { CapabilityDescribe } from '../capabilities/Capability.js';

const DataCollectorTaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  query: z.string()
});
type DataCollectorTask = z.infer<typeof DataCollectorTaskSchema>;

export class CollectionAgent extends BaseAgent {
  public override readonly name: string;

  static inputSchema = {
    type: 'object',
    properties: {
      task: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The data query or topic to collect.' }
        },
        required: ['query']
      },
      logger: { type: ['function', 'null'] }
    },
    required: ['task']
  };
  static outputSchema = {
    type: 'object',
    properties: {
      output: {
        type: 'object',
        properties: {
          data: { type: 'object' }
        },
        required: ['data']
      },
      success: { type: 'boolean' },
      logs: { type: 'array', items: { type: 'string' } }
    },
    required: ['output', 'success']
  };

  constructor(options: BaseAgentOptions) {
    super(options.profile);
    this.name = options.profile.name ?? 'CollectionAgent';
  }

  override async runTask(task: DataCollectorTask, logger?: AgentLogger): Promise<AgentResult> {
    if (logger) logger({ type: 'start', adapter: 'CollectionAgent', method: 'runTask' });
    const parsed = DataCollectorTaskSchema.safeParse(task);
    if (!parsed.success) {
      return {
        output: null,
        success: false,
        logs: ['Invalid task input', JSON.stringify(parsed.error.issues)]
      };
    }
    const tools = await this.listTools();
    const results: Record<string, unknown> = {};
    const logs: string[] = [];
    for (const tool of tools) {
      try {
        if (typeof tool.run === 'function') {
          results[tool.name] = await tool.run({ query: task.query });
          logs.push(`Tool ${tool.name} succeeded.`);
        }
      } catch (e) {
        logs.push(`Tool ${tool.name} failed: ${e}`);
      }
    }
    const result = { output: { data: results }, success: true, logs };
    const outputParsed = AgentResultSchema.safeParse(result);
    if (!outputParsed.success) {
      throw new Error('Invalid AgentResult: ' + JSON.stringify(outputParsed.error.issues));
    }
    return outputParsed.data;
  }

  override async startEventLoop() {
    const agentId = this.name;
    subscribeToTopic('DataCollectionRequested', async (event: unknown) => {
      if (!event || typeof event !== 'object' || !('agentId' in event)) return;
      const agentIdProp = (event as { agentId?: string }).agentId;
      if (agentIdProp !== agentId) return;
      let maybeTask = undefined;
      if ('payload' in event && event.payload && typeof event.payload === 'object' && 'task' in event.payload) {
        maybeTask = (event.payload as Record<string, unknown>)['task'];
      }
      const parsed = DataCollectorTaskSchema.safeParse(maybeTask);
      if (!parsed.success) {
        await publishEvent({
          type: 'Log',
          agentId,
          timestamp: new Date().toISOString(),
          payload: { level: 'warn', message: 'Received invalid task in DataCollectionRequested event', details: parsed.error.issues }
        });
        return;
      }
      const task = parsed.data;
      const result = await this.runTask(task);
      await publishEvent({
        type: 'DataCollected',
        agentId,
        timestamp: new Date().toISOString(),
        payload: { result }
      });
    });
    subscribeToTopic('TaskAssigned', async (event: unknown) => {
      if (!event || typeof event !== 'object' || !('agentId' in event)) return;
      const agentIdProp = (event as { agentId?: string }).agentId;
      if (agentIdProp !== agentId) return;
      let maybeTask = undefined;
      if ('payload' in event && event.payload && typeof event.payload === 'object' && 'task' in event.payload) {
        maybeTask = (event.payload as Record<string, unknown>)['task'];
      }
      const parsed = DataCollectorTaskSchema.safeParse(maybeTask);
      if (!parsed.success) {
        await publishEvent({
          type: 'Log',
          agentId,
          timestamp: new Date().toISOString(),
          payload: { level: 'warn', message: 'Received invalid task in TaskAssigned event', details: parsed.error.issues }
        });
        return;
      }
      const task = parsed.data;
      const result = await this.runTask(task);
      await publishEvent({
        type: 'TaskCompleted',
        agentId,
        timestamp: new Date().toISOString(),
        payload: { result }
      });
    });
    await publishEvent({
      type: 'Log',
      agentId,
      timestamp: new Date().toISOString(),
      payload: { level: 'info', message: 'CollectionAgent event loop started' }
    });
  }

  static override describe(): CapabilityDescribe {
    return {
      name: 'CollectionAgent',
      description: 'Collects data in response to events. Fully event-driven.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/nootropic/nootropic',
      docsFirst: true,
      aiFriendlyDocs: true,
      supportedEventPatterns: ['market-based', 'supervisor/sub-agent'],
      eventSubscriptions: ['DataCollectionRequested', 'TaskAssigned'],
      eventEmissions: ['DataCollected', 'TaskCompleted', 'Log'],
      usage: 'Instantiate and call startEventLoop() to run as a service.',
      methods: [
        { name: 'runTask', signature: '(task, logger?) => Promise<AgentResult>', description: 'Collects data using available tools.' },
        { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists dynamically discovered tools/plugins.' },
        { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' },
        { name: 'startEventLoop', signature: '() => Promise<void>', description: 'Starts the event-driven runtime loop: subscribes to DataCollectionRequested and TaskAssigned events, processes them, and emits results.' }
      ],
      references: [
        'https://github.com/nootropic/nootropic',
        'https://github.com/nootropic/nootropic/blob/main/README.md'
      ]
    };
  }

  override describe() {
    return (this.constructor as typeof CollectionAgent).describe();
  }

  override async health() {
    return { status: 'ok' as const, timestamp: new Date().toISOString() };
  }

  // TODO: collectionStub is intentionally omitted; add if needed for future extension.
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() {
  return {
    name: 'CollectionAgent',
    description: 'Stub lifecycle hooks for registry compliance.',
    promptTemplates: [
      {
        name: 'Collect Data',
        description: 'Prompt for instructing the agent to collect data from a specified source.',
        template: 'Collect data from the following source: {{source}}.',
        usage: 'Used for data collection workflows.'
      },
      {
        name: 'Filter Data',
        description: 'Prompt for instructing the agent to filter collected data by criteria.',
        template: 'Filter the collected data by the following criteria: {{criteria}}.',
        usage: 'Used for data filtering workflows.'
      },
      {
        name: 'Aggregate Data',
        description: 'Prompt for instructing the agent to aggregate data by a specified method.',
        template: 'Aggregate the data using the following method: {{method}}.',
        usage: 'Used for data aggregation workflows.'
      }
    ]
  };
} 