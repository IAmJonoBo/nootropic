// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// import fs from 'fs';
import path from 'path';
// @ts-ignore
import { readJsonSafe, writeJsonSafe, listFilesRecursive } from './utils.js';
// @ts-ignore
import { ensureDirExists } from './src/utils/context/contextFileHelpers.js';
// @ts-ignore
import { getCacheFilePath, ensureCacheDirExists } from './src/utils/context/cacheDir.js';
import { fileURLToPath } from 'url';
// @ts-ignore
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
// @ts-ignore
import { initTelemetry, shutdownTelemetry } from './telemetry.js';
// @ts-ignore
import { getEmbeddingProvider } from './src/capabilities/embeddingRegistry.js';

interface SemanticIndexEntry {
  file: string;
  line: number;
  text: string;
  embedding: number[];
  source?: string; // e.g., 'code', 'describe-registry', 'llm-docs', 'capability-doc'
  capability?: string; // capability name if available
  section?: string | undefined; // section or heading if available
}

// Define a type for the registry entries
interface DescribeRegistryEntry {
  // Add the expected properties here, e.g.:
  name: string;
  description?: string;
  [key: string]: unknown;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SEMANTIC_INDEX_JSON = getCacheFilePath('semantic-index.json');

// Initialize OpenTelemetry (if enabled)
initTelemetry('semantic-index-builder');

// --- Extract text chunks from code, docs, agent messages, and describe outputs ---
async function extractChunks(): Promise<Omit<SemanticIndexEntry, 'embedding'>[]> {
  const chunks: Omit<SemanticIndexEntry, 'embedding'>[] = [];

  // 1. Code, docs, and agent messages (legacy logic)
  const dirs = [
    `${__dirname}/../extension/src/agents`,
    __dirname,
    `${__dirname}/../docs`,
  ];
  for (const dir of dirs) {
    await ensureDirExists(dir);
    const files = await listFilesRecursive(dir);
    for (const file of files) {
      if (!file.endsWith('.ts') && !file.endsWith('.md') && !file.endsWith('.json')) continue;
      const filePath = `${dir}/${file}`;
      let lines: string[] = [];
      try {
        lines = (await readJsonSafe<string[]>(filePath, undefined)) ?? (await import('fs')).promises.readFile(filePath, 'utf-8').then((d: string) => d.split('\n')).catch(() => []);
      } catch {
        lines = [];
      }
      for (let i = 0; i < lines.length; i += 10) {
        const text = lines.slice(i, i + 10).join(' ');
        chunks.push({ file: filePath, line: i + 1, text, source: 'code' });
      }
    }
  }

  // 2. Describe registry (JSON)
  try {
    const describeRegistryPath = path.resolve(__dirname, '../.nootropic-cache/describe-registry.json');
    const describeRegistry = await readJsonSafe<DescribeRegistryEntry[]>(describeRegistryPath, []);
    for (const cap of describeRegistry) {
      const capName = cap && cap.name ? String(cap.name) : 'unknown';
      for (const key of Object.keys(cap)) {
        if (typeof cap[key] === 'string' && (cap[key] as string).length > 0) {
          chunks.push({
            file: describeRegistryPath,
            line: 1,
            text: `${key}: ${cap[key]}`,
            source: 'describe-registry',
            capability: capName,
            section: key,
          });
        } else if (Array.isArray(cap[key])) {
          for (const [i, item] of (Array.isArray(cap[key]) ? (cap[key] as unknown[]) : []).entries()) {
            if (typeof item === 'string') {
              chunks.push({
                file: describeRegistryPath,
                line: 1,
                text: `${key}[${i}]: ${item}`,
                source: 'describe-registry',
                capability: capName,
                section: key,
              });
            } else if (typeof item === 'object' && item !== null) {
              chunks.push({
                file: describeRegistryPath,
                line: 1,
                text: `${key}[${i}]: ${JSON.stringify(item)}`,
                source: 'describe-registry',
                capability: capName,
                section: key,
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('[semanticIndexBuilder] Could not load describe-registry.json:', e);
  }

  // 3. LLM docs (JSON, more structured)
  try {
    const llmDocsPath = path.resolve(__dirname, '../.nootropic-cache/llm-docs.json');
    const llmDocs = await readJsonSafe<DescribeRegistryEntry[]>(llmDocsPath, []);
    for (const cap of llmDocs) {
      const capName = cap && cap.name ? String(cap.name) : 'unknown';
      for (const key of Object.keys(cap)) {
        if (typeof cap[key] === 'string' && (cap[key] as string).length > 0) {
          chunks.push({
            file: llmDocsPath,
            line: 1,
            text: `${key}: ${cap[key]}`,
            source: 'llm-docs',
            capability: capName,
            section: key,
          });
        } else if (Array.isArray(cap[key])) {
          for (const [i, item] of (Array.isArray(cap[key]) ? (cap[key] as unknown[]) : []).entries()) {
            if (typeof item === 'string') {
              chunks.push({
                file: llmDocsPath,
                line: 1,
                text: `${key}[${i}]: ${item}`,
                source: 'llm-docs',
                capability: capName,
                section: key,
              });
            } else if (typeof item === 'object' && item !== null) {
              chunks.push({
                file: llmDocsPath,
                line: 1,
                text: `${key}[${i}]: ${JSON.stringify(item)}`,
                source: 'llm-docs',
                capability: capName,
                section: key,
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('[semanticIndexBuilder] Could not load llm-docs.json:', e);
  }

  // 4. Per-capability docs (Markdown)
  try {
    // Always resolve from project root for robustness
    const capDocsDir = path.resolve(process.cwd(), 'docs/capabilities');
    const files = (await import('fs')).readdirSync(capDocsDir).filter((f: string) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(capDocsDir, file);
      const content = (await import('fs')).readFileSync(filePath, 'utf-8');
      // Chunk by heading/paragraph
      const lines = content.split('\n');
      let currentSection = '';
      let buffer: string[] = [];
      let lineNum = 1;
      for (let i = 0; i < lines.length; ++i) {
        const line = lines[i] ?? '';
        if (typeof line === 'string' && line.startsWith('#')) {
          // Flush previous section
          if (buffer.length > 0) {
            chunks.push({
              file: filePath,
              line: lineNum,
              text: buffer.join(' '),
              source: 'capability-doc',
              capability: file.replace(/\.md$/, ''),
              section: currentSection || undefined,
            });
            buffer = [];
          }
          currentSection = line.replace(/^#+\s*/, '');
          lineNum = i + 1;
        } else if (typeof line === 'string' && line.trim() === '') {
          if (buffer.length > 0) {
            chunks.push({
              file: filePath,
              line: lineNum,
              text: buffer.join(' '),
              source: 'capability-doc',
              capability: file.replace(/\.md$/, ''),
              section: currentSection || undefined,
            });
            buffer = [];
          }
          lineNum = i + 1;
        } else if (typeof line === 'string') {
          buffer.push(line);
        }
      }
      // Flush last buffer
      if (buffer.length > 0) {
        chunks.push({
          file: filePath,
          line: lineNum,
          text: buffer.join(' '),
          source: 'capability-doc',
          capability: file.replace(/\.md$/, ''),
          section: currentSection || undefined,
        });
      }
    }
  } catch (e) {
    console.warn('[semanticIndexBuilder] Could not load per-capability docs:', e);
  }

  return chunks;
}

// --- Build semantic index ---
async function buildSemanticIndex(): Promise<void> {
  try {
    const chunks = await extractChunks();
    const provider = getEmbeddingProvider();
    const texts = chunks.map(chunk => chunk.text);
    const embeddings = await provider.embed(texts);
    const index: SemanticIndexEntry[] = chunks.map((chunk, i) => ({ ...chunk, embedding: embeddings[i] ?? [] }));
    await writeJsonSafe(SEMANTIC_INDEX_JSON, index);
    console.log(`Semantic index written to ${SEMANTIC_INDEX_JSON} using provider: ${provider.name}`);
  } catch (e) {
    console.error('Error building semantic index:', e);
    process.exit(1);
  }
}

// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const [cmd, ...args] = parseArgs(process.argv).args;
    if (cmd === 'help' || args.includes('--help')) {
      printHelp('pnpm tsx nootropic/semanticIndexBuilder.ts', 'Build the semantic search index.');
      process.exit(0);
    }
    try {
      await buildSemanticIndex();
    } catch (e) {
      handleCliError(e);
    }
  })();
}

// Ensure graceful shutdown of telemetry on exit
process.on('exit', shutdownTelemetry);
process.on('SIGINT', async () => { await shutdownTelemetry(); process.exit(0); });

/**
 * Returns a description of the semantic index builder and its main functions.
 */
export function describe() {
  return {
    name: 'semanticIndexBuilder',
    description: 'Builds a semantic search index for code, docs, and agent messages.',
    functions: [
      { name: 'buildSemanticIndex', signature: '() => Promise<void>', description: 'Builds the semantic index.' },
      { name: 'extractChunks', signature: '() => Promise<Omit<SemanticIndexEntry, "embedding">[]>', description: 'Extracts text chunks from code, docs, and messages.' }
    ],
    usage: "import { buildSemanticIndex } from 'nootropic/semanticIndexBuilder';",
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

export { buildSemanticIndex, extractChunks };

/**
 * Initializes semanticIndexBuilder. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 */
export async function initSemanticIndexBuilder() {
  await ensureCacheDirExists();
} 