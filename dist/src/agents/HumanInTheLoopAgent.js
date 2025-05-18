// @ts-ignore
import { BaseAgent } from './BaseAgent.js';
/**
 * HumanInTheLoopAgent: Manages human approval, intervention, or feedback steps in workflows.
 * Implements the Capability interface for unified orchestration and registry.
 */
export class HumanInTheLoopAgent extends BaseAgent {
    name;
    constructor(options) {
        super(options.profile);
        this.name = options.profile.name ?? 'HumanInTheLoopAgent';
    }
    async runTask(task) {
        const safeTask = (typeof task === 'object' && task !== null) ? task : { value: task };
        const logs = [];
        const events = [];
        const emitEvent = async (event) => {
            const agentEvent = {
                type: event.type,
                agentId: this.name,
                timestamp: new Date().toISOString(),
                ...(event.payload !== undefined ? { payload: event.payload } : {})
            };
            events.push(agentEvent);
            // (stub) Would publish event to event bus
        };
        // === Governance-Driven HITL ===
        const governanceResult = await this.governanceThresholdStub();
        await emitEvent({ type: 'governanceCheckpoint', payload: { input: safeTask, result: governanceResult } });
        logs.push(`Governance-Driven HITL: (stub) ${governanceResult}`);
        // === Active Learning Loops ===
        const activeLearningResult = await this.activeLearningStub();
        await emitEvent({ type: 'activeLearning', payload: { input: safeTask, result: activeLearningResult } });
        logs.push(`Active Learning: (stub) ${activeLearningResult}`);
        // === Reciprocal Learning (RHML) ===
        const reciprocalLearningResult = await this.reciprocalLearningStub();
        await emitEvent({ type: 'reciprocalLearning', payload: { input: safeTask, result: reciprocalLearningResult } });
        logs.push(`Reciprocal Learning: (stub) ${reciprocalLearningResult}`);
        // === Event-Driven Checkpoints ===
        await emitEvent({ type: 'checkpoint', payload: { input: safeTask, status: 'stub' } });
        logs.push('Event-Driven Checkpoints: (stub) Would emit events for all HITL checkpoints.');
        return { output: { echo: safeTask }, success: true, logs: [...logs, ...events.map(e => `[event] ${e.type}: ${JSON.stringify((e && typeof e === 'object' && 'payload' in e ? e.payload : {}) ?? {})}`)] };
    }
    // Stub for governance thresholding
    async governanceThresholdStub() {
        // TODO: Integrate real confidence thresholding and human review
        return '[Governance Threshold] (stub)';
    }
    // Stub for active learning
    async activeLearningStub() {
        // TODO: Integrate real active learning logic
        return '[Active Learning] (stub)';
    }
    // Stub for reciprocal learning
    async reciprocalLearningStub() {
        // TODO: Integrate real reciprocal learning logic
        return '[Reciprocal Learning] (stub)';
    }
    // TODO: humanInTheLoopStub is intentionally omitted; add if needed for future extension.
    static eventSchemas = {
        governanceCheckpoint: { type: 'object', properties: { input: {}, result: { type: 'string' } }, required: ['input', 'result'] },
        activeLearning: { type: 'object', properties: { input: {}, result: { type: 'string' } }, required: ['input', 'result'] },
        reciprocalLearning: { type: 'object', properties: { input: {}, result: { type: 'string' } }, required: ['input', 'result'] },
        checkpoint: { type: 'object', properties: { input: {}, status: { type: 'string' } }, required: ['input', 'status'] }
    };
    /**
     * Initialize the agent (stub).
     */
    async init() { }
    /**
     * Shutdown the agent (stub).
     */
    async shutdown() { }
    /**
     * Reload the agent (stub).
     */
    async reload() { }
    static describe() {
        return {
            name: 'HumanInTheLoopAgent',
            description: 'Embeds human review and feedback into agentic workflows, supporting governance, active learning, and reciprocal learning. Advanced features: governance-driven HITL, active learning loops, reciprocal learning (RHML), event-driven checkpoints. Extension points: governance/review frameworks, active/reciprocal learning, event schemas, annotation UIs. Best practices: Use confidence thresholds to trigger human review, store and leverage human corrections, emit events for all checkpoints and reviews, document extension points and rationale. Reference: RHML, enterprise HITL frameworks.',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/nootropic/nootropic',
            docsFirst: true,
            aiFriendlyDocs: true,
            usage: "import { HumanInTheLoopAgent } from 'nootropic/agents';",
            methods: [
                { name: 'runTask', signature: '(task) => Promise<AgentResult>', description: 'Runs a human-in-the-loop task.' },
                { name: 'init', signature: '() => Promise<void>', description: 'Initialize the agent.' },
                { name: 'shutdown', signature: '() => Promise<void>', description: 'Shutdown the agent.' },
                { name: 'reload', signature: '() => Promise<void>', description: 'Reload the agent.' },
                { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists available tools/plugins.' },
                { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' },
                { name: 'startEventLoop', signature: '() => Promise<void>', description: 'Starts the event-driven runtime loop.' },
                { name: 'health', signature: '() => Promise<HealthStatus>', description: 'Health check for HumanInTheLoopAgent.' }
            ],
            schema: {},
            references: [
                'https://github.com/nootropic/nootropic',
                'https://github.com/nootropic/nootropic/blob/main/README.md'
            ],
            bestPractices: [
                'Strict TypeScript',
                'Type-safe event-driven patterns',
                'Automated documentation (TSDoc, TypeDoc, describe())',
                'CI enforcement of docs/code sync'
            ]
        };
    }
    describe() {
        return this.constructor.describe();
    }
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
export async function init() { }
export async function shutdown() { }
export async function reload() { }
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() { return { name: 'HumanInTheLoopAgent', description: 'Stub lifecycle hooks for registry compliance.' }; }
