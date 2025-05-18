import registry from './registry.js';
import { CollectionAgent } from '../agents/CollectionAgent.js';
import { MemoryAgent } from '../agents/MemoryAgent.js';
import { FeedbackAgent } from '../agents/FeedbackAgent.js';
import { ReviewAgent } from '../agents/ReviewAgent.js';
import { SupervisorAgent } from '../agents/SupervisorAgent.js';
import { OrchestratorAgent } from '../agents/OrchestratorAgent.js';
import { ExplainabilityAgent } from '../agents/ExplainabilityAgent.js';
import { HumanInTheLoopAgent } from '../agents/HumanInTheLoopAgent.js';
import { MutationAgent } from '../agents/MutationAgent.js';
import { VibeCodingAgent } from '../agents/VibeCodingAgent.js';
import { EnsembleAgent } from '../agents/EnsembleAgent.js';
import { ContentAgent } from '../agents/ContentAgent.js';
import { MultimodalAgent } from '../agents/MultimodalAgent.js';
export function registerAllAgents() {
    registry.register(new CollectionAgent({ profile: { name: 'CollectionAgent' } }));
    registry.register(new MemoryAgent({ profile: { name: 'MemoryAgent' } }));
    registry.register(new FeedbackAgent({ profile: { name: 'FeedbackAgent' } }));
    registry.register(new ReviewAgent({ profile: { name: 'ReviewAgent' } }));
    registry.register(new SupervisorAgent({ profile: { name: 'SupervisorAgent' } }));
    registry.register(new OrchestratorAgent({ profile: { name: 'OrchestratorAgent' } }));
    registry.register(new ExplainabilityAgent({ profile: { name: 'ExplainabilityAgent' } }));
    registry.register(new HumanInTheLoopAgent({ profile: { name: 'HumanInTheLoopAgent' } }));
    registry.register(new MutationAgent({ profile: { name: 'MutationAgent' } }));
    registry.register(new VibeCodingAgent({ profile: { name: 'VibeCodingAgent' } }));
    registry.register(new EnsembleAgent({ profile: { name: 'EnsembleAgent' } }));
    registry.register(new ContentAgent({ profile: { name: 'ContentAgent' } }));
    registry.register(new MultimodalAgent({ profile: { name: 'MultimodalAgent' } }));
}
