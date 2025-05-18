// removeLegacyAndMergeCopies.ts
// Purpose: Removes legacy directories and merges missing files from 'nootropic copy/'. Usage: pnpm tsx scripts/removeLegacyAndMergeCopies.ts [--help]
// LLM/AI usage: "Show usage for removeLegacyAndMergeCopies script." "How do I clean up legacy directories and merge copies?"
if (process.argv.includes('--help')) {
    console.log('Usage: pnpm tsx scripts/removeLegacyAndMergeCopies.ts [--help]\n\nRemoves all traces of legacy directories from agentBacklog.json and the project, and merges any files from legacy copies into the main project if missing.\n- Usage: pnpm tsx scripts/removeLegacyAndMergeCopies.ts\n- LLM/AI usage: "Show usage for removeLegacyAndMergeCopies script."');
    process.exit(0);
}
import fs from 'fs';
import path from 'path';
const backlogPath = path.resolve('agentBacklog.json');
const projectRoot = process.cwd();
const copyDir = path.join(projectRoot, 'nootropic copy');
const legacyPattern = /Rocketship\//;
const copyPattern = /nootropic copy\//;
function cleanBacklog() {
    if (!fs.existsSync(backlogPath))
        return;
    const raw = fs.readFileSync(backlogPath, 'utf-8');
    let data = JSON.parse(raw);
    if (Array.isArray(data.backlog)) {
        data.backlog = data.backlog.filter((item) => !(legacyPattern.test(item.id || '') || legacyPattern.test(item.description || '')) &&
            !(copyPattern.test(item.id || '') || copyPattern.test(item.description || '')));
    }
    fs.writeFileSync(backlogPath, JSON.stringify(data, null, 2));
    console.log('Cleaned agentBacklog.json of legacy and nootropic copy references.');
}
function mergeCopies() {
    if (!fs.existsSync(copyDir))
        return;
    const walk = (dir) => {
        for (const entry of fs.readdirSync(dir)) {
            const srcPath = path.join(dir, entry);
            const relPath = path.relative(copyDir, srcPath);
            const destPath = path.join(projectRoot, relPath);
            if (fs.statSync(srcPath).isDirectory()) {
                walk(srcPath);
            }
            else {
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(path.dirname(destPath), { recursive: true });
                    fs.copyFileSync(srcPath, destPath);
                    console.log(`Merged: ${relPath}`);
                }
                else {
                    // Prefer main project version, do not overwrite
                    console.log(`Skipped (exists): ${relPath}`);
                }
            }
        }
    };
    walk(copyDir);
    // Optionally, remove the copy dir after merging
    // fs.rmSync(copyDir, { recursive: true, force: true });
    console.log('Merged all missing files from nootropic copy/.');
}
function main() {
    mergeCopies();
    cleanBacklog();
    console.log('Done.');
}
main();
