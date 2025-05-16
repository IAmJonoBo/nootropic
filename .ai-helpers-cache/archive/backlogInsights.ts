#!/usr/bin/env tsx
/**
 * backlogInsights.ts
 *
 * Generates a machine-usable summary of technical debt hotspots, staleness, and top priorities from agentBacklog.json.
 * For each TODO, computes a staleness score (days since added or last modified), and outputs a summary JSON with:
 *   - top 5 files by TODO count
 *   - top 5 oldest TODOs
 *   - a prioritized list for the next sprint
 *
 * Usage: pnpm tsx scripts/backlogInsights.ts
 */
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const BACKLOG_PATH = path.resolve('agentBacklog.json');
const INSIGHTS_PATH = path.resolve('.nootropic-cache/backlog-insights.json');

function getDaysSince(dateStr: string | undefined): number {
  if (!dateStr) return 9999;
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

// Stub for event emission (to be replaced with real event bus integration)
// @ts-expect-error TS(7010): 'emitEvent', which lacks return-type annotation, i... Remove this comment to see the full error message
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function emitEvent(_event: string, _payload: Record<string, unknown>) {
  // Placeholder: integrate with event bus or telemetry
}

const options: Record<string, { desc: string; type: string }> = {
  // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
  help: { desc: 'Show help', type: 'boolean' },
  // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
  json: { desc: 'Output in JSON format', type: 'boolean' }
};

type BacklogInsightsArgs = {
  help?: boolean;
  json?: boolean;
};

type BacklogTodo = {
  id: string;
  description: string;
  note?: { timestamp?: string };
  timestamp?: string;
  aiSuggestedPriority?: string;
  priority?: string;
  triage?: string;
  // Add other fields as needed
};

async function main() {
  // @ts-expect-error TS(6133): 'args' is declared but its value is never read.
  const { args, showHelp }: { args: BacklogInsightsArgs; showHelp: boolean } = parseCliArgs({ options });
  if (showHelp) {
    printUsage('Usage: pnpm tsx scripts/backlogInsights.ts [--help] [--json]', options);
    return;
  }
  emitEvent('scriptStarted', { script: 'backlogInsights' });
  try {
    const backlogRaw = await fs.promises.readFile(BACKLOG_PATH, 'utf-8');
    const backlogJson = JSON.parse(backlogRaw);
    // @ts-expect-error TS(6133): 'item' is declared but its value is never read.
    const todos: BacklogTodo[] = backlogJson.backlog.filter((item: BacklogTodo) => item.id?.startsWith('todo:'));
    const fileCounts: Record<string, number> = {};
    const staleness: { todo: BacklogTodo; days: number }[] = [];
    for (const todo of todos) {
      const file = ((todo.id.split(':')[1] ?? '').split(':')[0] ?? '(unknown)');
      // @ts-expect-error TS(2454): Variable 'fileCounts' is used before being assigne... Remove this comment to see the full error message
      fileCounts[file] = (fileCounts[file] ?? 0) + 1;
      const days = getDaysSince(todo.note?.timestamp ?? todo.timestamp);
      staleness.push({ todo, days });
    }
    // @ts-expect-error TS(2454): Variable 'fileCounts' is used before being assigne... Remove this comment to see the full error message
    const topFiles = Object.entries(fileCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([file, count]) => ({ file, count }));
    // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
    const oldestTodos = staleness.slice().sort((a, b) => b.days - a.days).slice(0, 5).map(({ todo, days }) => ({ id: todo.id, description: todo.description, days }));
    // @ts-expect-error TS(6133): 't' is declared but its value is never read.
    const nextSprint = todos.filter((t: BacklogTodo) => (t.aiSuggestedPriority === 'top' || t.priority === 'top') && t.triage !== 'ignored' && t.triage !== 'resolved').slice(0, 10);
    const summary = { topFiles, oldestTodos, nextSprint };
    await fs.promises.writeFile(INSIGHTS_PATH, JSON.stringify(summary, null, 2));
    emitEvent('scriptCompleted', { script: 'backlogInsights', output: summary });
    // @ts-expect-error TS(2304): Cannot find name 'f'.
    const topFilesStr = topFiles.map(f => `  ${f.file}: ${f.count}`).join('\n');
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const oldestTodosStr = oldestTodos.map(t => `  ${t.id}: ${t.description} (${t.days} days)`).join('\n');
    // @ts-expect-error TS(2304): Cannot find name 'Backlog'.
    const outputStr = `Backlog insights written to ${INSIGHTS_PATH}\n\nTop files by TODO count:\n${topFilesStr}\n\nTop 5 oldest TODOs:\n${oldestTodosStr}`;
    printResult(args['json'] ? summary : outputStr, args['json']);
  } catch (e) {
    emitEvent('scriptError', { script: 'backlogInsights', error: String(e) });
    printError(e instanceof Error ? e.message : String(e), process.argv.includes('--json'));
  }
}

main(); 