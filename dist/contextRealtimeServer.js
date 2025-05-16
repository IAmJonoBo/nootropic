// AI-Helpers is for Cursor agents only. This is the real-time context/mutation server for all future agents.
// NOTE: This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
// @ts-ignore
import { WebSocketServer } from 'ws';
import { createSnapshot } from './contextSnapshotHelper.js';
import { runMutationEngine } from './contextMutationEngine.js';
import { getAgentMessages, addAgentMessage } from './contextSnapshotHelper.js';
import { semanticSearch } from './semanticSearchHelper.js';
// import { registerIntent, getIntents, submitFeedback, getFeedback } from './agentIntentRegistry.js';
import { getSecretScanReport } from './secretScanHelper.js';
import { getMemoryLane } from './memoryLaneHelper.js';
import { registerPlugin, listPlugins } from './pluginRegistry.js';
// import { readJsonSafe, writeJsonSafe, getOrInitJson } from './utils.js';
import { CONTEXT_PATH, MUTATION_PLAN_PATH, PATCH_DIR } from './paths.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGENT_DIR = path.resolve(__dirname, '../extension/src/agents');
const SCHEMA_DIR = path.resolve(__dirname, '../shared/schemas');
const TEST_DIR = path.resolve(__dirname, '../extension/src/agents/__tests__');
// --- File watcher: triggers context/mutation updates on change ---
function watchAndRefresh() {
    const dirs = [AGENT_DIR, SCHEMA_DIR, TEST_DIR];
    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
            fs.watch(dir, { recursive: true }, (event, filename) => {
                if (filename && (filename.endsWith('.ts') || filename.endsWith('.json'))) {
                    createSnapshot();
                    runMutationEngine();
                }
            });
        }
    }
}
// --- HTTP API ---
function startHttpServer(port = 4000) {
    const server = http.createServer((req, res) => {
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
            req.on('end', () => {
                try {
                    const { query, topN } = JSON.parse(body);
                    const results = semanticSearch(query, topN || 5);
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
                    const { query, topN } = data;
                    const results = semanticSearch(query, topN || 5);
                    ws.send(JSON.stringify({ type: 'semanticSearchResults', data: results }));
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
