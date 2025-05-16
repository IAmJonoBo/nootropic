// Node.js globals for CLI context
// Use process and console directly (no need to declare)
// AI-Helpers is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { readJsonSafe, writeJsonSafe, getOrInitJson, esmEntrypointCheck } from './utils.js';
import { AGENT_PROFILES_PATH } from './paths.js';
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
        .filter(([, p]) => requirements.every(r => (p && typeof p === 'object' && (p.capabilities || []).includes(r) || (p.tags || []).includes(r))))
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
            printHelp('pnpm tsx AI-Helpers/agentProfileRegistry.ts register <agent> <profileJson>', 'Register, list, or recommend agent profiles.');
            process.exit(0);
        }
        try {
            if (cmd === 'register') {
                const [agent, ...profile] = args;
                await registerProfile(agent, profile.length ? JSON.parse(profile.join(' ')) : {});
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
                printHelp('pnpm tsx AI-Helpers/agentProfileRegistry.ts register <agent> <profileJson>', 'Register, list, or recommend agent profiles.');
                process.exit(1);
            }
        }
        catch (e) {
            handleCliError(e);
        }
    })();
}
export { registerProfile, listProfiles, recommendAgents };
