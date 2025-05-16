// Node.js globals for CLI context
// Use process and console directly (no need to declare)
// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// @ts-expect-error TS(2459): Module '"./utils.js"' declares 'readJsonSafe' loca... Remove this comment to see the full error message
import { readJsonSafe, writeJsonSafe, getOrInitJson, esmEntrypointCheck } from './utils.js';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2307): Cannot find module 'url' or its corresponding type... Remove this comment to see the full error message
import { fileURLToPath } from 'url';
// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGENT_PROFILES_PATH = path.join(__dirname, 'agent-profiles.json');
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';

interface AgentProfile {
  name: string;
  capabilities?: string[];
  tags?: string[];
  updated?: string;
  [key: string]: unknown;
}

// --- Register or update an agent profile ---
async function registerProfile(agent: string, profile: AgentProfile) {
  const profiles: Record<string, AgentProfile> = await getOrInitJson(AGENT_PROFILES_PATH, {});
  const safeProfile = (profile && typeof profile === 'object' && !Array.isArray(profile)) ? profile : {};
  // @ts-expect-error TS(2454): Variable 'profiles' is used before being assigned.
  profiles[agent] = { name: agent, ...safeProfile, updated: new Date().toISOString() };
  // @ts-expect-error TS(2454): Variable 'profiles' is used before being assigned.
  await writeJsonSafe(AGENT_PROFILES_PATH, profiles);
}

// --- List all agent profiles ---
async function listProfiles(): Promise<Record<string, AgentProfile>> {
  return await readJsonSafe(AGENT_PROFILES_PATH, {});
}

// --- Recommend agents for a task (by capability/tag) ---
// @ts-expect-error TS(6133): 'requirements' is declared but its value is never ... Remove this comment to see the full error message
async function recommendAgents(requirements: string[] = []): Promise<{ agent: string; profile: AgentProfile }[]> {
  // @ts-expect-error TS(2304): Cannot find name 'profiles'.
  const profiles = await listProfiles();
  // @ts-expect-error TS(2304): Cannot find name 'profiles'.
  return Object.entries(profiles)
    // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
    .filter(([, p]) => requirements.every(r => (p && typeof p === 'object' && (p.capabilities ?? []).includes(r) || (p.tags ?? []).includes(r))))
    // @ts-expect-error TS(2364): The left-hand side of an assignment expression mus... Remove this comment to see the full error message
    .map(([agent, p]) => {
      // @ts-expect-error TS(2304): Cannot find name 'safeProfile'.
      const safeProfile = (p && typeof p === 'object' && !Array.isArray(p)) ? p : {};
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      return { agent, profile: safeProfile as AgentProfile };
    });
}

// --- ESM-compatible CLI entrypoint ---
// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
if (esmEntrypointCheck(import.meta.url)) {
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  (async () => {
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    const { args } = parseArgs(process.argv);
    // @ts-expect-error TS(2304): Cannot find name 'cmd'.
    const cmd = args[0];
    // @ts-expect-error TS(6133): 'cmd' is declared but its value is never read.
    if (cmd === 'help' || args.includes('--help')) {
      printHelp('pnpm tsx nootropic/agentProfileRegistry.ts register <agent> <profileJson>', 'Register, list, or recommend agent profiles.');
      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.exit(0);
    }
    try {
      // @ts-expect-error TS(2304): Cannot find name 'cmd'.
      if (cmd === 'register') {
        // @ts-expect-error TS(2304): Cannot find name 'args'.
        const [agent, ...profile] = args;
        await registerProfile((agent ?? '').toString(), profile.length ? JSON.parse(profile.join(' ')) : {});
        console.log('Profile registered.');
      // @ts-expect-error TS(2304): Cannot find name 'cmd'.
      } else if (cmd === 'list') {
        console.log(JSON.stringify(await listProfiles(), null, 2));
      // @ts-expect-error TS(2304): Cannot find name 'cmd'.
      } else if (cmd === 'recommend') {
        // @ts-expect-error TS(2304): Cannot find name 'args'.
        const requirements = args;
        console.log(JSON.stringify(await recommendAgents(requirements), null, 2));
      } else {
        printHelp('pnpm tsx nootropic/agentProfileRegistry.ts register <agent> <profileJson>', 'Register, list, or recommend agent profiles.');
        // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
        process.exit(1);
      }
    } catch (e) {
      handleCliError(e);
    }
  })();
}

/**
 * Returns a description of the agent profile registry plugin/capability.
 */
export function describe() {
  return {
    name: 'agentProfileRegistry',
    description: 'Registry for agent profiles and metadata. Planned: persistent agent metadata, dynamic discovery, lifecycle management, governance, and event hooks.',
    functions: [
      { name: 'registerProfile', signature: '(agent, profile) => void', description: 'Register or update an agent profile.' },
      { name: 'getProfiles', signature: '() => Profile[]', description: 'Get all registered agent profiles.' }
    ],
    usage: "pnpm tsx nootropic/agentProfileRegistry.ts register <agent> <profileJson>",
    schema: {
      registerProfile: {
        input: {
          type: 'object',
          properties: {
            agent: { type: 'string' },
            profile: { type: 'object' }
          },
          required: ['agent', 'profile']
        },
        output: { type: 'null' }
      },
      getProfiles: {
        input: { type: 'null' },
        output: { type: 'array', items: { type: 'object' } }
      }
    }
  };
}

export { registerProfile, listProfiles, recommendAgents }; 