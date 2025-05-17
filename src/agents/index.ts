/**
 * Returns a description of the agents module and its exports.
 */
export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() {
  return {
    name: 'agents',
    description: 'Stub lifecycle hooks for registry compliance.',
    promptTemplates: [],
    schema: {}
  };
}

// @ts-ignore
import registry from '../capabilities/registry.js';
// @ts-ignore
import { ContentAgent } from './ContentAgent.js';
// @ts-ignore
import { CollectionAgent } from './CollectionAgent.js';
// @ts-ignore
import { ReviewAgent } from './ReviewAgent.js';
// @ts-ignore
import { OrchestratorAgent } from './OrchestratorAgent.js';
// @ts-ignore
import { SupervisorAgent } from './SupervisorAgent.js';
// @ts-ignore
import { FeedbackAgent } from './FeedbackAgent.js';
// @ts-ignore
import { MutationAgent } from './MutationAgent.js';
// @ts-ignore
import { ExplainabilityAgent } from './ExplainabilityAgent.js';
// @ts-ignore
import { HumanInTheLoopAgent } from './HumanInTheLoopAgent.js';
// @ts-ignore
import { MemoryAgent } from './MemoryAgent.js';
// @ts-ignore
import { EnsembleAgent } from './EnsembleAgent.js';
// @ts-ignore
import { ReasoningLoopUtility } from './ReasoningLoopUtility.js';
// @ts-ignore
import { FormalVerifierAgent } from './FormalVerifierAgent.js';
// @ts-ignore
import { MultimodalAgent } from './MultimodalAgent.js';
// @ts-ignore
import { VibeCodingAgent } from './VibeCodingAgent.js';

// Auto-register all core agents
registry.register(new ContentAgent({ profile: { name: 'ContentAgent' } }));
registry.register(new CollectionAgent({ profile: { name: 'CollectionAgent' } }));
registry.register(new ReviewAgent({ profile: { name: 'ReviewAgent' } }));
registry.register(new OrchestratorAgent({ profile: { name: 'OrchestratorAgent' } }));
registry.register(new SupervisorAgent({ profile: { name: 'SupervisorAgent' } }));
registry.register(new FeedbackAgent({ profile: { name: 'FeedbackAgent' } }));
registry.register(new MutationAgent({ profile: { name: 'MutationAgent' } }));
registry.register(new ExplainabilityAgent({ profile: { name: 'ExplainabilityAgent' } }));
registry.register(new HumanInTheLoopAgent({ profile: { name: 'HumanInTheLoopAgent' } }));
registry.register(new MemoryAgent({ profile: { name: 'MemoryAgent' } }));
registry.register(new EnsembleAgent({ profile: { name: 'EnsembleAgent' } }));
registry.register(new ReasoningLoopUtility());
registry.register(new FormalVerifierAgent({ profile: { name: 'FormalVerifierAgent' } }));
registry.register(new MultimodalAgent({ profile: { name: 'MultimodalAgent' } }));
registry.register(new VibeCodingAgent({ profile: { name: 'VibeCodingAgent' } }));

const AgentsCapability = {
  name: 'agents',
  describe,
  schema: {}
};

export default AgentsCapability;
export { registry };

export * from './BaseAgent.js';
// Add additional agent exports here as new agents are added

export const schema = {}; 