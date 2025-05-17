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

import fs from 'fs';
// @ts-ignore
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
  const token = process.env['GITHUB_TOKEN'] || '';
  const owner = process.env['GITHUB_OWNER'] || '';
  const repo = process.env['GITHUB_REPO'] || '';
  const eventPath = process.env['GITHUB_EVENT_PATH'] || '';
  if (!token || !owner || !repo || !eventPath) {
    const msg = 'Missing required env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, GITHUB_EVENT_PATH';
    printError(msg, args['json']);
    process.exit(1);
  }
  let result: unknown = { status: 'no_action', message: '', event: undefined };
  try {
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: token });
    const event = JSON.parse(fs.readFileSync(eventPath, 'utf-8'));

    // Helper: post a comment
    async function postComment(issue_number: number, body: string) {
      await octokit.issues.createComment({ owner: owner as string, repo: repo as string, issue_number, body });
      console.log(`[comment] #${issue_number}: ${body}`);
    }
    // Helper: add label(s)
    async function addLabels(issue_number: number, labels: string[]) {
      await octokit.issues.addLabels({ owner: owner as string, repo: repo as string, issue_number, labels });
      console.log(`[label:add] #${issue_number}: ${labels.join(', ')}`);
    }
    // Helper: remove label(s)
    async function removeLabel(issue_number: number, label: string) {
      try {
        await octokit.issues.removeLabel({ owner: owner as string, repo: repo as string, issue_number, name: label });
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
      await postComment(issue_number, `👋 Welcome! This issue is now in triage. A maintainer will review it soon.\n\n_This is an automated onboarding message. See CONTRIBUTING.md and [Onboarding Checklist](onboarding-checklist.md) for next steps._`);
      auditLog('opened', { issue_number });
      result = { status: 'triage', message: 'Issue opened and triage label added.' };
    } else if (event.issue && event.action === 'labeled') {
      const issue_number = event.issue.number;
      const label = event.label?.name;
      if (label) {
        await postComment(issue_number, `🔖 Status update: \`${label}\` label added.`);
        auditLog('labeled', { issue_number, label });
        result = { status: 'labeled', label, message: 'Label added.' };
      }
    } else if (event.issue && event.action === 'unlabeled') {
      const issue_number = event.issue.number;
      const label = event.label?.name;
      if (label) {
        await postComment(issue_number, `❌ Status update: \`${label}\` label removed.`);
        auditLog('unlabeled', { issue_number, label });
        result = { status: 'unlabeled', label, message: 'Label removed.' };
      }
    } else if (event.comment && event.issue && event.action === 'created') {
      const issue_number = event.issue.number;
      const body = event.comment.body.trim();
      // Extensible command stub
      if (body.startsWith('.submit')) {
        await addLabels(issue_number, ['submitted']);
        await removeLabel(issue_number, 'triage');
        await postComment(issue_number, `✅ Issue submitted for review. Thank you!`);
        auditLog('submitted', { issue_number });
        result = { status: 'submitted', message: 'Issue submitted for review.' };
      } else if (body.startsWith('.approve')) {
        await addLabels(issue_number, ['approved']);
        await removeLabel(issue_number, 'submitted');
        await postComment(issue_number, `🎉 Issue approved!`);
        auditLog('approved', { issue_number });
        result = { status: 'approved', message: 'Issue approved.' };
      } else if (body.startsWith('.deny')) {
        await addLabels(issue_number, ['denied']);
        await removeLabel(issue_number, 'submitted');
        await postComment(issue_number, `🚫 Issue denied. Please see feedback above.`);
        auditLog('denied', { issue_number });
        result = { status: 'denied', message: 'Issue denied.' };
      } else if (body.startsWith('.help')) {
        // Example of extensible command
        await postComment(issue_number, `ℹ️ Available commands: .submit, .approve, .deny, .help`);
        auditLog('help', { issue_number });
        result = { status: 'help', message: 'Help command issued.' };
      }
      // [Stub] Add more commands as needed here
    } else if (event.issue && event.action === 'closed') {
      const issue_number = event.issue.number;
      await postComment(issue_number, `🔒 Issue closed. Thank you for your contribution!`);
      auditLog('closed', { issue_number });
      result = { status: 'closed', message: 'Issue closed.' };
    } else if (event.issue && event.action === 'reopened') {
      const issue_number = event.issue.number;
      await postComment(issue_number, `♻️ Issue reopened. A maintainer will review it again.`);
      auditLog('reopened', { issue_number });
      result = { status: 'reopened', message: 'Issue reopened.' };
    } else {
      // Edge case handling stub
      // TODO: Handle multiple labels, permission checks, onboarding checklist, etc.
      result = { status: 'no_action', message: 'No matching event/action for state-machine automation.' };
      if (!args['json']) console.log('No matching event/action for state-machine automation.');
    }

    (result as Record<string, unknown>).event = event.action;
  } catch (e) {
    printError(e, args['json']);
    process.exit(1);
  }
  printResult(result, args['json']);
}

main().catch(e => { console.error(e); process.exit(1); }); 