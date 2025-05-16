import type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger } from '../types/AgentOrchestrationEngine.js';
// @ts-expect-error TS(6196): 'HealthStatus' is declared but never used.
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';
// @ts-expect-error TS(2614): Module '"../utils/plugin/adapterUtils.js"' has no ... Remove this comment to see the full error message
import { tryDynamicImport, stubResult, formatError } from '../utils/plugin/adapterUtils.js';

/**
 * CrewAIAdapter: Adapter for CrewAI agent orchestration. Implements both AgentOrchestrationEngine and Capability for registry/discoverability.
 */
// @ts-expect-error TS(2420): Class 'CrewAIAdapter' incorrectly implements inter... Remove this comment to see the full error message
export class CrewAIAdapter implements AgentOrchestrationEngine, Capability {
  public readonly name = 'CrewAIAdapter';

  async runAgentTask(
    // @ts-expect-error TS(6133): 'agentProfile' is declared but its value is never ... Remove this comment to see the full error message
    agentProfile: AgentProfile,
    // @ts-expect-error TS(6133): 'task' is declared but its value is never read.
    task: AgentTask,
    // @ts-expect-error TS(6133): 'context' is declared but its value is never read.
    context?: AgentContext,
    // @ts-expect-error TS(6133): 'logger' is declared but its value is never read.
    logger?: AgentLogger
  // @ts-expect-error TS(2367): This condition will always return 'true' since the... Remove this comment to see the full error message
  ): Promise<AgentResult> {
    // @ts-expect-error TS(2300): Duplicate identifier '(Missing)'.
    if (logger) logger({ type: 'start', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
    // @ts-expect-error TS(2304): Cannot find name 'crewai'.
    const crewai = await tryDynamicImport('crewai/agents');
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!crewai) {
      // @ts-expect-error TS(2304): Cannot find name 'logger'.
      if (logger) logger({ type: 'fallback', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
      return stubResult('CrewAIAdapter', 'crewai');
    }
    try {
      // @ts-expect-error TS(2304): Cannot find name 'initializeCrewAIExecutor'.
      const initializeCrewAIExecutor = (crewai as Record<string, unknown>)['initializeCrewAIExecutor'];
      // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
      if (typeof initializeCrewAIExecutor !== 'function') {
        throw new Error('initializeCrewAIExecutor is not a function');
      }
      // @ts-expect-error TS(2304): Cannot find name 'initializeCrewAIExecutor'.
      const executor = await initializeCrewAIExecutor({
        // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
        agentProfile,
        // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
        context,
      });
      // @ts-expect-error TS(2304): Cannot find name 'task'.
      const output = await executor.run('input' in task && task.input !== undefined ? task.input : task.description);
      // @ts-expect-error TS(2304): Cannot find name 'logger'.
      if (logger) logger({ type: 'success', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context, output } });
      return {
        output,
        success: true,
        logs: ['CrewAI agent executed successfully.'],
      };
    } catch (err) {
      // @ts-expect-error TS(2304): Cannot find name 'logger'.
      if (logger) logger({ type: 'error', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context }, error: err });
      return formatError('CrewAIAdapter', 'runAgentTask', err, { agentProfile, task, context });
    }
  }

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async getAgentContext(agentId: string): Promise<AgentContext> {
    // Return only agentId if AgentContext type does not include memory/state
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    return { agentId };
  }

  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async listAgents(): Promise<AgentProfile[]> {
    return [];
  }

  /**
   * Optional: Initialize the capability (no-op for now).
   */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async init(): Promise<void> {
    // No-op for now
  }

  /**
   * Optional: Hot-reload logic (no-op for now).
   */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async reload(): Promise<void> {
    // No-op for now
  }

  /**
   * Health check for capability status.
   */
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Returns a machine-usable, LLM-friendly description of the adapter capability.
   */
  // @ts-expect-error TS(2693): 'CapabilityDescribe' only refers to a type, but is... Remove this comment to see the full error message
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