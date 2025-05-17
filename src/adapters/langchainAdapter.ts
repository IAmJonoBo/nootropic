// @ts-ignore
import type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger } from '../schemas/AgentOrchestrationEngineSchema.js';
// @ts-ignore
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';
// @ts-ignore
import { tryDynamicImport, stubResult, formatError } from '../utils/plugin/adapterUtils.js';

/**
 * LangChainAdapter: Adapter for LangChain agent orchestration. Implements both AgentOrchestrationEngine and Capability for registry/discoverability.
 */
export class LangChainAdapter implements AgentOrchestrationEngine, Capability {
  public readonly name = 'LangChainAdapter';

  async runAgentTask(
    agentProfile: AgentProfile,
    task: AgentTask,
    context?: AgentContext,
    logger?: AgentLogger
  ): Promise<AgentResult> {
    if (logger) logger({ type: 'start', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
    const langchain = await tryDynamicImport('langchain/agents');
    if (!langchain) {
      if (logger) logger({ type: 'fallback', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
      return stubResult('LangChainAdapter', 'langchain');
    }
    try {
      const initializeAgentExecutor = (langchain as Record<string, unknown>)['initializeAgentExecutor'];
      if (typeof initializeAgentExecutor !== 'function') {
        throw new Error('initializeAgentExecutor is not a function');
      }
      const executor = await initializeAgentExecutor({
        agentProfile,
        context,
      });
      // Use task.input if present, otherwise fallback to task.description
      const output = await executor.run('input' in task && task.input !== undefined ? task.input : task.description);
      if (logger) logger({ type: 'success', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context, output } });
      return {
        output,
        success: true,
        logs: ['LangChain agent executed successfully.'],
      };
    } catch (err) {
      if (logger) logger({ type: 'error', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context }, error: err });
      return formatError('LangChainAdapter', 'runAgentTask', err, { agentProfile, task, context });
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
   * NOTE: Keep this in sync with the Capability interface in capabilities/Capability.ts.
   */
  describe(): CapabilityDescribe {
    return {
      name: 'LangChainAdapter',
      description: 'Adapter for LangChain agent orchestration. Supports event-driven agent tasks and context management. Follows 2025 docs-first and LLM-friendly best practices.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/langchain-ai/langchainjs',
      methods: [
        { name: 'runAgentTask', signature: '(agentProfile, task, context?, logger?) => Promise<AgentResult>', description: 'Runs a task using a LangChain agent.' },
        { name: 'getAgentContext', signature: '(agentId: string) => Promise<AgentContext>', description: 'Returns the agent context.' },
        { name: 'listAgents', signature: '() => Promise<AgentProfile[]>', description: 'Lists available agents.' }
      ],
      usage: "import { LangChainAdapter } from 'nootropic/adapters/langchainAdapter'; const adapter = new LangChainAdapter(); await adapter.runAgentTask(profile, task);",
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
        'https://js.langchain.com/docs/',
        'https://github.com/langchain-ai/langchainjs',
        'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3'
      ]
    };
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'langchainAdapter', description: 'Stub lifecycle hooks for registry compliance.' }; } 