import type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger } from '../types/AgentOrchestrationEngine.js';
// @ts-expect-error TS(6196): 'HealthStatus' is declared but never used.
import type { Capability, HealthStatus, CapabilityDescribe } from '../capabilities/Capability.js';
// @ts-expect-error TS(2614): Module '"../utils/plugin/adapterUtils.js"' has no ... Remove this comment to see the full error message
import { tryDynamicImport, stubResult, formatError } from '../utils/plugin/adapterUtils.js';

/**
 * LangChainAdapter: Adapter for LangChain agent orchestration. Implements both AgentOrchestrationEngine and Capability for registry/discoverability.
 */
// @ts-expect-error TS(2420): Class 'LangChainAdapter' incorrectly implements in... Remove this comment to see the full error message
export class LangChainAdapter implements AgentOrchestrationEngine, Capability {
  public readonly name = 'LangChainAdapter';

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
    if (logger) logger({ type: 'start', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
    // @ts-expect-error TS(2304): Cannot find name 'langchain'.
    const langchain = await tryDynamicImport('langchain/agents');
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!langchain) {
      // @ts-expect-error TS(2304): Cannot find name 'logger'.
      if (logger) logger({ type: 'fallback', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
      return stubResult('LangChainAdapter', 'langchain');
    }
    try {
      // @ts-expect-error TS(2304): Cannot find name 'initializeAgentExecutor'.
      const initializeAgentExecutor = (langchain as Record<string, unknown>)['initializeAgentExecutor'];
      // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
      if (typeof initializeAgentExecutor !== 'function') {
        throw new Error('initializeAgentExecutor is not a function');
      }
      // @ts-expect-error TS(2304): Cannot find name 'initializeAgentExecutor'.
      const executor = await initializeAgentExecutor({
        // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
        agentProfile,
        // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
        context,
      });
      // Use task.input if present, otherwise fallback to task.description
      // @ts-expect-error TS(2304): Cannot find name 'task'.
      const output = await executor.run('input' in task && task.input !== undefined ? task.input : task.description);
      // @ts-expect-error TS(2304): Cannot find name 'logger'.
      if (logger) logger({ type: 'success', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context, output } });
      return {
        output,
        success: true,
        logs: ['LangChain agent executed successfully.'],
      };
    } catch (err) {
      // @ts-expect-error TS(2304): Cannot find name 'logger'.
      if (logger) logger({ type: 'error', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context }, error: err });
      return formatError('LangChainAdapter', 'runAgentTask', err, { agentProfile, task, context });
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
   * NOTE: Keep this in sync with the Capability interface in capabilities/Capability.ts.
   */
  // @ts-expect-error TS(2693): 'CapabilityDescribe' only refers to a type, but is... Remove this comment to see the full error message
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