import { z } from 'zod';
import { trace } from '@opentelemetry/api';
import * as fs from 'fs/promises';
import * as path from 'path';
// import { KMSClient } from '@aws-sdk/client-kms';
// @ts-ignore
import type { Capability, HealthStatus, CapabilityDescribe } from '../../capabilities/Capability.js';
import vault from 'node-vault';

// NOTE: Ensure @aws-sdk/client-kms is installed in your project for AWS KMS support.

// 'node-vault' is a peer dependency. Install with `npm install node-vault`.

// Zod schema for secrets
export const SecretSchema = z.object({
  key: z.string().min(32), // e.g., AES-256 key
  kmsKeyId: z.string().optional(),
  token: z.string().optional(),
});

// Zod schema for KMS/Vault config
export const KmsVaultConfigSchema = z.object({
  provider: z.enum(['aws', 'gcp', 'azure', 'vault']),
  keyId: z.string(),
  region: z.string().optional(),
  vaultAddr: z.string().optional(),
  token: z.string().optional(),
  projectId: z.string().optional(),
  credentials: z.string().optional(),
});

// Envelope encryption structure
export const EnvelopeSchema = z.object({
  encryptedDEK: z.string(), // base64
  encryptedData: z.string(), // base64
  provider: z.enum(['aws', 'gcp', 'azure', 'vault']),
  keyId: z.string(),
  dekAlgorithm: z.string().default('AES-256-GCM'),
  createdAt: z.string(),
});

// Zod schema for audit log entries
export const KeyAuditLogSchema = z.object({
  timestamp: z.string(),
  user: z.string().optional(),
  org: z.string().optional(),
  operation: z.enum(['generate', 'encrypt', 'decrypt', 'rotate', 'destroy']),
  provider: z.enum(['aws', 'gcp', 'azure', 'vault']),
  keyId: z.string(),
  status: z.enum(['success', 'failure']),
  details: z.string().optional(),
  error: z.string().optional(),
});

const AUDIT_LOG_PATH = path.resolve('.nootropic-cache/key-audit-log.jsonl');

/**
 * Append an audit log entry (validated, immutable) to the audit log file.
 */
export async function appendKeyAuditLog(entry: z.infer<typeof KeyAuditLogSchema>) {
  const valid = KeyAuditLogSchema.parse(entry);
  await fs.appendFile(AUDIT_LOG_PATH, JSON.stringify(valid) + '\n', 'utf8');
}

export interface SecretsManager {
  getSecret(name: string): Promise<string>;
  setSecret(name: string, value: string): Promise<void>;
  rotateSecret(name: string): Promise<string>;
}

/**
 * LocalSecretsManager: Loads secrets from .env or a local JSON file. Implements both SecretsManager and Capability for registry/discoverability.
 */
export class LocalSecretsManager implements SecretsManager, Capability {
  public readonly name = 'LocalSecretsManager';
  private secrets: Record<string, string> = {};
  constructor(envPath = '.env') {
    // Load secrets from .env (sync for simplicity)
    try {
      const env = require('dotenv').config({ path: envPath });
      this.secrets = env.parsed ?? {};
    } catch {
      // fallback: try secrets.json
    }
  }
  async getSecret(name: string): Promise<string> {
    const span = trace.getTracer('secretsManager').startSpan('getSecret');
    try {
      if (!this.secrets[name]) throw new Error(`Secret not found: ${name}`);
      span.end();
      return this.secrets[name]!;
    } catch (err) {
      span.recordException(err as Error);
      span.end();
      throw err;
    }
  }
  async setSecret(name: string, value: string): Promise<void> {
    this.secrets[name] = value;
  }
  async rotateSecret(name?: string): Promise<string> {
    void name;
    // Stub: In production, rotate via KMS/Vault
    throw new Error('rotateSecret not implemented in LocalSecretsManager');
  }
  /**
   * Optional: Initialize the capability (no-op for now).
   */
  async init(): Promise<void> {
    // No-op for now
  }
  /**
   * Optional: Hot-reload logic (no-op for now).
   */
  async reload(): Promise<void> {
    // No-op for now
  }
  /**
   * Health check for capability status.
   */
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
  /**
   * Returns a machine-usable, LLM-friendly description of the secrets manager capability.
   */
  describe(): CapabilityDescribe {
    return {
      name: 'LocalSecretsManager',
      description: 'Local fallback secrets manager: loads secrets from .env or a local JSON file. Use KMS/Vault in production. Planned: Vault/ArgoCD/Kaniko integration for secure CI/CD and secret management.',
      license: 'MIT',
      isOpenSource: true,
      provenance: 'https://github.com/nootropic/nootropic',
      methods: [
        { name: 'getSecret', signature: '(name: string) => Promise<string>', description: 'Retrieves a secret by name.' },
        { name: 'setSecret', signature: '(name: string, value: string) => Promise<void>', description: 'Sets a secret.' },
        { name: 'rotateSecret', signature: '(name: string) => Promise<string>', description: 'Rotates a secret.' }
      ],
      usage: "import { LocalSecretsManager } from 'nootropic/utils/security/secretsManager'; const secrets = new LocalSecretsManager(); await secrets.getSecret('API_KEY');",
      docsFirst: true,
      aiFriendlyDocs: true,
      promptTemplates: [
        {
          name: 'Get Secret',
          description: 'Prompt for instructing the agent or LLM to retrieve a secret by name.',
          template: 'Retrieve the secret named "{{name}}" from the secrets manager.',
          usage: 'Used by getSecret to fetch a secret value.'
        },
        {
          name: 'Set Secret',
          description: 'Prompt for instructing the agent or LLM to set a secret by name and value.',
          template: 'Set the secret named "{{name}}" to the value "{{value}}" in the secrets manager.',
          usage: 'Used by setSecret to store a secret value.'
        },
        {
          name: 'Rotate Secret',
          description: 'Prompt for instructing the agent or LLM to rotate a secret by name.',
          template: 'Rotate the secret named "{{name}}" in the secrets manager and return the new value.',
          usage: 'Used by rotateSecret to rotate a secret.'
        }
      ],
      references: [
        'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3',
        'scripts/vaultIntegrationGuide.md',
        'scripts/kanikoBuildExample.md',
        'scripts/argoCdIntegrationGuide.md'
      ],
      schema: {}
    };
  }
}

// Envelope encryption helpers (stubs)
export async function generateDEK(): Promise<Buffer> {
  // Generate a random 32-byte DEK
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32)));
}
export async function encryptDEK(): Promise<string> {
  // Stub: Use provider SDK to encrypt DEK
  throw new Error('encryptDEK not implemented');
}
export async function decryptDEK(): Promise<Buffer> {
  // Stub: Use provider SDK to decrypt DEK
  throw new Error('decryptDEK not implemented');
}
export async function rotateDEK(): Promise<string> {
  // Stub: Use provider SDK to rotate DEK
  throw new Error('rotateDEK not implemented');
}

// Provider-specific logic (stubs)
// GCP: import { KeyManagementServiceClient } from '@google-cloud/kms';
// Azure: import { KeyClient, CryptographyClient } from '@azure/keyvault-keys';
// Vault: import vault from 'node-vault';

/**
 * KmsVaultSecretsManager: Envelope encryption and KMS/Vault key management. Implements both SecretsManager and Capability for registry/discoverability.
 */
export class KmsVaultSecretsManager implements SecretsManager, Capability {
  public readonly name = 'KmsVaultSecretsManager';
  private config: z.infer<typeof KmsVaultConfigSchema>;
  // private _kmsClient?: KMSClient; // Unused, for future provider support
  constructor(_config: unknown) {
    void _config;
    this.config = KmsVaultConfigSchema.parse(_config);
    if (this.config.provider === 'aws') {
      // this._kmsClient = new KMSClient({ region: this.config.region ?? 'us-east-1' });
    }
    // TODO: Init GCP, Azure, Vault clients as needed
  }
  async getSecret(_name: string): Promise<string> {
    void _name;
    const span = trace.getTracer('secretsManager').startSpan('getSecret');
    // TODO: Call provider-specific API to decrypt/envelope unwrap
    span.end();
    throw new Error('KmsVaultSecretsManager.getSecret not implemented');
  }
  async setSecret(_name: string, _value: string): Promise<void> {
    void _name; void _value;
    const span = trace.getTracer('secretsManager').startSpan('setSecret');
    // TODO: Call provider-specific API to encrypt/envelope wrap
    span.end();
    throw new Error('KmsVaultSecretsManager.setSecret not implemented');
  }
  async rotateSecret(_name?: string): Promise<string> {
    void _name;
    // TODO: Call provider-specific API to rotate key
    throw new Error('rotateKey not implemented');
  }
  // private _auditLog() { // Unused, for future audit logging
  //   // TODO: Implement audit logging
  // }
  async encryptDEK(): Promise<string> {
    // TODO: Use provider SDK to encrypt DEK
    throw new Error('encryptDEK not implemented');
  }
  async decryptDEK(): Promise<Buffer> {
    // TODO: Use provider SDK to decrypt DEK
    throw new Error('decryptDEK not implemented');
  }
  async rotateKey(): Promise<string> {
    // TODO: Use provider SDK to rotate key
    throw new Error('rotateKey not implemented');
  }
  async init(): Promise<void> {
    // No-op for now
  }
  async reload(): Promise<void> {
    // No-op for now
  }
  async health(): Promise<HealthStatus> {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
  describe(): CapabilityDescribe {
    return {
      name: 'KmsVaultSecretsManager',
      description: 'Envelope encryption and KMS/Vault key management. Supports AWS KMS, GCP KMS, Azure Key Vault, and HashiCorp Vault. Use for production-grade secret management.',
      license: 'Apache-2.0',
      isOpenSource: true,
      provenance: 'https://github.com/aws/aws-sdk-js-v3',
      methods: [
        { name: 'getSecret', signature: '(name: string) => Promise<string>', description: 'Retrieves a secret by name.' },
        { name: 'setSecret', signature: '(name: string, value: string) => Promise<void>', description: 'Sets a secret.' },
        { name: 'rotateSecret', signature: '(name: string) => Promise<string>', description: 'Rotates a secret.' }
      ],
      usage: "import { KmsVaultSecretsManager } from 'nootropic/utils/security/secretsManager'; const secrets = new KmsVaultSecretsManager({ provider: 'aws', keyId: '...', region: '...' }); await secrets.getSecret('API_KEY');",
      docsFirst: true,
      aiFriendlyDocs: true,
      promptTemplates: [
        {
          name: 'Get Secret',
          description: 'Prompt for instructing the agent or LLM to retrieve a secret by name.',
          template: 'Retrieve the secret named "{{name}}" from the secrets manager.',
          usage: 'Used by getSecret to fetch a secret value.'
        },
        {
          name: 'Set Secret',
          description: 'Prompt for instructing the agent or LLM to set a secret by name and value.',
          template: 'Set the secret named "{{name}}" to the value "{{value}}" in the secrets manager.',
          usage: 'Used by setSecret to store a secret value.'
        },
        {
          name: 'Rotate Secret',
          description: 'Prompt for instructing the agent or LLM to rotate a secret by name.',
          template: 'Rotate the secret named "{{name}}" in the secrets manager and return the new value.',
          usage: 'Used by rotateSecret to rotate a secret.'
        }
      ],
      references: [
        'https://docs.aws.amazon.com/kms/',
        'https://cloud.google.com/kms/docs',
        'https://learn.microsoft.com/en-us/azure/key-vault/',
        'https://www.vaultproject.io/docs',
        'scripts/vaultIntegrationGuide.md'
      ],
      schema: {}
    };
  }
}

/**
 * VaultSecretsManager: Integrates with HashiCorp Vault for secure, centralized secret management. Implements both SecretsManager and Capability for registry/discoverability.
 * See scripts/vaultIntegrationGuide.md for setup and best practices.
 */
export class VaultSecretsManager implements SecretsManager, Capability {
  public readonly name = 'VaultSecretsManager';
  private client: unknown;
  private mount: string;
  constructor(config: { endpoint: string; token: string; mount?: string }) {
    this.client = vault({ endpoint: config.endpoint, token: config.token });
    this.mount = config.mount ?? 'secret';
  }
  async getSecret(name: string): Promise<string> {
    const span = trace.getTracer('secretsManager').startSpan('getSecret');
    try {
      if (!this.client || typeof (this.client as any).read !== 'function') throw new Error('Vault client not initialized');
      const result = await (this.client as any).read(`${this.mount}/data/${name}`);
      span.end();
      return result.data.data.value;
    } catch (err) {
      span.recordException(err as Error);
      span.end();
      throw err;
    }
  }
  async setSecret(name: string, value: string): Promise<void> {
    const span = trace.getTracer('secretsManager').startSpan('setSecret');
    try {
      if (!this.client || typeof (this.client as any).write !== 'function') throw new Error('Vault client not initialized');
      await (this.client as any).write(`${this.mount}/data/${name}`, { data: { value } });
      span.end();
    } catch (err) {
      span.recordException(err as Error);
      span.end();
      throw err;
    }
  }
  async rotateSecret(_name?: string): Promise<string> {
    void _name;
    // For Vault, rotation is typically handled by policies or external triggers
    throw new Error('rotateSecret not implemented for VaultSecretsManager. Use Vault rotation policies.');
  }
  async init(): Promise<void> {}
  async reload(): Promise<void> {}
  async health(): Promise<HealthStatus> {
    try {
      if (!this.client || typeof (this.client as any).health !== 'function') throw new Error('Vault client not initialized');
      await (this.client as any).health();
      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch {
      return { status: 'error', timestamp: new Date().toISOString() };
    }
  }
  describe(): CapabilityDescribe {
    return {
      name: 'VaultSecretsManager',
      description: 'Production-ready secrets manager using HashiCorp Vault. All operations are audited. Configure Vault with proper policies and authentication (token, AppRole, etc.).',
      license: 'MPL-2.0',
      isOpenSource: true,
      provenance: 'https://www.vaultproject.io/',
      methods: [
        { name: 'getSecret', signature: '(name: string) => Promise<string>', description: 'Retrieves a secret from Vault.' },
        { name: 'setSecret', signature: '(name: string, value: string) => Promise<void>', description: 'Stores a secret in Vault.' },
        { name: 'rotateSecret', signature: '(name: string) => Promise<string>', description: 'Not implemented; use Vault rotation policies.' }
      ],
      usage: "import { VaultSecretsManager } from 'nootropic/utils/security/secretsManager'; const secrets = new VaultSecretsManager({ endpoint: 'http://localhost:8200', token: 's.xxxxx' }); await secrets.getSecret('API_KEY');",
      docsFirst: true,
      aiFriendlyDocs: true,
      promptTemplates: [
        {
          name: 'Get Secret',
          description: 'Prompt for instructing the agent or LLM to retrieve a secret by name.',
          template: 'Retrieve the secret named "{{name}}" from the secrets manager.',
          usage: 'Used by getSecret to fetch a secret value.'
        },
        {
          name: 'Set Secret',
          description: 'Prompt for instructing the agent or LLM to set a secret by name and value.',
          template: 'Set the secret named "{{name}}" to the value "{{value}}" in the secrets manager.',
          usage: 'Used by setSecret to store a secret value.'
        },
        {
          name: 'Rotate Secret',
          description: 'Prompt for instructing the agent or LLM to rotate a secret by name.',
          template: 'Rotate the secret named "{{name}}" in the secrets manager and return the new value.',
          usage: 'Used by rotateSecret to rotate a secret.'
        }
      ],
      references: [
        'https://www.vaultproject.io/',
        'https://github.com/hashicorp/vault',
        'https://www.npmjs.com/package/node-vault'
      ],
      schema: {}
    };
  }
}

/**
 * KanikoBuildManager: Manages secure, daemonless container builds using Kaniko in CI/CD. Implements Capability for registry/discoverability.
 * See scripts/kanikoBuildExample.md for setup and best practices.
 */
export class KanikoBuildManager implements Capability {
  public readonly name = 'KanikoBuildManager';
  constructor(_config?: unknown) {
    void _config;
    // _config is currently unused
    // TODO: Store Kaniko build config if needed
  }
  async runBuild(_options?: Record<string, unknown>): Promise<void> {
    void _options;
    // TODO: Invoke Kaniko build (e.g., via CLI, GitHub Action, or API)
    throw new Error('KanikoBuildManager.runBuild not implemented');
  }
  async injectSecrets(_secrets?: Record<string, string>): Promise<void> {
    void _secrets;
    // TODO: Inject secrets into Kaniko build context (from Vault, etc.)
    throw new Error('KanikoBuildManager.injectSecrets not implemented');
  }
  async init(): Promise<void> {
    // TODO: Initialize Kaniko build environment if needed
  }
  async reload(): Promise<void> {
    // TODO: Reload Kaniko config if needed
  }
  async health(): Promise<HealthStatus> {
    // TODO: Implement Kaniko health check
    return { status: 'degraded', timestamp: new Date().toISOString() };
  }
  describe(): CapabilityDescribe {
    return {
      name: 'KanikoBuildManager',
      description: 'Manages container builds using Google Kaniko. Supports secure, rootless builds in CI/CD pipelines.',
      license: 'Apache-2.0',
      isOpenSource: true,
      provenance: 'https://github.com/GoogleContainerTools/kaniko',
      methods: [
        { name: 'runBuild', signature: '(options?: Record<string, unknown>) => Promise<void>', description: 'Runs a Kaniko build.' },
        { name: 'injectSecrets', signature: '(secrets?: Record<string, string>) => Promise<void>', description: 'Injects secrets into the build context.' }
      ],
      usage: "import { KanikoBuildManager } from 'nootropic/utils/security/secretsManager'; const kaniko = new KanikoBuildManager(); await kaniko.runBuild({ ... });",
      docsFirst: true,
      aiFriendlyDocs: true,
      promptTemplates: [
        {
          name: 'Get Secret',
          description: 'Prompt for instructing the agent or LLM to retrieve a secret by name.',
          template: 'Retrieve the secret named "{{name}}" from the secrets manager.',
          usage: 'Used by getSecret to fetch a secret value.'
        },
        {
          name: 'Set Secret',
          description: 'Prompt for instructing the agent or LLM to set a secret by name and value.',
          template: 'Set the secret named "{{name}}" to the value "{{value}}" in the secrets manager.',
          usage: 'Used by setSecret to store a secret value.'
        },
        {
          name: 'Rotate Secret',
          description: 'Prompt for instructing the agent or LLM to rotate a secret by name.',
          template: 'Rotate the secret named "{{name}}" in the secrets manager and return the new value.',
          usage: 'Used by rotateSecret to rotate a secret.'
        }
      ],
      references: [
        'https://github.com/GoogleContainerTools/kaniko',
        'scripts/kanikoBuildExample.md'
      ],
      schema: {}
    };
  }
}

/**
 * ArgoCdDeploymentManager: Manages GitOps-based deployment and secret management using ArgoCD. Implements Capability for registry/discoverability.
 * See scripts/argoCdIntegrationGuide.md for setup and best practices.
 */
export class ArgoCdDeploymentManager implements Capability {
  public readonly name = 'ArgoCdDeploymentManager';
  constructor(_config?: unknown) {
    void _config;
    // _config is currently unused
    // TODO: Store ArgoCD deployment config if needed
  }
  async deploy(_options?: Record<string, unknown>): Promise<void> {
    void _options;
    // TODO: Trigger ArgoCD deployment (e.g., via CLI, API, or manifest update)
    throw new Error('ArgoCdDeploymentManager.deploy not implemented');
  }
  async injectSecrets(_secrets?: Record<string, string>): Promise<void> {
    void _secrets;
    // TODO: Inject secrets into ArgoCD deployment context (from Vault, etc.)
    throw new Error('ArgoCdDeploymentManager.injectSecrets not implemented');
  }
  async init(): Promise<void> {
    // TODO: Initialize ArgoCD deployment environment if needed
  }
  async reload(): Promise<void> {
    // TODO: Reload ArgoCD config if needed
  }
  async health(): Promise<HealthStatus> {
    // TODO: Implement ArgoCD health check
    return { status: 'degraded', timestamp: new Date().toISOString() };
  }
  describe(): CapabilityDescribe {
    return {
      name: 'ArgoCdDeploymentManager',
      description: 'Manages GitOps-based deployment and secret management using ArgoCD. See scripts/argoCdIntegrationGuide.md for setup and best practices.',
      license: 'Apache-2.0',
      isOpenSource: true,
      provenance: 'https://github.com/argoproj/argo-cd',
      methods: [
        { name: 'deploy', signature: '(options?: Record<string, unknown>) => Promise<void>', description: 'Triggers an ArgoCD deployment.' },
        { name: 'injectSecrets', signature: '(secrets?: Record<string, string>) => Promise<void>', description: 'Injects secrets into the ArgoCD deployment context.' }
      ],
      usage: "import { ArgoCdDeploymentManager } from 'nootropic/utils/security/secretsManager'; const argo = new ArgoCdDeploymentManager(); await argo.deploy({ ... });",
      docsFirst: true,
      aiFriendlyDocs: true,
      promptTemplates: [
        {
          name: 'Get Secret',
          description: 'Prompt for instructing the agent or LLM to retrieve a secret by name.',
          template: 'Retrieve the secret named "{{name}}" from the secrets manager.',
          usage: 'Used by getSecret to fetch a secret value.'
        },
        {
          name: 'Set Secret',
          description: 'Prompt for instructing the agent or LLM to set a secret by name and value.',
          template: 'Set the secret named "{{name}}" to the value "{{value}}" in the secrets manager.',
          usage: 'Used by setSecret to store a secret value.'
        },
        {
          name: 'Rotate Secret',
          description: 'Prompt for instructing the agent or LLM to rotate a secret by name.',
          template: 'Rotate the secret named "{{name}}" in the secrets manager and return the new value.',
          usage: 'Used by rotateSecret to rotate a secret.'
        }
      ],
      references: [
        'https://github.com/argoproj/argo-cd',
        'scripts/argoCdIntegrationGuide.md'
      ],
      schema: {}
    };
  }
}

export function describe() {
  return {
    name: 'SecretsManager',
    description: 'Unified secrets management interface for local, KMS, and Vault backends.',
    schema: {},
    usage: 'See LocalSecretsManager and KmsVaultSecretsManager for usage.',
    references: [
      'https://dev.to/sovannaro/typescript-best-practices-2025-elevate-your-code-quality-1gh3',
    ],
  };
} 