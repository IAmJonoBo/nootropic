#!/usr/bin/env tsx
/**
 * generateSemanticEmbeddings.ts
 *
 * Extracts code/function/class text for each symbol using ts-morph.
 * (Stub) Structure for future integration with an embedding model.
 * Outputs: .nootropic-cache/semantic-embeddings.json
 *
 * Usage: pnpm tsx scripts/generateSemanticEmbeddings.ts
 */
// @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
import { Project } from 'ts-morph';
import { embedTexts } from '../utils/embedding/embeddingClient.js';

// @ts-expect-error TS(6133): 'EMBEDDINGS_PATH' is declared but its value is nev... Remove this comment to see the full error message
const EMBEDDINGS_PATH = path.resolve('.nootropic-cache/semantic-embeddings.json');
const ROOT = path.resolve('.');

async function main() {
  const project = new Project({ tsConfigFilePath: path.join(ROOT, 'tsconfig.json') });
  // @ts-expect-error TS(6133): 'files' is declared but its value is never read.
  const files = project.getSourceFiles(['**/*.ts', '!**/node_modules/**', '!**/dist/**', '!**/.nootropic-cache/**', '!**/testdata/**', '!**/__tests__/**', '!**/copy/**', '!**/vendor/**', '!**/Flight Control/**', '!**/Rocketship copy/**']);
  const embeddings: Record<string, Record<string, { text: string; embedding?: number[] }>> = {};
  // @ts-expect-error TS(2552): Cannot find name 'files'. Did you mean 'file'?
  for (const file of files) {
    const filePath = file.getFilePath();
    // @ts-expect-error TS(2304): Cannot find name 'embeddings'.
    embeddings[filePath] = {};
    const symbolTexts: { name: string; text: string }[] = [];
    // Functions
    for (const fn of file.getFunctions()) {
      const fnName = fn.getName() ?? '<anonymous function>';
      symbolTexts.push({ name: fnName, text: fn.getText() });
    }
    // Classes
    for (const cls of file.getClasses()) {
      const clsName = cls.getName() ?? '<anonymous class>';
      symbolTexts.push({ name: clsName, text: cls.getText() });
      for (const method of cls.getMethods()) {
        const methodName = method.getName() ?? '<anonymous method>';
        // @ts-expect-error TS(2339): Property '$' does not exist on type '{ name: strin... Remove this comment to see the full error message
        symbolTexts.push({ name: `${clsName}.${methodName}`, text: method.getText() });
      }
    }
    // Variables
    for (const v of file.getVariableDeclarations()) {
      const varName = v.getName();
      symbolTexts.push({ name: varName, text: v.getText() });
    }
    // Try to get embeddings
    let vectors: number[][] = [];
    try {
      vectors = await embedTexts(symbolTexts.map(s => s.text));
    } catch {
      console.warn('Embedding service unavailable, falling back to text-only.');
    }
    for (let i = 0; i < symbolTexts.length; ++i) {
      const symbol = symbolTexts[i];
      if (!symbol) continue;
      const { name, text } = symbol;
      embeddings[filePath][name] = { text };
      if (vectors[i] !== undefined) embeddings[filePath][name].embedding = vectors[i] as number[];
    }
  }
  await fs.promises.writeFile(EMBEDDINGS_PATH, JSON.stringify(embeddings, null, 2));
  console.log('Semantic embeddings (text only) written to', EMBEDDINGS_PATH);
}

main(); 