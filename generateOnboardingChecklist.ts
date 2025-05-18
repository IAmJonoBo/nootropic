#!/usr/bin/env tsx
import path from 'path';
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../src/utils/cliHelpers.js';
import fs from 'fs';

const options = {
  help: { desc: 'Show help', type: 'boolean' },
  json: { desc: 'Output in JSON format', type: 'boolean' }
};

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
      ...steps.map((s) => `- [ ] ${s}`),
      '',
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