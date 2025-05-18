/**
 * Returns a description of the agents module and its exports.
 */
export async function init() {}
export async function shutdown() {}
export async function reload() {}
export async function health() { return { status: 'ok', timestamp: new Date().toISOString() }; }
export async function describe() {
  return {
    name: 'agents',
    description: 'Stub lifecycle hooks for registry compliance.',
    promptTemplates: [],
    schema: {}
  };
}

// Removed all agent imports and registry import to avoid side effects and circular dependencies.

const AgentsCapability = {
  name: 'agents',
  describe,
  schema: {}
};

export default AgentsCapability;

export * from './BaseAgent.js';
// Add additional agent exports here as new agents are added

export const schema = {}; 