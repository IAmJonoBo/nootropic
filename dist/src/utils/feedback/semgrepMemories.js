import { SastFeedbackMemorySchema } from '../../schemas/SastFeedbackMemorySchema.js';
import { BaseMemoryUtility } from './BaseMemoryUtility.js';
const SEMGREP_MEMORIES_PATH = '.nootropic-cache/semgrep-memories.json';
/**
 * SemgrepMemoriesUtility: Feedback/memory utility for Semgrep findings.
 * Extends BaseMemoryUtility for aggregation, deduplication, and registry compliance.
 */
export class SemgrepMemoriesUtility extends BaseMemoryUtility {
    name = 'semgrepMemories';
    filePath = SEMGREP_MEMORIES_PATH;
    schema = SastFeedbackMemorySchema;
    /**
     * Add a feedback/memory entry for a Semgrep finding.
     */
    async addSemgrepMemory(findingId, memory) {
        const newMemory = this.schema.parse({
            id: findingId,
            tool: 'semgrep',
            ...memory,
            timestamp: memory.timestamp ?? new Date().toISOString(),
            version: '2025.1'
        });
        await this.add(newMemory);
    }
    /**
     * List all feedback/memories for a Semgrep finding.
     */
    async listSemgrepMemories(findingId) {
        const all = await this.list();
        return all.filter(m => m.id === findingId);
    }
    /**
     * Apply memories/feedback to a list of findings.
     */
    async applySemgrepMemories(findings) {
        const all = await this.list();
        // Manual groupBy implementation
        const byId = {};
        for (const m of all) {
            if (!byId[m.id])
                byId[m.id] = [];
            byId[m.id].push(m);
        }
        return findings.map(f => {
            if (typeof f === 'object' && f !== null && 'id' in f && typeof f.id === 'string') {
                const id = f.id;
                return { ...f, memories: byId[id] ?? [] };
            }
            return f;
        });
    }
    /**
     * LLM-powered triage for a Semgrep finding using code context and memories.
     */
    async llmTriageSemgrepFinding(finding, memories) {
        let triage = 'needs_review';
        let rationale = 'LLM triage stub: review required.';
        if (memories?.some(m => m.memoryType === 'false_positive')) {
            triage = 'false_positive';
            rationale = 'Marked as false positive by prior memory.';
        }
        else if (finding.severity === 'ERROR') {
            triage = 'true_positive';
            rationale = 'High severity; likely true positive.';
        }
        const triageMemory = {
            id: finding.id,
            tool: 'semgrep',
            memoryType: 'triage',
            rationale: `[${triage}] ${rationale}`,
            triage,
            timestamp: new Date().toISOString(),
            version: '2025.1'
        };
        await this.addSemgrepMemory(finding.id, triageMemory);
        return { triage, rationale, memory: this.schema.parse(triageMemory) };
    }
    /**
     * Context-aware, proactive agentic triage for a Semgrep finding.
     * Uses the context graph and semantic embeddings (when available) to provide richer triage, rationale, and impact analysis.
     */
    async contextAwareTriageSemgrepFinding(finding, memories) {
        // Stub: Use existing logic, but add placeholders for context/impact
        let triage = 'needs_review';
        let rationale = 'Context-aware triage stub: review required.';
        let impact = [];
        if (memories?.some(m => m.memoryType === 'false_positive')) {
            triage = 'false_positive';
            rationale = 'Marked as false positive by prior memory.';
        }
        else if (finding.severity === 'ERROR') {
            triage = 'true_positive';
            rationale = 'High severity; likely true positive.';
        }
        // TODO: Use context graph and embeddings to populate impact
        return { triage, rationale, impact };
    }
    async health() {
        return { status: 'ok', timestamp: new Date().toISOString() };
    }
}
const semgrepMemories = new SemgrepMemoriesUtility();
export const semgrepMemoriesCapability = {
    name: 'utils/feedback/semgrepMemories',
    describe: () => ({
        ...semgrepMemories.describe(),
        promptTemplates: [
            {
                name: 'Add Semgrep Memory',
                description: 'Add feedback/memory to a Semgrep finding.',
                template: 'addSemgrepMemory(findingId, memory)'
            },
            {
                name: 'List Semgrep Memories',
                description: 'List all feedback/memories for a Semgrep finding.',
                template: 'listSemgrepMemories(findingId)'
            },
            {
                name: 'Apply Semgrep Memories',
                description: 'Attach memories to findings for context-aware remediation.',
                template: 'applySemgrepMemories(findings)'
            },
            {
                name: 'LLM Triage Semgrep Finding',
                description: 'LLM-powered triage for a Semgrep finding.',
                template: 'llmTriageSemgrepFinding(finding, memories?)'
            },
            {
                name: 'Context-Aware Triage',
                description: 'Context-aware, agentic triage for a Semgrep finding.',
                template: 'contextAwareTriageSemgrepFinding(finding, memories?)'
            }
        ],
        usage: [
            'import { addSemgrepMemory, listSemgrepMemories } from "nootropic/utils/feedback/semgrepMemories";',
            'await addSemgrepMemory("semgrep:rule:file:42", { memoryType: "triage", rationale: "False positive", triage: "false_positive" });',
            'const memories = await listSemgrepMemories("semgrep:rule:file:42");'
        ].join('\n'),
        docs: 'See docs/quality.md and types/SastFeedbackMemory.ts for full API, schema, and event hook details.',
        features: [
            'Pluggable, event-driven deduplication',
            'Generic aggregation (by key or custom logic)',
            'Optional event hooks (onAdd, onDeduplicate, onAggregate) for automation and extensibility',
            'Registry/describe/health compliance and LLM/AI-friendliness'
        ],
        schema: SastFeedbackMemorySchema
    }),
    addSemgrepMemory: semgrepMemories.addSemgrepMemory.bind(semgrepMemories),
    listSemgrepMemories: semgrepMemories.listSemgrepMemories.bind(semgrepMemories),
    applySemgrepMemories: semgrepMemories.applySemgrepMemories.bind(semgrepMemories),
    llmTriageSemgrepFinding: semgrepMemories.llmTriageSemgrepFinding.bind(semgrepMemories),
    contextAwareTriageSemgrepFinding: semgrepMemories.contextAwareTriageSemgrepFinding.bind(semgrepMemories),
    init: async function () { },
    reload: async function () { },
    health: async () => semgrepMemories.health()
};
export default semgrepMemoriesCapability;
