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
import fs from 'fs';
import path from 'path';
import { Project } from 'ts-morph';
// @ts-ignore
import { embedTexts } from '../utils/embedding/embeddingClient.js';

const EMBEDDINGS_PATH = path.resolve('.nootropic-cache/semantic-embeddings.json');
const ROOT = path.resolve('.');

async function main() {
  const project = new Project({ tsConfigFilePath: path.join(ROOT, 'tsconfig.json') });
  const files = project.getSourceFiles(['**/*.ts', '!**/node_modules/**', '!**/dist/**', '!**/.nootropic-cache/**', '!**/testdata/**', '!**/__tests__/**', '!**/copy/**', '!**/vendor/**', '!**/Flight Control/**', '!**/Rocketship copy/**']);
  const embeddings: Record<string, Record<string, { text: string; embedding?: number[] }>> = {};
  for (const file of files) {
    const filePath = file.getFilePath();
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
      if (!embeddings[filePath]) embeddings[filePath] = {};
      const fileEmbeddings = embeddings[filePath]!;
      let entry: { text: string; embedding?: number[] };
      if (!(name in fileEmbeddings)) {
        entry = { text };
        fileEmbeddings[name] = entry;
      } else {
        entry = fileEmbeddings[name] as { text: string; embedding?: number[] };
        entry.text = text;
      }
      if (vectors[i] !== undefined) {
        entry.embedding = vectors[i] as number[];
      }
    }
  }
  await fs.promises.writeFile(EMBEDDINGS_PATH, JSON.stringify(embeddings, null, 2));
  console.log('Semantic embeddings (text only) written to', EMBEDDINGS_PATH);
}

main(); 