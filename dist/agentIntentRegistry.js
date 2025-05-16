// Node.js globals for CLI context
// Use process and console directly (no need to declare)
// AI-Helpers is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { readJsonSafe, writeJsonSafe } from './utils.js';
import { appendMemoryEvent } from './memoryLaneHelper.js';
import { AGENT_INTENT_PATH, AGENT_FEEDBACK_PATH } from './paths.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
// --- Register or update agent intent/plan ---
async function registerIntent(agent, intent, plan, context = {}) {
    let registry = {};
    if (await readJsonSafe(AGENT_INTENT_PATH)) {
        try {
            registry = JSON.parse(await readJsonSafe(AGENT_INTENT_PATH));
        }
        catch {
            registry = {};
        }
    }
    registry[agent] = { timestamp: new Date().toISOString(), intent, plan, context };
    await writeJsonSafe(AGENT_INTENT_PATH, registry);
    await appendMemoryEvent({ type: 'agentIntent', agent, intent, plan, context });
}
// --- Get all agent intents/plans ---
async function getIntents() {
    if (!await readJsonSafe(AGENT_INTENT_PATH))
        return {};
    return JSON.parse(await readJsonSafe(AGENT_INTENT_PATH));
}
// --- Submit agent feedback ---
async function submitFeedback(agent, feedback) {
    let feedbacks = [];
    if (await readJsonSafe(AGENT_FEEDBACK_PATH)) {
        try {
            feedbacks = JSON.parse(await readJsonSafe(AGENT_FEEDBACK_PATH));
        }
        catch {
            feedbacks = [];
        }
    }
    feedbacks.push({ timestamp: new Date().toISOString(), agent, feedback });
    await writeJsonSafe(AGENT_FEEDBACK_PATH, feedbacks);
    await appendMemoryEvent({ type: 'agentFeedback', agent, feedback });
}
// --- Get all feedback ---
async function getFeedback() {
    if (!await readJsonSafe(AGENT_FEEDBACK_PATH))
        return [];
    return JSON.parse(await readJsonSafe(AGENT_FEEDBACK_PATH));
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const [cmd, ...args] = parseArgs(process.argv).args;
        if (cmd === 'help' || args.includes('--help')) {
            printHelp('pnpm tsx AI-Helpers/agentIntentRegistry.ts register <agent> <intent> <planJson>', 'Register, list, or recommend agent intents.');
            process.exit(0);
        }
        try {
            if (cmd === 'register') {
                const [agent, intent, ...plan] = args;
                await registerIntent(agent, intent, plan.length ? JSON.parse(plan.join(' ')) : [], {});
                console.log('Intent registered.');
            }
            else if (cmd === 'list') {
                console.log(JSON.stringify(await getIntents(), null, 2));
            }
            else if (cmd === 'feedback') {
                const [agent, ...feedback] = args;
                await submitFeedback(agent, feedback.join(' '));
                console.log('Feedback submitted.');
            }
            else if (cmd === 'get-feedback') {
                console.log(JSON.stringify(await getFeedback(), null, 2));
            }
            else {
                printHelp('pnpm tsx AI-Helpers/agentIntentRegistry.ts register <agent> <intent> <planJson>', 'Register, list, or recommend agent intents.');
                process.exit(1);
            }
        }
        catch (e) {
            handleCliError(e);
        }
    })();
}
export { registerIntent, getIntents, submitFeedback, getFeedback };
