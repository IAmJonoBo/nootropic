// Node.js globals for CLI context
// Use process and console directly (no need to declare)
// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// @ts-ignore
import { readJsonSafe, writeJsonSafe, getOrInitJson, esmEntrypointCheck } from './utils.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGENT_PROFILES_PATH = path.join(__dirname, 'agent-profiles.json');
// @ts-ignore
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
// --- Register or update an agent profile ---
async function registerProfile(agent, profile) {
    const profiles = await getOrInitJson(AGENT_PROFILES_PATH, {});
    const safeProfile = (profile && typeof profile === 'object' && !Array.isArray(profile)) ? profile : {};
    profiles[agent] = { name: agent, ...safeProfile, updated: new Date().toISOString() };
    await writeJsonSafe(AGENT_PROFILES_PATH, profiles);
}
// --- List all agent profiles ---
async function listProfiles() {
    return await readJsonSafe(AGENT_PROFILES_PATH, {});
}
// --- Recommend agents for a task (by capability/tag) ---
async function recommendAgents(requirements = []) {
    const profiles = await listProfiles();
    return Object.entries(profiles)
        .filter(([, p]) => requirements.every(r => (p && typeof p === 'object' && (p.capabilities ?? []).includes(r) || (p.tags ?? []).includes(r))))
        .map(([agent, p]) => {
        const safeProfile = (p && typeof p === 'object' && !Array.isArray(p)) ? p : {};
        return { agent, profile: safeProfile };
    });
}
// --- ESM-compatible CLI entrypoint ---
if (esmEntrypointCheck(import.meta.url)) {
    (async () => {
        const { args } = parseArgs(process.argv);
        const cmd = args[0];
        if (cmd === 'help' || args.includes('--help')) {
            printHelp('pnpm tsx nootropic/agentProfileRegistry.ts register <agent> <profileJson>', 'Register, list, or recommend agent profiles.');
            process.exit(0);
        }
        try {
            if (cmd === 'register') {
                const [agent, ...profile] = args;
                await registerProfile((agent ?? '').toString(), profile.length ? JSON.parse(profile.join(' ')) : {});
                console.log('Profile registered.');
            }
            else if (cmd === 'list') {
                console.log(JSON.stringify(await listProfiles(), null, 2));
            }
            else if (cmd === 'recommend') {
                const requirements = args;
                console.log(JSON.stringify(await recommendAgents(requirements), null, 2));
            }
            else {
                printHelp('pnpm tsx nootropic/agentProfileRegistry.ts register <agent> <profileJson>', 'Register, list, or recommend agent profiles.');
                process.exit(1);
            }
        }
        catch (e) {
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
