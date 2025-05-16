// AI-Helpers is for Cursor agents only. This is the mutation/refactor engine for all future agents.
// NOTE: This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { PATCH_DIR, MUTATION_PLAN_PATH } from './paths.js';
import { ensureDirExists, listFilesRecursive, readJsonSafe, writeJsonSafe } from './utils.js';
import { extractTodos, detectSchemaDrift, getTestFiles } from './contextSnapshotHelper.js';
import { appendMemoryEvent } from './memoryLaneHelper.js';
if (!ensureDirExists(PATCH_DIR)) {
    console.error(`Failed to create directory: ${PATCH_DIR}`);
}
// --- Utility: Write file safely ---
async function writeFileSafe(filePath, data) {
    try {
        await writeJsonSafe(filePath, data);
    }
    catch (e) {
        console.error(`Failed to write file: ${filePath}`, e);
    }
}
// --- Generate mutation/refactor suggestions ---
function getMutationSuggestions() {
    const todos = extractTodos();
    const schemaDrift = detectSchemaDrift();
    const testFiles = getTestFiles();
    const suggestions = [];
    for (const drift of schemaDrift) {
        suggestions.push({ type: 'schemaDrift', agent: drift.agent, fix: `Add missing properties ${drift.missing.join(', ')} to ${drift.agent}` });
    }
    for (const todo of todos) {
        suggestions.push({ type: 'todo', file: todo.file, line: todo.line, suggestion: `Resolve: ${todo.text}` });
    }
    if (testFiles.length === 0) {
        suggestions.push({ type: 'test', suggestion: 'Add tests for uncovered agents/services.' });
    }
    return suggestions;
}
// --- Generate code mutation patches (best-effort string/regex for now) ---
async function generatePatches(suggestions) {
    const patches = [];
    await ensureDirExists(PATCH_DIR);
    for (const s of suggestions) {
        if (s.type === 'todo') {
            // For TODOs, suggest removing the TODO comment
            const filePath = await findFilePath(s.file);
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
                const patch = `--- a/${s.file}\n+++ b/${s.file}\n@@ -${s.line},1 +${s.line},1 @@\n-${original}\n+${patched}\n`;
                const patchFile = `${PATCH_DIR}/${s.file.replace(/\W/g, '_')}_L${s.line}.patch`;
                await writeFileSafe(patchFile, patch);
                patches.push({ file: s.file, line: s.line, patchFile, type: 'todo' });
            }
        }
        if (s.type === 'schemaDrift') {
            // For schema drift, suggest adding missing properties (best-effort comment patch)
            const filePath = await findFilePath(s.agent);
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
// --- Find file path in agents/helpers ---
async function findFilePath(filename) {
    const dirs = [
        `${__dirname}/../extension/src/agents`,
        __dirname,
    ];
    for (const dir of dirs) {
        await ensureDirExists(dir);
        const files = await listFilesRecursive(dir);
        for (const file of files) {
            if (file === filename) {
                return `${dir}/${file}`;
            }
        }
    }
    return null;
}
// --- Output mutation plan ---
async function writeMutationPlan(patches, suggestions) {
    const plan = patches.map(p => ({ file: p.file, line: p.line, patchFile: p.patchFile, type: p.type }));
    await writeFileSafe(MUTATION_PLAN_PATH, JSON.stringify({ plan, suggestions }, null, 2));
    appendMemoryEvent({ type: 'mutationPlan', planMeta: { count: plan.length, timestamp: new Date().toISOString() } });
}
// --- Main entrypoint ---
async function runMutationEngine() {
    try {
        const suggestions = getMutationSuggestions();
        const patches = await generatePatches(suggestions);
        await writeMutationPlan(patches, suggestions);
        console.log('AI mutation/refactor plan and patches generated in AI-Helpers/.');
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
export { getMutationSuggestions, generatePatches, writeMutationPlan, runMutationEngine };
