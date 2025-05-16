// AI-Helpers is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// import fs from 'fs';
import path from 'path';
import { readJsonSafe, writeJsonSafe, ensureDirExists, listFilesRecursive } from './utils.js';
import { fileURLToPath } from 'url';
import { SEMANTIC_INDEX_PATH } from './paths.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Extract text chunks from code, docs, and agent messages ---
async function extractChunks() {
    // For now, just scan extension/src/agents, AI-Helpers/, and docs/
    const dirs = [
        `${__dirname}/../extension/src/agents`,
        __dirname,
        `${__dirname}/../docs`,
    ];
    const chunks = [];
    for (const dir of dirs) {
        await ensureDirExists(dir);
        const files = await listFilesRecursive(dir);
        for (const file of files) {
            if (!file.endsWith('.ts') && !file.endsWith('.md') && !file.endsWith('.json'))
                continue;
            const filePath = `${dir}/${file}`;
            let lines = [];
            try {
                lines = (await readJsonSafe(filePath, undefined)) || (await import('fs')).promises.readFile(filePath, 'utf-8').then((d) => d.split('\n')).catch(() => []);
            }
            catch {
                lines = [];
            }
            for (let i = 0; i < lines.length; i += 10) {
                const text = lines.slice(i, i + 10).join(' ');
                chunks.push({ file: filePath, line: i + 1, text });
            }
        }
    }
    return chunks;
}
// --- Stub: Generate embedding for a text chunk (replace with real model/OpenAI API) ---
function embed(text) {
    // For now, return a fake embedding (hash of text)
    let hash = 0;
    for (let i = 0; i < text.length; i++)
        hash = (hash * 31 + text.charCodeAt(i)) % 1e6;
    return [hash];
}
// --- Build semantic index ---
async function buildSemanticIndex() {
    try {
        const chunks = await extractChunks();
        const index = chunks.map(chunk => ({ ...chunk, embedding: embed(chunk.text) }));
        await writeJsonSafe(SEMANTIC_INDEX_PATH, index);
        console.log(`Semantic index written to ${SEMANTIC_INDEX_PATH}`);
    }
    catch (e) {
        console.error('Error building semantic index:', e);
        process.exit(1);
    }
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const [cmd, ...args] = parseArgs(process.argv).args;
        if (cmd === 'help' || args.includes('--help')) {
            printHelp('pnpm tsx AI-Helpers/semanticIndexBuilder.ts', 'Build the semantic search index.');
            process.exit(0);
        }
        try {
            await buildSemanticIndex();
        }
        catch (e) {
            handleCliError(e);
        }
    })();
}
/**
 * Returns a description of the semantic index builder and its main functions.
 */
export function describe() {
    return {
        name: 'semanticIndexBuilder',
        description: 'Builds a semantic search index for code, docs, and agent messages.',
        functions: [
            { name: 'buildSemanticIndex', signature: '() => Promise<void>', description: 'Builds the semantic index.' },
            { name: 'extractChunks', signature: '() => Promise<Omit<SemanticIndexEntry, "embedding">[]>', description: 'Extracts text chunks from code, docs, and messages.' },
            { name: 'embed', signature: '(text: string) => number[]', description: 'Generates a fake embedding for a text chunk.' }
        ],
        usage: "import { buildSemanticIndex } from 'ai-helpers/semanticIndexBuilder';",
        schema: {
            buildSemanticIndex: {
                input: { type: 'null' },
                output: { type: 'null' }
            },
            extractChunks: {
                input: { type: 'null' },
                output: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            file: { type: 'string' },
                            line: { type: 'number' },
                            text: { type: 'string' }
                        },
                        required: ['file', 'line', 'text']
                    }
                }
            },
            embed: {
                input: {
                    type: 'object',
                    properties: {
                        text: { type: 'string' }
                    },
                    required: ['text']
                },
                output: {
                    type: 'array',
                    items: { type: 'number' }
                }
            }
        }
    };
}
export { buildSemanticIndex, extractChunks, embed };
