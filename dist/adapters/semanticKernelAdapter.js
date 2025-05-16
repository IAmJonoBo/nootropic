import { tryDynamicImport, stubResult, formatError } from '../utils/adapterUtils.js';
export class SemanticKernelAdapter {
    async runAgentTask(agentProfile, task, context, logger) {
        if (logger)
            logger({ type: 'start', adapter: 'SemanticKernelAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
        const sk = await tryDynamicImport('@microsoft/semantic-kernel');
        if (!sk) {
            if (logger)
                logger({ type: 'fallback', adapter: 'SemanticKernelAdapter', method: 'runAgentTask', payload: { agentProfile, task, context } });
            return stubResult('SemanticKernelAdapter', '@microsoft/semantic-kernel');
        }
        try {
            const { initializeKernelExecutor } = sk;
            const executor = await initializeKernelExecutor({
                agentProfile,
                context,
            });
            const output = await executor.run(task.input || task.description);
            if (logger)
                logger({ type: 'success', adapter: 'SemanticKernelAdapter', method: 'runAgentTask', payload: { agentProfile, task, context, output } });
            return {
                output,
                success: true,
                logs: ['Semantic Kernel agent executed successfully.'],
            };
        }
        catch (err) {
            if (logger)
                logger({ type: 'error', adapter: 'SemanticKernelAdapter', method: 'runAgentTask', payload: { agentProfile, task, context }, error: err });
            return formatError('SemanticKernelAdapter', 'runAgentTask', err, { agentProfile, task, context });
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
