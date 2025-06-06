/**
 * @todo Implement adapter interfaces
 * - Define base adapter interface
 * - Add provider interfaces
 * - Define configuration types
 * - Add telemetry hooks
 */

export interface Adapter {
  /**
   * @todo Define adapter interface
   * - Add required methods
   * - Define configuration
   * - Add telemetry hooks
   */
  id: string;
  name: string;
  version: string;
  
  initialize(config: AdapterConfig): Promise<void>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

export interface AdapterConfig {
  /**
   * @todo Define adapter configuration
   * - Add configuration properties
   * - Define validation
   * - Add defaults
   */
  endpoint?: string;
  credentials?: Record<string, string>;
  options?: Record<string, unknown>;
}

export interface Provider {
  /**
   * @todo Define provider interface
   * - Add provider methods
   * - Define capabilities
   * - Add telemetry
   */
  name: string;
  version: string;
  capabilities: string[];
  
  initialize(): Promise<void>;
  execute(input: unknown): Promise<unknown>;
}

export interface AdapterStatus {
  status: 'initializing' | 'ready' | 'error' | 'shutdown';
  lastError?: Error;
  metrics?: AdapterMetrics;
}

export interface AdapterMetrics {
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  requestCount: number;
  errorCount: number;
  latency: number;
} 