#!/usr/bin/env tsx
// Compliance Report Generator: Aggregates secret scan results and key audit logs for compliance and auditability.
// - Outputs Markdown and JSON reports for CI/CD and human/LLM review.
// - References Vault/Kaniko/ArgoCD integration and best practices.
/**
 * generateComplianceReport.ts
 *
 * Generates a compliance report for all registered capabilities and modules.
 *
 * Usage:
 *   pnpm tsx scripts/generateComplianceReport.ts [--help] [--json]
 *
 * Flags:
 *   --help   Show usage information and exit
 *   --json   Output results in JSON format
 *
 * Output:
 *   Human-readable or JSON status message. Writes compliance report to the appropriate location.
 *
 * Troubleshooting:
 *   - Ensure all capabilities and modules are registered and up to date.
 *   - Use --json for machine-readable output in CI/CD.
 *   - For errors, check for missing or invalid compliance data.
 *
 * Example:
 *   pnpm tsx scripts/generateComplianceReport.ts --json
 *
 * LLM/AI Usage Hints:
 *   - "Show usage for generateComplianceReport script."
 *   - "List all scripts that generate compliance reports."
 *   - "How do I check compliance for all capabilities?"
 *   - "What does generateComplianceReport do?"
 */
// @ts-expect-error TS(2307): Cannot find module 'fs' or its corresponding type ... Remove this comment to see the full error message
import fs from 'fs';
// import path from 'path'; // Removed unused import
// @ts-expect-error TS(2305): Module '"../utils/cliHelpers.js"' has no exported ... Remove this comment to see the full error message
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const SECRET_SCAN_PATHS = [
  'nootropic/secret-scan-report.json',
  'nootropic/secretScanReport.json',
  '.nootropic-cache/secret-scan-report.json',
  '.nootropic-cache/secretScanReport.json',
];
const AUDIT_LOG_PATH = '.nootropic-cache/key-audit-log.jsonl';
// @ts-expect-error TS(6133): 'OUT_MD' is declared but its value is never read.
const OUT_MD = '.nootropic-cache/compliance-report.md';
// @ts-expect-error TS(6133): 'OUT_JSON' is declared but its value is never read... Remove this comment to see the full error message
const OUT_JSON = '.nootropic-cache/compliance-report.json';

// @ts-expect-error TS(6133): 'usage' is declared but its value is never read.
const usage = 'Usage: pnpm tsx scripts/generateComplianceReport.ts [--help] [--json]';
const options = {
  json: { desc: 'Output in JSON format', type: 'boolean' },
};

function findFirstExisting(paths: string[]): string | null {
  for (const p of paths) if (fs.existsSync(p)) return p;
  return null;
}

function readAuditLog(): unknown[] {
  if (!fs.existsSync(AUDIT_LOG_PATH)) return [];
  return fs.readFileSync(AUDIT_LOG_PATH, 'utf-8')
    .split('\n')
    .filter(Boolean)
    // @ts-expect-error TS(2304): Cannot find name 'line'.
    .map(line => { try { return JSON.parse(line); } catch { return { raw: line }; } });
}

function readSecretScan(): unknown {
  const p = findFirstExisting(SECRET_SCAN_PATHS);
  if (!p) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

// @ts-expect-error TS(6133): 'scan' is declared but its value is never read.
function renderMarkdown(scan: unknown, audit: unknown[]): string {
  // @ts-expect-error TS(6133): 'md' is declared but its value is never read.
  let md = '# 🛡️ nootropic Compliance Report\n\n';
  // @ts-expect-error TS(2304): Cannot find name 'n'.
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += '## Secret Scan Results\n';
  if (!scan) {
    md += '- No secret scan report found.\n';
  } else if (scan.error) {
    // @ts-expect-error TS(2363): The right-hand side of an arithmetic operation mus... Remove this comment to see the full error message
    md += `- Error: ${scan.error}\n`;
  } else {
    // @ts-expect-error TS(2304): Cannot find name 'Tool'.
    md += `- Tool: ${scan.tool ?? 'unknown'}\n`;
    // @ts-expect-error TS(2304): Cannot find name 'Findings'.
    md += `- Findings: ${scan.findings?.length ?? 0}\n`;
    if (scan.findings?.length) {
      md += '\n### Findings\n';
      for (const f of scan.findings.slice(0, 10)) {
        // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
        md += `- ${JSON.stringify(f).slice(0, 500)}\n`;
      }
      // @ts-expect-error TS(2304): Cannot find name 'and'.
      if (scan.findings.length > 10) md += `- ...and ${scan.findings.length - 10} more.\n`;
    }
  }
  md += '\n## Key Audit Log\n';
  if (!audit.length) {
    md += '- No audit log entries found.\n';
  } else {
    // @ts-expect-error TS(2304): Cannot find name 'Total'.
    md += `- Total entries: ${audit.length}\n`;
    md += '\n| Timestamp | Operation | Provider | KeyId | Status |\n|-----------|-----------|----------|-------|--------|\n';
    for (const e of audit.slice(-10)) {
      // @ts-expect-error TS(2581): Cannot find name '$'. Do you need to install type ... Remove this comment to see the full error message
      md += `| ${e.timestamp} | ${e.operation} | ${e.provider} | ${e.keyId} | ${e.status} |\n`;
    }
    // @ts-expect-error TS(2304): Cannot find name 'and'.
    if (audit.length > 10) md += `- ...and ${audit.length - 10} more.\n`;
  }
  md += '\n---\n';
  md += '## References & Next Steps\n';
  md += '- [Vault Integration Guide](scripts/vaultIntegrationGuide.md)\n';
  md += '- [Kaniko Build Example](scripts/kanikoBuildExample.md)\n';
  md += '- [ArgoCD Integration Guide](scripts/argoCdIntegrationGuide.md)\n';
  md += '\n*Planned: Automated compliance reporting, Vault/ArgoCD/Kaniko integration, and describe() registry support for compliance.*\n';
  return md;
}

async function main() {
  const { args, showHelp } = parseCliArgs({ options });
  if (showHelp) return printUsage(usage, options);
  try {
    const scan = readSecretScan();
    const audit = readAuditLog();
    const report = {
      generated: new Date().toISOString(),
      secretScan: scan,
      auditLog: audit,
      references: [
        'scripts/vaultIntegrationGuide.md',
        'scripts/kanikoBuildExample.md',
        'scripts/argoCdIntegrationGuide.md',
      ],
    };
    fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf-8');
    fs.writeFileSync(OUT_MD, renderMarkdown(scan, audit), 'utf-8');
    printResult('Compliance report generated successfully.', args['json']);
    process.exit(0);
  } catch (e) {
    printError(e, args['json']);
    process.exit(1);
  }
}

main(); 