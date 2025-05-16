#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
import { extractTodos } from '../contextSnapshotHelper.js';

const BACKLOG_PATH = path.resolve('agentBacklog.json');

async function main() {
  // Load current backlog
  const backlogRaw = await fs.promises.readFile(BACKLOG_PATH, 'utf-8');
  const backlogJson = JSON.parse(backlogRaw);
  const backlogArr = backlogJson.backlog ?? [];

  // Extract all TODOs
  const todos = await extractTodos();

  // Build a set of existing TODOs for deduplication
  const existing = new Set(
    backlogArr
      .filter((item: unknown): item is { id: string } => typeof item === 'object' && item !== null && 'id' in item && typeof (item as any).id === 'string' && (item as any).id.startsWith('todo:'))
      .map((item: { id: string }) => item.id)
  );

  // Prepare new TODO backlog items
  const newTodos = todos
    .map(todo => {
      const id = `todo:${todo.file}:${todo.line}`;
      let descType = todo.type || 'TODO';
      return {
        id,
        description: `[${descType}] ${todo.text} (${todo.file}:${todo.line})`,
        status: 'not started',
        priority: descType === 'STUB' ? 'medium' : 'low',
        note: 'Auto-extracted from codebase. Please triage and update as needed.',
        source: 'auto-extracted',
        triage: 'pending',
        type: descType
      };
    })
    .filter(todo => !existing.has(todo.id));

  // Append new TODOs to backlog
  if (newTodos.length > 0) {
    backlogJson.backlog = [...backlogArr, ...newTodos];
    await fs.promises.writeFile(BACKLOG_PATH, JSON.stringify(backlogJson, null, 2));
    console.log(`Added ${newTodos.length} new TODOs to the backlog.`);
  } else {
    console.log('No new TODOs found. Backlog is up to date.');
  }
}

main().catch(e => { console.error(e); process.exit(1); }); 