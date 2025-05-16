// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fs } from 'fs';
import { SastFeedbackMemory, SastFeedbackMemorySchema } from '../../types/SastFeedbackMemory.js';
import { trace } from '@opentelemetry/api';
import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';

// @ts-expect-error TS(6133): 'SEMGREP_MEMORIES_PATH' is declared but its value ... Remove this comment to see the full error message
const SEMGREP_MEMORIES_PATH = '.nootropic-cache/semgrep-memories.json';
// @ts-expect-error TS(6133): 'SONARQUBE_MEMORIES_PATH' is declared but its valu... Remove this comment to see the full error message
const SONARQUBE_MEMORIES_PATH = '.nootropic-cache/sonarqube-memories.json';
// @ts-expect-error TS(6133): 'SAST_MEMORIES_PATH' is declared but its value is ... Remove this comment to see the full error message
const SAST_MEMORIES_PATH = '.nootropic-cache/sast-memories.json';

/**
 * sastMemories: Deduplicates, lists, and syncs SAST feedback memories across tools.
 *
 * LLM/AI-usage: Designed for robust, machine-usable SAST feedback memory management in agent workflows. Extension points for new memory types, adapters, or deduplication strategies.
 * Extension: Add new memory types, adapters, or deduplication/merge strategies as needed.
 *
 * Main Functions:
 *   - loadAllMemories(): Load all SAST feedback memories
 *   - deduplicateMemories(memories): Deduplicate memories by id, tool, and context
 *   - listAllSastMemories(): List all deduplicated SAST memories
 *   - getMemoriesForFile(file): Get all memories for a given file
 *   - getMemoriesForRule(ruleId): Get all memories for a given ruleId
 *   - syncWithRemote(localMemories, remoteAdapter): Sync local SAST memories with remote storage
 *   - mergeWithRemote(local, remote): Merge local and remote SAST memories
 */

/**
 * Load all memories from all tool-specific files.
 */
export async function loadAllMemories(): Promise<SastFeedbackMemory[]> {
  // @ts-expect-error TS(2304): Cannot find name 'all'.
  const all: SastFeedbackMemory[] = [];
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  for (const path of [SEMGREP_MEMORIES_PATH, SONARQUBE_MEMORIES_PATH]) {
    try {
      const raw = await fs.readFile(path, 'utf-8');
      const memories = JSON.parse(raw);
      for (const arr of Object.values(memories)) {
        if (Array.isArray(arr)) {
          for (const m of arr) {
            // @ts-expect-error TS(2304): Cannot find name 'all'.
            try { all.push(SastFeedbackMemorySchema.parse(m)); } catch {}
          }
        }
      }
    } catch {}
  }
  // @ts-expect-error TS(2304): Cannot find name 'all'.
  return all;
}

/**
 * Deduplicate memories by id, tool, and context.
 */
// @ts-expect-error TS(2355): A function whose declared type is neither 'void' n... Remove this comment to see the full error message
export function deduplicateMemories(memories: SastFeedbackMemory[]): SastFeedbackMemory[] {
  // @ts-expect-error TS(2693): 'string' only refers to a type, but is being used ... Remove this comment to see the full error message
  const map = new Map<string, SastFeedbackMemory>();
  for (const m of memories) {
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const key = `${m.id}|${m.tool}|${JSON.stringify(m.context ?? {})}`;
    if (!map.has(key)) map.set(key, m);
    // Optionally merge rationale/tags if duplicate
  }
  return Array.from(map.values());
}

/**
 * List all deduplicated SAST memories (across tools).
 */
export async function listAllSastMemories(): Promise<SastFeedbackMemory[]> {
  const all = await loadAllMemories();
  const deduped = deduplicateMemories(all);
  // Persist canonical merged view
  await fs.writeFile(SAST_MEMORIES_PATH, JSON.stringify(deduped, null, 2));
  return deduped;
}

/**
 * Get all memories for a given file.
 */
export async function getMemoriesForFile(file: string): Promise<SastFeedbackMemory[]> {
  const all = await listAllSastMemories();
  return all.filter(m => m.file === file);
}

/**
 * Get all memories for a given ruleId.
 */
export async function getMemoriesForRule(ruleId: string): Promise<SastFeedbackMemory[]> {
  const all = await listAllSastMemories();
  return all.filter(m => m.ruleId === ruleId);
}

/**
 * Syncs local SAST feedback memories with a remote adapter instance.
 * localMemories: Local SAST feedback memories
 * remoteAdapter: Remote adapter instance
 */
export async function syncWithRemote(localMemories: SastFeedbackMemory[], remoteAdapter: unknown): Promise<SastFeedbackMemory[]> {
  if (!remoteAdapter || typeof remoteAdapter !== 'object' ||
      typeof (remoteAdapter as { downloadMemories: unknown }).downloadMemories !== 'function' ||
      typeof (remoteAdapter as { mergeMemories: unknown }).mergeMemories !== 'function' ||
      typeof (remoteAdapter as { uploadMemories: unknown }).uploadMemories !== 'function') {
    throw new Error('remoteAdapter must implement downloadMemories, mergeMemories, and uploadMemories methods');
  }
  const span = trace.getTracer('sastMemories').startSpan('syncWithRemote');
  const remoteMemories = await (remoteAdapter as { downloadMemories: () => Promise<SastFeedbackMemory[]> }).downloadMemories();
  const merged = await (remoteAdapter as { mergeMemories: (local: SastFeedbackMemory[], remote: SastFeedbackMemory[]) => Promise<SastFeedbackMemory[]> }).mergeMemories(localMemories, remoteMemories);
  await (remoteAdapter as { uploadMemories: (memories: SastFeedbackMemory[]) => Promise<void> }).uploadMemories(merged);
  span.end();
  return merged;
}

/**
 * Merges local and remote SAST feedback memories.
 * local: Local SAST feedback memories
 * remote: Remote SAST feedback memories
 */
export function mergeWithRemote(local: SastFeedbackMemory[], remote: SastFeedbackMemory[]): SastFeedbackMemory[] {
  const span = trace.getTracer('sastMemories').startSpan('mergeWithRemote');
  const seen = new Set<string>();
  // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
  const canonicalId = (m: SastFeedbackMemory) => `${m.tool}:${m.file}:${m.ruleId ?? ''}:${m.id}`;
  const merged = [...local, ...remote].filter(mem => {
    const id = canonicalId(mem);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  span.end();
  return merged;
}

const sastMemoriesCapability: Capability = {
  name: 'sastMemories',
  describe(): CapabilityDescribe {
    return {
      name: 'sastMemories',
      description: 'Deduplicates, lists, and syncs SAST feedback memories across tools. Canonical, registry-compliant.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/nootropic/nootropic',
      methods: [
        { name: 'loadAllMemories', signature: '() => Promise<SastFeedbackMemory[]>', description: 'Load all SAST feedback memories.' },
        { name: 'deduplicateMemories', signature: '(memories: SastFeedbackMemory[]) => SastFeedbackMemory[]', description: 'Deduplicate memories by id, tool, and context.' },
        { name: 'listAllSastMemories', signature: '() => Promise<SastFeedbackMemory[]>', description: 'List all deduplicated SAST memories.' },
        { name: 'getMemoriesForFile', signature: '(file: string) => Promise<SastFeedbackMemory[]>', description: 'Get all memories for a given file.' },
        { name: 'getMemoriesForRule', signature: '(ruleId: string) => Promise<SastFeedbackMemory[]>', description: 'Get all memories for a given ruleId.' },
        { name: 'syncWithRemote', signature: '(localMemories: SastFeedbackMemory[], remoteAdapter: unknown) => Promise<SastFeedbackMemory[]>', description: 'Sync local SAST memories with remote storage.' },
        { name: 'mergeWithRemote', signature: '(local: SastFeedbackMemory[], remote: SastFeedbackMemory[]) => SastFeedbackMemory[]', description: 'Merge local and remote SAST memories.' }
      ],
      schema: {
        loadAllMemories: {
          input: { type: 'null', description: 'No input required' },
          output: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' }
        },
        deduplicateMemories: {
          input: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' },
          output: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' }
        },
        listAllSastMemories: {
          input: { type: 'null', description: 'No input required' },
          output: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' }
        },
        getMemoriesForFile: {
          input: { type: 'object', properties: { file: { type: 'string' } }, required: ['file'] },
          output: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' }
        },
        getMemoriesForRule: {
          input: { type: 'object', properties: { ruleId: { type: 'string' } }, required: ['ruleId'] },
          output: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' }
        },
        syncWithRemote: {
          input: { type: 'object', properties: { localMemories: { type: 'array', items: { type: 'object' } }, remoteAdapter: { type: 'object' } }, required: ['localMemories', 'remoteAdapter'] },
          output: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' }
        },
        mergeWithRemote: {
          input: { type: 'object', properties: { local: { type: 'array', items: { type: 'object' } }, remote: { type: 'array', items: { type: 'object' } } }, required: ['local', 'remote'] },
          output: { type: 'array', items: { type: 'object' }, description: 'Array of SastFeedbackMemory' }
        }
      },
      usage: "import sastMemoriesCapability from 'nootropic/utils/feedback/sastMemories'; await sastMemoriesCapability.listAllSastMemories();",
      docsFirst: true,
      aiFriendlyDocs: true,
      promptTemplates: [
        {
          name: 'Add SAST Memory',
          description: 'Prompt for instructing the agent or LLM to add a feedback/memory entry for a SAST finding.',
          template: 'Add a feedback/memory entry for finding "{{findingId}}" with rationale: {{rationale}} and type: {{memoryType}}.',
          usage: 'Used by add/deduplicate memory logic.'
        },
        {
          name: 'List SAST Memories',
          description: 'Prompt for instructing the agent or LLM to list all feedback/memories for a given file or rule.',
          template: 'List all feedback/memories for file "{{file}}" or rule "{{ruleId}}".',
          usage: 'Used by listAllSastMemories, getMemoriesForFile, getMemoriesForRule.'
        },
        {
          name: 'Deduplicate SAST Memories',
          description: 'Prompt for instructing the agent or LLM to deduplicate SAST feedback memories by id, tool, and context.',
          template: 'Deduplicate SAST feedback memories by id, tool, and context.',
          usage: 'Used by deduplicateMemories.'
        },
        {
          name: 'Sync/Merge SAST Memories',
          description: 'Prompt for instructing the agent or LLM to sync or merge local and remote SAST memories.',
          template: 'Sync or merge local and remote SAST memories for robust, up-to-date feedback.',
          usage: 'Used by syncWithRemote and mergeWithRemote.'
        }
      ],
      references: ['types/SastFeedbackMemory.js']
    };
  },
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  },
  init: async function() {},
  reload: async function() {},
};

export default sastMemoriesCapability; 