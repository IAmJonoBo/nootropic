// @ts-expect-error TS(6196): 'CapabilityDescribe' is declared but never used.
import type { Capability, CapabilityDescribe, HealthStatus } from './Capability.js';

export interface EmbeddingProvider extends Capability {
  /**
   * Returns the name of the embedding provider/model.
   */
  readonly name: string;

  /**
   * Embed a string or array of strings. Returns a 2D array of floats (one vector per input).
   */
  embed(text: string | string[]): Promise<number[][]>;

  /**
   * Health check for the provider.
   */
  // @ts-expect-error TS(2304): Cannot find name 'health'.
  health(): Promise<HealthStatus>;

  /**
   * Registry/LLM-friendly describe output.
   */
  // @ts-expect-error TS(2582): Cannot find name 'describe'. Do you need to instal... Remove this comment to see the full error message
  describe(): CapabilityDescribe;
} 