import { describe, it, expect } from 'vitest';
// @ts-ignore
import type { AgentOrchestrationEngine, AgentProfile, AgentTask, AgentContext, AgentResult, AgentLogger } from '../types/AgentOrchestrationEngine.js';

describe('types/AgentOrchestrationEngine', () => {
  it('allows a valid AgentOrchestrationEngine implementation', async () => {
    class DummyEngine implements AgentOrchestrationEngine {
      async runAgentTask(agentProfile: AgentProfile, task: AgentTask, context?: AgentContext, logger?: AgentLogger): Promise<AgentResult> {
        if (logger) logger({ type: 'start', adapter: 'dummy', method: 'runAgentTask' });
        return { output: 'ok', success: true };
      }
      async getAgentContext(agentId: string): Promise<AgentContext> {
        return { agentId } as AgentContext;
      }
      async listAgents(): Promise<AgentProfile[]> {
        return [{ name: 'dummy' } as AgentProfile];
      }
    }
    const engine: AgentOrchestrationEngine = new DummyEngine();
    const result = await engine.runAgentTask({ name: 'a' } as AgentProfile, { id: 't', description: 'd' } as AgentTask);
    expect(result.success).toBe(true);
    const ctx = await engine.getAgentContext('id');
    expect((ctx as any).agentId).toBe('id');
    const agents = await engine.listAgents();
    expect(agents[0]?.name).toBe('dummy');
  });
}); 