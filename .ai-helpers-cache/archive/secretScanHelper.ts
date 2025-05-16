// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
// @ts-expect-error TS(2307): Cannot find module 'path' or its corresponding typ... Remove this comment to see the full error message
import path from 'path';
// @ts-expect-error TS(2307): Cannot find module 'url' or its corresponding type... Remove this comment to see the full error message
import { fileURLToPath } from 'url';
// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECRET_SCAN_REPORT_PATH = path.join(__dirname, 'secret-scan-report.json');
// @ts-expect-error TS(2305): Module '"./utils.js"' has no exported member 'writ... Remove this comment to see the full error message
import { writeJsonSafe, readJsonSafe } from './utils.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
// @ts-expect-error TS(2307): Cannot find module 'child_process' or its correspo... Remove this comment to see the full error message
import { execSync } from 'child_process';

type SecretScanResult = {
  tool: string | null;
  findings: unknown[];
  error: string | null;
};

// --- Run trufflehog or gitleaks if available ---
async function runSecretScan(): Promise<SecretScanResult> {
  // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
  let result: SecretScanResult = { tool: null, findings: [], error: null };
  try {
    // Try trufflehog first
    // @ts-expect-error TS(2300): Duplicate identifier '(Missing)'.
    execSync('which trufflehog', { stdio: 'ignore' });
    // @ts-expect-error TS(2304): Cannot find name 'out'.
    const out = execSync('trufflehog filesystem --json .', { encoding: 'utf-8' });
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    result.tool = 'trufflehog';
    // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
    result.findings = out.split('\n').filter(Boolean).map((line: string) => {
      // @ts-expect-error TS(2304): Cannot find name 'line'.
      try { return JSON.parse(line); } catch { return { raw: line }; }
    });
  } catch {
    try {
      // @ts-expect-error TS(2300): Duplicate identifier '(Missing)'.
      execSync('which gitleaks', { stdio: 'ignore' });
      // @ts-expect-error TS(2304): Cannot find name 'out'.
      const out = execSync('gitleaks detect --source . --report-format json', { encoding: 'utf-8' });
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      result.tool = 'gitleaks';
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      result.findings = JSON.parse(out).findings ?? [];
    } catch {
      // @ts-expect-error TS(18004): No value exists in scope for the shorthand propert... Remove this comment to see the full error message
      result.error = 'No secret scanning tool found (trufflehog or gitleaks) or scan failed.';
    }
  }
  // @ts-expect-error TS(2304): Cannot find name 'result'.
  await writeJsonSafe(SECRET_SCAN_REPORT_PATH, result);
  // @ts-expect-error TS(2304): Cannot find name 'result'.
  return result;
}

// --- Get last scan report ---
async function getSecretScanReport(): Promise<SecretScanResult> {
  // @ts-expect-error TS(2304): Cannot find name 'report'.
  const report = await readJsonSafe(SECRET_SCAN_REPORT_PATH, null);
  // @ts-expect-error TS(7006): Parameter '(Missing)' implicitly has an 'any' type... Remove this comment to see the full error message
  if (!report) return { tool: null, findings: [], error: 'No report found.' };
  // @ts-expect-error TS(2304): Cannot find name 'report'.
  return report;
}

// --- ESM-compatible CLI entrypoint ---
// @ts-expect-error TS(1470): The 'import.meta' meta-property is not allowed in ... Remove this comment to see the full error message
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    const { args } = parseArgs(process.argv);
    const cmd = args[0];
    if (cmd === 'help' || args.includes('--help')) {
      printHelp('pnpm tsx nootropic/secretScanHelper.ts', 'Run secret scanning with trufflehog or gitleaks.');
      process.exit(0);
    }
    try {
      const result = await runSecretScan();
      if (result.error) {
        console.log('Secret scan failed:', result.error);
      } else {
        // @ts-expect-error TS(1101): 'with' statements are not allowed in strict mode.
        console.log(`Secret scan complete with ${result.findings.length} findings using ${result.tool}.`);
      }
    } catch (err) {
      handleCliError(err);
    }
  })();
}

export { runSecretScan, getSecretScanReport }; 