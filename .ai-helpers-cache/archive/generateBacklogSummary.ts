#!/usr/bin/env tsx
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';

function extractActionable(backlog: unknown[]): unknown[] {
  // Recursively extract all items not marked as complete/completed
  const actionable: unknown[] = [];
  for (const item of backlog) {
    if (!item) continue;
    // @ts-expect-error TS(2571): Object is of type 'unknown'.
    const status = (item.status ?? '').toLowerCase();
    if (status === 'complete' || status === 'completed') continue;
    // @ts-expect-error TS(2339): Property 'id' does not exist on type 'unknown'.
    const { id, description, status: s, priority, note, references, subtasks } = item;
    const entry: unknown = { id, description, status: s, priority, note, references };
    if (Array.isArray(subtasks) && subtasks.length) {
      // @ts-expect-error TS(2571): Object is of type 'unknown'.
      entry.subtasks = extractActionable(subtasks);
    }
    actionable.push(entry);
  }
  return actionable;
}

async function main() {
  const backlogPath = path.resolve('agentBacklog.json');
  // @ts-expect-error TS(6133): 'outPath' is declared but its value is never read.
  const outPath = path.resolve('.nootropic-cache/backlog-summary.json');
  if (!fs.existsSync(backlogPath)) {
    console.error('agentBacklog.json not found');
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(backlogPath, 'utf-8'));
  // @ts-expect-error TS(2304): Cannot find name 'item'.
  const actionable = extractActionable(Array.isArray(data.backlog) ? data.backlog : []).filter(item => !['resolved', 'ignored'].includes(item.triage));
  // @ts-expect-error TS(2304): Cannot find name 'item'.
  const untriagedCount = actionable.filter(item => item.triage === 'pending').length;
  const summary = {
    generatedAt: new Date().toISOString(),
    actionable,
    untriagedCount,
  };
  // @ts-expect-error TS(2304): Cannot find name 'outPath'.
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  // @ts-expect-error TS(2304): Cannot find name 'outPath'.
  await fs.promises.writeFile(outPath, JSON.stringify(summary, null, 2));
  // @ts-expect-error TS(2304): Cannot find name 'outPath'.
  console.log(`Backlog summary generated: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
}); 