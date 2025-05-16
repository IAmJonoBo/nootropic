# Kaniko Build Example & Integration Guide

This guide shows how to use [Kaniko](https://github.com/GoogleContainerTools/kaniko) to build container images securely in CI/CD pipelines (without requiring Docker daemon or privileged containers).

## Why Kaniko?
- Builds OCI/Docker images in unprivileged containers (no Docker daemon needed)
- Secure for CI/CD and Kubernetes environments
- Integrates with Vault for secret injection and ArgoCD for GitOps deployment

## Setup Steps
1. Add Kaniko to your CI/CD pipeline (GitHub Actions, ArgoCD, etc.)
2. Store registry credentials and build secrets in Vault or GitHub Secrets
3. Use Kaniko to build and push images to your container registry

## Example: GitHub Actions Workflow
```yaml
name: Kaniko Build
on:
  push:
    branches: [main]
jobs:
  kaniko-build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      - name: Set up Kaniko
        uses: aevea/action-kaniko@v1
        with:
          registry: ${{ secrets.REGISTRY_URL }}
          username: ${{ secrets.REGISTRY_USER }}
          password: ${{ secrets.REGISTRY_PASS }}
          image: ${{ secrets.REGISTRY_URL }}/ai-helpers:${{ github.sha }}
          dockerfile: ./Dockerfile
          context: .
```

## Best Practices
- Use Vault or GitHub Secrets for registry credentials
- Use multi-stage Dockerfiles to minimize image size and attack surface
- Scan built images for vulnerabilities (e.g., Trivy, Dockle)
- Integrate with ArgoCD for automated deployment
- Never store secrets in Dockerfiles or build context

## References
- [Kaniko GitHub](https://github.com/GoogleContainerTools/kaniko)
- [Kaniko Action](https://github.com/aevea/action-kaniko)
- [Secure CI/CD with Kaniko](https://blog.gitguardian.com/shift-your-ci-to-github-actions/)
- [ArgoCD Docs](https://argo-cd.readthedocs.io/en/stable/)

---

*Planned: Automated Kaniko integration and Vault/ArgoCD secret injection in AI-Helpers workflows.* 