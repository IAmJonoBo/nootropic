import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
import type { AgentResult } from '../types/AgentOrchestrationEngine.js';
import { RAGPipelineUtility } from '../capabilities/RAGPipelineUtility.js';
import { ReasoningLoopUtility } from '../capabilities/ReasoningLoopUtility.js';
import { publishEvent } from '../memoryLaneHelper.js';

/**
 * OrchestratorAgent: Coordinates multi-agent workflows, delegates tasks, and manages dependencies between agents.
 * Implements the Capability interface for unified orchestration and registry.
 */
export class OrchestratorAgent extends BaseAgent {
  public override readonly name: string;
  constructor(options: BaseAgentOptions) {
    super(options.profile);
    this.name = options.profile.name ?? 'OrchestratorAgent';
  }

  // @ts-expect-error TS(4113): This member cannot have an 'override' modifier bec... Remove this comment to see the full error message
  override async runTask(task: unknown): Promise<AgentResult> {
    // Orchestrate RAG, reasoning, and feedback
    // @ts-expect-error TS(2304): Cannot find name 'rag'.
    const rag = new RAGPipelineUtility();
    // @ts-expect-error TS(2304): Cannot find name 'reasoning'.
    const reasoning = new ReasoningLoopUtility();
    // @ts-expect-error TS(2304): Cannot find name 'query'.
    const query = typeof task === 'string' ? task : JSON.stringify(task);
    // @ts-expect-error TS(2304): Cannot find name 'retrievedChunks'.
    const { output: retrievedChunks, logs: ragLogs } = await rag.runRAGPipeline(query);
    // @ts-expect-error TS(2304): Cannot find name 'context'.
    const context = Array.isArray(retrievedChunks) ? retrievedChunks.join('\n') : String(retrievedChunks);
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    const { result, log: reasoningLogs } = await reasoning.runLoop(context, {
      structuredReasoning: true,
      uncertaintyThreshold: 0.4,
      // @ts-expect-error TS(2304): Cannot find name 'async'.
      feedback: async () => 'accept',
      // @ts-expect-error TS(2304): Cannot find name 'llmExplain'.
      llmExplain: async (step) => `LLM explanation for: ${step}`,
      // @ts-expect-error TS(2304): Cannot find name 'LLM'.
      llmRepair: async (step) => `LLM repair for: ${step}`
    });
    let safePayload: Record<string, unknown> = {};
    if (typeof query === 'string') {
      safePayload = { query, result };
    } else {
      safePayload = { query: String(query), result };
    }
    await publishEvent({ type: 'orchestrationComplete', agentId: this.name, timestamp: new Date().toISOString(), payload: safePayload });
    return {
      output: { result },
      success: true,
      logs: ['OrchestratorAgent ran orchestrated workflow', ...ragLogs, ...reasoningLogs]
    };
  }

  static override describe() {
    return {
      name: 'OrchestratorAgent',
      description: 'Coordinates multi-agent workflows, delegates tasks, and manages dependencies between agents.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/nootropic/nootropic',
      docsFirst: true,
      aiFriendlyDocs: true,
      usage: "import { OrchestratorAgent } from 'nootropic/agents';",
      methods: [
        { name: 'runTask', signature: '(task, logger?) => Promise<AgentResult>', description: 'Runs an orchestrated workflow.' },
        { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists available tools/plugins.' },
        { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' },
        { name: 'startEventLoop', signature: '() => Promise<void>', description: 'Starts the event-driven runtime loop.' }
      ],
      schema: {},
      references: [
        'https://github.com/nootropic/nootropic',
        'https://github.com/nootropic/nootropic/blob/main/README.md'
      ],
      bestPractices: [
        'Strict TypeScript',
        'Type-safe event-driven patterns',
        'Automated documentation (TSDoc, TypeDoc, describe())',
        'CI enforcement of docs/code sync'
      ]
    };
  }

  override describe() {
    return (this.constructor as typeof OrchestratorAgent).describe();
  }

  override async health() {
    return { status: 'ok' as const, timestamp: new Date().toISOString() };
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() {
  return {
    name: 'OrchestratorAgent',
    description: 'Stub lifecycle hooks for registry compliance.',
    promptTemplates: [],
    schema: {}
  };
} 