# Nx Caching Guide

## Overview

This guide explains how to configure and optimize Nx caching in nootropic, with a focus on local-first development and data sovereignty.

## Table of Contents

1. [Caching Strategies](#caching-strategies)
2. [Local Caching](#local-caching)
3. [Self-Hosted Caching](#self-hosted-caching)
4. [Nx Cloud Integration](#nx-cloud-integration)
5. [Cache Configuration](#cache-configuration)
6. [Best Practices](#best-practices)

## Caching Strategies

Nootropic supports three caching strategies:

1. **Local Caching** (Default)
   - Cache stored on local machine
   - No network access required
   - Fastest for single developer
   - No sharing between machines

2. **Self-Hosted Caching**
   - Cache stored on internal server
   - Shared across team
   - Full control over data
   - Requires infrastructure

3. **Nx Cloud** (Optional)
   - Managed cache service
   - Shared across team and CI
   - Metadata stored off-premises
   - Requires internet access

## Local Caching

### Configuration

```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nx/workspace/tasks-runners/default",
      "options": {
        "cacheableOperations": [
          "build", "test", "lint", "e2e",
          "benchmark", "generate-rag-index",
          "run-lora", "generate-docs"
        ],
        "cacheDirectory": ".nx-cache"
      }
    }
  }
}
```

### Usage

```bash
# Start local cache daemon
nx daemon

# Clear local cache
nx reset

# View cache status
nx show projects
```

## Self-Hosted Caching

### Setup

1. Deploy MinIO server:
```bash
# Using Docker
docker run -p 9000:9000 -p 9001:9001 \
  -e "MINIO_ROOT_USER=admin" \
  -e "MINIO_ROOT_PASSWORD=password" \
  minio/minio server /data --console-address ":9001"
```

2. Configure nx.json:
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nx/workspace/tasks-runners/default",
      "options": {
        "remoteCache": {
          "enabled": true,
          "url": "http://localhost:9000",
          "accessKey": "admin",
          "secretKey": "password"
        }
      }
    }
  }
}
```

### Security

- Use TLS for cache endpoint
- Configure IAM policies
- Rotate access keys
- Monitor access logs

## Nx Cloud Integration

### Setup

1. Install Nx Cloud:
```bash
pnpm add -D @nrwl/nx-cloud
```

2. Configure nx.json:
```json
{
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nrwl/nx-cloud",
      "options": {
        "accessToken": "<NX_CLOUD_TOKEN>",
        "canTrackAnalytics": false,
        "showUsageWarnings": true
      }
    }
  }
}
```

### Privacy Considerations

- Only task metadata is stored
- No source code or secrets
- Can disable analytics
- Data retention policies

## Cache Configuration

### Cacheable Operations

```json
{
  "cacheableOperations": [
    "build",
    "test",
    "lint",
    "e2e",
    "benchmark",
    "generate-rag-index",
    "run-lora",
    "generate-docs"
  ]
}
```

### Cache Keys

```json
{
  "namedInputs": {
    "default": [
      "{projectRoot}/**/*",
      "sharedGlobals"
    ],
    "production": [
      "default",
      "!{projectRoot}/**/?(*.)+(spec|test).[jt]s?(x)?(.snap)",
      "!{projectRoot}/tsconfig.spec.json",
      "!{projectRoot}/.eslintrc.json"
    ]
  }
}
```

## Best Practices

### Local Development

1. **Default to Local Cache**
   - Start with local caching
   - Only enable remote cache when needed
   - Monitor cache performance

2. **Cache Optimization**
   - Use appropriate cache keys
   - Minimize cache size
   - Regular cache cleanup
   - Monitor disk usage

3. **Security**
   - Use TLS for remote cache
   - Rotate access keys
   - Monitor access logs
   - Regular security audits

### Team Development

1. **Self-Hosted Cache**
   - Deploy on internal network
   - Configure access controls
   - Monitor performance
   - Regular maintenance

2. **Nx Cloud**
   - Review privacy policy
   - Configure data retention
   - Monitor usage
   - Regular cost review

### CI/CD Integration

1. **Cache Configuration**
   - Use appropriate runner
   - Configure cache keys
   - Monitor cache hits
   - Regular cleanup

2. **Performance**
   - Monitor build times
   - Track cache efficiency
   - Optimize cache keys
   - Regular review

## See Also

- [Nx Guide](./NX_GUIDE.md): General Nx documentation
- [CI/CD Guide](./CI_CD.md): Using caching in CI/CD
- [Development Setup](./DEVELOPMENT_SETUP.md): Getting started with caching 