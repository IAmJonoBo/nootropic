/// <reference types="node" resolution-mode="require"/>
/// <reference types="node" resolution-mode="require"/>
import { z } from 'zod';
import type { Capability, HealthStatus, CapabilityDescribe } from '../../capabilities/Capability.js';
export declare const SecretSchema: z.ZodObject<{
    key: z.ZodString;
    kmsKeyId: z.ZodOptional<z.ZodString>;
    token: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    key: string;
    token?: string | undefined;
    kmsKeyId?: string | undefined;
}, {
    key: string;
    token?: string | undefined;
    kmsKeyId?: string | undefined;
}>;
export declare const KmsVaultConfigSchema: z.ZodObject<{
    provider: z.ZodEnum<["aws", "gcp", "azure", "vault"]>;
    keyId: z.ZodString;
    region: z.ZodOptional<z.ZodString>;
    vaultAddr: z.ZodOptional<z.ZodString>;
    token: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
    credentials: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    provider: "aws" | "azure" | "gcp" | "vault";
    keyId: string;
    token?: string | undefined;
    region?: string | undefined;
    vaultAddr?: string | undefined;
    projectId?: string | undefined;
    credentials?: string | undefined;
}, {
    provider: "aws" | "azure" | "gcp" | "vault";
    keyId: string;
    token?: string | undefined;
    region?: string | undefined;
    vaultAddr?: string | undefined;
    projectId?: string | undefined;
    credentials?: string | undefined;
}>;
export declare const EnvelopeSchema: z.ZodObject<{
    encryptedDEK: z.ZodString;
    encryptedData: z.ZodString;
    provider: z.ZodEnum<["aws", "gcp", "azure", "vault"]>;
    keyId: z.ZodString;
    dekAlgorithm: z.ZodDefault<z.ZodString>;
    createdAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    provider: "aws" | "azure" | "gcp" | "vault";
    keyId: string;
    encryptedDEK: string;
    encryptedData: string;
    dekAlgorithm: string;
    createdAt: string;
}, {
    provider: "aws" | "azure" | "gcp" | "vault";
    keyId: string;
    encryptedDEK: string;
    encryptedData: string;
    createdAt: string;
    dekAlgorithm?: string | undefined;
}>;
export declare const KeyAuditLogSchema: z.ZodObject<{
    timestamp: z.ZodString;
    user: z.ZodOptional<z.ZodString>;
    org: z.ZodOptional<z.ZodString>;
    operation: z.ZodEnum<["generate", "encrypt", "decrypt", "rotate", "destroy"]>;
    provider: z.ZodEnum<["aws", "gcp", "azure", "vault"]>;
    keyId: z.ZodString;
    status: z.ZodEnum<["success", "failure"]>;
    details: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "success" | "failure";
    timestamp: string;
    operation: "generate" | "encrypt" | "decrypt" | "rotate" | "destroy";
    provider: "aws" | "azure" | "gcp" | "vault";
    keyId: string;
    user?: string | undefined;
    error?: string | undefined;
    details?: string | undefined;
    org?: string | undefined;
}, {
    status: "success" | "failure";
    timestamp: string;
    operation: "generate" | "encrypt" | "decrypt" | "rotate" | "destroy";
    provider: "aws" | "azure" | "gcp" | "vault";
    keyId: string;
    user?: string | undefined;
    error?: string | undefined;
    details?: string | undefined;
    org?: string | undefined;
}>;
/**
 * Append an audit log entry (validated, immutable) to the audit log file.
 */
export declare function appendKeyAuditLog(entry: z.infer<typeof KeyAuditLogSchema>): Promise<void>;
export interface SecretsManager {
    getSecret(name: string): Promise<string>;
    setSecret(name: string, value: string): Promise<void>;
    rotateSecret(name: string): Promise<string>;
}
/**
 * LocalSecretsManager: Loads secrets from .env or a local JSON file. Implements both SecretsManager and Capability for registry/discoverability.
 */
export declare class LocalSecretsManager implements SecretsManager, Capability {
    readonly name = "LocalSecretsManager";
    private secrets;
    constructor(envPath?: string);
    getSecret(name: string): Promise<string>;
    setSecret(name: string, value: string): Promise<void>;
    rotateSecret(name?: string): Promise<string>;
    /**
     * Optional: Initialize the capability (no-op for now).
     */
    init(): Promise<void>;
    /**
     * Optional: Hot-reload logic (no-op for now).
     */
    reload(): Promise<void>;
    /**
     * Health check for capability status.
     */
    health(): Promise<HealthStatus>;
    /**
     * Returns a machine-usable, LLM-friendly description of the secrets manager capability.
     */
    describe(): CapabilityDescribe;
}
export declare function generateDEK(): Promise<Buffer>;
export declare function encryptDEK(): Promise<string>;
export declare function decryptDEK(): Promise<Buffer>;
export declare function rotateDEK(): Promise<string>;
/**
 * KmsVaultSecretsManager: Envelope encryption and KMS/Vault key management. Implements both SecretsManager and Capability for registry/discoverability.
 */
export declare class KmsVaultSecretsManager implements SecretsManager, Capability {
    readonly name = "KmsVaultSecretsManager";
    private config;
    constructor(_config: unknown);
    getSecret(_name: string): Promise<string>;
    setSecret(_name: string, _value: string): Promise<void>;
    rotateSecret(_name?: string): Promise<string>;
    encryptDEK(): Promise<string>;
    decryptDEK(): Promise<Buffer>;
    rotateKey(): Promise<string>;
    init(): Promise<void>;
    reload(): Promise<void>;
    health(): Promise<HealthStatus>;
    describe(): CapabilityDescribe;
}
/**
 * VaultSecretsManager: Integrates with HashiCorp Vault for secure, centralized secret management. Implements both SecretsManager and Capability for registry/discoverability.
 * See scripts/vaultIntegrationGuide.md for setup and best practices.
 */
export declare class VaultSecretsManager implements SecretsManager, Capability {
    readonly name = "VaultSecretsManager";
    private client;
    private mount;
    constructor(config: {
        endpoint: string;
        token: string;
        mount?: string;
    });
    getSecret(name: string): Promise<string>;
    setSecret(name: string, value: string): Promise<void>;
    rotateSecret(_name?: string): Promise<string>;
    init(): Promise<void>;
    reload(): Promise<void>;
    health(): Promise<HealthStatus>;
    describe(): CapabilityDescribe;
}
/**
 * KanikoBuildManager: Manages secure, daemonless container builds using Kaniko in CI/CD. Implements Capability for registry/discoverability.
 * See scripts/kanikoBuildExample.md for setup and best practices.
 */
export declare class KanikoBuildManager implements Capability {
    readonly name = "KanikoBuildManager";
    constructor(_config?: unknown);
    runBuild(_options?: Record<string, unknown>): Promise<void>;
    injectSecrets(_secrets?: Record<string, string>): Promise<void>;
    init(): Promise<void>;
    reload(): Promise<void>;
    health(): Promise<HealthStatus>;
    describe(): CapabilityDescribe;
}
/**
 * ArgoCdDeploymentManager: Manages GitOps-based deployment and secret management using ArgoCD. Implements Capability for registry/discoverability.
 * See scripts/argoCdIntegrationGuide.md for setup and best practices.
 */
export declare class ArgoCdDeploymentManager implements Capability {
    readonly name = "ArgoCdDeploymentManager";
    constructor(_config?: unknown);
    deploy(_options?: Record<string, unknown>): Promise<void>;
    injectSecrets(_secrets?: Record<string, string>): Promise<void>;
    init(): Promise<void>;
    reload(): Promise<void>;
    health(): Promise<HealthStatus>;
    describe(): CapabilityDescribe;
}
export declare function describe(): {
    name: string;
    description: string;
    schema: {};
    usage: string;
    references: string[];
};
