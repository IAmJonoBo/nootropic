/**
 * Shared Automation Helpers for nootropic scripts.
 *
 * Provides safe async JSON file read/write, robust JSON parsing/stringifying, and standardized error handling for automation scripts.
 *
 * LLM/AI-usage: All helpers are designed for robust, machine-usable automation and are safe for use in agent-driven workflows.
 * Extension: Add new helpers for automation scripts as needed.
 *
 * Example usage:
 *   import { readJsonFile, writeJsonFile, handleError } from '../utils/automationHelpers';
 *   const data = await readJsonFile('file.json');
 *   await writeJsonFile('file.json', data);
 *   handleError(e, args.json);
 *
 * Functions:
 *   - readJsonFile(path): Safe async JSON file read
 *   - writeJsonFile(path, data): Safe async JSON file write
 *   - safeParseJson(str): Robust JSON.parse with error handling
 *   - safeStringifyJson(obj): Robust JSON.stringify with fallback
 *   - handleError(e, asJson): Standardized error handler for scripts
 */
import fs from 'fs/promises';

/**
 * Safe async JSON file read.
 * 'path' is the file path. Returns the parsed JSON object.
 */
export async function readJsonFile(path: string): Promise<unknown> {
  try {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    // Propagate error for robust error handling
    throw e;
  }
}

/**
 * Safe async JSON file write.
 * 'path' is the file path. 'data' is the data to write.
 */
export async function writeJsonFile(path: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    // Propagate error for robust error handling
    throw e;
  }
}

/**
 * Robust JSON.parse with error handling.
 * 'str' is the JSON string. Returns the parsed object or null.
 */
export function safeParseJson(str: string): unknown {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

/**
 * Robust JSON.stringify with fallback.
 * 'obj' is the object to stringify. Returns the JSON string or empty string on error.
 */
export function safeStringifyJson(obj: unknown): string {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return '';
  }
}

/**
 * Standardized error handler for scripts.
 * 'e' is the error object. 'asJson' outputs as JSON if true.
 */
export function handleError(e: unknown, asJson = false): void {
  if (asJson) {
    if (typeof e === 'object' && e !== null && 'message' in e && typeof (e as { message: unknown }).message === 'string') {
      console.error(JSON.stringify({ error: (e as { message: string }).message }));
    } else {
      console.error(JSON.stringify({ error: String(e) }));
    }
  } else {
    if (typeof e === 'object' && e !== null) {
      const msg = 'message' in e && typeof (e as { message: unknown }).message === 'string' ? (e as { message: string }).message : String(e);
      const stack = 'stack' in e && typeof (e as { stack: unknown }).stack === 'string' ? (e as { stack: string }).stack : undefined;
      console.error(stack || msg);
    } else {
      console.error(String(e));
    }
  }
}

/** No-op lifecycle hook for registry compliance. */
export async function init() {}

/** No-op lifecycle hook for registry compliance. */
export async function shutdown() {}

/** No-op lifecycle hook for registry compliance. */
export async function reload() {}

/** Health check for automation helpers. */
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }

/** Describe automation helpers for registry compliance. */
export async function describe() { return { name: 'automationHelpers', description: 'Stub lifecycle hooks for registry compliance.' }; } 