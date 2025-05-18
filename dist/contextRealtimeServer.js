// nootropic is for Cursor agents only. This is the real-time context/mutation server for all future agents.
// NOTE: This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { WebSocketServer } from 'ws';
// @ts-ignore
import { createSnapshot } from './contextSnapshotHelper.js';
// @ts-ignore
import { runMutationEngine } from './contextMutationEngine.js';
// @ts-ignore
import { getAgentMessages, addAgentMessage } from './contextSnapshotHelper.js';
// @ts-ignore
import { semanticSearch } from './semanticSearchHelper.js';
// @ts-ignore
// import { registerIntent, getIntents, submitFeedback, getFeedback } from './agentIntentRegistry.js';
// @ts-ignore
import { getSecretScanReport } from './secretScanHelper.js';
// @ts-ignore
import { getMemoryLane } from './memoryLaneHelper.js';
// @ts-ignore
import { registerPlugin, listPlugins } from './pluginRegistry.js';
// @ts-ignore
// import { readJsonSafe, writeJsonSafe, getOrInitJson } from './utils.js';
// @ts-ignore
import { ContextManager } from './utils/context/contextManager.js';
import { createReadStream, existsSync } from 'fs';
// @ts-ignore
import { listCapabilities, describeCapability } from './index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONTEXT_PATH = path.join(__dirname, 'context-snapshot.json');
const MUTATION_PLAN_PATH = path.join(__dirname, 'mutation-plan.json');
const PATCH_DIR = path.join(__dirname, 'patches');
const AGENT_DIR = path.resolve(__dirname, '../extension/src/agents');
const SCHEMA_DIR = path.resolve(__dirname, '../shared/schemas');
const TEST_DIR = path.resolve(__dirname, '../extension/src/agents/__tests__');
const contextManager = new ContextManager();
// --- File watcher: triggers context/mutation updates on change ---
function watchAndRefresh() {
    const dirs = [AGENT_DIR, SCHEMA_DIR, TEST_DIR];
    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
            fs.watch(dir, { recursive: true }, (_event, filename) => {
                if (filename && (filename.endsWith('.ts') ?? filename.endsWith('.json'))) {
                    createSnapshot();
                    runMutationEngine();
                }
            });
        }
    }
}
// --- HTTP API ---
function startHttpServer(port = 4000) {
    const server = http.createServer(async (req, res) => {
        // --- Serve React Web UI (web/dist) ---
        const webDist = path.resolve(__dirname, 'web/dist');
        if (req.method === 'GET' && (req.url === '/' || req.url?.startsWith('/assets') || req.url?.endsWith('.js') || req.url?.endsWith('.css') || req.url?.endsWith('.ico') || req.url?.endsWith('.svg'))) {
            let filePath = req.url === '/' ? path.join(webDist, 'index.html') : path.join(webDist, req.url.replace(/^\//, ''));
            if (existsSync(filePath)) {
                const ext = path.extname(filePath);
                const contentType = ext === '.js' ? 'application/javascript' : ext === '.css' ? 'text/css' : ext === '.svg' ? 'image/svg+xml' : ext === '.ico' ? 'image/x-icon' : 'text/html';
                res.writeHead(200, { 'Content-Type': contentType });
                createReadStream(filePath).pipe(res);
                return;
            }
        }
        if (!req.url) {
            res.writeHead(400);
            res.end('Bad request');
            return;
        }
        if (req.method === 'GET' && req.url === '/context') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(fs.readFileSync(CONTEXT_PATH, 'utf-8'));
        }
        else if (req.method === 'GET' && req.url === '/mutation-plan') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(fs.readFileSync(MUTATION_PLAN_PATH, 'utf-8'));
        }
        else if (req.method === 'GET' && req.url.startsWith('/patches')) {
            const patchFile = req.url.replace('/patches/', '');
            const patchPath = path.join(PATCH_DIR, patchFile);
            if (fs.existsSync(patchPath)) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(fs.readFileSync(patchPath, 'utf-8'));
            }
            else {
                res.writeHead(404);
                res.end('Not found');
            }
        }
        else if (req.method === 'POST' && req.url === '/agent-message') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const { agent, type, message } = JSON.parse(body);
                    addAgentMessage(agent, type, message);
                    res.writeHead(200);
                    res.end('OK');
                }
                catch {
                    res.writeHead(400);
                    res.end('Bad request');
                }
            });
        }
        else if (req.method === 'POST' && req.url === '/refresh') {
            createSnapshot();
            runMutationEngine();
            res.writeHead(200);
            res.end('Refreshed');
        }
        else if (req.method === 'POST' && req.url === '/semantic-search') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const { query, topN, source, capability } = JSON.parse(body);
                    const opts = {};
                    if (typeof source === 'string')
                        opts.source = source;
                    if (typeof capability === 'string')
                        opts.capability = capability;
                    const results = await semanticSearch(query, topN ?? 5, opts);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(results));
                }
                catch {
                    res.writeHead(400);
                    res.end('Bad request');
                }
            });
        }
        else if (req.method === 'GET' && req.url === '/secret-scan') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(getSecretScanReport()));
        }
        else if (req.method === 'GET' && req.url === '/memory-lane') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(getMemoryLane()));
        }
        else if (req.method === 'POST' && req.url === '/plugin-register') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const { name, type, entry, meta } = JSON.parse(body);
                    registerPlugin(name, type, entry, meta);
                    res.writeHead(200);
                    res.end('OK');
                }
                catch {
                    res.writeHead(400);
                    res.end('Bad request');
                }
            });
        }
        else if (req.method === 'GET' && req.url === '/plugins') {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(listPlugins()));
        }
        else if (req.method === 'GET' && req.url === '/cache') {
            try {
                const files = await contextManager.listCacheFiles();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, files }));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: String(e) }));
            }
        }
        else if (req.method === 'POST' && req.url === '/cache/prune') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    const opts = {};
                    if (typeof parsed.maxAgeDays === 'number')
                        opts.maxAgeDays = parsed.maxAgeDays;
                    if (typeof parsed.maxSizeMB === 'number')
                        opts.maxSizeBytes = parsed.maxSizeMB * 1024 * 1024;
                    await contextManager.pruneContext(opts);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, action: 'prune' }));
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: String(e) }));
                }
            });
        }
        else if (req.method === 'POST' && req.url === '/cache/compress') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    const dryRun = parsed.dryRun;
                    const manifest = await contextManager.listCacheFiles();
                    const toCompress = manifest.filter((entry) => {
                        if (typeof entry !== 'object' || entry === null)
                            return false;
                        const e = entry;
                        return !('compressed' in e && e['compressed']) && !('archive' in e && e['archive']) && ('type' in e && e['type'] !== 'other');
                    });
                    const zlib = await import('zlib');
                    const fsSync = await import('fs');
                    const results = [];
                    for (const entry of toCompress) {
                        if (typeof entry !== 'object' || entry === null)
                            continue;
                        const e = entry;
                        const fileName = typeof e['fileName'] === 'string' ? e['fileName'] : '';
                        const srcPath = path.join(__dirname, '.nootropic-cache', fileName);
                        const destPath = path.join(__dirname, '.nootropic-cache', 'archive', fileName + '.gz');
                        if (dryRun) {
                            results.push({ file: fileName, action: 'would-compress' });
                            continue;
                        }
                        await new Promise((resolve, reject) => {
                            const input = fsSync.createReadStream(srcPath);
                            const output = fsSync.createWriteStream(destPath);
                            const gzip = zlib.createGzip();
                            input.pipe(gzip).pipe(output);
                            output.on('finish', () => resolve());
                            output.on('error', reject);
                            input.on('error', reject);
                        });
                        results.push({ file: fileName, action: 'compressed' });
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, results }));
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: String(e) }));
                }
            });
        }
        else if (req.method === 'POST' && req.url === '/cache/restore') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    const fileName = parsed.fileName;
                    const dryRun = parsed.dryRun;
                    if (!fileName)
                        throw new Error('fileName is required');
                    const manifest = await contextManager.listCacheFiles();
                    const entry = manifest.find((f) => typeof f === 'object' && f !== null && 'fileName' in f && f['fileName'] === fileName);
                    if (!entry || !entry['archive'])
                        throw new Error('File not found in archive');
                    const srcPath = path.join(__dirname, '.nootropic-cache', 'archive', fileName);
                    const destPath = path.join(__dirname, '.nootropic-cache', fileName.replace(/\.gz$/, ''));
                    if (dryRun) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, action: 'would-restore', file: fileName }));
                        return;
                    }
                    const zlib = await import('zlib');
                    const fsSync = await import('fs');
                    await new Promise((resolve, reject) => {
                        const input = fsSync.createReadStream(srcPath);
                        const output = fsSync.createWriteStream(destPath);
                        const gunzip = zlib.createGunzip();
                        input.pipe(gunzip).pipe(output);
                        output.on('finish', () => resolve());
                        output.on('error', reject);
                        input.on('error', reject);
                    });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, action: 'restored', file: fileName }));
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: String(e) }));
                }
            });
        }
        else if (req.method === 'GET' && req.url === '/cache/report') {
            try {
                const report = await contextManager.getCacheHealthReport();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, report }));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: String(e) }));
            }
        }
        else if (req.method === 'POST' && req.url === '/context/prune') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    await contextManager.pruneContext(parsed);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, action: 'prune' }));
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: String(e) }));
                }
            });
        }
        else if (req.method === 'POST' && req.url === '/context/archive') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    const tier = parsed.tier;
                    await contextManager.archiveContext(tier);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, action: 'archive' }));
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: String(e) }));
                }
            });
        }
        else if (req.method === 'GET' && req.url === '/context/snapshots') {
            try {
                const snapshots = await contextManager.listSnapshots();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, snapshots }));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: String(e) }));
            }
        }
        else if (req.method === 'POST' && req.url === '/context/restore') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    const name = parsed.name;
                    await contextManager.restoreSnapshot(name);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, action: 'restore' }));
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: String(e) }));
                }
            });
        }
        else if (req.method === 'POST' && req.url === '/cache/enforce-tiering') {
            try {
                await contextManager.enforceTiering();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, action: 'enforceTiering' }));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: String(e) }));
            }
        }
        else if (req.method === 'POST' && req.url === '/cache/migrate-tier') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    const fileName = parsed.fileName;
                    const targetTier = parsed.targetTier;
                    await contextManager.migrateFileTier(fileName, targetTier);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, action: 'migrateFileTier', fileName, targetTier }));
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: String(e) }));
                }
            });
        }
        else if (req.method === 'GET' && req.url === '/context/delta') {
            try {
                const { getContextChunk } = await import('./contextSnapshotHelper.js');
                const delta = await getContextChunk(4096);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, delta }));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: String(e) }));
            }
        }
        else if (req.method === 'GET' && req.url === '/context/semantic-index') {
            try {
                const { buildSemanticIndex } = await import('./contextSnapshotHelper.js');
                const index = await buildSemanticIndex();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, index }));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: String(e) }));
            }
        }
        else if (req.method === 'GET' && req.url === '/context/telemetry') {
            try {
                const { extractTelemetryEventsFromTests } = await import('./contextSnapshotHelper.js');
                const telemetry = await extractTelemetryEventsFromTests();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, telemetry }));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: String(e) }));
            }
        }
        else if (req.method === 'POST' && req.url === '/context/optimized-handover') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', async () => {
                try {
                    const parsed = body ? JSON.parse(body) : {};
                    const contextArr = parsed.contextArr;
                    const agentConfig = parsed.agentConfig;
                    const modelTokenLimit = parsed.modelTokenLimit;
                    const { getOptimizedHandoverPayload } = await import('./contextSnapshotHelper.js');
                    const result = getOptimizedHandoverPayload(contextArr, agentConfig, modelTokenLimit);
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, ...result }));
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: String(e) }));
                }
            });
        }
        else if (req.method === 'GET' && req.url === '/prompts') {
            try {
                const caps = await listCapabilities();
                const prompts = [];
                for (const cap of caps) {
                    // @ts-expect-error TS4111: Index signature access for dynamic registry-driven data; safe for LLM/AI and automation
                    if (cap && typeof cap === 'object' && 'name' in cap && Array.isArray(cap.promptTemplates)) {
                        // @ts-expect-error TS4111: Index signature access for dynamic registry-driven data; safe for LLM/AI and automation
                        for (const tmpl of cap.promptTemplates) {
                            prompts.push({ capability: cap.name, ...tmpl });
                        }
                    }
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(prompts));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: String(e) }));
            }
            return;
        }
        else if (req.method === 'GET' && req.url === '/schemas') {
            try {
                const caps = await listCapabilities();
                const schemas = [];
                for (const cap of caps) {
                    if (cap && typeof cap === 'object' && 'name' in cap && 'schema' in cap) {
                        schemas.push({ capability: cap.name, schema: cap.schema });
                    }
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(schemas));
            }
            catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: String(e) }));
            }
            return;
        }
        else if (req.method === 'GET' && req.url === '/capabilities') {
            // Per-capability prompts/schema
            const matchPrompts = req.url?.match(/^\/capabilities\/([^/]+)\/prompts$/);
            if (req.method === 'GET' && matchPrompts && matchPrompts[1]) {
                const name = decodeURIComponent(matchPrompts[1]);
                try {
                    const desc = await describeCapability(name);
                    if (desc && typeof desc === 'object' && 'promptTemplates' in desc) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(desc.promptTemplates ?? []));
                    }
                    else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'No promptTemplates found for capability ' + name }));
                    }
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: String(e) }));
                }
                return;
            }
            const matchSchema = req.url?.match(/^\/capabilities\/([^/]+)\/schema$/);
            if (req.method === 'GET' && matchSchema && matchSchema[1]) {
                const name = decodeURIComponent(matchSchema[1]);
                try {
                    const desc = await describeCapability(name);
                    if (desc && typeof desc === 'object' && 'schema' in desc) {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(desc.schema ?? {}));
                    }
                    else {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: 'No schema found for capability ' + name }));
                    }
                }
                catch (e) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: String(e) }));
                }
                return;
            }
        }
        else {
            res.writeHead(404);
            res.end('Not found');
        }
    });
    server.listen(port, () => {
        console.log(`AI context HTTP server running on http://localhost:${port}`);
    });
}
// --- WebSocket API ---
function startWebSocketServer(port = 4001) {
    const wss = new WebSocketServer({ port });
    wss.on('connection', (ws) => {
        ws.on('message', (msg) => {
            try {
                const { type, data } = JSON.parse(msg.toString());
                if (type === 'getContext') {
                    ws.send(JSON.stringify({ type: 'context', data: fs.readFileSync(CONTEXT_PATH, 'utf-8') }));
                }
                else if (type === 'getMutationPlan') {
                    ws.send(JSON.stringify({ type: 'mutationPlan', data: fs.readFileSync(MUTATION_PLAN_PATH, 'utf-8') }));
                }
                else if (type === 'getAgentMessages') {
                    ws.send(JSON.stringify({ type: 'agentMessages', data: getAgentMessages() }));
                }
                else if (type === 'addAgentMessage') {
                    addAgentMessage(data.agent, data.type, data.message);
                    ws.send(JSON.stringify({ type: 'ok' }));
                }
                else if (type === 'refresh') {
                    createSnapshot();
                    runMutationEngine();
                    ws.send(JSON.stringify({ type: 'refreshed' }));
                }
                else if (type === 'semanticSearch') {
                    const { query, topN, source, capability } = data;
                    const opts = {};
                    if (typeof source === 'string')
                        opts.source = source;
                    if (typeof capability === 'string')
                        opts.capability = capability;
                    semanticSearch(query, topN ?? 5, opts).then(results => {
                        ws.send(JSON.stringify({ type: 'semanticSearchResults', data: results }));
                    });
                }
                else if (type === 'getSecretScanReport') {
                    ws.send(JSON.stringify({ type: 'secretScanReport', data: getSecretScanReport() }));
                }
                else if (type === 'getMemoryLane') {
                    ws.send(JSON.stringify({ type: 'memoryLane', data: getMemoryLane() }));
                }
                else if (type === 'registerPlugin') {
                    const { name, type: t, entry, meta } = data;
                    registerPlugin(name, t, entry, meta);
                    ws.send(JSON.stringify({ type: 'ok' }));
                }
                else if (type === 'getPlugins') {
                    ws.send(JSON.stringify({ type: 'plugins', data: listPlugins() }));
                }
            }
            catch {
                ws.send(JSON.stringify({ type: 'error', message: 'Bad request' }));
            }
        });
    });
    console.log(`AI context WebSocket server running on ws://localhost:${port}`);
}
// --- Entrypoint ---
function startRealtimeServer() {
    watchAndRefresh();
    startHttpServer();
    startWebSocketServer();
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    startRealtimeServer();
}
export { startRealtimeServer, watchAndRefresh, startHttpServer, startWebSocketServer };
