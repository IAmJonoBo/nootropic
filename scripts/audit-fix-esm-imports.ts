#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';

const ROOTS = ['src', 'tests', 'scripts', '.'];
const EXT = '.ts';
const IGNORE_DIRS = new Set(['node_modules', 'dist', '.git', '.nootropic-cache', 'testdata', '__tests__']);
const IGNORE_FILES = [/\.d\.ts$/, /\.test\.ts$/];

const ADD_TS_IGNORE = process.argv.includes('--ts-ignore');

// Helper to detect JSON mode
const isJsonMode = () => process.argv.includes('--json') || process.env.NOOTROPIC_JSON === '1';

function walk(dir: string, cb: (file: string) => void) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else if (entry.isFile() && full.endsWith(EXT) && !IGNORE_FILES.some(r => r.test(full))) cb(full);
  }
}

function fixImports(content: string, addTsIgnore = false): string {
  let lines = content.split('\n');
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] ?? '';
    // Fix import type: remove .js/.ts extension
    line = line.replace(/import type ([^'"`]+) from (["'])(\.[^"']+?)\.(js|ts)\2/g, 'import type $1 from $2$3$2');
    // Fix runtime import/export: add .js if missing, convert .ts to .js
    line = line.replace(/(import|export)([^'"`]*?)(['"])((?:[.]{1,2}|\/)[^'"`]+?)(\.ts)?(['"])/g, (m, imp, pre, q, pth, _ts, post) => {
      if (imp.includes('type')) return m; // skip import type
      if (!pth.endsWith('.js')) return `${imp}${pre}${q}${pth}.js${post}`;
      return m;
    });
    line = line.replace(/(import|export)([^'"`]*?)(['"])((?:[.]{1,2}|\/)[^'"`]+?)\.ts(['"])/g, '$1$2$3$4.js$5');
    // Fix dynamic import: add .js if missing, convert .ts to .js
    line = line.replace(/import\((['"])((?:[.]{1,2}|\/)[^'"`]+?)(\.ts)?(['"])\)/g, (m, q, pth, _ts, post) => {
      if (!pth.endsWith('.js')) return `import(${q}${pth}.js${post})`;
      return m;
    });
    line = line.replace(/import\((['"])((?:[.]{1,2}|\/)[^'"`]+?)\.ts(['"])\)/g, 'import($1$2.js$3)');
    // Optionally add // @ts-ignore above runtime imports with .js
    if (addTsIgnore && /import .*from ['"].*\.js['"]/.test(line) && (i === 0 || !(lines[i-1]?.includes('@ts-ignore')))) {
      lines.splice(i, 0, '// @ts-ignore');
      i++;
      changed = true;
    }
    if (lines[i] !== line) {
      lines[i] = line;
      changed = true;
    }
  }
  return changed ? lines.join('\n') : content;
}

let changed = 0, files = 0;
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  walk(root, file => {
    files++;
    const orig = fs.readFileSync(file, 'utf8');
    const fixed = fixImports(orig, ADD_TS_IGNORE);
    if (orig !== fixed) {
      fs.copyFileSync(file, file + '.bak');
      fs.writeFileSync(file, fixed, 'utf8');
      changed++;
      console.log('Rewrote imports in', file);
    }
  });
}
console.log(`\nChecked ${files} files, rewrote ${changed} files.`);
console.log('Done.');

if (isJsonMode()) {
  // Print a machine-readable summary of changes
  process.stdout.write(JSON.stringify({ success: true, summary: { files, changed } }, null, 2) + '\n');
  process.exit(0);
} 