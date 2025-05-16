// Node.js globals for CLI context
// Use process and console directly (no need to declare)
// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// @ts-expect-error TS(2459): Module '"./utils.js"' declares 'readJsonSafe' loca... Remove this comment to see the full error message
import { readJsonSafe, writeJsonSafe } from './utils.js';
import { appendMemoryEvent } from './memoryLaneHelper.js';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2307): Cannot find module 'url' or its corresponding type... Remove this comment to see the full error message
import { fileURLToPath } from 'url';
// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGENT_INTENT_PATH = path.join(__dirname, 'agent-intents.json');
const AGENT_FEEDBACK_PATH = path.join(__dirname, 'agent-feedback.json');
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';

interface AgentIntent {
  timestamp: string;
  intent: string;
  plan: string[];
  context?: Record<string, unknown>;
}

interface AgentFeedback {
  timestamp: string;
  agent: string;
  feedback: string;
}

// --- Register or update agent intent/plan ---
// @ts-expect-error TS(7010): 'registerIntent', which lacks return-type annotati... Remove this comment to see the full error message
async function registerIntent(agent: string, intent: string, plan: string[], context: Record<string, unknown> = {}): Promise<void> {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let registry: Record<string, AgentIntent> = {};
  if (await readJsonSafe(AGENT_INTENT_PATH)) {
    // @ts-expect-error TS(2304): Cannot find name 'registry'.
    try { registry = JSON.parse(await readJsonSafe(AGENT_INTENT_PATH)); } catch { registry = {}; }
  }
  // @ts-expect-error TS(2304): Cannot find name 'registry'.
  registry[agent] = { timestamp: new Date().toISOString(), intent, plan, context };
  // @ts-expect-error TS(2304): Cannot find name 'registry'.
  await writeJsonSafe(AGENT_INTENT_PATH, registry);
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  await appendMemoryEvent({ type: 'agentIntent', agent, intent, plan, context });
}

// --- Get all agent intents/plans ---
async function getIntents(): Promise<Record<string, AgentIntent>> {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  if (!await readJsonSafe(AGENT_INTENT_PATH)) return {};
  return JSON.parse(await readJsonSafe(AGENT_INTENT_PATH));
}

// --- Submit agent feedback ---
// @ts-expect-error TS(6133): 'agent' is declared but its value is never read.
async function submitFeedback(agent: string, feedback: string): Promise<void> {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let feedbacks: AgentFeedback[] = [];
  // @ts-expect-error TS(6133): 'await' is declared but its value is never read.
  if (await readJsonSafe(AGENT_FEEDBACK_PATH)) {
    try { feedbacks = JSON.parse(await readJsonSafe(AGENT_FEEDBACK_PATH)); } catch { feedbacks = []; }
  }
  // @ts-expect-error TS(2304): Cannot find name 'feedbacks'.
  feedbacks.push({ timestamp: new Date().toISOString(), agent, feedback });
  // @ts-expect-error TS(2304): Cannot find name 'feedbacks'.
  await writeJsonSafe(AGENT_FEEDBACK_PATH, feedbacks);
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  await appendMemoryEvent({ type: 'agentFeedback', agent, feedback });
}

// --- Get all feedback ---
async function getFeedback(): Promise<AgentFeedback[]> {
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  if (!await readJsonSafe(AGENT_FEEDBACK_PATH)) return [];
  return JSON.parse(await readJsonSafe(AGENT_FEEDBACK_PATH));
}

// --- ESM-compatible CLI entrypoint ---
// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const [cmd, ...args] = parseArgs(process.argv).args;
    if (cmd === 'help' || args.includes('--help')) {
      printHelp('pnpm tsx nootropic/agentIntentRegistry.ts register <agent> <intent> <planJson>', 'Register, list, or recommend agent intents.');
      process.exit(0);
    }
    try {
      if (cmd === 'register') {
        const [agent, intent, ...plan] = args;
        await registerIntent(agent ?? '', intent ?? '', plan.length ? JSON.parse(plan.join(' ')) : [], {});
        console.log('Intent registered.');
      } else if (cmd === 'list') {
        console.log(JSON.stringify(await getIntents(), null, 2));
      } else if (cmd === 'feedback') {
        const [agent, ...feedback] = args;
        await submitFeedback(agent ?? '', feedback ? feedback.join(' ') : '');
        console.log('Feedback submitted.');
      } else if (cmd === 'get-feedback') {
        console.log(JSON.stringify(await getFeedback(), null, 2));
      } else {
        printHelp('pnpm tsx nootropic/agentIntentRegistry.ts register <agent> <intent> <planJson>', 'Register, list, or recommend agent intents.');
        process.exit(1);
      }
    } catch (e) {
      handleCliError(e);
    }
  })();
}

/**
 * Returns a description of the agent intent registry plugin/capability.
 */
export function describe() {
  return {
    name: 'agentIntentRegistry',
    description: 'Registry for agent intents, plans, and feedback. Supports CLI, HTTP, and WebSocket APIs. Planned: plugin/capability integration, event hooks, and memory lane logging.',
    functions: [
      { name: 'registerIntent', signature: '(agent, intent, plan, context) => void', description: 'Register an agent intent and plan.' },
      { name: 'submitFeedback', signature: '(agent, suggestion, rating, comment) => void', description: 'Submit feedback on a suggestion.' },
      { name: 'getIntents', signature: '() => Intent[]', description: 'Get all registered intents.' },
      { name: 'getFeedback', signature: '() => Feedback[]', description: 'Get all feedback.' }
    ],
    usage: "pnpm tsx nootropic/agentIntentRegistry.ts register <agent> <intent> <planStep1> ...",
    schema: {
      registerIntent: {
        input: {
          type: 'object',
          properties: {
            agent: { type: 'string' },
            intent: { type: 'string' },
            plan: { type: 'array', items: { type: 'string' } },
            context: { type: 'object' }
          },
          required: ['agent', 'intent', 'plan']
        },
        output: { type: 'null' }
      },
      submitFeedback: {
        input: {
          type: 'object',
          properties: {
            agent: { type: 'string' },
            suggestion: { type: 'string' },
            rating: { type: 'number' },
            comment: { type: 'string' }
          },
          required: ['agent', 'suggestion', 'rating']
        },
        output: { type: 'null' }
      },
      getIntents: {
        input: { type: 'null' },
        output: { type: 'array', items: { type: 'object' } }
      },
      getFeedback: {
        input: { type: 'null' },
        output: { type: 'array', items: { type: 'object' } }
      }
    }
  };
}

export { registerIntent, getIntents, submitFeedback, getFeedback }; 