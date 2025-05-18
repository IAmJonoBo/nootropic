#!/usr/bin/env tsx
import fs from 'fs';
import path from 'path';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from './src/utils/cliHelpers.js';

const usage = 'Usage: pnpm tsx scripts/backlogSync.ts [--help] [--json] [--dry-run]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
  'dry-run': { desc: 'Run without making changes', type: 'boolean' },
};

/**
 * Script to synchronize the backlog (agentBacklog.json) with GitHub Issues and escalate hotspots/stale TODOs.
 * Usage: pnpm tsx scripts/backlogSync.ts [--help] [--json] [--dry-run]
 * LLM/AI-usage: Ensures backlog and GitHub Issues are in sync, escalates technical debt hotspots and stale TODOs for automation and reporting.
 */

async function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    const dryRun = !!args['dry-run'];
    const token = process.env['GITHUB_TOKEN'];
    const owner = process.env['GITHUB_OWNER'];
    const repo = process.env['GITHUB_REPO'];
    if (!token || !owner || !repo) {
      console.error('Missing required env vars: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO');
      process.exit(1);
    }
    const { Octokit } = await import('@octokit/rest');
    const octokit = new Octokit({ auth: token });
    const backlogPath = path.resolve('agentBacklog.json');
    const backlog = JSON.parse(fs.readFileSync(backlogPath, 'utf-8'));
    const actionable = [
      ...(Array.isArray(backlog.inProgress) ? backlog.inProgress : []),
      ...(Array.isArray(backlog.planned) ? backlog.planned : [])
    ];
    // Map: feature name -> { status, ... }
    const featureMap = new Map();
    for (const item of actionable) {
      if (item && typeof item === 'object' && 'feature' in item) featureMap.set(item.feature, item);
    }
    // Fetch all open issues with a special label
    const label = 'nootropic-backlog';
    const issues = await octokit.paginate(octokit.issues.listForRepo, {
      owner, repo, state: 'open', labels: label, per_page: 100
    });
    const issueMap = new Map();
    for (const issue of issues) {
      if (issue && typeof issue === 'object' && 'title' in issue && issue.title) issueMap.set(issue.title, issue);
    }
    // Sync: create/update/close as needed
    const actions = [];
    // --- 2025 IssueOps best practices: sync status as labels for richer filtering ---
    const statusLabels = ['planned', 'in progress', 'complete'];
    // 1. Create or update issues for all actionable features
    for (const [feature, item] of featureMap.entries()) {
      const title = feature;
      const body = `**Feature:** ${feature}\n\n${(item.rationale ?? item.description) || ''}\n\nStatus: ${item.status ?? 'planned'}\n\n(Managed by nootropic IssueOps automation)`;
      const labels = [label, item.status && statusLabels.includes(item.status) ? item.status : 'planned'];
      if (issueMap.has(title)) {
        // Update if body/status/labels changed
        const issue = issueMap.get(title);
        const currentLabels = (issue.labels ?? []).map((l: unknown) => typeof l === 'string' ? l : (l as { name?: string }).name as string).filter((l: string): l is string => typeof l === 'string');
        const missingLabels = labels.filter(l => !currentLabels.includes(l));
        const extraLabels = currentLabels.filter((l: string) => statusLabels.includes(l) && !labels.includes(l));
        if (issue.body !== body) {
          actions.push({ type: 'update', number: issue.number, title, body });
          if (!dryRun) await octokit.issues.update({ owner, repo, issue_number: issue.number, body });
        }
        if (missingLabels.length > 0) {
          actions.push({ type: 'addLabels', number: issue.number, labels: missingLabels });
          if (!dryRun) await octokit.issues.addLabels({ owner, repo, issue_number: issue.number, labels: missingLabels });
        }
        for (const l of extraLabels) {
          actions.push({ type: 'removeLabel', number: issue.number, label: l });
          if (!dryRun) await octokit.issues.removeLabel({ owner, repo, issue_number: issue.number, name: l });
        }
        issueMap.delete(title);
      } else {
        // Create new issue
        actions.push({ type: 'create', title, body, labels });
        if (!dryRun) await octokit.issues.create({ owner, repo, title, body, labels });
      }
    }
    // 2. Close issues for features no longer in actionable backlog
    for (const [title, issue] of issueMap.entries()) {
      actions.push({ type: 'close', number: issue.number, title });
      if (!dryRun) await octokit.issues.update({ owner, repo, issue_number: issue.number, state: 'closed' });
    }
    // Escalate hotspots and stale items
    const backlogTodos = Array.isArray(backlog.backlog) ? backlog.backlog : [];
    for (const todo of backlogTodos) {
      if (todo && typeof todo === 'object' && 'id' in todo && typeof todo.id === 'string' && todo.id.startsWith('todo:') && (todo.aiSuggestedPriority === 'top' || todo.stale === true)) {
        const title = todo.description?.slice(0, 80) || todo.id;
        const body = `**TODO:** ${todo.description}\n\nFile: ${todo.file || todo.id.split(':')[1]}\n\nPriority: ${todo.aiSuggestedPriority || 'normal'}\nStale: ${todo.stale ? 'yes' : 'no'}\n\n(Managed by nootropic IssueOps automation)`;
        const labels = [label];
        if (todo.aiSuggestedPriority === 'top') labels.push('nootropic-hotspot');
        if (todo.stale === true) labels.push('nootropic-stale');
        if (issueMap.has(title)) {
          const issue = issueMap.get(title);
          if (issue.body !== body) {
            actions.push({ type: 'update', number: issue.number, title, body });
            if (!dryRun) await octokit.issues.update({ owner, repo, issue_number: issue.number, body });
          }
          // Add missing labels
          const currentLabels = (issue.labels ?? []).map((l: unknown) => typeof l === 'string' ? l : (l as { name?: string }).name as string).filter((l: string): l is string => typeof l === 'string');
          const missingLabels = labels.filter(l => !currentLabels.includes(l));
          for (const l of missingLabels) {
            actions.push({ type: 'addLabels', number: issue.number, labels: [l] });
            if (!dryRun) await octokit.issues.addLabels({ owner, repo, issue_number: issue.number, labels: [l] });
          }
          issueMap.delete(title);
        } else {
          actions.push({ type: 'create', title, body, labels });
          if (!dryRun) await octokit.issues.create({ owner, repo, title, body, labels });
        }
      }
    }
    // Summary
    if (actions.length === 0) {
      console.log('Backlog sync: No changes needed.');
    } else {
      for (const action of actions) {
        if (action.type === 'create') console.log(`Would create: ${action.title}`);
        if (action.type === 'update') console.log(`Would update: ${action.title}`);
        if (action.type === 'close') console.log(`Would close: ${action.title}`);
      }
      if (!dryRun) console.log('Backlog sync: Actions completed.');
    }
    printResult('Backlog sync completed successfully.', Boolean(args['json']));
  } catch (e: unknown) {
    printError(e instanceof Error ? e.message : String(e), Boolean(args['json']));
  }
}

main(); 