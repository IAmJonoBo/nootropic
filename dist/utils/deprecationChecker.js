// Utility: deprecationChecker.ts
// Checks for deprecated APIs/adapters and warns the user.
// Usage: import { checkDeprecations } from './utils/deprecationChecker'; checkDeprecations(currentVersion);
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const deprecations = require('../docs/deprecations.json');
export function checkDeprecations(currentVersion) {
    if (!deprecations || !Array.isArray(deprecations.entries))
        return;
    for (const entry of deprecations.entries) {
        if (entry.version === currentVersion && entry.deprecated) {
            console.warn(`Deprecation warning: ${entry.message}`);
            if (entry.migration) {
                console.warn(`Migration advice: ${entry.migration}`);
            }
        }
    }
}
