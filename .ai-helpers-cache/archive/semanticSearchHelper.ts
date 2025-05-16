// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEMANTIC_INDEX_PATH = path.join(__dirname, 'semantic-index.json');
import { readJsonSafe } from './utils.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
import { getEmbeddingProvider } from './capabilities/embeddingRegistry.js';

interface SemanticIndexEntry {
  file: string;
  line: number;
  text: string;
  embedding: number[];
  score?: number;
  source?: string;
  capability?: string;
}

// --- Compute L2 distance between two vectors ---
function l2(a: number[], b: number[]): number {
  let sum = 0;
  // @ts-expect-error TS(2532): Object is possibly 'undefined'.
  for (let i = 0; i < a.length; i++) sum += (a[i] - b[i]) ** 2;
  return Math.sqrt(sum);
}

// --- Search the semantic index ---
// Add source/capability filtering
async function semanticSearch(query: string, topN = 5, opts?: { source?: string; capability?: string }): Promise<SemanticIndexEntry[]> {
  try {
    const index: SemanticIndexEntry[] = await readJsonSafe(SEMANTIC_INDEX_PATH, []);
    if (!index || !Array.isArray(index) || !index.length) throw new Error('semanticIndex.json not found or empty. Run semanticIndexBuilder first.');
    const provider = getEmbeddingProvider();
    const [qEmbedRaw] = await provider.embed(query);
    const qEmbed = qEmbedRaw ?? [];
    let filtered = index;
    if (opts?.source) filtered = filtered.filter(chunk => chunk.source === opts.source);
    if (opts?.capability) filtered = filtered.filter(chunk => chunk.capability === opts.capability);
    const scored = filtered.map((chunk: SemanticIndexEntry) => ({ ...chunk, score: l2(chunk.embedding, qEmbed) }));
    scored.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
    return scored.slice(0, topN);
  } catch (e) {
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
      printHelp('pnpm tsx nootropic/semanticSearchHelper.ts <query> [--source <source>] [--capability <capability>]', 'Semantic search for code, docs, and messages.');
      process.exit(0);
    }
    // Parse options
    let query = '';
    let source: string | undefined;
    let capability: string | undefined;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--source') source = args[++i];
      else if (args[i] === '--capability') capability = args[++i];
      else query += (query ? ' ' : '') + args[i];
    }
    if (!query) {
      printHelp('pnpm tsx nootropic/semanticSearchHelper.ts <query> [--source <source>] [--capability <capability>]', 'Semantic search for code, docs, and messages.');
      process.exit(1);
    }
    try {
      const opts: { source?: string; capability?: string } = {};
      if (source !== undefined) opts.source = source;
      if (capability !== undefined) opts.capability = capability;
      const results = await semanticSearch(query, 5, opts);
      for (const r of results) {
        console.log(`File: ${r.file} (line ${r.line})\nScore: ${r.score}\nSource: ${r.source ?? ''}\nCapability: ${r.capability ?? ''}\nText: ${r.text}\n---`);
      }
    } catch (e) {
      handleCliError(e);
    }
  })();
}

export { semanticSearch }; 