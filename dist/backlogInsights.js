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
 * LLM/AI-usage: Produces a summary for triage, automation, and reporting.
 */
import fs from 'fs';
import path from 'path';
import { parseCliArgs, printUsage, printResult, printError } from './src/utils/cliHelpers.js';
const BACKLOG_PATH = path.resolve('agentBacklog.json');
const INSIGHTS_PATH = path.resolve('.nootropic-cache/backlog-insights.json');
function getDaysSince(dateStr) {
    if (!dateStr)
        return 9999;
    const then = new Date(dateStr).getTime();
    const now = Date.now();
    return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}
// Stub for event emission (to be replaced with real event bus integration)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function emitEvent(_event, _payload) {
    // Placeholder: integrate with event bus or telemetry
}
const options = {
    help: { desc: 'Show help', type: 'boolean' },
    json: { desc: 'Output in JSON format', type: 'boolean' }
};
// Type guard for BacklogTodo
function isBacklogTodo(item) {
    return (typeof item === 'object' &&
        item !== null &&
        'id' in item &&
        typeof item.id === 'string' &&
        (item.id.startsWith('todo:') || item.id.startsWith('epic-')));
}
async function main() {
    const { args, showHelp } = parseCliArgs({ options });
    if (showHelp) {
        printUsage('Usage: pnpm tsx scripts/backlogInsights.ts [--help] [--json]', options);
        return;
    }
    emitEvent('scriptStarted', { script: 'backlogInsights' });
    try {
        const backlogRaw = await fs.promises.readFile(BACKLOG_PATH, 'utf-8');
        const backlogJson = JSON.parse(backlogRaw);
        // Type guard for backlog entries
        const todos = Array.isArray(backlogJson.backlog)
            ? backlogJson.backlog.filter(isBacklogTodo)
            : [];
        const fileCounts = {};
        const staleness = [];
        for (const todo of todos) {
            const file = ((todo.id.split(':')[1] ?? '').split(':')[0] ?? '(unknown)');
            fileCounts[file] = (fileCounts[file] ?? 0) + 1;
            const days = getDaysSince(todo.note?.timestamp ?? todo.timestamp);
            staleness.push({ todo, days });
        }
        const topFiles = Object.entries(fileCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([file, count]) => ({ file, count }));
        const oldestTodos = staleness.slice().sort((a, b) => b.days - a.days).slice(0, 5).map(({ todo, days }) => ({ id: todo.id, description: todo.description, days }));
        const nextSprint = todos.filter((t) => (t.aiSuggestedPriority === 'top' || t.priority === 'top') && t.triage !== 'ignored' && t.triage !== 'resolved').slice(0, 10);
        const summary = { topFiles, oldestTodos, nextSprint };
        await fs.promises.writeFile(INSIGHTS_PATH, JSON.stringify(summary, null, 2));
        emitEvent('scriptCompleted', { script: 'backlogInsights', output: summary });
        const topFilesStr = topFiles.map(f => `  ${f.file}: ${f.count}`).join('\n');
        const oldestTodosStr = oldestTodos.map(t => `  ${t.id}: ${t.description} (${t.days} days)`).join('\n');
        const outputStr = `Backlog insights written to ${INSIGHTS_PATH}\n\nTop files by TODO count:\n${topFilesStr}\n\nTop 5 oldest TODOs:\n${oldestTodosStr}`;
        printResult(args['json'] ? summary : outputStr, args['json']);
    }
    catch (e) {
        emitEvent('scriptError', { script: 'backlogInsights', error: String(e) });
        printError(e instanceof Error ? e.message : String(e), process.argv.includes('--json'));
    }
}
main();
