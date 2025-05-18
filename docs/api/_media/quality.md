# Quality Tools & LLM/Agent Integration

nootropic provides native, LLM/agent-friendly integration with modern quality tools, including Semgrep OSS and SonarQube. All tools are self-describing, configurable, and accessible via the quality/selfcheck.ts plugin system.

## Semgrep OSS

- **Enable:** Set `AIHELPERS_SEMGREP=1` in your environment or CI config.
- **Usage:**
  - Run all enabled quality checks: `pnpm run quality`
  - Semgrep will scan the codebase using the OSS engine and output findings as JSON, validated with Zod.
  - All findings are printed and available to LLM/agent workflows.
- **LLM/Agent APIs:**
  - Agents can call:
    - `getSemgrepFindings()` — List all findings in a normalized format (id, file, line, rule, message, etc.)
    - `explainSemgrepFinding(finding)` — Get a natural-language explanation for a finding.
    - `suggestSemgrepFix(finding)` — Get a suggested fix and rationale (LLM-powered).
    - `autoFixSemgrepFinding(finding, codeContext?)` — Attempt to auto-fix the finding using LLM/codegen. Gathers code context, calls LLM, generates a patch and explanation, validates syntax/tests, and returns the result. (Production-ready API; see below.)
  - Example workflow:
    1. List findings: `const findings = await getSemgrepFindings();`
    2. Explain: `const explanation = await explainSemgrepFinding(findings[0]);`
    3. Suggest fix: `const fix = await suggestSemgrepFix(findings[0]);`
    4. Auto-fix: `const result = await autoFixSemgrepFinding(findings[0]);`
  - See `quality/selfcheck.ts` for API details and describe() output.
  - **Note:** SonarQube Web API integration and feedback/memories system are planned next.
- **Describe API:**
  - The Semgrep plugin is registered in the describe() output of `quality/selfcheck.ts`.
  - LLMs/agents can query describe() to discover Semgrep capabilities, config, and usage.
- **LLM/Agent Workflows:**
  - Agents can detect if Semgrep is enabled, trigger scans, and interpret findings for code generation, refactoring, or self-healing.
  - Example: "Show all Semgrep findings for this file and suggest a fix."
- **Troubleshooting:**
  - Ensure Semgrep CLI is installed and available in PATH.
  - Findings are validated with Zod; invalid output will fail the check and print errors.

## Semgrep Feedback/Memories System

- **Purpose:** Enables agents and users to triage findings, add rationale, and filter noise using a persistent feedback/memories system.
- **APIs:**
  - `addSemgrepMemory(findingId, memory)` — Add feedback/memory to a finding (e.g., triaged, false positive, custom rationale).
  - `listSemgrepMemories(findingId)` — List all feedback/memories for a finding.
  - `applySemgrepMemories(findings)` — Attach memories to findings for noise filtering/context-aware remediation.
  - `llmTriageSemgrepFinding(finding, memories?)` — LLM-powered triage: classifies as true positive, false positive, or needs review using code context and memories. Triage results are persisted as memories.
- **Storage:** Memories are persisted in `.nootropic-cache/semgrep-memories.json`.
- **Best Practices:** Implements 2025 SAST/LLM best practices for feedback loops, noise filtering, and context-aware remediation. See Semgrep blog and arXiv:2504.13474.
- **Example Workflow:**
  1. Agent scans codebase and lists findings.
  2. User/agent triages a finding, adds a memory (e.g., "false positive due to internal context").
  3. Future scans apply memories to filter or explain findings.
- **Reference:** See `quality/selfcheck.ts` for implementation details.

## SonarQube

- **Enable:** Set `AIHELPERS_SONARQUBE=1`.
- **Usage:** Same as above; see describe() for details.

## SonarQube Web API Integration

- **Enable:** Set `AIHELPERS_SONARQUBE_API_URL` and `AIHELPERS_SONARQUBE_TOKEN` in your environment or CI config.
- **Usage:**
  - Import and call the exported APIs from `quality/sonarqubeApi.ts`.
  - SonarQube findings are fetched via the Web API, normalized, and available to LLM/agent workflows.
- **LLM/Agent APIs:**
  - Agents can call:
    - `getSonarQubeFindings(projectKey?)` — List all findings in a normalized format (id, file, line, rule, message, etc.)
    - `explainSonarQubeFinding(finding)` — Get a natural-language explanation for a finding.
    - `suggestSonarQubeFix(finding)` — Get a suggested fix and rationale (LLM-powered).
    - `autoFixSonarQubeFinding(finding)` — Attempt to auto-fix the finding using LLM/codegen. Gathers code context, calls LLM, generates a patch and explanation, validates syntax/tests, and returns the result. (Production-ready stub; see roadmap for advanced workflows.)
- **Troubleshooting:**
  - Ensure the SonarQube Web API is accessible and the token is valid.
  - Findings are normalized and validated; see logs for errors.
- **References:**
  - [SonarQube Web API](https://docs.sonarqube.org/latest/user-guide/web-api/)
  - [AI CodeFix](https://www.sonarsource.com/solutions/ai/ai-codefix/)
  - [LLM Code Generation](https://www.sonarsource.com/learn/llm-code-generation/)

---

## Parity with Semgrep OSS

- SonarQube and Semgrep OSS integrations both expose LLM/agent APIs for listing, explaining, suggesting, and auto-fixing findings.
- Both are Zod-validated, OTel-instrumented, and docs-first.
- See `quality/sonarqubeApi.ts` and `quality/selfcheck.ts` for implementation details.

## Other Quality Tools

- See `quality/selfcheck.ts` and the main README for the full list of tools, configuration, and describe() registry.

---

For more, see `quality/selfcheck.ts` and the describe() output for each tool.

## Shared SAST Feedback/Memories Schema

- **Purpose:** Provides a unified, extensible schema for feedback/memories across all SAST tools (Semgrep, SonarQube, etc.).
- **Schema:** See `types/SastFeedbackMemory.ts` for the TypeScript interface and Zod schema.
- **Fields:** id, tool, ruleId, file, line, memoryType, rationale, user, timestamp, triage, tags, project, organization, context, version.
- **Usage:**
  - All feedback/memories for Semgrep and SonarQube are stored and validated using this schema.
  - APIs: `addSemgrepMemory`, `listSemgrepMemories`, `applySemgrepMemories`, `addSonarQubeMemory`, `listSonarQubeMemories`, `applySonarQubeMemories`.
  - Enables cross-tool, organization-wide feedback, deduplication, and advanced LLM-powered triage.
- **Best Practices:**
  - Use the shared schema for all new feedback/memories features.
  - Deduplicate and share feedback across tools and projects for better noise filtering and remediation.
- **Example:**
  ```ts
  import { addSemgrepMemory, listSonarQubeMemories } from 'quality/selfcheck';
  await addSemgrepMemory('semgrep:rule:file:42', { memoryType: 'triage', rationale: 'False positive', triage: 'false_positive' });
  const memories = await listSonarQubeMemories('sonarqube:rule:file:42');
  ```

In Semgrep and SonarQube sections, reference the shared schema and cross-tool compatibility.

## Cross-Tool & Organization-Wide Feedback/Memories APIs

- **Purpose:** Aggregate, deduplicate, and list feedback/memories across all SAST tools (Semgrep, SonarQube, etc.).
- **APIs:**
  - `listAllSastMemories()` — List all deduplicated memories across tools.
  - `getMemoriesForFile(file)` — Get all memories for a file.
  - `getMemoriesForRule(ruleId)` — Get all memories for a rule.
- **Canonical View:** All deduplicated memories are stored in `.nootropic-cache/sast-memories.json`.
- **Best Practices:** Implements 2025 SAST/LLM best practices for noise filtering, deduplication, and org-wide knowledge sharing.
- **Example Usage:**
  ```ts
  import { listAllSastMemories, getMemoriesForFile } from '../utils/feedback/sastMemories';
  const all = await listAllSastMemories();
  const fileMemories = await getMemoriesForFile('src/foo.ts');
  ```

## Remote/Org-Wide SAST Feedback Storage & Sync (2025+)

nootropic supports remote/org-wide storage and synchronization of SAST feedback/memories, enabling cross-tool, organization-wide triage, deduplication, and sharing. This is achieved via a pluggable remote adapter interface (`utils/feedback/sastMemoriesRemote.ts`) supporting S3, REST API, or custom backends.

### Key APIs
- **syncWithRemote(localMemories, remoteAdapter):** Syncs local memories with remote, merging and deduplicating using canonical IDs.
- **mergeWithRemote(local, remote):** Deterministically merges two memory sets, deduplicating by canonical ID.
- **Remote Adapter Interface:** Implement or extend `SastMemoriesRemoteAdapter` for your org's storage (S3, REST, etc.).

### Best Practices
- Use OTel tracing for all remote operations for observability.
- Secure remote storage with OIDC/JWT and encryption.
- Use LLM-powered or deterministic deduplication for cross-tool feedback.
- Document and enforce schema with Zod.

### Example Usage
```ts
import { syncWithRemote } from '../utils/feedback/sastMemories';
import { LocalOnlyRemoteAdapter } from '../utils/feedback/sastMemoriesRemote';

const merged = await syncWithRemote(localMemories, new LocalOnlyRemoteAdapter());
```

See also: [CONTRIBUTING.md](../CONTRIBUTING.md), [README.md](../README.md)

## Security: OIDC/JWT for Remote SAST Feedback APIs (2025+)

All remote/org-wide SAST feedback APIs require secure authentication and authorization using OIDC-compliant JWTs. The canonical approach uses RS256-signed access tokens (type: 'at+jwt') validated with the `utils/jwtValidation.ts` utility.

### Required Claims
- `iss`: Issuer (must match configured remote issuer)
- `aud`: Audience (must match configured remote audience)
- `exp`: Expiry (must be in the future)
- `sub`: Subject (user or service principal)
- `typ`: Token type (should be 'at+jwt')
- `org`: (optional) Organization context

### Validation Flow
- All remote adapter methods require a valid JWT (see `setJwt(token)`)
- JWT is validated using trusted JWKS, issuer, audience, and allowed algorithms
- Claims are checked and used for access control
- All validation is traced with OTel

### Adapter Security Model
- Pluggable adapters must enforce access control using validated claims
- Never trust tokens without validation
- All secrets/keys must be managed via environment variables or secret managers
- All remote operations are traced and logged

### References
- [OIDC Certified Libraries](https://openid.net/developers/certified-openid-connect-implementations/)
- [JWT Security Pitfalls](https://42crunch.com/7-ways-to-avoid-jwt-pitfalls/)
- [jwtValidation.ts usage](../utils/jwtValidation.ts)

## Encryption-at-Rest & Secrets Management for Remote SAST Feedback (2025+)

All remote/org-wide SAST feedback storage is encrypted-at-rest using AES-256-GCM. Encryption keys are managed via a pluggable secrets manager interface, supporting cloud KMS (AWS KMS, GCP KMS, Azure Key Vault), HashiCorp Vault, or local .env fallback for development. Keys must never be hardcoded or stored in code.

### Key Points
- **AES-256-GCM** is used for encrypting all memories before upload and decrypting after download.
- **Secrets Manager:** The `utils/security/secretsManager.ts` utility provides a standard interface for key retrieval, rotation, and secure storage. In production, use a cloud KMS or Vault implementation.
- **Key Rotation:** Rotate encryption keys regularly. Use KMS/Vault auto-rotation features where possible.
- **Access Control:** Only authorized agents/services (validated by OIDC/JWT) may access keys and perform encryption/decryption.
- **OTel Tracing:** All encryption, decryption, and secrets access operations are traced for auditability.

### Example Usage
```ts
import { LocalSecretsManager } from '../utils/security/secretsManager';
import { LocalOnlyRemoteAdapter } from '../utils/feedback/sastMemoriesRemote';

const secrets = new LocalSecretsManager();
const adapter = new LocalOnlyRemoteAdapter();
adapter.setSecretsManager(secrets);
// ...
```

### Best Practices
- Never store secrets in code or repo. Use environment variables or a secrets manager.
- Use cloud KMS or Vault for production deployments.
- Rotate keys and audit access regularly.
- Validate all secrets with Zod.

See also: [CONTRIBUTING.md](../CONTRIBUTING.md), [README.md](../README.md)

## KMS/Vault Integration for SAST Feedback Encryption (2025+)

All remote/org-wide SAST feedback storage supports integration with cloud KMS (AWS KMS, GCP KMS, Azure Key Vault) and HashiCorp Vault for envelope encryption, key rotation, and audit logging. The `KmsVaultSecretsManager` implements a pluggable interface for secure key management, supporting:

- **Envelope Encryption:** Data keys (DEKs) are generated for each memory set and encrypted with a KMS/Vault-managed key (KEK).
- **Key Rotation:** Rotate DEKs frequently and KEKs per compliance via KMS/Vault APIs.
- **Audit Logging:** All key operations (encrypt, decrypt, rotate) are traced with OpenTelemetry for auditability.
- **Zod Validation:** All config and secrets are validated at runtime.
- **Best Practices:** Never store keys in code or config. Use KMS/Vault for all production secrets. Automate rotation and audit. See [Cloud Security Alliance: Key Management Lifecycle Best Practices](https://cloudsecurityalliance.org/artifacts/key-management-lifecycle-best-practices).

### Implementation Status (2025)
- **AWS KMS:** Implemented (envelope encryption, OTel audit logging, describe() function)
- **GCP, Azure, Vault:** Stubs present, implementation planned next

### Usage Example (AWS KMS)
```ts
import { KmsVaultSecretsManager } from '../utils/security/secretsManager';
const secrets = new KmsVaultSecretsManager({ provider: 'aws', keyId: '...', region: 'us-east-1' });
const dek = Buffer.from('...'); // 32-byte DEK
const encryptedDEK = await secrets.encryptDEK(dek);
const decryptedDEK = await secrets.decryptDEK(encryptedDEK);
```

### Usage
- Use `KmsVaultSecretsManager` for all remote/org-wide SAST feedback encryption.
- Set the secrets manager and JWT before using remote adapter methods.
- See `utils/secretsManager.ts` and `utils/feedback/sastMemoriesRemote.ts` for implementation details.

## Envelope Encryption & Provider-Specific KMS/Vault Support (2025+)

All remote/org-wide SAST feedback storage uses envelope encryption for maximum security and compliance. Each memory set is encrypted with a Data Encryption Key (DEK), which is itself encrypted with a Key Encryption Key (KEK) managed by a cloud KMS or Vault provider (AWS, GCP, Azure, HashiCorp Vault).

### How Envelope Encryption Works
- **DEK Generation:** A random DEK (AES-256-GCM) is generated for each memory set.
- **Data Encryption:** SAST memories are encrypted with the DEK.
- **DEK Encryption:** The DEK is encrypted with the KEK using the provider's KMS/Vault API.
- **Storage:** The encrypted data and encrypted DEK are stored together, along with provider and key metadata.
- **Decryption:** To decrypt, the KEK is used to decrypt the DEK, which is then used to decrypt the data.

### Provider Support
- **AWS KMS:** Use `@aws-sdk/client-kms` for encrypt/decrypt/rotate.
- **GCP KMS:** Use `@google-cloud/kms` for encrypt/decrypt/rotate.
- **Azure Key Vault:** Use `@azure/keyvault-keys` for encrypt/decrypt/rotate.
- **HashiCorp Vault:** Use `node-vault` or HTTP API for transit secrets engine.

### Audit Logging & Key Rotation
- All key operations (encrypt, decrypt, rotate) are traced with OpenTelemetry and logged for compliance.
- DEKs should be rotated frequently; KEKs per compliance policy.
- Audit logs must be retained and reviewed regularly.

### Compliance & Best Practices
- Follows PCI DSS, SOC 2, HIPAA, GDPR, and CSA recommendations.
- All config and secrets are Zod-validated at runtime.
- Use least privilege IAM/service principals for KMS/Vault access.
- Never store secrets in code or CI variables.

See [KmsVaultSecretsManager](../utils/security/secretsManager.ts) and [SastMemoriesRemoteAdapter](../utils/feedback/sastMemoriesRemote.ts) for implementation details.

## Required Secrets for CI Workflows

- All required secrets must be set in the repository or organization settings.
- Required secrets: SONARQUBE_ENABLED, RESEARCH_ENABLED, DOCTEST_ENABLED, AIREVIEW_ENABLED.
- Workflows will fail early if a required secret is missing or empty (see .github/workflows/lint-and-type.yml for enforcement pattern).
- For more, see CONTRIBUTING.md and [GitHub Actions: Using secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions).

## 🔐 VaultSecretsManager: Production-Ready Secrets Management

- **VaultSecretsManager** provides secure, production-ready secret storage, retrieval, and audit logging using HashiCorp Vault.
- All operations are audited and registry/describe/health compliant.
- Usage example:
  ```ts
  import { VaultSecretsManager } from 'nootropic/utils/security/secretsManager';
  const secrets = new VaultSecretsManager({ endpoint: 'http://localhost:8200', token: 's.xxxxx' });
  await secrets.getSecret('API_KEY');
  ```
- In production, configure Vault with proper policies and authentication (token, AppRole, etc.).
- See the describe registry for full API and compliance details.

## 🛡️ CI/CD Security & Compliance Automation

- **Secret scanning** (TruffleHog/Gitleaks, custom helper) runs before all other checks.
- **License/OSS compliance** and **doc/code sync** are enforced in CI.
- **Audit logging** for all key operations and secret accesses.
- **Badges** for compliance, secret scan status, and doc/code sync are planned for the main README and docs.
- Review audit logs regularly and enforce badge status in CI/CD for best practices.

For more, see `quality/selfcheck.ts` and the describe() output for each tool.

## Event-Driven Explainability and Mutation in Quality Workflows

All quality and agent workflows now emit structured events for explainability, rationale, and repair. See the `describe()` output for each agent/utility for event schemas and best practices.

- MutationAgent: mutation/repair/rollback events
- FormalVerifierAgent: spec/verification/repair events
- EnsembleAgent: rationale/voting/repair events
- FeedbackAgent: rationaleAggregated/feedbackSuggested events
- ReasoningLoopUtility: reasoningStep/explanation/repair events

### Best Practices
- Emit and consume events for all explainability and repair steps
- Use event schemas for LLM/AI-friendly observability

### Troubleshooting
If you see a CACHE_DIR warning, see the README troubleshooting section.

## SonarQube Feedback/Memories System

- **Purpose:** Enables agents and users to triage SonarQube findings, add rationale, and filter noise using a persistent feedback/memories system.
- **APIs:**
  - `addSonarQubeMemory(findingId, memory)` — Add feedback/memory to a SonarQube finding (e.g., triaged, rationale, tags).
  - `listSonarQubeMemories(findingId)` — List all feedback/memories for a finding.
  - `applySonarQubeMemories(findings)` — Attach memories to findings for context-aware remediation and deduplication.
- **Storage:** Memories are persisted in `.nootropic-cache/sonarqube-memories.json`.
- **Schema:** All memories are validated against the shared SASTFeedbackMemory schema. See `types/SastFeedbackMemory.ts`.
- **Example Usage:**
  ```ts
  import { addSonarQubeMemory, listSonarQubeMemories, applySonarQubeMemories } from 'nootropic/utils/feedback/sonarQubeMemories';
  await addSonarQubeMemory('sonarqube:rule:file:42', { memoryType: 'triage', rationale: 'False positive', triage: 'false_positive' });
  const memories = await listSonarQubeMemories('sonarqube:rule:file:42');
  const findingsWithMemories = await applySonarQubeMemories([{ id: 'sonarqube:rule:file:42', ... }]);
  ```
- **Discoverability:**
  - All feedback/memories APIs are included in the describe registry and are discoverable by LLMs, agents, and automation tools.
  - The describe registry is validated in CI and onboarding.
- **Best Practices:**
  - Use the shared schema for all new feedback/memories features.
  - Deduplicate and share feedback across tools and projects for better noise filtering and remediation.
  - Reference the describe registry for up-to-date API signatures and usage.

For more, see `quality/selfcheck.ts` and the describe() output for each tool.

## Shared Feedback/Memory Utility Architecture (2025+)

All SAST, Semgrep, SonarQube, and plugin feedback/memory utilities now share a robust, extensible BaseMemoryUtility. This base class provides:
- Pluggable, event-driven deduplication
- Generic aggregation (by key or custom logic)
- Optional event hooks (onAdd, onDeduplicate, onAggregate) for automation and extensibility
- Registry/describe/health compliance and LLM/AI-friendliness
- Unified describe registry discoverability for all feedback/memory APIs

See [pluginFeedback.md](capabilities/pluginFeedback.md) and the describe registry for up-to-date API signatures and usage.

## LLM/AI-Friendly Context Utilities (2025+)

All context utilities (RerankUtility, contextManager, cacheDir, shimiMemory) now export robust, LLM/AI-friendly describe() outputs with canonical promptTemplates and usage. This enables LLMs, agents, and automation to discover and use these utilities in a unified, future-proof way.

- **RerankUtility**: Bi-encoder + cross-encoder reranking, instruction-following, pluggable adapters. See [utils/context/RerankUtility.ts](../../utils/context/RerankUtility.ts).
- **contextManager**: Pruning, archiving, tiering, SHIMI memory integration. See [utils/context/contextManager.ts](../../utils/context/contextManager.ts).
- **cacheDir**: Cache directory helpers, robust file management. See [utils/context/cacheDir.ts](../../utils/context/cacheDir.ts).
- **shimiMemory**: Polyhierarchical semantic memory, CRDT merge, pluggable embedding/LLM backend. See [utils/context/shimiMemory.ts](../../utils/context/shimiMemory.ts).

All are registry/describe/health compliant and LLM/AI-friendly.

## Test & Validation Status (2025-05)

All context and feedback/memory utilities are registry/describe/health compliant and LLM/AI-friendly. All tests pass except for known issues with unavailable external services (Kafka, etc.), which are backlogged and do not affect core functionality. See [README](../README.md) and [agentBacklog.json](../agentBacklog.json) for details. 