#!/usr/bin/env tsx
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import { promises as fsp } from 'fs';

async function main() {
  const describePath = '.nootropic-cache/describe-registry.json';
  const manifestPath = 'docs/docManifest.json';
  const manifest = await fsp.readFile(manifestPath, 'utf-8').then(JSON.parse);
  const registry = await fsp.readFile(describePath, 'utf-8').then(JSON.parse);

  // Extract implemented modules (not planned/in-progress)
  // @ts-expect-error TS(6133): 'd' is declared but its value is never read.
  const implemented = registry.filter((d: unknown) => !d.status ?? (d.status !== 'planned' && d.status !== 'in progress'));
  // @ts-expect-error TS(6133): 'd' is declared but its value is never read.
  const planned = registry.filter((d: unknown) => d.status === 'planned' || d.status === 'in progress');

  // Use only the 'name' field for sections
  // @ts-expect-error TS(6133): 'd' is declared but its value is never read.
  const sections = implemented.map((d: unknown) => d.name).sort();
  // @ts-expect-error TS(6133): 'd' is declared but its value is never read.
  const plannedSections = planned.map((d: unknown) => d.name).sort();

  // Write new manifest
  const newManifest = {
    ...manifest,
    sections,
    planned: plannedSections,
    timestamp: new Date().toISOString(),
  };
  // @ts-expect-error TS(2304): Cannot find name 'manifestPath'.
  await fsp.writeFile(manifestPath, JSON.stringify(newManifest, null, 2));
  // @ts-expect-error TS(2552): Cannot find name 'sections'. Did you mean 'Selecti... Remove this comment to see the full error message
  console.log(`Doc manifest updated with ${sections.length} implemented and ${plannedSections.length} planned sections.`);
}

main().catch(e => { console.error(e); process.exit(1); }); 