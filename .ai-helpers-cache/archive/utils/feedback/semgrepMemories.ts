// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fs } from 'fs';
import { SastFeedbackMemory, SastFeedbackMemorySchema } from '../../types/SastFeedbackMemory.js';

const SEMGREP_MEMORIES_PATH = '.nootropic-cache/semgrep-memories.json';

/**
 * Add a feedback/memory entry for a Semgrep finding (shared schema).
 */
// @ts-expect-error TS(7010): 'addSemgrepMemory', which lacks return-type annota... Remove this comment to see the full error message
async function addSemgrepMemory(findingId: string, memory: Partial<SastFeedbackMemory>) {
  let memories: Record<string, SastFeedbackMemory[]> = {};
  try {
    const raw = await fs.readFile(SEMGREP_MEMORIES_PATH, 'utf-8');
    memories = JSON.parse(raw);
  } catch {}
  const newMemory: SastFeedbackMemory = SastFeedbackMemorySchema.parse({
    // @ts-expect-error TS(2304): Cannot find name 'findingId'.
    id: findingId,
    tool: 'semgrep',
    // @ts-expect-error TS(2304): Cannot find name 'memory'.
    ...memory,
    // @ts-expect-error TS(2304): Cannot find name 'memory'.
    timestamp: memory.timestamp ?? new Date().toISOString(),
    version: '2025.1'
  });
  // @ts-expect-error TS(2304): Cannot find name 'memories'.
  memories[findingId] ??= [];
  // Strict deduplication: do not add if identical memory exists
  // @ts-expect-error TS(2304): Cannot find name 'memories'.
  if (!memories[findingId].some(m =>
    // @ts-expect-error TS(2304): Cannot find name 'm'.
    m.rationale === newMemory.rationale &&
    // @ts-expect-error TS(2304): Cannot find name 'm'.
    m.memoryType === newMemory.memoryType &&
    // @ts-expect-error TS(2304): Cannot find name 'm'.
    m.file === newMemory.file &&
    // @ts-expect-error TS(2304): Cannot find name 'm'.
    m.line === newMemory.line
  )) {
    // @ts-expect-error TS(2304): Cannot find name 'memories'.
    memories[findingId].push(newMemory);
  }
  // @ts-expect-error TS(2304): Cannot find name 'memories'.
  await fs.writeFile(SEMGREP_MEMORIES_PATH, JSON.stringify(memories, null, 2));
}

/**
 * List all feedback/memories for a Semgrep finding (shared schema).
 */
// @ts-expect-error TS(6133): 'findingId' is declared but its value is never rea... Remove this comment to see the full error message
async function listSemgrepMemories(findingId: string): Promise<SastFeedbackMemory[]> {
  try {
    // @ts-expect-error TS(2304): Cannot find name 'raw'.
    const raw = await fs.readFile(SEMGREP_MEMORIES_PATH, 'utf-8');
    // @ts-expect-error TS(2304): Cannot find name 'memories'.
    const memories = JSON.parse(raw);
    // @ts-expect-error TS(6133): 'memories' is declared but its value is never read... Remove this comment to see the full error message
    return (memories[findingId] ?? []).map((m: unknown) => SastFeedbackMemorySchema.parse(m));
  } catch {
    return [];
  }
}

/**
 * Apply memories/feedback to a list of findings (shared schema).
 */
// @ts-expect-error TS(6133): 'findings' is declared but its value is never read... Remove this comment to see the full error message
async function applySemgrepMemories(findings: unknown[]): Promise<unknown[]> {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let memories: Record<string, SastFeedbackMemory[]> = {};
  try {
    const raw = await fs.readFile(SEMGREP_MEMORIES_PATH, 'utf-8');
    // @ts-expect-error TS(2304): Cannot find name 'memories'.
    memories = JSON.parse(raw);
  } catch {}
  return findings.map(f => (typeof f === 'object' && f !== null ? { ...f, memories: memories[(f as { id: string }).id] ?? [] } : f));
}

/**
 * LLM-powered triage for a Semgrep finding using code context and memories (shared schema).
 */
async function llmTriageSemgrepFinding(
  finding: { id: string; severity?: string },
  // @ts-expect-error TS(6133): 'memories' is declared but its value is never read... Remove this comment to see the full error message
  memories?: SastFeedbackMemory[]
// @ts-expect-error TS(2349): This expression is not callable.
): Promise<{ triage: 'true_positive' | 'false_positive' | 'needs_review'; rationale: string; memory?: SastFeedbackMemory }> {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let triage: 'true_positive' | 'false_positive' | 'needs_review' = 'needs_review';
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let rationale = 'LLM triage stub: review required.';
  // @ts-expect-error TS(6133): 'memories' is declared but its value is never read... Remove this comment to see the full error message
  if (memories?.some(m => m.memoryType === 'false_positive')) {
    // @ts-expect-error TS(2304): Cannot find name 'triage'.
    triage = 'false_positive';
    // @ts-expect-error TS(2304): Cannot find name 'rationale'.
    rationale = 'Marked as false positive by prior memory.';
  // @ts-expect-error TS(2304): Cannot find name 'finding'.
  } else if (finding.severity === 'ERROR') {
    // @ts-expect-error TS(2304): Cannot find name 'triage'.
    triage = 'true_positive';
    // @ts-expect-error TS(2304): Cannot find name 'rationale'.
    rationale = 'High severity; likely true positive.';
  }
  const triageMemory: Partial<SastFeedbackMemory> = {
    // @ts-expect-error TS(2304): Cannot find name 'finding'.
    id: finding.id,
    // @ts-expect-error TS(2304): Cannot find name 'tool'.
    tool: 'semgrep',
    // @ts-expect-error TS(2304): Cannot find name 'memoryType'.
    memoryType: 'triage',
    // @ts-expect-error TS(2304): Cannot find name 'rationale'.
    rationale: `[${triage}] ${rationale}`,
    triage,
    timestamp: new Date().toISOString(),
    version: '2025.1'
  };
  await addSemgrepMemory(finding.id, triageMemory);
  return { triage, rationale, memory: SastFeedbackMemorySchema.parse(triageMemory) };
}

/**
 * Context-aware, proactive agentic triage for a Semgrep finding.
 * Uses the context graph and semantic embeddings (when available) to provide richer triage, rationale, and impact analysis.
 *
 * TODO: Implement full context/impact analysis using .nootropic-cache/context-graph.json and semantic-embeddings.json
 */
export async function contextAwareTriageSemgrepFinding(
  finding: { id: string; severity?: string },
  memories?: SastFeedbackMemory[]
): Promise<{ triage: string; rationale: string; impact: string[]; memory?: SastFeedbackMemory }> {
  // Stub: Use existing logic, but add placeholders for context/impact
  let triage: string = 'needs_review';
  let rationale = 'Context-aware triage stub: review required.';
  let impact: string[] = [];
  if (memories?.some(m => m.memoryType === 'false_positive')) {
    triage = 'false_positive';
    rationale = 'Marked as false positive by prior memory.';
  } else if (finding.severity === 'ERROR') {
    triage = 'true_positive';
    rationale = 'High severity; likely true positive.';
  }
  // TODO: Use context graph and embeddings to populate impact
  return { triage, rationale, impact };
}

function describe() {
  return {
    name: 'utils/feedback/semgrepMemories',
    description: 'Modular Semgrep feedback/memories logic for LLM/agent workflows. Registry/LLM/AI-compliant.',
    methods: [
      { name: 'addSemgrepMemory', signature: '(findingId: string, memory: Partial<SastFeedbackMemory>) => Promise<void>', description: 'Add a feedback/memory entry for a Semgrep finding.' },
      { name: 'listSemgrepMemories', signature: '(findingId: string) => Promise<SastFeedbackMemory[]>', description: 'List all feedback/memories for a Semgrep finding.' },
      { name: 'applySemgrepMemories', signature: '(findings: unknown[]) => Promise<unknown[]>', description: 'Apply memories/feedback to a list of findings.' },
      { name: 'llmTriageSemgrepFinding', signature: '(finding: unknown, memories?: SastFeedbackMemory[]) => Promise<{ triage, rationale, memory }>', description: 'LLM-powered triage for a Semgrep finding.' },
      { name: 'contextAwareTriageSemgrepFinding', signature: '(finding: unknown, memories?: SastFeedbackMemory[]) => Promise<{ triage, rationale, impact, memory }>', description: 'Context-aware, proactive agentic triage for a Semgrep finding.' }
    ],
    schema: {
      addSemgrepMemory: {
        input: { type: 'object', properties: { findingId: { type: 'string' }, memory: { type: 'object' } }, required: ['findingId', 'memory'] },
        output: { type: 'null', description: 'No output (side effect: memory stored)' }
      },
      listSemgrepMemories: {
        input: { type: 'object', properties: { findingId: { type: 'string' } }, required: ['findingId'] },
        output: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' }
      },
      applySemgrepMemories: {
        input: { type: 'array', items: { type: 'object' }, description: 'Array of findings' },
        output: { type: 'array', items: { type: 'object' }, description: 'Array of findings with memories' }
      },
      llmTriageSemgrepFinding: {
        input: { type: 'object', properties: { finding: { type: 'object' }, memories: { type: 'array', items: { type: 'object' } } }, required: ['finding'] },
        output: { type: 'object', description: '{ triage, rationale, memory }' }
      },
      contextAwareTriageSemgrepFinding: {
        input: { type: 'object', properties: { finding: { type: 'object' }, memories: { type: 'array', items: { type: 'object' } } }, required: ['finding'] },
        output: { type: 'object', description: '{ triage, rationale, impact, memory }' }
      }
    },
    docsFirst: true,
    aiFriendlyDocs: true,
    promptTemplates: [
      {
        name: 'Add Semgrep Memory',
        description: 'Prompt for instructing the agent or LLM to add a feedback/memory entry for a Semgrep finding.',
        template: 'Add a feedback/memory entry for Semgrep finding "{{findingId}}" with rationale: {{rationale}} and type: {{memoryType}}.',
        usage: 'Used by addSemgrepMemory.'
      },
      {
        name: 'List Semgrep Memories',
        description: 'Prompt for instructing the agent or LLM to list all feedback/memories for a Semgrep finding.',
        template: 'List all feedback/memories for Semgrep finding "{{findingId}}".',
        usage: 'Used by listSemgrepMemories.'
      },
      {
        name: 'Apply Semgrep Memories',
        description: 'Prompt for instructing the agent or LLM to apply all relevant memories to a list of findings.',
        template: 'Apply all relevant memories to the findings list.',
        usage: 'Used by applySemgrepMemories.'
      },
      {
        name: 'LLM Triage Semgrep Finding',
        description: 'Prompt for instructing the agent or LLM to triage a Semgrep finding using all available memories.',
        template: 'Triage the finding "{{findingId}}" using all available memories. Return triage, rationale, and memory.',
        usage: 'Used by llmTriageSemgrepFinding.'
      },
      {
        name: 'Context-Aware Triage Semgrep Finding',
        description: 'Prompt for instructing the agent or LLM to perform context-aware triage for a Semgrep finding using all available memories.',
        template: 'Perform context-aware triage for finding "{{findingId}}" using all available memories. Return triage, rationale, impact, and memory.',
        usage: 'Used by contextAwareTriageSemgrepFinding.'
      }
    ],
    references: ['types/SastFeedbackMemory.js']
  };
}

export const semgrepMemoriesCapability = {
  name: 'utils/feedback/semgrepMemories',
  describe,
  schema: describe().schema,
  addSemgrepMemory,
  listSemgrepMemories,
  applySemgrepMemories,
  llmTriageSemgrepFinding,
  contextAwareTriageSemgrepFinding,
  init: async function() {},
  reload: async function() {}
};

export default semgrepMemoriesCapability; 