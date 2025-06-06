/**
 * @todo Implement agent interfaces
 * - Define base agent interface
 * - Add capability registry types
 * - Define agent state types
 * - Add telemetry interfaces
 */

export interface Agent {
  /**
   * @todo Define agent interface
   * - Add required methods
   * - Define state management
   * - Add telemetry hooks
   */
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  
  initialize(): Promise<void>;
  execute(input: unknown): Promise<unknown>;
  cleanup(): Promise<void>;
}

export interface AgentState {
  /**
   * @todo Define agent state interface
   * - Add state properties
   * - Define state transitions
   * - Add validation
   */
  status: 'idle' | 'running' | 'error';
  lastRun?: Date;
  error?: Error;
  metadata: Record<string, unknown>;
}

export interface AgentCapability {
  /**
   * @todo Define capability interface
   * - Add capability properties
   * - Define capability validation
   * - Add versioning
   */
  name: string;
  version: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AgentStatus {
  status: 'initializing' | 'ready' | 'error' | 'shutdown';
  lastError?: Error;
  metrics?: AgentMetrics;
}

export interface AgentMetrics {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  requestCount: number;
  errorCount: number;
} 