import type { Capability } from '../../capabilities/Capability.js';
/**
 * Checks for updates to the nootropic package and notifies the user via CLI.
 * Dynamic boundary: uses require to load package.json for maximal compatibility (avoids ESM/CJS issues).
 */
export declare function checkForUpdates(): void;
/**
 * updateNotifierCapability: Notifies users of available package updates. Implements Capability for registry/discoverability.
 */
declare const updateNotifierCapability: Capability;
export default updateNotifierCapability;
