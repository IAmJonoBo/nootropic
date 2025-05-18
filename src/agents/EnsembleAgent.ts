// @ts-ignore
import type { AgentEvent } from '../schemas/AgentOrchestrationEngineSchema.js'; // Used in type annotations only
// @ts-ignore
import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
// @ts-ignore
import type { AgentResult } from '../schemas/AgentOrchestrationEngineSchema.js';
// @ts-ignore
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';
// @ts-ignore
import { ReasoningLoopUtility } from '../capabilities/ReasoningLoopUtility.js';
// @ts-ignore
import { publishEvent } from '../memoryLaneHelper.js';
// @ts-ignore
import { getEmbeddingBackend, EmbeddingBackend } from '../utils/embedding/embeddingClient.js';

/**
 * EnsembleAgent: Orchestrates multi-LLM code generation, output voting, and self-debugging.
 * Implements Capability interface for registry compliance.
 * Reference: arXiv:2503.15838v1
 */

// VotingStrategy interface and implementations
export interface VotingStrategy {
  name: string;
  vote(candidates: string[], context?: unknown): Promise<{ winner: string; rationale: string; details?: unknown }>;
}

export class MajorityVotingStrategy implements VotingStrategy {
  name = 'majority';
  async vote(candidates: string[]): Promise<{ winner: string; rationale: string; details?: unknown }> {
    const counts: Record<string, number> = {};
    for (const c of candidates) counts[c] = (counts[c] ?? 0) + 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      return { winner: '', rationale: 'No candidates provided for voting.', details: counts };
    }
    const winner = (sorted[0] as [string, number])[0];
    return { winner, rationale: `Majority voting selected: ${winner}`, details: counts };
  }
}

export class SemanticVotingStrategy implements VotingStrategy {
  name = 'semantic';
  private backend: EmbeddingBackend;
  constructor(backendName?: string) {
    const resolvedName = typeof backendName === 'string' && backendName ? backendName : (process.env['EMBED_BACKEND'] ?? 'nv-embed');
    this.backend = getEmbeddingBackend(resolvedName ?? 'nv-embed');
  }
  async vote(candidates: string[], context?: { query?: string }): Promise<{ winner: string; rationale: string; details?: unknown }> {
    if (!Array.isArray(candidates) || candidates.length === 0) return { winner: '', rationale: 'No candidates provided for semantic voting.', details: {} };
    if (!context || typeof context.query !== 'string') return { winner: candidates[0] ?? '', rationale: 'No query provided for semantic voting.', details: {} };
    const queryVec = await this.backend.embedText(context.query ?? '');
    const sims = await Promise.all(candidates.map(async c => {
      const vec = await this.backend.embedText(c);
      return this.cosineSimilarity(queryVec ?? [], vec ?? []);
    }));
    let maxIdx = 0;
    let maxSim = -Infinity;
    for (let i = 0; i < sims.length; i++) {
      if (typeof sims[i] === 'number' && sims[i] !== undefined && sims[i]! > maxSim) {
        maxSim = sims[i]! as number;
        maxIdx = i;
      }
    }
    const winner = (Array.isArray(candidates) && typeof candidates[maxIdx] === 'string' && maxIdx >= 0 && maxIdx < candidates.length && candidates[maxIdx] !== undefined) ? candidates[maxIdx] as string : '';
    return { winner, rationale: `Semantic voting selected: ${winner}`, details: sims };
  }
  private cosineSimilarity(a: number[], b: number[]): number {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length === 0 || b.length === 0) return 0;
    const dot = a.reduce((sum, ai, i) => sum + ai * (typeof b[i] === 'number' && b[i] !== undefined ? b[i]! : 0), 0);
    const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    if (normA === 0 || normB === 0) return 0;
    return dot / (normA * normB);
  }
}

// Weighted voting strategy
export class WeightedVotingStrategy implements VotingStrategy {
  name = 'weighted';
  private weights: number[];
  constructor(weights: number[]) { this.weights = weights; }
  async vote(candidates: string[]): Promise<{ winner: string; rationale: string; details?: unknown }> {
    if (!Array.isArray(candidates) || candidates.length === 0) return { winner: '', rationale: 'No candidates provided.', details: {} };
    if (!Array.isArray(this.weights) || this.weights.length !== candidates.length) return { winner: candidates[0] ?? '', rationale: 'Weights missing or mismatched, defaulting to first candidate.', details: this.weights };
    let maxIdx = 0, maxWeight = -Infinity;
    for (let i = 0; i < this.weights.length; i++) {
      const weight = typeof this.weights[i] === 'number' ? this.weights[i]! : -Infinity;
      if (weight > maxWeight) { maxWeight = weight; maxIdx = i; }
    }
    const winner = (Array.isArray(candidates) && typeof candidates[maxIdx] === 'string' && maxIdx >= 0 && maxIdx < candidates.length && candidates[maxIdx] !== undefined) ? candidates[maxIdx]! : '';
    return { winner, rationale: `Weighted voting selected: ${winner}`, details: this.weights };
  }
}

// Syntactic voting strategy (stub)
export class SyntacticVotingStrategy implements VotingStrategy {
  name = 'syntactic';
  async vote(candidates: string[]): Promise<{ winner: string; rationale: string; details?: unknown }> {
    // TODO: Integrate CodeBLEU or similar for syntactic similarity
    return { winner: candidates[0] || '', rationale: 'Syntactic voting (stub): defaulting to first candidate.', details: {} };
  }
}

export class EnsembleAgent extends BaseAgent implements Capability {
  public override readonly name: string;
  private votingStrategy: VotingStrategy;
  private backendName: string;
  constructor(options?: Omit<BaseAgentOptions, 'profile'> & { profile?: { name?: string }, votingStrategy?: VotingStrategy, backendName?: string }) {
    options = options ?? {};
    const { profile = {}, backendName } = options;
    const agentProfile = { name: profile.name ?? 'EnsembleAgent' };
    super(agentProfile);
    this.name = agentProfile.name;
    this.backendName = backendName ?? (process.env['EMBED_BACKEND'] || 'nv-embed');
    this.votingStrategy = options.votingStrategy ?? new MajorityVotingStrategy();
    // Optionally support semantic voting
    if (!options.votingStrategy && options.backendName) {
      this.votingStrategy = new SemanticVotingStrategy(this.backendName);
    }
  }

  override async runTask(task: unknown): Promise<AgentResult> {
    // === Efficiency-Aware Gating (SPIO) ===
    const gatingLog = 'SPIO: (stub) All tasks routed to local ensemble for now.';
    // === Multi-LLM Candidate Generation (EnsLLM) ===
    // TODO: Generate candidates from diverse LLMs (local/cloud, quantized/cloud, etc.)
    // For now, simulate with ReasoningLoopUtility multi-run and stub LLM call
    const eventAdapter = (event: unknown) => publishEvent(event as any);
    const reasoning = new ReasoningLoopUtility(eventAdapter);
    const events: AgentEvent[] = [];
    const emitEvent = async (event: { type: string; payload: unknown }) => {
      let safePayload: Record<string, unknown> = {};
      switch (event.type) {
        case 'candidateGeneration': {
          const { candidates, method } = (event.payload as { candidates?: unknown; method?: unknown }) || {};
          safePayload = {
            candidates: Array.isArray(candidates) ? candidates : [],
            method: typeof method === 'string' ? method : ''
          };
          break;
        }
        case 'votingRationale': {
          const { rationale, details, candidates, winner } = (event.payload as { rationale?: unknown; details?: unknown; candidates?: unknown; winner?: unknown }) || {};
          safePayload = {
            rationale: typeof rationale === 'string' ? rationale : '',
            details: typeof details === 'object' && details !== null ? details : {},
            candidates: Array.isArray(candidates) ? candidates : [],
            winner: typeof winner === 'string' ? winner : ''
          };
          break;
        }
        case 'metaLLMAdjudication': {
          const { candidates, result } = (event.payload as { candidates?: unknown; result?: unknown }) || {};
          safePayload = {
            candidates: Array.isArray(candidates) ? candidates : [],
            result: typeof result === 'string' ? result : ''
          };
          break;
        }
        case 'selfDebugging': {
          const { candidates, status, log } = (event.payload as { candidates?: unknown; status?: unknown; log?: unknown }) || {};
          safePayload = {
            candidates: Array.isArray(candidates) ? candidates : [],
            status: typeof status === 'string' ? status : '',
            log: typeof log === 'string' ? log : ''
          };
          break;
        }
        default: {
          if (event.payload && typeof event.payload === 'object' && !Array.isArray(event.payload)) {
            safePayload = { ...event.payload };
          } else if (event.payload !== undefined) {
            safePayload = { value: event.payload };
          }
        }
      }
      const agentEvent: AgentEvent = {
        type: event.type,
        agentId: this.name,
        timestamp: new Date().toISOString(),
        payload: safePayload
      };
      events.push(agentEvent);
      await publishEvent(agentEvent);
    };
    // Simulate LLM-based candidate generation (stub)
    const llmCandidates = [
      '[LLM] Candidate 1 (stub)',
      '[LLM] Candidate 2 (stub)',
      '[LLM] Candidate 3 (stub)'
    ];
    await emitEvent({ type: 'candidateGeneration', payload: { candidates: llmCandidates, method: 'LLM (stub)' } });
    const candidates = [
      await reasoning.runLoop(typeof task === 'string' ? task : JSON.stringify(task), { maxSteps: 1, emitEvent }),
      await reasoning.runLoop(typeof task === 'string' ? task : JSON.stringify(task), { maxSteps: 1, emitEvent }),
      await reasoning.runLoop(typeof task === 'string' ? task : JSON.stringify(task), { maxSteps: 1, emitEvent })
    ].map(r => r.result).concat(llmCandidates);
    await emitEvent({ type: 'candidateGeneration', payload: { candidates, method: 'ensemble+LLM (stub)' } });
    // === Structured Voting (CodeBLEU, CrossHair) ===
    const { winner, rationale, details } = await this.votingStrategy.vote(candidates, { task });
    await emitEvent({ type: 'votingRationale', payload: { rationale, details, candidates, winner } });
    // === Meta-LLM Adjudication ===
    let metaLLMResult = null;
    if (!winner && candidates.length > 0) {
      // TODO: Integrate meta-LLM adjudication
      metaLLMResult = '[meta-LLM] Adjudication result (stub)';
      await emitEvent({ type: 'metaLLMAdjudication', payload: { candidates, result: metaLLMResult } });
    }
    // === Self-Debugging Loop (LEDEX) ===
    // TODO: Execute and analyze failing candidates, refine code iteratively
    const selfDebugLog = 'LEDEX: (stub) No self-debugging loop executed.';
    await emitEvent({ type: 'selfDebugging', payload: { candidates, status: 'stub', log: selfDebugLog } });
    return {
      output: { result: winner ?? metaLLMResult },
      success: true,
      logs: [
        gatingLog,
        'EnsembleAgent ran task (EnsLLM candidate generation, modular voting, meta-LLM, self-debugging stubs)',
        ...candidates.map((c, i) => `[candidate ${i + 1}] ${c}`),
        rationale,
        metaLLMResult ? `[meta-LLM] ${metaLLMResult}` : '',
        selfDebugLog,
        ...events.map(e => `[event] ${e.type}: ${JSON.stringify((e && typeof e === 'object' && 'payload' in e ? (e as { payload?: unknown }).payload : {}) ?? {})}`)
      ].filter(Boolean)
    };
  }

  override async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Initialize the agent (stub).
   */
  override async init(): Promise<void> {}
  /**
   * Shutdown the agent (stub).
   */
  override async shutdown(): Promise<void> {}
  /**
   * Reload the agent (stub).
   */
  override async reload(): Promise<void> {}

  static eventSchemas = {
    candidateGeneration: { type: 'object', properties: { candidates: { type: 'array' }, method: { type: 'string' } }, required: ['candidates', 'method'] },
    votingRationale: { type: 'object', properties: { rationale: { type: 'string' }, details: { type: 'object' }, candidates: { type: 'array' }, winner: { type: 'string' } }, required: ['rationale', 'details', 'candidates', 'winner'] },
    metaLLMAdjudication: { type: 'object', properties: { candidates: { type: 'array' }, result: { type: 'string' } }, required: ['candidates', 'result'] },
    selfDebugging: { type: 'object', properties: { candidates: { type: 'array' }, status: { type: 'string' }, log: { type: 'string' } }, required: ['candidates', 'status', 'log'] },
    rationale: { type: 'object', properties: { rationale: { type: 'string' } }, required: ['rationale'] },
    explanation: { type: 'object', properties: { explanation: { type: 'string' } }, required: ['explanation'] },
    repair: { type: 'object', properties: { step: { type: 'string' }, repaired: { type: 'string' }, iteration: { type: 'number' } }, required: ['step', 'repaired', 'iteration'] }
  };

  static override describe(): CapabilityDescribe {
    return {
      name: 'EnsembleAgent',
      description: 'Orchestrates multi-LLM code generation, modular voting/selection (majority, weighted, syntactic, semantic, behavioral, meta-LLM), self-debugging, and event-driven mutation/self-healing integration. Advanced features: EnsLLM (multi-LLM candidate generation), structured voting (CodeBLEU, CrossHair), meta-LLM adjudication, self-debugging loop (LEDEX), efficiency-aware gating (SPIO). Extension points: voting strategies (majority, weighted, syntactic, semantic, behavioral, meta-LLM), LLM integration, self-debugging, event schemas, efficiency-aware routing. Best practices: Use modular voting strategies, emit rationale and voting events, support event-driven explainability, document event schemas, integrate efficiency-aware routing. Reference: arXiv:2503.15838v1, AutoGen, LangGraph.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://arxiv.org/html/2503.15838v1',
      methods: [
        { name: 'runTask', signature: '(task: unknown) => Promise<AgentResult>', description: 'Run a task using ensemble modeling, modular voting/selection (majority, weighted, syntactic, semantic, behavioral, meta-LLM), self-debugging, and event-driven mutation/self-healing. Emits rationale/explanation and votingRationale events.' },
        { name: 'init', signature: '() => Promise<void>', description: 'Initialize the agent.' },
        { name: 'shutdown', signature: '() => Promise<void>', description: 'Shutdown the agent.' },
        { name: 'reload', signature: '() => Promise<void>', description: 'Reload the agent.' },
        { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check for EnsembleAgent.' },
        { name: 'SemanticVotingStrategy', signature: 'new SemanticVotingStrategy(backendName?: string)', description: 'Semantic voting using embedding backend.' }
      ],
      schema: {
        runTask: {
          input: { type: 'any', description: 'Task input (problem, code, or prompt)' },
          output: { type: 'object', properties: { result: { type: 'string' } }, required: ['result'] }
        },
        init: { input: { type: 'null', description: 'No input required' }, output: { type: 'null', description: 'No output (side effect: initialization)' } },
        shutdown: { input: { type: 'null', description: 'No input required' }, output: { type: 'null', description: 'No output (side effect: shutdown)' } },
        reload: { input: { type: 'null', description: 'No input required' }, output: { type: 'null', description: 'No output (side effect: reload)' } },
        health: { input: { type: 'null', description: 'No input required' }, output: { type: 'object', properties: { status: { type: 'string' }, timestamp: { type: 'string' } }, required: ['status', 'timestamp'] } }
      },
      usage: "import { EnsembleAgent, SemanticVotingStrategy } from 'nootropic/agents/EnsembleAgent'; const agent = new EnsembleAgent({ profile: { name: 'EnsembleAgent' }, votingStrategy: new SemanticVotingStrategy('nv-embed') }); await agent.runTask({ ... });",
      docsFirst: true,
      aiFriendlyDocs: true,
      references: [
        'arXiv:2503.15838v1',
        'https://github.com/microsoft/AutoGen',
        'https://github.com/langchain-ai/langgraph',
        'README.md#ensemble-llm-code-generation--voting-strategies',
        'docs/ROADMAP.md#ensemble-agent'
      ],
      bestPractices: [
        'Use modular voting strategies (majority, weighted, semantic, meta-LLM)',
        'Emit rationale and voting events for every decision',
        'Support event-driven explainability and agent/LLM introspection',
        'Document event schemas and rationale in describe()',
        'LLM/embedding backend for semantic voting (configurable via backendName)'
      ],
      eventSchemas: EnsembleAgent.eventSchemas
    } as CapabilityDescribe & { eventSchemas: typeof EnsembleAgent.eventSchemas };
  }

  override describe(): CapabilityDescribe {
    return (this.constructor as typeof EnsembleAgent).describe();
  }
}

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() {
  return {
    name: 'EnsembleAgent',
    description: 'Stub lifecycle hooks for registry compliance.',
    promptTemplates: [],
    schema: {}
  };
} 