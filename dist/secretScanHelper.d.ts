type SecretScanResult = {
    tool: string | null;
    findings: unknown[];
    error: string | null;
};
declare function runSecretScan(): Promise<SecretScanResult>;
declare function getSecretScanReport(): Promise<SecretScanResult>;
export { runSecretScan, getSecretScanReport };
