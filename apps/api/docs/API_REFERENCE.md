# API Reference

[![Documentation](https://img.shields.io/badge/docs-latest-blue.svg)](https://docs.nootropic.dev)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **NOTE**: This document provides API reference and examples for the Nootropic project, focusing on local-first API, data sovereignty, and solo developer needs.

The nootropic API provides programmatic access to core AI‐driven functionality, including local model inference, embeddings generation, and vector store queries.

## Table of Contents

- [Overview](#overview)
- [Local Configuration](#local-configuration)
  - [Configuration File](#configuration-file)
  - [Environment Variables](#environment-variables)
  - [Local Storage](#local-storage)
- [Resource Management](#resource-management)
  - [Local Resources](#local-resources)
  - [Resource Limits](#resource-limits)
  - [Resource Monitoring](#resource-monitoring)
- [Local API](#local-api)
  - [Model Inference](#model-inference)
  - [Embeddings](#embeddings)
  - [Vector Store](#vector-store)
  - [Plugin System](#plugin-system)
- [SDK Examples](#sdk-examples)
  - [JavaScript/TypeScript](#javascripttypescript)
  - [Python](#python)
  - [Go](#go)
  - [Java](#java)
- [Best Practices](#best-practices)
  - [Error Handling](#error-handling)
  - [Performance Optimization](#performance-optimization)
  - [Security Considerations](#security-considerations)
  - [Monitoring and Logging](#monitoring-and-logging)
- [Endpoints](#endpoints)
  - [Local Inference](#1-v1localinference)
  - [Embeddings](#2-v1embeddings)
  - [Vector Query](#3-v1vectorquery)
  - [Models](#4-v1models)
  - [Vector Ingest](#5-v1vectoringest)
  - [Plugin Management](#6-v1pluginmanagement)
  - [Model Management](#7-v1modelmanagement)
  - [Resource Management](#8-v1resourcemanagement)
  - [Local Storage](#9-v1localstorage)
  - [Model Security](#10-v1modelsecurity)
- [Data Schemas](#data-schemas)
- [Error Codes & Handling](#error-codes--handling)
- [Examples](#examples)
- [Versioning and Deprecation Policy](#versioning-and-deprecation-policy)

## Overview

The nootropic API provides programmatic access to core AI‐driven functionality, with a focus on local-first operations. All endpoints are prefixed with `/v1/` and accept JSON payloads. Responses are also returned in JSON.

## Local Configuration

### Configuration File

The configuration file is stored locally at `~/.nootropic/config.json`:

```jsonc
{
  "local": {
    "models": {
      "default": {
        "name": "starcoder2-3b",
        "version": "1.0.0",
        "quantization": "4bit",
        "runtime": "llama.cpp"
      }
    },
    "storage": {
      "type": "sqlite",
      "path": ".nootropic-cache/storage.db"
    },
    "vector_store": {
      "type": "chroma",
      "path": ".nootropic-cache/vector_store"
    },
    "plugins": {
      "path": ".nootropic-cache/plugins"
    }
  },
  "resources": {
    "max_memory": "8GB",
    "max_threads": 4,
    "gpu_layers": 32
  }
}
```

### Environment Variables

```bash
# Model Configuration
NOOTROPIC_MODEL_NAME=starcoder2-3b
NOOTROPIC_MODEL_VERSION=1.0.0
NOOTROPIC_MODEL_QUANTIZATION=4bit

# Resource Limits
NOOTROPIC_MAX_MEMORY=8GB
NOOTROPIC_MAX_THREADS=4
NOOTROPIC_GPU_LAYERS=32

# Storage Configuration
NOOTROPIC_STORAGE_PATH=.nootropic-cache/storage.db
NOOTROPIC_VECTOR_STORE_PATH=.nootropic-cache/vector_store
NOOTROPIC_PLUGINS_PATH=.nootropic-cache/plugins
```

### Local Storage

```typescript
interface LocalStorage {
  // Model Storage
  models: {
    path: string;
    cache: {
      enabled: boolean;
      max_size: string;
      max_age: string;
    };
  };
  
  // Vector Store
  vector_store: {
    path: string;
    index: {
      type: string;
      params: Record<string, any>;
    };
  };
  
  // Plugin Storage
  plugins: {
    path: string;
    cache: {
      enabled: boolean;
      max_size: string;
    };
  };
}
```

## Resource Management

### Local Resources

```typescript
interface LocalResources {
  // CPU Resources
  cpu: {
    threads: number;
    priority: number;
  };
  
  // Memory Resources
  memory: {
    max: string;
    swap: boolean;
  };
  
  // GPU Resources
  gpu: {
    enabled: boolean;
    layers: number;
    memory: string;
  };
  
  // Storage Resources
  storage: {
    max_size: string;
    cleanup: {
      enabled: boolean;
      interval: string;
    };
  };
}
```

### Resource Limits

```typescript
interface ResourceLimits {
  // Model Limits
  model: {
    max_tokens: number;
    max_batch_size: number;
    max_context_length: number;
  };
  
  // Vector Store Limits
  vector_store: {
    max_vectors: number;
    max_dimensions: number;
    max_query_results: number;
  };
  
  // Plugin Limits
  plugins: {
    max_plugins: number;
    max_memory_per_plugin: string;
    max_threads_per_plugin: number;
  };
}
```

### Resource Monitoring

```typescript
interface ResourceMonitoring {
  // CPU Monitoring
  cpu: {
    usage: number;
    threads: number;
    temperature: number;
  };
  
  // Memory Monitoring
  memory: {
    used: string;
    free: string;
    swap_used: string;
  };
  
  // GPU Monitoring
  gpu: {
    usage: number;
    memory_used: string;
    temperature: number;
  };
  
  // Storage Monitoring
  storage: {
    used: string;
    free: string;
    iops: number;
  };
}
```

## Local API

### Model Inference

```typescript
interface ModelInference {
  // Model Configuration
  model: {
    name: string;
    version: string;
    quantization: string;
    runtime: string;
  };
  
  // Inference Parameters
  params: {
    max_tokens: number;
    temperature: number;
    top_p: number;
    frequency_penalty: number;
    presence_penalty: number;
  };
  
  // Resource Allocation
  resources: {
    threads: number;
    memory: string;
    gpu_layers: number;
  };
}
```

### Embeddings

```typescript
interface Embeddings {
  // Model Configuration
  model: {
    name: string;
    version: string;
    quantization: string;
  };
  
  // Embedding Parameters
  params: {
    dimensions: number;
    normalize: boolean;
  };
  
  // Batch Processing
  batch: {
    size: number;
    parallel: boolean;
  };
}
```

### Vector Store

```typescript
interface VectorStore {
  // Store Configuration
  store: {
    type: string;
    path: string;
    index: {
      type: string;
      params: Record<string, any>;
    };
  };
  
  // Query Parameters
  query: {
    top_k: number;
    similarity_threshold: number;
    filters: Record<string, any>;
  };
  
  // Index Management
  index: {
    rebuild_interval: string;
    optimize_interval: string;
  };
}
```

### Plugin System

```typescript
interface PluginSystem {
  // Plugin Configuration
  plugins: {
    path: string;
    auto_load: boolean;
    sandbox: boolean;
  };
  
  // Plugin Management
  management: {
    install: {
      source: string;
      verify: boolean;
    };
    update: {
      check_interval: string;
      auto_update: boolean;
    };
    uninstall: {
      cleanup: boolean;
    };
  };
  
  // Plugin Security
  security: {
    permissions: string[];
    isolation: boolean;
    resource_limits: Record<string, any>;
  };
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { Nootropic } from '@nootropic/sdk';

const nootropic = new Nootropic({
  config: {
    local: {
      models: {
        default: {
          name: 'starcoder2-3b',
          version: '1.0.0',
          quantization: '4bit'
        }
      }
    }
  }
});

// Local Inference
const response = await nootropic.inference.complete({
  prompt: 'Complete this code:',
  max_tokens: 100
});

// Local Embeddings
const embeddings = await nootropic.embeddings.create({
  input: 'Hello, world!',
  model: 'starcoder2-3b'
});

// Vector Store
const results = await nootropic.vector_store.query({
  query: 'Find similar code',
  top_k: 5
});
```

### Python

```python
from nootropic import Nootropic

nootropic = Nootropic(
    config={
        'local': {
            'models': {
                'default': {
                    'name': 'starcoder2-3b',
                    'version': '1.0.0',
                    'quantization': '4bit'
                }
            }
        }
    }
)

# Local Inference
response = nootropic.inference.complete(
    prompt='Complete this code:',
    max_tokens=100
)

# Local Embeddings
embeddings = nootropic.embeddings.create(
    input='Hello, world!',
    model='starcoder2-3b'
)

# Vector Store
results = nootropic.vector_store.query(
    query='Find similar code',
    top_k=5
)
```

## Best Practices

### Error Handling

```typescript
try {
  const response = await nootropic.inference.complete({
    prompt: 'Complete this code:',
    max_tokens: 100
  });
} catch (error) {
  if (error instanceof ResourceError) {
    // Handle resource constraints
    console.error('Resource error:', error.message);
  } else if (error instanceof ModelError) {
    // Handle model errors
    console.error('Model error:', error.message);
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

### Performance Optimization

```typescript
// Optimize model loading
const model = await nootropic.models.load({
  name: 'starcoder2-3b',
  quantization: '4bit',
  cache: true
});

// Optimize vector store
await nootropic.vector_store.optimize({
  rebuild_index: true,
  cleanup: true
});

// Optimize resource usage
await nootropic.resources.optimize({
  threads: 4,
  memory: '8GB',
  gpu_layers: 32
});
```

### Security Considerations

```typescript
// Secure local storage
await nootropic.storage.secure({
  encryption: true,
  access_control: true
});

// Secure model inference
await nootropic.inference.secure({
  input_validation: true,
  output_sanitization: true
});

// Secure plugin system
await nootropic.plugins.secure({
  sandbox: true,
  permissions: ['read', 'write']
});
```

### Monitoring and Logging

```typescript
// Monitor resources
const metrics = await nootropic.monitoring.resources();

// Monitor model performance
const performance = await nootropic.monitoring.model();

// Monitor vector store
const store_metrics = await nootropic.monitoring.vector_store();

// Log operations
await nootropic.logging.log({
  level: 'info',
  message: 'Operation completed',
  metadata: {
    operation: 'inference',
    duration: 100
  }
});
```

## Endpoints

### 1. /v1/local/inference

```http
POST /v1/local/inference
Content-Type: application/json

{
  "model": {
    "name": "starcoder2-3b",
    "version": "1.0.0",
    "quantization": "4bit"
  },
  "prompt": "Complete this code:",
  "max_tokens": 100,
  "temperature": 0.7
}
```

### 2. /v1/embeddings

```http
POST /v1/embeddings
Content-Type: application/json

{
  "model": {
    "name": "starcoder2-3b",
    "version": "1.0.0",
    "quantization": "4bit"
  },
  "input": "Hello, world!",
  "dimensions": 768
}
```

### 3. /v1/vector/query

```http
POST /v1/vector/query
Content-Type: application/json

{
  "query": "Find similar code",
  "top_k": 5,
  "filters": {
    "language": "typescript"
  }
}
```

### 4. /v1/models

```http
GET /v1/models
Content-Type: application/json

{
  "filter": {
    "type": "local",
    "status": "available"
  }
}
```

### 5. /v1/vector/ingest

```http
POST /v1/vector/ingest
Content-Type: application/json

{
  "documents": [
    {
      "content": "Example code",
      "metadata": {
        "language": "typescript"
      }
    }
  ],
  "index": {
    "rebuild": true
  }
}
```

### 6. /v1/plugin/management

```http
POST /v1/plugin/management
Content-Type: application/json

{
  "action": "install",
  "plugin": {
    "name": "example-plugin",
    "version": "1.0.0"
  },
  "config": {
    "auto_load": true,
    "sandbox": true
  }
}
```

### 7. /v1/model/management

```http
POST /v1/model/management
Content-Type: application/json

{
  "action": "load",
  "model": {
    "name": "starcoder2-3b",
    "version": "1.0.0",
    "quantization": "4bit"
  },
  "resources": {
    "threads": 4,
    "memory": "8GB",
    "gpu_layers": 32
  }
}
```

### 8. /v1/resource/management

```http
POST /v1/resource/management
Content-Type: application/json

{
  "action": "optimize",
  "resources": {
    "cpu": {
      "threads": 4,
      "priority": 0
    },
    "memory": {
      "max": "8GB",
      "swap": false
    },
    "gpu": {
      "enabled": true,
      "layers": 32
    }
  }
}
```

### 9. /v1/local/storage

```http
POST /v1/local/storage
Content-Type: application/json

{
  "action": "secure",
  "config": {
    "encryption": true,
    "access_control": true,
    "backup": {
      "enabled": true,
      "interval": "1d"
    }
  }
}
```

### 10. /v1/model/security

```http
POST /v1/model/security
Content-Type: application/json

{
  "action": "validate",
  "model": {
    "name": "starcoder2-3b",
    "version": "1.0.0"
  },
  "checks": {
    "integrity": true,
    "safety": true,
    "bias": true
  }
}
```

## Data Schemas

### Model Schema

```typescript
interface Model {
  name: string;
  version: string;
  quantization: string;
  runtime: string;
  resources: {
    min_memory: string;
    min_threads: number;
    gpu_required: boolean;
  };
  capabilities: {
    inference: boolean;
    embeddings: boolean;
    fine_tuning: boolean;
  };
  metadata: {
    description: string;
    license: string;
    source: string;
  };
}
```

### Vector Schema

```typescript
interface Vector {
  id: string;
  content: string;
  embedding: number[];
  metadata: {
    language: string;
    type: string;
    created_at: string;
  };
  index: {
    type: string;
    params: Record<string, any>;
  };
}
```

### Plugin Schema

```typescript
interface Plugin {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  permissions: string[];
  config: {
    auto_load: boolean;
    sandbox: boolean;
    resources: Record<string, any>;
  };
  metadata: {
    author: string;
    license: string;
    repository: string;
  };
}
```

## Error Codes & Handling

### Error Types

```typescript
enum ErrorType {
  // Resource Errors
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  RESOURCE_UNAVAILABLE = 'RESOURCE_UNAVAILABLE',
  
  // Model Errors
  MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
  MODEL_LOAD_FAILED = 'MODEL_LOAD_FAILED',
  
  // Vector Store Errors
  VECTOR_STORE_ERROR = 'VECTOR_STORE_ERROR',
  INDEX_ERROR = 'INDEX_ERROR',
  
  // Plugin Errors
  PLUGIN_ERROR = 'PLUGIN_ERROR',
  PLUGIN_NOT_FOUND = 'PLUGIN_NOT_FOUND',
  
  // Storage Errors
  STORAGE_ERROR = 'STORAGE_ERROR',
  STORAGE_FULL = 'STORAGE_FULL',
  
  // Security Errors
  SECURITY_ERROR = 'SECURITY_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}
```

### Error Handling

```typescript
class NootropicError extends Error {
  constructor(
    public type: ErrorType,
    public message: string,
    public details?: Record<string, any>
  ) {
    super(message);
  }
}

// Error handling example
try {
  await nootropic.inference.complete({
    prompt: 'Complete this code:',
    max_tokens: 100
  });
} catch (error) {
  if (error instanceof NootropicError) {
    switch (error.type) {
      case ErrorType.RESOURCE_EXHAUSTED:
        // Handle resource exhaustion
        break;
      case ErrorType.MODEL_NOT_FOUND:
        // Handle missing model
        break;
      case ErrorType.VECTOR_STORE_ERROR:
        // Handle vector store error
        break;
      default:
        // Handle other errors
        break;
    }
  }
}
```

## Examples

### Local Inference Example

```typescript
// Initialize nootropic
const nootropic = new Nootropic({
  config: {
    local: {
      models: {
        default: {
          name: 'starcoder2-3b',
          version: '1.0.0',
          quantization: '4bit'
        }
      }
    }
  }
});

// Load model
const model = await nootropic.models.load({
  name: 'starcoder2-3b',
  version: '1.0.0',
  quantization: '4bit'
});

// Run inference
const response = await nootropic.inference.complete({
  prompt: 'Complete this code:',
  max_tokens: 100,
  temperature: 0.7
});

// Process response
console.log(response.text);
```

### Vector Store Example

```typescript
// Initialize vector store
const vector_store = await nootropic.vector_store.initialize({
  type: 'chroma',
  path: '.nootropic-cache/vector_store'
});

// Ingest documents
await vector_store.ingest({
  documents: [
    {
      content: 'Example code',
      metadata: {
        language: 'typescript'
      }
    }
  ]
});

// Query similar documents
const results = await vector_store.query({
  query: 'Find similar code',
  top_k: 5
});

// Process results
console.log(results.documents);
```

### Plugin Example

```typescript
// Initialize plugin system
const plugins = await nootropic.plugins.initialize({
  path: '.nootropic-cache/plugins'
});

// Install plugin
await plugins.install({
  name: 'example-plugin',
  version: '1.0.0',
  config: {
    auto_load: true,
    sandbox: true
  }
});

// Use plugin
const plugin = await plugins.load('example-plugin');
const result = await plugin.execute({
  action: 'example',
  params: {
    input: 'test'
  }
});

// Process result
console.log(result);
```

## Versioning and Deprecation Policy

### Versioning

- Major version changes (v1 -> v2) indicate breaking changes
- Minor version changes (v1.0 -> v1.1) indicate new features
- Patch version changes (v1.0.0 -> v1.0.1) indicate bug fixes

### Deprecation

- Features are marked as deprecated 6 months before removal
- Deprecated features continue to work for 6 months
- Breaking changes are announced 3 months in advance
- Migration guides are provided for all breaking changes

### Migration

```typescript
// Example migration from v1 to v2
const v1 = new NootropicV1();
const v2 = new NootropicV2();

// Migrate configuration
const config = await v1.getConfig();
await v2.setConfig(config);

// Migrate data
const data = await v1.getData();
await v2.setData(data);

// Migrate plugins
const plugins = await v1.getPlugins();
await v2.setPlugins(plugins);
```
