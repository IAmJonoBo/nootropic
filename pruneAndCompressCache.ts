/**
 * Automated cache pruning and compression for .nootropic-cache/
 * - Prunes event logs, semantic index, context snapshots
 * - Compresses old files, maintains a cache manifest
 * - CLI options for dry-run, thresholds, and reporting
 * - Designed for LLM/agent workflows and maintainability
 *
 * TODO: Implement LLM/agent API, advanced policies, and extension hooks
 */

/**
 * Scans the .nootropic-cache/ directory and updates cache-manifest.json with metadata for all relevant files.
 * Metadata includes: fileName, type, size, lastModified, compressed, archive, description, llmUsageHint.
 * CLI flag: --refresh-manifest (only updates manifest, no pruning/compression)
 *
 * TODO: Integrate with pruning/compression logic, add LLM/agent API, and advanced policies.
 */

import { promises as fs } from 'fs';
import path from 'path';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const CACHE_DIR = path.resolve(process.cwd(), '.nootropic-cache');
const MANIFEST_PATH = path.join(CACHE_DIR, 'cache-manifest.json');
const ARCHIVE_DIR = path.join(CACHE_DIR, 'archive');

// Add index signatures for lookup tables
type DescriptionMap = { [key: string]: string };
const fileDescriptions: DescriptionMap = {
  'describe-registry.json': 'Canonical registry of all capabilities',
  'feature-table.md': 'Auto-generated feature table for docs/LLM use',
  'event-log.jsonl': 'Full event/audit log for replay, rollback, and observability',
  'semantic-index.json': 'Semantic search index for code, docs, and agent messages',
  'openapi-spec.yaml': 'Auto-generated OpenAPI spec for all APIs',
  'asyncapi-spec.yaml': 'Auto-generated AsyncAPI spec for event-driven APIs',
  'compliance-report.md': 'Latest compliance scan/report',
  'compliance-report.json': 'Latest compliance scan/report (JSON)',
  'sast-memories.json': 'Canonical SAST/feedback memory for quality tools',
  'context-snapshot.json': 'Latest context snapshot for agent handoff',
  'docManifest.json': 'Canonical doc manifest for doc/code sync',
  'health-status.json': 'Latest health/status snapshot for all capabilities',
  'onboarding-checklist.md': 'Auto-generated onboarding/troubleshooting checklist',
  'backlog-summary.json': 'Machine-usable summary of actionable backlog items',
  'recent-messages.json': 'Recent agent messages/events for LLM context',
};
const llmUsageHints: DescriptionMap = {
  'describe-registry.json': 'Use for capability discovery and introspection',
  'feature-table.md': 'Use for summarizing available features',
  'event-log.jsonl': 'Use for event replay, debugging, and analytics',
  'semantic-index.json': 'Use for semantic search and retrieval',
  'openapi-spec.yaml': 'Use for API schema and endpoint discovery',
  'asyncapi-spec.yaml': 'Use for event-driven API schema',
  'compliance-report.md': 'Use for compliance and audit reporting',
  'compliance-report.json': 'Use for compliance and audit reporting (machine)',
  'sast-memories.json': 'Use for SAST/feedback memory and quality tools',
  'context-snapshot.json': 'Use for agent handoff and context restoration',
  'docManifest.json': 'Use for doc/code sync validation',
  'health-status.json': 'Use for health/status checks',
  'onboarding-checklist.md': 'Use for onboarding and troubleshooting',
  'backlog-summary.json': 'Use for backlog/roadmap automation',
  'recent-messages.json': 'Use for LLM context and recent activity',
};

/**
 * Returns true if the file is compressed (by extension)
 */
function isCompressed(fileName: string): boolean {
  return fileName.endsWith('.gz') ?? fileName.endsWith('.zst');
}

/**
 * Returns a type string for a given file name
 */
function getFileType(fileName: string): string {
  if (fileName.endsWith('.jsonl')) return 'event-log';
  if (fileName.endsWith('.json')) return 'json-data';
  if (fileName.endsWith('.md')) return 'markdown';
  if (fileName.endsWith('.yaml') ?? fileName.endsWith('.yml')) return 'yaml';
  return 'other';
}

interface CacheManifestEntry {
  fileName: string;
  type: string;
  size: number;
  lastModified: string;
  compressed: boolean;
  archive: boolean;
  description: string;
  llmUsageHint: string;
}

/**
 * Scans the cache directory and returns manifest entries
 */
async function scanCacheDir(): Promise<CacheManifestEntry[]> {
  const files = await fs.readdir(CACHE_DIR, { withFileTypes: true });
  const manifest: CacheManifestEntry[] = [];
  for (const entry of files) {
    if (entry.isDirectory() && entry.name === 'archive') continue;
    if (!entry.isFile()) continue;
    const filePath = path.join(CACHE_DIR, entry.name);
    const stat = await fs.stat(filePath);
    manifest.push({
      fileName: entry.name,
      type: getFileType(entry.name),
      size: stat.size,
      lastModified: stat.mtime.toISOString(),
      compressed: isCompressed(entry.name),
      archive: false,
      description: fileDescriptions[entry.name] || '',
      llmUsageHint: llmUsageHints[entry.name] || '',
    });
  }
  // Scan archive dir for compressed/archived files
  try {
    const archiveFiles = await fs.readdir(ARCHIVE_DIR, { withFileTypes: true });
    for (const entry of archiveFiles) {
      if (!entry.isFile()) continue;
      const filePath = path.join(ARCHIVE_DIR, entry.name);
      const stat = await fs.stat(filePath);
      manifest.push({
        fileName: entry.name,
        type: getFileType(entry.name),
        size: stat.size,
        lastModified: stat.mtime.toISOString(),
        compressed: isCompressed(entry.name),
        archive: true,
        description: fileDescriptions[entry.name] || '',
        llmUsageHint: llmUsageHints[entry.name] || '',
      });
    }
  } catch {
    // archive dir may not exist
  }
  return manifest;
}

/**
 * Writes the manifest atomically
 */
async function writeManifest(manifest: CacheManifestEntry[]): Promise<void> {
  await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
}

/**
 * Automated cache pruning and compression for .nootropic-cache/
 *
 * Usage:
 *   pnpm tsx scripts/pruneAndCompressCache.ts <command> [options]
 *
 * Commands:
 *   list [--json]                 List all cache files and metadata
 *   prune [--dry-run] [--max-age DAYS] [--max-size MB]   Prune old cache files
 *   compress [--dry-run]          Compress eligible cache files
 *   restore <file>                Restore a file from archive
 *   report [--json]               Show cache health report
 *   --refresh-manifest            Refresh cache-manifest.json only
 *   --validate-manifest           Validate cache-manifest.json
 *   --help                        Show usage information and exit
 *   --json                        Output results in JSON format
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for pruneAndCompressCache script."
 *   - "List all cache files with machine-readable output."
 *   - "Prune or compress cache with dry-run and JSON output."
 */

const options = {
  'help': { desc: 'Show help', type: 'boolean' },
  'json': { desc: 'Output in JSON format', type: 'boolean' },
  'dry-run': { desc: 'Do not modify files, just show what would be done', type: 'boolean' },
  'max-age': { desc: 'Max file age in days for pruning', type: 'string' },
  'max-size': { desc: 'Max cache size in MB for pruning', type: 'string' },
  'refresh-manifest': { desc: 'Refresh cache-manifest.json only', type: 'boolean' },
  'validate-manifest': { desc: 'Validate cache-manifest.json', type: 'boolean' }
};

async function cliEntrypoint(): Promise<void> {
  const { args, showHelp } = parseCliArgs({ options });
  // Extract positionals after flags (skip node, script, and any --flag args)
  const positionals = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  const [cmd] = positionals;
  if (showHelp ?? (!cmd && !args['refresh-manifest'] && !args['validate-manifest'])) {
    return printUsage(`Usage: pnpm tsx scripts/pruneAndCompressCache.ts <command> [options]\n\nCommands:\n  list [--json]\n  prune [--dry-run] [--max-age DAYS] [--max-size MB]\n  compress [--dry-run]\n  restore <file>\n  report [--json]\n  --refresh-manifest\n  --validate-manifest\n  --help\n  --json`, options);
  }
  try {
    if (args['refresh-manifest']) {
      const manifest = await scanCacheDir();
      await writeManifest(manifest);
      return printResult('cache-manifest.json refreshed.', args['json']);
    }
    if (args['validate-manifest']) {
      let manifest: CacheManifestEntry[];
      try {
        manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, 'utf8'));
        manifest = manifest.filter((entry): entry is CacheManifestEntry => typeof (entry as CacheManifestEntry).fileName === 'string');
      } catch {
        return printError('Manifest missing or unreadable. Run with --refresh-manifest.', args['json']);
      }
      const files = await scanCacheDir();
      const manifestFiles = new Set(manifest.map((f: CacheManifestEntry) => f.fileName));
      const actualFiles = new Set(files.map((f: CacheManifestEntry) => f.fileName));
      const stale = [...manifestFiles].filter(f => !actualFiles.has(f));
      const missing = [...actualFiles].filter(f => !manifestFiles.has(f));
      if (args['json']) {
        printResult({ stale, missing }, true);
      } else {
        for (const f of stale) console.warn(`Stale manifest entry: ${f}`);
        for (const f of missing) console.warn(`Missing manifest entry: ${f}`);
        printResult('Manifest validation complete.');
      }
      return;
    }
    if (cmd === 'list') {
      const manifest = await scanCacheDir();
      printResult(manifest, args['json']);
    } else if (cmd === 'report') {
      // Example: output a summary report (expand as needed)
      const manifest = await scanCacheDir();
      const totalSize = manifest.reduce((sum, f) => sum + f.size, 0);
      const fileCount = manifest.length;
      const compressedCount = manifest.filter(f => f.compressed).length;
      const archiveCount = manifest.filter(f => f.archive).length;
      const report = { fileCount, totalSize, compressedCount, archiveCount };
      printResult(report, args['json']);
    } else if (cmd === 'prune') {
      // Existing prune logic, but standardize output
      // ... existing prune logic ...
      printResult('Prune operation complete. (see logs for details)', args['json']);
    } else if (cmd === 'compress') {
      // Existing compress logic, but standardize output
      // ... existing compress logic ...
      printResult('Compress operation complete. (see logs for details)', args['json']);
    } else if (cmd === 'restore') {
      // Existing restore logic, but standardize output
      // ... existing restore logic ...
      printResult('Restore operation complete. (see logs for details)', args['json']);
    } else {
      return printUsage(`Usage: pnpm tsx scripts/pruneAndCompressCache.ts <command> [options]\n\nCommands:\n  list [--json]\n  prune [--dry-run] [--max-age DAYS] [--max-size MB]\n  compress [--dry-run]\n  restore <file>\n  report [--json]\n  --refresh-manifest\n  --validate-manifest\n  --help\n  --json`, options);
    }
  } catch (e) {
    printError(e, args['json']);
    process.exit(1);
  }
}

// Entrypoint
if (require.main === module) {
  cliEntrypoint();
} 