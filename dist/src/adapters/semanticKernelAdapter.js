// @ts-ignore
import { tryDynamicImport, stubResult, formatError } from '../utils/plugin/adapterUtils.js';
/**
 * SemanticKernelAdapter: Adapter for Semantic Kernel agent orchestration. Implements both AgentOrchestrationEngine and Capability for registry/discoverability.
 */
export class SemanticKernelAdapter {
    name = 'SemanticKernelAdapter';
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
            // TODO: Replace with proper type import when available
            const initializeKernelExecutor = sk['initializeKernelExecutor'];
            if (typeof initializeKernelExecutor !== 'function') {
                throw new Error('initializeKernelExecutor is not a function');
            }
            const executor = await initializeKernelExecutor({
                agentProfile,
                context,
            });
            const output = await executor.run('input' in task && task.input !== undefined ? task.input : task.description);
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
        return { agentId };
    }
    async listAgents() {
        return [];
    }
    /**
     * Optional: Initialize the capability (no-op for now).
     */
    async init() {
        // No-op for now
    }
    /**
     * Optional: Hot-reload logic (no-op for now).
     */
    async reload() {
        // No-op for now
    }
    /**
     * Health check for capability status.
     */
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    /**
     * Returns a machine-usable, LLM-friendly description of the adapter capability.
     * NOTE: Keep this in sync with the Capability interface in capabilities/Capability.ts.
     */
    describe() {
        return {
            name: 'SemanticKernelAdapter',
            description: 'Adapter for Semantic Kernel agent orchestration. Supports event-driven agent tasks and context management. Follows 2025 docs-first and LLM-friendly best practices.',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/microsoft/semantic-kernel',
            methods: [
                { name: 'runAgentTask', signature: '(agentProfile, task, context?, logger?) => Promise<AgentResult>', description: 'Runs a task using a Semantic Kernel agent.' },
                { name: 'getAgentContext', signature: '(agentId: string) => Promise<AgentContext>', description: 'Returns the agent context.' },
                { name: 'listAgents', signature: '() => Promise<AgentProfile[]>', description: 'Lists available agents.' }
            ],
            usage: "import { SemanticKernelAdapter } from 'nootropic/adapters/semanticKernelAdapter'; const adapter = new SemanticKernelAdapter(); await adapter.runAgentTask(profile, task);",
            schema: {
                runAgentTask: {
                    input: {
                        type: 'object',
                        properties: {
                            agentProfile: { type: 'object' },
                            task: { type: 'object' },
                            context: { type: ['object', 'null'] },
                            logger: { type: ['function', 'null'] }
                        },
                        required: ['agentProfile', 'task']
                    },
                    output: { type: 'object', description: 'AgentResult' }
                },
                getAgentContext: {
                    input: { type: 'string', description: 'agentId' },
                    output: { type: 'object', description: 'AgentContext' }
                },
                listAgents: {
                    input: { type: 'null' },
                    output: { type: 'array', items: { type: 'object', description: 'AgentProfile' } }
                }
            },
            docsFirst: true,
            aiFriendlyDocs: true,
            references: [
                'https://github.com/microsoft/semantic-kernel',
                'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3'
            ]
        };
    }
}
export async function init() { }
export async function shutdown() { }
export async function reload() { }
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'semanticKernelAdapter', description: 'Stub lifecycle hooks for registry compliance.' }; }
