import { describe, it, expect } from 'vitest';
// @ts-ignore
import { LangChainAdapter } from '../src/adapters/langchainAdapter.js';
// @ts-ignore
import { CrewAIAdapter } from '../src/adapters/crewAIAdapter.js';
// @ts-ignore
import { SemanticKernelAdapter } from '../src/adapters/semanticKernelAdapter.js';
// @ts-ignore
import type { AgentProfile, AgentTask } from '../types/AgentOrchestrationEngine.d';

const adapters = [
  { name: 'LangChainAdapter', Adapter: LangChainAdapter },
  { name: 'CrewAIAdapter', Adapter: CrewAIAdapter },
  { name: 'SemanticKernelAdapter', Adapter: SemanticKernelAdapter },
];

describe('Adapter Unit Tests', () => {
  adapters.forEach(({ name, Adapter }) => {
    describe(name, () => {
      const profile: AgentProfile = { name: 'TestAgent' };
      const task: AgentTask = { id: 't1', description: 'Say hello' };

      it('runAgentTask returns AgentResult', async () => {
        const adapter = new Adapter();
        const result = await adapter.runAgentTask(profile, task);
        expect(result).toHaveProperty('success');
        expect(result).toHaveProperty('output');
      });

      it('getAgentContext returns AgentContext', async () => {
        const adapter = new Adapter();
        const context = await adapter.getAgentContext('test-id');
        expect(context).toHaveProperty('agentId');
      });

      it('listAgents returns array', async () => {
        const adapter = new Adapter();
        const agents = await adapter.listAgents();
        expect(Array.isArray(agents)).toBe(true);
      });
    });
  });
}); 