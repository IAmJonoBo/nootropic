# Security & Secret Scanning Integration Guide

[//]: # (Rebranding note: This file was updated from 'AI-Helpers' to 'nootropic'. Legacy references are archived in .ai-helpers-cache/archive/ for rollback.)

This system allows agents to scan the codebase for secrets using trufflehog or gitleaks, and access results via CLI, HTTP, and WebSocket APIs.

## 1. Running a Secret Scan (CLI)

```sh
pnpm tsx nootropic/secretScanHelper.ts
```

- Results are written to `nootropic/secret-scanReport.json`.

## 2. HTTP API

Get the latest secret scan report:
```
GET http://localhost:4000/secret-scan
```

Response:
```
{
  "tool": "trufflehog",
  "findings": [ ... ],
  "error": null
}
```

## 3. WebSocket API

Request the latest secret scan report:
```
{ "type": "getSecretScanReport" }
```

Response:
```
{ "type": "secretScanReport", "data": { ... } }
```

---

- The latest scan results are also included in the context snapshot as `secretScan`.
- If neither trufflehog nor gitleaks is available, the report will indicate an error. 