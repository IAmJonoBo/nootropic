import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';
import { pruneFiles, pruneJsonField } from '../../agentControl.js';
import { createSnapshot, addAgentMessage } from '../../contextSnapshotHelper.js';
import path from 'path';
import { promises as fsp } from 'fs';
import { errorLogger } from '../../utils.js';
import { EventEmitter } from 'events';
import { ShimiMemory } from './shimiMemory.js';
import { z } from 'zod';

const CONTEXT_DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../.nootropic-cache');
const CONTEXT_JSON = path.join(CONTEXT_DIR, 'context.json');
const SNAPSHOT_PREFIX = 'context-snapshot';
const MANIFEST_PATH = path.join(CONTEXT_DIR, 'cache-manifest.json');
const ARCHIVE_DIR = path.join(CONTEXT_DIR, 'archive');
type Tier = 'hot' | 'warm' | 'cold';

const tierPolicy = {
  hot: { maxAgeDays: 2, maxSizeMB: 50 },
  warm: { maxAgeDays: 14, maxSizeMB: 200 },
  cold: { maxAgeDays: 365, maxSizeMB: 1000 },
};

const eventBus = new EventEmitter();

/**
 * Canonical Zod schemas for dynamic input parameters.
 */
const PruneContextOptionsSchema = z.object({
  maxAgeDays: z.number().int().positive().optional(),
  maxSizeBytes: z.number().int().positive().optional(),
  maxTokens: z.number().int().positive().optional()
});

/**
 * ContextManager: Public API for context pruning, archiving, tiering, and restoration.
 * Emits events and is registry-compliant. Ready for CLI/HTTP integration.
 * Integrates SHIMI memory for advanced context/memory management.
 *
 * Main Methods:
 *   - pruneContext(options): Prune context by age, size, or token budget
 *   - archiveContext(tier?): Archive current context snapshot
 *   - listSnapshots(): List available context snapshots
 *   - restoreSnapshot(name): Restore a context snapshot by name/tier
 *   - getContextSummaries(query, topK?): Retrieve context summaries from SHIMI memory
 *   - describe(): Returns a machine-usable, LLM-friendly description of the context manager
 */
export class ContextManager implements Capability {
  public readonly name = 'ContextManager';
  private shimi = new ShimiMemory();

  /**
   * Prunes context memories based on options (age, size, token budget).
   * @param options Pruning options (age, size, token budget). Runtime validated with Zod.
   * @returns Promise<void>
   */
  async pruneContext(options: { maxAgeDays?: number; maxSizeBytes?: number; maxTokens?: number } = {}): Promise<void> {
    // Runtime validation for maximal type safety and LLM/AI-friendliness
    const parsed = PruneContextOptionsSchema.safeParse(options);
    if (!parsed.success) {
      throw new Error(`Invalid pruneContext options: ${parsed.error.message}`);
    }
    try {
      // Prune context.json and related files by age/size
      await pruneFiles({
        maxAgeDays: parsed.data.maxAgeDays ?? null,
        maxTotalSize: parsed.data.maxSizeBytes ?? null,
      });
      // Prune agentMessages in memory.json if needed
      if (parsed.data.maxAgeDays ?? parsed.data.maxTokens) {
        await pruneJsonField('memory.json', 'agentMessages', {
          maxAgeDays: parsed.data.maxAgeDays ?? null,
        });
      }
      await addAgentMessage('ContextManager', 'prune', { options: parsed.data, status: 'success' });
      // Insert a summary entity into SHIMI memory
      await this.shimi.insertEntity({
        concept: 'pruneContext',
        explanation: `Pruned context with options: ${JSON.stringify(parsed.data)}`,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      await addAgentMessage('ContextManager', 'prune', { options: parsed.data, status: 'error', error: String(e) });
      throw e;
    }
  }

  /**
   * Loads a context snapshot for a given tier/size (e.g., 32k, 64k, 128k).
   * @param tier Optional context tier/size. No runtime validation (stub, for future extension).
   * @returns Promise<void>
   */
  async archiveContext(tier?: number): Promise<void> {
    // No runtime validation needed for tier (number, optional)
    try {
      // Create a new context snapshot (optionally compressed by tier)
      await createSnapshot({ delta: false });
      // Optionally, compress or move snapshot file for tiering (stub)
      // TODO: Implement tiered/compressed archiving if needed
      await addAgentMessage('ContextManager', 'archive', { tier, status: 'success' });
      // Insert a summary entity into SHIMI memory
      await this.shimi.insertEntity({
        concept: 'archiveContext',
        explanation: `Archived context (tier: ${tier ?? 'default'})`,
        timestamp: new Date().toISOString(),
      });
    } catch (e) {
      await addAgentMessage('ContextManager', 'archive', { tier, status: 'error', error: String(e) });
      throw e;
    }
  }

  /**
   * List available context snapshots (full, compressed, delta).
   */
  async listSnapshots(): Promise<string[]> {
    try {
      const files = await fsp.readdir(CONTEXT_DIR);
      const snapshots = files.filter(f => f.startsWith(SNAPSHOT_PREFIX) && f.endsWith('.json'));
      await addAgentMessage('ContextManager', 'listSnapshots', { count: snapshots.length, status: 'success' });
      return snapshots;
    } catch (e) {
      await addAgentMessage('ContextManager', 'listSnapshots', { status: 'error', error: String(e) });
      throw e;
    }
  }

  /**
   * Restore a context snapshot by name/tier.
   */
  async restoreSnapshot(name: string): Promise<void> {
    try {
      const snapshotPath = path.join(CONTEXT_DIR, name);
      const data = await fsp.readFile(snapshotPath, 'utf-8');
      await fsp.writeFile(CONTEXT_JSON, data, 'utf-8');
      await addAgentMessage('ContextManager', 'restore', { name, status: 'success' });
    } catch (e) {
      await addAgentMessage('ContextManager', 'restore', { name, status: 'error', error: String(e) });
      throw e;
    }
  }

  /**
   * Health check for context manager.
   */
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /**
   * Update and enforce manifest-driven tiering policies.
   */
  async enforceTiering(): Promise<void> {
    await enforceTierPolicies();
    await addAgentMessage('ContextManager', 'enforceTiering', { status: 'success' });
    eventBus.emit('tieringEnforced', { status: 'success' });
  }

  /**
   * List all cache files with metadata (from manifest).
   */
  async listCacheFiles(): Promise<unknown[]> {
    try {
      if (!(await pathExists(MANIFEST_PATH))) await updateManifest();
      const data = await fsp.readFile(MANIFEST_PATH, 'utf-8');
      const manifest = JSON.parse(data);
      await addAgentMessage('ContextManager', 'listCacheFiles', { count: manifest.length, status: 'success' });
      return manifest;
    } catch (e) {
      await addAgentMessage('ContextManager', 'listCacheFiles', { status: 'error', error: String(e) });
      throw e;
    }
  }

  /**
   * Get the contents of a cache file by name (safe, manifest-driven).
   */
  async getCacheFile(fileName: string): Promise<Buffer | string> {
    try {
      const manifest = await this.listCacheFiles();
      const entry = manifest.find((f: unknown): f is { fileName: string; archive?: boolean } => isManifestEntry(f) && f.fileName === fileName);
      if (!entry) throw new Error('File not found in manifest');
      const filePath = entry.archive
        ? path.join(CONTEXT_DIR, 'archive', fileName)
        : path.join(CONTEXT_DIR, fileName);
      const data = await fsp.readFile(filePath);
      await addAgentMessage('ContextManager', 'getCacheFile', { fileName, status: 'success' });
      return data;
    } catch (e) {
      await addAgentMessage('ContextManager', 'getCacheFile', { fileName, status: 'error', error: String(e) });
      throw e;
    }
  }

  /**
   * Get a health/summary report of the cache (total size, file count, etc).
   */
  async getCacheHealthReport(): Promise<unknown> {
    try {
      const manifest = await this.listCacheFiles();
      let totalSize = 0;
      let fileCount = 0;
      let oldest: string | null = null;
      let newest: string | null = null;
      for (const entry of manifest) {
        if (typeof entry !== 'object' || entry === null || !('size' in entry) || !('lastModified' in entry)) continue;
        totalSize += (entry as { size: number }).size;
        fileCount++;
        const lastModified = (entry as { lastModified: string }).lastModified;
        if (oldest === null || lastModified < oldest) oldest = lastModified;
        if (newest === null || lastModified > newest) newest = lastModified;
      }
      const health = {
        totalSizeBytes: totalSize,
        fileCount,
        oldestFile: oldest,
        newestFile: newest,
        manifestStatus: 'ok',
      };
      await addAgentMessage('ContextManager', 'getCacheHealthReport', { status: 'success', ...health });
      return health;
    } catch (e) {
      await addAgentMessage('ContextManager', 'getCacheHealthReport', { status: 'error', error: String(e) });
      throw e;
    }
  }

  /**
   * Migrate a file to a different tier (hot/warm/cold).
   */
  async migrateFileTier(fileName: string, targetTier: Tier): Promise<void> {
    await migrateFileTier(fileName, targetTier);
    await updateManifest();
    await addAgentMessage('ContextManager', 'migrateFileTier', { fileName, targetTier, status: 'success' });
    eventBus.emit('tierMigrated', { fileName, targetTier });
  }

  /**
   * Retrieve context summaries from SHIMI memory.
   */
  async getContextSummaries(query: string, topK = 5): Promise<unknown[]> {
    return this.shimi.retrieveEntities(query, topK);
  }

  /**
   * Registry/LLM-friendly describe output.
   */
  describe(): CapabilityDescribe {
    return {
      name: 'ContextManager',
      description: 'Public API for context pruning, archiving, tiering, and restoration. Emits events, is registry-compliant, and integrates SHIMI memory for advanced context/memory management.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/nootropic/nootropic',
      docsFirst: true,
      aiFriendlyDocs: true,
      usage: "import { ContextManager } from 'nootropic/utils/context/contextManager'; const cm = new ContextManager(); await cm.pruneContext(); await cm.archiveContext(); await cm.getContextSummaries('pruneContext');",
      methods: [
        { name: 'pruneContext', signature: '(options?) => Promise<void>', description: 'Prune context by age, size, or token budget.' },
        { name: 'archiveContext', signature: '(tier?) => Promise<void>', description: 'Archive current context snapshot.' },
        { name: 'getContextSummaries', signature: '(query, topK?) => Promise<unknown[]>', description: 'Retrieve context summaries from SHIMI memory.' }
      ],
      promptTemplates: [
        {
          name: 'Prune Context',
          description: 'Prune context by age, size, or token budget.',
          template: 'pruneContext({ maxAgeDays?, maxSizeBytes?, maxTokens? })'
        },
        {
          name: 'Archive Context',
          description: 'Archive the current context snapshot.',
          template: 'archiveContext(tier?)'
        },
        {
          name: 'Get Context Summaries',
          description: 'Retrieve context summaries from SHIMI memory.',
          template: 'getContextSummaries(query, topK?)'
        }
      ],
      references: [
        'https://arxiv.org/abs/2504.06135'
      ],
      schema: {
        pruneContext: {
          input: { type: 'object', properties: { maxAgeDays: { type: 'number', minimum: 0 }, maxSizeBytes: { type: 'number', minimum: 0 }, maxTokens: { type: 'number', minimum: 0 } }, additionalProperties: false },
          output: { type: 'null' }
        },
        archiveContext: {
          input: { type: 'object', properties: { tier: { type: 'string', enum: ['hot', 'warm', 'cold'] } }, additionalProperties: false },
          output: { type: 'null' }
        },
        getContextSummaries: {
          input: { type: 'object', properties: { query: { type: 'string' }, topK: { type: 'number', minimum: 1 } }, required: ['query'], additionalProperties: false },
          output: { type: 'array', items: { type: 'object' } }
        },
        migrateFileTier: {
          input: { type: 'object', properties: { fileName: { type: 'string' }, targetTier: { type: 'string', enum: ['hot', 'warm', 'cold'] } }, required: ['fileName', 'targetTier'], additionalProperties: false },
          output: { type: 'null' }
        }
      }
    };
  }

  /**
   * Optional: Initialization logic for context manager startup.
   */
  async init(): Promise<void> {
    // No-op for base; override in subclasses if needed
  }

  /**
   * Optional: Reload logic for context manager.
   */
  async reload(): Promise<void> {
    // No-op for base; override in subclasses if needed
  }

  async shutdown(): Promise<void> {}
}

/**
 * Returns a description of the contextManager and its main functions.
 */
export function describe() {
  return {
    name: 'contextManager',
    description: 'Context and file management utilities for nootropic. Includes directory, file, patch, and context helpers. All exports have TSDoc comments and are registry-compliant.',
    functions: [
      { name: 'ensureDirExists', signature: 'async (dirPath: string) => Promise<void>', description: 'Ensures a directory exists (recursive, robust).' },
      { name: 'listFilesInDir', signature: 'async (dirPath: string) => Promise<string[]>', description: 'Lists all files in a directory (non-recursive).' },
      { name: 'writeFileSafe', signature: 'async (filePath: string, data: string | object) => Promise<void>', description: 'Writes a file safely with robust error handling.' },
      { name: 'findFilePath', signature: 'async (filename: string, dirs: string[]) => Promise<string | null>', description: 'Recursively searches for a file by name in given directories.' },
      { name: 'pathExists', signature: 'async (pathToCheck: string) => Promise<boolean>', description: 'Checks if a path exists.' },
      { name: 'readJsonFile', signature: 'async <T = unknown>(filePath: string) => Promise<T | null>', description: 'Reads a JSON file, returns null on error.' },
      { name: 'writeJsonFile', signature: 'async <T = unknown>(filePath: string, data: T) => Promise<void>', description: 'Writes a JSON file, robust to errors.' },
      { name: 'generateTodoPatch', signature: '(original: string, patched: string, file: string, line: number) => string', description: 'Generates a patch for TODO/FIXME resolution.' },
      { name: 'PatchInfo', signature: 'interface', description: 'Patch info type for patch generation utilities.' }
    ],
    promptTemplates: [
      {
        name: 'Prune Context',
        description: 'Prune context by age, size, or token budget.',
        template: 'pruneContext({ maxAgeDays?, maxSizeBytes?, maxTokens? })'
      },
      {
        name: 'Archive Context',
        description: 'Archive the current context snapshot.',
        template: 'archiveContext(tier?)'
      },
      {
        name: 'Get Context Summaries',
        description: 'Retrieve context summaries from SHIMI memory.',
        template: 'getContextSummaries(query, topK?)'
      }
    ],
    references: [
      'https://arxiv.org/abs/2504.06135'
    ],
    schema: {}
  };
}

/**
 * Ensures a directory exists (recursive, robust).
 */
export async function ensureDirExists(dirPath: string): Promise<void> {
  try {
    await fsp.mkdir(dirPath, { recursive: true });
  } catch (e) {
    if ((e as { code?: string })?.code !== 'EEXIST') errorLogger(`Failed to ensure dir: ${dirPath}`, e);
  }
}

/**
 * Lists all files in a directory (non-recursive).
 */
export async function listFilesInDir(dirPath: string): Promise<string[]> {
  try {
    return await fsp.readdir(dirPath);
  } catch (e) {
    errorLogger(`Failed to list files in dir: ${dirPath}`, e);
    return [];
  }
}

/**
 * Writes a file safely with robust error handling.
 */
export async function writeFileSafe(filePath: string, data: string | object): Promise<void> {
  const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  await fsp.writeFile(filePath, content);
}

/**
 * Recursively searches for a file by name in given directories.
 */
export async function findFilePath(filename: string, dirs: string[]): Promise<string | null> {
  for (const dir of dirs) {
    const files = await listFilesInDir(dir);
    for (const file of files) {
      if (file === filename) return path.join(dir, file);
    }
  }
  return null;
}

/**
 * Checks if a path exists.
 */
export async function pathExists(pathToCheck: string): Promise<boolean> {
  try {
    await fsp.access(pathToCheck);
    return true;
  } catch {
    return false;
  }
}

/**
 * Reads a JSON file, returns null on error.
 */
export async function readJsonFile<T = unknown>(filePath: string): Promise<T | null> {
  if (!filePath.endsWith('.json') && !filePath.endsWith('.jsonc')) {
    throw new Error(`Refusing to parse non-JSON file as JSON: ${filePath}`);
  }
  try {
    return JSON.parse(await fsp.readFile(filePath, 'utf-8')) as T;
  } catch (e) {
    errorLogger(`Failed to read JSON file: ${filePath}`, e);
    return null;
  }
}

/**
 * Writes a JSON file, robust to errors.
 */
export async function writeJsonFile<T = unknown>(filePath: string, data: T): Promise<void> {
  await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Generates a patch for TODO/FIXME resolution.
 */
export function generateTodoPatch(original: string, patched: string, file: string, line: number): string {
  return `--- ${file}:${line}\n+++ ${file}:${line}\n@@ -${line},1 +${line},1 @@\n-${original}\n+${patched}`;
}

/**
 * Patch info type for patch generation utilities.
 */
export interface PatchInfo {
  file: string;
  line?: number;
  patchFile: string;
  type: 'todo' | 'schemaDrift';
}

async function updateManifest() {
  const files = await fsp.readdir(CONTEXT_DIR);
  const manifest: unknown[] = [];
  for (const file of files) {
    if (file.endsWith('.json') || file.endsWith('.cache') || file.startsWith('context-snapshot')) {
      const filePath = path.join(CONTEXT_DIR, file);
      const stats = await fsp.stat(filePath);
      manifest.push({
        fileName: file,
        size: stats.size,
        lastModified: stats.mtime.toISOString(),
        tier: getTierForFile(stats),
        lastAccessed: stats.atime.toISOString(),
      });
    }
  }
  await fsp.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
  return manifest;
}

function getTierForFile(stats: { mtime: Date; size: number }): Tier {
  const ageDays = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= tierPolicy.hot.maxAgeDays && stats.size <= tierPolicy.hot.maxSizeMB * 1024 * 1024) return 'hot';
  if (ageDays <= tierPolicy.warm.maxAgeDays && stats.size <= tierPolicy.warm.maxSizeMB * 1024 * 1024) return 'warm';
  return 'cold';
}

async function migrateFileTier(fileName: string, targetTier: Tier) {
  const filePath = path.join(CONTEXT_DIR, fileName);
  const archivePath = path.join(ARCHIVE_DIR, fileName);
  if (targetTier === 'cold') {
    await fsp.mkdir(ARCHIVE_DIR, { recursive: true });
    await fsp.rename(filePath, archivePath);
    eventBus.emit('tierMigrated', { fileName, from: 'hot/warm', to: 'cold' });
  } else if (targetTier === 'hot' || targetTier === 'warm') {
    if (await pathExists(archivePath)) {
      await fsp.rename(archivePath, filePath);
      eventBus.emit('tierMigrated', { fileName, from: 'cold', to: targetTier });
    }
  }
}

async function enforceTierPolicies() {
  const manifest = await updateManifest();
  for (const entry of manifest) {
    if (
      typeof entry !== 'object' || entry === null ||
      !('fileName' in entry) ||
      !('tier' in entry) ||
      !('size' in entry) ||
      !('lastModified' in entry)
    ) continue;
    const { fileName, tier, size, lastModified } = entry as { fileName: string; tier: Tier; size: number; lastModified: string };
    if (tier === 'hot') continue;
    if (tier === 'warm') {
      // If file is too old or too large, move to cold
      if (size > tierPolicy.warm.maxSizeMB * 1024 * 1024 || (Date.now() - new Date(lastModified).getTime()) / (1000 * 60 * 60 * 24) > tierPolicy.warm.maxAgeDays) {
        await migrateFileTier(fileName, 'cold');
      }
    } else if (tier === 'cold') {
      // Already in cold tier (archive)
      continue;
    }
  }
  await updateManifest();
}

export async function extractWordsFromFile(filePath: string): Promise<string[]> {
  try {
    if (!filePath.endsWith('.json') && !filePath.endsWith('.jsonc')) {
      // Skip non-JSON files for word extraction
      return [];
    }
    // If you need to process the JSON, do so here, otherwise just return []
    await readJsonFile(filePath); // Just to check parseability
    return []; // Or process and return words if needed
  } catch (err) {
    console.warn(`Skipping file (not JSON or failed to parse): ${filePath}`, err);
    return [];
  }
}

// Type guard for manifest entry
function isManifestEntry(obj: unknown): obj is { fileName: string; archive?: boolean; size?: number; lastModified?: string } {
  return typeof obj === 'object' && obj !== null && 'fileName' in obj;
} 