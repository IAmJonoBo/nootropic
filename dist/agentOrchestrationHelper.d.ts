declare function upsertSession(sessionId: string, { participants, plan, status }: {
    participants: string[];
    plan: Record<string, unknown>;
    status: string;
}): void;
declare function listSessions(): any;
export { upsertSession, listSessions };
