import { BaseAgent } from './BaseAgent.js';
export class ReviewerAgent extends BaseAgent {
    static inputSchema = {
        type: 'object',
        properties: {
            task: {
                type: 'object',
                properties: {
                    content: { type: 'string', description: 'Content to review.' }
                },
                required: ['content']
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
                    review: { type: 'string' },
                    score: { type: 'number' }
                },
                required: ['review', 'score']
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
            logger({ type: 'start', adapter: 'ReviewerAgent', method: 'runTask' });
        if (!task || typeof task !== 'object' || !('content' in task)) {
            return { output: null, success: false, logs: ['Missing or invalid content in task.'] };
        }
        // For demo: simple review logic
        const review = `Reviewed content: ${task.content}`;
        const score = (task.content.length % 10) + 1; // Dummy score
        return { output: { review, score }, success: true, logs: ['ReviewerAgent reviewed content (stub)'] };
    }
    static describe() {
        return {
            name: 'ReviewerAgent',
            description: 'Specialized agent for reviewing content. Enforces input/output schemas and supports dynamic tool discovery.',
            methods: [
                { name: 'runTask', signature: '(task, logger?) => Promise<AgentResult>', description: 'Reviews content using available tools.' },
                { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists dynamically discovered tools/plugins.' },
                { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' }
            ],
            usage: "const agent = new ReviewerAgent({ profile }); await agent.runTask({ content: '...' });",
            schema: {
                runTask: {
                    input: ReviewerAgent.inputSchema,
                    output: ReviewerAgent.outputSchema
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
export default ReviewerAgent;
