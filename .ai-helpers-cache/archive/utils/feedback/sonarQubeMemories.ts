// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fs } from 'fs';
import { SastFeedbackMemory, SastFeedbackMemorySchema } from '../../types/SastFeedbackMemory.js';

const SONARQUBE_MEMORIES_PATH = '.nootropic-cache/sonarqube-memories.json';

/**
 * Add a feedback/memory entry for a SonarQube finding (shared schema).
 */
// @ts-expect-error TS(7010): 'addSonarQubeMemory', which lacks return-type anno... Remove this comment to see the full error message
async function addSonarQubeMemory(findingId: string, memory: Partial<SastFeedbackMemory>) {
  let memories: Record<string, SastFeedbackMemory[]> = {};
  try {
    const raw = await fs.readFile(SONARQUBE_MEMORIES_PATH, 'utf-8');
    memories = JSON.parse(raw);
  } catch {}
  const newMemory: SastFeedbackMemory = SastFeedbackMemorySchema.parse({
    // @ts-expect-error TS(2304): Cannot find name 'findingId'.
    id: findingId,
    tool: 'sonarqube',
    // @ts-expect-error TS(2304): Cannot find name 'memory'.
    ...memory,
    // @ts-expect-error TS(2304): Cannot find name 'memory'.
    timestamp: memory.timestamp ?? new Date().toISOString(),
    version: '2025.1'
  });
  // @ts-expect-error TS(2304): Cannot find name 'memories'.
  memories[findingId] ??= [];
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
  await fs.writeFile(SONARQUBE_MEMORIES_PATH, JSON.stringify(memories, null, 2));
}

/**
 * List all feedback/memories for a SonarQube finding (shared schema).
 */
// @ts-expect-error TS(6133): 'findingId' is declared but its value is never rea... Remove this comment to see the full error message
async function listSonarQubeMemories(findingId: string): Promise<SastFeedbackMemory[]> {
  try {
    // @ts-expect-error TS(2304): Cannot find name 'raw'.
    const raw = await fs.readFile(SONARQUBE_MEMORIES_PATH, 'utf-8');
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
async function applySonarQubeMemories(findings: unknown[]): Promise<unknown[]> {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let memories: Record<string, SastFeedbackMemory[]> = {};
  try {
    const raw = await fs.readFile(SONARQUBE_MEMORIES_PATH, 'utf-8');
    // @ts-expect-error TS(2304): Cannot find name 'memories'.
    memories = JSON.parse(raw);
  } catch {}
  return findings.map(f => ({ ...f, memories: (memories[f.id] ?? []).map((m: unknown) => SastFeedbackMemorySchema.parse(m)) }));
}

function describe() {
  return {
    name: 'utils/feedback/sonarQubeMemories',
    description: 'Modular SonarQube feedback/memories logic for LLM/agent workflows. Registry/LLM/AI-compliant.',
    methods: [
      { name: 'addSonarQubeMemory', signature: '(findingId: string, memory: Partial<SastFeedbackMemory>) => Promise<void>', description: 'Add a feedback/memory entry for a SonarQube finding.' },
      { name: 'listSonarQubeMemories', signature: '(findingId: string) => Promise<SastFeedbackMemory[]>', description: 'List all feedback/memories for a SonarQube finding.' },
      { name: 'applySonarQubeMemories', signature: '(findings: unknown[]) => Promise<unknown[]>', description: 'Apply memories/feedback to a list of findings.' }
    ],
    schema: {
      addSonarQubeMemory: {
        input: { type: 'object', properties: { findingId: { type: 'string' }, memory: { type: 'object' } }, required: ['findingId', 'memory'] },
        output: { type: 'null', description: 'No output (side effect: memory stored)' }
      },
      listSonarQubeMemories: {
        input: { type: 'object', properties: { findingId: { type: 'string' } }, required: ['findingId'] },
        output: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' }
      },
      applySonarQubeMemories: {
        input: { type: 'array', items: { type: 'object' }, description: 'Array of findings' },
        output: { type: 'array', items: { type: 'object' }, description: 'Array of findings with memories' }
      }
    },
    docsFirst: true,
    aiFriendlyDocs: true,
    references: ['types/SastFeedbackMemory.js']
  };
}

export const sonarQubeMemoriesCapability = {
  name: 'utils/feedback/sonarQubeMemories',
  describe,
  schema: describe().schema,
  addSonarQubeMemory,
  listSonarQubeMemories,
  applySonarQubeMemories,
  init: async function() {},
  reload: async function() {},
};

export default sonarQubeMemoriesCapability; 