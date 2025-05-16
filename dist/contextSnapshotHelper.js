// AI-Helpers is for Cursor agents only. This file is for AI agent context handoff and is not intended for human consumption.
// NOTE: This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// ============================================================================
// Context & Contract Snapshot Helper (AI-Helpers/contextSnapshotHelper.ts)
// --------------------------------------------------------------------------
// Usage:
//   pnpm tsx AI-Helpers/contextSnapshotHelper.ts [--delta]
//   node AI-Helpers/contextSnapshotHelper.js [--full]
//
// Outputs:
//   - context-snapshot.json: Machine-readable context for AI agents
//   - context-snapshot.md: Human-readable summary for devs/agents
//   - context-snapshot.cache.json: Persistent cache for deltas, handoff notes
//
// This is the foundational context handoff tool for all Rocketship agents.
// ============================================================================
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { getSecretScanReport } from './secretScanHelper.js';
import { appendMemoryEvent } from './memoryLaneHelper.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Config ---
const OUTPUT_DIR = path.resolve(__dirname);
const JSON_OUT = path.join(OUTPUT_DIR, 'context-snapshot.json');
const CACHE_OUT = path.join(OUTPUT_DIR, 'context-snapshot.cache.json');
const SELF_HEAL_OUT = path.join(OUTPUT_DIR, 'selfHealingPlan.json');
// --- Utility: Write file safely ---
function writeFileSafe(filePath, data) {
    fs.writeFileSync(filePath, data, { encoding: 'utf-8' });
}
function extractAgentContracts() {
    const agentsDir = path.resolve(__dirname, '../extension/src/agents');
    const schemasDir = path.resolve(__dirname, '../shared/schemas');
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('Agent.ts'));
    const schemaFiles = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'));
    const schemas = schemaFiles.map(f => {
        try {
            const schema = JSON.parse(fs.readFileSync(path.join(schemasDir, f), 'utf-8'));
            return { file: f, title: schema.title, input: schema.properties?.input, output: schema.properties?.output };
        }
        catch {
            return { file: f, error: 'Failed to parse' };
        }
    });
    return {
        agentFiles,
        schemas
    };
}
function getRecentChanges() {
    try {
        const log = execSync('git log --pretty=format:"%h|%an|%ad|%s" --date=iso -n 10', { encoding: 'utf-8' });
        return log.split('\n').filter(Boolean).map(line => {
            const [hash, author, date, msg] = line.split('|');
            return { hash, author, date, msg };
        });
    }
    catch {
        return [];
    }
}
export function getTestFiles() {
    const testDirs = [
        path.resolve(__dirname, '../extension/src/agents/__tests__'),
        path.resolve(__dirname, '../extension/src/services/__tests__'),
        path.resolve(__dirname, '../extension/src/helpers'),
    ];
    let testFiles = [];
    for (const dir of testDirs) {
        if (fs.existsSync(dir)) {
            testFiles = testFiles.concat(fs.readdirSync(dir).filter(f => f.endsWith('.test.ts') || f.endsWith('.contract.test.ts') || f.endsWith('.spec.ts')).map(f => {
                const filePath = path.join(dir, f);
                const stats = fs.statSync(filePath);
                return {
                    file: f,
                    dir,
                    size: stats.size,
                    mtime: stats.mtime.toISOString(),
                };
            }));
        }
    }
    return testFiles;
}
function getHelperIndex() {
    const helpersDir = path.resolve(__dirname);
    return fs.readdirSync(helpersDir)
        .filter(f => f.endsWith('.ts') && f !== 'contextSnapshotHelper.ts')
        .map(f => {
        const stats = fs.statSync(path.join(helpersDir, f));
        return { file: f, size: stats.size, mtime: stats.mtime.toISOString() };
    });
}
function getDocsIndex() {
    const docsDir = path.resolve(__dirname, '../docs');
    const guides = fs.existsSync(path.join(docsDir, 'guides')) ? fs.readdirSync(path.join(docsDir, 'guides')) : [];
    const reference = fs.existsSync(path.join(docsDir, 'reference')) ? fs.readdirSync(path.join(docsDir, 'reference')) : [];
    return { guides, reference };
}
// --- 6. Next Steps & Handoff Notes ---
function getHandoffNotes() {
    if (fs.existsSync(CACHE_OUT)) {
        try {
            return JSON.parse(fs.readFileSync(CACHE_OUT, 'utf-8')).handoffNotes ?? '';
        }
        catch {
            return '';
        }
    }
    return '';
}
// --- 7. Memory Budget Estimator ---
function estimateMemoryBudget(obj) {
    return Buffer.byteLength(JSON.stringify(obj), 'utf-8');
}
// --- 8. Telemetry Event Extraction from Contract Tests ---
function extractTelemetryEventsFromTests() {
    const testDir = path.resolve(__dirname, '../extension/src/agents/__tests__');
    const eventMap = {};
    if (fs.existsSync(testDir)) {
        for (const file of fs.readdirSync(testDir)) {
            if (file.endsWith('.contract.test.ts')) {
                const content = fs.readFileSync(path.join(testDir, file), 'utf-8');
                const matches = [...content.matchAll(/emitEvent\((?:[^)]*['"]([\w.]+)['"]|{\s*name:\s*['"]([\w.]+)['"])/g)];
                const events = matches.map(m => m[1] || m[2]).filter(Boolean);
                eventMap[file] = new Set(events);
            }
        }
    }
    // Convert sets to arrays for JSON
    return Object.fromEntries(Object.entries(eventMap).map(([k, v]) => [k, Array.from(v)]));
}
// --- 9. Semantic Index (keyword-to-file map) ---
function extractWordsFromFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.match(/\b\w{4,}\b/g) || [];
}
function processDirectoryForIndex(dir, index) {
    if (!fs.existsSync(dir))
        return;
    for (const file of fs.readdirSync(dir)) {
        if (file.endsWith('.ts') || file.endsWith('.json')) {
            const words = extractWordsFromFile(path.join(dir, file));
            for (const word of words) {
                if (!(index[word] instanceof Set))
                    index[word] = new Set();
                index[word].add(file);
            }
        }
    }
}
function buildSemanticIndex() {
    const dirs = [
        path.resolve(__dirname, '../extension/src/agents'),
        path.resolve(__dirname, '../shared/schemas'),
        path.resolve(__dirname),
    ];
    const index = {};
    for (const dir of dirs) {
        processDirectoryForIndex(dir, index);
    }
    // Convert sets to arrays for JSON
    return Object.fromEntries(Object.entries(index).map(([k, v]) => [k, Array.from(v)]));
}
export function extractTodos() {
    const dirs = [
        path.resolve(__dirname, '../extension/src/agents'),
        path.resolve(__dirname),
    ];
    const todos = [];
    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
            for (const file of fs.readdirSync(dir)) {
                if (file.endsWith('.ts') || file.endsWith('.js')) {
                    const lines = fs.readFileSync(path.join(dir, file), 'utf-8').split('\n');
                    lines.forEach((line, idx) => {
                        if (/TODO|FIXME/.test(line)) {
                            todos.push({ file, line: idx + 1, text: line.trim() });
                        }
                    });
                }
            }
        }
    }
    return todos;
}
function getLargestFiles() {
    const dirs = [
        path.resolve(__dirname, '../extension/src/agents'),
        path.resolve(__dirname, '../shared/schemas'),
        path.resolve(__dirname),
    ];
    const files = [];
    for (const dir of dirs) {
        if (fs.existsSync(dir)) {
            for (const file of fs.readdirSync(dir)) {
                const filePath = path.join(dir, file);
                if (fs.statSync(filePath).isFile()) {
                    files.push({ file, size: fs.statSync(filePath).size, dir });
                }
            }
        }
    }
    return [...files].sort((a, b) => b.size - a.size).slice(0, 5);
}
// --- 12. Delta Mode ---
function computeDelta(current, previous) {
    if (!previous)
        return current;
    const delta = {};
    for (const key of Object.keys(current)) {
        if (Object.hasOwn(current, key) && Object.hasOwn(previous, key)) {
            if (JSON.stringify(current[key]) !== JSON.stringify(previous[key])) {
                delta[key] = current[key];
            }
        }
        else if (Object.hasOwn(current, key)) {
            delta[key] = current[key];
        }
    }
    return delta;
}
// --- 13. Main Snapshot Function ---
function gatherSnapshotData() {
    const contracts = extractAgentContracts();
    const changes = getRecentChanges();
    const testFiles = getTestFiles();
    const docs = getDocsIndex();
    const helpers = getHelperIndex();
    const handoffNotes = getHandoffNotes();
    const telemetryEvents = extractTelemetryEventsFromTests();
    const semanticIndex = buildSemanticIndex();
    const todos = extractTodos();
    const largestFiles = getLargestFiles();
    const healthScore = computeHealthScore({ testFiles, todos, largestFiles });
    const dependencyGraph = getDependencyGraph();
    const changeHotspots = getChangeHotspots();
    const agentCollabMap = getAgentCollaborationMap();
    const schemaDrift = detectSchemaDrift();
    // NOTE: astContractValidation is now async; to use it, refactor this function to be async and await the result.
    const astDrift = [{ note: 'astContractValidation is async; refactor gatherSnapshotData to use it.' }];
    const mutationSuggestions = getMutationSuggestions({ schemaDrift, todos, testFiles });
    const agentMessages = getAgentMessages();
    const selfHealingPlan = getSelfHealingPlan({ schemaDrift, mutationSuggestions });
    const secretScan = getSecretScanReport();
    return {
        contracts,
        changes,
        testFiles,
        docs,
        helpers,
        handoffNotes,
        telemetryEvents,
        semanticIndex,
        todos,
        largestFiles,
        healthScore,
        dependencyGraph,
        changeHotspots,
        agentCollabMap,
        schemaDrift,
        astDrift,
        mutationSuggestions,
        agentMessages,
        selfHealingPlan,
        secretScan
    };
}
function addMemoryBudgetAndCompression(snapshot) {
    snapshot.memoryBudgetBytes = estimateMemoryBudget(snapshot);
    snapshot.contextCompressionSuggestion = getContextCompressionSuggestion(snapshot);
    snapshot.compressedContexts = {
        '32k': getCompressedContext(snapshot, 32000),
        '64k': getCompressedContext(snapshot, 64000),
        '128k': getCompressedContext(snapshot, 128000)
    };
    return snapshot;
}
function applyDeltaIfNeeded(snapshot, delta) {
    let previous = null;
    if (delta && fs.existsSync(CACHE_OUT)) {
        try {
            previous = JSON.parse(fs.readFileSync(CACHE_OUT, 'utf-8')).lastSnapshot;
        }
        catch {
            previous = null;
        }
        return computeDelta(snapshot, previous);
    }
    return snapshot;
}
function writeSnapshotFiles(snapshot, agentMessages, selfHealingPlan) {
    writeFileSafe(JSON_OUT, JSON.stringify(snapshot, null, 2));
    let cache = {};
    if (fs.existsSync(CACHE_OUT)) {
        try {
            cache = JSON.parse(fs.readFileSync(CACHE_OUT, 'utf-8'));
        }
        catch {
            cache = {};
        }
    }
    cache['lastSnapshot'] = snapshot;
    cache['agentMessages'] = agentMessages;
    cache['selfHealingPlan'] = selfHealingPlan;
    writeFileSafe(CACHE_OUT, JSON.stringify(cache, null, 2));
    writeFileSafe(SELF_HEAL_OUT, JSON.stringify(selfHealingPlan, null, 2));
    appendMemoryEvent({ type: 'contextSnapshot', snapshotMeta: { timestamp: snapshot.timestamp, healthScore: snapshot.healthScore } });
}
function createSnapshot({ delta = false } = {}) {
    const data = gatherSnapshotData();
    let snapshot = {
        timestamp: new Date().toISOString(),
        ...data,
        memoryBudgetBytes: 0,
        contextCompressionSuggestion: []
    };
    snapshot = addMemoryBudgetAndCompression(snapshot);
    applyDeltaIfNeeded(snapshot, delta);
    writeSnapshotFiles(snapshot, data.agentMessages, data.selfHealingPlan);
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    createSnapshot();
    console.log('Context snapshot written to context-snapshot.json');
}
// --- Export for agent use ---
export { createSnapshot, getAgentMessages, addAgentMessage };
// --- TODOs for future agents ---
// - Implement delta mode for memory efficiency
// - Add semantic search index for fast context lookup
// - Integrate with test/lint runners for live status
// - Add memory budget estimator and context trimmer
// - Support YAML/HTML output if needed 
// --- Advanced: Codebase Health Score ---
function computeHealthScore({ testFiles, todos, largestFiles }) {
    let score = 100;
    if (testFiles.length === 0)
        score -= 30;
    if (todos.length > 10)
        score -= 20;
    if (largestFiles.some((f) => f.size > 100000))
        score -= 10;
    // Heuristic: penalize for more TODOs, large files, and missing tests
    score = Math.max(0, Math.min(100, score));
    return score;
}
// --- Advanced: Dependency Graph Summary ---
function getDependencyGraph() {
    const pkgPath = path.resolve(__dirname, '../package.json');
    let dependencies = {};
    let outdated = {};
    if (fs.existsSync(pkgPath)) {
        try {
            const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
            dependencies = pkg.dependencies || {};
            try {
                const out = execSync('pnpm outdated --json', { encoding: 'utf-8' });
                outdated = JSON.parse(out);
            }
            catch {
                outdated = {};
            }
        }
        catch {
            dependencies = {};
        }
    }
    return { dependencies, outdated };
}
// --- Advanced: Change Hotspots ---
function getChangeHotspots() {
    try {
        const log = execSync('git log --name-only --pretty=format: --no-merges -n 100', { encoding: 'utf-8' });
        const files = log.split('\n').filter(Boolean);
        const freq = {};
        for (const f of files)
            freq[f] = (freq[f] ?? 0) + 1;
        return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([file, count]) => ({ file, count }));
    }
    catch {
        return [];
    }
}
// --- Advanced: Agent Collaboration Map ---
function getAgentCollaborationMap() {
    const agentsDir = path.resolve(__dirname, '../extension/src/agents');
    const map = {};
    if (fs.existsSync(agentsDir)) {
        for (const file of fs.readdirSync(agentsDir)) {
            if (file.endsWith('Agent.ts')) {
                const content = fs.readFileSync(path.join(agentsDir, file), 'utf-8');
                const regex = /\b(\w+)\s*:/g;
                let match;
                const agentProps = [];
                while ((match = regex.exec(content)) !== null) {
                    agentProps.push(match[1]);
                }
                map[file] = agentProps;
            }
        }
    }
    return map;
}
// --- Advanced: Schema Drift Detector ---
export function detectSchemaDrift() {
    const agentsDir = path.resolve(__dirname, '../extension/src/agents');
    const schemasDir = path.resolve(__dirname, '../shared/schemas');
    const drift = [];
    if (fs.existsSync(agentsDir) && fs.existsSync(schemasDir)) {
        for (const file of fs.readdirSync(agentsDir)) {
            if (file.endsWith('Agent.ts')) {
                const content = fs.readFileSync(path.join(agentsDir, file), 'utf-8');
                const inputMatch = content.match(/inputSchema\s*=\s*([\w.]+)/);
                const outputMatch = content.match(/outputSchema\s*=\s*([\w.]+)/);
                if (inputMatch || outputMatch) {
                    const schemaName = (inputMatch ? inputMatch[1] : (outputMatch ? outputMatch[1] : null))?.replace(/Schema$/, '.schema.json');
                    if (!schemaName)
                        continue;
                    const schemaPath = path.join(schemasDir, schemaName);
                    if (fs.existsSync(schemaPath)) {
                        try {
                            const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));
                            const schemaProps = Object.keys((schema.properties?.input ?? schema.properties?.output) || {});
                            const regex = /\b(\w+)\s*:/g;
                            let match;
                            const agentProps = [];
                            while ((match = regex.exec(content)) !== null) {
                                agentProps.push(match[1]);
                            }
                            const missing = schemaProps.filter(p => !agentProps.includes(p));
                            if (missing.length) {
                                drift.push({ agent: file, schema: schemaName, missing });
                            }
                        }
                        catch { }
                    }
                }
            }
        }
    }
    return drift;
}
// --- Advanced: Context Compression Suggestion ---
function getContextCompressionSuggestion(snapshot) {
    if (snapshot.memoryBudgetBytes && snapshot.memoryBudgetBytes > 100000) {
        const suggestions = [];
        if (snapshot.semanticIndex && Object.keys(snapshot.semanticIndex).length > 1000)
            suggestions.push('Trim semanticIndex to most frequent 100 keywords.');
        if (snapshot.todos && snapshot.todos.length > 20)
            suggestions.push('Summarize or remove todos.');
        if (snapshot.largestFiles && snapshot.largestFiles.length > 3)
            suggestions.push('Only keep top 3 largest files.');
        return suggestions;
    }
    return [];
}
// --- Agent Message Board ---
function getAgentMessages() {
    if (fs.existsSync(CACHE_OUT)) {
        try {
            return JSON.parse(fs.readFileSync(CACHE_OUT, 'utf-8')).agentMessages || [];
        }
        catch {
            return [];
        }
    }
    return [];
}
function addAgentMessage(agent, type, message) {
    const messages = getAgentMessages();
    messages.push({ timestamp: new Date().toISOString(), agent, type, message });
    let cache = {};
    if (fs.existsSync(CACHE_OUT)) {
        try {
            cache = JSON.parse(fs.readFileSync(CACHE_OUT, 'utf-8'));
        }
        catch {
            cache = {};
        }
    }
    cache['agentMessages'] = messages;
    writeFileSafe(CACHE_OUT, JSON.stringify(cache, null, 2));
}
// --- Mutation/Refactor Suggestions ---
function getMutationSuggestions({ schemaDrift, todos, testFiles }) {
    const suggestions = [];
    for (const drift of schemaDrift) {
        if (typeof drift === 'object' && drift && 'agent' in drift && 'missing' in drift) {
            suggestions.push({ type: 'schemaDrift', agent: drift.agent, fix: `Add missing properties ${drift.missing.join(', ')} to ${drift.agent}` });
        }
    }
    for (const todo of todos) {
        suggestions.push({ type: 'todo', file: todo.file, line: todo.line, suggestion: `Resolve: ${todo.text}` });
    }
    if (testFiles.length === 0) {
        suggestions.push({ type: 'test', suggestion: 'Add tests for uncovered agents/services.' });
    }
    return suggestions;
}
// --- Memory Budget Simulation ---
function getCompressedContext(snapshot, tier) {
    // tier: number of bytes (e.g., 32000, 64000, 128000)
    const prioritizedFields = [
        'contracts', 'testFiles', 'telemetryEvents', 'semanticIndex', 'todos', 'largestFiles', 'healthScore', 'dependencyGraph', 'agentCollabMap', 'schemaDrift', 'mutationSuggestions', 'agentMessages', 'handoffNotes'
    ];
    const compressed = { timestamp: snapshot.timestamp };
    let used = 0;
    for (const field of prioritizedFields) {
        if (snapshot[field]) {
            const fieldSize = Buffer.byteLength(JSON.stringify(snapshot[field]), 'utf-8');
            if (used + fieldSize > tier)
                break;
            compressed[field] = snapshot[field];
            used += fieldSize;
        }
    }
    compressed.memoryBudgetBytes = used;
    return compressed;
}
// --- Self-Healing/Auto-Refactor Plan ---
function getSelfHealingPlan({ schemaDrift, mutationSuggestions }) {
    const plan = [];
    for (const drift of schemaDrift) {
        if (typeof drift === 'object' && drift && 'agent' in drift && 'missing' in drift) {
            plan.push({ action: 'addProperties', agent: drift.agent, properties: drift.missing });
        }
    }
    for (const mut of mutationSuggestions) {
        if (mut.type === 'todo') {
            plan.push({ action: 'resolveTodo', file: mut.file, line: mut.line, text: mut.suggestion });
        }
    }
    return plan;
}
/**
 * Returns a context snapshot trimmed to fit the specified byte size (prioritizes contracts, todos, testFiles, then other fields).
 */
export function getContextChunk(size) {
    const snapshot = gatherSnapshotData();
    const prioritizedFields = [
        'contracts', 'todos', 'testFiles', 'largestFiles', 'healthScore', 'mutationSuggestions', 'agentMessages', 'handoffNotes'
    ];
    const chunk = { timestamp: new Date().toISOString() };
    let used = 0;
    for (const field of prioritizedFields) {
        if (snapshot[field]) {
            const fieldSize = Buffer.byteLength(JSON.stringify(snapshot[field]), 'utf-8');
            if (used + fieldSize > size)
                break;
            chunk[field] = snapshot[field];
            used += fieldSize;
        }
    }
    chunk.memoryBudgetBytes = used;
    return chunk;
}
/**
 * Returns a description of the context snapshot helper and its main functions.
 */
export function describe() {
    return {
        name: 'contextSnapshotHelper',
        description: 'Extracts, summarizes, and provides context for AI agents, including contracts, tests, todos, and semantic index.',
        functions: [
            { name: 'createSnapshot', signature: '({ delta = false } = {}) => void', description: 'Creates a context snapshot for agents.' },
            { name: 'getAgentMessages', signature: '() => Array<Record<string, unknown>>', description: 'Retrieves agent messages.' },
            { name: 'addAgentMessage', signature: '(agent, type, message) => void', description: 'Adds a message to the agent message board.' },
            { name: 'extractTodos', signature: '() => TodoEntry[]', description: 'Extracts TODO/FIXME comments from code.' },
            { name: 'detectSchemaDrift', signature: '() => Array<{ agent: string; schema: string; missing: string[] }>', description: 'Detects schema drift between agents and schemas.' },
            { name: 'getTestFiles', signature: '() => TestFileInfo[]', description: 'Lists all test files.' },
            { name: 'getContextChunk', signature: '(size: number) => Record<string, unknown>', description: 'Returns a context snapshot trimmed to fit the specified byte size.' }
        ],
        usage: "import { createSnapshot, extractTodos } from 'ai-helpers/contextSnapshotHelper';",
        schema: {
            createSnapshot: {
                input: {
                    type: 'object',
                    properties: {
                        delta: { type: 'boolean', default: false }
                    },
                    required: []
                },
                output: { type: 'null' }
            },
            getAgentMessages: {
                input: { type: 'null' },
                output: {
                    type: 'array',
                    items: { type: 'object' }
                }
            },
            addAgentMessage: {
                input: {
                    type: 'object',
                    properties: {
                        agent: { type: 'string' },
                        type: { type: 'string' },
                        message: { type: 'object' }
                    },
                    required: ['agent', 'type', 'message']
                },
                output: { type: 'null' }
            },
            extractTodos: {
                input: { type: 'null' },
                output: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            file: { type: 'string' },
                            line: { type: 'number' },
                            text: { type: 'string' }
                        },
                        required: ['file', 'line', 'text']
                    }
                }
            },
            detectSchemaDrift: {
                input: { type: 'null' },
                output: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            agent: { type: 'string' },
                            schema: { type: 'string' },
                            missing: { type: 'array', items: { type: 'string' } }
                        },
                        required: ['agent', 'schema', 'missing']
                    }
                }
            },
            getTestFiles: {
                input: { type: 'null' },
                output: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            file: { type: 'string' },
                            dir: { type: 'string' },
                            size: { type: 'number' },
                            mtime: { type: 'string' }
                        },
                        required: ['file', 'dir', 'size', 'mtime']
                    }
                }
            },
            getContextChunk: {
                input: {
                    type: 'object',
                    properties: { size: { type: 'number', description: 'Max byte size for the context chunk.' } },
                    required: ['size']
                },
                output: { type: 'object', description: 'Trimmed context snapshot.' }
            }
        }
    };
}
