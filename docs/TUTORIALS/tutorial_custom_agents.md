# Tutorial: Implementing Custom Agents

## Overview

This tutorial covers how to create and integrate custom agents in nootropic, including agent design, implementation, testing, and deployment.

## Agent Architecture

### 1. Basic Agent Structure

```typescript
// libs/agents/src/lib/base-agent.ts
import { Agent } from '@nootropic/agents';

export abstract class BaseAgent implements Agent {
  protected constructor(
    protected readonly name: string,
    protected readonly capabilities: string[]
  ) {}

  abstract execute(input: any): Promise<any>;
  abstract validate(input: any): boolean;
  abstract getCapabilities(): string[];
}
```

### 2. Agent Interface

```typescript
// libs/agents/src/lib/interfaces/agent.interface.ts
export interface Agent {
  name: string;
  capabilities: string[];
  execute(input: any): Promise<any>;
  validate(input: any): boolean;
  getCapabilities(): string[];
}
```

## Implementation Steps

### 1. Create Agent Class

```typescript
// libs/agents/src/lib/custom-agent.ts
import { BaseAgent } from './base-agent';
import { AgentContext } from './interfaces/agent-context.interface';

export class CustomAgent extends BaseAgent {
  constructor() {
    super('CustomAgent', ['task1', 'task2']);
  }

  async execute(input: AgentContext): Promise<any> {
    // Validate input
    if (!this.validate(input)) {
      throw new Error('Invalid input');
    }

    // Implement agent logic
    const result = await this.processInput(input);

    // Return result
    return result;
  }

  validate(input: AgentContext): boolean {
    return (
      input !== null &&
      typeof input === 'object' &&
      'task' in input &&
      this.capabilities.includes(input.task)
    );
  }

  getCapabilities(): string[] {
    return this.capabilities;
  }

  private async processInput(input: AgentContext): Promise<any> {
    // Implement processing logic
    return {
      status: 'success',
      result: 'processed'
    };
  }
}
```

### 2. Register Agent

```typescript
// libs/agents/src/lib/agent-registry.ts
import { Agent } from './interfaces/agent.interface';

export class AgentRegistry {
  private static agents: Map<string, Agent> = new Map();

  static register(agent: Agent): void {
    this.agents.set(agent.name, agent);
  }

  static getAgent(name: string): Agent | undefined {
    return this.agents.get(name);
  }

  static listAgents(): string[] {
    return Array.from(this.agents.keys());
  }
}
```

### 3. Implement Agent Logic

```typescript
// libs/agents/src/lib/custom-agent.ts
export class CustomAgent extends BaseAgent {
  // ... previous code ...

  private async processInput(input: AgentContext): Promise<any> {
    // 1. Pre-processing
    const preprocessed = await this.preprocess(input);

    // 2. Main processing
    const result = await this.mainProcess(preprocessed);

    // 3. Post-processing
    const finalResult = await this.postprocess(result);

    return finalResult;
  }

  private async preprocess(input: AgentContext): Promise<any> {
    // Implement pre-processing logic
    return input;
  }

  private async mainProcess(input: any): Promise<any> {
    // Implement main processing logic
    return input;
  }

  private async postprocess(input: any): Promise<any> {
    // Implement post-processing logic
    return input;
  }
}
```

## Testing

### 1. Unit Tests

```typescript
// libs/agents/src/lib/custom-agent.spec.ts
import { CustomAgent } from './custom-agent';
import { AgentContext } from './interfaces/agent-context.interface';

describe('CustomAgent', () => {
  let agent: CustomAgent;

  beforeEach(() => {
    agent = new CustomAgent();
  });

  it('should validate correct input', () => {
    const input: AgentContext = {
      task: 'task1',
      data: {}
    };
    expect(agent.validate(input)).toBe(true);
  });

  it('should reject invalid input', () => {
    const input = {
      task: 'invalid-task',
      data: {}
    };
    expect(agent.validate(input)).toBe(false);
  });

  it('should process input correctly', async () => {
    const input: AgentContext = {
      task: 'task1',
      data: {}
    };
    const result = await agent.execute(input);
    expect(result.status).toBe('success');
  });
});
```

### 2. Integration Tests

```typescript
// libs/agents/src/lib/custom-agent.integration.spec.ts
import { CustomAgent } from './custom-agent';
import { AgentRegistry } from './agent-registry';

describe('CustomAgent Integration', () => {
  let agent: CustomAgent;

  beforeAll(() => {
    agent = new CustomAgent();
    AgentRegistry.register(agent);
  });

  it('should be registered in AgentRegistry', () => {
    const registeredAgent = AgentRegistry.getAgent('CustomAgent');
    expect(registeredAgent).toBeDefined();
    expect(registeredAgent).toBeInstanceOf(CustomAgent);
  });

  it('should work with other agents', async () => {
    // Test interaction with other agents
  });
});
```

## Deployment

### 1. Configuration

```yaml
# config/agents.yaml
agents:
  - name: CustomAgent
    enabled: true
    config:
      maxConcurrentTasks: 5
      timeout: 30000
      retryAttempts: 3
```

### 2. Registration

```typescript
// apps/api/src/main.ts
import { CustomAgent } from '@nootropic/agents';
import { AgentRegistry } from '@nootropic/agents';

async function bootstrap() {
  // Register custom agent
  const customAgent = new CustomAgent();
  AgentRegistry.register(customAgent);

  // Start application
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
```

## Best Practices

### 1. Error Handling

```typescript
export class CustomAgent extends BaseAgent {
  async execute(input: AgentContext): Promise<any> {
    try {
      // Validate input
      if (!this.validate(input)) {
        throw new ValidationError('Invalid input');
      }

      // Process input
      const result = await this.processInput(input);

      return result;
    } catch (error) {
      // Handle specific errors
      if (error instanceof ValidationError) {
        // Handle validation error
      } else if (error instanceof ProcessingError) {
        // Handle processing error
      } else {
        // Handle unexpected error
      }

      // Log error
      this.logger.error('Error executing agent', error);

      // Rethrow or return error response
      throw error;
    }
  }
}
```

### 2. Logging

```typescript
export class CustomAgent extends BaseAgent {
  private readonly logger = new Logger(CustomAgent.name);

  async execute(input: AgentContext): Promise<any> {
    this.logger.debug('Starting execution', { input });

    try {
      const result = await this.processInput(input);
      this.logger.debug('Execution completed', { result });
      return result;
    } catch (error) {
      this.logger.error('Execution failed', { error });
      throw error;
    }
  }
}
```

### 3. Monitoring

```typescript
export class CustomAgent extends BaseAgent {
  private readonly metrics = new Metrics();

  async execute(input: AgentContext): Promise<any> {
    const startTime = Date.now();

    try {
      const result = await this.processInput(input);
      
      // Record metrics
      this.metrics.recordExecutionTime(Date.now() - startTime);
      this.metrics.recordSuccess();

      return result;
    } catch (error) {
      // Record error metrics
      this.metrics.recordError(error);
      throw error;
    }
  }
}
```

## What's Next

- [Tutorial: Performance Optimization](tutorial_performance.md)
- [Tutorial: Security Best Practices](tutorial_security.md)
- [Tutorial: Testing Strategies](tutorial_testing.md)

## Additional Resources

- [Architecture Documentation](../ARCHITECTURE.md)
- [API Reference](../API_REFERENCE.md)
- [Agent Documentation](../AGENTS.md) 