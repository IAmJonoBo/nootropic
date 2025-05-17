// Utility: updateNotifier.ts
// Checks for updates to the nootropic package and notifies the user via CLI.
// Usage: import updateNotifierCapability from './utils/describe/updateNotifier'; updateNotifierCapability.checkForUpdates();

import updateNotifier from 'update-notifier';
// @ts-ignore
import type { Capability, HealthStatus, CapabilityDescribe } from '../../capabilities/Capability.js';

/**
 * Checks for updates to the nootropic package and notifies the user via CLI.
 * Dynamic boundary: uses require to load package.json for maximal compatibility (avoids ESM/CJS issues).
 */
export function checkForUpdates() {
  let pkg: unknown = {};
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    pkg = require('../../package.json');
  } catch {}
  if (typeof pkg !== 'object' || pkg === null) return;
  const notifier = updateNotifier({ pkg: pkg as Record<string, unknown> });
  notifier.notify({ defer: false });
}

/**
 * updateNotifierCapability: Notifies users of available package updates. Implements Capability for registry/discoverability.
 */
const updateNotifierCapability: Capability = {
  name: 'updateNotifier',
  describe(): CapabilityDescribe {
    return {
      name: 'updateNotifier',
      description: 'Notifies users of available package updates via CLI. Useful for keeping nootropic up to date.',
      methods: [
        { name: 'checkForUpdates', signature: '() => void', description: 'Checks for updates and notifies the user via CLI.' }
      ],
      schema: {
        checkForUpdates: {
          input: { type: 'null', description: 'No input required' },
          output: { type: 'null', description: 'No output (side effect: CLI notification)' }
        }
      },
      license: 'MIT',
      isOpenSource: true,
      usage: "import updateNotifierCapability from 'nootropic/utils/describe/updateNotifier'; updateNotifierCapability.checkForUpdates();",
      docsFirst: true,
      aiFriendlyDocs: true,
      promptTemplates: [
        {
          name: 'Check for Updates',
          description: 'Prompt for instructing the agent or LLM to check for available package updates and notify the user.',
          template: 'Check if there are any updates available for the nootropic package. If an update is found, notify the user with the new version and changelog.',
          usage: 'Used by checkForUpdates to trigger an update check and notification.'
        }
      ],
      references: [
        'https://www.npmjs.com/package/update-notifier'
      ]
    };
  },
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  },
  async init(): Promise<void> {
    // No-op for now
  }
};

// Attach to capability for registry use
// @ts-expect-error TS2339: Dynamic property assignment for registry-driven capability; safe for LLM/AI and automation
updateNotifierCapability.checkForUpdates = checkForUpdates;

export default updateNotifierCapability; 