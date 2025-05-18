import { z } from 'zod';
// Zod schema for plugin registry entry
export const PluginRegistryEntrySchema = z.object({
    name: z.string(),
    type: z.string(),
    entry: z.string(),
    meta: z.record(z.string(), z.unknown()).optional(),
    timestamp: z.string(),
    feedbackAggregate: z.unknown().optional()
});
// Canonical Zod schema for plugin modules
export const PluginModuleSchema = z.object({
    name: z.string(),
    describe: z.function().args().returns(z.unknown()),
    run: z.function().args(z.any()).returns(z.any()).optional(),
    // Allow additional properties
}).catchall(z.unknown());
