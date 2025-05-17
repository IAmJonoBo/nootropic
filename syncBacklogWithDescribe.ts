#!/usr/bin/env tsx
import { promises as fsp } from 'fs';

function normalize(str: string) {
  return (str ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '').trim();
}

async function main() {
  const backlogPath = 'agentBacklog.json';
  const archivePath = '.nootropic-cache/backlog-archive.json';
  const describePath = '.nootropic-cache/describe-registry.json';

  const backlog = await fsp.readFile(backlogPath, 'utf-8').then(JSON.parse);
  let archive = [];
  try { archive = await fsp.readFile(archivePath, 'utf-8').then(JSON.parse); } catch {}
  const registry = await fsp.readFile(describePath, 'utf-8').then(JSON.parse);

  const implemented = registry.filter((d: unknown) => {
    if (typeof d !== 'object' || d === null) return false;
    const obj = d as Record<string, unknown>;
    return obj['status'] === 'implemented' || obj['status'] === 'complete';
  });
  const implementedKeys = new Set(
    implemented.flatMap((d: unknown) => [
      normalize((d as Record<string, unknown>)['name'] as string ?? ''),
      normalize((d as Record<string, unknown>)['id'] as string ?? '')
    ])
  );
  const backlogItems = backlog.backlog ?? [];
  const completed = [];
  const remaining = [];
  for (const item of backlogItems) {
    const itemKeys = [
      normalize((item as Record<string, unknown>)['id'] as string ?? ''),
      normalize(((item as Record<string, unknown>)['description'] as string ?? '').split(':')[0] ?? '')
    ];
    if ((item.status === 'complete' || item.status === 'implemented') && itemKeys.some(k => implementedKeys.has(k))) {
      completed.push(item);
    } else {
      remaining.push(item);
    }
  }
  // Archive completed
  if (completed.length) {
    archive = [...archive, ...completed];
    await fsp.writeFile(archivePath, JSON.stringify(archive, null, 2));
    backlog.backlog = remaining;
    await fsp.writeFile(backlogPath, JSON.stringify(backlog, null, 2));
    console.log(`Archived ${completed.length} completed backlog items.`);
  }
  // Check for missing implemented features
  const backlogKeys = new Set(
    backlogItems.flatMap((i: unknown) => [
      normalize((i as Record<string, unknown>)['id'] as string ?? ''),
      normalize(((i as Record<string, unknown>)['description'] as string ?? '').split(':')[0] ?? '')
    ])
  );
  const missing = implemented.filter((d: unknown) => {
    const keys = [
      normalize((d as Record<string, unknown>)['name'] as string ?? ''),
      normalize((d as Record<string, unknown>)['id'] as string ?? '')
    ];
    return !keys.some(k => backlogKeys.has(k));
  });
  if (missing.length) {
    console.warn('WARNING: Implemented features missing from backlog:', missing.map((d: unknown) => {
      if (typeof d !== 'object' || d === null) return '';
      const obj = d as Record<string, unknown>;
      return obj['name'] ?? obj['id'] ?? '';
    }));
    for (const m of missing) {
      console.warn('  Debug:', { name: (m as Record<string, unknown>)['name'] as string ?? '', id: (m as Record<string, unknown>)['id'] as string ?? '' });
    }
  }
  // Check for missing docs (optional: could check docManifest.json)
  // ...
  console.log('Backlog/describe sync complete.');
}
main(); 