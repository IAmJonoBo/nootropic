// Node.js globals for CLI context
// Use process and console directly (no need to declare)
// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// @ts-ignore
import { readJsonSafe, writeJsonSafe } from './utils.js';
// @ts-ignore
import { appendMemoryEvent } from './memoryLaneHelper.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const AGENT_INTENT_PATH = path.join(__dirname, 'agent-intents.json');
const AGENT_FEEDBACK_PATH = path.join(__dirname, 'agent-feedback.json');
// @ts-ignore
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
async function registerIntent(agent: string, intent: string, plan: string[], context: Record<string, unknown> = {}): Promise<void> {
  let registry: Record<string, AgentIntent> = {};
  if (await readJsonSafe(AGENT_INTENT_PATH)) {
    try { registry = JSON.parse(await readJsonSafe(AGENT_INTENT_PATH)); } catch { registry = {}; }
  }
  registry[agent] = { timestamp: new Date().toISOString(), intent, plan, context };
  await writeJsonSafe(AGENT_INTENT_PATH, registry);
  await appendMemoryEvent({ type: 'agentIntent', agent, intent, plan, context });
}

// --- Get all agent intents/plans ---
async function getIntents(): Promise<Record<string, AgentIntent>> {
  if (!await readJsonSafe(AGENT_INTENT_PATH)) return {};
  return JSON.parse(await readJsonSafe(AGENT_INTENT_PATH));
}

// --- Submit agent feedback ---
async function submitFeedback(agent: string, feedback: string): Promise<void> {
  let feedbacks: AgentFeedback[] = [];
  if (await readJsonSafe(AGENT_FEEDBACK_PATH)) {
    try { feedbacks = JSON.parse(await readJsonSafe(AGENT_FEEDBACK_PATH)); } catch { feedbacks = []; }
  }
  feedbacks.push({ timestamp: new Date().toISOString(), agent, feedback });
  await writeJsonSafe(AGENT_FEEDBACK_PATH, feedbacks);
  await appendMemoryEvent({ type: 'agentFeedback', agent, feedback });
}

// --- Get all feedback ---
async function getFeedback(): Promise<AgentFeedback[]> {
  if (!await readJsonSafe(AGENT_FEEDBACK_PATH)) return [];
  return JSON.parse(await readJsonSafe(AGENT_FEEDBACK_PATH));
}

// --- ESM-compatible CLI entrypoint ---
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