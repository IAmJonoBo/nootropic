// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { PATCH_DIR } from './paths.js';
// @ts-expect-error TS(2305): Module '"./utils.js"' has no exported member 'list... Remove this comment to see the full error message
import { listFilesRecursive } from './utils.js';
// @ts-expect-error TS(2305): Module '"./utils/context/contextManager.js"' has n... Remove this comment to see the full error message
import { ensureDirExists } from './utils/context/contextManager.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
// @ts-expect-error TS(2307): Cannot find module 'child_process' or its correspo... Remove this comment to see the full error message
import { execSync } from 'child_process';
import { publishEvent } from './memoryLaneHelper.js';

// --- Utility: Run shell command and capture output ---
function runCmd(cmd: string) {
  try {
    return execSync(cmd, { stdio: 'pipe' }).toString().trim();
  } catch (e) {
    // @ts-expect-error TS(2304): Cannot find name 'n$'.
    throw new Error(`Command failed: ${cmd}\n${e instanceof Error ? e.message : e}`);
  }
}

// --- Load GitHub config from env or config file ---
function getGitHubConfig() {
  const githubToken = process.env['GITHUB_TOKEN'];
  const githubOwner = process.env['GITHUB_OWNER'];
  const githubRepo = process.env['GITHUB_REPO'];
  const githubBase = process.env['GITHUB_BASE'];
  return {
    token: githubToken,
    owner: githubOwner,
    repo: githubRepo,
    base: githubBase ?? 'main',
  };
}

// --- Automated PR creation using Octokit ---
async function runAutomatedPR({ dryRun = false, preview = false } = {}) {
  const { Octokit } = await import('@octokit/rest');
  const { token, owner, repo, base } = getGitHubConfig();
  const agentId = 'liveMutationPRHelper';
  const timestamp = new Date().toISOString();
  if (!token || !owner || !repo) {
    throw new Error('Missing required GitHub config: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
  }
  const octokit = new Octokit({ auth: token });
  // 1. Get latest commit SHA from base branch
  // @ts-expect-error TS(2304): Cannot find name 'heads'.
  const { data: baseRef } = await octokit.rest.git.getRef({ owner, repo, ref: `heads/${base}` });
  const baseSha = baseRef.object.sha;
  // 2. Create a new branch
  // @ts-expect-error TS(2304): Cannot find name 'ai'.
  const branch = `ai-mutation-${Date.now()}`;
  if (!dryRun) {
    await octokit.rest.git.createRef({
      owner,
      repo,
      // @ts-expect-error TS(2304): Cannot find name 'refs'.
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    });
    await publishEvent({ type: 'branchCreated', agentId, timestamp, payload: { branch, base } });
  }
  // 3. Apply patches and commit (reuse existing logic)
  await applyPatches();
  await publishEvent({ type: 'patchApplied', agentId, timestamp, payload: { branch } });
  commitAll('chore(ai-mutation): AI mutation/refactor plan applied');
  // 4. Push branch to remote
  if (!dryRun) {
    // @ts-expect-error TS(2304): Cannot find name 'git'.
    runCmd(`git push origin ${branch}`);
  }
  // 5. Create PR via Octokit
  const prTitle = 'AI Mutation/Refactor: Automated Patch';
  const prBody = 'This PR was created automatically by the nootropic mutation engine.';
  let prUrl = null;
  if (!dryRun) {
    const { data: pr } = await octokit.rest.pulls.create({
      owner,
      repo,
      title: prTitle,
      head: branch,
      base,
      body: prBody,
    });
    prUrl = pr.html_url;
    await publishEvent({ type: 'prCreated', agentId, timestamp, payload: { branch, prUrl } });
  }
  // 6. Output result
  if (preview ?? dryRun) {
    console.log(JSON.stringify({ branch, base, prTitle, prBody, dryRun, preview }, null, 2));
  } else {
    // @ts-expect-error TS(2304): Cannot find name 'PR'.
    console.log(`PR created: ${prUrl}`);
  }
}

// --- Create a new branch for mutation/refactor ---
function createBranch(branchName: string) {
  // @ts-expect-error TS(2304): Cannot find name 'git'.
  runCmd(`git checkout -b ${branchName}`);
}

// --- Apply all patches in PATCH_DIR ---
async function applyPatches() {
  await ensureDirExists(PATCH_DIR);
  const patches = (await listFilesRecursive(PATCH_DIR)).filter(f => f.endsWith('.patch'));
  for (const patch of patches) {
    // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
    const patchPath = `${PATCH_DIR}/${patch}`;
    try {
      // @ts-expect-error TS(2304): Cannot find name 'patchPath'.
      runCmd(`git apply "${patchPath}"`);
    } catch {
      // @ts-expect-error TS(2304): Cannot find name 'patchPath'.
      console.warn(`Failed to apply patch: ${patchPath}`);
    }
  }
}

// --- Commit changes ---
function commitAll(message: string) {
  runCmd('git add .');
  // @ts-expect-error TS(2304): Cannot find name 'git'.
  runCmd(`git commit -m "${message}"`);
}

// --- Suggest PR (prints instructions, or integrates with GitHub CLI if available) ---
function suggestPR(branchName: string, base: string = 'main') {
  try {
    // @ts-expect-error TS(2304): Cannot find name 'gh'.
    runCmd(`gh pr create --fill --base ${base} --head ${branchName}`);
    console.log('PR created via GitHub CLI.');
  } catch {
    // @ts-expect-error TS(2304): Cannot find name 'PR'.
    console.log(`PR not auto-created. Please push and open a PR for branch: ${branchName}`);
  }
}

// --- Main entrypoint: run mutation, branch, patch, commit, suggest PR ---
async function runLiveMutationPR() {
  try {
    // Dynamic import for ESM compatibility
    const { runMutationEngine } = await import('./contextMutationEngine.js');
    await runMutationEngine();
    // @ts-expect-error TS(2304): Cannot find name 'ai'.
    const branch = `ai-mutation-${Date.now()}`;
    createBranch(branch);
    await applyPatches();
    commitAll('AI mutation/refactor plan applied');
    suggestPR(branch);
    console.log('Live code mutation, branch, and PR suggestion complete.');
  } catch {
    console.error('Failed to create branch');
    process.exit(1);
  }
}

// --- CLI entrypoint extension ---
if (import.meta.url === `file://${process.argv[1]}`) {
  // @ts-expect-error TS(2304): Cannot find name 'async'.
  (async () => {
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    const { args } = parseArgs(process.argv);
    // @ts-expect-error TS(2304): Cannot find name 'cmd'.
    const cmd = args[0];
    // @ts-expect-error TS(2304): Cannot find name 'dryRun'.
    const dryRun = args.includes('--dry-run');
    // @ts-expect-error TS(2304): Cannot find name 'preview'.
    const preview = args.includes('--preview');
    // @ts-expect-error TS(6133): 'cmd' is declared but its value is never read.
    if (cmd === 'help' || args.includes('--help')) {
      printHelp('pnpm tsx nootropic/liveMutationPRHelper.ts', `\nAutomated PR creation with Octokit.\n\nRequired env vars:\n  GITHUB_TOKEN  GitHub personal access token (repo scope)\n  GITHUB_OWNER  GitHub repo owner\n  GITHUB_REPO   GitHub repo name\n  GITHUB_BASE   (optional) base branch, default 'main'\n\nOptions:\n  --dry-run     Show planned actions, do not push or create PR\n  --preview     Output PR metadata, do not push or create PR\n`);
      // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
      process.exit(0);
    }
    try {
      // @ts-expect-error TS(2304): Cannot find name 'args'.
      if (args.includes('--octokit') ?? args.includes('--automated')) {
        // @ts-expect-error TS(2304): Cannot find name 'runAutomatedPR'.
        await runAutomatedPR({ dryRun, preview });
      } else {
        // @ts-expect-error TS(2304): Cannot find name 'runLiveMutationPR'.
        await runLiveMutationPR();
      }
    } catch (err) {
      handleCliError(err);
    }
  })();
}

/**
 * Returns a description of the live mutation/PR helper plugin/capability, including event-driven traceability.
 * See docs/orchestration.md for event schema and best practices (referenced in prose).
 */
export function describe() {
  return {
    name: 'liveMutationPRHelper',
    description: 'Automates code mutation, branch creation, and PR suggestion for agent-driven refactoring. Emits structured events for all major actions (mutationSuggested, patchApplied, branchCreated, prCreated) for full traceability.',
    functions: [
      { name: 'runLiveMutationPRHelper', signature: '() => Promise<void>', description: 'Run live code mutation, branch, and PR suggestion.' }
    ],
    usage: "pnpm tsx nootropic/liveMutationPRHelper.ts",
    emits: [
      'mutationSuggested',
      'patchApplied',
      'branchCreated',
      'prCreated'
    ],
    eventSchemas: {
      mutationSuggested: { type: 'object', properties: { agentId: { type: 'string' }, timestamp: { type: 'string' }, suggestion: { type: 'string' } }, required: ['agentId', 'timestamp', 'suggestion'] },
      patchApplied: { type: 'object', properties: { agentId: { type: 'string' }, timestamp: { type: 'string' }, branch: { type: 'string' } }, required: ['agentId', 'timestamp', 'branch'] },
      branchCreated: { type: 'object', properties: { agentId: { type: 'string' }, timestamp: { type: 'string' }, branch: { type: 'string' }, base: { type: 'string' } }, required: ['agentId', 'timestamp', 'branch', 'base'] },
      prCreated: { type: 'object', properties: { agentId: { type: 'string' }, timestamp: { type: 'string' }, branch: { type: 'string' }, prUrl: { type: 'string' } }, required: ['agentId', 'timestamp', 'branch', 'prUrl'] }
    },
    schema: {
      runLiveMutationPRHelper: {
        input: { type: 'null' },
        output: { type: 'null' }
      }
    }
  };
}

export {
  // @ts-expect-error TS(2304): Cannot find name 'runLiveMutationPR'.
  runLiveMutationPR,
  // @ts-expect-error TS(2304): Cannot find name 'createBranch'.
  createBranch,
  // @ts-expect-error TS(2304): Cannot find name 'applyPatches'.
  applyPatches,
  // @ts-expect-error TS(2304): Cannot find name 'commitAll'.
  commitAll,
  // @ts-expect-error TS(2304): Cannot find name 'suggestPR'.
  suggestPR
}; 