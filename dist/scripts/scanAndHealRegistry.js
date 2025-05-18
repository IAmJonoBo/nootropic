#!/usr/bin/env tsx
// NOTE: Requires 'fast-glob' (install with: pnpm add -D fast-glob)
import { promises as fsp } from 'fs';
import path from 'path';
// @ts-ignore: fast-glob may not have type declarations
import glob from 'fast-glob';
import { z } from 'zod';
import { registerAllAgents } from '../src/capabilities/agentRegistry.js';
let opossum = null;
try {
    opossum = require('opossum');
}
catch { }
// Canonical describe() schema (fallback if not provided)
const DescribeSchema = z.object({
    name: z.string(),
    description: z.string(),
    inputSchema: z.any().optional(),
    outputSchema: z.any().optional(),
    tags: z.array(z.string()).optional(),
    version: z.string().optional(),
    performanceHints: z.record(z.any()).optional(),
});
// TEMP: Restrict scan to a single agent file for diagnostics
const GLOBS = [
    'src/agents/**/*.ts',
    'utils/**/helper*.ts',
    'scripts/**/*.js',
    '!scripts/**/*.cjs', // Exclude CommonJS scripts
];
const AUDIT_LOG = path.resolve('.nootropic-cache/registry-audit-log.jsonl');
const REPORT_PATH = path.resolve('.nootropic-cache/registry-scan-report.json');
async function logAudit(entry) {
    const line = JSON.stringify({ ...entry, timestamp: new Date().toISOString() });
    await fsp.appendFile(AUDIT_LOG, line + '\n');
}
// ESM-compatible hash function using dynamic import
async function hashDescriptor(desc) {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(JSON.stringify(desc)).digest('hex');
}
async function getProjectVersion() {
    // ESM-compatible: read package.json
    const pkgPath = path.resolve('package.json');
    try {
        const pkgRaw = await fsp.readFile(pkgPath, 'utf-8');
        const pkg = JSON.parse(pkgRaw);
        return pkg.version || '0.0.0';
    }
    catch {
        return '0.0.0';
    }
}
async function dynamicImportWithBreaker(file) {
    const importFn = async () => import(path.resolve(file));
    if (opossum) {
        const breaker = new opossum(importFn, { timeout: 5000, errorThresholdPercentage: 50, resetTimeout: 10000 });
        return breaker.fire();
    }
    else {
        return importFn();
    }
}
async function main() {
    await registerAllAgents();
    const files = await glob(GLOBS, { absolute: true });
    const registered = [];
    const remediated = [];
    const skipped = [];
    const errored = [];
    const seen = new Map(); // name -> hash
    const version = await getProjectVersion();
    await fsp.mkdir(path.dirname(AUDIT_LOG), { recursive: true });
    // SERIAL PROCESSING: Avoid ESM evaluation order issues
    for (const file of files) {
        let mod;
        let desc;
        let injected = false;
        try {
            mod = await dynamicImportWithBreaker(file);
            desc = mod?.describe ? await mod.describe() : null;
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
            }
            catch (e) {
                errored.push({ file, error: 'Validation failed: ' + e });
                await logAudit({ file, error: 'Validation failed: ' + e });
                continue;
            }
            // Deduplication
            const hash = await hashDescriptor(desc);
            if (seen.has(desc.name)) {
                skipped.push({ file, reason: 'Duplicate name+schema', name: desc.name });
                await logAudit({ file, reason: 'Duplicate name+schema', name: desc.name });
                continue;
            }
            seen.set(desc.name, hash);
            // Health check
            let healthy = false;
            for (let i = 0; i < 3; ++i) {
                try {
                    if (typeof mod.health === 'function') {
                        const health = await mod.health();
                        if (health && health.status === 'ok') {
                            healthy = true;
                            break;
                        }
                    }
                    else if (desc.health && typeof desc.health === 'function') {
                        const health = await desc.health();
                        if (health && health.status === 'ok') {
                            healthy = true;
                            break;
                        }
                    }
                }
                catch { }
                await new Promise(r => setTimeout(r, 250));
            }
            if (!healthy) {
                errored.push({ file, error: 'Health check failed' });
                await logAudit({ file, error: 'Health check failed' });
                continue;
            }
            // Metadata enrichment (add tags, version, performanceHints, etc.)
            desc.tags = desc.tags || [];
            if (!desc.tags.includes('auto-scanned'))
                desc.tags.push('auto-scanned');
            desc.version = desc.version || version;
            desc.performanceHints = desc.performanceHints || { maxLatencyMs: 1000, throughputQps: 10 };
            // TODO: AsyncAPI enrichment if event-driven
            registered.push({ ...desc, file });
            await logAudit({ file, action: injected ? 'Registered (stub)' : 'Registered', name: desc.name });
        }
        catch (e) {
            errored.push({ file, error: String(e) });
            await logAudit({ file, error: String(e) });
        }
    }
    const report = { registered, remediated, skipped, errored };
    await fsp.writeFile(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`Registry scan complete. Registered: ${registered.length}, Remediated: ${remediated.length}, Skipped: ${skipped.length}, Errored: ${errored.length}`);
    console.log(`Report: ${REPORT_PATH}`);
}
main().catch(e => { console.error(e); process.exit(1); });
