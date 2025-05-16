/**
 * Returns a description of the agents module and its exports.
 */
// @ts-expect-error TS(2323): Cannot redeclare exported variable 'init'.
export async function init() {}
// @ts-expect-error TS(2323): Cannot redeclare exported variable 'shutdown'.
export async function shutdown() {}
// @ts-expect-error TS(2323): Cannot redeclare exported variable 'reload'.
export async function reload() {}
// @ts-expect-error TS(2323): Cannot redeclare exported variable 'health'.
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
// @ts-expect-error TS(2323): Cannot redeclare exported variable 'describe'.
export async function describe() {
  return {
    name: 'agents',
    description: 'Stub lifecycle hooks for registry compliance.',
    promptTemplates: [],
    schema: {}
  };
}

import registry from '../capabilities/registry.js';
import { ContentAgent } from './ContentAgent.js';
import { CollectionAgent } from './CollectionAgent.js';
import { ReviewAgent } from './ReviewAgent.js';
import { OrchestratorAgent } from './OrchestratorAgent.js';
import { SupervisorAgent } from './SupervisorAgent.js';
import { FeedbackAgent } from './FeedbackAgent.js';
import { MutationAgent } from './MutationAgent.js';
import { ExplainabilityAgent } from './ExplainabilityAgent.js';
import { HumanInTheLoopAgent } from './HumanInTheLoopAgent.js';
import { MemoryAgent } from './MemoryAgent.js';
// @ts-expect-error TS(2305): Module '"./EnsembleAgent.js"' has no exported memb... Remove this comment to see the full error message
import { EnsembleAgent } from './EnsembleAgent.js';
import { ReasoningLoopUtility } from './ReasoningLoopUtility.js';
import { FormalVerifierAgent } from './FormalVerifierAgent.js';
import { MultimodalAgent } from './MultimodalAgent.js';
import { VibeCodingAgent } from './VibeCodingAgent.js';

// Auto-register all core agents
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new ContentAgent({ profile: { name: 'ContentAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new CollectionAgent({ profile: { name: 'CollectionAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new ReviewAgent({ profile: { name: 'ReviewAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new OrchestratorAgent({ profile: { name: 'OrchestratorAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new SupervisorAgent({ profile: { name: 'SupervisorAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new FeedbackAgent({ profile: { name: 'FeedbackAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new MutationAgent({ profile: { name: 'MutationAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new ExplainabilityAgent({ profile: { name: 'ExplainabilityAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new HumanInTheLoopAgent({ profile: { name: 'HumanInTheLoopAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new MemoryAgent({ profile: { name: 'MemoryAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new EnsembleAgent({ profile: { name: 'EnsembleAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new ReasoningLoopUtility());
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new FormalVerifierAgent({ profile: { name: 'FormalVerifierAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
registry.register(new MultimodalAgent({ profile: { name: 'MultimodalAgent' } }));
// @ts-expect-error TS(2339): Property 'register' does not exist on type 'Capabi... Remove this comment to see the full error message
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

// Define and export the stubs only once at the end
// @ts-expect-error TS(2323): Cannot redeclare exported variable 'init'.
export { init, shutdown, reload, health, describe }; 