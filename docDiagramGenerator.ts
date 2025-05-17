// CLI entrypoint and ad hoc helper for documentation and diagram generation. Intentionally excluded from main TSConfig/ESLint. May be flagged as unused by static analysis tools. Do not delete.
import path from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
import { ensureDirExists } from './utils/context/contextManager.js';
// @ts-ignore
import { readJsonSafe, writeJsonSafe } from './utils.js';
// @ts-ignore
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
// @ts-ignore
import { initTelemetry, shutdownTelemetry } from './telemetry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../docs');
const CONTEXT_PATH = path.resolve(__dirname, '../.nootropic-cache/context-snapshot.json');
const DOC_MANIFEST_PATH = path.resolve(DOCS_DIR, 'manifest.json');

// --- Types for doc generation ---
interface AgentDoc {
  name: string;
  description?: string;
  contract?: unknown;
}
interface Edge {
  from: string;
  to: string;
}
interface ContextDoc {
  agents?: AgentDoc[];
  agentCollaborationMap?: Record<string, string[]> | Edge[];
  dependencyGraph?: Record<string, string[]> | Edge[];
}

// --- Load context snapshot ---
async function loadContext() {
  await ensureDirExists(DOCS_DIR);
  const context = await readJsonSafe(CONTEXT_PATH, null);
  if (!context) throw new Error('context-snapshot.json not found.');
  return context;
}

// --- Generate agent contract docs ---
async function generateAgentDocs(context: ContextDoc): Promise<string[]> {
  const agents = context.agents ?? [];
  const outFiles: string[] = [];
  for (const agent of agents) {
    const md = `# Agent: ${agent.name}\n\n${agent.description ?? ''}\n\n## Contract\n\n\n${'```json\n' + JSON.stringify(agent.contract, null, 2) + '\n```'}\n`;
    const outPath = `${DOCS_DIR}/agent_${agent.name}.md`;
    await writeJsonSafe(outPath, md);
    outFiles.push(outPath);
  }
  return outFiles;
}

function toEdgeArray(val: Record<string, string[]> | Edge[] | undefined): Edge[] {
  if (Array.isArray(val)) return val as Edge[];
  if (val && typeof val === 'object') {
    return Object.entries(val).flatMap(([from, tos]) =>
      (Array.isArray(tos) ? tos : [tos]).map(to => ({ from, to }))
    );
  }
  return [];
}

// --- Generate collaboration map (Mermaid) ---
async function generateCollabMap(context: ContextDoc): Promise<string> {
  const edges = toEdgeArray(context.agentCollaborationMap).map((e: Edge) => `${e.from} --> ${e.to}`);
  const mermaid = `graph TD\n${edges.join('\n')}`;
  const outPath = `${DOCS_DIR}/collaborationMap.mmd`;
  await writeJsonSafe(outPath, mermaid);
  return outPath;
}

// --- Generate dependency graph (Mermaid) ---
async function generateDepGraph(context: ContextDoc): Promise<string> {
  const edges = toEdgeArray(context.dependencyGraph).map((e: Edge) => `${e.from} --> ${e.to}`);
  const mermaid = `graph TD\n${edges.join('\n')}`;
  const outPath = `${DOCS_DIR}/dependencyGraph.mmd`;
  await writeJsonSafe(outPath, mermaid);
  return outPath;
}

// --- Write manifest for agent discovery ---
async function writeManifest(files: string[]) {
  const manifest = { generated: files, timestamp: new Date().toISOString() };
  await writeJsonSafe(DOC_MANIFEST_PATH, manifest);
}

// --- Main generator ---
async function runDocDiagramGenerator() {
  try {
    const context = await loadContext();
    const files: string[] = [];
    files.push(...await generateAgentDocs(context));
    files.push(await generateCollabMap(context));
    files.push(await generateDepGraph(context));
    await writeManifest(files);
    console.log('Docs and diagrams generated in nootropic/docs/. Manifest written.');
  } catch (e) {
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
      printHelp('pnpm tsx nootropic/docDiagramGenerator.ts', 'Generate agent docs and diagrams.');
      process.exit(0);
    }
    try {
      // Initialize OpenTelemetry (if enabled)
      initTelemetry('doc-diagram-generator');
      await runDocDiagramGenerator();
    } catch (e) {
      handleCliError(e);
    } finally {
      // Ensure graceful shutdown of telemetry on exit
      shutdownTelemetry();
    }
  })();
}

/**
 * Returns a description of the doc diagram generator plugin/capability.
 */
export function describe() {
  return {
    name: 'docDiagramGenerator',
    description: 'Generates agent/workflow diagrams from live registry/context. Follows docs-first workflow and AI/LLM-friendly documentation best practices. All exports must have TSDoc comments, and all changes must be reflected in documentation and describe() output. The describe() registry is validated in CI.',
    functions: [
      { name: 'runDocDiagramGenerator', signature: '() => Promise<void>', description: 'Generate agent/workflow diagrams.' }
    ],
    usage: "pnpm tsx nootropic/docDiagramGenerator.ts",
    schema: {
      runDocDiagramGenerator: {
        input: { type: 'null' },
        output: { type: 'null' }
      }
    },
    docsFirst: true,
    aiFriendlyDocs: true,
    describeRegistry: true,
    bestPractices: [
      'Strict TypeScript',
      'Type-safe event-driven patterns',
      'Automated documentation (TSDoc, TypeDoc, describe())',
      'Docs-first engineering',
      'CI enforcement of docs/code sync',
    ],
    references: [
      'https://benhouston3d.com/blog/crafting-readmes-for-ai',
      'https://www.octopipe.com/blog/docs-first-engineering-workflow',
      'https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052',
      'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3'
    ]
  };
}

export { runDocDiagramGenerator }; 