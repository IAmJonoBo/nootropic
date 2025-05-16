import { tryDynamicImport, stubResult, formatError } from '../utils/adapterUtils.js';
export class LangChainAdapter {
    async runAgentTask(agentProfile, task, context, logger) {
        if (logger)
            logger({ type: 'start', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
        const langchain = await tryDynamicImport('langchain/agents');
        if (!langchain) {
            if (logger)
                logger({ type: 'fallback', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
            return stubResult('LangChainAdapter', 'langchain');
        }
        try {
            const { initializeAgentExecutor } = langchain;
            const executor = await initializeAgentExecutor({
                agentProfile,
                context,
            });
            const output = await executor.run(task.input || task.description);
            if (logger)
                logger({ type: 'success', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context, output } });
            return {
                output,
                success: true,
                logs: ['LangChain agent executed successfully.'],
            };
        }
        catch (err) {
            if (logger)
                logger({ type: 'error', adapter: 'LangChainAdapter', method: 'runAgentTask', payload: { agentProfile, task, context }, error: err });
            return formatError('LangChainAdapter', 'runAgentTask', err, { agentProfile, task, context });
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
