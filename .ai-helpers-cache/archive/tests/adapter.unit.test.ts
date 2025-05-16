import { describe, it, expect } from 'vitest';
import { LangChainAdapter } from '../adapters/langchainAdapter.js';
import { CrewAIAdapter } from '../adapters/crewAIAdapter.js';
import { SemanticKernelAdapter } from '../adapters/semanticKernelAdapter.js';
import type { AgentProfile, AgentTask } from '../types/AgentOrchestrationEngine.js';

const adapters = [
  { name: 'LangChainAdapter', Adapter: LangChainAdapter },
  { name: 'CrewAIAdapter', Adapter: CrewAIAdapter },
  { name: 'SemanticKernelAdapter', Adapter: SemanticKernelAdapter },
];

// @ts-expect-error TS(2349): This expression is not callable.
describe('Adapter Unit Tests', () => {
  // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
  adapters.forEach(({ name, Adapter }) => {
    // @ts-expect-error TS(6133): 'name' is declared but its value is never read.
    describe(name, () => {
      // @ts-expect-error TS(2304): Cannot find name 'profile'.
      const profile: AgentProfile = { name: 'TestAgent' };
      // @ts-expect-error TS(2304): Cannot find name 'task'.
      const task: AgentTask = { id: 't1', description: 'Say hello' };

      // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
      it('runAgentTask returns AgentResult', async () => {
        // @ts-expect-error TS(2552): Cannot find name 'adapter'. Did you mean 'adapters... Remove this comment to see the full error message
        const adapter = new Adapter();
        // @ts-expect-error TS(2304): Cannot find name 'result'.
        const result = await adapter.runAgentTask(profile, task);
        // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
        expect(result).toHaveProperty('success');
        // @ts-expect-error TS(6133): 'result' is declared but its value is never read.
        expect(result).toHaveProperty('output');
      });

      // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
      it('getAgentContext returns AgentContext', async () => {
        // @ts-expect-error TS(2552): Cannot find name 'adapter'. Did you mean 'adapters... Remove this comment to see the full error message
        const adapter = new Adapter();
        // @ts-expect-error TS(2304): Cannot find name 'context'.
        const context = await adapter.getAgentContext('test-id');
        // @ts-expect-error TS(6133): 'context' is declared but its value is never read.
        expect(context).toHaveProperty('agentId');
      });

      // @ts-expect-error TS(2304): Cannot find name 'async'.
      it('listAgents returns array', async () => {
        // @ts-expect-error TS(2304): Cannot find name 'adapter'.
        const adapter = new Adapter();
        // @ts-expect-error TS(2304): Cannot find name 'agents'.
        const agents = await adapter.listAgents();
        // @ts-expect-error TS(6133): 'Array' is declared but its value is never read.
        expect(Array.isArray(agents)).toBe(true);
      });
    });
  });
}); 