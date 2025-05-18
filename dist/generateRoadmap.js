#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
function mdEscape(s) {
    return s.replace(/([*_`~])/g, '\\$1');
}
function renderFeature(item) {
    if (typeof item !== 'object' || item === null)
        return '### Untitled\n';
    const obj = item;
    let out = `### ${mdEscape((obj['feature'] ?? obj['title']) || 'Untitled')}`;
    if (obj['priority'])
        out += ` \`[${obj['priority']}]\``;
    if (obj['rationale'] ?? obj['description'])
        out += `\n${obj['rationale'] ?? obj['description']}`;
    if (obj['actionableSteps'] && Array.isArray(obj['actionableSteps']) && obj['actionableSteps'].length) {
        out += '\n**Actionable Steps:**';
        for (const step of obj['actionableSteps'])
            out += `\n- ${mdEscape(String(step))}`;
    }
    if (obj['references'] && Array.isArray(obj['references']) && obj['references'].length) {
        out += '\n**References:**';
        for (const ref of obj['references'])
            out += `\n  - ${String(ref)}`;
    }
    if (obj['researchLinks'] && Array.isArray(obj['researchLinks']) && obj['researchLinks'].length) {
        out += '\n**Research Links:**';
        for (const ref of obj['researchLinks'])
            out += `\n  - ${String(ref)}`;
    }
    if (obj['status'])
        out += `\n_Status: ${obj['status']}_`;
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
        for (const item of backlog.inProgress)
            md += renderFeature(item) + '\n';
    }
    if (Array.isArray(backlog.planned) && backlog.planned.length) {
        md += '## 📝 Planned\n\n';
        for (const item of backlog.planned)
            md += renderFeature(item) + '\n';
    }
    if (Array.isArray(backlog.completed) && backlog.completed.length) {
        md += '## ✅ Completed\n\n';
        for (const item of backlog.completed)
            md += renderFeature(item) + '\n';
    }
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, md);
    console.log(`Roadmap generated: ${outPath}`);
}
main();
