// nootropic is for Cursor agents only. This is the control/cleanup utility for all future agents and users.
// NOTE: This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.

// @ts-expect-error TS(2459): Module '"./utils.js"' declares 'readJsonSafe' loca... Remove this comment to see the full error message
import { readJsonSafe, writeJsonSafe } from './utils.js';
import { getCacheFilePath, ensureCacheDirExists } from './utils/context/cacheDir.js';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2307): Cannot find module 'url' or its corresponding type... Remove this comment to see the full error message
import { fileURLToPath } from 'url';
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fsp } from 'fs';

// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname);
const PATCH_DIR = path.join(OUTPUT_DIR, 'patches');
// @ts-expect-error TS(6133): 'LOG_DIR' is declared but its value is never read.
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
  // @ts-expect-error TS(2552): Cannot find name 'files'. Did you mean 'FILES'?
  const files = await Promise.all(FILES.map(async f => {
    try {
      // @ts-expect-error TS(2552): Cannot find name 'stats'. Did you mean 'status'?
      const stats = await fsp.stat(f);
      // @ts-expect-error TS(2304): Cannot find name 'f'.
      return { file: f.replace(getCacheFilePath(''), ''), size: stats.size, mtime: stats.mtime.toISOString() };
    } catch {
      return null;
    }
  }));
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let patches: Array<{ file: string; size: number; mtime: string }> = [];
  try {
    // @ts-expect-error TS(2304): Cannot find name 'patches'.
    patches = await Promise.all((await fsp.readdir(PATCH_DIR)).map(async f => {
      // @ts-expect-error TS(2304): Cannot find name 'filePath'.
      const filePath = path.join(PATCH_DIR, f);
      // @ts-expect-error TS(2304): Cannot find name 'stats'.
      const stats = await fsp.stat(filePath);
      // @ts-expect-error TS(2349): This expression is not callable.
      return { file: `patches/${f}`, size: stats.size, mtime: stats.mtime.toISOString() };
    }));
  } catch {}
  let logs: Array<{ file: string; size: number; mtime: string }> = [];
  try {
    logs = await Promise.all((await fsp.readdir(LOG_DIR)).map(async f => {
      const filePath = path.join(LOG_DIR, f);
      const stats = await fsp.stat(filePath);
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
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

// @ts-expect-error TS(2304): Cannot find name 'file'.
if (import.meta.url === `file://${process.argv[1]}`) {
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  (async () => {
    // @ts-expect-error TS(2304): Cannot find name 'args'.
    const args = process.argv.slice(2);
    // @ts-expect-error TS(6133): 'args' is declared but its value is never read.
    if (args.includes('--list')) await runAgentControl({ list: true });
    // @ts-expect-error TS(2304): Cannot find name 'args'.
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
  // @ts-expect-error TS(2304): Cannot find name 'pruneFiles'.
  pruneFiles,
  // @ts-expect-error TS(2304): Cannot find name 'pruneJsonField'.
  pruneJsonField,
  // @ts-expect-error TS(2304): Cannot find name 'runAgentControl'.
  runAgentControl
}; 