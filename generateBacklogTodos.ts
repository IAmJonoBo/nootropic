#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
// @ts-ignore
import { extractTodos } from '../contextSnapshotHelper.js';

const BACKLOG_PATH = path.resolve('agentBacklog.json');

interface TodoItem {
  id: string;
  description?: string;
  status?: string;
  priority?: string;
  note?: string;
  source?: string;
  triage?: string;
  type?: string;
}

function isTodoItem(item: unknown): item is TodoItem {
  return typeof item === 'object' && item !== null && 'id' in item && typeof (item as { id: unknown }).id === 'string' && ((item as { id: string }).id.startsWith('todo:'));
}

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
      .filter(isTodoItem)
      .map((item: TodoItem) => item.id)
  );

  // Prepare new TODO backlog items
  const newTodos = todos
    .map((todo: unknown) => {
      if (typeof todo !== 'object' || todo === null) return null;
      const t = todo as Record<string, unknown>;
      const id = `todo:${t['file']}:${t['line']}`;
      let descType = t['type'] || 'TODO';
      return {
        id,
        description: `[${descType}] ${t['text']} (${t['file']}:${t['line']})`,
        status: 'not started',
        priority: descType === 'STUB' ? 'medium' : 'low',
        note: 'Auto-extracted from codebase. Please triage and update as needed.',
        source: 'auto-extracted',
        triage: 'pending',
        type: descType
      };
    })
    .filter((todo: unknown) => {
      if (typeof todo !== 'object' || todo === null) return false;
      const t = todo as Record<string, unknown>;
      return !existing.has(t['id']);
    });

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