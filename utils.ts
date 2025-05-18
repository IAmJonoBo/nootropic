// nootropic shared utilities for all helpers. AI-native, ESM-compatible, robust.
//
// This file is intentionally reserved for cross-domain, foundational helpers that do not fit any specific domain subfolder (context, event, security, testing, describe, plugin, feedback).
// All domain-specific helpers must be placed in their respective subfolders in utils/.
// See README and ROADMAP for modularization details.

import { promises as fsp } from 'fs';
import path from 'path';
import { rrdir } from 'rrdir';
// @ts-ignore
// import { getPlugins } from './pluginLoader.js';
import { readJsonSafe, writeJsonSafe, getOrInitJson } from './fileHelpers.js';

// --- Error logger ---
function errorLogger(context: string, error: unknown) {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    // Only log error.message and stack if available
    console.error(`[nootropic ERROR] ${context}:`, (error as { stack?: string; message?: string }).stack ?? (error as { message?: string }).message);
  } else {
    console.error(`[nootropic ERROR] ${context}:`, error);
  }
}

// --- ESM entrypoint check ---
function esmEntrypointCheck(importMetaUrl: string): boolean {
  return importMetaUrl === `file://${process.argv[1]}`;
}

/**
 * Recursively lists all files in a directory (returns absolute paths).
 */
async function listFilesRecursive(dirPath: string): Promise<string[]> {
  const entries: { path: string; directory: boolean }[] = [];
  for await (const e of rrdir(dirPath)) {
    entries.push(e as { path: string; directory: boolean });
  }
  return entries.filter((e) => !e.directory).map((e) => e.path);
}

/**
 * Loads nootropic config from .nootropicrc (JSON) or nootropic.config.ts, with fallback to defaults.
 * Precedence: CLI > env > config file > defaults (config merging is handled by caller).
 */
async function loadAiHelpersConfig<T = Record<string, unknown>>(defaults: T = {} as T): Promise<T> {
  const cwd = process.cwd();
  const jsonPath = path.join(cwd, '.nootropicrc');
  const tsPath = path.join(cwd, 'nootropic.config.ts');
  let config: T = { ...defaults };
  // Try JSON config
  try {
    const json = await readJsonSafe<T>(jsonPath, undefined);
    if (json && typeof json === 'object') config = { ...config, ...json };
  } catch {}
  // Try TS config (ESM)
  try {
    if (await fsp.access(tsPath).then(() => true).catch(() => false)) {
      const tsConfig = await import(tsPath);
      if (tsConfig && typeof tsConfig === 'object' && tsConfig.default) {
        config = { ...config, ...tsConfig.default };
      } else if (tsConfig && typeof tsConfig === 'object') {
        config = { ...config, ...tsConfig };
      }
    }
  } catch {}
  return config;
}

/**
 * Aggregates all describe() outputs from core modules, agents, adapters, plugins, and utilities, and writes to .nootropic-cache/describe-registry.json.
 * For CI/code/doc sync and agent/LLM introspection.
 */
export async function aggregateDescribeRegistry() {
  const targetDirs = [
    './agents',
    './adapters',
    './plugins',
    './utils/describe',
    './utils/plugin',
    './utils/security',
    './utils/feedback',
  ];
  const results: unknown[] = [];
  const seenNames = new Set<string>();
  for (const dir of targetDirs) {
    let files: string[] = [];
    try {
      files = await listFilesRecursive(dir).catch(() => []);
    } catch { files = []; }
    for (const file of files) {
      if (!file.endsWith('.js') && !file.endsWith('.ts')) continue;
      try {
        const mod = await import(file);
        // If default export is a Capability, use its describe
        if (mod.default && typeof mod.default.describe === 'function') {
          const desc = mod.default.describe();
          if (desc && typeof desc === 'object' && 'name' in desc && 'description' in desc && typeof desc.name === 'string' && typeof desc.description === 'string' && !seenNames.has(desc.name)) {
            results.push(desc);
            seenNames.add(desc.name);
          }
        }
        // If named export describe
        if (typeof mod.describe === 'function') {
          const desc = mod.describe();
          if (desc && typeof desc === 'object' && 'name' in desc && 'description' in desc && typeof desc.name === 'string' && typeof desc.description === 'string' && !seenNames.has(desc.name)) {
            results.push(desc);
            seenNames.add(desc.name);
          }
        }
      } catch {
        // Optionally log in debug mode
      }
    }
  }
  // Plugin aggregation is currently disabled. To enable, uncomment the following lines and ensure getPlugins() is imported and available.
  /*
  try {
    const plugins = await getPlugins();
    for (const plugin of plugins) {
      if (typeof plugin.describe === 'function') {
        const desc = plugin.describe();
        if (desc && typeof desc === 'object' && 'name' in desc && 'description' in desc && typeof desc.name === 'string' && typeof desc.description === 'string' && !seenNames.has(desc.name)) {
          results.push(desc);
          seenNames.add(desc.name);
        }
      }
    }
  } catch {}
  */
  // Validate required fields
  const validated = results.filter(d => d && typeof d === 'object' && 'name' in d && 'description' in d && typeof d.name === 'string' && typeof d.description === 'string');
  await writeJsonSafe('.nootropic-cache/describe-registry.json', validated);
  return validated;
}

/**
 * Returns a description of the nootropic utilities and their usage.
 *
 * Note: The linter may warn about the '>' character in signature fields (e.g., Promise<string[]>). Attempts to escape this do not resolve the warning due to TSDoc parser limitations in string fields. These warnings can be safely ignored for now. See CONTRIBUTING.md for details.
 */
export function describe() {
  return {
    name: 'utils',
    description: 'Shared utilities for file I/O, error logging, and ESM entrypoint checks. Follows docs-first workflow and AI/LLM-friendly documentation best practices. All exports must have TSDoc comments, and all changes must be reflected in documentation and describe() output. The describe() registry is validated in CI.',
    functions: [
      { name: 'errorLogger', signature: '(context, error) => void', description: 'Logs errors in a consistent format.' },
      { name: 'esmEntrypointCheck', signature: '(importMetaUrl) => boolean', description: 'Checks if the current file is the ESM entrypoint.' },
      { name: 'listFilesRecursive', signature: 'async (dirPath) => Promise<string[\]>\>', description: 'Recursively lists all files in a directory.' },
      { name: 'loadAiHelpersConfig', signature: 'async (defaults) => Promise<T>', description: 'Loads nootropic config from .nootropicrc (JSON) or nootropic.config.ts, with fallback to defaults.' },
      { name: 'aggregateDescribeRegistry', signature: 'async () => Promise<unknown[\]>\>', description: 'Aggregates all describe() outputs and writes to .nootropic-cache/describe-registry.json.' },
      { name: 'writeFileSafe', signature: 'async (filePath, data) => Promise<void>', description: 'Writes a file safely with robust error handling.' },
      { name: 'findFilePath', signature: '(filename, dirs) => Promise<string | null>', description: 'Recursively searches for a file by name in given directories.' },
      { name: 'generateTodoPatch', signature: '(original, patched, file, line) => string', description: 'Generates a patch for TODO/FIXME resolution.' },
      { name: 'PatchInfo', signature: 'interface', description: 'Patch info type for patch generation utilities.' }
    ],
    usage: "import { readJsonSafe, writeJsonSafe, errorLogger } from 'nootropic';",
    schema: {
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
      },
      aggregateDescribeRegistry: {
        input: {},
        output: {
          type: 'array',
          items: { type: 'object' }
        }
      },
      writeFileSafe: {
        input: {
          type: 'object',
          properties: {
            filePath: { type: 'string' },
            data: { type: 'string' }
          },
          required: ['filePath', 'data']
        },
        output: { type: 'null' }
      },
      findFilePath: {
        input: {
          type: 'object',
          properties: {
            filename: { type: 'string' },
            dirs: { type: 'array', items: { type: 'string' } }
          },
          required: ['filename', 'dirs']
        },
        output: { type: 'string' }
      },
      generateTodoPatch: {
        input: {
          type: 'object',
          properties: {
            original: { type: 'string' },
            patched: { type: 'string' },
            file: { type: 'string' },
            line: { type: 'number' }
          },
          required: ['original', 'patched', 'file', 'line']
        },
        output: { type: 'string' }
      },
      PatchInfo: {
        type: 'object',
        properties: {
          file: { type: 'string' },
          line: { type: 'number' },
          patchFile: { type: 'string' },
          type: { type: 'string' }
        },
        required: ['file', 'patchFile', 'type']
      }
    },
    docsFirst: true,
    aiFriendlyDocs: true,
    describeRegistry: true,
    bestPractices: [
      'Strict TypeScript',
      'Type-safe event-driven patterns',
      'Automated documentation (TSDoc, TypeDoc, describe())',
      'Docs-first engineering',
      'CI enforcement of docs/code sync',
    ],
    references: [
      'https://benhouston3d.com/blog/crafting-readmes-for-ai',
      'https://www.octopipe.com/blog/docs-first-engineering-workflow',
      'https://medium.com/@nikhithsomasani/best-practices-for-using-typescript-in-2025-a-guide-for-experienced-developers-4fca1cfdf052',
      'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3'
    ]
  };
}

export {
  errorLogger,
  esmEntrypointCheck,
  readJsonSafe,
  writeJsonSafe,
  getOrInitJson,
  listFilesRecursive,
  loadAiHelpersConfig
}; 