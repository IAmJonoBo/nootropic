import { promises as fsp } from 'fs';
import { errorLogger } from '../../../utils.js';

/**
 * Ensures a directory exists (recursive, robust).
 */
export async function ensureDirExists(dirPath: string): Promise<void> {
  try {
    await fsp.mkdir(dirPath, { recursive: true });
  } catch (e) {
    if ((e as { code?: string })?.code !== 'EEXIST') errorLogger(`Failed to ensure dir: ${dirPath}`, e);
  }
}

/**
 * Lists all files in a directory (non-recursive).
 */
export async function listFilesInDir(dirPath: string): Promise<string[]> {
  try {
    return await fsp.readdir(dirPath);
  } catch (e) {
    errorLogger(`Failed to list files in dir: ${dirPath}`, e);
    return [];
  }
}

/**
 * Writes a file safely (string or object as JSON).
 */
export async function writeFileSafe(filePath: string, data: string | object): Promise<void> {
  try {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    await fsp.writeFile(filePath, content);
  } catch (e) {
    errorLogger(`Failed to write file safely: ${filePath}`, e);
    throw e;
  }
} 