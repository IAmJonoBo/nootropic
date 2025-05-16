#!/usr/bin/env tsx
/**
 * simulateImpact.ts
 *
 * Given a file or function name, uses the context graph and semantic embeddings to output all potentially affected modules, tests, and docs.
 * Usage: pnpm tsx scripts/simulateImpact.ts <fileOrFunction>
 */
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';

const CONTEXT_GRAPH_PATH = path.resolve('.nootropic-cache/context-graph.json');

// @ts-expect-error TS(7010): 'findTransitiveDeps', which lacks return-type anno... Remove this comment to see the full error message
function findTransitiveDeps(graph: Record<string, string[]>, start: string, visited = new Set<string>()): Set<string> {
  // @ts-expect-error TS(6133): 'visited' is declared but its value is never read.
  if (visited.has(start)) return visited;
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  visited.add(start);
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  for (const dep of graph[start] ?? []) {
    // @ts-expect-error TS(2304): Cannot find name 'visited'.
    if (!visited.has(dep)) findTransitiveDeps(graph, dep, visited);
  }
  return visited;
}

async function main() {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  const target = process.argv[2];
  if (!target) {
    console.error('Usage: pnpm tsx scripts/simulateImpact.ts <fileOrFunction>');
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(1);
  }
  let contextGraph: Record<string, unknown> = {};
  try { contextGraph = JSON.parse(await fs.promises.readFile(CONTEXT_GRAPH_PATH, 'utf-8')); } catch {}
  // @ts-expect-error TS(2454): Variable 'contextGraph' is used before being assig... Remove this comment to see the full error message
  const depGraph: Record<string, string[]> = contextGraph['dependency'] ?? {};
  // @ts-expect-error TS(2454): Variable 'contextGraph' is used before being assig... Remove this comment to see the full error message
  const callGraph: Record<string, string[]> = contextGraph['callGraph'] ?? {};
  // Find all directly and transitively affected files/functions
  // @ts-expect-error TS(2693): 'string' only refers to a type, but is being used ... Remove this comment to see the full error message
  const affected = new Set<string>();
  // File-level
  // @ts-expect-error TS(2454): Variable 'depGraph' is used before being assigned.
  if (depGraph[target]) {
    // @ts-expect-error TS(2454): Variable 'depGraph' is used before being assigned.
    for (const dep of findTransitiveDeps(depGraph, target)) affected.add(dep);
  }
  // Call graph (function-level)
  // @ts-expect-error TS(2454): Variable 'callGraph' is used before being assigned... Remove this comment to see the full error message
  if (callGraph[target]) {
    // @ts-expect-error TS(2454): Variable 'callGraph' is used before being assigned... Remove this comment to see the full error message
    for (const dep of findTransitiveDeps(callGraph, target)) affected.add(dep);
  }
  // Output
  // @ts-expect-error TS(2339): Property 'size' does not exist on type 'boolean'.
  if (affected.size === 0) {
    console.log(`[Impact] No affected modules found for: ${target}`);
  } else {
    // @ts-expect-error TS(2304): Cannot find name 'Impact'.
    console.log(`[Impact] Affected modules for ${target}:`);
    for (const mod of affected) {
      console.log('  -', mod);
    }
  }
  // TODO: Add semantic similarity search using embeddings
}

main(); 