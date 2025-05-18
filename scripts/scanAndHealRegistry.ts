#!/usr/bin/env tsx
import fs from 'fs';
import os from 'os';
(async () => {
  try {
    fs.writeFileSync(os.homedir() + '/registry-scan-report-sync-test.json', JSON.stringify({ test: true, ts: Date.now() }, null, 2));
    console.log('DEBUG: Sync test file write succeeded.');
  } catch (e) {
    console.error('ERROR: Sync test file write failed:', e);
  }
})();
// NOTE: Requires 'fast-glob' (install with: pnpm add -D fast-glob)
import { promises as fsp } from 'fs';
import path from 'path';
// @ts-ignore: fast-glob may not have type declarations
import glob from 'fast-glob';
import { z } from 'zod';
import { registerAllAgents } from '../src/capabilities/agentRegistry.js';
import { execSync } from 'child_process';
let opossum: any = null;
try { opossum = require('opossum'); } catch {}

// Canonical describe() schema (fallback if not provided)
const DescribeSchema = z.union([
  z.object({
    name: z.string(),
    description: z.string(),
    inputSchema: z.any().optional(),
    outputSchema: z.any().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
    performanceHints: z.record(z.any()).optional(),
  }),
  z.object({
    name: z.string(),
    description: z.string(),
    methods: z.array(z.object({
      name: z.string(),
      signature: z.string(),
      description: z.string().optional(),
    })).optional(),
    usage: z.string().optional(),
    docsFirst: z.boolean().optional(),
    aiFriendlyDocs: z.boolean().optional(),
    references: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
    performanceHints: z.record(z.any()).optional(),
    license: z.string().optional(),
    isOpenSource: z.boolean().optional(),
    provenance: z.string().optional(),
    schema: z.any().optional(),
    promptTemplates: z.array(z.any()).optional(),
    extensionPoints: z.array(z.any()).optional(),
    features: z.array(z.any()).optional(),
  })
]);

// TEMP: Restrict scan to a single agent file for diagnostics
const GLOBS = [
  'src/agents/**/*.ts',
  'src/adapters/**/*.ts',
  'src/capabilities/**/*.ts',
  'src/utils/**/*.ts',
  'scripts/**/*.ts',
  '!**/*.bak.ts',
  '!**/*.test.ts',
  '!scripts/**/*.cjs', // Exclude CommonJS scripts
];

const AUDIT_LOG = path.resolve('.nootropic-cache/registry-audit-log.jsonl');
const REPORT_PATH = path.resolve('.nootropic-cache/registry-scan-report-unique.json');
const TMP_REPORT_PATH = '/tmp/registry-scan-report-unique.json';

async function logAudit(entry: Record<string, unknown>) {
  const line = JSON.stringify({ ...entry, timestamp: new Date().toISOString() });
  await fsp.appendFile(AUDIT_LOG, line + '\n');
}

// ESM-compatible hash function using dynamic import
async function hashDescriptor(desc: any) {
  const crypto = await import('crypto');
  return crypto.createHash('sha256').update(JSON.stringify(desc)).digest('hex');
}

async function getProjectVersion(): Promise<string> {
  // ESM-compatible: read package.json
  const pkgPath = path.resolve('package.json');
  try {
    const pkgRaw = await fsp.readFile(pkgPath, 'utf-8');
    const pkg = JSON.parse(pkgRaw);
    return pkg.version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

async function dynamicImportWithBreaker(file: string) {
  const importFn = async () => import(path.resolve(file));
  if (opossum) {
    const breaker = new opossum(importFn, { timeout: 5000, errorThresholdPercentage: 50, resetTimeout: 10000 });
    return breaker.fire();
  } else {
    return importFn();
  }
}

async function main() {
  let errorOccurred = false;
  await registerAllAgents();
  const files: string[] = await glob(GLOBS, { absolute: true });
  console.log('DEBUG: Files to process:', files);
  const registered: any[] = [];
  const remediated: any[] = [];
  const skipped: any[] = [];
  const errored: any[] = [];
  const seen = new Map<string, string>(); // name -> hash
  const version = await getProjectVersion();

  await fsp.mkdir(path.dirname(AUDIT_LOG), { recursive: true });

  // SERIAL PROCESSING: Avoid ESM evaluation order issues
  for (const file of files) {
    let mod: any;
    let desc: any;
    let injected = false;
    try {
      mod = await dynamicImportWithBreaker(file);
      let describeFn = typeof mod?.describe === 'function' ? mod.describe : (typeof mod?.default?.describe === 'function' ? mod.default.describe : undefined);
      console.log('DEBUG: Processing', file, 'typeof mod.describe:', typeof mod?.describe, 'typeof mod.default?.describe:', typeof mod?.default?.describe);
      desc = describeFn ? await describeFn() : null;
      console.log('DEBUG: Describe output for', file, ':', desc);
      if (!desc) {
        // Auto-inject stub
        desc = {
          name: path.basename(file, path.extname(file)),
          description: 'Stub auto-injected for registry compliance.',
          inputSchema: z.object({}),
          outputSchema: z.object({}),
          tags: ['auto-stub'],
        };
        injected = true;
        remediated.push({ file, action: 'Injected describe()' });
        await logAudit({ file, action: 'Injected describe()' });
      }
      // Validate
      try {
        DescribeSchema.parse(desc);
        console.log('DEBUG: Passed schema validation', desc.name, file);
      } catch (e) {
        errored.push({ file, error: 'Validation failed: ' + e });
        await logAudit({ file, error: 'Validation failed: ' + e });
        continue;
      }
      // Debug: Print name and file before deduplication
      console.log('DEBUG: About to deduplicate', desc.name, file);
      // Deduplication
      const hash = await hashDescriptor(desc);
      if (seen.has(desc.name)) {
        skipped.push({ file, reason: 'Duplicate name+schema', name: desc.name });
        await logAudit({ file, reason: 'Duplicate name+schema', name: desc.name });
        continue;
      }
      seen.set(desc.name, hash);
      // Debug: typeof mod.health before health check
      console.log('DEBUG: typeof mod.health for', file, ':', typeof mod.health);
      // Health check
      let healthy = false;
      let healthFn = typeof mod.health === 'function' ? mod.health : (typeof mod.default?.health === 'function' ? mod.default.health : undefined);
      for (let i = 0; i < 3; ++i) {
        try {
          if (typeof healthFn === 'function') {
            const health = await healthFn();
            if (health && health.status === 'ok') { healthy = true; break; }
          } else if (desc.health && typeof desc.health === 'function') {
            const health = await desc.health();
            if (health && health.status === 'ok') { healthy = true; break; }
          }
        } catch {}
        await new Promise(r => setTimeout(r, 250));
      }
      if (!healthy) {
        errored.push({ file, error: 'Health check failed' });
        await logAudit({ file, error: 'Health check failed' });
        continue;
      }
      // Debug: Passed health check, about to register
      console.log('DEBUG: Passed health check, registering', desc.name, file);
      // Metadata enrichment (add tags, version, performanceHints, etc.)
      desc.tags = desc.tags || [];
      if (!desc.tags.includes('auto-scanned')) desc.tags.push('auto-scanned');
      desc.version = desc.version || version;
      desc.performanceHints = desc.performanceHints || { maxLatencyMs: 1000, throughputQps: 10 };
      // TODO: AsyncAPI enrichment if event-driven
      // Debug: About to push to registered
      console.log('DEBUG: About to register', desc.name, file);
      registered.push({ ...desc, file });
      await logAudit({ file, action: injected ? 'Registered (stub)' : 'Registered', name: desc.name });
    } catch (e) {
      errored.push({ file, error: String(e) });
      await logAudit({ file, error: String(e) });
      errorOccurred = true;
    }
  }

  const report = { registered, remediated, skipped, errored };
  try {
    await fsp.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
    await fsp.writeFile(TMP_REPORT_PATH, JSON.stringify(report, null, 2));
    await fsp.writeFile(path.resolve('.nootropic-cache/registry-scan-report-debug.json'), JSON.stringify(report, null, 2));
    // Read back and log the first 500 chars
    const written = await fsp.readFile(REPORT_PATH, 'utf-8');
    console.log('DEBUG: Read-back of report file:', written.slice(0, 500));
    // List .nootropic-cache and /tmp
    try {
      const cacheLs = execSync('ls -l .nootropic-cache').toString();
      console.log('DEBUG: .nootropic-cache contents after write:\n', cacheLs);
    } catch (e) {
      console.error('ERROR: Could not list .nootropic-cache:', e);
    }
    try {
      const tmpLs = execSync('ls -l /tmp').toString();
      console.log('DEBUG: /tmp contents after write:\n', tmpLs);
    } catch (e) {
      console.error('ERROR: Could not list /tmp:', e);
    }
    console.log('DEBUG: Successfully wrote both report files.');
    // Minimal file write to home directory
    try {
      const homePath = require('os').homedir() + '/registry-scan-report-test.json';
      await fsp.writeFile(homePath, JSON.stringify({ test: true, ts: Date.now() }, null, 2));
      console.log('DEBUG: Wrote test file to home directory:', homePath);
    } catch (e) {
      console.error('ERROR: Failed to write test file to home directory:', e);
    }
  } catch (e) {
    console.error('ERROR: Failed to write report files:', e);
    errorOccurred = true;
  }
  console.log(`Registry scan complete. Registered: ${registered.length}, Remediated: ${remediated.length}, Skipped: ${skipped.length}, Errored: ${errored.length}`);
  console.log(`Report: ${REPORT_PATH}`);
  console.log('DEBUG: Process reached end of script.');
  if (errorOccurred) throw new Error('One or more errors occurred during registry scan.');
}

(async () => {
  try {
    await fsp.writeFile(path.resolve('.nootropic-cache/registry-scan-report-test.json'), JSON.stringify({ test: true, ts: Date.now() }, null, 2));
    console.log('DEBUG: Test file write succeeded.');
  } catch (e) {
    console.error('ERROR: Test file write failed:', e);
  }
})();

main().catch(e => { console.error(e); process.exit(1); });

process.on('exit', (code) => {
  console.log('DEBUG: Process exit event. Code:', code);
});
process.on('uncaughtException', (err) => {
  console.error('DEBUG: Uncaught exception:', err);
}); 