#!/usr/bin/env tsx
/**
 * Script to generate a summary of actionable backlog items from agentBacklog.json.
 * Usage: pnpm tsx generateBacklogSummary.ts
 * LLM/AI-usage: Produces a machine-usable summary for triage, automation, and reporting.
 */
import fs from 'fs';
import path from 'path';
function extractActionable(backlog) {
    // Recursively extract all items not marked as complete/completed
    const actionable = [];
    for (const item of backlog) {
        if (!item)
            continue;
        if (typeof item !== 'object' || item === null)
            continue;
        const obj = item;
        const status = (obj['status'] ?? '').toLowerCase();
        if (status === 'complete' || status === 'completed')
            continue;
        const id = obj['id'] ?? '';
        const description = obj['description'] ?? '';
        const s = obj['status'] ?? '';
        const priority = obj['priority'] ?? '';
        const note = obj['note'] ?? '';
        const references = obj['references'] ?? [];
        const slug = obj['slug'] ?? '';
        const docPath = obj['docPath'] ?? '';
        const subtasks = obj['subtasks'] ?? [];
        const entry = { id, description, status: s, priority, note, references, slug, docPath };
        if (Array.isArray(subtasks) && subtasks.length) {
            entry.subtasks = extractActionable(subtasks).map((sub) => {
                if (typeof sub === 'object' && sub !== null) {
                    return { ...sub, epicSlug: slug, epicDocPath: docPath };
                }
                return sub;
            });
        }
        actionable.push(entry);
    }
    return actionable;
}
async function main() {
    const backlogPath = path.resolve('agentBacklog.json');
    const outPath = path.resolve('.nootropic-cache/backlog-summary.json');
    if (!fs.existsSync(backlogPath)) {
        console.error('agentBacklog.json not found');
        process.exit(1);
    }
    const data = JSON.parse(fs.readFileSync(backlogPath, 'utf-8'));
    const actionable = extractActionable(Array.isArray(data.backlog) ? data.backlog : []).filter((item) => {
        if (typeof item !== 'object' || item === null)
            return false;
        const obj = item;
        return !['resolved', 'ignored'].includes(obj['triage']);
    });
    const untriagedCount = actionable.filter((item) => {
        if (typeof item !== 'object' || item === null)
            return false;
        return item['triage'] === 'pending';
    }).length;
    const summary = {
        generatedAt: new Date().toISOString(),
        actionable,
        untriagedCount,
    };
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await fs.promises.writeFile(outPath, JSON.stringify(summary, null, 2));
    console.log(`Backlog summary generated: ${outPath}`);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
