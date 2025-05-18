import { z } from 'zod';
export declare const PluginRegistryEntrySchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodString;
    entry: z.ZodString;
    meta: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    timestamp: z.ZodString;
    feedbackAggregate: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    type: string;
    timestamp: string;
    name: string;
    entry: string;
    meta?: Record<string, unknown> | undefined;
    feedbackAggregate?: unknown;
}, {
    type: string;
    timestamp: string;
    name: string;
    entry: string;
    meta?: Record<string, unknown> | undefined;
    feedbackAggregate?: unknown;
}>;
export type PluginRegistryEntry = z.infer<typeof PluginRegistryEntrySchema>;
export declare const PluginModuleSchema: z.ZodObject<{
    name: z.ZodString;
    describe: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    run: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodAny], z.ZodUnknown>, z.ZodAny>>;
}, "strip", z.ZodUnknown, z.objectOutputType<{
    name: z.ZodString;
    describe: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    run: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodAny], z.ZodUnknown>, z.ZodAny>>;
}, z.ZodUnknown, "strip">, z.objectInputType<{
    name: z.ZodString;
    describe: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    run: z.ZodOptional<z.ZodFunction<z.ZodTuple<[z.ZodAny], z.ZodUnknown>, z.ZodAny>>;
}, z.ZodUnknown, "strip">>;
export type PluginModule = z.infer<typeof PluginModuleSchema>;
