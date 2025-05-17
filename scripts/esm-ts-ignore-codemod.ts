#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();

function isProjectLocalImport(importPath: string) {
  return importPath.startsWith('.') && importPath.endsWith('.js');
}

function processFile(filePath: string) {
  const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (typeof line !== 'string') continue;
    const importMatch = line.match(/import\s+.*from ['"](\.[^'"]*\.js)['"]/);
    if (importMatch && importMatch[1] && isProjectLocalImport(importMatch[1])) {
      // Check if previous line is already a ts-ignore
      const prevLine = i > 0 ? lines[i - 1] : undefined;
      if (i === 0 || typeof prevLine !== 'string' || !(prevLine && prevLine.includes('// @ts-ignore'))) {
        lines.splice(i, 0, '// @ts-ignore');
        i++;
        changed = true;
      }
    }
  }
  if (changed) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
    console.log('Updated:', filePath);
  }
}

function walk(dir: string) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.git', '.nootropic-cache', 'testdata', '__tests__'].includes(entry.name)) {
        walk(path.join(dir, entry.name));
      }
    } else if (entry.name.endsWith('.ts')) {
      processFile(path.join(dir, entry.name));
    }
  }
}

walk(ROOT);
console.log('Codemod complete.'); 