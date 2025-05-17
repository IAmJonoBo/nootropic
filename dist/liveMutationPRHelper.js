// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { PATCH_DIR } from './paths.js';
import { listFilesRecursive, ensureDirExists } from './utils.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
import { execSync } from 'child_process';
// --- Utility: Run shell command and capture output ---
function runCmd(cmd) {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    }
    catch {
        throw new Error(`Command failed: ${cmd}`);
    }
}
// --- Create a new branch for mutation/refactor ---
function createBranch(branchName) {
    runCmd(`git checkout -b ${branchName}`);
}
// --- Apply all patches in PATCH_DIR ---
async function applyPatches() {
    await ensureDirExists(PATCH_DIR);
    const patches = (await listFilesRecursive(PATCH_DIR)).filter(f => f.endsWith('.patch'));
    for (const patch of patches) {
        const patchPath = `${PATCH_DIR}/${patch}`;
        try {
            runCmd(`git apply "${patchPath}"`);
        }
        catch {
            console.warn(`Failed to apply patch: ${patchPath}`);
        }
    }
}
// --- Commit changes ---
function commitAll(message) {
    runCmd('git add .');
    runCmd(`git commit -m "${message}"`);
}
// --- Suggest PR (prints instructions, or integrates with GitHub CLI if available) ---
function suggestPR(branchName, base = 'main') {
    try {
        runCmd(`gh pr create --fill --base ${base} --head ${branchName}`);
        console.log('PR created via GitHub CLI.');
    }
    catch {
        console.log(`PR not auto-created. Please push and open a PR for branch: ${branchName}`);
    }
}
// --- Main entrypoint: run mutation, branch, patch, commit, suggest PR ---
async function runLiveMutationPR() {
    try {
        // Dynamic import for ESM compatibility
        const { runMutationEngine } = await import('./contextMutationEngine.js');
        await runMutationEngine();
        const branch = `ai-mutation-${Date.now()}`;
        createBranch(branch);
        await applyPatches();
        commitAll('AI mutation/refactor plan applied');
        suggestPR(branch);
        console.log('Live code mutation, branch, and PR suggestion complete.');
    }
    catch {
        console.error('Failed to create branch');
        process.exit(1);
    }
}
// --- ESM-compatible CLI entrypoint ---
if (import.meta.url === `file://${process.argv[1]}`) {
    (async () => {
        const { args } = parseArgs(process.argv);
        const cmd = args[0];
        if (cmd === 'help' || args.includes('--help')) {
            printHelp('pnpm tsx nootropic/liveMutationPRHelper.ts', 'Run live code mutation, branch, and PR suggestion.');
            process.exit(0);
        }
        try {
            await runLiveMutationPR();
        }
        catch (err) {
            handleCliError(err);
        }
    })();
}
export { runLiveMutationPR, createBranch, applyPatches, commitAll, suggestPR };
