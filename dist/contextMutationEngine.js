// CLI entrypoint and ad hoc helper for code mutation/refactor suggestions. Intentionally excluded from main TSConfig/ESLint. May be flagged as unused by static analysis tools. Do not delete.
// nootropic is for Cursor agents only. This is the mutation/refactor engine for all future agents.
// NOTE: This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// TODO/FIXME Policy (2025): All TODO/FIXME comments must be actionable, attributed, and resolved promptly. Use TODO(owner): or FIXME(owner): for traceability. Generic or stale TODOs are not allowed.
// @ts-ignore
import { PATCH_DIR } from './paths.js';
// @ts-ignore
import { writeFileSafe, findFilePath, generateTodoPatch } from './src/utils/context/contextManager.js';
// @ts-ignore
import { readJsonSafe } from './utils.js';
// @ts-ignore
import { ensureDirExists } from './src/utils/context/contextManager.js';
// @ts-ignore
import { getCacheFilePath, ensureCacheDirExists } from './src/utils/context/cacheDir.js';
// @ts-ignore
import { extractTodos, detectSchemaDrift, getTestFiles, gatherSnapshotData, getContextChunk } from './contextSnapshotHelper.js';
// @ts-ignore
import { appendMemoryEvent, publishEvent } from './memoryLaneHelper.js';
const MUTATION_PLAN_JSON = getCacheFilePath('mutationPlan.json');
if (!ensureDirExists(PATCH_DIR)) {
    console.error(`Failed to create directory: ${PATCH_DIR}`);
}
/**
 * Generates mutation/refactor suggestions using full context snapshot.
 */
async function getHolisticMutationSuggestions() {
    const snapshot = await gatherSnapshotData();
    // Use todos, schemaDrift, testFiles from snapshot if available
    const todos = Array.isArray(snapshot['todos']) ? snapshot['todos'] : await extractTodos();
    const schemaDrift = Array.isArray(snapshot['schemaDrift']) ? snapshot['schemaDrift'] : await detectSchemaDrift();
    const testFiles = Array.isArray(snapshot['testFiles']) ? snapshot['testFiles'] : await getTestFiles();
    const suggestions = [];
    for (const drift of schemaDrift) {
        const suggestion = { type: 'schemaDrift', agent: drift.agent, fix: `Add missing properties ${drift.missing.join(', ')} to ${drift.agent}` };
        suggestions.push(suggestion);
        await publishEvent({ type: 'mutationSuggested', agentId: drift.agent ?? 'contextMutationEngine', timestamp: new Date().toISOString(), payload: suggestion });
    }
    for (const todo of todos) {
        const suggestion = { type: 'todo', file: todo.file, line: todo.line, suggestion: `Resolve: ${todo.text}` };
        suggestions.push(suggestion);
        await publishEvent({ type: 'mutationSuggested', agentId: 'contextMutationEngine', timestamp: new Date().toISOString(), payload: suggestion });
    }
    if (Array.isArray(testFiles) && testFiles.length === 0) {
        const suggestion = { type: 'test', suggestion: 'Add tests for uncovered agents/services.' };
        suggestions.push(suggestion);
        await publishEvent({ type: 'mutationSuggested', agentId: 'contextMutationEngine', timestamp: new Date().toISOString(), payload: suggestion });
    }
    return suggestions;
}
// --- Generate code mutation patches (best-effort string/regex for now) ---
async function generatePatches(suggestions) {
    const patches = [];
    await ensureDirExists(PATCH_DIR);
    for (const s of suggestions) {
        if (s.type === 'todo') {
            // For TODO/FIXME, replace with [RESOLVED] or require actionable, attributed comments per 2025 best practices
            const filePath = await findFilePath(s.file, [`${__dirname}/../extension/src/agents`, __dirname]);
            if (!filePath)
                continue;
            let lines = [];
            const jsonResult = await readJsonSafe(filePath, undefined);
            if (Array.isArray(jsonResult)) {
                lines = jsonResult;
            }
            else {
                lines = await (await import('fs')).promises.readFile(filePath, 'utf-8').then((d) => d.split('\n')).catch(() => []);
            }
            const original = lines[s.line - 1];
            if (!original)
                continue;
            const patched = original.replace(/(\/\/\s*TODO.*|\/\/\s*FIXME.*)/, '// [RESOLVED]');
            if (original !== patched) {
                const patch = generateTodoPatch(original, patched, s.file, s.line);
                const patchFile = `${PATCH_DIR}/${s.file.replace(/\W/g, '_')}_L${s.line}.patch`;
                await writeFileSafe(patchFile, patch);
                patches.push({ file: s.file, line: s.line, patchFile, type: 'todo' });
            }
        }
        if (s.type === 'schemaDrift') {
            // For schema drift, suggest adding missing properties (best-effort comment patch)
            const filePath = await findFilePath(s.agent, [`${__dirname}/../extension/src/agents`, __dirname]);
            if (!filePath)
                continue;
            const patch = `// PATCH: Add missing properties to ${s.agent}: ${s.fix}\n`;
            const patchFile = `${PATCH_DIR}/${s.agent.replace(/\W/g, '_')}_schemaDrift.patch`;
            await writeFileSafe(patchFile, patch);
            patches.push({ file: s.agent, patchFile, type: 'schemaDrift' });
        }
    }
    return patches;
}
// --- Output mutation plan ---
async function writeMutationPlan(patches, suggestions) {
    const plan = patches.map(p => ({ file: p.file, line: p.line, patchFile: p.patchFile, type: p.type }));
    await writeFileSafe(MUTATION_PLAN_JSON, JSON.stringify({ plan, suggestions }, null, 2));
    appendMemoryEvent({ type: 'mutationPlan', planMeta: { count: plan.length, timestamp: new Date().toISOString() } });
}
// --- Main entrypoint ---
async function runMutationEngine() {
    try {
        const suggestions = await getHolisticMutationSuggestions();
        const patches = await generatePatches(suggestions);
        await writeMutationPlan(patches, suggestions);
        console.log('AI mutation/refactor plan and patches generated in nootropic/.');
    }
    catch (e) {
        console.error('Error in mutation engine:', e);
        process.exit(1);
    }
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    runMutationEngine();
}
/**
 * Returns a context chunk for memory-efficient mutation planning.
 */
export async function getMutationContextChunk(size) {
    return await getContextChunk(size);
}
/**
 * Returns a delta snapshot for mutation/refactor planning (efficient incremental context).
 */
export async function getMutationDeltaSnapshot() {
    const { getContextChunk } = await import('./contextSnapshotHelper.js');
    return getContextChunk(4096); // Example: 4KB delta
}
/**
 * Returns semantic index keywords relevant to mutation/refactor planning.
 */
export async function getMutationSemanticIndex() {
    const { buildSemanticIndex } = await import('./contextSnapshotHelper.js');
    const index = await buildSemanticIndex();
    return Object.keys(index);
}
/**
 * Returns telemetry events related to mutation/refactor planning.
 */
export async function getMutationTelemetryEvents() {
    const { extractTelemetryEventsFromTests } = await import('./contextSnapshotHelper.js');
    return await extractTelemetryEventsFromTests();
}
/**
 * Describes the event-driven interface for mutation/refactor suggestions.
 * Returns an object with name, emits, and eventSchemas.
 */
export function describe() {
    return {
        name: 'contextMutationEngine',
        description: 'Event-driven mutation suggestion traceability and context mutation engine.',
        schema: {},
        status: 'implemented',
        docsFirst: true,
        aiFriendlyDocs: true,
        license: 'Apache-2.0',
        isOpenSource: true,
        eventSchema: {
            title: 'v1.mutationSuggested',
            type: 'object',
            properties: {
                eventId: { type: 'string', description: 'Unique event identifier (UUID).' },
                type: { const: 'v1.mutationSuggested' },
                version: { type: 'string', pattern: '^v[0-9]+\\.[0-9]+$', description: 'Semantic version of the event schema (e.g., v1.0).' },
                source: { type: 'string', description: 'Originating agent/module/service.' },
                agentId: { type: 'string' },
                timestamp: { type: 'string', format: 'date-time' },
                payload: { type: 'object' },
                correlationId: { type: 'string', description: 'Correlation ID for tracing related events.' },
                topic: { type: 'string', description: 'Logical topic/queue for advanced patterns.' }
            },
            required: ['eventId', 'type', 'version', 'source', 'agentId', 'timestamp', 'payload']
        },
        traceability: 'All mutation suggestions are logged to the event bus and memory lane, supporting full replay, audit, and distributed observability. See docs/orchestration.md and memoryLaneHelper.ts for details.'
    };
}
/**
 * Initializes contextMutationEngine. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 */
export async function initContextMutationEngine() {
    await ensureCacheDirExists();
}
export { getHolisticMutationSuggestions, generatePatches, writeMutationPlan, runMutationEngine };
