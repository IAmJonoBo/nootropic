#!/usr/bin/env tsx
/**
 * generateCodeDependencyGraph.ts
 *
 * Generates a code dependency graph for the project, mapping file and module dependencies.
 *
 * Usage:
 *   pnpm tsx scripts/generateCodeDependencyGraph.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Writes dependency graph to the appropriate location.
 *
 * Troubleshooting:
 *   - Ensure all files and dependencies are up to date.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check for missing or invalid dependencies in the graph.
 *
 * Example:
 *   pnpm tsx scripts/generateCodeDependencyGraph.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for generateCodeDependencyGraph script."
 *   - "List all scripts that generate code dependency graphs."
 *   - "How do I regenerate the code dependency graph?"
 *   - "What does generateCodeDependencyGraph do?"
 */
// @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
import fs from 'fs/promises';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';
// @ts-expect-error TS(2724): '"../utils/automationHelpers.js"' has no exported ... Remove this comment to see the full error message
import { writeJsonFile, handleError } from '../utils/automationHelpers.js';

const ROOT = path.resolve('.');
const CACHE_PATH = path.resolve('.nootropic-cache/code-dependency-graph.json');
// @ts-expect-error TS(6133): 'MERMAID_PATH' is declared but its value is never ... Remove this comment to see the full error message
const MERMAID_PATH = path.resolve('docs/codeDependencyGraph.mmd');
const EXCLUDE_DIRS = ['node_modules', 'dist', '.nootropic-cache', '.git', 'venv', 'vendor', 'testdata', '__tests__', 'copy', 'Flight Control', 'Rocketship copy'];

const usage = 'Usage: pnpm tsx scripts/generateCodeDependencyGraph.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

function isCanonicalFile(file: string): boolean {
  // @ts-expect-error TS(2304): Cannot find name 'dir'.
  return !EXCLUDE_DIRS.some(dir => file.includes(dir));
}

// @ts-expect-error TS(6133): 'dir' is declared but its value is never read.
async function listFilesRecursive(dir: string): Promise<string[]> {
  // @ts-expect-error TS(2552): Cannot find name 'files'. Did you mean 'File'?
  const files: string[] = [];
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
    if (!entry) continue;
    // @ts-expect-error TS(6133): 'entry' is declared but its value is never read.
    if (entry.isDirectory()) {
      // @ts-expect-error TS(6133): 'entry' is declared but its value is never read.
      if (entry.name && !EXCLUDE_DIRS.includes(entry.name)) {
        // @ts-expect-error TS(2552): Cannot find name 'files'. Did you mean 'File'?
        files.push(...(await listFilesRecursive(path.join(dir, entry.name))));
      }
    // @ts-expect-error TS(2304): Cannot find name 'entry'.
    } else if (entry.name && (entry.name.endsWith('.ts') ?? entry.name.endsWith('.js'))) {
      // @ts-expect-error TS(2304): Cannot find name 'files'.
      files.push(path.join(dir, entry.name));
    }
  }
  return files;
}

// @ts-expect-error TS(6133): 'file' is declared but its value is never read.
function extractDeps(file: string, content: string): string[] {
  const deps: string[] = [];
  // ES6 imports
  const importRegex = /import\s+[^'"\n]+['"]([^'\"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content))) {
    if (match[1]) deps.push(match[1]);
  }
  // CommonJS require
  const requireRegex = /require\(['"]([^'\"]+)['"]\)/g;
  while ((match = requireRegex.exec(content))) {
    if (match[1]) deps.push(match[1]);
  }
  return deps;
}

async function main() {
  // @ts-expect-error TS(6133): 'args' is declared but its value is never read.
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    const files = (await listFilesRecursive(ROOT)).filter(isCanonicalFile);
    const graph: Record<string, string[]> = {};
    for (const file of files) {
      let content = '';
      // @ts-expect-error TS(2448): Block-scoped variable 'fs' used before its declara... Remove this comment to see the full error message
      try { content = await fs.readFile(file, 'utf-8'); } catch {}
      const deps = await Promise.all(
        // @ts-expect-error TS(2304): Cannot find name 'async'.
        extractDeps(file, content).map(async dep => {
          // Resolve relative imports to absolute file paths
          // @ts-expect-error TS(6133): 'dep' is declared but its value is never read.
          if (dep.startsWith('.')) {
            // @ts-expect-error TS(2304): Cannot find name 'abs'.
            const abs = path.resolve(path.dirname(file), dep);
            // Try .ts, .js, /index.ts, /index.js
            // @ts-expect-error TS(2300): Duplicate identifier '(Missing)'.
            for (const ext of ['.ts', '.js', '/index.ts', '/index.js']) {
              try {
                // @ts-expect-error TS(7031): Binding element 'await' implicitly has an 'any' ty... Remove this comment to see the full error message
                await fs.stat(abs + ext);
                // @ts-expect-error TS(2304): Cannot find name 'abs'.
                return path.relative(ROOT, abs + ext);
              } catch {}
            }
            // @ts-expect-error TS(2304): Cannot find name 'abs'.
            return path.relative(ROOT, abs);
          }
          return dep; // External or unresolved
        })
      );
      // @ts-expect-error TS(2304): Cannot find name 'graph'.
      graph[path.relative(ROOT, file)] = deps.filter(dep => dep && typeof dep === 'string');
    }
    // Write JSON
    // @ts-expect-error TS(2304): Cannot find name 'graph'.
    await writeJsonFile(CACHE_PATH, graph);
    // Write Mermaid
    // @ts-expect-error TS(2304): Cannot find name 'graph'.
    const edges = Object.entries(graph)
      // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
      .flatMap(([from, tos]) => tos.map(to => `${from} --> ${to}`));
    // @ts-expect-error TS(2304): Cannot find name 'graph'.
    const mermaid = `graph TD\n${edges.join('\n')}`;
    await fs.mkdir(path.dirname(MERMAID_PATH), { recursive: true });
    await fs.writeFile(MERMAID_PATH, mermaid);
    console.log('Code dependency graph written to', CACHE_PATH, 'and', MERMAID_PATH);
    printResult('Code dependency graph generated successfully.', args['json']);
  } catch (e) {
    handleError(e, args['json']);
    printError(e, args['json']);
  }
}

main(); 