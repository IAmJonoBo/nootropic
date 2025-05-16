#!/usr/bin/env tsx
// @ts-expect-error TS(6133): 'fs' is declared but its value is never read.
import fs from 'fs';
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const options = {
  help: { desc: 'Show help', type: 'boolean' },
  json: { desc: 'Output in JSON format', type: 'boolean' }
};

// @ts-expect-error TS(6133): 'CHECKLIST_PATHS' is declared but its value is nev... Remove this comment to see the full error message
const CHECKLIST_PATHS = [
  path.resolve('onboarding-checklist.md'),
  path.resolve('.nootropic-cache/onboarding-checklist.md')
];

function getOnboardingSteps() {
  // TODO: Aggregate onboarding steps from describe registry, README.md, and CONTRIBUTING.md
  // For now, scaffold with best-practice steps
  return [
    'Clone the repository and install dependencies with `pnpm install`.',
    'Use the Node version in `.nvmrc`.',
    'Run `pnpm run validate-describe-registry` and `pnpm run docs:check-sync` to ensure code/doc sync.',
    'Review the canonical sources: `docs/docManifest.json` and `.nootropic-cache/describe-registry.json`.',
    'Run `pnpm run lint` and `pnpm run lint:tsdoc` to check code and TSDoc style.',
    'Run `pnpm test` to ensure all tests pass.',
    'Review onboarding, automation, and feature table docs in README.md and CONTRIBUTING.md.',
    'Check the Automation Scripts table in README.md for available scripts and usage.',
    'Review the latest backlog summary in `.nootropic-cache/backlog-summary.json`.',
    'If contributing a new feature, export a `describe()` and update docs.',
    'If adding a new capability, ensure it is registry/describe/health compliant.',
    'Run `pnpm tsx scripts/generateOnboardingChecklist.ts` to refresh this checklist.'
  ];
}

async function main() {
  // @ts-expect-error TS(6133): 'args' is declared but its value is never read.
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) {
    printUsage('Usage: pnpm tsx scripts/generateOnboardingChecklist.ts [--help] [--json]', options);
    return;
  }
  try {
    const steps = getOnboardingSteps();
    const checklistMd = [
      '# Onboarding Checklist (Auto-Generated)\n',
      'Follow these steps to get started with nootropic:',
      '',
      // @ts-expect-error TS(2304): Cannot find name 's'.
      ...steps.map((s) => `- [ ] ${s}`),
      '',
      // @ts-expect-error TS(2304): Cannot find name 'pnpm'.
      '> This checklist is auto-generated. Run `pnpm tsx scripts/generateOnboardingChecklist.ts` to refresh.'
    ].join('\n');
    if (args['json']) {
      printResult({ checklist: steps });
      for (const p of CHECKLIST_PATHS) fs.writeFileSync(p.replace(/\.md$/, '.json'), JSON.stringify({ checklist: steps }, null, 2));
    } else {
      console.log(checklistMd);
      for (const p of CHECKLIST_PATHS) fs.writeFileSync(p, checklistMd);
    }
  } catch (err) {
    printError(err);
    process.exit(1);
  }
}

main(); 