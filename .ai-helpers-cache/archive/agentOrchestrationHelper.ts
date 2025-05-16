// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2307): Cannot find module 'url' or its corresponding type... Remove this comment to see the full error message
import { fileURLToPath } from 'url';

// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SESSIONS_PATH = path.resolve(__dirname, 'agentSessions.json');

// --- Create or update an agent session ---
// @ts-expect-error TS(7010): 'upsertSession', which lacks return-type annotatio... Remove this comment to see the full error message
function upsertSession(
  // @ts-expect-error TS(6133): 'sessionId' is declared but its value is never rea... Remove this comment to see the full error message
  sessionId: string,
  // @ts-expect-error TS(2339): Property 'status' does not exist on type '{ partic... Remove this comment to see the full error message
  { participants, plan, status }: { participants: string[]; plan: Record<string, unknown>; status: string }
) {
  // @ts-expect-error TS(2693): 'string' only refers to a type, but is being used ... Remove this comment to see the full error message
  let sessions: Record<string, { participants: string[]; plan: Record<string, unknown>; status: string; updated: string; negotiationLog: unknown[] }> = {};
  if (fs.existsSync(SESSIONS_PATH)) {
    // @ts-expect-error TS(2304): Cannot find name 'sessions'.
    try { sessions = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8')); } catch { sessions = {}; }
  }
  // @ts-expect-error TS(2304): Cannot find name 'sessions'.
  sessions[sessionId] = {
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    participants,
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    plan,
    status,
    updated: new Date().toISOString(),
    negotiationLog: []
  };
  // @ts-expect-error TS(2304): Cannot find name 'sessions'.
  fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2));
}

// --- List all agent sessions ---
function listSessions() {
  if (!fs.existsSync(SESSIONS_PATH)) return {};
  return JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8'));
}

// --- ESM-compatible CLI entrypoint ---
// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === 'upsert') {
    const [sessionId, participants, plan, status] = args;
    upsertSession(sessionId ?? '', {
      participants: participants ? JSON.parse(participants) : [],
      plan: plan ? JSON.parse(plan) : {},
      status: status ?? ''
    });
    console.log('Session upserted.');
  } else if (cmd === 'list') {
    console.log(JSON.stringify(listSessions(), null, 2));
  } else {
    console.log('Usage: pnpm tsx nootropic/agentOrchestrationHelper.ts upsert <sessionId> <participantsJson> <planJson> <status>');
    console.log('       pnpm tsx nootropic/agentOrchestrationHelper.ts list');
  }
}

export { upsertSession, listSessions }; 