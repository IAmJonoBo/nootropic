// AI-Helpers is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { SEMANTIC_INDEX_PATH } from './paths.js';
import { readJsonSafe } from './utils.js';
import { embed } from './semanticIndexBuilder.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
// --- Compute L2 distance between two vectors ---
function l2(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++)
        sum += (a[i] - b[i]) ** 2;
    return Math.sqrt(sum);
}
// --- Search the semantic index ---
async function semanticSearch(query, topN = 5) {
    try {
        const index = await readJsonSafe(SEMANTIC_INDEX_PATH, []);
        if (!index.length)
            throw new Error('semanticIndex.json not found or empty. Run semanticIndexBuilder first.');
        const qEmbed = embed(query);
        const scored = index.map((chunk) => ({ ...chunk, score: l2(chunk.embedding, qEmbed) }));
        scored.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
        return scored.slice(0, topN);
    }
    catch (e) {
        console.error('Error in semantic search:', e);
        process.exit(1);
    }
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const { args } = parseArgs(process.argv);
        const cmd = args[0];
        if (cmd === 'help' || args.includes('--help')) {
            printHelp('pnpm tsx AI-Helpers/semanticSearchHelper.ts <query>', 'Semantic search for code, docs, and messages.');
            process.exit(0);
        }
        const query = args.join(' ');
        if (!query) {
            printHelp('pnpm tsx AI-Helpers/semanticSearchHelper.ts <query>', 'Semantic search for code, docs, and messages.');
            process.exit(1);
        }
        try {
            const results = await semanticSearch(query, 5);
            for (const r of results) {
                console.log(`File: ${r.file} (line ${r.line})\nScore: ${r.score}\nText: ${r.text}\n---`);
            }
        }
        catch (e) {
            handleCliError(e);
        }
    })();
}
export { semanticSearch };
