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
// @ts-ignore
import fs from 'fs/promises';
import path from 'path';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';
// @ts-ignore
import { writeJsonFile, handleError } from '../src/utils/automationHelpers.js';
const ROOT = path.resolve('.');
const CACHE_PATH = path.resolve('.nootropic-cache/code-dependency-graph.json');
const MERMAID_PATH = path.resolve('docs/codeDependencyGraph.mmd');
const EXCLUDE_DIRS = ['node_modules', 'dist', '.nootropic-cache', '.git', 'venv', 'vendor', 'testdata', '__tests__', 'copy', 'Flight Control', 'Rocketship copy'];
const usage = 'Usage: pnpm tsx scripts/generateCodeDependencyGraph.ts [--help] [--json]';
const options = {
    json: { desc: 'Output in JSON format', type: 'boolean' },
};
function isCanonicalFile(file) {
    return !EXCLUDE_DIRS.some(dir => file.includes(dir));
}
async function listFilesRecursive(dir) {
    const files = [];
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
        if (!entry)
            continue;
        if (entry.isDirectory()) {
            if (entry.name && !EXCLUDE_DIRS.includes(entry.name)) {
                files.push(...(await listFilesRecursive(path.join(dir, entry.name))));
            }
        }
        else if (entry.name && (entry.name.endsWith('.ts') ?? entry.name.endsWith('.js'))) {
            files.push(path.join(dir, entry.name));
        }
    }
    return files;
}
function extractDeps(content) {
    const deps = [];
    // ES6 imports
    const importRegex = /import\s+[^'"\n]+['"]([^'\"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(content))) {
        if (match[1])
            deps.push(match[1]);
    }
    // CommonJS require
    const requireRegex = /require\(['"]([^'\"]+)['"]\)/g;
    while ((match = requireRegex.exec(content))) {
        if (match[1])
            deps.push(match[1]);
    }
    return deps;
}
async function main() {
    const { args, showHelp } = parseCliArgs({ options });
    if (showHelp)
        return printUsage(usage, options);
    try {
        const files = (await listFilesRecursive(ROOT)).filter(isCanonicalFile);
        const graph = {};
        for (const file of files) {
            let content = '';
            try {
                content = await fs.readFile(file, 'utf-8');
            }
            catch { }
            const deps = await Promise.all(extractDeps(content).map(async (dep) => {
                // Resolve relative imports to absolute file paths
                if (dep.startsWith('.')) {
                    const abs = path.resolve(path.dirname(file), dep);
                    // Try .ts, .js, /index.ts, /index.js
                    for (const ext of ['.ts', '.js', '/index.ts', '/index.js']) {
                        try {
                            await fs.stat(abs + ext);
                            return path.relative(ROOT, abs + ext);
                        }
                        catch { }
                    }
                    return path.relative(ROOT, abs);
                }
                return dep; // External or unresolved
            }));
            graph[path.relative(ROOT, file)] = deps.filter(dep => dep && typeof dep === 'string');
        }
        // Write JSON
        await writeJsonFile(CACHE_PATH, graph);
        // Write Mermaid
        const edges = Object.entries(graph)
            .flatMap(([from, tos]) => tos.map(to => `${from} --> ${to}`));
        const mermaid = `graph TD\n${edges.join('\n')}`;
        await fs.mkdir(path.dirname(MERMAID_PATH), { recursive: true });
        await fs.writeFile(MERMAID_PATH, mermaid);
        console.log('Code dependency graph written to', CACHE_PATH, 'and', MERMAID_PATH);
        printResult('Code dependency graph generated successfully.', args['json']);
    }
    catch (e) {
        handleError(e, args['json']);
        printError(e, args['json']);
    }
}
main();
