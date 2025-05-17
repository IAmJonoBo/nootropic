# HashiCorp Vault Integration Guide

This guide describes how to integrate HashiCorp Vault with nootropic for secure, centralized, and auditable secret management in CI/CD workflows.

## Why Vault?
- Centralized, encrypted secret storage
- Fine-grained access control and audit logging
- Automated secret rotation and lease management
- Integrates with GitHub Actions, ArgoCD, and Kaniko for secure CI/CD

## Setup Steps
1. Deploy HashiCorp Vault (cloud, self-hosted, or dev mode)
2. Create a Vault policy and role for CI/CD workflows
3. Configure GitHub Actions or CI runners to authenticate with Vault (token, AppRole, or OIDC)
4. Store secrets in Vault (e.g., API keys, DB credentials)
5. Update nootropic config to use Vault for secret retrieval (planned: automated integration)

## Required Environment Variables
- `VAULT_ADDR`: Vault server address
- `VAULT_TOKEN` or `VAULT_ROLE_ID`/`VAULT_SECRET_ID`: Auth credentials
- `VAULT_PATH`: Path to secrets (e.g., `secret/data/nootropic`)

## Best Practices
- Use short-lived tokens or OIDC for CI/CD authentication
- Enable audit logging and monitor access patterns
- Rotate secrets regularly and automate revocation
- Use Vault namespaces for environment separation (dev/staging/prod)
- Never commit Vault tokens or unencrypted secrets to source control

## References
- [HashiCorp Vault Docs](https://www.vaultproject.io/docs)
- [GitHub Actions + Vault](https://learn.hashicorp.com/tutorials/vault/ci-cd-github-actions)
- [Vault Agent Sidecar](https://www.vaultproject.io/docs/agent)
- [ArgoCD Vault Plugin](https://github.com/argoproj-labs/argocd-vault-plugin)

---

*Planned: Automated Vault integration in nootropic, compliance reporting, and describe() registry support for Vault-backed secrets.* 