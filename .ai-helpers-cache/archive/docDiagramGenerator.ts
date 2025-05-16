// CLI entrypoint and ad hoc helper for documentation and diagram generation. Intentionally excluded from main TSConfig/ESLint. May be flagged as unused by static analysis tools. Do not delete.
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2307): Cannot find module 'url' or its corresponding type... Remove this comment to see the full error message
import { fileURLToPath } from 'url';
// @ts-expect-error TS(2305): Module '"./utils/context/contextManager.js"' has n... Remove this comment to see the full error message
import { ensureDirExists } from './utils/context/contextManager.js';
// @ts-expect-error TS(2459): Module '"./utils.js"' declares 'readJsonSafe' loca... Remove this comment to see the full error message
import { readJsonSafe, writeJsonSafe } from './utils.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
import { initTelemetry, shutdownTelemetry } from './telemetry.js';

// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
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
  // @ts-expect-error TS(2362): The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
  agentCollaborationMap?: Record<string, string[]> | Edge[];
  // @ts-expect-error TS(2304): Cannot find name 'dependencyGraph'.
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
// @ts-expect-error TS(6133): 'context' is declared but its value is never read.
async function generateAgentDocs(context: ContextDoc): Promise<string[]> {
  // @ts-expect-error TS(2304): Cannot find name 'agents'.
  const agents = context.agents ?? [];
  // @ts-expect-error TS(2304): Cannot find name 'outFiles'.
  const outFiles: string[] = [];
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  for (const agent of agents) {
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    const md = `# Agent: ${agent.name}\n\n${agent.description ?? ''}\n\n## Contract\n\n\n${'```json\n' + JSON.stringify(agent.contract, null, 2) + '\n```'}\n`;
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const outPath = `${DOCS_DIR}/agent_${agent.name}.md`;
    // @ts-expect-error TS(2304): Cannot find name 'outPath'.
    await writeJsonSafe(outPath, md);
    // @ts-expect-error TS(2304): Cannot find name 'outFiles'.
    outFiles.push(outPath);
  }
  return outFiles;
}

// @ts-expect-error TS(7010): 'toEdgeArray', which lacks return-type annotation,... Remove this comment to see the full error message
function toEdgeArray(val: Record<string, string[]> | Edge[] | undefined): Edge[] {
  // @ts-expect-error TS(2304): Cannot find name 'val'.
  if (Array.isArray(val)) return val as Edge[];
  // @ts-expect-error TS(2304): Cannot find name 'val'.
  if (val && typeof val === 'object') {
    return Object.entries(val).flatMap(([from, tos]) =>
      (Array.isArray(tos) ? tos : [tos]).map(to => ({ from, to }))
    );
  }
  return [];
}

// --- Generate collaboration map (Mermaid) ---
// @ts-expect-error TS(6133): 'context' is declared but its value is never read.
async function generateCollabMap(context: ContextDoc): Promise<string> {
  // @ts-expect-error TS(2304): Cannot find name 'edges'.
  const edges = toEdgeArray(context.agentCollaborationMap).map((e: Edge) => `${e.from} --> ${e.to}`);
  // @ts-expect-error TS(2304): Cannot find name 'graph'.
  const mermaid = `graph TD\n${edges.join('\n')}`;
  // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
  const outPath = `${DOCS_DIR}/collaborationMap.mmd`;
  // @ts-expect-error TS(2304): Cannot find name 'outPath'.
  await writeJsonSafe(outPath, mermaid);
  return outPath;
}

// --- Generate dependency graph (Mermaid) ---
// @ts-expect-error TS(6133): 'context' is declared but its value is never read.
async function generateDepGraph(context: ContextDoc): Promise<string> {
  // @ts-expect-error TS(2304): Cannot find name 'edges'.
  const edges = toEdgeArray(context.dependencyGraph).map((e: Edge) => `${e.from} --> ${e.to}`);
  // @ts-expect-error TS(2304): Cannot find name 'graph'.
  const mermaid = `graph TD\n${edges.join('\n')}`;
  // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
  const outPath = `${DOCS_DIR}/dependencyGraph.mmd`;
  // @ts-expect-error TS(2304): Cannot find name 'outPath'.
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
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(1);
  }
}

// --- ESM-compatible CLI entrypoint ---
// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
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