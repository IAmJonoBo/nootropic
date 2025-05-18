#!/usr/bin/env tsx
/**
 * Migrates agentBacklog.json epics and stories to Markdown files in docs/epics/ and docs/stories/.
 * Annotates each backlog item with slug, docPath, and lastSynced.
 * Usage: pnpm tsx scripts/migrateBacklogToMarkdown.ts
 */
import fs from 'fs';
import path from 'path';
function kebabCase(str) {
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();
}
function renderMarkdown(item, type, parentId) {
    const lines = [
        `# ${item.id} (${type})`,
        '',
        `**Description:** ${item.description || ''}`,
        `**Status:** ${item.status || ''}`,
        `**Priority:** ${item.priority || ''}`,
        item.milestone ? `**Milestone:** ${item.milestone}` : '',
        item.progress ? `**Progress:** ${item.progress}` : '',
        item.definitionOfDone ? `**Definition of Done:** ${item.definitionOfDone}` : '',
        item.note ? `**Note:** ${item.note}` : '',
        item.owner ? `**Owner:** ${item.owner}` : '',
        item.tags ? `**Tags:** ${Array.isArray(item.tags) ? item.tags.join(', ') : item.tags}` : '',
        item.references ? `**References:** ${Array.isArray(item.references) ? item.references.join(', ') : item.references}` : '',
        parentId ? `**Parent Epic:** ${parentId}` : '',
        '',
        '---',
        '',
        '## Metadata',
        '',
        `- id: ${item.id}`,
        `- slug: ${item.slug}`,
        `- docPath: ${item.docPath}`,
        `- lastSynced: ${item.lastSynced}`,
        '',
        '---',
        '',
        item.subtasks && item.subtasks.length ? '## Subtasks\n' + item.subtasks.map((s) => `- [${s.id}](${s.docPath})`).join('\n') : '',
    ];
    return lines.filter(Boolean).join('\n');
}
function annotate(item, type) {
    const slug = kebabCase(item.id);
    const docPath = type === 'epic' ? `docs/epics/${slug}.md` : `docs/stories/${slug}.md`;
    const lastSynced = new Date().toISOString();
    const annotated = { ...item, slug, docPath, lastSynced };
    if (item.subtasks && Array.isArray(item.subtasks)) {
        annotated.subtasks = item.subtasks.map((s) => annotate(s, 'story'));
    }
    return annotated;
}
function* walkStories(item) {
    if (item.subtasks && Array.isArray(item.subtasks)) {
        for (const sub of item.subtasks) {
            yield { story: sub, parentId: item.id };
            yield* walkStories(sub);
        }
    }
}
async function main() {
    const backlogPath = path.resolve('agentBacklog.json');
    const epicsDir = path.resolve('docs/epics');
    const storiesDir = path.resolve('docs/stories');
    if (!fs.existsSync(backlogPath))
        throw new Error('agentBacklog.json not found');
    fs.mkdirSync(epicsDir, { recursive: true });
    fs.mkdirSync(storiesDir, { recursive: true });
    const data = JSON.parse(fs.readFileSync(backlogPath, 'utf-8'));
    const backlog = Array.isArray(data.backlog) ? data.backlog : [];
    // Annotate epics and stories
    const annotatedEpics = backlog.map((epic) => annotate(epic, 'epic'));
    // Write Markdown files
    for (const epic of annotatedEpics) {
        fs.writeFileSync(path.join(epicsDir, `${epic.slug}.md`), renderMarkdown(epic, 'epic'));
        for (const { story, parentId } of walkStories(epic)) {
            fs.writeFileSync(path.join(storiesDir, `${story.slug}.md`), renderMarkdown(story, 'story', parentId));
        }
    }
    // Update agentBacklog.json
    const newData = { ...data, backlog: annotatedEpics };
    fs.writeFileSync(backlogPath, JSON.stringify(newData, null, 2));
    console.log(`Migrated ${annotatedEpics.length} epics and all stories to Markdown. Backlog updated.`);
}
main().catch(e => { console.error(e); process.exit(1); });
