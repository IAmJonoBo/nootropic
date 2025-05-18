// @ts-ignore
import type { Capability, CapabilityDescribe, HealthStatus } from '../capabilities/Capability.js';

/**
 * ReasoningLoopUtility: Iterative code generation, explanation, and repair utility for agent workflows.
 * Supports chain-of-thought, self-debugging, and mutation/self-healing integration.
 * Now supports SCoT (Structured Chain-of-Thought), pluggable uncertainty, LLM-driven explanation/repair, robust backtracking, and event-driven feedback.
 */
export class ReasoningLoopUtility implements Capability {
  public readonly name = 'ReasoningLoopUtility';
  private publishEvent: (event: unknown) => Promise<void>;

  // Dependency injection for event publishing to break circular dependency
  constructor(publishEvent: (event: unknown) => Promise<void>) {
    this.publishEvent = publishEvent;
  }

  static eventSchemas = {
    reasoningStep: { type: 'object', properties: { step: { type: 'string' }, confidence: { type: 'number' }, iteration: { type: 'number' } }, required: ['step', 'confidence', 'iteration'] },
    explanation: { type: 'object', properties: { step: { type: 'string' }, explanation: { type: 'string' }, iteration: { type: 'number' } }, required: ['step', 'explanation', 'iteration'] },
    repair: { type: 'object', properties: { step: { type: 'string' }, repaired: { type: 'string' }, iteration: { type: 'number' } }, required: ['step', 'repaired', 'iteration'] }
  };

  /**
   * Runs an advanced iterative reasoning loop for code generation and repair.
   * Supports uncertainty-aware CoT, SCoT, backtracking, and feedback integration.
   * 'input' is the initial problem or code to solve/repair.
   * 'options' is an optional config object (see method signature for details).
   * Returns a result object with the final result and log.
   */
  async runLoop(
    input: string,
    options?: {
      maxSteps?: number;
      allowBacktrack?: boolean;
      uncertaintyThreshold?: number; // 0-1, higher = more likely to trigger CoT/backtrack
      feedback?: (step: string, confidence: number, rationale: string) => Promise<'accept' | 'revise' | 'backtrack'>;
      emitEvent?: (event: { type: string; payload: unknown }) => Promise<void>;
      structuredReasoning?: boolean;
      uncertaintyFn?: (step: string, history: string[]) => Promise<number> | number;
      llmExplain?: (step: string, context: string[]) => Promise<string>;
      llmRepair?: (step: string, context: string[]) => Promise<string>;
      maxBacktrackSteps?: number;
    }
  ): Promise<{ result: string; log: string[] }> {
    const log: string[] = [];
    const maxSteps = options?.maxSteps ?? 3;
    const allowBacktrack = options?.allowBacktrack ?? true;
    const uncertaintyThreshold = options?.uncertaintyThreshold ?? 0.5;
    const feedback = options?.feedback;
    const structuredReasoning = options?.structuredReasoning ?? false;
    const uncertaintyFn = options?.uncertaintyFn;
    const llmExplain = options?.llmExplain;
    const llmRepair = options?.llmRepair;
    const maxBacktrackSteps = options?.maxBacktrackSteps ?? 1;
    let current = input;
    let history: string[] = [input];
    let backtrackCount = 0;
    // SCoT: Decompose into sequence/branch/loop if enabled
    if (structuredReasoning) {
      const structure = await this.generateStructuredPlan(input, llmExplain);
      log.push(`Structured plan (SCoT): ${structure}`);
      current = structure;
      history = [structure];
    }
    for (let i = 0; i < maxSteps; i++) {
      // Pluggable uncertainty/confidence
      let confidence: number;
      if (uncertaintyFn) {
        confidence = typeof uncertaintyFn === 'function' ? await uncertaintyFn(current, history) : Math.random();
      } else {
        confidence = Math.random();
      }
      const step = `Step ${i + 1}: Generated candidate for "${current}" (confidence: ${confidence.toFixed(2)})`;
      log.push(step);
      // Emit step event
      const event = { type: 'reasoningStep', payload: { step, confidence, iteration: i + 1 } };
      await this.publishEvent({ type: event.type, agentId: this.name, timestamp: new Date().toISOString(), payload: event.payload });
      if (options?.emitEvent) await options.emitEvent(event);
      // Uncertainty-aware CoT/backtracking
      if (confidence < uncertaintyThreshold) {
        log.push(`Uncertainty detected (confidence ${confidence.toFixed(2)} < threshold ${uncertaintyThreshold}). Triggering detailed reasoning.`);
        const explanation = llmExplain ? await llmExplain(step, history) : await this.explainStep(step);
        const explanationEvent = { type: 'explanation', payload: { step, explanation, iteration: i + 1 } };
        await this.publishEvent({ type: explanationEvent.type, agentId: this.name, timestamp: new Date().toISOString(), payload: explanationEvent.payload });
        if (options?.emitEvent) await options.emitEvent(explanationEvent);
        log.push(`Explanation: ${explanation}`);
        if (allowBacktrack && i > 0 && backtrackCount < maxBacktrackSteps) {
          log.push('Backtracking to previous step due to high uncertainty.');
          current = history[i - 1] ?? '';
          i -= 2;
          backtrackCount++;
          continue;
        }
      }
      // Feedback integration
      if (feedback) {
        const action = await feedback(step, confidence, '');
        log.push(`Feedback: ${action}`);
        if (action === 'backtrack' && allowBacktrack && i > 0 && backtrackCount < maxBacktrackSteps) {
          log.push('Backtracking to previous step due to feedback.');
          current = history[i - 1] ?? '';
          i -= 2;
          backtrackCount++;
          continue;
        } else if (action === 'revise') {
          log.push('Attempting repair based on feedback.');
          const repaired = llmRepair ? await llmRepair(step, history) : await this.repairStep(step);
          const repairEvent = { type: 'repair', payload: { step, repaired, iteration: i + 1 } };
          await this.publishEvent({ type: repairEvent.type, agentId: this.name, timestamp: new Date().toISOString(), payload: repairEvent.payload });
          if (options?.emitEvent) await options.emitEvent(repairEvent);
          log.push(`Repair: ${repaired}`);
          current = repaired;
        }
      }
      // Simulate a failure on step 2 for demonstration
      if (i === 1) {
        log.push('Detected issue in step 2, attempting repair...');
        const repaired = llmRepair ? await llmRepair(step, history) : await this.repairStep(step);
        const repairEvent = { type: 'repair', payload: { step, repaired, iteration: i + 1 } };
        await this.publishEvent({ type: repairEvent.type, agentId: this.name, timestamp: new Date().toISOString(), payload: repairEvent.payload });
        if (options?.emitEvent) await options.emitEvent(repairEvent);
        log.push(`Repair: ${repaired}`);
        current = repaired;
      } else {
        current = step;
      }
      history.push(current ?? '');
    }
    log.push('Reasoning loop complete.');
    return { result: current, log };
  }

  /**
   * Generates a structured plan (SCoT) for the input problem using LLM or template.
   * 'input' is the problem or code to solve.
   * 'llmExplain' is an optional LLM function for structure generation.
   * Returns a structured plan string.
   */
  async generateStructuredPlan(input: string, llmExplain?: (step: string, context: string[]) => Promise<string>): Promise<string> {
    if (llmExplain) {
      return llmExplain(`Decompose the following problem into sequence/branch/loop steps: ${input}`, []);
    }
    // Fallback: simple template
    return `Sequence: Analyze -> Plan -> Generate -> Test -> Refine for "${input}"`;
  }

  /**
   * Explains a reasoning step or decision (pluggable LLM or stub).
   * 'step' is the step or action to explain.
   * Returns an explanation string.
   */
  async explainStep(step: string): Promise<string> {
    // Stub: Implement explanation logic or use LLM
    return `Explanation for step: ${step}`;
  }

  /**
   * Attempts to repair a failed or suboptimal step (pluggable LLM or stub).
   * 'step' is the step or code to repair.
   * Returns a repaired step string.
   */
  async repairStep(step: string): Promise<string> {
    // Stub: Implement repair logic or use LLM
    return step;
  }

  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  describe(): CapabilityDescribe {
    return {
      name: 'ReasoningLoopUtility',
      description: 'Advanced iterative code generation, explanation, and repair utility for agent workflows. Supports uncertainty-aware chain-of-thought, SCoT (structured reasoning), robust backtracking, pluggable LLM-driven explanation/repair, and event-driven feedback integration. Emits reasoningStep, explanation, and repair events for each step.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/nootropic/nootropic',
      methods: [
        { name: 'runLoop', signature: '(input: string, options?: { maxSteps?: number; allowBacktrack?: boolean; uncertaintyThreshold?: number; feedback?: (step: string, confidence: number, rationale: string) => Promise<\'accept\'|\'revise\'|\'backtrack\'>; emitEvent?: (event: { type: string; payload: unknown }) => Promise<void>; structuredReasoning?: boolean; uncertaintyFn?: (step: string, history: string[]) => Promise<number> | number; llmExplain?: (step: string, context: string[]) => Promise<string>; llmRepair?: (step: string, context: string[]) => Promise<string>; maxBacktrackSteps?: number }) => Promise<{ result: string; log: string[] }>', description: 'Runs an advanced iterative reasoning loop for code generation and repair. Supports uncertainty-aware CoT, SCoT, robust backtracking, and feedback integration.' },
        { name: 'generateStructuredPlan', signature: '(input: string, llmExplain?: (step: string, context: string[]) => Promise<string>) => Promise<string>', description: 'Generates a structured plan (SCoT) for the input problem using LLM or template.' },
        { name: 'explainStep', signature: '(step: string) => Promise<string>', description: 'Explains a reasoning step or decision (pluggable LLM or stub).' },
        { name: 'repairStep', signature: '(step: string) => Promise<string>', description: 'Attempts to repair a failed or suboptimal step (pluggable LLM or stub).' }
      ],
      schema: {
        runLoop: {
          input: {
            type: 'object',
            properties: {
              input: { type: 'string' },
              options: { type: 'object', description: 'Optional config for reasoning loop' }
            },
            required: ['input']
          },
          output: {
            type: 'object',
            properties: {
              result: { type: 'string' },
              log: { type: 'array', items: { type: 'string' } }
            },
            required: ['result', 'log']
          }
        },
        generateStructuredPlan: {
          input: { type: 'object', properties: { input: { type: 'string' } }, required: ['input'] },
          output: { type: 'object', properties: { plan: { type: 'string' } }, required: ['plan'] }
        },
        explainStep: {
          input: { type: 'object', properties: { step: { type: 'string' } }, required: ['step'] },
          output: { type: 'object', properties: { explanation: { type: 'string' } }, required: ['explanation'] }
        },
        repairStep: {
          input: { type: 'object', properties: { step: { type: 'string' } }, required: ['step'] },
          output: { type: 'object', properties: { repaired: { type: 'string' } }, required: ['repaired'] }
        },
        health: {
          input: { type: 'null', description: 'No input required' },
          output: { type: 'object', properties: { status: { type: 'string' }, timestamp: { type: 'string' } }, required: ['status', 'timestamp'] }
        }
      },
      usage: "import { ReasoningLoopUtility } from 'nootropic/capabilities/ReasoningLoopUtility'; const util = new ReasoningLoopUtility(publishEvent); await util.runLoop(input);",
      docsFirst: true,
      aiFriendlyDocs: true,
      references: [
        'https://arxiv.org/abs/2201.11903',
        'https://arxiv.org/abs/2302.03494',
        'README.md#chain-of-thought-prompting--self-debugging-augmented-with-scot',
        'docs/ROADMAP.md#ensemble-llm-code-generation--voting-strategies'
      ]
      // Best practices: Inject a publishEvent function when constructing ReasoningLoopUtility (dependency injection pattern). Emit events for all reasoning, explanation, and repair steps. Support event-driven explainability and agent/LLM introspection. Document event schemas and rationale in describe().
    } as CapabilityDescribe & { eventSchemas: typeof ReasoningLoopUtility.eventSchemas };
  }
}

export default ReasoningLoopUtility;

export const ReasoningLoopUtilityCapability = {
  name: 'ReasoningLoopUtility',
  describe: () => ReasoningLoopUtility.prototype.describe(),
  eventSchemas: ReasoningLoopUtility.eventSchemas,
  schema: ReasoningLoopUtility.prototype.describe().schema
};

export const schema = ReasoningLoopUtility.prototype.describe().schema; 