// @ts-ignore
import type { CapabilityDescribe } from '../capabilities/Capability.js';
import { z } from 'zod';

/**
 * ReasoningLoopUtility: Provides iterative code generation, explanation, and repair
 *
 * LLM/AI-usage: Designed for agent workflows requiring iterative reasoning and self-debugging. Extension points for new reasoning strategies or event types.
 * Extension: Add new reasoning strategies, event types, or LLM adapters as needed.
 *
 * Main Methods:
 *   - runReasoningLoop(input): Run a reasoning loop: generate, explain, test, and repair code iteratively
 *   - describe(): Returns a machine-usable description of the utility
 */
export class ReasoningLoopUtility {
  public readonly name = 'ReasoningLoopUtility';

  static schema = z.object({
    maxIterations: z.number().int().positive().default(3),
    stopOnSuccess: z.boolean().optional(),
  });

  /**
   * Run a reasoning loop: generate, explain, test, and repair code iteratively.
   * 'input' is the task or code to reason about.
   * Returns a stub result.
   */
  async runReasoningLoop(input: unknown): Promise<{ output: unknown; logs: string[] }> {
    // Stub: implement CoT, SCoT, self-debugging, and repair
    return { output: input, logs: ['ReasoningLoopUtility ran (stub)'] };
  }

  describe() {
    return ReasoningLoopUtility.describe();
  }

  /** Returns a machine-usable description of the utility. */
  static describe(): CapabilityDescribe {
    return {
      name: 'ReasoningLoopUtility',
      description: 'Iterative code generation, explanation, and repair (chain-of-thought, self-debugging, SCoT).',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'README.md#chain-of-thought-prompting--self-debugging-augmented-with-scot',
      methods: [
        { name: 'runReasoningLoop', signature: '(input: unknown) => Promise<{ output: unknown; logs: string[] }>', description: 'Run a reasoning loop: generate, explain, test, and repair code iteratively.' }
      ],
      usage: "import { ReasoningLoopUtility } from 'nootropic/agents/ReasoningLoopUtility'; const util = new ReasoningLoopUtility(); await util.runReasoningLoop(input);",
      docsFirst: true,
      aiFriendlyDocs: true,
      references: [
        'README.md#chain-of-thought-prompting--self-debugging-augmented-with-scot',
        'arXiv:2304.05128',
        'dl.acm.org/doi/10.1145/3690635'
      ]
    };
  }
}

const ReasoningLoopUtilityCapability = {
  name: 'ReasoningLoopUtility',
  describe: () => ({ ...ReasoningLoopUtility.describe(), schema: ReasoningLoopUtility.schema }),
  schema: ReasoningLoopUtility.schema
};

const schema = ReasoningLoopUtilityCapability.schema;
export { ReasoningLoopUtilityCapability, schema };

export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() {
  return {
    name: 'ReasoningLoopUtility',
    description: 'Stub lifecycle hooks for registry compliance.',
    promptTemplates: [],
    schema: {}
  };
} 