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
import path from 'path';
import { Project, Node } from 'ts-morph';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';
// @ts-ignore
import { readJsonFile, writeJsonFile, handleError } from '../src/utils/automationHelpers.js';

const DEP_GRAPH_PATH = path.resolve('.nootropic-cache/code-dependency-graph.json');
const CONTEXT_GRAPH_PATH = path.resolve('.nootropic-cache/context-graph.json');
const ROOT = path.resolve('.');

const usage = 'Usage: pnpm tsx scripts/generateContextGraph.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

/**
 * Returns the node if it is a call expression, else undefined.
 * The returned node is guaranteed (by runtime check) to have getExpression().
 * This is a dynamic boundary due to ts-morph API limitations: there is no exported CallExpression type.
 */
function getCallExpression(node: Node): Node | undefined {
  return Node.isCallExpression(node) ? node : undefined;
}

async function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    let depGraph = {};
    try { depGraph = await readJsonFile(DEP_GRAPH_PATH); } catch {}

    // --- ts-morph static analysis ---
    const project = new Project({ tsConfigFilePath: path.join(ROOT, 'tsconfig.json') });
    const files = project.getSourceFiles(['**/*.ts', '!**/node_modules/**', '!**/dist/**', '!**/.nootropic-cache/**', '!**/testdata/**', '!**/__tests__/**', '!**/copy/**', '!**/vendor/**', '!**/Flight Control/**', '!**/Rocketship copy/**']);

    const callGraph: Record<string, string[]> = {};
    const symbolTable: Record<string, string[]> = {};

    for (const file of files) {
      const filePath = file.getFilePath();
      callGraph[filePath] = [];
      symbolTable[filePath] = [];
      // Functions
      for (const fn of file.getFunctions()) {
        const fnName = fn.getName();
        if (!symbolTable[filePath]) symbolTable[filePath] = [];
        symbolTable[filePath]!.push(fnName ? fnName : '<anonymous function>');
        fn.forEachDescendant((node: Node) => {
          const callExpr = getCallExpression(node);
          if (callExpr) {
            if (!callGraph[filePath]) callGraph[filePath] = [];
            // Dynamic boundary: ts-morph does not expose a CallExpression type, but runtime check is robust
            callGraph[filePath]!.push((callExpr as any).getExpression().getText());
          }
        });
      }
      // Classes
      for (const cls of file.getClasses()) {
        const clsName = cls.getName();
        if (!symbolTable[filePath]) symbolTable[filePath] = [];
        symbolTable[filePath]!.push(clsName ? clsName : '<anonymous class>');
        for (const method of cls.getMethods()) {
          const methodName = method.getName();
          if (!symbolTable[filePath]) symbolTable[filePath] = [];
          symbolTable[filePath]!.push(methodName ? methodName : '<anonymous method>');
          method.forEachDescendant((node: Node) => {
            const callExpr = getCallExpression(node);
            if (callExpr) {
              if (!callGraph[filePath]) callGraph[filePath] = [];
              // Dynamic boundary: ts-morph does not expose a CallExpression type, but runtime check is robust
              callGraph[filePath]!.push((callExpr as any).getExpression().getText());
            }
          });
        }
      }
      // Variables
      if (!symbolTable[filePath]) symbolTable[filePath] = [];
      for (const v of file.getVariableDeclarations()) {
        symbolTable[filePath]!.push(v.getName());
      }
    }

    // (Stub) Data flow graph
    const dataFlow: Record<string, unknown> = {};

    const contextGraph = { dependency: depGraph, callGraph, symbolTable, dataFlow };
    await writeJsonFile(CONTEXT_GRAPH_PATH, contextGraph);
    console.log('Context graph written to', CONTEXT_GRAPH_PATH);
    printResult('Context graph generated successfully.', args['json']);
  } catch (e) {
    handleError(e, args['json']);
    printError(e, args['json']);
  }
}

main(); 