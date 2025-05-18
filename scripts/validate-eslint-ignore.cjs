#!/usr/bin/env node
// Validate that ESLint ignores dist/ and other specified patterns
const { exec } = require('child_process');

const IGNORED_PATTERNS = [
  'dist/',
  '**/dist/**',
  'node_modules/',
  '.nootropic-cache/archive/',
  '**/*.d.ts',
  'web/src/vite-env.d.ts',
];

exec('npx eslint --ext .ts .', (err, stdout, stderr) => {
  const output = stdout + stderr;
  const ignoredRegex = new RegExp(IGNORED_PATTERNS.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'));
  const found = output.split('\n').filter(line => ignoredRegex.test(line));
  if (found.length > 0) {
    console.error('❌ ESLint is linting ignored files!');
    found.forEach(line => console.error(line));
    process.exit(1);
  } else {
    console.log('✅ ESLint ignore config is working: no ignored files linted.');
    process.exit(0);
  }
}); 