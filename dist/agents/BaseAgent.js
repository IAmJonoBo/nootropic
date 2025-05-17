// nootropic: BaseAgent class for modular, extensible agent logic
// Supports dynamic tool discovery, structured output enforcement, and LLM/agent introspection
import { getPlugins } from '../pluginRegistry.js';
export class BaseAgent {
    profile;
    context;
    tools = [];
    constructor(options) {
        this.profile = options.profile;
        this.context = options.context;
    }
    // Dynamically discover available tools/plugins
    async listTools() {
        const plugins = await getPlugins();
        return plugins.map(p => ({
            name: p.name,
            run: typeof p.run === 'function' ? p.run : async () => undefined,
            describe: p.describe
        }));
    }
    // Run a task using available tools (stub: override in subclasses)
    async runTask(task, logger) {
        if (logger)
            logger({ type: 'start', adapter: 'BaseAgent', method: 'runTask' });
        // Example: just echo the task for now
        return { output: { echo: task }, success: true, logs: ['BaseAgent ran task (stub)'] };
    }
    // Get agent context (stub: override in subclasses)
    async getContext() {
        return this.context || { agentId: this.profile.name };
    }
    // Introspect agent capabilities for LLM/agent use
    static describe() {
        return {
            name: 'BaseAgent',
            description: 'Modular, extensible agent class with dynamic tool discovery and structured output.',
            methods: [
                { name: 'runTask', signature: '(task, logger?) => Promise<AgentResult>', description: 'Runs a task using available tools.' },
                { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists dynamically discovered tools/plugins.' },
                { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' }
            ],
            usage: "const agent = new BaseAgent({ profile }); await agent.runTask(task);",
            schema: {
                runTask: {
                    input: {
                        type: 'object',
                        properties: { task: { type: 'object' }, logger: { type: ['function', 'null'] } },
                        required: ['task']
                    },
                    output: { type: 'object', properties: { output: {}, success: { type: 'boolean' }, logs: { type: 'array', items: { type: 'string' } } }, required: ['success'] }
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
