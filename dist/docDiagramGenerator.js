// AI-Helpers is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { DOCS_DIR, CONTEXT_PATH, DOC_MANIFEST_PATH } from './paths.js';
import { ensureDirExists, readJsonSafe, writeJsonSafe } from './utils.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
// --- Load context snapshot ---
async function loadContext() {
    await ensureDirExists(DOCS_DIR);
    const context = await readJsonSafe(CONTEXT_PATH, null);
    if (!context)
        throw new Error('context-snapshot.json not found.');
    return context;
}
// --- Generate agent contract docs ---
async function generateAgentDocs(context) {
    const agents = context.agents || [];
    const outFiles = [];
    for (const agent of agents) {
        const md = `# Agent: ${agent.name}\n\n${agent.description || ''}\n\n## Contract\n\n\n${'```json\n' + JSON.stringify(agent.contract, null, 2) + '\n```'}\n`;
        const outPath = `${DOCS_DIR}/agent_${agent.name}.md`;
        await writeJsonSafe(outPath, md);
        outFiles.push(outPath);
    }
    return outFiles;
}
function toEdgeArray(val) {
    if (Array.isArray(val))
        return val;
    if (val && typeof val === 'object') {
        return Object.entries(val).flatMap(([from, tos]) => (Array.isArray(tos) ? tos : [tos]).map(to => ({ from, to })));
    }
    return [];
}
// --- Generate collaboration map (Mermaid) ---
async function generateCollabMap(context) {
    const edges = toEdgeArray(context.agentCollaborationMap).map((e) => `${e.from} --> ${e.to}`);
    const mermaid = `graph TD\n${edges.join('\n')}`;
    const outPath = `${DOCS_DIR}/collaborationMap.mmd`;
    await writeJsonSafe(outPath, mermaid);
    return outPath;
}
// --- Generate dependency graph (Mermaid) ---
async function generateDepGraph(context) {
    const edges = toEdgeArray(context.dependencyGraph).map((e) => `${e.from} --> ${e.to}`);
    const mermaid = `graph TD\n${edges.join('\n')}`;
    const outPath = `${DOCS_DIR}/dependencyGraph.mmd`;
    await writeJsonSafe(outPath, mermaid);
    return outPath;
}
// --- Write manifest for agent discovery ---
async function writeManifest(files) {
    const manifest = { generated: files, timestamp: new Date().toISOString() };
    await writeJsonSafe(DOC_MANIFEST_PATH, manifest);
}
// --- Main generator ---
async function runDocDiagramGenerator() {
    try {
        const context = await loadContext();
        const files = [];
        files.push(...await generateAgentDocs(context));
        files.push(await generateCollabMap(context));
        files.push(await generateDepGraph(context));
        await writeManifest(files);
        console.log('Docs and diagrams generated in AI-Helpers/docs/. Manifest written.');
    }
    catch (e) {
        console.error('Error generating docs/diagrams:', e);
        process.exit(1);
    }
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const { args } = parseArgs(process.argv);
        const cmd = args[0];
        if (cmd === 'help' || args.includes('--help')) {
            printHelp('pnpm tsx AI-Helpers/docDiagramGenerator.ts', 'Generate agent docs and diagrams.');
            process.exit(0);
        }
        try {
            await runDocDiagramGenerator();
        }
        catch (e) {
            handleCliError(e);
        }
    })();
}
export { runDocDiagramGenerator };
