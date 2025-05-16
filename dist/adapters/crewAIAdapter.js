import { tryDynamicImport, stubResult, formatError } from '../utils/adapterUtils.js';
export class CrewAIAdapter {
    async runAgentTask(agentProfile, task, context, logger) {
        if (logger)
            logger({ type: 'start', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
        const crewai = await tryDynamicImport('crewai/agents');
        if (!crewai) {
            if (logger)
                logger({ type: 'fallback', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
            return stubResult('CrewAIAdapter', 'crewai');
        }
        try {
            const { initializeCrewAIExecutor } = crewai;
            const executor = await initializeCrewAIExecutor({
                agentProfile,
                context,
            });
            const output = await executor.run(task.input || task.description);
            if (logger)
                logger({ type: 'success', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context, output } });
            return {
                output,
                success: true,
                logs: ['CrewAI agent executed successfully.'],
            };
        }
        catch (err) {
            if (logger)
                logger({ type: 'error', adapter: 'CrewAIAdapter', method: 'runAgentTask', payload: { agentProfile, task, context }, error: err });
            return formatError('CrewAIAdapter', 'runAgentTask', err, { agentProfile, task, context });
        }
    }
    async getAgentContext(agentId) {
        return {
            agentId,
            memory: null,
            state: null,
        };
    }
    async listAgents() {
        return [];
    }
}
