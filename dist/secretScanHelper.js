// nootropic is for Cursor agents only. This file is intentionally excluded from main TSConfig/ESLint as an ad hoc helper. See Rocketship conventions.
import { SECRET_SCAN_REPORT_PATH } from './paths.js';
import { writeJsonSafe, readJsonSafe } from './utils.js';
import { parseArgs, printHelp, handleCliError } from './cliHandler.js';
import { execSync } from 'child_process';
// --- Run trufflehog or gitleaks if available ---
async function runSecretScan() {
    let result = { tool: null, findings: [], error: null };
    try {
        // Try trufflehog first
        execSync('which trufflehog', { stdio: 'ignore' });
        const out = execSync('trufflehog filesystem --json .', { encoding: 'utf-8' });
        result.tool = 'trufflehog';
        result.findings = out.split('\n').filter(Boolean).map((line) => {
            try {
                return JSON.parse(line);
            }
            catch {
                return { raw: line };
            }
        });
    }
    catch {
        try {
            execSync('which gitleaks', { stdio: 'ignore' });
            const out = execSync('gitleaks detect --source . --report-format json', { encoding: 'utf-8' });
            result.tool = 'gitleaks';
            result.findings = JSON.parse(out).findings || [];
        }
        catch {
            result.error = 'No secret scanning tool found (trufflehog or gitleaks) or scan failed.';
        }
    }
    await writeJsonSafe(SECRET_SCAN_REPORT_PATH, result);
    return result;
}
// --- Get last scan report ---
async function getSecretScanReport() {
    const report = await readJsonSafe(SECRET_SCAN_REPORT_PATH, null);
    if (!report)
        return { tool: null, findings: [], error: 'No report found.' };
    return report;
}
// --- ESM-compatible CLI entrypoint ---
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
            }
            else {
                console.log(`Secret scan complete with ${result.findings.length} findings using ${result.tool}.`);
            }
        }
        catch (err) {
            handleCliError(err);
        }
    })();
}
export { runSecretScan, getSecretScanReport };
