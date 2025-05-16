import { BaseAgent } from './BaseAgent.js';
export class DataCollectorAgent extends BaseAgent {
    static inputSchema = {
        type: 'object',
        properties: {
            task: {
                type: 'object',
                properties: {
                    query: { type: 'string', description: 'The data query or topic to collect.' }
                },
                required: ['query']
            },
            logger: { type: ['function', 'null'] }
        },
        required: ['task']
    };
    static outputSchema = {
        type: 'object',
        properties: {
            output: {
                type: 'object',
                properties: {
                    data: { type: 'object' }
                },
                required: ['data']
            },
            success: { type: 'boolean' },
            logs: { type: 'array', items: { type: 'string' } }
        },
        required: ['output', 'success']
    };
    constructor(options) {
        super(options);
    }
    async runTask(task, logger) {
        if (logger)
            logger({ type: 'start', adapter: 'DataCollectorAgent', method: 'runTask' });
        // Validate input
        if (!task || typeof task !== 'object' || !('query' in task)) {
            return { output: null, success: false, logs: ['Missing or invalid query in task.'] };
        }
        // Discover tools
        const tools = await this.listTools();
        // For demo: call all tools with the query and aggregate results
        const results = {};
        const logs = [];
        for (const tool of tools) {
            try {
                if (typeof tool.run === 'function') {
                    results[tool.name] = await tool.run({ query: task.query });
                    logs.push(`Tool ${tool.name} succeeded.`);
                }
            }
            catch (e) {
                logs.push(`Tool ${tool.name} failed: ${e}`);
            }
        }
        return { output: { data: results }, success: true, logs };
    }
    static describe() {
        return {
            name: 'DataCollectorAgent',
            description: 'Specialized agent for gathering data from tools/plugins. Enforces input/output schemas and supports dynamic tool discovery.',
            methods: [
                { name: 'runTask', signature: '(task, logger?) => Promise<AgentResult>', description: 'Collects data using available tools.' },
                { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists dynamically discovered tools/plugins.' },
                { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' }
            ],
            usage: "const agent = new DataCollectorAgent({ profile }); await agent.runTask({ query: 'collect info' });",
            schema: {
                runTask: {
                    input: DataCollectorAgent.inputSchema,
                    output: DataCollectorAgent.outputSchema
                },
                listTools: {
                    input: { type: 'null' },
                    output: { type: 'array', items: { type: 'object', properties: { name: { type: 'string' } } } }
                },
                getContext: {
                    input: { type: 'null' },
                    output: { type: 'object', properties: { agentId: { type: 'string' } } }
                }
            }
        };
    }
}
export default DataCollectorAgent;
