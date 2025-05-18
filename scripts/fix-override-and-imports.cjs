#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SRC = 'src';
const EXT = '.ts';

if (process.argv.includes('--help')) {
  console.log('Usage: node scripts/fix-override-and-imports.cjs [--help]\n\nFixes override usage and import paths in all .ts files in src/.\n- Removes override from class members if not extending another class.\n- Adds .js to all relative import/export paths.\n- Usage: node scripts/fix-override-and-imports.cjs\n- LLM/AI usage: "Show usage for fix-override-and-imports script."');
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

function fixOverrideAndImports(content) {
  // Remove 'override' from class members if not extending another class
  let fixed = content;
  // Only remove 'override' if the class does not extend another class
  fixed = fixed.replace(/class (\w+)\s*{/g, (m, cls) => {
    // If 'extends' is not in the class declaration, remove 'override' in the class body
    return m.replace('{', '{/*__NO_EXTENDS__' + cls + '*/');
  });
  fixed = fixed.replace(/(\/\*__NO_EXTENDS__([\w]+)\*\/)([\s\S]*?)(class |$)/g, (m, marker, cls, body, nextClass) => {
    // Remove 'override' in this class body
    return marker + body.replace(/\boverride\b/g, '') + nextClass;
  });
  fixed = fixed.replace(/\/\*__NO_EXTENDS__([\w]+)\*\//g, '');
  // Add .js to all relative import/export paths
  fixed = fixed.replace(/(import|export)([^'"`]*?)(['"`])((?:[.]{1,2}|\/)[^'"`]+?)(\3)/g, (m, imp, pre, q, path, post) => {
    if (path.endsWith('.js') || path.endsWith('.ts')) return m.replace(/\.ts/, '.js');
    return `${imp}${pre}${q}${path}.js${post}`;
  });
  fixed = fixed.replace(/(import\s*\(\s*)(['"`])((?:[.]{1,2}|\/)[^'"`]+?)(\2\s*\))/g, (m, imp, q, path, post) => {
    if (path.endsWith('.js') || path.endsWith('.ts')) return m.replace(/\.ts/, '.js');
    return `${imp}${q}${path}.js${post}`;
  });
  return fixed;
}

let changed = 0, files = 0;
walk(SRC, file => {
  files++;
  const orig = fs.readFileSync(file, 'utf8');
  const fixed = fixOverrideAndImports(orig);
  if (orig !== fixed) {
    fs.copyFileSync(file, file + '.bak');
    fs.writeFileSync(file, fixed, 'utf8');
    changed++;
    console.log('Fixed', file);
  }
});
console.log(`\nChecked ${files} files, fixed ${changed} files.`); 