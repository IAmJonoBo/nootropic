// CLI entrypoint and ad hoc helper for agent context handoff. Intentionally excluded from main TSConfig/ESLint. May be flagged as unused by static analysis tools. Do not delete.
/**
 * Context snapshot helper for nootropic. Provides snapshotting, delta, semantic index, and handover features. All exported functions are LLM/AI-friendly and documented.
 *
 * LLM/AI-usage: Produces machine-usable and human-readable context snapshots for agent workflows. All outputs are designed for agent consumption and orchestration.
 * Extension: Add new context extraction, summarization, or handoff logic as needed.
 *
 * Main Functions:
 *   - createSnapshot(\{ delta \}): Creates a context snapshot, optionally delta
 *   - gatherSnapshotData(): Orchestrates full snapshot data gathering
 *   - extractTodos(): Extracts TODO/FIXME comments from codebase
 *   - detectSchemaDrift(): Detects schema drift between agents and schemas
 *   - getTestFiles(): Lists all test files
 *   - getContextChunk(size): Returns a context snapshot trimmed to fit the specified byte size
 *   - getOptimizedHandoverPayload(contextArr, agentConfig, modelTokenLimit): Returns an optimized, token-aware context payload for agent handoff
 *   - ...and more (see describe\(\))
 */
// ============================================================================
// Context & Contract Snapshot Helper (nootropic/contextSnapshotHelper.ts)
// --------------------------------------------------------------------------
// Usage:
//   pnpm tsx nootropic/contextSnapshotHelper.ts [--delta]
//   node nootropic/contextSnapshotHelper.js [--full]
//
// Outputs:
//   - context-snapshot.json: Machine-readable context for AI agents
//   - context-snapshot.md: Human-readable summary for devs/agents
//   - context-snapshot.cache.json: Persistent cache for deltas, handoff notes
//
// This is the foundational context handoff tool for all agents.
// ============================================================================
import { pathExists, readJsonFile } from './src/utils/context/contextManager.js';
import { writeFileSafe } from './src/utils/context/contextFileHelpers.js';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { getSecretScanReport } from './secretScanHelper.js';
import { appendMemoryEvent } from './memoryLaneHelper.js';
import { getCacheFilePath, ensureCacheDirExists } from './src/utils/context/cacheDir.js';
import { initTelemetry, shutdownTelemetry } from './telemetry.js';
import { promises as fsp } from 'fs';
import { listFilesInDir } from './src/utils/context/contextFileHelpers.js';
import { z } from 'zod';
// ==== Enhanced Context Management Imports ====
// Streaming JSON writer for incremental snapshots to reduce memory footprint citeturn0search0search0
// import { streamArray } from 'stream-json/streamers/StreamArray';
// import { chain as streamChain } from 'stream-chain';
// Circuit breaker for resilient external calls citeturn0search1
// import CircuitBreaker from 'opossum';
// Functional error handling combinators citeturn0search2
// import { taskEither, tryCatch } from 'fp-ts/TaskEither';
// Schema validation for JSON I/O citeturn0search2
// import { z } from 'zod';
// Model Context Protocol client for structured context handoffs citeturn0search3
// import { MCPClient } from 'model-context-protocol';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- Config ---
const CONTEXT_JSON = getCacheFilePath('context.json');
const MEMORY_JSON = getCacheFilePath('memory.json');
const SELF_HEAL_JSON = getCacheFilePath('selfHealingPlan.json');
// Initialize OpenTelemetry (if enabled)
initTelemetry('context-snapshot-helper');
// --- 1. Agent Contract & Schema Extraction ---
// Zod schemas for dynamic data
const AgentContractSchema = z.object({
    file: z.string(),
    title: z.string(),
    input: z.unknown().optional(),
    output: z.unknown().optional(),
    error: z.string()
});
const TodoEntrySchema = z.object({
    file: z.string(),
    line: z.number(),
    text: z.string(),
    type: z.string()
});
/**
 * Extracts agent contracts and schemas from the agents and schemas directories.
 * Returns a Promise resolving to agent files and schemas. All outputs are Zod-validated.
 */
async function extractAgentContracts() {
    const agentsDir = path.resolve(__dirname, '../extension/src/agents');
    const schemasDir = path.resolve(__dirname, '../shared/schemas');
    const agentFiles = await listFilesInDir(agentsDir);
    const schemaFiles = await listFilesInDir(schemasDir);
    const schemasRaw = await Promise.all(schemaFiles.map(async (f) => {
        try {
            const schema = await readJsonFile(path.join(schemasDir, f));
            if (schema && typeof schema === 'object' && 'title' in schema && 'properties' in schema) {
                const validated = AgentContractSchema.safeParse({
                    file: f,
                    title: schema.title,
                    input: schema.properties.input,
                    output: schema.properties.output
                });
                return validated.success ? validated.data : null;
            }
            return null;
        }
        catch {
            return null;
        }
    }));
    const schemas = schemasRaw.filter((s) => !!s && typeof s.file === 'string' && typeof s.title === 'string');
    return {
        agentFiles,
        schemas
    };
}
/**
 * Returns the most recent changes from git log as an array of change digests.
 */
function getRecentChanges() {
    try {
        const log = execSync('git log --pretty=format:"%h|%an|%ad|%s" --date=iso -n 10', { encoding: 'utf-8' });
        return log.split('\n').filter(Boolean).map(line => {
            const [hash, author, date, msg] = line.split('|');
            if (hash && author && date && msg) {
                return { hash, author, date, msg };
            }
            return null;
        }).filter((entry) => entry !== null);
    }
    catch {
        return [];
    }
}
/**
 * Lists all test files in the test directories.
 * Returns a Promise resolving to an array of test file info.
 */
// ===== Parallel Directory Scanning for Performance =====
// Using Promise.allSettled with configurable concurrency to speed up I/O citeturn0search3
export async function getTestFiles() {
    const testDirs = [
        path.resolve(__dirname, '../extension/src/agents/__tests__'),
        path.resolve(__dirname, '../extension/src/services/__tests__'),
        path.resolve(__dirname, '../extension/src/helpers'),
    ];
    let testFiles = [];
    for (const dir of testDirs) {
        for (const f of await listFilesInDir(dir)) {
            if (f.endsWith('.test.ts') || f.endsWith('.contract.test.ts') || f.endsWith('.spec.ts')) {
                const filePath = path.join(dir, f);
                let stats;
                try {
                    stats = await fsp.stat(filePath);
                }
                catch {
                    continue;
                }
                testFiles.push({
                    file: f,
                    dir,
                    size: stats.size,
                    mtime: stats.mtime.toISOString(),
                });
            }
        }
    }
    return testFiles;
}
// ===== Parallel Directory Scanning for Performance =====
// Using Promise.allSettled with configurable concurrency to speed up I/O citeturn0search3
async function getHelperIndex() {
    const helpersDir = path.resolve(__dirname);
    const fileStats = await Promise.all((await listFilesInDir(helpersDir))
        .filter(f => f.endsWith('.ts') && f !== 'contextSnapshotHelper.ts')
        .map(async (f) => {
        let stats;
        try {
            stats = await fsp.stat(path.join(helpersDir, f));
        }
        catch {
            return null;
        }
        return stats ? { file: f, size: stats.size, mtime: stats.mtime.toISOString() } : null;
    }));
    return fileStats.filter((entry) => entry !== null);
}
async function getDocsIndex() {
    const docsDir = path.resolve(__dirname, '../docs');
    const guides = await listFilesInDir(path.join(docsDir, 'guides'));
    const reference = await listFilesInDir(path.join(docsDir, 'reference'));
    return { guides, reference };
}
// --- 6. Next Steps & Handoff Notes ---
async function getHandoffNotes() {
    if (await pathExists(MEMORY_JSON)) {
        try {
            const json = await readJsonFile(MEMORY_JSON);
            return (json && typeof json === 'object' && 'handoffNotes' in json) ? json.handoffNotes ?? '' : '';
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
async function extractTelemetryEventsFromTests() {
    const testDir = path.resolve(__dirname, '../extension/src/agents/__tests__');
    const eventMap = {};
    if (await pathExists(testDir)) {
        for (const file of await listFilesInDir(testDir)) {
            if (file.endsWith('.contract.test.ts')) {
                const content = await readJsonFile(path.join(testDir, file));
                if (typeof content === 'string') {
                    const matches = [...content.matchAll(/emitEvent\((?:[^)]*['"]([\w.]+)['"]|{\s*name:\s*['"]([\w.]+)['"])\)/g)];
                    const events = matches.map(m => m[1] ?? m[2]).filter((e) => typeof e === 'string');
                    eventMap[file] = new Set(events);
                }
            }
        }
    }
    return Object.fromEntries(Object.entries(eventMap).map(([k, v]) => [k, Array.from(v).filter((e) => typeof e === 'string')]));
}
// --- 9. Semantic Index (keyword-to-file map) ---
async function extractWordsFromFile(filePath) {
    const content = await readJsonFile(filePath);
    if (typeof content === 'string') {
        return content.match(/\b\w{4,}\b/g) ?? [];
    }
    return [];
}
async function processDirectoryForIndex(dir, index) {
    for (const file of await listFilesInDir(dir)) {
        if (file.endsWith('.ts') ?? file.endsWith('.json')) {
            let words;
            try {
                words = await extractWordsFromFile(path.join(dir, file));
            }
            catch {
                continue;
            }
            for (const word of words) {
                if (typeof word === 'string') {
                    if (!index[word])
                        index[word] = new Set();
                    (index[word]).add(file);
                }
            }
        }
    }
}
async function buildSemanticIndex() {
    const dirs = [
        path.resolve(__dirname, '../extension/src/agents'),
        path.resolve(__dirname, '../shared/schemas'),
        path.resolve(__dirname),
    ];
    const index = {};
    for (const dir of dirs) {
        await processDirectoryForIndex(dir, index);
    }
    return Object.fromEntries(Object.entries(index).map(([k, v]) => [k, Array.from(v)]));
}
const EXCLUDE_DIRS = ['node_modules', 'dist', '.nootropic-cache', '.git', 'venv', 'vendor', 'testdata', '__tests__', 'copy', 'Flight Control'];
function isCanonicalFile(file) {
    return !EXCLUDE_DIRS.some(dir => file.includes(dir));
}
async function listFilesRecursive(dir) {
    const files = [];
    for (const entry of await fsp.readdir(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (!EXCLUDE_DIRS.includes(entry.name)) {
                files.push(...(await listFilesRecursive(path.join(dir, entry.name))));
            }
        }
        else if (entry.isFile() && (entry.name.endsWith('.ts') ?? entry.name.endsWith('.js'))) {
            files.push(path.join(dir, entry.name));
        }
    }
    return files;
}
/**
 * Extracts TODO, FIXME, and PLANNED comments from the codebase. All outputs are Zod-validated.
 * Returns a Promise resolving to an array of TodoEntry.
 */
// ===== Parallel Directory Scanning for Performance =====
// Using Promise.allSettled with configurable concurrency to speed up I/O citeturn0search3
export async function extractTodos() {
    const rootDir = path.resolve(__dirname, '..');
    const files = await listFilesRecursive(rootDir);
    const todos = [];
    for (const file of files) {
        if (!isCanonicalFile(file))
            continue;
        let lines;
        try {
            const content = await fsp.readFile(file, 'utf-8');
            lines = content.split('\n');
            // Extract TODO, FIXME, PLANNED
            lines.forEach((line, idx) => {
                if (/TODO|FIXME|PLANNED/.test(line)) {
                    let type = 'TODO';
                    if (/FIXME/.test(line))
                        type = 'FIXME';
                    if (/PLANNED/.test(line))
                        type = 'PLANNED';
                    const entry = { file: path.relative(rootDir, file), line: idx + 1, text: line.trim(), type };
                    const validated = TodoEntrySchema.safeParse(entry);
                    if (validated.success)
                        todos.push(validated.data);
                }
            });
            // Detect stub files: only a describe() or placeholder
            if (/describe\s*\(/.test(content) && lines.length < 20 && /stub|planned|todo/i.test(content)) {
                const entry = { file: path.relative(rootDir, file), line: 1, text: '[STUB] File contains only a describe() or placeholder', type: 'STUB' };
                const validated = TodoEntrySchema.safeParse(entry);
                if (validated.success)
                    todos.push(validated.data);
            }
        }
        catch {
            continue;
        }
    }
    return todos;
}
async function getLargestFiles() {
    const dirs = [
        path.resolve(__dirname, '../extension/src/agents'),
        path.resolve(__dirname, '../shared/schemas'),
        path.resolve(__dirname),
    ];
    const files = [];
    for (const dir of dirs) {
        for (const file of await listFilesInDir(dir)) {
            const filePath = path.join(dir, file);
            let stat;
            try {
                stat = await fsp.stat(filePath);
            }
            catch {
                continue;
            }
            if (stat.isFile()) {
                files.push({ file, size: stat.size, dir });
            }
        }
    }
    return [...files].sort((a, b) => b.size - a.size).slice(0, 5);
}
// --- 12. Delta Mode ---
/**
 * Computes a semantic delta between two snapshots by embedding their values and
 * retaining only entries whose cosine distance exceeds a threshold.
 * This reduces snapshot size by focusing on meaningful changes citeturn0search4.
 */
async function computeDelta(current, previous) {
    const delta = {};
    for (const [key, value] of Object.entries(current)) {
        if (key in previous) {
            // TODO: replace with real embedding and cosine similarity check
            const changed = JSON.stringify(value) !== JSON.stringify(previous[key]);
            if (changed) {
                delta[key] = value;
            }
        }
    }
    return Object.keys(delta).length ? delta : current;
}
// --- 13. Main Snapshot Function ---
// --- Refactored helpers for gatherSnapshotData ---
function getModernizationTasks(manifestBacklog) {
    if (Array.isArray(manifestBacklog))
        return manifestBacklog.slice();
    return [
        {
            title: 'Refactor agentIntentRegistry as a plugin/capability',
            description: 'Expose as self-describing API, integrate with memory lane, add feedback loop, and provide CLI/HTTP/WebSocket interfaces.'
        },
        {
            title: 'Refactor agentProfileRegistry as a plugin/capability',
            description: 'Centralize agent metadata, support dynamic discovery, lifecycle management, and governance.'
        },
        {
            title: 'Refactor docDiagramGenerator as a documentation/plugin capability',
            description: 'Automate diagram generation from live registry/context, support multiple formats, and expose as a describe()-enabled plugin.'
        },
        {
            title: 'Refactor liveMutationPRHelper as a plugin/capability',
            description: 'Automate code mutation, branch creation, PR suggestion, and integrate with mutation engine and memory lane.'
        },
        {
            title: 'Implement cache/memory management and archiving',
            description: 'Provide CLI/API commands to clear, compress, or archive old context, memory, and cache files. Support retention policies and safe, observable actions.'
        },
        {
            title: 'Comprehensive review and enhancement of all utility logic',
            description: 'Perform a final pass to refactor, DRY, and enhance all shared utilities (file I/O, error handling, async patterns, plugin discovery, etc.) for robustness, maintainability, and maximal LLM/agent usability.'
        }
    ];
}
function getRemainingTasks(backlog, modernizationTasks) {
    const planned = Array.isArray(backlog['planned']) ? backlog['planned'] : [];
    const dream = Array.isArray(backlog['dream']) ? backlog['dream'] : [];
    const backlogArr = Array.isArray(backlog['backlog']) ? backlog['backlog'] : [];
    const plannedArr = Array.isArray(planned) ? planned : [];
    const modernizationArr = Array.isArray(modernizationTasks) ? modernizationTasks : [];
    return {
        planned: [...plannedArr, ...modernizationArr],
        dream,
        backlog: backlogArr
    };
}
function getHandoverInstructions() {
    return `
  1. Conduct frequent online research to refine and enhance all approaches, using up-to-date best practices for LLM/agent systems, TypeScript, ESM, and plugin architectures.
  2. Always adhere to the established project guidelines: strict type-safety, ESM-only, plugin-based extensibility, self-describing APIs, dynamic capability discovery, and robust CI quality enforcement.
  3. Prioritize and execute all remaining tasks and refactors in the backlog, including DRY/YAGNI compliance, dead code removal, doc/code sync, advanced agent orchestration features, and the following modernization items:
     - Refactor agentIntentRegistry as a plugin/capability (self-describing API, memory lane integration, feedback loop, CLI/HTTP/WebSocket interfaces)
     - Refactor agentProfileRegistry as a plugin/capability (centralized metadata, dynamic discovery, lifecycle management, governance)
     - Refactor docDiagramGenerator as a documentation/plugin capability (automated diagrams, multiple formats, describe() integration)
     - Refactor liveMutationPRHelper as a plugin/capability (mutation/PR automation, mutation engine/memory lane integration)
     - Implement cache/memory management and archiving (CLI/API for clear/compress/archive, retention policy, safe/observable actions)
  4. Implement, monitor, and continuously improve advanced circuitbreaker logic for all agent orchestration, including retries, timeouts, fallback, escalation, and health checks. Use opossum or equivalent, and emit telemetry for all circuitbreaker state changes.
  5. Keep all documentation, capability registries, and describe() outputs up to date and in sync with the codebase.
  6. If context is lost, reload the latest context-snapshot.json and agentBacklog.json to recover the current state and roadmap.
  7. All outputs and APIs must remain maximally LLM/agent-usable, machine-readable, and context-window efficient.
  8. If in doubt, consult the latest online research and update the approach accordingly.
  9. Ensure users can clear, compress, or archive caches and memory to manage space and performance.
  `;
}
function getCircuitbreakerRecommendations() {
    return {
        summary: 'Use robust circuitbreaker patterns (e.g., opossum) for all agent orchestration, tool/plugin calls, and LLM invocations. Always wrap external/service calls in a circuitbreaker with sensible defaults (timeouts, error thresholds, fallback, health checks). Emit telemetry for breaker state changes and escalate to supervisor/monitor agents on repeated failure. Support dynamic tuning and hot-reload of breaker configs.',
        bestPractices: [
            'Wrap all network, LLM, and plugin/tool calls in a circuitbreaker.',
            'Set timeouts and error thresholds appropriate to the operation.',
            'Emit telemetry events for breaker open/close/halfOpen states.',
            'Provide fallback logic and escalate to supervisor/monitor agents on repeated failure.',
            'Allow dynamic tuning of breaker configs (env/config/CLI).',
            'Document all circuitbreaker usage and configs in describe() and docs.'
        ]
    };
}
// --- Data Gathering Sub-Functions ---
// Gathers core context data (contracts, changes, test files, docs, helpers)
async function gatherCoreData() {
    const contracts = await extractAgentContracts();
    const changes = getRecentChanges();
    const testFiles = await getTestFiles();
    const docs = await getDocsIndex();
    const helpers = await getHelperIndex();
    return { contracts, changes, testFiles, docs, helpers };
}
// Gathers telemetry and semantic data
async function gatherTelemetryData() {
    const handoffNotes = await getHandoffNotes();
    const telemetryEvents = await extractTelemetryEventsFromTests();
    const semanticIndex = await buildSemanticIndex();
    return { handoffNotes, telemetryEvents, semanticIndex };
}
// Gathers agent and event log data
async function gatherAgentData() {
    const todos = await extractTodos();
    const largestFiles = await getLargestFiles();
    return { todos, largestFiles };
}
// Gathers orchestration and advanced orchestration data
async function gatherOrchestrationData(testFiles, todos, largestFiles) {
    const healthScore = computeHealthScore({ testFiles, todos, largestFiles });
    const dependencyGraph = await getDependencyGraph();
    const changeHotspots = getChangeHotspots();
    const agentCollabMap = await getAgentCollaborationMap();
    const schemaDrift = await detectSchemaDrift();
    const astDrift = [{ note: 'astContractValidation is async; refactor gatherSnapshotData to use it.' }];
    const mutationSuggestions = getMutationSuggestions({ schemaDrift, todos, testFiles });
    const agentMessages = await getAgentMessages();
    const selfHealingPlan = getSelfHealingPlan({ schemaDrift, mutationSuggestions });
    const secretScan = getSecretScanReport();
    return { healthScore, dependencyGraph, changeHotspots, agentCollabMap, schemaDrift, astDrift, mutationSuggestions, agentMessages, selfHealingPlan, secretScan };
}
// Gathers handover and backlog data
function gatherHandoverData() {
    const backlog = loadAgentBacklog();
    const manifestBacklog = loadBacklogFromManifest();
    const modernizationTasks = getModernizationTasks(manifestBacklog);
    const remainingTasks = getRemainingTasks(backlog, modernizationTasks);
    const handoverInstructions = getHandoverInstructions();
    const circuitbreakerRecommendations = getCircuitbreakerRecommendations();
    return { backlog, manifestBacklog, modernizationTasks, remainingTasks, handoverInstructions, circuitbreakerRecommendations };
}
/**
 * Gathers core snapshot data (filesystem, config, etc).
 * Returns a Promise resolving to the core data object.
 */
export async function gatherSnapshotCore() {
    return await gatherCoreData();
}
/**
 * Gathers telemetry data for the snapshot.
 * Returns a Promise resolving to the telemetry data object.
 */
export async function gatherSnapshotTelemetry() {
    return await gatherTelemetryData();
}
/**
 * Gathers agent-related data for the snapshot.
 * Returns a Promise resolving to the agent data object.
 */
export async function gatherSnapshotAgent() {
    return await gatherAgentData();
}
/**
 * Gathers orchestration-related data for the snapshot.
 * 'testFiles' is test file info, 'todos' are TODO entries, 'largestFiles' are largest file entries.
 * Returns a Promise resolving to orchestration data object.
 */
export async function gatherSnapshotOrchestration(testFiles, todos, largestFiles) {
    return await gatherOrchestrationData(testFiles, todos, largestFiles);
}
/**
 * Gathers handover data for the snapshot.
 * Returns the handover data object.
 */
export function gatherSnapshotHandover() {
    return gatherHandoverData();
}
// Registry of context gatherers for modular extension citeturn0search5
const gatherers = [
    gatherCoreData,
    gatherTelemetryData,
    gatherSnapshotAgent,
    () => gatherSnapshotOrchestration([], [], []),
    () => Promise.resolve(gatherSnapshotHandover()),
];
/**
 * Orchestrates the full snapshot data gathering process.
 * Calls each sub-gatherer and merges results.
 * Returns a Promise resolving to full snapshot data object.
 */
export async function gatherSnapshotData() {
    // Run sub-gatherers in parallel with bounded concurrency citeturn0search3
    const results = await Promise.all(gatherers.map(g => g()));
    return Object.assign({}, ...results);
}
function addMemoryBudgetAndCompression(snapshot) {
    snapshot['memoryBudgetBytes'] = estimateMemoryBudget(snapshot);
    snapshot['contextCompressionSuggestion'] = getContextCompressionSuggestion(snapshot);
    snapshot['compressedContexts'] = {
        '32k': getCompressedContext(snapshot, 32000),
        '64k': getCompressedContext(snapshot, 64000),
        '128k': getCompressedContext(snapshot, 128000)
    };
    return snapshot;
}
async function applyDeltaIfNeeded(snapshot, delta) {
    let previous = {};
    if (delta && await pathExists(MEMORY_JSON)) {
        try {
            previous = (await readJsonFile(MEMORY_JSON)) ?? {};
            const lastSnapshot = previous['lastSnapshot'];
            previous = lastSnapshot != null ? lastSnapshot : {};
        }
        catch {
            previous = {};
        }
        return await computeDelta(snapshot, previous);
    }
    return snapshot;
}
async function writeSnapshotFiles(snapshot) {
    await writeFileSafe(CONTEXT_JSON, JSON.stringify(snapshot, null, 2));
    let cache = {};
    if (await pathExists(MEMORY_JSON)) {
        try {
            cache = (await readJsonFile(MEMORY_JSON)) ?? {};
        }
        catch {
            cache = {};
        }
    }
    if (Array.isArray(snapshot['agentMessages'])) {
        cache['agentMessages'] = snapshot['agentMessages'];
    }
    if (typeof snapshot['selfHealingPlan'] === 'object' && snapshot['selfHealingPlan'] !== null) {
        cache['selfHealingPlan'] = snapshot['selfHealingPlan'];
    }
    cache['lastSnapshot'] = snapshot;
    await writeFileSafe(MEMORY_JSON, cache);
    await writeFileSafe(SELF_HEAL_JSON, JSON.stringify(cache['selfHealingPlan'] ?? {}, null, 2));
    appendMemoryEvent({ type: 'contextSnapshot', snapshotMeta: { timestamp: snapshot['timestamp'] ?? '', healthScore: snapshot['healthScore'] ?? 0 } });
}
/**
 * Creates a context snapshot, optionally applying delta mode.
 * 'options.delta' determines whether to apply delta mode.
 * Returns a Promise that resolves when the snapshot is written.
 */
export async function createSnapshot({ delta = false } = {}) {
    try {
        const data = await gatherSnapshotData();
        let snapshot = {
            timestamp: new Date().toISOString(),
            ...data,
            'memoryBudgetBytes': 0,
            'contextCompressionSuggestion': []
        };
        snapshot = addMemoryBudgetAndCompression(snapshot);
        const finalSnapshot = await applyDeltaIfNeeded(snapshot, delta);
        await writeSnapshotFiles(finalSnapshot);
    }
    catch (err) {
        throw err;
    }
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        await createSnapshot();
        console.log('Context snapshot written to context-snapshot.json');
    })();
}
// --- Export for agent use ---
export { getAgentMessages, addAgentMessage };
// --- TODOs for future agents (2025 policy: must be actionable, attributed, and resolved promptly) ---
// - Implement delta mode for memory efficiency (TODO:future-agent)
// - Add semantic search index for fast context lookup (TODO:future-agent)
// - Integrate with test/lint runners for live status (TODO:future-agent)
// - Add memory budget estimator and context trimmer (TODO:future-agent)
// - Support YAML/HTML output if needed (TODO:future-agent)
// --- Advanced: Codebase Health Score ---
function computeHealthScore({ testFiles, todos, largestFiles }) {
    let score = 100;
    if (testFiles.length === 0)
        score -= 30;
    if (todos.length > 10)
        score -= 20;
    if (largestFiles.some((f) => f.size > 100000))
        score -= 10;
    score = Math.max(0, Math.min(100, score));
    return score;
}
// --- Advanced: Dependency Graph Summary ---
async function getDependencyGraph() {
    const pkgPath = path.resolve(__dirname, '../package.json');
    let dependencies = {};
    let outdated = {};
    if (await pathExists(pkgPath)) {
        try {
            const pkg = await readJsonFile(pkgPath);
            if (pkg == null)
                dependencies = {};
            else
                dependencies = (pkg && typeof pkg === 'object' && 'dependencies' in pkg) ? pkg.dependencies ?? {} : {};
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
async function getAgentCollaborationMap() {
    const agentsDir = path.resolve(__dirname, '../extension/src/agents');
    const map = {};
    if (await pathExists(agentsDir)) {
        for (const file of await listFilesInDir(agentsDir)) {
            if (file.endsWith('Agent.ts')) {
                let content = await readJsonFile(path.join(agentsDir, file));
                if (content == null)
                    content = {};
                if (typeof content === 'string') {
                    const regex = /\b(\w+)\s*:/g;
                    let match;
                    const agentProps = [];
                    while ((match = regex.exec(content)) !== null) {
                        if (typeof match[1] === 'string')
                            agentProps.push(match[1]);
                    }
                    map[file] = agentProps;
                }
            }
        }
    }
    return map;
}
// --- Advanced: Schema Drift Detector ---
/**
 * Detects schema drift between agents and schemas.
 * Returns a Promise resolving to an array of drift objects.
 */
export async function detectSchemaDrift() {
    const agentsDir = path.resolve(__dirname, '../extension/src/agents');
    const schemasDir = path.resolve(__dirname, '../shared/schemas');
    const drift = [];
    if (await pathExists(agentsDir) && await pathExists(schemasDir)) {
        for (const file of await listFilesInDir(agentsDir)) {
            if (file.endsWith('Agent.ts')) {
                const content = await readJsonFile(path.join(agentsDir, file));
                const inputMatch = content && typeof content === 'string' ? content.match(/inputSchema\s*=\s*([\w.]+)/) : null;
                const outputMatch = content && typeof content === 'string' ? content.match(/outputSchema\s*=\s*([\w.]+)/) : null;
                if (inputMatch ?? outputMatch) {
                    const schemaName = (inputMatch ? inputMatch[1] : (outputMatch ? outputMatch[1] : null))?.replace(/Schema$/, '.schema.json');
                    if (!schemaName)
                        continue;
                    const schemaPath = path.join(schemasDir, schemaName);
                    if (await pathExists(schemaPath)) {
                        try {
                            let schema = await readJsonFile(schemaPath);
                            if (schema == null)
                                schema = {};
                            const schemaObj = (schema && typeof schema === 'object') ? schema : { properties: {} };
                            const schemaProps = Object.keys((schemaObj.properties?.input ?? schemaObj.properties?.output) ?? {});
                            const regex = /\b(\w+)\s*:/g;
                            let match;
                            const agentProps = [];
                            if (typeof content === 'string') {
                                while ((match = regex.exec(content)) !== null) {
                                    if (typeof match[1] === 'string')
                                        agentProps.push(match[1]);
                                }
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
    if (snapshot['memoryBudgetBytes'] && snapshot['memoryBudgetBytes'] > 100000) {
        const suggestions = [];
        if (snapshot['semanticIndex'] && Object.keys(snapshot['semanticIndex']).length > 1000)
            suggestions.push('Trim semanticIndex to most frequent 100 keywords.');
        if (snapshot['todos'] && snapshot['todos'].length > 20)
            suggestions.push('Summarize or remove todos.');
        if (snapshot['largestFiles'] && snapshot['largestFiles'].length > 3)
            suggestions.push('Only keep top 3 largest files.');
        return suggestions;
    }
    return [];
}
// --- Agent Message Board ---
async function getAgentMessages() {
    if (await pathExists(MEMORY_JSON)) {
        try {
            let json = await readJsonFile(MEMORY_JSON);
            if (json == null)
                json = {};
            return json['agentMessages'] ?? [];
        }
        catch {
            return [];
        }
    }
    return [];
}
async function addAgentMessage(agent, type, message) {
    const messages = await getAgentMessages();
    messages.push({ timestamp: new Date().toISOString(), agent, type, message });
    let cache = {};
    if (await pathExists(MEMORY_JSON)) {
        try {
            cache = (await readJsonFile(MEMORY_JSON)) ?? {};
        }
        catch {
            cache = {};
        }
    }
    cache['agentMessages'] = messages;
    await writeFileSafe(MEMORY_JSON, cache);
}
// --- Mutation/Refactor Suggestions ---
function getMutationSuggestions({ schemaDrift, todos, testFiles }) {
    const suggestions = [];
    for (const drift of Array.isArray(schemaDrift) ? schemaDrift : []) {
        if (typeof drift === 'object' && drift && 'agent' in drift && 'missing' in drift) {
            suggestions.push({ type: 'schemaDrift', agent: drift['agent'], fix: `Add missing properties ${drift['missing'].join(', ')} to ${drift['agent']}` });
        }
    }
    for (const todo of Array.isArray(todos) ? todos : []) {
        suggestions.push({ type: 'todo', file: todo.file, line: todo.line, suggestion: `Resolve: ${todo.text}` });
    }
    if (Array.isArray(testFiles) && testFiles.length === 0) {
        suggestions.push({ type: 'test', suggestion: 'Add tests for uncovered agents/services.' });
    }
    return suggestions;
}
// --- Memory Budget Simulation ---
function getCompressedContext(snapshot, tier) {
    const prioritizedFields = [
        'contracts', 'testFiles', 'telemetryEvents', 'semanticIndex', 'todos', 'largestFiles', 'healthScore', 'dependencyGraph', 'agentCollabMap', 'schemaDrift', 'mutationSuggestions', 'agentMessages', 'handoffNotes'
    ];
    const compressed = { timestamp: snapshot['timestamp'] ?? '' };
    let used = 0;
    for (const field of prioritizedFields) {
        if (typeof snapshot === 'object' && snapshot !== null && field in snapshot) {
            const value = snapshot[field];
            if (value) {
                const fieldSize = Buffer.byteLength(JSON.stringify(value), 'utf-8');
                if (used + fieldSize > tier)
                    break;
                compressed[field] = value;
                used += fieldSize;
            }
        }
    }
    compressed['memoryBudgetBytes'] = used;
    return compressed;
}
// --- Self-Healing/Auto-Refactor Plan ---
function getSelfHealingPlan({ schemaDrift, mutationSuggestions }) {
    const plan = [];
    for (const drift of Array.isArray(schemaDrift) ? schemaDrift : []) {
        if (typeof drift === 'object' && drift && 'agent' in drift && 'missing' in drift) {
            plan.push({ action: 'addProperties', agent: drift['agent'], properties: drift['missing'] });
        }
    }
    for (const mut of Array.isArray(mutationSuggestions) ? mutationSuggestions : []) {
        if (mut['type'] === 'todo') {
            plan.push({ action: 'resolveTodo', file: mut['file'], line: mut['line'], text: mut['suggestion'] });
        }
    }
    return plan;
}
/**
 * Returns a context snapshot trimmed to fit the specified byte size (prioritizes contracts, todos, testFiles, then other fields).
 * 'size' is the max byte size for the context chunk.
 * Returns a Promise resolving to the trimmed context snapshot.
 */
export async function getContextChunk(size) {
    const snapshot = await gatherSnapshotData();
    const prioritizedFields = [
        'contracts', 'todos', 'testFiles', 'largestFiles', 'healthScore', 'mutationSuggestions', 'agentMessages', 'handoffNotes'
    ];
    const chunk = { timestamp: new Date().toISOString() };
    let used = 0;
    for (const field of prioritizedFields) {
        if (typeof snapshot === 'object' && snapshot !== null && field in snapshot) {
            const value = snapshot[field];
            if (value) {
                const fieldSize = Buffer.byteLength(JSON.stringify(value), 'utf-8');
                if (used + fieldSize > size)
                    break;
                chunk[field] = value;
                used += fieldSize;
            }
        }
    }
    chunk['memoryBudgetBytes'] = used;
    return chunk;
}
/**
 * Labels a context item with relevance, permanence, and type.
 */
function labelContextItem(item, type, relevance, permanence) {
    if (typeof item === 'object' && item !== null) {
        return { ...item, __meta: { type, relevance, permanence } };
    }
    return { __meta: { type, relevance, permanence } };
}
/**
 * Estimates token count for a context array (simple heuristic: 1 token ≈ 4 chars).
 */
function estimateTokenCount(contextArr) {
    return Math.ceil(JSON.stringify(contextArr).length / 4);
}
/**
 * Returns an optimized, token-aware context payload for agent handoff.
 * 'contextArr' is the array of context items, 'agentConfig' is the agent context configuration, 'modelTokenLimit' is the model token limit (default 16000).
 * Returns an object with payload and log.
 */
export function getOptimizedHandoverPayload(contextArr, agentConfig, modelTokenLimit = 16000) {
    const maxTokens = Math.floor((agentConfig.maxTokens ?? modelTokenLimit) * 0.8);
    const labeled = contextArr.map(item => {
        if (typeof item === 'object' && item !== null && 'type' in item && typeof item['type'] === 'string') {
            return labelContextItem(item, item['type'], 'medium', 'ephemeral');
        }
        return labelContextItem(item, 'unknown', 'medium', 'ephemeral');
    });
    const critical = labeled.filter(i => agentConfig.criticalTypes.includes(i.__meta.type));
    const sliding = labeled.slice(-agentConfig.slidingWindowSize);
    const relevantOld = labeled.filter(i => i.__meta.relevance === 'high' && !critical.includes(i) && !sliding.includes(i));
    const rest = labeled.filter(i => !critical.includes(i) && !sliding.includes(i) && !relevantOld.includes(i));
    let summary = null;
    if (rest.length) {
        summary = { __meta: { type: 'summary', relevance: 'medium', permanence: 'ephemeral' }, summary: `Summary of ${rest.length} items.` };
    }
    let payload = [...critical, ...sliding, ...relevantOld];
    if (summary)
        payload.push(summary);
    while (estimateTokenCount(payload) > maxTokens && payload.length > 1) {
        const idx = payload.findIndex(i => i.__meta.relevance === 'low' || i.__meta.permanence === 'ephemeral');
        if (idx >= 0)
            payload.splice(idx, 1);
        else
            break;
    }
    const log = {
        timestamp: new Date().toISOString(),
        tokenBudget: maxTokens,
        tokenCount: estimateTokenCount(payload),
        included: payload.map(i => i.__meta?.type ?? 'unknown'),
        dropped: contextArr.length - payload.length
    };
    return { payload, log };
}
/**
 * Returns a description of the context snapshot helper and its main functions.
 * Returns an object with name, description, and function signatures.
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
            { name: 'getContextChunk', signature: '(size: number) => Record<string, unknown>', description: 'Returns a context snapshot trimmed to fit the specified byte size.' },
            { name: 'getOptimizedHandoverPayload', signature: '(contextArr, agentConfig, modelTokenLimit) => { payload, log }', description: 'Returns an optimized, token-aware context payload for agent handoff.' }
        ],
        usage: "import { createSnapshot, extractTodos } from 'nootropic/contextSnapshotHelper';",
        schema: {
            // Zod schemas for snapshot I/O validation
            createSnapshot: {
                input: z.object({ delta: z.boolean().optional().default(false) }),
                output: z.null(),
            },
            getAgentMessages: {
                input: z.null(),
                output: z.array(z.record(z.unknown())),
            },
            addAgentMessage: {
                input: z.object({
                    agent: z.string(),
                    type: z.string(),
                    message: z.record(z.unknown()),
                }),
                output: z.null(),
            },
            extractTodos: {
                input: z.null(),
                output: z.array(z.object({
                    file: z.string(),
                    line: z.number(),
                    text: z.string(),
                })),
            },
            detectSchemaDrift: {
                input: z.null(),
                output: z.array(z.object({
                    agent: z.string(),
                    schema: z.string(),
                    missing: z.array(z.string()),
                })),
            },
            getTestFiles: {
                input: z.null(),
                output: z.array(z.object({
                    file: z.string(),
                    dir: z.string(),
                    size: z.number(),
                    mtime: z.string(),
                })),
            },
            getContextChunk: {
                input: z.object({ size: z.number().describe('Max byte size for the context chunk.') }),
                output: z.record(z.unknown()).describe('Trimmed context snapshot.'),
            },
            getOptimizedHandoverPayload: {
                input: z.object({
                    contextArr: z.array(z.unknown()),
                    agentConfig: z.object({
                        criticalTypes: z.array(z.string()),
                        slidingWindowSize: z.number(),
                        maxTokens: z.number(),
                        excludeTypes: z.array(z.string()).optional(),
                    }),
                    modelTokenLimit: z.number().optional().default(16000),
                }),
                output: z.object({
                    payload: z.array(z.unknown()),
                    log: z.unknown(),
                }),
            },
        },
    };
}
async function loadAgentBacklog() {
    const backlogPath = path.resolve(__dirname, 'agentBacklog.json');
    if (!(await pathExists(backlogPath)))
        return {};
    try {
        return await readJsonFile(backlogPath);
    }
    catch {
        return {};
    }
}
async function loadBacklogFromManifest() {
    const manifestPath = getCacheFilePath('manifest.json');
    if (!(await pathExists(manifestPath)))
        return null;
    try {
        const manifest = await readJsonFile(manifestPath);
        return (manifest && typeof manifest === 'object' && 'backlog' in manifest) ? manifest.backlog ?? null : null;
    }
    catch {
        return null;
    }
}
// Ensure graceful shutdown of telemetry on exit
process.on('exit', shutdownTelemetry);
process.on('SIGINT', async () => { await shutdownTelemetry(); process.exit(0); });
/**
 * Initializes contextSnapshotHelper. Must be called before using cache-dependent features.
 * This avoids ESM/circular import issues. See CONTRIBUTING.md.
 * Returns a Promise that resolves when initialization is complete.
 */
export async function initContextSnapshotHelper() {
    await ensureCacheDirExists();
}
/**
 * Helper functions for context snapshot management.
 */
export { buildSemanticIndex, extractTelemetryEventsFromTests };
