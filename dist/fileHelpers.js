import { promises as fsp } from 'fs';
// --- Async Read JSON file safely ---
export async function readJsonSafe(filePath, fallback = null) {
    try {
        await fsp.access(filePath);
        return JSON.parse(await fsp.readFile(filePath, 'utf-8'));
    }
    catch {
        // Intentional: return fallback if file does not exist or cannot be read
        return fallback;
    }
}
// --- Async Write JSON file safely ---
export async function writeJsonSafe(filePath, data) {
    try {
        await fsp.writeFile(filePath, JSON.stringify(data, null, 2));
    }
    catch {
        // Propagate error for robust error handling
        throw new Error('Failed to write JSON file');
    }
}
// --- Async Get or initialize JSON file ---
export async function getOrInitJson(filePath, init) {
    try {
        await fsp.access(filePath);
        return await readJsonSafe(filePath, init);
    }
    catch {
        await writeJsonSafe(filePath, init);
        return init;
    }
}
