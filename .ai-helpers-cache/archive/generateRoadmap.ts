#!/usr/bin/env tsx
// @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
import fs from 'fs';
// @ts-expect-error TS(6133): 'path' is declared but its value is never read.
import path from 'path';

function mdEscape(s: string) {
  return s.replace(/([*_`~])/g, '\\$1');
}

function renderFeature(item: unknown) {
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  let out = `### ${mdEscape((item.feature ?? item.title) || 'Untitled')}`;
  // @ts-expect-error TS(2304): Cannot find name 'item'.
  if (item.priority) out += ` \`[${item.priority}]\``;
  // @ts-expect-error TS(2304): Cannot find name 'item'.
  if (item.rationale ?? item.description) out += `\n${item.rationale ?? item.description}`;
  if (item.actionableSteps && Array.isArray(item.actionableSteps) && item.actionableSteps.length) {
    out += '\n**Actionable Steps:**';
    // @ts-expect-error TS(2304): Cannot find name 'n'.
    for (const step of item.actionableSteps) out += `\n- ${mdEscape(step)}`;
  }
  if (item.references && Array.isArray(item.references) && item.references.length) {
    out += '\n**References:**';
    // @ts-expect-error TS(2304): Cannot find name 'n'.
    for (const ref of item.references) out += `\n  - ${ref}`;
  }
  if (item.researchLinks && Array.isArray(item.researchLinks) && item.researchLinks.length) {
    out += '\n**Research Links:**';
    // @ts-expect-error TS(2304): Cannot find name 'n'.
    for (const ref of item.researchLinks) out += `\n  - ${ref}`;
  }
  // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
  if (item.status) out += `\n_Status: ${item.status}_`;
  return out + '\n';
}

function main() {
  const backlogPath = path.resolve('agentBacklog.json');
  const outPath = path.resolve('docs/ROADMAP.md');
  const backlog = JSON.parse(fs.readFileSync(backlogPath, 'utf-8'));
  let md = '# 📍 nootropic Roadmap\n\n';
  md += '_This file is auto-generated from agentBacklog.json. Do not edit manually._\n\n';
  if (Array.isArray(backlog.inProgress) && backlog.inProgress.length) {
    md += '## 🚧 In Progress\n\n';
    for (const item of backlog.inProgress) md += renderFeature(item) + '\n';
  }
  if (Array.isArray(backlog.planned) && backlog.planned.length) {
    md += '## 📝 Planned\n\n';
    for (const item of backlog.planned) md += renderFeature(item) + '\n';
  }
  if (Array.isArray(backlog.completed) && backlog.completed.length) {
    md += '## ✅ Completed\n\n';
    for (const item of backlog.completed) md += renderFeature(item) + '\n';
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, md);
  // @ts-expect-error TS(2304): Cannot find name 'Roadmap'.
  console.log(`Roadmap generated: ${outPath}`);
}

main(); 