// @ts-ignore
import registry from '../../capabilities/registry.js';
// @ts-ignore
import { describe as eventDrivenMutationDescribe } from '../../contextMutationEngine.js';
/**
 * Returns all registered capabilities (including planned/in-progress stubs) for describe registry aggregation.
 */
export function describe() {
    // Aggregate all registry describes and explicitly add event-driven mutation suggestion traceability
    const registryDescribes = registry.aggregateDescribe();
    // Avoid duplicates if already present
    const names = new Set(registryDescribes.map(d => d.name));
    if (!names.has('event-driven mutation suggestion traceability')) {
        registryDescribes.push(eventDrivenMutationDescribe());
    }
    return registryDescribes;
}
export default { describe };
