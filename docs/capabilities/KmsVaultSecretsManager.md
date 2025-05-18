# KmsVaultSecretsManager

Envelope encryption and KMS/Vault key management. Supports AWS KMS, GCP KMS, Azure Key Vault, and HashiCorp Vault. Use for production-grade secret management.

**Usage:**

`import { KmsVaultSecretsManager } from 'nootropic/utils/security/secretsManager'; const secrets = new KmsVaultSecretsManager({ provider: 'aws', keyId: '...', region: '...' }); await secrets.getSecret('API_KEY');`

## Methods/Functions

- **getSecret**: (name: string) => Promise<string> - Retrieves a secret by name.
- **setSecret**: (name: string, value: string) => Promise<void> - Sets a secret.
- **rotateSecret**: (name: string) => Promise<string> - Rotates a secret.

## Schema

```json
{}
```
## References

- https://docs.aws.amazon.com/kms/
- https://cloud.google.com/kms/docs
- https://learn.microsoft.com/en-us/azure/key-vault/
- https://www.vaultproject.io/docs
- scripts/vaultIntegrationGuide.md

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

