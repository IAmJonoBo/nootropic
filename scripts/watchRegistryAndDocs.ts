#!/usr/bin/env tsx
/**
 * File watcher for AI-Helpers: automatically runs registry and doc sync scripts on file changes.
 * Watches all source, plugin, and doc files for changes and triggers:
 *   - pnpm run validate-describe-registry
 *   - pnpm run docs:check-sync
 *   - pnpm tsx scripts/generateDocsFromDescribe.ts
 *   - pnpm tsx scripts/generateDocManifest.ts
 *
 * Usage: pnpm run watch:registry
 *
 * LLM/AI usage: This script ensures the describe registry and docs are always up to date during development.
 */
// @ts-expect-error: If types are missing, recommend: pnpm add -D @types/chokidar
import chokidar from 'chokidar';
import { exec } from 'child_process';
// import path from 'path'; // Unused

const WATCH_PATHS = [
  'agents/**/*.{ts,js,json}',
  'adapters/**/*.{ts,js,json}',
  'plugins/**/*.{ts,js,json}',
  'utils/**/*.{ts,js,json}',
  'capabilities/**/*.{ts,js,json}',
  'docs/**/*.md',
  'docs/**/*.json',
  'README.md',
  'CONTRIBUTING.md',
  'contextMutationEngine.ts',
  'contextSnapshotHelper.ts',
  'docDiagramGenerator.ts',
  'semanticIndexBuilder.ts',
  'semanticSearchHelper.ts',
  'package.json',
  'tsconfig.json',
];

const SCRIPTS = [
  'pnpm run validate-describe-registry',
  'pnpm run docs:check-sync',
  'pnpm tsx scripts/generateDocsFromDescribe.ts',
  'pnpm tsx scripts/generateDocManifest.ts',
];

let running = false;
let pending = false;

function runScripts() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  console.log('[watch:registry] Change detected. Running registry/doc sync scripts...');
  const runNext = (i: number) => {
    if (i >= SCRIPTS.length) {
      running = false;
      if (pending) {
        pending = false;
        setTimeout(() => runScripts(), 100); // Debounce
      }
      return;
    }
    const cmd = SCRIPTS[i];
    console.log(`[watch:registry] Running: ${cmd}`);
    const proc = exec(cmd, { cwd: process.cwd() });
    proc.stdout?.pipe(process.stdout);
    proc.stderr?.pipe(process.stderr);
    proc.on('exit', (code) => {
      if (code !== 0) {
        console.error(`[watch:registry] Script failed: ${cmd} (exit code ${code})`);
      }
      runNext(i + 1);
    });
  };
  runNext(0);
}

console.log('[watch:registry] Watching for changes...');
const watcher = chokidar.watch(WATCH_PATHS, {
  ignoreInitial: true,
  persistent: true,
});

watcher.on('all', (event: string, filePath: string) => {
  console.log(`[watch:registry] ${event}: ${filePath}`);
  runScripts();
});

process.on('SIGINT', () => {
  console.log('\n[watch:registry] Shutting down.');
  watcher.close();
  process.exit(0);
}); 