import { SastFeedbackMemorySchema } from '../../types/SastFeedbackMemory.js';
import type { SastFeedbackMemory } from '../../types/SastFeedbackMemory.js';
import { BaseMemoryUtility } from './BaseMemoryUtility.js';

const SONARQUBE_MEMORIES_PATH = '.nootropic-cache/sonarqube-memories.json';

/**
 * SonarQubeMemoriesUtility: Feedback/memory utility for SonarQube findings.
 * Extends BaseMemoryUtility for aggregation, deduplication, and registry compliance.
 */
export class SonarQubeMemoriesUtility extends BaseMemoryUtility<SastFeedbackMemory> {
  name = 'sonarQubeMemories';
  filePath = SONARQUBE_MEMORIES_PATH;
  schema = SastFeedbackMemorySchema;

  /**
   * Add a feedback/memory entry for a SonarQube finding.
   */
  async addSonarQubeMemory(findingId: string, memory: Partial<SastFeedbackMemory>) {
    const newMemory: SastFeedbackMemory = this.schema.parse({
      id: findingId,
      tool: 'sonarqube',
      ...memory,
      timestamp: memory.timestamp ?? new Date().toISOString(),
      version: '2025.1'
    });
    await this.add(newMemory);
  }

  /**
   * List all feedback/memories for a SonarQube finding.
   */
  async listSonarQubeMemories(findingId: string): Promise<SastFeedbackMemory[]> {
    const all = await this.list();
    return all.filter(m => m.id === findingId);
  }

  /**
   * Apply memories/feedback to a list of findings.
   */
  async applySonarQubeMemories(findings: unknown[]): Promise<unknown[]> {
    const all = await this.list();
    const byId: Record<string, SastFeedbackMemory[]> = {};
    for (const m of all) {
      if (!byId[m.id]) byId[m.id] = [];
      byId[m.id]!.push(m);
    }
    return findings.map(f => {
      if (typeof f === 'object' && f !== null && 'id' in f && typeof (f as any).id === 'string') {
        const id = (f as { id: string }).id;
        return { ...f, memories: byId[id] ?? [] };
      }
      return f;
    });
  }
}

const sonarQubeMemories = new SonarQubeMemoriesUtility();

export const sonarQubeMemoriesCapability = {
  name: 'utils/feedback/sonarQubeMemories',
  describe: () => ({
    ...sonarQubeMemories.describe(),
    promptTemplates: [
      {
        name: 'Add SonarQube Memory',
        description: 'Add feedback/memory to a SonarQube finding.',
        template: 'addSonarQubeMemory(findingId, memory)'
      },
      {
        name: 'List SonarQube Memories',
        description: 'List all feedback/memories for a SonarQube finding.',
        template: 'listSonarQubeMemories(findingId)'
      },
      {
        name: 'Apply SonarQube Memories',
        description: 'Attach memories to findings for context-aware remediation.',
        template: 'applySonarQubeMemories(findings)'
      }
    ],
    usage: [
      'import { addSonarQubeMemory, listSonarQubeMemories } from "nootropic/utils/feedback/sonarQubeMemories";',
      'await addSonarQubeMemory("sonarqube:rule:file:42", { memoryType: "triage", rationale: "False positive", triage: "false_positive" });',
      'const memories = await listSonarQubeMemories("sonarqube:rule:file:42");'
    ],
    docs: 'See docs/quality.md and types/SastFeedbackMemory.ts for full API, schema, and event hook details.',
    features: [
      'Pluggable, event-driven deduplication',
      'Generic aggregation (by key or custom logic)',
      'Optional event hooks (onAdd, onDeduplicate, onAggregate) for automation and extensibility',
      'Registry/describe/health compliance and LLM/AI-friendliness'
    ],
    schema: SastFeedbackMemorySchema
  }),
  addSonarQubeMemory: sonarQubeMemories.addSonarQubeMemory.bind(sonarQubeMemories),
  listSonarQubeMemories: sonarQubeMemories.listSonarQubeMemories.bind(sonarQubeMemories),
  applySonarQubeMemories: sonarQubeMemories.applySonarQubeMemories.bind(sonarQubeMemories),
  init: async function() {},
  reload: async function() {}
};

export default sonarQubeMemoriesCapability; 