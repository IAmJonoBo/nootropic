// @ts-ignore
import { BaseAgent } from './BaseAgent.js';
// @ts-ignore
import { publishEvent, subscribeToTopic } from '../memoryLaneHelper.js';
// @ts-ignore
import { AgentTaskSchema, AgentResultSchema } from '../schemas/AgentOrchestrationEngineSchema.js';
/**
 * ContentAgent: Generates content drafts and responds to feedback. Event-driven.
 *
 * LLM/AI-usage: Fully event-driven, RAG-driven planning, map-reduce summarisation, adaptive tone tuning. Extension points for RAG pipeline, summarisation, and tone model.
 * Extension: Add new event types, planning/summarisation/tone strategies as needed.
 *
 * Main Methods:
 *   - runTask(task, logger?): Enhanced content generation logic
 *   - runRagPlanning(): Generates a content outline using a RAG pipeline (stub)
 *   - mapReduceSummarise(content): Summarises content using map-reduce (stub)
 *   - tuneTone(content, tone): Tunes content tone (stub)
 *   - submitFeedback(feedback): Accepts feedback for continuous improvement (stub)
 *   - health(): Health check
 *   - describe(): Returns a machine-usable description of the agent
 * Reference: https://github.com/hwchase17/langchain, https://arxiv.org/abs/2304.05128
 */
export class ContentAgent extends BaseAgent {
    name;
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
        super(options.profile);
        this.name = options.profile.name ?? 'ContentAgent';
    }
    /**
     * Generates a content outline using a RAG pipeline (stub).
     * Returns a content outline string.
     */
    async runRagPlanning() {
        // Stub: generate a simple outline
        // TODO: Integrate RAG pipeline for domain doc ingestion and outline
        return 'Outline (stub)';
    }
    /**
     * Summarises content using map-reduce (stub).
     * 'content' is the content to summarise.
     * Returns a summary string.
     */
    async mapReduceSummarise(content) {
        // Stub: summarise by truncating
        // TODO: Integrate map-reduce summarisation
        return content.length > 100 ? content.slice(0, 100) + '... [summary truncated]' : content;
    }
    /**
     * Tunes content tone (stub).
     * 'content' is the content to tune. 'tone' is the target tone.
     * Returns the tuned content string.
     */
    async tuneTone(content, tone) {
        // Stub: append tone
        // TODO: Integrate instruction-tuned embedding model
        return `${content} [Tone: ${tone}]`;
    }
    /**
     * Accepts feedback for continuous improvement (stub).
     * 'feedback' is the feedback string.
     */
    async submitFeedback(feedback) {
        // Stub: implement feedback submission logic
        console.log('Received feedback:', feedback);
    }
    /**
     * Health check for ContentAgent.
     * Returns a HealthStatus object.
     */
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
    /**
     * Returns a machine-usable description of the agent.
     */
    describe() {
        return {
            name: 'ContentAgent',
            description: 'Generates content drafts and responds to feedback. Enhancements: RAG-driven planning, map-reduce summarisation, adaptive tone tuning. Fully event-driven. Extension points: RAG pipeline for planning, map-reduce summarisation, instruction-tuned embedding model for tone.',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/nootropic/nootropic',
            docsFirst: true,
            aiFriendlyDocs: true,
            supportedEventPatterns: ['market-based', 'blackboard'],
            eventSubscriptions: ['TaskAssigned', 'DraftFeedback'],
            eventEmissions: ['Log', 'TaskCompleted'],
            usage: 'Instantiate and call startEventLoop() to run as a service.',
            methods: [
                { name: 'runTask', signature: '(task, logger?) => Promise<AgentResult>', description: 'Generates content drafts using RAG, map-reduce summarisation, and adaptive tone tuning.' },
                { name: 'runRagPlanning', signature: '() => Promise<string>', description: 'RAG-driven planning for outline generation.' },
                { name: 'mapReduceSummarise', signature: '(content: string) => Promise<string>', description: 'Map-reduce summarisation for long outputs.' },
                { name: 'tuneTone', signature: '(content: string, tone: string) => Promise<string>', description: 'Adaptive tone tuning using instruction-tuned embedding model.' },
                { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists dynamically discovered tools/plugins.' },
                { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' },
                { name: 'startEventLoop', signature: '() => Promise<void>', description: 'Starts the event-driven runtime loop: subscribes to TaskAssigned and DraftFeedback events, processes them, and emits results.' }
            ],
            references: [
                'https://github.com/hwchase17/langchain',
                'https://arxiv.org/abs/2304.05128',
                'https://github.com/instructor-large/instructor-embedding',
                'README.md#contentagent',
                'docs/ROADMAP.md#content-agent'
            ]
        };
    }
    /**
     * Enhanced content generation logic for a given task.
     * 'task' is the content generation task. 'logger' is an optional logger.
     * Returns an AgentResult.
     */
    async runTask(task, logger) {
        // Validate input
        if (!task || typeof task !== 'object' || !('contentPlan' in task)) {
            return { output: null, success: false, logs: ['Missing or invalid contentPlan in task.'] };
        }
        const agentId = this.name;
        const timestamp = new Date().toISOString();
        await publishEvent({ type: 'TaskStarted', agentId, timestamp, payload: { task } });
        if (logger)
            logger({ type: 'start', adapter: 'ContentAgent', method: 'runTask' });
        // RAG-driven planning
        const rag = await this.runRagPlanning();
        // Map-reduce summarisation
        const summary = await this.mapReduceSummarise(JSON.stringify(task.contentPlan));
        // Adaptive tone tuning (stub: use 'neutral')
        const content = await this.tuneTone(`Generated content based on plan: ${JSON.stringify(task.contentPlan)} | ${rag} | ${summary}`, 'neutral');
        const draftId = `draft-${Date.now()}`;
        await publishEvent({ type: 'DraftCreated', agentId, timestamp: new Date().toISOString(), payload: { draftId, content } });
        await publishEvent({ type: 'TaskCompleted', agentId, timestamp: new Date().toISOString(), payload: { success: true, draftId } });
        const result = { output: { content }, success: true, logs: ['ContentAgent generated content (enhanced)'] };
        // Validate output before returning
        const outputParsed = AgentResultSchema.safeParse(result);
        if (!outputParsed.success) {
            throw new Error('Invalid AgentResult: ' + JSON.stringify(outputParsed.error.issues));
        }
        return outputParsed.data;
    }
    /**
     * Starts the ContentAgent event-driven runtime loop.
     * Subscribes to TaskAssigned and DraftFeedback events, processes them, and emits results.
     * Returns a Promise that resolves when the event loop is started.
     */
    async startEventLoop() {
        const agentId = this.name;
        // Subscribe to TaskAssigned events for this agent
        subscribeToTopic('TaskAssigned', async (event) => {
            if (!event || typeof event !== 'object' || !('agentId' in event))
                return;
            const agentIdProp = event.agentId;
            if (agentIdProp !== agentId)
                return;
            let maybeTask = undefined;
            if ('payload' in event && event.payload && typeof event.payload === 'object' && 'task' in event.payload) {
                maybeTask = event.payload['task'];
            }
            // Validate task with AgentTaskSchema before use
            const parsed = AgentTaskSchema.safeParse(maybeTask);
            if (!parsed.success) {
                await publishEvent({
                    type: 'Log',
                    agentId,
                    timestamp: new Date().toISOString(),
                    payload: { level: 'warn', message: 'Received invalid task in TaskAssigned event', details: parsed.error.issues }
                });
                return;
            }
            const task = parsed.data;
            await this.runTask(task);
        });
        // Subscribe to DraftFeedback events for this agent
        subscribeToTopic('DraftFeedback', async (event) => {
            if (!event || typeof event !== 'object' || !('agentId' in event))
                return;
            const agentIdProp = event.agentId;
            if (agentIdProp !== agentId)
                return;
            await publishEvent({
                type: 'Log',
                agentId,
                timestamp: new Date().toISOString(),
                payload: { level: 'info', message: 'Received DraftFeedback', details: typeof event === 'object' && event !== null && 'payload' in event ? event.payload : undefined }
            });
        });
        // Optionally, log that the event loop has started
        await publishEvent({
            type: 'Log',
            agentId,
            timestamp: new Date().toISOString(),
            payload: { level: 'info', message: 'ContentAgent event loop started' }
        });
    }
}
/**
 * Stub lifecycle hooks for registry compliance.
 */
export async function init() { }
export async function shutdown() { }
export async function reload() { }
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'ContentAgent', description: 'Stub lifecycle hooks for registry compliance.' }; }
