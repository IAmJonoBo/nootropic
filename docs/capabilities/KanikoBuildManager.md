# KanikoBuildManager

Manages container builds using Google Kaniko. Supports secure, rootless builds in CI/CD pipelines.

**Usage:**

`import { KanikoBuildManager } from 'nootropic/utils/security/secretsManager'; const kaniko = new KanikoBuildManager(); await kaniko.runBuild({ ... });`

## Methods/Functions

- **runBuild**: (options?: Record<string, unknown>) => Promise<void> - Runs a Kaniko build.
- **injectSecrets**: (secrets?: Record<string, string>) => Promise<void> - Injects secrets into the build context.

## Schema

```json
{}
```
## References

- https://github.com/GoogleContainerTools/kaniko
- scripts/kanikoBuildExample.md

## AI/LLM Usage Hint

- LLM/AI-friendly documentation enabled.

