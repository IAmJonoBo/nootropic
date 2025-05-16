import { BaseAgent } from './BaseAgent.js';
export class WriterAgent extends BaseAgent {
    static inputSchema = {
        type: 'object',
        properties: {
            task: {
                type: 'object',
                properties: {
                    contentPlan: { type: 'object', description: 'Structured plan or data for content generation.' }
                },
                required: ['contentPlan']
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
                    content: { type: 'string' }
                },
                required: ['content']
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
            logger({ type: 'start', adapter: 'WriterAgent', method: 'runTask' });
        if (!task || typeof task !== 'object' || !('contentPlan' in task)) {
            return { output: null, success: false, logs: ['Missing or invalid contentPlan in task.'] };
        }
        // For demo: just stringify the contentPlan as the content
        const content = `Generated content based on plan: ${JSON.stringify(task.contentPlan)}`;
        return { output: { content }, success: true, logs: ['WriterAgent generated content (stub)'] };
    }
    static describe() {
        return {
            name: 'WriterAgent',
            description: 'Specialized agent for generating content from structured input. Enforces input/output schemas and supports dynamic tool discovery.',
            methods: [
                { name: 'runTask', signature: '(task, logger?) => Promise<AgentResult>', description: 'Generates content using available tools.' },
                { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists dynamically discovered tools/plugins.' },
                { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' }
            ],
            usage: "const agent = new WriterAgent({ profile }); await agent.runTask({ contentPlan: { ... } });",
            schema: {
                runTask: {
                    input: WriterAgent.inputSchema,
                    output: WriterAgent.outputSchema
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
export default WriterAgent;
