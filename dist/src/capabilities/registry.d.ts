import type { Capability, CapabilityDescribe } from './Capability.js';
import { z } from 'zod';
export declare const CapabilitySchema: z.ZodObject<{
    name: z.ZodString;
    describe: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    health: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodAny>>;
}, "strip", z.ZodUnknown, z.objectOutputType<{
    name: z.ZodString;
    describe: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    health: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodAny>>;
}, z.ZodUnknown, "strip">, z.objectInputType<{
    name: z.ZodString;
    describe: z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodUnknown>;
    health: z.ZodOptional<z.ZodFunction<z.ZodTuple<[], z.ZodUnknown>, z.ZodAny>>;
}, z.ZodUnknown, "strip">>;
/**
 * Centralized registry for all Capability-compliant agents, plugins, adapters, and tools.
 * Enforces describe() compliance and provides aggregation for LLM/agent discovery.
 */
declare class CapabilityRegistry {
    private readonly capabilities;
    /**
     * Register a new capability. Throws if name is not unique or schema is invalid.
     */
    register(cap: Capability): void;
    /**
     * Get a capability by name.
     */
    get(name: string): Capability | undefined;
    /**
     * List all registered capabilities.
     */
    list(): Capability[];
    /**
     * Aggregate all describe() outputs for registry/discovery.
     */
    aggregateDescribe(): CapabilityDescribe[];
}
declare const registry: CapabilityRegistry;
export default registry;
