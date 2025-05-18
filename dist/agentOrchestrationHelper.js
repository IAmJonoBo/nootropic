// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SESSIONS_PATH = path.resolve(__dirname, 'agentSessions.json');
// --- Create or update an agent session ---
function upsertSession(sessionId, { participants, plan, status }) {
    let sessions = {};
    if (fs.existsSync(SESSIONS_PATH)) {
        try {
            sessions = JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8'));
        }
        catch {
            sessions = {};
        }
    }
    sessions[sessionId] = {
        participants,
        plan,
        status,
        updated: new Date().toISOString(),
        negotiationLog: []
    };
    fs.writeFileSync(SESSIONS_PATH, JSON.stringify(sessions, null, 2));
}
// --- List all agent sessions ---
function listSessions() {
    if (!fs.existsSync(SESSIONS_PATH))
        return {};
    return JSON.parse(fs.readFileSync(SESSIONS_PATH, 'utf-8'));
}
// --- ESM-compatible CLI entrypoint ---
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
    }
    else if (cmd === 'list') {
        console.log(JSON.stringify(listSessions(), null, 2));
    }
    else {
        console.log('Usage: pnpm tsx nootropic/agentOrchestrationHelper.ts upsert <sessionId> <participantsJson> <planJson> <status>');
        console.log('       pnpm tsx nootropic/agentOrchestrationHelper.ts list');
    }
}
export { upsertSession, listSessions };
