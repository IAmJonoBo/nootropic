/**
 * @todo Implement project context
 * - Add project state management
 * - Add configuration loading
 * - Add capability discovery
 * - Add telemetry integration
 */
export declare class ProjectContext {
  private readonly logger;
  private state;
  initialize(): Promise<void>;
  getState(): Promise<Record<string, unknown>>;
  updateState(updates: Record<string, unknown>): Promise<void>;
}
