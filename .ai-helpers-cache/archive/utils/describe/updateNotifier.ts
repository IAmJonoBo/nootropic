// Utility: updateNotifier.ts
// Checks for updates to the nootropic package and notifies the user via CLI.
// Usage: import updateNotifierCapability from './utils/describe/updateNotifier'; updateNotifierCapability.checkForUpdates();

// @ts-expect-error TS(7016): Could not find a declaration file for module 'upda... Remove this comment to see the full error message
import updateNotifier from 'update-notifier';
// @ts-expect-error TS(6196): 'HealthStatus' is declared but never used.
import type { Capability, HealthStatus, CapabilityDescribe } from '../../capabilities/Capability.js';

// Use dynamic import for package.json to avoid ESM parsing errors
let pkg: unknown = {};
try {
  pkg = await import('../../package.json', { assert: { type: 'json' } });
  // @ts-expect-error TS(2571): Object is of type 'unknown'.
  pkg = pkg.default ?? pkg;
} catch {}

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
      // @ts-expect-error TS(2322): Type '{ name: string; description: string; methods... Remove this comment to see the full error message
      schema: {
        checkForUpdates: {
          input: { type: 'null', description: 'No input required' },
          output: { type: 'null', description: 'No output (side effect: CLI notification)' }
        }
      },
      // @ts-expect-error TS(2695): Left side of comma operator is unused and has no s... Remove this comment to see the full error message
      license: 'MIT',
      // @ts-expect-error TS(2304): Cannot find name 'isOpenSource'.
      isOpenSource: true,
      // @ts-expect-error TS(2304): Cannot find name 'usage'.
      usage: "import updateNotifierCapability from 'nootropic/utils/describe/updateNotifier'; updateNotifierCapability.checkForUpdates();",
      // @ts-expect-error TS(2304): Cannot find name 'docsFirst'.
      docsFirst: true,
      // @ts-expect-error TS(2304): Cannot find name 'aiFriendlyDocs'.
      aiFriendlyDocs: true,
      // @ts-expect-error TS(2304): Cannot find name 'promptTemplates'.
      promptTemplates: [
        {
          name: 'Check for Updates',
          description: 'Prompt for instructing the agent or LLM to check for available package updates and notify the user.',
          template: 'Check if there are any updates available for the nootropic package. If an update is found, notify the user with the new version and changelog.',
          usage: 'Used by checkForUpdates to trigger an update check and notification.'
        }
      ],
      // @ts-expect-error TS(2304): Cannot find name 'references'.
      references: [
        'https://www.npmjs.com/package/update-notifier'
      ]
    };
  },
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  },
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  async init(): Promise<void> {
    // No-op for now
  }
};

export function checkForUpdates() {
  const notifier = updateNotifier({ pkg });
  notifier.notify({ defer: false });
}
// Attach to capability for registry use
// @ts-expect-error TS(2339): Property 'checkForUpdates' does not exist on type ... Remove this comment to see the full error message
updateNotifierCapability.checkForUpdates = checkForUpdates;

export default updateNotifierCapability; 