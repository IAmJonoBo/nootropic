#!/usr/bin/env tsx
/**
 * simulateImpact.ts
 *
 * Given a file or function name, uses the context graph and semantic embeddings to output all potentially affected modules, tests, and docs.
 * Usage: pnpm tsx scripts/simulateImpact.ts <fileOrFunction>
 */
import fs from 'fs';
import path from 'path';
const CONTEXT_GRAPH_PATH = path.resolve('.nootropic-cache/context-graph.json');
function findTransitiveDeps(graph, start, visited = new Set()) {
    if (visited.has(start))
        return visited;
    visited.add(start);
    for (const dep of graph[start] ?? []) {
        if (!visited.has(dep))
            findTransitiveDeps(graph, dep, visited);
    }
    return visited;
}
async function main() {
    const target = process.argv[2];
    if (!target) {
        console.error('Usage: pnpm tsx scripts/simulateImpact.ts <fileOrFunction>');
        process.exit(1);
    }
    let contextGraph = {};
    try {
        contextGraph = JSON.parse(await fs.promises.readFile(CONTEXT_GRAPH_PATH, 'utf-8'));
    }
    catch { }
    const depGraph = contextGraph['dependency'] ?? {};
    const callGraph = contextGraph['callGraph'] ?? {};
    // Find all directly and transitively affected files/functions
    const affected = new Set();
    // File-level
    if (depGraph[target]) {
        for (const dep of findTransitiveDeps(depGraph, target))
            affected.add(dep);
    }
    // Call graph (function-level)
    if (callGraph[target]) {
        for (const dep of findTransitiveDeps(callGraph, target))
            affected.add(dep);
    }
    // Output
    if (affected.size === 0) {
        console.log(`[Impact] No affected modules found for: ${target}`);
    }
    else {
        console.log(`[Impact] Affected modules for ${target}:`);
        for (const mod of affected) {
            console.log('  -', mod);
        }
    }
    // TODO: Add semantic similarity search using embeddings
}
main();
