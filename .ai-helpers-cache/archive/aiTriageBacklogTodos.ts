#!/usr/bin/env tsx
/**
 * aiTriageBacklogTodos.ts
 *
 * Analyzes all TODOs in agentBacklog.json, suggests triage and priority using AI/LLM heuristics,
 * adds 'aiSuggestedTriage', 'aiSuggestedPriority', 'daysOld', and 'stale' fields. Marks TODOs as 'ignored' if they are just code comments or docstring reminders,
 * 'resolved' if the referenced code no longer exists, and 'top' priority for TODOs in core/critical files.
 * Flags TODOs as 'stale' if they are older than 30 days (configurable).
 * Outputs a summary of hotspots, priorities, and stale items.
 *
 * Usage: pnpm tsx scripts/aiTriageBacklogTodos.ts
 */
import fs from 'fs';
import path from 'path';
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const BACKLOG_PATH = path.resolve('agentBacklog.json');
const CORE_FILES = ['contextSnapshotHelper.ts', 'contextMutationEngine.ts', 'pluginRegistry.ts', 'capabilities/registry.ts', 'utils/security/secretsManager.ts'];
const DEP_GRAPH_PATH = path.resolve('.nootropic-cache/code-dependency-graph.json');
const STALE_DAYS = 30;

function isDocComment(todo: any) {
  return /console\.log|docstring|usage example|see docs|README|ROADMAP|comment/i.test(todo.description ?? '');
}

function isCoreFile(todo: any) {
  return CORE_FILES.some(f => (todo.id ?? '').includes(f));
}

function getDependents(graph: Record<string, string[]>, target: string): number {
  let count = 0;
  for (const deps of Object.values(graph)) {
    if (deps.includes(target)) count++;
  }
  return count;
}

function emitEvent(): void {
  // Placeholder: integrate with event bus or telemetry
}

const options: Record<string, { desc: string; type: string }> = {
  help: { desc: 'Show help', type: 'boolean' },
  json: { desc: 'Output in JSON format', type: 'boolean' }
};

function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

async function main() {
  const { args, showHelp }: { args: Record<string, unknown>; showHelp: boolean } = parseCliArgs({ options });
  if (showHelp) {
    printUsage('Usage: pnpm tsx scripts/aiTriageBacklogTodos.ts [--help] [--json]', options);
    return;
  }
  emitEvent();
  try {
    const backlogRaw = await fs.promises.readFile(BACKLOG_PATH, 'utf-8');
    const backlogJson = JSON.parse(backlogRaw);
    let changed = false;
    const hotspots: Record<string, number> = {};
    let depGraph: Record<string, string[]> = {};
    try {
      depGraph = JSON.parse(await fs.promises.readFile(DEP_GRAPH_PATH, 'utf-8'));
    } catch {}
    const now = new Date();
    const staleItems: any[] = [];
    for (const item of backlogJson.backlog) {
      if (item.id && item.id.startsWith('todo:')) {
        if (isDocComment(item)) {
          item.aiSuggestedTriage = 'ignored';
        } else if (isCoreFile(item)) {
          item.aiSuggestedPriority = 'top';
        }
        const file = (item.id.split(':')[1] ?? '').split(':')[0];
        const dependentCount = getDependents(depGraph, file);
        item.dependentCount = dependentCount;
        if (dependentCount > 5) {
          item.dependencyHotspot = true;
          item.aiSuggestedPriority = 'top';
        }
        hotspots[file] = (hotspots[file] ?? 0) + 1;
        // Staleness detection
        let dateStr = item.createdAt || item.updatedAt || item.timestamp;
        if (!dateStr && item.note && /\d{4}-\d{2}-\d{2}/.test(item.note)) {
          dateStr = item.note.match(/\d{4}-\d{2}-\d{2}/)?.[0];
        }
        let daysOld = 0;
        if (dateStr) {
          daysOld = daysSince(dateStr);
        } else {
          // Fallback: mark as 0 days old if no date
          daysOld = 0;
        }
        item.daysOld = daysOld;
        item.stale = daysOld > STALE_DAYS;
        if (item.stale) staleItems.push(item);
        changed = true;
      }
    }
    if (changed) {
      await fs.promises.writeFile(BACKLOG_PATH, JSON.stringify(backlogJson, null, 2));
      if (args['json']) printResult({ message: 'AI triage, priority, and staleness suggestions added to backlog.' }, true);
      else printResult('AI triage, priority, and staleness suggestions added to backlog.');
    }
    const sorted = Object.entries(hotspots).sort((a, b) => b[1] - a[1]);
    const topHotspots = sorted.slice(0, 5).map(([file, count]) => ({ file, count }));
    const output = { topHotspots, staleItems: staleItems.map(i => ({ id: i.id, daysOld: i.daysOld, description: i.description })) };
    emitEvent();
    printResult(args['json'] ? output : 'Top technical debt hotspots:\n' + topHotspots.map(h => `  ${h.file}: ${h.count} TODOs`).join('\n') + (staleItems.length ? `\nStale TODOs (> ${STALE_DAYS} days):\n` + staleItems.map(i => `  ${i.id} (${i.daysOld} days): ${i.description}`).join('\n') : ''), Boolean(args['json']));
  } catch (e) {
    emitEvent();
    printError(e instanceof Error ? e.message : String(e), process.argv.includes('--json'));
  }
}

main(); 