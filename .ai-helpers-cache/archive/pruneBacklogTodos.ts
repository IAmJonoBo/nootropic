#!/usr/bin/env tsx
/**
 * pruneBacklogTodos.ts
 *
 * Scans agentBacklog.json for TODOs with triage: 'resolved' or 'ignored', status: 'complete', or stale: true,
 * moves them to .nootropic-cache/backlog-archive.json, and removes them from the main backlog.
 * Ensures idempotency and traceability. All metadata is preserved.
 *
 * Usage: pnpm tsx scripts/pruneBacklogTodos.ts
 */
import fs from 'fs';
import path from 'path';

const BACKLOG_PATH = path.resolve('agentBacklog.json');
const ARCHIVE_PATH = path.resolve('.nootropic-cache/backlog-archive.json');

async function main() {
  // Load current backlog
  const backlogRaw = await fs.promises.readFile(BACKLOG_PATH, 'utf-8');
  const backlogJson = JSON.parse(backlogRaw);
  const backlogArr = backlogJson.backlog ?? [];

  // Load or init archive
  let archiveArr: unknown[] = [];
  try {
    const archiveRaw = await fs.promises.readFile(ARCHIVE_PATH, 'utf-8');
    archiveArr = JSON.parse(archiveRaw);
  } catch {}

  // Partition TODOs
  const [toArchive, toKeep] = backlogArr.reduce((acc: [unknown[], unknown[]], item: unknown) => {
    if (
      typeof item === 'object' && item !== null &&
      (
        ('triage' in item && ((item as { triage?: string }).triage === 'resolved' || (item as { triage?: string }).triage === 'ignored')) ||
        ('status' in item && (item as { status?: string }).status === 'complete') ||
        ('stale' in item && (item as { stale?: boolean }).stale === true)
      )
    ) {
      // Only archive if not already present
      if (!archiveArr.some((a: unknown) =>
        typeof a === 'object' && a !== null &&
        'id' in a && 'description' in a &&
        'id' in item && 'description' in item &&
        (a as { id?: unknown, description?: unknown }).id === (item as { id?: unknown }).id &&
        (a as { id?: unknown, description?: unknown }).description === (item as { description?: unknown }).description
      )) {
        acc[0].push(item);
      }
    } else {
      acc[1].push(item);
    }
    return acc;
  }, [[], []]);

  // Update archive
  if (toArchive.length) {
    archiveArr.push(...toArchive);
    await fs.promises.writeFile(ARCHIVE_PATH, JSON.stringify(archiveArr, null, 2));
  }

  // Update backlog
  backlogJson.backlog = toKeep;
  await fs.promises.writeFile(BACKLOG_PATH, JSON.stringify(backlogJson, null, 2));

  if (toArchive.length) {
    console.log(`Archived ${toArchive.length} TODOs to backlog-archive.json.`);
  } else {
    console.log('No TODOs to archive.');
  }
}

main(); 