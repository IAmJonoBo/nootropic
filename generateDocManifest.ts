#!/usr/bin/env tsx
import { promises as fsp } from 'fs';
import path from 'path';

async function getMarkdownSlugs(dir: string) {
  const files = await fsp.readdir(dir);
  return files.filter(f => f.endsWith('.md')).map(f => f.replace(/\.md$/, ''));
}

async function main() {
  const describePath = '.nootropic-cache/describe-registry.json';
  const manifestPath = 'docs/docManifest.json';
  const epicsDir = 'docs/epics';
  const storiesDir = 'docs/stories';
  const manifest = await fsp.readFile(manifestPath, 'utf-8').then(JSON.parse);
  const registry = await fsp.readFile(describePath, 'utf-8').then(JSON.parse);

  // Extract implemented modules (not planned/in-progress)
  const implemented = registry.filter((d: unknown) => {
    if (typeof d !== 'object' || d === null) return false;
    const obj = d as Record<string, unknown>;
    return !('status' in obj) || (obj['status'] !== 'planned' && obj['status'] !== 'in progress');
  });
  const planned = registry.filter((d: unknown) => {
    if (typeof d !== 'object' || d === null) return false;
    const obj = d as Record<string, unknown>;
    return obj['status'] === 'planned' || obj['status'] === 'in progress';
  });

  // Use only the 'name' field for sections
  const sections = implemented.map((d: unknown) => {
    if (typeof d !== 'object' || d === null) return '';
    return (d as Record<string, unknown>)['name'] as string ?? '';
  }).sort();
  const plannedSections = planned.map((d: unknown) => {
    if (typeof d !== 'object' || d === null) return '';
    return (d as Record<string, unknown>)['name'] as string ?? '';
  }).sort();

  // Add epics and stories from docs/epics and docs/stories
  const epics = (await getMarkdownSlugs(epicsDir)).map(slug => ({ slug, docPath: `${epicsDir}/${slug}.md` }));
  const stories = (await getMarkdownSlugs(storiesDir)).map(slug => ({ slug, docPath: `${storiesDir}/${slug}.md` }));

  // Write new manifest
  const newManifest = {
    ...manifest,
    sections: [...sections, ...epics.map(e => e.slug)],
    planned: plannedSections,
    epics,
    stories,
    timestamp: new Date().toISOString(),
  };
  await fsp.writeFile(manifestPath, JSON.stringify(newManifest, null, 2));
  console.log(`Doc manifest updated with ${sections.length} implemented, ${epics.length} epics, ${stories.length} stories, and ${plannedSections.length} planned sections.`);
}

main().catch(e => { console.error(e); process.exit(1); }); 