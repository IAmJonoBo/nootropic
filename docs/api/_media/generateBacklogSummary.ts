#!/usr/bin/env tsx
/**
 * Script to generate a summary of actionable backlog items from agentBacklog.json.
 * Usage: pnpm tsx generateBacklogSummary.ts
 * LLM/AI-usage: Produces a machine-usable summary for triage, automation, and reporting.
 */
import fs from 'fs';
import path from 'path';

function extractActionable(backlog: unknown[]): unknown[] {
  // Recursively extract all items not marked as complete/completed
  const actionable: unknown[] = [];
  for (const item of backlog) {
    if (!item) continue;
    if (typeof item !== 'object' || item === null) continue;
    const obj = item as Record<string, unknown>;
    const status = (obj['status'] as string ?? '').toLowerCase();
    if (status === 'complete' || status === 'completed') continue;
    const id = obj['id'] as string ?? '';
    const description = obj['description'] as string ?? '';
    const s = obj['status'] as string ?? '';
    const priority = obj['priority'] as string ?? '';
    const note = obj['note'] as string ?? '';
    const references = obj['references'] as string[] ?? [];
    const slug = obj['slug'] as string ?? '';
    const docPath = obj['docPath'] as string ?? '';
    const subtasks = obj['subtasks'] as unknown[] ?? [];
    const entry: Record<string, unknown> = { id, description, status: s, priority, note, references, slug, docPath };
    if (Array.isArray(subtasks) && subtasks.length) {
      entry.subtasks = extractActionable(subtasks).map((sub: unknown) => {
        if (typeof sub === 'object' && sub !== null) {
          return { ...(sub as Record<string, unknown>), epicSlug: slug, epicDocPath: docPath };
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
  const actionable = extractActionable(Array.isArray(data.backlog) ? data.backlog : []).filter((item: unknown) => {
    if (typeof item !== 'object' || item === null) return false;
    const obj = item as Record<string, unknown>;
    return !['resolved', 'ignored'].includes(obj['triage'] as string);
  });
  const untriagedCount = actionable.filter((item: unknown) => {
    if (typeof item !== 'object' || item === null) return false;
    return (item as Record<string, unknown>)['triage'] === 'pending';
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

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});

// Backlog summary update (2025-05-18):
// - CLI and audit/fix script are robust, JSON mode and environment aware.
// - Registry is idempotent in non-production.
// - All contextManager instantiations are correct and linter clean.
// - All ESM/TypeScript quirks resolved; all tests pass.
// - CLI is LLM/AI/automation-friendly, outputs valid JSON in JSON mode. 