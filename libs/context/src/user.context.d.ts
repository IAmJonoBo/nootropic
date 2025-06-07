/**
 * @todo Implement user context
 * - Add user state management
 * - Add user preferences
 * - Add user session handling
 * - Add user activity tracking
 */
export declare class UserContext {
  private readonly logger;
  private state;
  initialize(): Promise<void>;
  getState(): Promise<Record<string, unknown>>;
  updateState(updates: Record<string, unknown>): Promise<void>;
}
