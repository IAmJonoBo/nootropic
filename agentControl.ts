// nootropic is for Cursor agents only. This is the control/cleanup utility for all future agents and users.
// NOTE: This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.

// @ts-ignore
import { readJsonSafe, writeJsonSafe } from './utils.js';
// @ts-ignore
import { getCacheFilePath, ensureCacheDirExists } from './src/utils/context/cacheDir.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fsp } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname);
const PATCH_DIR = path.join(OUTPUT_DIR, 'patches');
const LOG_DIR = path.join(OUTPUT_DIR, 'logs');
const CONTEXT_JSON = getCacheFilePath('context.json');
const MUTATION_PLAN_JSON = getCacheFilePath('mutationPlan.json');
const SELF_HEAL_JSON = getCacheFilePath('selfHealingPlan.json');
const AGENT_BACKLOG_JSON = getCacheFilePath('agentBacklog.json');
const MEMORY_LANE_JSON = getCacheFilePath('memory.json');

const FILES = [
  CONTEXT_JSON,
  MUTATION_PLAN_JSON,
  SELF_HEAL_JSON,
  AGENT_BACKLOG_JSON,
  MEMORY_LANE_JSON
];

// --- List all context, mutation, patch, and log files ---
async function listFiles(): Promise<Array<{ file: string; size: number; mtime: string }>> {
  const files = await Promise.all(FILES.map(async f => {
    try {
      const stats = await fsp.stat(f);
      return { file: f.replace(getCacheFilePath(''), ''), size: stats.size, mtime: stats.mtime.toISOString() };
    } catch {
      return null;
    }
  }));
  let patches: Array<{ file: string; size: number; mtime: string }> = [];
  try {
    patches = await Promise.all((await fsp.readdir(PATCH_DIR)).map(async f => {
      const filePath = path.join(PATCH_DIR, f);
      const stats = await fsp.stat(filePath);
      return { file: `patches/${f}`, size: stats.size, mtime: stats.mtime.toISOString() };
    }));
  } catch {}
  let logs: Array<{ file: string; size: number; mtime: string }> = [];
  try {
    logs = await Promise.all((await fsp.readdir(LOG_DIR)).map(async f => {
      const filePath = path.join(LOG_DIR, f);
      const stats = await fsp.stat(filePath);
      return { file: `logs/${f}`, size: stats.size, mtime: stats.mtime.toISOString() };
    }));
  } catch {}
  return [...files.filter((x): x is { file: string; size: number; mtime: string } => x !== null), ...patches, ...logs];
}

// --- Delete or archive old files by age, size, or count ---
interface PruneOptions {
  maxAgeDays?: number | null;
  maxCount?: number | null;
  maxTotalSize?: number | null;
}

async function pruneFiles({ maxAgeDays = null, maxCount = null, maxTotalSize = null }: PruneOptions = {}): Promise<Array<{ file: string; size: number; mtime: string }>> {
  let files = (await listFiles()).filter((f): f is { file: string; size: number; mtime: string } => f !== null);
  files = files.sort((a, b) => new Date(a.mtime).getTime() - new Date(b.mtime).getTime());
  let toDelete: Array<{ file: string; size: number; mtime: string }> = [];
  if (maxAgeDays !== null) {
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    toDelete = files.filter(f => new Date(f.mtime).getTime() < cutoff);
  }
  if (maxCount !== null && files.length > maxCount) {
    toDelete = toDelete.concat(files.slice(0, files.length - maxCount));
  }
  if (maxTotalSize !== null) {
    let total = files.reduce((sum, f) => sum + f.size, 0);
    for (const f of files) {
      if (total <= maxTotalSize) break;
      toDelete.push(f);
      total -= f.size;
    }
  }
  // Remove duplicates
  toDelete = Array.from(new Set(toDelete.filter((f): f is { file: string; size: number; mtime: string } => f !== null)));
  for (const f of toDelete) {
    if (!f) continue;
    const filePath = path.join(OUTPUT_DIR, f.file);
    try {
      await fsp.unlink(filePath);
    } catch {}
  }
  return toDelete;
}

// --- Prune semantic index, message board, or memory lane ---
interface PruneJsonFieldOptions {
  maxItems?: number | null;
  maxAgeDays?: number | null;
}

async function pruneJsonField(file: string, field: string, { maxItems = null, maxAgeDays = null }: PruneJsonFieldOptions = {}): Promise<boolean> {
  const filePath = path.join(OUTPUT_DIR, file);
  try {
    await fsp.access(filePath);
  } catch {
    return false;
  }
  const data = await readJsonSafe(filePath, {} as Record<string, unknown>);
  if (!Array.isArray((data as Record<string, unknown>)[field])) return false;
  let arr = (data as Record<string, unknown>)[field] as Array<{ timestamp?: string; mtime?: string }>;
  if (maxItems !== null && arr.length > maxItems) arr = arr.slice(-maxItems);
  if (maxAgeDays !== null) {
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    arr = arr.filter(item => new Date((item.timestamp ?? item.mtime) || 0).getTime() >= cutoff);
  }
  (data as Record<string, unknown>)[field] = arr;
  await writeJsonSafe(filePath, data);
  return true;
}

// --- CLI Entrypoint ---
interface RunAgentControlOptions {
  list?: boolean;
  prune?: boolean;
  pruneOptions?: PruneOptions;
}

async function runAgentControl({ list = false, prune = false, pruneOptions = {} }: RunAgentControlOptions = {}): Promise<void> {
  if (list) {
    console.log(JSON.stringify(await listFiles(), null, 2));
  }
  if (prune) {
    const deleted = await pruneFiles(pruneOptions);
    console.log(JSON.stringify({ deleted }, null, 2));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const args = process.argv.slice(2);
    if (args.includes('--list')) await runAgentControl({ list: true });
    if (args.includes('--prune')) await runAgentControl({ prune: true });
  })();
}

/**
 * Initializes agentControl. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 */
export async function initAgentControl() {
  await ensureCacheDirExists();
}

export {
  listFiles,
  pruneFiles,
  pruneJsonField,
  runAgentControl
}; 