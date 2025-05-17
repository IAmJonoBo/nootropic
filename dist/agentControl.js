// nootropic is for Cursor agents only. This is the control/cleanup utility for all future agents and users.
// NOTE: This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { readJsonSafe, writeJsonSafe } from './utils.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fsp } from 'fs';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname);
const PATCH_DIR = path.join(OUTPUT_DIR, 'patches');
const LOG_DIR = path.join(OUTPUT_DIR, 'logs');
const FILES = [
    'context-snapshot.json',
    'mutationPlan.json',
    'selfHealingPlan.json',
    'agentBacklog.json',
    'memoryLane.json'
];
// --- List all context, mutation, patch, and log files ---
async function listFiles() {
    const files = await Promise.all(FILES.map(async (f) => {
        const filePath = path.join(OUTPUT_DIR, f);
        try {
            const stats = await fsp.stat(filePath);
            return { file: f, size: stats.size, mtime: stats.mtime.toISOString() };
        }
        catch {
            return null;
        }
    }));
    let patches = [];
    try {
        patches = await Promise.all((await fsp.readdir(PATCH_DIR)).map(async (f) => {
            const filePath = path.join(PATCH_DIR, f);
            const stats = await fsp.stat(filePath);
            return { file: `patches/${f}`, size: stats.size, mtime: stats.mtime.toISOString() };
        }));
    }
    catch { }
    let logs = [];
    try {
        logs = await Promise.all((await fsp.readdir(LOG_DIR)).map(async (f) => {
            const filePath = path.join(LOG_DIR, f);
            const stats = await fsp.stat(filePath);
            return { file: `logs/${f}`, size: stats.size, mtime: stats.mtime.toISOString() };
        }));
    }
    catch { }
    return [...files.filter((x) => x !== null), ...patches, ...logs];
}
async function pruneFiles({ maxAgeDays = null, maxCount = null, maxTotalSize = null } = {}) {
    let files = (await listFiles()).filter((f) => f !== null);
    files = files.sort((a, b) => new Date(a.mtime).getTime() - new Date(b.mtime).getTime());
    let toDelete = [];
    if (maxAgeDays !== null) {
        const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
        toDelete = files.filter(f => new Date(f.mtime).getTime() < cutoff);
    }
    if (maxCount !== null && files.length > maxCount) {
        toDelete = toDelete.concat(files.slice(0, files.length - maxCount));
    }
    if (maxTotalSize !== null) {
        let total = files.reduce((sum, f) => sum + f.size, 0);
        for (const f of files) {
            if (total <= maxTotalSize)
                break;
            toDelete.push(f);
            total -= f.size;
        }
    }
    // Remove duplicates
    toDelete = Array.from(new Set(toDelete.filter((f) => f !== null)));
    for (const f of toDelete) {
        if (!f)
            continue;
        const filePath = path.join(OUTPUT_DIR, f.file);
        try {
            await fsp.unlink(filePath);
        }
        catch { }
    }
    return toDelete;
}
async function pruneJsonField(file, field, { maxItems = null, maxAgeDays = null } = {}) {
    const filePath = path.join(OUTPUT_DIR, file);
    try {
        await fsp.access(filePath);
    }
    catch {
        return false;
    }
    const data = await readJsonSafe(filePath, {});
    if (!Array.isArray(data[field]))
        return false;
    let arr = data[field];
    if (maxItems !== null && arr.length > maxItems)
        arr = arr.slice(-maxItems);
    if (maxAgeDays !== null) {
        const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
        arr = arr.filter(item => new Date(item.timestamp || item.mtime || 0).getTime() >= cutoff);
    }
    data[field] = arr;
    await writeJsonSafe(filePath, data);
    return true;
}
async function runAgentControl({ list = false, prune = false, pruneOptions = {} } = {}) {
    if (list) {
        console.log(JSON.stringify(await listFiles(), null, 2));
    }
    if (prune) {
        const deleted = await pruneFiles(pruneOptions);
        console.log(JSON.stringify({ deleted }, null, 2));
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const args = process.argv.slice(2);
        if (args.includes('--list'))
            await runAgentControl({ list: true });
        if (args.includes('--prune'))
            await runAgentControl({ prune: true });
    })();
}
export { listFiles, pruneFiles, pruneJsonField, runAgentControl };
