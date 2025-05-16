#!/usr/bin/env tsx
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
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

  // @ts-expect-error TS(6133): 'd' is declared but its value is never read.
  const implemented = registry.filter((d:unknown)=>d.status==='implemented'||d.status==='complete');
  const implementedKeys = new Set(
    // @ts-expect-error TS(6133): 'd' is declared but its value is never read.
    implemented.flatMap((d:unknown)=>[
      // @ts-expect-error TS(2304): Cannot find name 'd'.
      normalize(d.name),
      // @ts-expect-error TS(2304): Cannot find name 'd'.
      normalize(d.id ?? '')
    ])
  );
  const backlogItems = backlog.backlog ?? [];
  const completed = [];
  const remaining = [];
  for (const item of backlogItems) {
    const itemKeys = [normalize(item.id), normalize(item.description?.split(':')[0] ?? '')];
    // @ts-expect-error TS(2304): Cannot find name 'k'.
    if ((item.status==='complete'||item.status==='implemented') && itemKeys.some(k=>implementedKeys.has(k))) {
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
    // @ts-expect-error TS(2304): Cannot find name 'items'.
    console.log(`Archived ${completed.length} completed backlog items.`);
  }
  // Check for missing implemented features
  const backlogKeys = new Set(
    backlogItems.flatMap((i:unknown)=>[
      normalize(i.id),
      normalize(i.description?.split(':')[0] ?? '')
    ])
  );
  const missing = implemented.filter((d: unknown) => {
    const keys = [normalize(d.name), normalize(d.id ?? '')];
    return !keys.some(k=>backlogKeys.has(k));
  });
  if (missing.length) {
    console.warn('WARNING: Implemented features missing from backlog:', missing.map((d: unknown) => d.name ?? d.id));
    for (const m of missing) {
      console.warn('  Debug:', {name: m.name, id: m.id});
    }
  }
  // Check for missing docs (optional: could check docManifest.json)
  // ...
  console.log('Backlog/describe sync complete.');
}
main(); 