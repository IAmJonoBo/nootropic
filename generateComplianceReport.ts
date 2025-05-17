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
import fs from 'fs';
// import path from 'path'; // Removed unused import
// @ts-ignore
import { parseCliArgs, printUsage, printResult, printError } from '../utils/cliHelpers.js';

const SECRET_SCAN_PATHS = [
  'nootropic/secret-scan-report.json',
  'nootropic/secretScanReport.json',
  '.nootropic-cache/secret-scan-report.json',
  '.nootropic-cache/secretScanReport.json',
];
const AUDIT_LOG_PATH = '.nootropic-cache/key-audit-log.jsonl';
const OUT_MD = '.nootropic-cache/compliance-report.md';
const OUT_JSON = '.nootropic-cache/compliance-report.json';

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
    .map(line => { try { return JSON.parse(line); } catch { return { raw: line }; } });
}

function readSecretScan(): unknown {
  const p = findFirstExisting(SECRET_SCAN_PATHS);
  if (!p) return null;
  try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return null; }
}

function renderMarkdown(scan: unknown, audit: unknown[]): string {
  let md = '# 🛡️ nootropic Compliance Report\n\n';
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += '## Secret Scan Results\n';
  if (!scan) {
    md += '- No secret scan report found.\n';
  } else if (typeof scan === 'object' && scan !== null && 'error' in scan) {
    md += `- Error: ${(scan as Record<string, unknown>)['error']}\n`;
  } else if (typeof scan === 'object' && scan !== null) {
    const s = scan as Record<string, unknown>;
    md += `- Tool: ${s['tool'] ?? 'unknown'}\n`;
    const findings = Array.isArray(s['findings']) ? s['findings'] as unknown[] : [];
    md += `- Findings: ${findings.length}\n`;
    if (findings.length) {
      md += '\n### Findings\n';
      for (const f of findings.slice(0, 10)) {
        md += `- ${JSON.stringify(f).slice(0, 500)}\n`;
      }
      if (findings.length > 10) md += `- ...and ${findings.length - 10} more.\n`;
    }
  }
  md += '\n## Key Audit Log\n';
  if (!audit.length) {
    md += '- No audit log entries found.\n';
  } else {
    md += `- Total entries: ${audit.length}\n`;
    md += '\n| Timestamp | Operation | Provider | KeyId | Status |\n|-----------|-----------|----------|-------|--------|\n';
    for (const e of audit.slice(-10)) {
      if (typeof e === 'object' && e !== null) {
        const entry = e as Record<string, unknown>;
        md += `| ${entry['timestamp'] ?? ''} | ${entry['operation'] ?? ''} | ${entry['provider'] ?? ''} | ${entry['keyId'] ?? ''} | ${entry['status'] ?? ''} |\n`;
      }
    }
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