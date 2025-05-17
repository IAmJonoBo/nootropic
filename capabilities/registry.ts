// @ts-ignore
import type { Capability, CapabilityDescribe } from './Capability.js';
// @ts-ignore
import { RAGPipelineUtility } from './RAGPipelineUtility.js';
// @ts-ignore
import { RerankUtility, ShimiMemory } from '../utils/context/index.js';
// @ts-ignore
import { pluginFeedbackCapability, sastMemoriesCapability } from '../utils/feedback/index.js';
import { z } from 'zod';

// Canonical Zod schema for Capability objects
export const CapabilitySchema = z.object({
  name: z.string(),
  describe: z.function().args().returns(z.unknown()),
  // Optionally allow health and other properties
  health: z.function().args().returns(z.any()).optional(),
}).catchall(z.unknown());

/**
 * Centralized registry for all Capability-compliant agents, plugins, adapters, and tools.
 * Enforces describe() compliance and provides aggregation for LLM/agent discovery.
 */
class CapabilityRegistry {
  private capabilities: Map<string, Capability> = new Map();

  /**
   * Register a new capability. Throws if name is not unique or schema is invalid.
   */
  register(cap: Capability) {
    // Zod-based validation
    const result = CapabilitySchema.safeParse(cap);
    if (!result.success) {
      if (process.env['NOOTROPIC_DEBUG']) {
        console.warn('[CapabilityRegistry] Capability failed Zod validation:', result.error);
      }
      throw new Error('Capability does not conform to CapabilitySchema');
    }
    if (!cap || typeof cap.name !== 'string' || typeof cap.describe !== 'function') {
      throw new Error('Only Capability-compliant objects can be registered');
    }
    if (this.capabilities.has(cap.name)) {
      throw new Error(`Capability with name '${cap.name}' is already registered`);
    }
    this.capabilities.set(cap.name, cap);
  }

  /**
   * Get a capability by name.
   */
  get(name: string): Capability | undefined {
    return this.capabilities.get(name);
  }

  /**
   * List all registered capabilities.
   */
  list(): Capability[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Aggregate all describe() outputs for registry/discovery.
   */
  aggregateDescribe(): CapabilityDescribe[] {
    return this.list().map(cap => cap.describe());
  }
}

const registry = new CapabilityRegistry();
export default registry;

registry.register(new RAGPipelineUtility());
registry.register(new RerankUtility());
registry.register(new ShimiMemory({ backendName: 'nv-embed' }));
registry.register(pluginFeedbackCapability);
registry.register(sastMemoriesCapability);

// --- Planned/in-progress docManifest stubs for registry/discoverability ---
const plannedSections = [
  { name: 'quality system (planned)', status: 'planned', description: 'Planned: Quality system documentation and implementation.' },
  { name: 'plugin architecture (planned)', status: 'planned', description: 'Planned: Plugin architecture documentation and implementation.' },
  { name: 'agent discovery (planned)', status: 'planned', description: 'Planned: Agent discovery documentation and implementation.' },
  { name: 'describe registry (in progress)', status: 'in progress', description: 'In progress: Central describe registry for all capabilities.' },
  { name: 'CLI usage (planned)', status: 'planned', description: 'Planned: CLI usage documentation and onboarding.' },
  { name: 'event bus abstraction (planned)', status: 'planned', description: 'Planned: Event bus abstraction documentation and implementation.' },
  { name: 'cache management (planned)', status: 'planned', description: 'Planned: Cache management documentation and implementation.' },
  { name: 'context handover (planned)', status: 'planned', description: 'Planned: Context handover documentation and implementation.' },
  { name: 'multi-agent orchestration (planned)', status: 'planned', description: 'Planned: Multi-agent orchestration documentation and implementation.' },
  { name: 'event-driven MAS patterns (planned)', status: 'planned', description: 'Planned: Event-driven MAS patterns documentation.' },
  { name: 'agent event interface (planned)', status: 'planned', description: 'Planned: Agent event interface documentation.' },
  { name: 'streaming backend integration (planned)', status: 'planned', description: 'Planned: Streaming backend integration documentation.' },
  { name: 'supervisor agent pattern (planned)', status: 'planned', description: 'Planned: Supervisor agent pattern documentation.' },
  { name: 'pre-commit/Husky hooks (planned)', status: 'planned', description: 'Planned: Pre-commit/Husky hooks documentation.' },
  { name: 'onboarding instructions (planned)', status: 'planned', description: 'Planned: Onboarding instructions documentation.' },
  { name: 'sample config files (planned)', status: 'planned', description: 'Planned: Sample config files documentation.' },
  { name: 'ci/cd integration (planned)', status: 'planned', description: 'Planned: CI/CD integration documentation.' },
  { name: 'ajv-cli validation in ci (planned)', status: 'planned', description: 'Planned: ajv-cli validation in CI documentation.' },
  { name: 'github actions workflow (planned)', status: 'planned', description: 'Planned: GitHub Actions workflow documentation.' },
  { name: 'matrix validation strategy (planned)', status: 'planned', description: 'Planned: Matrix validation strategy documentation.' },
  { name: 'ci/cd troubleshooting (planned)', status: 'planned', description: 'Planned: CI/CD troubleshooting documentation.' },
  { name: 'onboarding guide (planned)', status: 'planned', description: 'Planned: Onboarding guide documentation.' },
  { name: 'contributing.md (planned)', status: 'planned', description: 'Planned: Contributing.md documentation.' },
  { name: 'setup and environment requirements (planned)', status: 'planned', description: 'Planned: Setup and environment requirements documentation.' },
  { name: 'coding standards (planned)', status: 'planned', description: 'Planned: Coding standards documentation.' },
  { name: 'onboarding troubleshooting (planned)', status: 'planned', description: 'Planned: Onboarding troubleshooting documentation.' },
  { name: 'schema validation onboarding (planned)', status: 'planned', description: 'Planned: Schema validation onboarding documentation.' },
  { name: 'editor config recommendations (planned)', status: 'planned', description: 'Planned: Editor config recommendations documentation.' },
  { name: 'api documentation generation (planned)', status: 'planned', description: 'Planned: API documentation generation.' },
  { name: 'typedoc integration (planned)', status: 'planned', description: 'Planned: TypeDoc integration documentation.' },
  { name: 'tsdoc style enforcement (planned)', status: 'planned', description: 'Planned: TSDoc style enforcement documentation.' },
  { name: 'typedoc.json config (planned)', status: 'planned', description: 'Planned: typedoc.json config documentation.' },
  { name: 'api doc workflow (planned)', status: 'planned', description: 'Planned: API doc workflow documentation.' },
  { name: 'api doc best practices (planned)', status: 'planned', description: 'Planned: API doc best practices documentation.' },
  { name: 'tsdoc/typedoc/eslint/ci integration (planned)', status: 'planned', description: 'Planned: TSDoc/TypeDoc/ESLint/CI integration documentation.' },
  { name: 'monorepo typescript config (planned)', status: 'planned', description: 'Planned: Monorepo TypeScript config documentation.' },
  { name: 'event-driven agent example (WriterAgent) (planned)', status: 'planned', description: 'Planned: Event-driven agent example (WriterAgent) documentation.' },
  { name: 'updated agent event interface (planned)', status: 'planned', description: 'Planned: Updated agent event interface documentation.' },
  { name: 'event-driven agent pattern (planned)', status: 'planned', description: 'Planned: Event-driven agent pattern documentation.' },
  { name: 'quality/selfcheck (planned)', status: 'planned', description: 'Planned: quality/selfcheck documentation.' },
  { name: 'contextSnapshotHelper (planned)', status: 'planned', description: 'Planned: contextSnapshotHelper documentation.' },
  { name: 'semanticIndexBuilder (planned)', status: 'planned', description: 'Planned: semanticIndexBuilder documentation.' },
  { name: './agents/BaseAgent.js (planned)', status: 'planned', description: 'Planned: ./agents/BaseAgent.js documentation.' },
  { name: './agents/DataCollectorAgent.js (planned)', status: 'planned', description: 'Planned: ./agents/DataCollectorAgent.js documentation.' },
  { name: './agents/WriterAgent.js (planned)', status: 'planned', description: 'Planned: ./agents/WriterAgent.js documentation.' },
  { name: './agents/ReviewerAgent.js (planned)', status: 'planned', description: 'Planned: ./agents/ReviewerAgent.js documentation.' },
  { name: 'agentProfileRegistry (planned)', status: 'planned', description: 'Planned: agentProfileRegistry documentation.' },
  { name: 'agentIntentRegistry (planned)', status: 'planned', description: 'Planned: agentIntentRegistry documentation.' },
  { name: 'docDiagramGenerator (planned)', status: 'planned', description: 'Planned: docDiagramGenerator documentation.' },
  { name: 'liveMutationPRHelper (planned)', status: 'planned', description: 'Planned: liveMutationPRHelper documentation.' }
];

for (const section of plannedSections) {
  if (!registry.get(section.name)) {
    registry.register({
      name: section.name,
      describe: () => ({
        name: section.name,
        description: section.description,
        status: section.status,
        docsFirst: true,
        aiFriendlyDocs: true,
        planned: true,
        license: 'Apache-2.0',
        isOpenSource: true
      }),
      health: async () => ({ status: 'ok', details: 'planned stub', timestamp: new Date().toISOString() })
    } as Capability);
  }
} 