# Nx Components Integration Guide

## Overview

This guide explains how Nx integrates with nootropic's components, focusing on local-first development and component organization.

## Table of Contents

1. [Component Structure](#component-structure)
2. [Agent Integration](#agent-integration)
3. [Adapter Integration](#adapter-integration)
4. [Component Testing](#component-testing)
5. [Best Practices](#best-practices)

## Component Structure

### Directory Layout

```
libs/
├── agents/
│   ├── coder/              # CoderAgent
│   ├── critic/             # CriticAgent
│   ├── explainability/     # ExplainabilityAgent
│   ├── feedback/           # FeedbackAgent
│   ├── memory/             # MemoryAgent
│   ├── planner/            # PlannerAgent
│   └── project-mgr/        # ProjectMgrAgent
├── adapters/
│   ├── model/              # ModelAdapter
│   ├── search/             # SearchAdapter
│   ├── plugin-loader/      # PluginLoaderAdapter
│   ├── reflexion/          # ReflexionAdapter
│   ├── storage/            # StorageAdapter
│   └── observability/      # ObservabilityAdapter
└── shared/
    ├── core/               # Core functionality
    └── utils/              # Shared utilities
```

### Project Configuration

```json
{
  "projects": {
    "coder-agent": {
      "tags": ["scope:agents", "type:lib", "feature:ai"],
      "implicitDependencies": ["core", "model-adapter"]
    },
    "critic-agent": {
      "tags": ["scope:agents", "type:lib", "feature:ai"],
      "implicitDependencies": ["core", "model-adapter"]
    },
    "explainability-agent": {
      "tags": ["scope:agents", "type:lib", "feature:ai"],
      "implicitDependencies": ["core", "model-adapter"]
    },
    "feedback-agent": {
      "tags": ["scope:agents", "type:lib", "feature:ai"],
      "implicitDependencies": ["core", "model-adapter"]
    },
    "memory-agent": {
      "tags": ["scope:agents", "type:lib", "feature:ai"],
      "implicitDependencies": ["core", "storage-adapter"]
    },
    "planner-agent": {
      "tags": ["scope:agents", "type:lib", "feature:ai"],
      "implicitDependencies": ["core", "model-adapter"]
    },
    "project-mgr-agent": {
      "tags": ["scope:agents", "type:lib", "feature:ai"],
      "implicitDependencies": ["core", "model-adapter"]
    },
    "model-adapter": {
      "tags": ["scope:adapters", "type:lib", "feature:ai"],
      "implicitDependencies": ["core"]
    },
    "search-adapter": {
      "tags": ["scope:adapters", "type:lib", "feature:search"],
      "implicitDependencies": ["core"]
    },
    "plugin-loader-adapter": {
      "tags": ["scope:adapters", "type:lib", "feature:plugins"],
      "implicitDependencies": ["core"]
    },
    "reflexion-adapter": {
      "tags": ["scope:adapters", "type:lib", "feature:ai"],
      "implicitDependencies": ["core"]
    },
    "storage-adapter": {
      "tags": ["scope:adapters", "type:lib", "feature:storage"],
      "implicitDependencies": ["core"]
    },
    "observability-adapter": {
      "tags": ["scope:adapters", "type:lib", "feature:monitoring"],
      "implicitDependencies": ["core"]
    }
  }
}
```

## Agent Integration

### CoderAgent

```typescript
// libs/agents/coder/src/lib/coder.agent.ts
import { ModelAdapter } from '@nootropic/adapters/model';
import { CoreService } from '@nootropic/core';

@Injectable()
export class CoderAgent {
  constructor(
    private modelAdapter: ModelAdapter,
    private coreService: CoreService
  ) {}

  // Implementation
}
```

### CriticAgent

```typescript
// libs/agents/critic/src/lib/critic.agent.ts
import { ModelAdapter } from '@nootropic/adapters/model';
import { CoreService } from '@nootropic/core';

@Injectable()
export class CriticAgent {
  constructor(
    private modelAdapter: ModelAdapter,
    private coreService: CoreService
  ) {}

  // Implementation
}
```

### ExplainabilityAgent

```typescript
// libs/agents/explainability/src/lib/explainability.agent.ts
import { ModelAdapter } from '@nootropic/adapters/model';
import { CoreService } from '@nootropic/core';

@Injectable()
export class ExplainabilityAgent {
  constructor(
    private modelAdapter: ModelAdapter,
    private coreService: CoreService
  ) {}

  // Implementation
}
```

## Adapter Integration

### ModelAdapter

```typescript
// libs/adapters/model/src/lib/model.adapter.ts
import { CoreService } from '@nootropic/core';

@Injectable()
export class ModelAdapter {
  constructor(private coreService: CoreService) {}

  // Implementation
}
```

### SearchAdapter

```typescript
// libs/adapters/search/src/lib/search.adapter.ts
import { CoreService } from '@nootropic/core';

@Injectable()
export class SearchAdapter {
  constructor(private coreService: CoreService) {}

  // Implementation
}
```

### StorageAdapter

```typescript
// libs/adapters/storage/src/lib/storage.adapter.ts
import { CoreService } from '@nootropic/core';

@Injectable()
export class StorageAdapter {
  constructor(private coreService: CoreService) {}

  // Implementation
}
```

## Component Testing

### Unit Tests

```typescript
// libs/agents/coder/src/lib/coder.agent.spec.ts
import { CoderAgent } from './coder.agent';
import { ModelAdapter } from '@nootropic/adapters/model';
import { CoreService } from '@nootropic/core';

describe('CoderAgent', () => {
  let agent: CoderAgent;
  let modelAdapter: ModelAdapter;
  let coreService: CoreService;

  beforeEach(() => {
    // Setup
  });

  it('should be created', () => {
    expect(agent).toBeTruthy();
  });

  // Tests
});
```

### Integration Tests

```typescript
// libs/agents/coder/src/lib/coder.agent.integration.spec.ts
import { CoderAgent } from './coder.agent';
import { ModelAdapter } from '@nootropic/adapters/model';
import { CoreService } from '@nootropic/core';

describe('CoderAgent Integration', () => {
  let agent: CoderAgent;
  let modelAdapter: ModelAdapter;
  let coreService: CoreService;

  beforeEach(async () => {
    // Setup
  });

  it('should integrate with model adapter', async () => {
    // Test
  });

  // Tests
});
```

## Best Practices

### Component Development

1. **Code Organization**
   - Clear boundaries
   - Single responsibility
   - Explicit dependencies
   - No circular dependencies

2. **Testing Strategy**
   - Unit tests
   - Integration tests
   - E2E tests
   - Performance tests

3. **Documentation**
   - Clear interfaces
   - Usage examples
   - Configuration
   - Dependencies

### Component Integration

1. **Dependency Management**
   - Use tags
   - Enforce boundaries
   - Monitor dependencies
   - Regular cleanup

2. **Testing Strategy**
   - Test boundaries
   - Mock dependencies
   - Clear coverage
   - Fast execution

3. **Performance**
   - Monitor resources
   - Optimize I/O
   - Cache results
   - Profile execution

## See Also

- [Nx Guide](./NX_GUIDE.md): General Nx documentation
- [Nx Architecture](./NX_ARCHITECTURE.md): Architectural boundaries
- [Nx Generators](./NX_GENERATORS.md): Custom generators
- [Nx Executors](./NX_EXECUTORS.md): Custom executors
- [Component Documentation](./COMPONENTS/): Detailed component docs 