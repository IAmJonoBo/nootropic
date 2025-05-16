#!/usr/bin/env tsx
/**
 * IssueOps State-Machine Handler
 * Handles state transitions and automated comments for issues based on GitHub Actions events.
 * Invoked by .github/workflows/issueops-state-machine.yml
 *
 * TODO: Implement full state-machine logic for IssueOps-driven project management.
 * Reference: https://github.blog/engineering/issueops-automate-ci-cd-and-more-with-github-issues-and-actions/
 *
 * NOTE: Full state-machine logic for IssueOps-driven project management is an ongoing enhancement (see backlog).
 *
 * Usage:
 *   pnpm tsx scripts/issueOpsStateMachine.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Used by .github/workflows/issueops-state-machine.yml.
 *
 * Troubleshooting:
 *   - Ensure all required environment variables are set (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_EVENT_PATH).
 *   - Use --json for machine-readable output in CI/CD or automation.
 *   - For errors, check for missing env vars or invalid event payloads.
 *
 * Example:
 *   pnpm tsx scripts/issueOpsStateMachine.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for issueOpsStateMachine script."
 *   - "List all scripts that automate GitHub IssueOps."
 *   - "How do I automate issue state transitions?"
 *   - "What does issueOpsStateMachine do?"
 *
 * Backlog:
 *   - [ ] Full state-machine logic (multi-label, permission, onboarding, audit log, etc.)
 */

// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const options = {
  help: { desc: 'Show help', type: 'boolean' },
  json: { desc: 'Output in JSON format', type: 'boolean' }
};

async function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) {
    printUsage('Usage: pnpm tsx scripts/issueOpsStateMachine.ts [--help] [--json]', options);
    return;
  }
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  const token = process.env['GITHUB_TOKEN'] || '';
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  const owner = process.env['GITHUB_OWNER'] || '';
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  const repo = process.env['GITHUB_REPO'] || '';
  // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
  const eventPath = process.env['GITHUB_EVENT_PATH'] || '';
  if (!token || !owner || !repo || !eventPath) {
    const msg = 'Missing required env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_EVENT_PATH';
    printError(msg, args['json']);
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(1);
  }
  let result: unknown = { status: 'no_action', message: '', event: undefined };
  try {
    const { Octokit } = await import('@octokit/rest');
    // @ts-expect-error TS(2554): Expected 0 arguments, but got 1.
    const octokit = new Octokit({ auth: token });
    // @ts-expect-error TS(6133): 'event' is declared but its value is never read.
    const event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));

    // Helper: post a comment
    async function postComment(issue_number: number, body: string) {
      await octokit.issues.createComment({ owner: owner as string, repo: repo as string, issue_number, body });
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      console.log(`[comment] #${issue_number}: ${body}`);
    }
    // Helper: add label(s)
    async function addLabels(issue_number: number, labels: string[]) {
      await octokit.issues.addLabels({ owner: owner as string, repo: repo as string, issue_number, labels });
      // @ts-expect-error TS(2552): Cannot find name 'label'. Did you mean 'babel'?
      console.log(`[label:add] #${issue_number}: ${labels.join(', ')}`);
    }
    // Helper: remove label(s)
    async function removeLabel(issue_number: number, label: string) {
      try {
        await octokit.issues.removeLabel({ owner: owner as string, repo: repo as string, issue_number, name: label });
        // @ts-expect-error TS(2304): Cannot find name 'label'.
        console.log(`[label:remove] #${issue_number}: ${label}`);
      } catch {
        // Ignore if label not present
      }
    }

    // Simple audit log function
    function auditLog(action: string, details: Record<string, unknown>) {
      const logPath = '.nootropic-cache/issueops-audit-log.jsonl';
      const entry = { timestamp: new Date().toISOString(), action, ...details };
      try {
        fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
      } catch {}
    }

    // Main event handling
    if (event.issue && event.action === 'opened') {
      const issue_number = event.issue.number;
      await addLabels(issue_number, ['triage']);
      // Add onboarding doc link placeholder
      // @ts-expect-error TS(2304): Cannot find name 'Welcome'.
      await postComment(issue_number, `👋 Welcome! This issue is now in triage. A maintainer will review it soon.\n\n_This is an automated onboarding message. See CONTRIBUTING.md and [Onboarding Checklist](onboarding-checklist.md) for next steps._`);
      auditLog('opened', { issue_number });
      result = { status: 'triage', message: 'Issue opened and triage label added.' };
    } else if (event.issue && event.action === 'labeled') {
      const issue_number = event.issue.number;
      const label = event.label?.name;
      if (label) {
        // @ts-expect-error TS(2304): Cannot find name 'Status'.
        await postComment(issue_number, `🔖 Status update: \`${label}\` label added.`);
        // @ts-expect-error TS(2304): Cannot find name 'auditLog'.
        auditLog('labeled', { issue_number, label });
        // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
        result = { status: 'labeled', label, message: 'Label added.' };
      }
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    } else if (event.issue && event.action === 'unlabeled') {
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      const issue_number = event.issue.number;
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      const label = event.label?.name;
      if (label) {
        // @ts-expect-error TS(2304): Cannot find name 'postComment'.
        await postComment(issue_number, `❌ Status update: \`${label}\` label removed.`);
        // @ts-expect-error TS(2304): Cannot find name 'auditLog'.
        auditLog('unlabeled', { issue_number, label });
        // @ts-expect-error TS(2304): Cannot find name 'result'.
        result = { status: 'unlabeled', label, message: 'Label removed.' };
      }
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    } else if (event.comment && event.issue && event.action === 'created') {
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      const issue_number = event.issue.number;
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      const body = event.comment.body.trim();
      // Extensible command stub
      if (body.startsWith('.submit')) {
        // @ts-expect-error TS(2304): Cannot find name 'addLabels'.
        await addLabels(issue_number, ['submitted']);
        // @ts-expect-error TS(2304): Cannot find name 'removeLabel'.
        await removeLabel(issue_number, 'triage');
        // @ts-expect-error TS(2304): Cannot find name 'postComment'.
        await postComment(issue_number, `✅ Issue submitted for review. Thank you!`);
        // @ts-expect-error TS(2304): Cannot find name 'auditLog'.
        auditLog('submitted', { issue_number });
        // @ts-expect-error TS(2304): Cannot find name 'result'.
        result = { status: 'submitted', message: 'Issue submitted for review.' };
      } else if (body.startsWith('.approve')) {
        // @ts-expect-error TS(2304): Cannot find name 'addLabels'.
        await addLabels(issue_number, ['approved']);
        // @ts-expect-error TS(2304): Cannot find name 'removeLabel'.
        await removeLabel(issue_number, 'submitted');
        // @ts-expect-error TS(2304): Cannot find name 'postComment'.
        await postComment(issue_number, `🎉 Issue approved!`);
        // @ts-expect-error TS(2304): Cannot find name 'auditLog'.
        auditLog('approved', { issue_number });
        // @ts-expect-error TS(2304): Cannot find name 'result'.
        result = { status: 'approved', message: 'Issue approved.' };
      } else if (body.startsWith('.deny')) {
        // @ts-expect-error TS(2304): Cannot find name 'addLabels'.
        await addLabels(issue_number, ['denied']);
        // @ts-expect-error TS(2304): Cannot find name 'removeLabel'.
        await removeLabel(issue_number, 'submitted');
        // @ts-expect-error TS(2304): Cannot find name 'postComment'.
        await postComment(issue_number, `🚫 Issue denied. Please see feedback above.`);
        // @ts-expect-error TS(2304): Cannot find name 'auditLog'.
        auditLog('denied', { issue_number });
        // @ts-expect-error TS(2304): Cannot find name 'result'.
        result = { status: 'denied', message: 'Issue denied.' };
      } else if (body.startsWith('.help')) {
        // Example of extensible command
        // @ts-expect-error TS(2304): Cannot find name 'postComment'.
        await postComment(issue_number, `ℹ️ Available commands: .submit, .approve, .deny, .help`);
        // @ts-expect-error TS(2304): Cannot find name 'auditLog'.
        auditLog('help', { issue_number });
        // @ts-expect-error TS(2304): Cannot find name 'result'.
        result = { status: 'help', message: 'Help command issued.' };
      }
      // [Stub] Add more commands as needed here
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    } else if (event.issue && event.action === 'closed') {
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      const issue_number = event.issue.number;
      // @ts-expect-error TS(2304): Cannot find name 'postComment'.
      await postComment(issue_number, `🔒 Issue closed. Thank you for your contribution!`);
      // @ts-expect-error TS(2304): Cannot find name 'auditLog'.
      auditLog('closed', { issue_number });
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      result = { status: 'closed', message: 'Issue closed.' };
    // @ts-expect-error TS(2532): Object is possibly 'undefined'.
    } else if (event.issue && event.action === 'reopened') {
      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
      const issue_number = event.issue.number;
      // @ts-expect-error TS(2304): Cannot find name 'postComment'.
      await postComment(issue_number, `♻️ Issue reopened. A maintainer will review it again.`);
      // @ts-expect-error TS(2304): Cannot find name 'auditLog'.
      auditLog('reopened', { issue_number });
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      result = { status: 'reopened', message: 'Issue reopened.' };
    } else {
      // Edge case handling stub
      // TODO: Handle multiple labels, permission checks, onboarding checklist, etc.
      // @ts-expect-error TS(2304): Cannot find name 'result'.
      result = { status: 'no_action', message: 'No matching event/action for state-machine automation.' };
      // @ts-expect-error TS(2304): Cannot find name 'args'.
      if (!args['json']) console.log('No matching event/action for state-machine automation.');
    }

    // @ts-expect-error TS(2304): Cannot find name 'result'.
    result.event = event.action;
  } catch (e) {
    // @ts-expect-error TS(2304): Cannot find name 'args'.
    printError(e, args['json']);
    // @ts-expect-error TS(2580): Cannot find name 'process'. Do you need to install... Remove this comment to see the full error message
    process.exit(1);
  }
  // @ts-expect-error TS(2304): Cannot find name 'result'.
  printResult(result, args['json']);
}

// @ts-expect-error TS(2304): Cannot find name 'e'.
main().catch(e => { console.error(e); process.exit(1); }); 