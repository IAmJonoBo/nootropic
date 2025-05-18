# VaultSecretsManager

Production-ready secrets manager using HashiCorp Vault. All operations are audited. Configure Vault with proper policies and authentication (token, AppRole, etc.).

**Usage:**

`import { VaultSecretsManager } from 'nootropic/utils/security/secretsManager'; const secrets = new VaultSecretsManager({ endpoint: 'http://localhost:8200', token: 's.xxxxx' }); await secrets.getSecret('API_KEY');`

## Methods/Functions

- **getSecret**: (name: string) => Promise<string> - Retrieves a secret from Vault.
- **setSecret**: (name: string, value: string) => Promise<void> - Stores a secret in Vault.
- **rotateSecret**: (name: string) => Promise<string> - Not implemented; use Vault rotation policies.

## Schema

```json
{}
```
## References

- https://www.vaultproject.io/
- https://github.com/hashicorp/vault
- https://www.npmjs.com/package/node-vault

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

