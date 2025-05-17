// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { readJsonSafe, writeJsonSafe, getOrInitJson, esmEntrypointCheck } from './utils.js';
import { MEMORY_LANE_PATH } from './paths.js';
// --- Append an event to memory lane ---
async function appendMemoryEvent(event) {
    const timeline = await getOrInitJson(MEMORY_LANE_PATH, []);
    const eventWithTimestamp = { ...event };
    if (!eventWithTimestamp.timestamp) {
        eventWithTimestamp.timestamp = new Date().toISOString();
    }
    timeline.push(eventWithTimestamp);
    await writeJsonSafe(MEMORY_LANE_PATH, timeline);
}
// --- Get the full memory lane timeline ---
async function getMemoryLane() {
    return (await readJsonSafe(MEMORY_LANE_PATH, []));
}
// --- ESM-compatible CLI entrypoint ---
if (esmEntrypointCheck(import.meta.url)) {
    const [cmd, ...args] = process.argv.slice(2);
    if (cmd === 'append') {
        const event = JSON.parse(args.join(' '));
        await appendMemoryEvent(event);
        console.log('Event appended to memory lane.');
    }
    else if (cmd === 'get') {
        console.log(JSON.stringify(await getMemoryLane(), null, 2));
    }
    else {
        console.log('Usage: pnpm tsx nootropic/memoryLaneHelper.ts append <jsonEvent>');
        console.log('       pnpm tsx nootropic/memoryLaneHelper.ts get');
    }
}
export { appendMemoryEvent, getMemoryLane };
