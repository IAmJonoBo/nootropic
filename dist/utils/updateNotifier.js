// Utility: updateNotifier.ts
// Checks for updates to the nootropic package and notifies the user via CLI.
// Usage: import { checkForUpdates } from './utils/updateNotifier'; checkForUpdates();
import updateNotifier from 'update-notifier';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('../package.json');
export function checkForUpdates() {
    const notifier = updateNotifier({ pkg });
    notifier.notify({ defer: false });
}
