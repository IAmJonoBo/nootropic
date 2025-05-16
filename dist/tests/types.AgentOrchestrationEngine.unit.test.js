import { describe, it, expect } from 'vitest';
describe('types/AgentOrchestrationEngine', () => {
    it('allows a valid AgentOrchestrationEngine implementation', async () => {
        class DummyEngine {
            async runAgentTask(agentProfile, task, context, logger) {
                if (logger)
                    logger({ type: 'start', adapter: 'dummy', method: 'runAgentTask' });
                return { output: 'ok', success: true };
            }
            async getAgentContext(agentId) {
                return { agentId };
            }
            async listAgents() {
                return [{ name: 'dummy' }];
            }
        }
        const engine = new DummyEngine();
        const result = await engine.runAgentTask({ name: 'a' }, { id: 't', description: 'd' });
        expect(result.success).toBe(true);
        const ctx = await engine.getAgentContext('id');
        expect(ctx.agentId).toBe('id');
        const agents = await engine.listAgents();
        expect(agents[0].name).toBe('dummy');
    });
});
