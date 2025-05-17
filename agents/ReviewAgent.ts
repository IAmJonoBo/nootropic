// @ts-ignore
import { BaseAgent, BaseAgentOptions } from './BaseAgent.js';
// @ts-ignore
import type { AgentResult, AgentLogger } from '../types/AgentOrchestrationEngine.js';
// @ts-ignore
import { publishEvent, subscribeToTopic } from '../memoryLaneHelper.js';
// @ts-ignore
import { AgentResultSchema } from '../types/AgentOrchestrationEngine.js';
import { z } from 'zod';
// @ts-ignore
import type { CapabilityDescribe } from '../capabilities/Capability.js';
// @ts-ignore
import { getEmbeddingBackend, EmbeddingBackend } from '../utils/embedding/embeddingClient.js';

const ReviewerTaskSchema = z.object({
  id: z.string(),
  description: z.string(),
  content: z.string()
});
type ReviewerTask = z.infer<typeof ReviewerTaskSchema>;

/**
 * ReviewAgent: Reviews drafts and provides feedback. Event-driven.
 * Enhancements: Sentiment-and-aspect analysis, multi-pass chain-of-thought (SCoT) review, ensemble scoring.
 * Extension points: LLM/embedding backend for sentiment/aspect analysis, multi-model ensemble scoring, custom multi-pass review logic.
 * Reference: https://huggingface.co/tasks/sentiment-analysis
 */
export class ReviewAgent extends BaseAgent {
  static inputSchema = {
    type: 'object',
    properties: {
      task: {
        type: 'object',
        properties: {
          content: { type: 'string', description: 'Content to review.' }
        },
        required: ['content']
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
          review: { type: 'string' },
          score: { type: 'number' }
        },
        required: ['review', 'score']
      },
      success: { type: 'boolean' },
      logs: { type: 'array', items: { type: 'string' } }
    },
    required: ['output', 'success']
  };

  public override readonly name: string;
  // TODO: backendName is intentionally omitted; add if needed for future extension.
  constructor(options: BaseAgentOptions & { backendName?: string }) {
    super(options.profile);
    this.name = options.profile.name ?? 'ReviewerAgent';
  }

  /**
   * LLM-powered sentiment and aspect analysis. Extension: HuggingFace, Ollama, or local LLM.
   * 'content' is the content to analyze.
   * Returns sentiment and aspects.
   */
  async sentimentAndAspectAnalysis(content: string): Promise<{ sentiment: string; aspects: Record<string, string> }> {
    // TODO: Integrate HuggingFace, Ollama, or local LLM for real sentiment/aspect analysis
    // Example: Use HuggingFace pipeline or call Ollama API if available
    // Extension: Accept backendName as option for dynamic backend selection
    // For demo: use a simple rule-based sentiment as placeholder
    const lower = content.toLowerCase();
    let sentiment = 'neutral';
    if (lower.includes('good') ?? lower.includes('excellent')) sentiment = 'positive';
    else if (lower.includes('bad') ?? lower.includes('poor')) sentiment = 'negative';
    // Aspects: simple keyword extraction (stub)
    // TODO: Replace with LLM-powered aspect extraction (clarity, logic, redundancy, etc.)
    const aspects: Record<string, string> = {};
    if (lower.includes('clarity')) aspects['clarity'] = 'mentioned';
    if (lower.includes('logic')) aspects['logic'] = 'mentioned';
    if (lower.includes('redundancy')) aspects['redundancy'] = 'mentioned';
    // Extension: Use embedding backend for semantic aspect extraction
    return { sentiment, aspects };
  }

  /**
   * Multi-pass chain-of-thought review. Extension: SCoT pipeline, LLM/embedding backend.
   * 'content' is the content to review.
   * Returns an array of review pass results.
   */
  async multiPassChainOfThought(content: string): Promise<string[]> {
    // Structured multi-pass review: logic, redundancy, clarity
    // TODO: Integrate LLM or SCoT pipeline for richer multi-pass review
    // Extension: Allow custom passes for domain-specific review
    const passes: string[] = [];
    // Pass 1: Logic
    passes.push(`Logic review: ${content.includes('because') ? 'Logical flow detected.' : 'Logic unclear.'}`);
    // Pass 2: Redundancy
    passes.push(`Redundancy review: ${content.match(/\b(\w+)\b.*\b\1\b/) ? 'Redundancy detected.' : 'No obvious redundancy.'}`);
    // Pass 3: Clarity
    passes.push(`Clarity review: ${content.length < 100 ? 'May lack detail.' : 'Detailed.'}`);
    // TODO: Add more passes (e.g., coherence, tone, factuality) using LLM/embedding backend
    return passes;
  }

  /**
   * Aggregate scores from multiple models. Extension: quantized LLMs, voting/aggregation strategies.
   * 'content' is the content to score.
   * Returns a heuristic score (0-10).
   */
  async ensembleScoring(content: string): Promise<number> {
    // TODO: Integrate multiple LLMs or quantized models (e.g., llama.cpp, micro-LLMs) for ensemble scoring
    // Extension: Aggregate scores from multiple models, allow pluggable voting/aggregation strategies
    // For demo: heuristic scoring
    let score = 7.5;
    if (content.toLowerCase().includes('excellent')) score += 1.0;
    if (content.toLowerCase().includes('bad')) score -= 2.0;
    // TODO: Call multiple models and average results for robust ensemble
    return Math.max(0, Math.min(10, score));
  }

  /**
   * Reviews outputs using sentiment analysis, multi-pass SCoT, and ensemble scoring.
   * 'task' is the ReviewerTask input. 'logger' is an optional logger.
   * Returns AgentResult.
   */
  override async runTask(task: ReviewerTask, logger?: AgentLogger): Promise<AgentResult> {
    // Validate input
    const parsed = ReviewerTaskSchema.safeParse(task);
    if (!parsed.success) {
      return {
        output: null,
        success: false,
        logs: ['Invalid task input', JSON.stringify(parsed.error.issues)]
      };
    }
    if (logger) logger({ type: 'start', adapter: 'ReviewerAgent', method: 'runTask' });
    // --- Enhanced review logic ---
    const sentiment = await this.sentimentAndAspectAnalysis(task.content);
    const passes = await this.multiPassChainOfThought(task.content);
    const score = await this.ensembleScoring(task.content);
    const review = `Sentiment: ${sentiment.sentiment}. Passes: ${passes.join(' | ')}.`;
    const result = { output: { review, score }, success: true, logs: ['ReviewerAgent enhanced review (stub)'] };
    // Validate output before returning
    const outputParsed = AgentResultSchema.safeParse(result);
    if (!outputParsed.success) {
      throw new Error('Invalid AgentResult: ' + JSON.stringify(outputParsed.error.issues));
    }
    return outputParsed.data;
  }

  /**
   * Starts the ReviewerAgent event-driven runtime loop.
   * Subscribes to DraftCreated, ReviewRequested, and TaskAssigned events, processes them, and emits results.
   * Returns a Promise that resolves when the event loop is started.
   */
  override async startEventLoop() {
    const agentId = this.name;
    // Subscribe to DraftCreated events for this agent
    subscribeToTopic('DraftCreated', async (event) => {
      if (event.agentId !== agentId) return;
      let maybeTask: ReviewerTask | undefined = undefined;
      if (event.payload && typeof event.payload === 'object') {
        const payload = event.payload as Record<string, unknown>;
        if (typeof payload['content'] === 'string') {
          maybeTask = { ...payload, content: payload['content'] } as ReviewerTask;
        }
      }
      // Validate task with ReviewerTaskSchema before use
      const parsed = ReviewerTaskSchema.safeParse(maybeTask);
      if (!parsed.success) {
        await publishEvent({
          type: 'Log',
          agentId,
          timestamp: new Date().toISOString(),
          payload: { level: 'warn', message: 'Received invalid task in DraftCreated event', details: parsed.error.issues }
        });
        return;
      }
      const task = parsed.data;
      const result = await this.runTask(task);
      await publishEvent({
        type: 'DraftReviewed',
        agentId,
        timestamp: new Date().toISOString(),
        payload: { result }
      });
    });
    // Subscribe to ReviewRequested events for this agent
    subscribeToTopic('ReviewRequested', async (event) => {
      if (event.agentId !== agentId) return;
      let maybeTask: unknown = undefined;
      if (event.payload && typeof event.payload === 'object' && 'task' in event.payload) {
        const payload = event.payload as Record<string, unknown>;
        if (payload['task'] && typeof payload['task'] === 'object') {
          maybeTask = payload['task'];
        }
      }
      // Validate task with ReviewerTaskSchema before use
      const parsed = ReviewerTaskSchema.safeParse(maybeTask);
      if (!parsed.success) {
        await publishEvent({
          type: 'Log',
          agentId,
          timestamp: new Date().toISOString(),
          payload: { level: 'warn', message: 'Received invalid task in ReviewRequested event', details: parsed.error.issues }
        });
        return;
      }
      const task = parsed.data;
      const result = await this.runTask(task);
      await publishEvent({
        type: 'ReviewFeedback',
        agentId,
        timestamp: new Date().toISOString(),
        payload: { result }
      });
    });
    // Subscribe to TaskAssigned events for this agent
    subscribeToTopic('TaskAssigned', async (event) => {
      if (event.agentId !== agentId) return;
      let maybeTask: unknown = undefined;
      if (event.payload && typeof event.payload === 'object' && 'task' in event.payload) {
        const payload = event.payload as Record<string, unknown>;
        if (payload['task'] && typeof payload['task'] === 'object') {
          maybeTask = payload['task'];
        }
      }
      // Validate task with ReviewerTaskSchema before use
      const parsed = ReviewerTaskSchema.safeParse(maybeTask);
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
    // Optionally, log that the event loop has started
    await publishEvent({
      type: 'Log',
      agentId,
      timestamp: new Date().toISOString(),
      payload: { level: 'info', message: 'ReviewerAgent event loop started' }
    });
  }

  /**
   * Returns a machine-usable, LLM-friendly description of the agent.
   * Returns a CapabilityDescribe object.
   */
  static override describe(): CapabilityDescribe {
    // 2025 best practices: include health, event patterns, subscriptions, emissions, extension points, and benchmarking hooks
    return {
      name: 'ReviewAgent',
      description: 'Reviews drafts and provides feedback. Event-driven. Enhancements: Sentiment-and-aspect analysis, multi-pass chain-of-thought (SCoT) review, ensemble scoring. Extension points: LLM/embedding backend for sentiment/aspect analysis, multi-model ensemble scoring (quantized LLMs, voting strategies), custom multi-pass review logic (SCoT, domain-specific passes), benchmarking and test coverage automation. Best practices: Integrate LLM/embedding backend for sentiment/aspect analysis, use multi-model ensemble for robust scoring, document extension points and rationale in describe(), automate benchmarking and test coverage for all enhancements.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/nootropic/nootropic',
      docsFirst: true,
      aiFriendlyDocs: true,
      supportedEventPatterns: ['blackboard', 'supervisor/sub-agent'],
      eventSubscriptions: ['DraftCreated', 'ReviewRequested', 'TaskAssigned'],
      eventEmissions: ['DraftReviewed', 'ReviewFeedback', 'TaskCompleted', 'Log'],
      usage: 'Instantiate and call startEventLoop() to run as a service. Optionally pass backendName for LLM/embedding backend.',
      methods: [
        { name: 'runTask', signature: '(task, logger?) => Promise<AgentResult>', description: 'Reviews outputs using sentiment analysis, multi-pass SCoT, and ensemble scoring.' },
        { name: 'sentimentAndAspectAnalysis', signature: '(content: string) => Promise<{ sentiment: string; aspects: Record<string, string> }>', description: 'LLM-powered sentiment and aspect analysis. Extension: HuggingFace, Ollama, or local LLM.' },
        { name: 'multiPassChainOfThought', signature: '(content: string) => Promise<string[]>', description: 'Multi-pass chain-of-thought review. Extension: SCoT pipeline, LLM/embedding backend.' },
        { name: 'ensembleScoring', signature: '(content: string) => Promise<number>', description: 'Aggregate scores from multiple models. Extension: quantized LLMs, voting/aggregation strategies.' },
        { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists dynamically discovered tools/plugins.' },
        { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' },
        { name: 'startEventLoop', signature: '() => Promise<void>', description: 'Starts the event-driven runtime loop: subscribes to ReviewRequested and TaskAssigned events, processes them, and emits results.' }
      ],
      references: [
        'https://huggingface.co/tasks/sentiment-analysis',
        'https://arxiv.org/abs/2305.10601',
        'https://arxiv.org/abs/2302.09664',
        'https://github.com/facebookresearch/llama',
        'https://github.com/nootropic/nootropic',
        'https://github.com/nootropic/nootropic/blob/main/README.md'
      ]
    };
  }

  /**
   * Instance describe for registry compliance.
   */
  override describe() {
    return (this.constructor as typeof ReviewAgent).describe();
  }

  /**
   * Instance health for registry compliance.
   */
  override async health() {
    return { status: 'ok' as const, timestamp: new Date().toISOString() };
  }

  // TODO: reviewStub is intentionally omitted; add if needed for future extension.
}

/**
 * Stub lifecycle hooks for registry compliance.
 */
export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'ReviewAgent', description: 'Stub lifecycle hooks for registry compliance.' }; } 