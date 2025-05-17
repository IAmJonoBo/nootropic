// @ts-ignore
import type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger } from '../types/AgentOrchestrationEngine.js';
// @ts-ignore
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';
// @ts-ignore
import { tryDynamicImport, stubResult, formatError } from '../utils/plugin/adapterUtils.js';

/**
 * CrewAIAdapter: Adapter for CrewAI agent orchestration. Implements both AgentOrchestrationEngine and Capability for registry/discoverability.
 */
export class CrewAIAdapter implements AgentOrchestrationEngine, Capability {
  public readonly name = 'CrewAIAdapter';

  async runAgentTask(
    agentProfile: AgentProfile,
    task: AgentTask,
    context?: AgentContext,
    logger?: AgentLogger
  ): Promise<AgentResult> {
    if (logger) logger({ type: 'start', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
    const crewai = await tryDynamicImport('crewai/agents');
    if (!crewai) {
      if (logger) logger({ type: 'fallback', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
      return stubResult('CrewAIAdapter', 'crewai');
    }
    try {
      const initializeCrewAIExecutor = (crewai as Record<string, unknown>)['initializeCrewAIExecutor'];
      if (typeof initializeCrewAIExecutor !== 'function') {
        throw new Error('initializeCrewAIExecutor is not a function');
      }
      const executor = await initializeCrewAIExecutor({
        agentProfile,
        context,
      });
      const output = await executor.run('input' in task && task.input !== undefined ? task.input : task.description);
      if (logger) logger({ type: 'success', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context, output } });
      return {
        output,
        success: true,
        logs: ['CrewAI agent executed successfully.'],
      };
    } catch (err) {
      if (logger) logger({ type: 'error', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context }, error: err });
      return formatError('CrewAIAdapter', 'runAgentTask', err, { agentProfile, task, context });
    }
  }

  async getAgentContext(agentId: string): Promise<AgentContext> {
    // Return only agentId if AgentContext type does not include memory/state
    return { agentId };
  }

  async listAgents(): Promise<AgentProfile[]> {
    return [];
  }

  /**
   * Optional: Initialize the capability (no-op for now).
   */
  async init(): Promise<void> {
    // No-op for now
  }

  /**
   * Optional: Hot-reload logic (no-op for now).
   */
  async reload(): Promise<void> {
    // No-op for now
  }

  /**
   * Health check for capability status.
   */
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Returns a machine-usable, LLM-friendly description of the adapter capability.
   */
  describe(): CapabilityDescribe {
    return {
      name: 'CrewAIAdapter',
      description: 'Adapter for CrewAI agent orchestration. Supports event-driven agent tasks and context management. Follows 2025 docs-first and LLM-friendly best practices.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/joaomdmoura/crewAI',
      methods: [
        { name: 'runAgentTask', signature: '(agentProfile, task, context?, logger?) => Promise<AgentResult>', description: 'Runs a task using a CrewAI agent.' },
        { name: 'getAgentContext', signature: '(agentId: string) => Promise<AgentContext>', description: 'Returns the agent context.' },
        { name: 'listAgents', signature: '() => Promise<AgentProfile[]>', description: 'Lists available agents.' }
      ],
      usage: "import { CrewAIAdapter } from 'nootropic/adapters/crewAIAdapter'; const adapter = new CrewAIAdapter(); await adapter.runAgentTask(profile, task);",
      schema: {
        runAgentTask: {
          input: {
            type: 'object',
            properties: {
              agentProfile: { type: 'object' },
              task: { type: 'object' },
              context: { type: ['object', 'null'] },
              logger: { type: ['function', 'null'] }
            },
            required: ['agentProfile', 'task']
          },
          output: { type: 'object', description: 'AgentResult' }
        },
        getAgentContext: {
          input: { type: 'string', description: 'agentId' },
          output: { type: 'object', description: 'AgentContext' }
        },
        listAgents: {
          input: { type: 'null' },
          output: { type: 'array', items: { type: 'object', description: 'AgentProfile' } }
        }
      },
      docsFirst: true,
      aiFriendlyDocs: true,
      references: [
        'https://crewai.com/docs/',
        'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3'
      ]
    };
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'crewAIAdapter', description: 'Stub lifecycle hooks for registry compliance.' }; } 