// @ts-ignore
import { BaseAgent } from './BaseAgent.js';
// @ts-ignore
import { RAGPipelineUtility } from '../capabilities/RAGPipelineUtility.js';
// @ts-ignore
import { ReasoningLoopUtility } from '../capabilities/ReasoningLoopUtility.js';
// @ts-ignore
import { publishEvent } from '../memoryLaneHelper.js';
/**
 * OrchestratorAgent: Coordinates multi-agent workflows, delegates tasks, and manages dependencies between agents.
 * Implements the Capability interface for unified orchestration and registry.
 */
export class OrchestratorAgent extends BaseAgent {
    name;
    constructor(options) {
        super(options.profile);
        this.name = options.profile.name ?? 'OrchestratorAgent';
    }
    async runTask(task) {
        // Orchestrate RAG, reasoning, and feedback
        const eventAdapter = (event) => publishEvent(event);
        const rag = new RAGPipelineUtility(eventAdapter);
        const reasoning = new ReasoningLoopUtility(eventAdapter);
        const query = typeof task === 'string' ? task : JSON.stringify(task);
        const { output: retrievedChunks, logs: ragLogs } = await rag.runRAGPipeline(query);
        const context = Array.isArray(retrievedChunks) ? retrievedChunks.join('\n') : String(retrievedChunks);
        const { result, log: reasoningLogs } = await reasoning.runLoop(context, {
            structuredReasoning: true,
            uncertaintyThreshold: 0.4,
            feedback: async () => 'accept',
            llmExplain: async (step) => `LLM explanation for: ${step}`,
            llmRepair: async (step) => `LLM repair for: ${step}`
        });
        let safePayload = {};
        if (typeof query === 'string') {
            safePayload = { query, result };
        }
        else {
            safePayload = { query: String(query), result };
        }
        await publishEvent({ type: 'orchestrationComplete', agentId: this.name, timestamp: new Date().toISOString(), payload: safePayload });
        return {
            output: { result },
            success: true,
            logs: ['OrchestratorAgent ran orchestrated workflow', ...ragLogs, ...reasoningLogs]
        };
    }
    static describe() {
        return {
            name: 'OrchestratorAgent',
            description: 'Coordinates multi-agent workflows, delegates tasks, and manages dependencies between agents.',
            license: 'MIT',
            isOpenSource: true,
            provenance: 'https://github.com/nootropic/nootropic',
            docsFirst: true,
            aiFriendlyDocs: true,
            usage: "import { OrchestratorAgent } from 'nootropic/agents';",
            methods: [
                { name: 'runTask', signature: '(task, logger?) => Promise<AgentResult>', description: 'Runs an orchestrated workflow.' },
                { name: 'listTools', signature: '() => Promise<AgentTool[]>', description: 'Lists available tools/plugins.' },
                { name: 'getContext', signature: '() => Promise<AgentContext>', description: 'Returns the agent context.' },
                { name: 'startEventLoop', signature: '() => Promise<void>', description: 'Starts the event-driven runtime loop.' }
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
export async function describe() {
    return {
        name: 'OrchestratorAgent',
        description: 'Stub lifecycle hooks for registry compliance.',
        promptTemplates: [],
        schema: {}
    };
}
