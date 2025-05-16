#!/usr/bin/env tsx
/**
 * generateContextGraph.ts
 *
 * Generates a context graph for the project, mapping relationships between modules and capabilities.
 *
 * Usage:
 *   pnpm tsx scripts/generateContextGraph.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Writes context graph to the appropriate location.
 *
 * Troubleshooting:
 *   - Ensure all modules and relationships are up to date.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check for missing or invalid relationships in the graph.
 *
 * Example:
 *   pnpm tsx scripts/generateContextGraph.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for generateContextGraph script."
 *   - "List all scripts that generate context graphs."
 *   - "How do I regenerate the context graph?"
 *   - "What does generateContextGraph do?"
 */
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
import { Project, Node } from 'ts-morph';
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';
// @ts-expect-error TS(2724): '"../utils/automationHelpers.js"' has no exported ... Remove this comment to see the full error message
import { readJsonFile, writeJsonFile, handleError } from '../utils/automationHelpers.js';

const DEP_GRAPH_PATH = path.resolve('.nootropic-cache/code-dependency-graph.json');
const CONTEXT_GRAPH_PATH = path.resolve('.nootropic-cache/context-graph.json');
const ROOT = path.resolve('.');

const usage = 'Usage: pnpm tsx scripts/generateContextGraph.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

async function main() {
  // @ts-expect-error TS(6133): 'args' is declared but its value is never read.
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    let depGraph = {};
    // @ts-expect-error TS(2322): Type 'unknown' is not assignable to type '{}'.
    try { depGraph = await readJsonFile(DEP_GRAPH_PATH); } catch {}

    // --- ts-morph static analysis ---
    const project = new Project({ tsConfigFilePath: path.join(ROOT, 'tsconfig.json') });
    // @ts-expect-error TS(2339): Property 'getSourceFiles' does not exist on type '... Remove this comment to see the full error message
    const files = project.getSourceFiles(['**/*.ts', '!**/node_modules/**', '!**/dist/**', '!**/.nootropic-cache/**', '!**/testdata/**', '!**/__tests__/**', '!**/copy/**', '!**/vendor/**', '!**/Flight Control/**', '!**/Rocketship copy/**']);

    const callGraph: Record<string, string[]> = {};
    const symbolTable: Record<string, string[]> = {};

    for (const file of files) {
      const filePath = file.getFilePath();
      // @ts-expect-error TS(2454): Variable 'callGraph' is used before being assigned... Remove this comment to see the full error message
      callGraph[filePath] = [];
      // @ts-expect-error TS(2454): Variable 'symbolTable' is used before being assign... Remove this comment to see the full error message
      symbolTable[filePath] = [];
      // Functions
      for (const fn of file.getFunctions()) {
        const fnName = fn.getName();
        // @ts-expect-error TS(2454): Variable 'symbolTable' is used before being assign... Remove this comment to see the full error message
        if (!symbolTable[filePath]) symbolTable[filePath] = [];
        // @ts-expect-error TS(2454): Variable 'symbolTable' is used before being assign... Remove this comment to see the full error message
        symbolTable[filePath].push(fnName ? fnName : '<anonymous function>');
        // @ts-expect-error TS(2552): Cannot find name 'node'. Did you mean 'Node'?
        fn.forEachDescendant((node) => {
          // @ts-expect-error TS(6133): 'Node' is declared but its value is never read.
          if (Node.isCallExpression(node)) {
            // @ts-expect-error TS(2552): Cannot find name 'node'. Did you mean 'Node'?
            const expr = node.getExpression();
            // @ts-expect-error TS(2454): Variable 'callGraph' is used before being assigned... Remove this comment to see the full error message
            if (expr && callGraph[filePath]) {
              // @ts-expect-error TS(2454): Variable 'callGraph' is used before being assigned... Remove this comment to see the full error message
              callGraph[filePath].push(expr.getText());
            }
          }
        });
      }
      // Classes
      // @ts-expect-error TS(2552): Cannot find name 'file'. Did you mean 'files'?
      for (const cls of file.getClasses()) {
        const clsName = cls.getName();
        // @ts-expect-error TS(2454): Variable 'symbolTable' is used before being assign... Remove this comment to see the full error message
        if (!symbolTable[filePath]) symbolTable[filePath] = [];
        // @ts-expect-error TS(2454): Variable 'symbolTable' is used before being assign... Remove this comment to see the full error message
        symbolTable[filePath].push(clsName ? clsName : '<anonymous class>');
        for (const method of cls.getMethods()) {
          const methodName = method.getName();
          // @ts-expect-error TS(2454): Variable 'symbolTable' is used before being assign... Remove this comment to see the full error message
          if (!symbolTable[filePath]) symbolTable[filePath] = [];
          // @ts-expect-error TS(2454): Variable 'symbolTable' is used before being assign... Remove this comment to see the full error message
          symbolTable[filePath].push(methodName ? methodName : '<anonymous method>');
          // @ts-expect-error TS(2552): Cannot find name 'node'. Did you mean 'Node'?
          method.forEachDescendant((node) => {
            // @ts-expect-error TS(6133): 'Node' is declared but its value is never read.
            if (Node.isCallExpression(node)) {
              // @ts-expect-error TS(2552): Cannot find name 'node'. Did you mean 'Node'?
              const expr = node.getExpression();
              // @ts-expect-error TS(2454): Variable 'callGraph' is used before being assigned... Remove this comment to see the full error message
              if (expr && callGraph[filePath]) {
                // @ts-expect-error TS(2454): Variable 'callGraph' is used before being assigned... Remove this comment to see the full error message
                callGraph[filePath].push(expr.getText());
              }
            }
          });
        }
      }
      // Variables
      // @ts-expect-error TS(2304): Cannot find name 'file'.
      for (const v of file.getVariableDeclarations()) {
        // @ts-expect-error TS(2304): Cannot find name 'symbolTable'.
        symbolTable[filePath].push(v.getName());
      }
    }

    // (Stub) Data flow graph
    const dataFlow: Record<string, unknown> = {};

    // @ts-expect-error TS(2304): Cannot find name 'depGraph'.
    const contextGraph = { dependency: depGraph, callGraph, symbolTable, dataFlow };
    await writeJsonFile(CONTEXT_GRAPH_PATH, contextGraph);
    console.log('Context graph written to', CONTEXT_GRAPH_PATH);
    // @ts-expect-error TS(2304): Cannot find name 'args'.
    printResult('Context graph generated successfully.', args['json']);
  } catch (e) {
    // @ts-expect-error TS(2304): Cannot find name 'args'.
    handleError(e, args['json']);
    // @ts-expect-error TS(2304): Cannot find name 'args'.
    printError(e, args['json']);
  }
}

main(); 