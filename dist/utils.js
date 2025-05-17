// nootropic shared utilities for all helpers. AI-native, ESM-compatible, robust.
import { promises as fsp } from 'fs';
import path from 'path';
import { rrdir } from 'rrdir';
// --- Error logger ---
function errorLogger(context, error) {
    if (error instanceof Error) {
        console.error(`[nootropic ERROR] ${context}:`, error.stack ?? error.message);
    }
    else {
        console.error(`[nootropic ERROR] ${context}:`, error);
    }
}
// --- ESM entrypoint check ---
function esmEntrypointCheck(importMetaUrl) {
    return importMetaUrl === `file://${process.argv[1]}`;
}
// --- Async Read JSON file safely ---
async function readJsonSafe(filePath, fallback = null) {
    try {
        await fsp.access(filePath);
        return JSON.parse(await fsp.readFile(filePath, 'utf-8'));
    }
    catch (e) {
        errorLogger(`Failed to read JSON (async): ${filePath}`, e);
        return fallback;
    }
}
// --- Async Write JSON file safely ---
async function writeJsonSafe(filePath, data) {
    try {
        await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
    }
    catch (e) {
        errorLogger(`Failed to write JSON (async): ${filePath}`, e);
    }
}
// --- Async Get or initialize JSON file ---
async function getOrInitJson(filePath, init) {
    try {
        await fsp.access(filePath);
        return await readJsonSafe(filePath, init);
    }
    catch {
        await writeJsonSafe(filePath, init);
        return init;
    }
}
// --- Ensure directory exists ---
async function ensureDirExists(dirPath) {
    try {
        await fsp.mkdir(dirPath, { recursive: true });
    }
    catch (e) {
        if (e?.code !== 'EEXIST')
            errorLogger(`Failed to ensure dir: ${dirPath}`, e);
    }
}
// --- List files in directory ---
async function listFilesInDir(dirPath) {
    try {
        return await fsp.readdir(dirPath);
    }
    catch (e) {
        errorLogger(`Failed to list files in dir: ${dirPath}`, e);
        return [];
    }
}
/**
 * Recursively lists all files in a directory (returns absolute paths).
 */
async function listFilesRecursive(dirPath) {
    const entries = [];
    for await (const e of rrdir(dirPath)) {
        entries.push(e);
    }
    return entries.filter((e) => !e.directory).map((e) => e.path);
}
/**
 * Loads nootropic config from .nootropicrc (JSON) or nootropic.config.ts, with fallback to defaults.
 * Precedence: CLI > env > config file > defaults (config merging is handled by caller).
 */
export async function loadAiHelpersConfig(defaults = {}) {
    const cwd = process.cwd();
    const jsonPath = path.join(cwd, '.nootropicrc');
    const tsPath = path.join(cwd, 'nootropic.config.ts');
    let config = { ...defaults };
    // Try JSON config
    try {
        const json = await readJsonSafe(jsonPath, undefined);
        if (json && typeof json === 'object')
            config = { ...config, ...json };
    }
    catch { }
    // Try TS config (ESM)
    try {
        if (await fsp.access(tsPath).then(() => true).catch(() => false)) {
            const tsConfig = await import(tsPath);
            if (tsConfig && typeof tsConfig === 'object' && tsConfig.default) {
                config = { ...config, ...tsConfig.default };
            }
            else if (tsConfig && typeof tsConfig === 'object') {
                config = { ...config, ...tsConfig };
            }
        }
    }
    catch { }
    return config;
}
/**
 * Returns a description of the nootropic utilities and their usage.
 */
export function describe() {
    return {
        name: 'utils',
        description: 'Shared utilities for file I/O, error logging, and ESM entrypoint checks.',
        functions: [
            { name: 'readJsonSafe', signature: 'async (filePath, fallback) => Promise<T>', description: 'Reads a JSON file safely, returns fallback on error.' },
            { name: 'writeJsonSafe', signature: 'async (filePath, data) => Promise<void>', description: 'Writes data to a JSON file safely.' },
            { name: 'getOrInitJson', signature: 'async (filePath, init) => Promise<T>', description: 'Gets or initializes a JSON file.' },
            { name: 'errorLogger', signature: '(context, error) => void', description: 'Logs errors in a consistent format.' },
            { name: 'esmEntrypointCheck', signature: '(importMetaUrl) => boolean', description: 'Checks if the current file is the ESM entrypoint.' },
            { name: 'ensureDirExists', signature: 'async (dirPath) => Promise<void>', description: 'Ensures a directory exists.' },
            { name: 'listFilesInDir', signature: 'async (dirPath) => Promise<string[]>', description: 'Lists files in a directory.' },
            { name: 'listFilesRecursive', signature: 'async (dirPath) => Promise<string[]>', description: 'Recursively lists all files in a directory.' },
            { name: 'loadAiHelpersConfig', signature: 'async (defaults) => Promise<T>', description: 'Loads nootropic config from .nootropicrc (JSON) or nootropic.config.ts, with fallback to defaults.' }
        ],
        usage: "import { readJsonSafe, writeJsonSafe, errorLogger } from 'nootropic';",
        schema: {
            readJsonSafe: {
                input: {
                    type: 'object',
                    properties: {
                        filePath: { type: 'string' },
                        fallback: { type: ['object', 'null'], description: 'Fallback value if file read fails.' }
                    },
                    required: ['filePath']
                },
                output: { type: 'object', description: 'Parsed JSON or fallback.' }
            },
            writeJsonSafe: {
                input: {
                    type: 'object',
                    properties: {
                        filePath: { type: 'string' },
                        data: { type: 'object' }
                    },
                    required: ['filePath', 'data']
                },
                output: { type: 'null' }
            },
            getOrInitJson: {
                input: {
                    type: 'object',
                    properties: {
                        filePath: { type: 'string' },
                        init: { type: 'object' }
                    },
                    required: ['filePath', 'init']
                },
                output: { type: 'object' }
            },
            errorLogger: {
                input: {
                    type: 'object',
                    properties: {
                        context: { type: 'string' },
                        error: { type: 'object' }
                    },
                    required: ['context', 'error']
                },
                output: { type: 'null' }
            },
            esmEntrypointCheck: {
                input: {
                    type: 'object',
                    properties: {
                        importMetaUrl: { type: 'string' }
                    },
                    required: ['importMetaUrl']
                },
                output: { type: 'boolean' }
            },
            ensureDirExists: {
                input: {
                    type: 'object',
                    properties: {
                        dirPath: { type: 'string' }
                    },
                    required: ['dirPath']
                },
                output: { type: 'null' }
            },
            listFilesInDir: {
                input: {
                    type: 'object',
                    properties: {
                        dirPath: { type: 'string' }
                    },
                    required: ['dirPath']
                },
                output: {
                    type: 'array',
                    items: { type: 'string' }
                }
            },
            listFilesRecursive: {
                input: {
                    type: 'object',
                    properties: {
                        dirPath: { type: 'string' }
                    },
                    required: ['dirPath']
                },
                output: {
                    type: 'array',
                    items: { type: 'string' }
                }
            },
            loadAiHelpersConfig: {
                input: {
                    type: 'object',
                    properties: {
                        defaults: { type: 'object' }
                    },
                    required: ['defaults']
                },
                output: { type: 'object' }
            }
        }
    };
}
export { readJsonSafe, writeJsonSafe, getOrInitJson, errorLogger, esmEntrypointCheck, ensureDirExists, listFilesInDir, listFilesRecursive };
