#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOTS = ['src', 'tests'];
const EXT = '.ts';

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/fix-import-extensions.cjs [--help]\n\nRemoves .ts/.js from local import/export paths in src/ and tests/.\n- Usage: node scripts/fix-import-extensions.cjs\n- LLM/AI usage: "Show usage for fix-import-extensions script."');
  process.exit(0);
}

function walk(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, cb);
    else if (entry.isFile() && full.endsWith(EXT)) cb(full);
  }
}

function fixImports(content) {
  // Remove .ts or .js from local import/export paths (static/dynamic, multi-line, all quote types)
  return content
    .replace(/(import|export)([^'"`]*?)(['"`])((?:[.]{1,2}|\/)[^'"`]+?)\.(ts|js)(\3)/g, '$1$2$3$4$6')
    .replace(/(import\s*\(\s*)(['"`])((?:[.]{1,2}|\/)[^'"`]+?)\.(ts|js)(\2\s*\))/g, '$1$2$3$5');
}

let changed = 0, files = 0;
for (const root of ROOTS) {
  if (!fs.existsSync(root)) continue;
  walk(root, file => {
    files++;
    const orig = fs.readFileSync(file, 'utf8');
    const fixed = fixImports(orig);
    if (orig !== fixed) {
      fs.copyFileSync(file, file + '.bak');
      fs.writeFileSync(file, fixed, 'utf8');
      changed++;
      console.log('Rewrote imports in', file);
    }
  });
}
console.log(`\nChecked ${files} files, rewrote ${changed} files.`); 