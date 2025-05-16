// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2305): Module '"./internal.js"' has no exported member 'e... Remove this comment to see the full error message
import { ensureDirExists, listFilesInDir } from './internal.js';
import type { Capability, CapabilityDescribe, HealthStatus } from '../../capabilities/Capability.js';

/**
 * Returns the path to the nootropic cache directory.
 * This getter pattern avoids ReferenceError and circular import issues.
 */
export function getCacheDirPath(): string {
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  return path.join(process.cwd(), '.nootropic-cache');
}

/**
 * Ensures the nootropic cache directory exists.
 */
export async function ensureCacheDirExists() {
  await ensureDirExists(getCacheDirPath());
}

/**
 * Returns the path to a file in the nootropic cache directory.
 * If the path cannot be determined, logs a warning and falls back to process.cwd().
 */
export function getCacheFilePath(name: string): string {
  const dir = getCacheDirPath();
  if (!dir) {
     
    console.warn('[nootropic] Warning: getCacheDirPath() returned falsy. Falling back to process.cwd()/.nootropic-cache.');
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    return path.join(process.cwd(), '.nootropic-cache', name);
  }
  return path.join(dir, name);
}

/**
 * Lists all files in the nootropic cache directory.
 */
export async function listCacheFiles(): Promise<string[]> {
  await ensureCacheDirExists();
  return listFilesInDir(getCacheDirPath());
}

const cacheDirCapability: Capability = {
  name: 'cacheDir',
  describe(): CapabilityDescribe {
    return {
      name: 'cacheDir',
      description: 'Cache directory helpers for nootropic. Ensures, lists, and manages cache files. Registry-compliant.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/nootropic/nootropic',
      methods: [
        { name: 'ensureCacheDirExists', signature: '() => Promise<void>', description: 'Ensures the nootropic cache directory exists.' },
        { name: 'getCacheDirPath', signature: '() => string', description: 'Returns the path to the nootropic cache directory.' },
        { name: 'getCacheFilePath', signature: '(name: string) => string', description: 'Returns the path to a file in the cache directory.' },
        { name: 'listCacheFiles', signature: '() => Promise<string[]>', description: 'Lists all files in the cache directory.' }
      ],
      usage: "import cacheDirCapability, { getCacheDirPath } from 'nootropic/utils/context/cacheDir'; await cacheDirCapability.listCacheFiles();",
      // @ts-expect-error TS(2322): Type '{ name: string; description: string; license... Remove this comment to see the full error message
      docsFirst: true,
      aiFriendlyDocs: true,
      references: ['utils/context/contextManager.js']
    };
  },
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  },
};

export default cacheDirCapability; 